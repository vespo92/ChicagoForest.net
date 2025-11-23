# Chicago Forest Network - Troubleshooting Guide

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This troubleshooting guide addresses issues with the theoretical deployment.

## Quick Diagnostics

Run these commands first to assess your node's status:

```bash
# Docker deployment
docker compose ps
docker logs forest-node --tail 100
curl http://localhost:8080/health

# System deployment
systemctl status forest-node
journalctl -u forest-node -n 100
forest-cli status
```

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Node Startup Problems](#node-startup-problems)
3. [Network Connectivity](#network-connectivity)
4. [Peer Connection Issues](#peer-connection-issues)
5. [WireGuard Problems](#wireguard-problems)
6. [BATMAN-adv Mesh Issues](#batman-adv-mesh-issues)
7. [Gateway-Specific Issues](#gateway-specific-issues)
8. [Performance Problems](#performance-problems)
9. [Docker-Specific Issues](#docker-specific-issues)
10. [Kubernetes Issues](#kubernetes-issues)

---

## Installation Issues

### Docker Not Found

**Symptom**: `docker: command not found`

**Solution**:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Docker Compose Not Found

**Symptom**: `docker-compose: command not found`

**Solution**:
```bash
# Modern Docker includes compose as plugin
docker compose version  # Note: no hyphen

# If using legacy docker-compose:
sudo apt install docker-compose-plugin
```

### Permission Denied

**Symptom**: `permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
groups | grep docker
```

### Missing Kernel Modules

**Symptom**: `modprobe: FATAL: Module wireguard not found`

**Solution**:
```bash
# Ubuntu/Debian
sudo apt install wireguard-tools linux-headers-$(uname -r)

# Load modules
sudo modprobe wireguard
sudo modprobe batman-adv

# Make persistent
echo "wireguard" | sudo tee -a /etc/modules-load.d/forest.conf
echo "batman_adv" | sudo tee -a /etc/modules-load.d/forest.conf
```

---

## Node Startup Problems

### Container Won't Start

**Symptom**: Container exits immediately or keeps restarting

**Diagnosis**:
```bash
docker logs forest-node
docker inspect forest-node --format='{{.State.ExitCode}}'
```

**Common Causes and Solutions**:

#### Exit Code 1 - Application Error
```bash
# Check for configuration issues
docker logs forest-node 2>&1 | grep -i error

# Verify environment variables
docker exec forest-node env | grep FOREST
```

#### Exit Code 137 - Out of Memory
```bash
# Increase memory limit
# In docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 4G
```

#### Exit Code 126 - Permission Issue
```bash
# Check file permissions
ls -la /var/lib/forest/
sudo chown -R 1000:1000 /var/lib/forest/
```

### Port Already in Use

**Symptom**: `bind: address already in use`

**Solution**:
```bash
# Find what's using the port
sudo ss -tulpn | grep -E "42000|51820|8080"

# Kill the process or change ports
# In .env:
P2P_PORT=42001
WG_PORT=51821
API_PORT=8081
```

### Missing TUN Device

**Symptom**: `TUN/TAP device not available`

**Solution**:
```bash
# Load tun module
sudo modprobe tun

# Verify
ls -la /dev/net/tun

# If missing, create it
sudo mkdir -p /dev/net
sudo mknod /dev/net/tun c 10 200
sudo chmod 666 /dev/net/tun
```

---

## Network Connectivity

### No Internet Connection

**Diagnosis**:
```bash
# From inside container
docker exec forest-node ping -c 3 8.8.8.8
docker exec forest-node curl -I https://google.com
```

**Solutions**:

#### DNS Issues
```bash
# Check DNS
docker exec forest-node cat /etc/resolv.conf

# Override DNS in docker-compose.yml
services:
  forest-node:
    dns:
      - 8.8.8.8
      - 1.1.1.1
```

#### Firewall Blocking
```bash
# Check host firewall
sudo iptables -L -n

# Allow Docker traffic
sudo iptables -A INPUT -i docker0 -j ACCEPT
sudo iptables -A FORWARD -i docker0 -j ACCEPT
```

### Interface Not Found

**Symptom**: `Interface eth1 not found`

**Diagnosis**:
```bash
# List available interfaces
ip link show
docker exec forest-node ip link show
```

**Solution**:
```bash
# Update .env with correct interface name
FOREST_INTERFACE=enp3s0  # Use your actual interface name

# Or use host network mode
NETWORK_MODE=host
```

### IP Forwarding Disabled

**Symptom**: Packets not routing between interfaces

**Solution**:
```bash
# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv6.conf.all.forwarding=1

# Make permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Peer Connection Issues

### No Peers Found

**Symptom**: `peers: 0` in status

**Diagnosis**:
```bash
docker exec forest-node forest-cli peers
docker exec forest-node wg show
```

**Solutions**:

#### Port Forwarding Not Configured
```bash
# Verify port is reachable from outside
# Use online port checker or from another network:
nc -uvz YOUR.PUBLIC.IP 42000
nc -uvz YOUR.PUBLIC.IP 51820
```

#### Bootstrap Peers Not Set
```bash
# Add bootstrap peers to .env
BOOTSTRAP_PEERS=10.42.0.1:42000,10.42.0.2:42000

# Or in config.yaml
bootstrapPeers:
  - 10.42.0.1:42000
```

#### Firewall Blocking Incoming
```bash
# Check firewall
sudo ufw status
sudo iptables -L INPUT -n

# Allow ports
sudo ufw allow 42000/udp
sudo ufw allow 51820/udp
```

### Peers Connect But Disconnect

**Symptom**: Peers appear briefly then disappear

**Diagnosis**:
```bash
# Watch peer status
watch -n 1 "docker exec forest-node wg show"

# Check for errors
docker logs forest-node 2>&1 | grep -i "peer\|disconnect"
```

**Solutions**:

#### MTU Mismatch
```bash
# Check MTU
docker exec forest-node ip link show

# Set consistent MTU
# In config or .env
WIREGUARD_MTU=1380
```

#### Keepalive Not Set
```bash
# Ensure PersistentKeepalive in WireGuard config
docker exec forest-node cat /etc/wireguard/wg-forest.conf
# Should have: PersistentKeepalive = 25
```

---

## WireGuard Problems

### WireGuard Interface Not Created

**Symptom**: `wg show` returns nothing or error

**Diagnosis**:
```bash
docker exec forest-node wg show
docker exec forest-node ip link show wg-forest
```

**Solution**:
```bash
# Manually create interface
docker exec forest-node wg-quick up wg-forest

# Check for errors
docker exec forest-node wg-quick up wg-forest 2>&1
```

### Handshake Failing

**Symptom**: Peer shows but "latest handshake" is old or missing

**Diagnosis**:
```bash
docker exec forest-node wg show wg-forest
# Check "latest handshake" field
```

**Solutions**:

#### Incorrect Keys
```bash
# Verify public keys match on both ends
docker exec forest-node cat /var/lib/forest/keys/wireguard.pub

# Regenerate if needed
docker exec forest-node wg genkey | tee /tmp/priv | wg pubkey
```

#### Endpoint Unreachable
```bash
# Test connectivity to peer endpoint
docker exec forest-node ping PEER_IP
docker exec forest-node nc -uvz PEER_IP 51820
```

#### Time Sync Issues
```bash
# Check time
date
docker exec forest-node date

# Sync time
sudo timedatectl set-ntp true
```

### High Latency Over WireGuard

**Solution**:
```bash
# Reduce MTU to avoid fragmentation
# In /etc/wireguard/wg-forest.conf
[Interface]
MTU = 1280
```

---

## BATMAN-adv Mesh Issues

### Mesh Interface Not Created

**Symptom**: `batctl meshif bat0` returns error

**Solution**:
```bash
# Load module
sudo modprobe batman-adv

# Create interface manually
sudo ip link add bat0 type batadv
sudo ip link set bat0 up
sudo ip addr add 10.42.1.1/16 dev bat0
```

### No Neighbors Visible

**Diagnosis**:
```bash
docker exec forest-node batctl meshif bat0 neighbors
docker exec forest-node batctl meshif bat0 originators
```

**Solutions**:

#### WireGuard Not Added to Mesh
```bash
# Add WireGuard interface to BATMAN
docker exec forest-node ip link set wg-forest master bat0
```

#### Wrong Routing Algorithm
```bash
# Check algorithm
docker exec forest-node batctl meshif bat0 routing_algo

# Should be BATMAN_V or BATMAN_IV
docker exec forest-node batctl meshif bat0 routing_algo BATMAN_V
```

### Mesh Routing Loops

**Symptom**: Packets going in circles, high latency

**Solution**:
```bash
# Enable bridge loop avoidance
docker exec forest-node batctl meshif bat0 bridge_loop_avoidance 1
```

---

## Gateway-Specific Issues

### NAT Not Working

**Symptom**: Forest nodes can't reach internet

**Diagnosis**:
```bash
docker exec forest-gateway iptables -t nat -L POSTROUTING -n
docker exec forest-gateway cat /proc/sys/net/ipv4/ip_forward
```

**Solution**:
```bash
# Enable masquerading manually
docker exec forest-gateway iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

### DHCP Not Assigning Addresses

**Diagnosis**:
```bash
docker exec forest-gateway systemctl status dnsmasq
docker exec forest-gateway cat /var/lib/misc/dnsmasq.leases
```

**Solutions**:

#### DHCP Server Not Running
```bash
# Restart DHCP
docker exec forest-gateway systemctl restart dnsmasq

# Check configuration
docker exec forest-gateway cat /etc/dnsmasq.d/forest.conf
```

#### Interface Binding Issue
```bash
# Ensure DHCP bound to correct interface
# In dnsmasq.conf:
interface=eth1
bind-interfaces
```

### DNS Not Resolving

**Diagnosis**:
```bash
docker exec forest-gateway dig @localhost forest.local
docker exec forest-gateway systemctl status dnsmasq
```

**Solution**:
```bash
# Check DNS config
docker exec forest-gateway cat /etc/dnsmasq.d/forest.conf

# Verify upstream DNS
docker exec forest-gateway dig @1.1.1.1 google.com
```

---

## Performance Problems

### High CPU Usage

**Diagnosis**:
```bash
docker stats forest-node
docker exec forest-node top -b -n 1
```

**Solutions**:

#### Too Many Peers
```bash
# Limit peer connections
# In config.yaml:
network:
  maxPeers: 30
```

#### Excessive Logging
```bash
# Reduce log level
# In .env:
LOG_LEVEL=warn
```

### High Memory Usage

**Diagnosis**:
```bash
docker stats forest-node
docker exec forest-node free -m
```

**Solution**:
```bash
# Add memory limits
# In docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 512M
```

### Network Throughput Low

**Diagnosis**:
```bash
# Test throughput
docker exec forest-node iperf3 -c PEER_IP -u -b 100M

# Check interface speed
docker exec forest-node ethtool eth1
```

**Solutions**:

#### MTU Optimization
```bash
# Find optimal MTU
docker exec forest-node ping -M do -s 1472 PEER_IP
# Decrease until packets pass
```

#### Disable TSO/GSO for Tunnels
```bash
docker exec forest-node ethtool -K wg-forest tso off gso off
```

---

## Docker-Specific Issues

### Volume Permissions

**Symptom**: Container can't write to mounted volumes

**Solution**:
```bash
# Fix permissions
sudo chown -R 1000:1000 /var/lib/forest

# Or use named volumes
volumes:
  forest-data:
    driver: local
```

### Network Mode Conflicts

**Symptom**: Container can't access host network interfaces

**Solution**:
```bash
# Use host network mode
# In docker-compose.yml:
network_mode: host
```

### Container Networking Issues

**Diagnosis**:
```bash
docker network ls
docker network inspect bridge
```

**Solution**:
```bash
# Recreate network
docker network rm forest_default
docker compose up -d
```

---

## Kubernetes Issues

### Pod Stuck in Pending

**Diagnosis**:
```bash
kubectl describe pod forest-node-xxx -n chicago-forest
kubectl get events -n chicago-forest
```

**Common Causes**:
- Insufficient resources
- PVC not bound
- Node selector mismatch

### PersistentVolumeClaim Issues

**Diagnosis**:
```bash
kubectl get pvc -n chicago-forest
kubectl describe pvc forest-node-data -n chicago-forest
```

**Solution**:
```bash
# Check storage class
kubectl get sc
kubectl describe sc standard

# Use available storage class
# In node-deployment.yaml:
storageClassName: gp2  # or your available class
```

### Network Policy Blocking

**Diagnosis**:
```bash
kubectl get networkpolicy -n chicago-forest
kubectl describe networkpolicy -n chicago-forest
```

**Solution**:
```bash
# Temporarily disable to test
kubectl delete networkpolicy --all -n chicago-forest
```

---

## Collecting Debug Information

For bug reports or further assistance, collect:

```bash
# System information
uname -a
docker version
docker compose version

# Node status
docker logs forest-node > forest-logs.txt 2>&1
docker exec forest-node forest-cli status > status.txt
docker exec forest-node wg show > wireguard.txt
docker exec forest-node ip addr > network.txt

# Create debug bundle
tar czf forest-debug-$(date +%Y%m%d).tar.gz forest-logs.txt status.txt wireguard.txt network.txt
```

## Getting Help

- **Documentation**: Review other guides in this directory
- **GitHub Issues**: Submit issues with debug bundle
- **Logs**: Always include relevant log excerpts

---

*The Chicago Forest Network is a theoretical framework. This troubleshooting guide addresses technical issues that would occur in a real implementation.*
