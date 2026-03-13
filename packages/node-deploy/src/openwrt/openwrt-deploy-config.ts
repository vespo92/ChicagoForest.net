/**
 * OpenWrt deployment configuration generator for Chicago Forest Network nodes.
 *
 * Produces:
 * - UCI defaults script for first-boot configuration (firewall zones, batman-adv,
 *   WireGuard, DHCP, DNS)
 * - procd init script for the forest-node daemon
 * - /etc/forest/config.json with all node settings
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type {
  ForestFirewallConfig,
  FirewallRule,
  FirewallZone,
} from '@chicago-forest/shared-types';

import {
  createDefaultForestRules,
  createForestZoneConfig,
} from '@chicago-forest/firewall';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Forest router configuration for OpenWrt nodes.
 * Combines node identity, network topology, and service settings
 * into a single configuration object for the OpenWrt target.
 */
export interface ForestRouterConfig {
  /** Human-readable node name */
  nodeName: string;
  /** Pre-generated node ID (optional; generated at first boot if omitted) */
  nodeId?: string;

  /** Network interfaces */
  interfaces: {
    /** WAN-facing interface (uplink to internet) */
    wan: string;
    /** LAN-facing interface (local clients) */
    lan: string;
    /** Forest mesh interface (batman-adv / WireGuard) */
    forest: string;
  };

  /** LAN subnet in CIDR notation (default: 192.168.1.0/24) */
  lanSubnet?: string;
  /** Router LAN IP address (default: 192.168.1.1) */
  lanAddress?: string;

  /** Forest mesh network settings */
  mesh: {
    /** batman-adv mesh interface name (default: bat0) */
    batInterface?: string;
    /** batman-adv routing algorithm (default: BATMAN_IV) */
    routingAlgo?: 'BATMAN_IV' | 'BATMAN_V';
    /** Mesh IP address in the forest overlay */
    meshAddress?: string;
    /** Mesh subnet in CIDR notation (default: 10.42.0.0/16) */
    meshSubnet?: string;
  };

  /** WireGuard tunnel settings */
  wireguard: {
    /** WireGuard listen port (default: 51820) */
    listenPort?: number;
    /** Private key (generated at first boot if omitted) */
    privateKey?: string;
    /** Pre-shared key for additional security (optional) */
    presharedKey?: string;
    /** Peers to configure at deploy time */
    peers?: WireGuardPeer[];
  };

  /** DNS settings */
  dns?: {
    /** Upstream DNS servers */
    servers?: string[];
    /** Local domain (default: forest.local) */
    localDomain?: string;
  };

  /** Feature flags */
  features: {
    /** Enable Chicago Forest Firewall rules */
    firewall: boolean;
    /** Enable anonymous routing (onion-style) */
    anonymousRouting: boolean;
    /** Act as a relay for other nodes */
    relay: boolean;
    /** Provide distributed storage */
    storage: boolean;
  };

  /** Bootstrap peers for initial network join */
  bootstrapPeers?: string[];

  /** Storage settings (when features.storage is true) */
  storage?: {
    path?: string;
    limitMB?: number;
  };
}

/**
 * A WireGuard peer entry for static configuration.
 */
export interface WireGuardPeer {
  publicKey: string;
  endpoint?: string;
  allowedIPs: string[];
  persistentKeepalive?: number;
  presharedKey?: string;
}

/**
 * Complete output from the OpenWrt deploy generator.
 */
export interface OpenWrtDeployOutput {
  /** UCI defaults shell script (placed in files/etc/uci-defaults/) */
  uciDefaults: string;
  /** procd init script (placed in files/etc/init.d/) */
  initScript: string;
  /** JSON configuration file (placed in files/etc/forest/) */
  configJson: string;
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_LAN_SUBNET = '192.168.1.0/24';
const DEFAULT_LAN_ADDRESS = '192.168.1.1';
const DEFAULT_MESH_SUBNET = '10.42.0.0/16';
const DEFAULT_BAT_INTERFACE = 'bat0';
const DEFAULT_WG_PORT = 51820;
const DEFAULT_LOCAL_DOMAIN = 'forest.local';
const DEFAULT_DNS_SERVERS = ['1.1.1.1', '9.9.9.9'];
const DEFAULT_STORAGE_PATH = '/var/lib/forest';
const DEFAULT_STORAGE_LIMIT_MB = 512;

// =============================================================================
// GENERATOR
// =============================================================================

/**
 * Generate a complete OpenWrt deployment bundle.
 *
 * Returns UCI defaults script, procd init script, and config.json content
 * ready to be placed into an OpenWrt image builder files/ overlay.
 */
export function generateOpenWrtDeploy(
  config: ForestRouterConfig
): OpenWrtDeployOutput {
  return {
    uciDefaults: generateUciDefaults(config),
    initScript: generateInitScript(config),
    configJson: generateConfigJson(config),
  };
}

// =============================================================================
// UCI DEFAULTS SCRIPT
// =============================================================================

function generateUciDefaults(config: ForestRouterConfig): string {
  const lanAddr = config.lanAddress ?? DEFAULT_LAN_ADDRESS;
  const lanSubnet = config.lanSubnet ?? DEFAULT_LAN_SUBNET;
  const lanNetmask = cidrToNetmask(lanSubnet);
  const meshSubnet = config.mesh.meshSubnet ?? DEFAULT_MESH_SUBNET;
  const batIf = config.mesh.batInterface ?? DEFAULT_BAT_INTERFACE;
  const routingAlgo = config.mesh.routingAlgo ?? 'BATMAN_IV';
  const wgPort = config.wireguard.listenPort ?? DEFAULT_WG_PORT;
  const dnsServers = config.dns?.servers ?? DEFAULT_DNS_SERVERS;
  const localDomain = config.dns?.localDomain ?? DEFAULT_LOCAL_DOMAIN;

  // Build the firewall rules from @chicago-forest/firewall if enabled
  const firewallRulesUci = config.features.firewall
    ? generateFirewallRulesUci(createDefaultForestRules())
    : '';

  return `#!/bin/sh
# Chicago Forest Network - OpenWrt UCI Defaults
# First-boot configuration for node: ${config.nodeName}
# DISCLAIMER: Theoretical framework - not operational
#
# Place in: files/etc/uci-defaults/99-forest-node

# -------------------------------------------------------
# System
# -------------------------------------------------------
uci set system.@system[0].hostname='${config.nodeName}'
uci set system.@system[0].timezone='CST6CDT,M3.2.0,M11.1.0'
uci set system.@system[0].zonename='America/Chicago'
uci commit system

# -------------------------------------------------------
# Network - Loopback
# -------------------------------------------------------
uci set network.loopback=interface
uci set network.loopback.device='lo'
uci set network.loopback.proto='static'
uci set network.loopback.ipaddr='127.0.0.1'
uci set network.loopback.netmask='255.0.0.0'

# -------------------------------------------------------
# Network - WAN
# -------------------------------------------------------
uci set network.wan=interface
uci set network.wan.device='${config.interfaces.wan}'
uci set network.wan.proto='dhcp'

uci set network.wan6=interface
uci set network.wan6.device='${config.interfaces.wan}'
uci set network.wan6.proto='dhcpv6'

# -------------------------------------------------------
# Network - LAN
# -------------------------------------------------------
uci set network.lan=interface
uci set network.lan.device='${config.interfaces.lan}'
uci set network.lan.proto='static'
uci set network.lan.ipaddr='${lanAddr}'
uci set network.lan.netmask='${lanNetmask}'

# -------------------------------------------------------
# Network - BATMAN-adv mesh
# -------------------------------------------------------
uci set network.batmesh=interface
uci set network.batmesh.proto='batadv'
uci set network.batmesh.routing_algo='${routingAlgo}'
uci set network.batmesh.aggregated_ogms='1'
uci set network.batmesh.bridge_loop_avoidance='1'
uci set network.batmesh.distributed_arp_table='1'
uci set network.batmesh.gw_mode='off'

uci set network.forest=interface
uci set network.forest.device='${batIf}'
uci set network.forest.proto='static'
${config.mesh.meshAddress ? `uci set network.forest.ipaddr='${config.mesh.meshAddress}'` : `uci set network.forest.proto='dhcp'`}
${config.mesh.meshAddress ? `uci set network.forest.netmask='${cidrToNetmask(meshSubnet)}'` : ''}

# Hard-mesh the forest interface into batman-adv
uci set network.batmesh_hardif=interface
uci set network.batmesh_hardif.proto='batadv_hardif'
uci set network.batmesh_hardif.master='batmesh'
uci set network.batmesh_hardif.device='${config.interfaces.forest}'
uci set network.batmesh_hardif.mtu='1536'

# -------------------------------------------------------
# Network - WireGuard
# -------------------------------------------------------
uci set network.wg0=interface
uci set network.wg0.proto='wireguard'
uci set network.wg0.listen_port='${wgPort}'
${config.wireguard.privateKey ? `uci set network.wg0.private_key='${config.wireguard.privateKey}'` : "# Private key will be generated at first boot\n# wg genkey | tee /etc/forest/wg-private.key | wg pubkey > /etc/forest/wg-public.key"}
${config.wireguard.peers?.map((peer, i) => generateWireGuardPeerUci(peer, i)).join('\n') ?? ''}

uci commit network

# -------------------------------------------------------
# Firewall - Zones
# -------------------------------------------------------
# Remove default zones and rebuild
while uci -q delete firewall.@zone[0]; do :; done
while uci -q delete firewall.@forwarding[0]; do :; done
while uci -q delete firewall.@rule[0]; do :; done

# Zone: WAN
uci add firewall zone
uci set firewall.@zone[-1].name='wan'
uci set firewall.@zone[-1].input='REJECT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='REJECT'
uci set firewall.@zone[-1].masq='1'
uci set firewall.@zone[-1].mtu_fix='1'
uci add_list firewall.@zone[-1].network='wan'
uci add_list firewall.@zone[-1].network='wan6'

# Zone: LAN
uci add firewall zone
uci set firewall.@zone[-1].name='lan'
uci set firewall.@zone[-1].input='ACCEPT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='ACCEPT'
uci add_list firewall.@zone[-1].network='lan'

# Zone: FOREST
uci add firewall zone
uci set firewall.@zone[-1].name='forest'
uci set firewall.@zone[-1].input='REJECT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='REJECT'
uci add_list firewall.@zone[-1].network='forest'
uci add_list firewall.@zone[-1].network='wg0'

# -------------------------------------------------------
# Firewall - Forwarding
# -------------------------------------------------------
# LAN -> WAN (internet access for local clients)
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='lan'
uci set firewall.@forwarding[-1].dest='wan'

# LAN -> FOREST (local clients can reach the mesh)
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='lan'
uci set firewall.@forwarding[-1].dest='forest'

# FOREST -> LAN (mesh services reachable from LAN)
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='forest'
uci set firewall.@forwarding[-1].dest='lan'

# -------------------------------------------------------
# Firewall - Rules
# -------------------------------------------------------
# Allow ICMP on WAN
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-WAN-ICMP'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].proto='icmp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow ICMP on FOREST
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-Forest-ICMP'
uci set firewall.@rule[-1].src='forest'
uci set firewall.@rule[-1].proto='icmp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow WireGuard on WAN
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-WireGuard'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].dest_port='${wgPort}'
uci set firewall.@rule[-1].proto='udp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow Forest P2P (UDP 42000-43000)
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-Forest-P2P'
uci set firewall.@rule[-1].src='forest'
uci set firewall.@rule[-1].dest_port='42000-43000'
uci set firewall.@rule[-1].proto='udp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow Forest API (TCP 8080)
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-Forest-API'
uci set firewall.@rule[-1].src='forest'
uci set firewall.@rule[-1].dest_port='8080'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow LuCI from LAN
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-LuCI'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].dest_port='80 443'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].target='ACCEPT'

# Allow SSH from LAN
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-SSH'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].dest_port='22'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].target='ACCEPT'
${firewallRulesUci}
uci commit firewall

# -------------------------------------------------------
# DHCP / DNS (dnsmasq)
# -------------------------------------------------------
uci set dhcp.lan.start='100'
uci set dhcp.lan.limit='150'
uci set dhcp.lan.leasetime='12h'

uci set dhcp.@dnsmasq[0].domain='${localDomain}'
uci set dhcp.@dnsmasq[0].local='/${localDomain}/'
uci delete dhcp.@dnsmasq[0].server 2>/dev/null
${dnsServers.map((s) => `uci add_list dhcp.@dnsmasq[0].server='${s}'`).join('\n')}
uci set dhcp.@dnsmasq[0].rebind_protection='0'
uci commit dhcp

# -------------------------------------------------------
# Enable IP forwarding
# -------------------------------------------------------
uci set network.globals.packet_steering='1'
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' >> /etc/sysctl.conf
sysctl -p

# -------------------------------------------------------
# Create directories for forest-node
# -------------------------------------------------------
mkdir -p /etc/forest
mkdir -p ${config.storage?.path ?? DEFAULT_STORAGE_PATH}

${!config.wireguard.privateKey ? `# Generate WireGuard keys if not provided
if [ ! -f /etc/forest/wg-private.key ]; then
  wg genkey | tee /etc/forest/wg-private.key | wg pubkey > /etc/forest/wg-public.key
  chmod 600 /etc/forest/wg-private.key
  uci set network.wg0.private_key="$(cat /etc/forest/wg-private.key)"
  uci commit network
fi` : ''}

# -------------------------------------------------------
# Enable services
# -------------------------------------------------------
/etc/init.d/forest-node enable

exit 0
`;
}

// =============================================================================
// PROCD INIT SCRIPT
// =============================================================================

function generateInitScript(config: ForestRouterConfig): string {
  const storagePath = config.storage?.path ?? DEFAULT_STORAGE_PATH;

  return `#!/bin/sh /etc/rc.common
# Chicago Forest Network - procd init script
# Node: ${config.nodeName}
# DISCLAIMER: Theoretical framework - not operational
#
# Place in: files/etc/init.d/forest-node

USE_PROCD=1
START=99
STOP=10

PROG=/usr/bin/forest-node
CONFIG=/etc/forest/config.json

start_service() {
    mkdir -p ${storagePath}
    mkdir -p /var/log/forest

    procd_open_instance "forest-node"
    procd_set_param command $PROG --config $CONFIG
    procd_set_param respawn 3600 5 5
    procd_set_param stdout 1
    procd_set_param stderr 1
    procd_set_param pidfile /var/run/forest-node.pid
    procd_set_param limits core="unlimited"
    procd_set_param nice -5
    procd_set_param file $CONFIG
    procd_close_instance
}

stop_service() {
    # Graceful shutdown: signal the daemon
    local pid
    pid="$(cat /var/run/forest-node.pid 2>/dev/null)"
    [ -n "$pid" ] && kill -TERM "$pid" 2>/dev/null
}

reload_service() {
    # Reload configuration without full restart
    local pid
    pid="$(cat /var/run/forest-node.pid 2>/dev/null)"
    [ -n "$pid" ] && kill -HUP "$pid" 2>/dev/null
}

service_triggers() {
    procd_add_reload_trigger "forest"
    procd_add_reload_trigger "network"
    procd_add_reload_trigger "firewall"
}
`;
}

// =============================================================================
// CONFIG JSON
// =============================================================================

function generateConfigJson(config: ForestRouterConfig): string {
  const batIf = config.mesh.batInterface ?? DEFAULT_BAT_INTERFACE;
  const meshSubnet = config.mesh.meshSubnet ?? DEFAULT_MESH_SUBNET;
  const wgPort = config.wireguard.listenPort ?? DEFAULT_WG_PORT;
  const dnsServers = config.dns?.servers ?? DEFAULT_DNS_SERVERS;
  const storagePath = config.storage?.path ?? DEFAULT_STORAGE_PATH;
  const storageLimitMB = config.storage?.limitMB ?? DEFAULT_STORAGE_LIMIT_MB;

  // Build the firewall config using the @chicago-forest/firewall defaults
  const zoneSetup = createForestZoneConfig();
  const firewallConfig: ForestFirewallConfig = {
    version: '1.0.0',
    zones: {
      wan: {
        interfaces: [config.interfaces.wan],
        description: 'Traditional Internet (WAN uplink)',
      },
      lan: {
        interfaces: [config.interfaces.lan],
        description: 'Local Area Network',
      },
      forest: {
        interfaces: [config.interfaces.forest, batIf, 'wg0'],
        description: 'Chicago Forest Mesh Network',
      },
    },
    rules: config.features.firewall ? createDefaultForestRules() : [],
    nat: [],
    defaults: {
      inbound: 'drop',
      outbound: 'allow',
      forward: 'drop',
    },
  };

  const configObj = {
    // Metadata
    _disclaimer: 'AI-generated theoretical framework - not operational infrastructure',
    _generator: '@chicago-forest/node-deploy (OpenWrt)',
    _generatedAt: new Date().toISOString(),

    // Node identity
    nodeName: config.nodeName,
    nodeId: config.nodeId ?? null,

    // Interfaces
    interfaces: {
      wan: config.interfaces.wan,
      lan: config.interfaces.lan,
      forest: config.interfaces.forest,
    },

    // LAN
    lan: {
      address: config.lanAddress ?? DEFAULT_LAN_ADDRESS,
      subnet: config.lanSubnet ?? DEFAULT_LAN_SUBNET,
    },

    // Mesh
    mesh: {
      protocol: 'batman-adv',
      batInterface: batIf,
      routingAlgo: config.mesh.routingAlgo ?? 'BATMAN_IV',
      meshAddress: config.mesh.meshAddress ?? null,
      meshSubnet,
    },

    // WireGuard
    wireguard: {
      listenPort: wgPort,
      peers: config.wireguard.peers ?? [],
    },

    // DNS
    dns: {
      servers: dnsServers,
      localDomain: config.dns?.localDomain ?? DEFAULT_LOCAL_DOMAIN,
    },

    // Features
    features: {
      firewall: config.features.firewall,
      anonymousRouting: config.features.anonymousRouting,
      relay: config.features.relay,
      storage: config.features.storage,
    },

    // Storage
    storage: {
      enabled: config.features.storage,
      path: storagePath,
      limitMB: storageLimitMB,
    },

    // Bootstrap
    bootstrapPeers: config.bootstrapPeers ?? [],

    // Firewall
    firewall: firewallConfig,
  };

  return JSON.stringify(configObj, null, 2);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate UCI commands for a single WireGuard peer.
 */
function generateWireGuardPeerUci(peer: WireGuardPeer, index: number): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`# WireGuard peer ${index}`);
  lines.push(`uci add network wireguard_wg0`);
  lines.push(`uci set network.@wireguard_wg0[-1].public_key='${peer.publicKey}'`);
  if (peer.endpoint) {
    lines.push(`uci set network.@wireguard_wg0[-1].endpoint_host='${peer.endpoint.split(':')[0]}'`);
    lines.push(`uci set network.@wireguard_wg0[-1].endpoint_port='${peer.endpoint.split(':')[1] ?? DEFAULT_WG_PORT}'`);
  }
  for (const ip of peer.allowedIPs) {
    lines.push(`uci add_list network.@wireguard_wg0[-1].allowed_ips='${ip}'`);
  }
  if (peer.persistentKeepalive) {
    lines.push(`uci set network.@wireguard_wg0[-1].persistent_keepalive='${peer.persistentKeepalive}'`);
  }
  if (peer.presharedKey) {
    lines.push(`uci set network.@wireguard_wg0[-1].preshared_key='${peer.presharedKey}'`);
  }
  lines.push(`uci set network.@wireguard_wg0[-1].route_allowed_ips='1'`);
  return lines.join('\n');
}

/**
 * Generate UCI firewall rule commands from Chicago Forest Firewall rules.
 */
function generateFirewallRulesUci(rules: FirewallRule[]): string {
  const lines: string[] = [''];
  lines.push('# Chicago Forest Firewall rules (from @chicago-forest/firewall)');

  for (const rule of rules) {
    if (!rule.enabled) continue;
    // Skip rules already covered by the static UCI rules above
    if (rule.id === 'allow-established' || rule.id === 'default-deny-in') continue;

    lines.push('');
    lines.push(`# ${rule.name}`);
    lines.push(`uci add firewall rule`);
    lines.push(`uci set firewall.@rule[-1].name='CFW-${rule.id}'`);

    // Map source zone
    if (rule.sourceZone) {
      lines.push(`uci set firewall.@rule[-1].src='${rule.sourceZone}'`);
    }

    // Map destination zone
    if (rule.destZone) {
      lines.push(`uci set firewall.@rule[-1].dest='${rule.destZone}'`);
    }

    // Protocol
    if (rule.protocol && rule.protocol !== 'any') {
      lines.push(`uci set firewall.@rule[-1].proto='${rule.protocol}'`);
    }

    // Destination port
    if (rule.destPort) {
      lines.push(`uci set firewall.@rule[-1].dest_port='${rule.destPort}'`);
    }

    // Source address
    if (rule.sourceAddress && rule.sourceAddress !== 'any') {
      lines.push(`uci set firewall.@rule[-1].src_ip='${rule.sourceAddress}'`);
    }

    // Destination address
    if (rule.destAddress && rule.destAddress !== 'any') {
      lines.push(`uci set firewall.@rule[-1].dest_ip='${rule.destAddress}'`);
    }

    // Action mapping: allow->ACCEPT, deny/drop->DROP, reject->REJECT
    const targetMap: Record<string, string> = {
      allow: 'ACCEPT',
      deny: 'DROP',
      drop: 'DROP',
      reject: 'REJECT',
    };
    lines.push(`uci set firewall.@rule[-1].target='${targetMap[rule.action] ?? 'DROP'}'`);

    // Logging
    if (rule.logging) {
      lines.push(`uci set firewall.@rule[-1].log='1'`);
    }
  }

  return lines.join('\n');
}

/**
 * Convert a CIDR subnet string to a dotted-quad netmask.
 */
function cidrToNetmask(cidr: string): string {
  const prefixLength = parseInt(cidr.split('/')[1] ?? '24', 10);
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;
  return [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff,
  ].join('.');
}
