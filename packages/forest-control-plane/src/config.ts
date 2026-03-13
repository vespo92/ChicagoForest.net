/**
 * @chicago-forest/forest-control-plane - Configuration
 *
 * Server configuration from environment variables with sensible defaults.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

export interface ForestCPConfig {
  /** HTTP server port */
  port: number;
  /** HTTP server host */
  host: string;
  /** SQLite database file path */
  dbPath: string;
  /** Headscale server URL */
  headscaleUrl: string;
  /** Headscale API key */
  headscaleApiKey: string;
  /** Default Headscale user for pre-auth key creation */
  headscaleUser: string;
  /** Forest control plane public URL (returned in enrollment bundles) */
  publicUrl: string;
  /** Default enrollment token validity in hours */
  enrollmentValidityHours: number;
  /** Node heartbeat timeout in seconds (node considered offline after this) */
  heartbeatTimeoutSec: number;
  /** Bootstrap peer health-check interval in seconds */
  bootstrapCheckIntervalSec: number;
  /** Default mesh configuration */
  mesh: {
    protocol: string;
    interface: string;
    channel: number;
    essid: string;
    band: string;
    mtu: number;
  };
}

function envStr(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined) return fallback;
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

export function loadConfig(): ForestCPConfig {
  return {
    port: envInt('FOREST_CP_PORT', 8090),
    host: envStr('FOREST_CP_HOST', '0.0.0.0'),
    dbPath: envStr('FOREST_CP_DB_PATH', './forest-cp.db'),
    headscaleUrl: envStr('HEADSCALE_URL', 'https://headscale.espoautos.com'),
    headscaleApiKey: envStr('HEADSCALE_API_KEY', ''),
    headscaleUser: envStr('HEADSCALE_USER', 'forest'),
    publicUrl: envStr('FOREST_CP_PUBLIC_URL', 'https://forest-cp.espoautos.com'),
    enrollmentValidityHours: envInt('FOREST_CP_ENROLLMENT_HOURS', 24),
    heartbeatTimeoutSec: envInt('FOREST_CP_HEARTBEAT_TIMEOUT', 120),
    bootstrapCheckIntervalSec: envInt('FOREST_CP_BOOTSTRAP_CHECK_INTERVAL', 60),
    mesh: {
      protocol: envStr('FOREST_MESH_PROTOCOL', 'batman-adv'),
      interface: envStr('FOREST_MESH_INTERFACE', 'wlan0'),
      channel: envInt('FOREST_MESH_CHANNEL', 6),
      essid: envStr('FOREST_MESH_ESSID', 'chicago-forest'),
      band: envStr('FOREST_MESH_BAND', '2.4ghz'),
      mtu: envInt('FOREST_MESH_MTU', 1500),
    },
  };
}
