/**
 * OpenWrt package lists for Chicago Forest Network nodes.
 *
 * Defines the required packages for different OpenWrt release versions,
 * accounting for kernel-level changes, removed packages, and feed availability.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

// =============================================================================
// PACKAGE LISTS
// =============================================================================

/**
 * Supported OpenWrt versions
 */
export type OpenWrtVersion = '23.05.5' | '24.10.5';

/**
 * Package list for OpenWrt 23.05.5
 *
 * Notes:
 * - kmod-wireguard required (not in-kernel yet)
 * - luci-app-wireguard available in core feeds
 * - luci-proto-wireguard for netifd integration
 * - tailscale available in community packages feed
 * - mtr-json variant available
 */
export const OPENWRT_23_05_5_PACKAGES: string[] = [
  // LuCI web interface
  'luci',
  'luci-ssl',

  // WireGuard VPN
  'wireguard-tools',
  'kmod-wireguard',
  'luci-proto-wireguard',
  'luci-app-wireguard',
  'qrencode',

  // BATMAN-adv mesh routing
  'kmod-batman-adv',
  'batctl-default',

  // Tailscale overlay network
  'tailscale',

  // Runtime environment
  'nodejs',

  // Utilities
  'curl',
  'jq',
  'nano',
  'htop',
  'tcpdump',
  'iperf3',
  'mtr-json',
  'bind-dig',
];

/**
 * Package list for OpenWrt 24.10.5
 *
 * Notes:
 * - kmod-wireguard NOT needed (WireGuard is in-kernel since 24.x)
 * - luci-app-wireguard removed from core feeds
 * - luci-proto-wireguard still handles netifd integration
 * - tailscale NOT included (community-feed only, must be added separately)
 * - mtr replaces mtr-json (variant removed)
 */
export const OPENWRT_24_10_5_PACKAGES: string[] = [
  // LuCI web interface
  'luci',
  'luci-ssl',

  // WireGuard VPN (in-kernel, no kmod needed)
  'wireguard-tools',
  'qrencode',

  // BATMAN-adv mesh routing
  'kmod-batman-adv',
  'batctl-default',

  // Utilities
  'curl',
  'jq',
  'nano',
  'htop',
  'tcpdump',
  'iperf3',
  'mtr',
  'bind-dig',
];

/**
 * Get the package list for a given OpenWrt version.
 */
export function getPackagesForVersion(version: OpenWrtVersion): string[] {
  switch (version) {
    case '23.05.5':
      return [...OPENWRT_23_05_5_PACKAGES];
    case '24.10.5':
      return [...OPENWRT_24_10_5_PACKAGES];
    default:
      throw new Error(`Unsupported OpenWrt version: ${version}`);
  }
}

/**
 * Common base packages shared across all versions.
 */
export const OPENWRT_BASE_PACKAGES: string[] = [
  'luci',
  'luci-ssl',
  'wireguard-tools',
  'qrencode',
  'kmod-batman-adv',
  'batctl-default',
  'curl',
  'jq',
  'nano',
  'htop',
  'tcpdump',
  'iperf3',
  'bind-dig',
];
