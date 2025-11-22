# Chicago Forest Network - Kubernetes Deployment

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This deployment configuration is NOT operational infrastructure.

## Overview

This directory contains Kubernetes manifests for deploying the Chicago Forest Network:

- **node-deployment.yaml** - Forest mesh network nodes
- **gateway-service.yaml** - Internet gateway/bridge nodes
- **configmaps/** - Centralized configuration

## Prerequisites

### Required Components

- Kubernetes 1.25+
- kubectl configured for your cluster
- PersistentVolume provisioner (for storage)
- Container runtime with NET_ADMIN capability support

### Optional Components

- **Multus CNI** - For NIC passthrough and multiple network interfaces
- **SR-IOV Device Plugin** - For high-performance networking
- **Prometheus Operator** - For metrics collection
- **cert-manager** - For TLS certificate management

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace chicago-forest
```

### 2. Apply ConfigMaps

```bash
kubectl apply -f configmaps/
```

### 3. Deploy Nodes

```bash
# Deploy basic node
kubectl apply -f node-deployment.yaml

# Check deployment
kubectl get pods -n chicago-forest
kubectl logs -f deployment/forest-node -n chicago-forest
```

### 4. Deploy Gateway (Optional)

```bash
# Label a node as gateway
kubectl label node <node-name> node-role.kubernetes.io/forest-gateway=true

# Deploy gateway
kubectl apply -f gateway-service.yaml
```

## Architecture

```
                         Internet
                             |
                    [LoadBalancer]
                             |
              +--------------------------------+
              |      Forest Gateway Pod        |
              |  (DaemonSet on gateway nodes)  |
              |  - NAT / Firewall              |
              |  - DHCP / DNS                  |
              |  - WireGuard VPN               |
              +--------------------------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
    +--------+          +--------+          +--------+
    | Node 1 |          | Node 2 |          | Node 3 |
    +--------+          +--------+          +--------+
         |                   |                   |
         +-------------------+-------------------+
                             |
                 [Forest Mesh Network]
                 (BATMAN-adv + WireGuard)
```

## Configuration

### Node Configuration

Edit `configmaps/node-config.yaml` to customize:

```yaml
data:
  FOREST_INTERFACE: "net1"        # Network interface
  ENABLE_FIREWALL: "true"         # Firewall enabled
  ENABLE_RELAY: "false"           # Traffic relay
  LOG_LEVEL: "info"               # Log verbosity
```

### Feature Flags

Enable/disable features in `forest-feature-flags` ConfigMap:

```yaml
data:
  ENABLE_FIREWALL: "true"
  ENABLE_RELAY: "false"
  ENABLE_STORAGE: "false"
  ENABLE_ANONYMOUS_ROUTING: "false"
```

### Resource Limits

Adjust in deployment spec:

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "2"
    memory: "2Gi"
```

## Advanced Configuration

### NIC Passthrough with Multus

1. Install Multus CNI:
```bash
kubectl apply -f https://raw.githubusercontent.com/k8snetworkplumbingwg/multus-cni/master/deployments/multus-daemonset.yml
```

2. Uncomment NetworkAttachmentDefinition in `node-deployment.yaml`

3. Update pod annotation:
```yaml
annotations:
  k8s.v1.cni.cncf.io/networks: forest-network
```

### SR-IOV for High Performance

1. Install SR-IOV Device Plugin
2. Configure network device
3. Add resource request:
```yaml
resources:
  limits:
    intel.com/sriov_netdevice: "1"
```

### Horizontal Pod Autoscaler

HPA is included in `node-deployment.yaml`. Configure thresholds:

```yaml
spec:
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Security

### RBAC

The deployment includes minimal RBAC permissions:
- Read ConfigMaps and Secrets in namespace
- List/Watch pods for peer discovery
- Create events for logging

### Network Policies

Apply network policies to restrict traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: forest-node-policy
  namespace: chicago-forest
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: forest-node
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: chicago-forest
      ports:
        - port: 42000
          protocol: UDP
        - port: 51820
          protocol: UDP
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: chicago-forest
```

### Secrets Management

Store sensitive data in Kubernetes Secrets:

```bash
# Generate WireGuard keypair
wg genkey | tee privatekey | wg pubkey > publickey

# Create secret
kubectl create secret generic forest-node-keys \
  --from-file=wireguard-private-key=privatekey \
  -n chicago-forest
```

## Monitoring

### Prometheus Integration

Pods are annotated for Prometheus scraping:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9090"
  prometheus.io/path: "/metrics"
```

### Service Monitor (Prometheus Operator)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: forest-node-monitor
  namespace: chicago-forest
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: forest-node
  endpoints:
    - port: metrics
      interval: 30s
```

### Grafana Dashboard

Import the dashboard from `grafana/dashboards/forest-network.json`

## Troubleshooting

### Pod Won't Start

```bash
# Check events
kubectl describe pod <pod-name> -n chicago-forest

# Check logs
kubectl logs <pod-name> -n chicago-forest --previous
```

### Network Issues

```bash
# Exec into pod
kubectl exec -it <pod-name> -n chicago-forest -- /bin/sh

# Check interfaces
ip link show
ip addr show

# Check WireGuard
wg show
```

### Insufficient Permissions

```bash
# Check security context
kubectl get pod <pod-name> -n chicago-forest -o yaml | grep -A 20 securityContext

# Verify capabilities
kubectl exec <pod-name> -n chicago-forest -- cat /proc/self/status | grep Cap
```

### Storage Issues

```bash
# Check PVC status
kubectl get pvc -n chicago-forest

# Check PV binding
kubectl describe pvc forest-node-data -n chicago-forest
```

## Operations

### Scaling

```bash
# Scale deployment
kubectl scale deployment forest-node --replicas=5 -n chicago-forest

# Enable autoscaling
kubectl autoscale deployment forest-node --min=1 --max=10 --cpu-percent=70 -n chicago-forest
```

### Rolling Updates

```bash
# Update image
kubectl set image deployment/forest-node forest-node=ghcr.io/chicago-forest/forest-node:v0.2.0 -n chicago-forest

# Check rollout status
kubectl rollout status deployment/forest-node -n chicago-forest

# Rollback if needed
kubectl rollout undo deployment/forest-node -n chicago-forest
```

### Backup

```bash
# Backup PVC data
kubectl exec <pod-name> -n chicago-forest -- tar czf /tmp/backup.tar.gz /var/lib/forest
kubectl cp chicago-forest/<pod-name>:/tmp/backup.tar.gz ./forest-backup.tar.gz
```

## Cloud Provider Notes

### AWS EKS

- Use `service.beta.kubernetes.io/aws-load-balancer-type: nlb` for UDP support
- Consider Calico CNI for network policies
- Use EBS gp3 for PersistentVolumes

### Google GKE

- Enable `--enable-network-policy` on cluster
- Use `cloud.google.com/l4-rbs: enabled` for regional load balancing
- Consider Anthos Service Mesh for advanced networking

### Azure AKS

- Use Azure CNI for enhanced networking
- Enable `--network-policy azure` for network policies
- Use Azure Files for ReadWriteMany PVCs

## Related Documentation

- [Docker Deployment](../docker/README.md)
- [Home Node Setup Guide](../guides/home-node-setup.md)
- [Troubleshooting Guide](../guides/troubleshooting.md)
- [Terraform Modules](../terraform/README.md)

## License

MIT License - See repository root for details.
