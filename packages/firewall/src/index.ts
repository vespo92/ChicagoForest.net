/**
 * @chicago-forest/firewall
 *
 * Chicago Forest Firewall (CFW) - Custom firewall engine with
 * OPNsense, pfSense, and native nftables/iptables integration.
 *
 * Designed for two-port configuration:
 * - Port 1 (WAN): Traditional internet connection (optional)
 * - Port 2 (FOREST): Chicago Forest Network connection
 *
 * Users run this on VMs, Docker containers, or Kubernetes pods
 * with NIC passthrough for maximum isolation.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   ChicagoForestFirewall,
 *   createForestZoneConfig,
 *   generateOPNsenseConfig,
 * } from '@chicago-forest/firewall';
 *
 * const firewall = new ChicagoForestFirewall({
 *   zones: createForestZoneConfig(),
 * });
 *
 * // Add rules
 * firewall.addRule({
 *   id: 'allow-forest-inbound',
 *   name: 'Allow Forest Traffic',
 *   direction: 'in',
 *   sourceZone: 'forest',
 *   action: 'allow',
 * });
 *
 * // Generate OPNsense config
 * const opnConfig = generateOPNsenseConfig(firewall.getConfig());
 * ```
 */

import type {
  FirewallRule,
  FirewallAction,
  FirewallDirection,
  FirewallZone,
  ForestFirewallConfig,
  NatRule,
} from '@chicago-forest/shared-types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Zone configuration with interface mappings
 */
export interface ZoneConfig {
  interfaces: string[];
  description: string;
  defaultPolicy: FirewallAction;
}

/**
 * Complete firewall zone setup
 */
export type ZoneSetup = {
  [K in FirewallZone]?: ZoneConfig;
};

/**
 * Create default zone configuration for Forest network
 * Two-port setup: WAN (optional internet) + FOREST (Chicago Forest)
 */
export function createForestZoneConfig(): ZoneSetup {
  return {
    wan: {
      interfaces: ['eth0'],
      description: 'Traditional Internet (optional)',
      defaultPolicy: 'drop',
    },
    forest: {
      interfaces: ['eth1'],
      description: 'Chicago Forest Network',
      defaultPolicy: 'drop',
    },
    lan: {
      interfaces: ['eth2'],
      description: 'Local Area Network',
      defaultPolicy: 'allow',
    },
    trusted: {
      interfaces: [],
      description: 'Trusted internal services',
      defaultPolicy: 'allow',
    },
  };
}

// =============================================================================
// RULE BUILDER
// =============================================================================

/**
 * Fluent rule builder for creating firewall rules
 */
export class RuleBuilder {
  private rule: Partial<FirewallRule> = {
    enabled: true,
    logging: false,
  };

  static create(id: string): RuleBuilder {
    const builder = new RuleBuilder();
    builder.rule.id = id;
    return builder;
  }

  name(name: string): this {
    this.rule.name = name;
    return this;
  }

  priority(priority: number): this {
    this.rule.priority = priority;
    return this;
  }

  direction(direction: FirewallDirection): this {
    this.rule.direction = direction;
    return this;
  }

  fromZone(zone: FirewallZone): this {
    this.rule.sourceZone = zone;
    return this;
  }

  toZone(zone: FirewallZone): this {
    this.rule.destZone = zone;
    return this;
  }

  source(address: string, port?: string): this {
    this.rule.sourceAddress = address;
    this.rule.sourcePort = port;
    return this;
  }

  destination(address: string, port?: string): this {
    this.rule.destAddress = address;
    this.rule.destPort = port;
    return this;
  }

  protocol(proto: 'tcp' | 'udp' | 'icmp' | 'any'): this {
    this.rule.protocol = proto;
    return this;
  }

  action(action: FirewallAction): this {
    this.rule.action = action;
    return this;
  }

  allow(): this {
    return this.action('allow');
  }

  deny(): this {
    return this.action('deny');
  }

  drop(): this {
    return this.action('drop');
  }

  log(): this {
    this.rule.logging = true;
    return this;
  }

  rateLimit(requests: number, period: number): this {
    this.rule.rateLimit = { requests, period };
    return this;
  }

  disable(): this {
    this.rule.enabled = false;
    return this;
  }

  build(): FirewallRule {
    if (!this.rule.id) throw new Error('Rule ID is required');
    if (!this.rule.direction) throw new Error('Rule direction is required');
    if (!this.rule.action) throw new Error('Rule action is required');

    return {
      id: this.rule.id,
      name: this.rule.name || this.rule.id,
      enabled: this.rule.enabled!,
      priority: this.rule.priority ?? 100,
      direction: this.rule.direction,
      sourceZone: this.rule.sourceZone,
      destZone: this.rule.destZone,
      sourceAddress: this.rule.sourceAddress,
      destAddress: this.rule.destAddress,
      sourcePort: this.rule.sourcePort,
      destPort: this.rule.destPort,
      protocol: this.rule.protocol,
      action: this.rule.action,
      logging: this.rule.logging!,
      rateLimit: this.rule.rateLimit,
    };
  }
}

// =============================================================================
// PREDEFINED RULES
// =============================================================================

/**
 * Default rules for Chicago Forest Network
 */
export function createDefaultForestRules(): FirewallRule[] {
  return [
    // Allow established connections
    RuleBuilder.create('allow-established')
      .name('Allow Established Connections')
      .priority(1000)
      .direction('in')
      .action('allow')
      .build(),

    // Allow ICMP (ping)
    RuleBuilder.create('allow-icmp')
      .name('Allow ICMP')
      .priority(900)
      .direction('in')
      .protocol('icmp')
      .allow()
      .build(),

    // Allow Forest P2P traffic
    RuleBuilder.create('allow-forest-p2p')
      .name('Allow Forest P2P')
      .priority(800)
      .direction('in')
      .fromZone('forest')
      .destination('any', '42000-43000')
      .protocol('udp')
      .allow()
      .build(),

    // Allow WireGuard traffic
    RuleBuilder.create('allow-wireguard')
      .name('Allow WireGuard')
      .priority(700)
      .direction('in')
      .destination('any', '51820')
      .protocol('udp')
      .allow()
      .build(),

    // Rate limit new connections from Forest
    RuleBuilder.create('ratelimit-forest-new')
      .name('Rate Limit Forest New Connections')
      .priority(600)
      .direction('in')
      .fromZone('forest')
      .rateLimit(100, 60) // 100 new connections per minute
      .allow()
      .build(),

    // Block invalid packets
    RuleBuilder.create('drop-invalid')
      .name('Drop Invalid Packets')
      .priority(500)
      .direction('in')
      .drop()
      .log()
      .build(),

    // Allow outbound from LAN to Forest
    RuleBuilder.create('allow-lan-to-forest')
      .name('Allow LAN to Forest')
      .priority(400)
      .direction('forward')
      .fromZone('lan')
      .toZone('forest')
      .allow()
      .build(),

    // Default deny inbound
    RuleBuilder.create('default-deny-in')
      .name('Default Deny Inbound')
      .priority(0)
      .direction('in')
      .drop()
      .log()
      .build(),
  ];
}

// =============================================================================
// FIREWALL ENGINE
// =============================================================================

/**
 * Connection tracking entry
 */
interface ConnectionEntry {
  srcAddr: string;
  srcPort: number;
  dstAddr: string;
  dstPort: number;
  protocol: string;
  state: 'new' | 'established' | 'related' | 'invalid';
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  createdAt: number;
  lastSeen: number;
  timeout: number;
}

/**
 * Rate limit tracker
 */
interface RateLimitEntry {
  ruleId: string;
  sourceAddr: string;
  count: number;
  windowStart: number;
}

/**
 * Chicago Forest Firewall engine
 */
export class ChicagoForestFirewall {
  private config: ForestFirewallConfig;
  private zones: ZoneSetup;
  private connectionTable: Map<string, ConnectionEntry> = new Map();
  private rateLimitTable: Map<string, RateLimitEntry> = new Map();
  private ruleMatchCount: Map<string, number> = new Map();
  private isRunning = false;

  constructor(options: {
    zones?: ZoneSetup;
    rules?: FirewallRule[];
    nat?: NatRule[];
  } = {}) {
    this.zones = options.zones ?? createForestZoneConfig();
    this.config = {
      version: '1.0.0',
      zones: {},
      rules: options.rules ?? createDefaultForestRules(),
      nat: options.nat ?? [],
      defaults: {
        inbound: 'drop',
        outbound: 'allow',
        forward: 'drop',
      },
    };

    // Convert zones to config format
    for (const [zone, cfg] of Object.entries(this.zones)) {
      if (cfg) {
        this.config.zones[zone as FirewallZone] = {
          interfaces: cfg.interfaces,
          description: cfg.description,
        };
      }
    }

    // Sort rules by priority (higher first)
    this.config.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Start the firewall
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    // In production: Apply rules to kernel (nftables/iptables)
    this.isRunning = true;
  }

  /**
   * Stop the firewall
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    // In production: Remove rules from kernel
    this.isRunning = false;
  }

  /**
   * Add a firewall rule
   */
  addRule(rule: FirewallRule): void {
    // Remove existing rule with same ID
    this.config.rules = this.config.rules.filter((r) => r.id !== rule.id);
    this.config.rules.push(rule);
    this.config.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string): void {
    this.config.rules = this.config.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * Get a rule by ID
   */
  getRule(ruleId: string): FirewallRule | null {
    return this.config.rules.find((r) => r.id === ruleId) ?? null;
  }

  /**
   * Get all rules
   */
  getRules(): FirewallRule[] {
    return [...this.config.rules];
  }

  /**
   * Add NAT rule
   */
  addNatRule(rule: NatRule): void {
    this.config.nat = this.config.nat.filter((r) => r.id !== rule.id);
    this.config.nat.push(rule);
  }

  /**
   * Get configuration
   */
  getConfig(): ForestFirewallConfig {
    return { ...this.config };
  }

  /**
   * Evaluate a packet against firewall rules
   */
  evaluate(packet: PacketInfo): FirewallDecision {
    // Check connection table first (stateful)
    const connKey = this.getConnectionKey(packet);
    const conn = this.connectionTable.get(connKey);

    if (conn && conn.state === 'established') {
      return {
        action: 'allow',
        reason: 'Established connection',
        ruleId: 'implicit-established',
      };
    }

    // Evaluate rules in priority order
    for (const rule of this.config.rules) {
      if (!rule.enabled) continue;

      if (this.matchesRule(packet, rule)) {
        // Check rate limit
        if (rule.rateLimit) {
          if (this.isRateLimited(rule, packet.srcAddr)) {
            return {
              action: 'drop',
              reason: 'Rate limited',
              ruleId: rule.id,
            };
          }
          this.updateRateLimit(rule, packet.srcAddr);
        }

        // Update stats
        this.ruleMatchCount.set(
          rule.id,
          (this.ruleMatchCount.get(rule.id) ?? 0) + 1
        );

        return {
          action: rule.action,
          reason: rule.name,
          ruleId: rule.id,
          logging: rule.logging,
        };
      }
    }

    // Default action based on direction
    const defaultAction = this.config.defaults[packet.direction] || 'drop';
    return {
      action: defaultAction,
      reason: 'Default policy',
      ruleId: 'default',
    };
  }

  /**
   * Check if packet matches rule
   */
  private matchesRule(packet: PacketInfo, rule: FirewallRule): boolean {
    // Check direction
    if (rule.direction !== packet.direction) return false;

    // Check zones
    if (rule.sourceZone && packet.srcZone !== rule.sourceZone) return false;
    if (rule.destZone && packet.dstZone !== rule.destZone) return false;

    // Check addresses
    if (rule.sourceAddress && !this.matchesAddress(packet.srcAddr, rule.sourceAddress)) {
      return false;
    }
    if (rule.destAddress && !this.matchesAddress(packet.dstAddr, rule.destAddress)) {
      return false;
    }

    // Check ports
    if (rule.sourcePort && !this.matchesPort(packet.srcPort, rule.sourcePort)) {
      return false;
    }
    if (rule.destPort && !this.matchesPort(packet.dstPort, rule.destPort)) {
      return false;
    }

    // Check protocol
    if (rule.protocol && rule.protocol !== 'any' && packet.protocol !== rule.protocol) {
      return false;
    }

    return true;
  }

  /**
   * Match IP address against pattern
   */
  private matchesAddress(ip: string, pattern: string): boolean {
    if (pattern === 'any') return true;
    if (pattern === ip) return true;

    // CIDR matching
    if (pattern.includes('/')) {
      // Simplified - in production use proper IP math
      const [network] = pattern.split('/');
      return ip.startsWith(network.split('.').slice(0, 3).join('.'));
    }

    return false;
  }

  /**
   * Match port against pattern
   */
  private matchesPort(port: number | undefined, pattern: string): boolean {
    if (pattern === 'any') return true;
    if (port === undefined) return false;

    // Range matching
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number);
      return port >= start && port <= end;
    }

    // Multiple ports
    if (pattern.includes(',')) {
      return pattern.split(',').map(Number).includes(port);
    }

    return port === parseInt(pattern);
  }

  /**
   * Get connection table key
   */
  private getConnectionKey(packet: PacketInfo): string {
    return `${packet.protocol}:${packet.srcAddr}:${packet.srcPort}:${packet.dstAddr}:${packet.dstPort}`;
  }

  /**
   * Check rate limit
   */
  private isRateLimited(rule: FirewallRule, srcAddr: string): boolean {
    if (!rule.rateLimit) return false;

    const key = `${rule.id}:${srcAddr}`;
    const entry = this.rateLimitTable.get(key);

    if (!entry) return false;

    const now = Date.now();
    if (now - entry.windowStart > rule.rateLimit.period * 1000) {
      // Window expired
      return false;
    }

    return entry.count >= rule.rateLimit.requests;
  }

  /**
   * Update rate limit counter
   */
  private updateRateLimit(rule: FirewallRule, srcAddr: string): void {
    if (!rule.rateLimit) return;

    const key = `${rule.id}:${srcAddr}`;
    const now = Date.now();
    const entry = this.rateLimitTable.get(key);

    if (!entry || now - entry.windowStart > rule.rateLimit.period * 1000) {
      // New window
      this.rateLimitTable.set(key, {
        ruleId: rule.id,
        sourceAddr: srcAddr,
        count: 1,
        windowStart: now,
      });
    } else {
      entry.count++;
    }
  }

  /**
   * Get rule statistics
   */
  getRuleStats(): Map<string, number> {
    return new Map(this.ruleMatchCount);
  }

  /**
   * Get connection table size
   */
  getConnectionCount(): number {
    return this.connectionTable.size;
  }
}

/**
 * Packet information for firewall evaluation
 */
export interface PacketInfo {
  srcAddr: string;
  srcPort?: number;
  dstAddr: string;
  dstPort?: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  direction: FirewallDirection;
  srcZone?: FirewallZone;
  dstZone?: FirewallZone;
  length: number;
}

/**
 * Firewall decision
 */
export interface FirewallDecision {
  action: FirewallAction;
  reason: string;
  ruleId: string;
  logging?: boolean;
}

// =============================================================================
// CONFIGURATION GENERATORS
// =============================================================================

/**
 * Generate OPNsense-compatible configuration XML
 */
export function generateOPNsenseConfig(config: ForestFirewallConfig): string {
  let xml = '<?xml version="1.0"?>\n<opnsense>\n';
  xml += '  <filter>\n';

  for (const rule of config.rules) {
    if (!rule.enabled) continue;

    xml += '    <rule>\n';
    xml += `      <id>${rule.id}</id>\n`;
    xml += `      <type>${rule.action === 'allow' ? 'pass' : 'block'}</type>\n`;
    xml += `      <interface>${rule.sourceZone || 'any'}</interface>\n`;
    xml += `      <ipprotocol>inet</ipprotocol>\n`;
    xml += `      <protocol>${rule.protocol || 'any'}</protocol>\n`;

    if (rule.sourceAddress) {
      xml += `      <source><address>${rule.sourceAddress}</address></source>\n`;
    }
    if (rule.destAddress) {
      xml += `      <destination><address>${rule.destAddress}</address></destination>\n`;
    }
    if (rule.destPort) {
      xml += `      <destination><port>${rule.destPort}</port></destination>\n`;
    }

    xml += `      <log>${rule.logging ? '1' : '0'}</log>\n`;
    xml += `      <descr>${rule.name}</descr>\n`;
    xml += '    </rule>\n';
  }

  xml += '  </filter>\n';
  xml += '</opnsense>\n';
  return xml;
}

/**
 * Generate nftables configuration
 */
export function generateNftablesConfig(config: ForestFirewallConfig): string {
  let nft = '#!/usr/sbin/nft -f\n\n';
  nft += '# Chicago Forest Firewall - nftables configuration\n';
  nft += '# Auto-generated - do not edit manually\n\n';

  nft += 'flush ruleset\n\n';

  nft += 'table inet chicago_forest {\n';

  // Chains
  nft += '  chain input {\n';
  nft += '    type filter hook input priority 0; policy drop;\n';
  nft += '    ct state established,related accept\n';
  nft += '    ct state invalid drop\n';

  for (const rule of config.rules.filter((r) => r.direction === 'in' && r.enabled)) {
    nft += `    ${generateNftRule(rule)}\n`;
  }

  nft += '  }\n\n';

  nft += '  chain forward {\n';
  nft += '    type filter hook forward priority 0; policy drop;\n';
  nft += '    ct state established,related accept\n';

  for (const rule of config.rules.filter((r) => r.direction === 'forward' && r.enabled)) {
    nft += `    ${generateNftRule(rule)}\n`;
  }

  nft += '  }\n\n';

  nft += '  chain output {\n';
  nft += '    type filter hook output priority 0; policy accept;\n';

  for (const rule of config.rules.filter((r) => r.direction === 'out' && r.enabled)) {
    nft += `    ${generateNftRule(rule)}\n`;
  }

  nft += '  }\n';
  nft += '}\n';

  return nft;
}

/**
 * Generate a single nftables rule
 */
function generateNftRule(rule: FirewallRule): string {
  const parts: string[] = [];

  // Add comment
  parts.push(`# ${rule.name}`);

  // Protocol
  if (rule.protocol && rule.protocol !== 'any') {
    parts.push(rule.protocol);
  }

  // Source
  if (rule.sourceAddress && rule.sourceAddress !== 'any') {
    parts.push(`ip saddr ${rule.sourceAddress}`);
  }
  if (rule.sourcePort) {
    parts.push(`sport ${rule.sourcePort}`);
  }

  // Destination
  if (rule.destAddress && rule.destAddress !== 'any') {
    parts.push(`ip daddr ${rule.destAddress}`);
  }
  if (rule.destPort) {
    parts.push(`dport ${rule.destPort}`);
  }

  // Rate limit
  if (rule.rateLimit) {
    parts.push(`limit rate ${rule.rateLimit.requests}/${rule.rateLimit.period}s`);
  }

  // Logging
  if (rule.logging) {
    parts.push(`log prefix "[CFW:${rule.id}] "`);
  }

  // Action
  switch (rule.action) {
    case 'allow':
      parts.push('accept');
      break;
    case 'deny':
    case 'drop':
      parts.push('drop');
      break;
    case 'reject':
      parts.push('reject');
      break;
  }

  return parts.join(' ');
}

/**
 * Generate iptables configuration (legacy)
 */
export function generateIptablesConfig(config: ForestFirewallConfig): string {
  let ipt = '#!/bin/bash\n\n';
  ipt += '# Chicago Forest Firewall - iptables configuration\n';
  ipt += '# Auto-generated - do not edit manually\n\n';

  ipt += '# Flush existing rules\n';
  ipt += 'iptables -F\n';
  ipt += 'iptables -X\n\n';

  ipt += '# Default policies\n';
  ipt += 'iptables -P INPUT DROP\n';
  ipt += 'iptables -P FORWARD DROP\n';
  ipt += 'iptables -P OUTPUT ACCEPT\n\n';

  ipt += '# Allow established connections\n';
  ipt += 'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n';
  ipt += 'iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT\n\n';

  ipt += '# Custom rules\n';
  for (const rule of config.rules.filter((r) => r.enabled)) {
    ipt += generateIptablesRule(rule) + '\n';
  }

  return ipt;
}

/**
 * Generate a single iptables rule
 */
function generateIptablesRule(rule: FirewallRule): string {
  const chain = rule.direction === 'in' ? 'INPUT' :
    rule.direction === 'out' ? 'OUTPUT' : 'FORWARD';

  const parts = [`iptables -A ${chain}`];

  // Protocol
  if (rule.protocol && rule.protocol !== 'any') {
    parts.push(`-p ${rule.protocol}`);
  }

  // Source
  if (rule.sourceAddress && rule.sourceAddress !== 'any') {
    parts.push(`-s ${rule.sourceAddress}`);
  }
  if (rule.sourcePort) {
    parts.push(`--sport ${rule.sourcePort}`);
  }

  // Destination
  if (rule.destAddress && rule.destAddress !== 'any') {
    parts.push(`-d ${rule.destAddress}`);
  }
  if (rule.destPort) {
    parts.push(`--dport ${rule.destPort}`);
  }

  // Rate limit
  if (rule.rateLimit) {
    parts.push(`-m limit --limit ${rule.rateLimit.requests}/${rule.rateLimit.period === 60 ? 'minute' : 'second'}`);
  }

  // Logging
  if (rule.logging) {
    // Need separate logging rule
    const logRule = [...parts, `-j LOG --log-prefix "[CFW:${rule.id}] "`].join(' ');
    parts.push(`-j ${rule.action === 'allow' ? 'ACCEPT' : 'DROP'}`);
    return `${logRule}\n${parts.join(' ')}`;
  }

  // Action
  parts.push(`-j ${rule.action === 'allow' ? 'ACCEPT' : 'DROP'}`);

  return `# ${rule.name}\n${parts.join(' ')}`;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  createForestZoneConfig,
  createDefaultForestRules,
  RuleBuilder,
  ChicagoForestFirewall,
  generateOPNsenseConfig,
  generateNftablesConfig,
  generateIptablesConfig,
};

export type {
  ZoneConfig,
  ZoneSetup,
  PacketInfo,
  FirewallDecision,
};
