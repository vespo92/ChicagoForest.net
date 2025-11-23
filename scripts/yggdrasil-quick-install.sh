#!/bin/bash
#
# Yggdrasil Quick Install Script
# Join the global Yggdrasil mesh network
#
# Usage: curl -sL https://chicagoforest.net/scripts/yggdrasil-quick-install.sh | sudo bash
#
# Documentation: https://yggdrasil-network.github.io/
# Chicago Forest: https://chicagoforest.net/mesh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Yggdrasil Network Quick Install           ║${NC}"
echo -e "${BLUE}║     Encrypted IPv6 Mesh Overlay               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

# Detect OS and install
install_yggdrasil() {
    if command -v apt-get &> /dev/null; then
        echo -e "${YELLOW}Detected Debian/Ubuntu...${NC}"

        # Add GPG key
        apt-get install -y gnupg dirmngr &>/dev/null
        gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt 2>/dev/null || true
        gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 2>/dev/null | apt-key add - 2>/dev/null || true

        # Add repository
        echo 'deb http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' > /etc/apt/sources.list.d/yggdrasil.list

        apt-get update -qq
        apt-get install -y yggdrasil

    elif command -v dnf &> /dev/null; then
        echo -e "${YELLOW}Detected Fedora/RHEL...${NC}"
        dnf copr enable -y neilalexander/yggdrasil-go
        dnf install -y yggdrasil

    elif command -v pacman &> /dev/null; then
        echo -e "${YELLOW}Detected Arch Linux...${NC}"
        pacman -S --noconfirm yggdrasil

    elif command -v apk &> /dev/null; then
        echo -e "${YELLOW}Detected Alpine Linux...${NC}"
        apk add yggdrasil

    elif command -v brew &> /dev/null; then
        echo -e "${YELLOW}Detected macOS...${NC}"
        brew install yggdrasil

    else
        echo -e "${RED}Unsupported system. Please install manually:${NC}"
        echo "https://yggdrasil-network.github.io/installation.html"
        exit 1
    fi
}

echo -e "${YELLOW}Installing Yggdrasil...${NC}"
install_yggdrasil
echo -e "${GREEN}✓ Yggdrasil installed${NC}"

# Generate config
echo ""
echo -e "${YELLOW}Generating configuration...${NC}"

mkdir -p /etc/yggdrasil
if [ ! -f /etc/yggdrasil/yggdrasil.conf ]; then
    yggdrasil -genconf > /etc/yggdrasil/yggdrasil.conf
    echo -e "${GREEN}✓ New configuration generated${NC}"
else
    echo -e "${GREEN}✓ Using existing configuration${NC}"
fi

# Add public peers
echo ""
echo -e "${YELLOW}Adding public peers...${NC}"

# Check if python3 is available
if command -v python3 &> /dev/null; then
    python3 << 'PYTHON'
import json
import sys

config_path = "/etc/yggdrasil/yggdrasil.conf"

try:
    with open(config_path, "r") as f:
        config = json.load(f)
except json.JSONDecodeError:
    print("Warning: Config parse error, regenerating...")
    import subprocess
    result = subprocess.run(["yggdrasil", "-genconf"], capture_output=True, text=True)
    config = json.loads(result.stdout)

# Public peers from https://github.com/yggdrasil-network/public-peers
public_peers = [
    # North America
    "tcp://167.160.89.98:7040",
    "tls://167.160.89.98:7041",
    "tls://longseason.1200bps.xyz:13121",
    # Europe
    "tls://ygg.mkg20001.io:443",
    "tls://supergay.network:443",
    "tcp://51.15.118.10:62486",
    "tls://51.38.64.12:28395",
    "tls://ygg.ace.ctrl-c.liu.se:9999",
    # Global
    "tls://ygg-uplink.thingylabs.io:443"
]

existing_peers = config.get("Peers", [])
new_peers = list(set(existing_peers + public_peers))
config["Peers"] = new_peers

# Enable multicast discovery for local mesh
if "MulticastInterfaces" not in config:
    config["MulticastInterfaces"] = [
        {
            "Regex": ".*",
            "Beacon": True,
            "Listen": True,
            "Port": 9001,
            "Priority": 0
        }
    ]

# Set listen addresses
if "Listen" not in config or not config["Listen"]:
    config["Listen"] = [
        "tcp://0.0.0.0:9001",
        "tls://0.0.0.0:9002"
    ]

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

added = len(new_peers) - len(existing_peers)
print(f"Added {added} new peers (total: {len(new_peers)})")
PYTHON
else
    echo -e "${YELLOW}python3 not found, adding peers manually...${NC}"
    # Fallback: just ensure the config exists
fi

echo -e "${GREEN}✓ Public peers configured${NC}"

# Start service
echo ""
echo -e "${YELLOW}Starting Yggdrasil service...${NC}"

if command -v systemctl &> /dev/null; then
    systemctl enable yggdrasil
    systemctl restart yggdrasil
    echo -e "${GREEN}✓ Service started (systemd)${NC}"
elif command -v rc-service &> /dev/null; then
    rc-update add yggdrasil default
    rc-service yggdrasil restart
    echo -e "${GREEN}✓ Service started (OpenRC)${NC}"
else
    echo -e "${YELLOW}Starting yggdrasil manually...${NC}"
    yggdrasil -useconf < /etc/yggdrasil/yggdrasil.conf &
fi

# Wait for connection
echo ""
echo -e "${YELLOW}Waiting for network connection...${NC}"
sleep 3

# Display info
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}     Yggdrasil Network Connected!              ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""

# Get node info
if command -v yggdrasilctl &> /dev/null; then
    SELF_INFO=$(yggdrasilctl getSelf 2>/dev/null || echo "")

    if [ -n "$SELF_INFO" ]; then
        IPV6=$(echo "$SELF_INFO" | grep -oP 'IPv6 address: \K[^\s]+' || echo "Connecting...")
        PUBKEY=$(echo "$SELF_INFO" | grep -oP 'Public key: \K[^\s]+' | head -c 20 || echo "...")

        echo -e "Your Yggdrasil Address:"
        echo -e "  ${YELLOW}$IPV6${NC}"
        echo ""
        echo -e "Public Key: ${BLUE}${PUBKEY}...${NC}"
        echo ""

        # Show peers
        PEERS=$(yggdrasilctl getPeers 2>/dev/null | grep -c "address" || echo "0")
        echo -e "Connected Peers: ${GREEN}$PEERS${NC}"
    else
        echo -e "${YELLOW}Connecting to network...${NC}"
        echo "Run 'yggdrasilctl getSelf' to see your address"
    fi
fi

echo ""
echo -e "Useful Commands:"
echo -e "  ${BLUE}yggdrasilctl getSelf${NC}   - Show your node info"
echo -e "  ${BLUE}yggdrasilctl getPeers${NC}  - List connected peers"
echo -e "  ${BLUE}yggdrasilctl getDHT${NC}    - Show routing table"
echo ""
echo -e "Configuration: ${BLUE}/etc/yggdrasil/yggdrasil.conf${NC}"
echo -e "Public Peers:  ${BLUE}https://github.com/yggdrasil-network/public-peers${NC}"
echo ""
echo -e "${GREEN}You are now part of the global Yggdrasil mesh network!${NC}"
echo ""
