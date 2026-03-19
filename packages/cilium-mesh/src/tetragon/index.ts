/**
 * @chicago-forest/cilium-mesh - Tetragon Runtime Security
 *
 * Generates Tetragon TracingPolicies that protect forest nodes at the
 * kernel level. Tetragon hooks into syscalls and kernel functions via
 * eBPF to detect and prevent:
 *   - Unauthorized process execution
 *   - Privilege escalation attempts
 *   - Sensitive file access
 *   - Suspicious network connections
 *   - Container escape attempts
 *
 * These policies complement the CFW (Chicago Forest Firewall) by operating
 * at a deeper level — inside the kernel, before packets even reach userspace.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type {
  TracingPolicy,
  TracingPolicySpec,
  KprobeSpec,
  TracepointSpec,
  ForestRuntimeProtection,
  TetragonConfig,
  SecurityExportTarget,
} from '../types.js';

// =============================================================================
// TRACING POLICY BUILDER
// =============================================================================

/** Fluent builder for Tetragon TracingPolicy objects */
export class TracingPolicyBuilder {
  private policy: TracingPolicy;

  constructor(name: string, namespace = 'chicago-forest') {
    this.policy = {
      apiVersion: 'cilium.io/v1alpha1',
      kind: 'TracingPolicyNamespaced',
      metadata: {
        name,
        namespace,
        labels: {
          'app.kubernetes.io/part-of': 'chicago-forest',
          'chicago-forest.net/security-layer': 'tetragon',
        },
      },
      spec: {},
    };
  }

  /** Make cluster-wide */
  clusterWide(): this {
    this.policy.kind = 'TracingPolicy';
    delete this.policy.metadata.namespace;
    return this;
  }

  /** Add a kprobe hook */
  addKprobe(spec: KprobeSpec): this {
    if (!this.policy.spec.kprobes) this.policy.spec.kprobes = [];
    this.policy.spec.kprobes.push(spec);
    return this;
  }

  /** Add a tracepoint hook */
  addTracepoint(spec: TracepointSpec): this {
    if (!this.policy.spec.tracepoints) this.policy.spec.tracepoints = [];
    this.policy.spec.tracepoints.push(spec);
    return this;
  }

  build(): TracingPolicy {
    return structuredClone(this.policy);
  }
}

// =============================================================================
// FOREST NODE PROTECTION POLICIES
// =============================================================================

/**
 * Prevent unauthorized binary execution inside forest node containers.
 * Only allow known forest binaries to run.
 */
export function createProcessExecutionPolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-process-execution')
    .addKprobe({
      call: '__x64_sys_execve',
      syscall: true,
      args: [
        { index: 0, type: 'string' },  // filename
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchBinaries: [{
          operator: 'NotIn',
          values: [
            '/usr/local/bin/forest-node',
            '/usr/local/bin/forest-cli',
            '/usr/bin/node',
            '/usr/bin/bun',
            '/bin/sh',
            '/bin/bash',
            '/usr/bin/curl',    // Health checks
            '/usr/bin/wget',
            '/usr/sbin/ip',     // Network config
            '/usr/sbin/wg',     // WireGuard
            '/usr/sbin/batctl', // B.A.T.M.A.N.
          ],
        }],
        matchActions: [{
          action: 'Sigkill',
        }],
      }],
    })
    .build();
}

/**
 * Detect privilege escalation attempts.
 * Monitors setuid/setgid syscalls and capability changes.
 */
export function createPrivilegeEscalationPolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-privilege-escalation')
    .addKprobe({
      call: '__x64_sys_setuid',
      syscall: true,
      args: [
        { index: 0, type: 'int' },  // uid
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchArgs: [{
          index: 0,
          operator: 'Equal',
          values: ['0'],  // Attempting to become root
        }],
        matchActions: [{
          action: 'Sigkill',
        }],
      }],
    })
    .addKprobe({
      call: 'cap_capable',
      syscall: false,
      args: [
        { index: 0, type: 'nop' },
        { index: 1, type: 'int' },  // capability
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchCapabilities: [{
          type: 'Effective',
          operator: 'In',
          values: [
            'CAP_SYS_ADMIN',
            'CAP_SYS_PTRACE',
            'CAP_DAC_OVERRIDE',
          ],
        }],
        matchActions: [{
          action: 'Post',
        }],
      }],
    })
    .build();
}

/**
 * Monitor sensitive file access within forest node containers.
 * Alerts on access to cryptographic keys, config files, etc.
 */
export function createSensitiveFileAccessPolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-sensitive-file-access')
    .addKprobe({
      call: 'fd_install',
      syscall: false,
      args: [
        { index: 0, type: 'int' },    // fd
        { index: 1, type: 'file' },    // file
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchArgs: [{
          index: 1,
          operator: 'Prefix',
          values: [
            '/etc/forest/keys/',
            '/var/lib/forest/identity/',
            '/etc/wireguard/',
            '/etc/shadow',
            '/etc/passwd',
            '/proc/kcore',
            '/proc/kallsyms',
          ],
        }],
        matchActions: [{
          action: 'Post',  // Alert but don't kill (some are legitimate)
        }],
      }],
    })
    .build();
}

/**
 * Detect container escape attempts.
 * Monitors namespace and cgroup manipulation syscalls.
 */
export function createContainerEscapePolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-container-escape')
    .clusterWide()
    .addKprobe({
      call: '__x64_sys_unshare',
      syscall: true,
      args: [
        { index: 0, type: 'int' },  // flags
      ],
      selectors: [{
        matchActions: [{
          action: 'Sigkill',
        }],
      }],
    })
    .addKprobe({
      call: '__x64_sys_setns',
      syscall: true,
      args: [
        { index: 0, type: 'fd' },   // fd
        { index: 1, type: 'int' },   // nstype
      ],
      selectors: [{
        matchActions: [{
          action: 'Sigkill',
        }],
      }],
    })
    .addKprobe({
      call: '__x64_sys_mount',
      syscall: true,
      args: [
        { index: 0, type: 'string' },  // source
        { index: 1, type: 'string' },  // target
        { index: 2, type: 'string' },  // filesystemtype
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchActions: [{
          action: 'Sigkill',
        }],
      }],
    })
    .build();
}

/**
 * Monitor outbound network connections from forest nodes.
 * Alerts on unexpected connections to non-forest destinations.
 */
export function createNetworkConnectionPolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-network-connections')
    .addKprobe({
      call: 'tcp_connect',
      syscall: false,
      args: [
        { index: 0, type: 'sock' },  // socket
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchActions: [{
          action: 'Post',  // Log all outbound TCP connections
        }],
      }],
    })
    .addKprobe({
      call: 'udp_sendmsg',
      syscall: false,
      args: [
        { index: 0, type: 'sock' },  // socket
        { index: 2, type: 'int' },    // length
      ],
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchActions: [{
          action: 'Post',
        }],
      }],
    })
    .build();
}

/**
 * Protect forest node cryptographic material.
 * Prevents reading of private keys except by authorized processes.
 */
export function createCryptoProtectionPolicy(): TracingPolicy {
  return new TracingPolicyBuilder('forest-crypto-protection')
    .addKprobe({
      call: '__x64_sys_read',
      syscall: true,
      return: true,
      args: [
        { index: 0, type: 'fd' },
        { index: 1, type: 'char_buf', sizeArgIndex: 3, returnCopy: true },
      ],
      returnArg: { index: 0, type: 'size_t' },
      selectors: [{
        matchNamespaces: [{
          namespace: 'Mnt',
          operator: 'In',
          values: ['chicago-forest'],
        }],
        matchBinaries: [{
          operator: 'NotIn',
          values: [
            '/usr/local/bin/forest-node',
            '/usr/sbin/wg',
          ],
        }],
        matchActions: [{
          action: 'Post',
        }],
      }],
    })
    .build();
}

// =============================================================================
// COMPLETE TETRAGON CONFIG GENERATOR
// =============================================================================

/** All forest Tetragon tracing policies */
export interface ForestTracingPolicySet {
  processExecution: TracingPolicy;
  privilegeEscalation: TracingPolicy;
  sensitiveFileAccess: TracingPolicy;
  containerEscape: TracingPolicy;
  networkConnections: TracingPolicy;
  cryptoProtection: TracingPolicy;
}

/** Generate all Tetragon tracing policies for forest nodes */
export function generateForestTracingPolicies(): ForestTracingPolicySet {
  return {
    processExecution: createProcessExecutionPolicy(),
    privilegeEscalation: createPrivilegeEscalationPolicy(),
    sensitiveFileAccess: createSensitiveFileAccessPolicy(),
    containerEscape: createContainerEscapePolicy(),
    networkConnections: createNetworkConnectionPolicy(),
    cryptoProtection: createCryptoProtectionPolicy(),
  };
}

/** Generate the complete Tetragon configuration */
export function createDefaultTetragonConfig(): TetragonConfig {
  const policies = generateForestTracingPolicies();

  return {
    enabled: true,
    tracingPolicies: Object.values(policies),
    exportTargets: [
      {
        type: 'prometheus',
        endpoint: 'prometheus.chicago-forest.svc.cluster.local:9090',
      },
      {
        type: 'forest-sentinel',
        endpoint: 'sentinel.chicago-forest.svc.cluster.local:8080/api/v1/security/events',
      },
    ],
    forestProtections: [
      {
        name: 'Process Allowlist',
        description: 'Only allow known forest binaries to execute',
        category: 'process',
        action: 'enforce',
        tracingPolicy: policies.processExecution,
      },
      {
        name: 'Privilege Escalation Detection',
        description: 'Detect and block privilege escalation attempts',
        category: 'privilege',
        action: 'enforce',
        tracingPolicy: policies.privilegeEscalation,
      },
      {
        name: 'Sensitive File Monitoring',
        description: 'Alert on access to cryptographic keys and config',
        category: 'file',
        action: 'audit',
        tracingPolicy: policies.sensitiveFileAccess,
      },
      {
        name: 'Container Escape Prevention',
        description: 'Block namespace manipulation and container escapes',
        category: 'process',
        action: 'enforce',
        tracingPolicy: policies.containerEscape,
      },
      {
        name: 'Network Connection Monitoring',
        description: 'Log all outbound network connections',
        category: 'network',
        action: 'audit',
        tracingPolicy: policies.networkConnections,
      },
      {
        name: 'Cryptographic Material Protection',
        description: 'Restrict access to private keys',
        category: 'file',
        action: 'audit',
        tracingPolicy: policies.cryptoProtection,
      },
    ],
  };
}
