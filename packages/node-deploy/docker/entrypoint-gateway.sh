#!/bin/sh
# Chicago Forest Network Gateway Entrypoint Script
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes.

set -e

# =============================================================================
# Configuration
# =============================================================================

FOREST_DATA_DIR="${FOREST_DATA_DIR:-/var/lib/forest}"
FOREST_CONFIG_DIR="${FOREST_CONFIG_DIR:-/etc/forest}"
FOREST_LOG_DIR="${FOREST_LOG_DIR:-/var/log/forest}"

WAN_INTERFACE="${WAN_INTERFACE:-eth0}"
FOREST_INTERFACE="${FOREST_INTERFACE:-eth1}"
LAN_INTERFACE="${LAN_INTERFACE:-eth2}"

FOREST_SUBNET="${FOREST_SUBNET:-10.42.0.0/16}"
GATEWAY_IP="${GATEWAY_IP:-10.42.1.1}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [gateway] $*"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [gateway] [ERROR] $*" >&2
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

preflight_checks() {
    log "Running gateway pre-flight checks..."

    # Check directories
    for dir in "$FOREST_DATA_DIR" "$FOREST_CONFIG_DIR" "$FOREST_LOG_DIR" /var/log/supervisor; do
        if [ ! -d "$dir" ]; then
            log "Creating directory: $dir"
            mkdir -p "$dir"
        fi
    done

    # Check for TUN device
    if [ ! -c /dev/net/tun ]; then
        log "WARNING: /dev/net/tun not available"
    fi

    # Check interfaces exist
    for iface in "$WAN_INTERFACE" "$FOREST_INTERFACE"; do
        if ! ip link show "$iface" > /dev/null 2>&1; then
            log "WARNING: Interface $iface not found"
        fi
    done

    log "Pre-flight checks complete."
}

# =============================================================================
# Kernel Configuration
# =============================================================================

configure_kernel() {
    log "Configuring kernel parameters..."

    # Enable IP forwarding
    sysctl -w net.ipv4.ip_forward=1 > /dev/null 2>&1 || true
    sysctl -w net.ipv6.conf.all.forwarding=1 > /dev/null 2>&1 || true

    # Disable reverse path filtering
    sysctl -w net.ipv4.conf.all.rp_filter=0 > /dev/null 2>&1 || true
    sysctl -w net.ipv4.conf.default.rp_filter=0 > /dev/null 2>&1 || true

    # Enable loose mode for mesh interfaces
    for iface in "$FOREST_INTERFACE" "$LAN_INTERFACE"; do
        if ip link show "$iface" > /dev/null 2>&1; then
            sysctl -w "net.ipv4.conf.${iface}.rp_filter=2" > /dev/null 2>&1 || true
        fi
    done

    # Connection tracking
    sysctl -w net.netfilter.nf_conntrack_max=262144 > /dev/null 2>&1 || true

    log "Kernel configured."
}

# =============================================================================
# Load Kernel Modules
# =============================================================================

load_modules() {
    log "Loading kernel modules..."

    modules="wireguard batman_adv tun vxlan nf_conntrack nf_nat"
    for mod in $modules; do
        modprobe "$mod" 2>/dev/null || log "WARNING: Could not load $mod module"
    done

    log "Kernel modules loaded."
}

# =============================================================================
# Network Interface Setup
# =============================================================================

setup_interfaces() {
    log "Setting up network interfaces..."

    # Configure Forest interface IP if not already set
    if ip link show "$FOREST_INTERFACE" > /dev/null 2>&1; then
        if ! ip addr show "$FOREST_INTERFACE" | grep -q "$GATEWAY_IP"; then
            ip addr add "$GATEWAY_IP/16" dev "$FOREST_INTERFACE" 2>/dev/null || true
        fi
        ip link set "$FOREST_INTERFACE" up
    fi

    # Configure LAN interface if exists
    if ip link show "$LAN_INTERFACE" > /dev/null 2>&1; then
        if [ -n "$LAN_GATEWAY_IP" ]; then
            ip addr add "$LAN_GATEWAY_IP/24" dev "$LAN_INTERFACE" 2>/dev/null || true
        fi
        ip link set "$LAN_INTERFACE" up
    fi

    log "Network interfaces configured."
}

# =============================================================================
# Firewall Setup
# =============================================================================

setup_firewall() {
    log "Setting up firewall..."

    if [ -x /etc/forest/iptables-rules.sh ]; then
        /etc/forest/iptables-rules.sh
    else
        log "WARNING: Firewall script not found, using basic rules"

        # Basic NAT
        iptables -t nat -A POSTROUTING -o "$WAN_INTERFACE" -j MASQUERADE

        # Allow established
        iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
        iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

        # Allow from internal interfaces
        iptables -A INPUT -i "$FOREST_INTERFACE" -j ACCEPT
        iptables -A FORWARD -i "$FOREST_INTERFACE" -j ACCEPT

        # Allow P2P and WireGuard from WAN
        iptables -A INPUT -i "$WAN_INTERFACE" -p udp --dport 42000 -j ACCEPT
        iptables -A INPUT -i "$WAN_INTERFACE" -p udp --dport 51820 -j ACCEPT
    fi

    log "Firewall configured."
}

# =============================================================================
# DNSMasq Configuration
# =============================================================================

setup_dnsmasq() {
    log "Configuring DNSMasq..."

    # Update DNSMasq config with environment values
    if [ -f /etc/dnsmasq.d/forest.conf ]; then
        # Update interface
        sed -i "s/^interface=.*/interface=$FOREST_INTERFACE/" /etc/dnsmasq.d/forest.conf

        # Update DHCP range if specified
        if [ -n "$DHCP_RANGE_START" ] && [ -n "$DHCP_RANGE_END" ]; then
            sed -i "s/^dhcp-range=.*/dhcp-range=$DHCP_RANGE_START,$DHCP_RANGE_END,12h/" /etc/dnsmasq.d/forest.conf
        fi

        # Update gateway IP
        sed -i "s/10.42.1.1/$GATEWAY_IP/g" /etc/dnsmasq.d/forest.conf
    fi

    log "DNSMasq configured."
}

# =============================================================================
# WireGuard Setup
# =============================================================================

setup_wireguard() {
    log "Setting up WireGuard..."

    WG_CONFIG="/etc/wireguard/wg-forest.conf"
    IDENTITY_FILE="$FOREST_DATA_DIR/keys/node_identity.json"

    # Generate keys if needed
    if [ ! -f "$FOREST_DATA_DIR/keys/wireguard.key" ]; then
        mkdir -p "$FOREST_DATA_DIR/keys"
        wg genkey | tee "$FOREST_DATA_DIR/keys/wireguard.key" | wg pubkey > "$FOREST_DATA_DIR/keys/wireguard.pub"
        chmod 600 "$FOREST_DATA_DIR/keys/wireguard.key"
    fi

    # Create WireGuard config if not exists
    if [ ! -f "$WG_CONFIG" ]; then
        WG_PRIVATE=$(cat "$FOREST_DATA_DIR/keys/wireguard.key")

        cat > "$WG_CONFIG" << EOF
# Chicago Forest Network Gateway - WireGuard Configuration

[Interface]
PrivateKey = $WG_PRIVATE
ListenPort = 51820
Address = ${GATEWAY_IP}/16

# Enable forwarding for VPN clients
PostUp = iptables -A FORWARD -i %i -j ACCEPT
PostDown = iptables -D FORWARD -i %i -j ACCEPT

# Peers added dynamically
EOF
        chmod 600 "$WG_CONFIG"
    fi

    log "WireGuard configured."
}

# =============================================================================
# Node Identity
# =============================================================================

initialize_identity() {
    log "Initializing gateway identity..."

    IDENTITY_FILE="$FOREST_DATA_DIR/keys/node_identity.json"

    if [ ! -f "$IDENTITY_FILE" ]; then
        WG_PUBLIC=$(cat "$FOREST_DATA_DIR/keys/wireguard.pub")
        WG_PRIVATE=$(cat "$FOREST_DATA_DIR/keys/wireguard.key")
        NODE_ID=$(echo "$WG_PUBLIC" | sha256sum | head -c 16)

        cat > "$IDENTITY_FILE" << EOF
{
    "nodeId": "$NODE_ID",
    "nodeName": "${FOREST_NODE_NAME:-forest-gateway}",
    "role": "gateway",
    "wireguard": {
        "publicKey": "$WG_PUBLIC",
        "privateKey": "$WG_PRIVATE"
    },
    "created": "$(date -Iseconds)"
}
EOF
        chmod 600 "$IDENTITY_FILE"
        log "Gateway identity created: $NODE_ID"
    else
        NODE_ID=$(jq -r '.nodeId' "$IDENTITY_FILE" 2>/dev/null || echo "unknown")
        log "Using existing gateway identity: $NODE_ID"
    fi
}

# =============================================================================
# Signal Handlers
# =============================================================================

cleanup() {
    log "Shutting down gateway..."

    # Stop WireGuard
    wg-quick down wg-forest 2>/dev/null || true

    # Stop DNSMasq
    killall dnsmasq 2>/dev/null || true

    # Clear firewall
    iptables -F
    iptables -t nat -F

    log "Gateway shutdown complete."
    exit 0
}

trap cleanup SIGTERM SIGINT SIGQUIT

# =============================================================================
# Main
# =============================================================================

main() {
    log "========================================"
    log "Starting Chicago Forest Network Gateway"
    log "========================================"
    log "Node Name: ${FOREST_NODE_NAME:-forest-gateway}"
    log "WAN: $WAN_INTERFACE"
    log "Forest: $FOREST_INTERFACE"
    log "LAN: $LAN_INTERFACE"
    log "Forest Subnet: $FOREST_SUBNET"
    log "========================================"

    preflight_checks
    load_modules
    configure_kernel
    setup_interfaces
    setup_firewall
    setup_dnsmasq
    setup_wireguard
    initialize_identity

    log "Gateway initialization complete."
    log "Starting supervisor..."

    # Execute main command (supervisord)
    exec "$@"
}

main "$@"
