#!/bin/sh
# Chicago Forest Network Node Entrypoint Script
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
FOREST_INTERFACE="${FOREST_INTERFACE:-eth1}"
LOG_LEVEL="${LOG_LEVEL:-info}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [entrypoint] $*"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [entrypoint] [ERROR] $*" >&2
}

# =============================================================================
# Pre-flight Checks
# =============================================================================
preflight_checks() {
    log "Running pre-flight checks..."

    # Check required directories
    for dir in "$FOREST_DATA_DIR" "$FOREST_CONFIG_DIR" "$FOREST_LOG_DIR"; do
        if [ ! -d "$dir" ]; then
            log "Creating directory: $dir"
            mkdir -p "$dir"
        fi
    done

    # Check for TUN device
    if [ ! -c /dev/net/tun ]; then
        log "WARNING: /dev/net/tun not available. VPN tunnels may not work."
    fi

    # Check for required capabilities
    if ! ip link show > /dev/null 2>&1; then
        log_error "NET_ADMIN capability required. Run with --cap-add=NET_ADMIN"
        exit 1
    fi

    # Check for network interface
    if [ -n "$FOREST_INTERFACE" ] && [ "$FOREST_INTERFACE" != "auto" ]; then
        if ! ip link show "$FOREST_INTERFACE" > /dev/null 2>&1; then
            log "WARNING: Interface $FOREST_INTERFACE not found. Available interfaces:"
            ip link show | grep -E "^[0-9]+" | awk '{print "  - " $2}' | tr -d ':'
        fi
    fi

    log "Pre-flight checks complete."
}

# =============================================================================
# Kernel Module Loading
# =============================================================================
load_kernel_modules() {
    log "Loading kernel modules..."

    # Load WireGuard
    if ! lsmod | grep -q wireguard; then
        modprobe wireguard 2>/dev/null || log "WARNING: Could not load wireguard module"
    fi

    # Load BATMAN-adv for mesh networking
    if ! lsmod | grep -q batman_adv; then
        modprobe batman-adv 2>/dev/null || log "WARNING: Could not load batman-adv module"
    fi

    # Load TUN/TAP
    if ! lsmod | grep -q tun; then
        modprobe tun 2>/dev/null || log "WARNING: Could not load tun module"
    fi

    # Load VXLAN for overlay networking
    if ! lsmod | grep -q vxlan; then
        modprobe vxlan 2>/dev/null || log "WARNING: Could not load vxlan module"
    fi

    log "Kernel modules loaded."
}

# =============================================================================
# Network Configuration
# =============================================================================
configure_network() {
    log "Configuring network..."

    # Enable IP forwarding
    sysctl -w net.ipv4.ip_forward=1 > /dev/null 2>&1 || true
    sysctl -w net.ipv6.conf.all.forwarding=1 > /dev/null 2>&1 || true

    # Disable reverse path filtering for mesh networking
    sysctl -w net.ipv4.conf.all.rp_filter=0 > /dev/null 2>&1 || true
    sysctl -w net.ipv4.conf.default.rp_filter=0 > /dev/null 2>&1 || true

    # Enable loose mode for asymmetric routing
    if [ -n "$FOREST_INTERFACE" ] && [ "$FOREST_INTERFACE" != "auto" ]; then
        sysctl -w "net.ipv4.conf.${FOREST_INTERFACE}.rp_filter=2" > /dev/null 2>&1 || true
    fi

    log "Network configured."
}

# =============================================================================
# Initialize Node Identity
# =============================================================================
initialize_identity() {
    log "Initializing node identity..."

    IDENTITY_FILE="$FOREST_DATA_DIR/keys/node_identity.json"

    if [ ! -f "$IDENTITY_FILE" ]; then
        log "Generating new node identity..."
        mkdir -p "$FOREST_DATA_DIR/keys"

        # Generate WireGuard keypair
        WG_PRIVATE=$(wg genkey)
        WG_PUBLIC=$(echo "$WG_PRIVATE" | wg pubkey)

        # Generate node ID (first 16 chars of public key hash)
        NODE_ID=$(echo "$WG_PUBLIC" | sha256sum | head -c 16)

        # Save identity
        cat > "$IDENTITY_FILE" << EOF
{
    "nodeId": "$NODE_ID",
    "nodeName": "${FOREST_NODE_NAME:-forest-node}",
    "wireguard": {
        "publicKey": "$WG_PUBLIC",
        "privateKey": "$WG_PRIVATE"
    },
    "created": "$(date -Iseconds)"
}
EOF
        chmod 600 "$IDENTITY_FILE"
        log "Node identity created: $NODE_ID"
    else
        NODE_ID=$(jq -r '.nodeId' "$IDENTITY_FILE")
        log "Using existing node identity: $NODE_ID"
    fi

    export FOREST_NODE_ID="$NODE_ID"
}

# =============================================================================
# WireGuard Setup
# =============================================================================
setup_wireguard() {
    log "Setting up WireGuard..."

    WG_CONFIG="/etc/wireguard/wg-forest.conf"

    if [ ! -f "$WG_CONFIG" ]; then
        IDENTITY_FILE="$FOREST_DATA_DIR/keys/node_identity.json"
        WG_PRIVATE=$(jq -r '.wireguard.privateKey' "$IDENTITY_FILE")

        cat > "$WG_CONFIG" << EOF
# Chicago Forest Network WireGuard Configuration
# Auto-generated - Do not edit manually

[Interface]
PrivateKey = $WG_PRIVATE
ListenPort = 51820
# Address assigned dynamically by mesh protocol

# Peers added dynamically by forest-node
EOF
        chmod 600 "$WG_CONFIG"
    fi

    # Bring up WireGuard interface if not already up
    if ! ip link show wg-forest > /dev/null 2>&1; then
        wg-quick up wg-forest 2>/dev/null || log "WARNING: Could not bring up WireGuard interface"
    fi

    log "WireGuard setup complete."
}

# =============================================================================
# Signal Handlers
# =============================================================================
cleanup() {
    log "Shutting down..."

    # Bring down WireGuard
    wg-quick down wg-forest 2>/dev/null || true

    # Remove BATMAN-adv interface
    ip link set bat0 down 2>/dev/null || true
    ip link delete bat0 2>/dev/null || true

    log "Cleanup complete."
    exit 0
}

trap cleanup SIGTERM SIGINT SIGQUIT

# =============================================================================
# Main
# =============================================================================
main() {
    log "Starting Chicago Forest Network Node..."
    log "Node Name: ${FOREST_NODE_NAME:-forest-node}"
    log "Forest Interface: $FOREST_INTERFACE"
    log "Log Level: $LOG_LEVEL"

    preflight_checks
    load_kernel_modules
    configure_network
    initialize_identity
    setup_wireguard

    log "Initialization complete. Starting main process..."

    # Execute main command
    exec "$@"
}

main "$@"
