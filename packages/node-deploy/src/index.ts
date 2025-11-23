/**
 * @chicago-forest/node-deploy
 *
 * Deployment configurations for Chicago Forest Network nodes.
 * Supports Docker, Kubernetes (with NIC passthrough), and VMs.
 *
 * Key features:
 * - NIC passthrough for direct hardware access
 * - SR-IOV support for high-performance networking
 * - Multus CNI for multiple network interfaces in K8s
 * - OPNsense/pfSense VM templates
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   generateDockerCompose,
 *   generateKubernetesManifest,
 *   generateCloudInit,
 * } from '@chicago-forest/node-deploy';
 *
 * // Generate Docker deployment
 * const compose = generateDockerCompose({
 *   nodeName: 'forest-node-1',
 *   forestInterface: 'eth1',
 *   enableFirewall: true,
 * });
 *
 * // Generate Kubernetes deployment with NIC passthrough
 * const k8s = generateKubernetesManifest({
 *   nodeName: 'forest-node-1',
 *   nicPassthrough: true,
 *   sriovEnabled: true,
 * });
 * ```
 */

import type {
  DeploymentConfig,
  DeploymentTarget,
  NetworkInterfaceConfig,
  ForestFirewallConfig,
  FirewallZone,
} from '@chicago-forest/shared-types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Forest node deployment options
 */
export interface ForestNodeDeploymentOptions {
  /** Node name */
  nodeName: string;
  /** Node ID (if pre-generated) */
  nodeId?: string;
  /** Forest network interface */
  forestInterface: string;
  /** WAN interface (optional) */
  wanInterface?: string;
  /** LAN interface (optional) */
  lanInterface?: string;
  /** Enable Chicago Forest Firewall */
  enableFirewall: boolean;
  /** Enable anonymous routing */
  enableAnonymousRouting: boolean;
  /** Enable relay mode (help route traffic for others) */
  enableRelay: boolean;
  /** Enable storage (store data for network) */
  enableStorage: boolean;
  /** Storage path */
  storagePath?: string;
  /** Storage limit in GB */
  storageLimit?: number;
  /** CPU limit */
  cpuLimit?: string;
  /** Memory limit */
  memoryLimit?: string;
  /** Enable NIC passthrough (for K8s/VMs) */
  nicPassthrough?: boolean;
  /** SR-IOV VF index (for high performance) */
  sriovVf?: number;
  /** Custom DNS servers */
  dnsServers?: string[];
  /** Bootstrap peers */
  bootstrapPeers?: string[];
}

/**
 * Default deployment options
 */
export const DEFAULT_DEPLOYMENT_OPTIONS: Partial<ForestNodeDeploymentOptions> = {
  forestInterface: 'eth1',
  enableFirewall: true,
  enableAnonymousRouting: false,
  enableRelay: false,
  enableStorage: false,
  storagePath: '/var/lib/forest',
  storageLimit: 10,
  cpuLimit: '2',
  memoryLimit: '2Gi',
};

// =============================================================================
// DOCKER DEPLOYMENT
// =============================================================================

/**
 * Generate Docker Compose configuration
 */
export function generateDockerCompose(
  options: ForestNodeDeploymentOptions
): string {
  const opts = { ...DEFAULT_DEPLOYMENT_OPTIONS, ...options };

  return `# Chicago Forest Network Node - Docker Compose
# Auto-generated deployment configuration
# DISCLAIMER: Theoretical framework - not operational

version: '3.8'

services:
  ${opts.nodeName}:
    image: ghcr.io/chicago-forest/forest-node:latest
    container_name: ${opts.nodeName}
    hostname: ${opts.nodeName}
    restart: unless-stopped

    # Network configuration - uses host network for direct interface access
    network_mode: host

    # Capabilities for network operations
    cap_add:
      - NET_ADMIN
      - NET_RAW
      - SYS_MODULE

    # Environment
    environment:
      - FOREST_NODE_NAME=${opts.nodeName}
      - FOREST_INTERFACE=${opts.forestInterface}
      ${opts.wanInterface ? `- WAN_INTERFACE=${opts.wanInterface}` : ''}
      - ENABLE_FIREWALL=${opts.enableFirewall}
      - ENABLE_ANONYMOUS_ROUTING=${opts.enableAnonymousRouting}
      - ENABLE_RELAY=${opts.enableRelay}
      - ENABLE_STORAGE=${opts.enableStorage}
      ${opts.bootstrapPeers?.length ? `- BOOTSTRAP_PEERS=${opts.bootstrapPeers.join(',')}` : ''}

    # Volumes
    volumes:
      - forest-data:/var/lib/forest
      - forest-config:/etc/forest
      - /dev/net/tun:/dev/net/tun

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '${opts.cpuLimit}'
          memory: ${opts.memoryLimit}
        reservations:
          cpus: '0.5'
          memory: 512M

    # Health check
    healthcheck:
      test: ["CMD", "forest-cli", "status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  ${opts.enableFirewall ? `
  # Chicago Forest Firewall (OPNsense-based)
  ${opts.nodeName}-firewall:
    image: ghcr.io/chicago-forest/forest-firewall:latest
    container_name: ${opts.nodeName}-firewall
    hostname: ${opts.nodeName}-firewall
    restart: unless-stopped
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
    volumes:
      - firewall-config:/etc/cfw
    environment:
      - FOREST_INTERFACE=${opts.forestInterface}
      ${opts.wanInterface ? `- WAN_INTERFACE=${opts.wanInterface}` : ''}
      ${opts.lanInterface ? `- LAN_INTERFACE=${opts.lanInterface}` : ''}
    depends_on:
      - ${opts.nodeName}
  ` : ''}

volumes:
  forest-data:
    driver: local
  forest-config:
    driver: local
  ${opts.enableFirewall ? 'firewall-config:\n    driver: local' : ''}

# Usage:
# docker-compose up -d
# docker-compose logs -f ${opts.nodeName}
# docker exec -it ${opts.nodeName} forest-cli status
`;
}

/**
 * Generate Dockerfile for forest node
 */
export function generateDockerfile(): string {
  return `# Chicago Forest Network Node Dockerfile
# Multi-stage build for minimal image size

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ linux-headers

# Copy package files
COPY package*.json ./
COPY packages/*/package.json ./packages/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build all packages
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \\
    iproute2 \\
    iptables \\
    nftables \\
    wireguard-tools \\
    batctl \\
    iw \\
    wireless-tools \\
    curl \\
    jq

# Create forest user
RUN addgroup -g 1000 forest && \\
    adduser -u 1000 -G forest -s /bin/sh -D forest

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/cli/dist ./packages/cli/dist

# Create directories
RUN mkdir -p /var/lib/forest /etc/forest && \\
    chown -R forest:forest /var/lib/forest /etc/forest

# Add CLI to path
RUN ln -s /app/packages/cli/dist/forest-cli /usr/local/bin/forest-cli

# Environment
ENV NODE_ENV=production
ENV FOREST_DATA_DIR=/var/lib/forest
ENV FOREST_CONFIG_DIR=/etc/forest

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
    CMD forest-cli status || exit 1

# Switch to forest user (some operations need root)
# USER forest

# Entrypoint
ENTRYPOINT ["node", "dist/index.js"]
CMD ["--start"]
`;
}

// =============================================================================
// KUBERNETES DEPLOYMENT
// =============================================================================

/**
 * Generate Kubernetes deployment manifest
 */
export function generateKubernetesManifest(
  options: ForestNodeDeploymentOptions
): string {
  const opts = { ...DEFAULT_DEPLOYMENT_OPTIONS, ...options };
  const labels = {
    app: 'forest-node',
    'forest.network/node': opts.nodeName,
  };

  return `# Chicago Forest Network Node - Kubernetes Deployment
# Supports NIC passthrough via Multus CNI and SR-IOV
# DISCLAIMER: Theoretical framework - not operational

apiVersion: v1
kind: Namespace
metadata:
  name: chicago-forest
  labels:
    name: chicago-forest

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${opts.nodeName}-config
  namespace: chicago-forest
data:
  FOREST_NODE_NAME: "${opts.nodeName}"
  FOREST_INTERFACE: "${opts.forestInterface}"
  ENABLE_FIREWALL: "${opts.enableFirewall}"
  ENABLE_ANONYMOUS_ROUTING: "${opts.enableAnonymousRouting}"
  ENABLE_RELAY: "${opts.enableRelay}"
  ENABLE_STORAGE: "${opts.enableStorage}"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${opts.nodeName}-data
  namespace: chicago-forest
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: ${opts.storageLimit}Gi
  storageClassName: standard

---
${opts.nicPassthrough ? `
# Network Attachment Definition for Multus CNI
# Enables multiple network interfaces with NIC passthrough
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: forest-net
  namespace: chicago-forest
  annotations:
    k8s.v1.cni.cncf.io/resourceName: ${opts.sriovVf !== undefined ? 'intel.com/sriov_netdevice' : 'bridge'}
spec:
  config: |
    {
      "cniVersion": "0.3.1",
      "type": "${opts.sriovVf !== undefined ? 'sriov' : 'macvlan'}",
      "master": "${opts.forestInterface}",
      "mode": "bridge",
      "ipam": {
        "type": "whereabouts",
        "range": "10.42.0.0/16"
      }
    }

---
` : ''}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${opts.nodeName}
  namespace: chicago-forest
  labels:
    ${Object.entries(labels).map(([k, v]) => `${k}: "${v}"`).join('\n    ')}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: forest-node
      forest.network/node: ${opts.nodeName}
  template:
    metadata:
      labels:
        ${Object.entries(labels).map(([k, v]) => `${k}: "${v}"`).join('\n        ')}
      annotations:
        ${opts.nicPassthrough ? 'k8s.v1.cni.cncf.io/networks: forest-net' : ''}
    spec:
      containers:
        - name: forest-node
          image: ghcr.io/chicago-forest/forest-node:latest
          imagePullPolicy: Always

          envFrom:
            - configMapRef:
                name: ${opts.nodeName}-config

          securityContext:
            privileged: ${opts.nicPassthrough}
            capabilities:
              add:
                - NET_ADMIN
                - NET_RAW
                - SYS_MODULE

          resources:
            limits:
              cpu: "${opts.cpuLimit}"
              memory: "${opts.memoryLimit}"
              ${opts.sriovVf !== undefined ? 'intel.com/sriov_netdevice: "1"' : ''}
            requests:
              cpu: "500m"
              memory: "512Mi"

          volumeMounts:
            - name: forest-data
              mountPath: /var/lib/forest
            - name: tun-device
              mountPath: /dev/net/tun

          ports:
            - name: p2p
              containerPort: 42000
              protocol: UDP
            - name: wireguard
              containerPort: 51820
              protocol: UDP
            - name: api
              containerPort: 8080
              protocol: TCP

          livenessProbe:
            exec:
              command: ["forest-cli", "status"]
            initialDelaySeconds: 30
            periodSeconds: 30

          readinessProbe:
            httpGet:
              path: /health
              port: api
            initialDelaySeconds: 10
            periodSeconds: 10

      volumes:
        - name: forest-data
          persistentVolumeClaim:
            claimName: ${opts.nodeName}-data
        - name: tun-device
          hostPath:
            path: /dev/net/tun
            type: CharDevice

---
apiVersion: v1
kind: Service
metadata:
  name: ${opts.nodeName}
  namespace: chicago-forest
spec:
  selector:
    app: forest-node
    forest.network/node: ${opts.nodeName}
  ports:
    - name: p2p
      port: 42000
      targetPort: 42000
      protocol: UDP
    - name: wireguard
      port: 51820
      targetPort: 51820
      protocol: UDP
    - name: api
      port: 8080
      targetPort: 8080
      protocol: TCP
  type: LoadBalancer
`;
}

/**
 * Generate Helm values.yaml
 */
export function generateHelmValues(
  options: ForestNodeDeploymentOptions
): string {
  const opts = { ...DEFAULT_DEPLOYMENT_OPTIONS, ...options };

  return `# Chicago Forest Network Node - Helm Values
# helm install ${opts.nodeName} chicago-forest/forest-node -f values.yaml

# Node configuration
nodeName: "${opts.nodeName}"
nodeId: "${opts.nodeId || ''}"

# Network interfaces
network:
  forestInterface: "${opts.forestInterface}"
  wanInterface: "${opts.wanInterface || ''}"
  lanInterface: "${opts.lanInterface || ''}"
  nicPassthrough: ${opts.nicPassthrough || false}
  sriovEnabled: ${opts.sriovVf !== undefined}
  sriovVf: ${opts.sriovVf ?? 0}

# Features
features:
  firewall: ${opts.enableFirewall}
  anonymousRouting: ${opts.enableAnonymousRouting}
  relay: ${opts.enableRelay}
  storage: ${opts.enableStorage}

# Storage
storage:
  enabled: ${opts.enableStorage}
  path: "${opts.storagePath}"
  size: "${opts.storageLimit}Gi"
  storageClassName: "standard"

# Resources
resources:
  limits:
    cpu: "${opts.cpuLimit}"
    memory: "${opts.memoryLimit}"
  requests:
    cpu: "500m"
    memory: "512Mi"

# Image
image:
  repository: ghcr.io/chicago-forest/forest-node
  tag: latest
  pullPolicy: Always

# Service
service:
  type: LoadBalancer
  ports:
    p2p: 42000
    wireguard: 51820
    api: 8080

# Bootstrap peers
bootstrapPeers:
${opts.bootstrapPeers?.map((p) => `  - "${p}"`).join('\n') || '  []'}

# Security
securityContext:
  privileged: ${opts.nicPassthrough || false}
  capabilities:
    - NET_ADMIN
    - NET_RAW
    - SYS_MODULE
`;
}

// =============================================================================
// VM DEPLOYMENT
// =============================================================================

/**
 * Generate cloud-init configuration for VM deployment
 */
export function generateCloudInit(
  options: ForestNodeDeploymentOptions
): string {
  const opts = { ...DEFAULT_DEPLOYMENT_OPTIONS, ...options };

  return `#cloud-config
# Chicago Forest Network Node - Cloud-Init Configuration
# Use with any cloud provider or local VM (QEMU, VirtualBox, etc.)
# DISCLAIMER: Theoretical framework - not operational

hostname: ${opts.nodeName}
manage_etc_hosts: true

# Users
users:
  - name: forest
    groups: sudo, docker, netdev
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      # Add your SSH public key here
      - ssh-rsa AAAA...your-key...

# Package installation
packages:
  - docker.io
  - docker-compose
  - wireguard
  - wireguard-tools
  - batctl
  - iproute2
  - nftables
  - curl
  - jq
  - git

# Enable required kernel modules
bootcmd:
  - modprobe wireguard
  - modprobe batman-adv
  - modprobe tun
  - modprobe vxlan

# Write configuration files
write_files:
  # Forest node configuration
  - path: /etc/forest/config.yaml
    owner: root:root
    permissions: '0644'
    content: |
      nodeName: ${opts.nodeName}
      forestInterface: ${opts.forestInterface}
      ${opts.wanInterface ? `wanInterface: ${opts.wanInterface}` : ''}
      features:
        firewall: ${opts.enableFirewall}
        anonymousRouting: ${opts.enableAnonymousRouting}
        relay: ${opts.enableRelay}
        storage: ${opts.enableStorage}
      storage:
        path: ${opts.storagePath}
        limit: ${opts.storageLimit}GB
      ${opts.bootstrapPeers?.length ? `bootstrapPeers:\n${opts.bootstrapPeers.map((p) => `        - ${p}`).join('\n')}` : ''}

  # Docker compose file
  - path: /opt/forest/docker-compose.yml
    owner: root:root
    permissions: '0644'
    content: |
${generateDockerCompose(opts).split('\n').map((l) => '      ' + l).join('\n')}

  # Systemd service
  - path: /etc/systemd/system/forest-node.service
    owner: root:root
    permissions: '0644'
    content: |
      [Unit]
      Description=Chicago Forest Network Node
      Requires=docker.service
      After=docker.service network-online.target

      [Service]
      Type=oneshot
      RemainAfterExit=yes
      WorkingDirectory=/opt/forest
      ExecStart=/usr/bin/docker-compose up -d
      ExecStop=/usr/bin/docker-compose down

      [Install]
      WantedBy=multi-user.target

# Run commands
runcmd:
  # Create directories
  - mkdir -p /opt/forest /var/lib/forest /etc/forest

  # Enable IP forwarding
  - sysctl -w net.ipv4.ip_forward=1
  - echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf

  # Enable docker
  - systemctl enable docker
  - systemctl start docker

  # Pull forest images
  - docker pull ghcr.io/chicago-forest/forest-node:latest
  ${opts.enableFirewall ? '- docker pull ghcr.io/chicago-forest/forest-firewall:latest' : ''}

  # Enable and start forest node
  - systemctl daemon-reload
  - systemctl enable forest-node
  - systemctl start forest-node

# Final message
final_message: |
  Chicago Forest Network Node deployment complete!

  Check status: docker ps
  View logs: docker logs ${opts.nodeName}
  CLI: docker exec -it ${opts.nodeName} forest-cli status
`;
}

/**
 * Generate OPNsense VM configuration
 */
export function generateOPNsenseVMConfig(
  options: ForestNodeDeploymentOptions
): string {
  return `# OPNsense VM Configuration for Chicago Forest Network
# Use with QEMU/KVM or VirtualBox
# DISCLAIMER: Theoretical framework - not operational

# VM Specifications
Name: ${options.nodeName}-opnsense
CPU: 2 cores
RAM: 4096 MB
Disk: 20 GB

# Network Interfaces (2-port configuration)
NIC1 (WAN): ${options.wanInterface || 'vtnet0'} - Bridge to internet
NIC2 (FOREST): ${options.forestInterface} - Bridge to Forest network
NIC3 (LAN): ${options.lanInterface || 'vtnet2'} - Bridge to local network

# Post-Install Configuration Steps:
1. Install OPNsense from ISO
2. Assign interfaces:
   - WAN: ${options.wanInterface || 'vtnet0'}
   - FOREST: ${options.forestInterface} (as OPT1)
   - LAN: ${options.lanInterface || 'vtnet2'}
3. Configure FOREST interface:
   - Enable interface
   - Set static IP: 10.42.1.1/16
   - Disable block private networks
4. Install os-wireguard plugin
5. Import Chicago Forest Firewall rules
6. Configure WireGuard for Forest tunnels
7. Enable BATMAN-adv for mesh routing

# QEMU command example:
qemu-system-x86_64 \\
  -name "${options.nodeName}-opnsense" \\
  -m 4096 \\
  -smp 2 \\
  -cpu host \\
  -enable-kvm \\
  -drive file=opnsense.qcow2,format=qcow2 \\
  -netdev bridge,id=wan,br=br0 \\
  -device virtio-net-pci,netdev=wan,mac=52:54:00:12:34:01 \\
  -netdev bridge,id=forest,br=br-forest \\
  -device virtio-net-pci,netdev=forest,mac=52:54:00:12:34:02 \\
  -netdev bridge,id=lan,br=br-lan \\
  -device virtio-net-pci,netdev=lan,mac=52:54:00:12:34:03 \\
  -vnc :0
`;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a deployment configuration object
 */
export function createDeploymentConfig(
  options: ForestNodeDeploymentOptions,
  target: DeploymentTarget
): DeploymentConfig {
  const opts = { ...DEFAULT_DEPLOYMENT_OPTIONS, ...options };

  const interfaces: NetworkInterfaceConfig[] = [
    {
      name: opts.forestInterface,
      type: opts.nicPassthrough ? 'physical' : 'virtual',
      zone: 'forest' as FirewallZone,
      passthrough: opts.nicPassthrough,
      sriovVf: opts.sriovVf,
    },
  ];

  if (opts.wanInterface) {
    interfaces.push({
      name: opts.wanInterface,
      type: 'physical',
      zone: 'wan' as FirewallZone,
    });
  }

  if (opts.lanInterface) {
    interfaces.push({
      name: opts.lanInterface,
      type: 'physical',
      zone: 'lan' as FirewallZone,
    });
  }

  return {
    target,
    networkConfig: {
      interfaces,
    },
    resources: {
      cpuLimit: opts.cpuLimit,
      memoryLimit: opts.memoryLimit,
      storageLimit: opts.storageLimit ? `${opts.storageLimit}Gi` : undefined,
    },
    features: {
      anonymousRouting: opts.enableAnonymousRouting,
      relay: opts.enableRelay,
      storage: opts.enableStorage,
      bridgeToInternet: !!opts.wanInterface,
    },
  };
}

// =============================================================================
// SYMBIONT DEPLOYMENT (Cross-Network Federation)
// =============================================================================

/**
 * Symbiont gateway deployment options
 */
export interface SymbiontDeploymentOptions extends ForestNodeDeploymentOptions {
  /** Enable auto-discovery of other forests */
  autoDiscovery: boolean;
  /** Enable automatic federation with trusted forests */
  autoFederate: boolean;
  /** Minimum trust score for auto-federation */
  minAutoFederateTrust: number;
  /** Maximum concurrent federations */
  maxFederations: number;
  /** Discovery interval (seconds) */
  discoveryInterval: number;
  /** Health check interval (seconds) */
  healthCheckInterval: number;
  /** Federation terms preset */
  federationTermsPreset: 'conservative' | 'balanced' | 'permissive';
  /** Initial federated forests */
  initialFederations?: string[];
}

/**
 * Default Symbiont deployment options
 */
export const DEFAULT_SYMBIONT_OPTIONS: Partial<SymbiontDeploymentOptions> = {
  ...DEFAULT_DEPLOYMENT_OPTIONS,
  autoDiscovery: true,
  autoFederate: false,
  minAutoFederateTrust: 0.7,
  maxFederations: 10,
  discoveryInterval: 60,
  healthCheckInterval: 30,
  federationTermsPreset: 'balanced',
};

/**
 * Generate Docker Compose for Symbiont gateway
 */
export function generateSymbiontDockerCompose(
  options: SymbiontDeploymentOptions
): string {
  const opts = { ...DEFAULT_SYMBIONT_OPTIONS, ...options } as SymbiontDeploymentOptions;

  return `# Chicago Forest Network - Symbiont Gateway
# Cross-Network Federation Orchestrator
# Auto-generated deployment configuration
# DISCLAIMER: Theoretical framework - not operational

version: '3.8'

services:
  ${opts.nodeName}-symbiont:
    image: ghcr.io/chicago-forest/symbiont-gateway:latest
    container_name: ${opts.nodeName}-symbiont
    hostname: ${opts.nodeName}-symbiont
    restart: unless-stopped

    # Network configuration
    network_mode: host

    # Capabilities for network operations
    cap_add:
      - NET_ADMIN
      - NET_RAW
      - SYS_MODULE

    # Environment
    environment:
      # Core configuration
      - FOREST_NODE_NAME=${opts.nodeName}
      - FOREST_INTERFACE=${opts.forestInterface}
      ${opts.wanInterface ? `- WAN_INTERFACE=${opts.wanInterface}` : ''}

      # Symbiont configuration
      - SYMBIONT_AUTO_DISCOVERY=${opts.autoDiscovery}
      - SYMBIONT_AUTO_FEDERATE=${opts.autoFederate}
      - SYMBIONT_MIN_TRUST=${opts.minAutoFederateTrust}
      - SYMBIONT_MAX_FEDERATIONS=${opts.maxFederations}
      - SYMBIONT_DISCOVERY_INTERVAL=${opts.discoveryInterval}
      - SYMBIONT_HEALTH_INTERVAL=${opts.healthCheckInterval}
      - SYMBIONT_TERMS_PRESET=${opts.federationTermsPreset}

      # Initial federations
      ${opts.initialFederations?.length ? `- SYMBIONT_INITIAL_FEDERATIONS=${opts.initialFederations.join(',')}` : ''}

      # Feature flags
      - ENABLE_FIREWALL=${opts.enableFirewall}
      - ENABLE_ANONYMOUS_ROUTING=${opts.enableAnonymousRouting}

      # Bootstrap peers
      ${opts.bootstrapPeers?.length ? `- BOOTSTRAP_PEERS=${opts.bootstrapPeers.join(',')}` : ''}

    # Volumes
    volumes:
      - symbiont-data:/var/lib/symbiont
      - symbiont-config:/etc/symbiont
      - forest-data:/var/lib/forest
      - /dev/net/tun:/dev/net/tun

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '${opts.cpuLimit}'
          memory: ${opts.memoryLimit}
        reservations:
          cpus: '1'
          memory: 1Gi

    # Ports
    ports:
      # P2P communication
      - "42000:42000/udp"
      # Federation protocol
      - "42001:42001/tcp"
      # API
      - "8081:8081/tcp"
      # Discovery beacon
      - "42002:42002/udp"

    # Health check
    healthcheck:
      test: ["CMD", "forest-cli", "symbiont", "--status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  ${opts.enableFirewall ? `
  # Chicago Forest Firewall for Symbiont
  ${opts.nodeName}-firewall:
    image: ghcr.io/chicago-forest/forest-firewall:latest
    container_name: ${opts.nodeName}-symbiont-firewall
    hostname: ${opts.nodeName}-symbiont-firewall
    restart: unless-stopped
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
    volumes:
      - firewall-config:/etc/cfw
    environment:
      - FOREST_INTERFACE=${opts.forestInterface}
      ${opts.wanInterface ? `- WAN_INTERFACE=${opts.wanInterface}` : ''}
      - SYMBIONT_MODE=true
    depends_on:
      - ${opts.nodeName}-symbiont
  ` : ''}

volumes:
  symbiont-data:
    driver: local
  symbiont-config:
    driver: local
  forest-data:
    driver: local
  ${opts.enableFirewall ? 'firewall-config:\n    driver: local' : ''}

# Usage:
# docker-compose -f symbiont-compose.yml up -d
# docker-compose -f symbiont-compose.yml logs -f ${opts.nodeName}-symbiont
# docker exec -it ${opts.nodeName}-symbiont forest-cli federation --status
`;
}

/**
 * Generate Kubernetes manifest for Symbiont gateway
 */
export function generateSymbiontKubernetesManifest(
  options: SymbiontDeploymentOptions
): string {
  const opts = { ...DEFAULT_SYMBIONT_OPTIONS, ...options } as SymbiontDeploymentOptions;

  return `# Chicago Forest Network - Symbiont Gateway
# Cross-Network Federation Orchestrator - Kubernetes Deployment
# DISCLAIMER: Theoretical framework - not operational

apiVersion: v1
kind: Namespace
metadata:
  name: chicago-forest-federation
  labels:
    name: chicago-forest-federation
    component: symbiont

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${opts.nodeName}-symbiont-config
  namespace: chicago-forest-federation
data:
  # Core configuration
  FOREST_NODE_NAME: "${opts.nodeName}"
  FOREST_INTERFACE: "${opts.forestInterface}"

  # Symbiont configuration
  SYMBIONT_AUTO_DISCOVERY: "${opts.autoDiscovery}"
  SYMBIONT_AUTO_FEDERATE: "${opts.autoFederate}"
  SYMBIONT_MIN_TRUST: "${opts.minAutoFederateTrust}"
  SYMBIONT_MAX_FEDERATIONS: "${opts.maxFederations}"
  SYMBIONT_DISCOVERY_INTERVAL: "${opts.discoveryInterval}"
  SYMBIONT_HEALTH_INTERVAL: "${opts.healthCheckInterval}"
  SYMBIONT_TERMS_PRESET: "${opts.federationTermsPreset}"

  # Feature flags
  ENABLE_FIREWALL: "${opts.enableFirewall}"
  ENABLE_ANONYMOUS_ROUTING: "${opts.enableAnonymousRouting}"

---
apiVersion: v1
kind: Secret
metadata:
  name: ${opts.nodeName}-symbiont-secrets
  namespace: chicago-forest-federation
type: Opaque
stringData:
  # Gateway signing key (auto-generated in production)
  SYMBIONT_SIGNING_KEY: "auto-generated"

  # Initial federations (comma-separated forest IDs)
  SYMBIONT_INITIAL_FEDERATIONS: "${opts.initialFederations?.join(',') || ''}"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${opts.nodeName}-symbiont-data
  namespace: chicago-forest-federation
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: ${opts.storageLimit}Gi
  storageClassName: standard

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${opts.nodeName}-symbiont
  namespace: chicago-forest-federation
  labels:
    app: symbiont-gateway
    forest.network/node: ${opts.nodeName}
    forest.network/component: federation
spec:
  replicas: 1
  selector:
    matchLabels:
      app: symbiont-gateway
      forest.network/node: ${opts.nodeName}
  template:
    metadata:
      labels:
        app: symbiont-gateway
        forest.network/node: ${opts.nodeName}
        forest.network/component: federation
    spec:
      containers:
        - name: symbiont-gateway
          image: ghcr.io/chicago-forest/symbiont-gateway:latest
          imagePullPolicy: Always

          envFrom:
            - configMapRef:
                name: ${opts.nodeName}-symbiont-config
            - secretRef:
                name: ${opts.nodeName}-symbiont-secrets

          securityContext:
            privileged: ${opts.nicPassthrough}
            capabilities:
              add:
                - NET_ADMIN
                - NET_RAW
                - SYS_MODULE

          resources:
            limits:
              cpu: "${opts.cpuLimit}"
              memory: "${opts.memoryLimit}"
            requests:
              cpu: "1"
              memory: "1Gi"

          volumeMounts:
            - name: symbiont-data
              mountPath: /var/lib/symbiont
            - name: tun-device
              mountPath: /dev/net/tun

          ports:
            - name: p2p
              containerPort: 42000
              protocol: UDP
            - name: federation
              containerPort: 42001
              protocol: TCP
            - name: api
              containerPort: 8081
              protocol: TCP
            - name: discovery
              containerPort: 42002
              protocol: UDP

          livenessProbe:
            exec:
              command: ["forest-cli", "symbiont", "--status"]
            initialDelaySeconds: 60
            periodSeconds: 30

          readinessProbe:
            httpGet:
              path: /health
              port: api
            initialDelaySeconds: 30
            periodSeconds: 10

      volumes:
        - name: symbiont-data
          persistentVolumeClaim:
            claimName: ${opts.nodeName}-symbiont-data
        - name: tun-device
          hostPath:
            path: /dev/net/tun
            type: CharDevice

---
apiVersion: v1
kind: Service
metadata:
  name: ${opts.nodeName}-symbiont
  namespace: chicago-forest-federation
spec:
  selector:
    app: symbiont-gateway
    forest.network/node: ${opts.nodeName}
  ports:
    - name: p2p
      port: 42000
      targetPort: 42000
      protocol: UDP
    - name: federation
      port: 42001
      targetPort: 42001
      protocol: TCP
    - name: api
      port: 8081
      targetPort: 8081
      protocol: TCP
    - name: discovery
      port: 42002
      targetPort: 42002
      protocol: UDP
  type: LoadBalancer

---
# Network Policy for Symbiont
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${opts.nodeName}-symbiont-policy
  namespace: chicago-forest-federation
spec:
  podSelector:
    matchLabels:
      app: symbiont-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - ports:
        - port: 42000
          protocol: UDP
        - port: 42001
          protocol: TCP
        - port: 42002
          protocol: UDP
        - port: 8081
          protocol: TCP
  egress:
    - {} # Allow all egress for federation connections
`;
}

/**
 * Generate Symbiont configuration file
 */
export function generateSymbiontConfig(
  options: SymbiontDeploymentOptions
): string {
  const opts = { ...DEFAULT_SYMBIONT_OPTIONS, ...options } as SymbiontDeploymentOptions;

  const termsPresets = {
    conservative: {
      shareBandwidth: true,
      shareStorage: false,
      shareCompute: false,
      maxSharePercentage: 10,
      allowTransit: false,
    },
    balanced: {
      shareBandwidth: true,
      shareStorage: true,
      shareCompute: false,
      maxSharePercentage: 20,
      allowTransit: true,
    },
    permissive: {
      shareBandwidth: true,
      shareStorage: true,
      shareCompute: true,
      maxSharePercentage: 40,
      allowTransit: true,
    },
  };

  const terms = termsPresets[opts.federationTermsPreset];

  return `# Chicago Forest Network - Symbiont Configuration
# Cross-Network Federation Orchestrator
# DISCLAIMER: Theoretical framework - not operational

# Forest Identity
forest:
  id: "${opts.nodeName}"
  name: "${opts.nodeName}"
  region: "auto-detect"

# Gateway Configuration
gateway:
  nodeId: "auto-generated"
  maxConnectionsPerForest: 5
  autoPeering: true

  # Traffic rules (allow by default)
  trafficRules: []

# Discovery Configuration
discovery:
  enabled: ${opts.autoDiscovery}
  interval: ${opts.discoveryInterval}s

  # Discovery mechanisms
  useDHT: true
  useBeacon: true
  useRegistry: true
  usePeerExchange: true

  # Beacon settings
  beaconInterval: 30s

  # DHT settings
  dhtRefreshInterval: 120s
  bootstrapNodes: []

  # Limits
  maxTrackedForests: 1000
  forestTTL: 600s

# Federation Configuration
federation:
  enabled: true
  autoFederate: ${opts.autoFederate}
  minAutoFederateTrust: ${opts.minAutoFederateTrust}
  maxFederations: ${opts.maxFederations}

  # Default terms for new federations
  defaultTerms:
    resourceSharing:
      shareBandwidth: ${terms.shareBandwidth}
      shareStorage: ${terms.shareStorage}
      shareCompute: ${terms.shareCompute}
      maxSharePercentage: ${terms.maxSharePercentage}
      creditExchangeRate: 1.0

    routingPolicy:
      allowTransit: ${terms.allowTransit}
      priority: "normal"
      maxLatency: 500
      reservedBandwidth: 0

    trustRequirements:
      minTrustScore: 0.5
      requiredAttestations: 3
      verificationInterval: 86400s

    disputeResolution: "arbitration"

  # Agreement management
  expiryWarning: 168h # 7 days before expiry
  autoRenew: false

# Health Monitoring
health:
  checkInterval: ${opts.healthCheckInterval}s
  alertThresholds:
    degradedBridgeRatio: 0.3
    minHealthScore: 70

# Initial federations (established on startup)
initialFederations:
${opts.initialFederations?.map(f => `  - "${f}"`).join('\n') || '  []'}

# Bridge Configuration
bridge:
  keepaliveInterval: 30s
  connectionTimeout: 10s
  maxReconnectAttempts: 5
  reconnectDelay: 5s
  metricsEnabled: true
  metricsInterval: 60s

# Logging
logging:
  level: "info"
  format: "json"
  output: "/var/log/symbiont/symbiont.log"
`;
}

// =============================================================================
// EXPORTS
// =============================================================================

// All functions, constants, and types are already exported inline above.
// No additional re-exports needed.
