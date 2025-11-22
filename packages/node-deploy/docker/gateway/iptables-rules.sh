#!/bin/bash
# Chicago Forest Network Gateway - IPTables Firewall Rules
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes.

set -e

# =============================================================================
# Configuration from Environment
# =============================================================================

WAN_IF="${WAN_INTERFACE:-eth0}"
FOREST_IF="${FOREST_INTERFACE:-eth1}"
LAN_IF="${LAN_INTERFACE:-eth2}"
FOREST_SUBNET="${FOREST_SUBNET:-10.42.0.0/16}"
LAN_SUBNET="${LAN_SUBNET:-192.168.42.0/24}"

echo "========================================"
echo "Chicago Forest Gateway Firewall Setup"
echo "========================================"
echo "WAN Interface:    $WAN_IF"
echo "Forest Interface: $FOREST_IF"
echo "LAN Interface:    $LAN_IF"
echo "Forest Subnet:    $FOREST_SUBNET"
echo "========================================"

# =============================================================================
# Flush Existing Rules
# =============================================================================

echo "Flushing existing rules..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Also flush IPv6 if available
if command -v ip6tables &> /dev/null; then
    ip6tables -F
    ip6tables -X
fi

# =============================================================================
# Default Policies
# =============================================================================

echo "Setting default policies..."
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# =============================================================================
# Loopback
# =============================================================================

iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# =============================================================================
# Established Connections
# =============================================================================

iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# =============================================================================
# ICMP (Ping)
# =============================================================================

# Allow ping
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-reply -j ACCEPT

# Allow all ICMP types for mesh networking
iptables -A INPUT -p icmp -j ACCEPT

# =============================================================================
# Forest Interface (Trust)
# =============================================================================

echo "Configuring Forest interface rules..."

# Accept all from Forest network
iptables -A INPUT -i "$FOREST_IF" -j ACCEPT

# Allow Forest to forward anywhere
iptables -A FORWARD -i "$FOREST_IF" -j ACCEPT

# =============================================================================
# LAN Interface (Trust)
# =============================================================================

if ip link show "$LAN_IF" > /dev/null 2>&1; then
    echo "Configuring LAN interface rules..."

    # Accept all from LAN
    iptables -A INPUT -i "$LAN_IF" -j ACCEPT

    # Allow LAN to forward anywhere
    iptables -A FORWARD -i "$LAN_IF" -j ACCEPT
fi

# =============================================================================
# WAN Interface (Restricted)
# =============================================================================

echo "Configuring WAN interface rules..."

# WireGuard VPN
iptables -A INPUT -i "$WAN_IF" -p udp --dport 51820 -j ACCEPT

# P2P Mesh Communication
iptables -A INPUT -i "$WAN_IF" -p udp --dport 42000 -j ACCEPT

# HTTP/HTTPS (if running web services)
if [ "${ENABLE_WEB:-false}" = "true" ]; then
    iptables -A INPUT -i "$WAN_IF" -p tcp --dport 80 -j ACCEPT
    iptables -A INPUT -i "$WAN_IF" -p tcp --dport 443 -j ACCEPT
fi

# SSH (optional, for management)
if [ "${ENABLE_SSH:-false}" = "true" ]; then
    iptables -A INPUT -i "$WAN_IF" -p tcp --dport 22 -j ACCEPT
fi

# =============================================================================
# NAT - Masquerading
# =============================================================================

echo "Configuring NAT..."

if [ "${ENABLE_NAT:-true}" = "true" ]; then
    # Masquerade outgoing traffic on WAN
    iptables -t nat -A POSTROUTING -o "$WAN_IF" -j MASQUERADE

    # Enable IP forwarding (should already be enabled)
    echo 1 > /proc/sys/net/ipv4/ip_forward
fi

# =============================================================================
# Port Forwarding (if needed)
# =============================================================================

# Example: Forward port 8080 from WAN to internal server
# iptables -t nat -A PREROUTING -i "$WAN_IF" -p tcp --dport 8080 -j DNAT --to-destination 10.42.1.50:8080
# iptables -A FORWARD -i "$WAN_IF" -p tcp --dport 8080 -d 10.42.1.50 -j ACCEPT

# =============================================================================
# Rate Limiting (DDoS Protection)
# =============================================================================

echo "Configuring rate limiting..."

# Limit new connections
iptables -A INPUT -p tcp --syn -m limit --limit 100/s --limit-burst 200 -j ACCEPT
iptables -A INPUT -p udp -m limit --limit 200/s --limit-burst 400 -j ACCEPT

# =============================================================================
# Logging
# =============================================================================

echo "Configuring logging..."

# Log dropped packets (limit to prevent log flooding)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPT-INPUT-DROP: " --log-level 4
iptables -A FORWARD -m limit --limit 5/min -j LOG --log-prefix "IPT-FORWARD-DROP: " --log-level 4

# =============================================================================
# Final Drop Rules
# =============================================================================

# These are implicit due to default DROP policy, but explicit for clarity
iptables -A INPUT -j DROP
iptables -A FORWARD -j DROP

# =============================================================================
# IPv6 (if enabled)
# =============================================================================

if [ "${ENABLE_IPV6:-false}" = "true" ] && command -v ip6tables &> /dev/null; then
    echo "Configuring IPv6..."

    ip6tables -P INPUT DROP
    ip6tables -P FORWARD DROP
    ip6tables -P OUTPUT ACCEPT

    ip6tables -A INPUT -i lo -j ACCEPT
    ip6tables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
    ip6tables -A INPUT -p ipv6-icmp -j ACCEPT
    ip6tables -A INPUT -i "$FOREST_IF" -j ACCEPT

    if ip link show "$LAN_IF" > /dev/null 2>&1; then
        ip6tables -A INPUT -i "$LAN_IF" -j ACCEPT
    fi
fi

# =============================================================================
# Save Rules (for persistence)
# =============================================================================

echo "Saving rules..."

# Save to file for reference
iptables-save > /etc/forest/iptables.rules

echo "========================================"
echo "Firewall configuration complete!"
echo "========================================"

# Display summary
echo ""
echo "Active rules:"
iptables -L -n --line-numbers | head -30
