/**
 * @chicago-forest/cilium-mesh - Custom eBPF Program Definitions
 *
 * Defines custom eBPF programs that extend Cilium's datapath for
 * forest-specific protocol handling. These programs attach at various
 * kernel hook points to provide:
 *
 *   - MNP (Mycelium Network Protocol) header parsing at XDP level
 *   - Geohash-aware routing decisions in the kernel
 *   - Forest zone classification without userspace overhead
 *   - Signal propagation fast-path for gossip protocol
 *   - Nutrient exchange rate limiting at kernel level
 *
 * NOTE: The actual eBPF C programs would be compiled with clang/LLVM
 * and loaded via Cilium's custom program loader. This module provides
 * the TypeScript-side configuration and management.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { ForestEBPFProgram, ForestEBPFMap, EBPFMapConfig } from '../types.js';

// =============================================================================
// CUSTOM EBPF MAP DEFINITIONS
// =============================================================================

/**
 * Forest-specific eBPF maps that extend Cilium's datapath.
 * These maps are shared between kernel eBPF programs and userspace.
 */

/** Maps MNP geohash prefixes to next-hop node IDs for kernel-level routing */
export const MNP_GEOHASH_ROUTE_MAP: ForestEBPFMap = {
  name: 'forest_mnp_geohash_routes',
  type: 'lpm_trie',
  keySize: 8,           // 4 bytes geohash prefix + 4 bytes prefix length
  valueSize: 16,        // 128-bit node ID (next hop)
  maxEntries: 65536,    // Support 64K geohash route entries
  description: 'LPM trie for geohash-based MNP routing at XDP level',
};

/** Maps forest node IDs to their zone classification */
export const NODE_ZONE_MAP: ForestEBPFMap = {
  name: 'forest_node_zones',
  type: 'hash',
  keySize: 16,          // 128-bit node ID
  valueSize: 4,         // Zone enum (wan=0, lan=1, forest=2, etc.)
  maxEntries: 8192,     // Support 8K node zone mappings
  description: 'Node ID to forest zone classification lookup',
};

/** Tracks nutrient exchange sessions for kernel-level rate limiting */
export const EXCHANGE_RATE_MAP: ForestEBPFMap = {
  name: 'forest_exchange_rates',
  type: 'lru_hash',
  keySize: 20,          // 16-byte node ID + 4-byte exchange type
  valueSize: 16,        // 8-byte token count + 8-byte window timestamp
  maxEntries: 16384,
  description: 'Per-node nutrient exchange rate tracking',
};

/** Ring buffer for forest-specific events from eBPF to userspace */
export const FOREST_EVENT_RINGBUF: ForestEBPFMap = {
  name: 'forest_events',
  type: 'ringbuf',
  keySize: 0,
  valueSize: 0,
  maxEntries: 262144,   // 256KB ring buffer
  description: 'Ring buffer for forest eBPF events to userspace',
};

/** Gossip signal deduplication map */
export const SIGNAL_DEDUP_MAP: ForestEBPFMap = {
  name: 'forest_signal_dedup',
  type: 'lru_hash',
  keySize: 32,          // 256-bit signal hash
  valueSize: 8,         // Timestamp of first seen
  maxEntries: 32768,
  description: 'Signal deduplication cache for gossip protocol fast-path',
};

/** All forest eBPF maps */
export function getForestEBPFMaps(): ForestEBPFMap[] {
  return [
    MNP_GEOHASH_ROUTE_MAP,
    NODE_ZONE_MAP,
    EXCHANGE_RATE_MAP,
    FOREST_EVENT_RINGBUF,
    SIGNAL_DEDUP_MAP,
  ];
}

// =============================================================================
// CUSTOM EBPF PROGRAM DEFINITIONS
// =============================================================================

/**
 * XDP program for fast MNP header parsing.
 * Runs at the earliest possible point in the network stack
 * to classify forest protocol traffic before it reaches Cilium's
 * standard datapath.
 */
export const MNP_XDP_PARSER: ForestEBPFProgram = {
  name: 'forest_mnp_xdp',
  attachPoint: 'xdp',
  description: 'XDP-level MNP protocol parser and geohash router',
  source: `
// forest_mnp_xdp.c - XDP program for MNP fast-path
//
// Parses MNP packet headers (256-bit addresses) at XDP level
// for near-zero-latency geohash-based routing decisions.
//
// MNP Header (64 bytes):
//   [version:4][flags:4][geohash:32][nodeId:128][checksum:16]
//   [ttl:8][flowLabel:24][payloadLength:16][nextHeader:8]
//   [sequenceNumber:32][timestamp:64]
//
// Compile: clang -O2 -g -target bpf -c forest_mnp_xdp.c -o forest_mnp_xdp.o

#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/udp.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

#define MNP_PORT 42000
#define MNP_HEADER_SIZE 64
#define MNP_VERSION 7

struct mnp_header {
    __u8  version_flags;    // version:4 | flags:4
    __u32 geohash;          // 32-bit geohash prefix
    __u8  node_id[16];      // 128-bit node ID
    __u16 checksum;         // 16-bit checksum
    __u8  ttl;
    __u32 flow_label: 24;
    __u16 payload_length;
    __u8  next_header;
    __u32 sequence_number;
    __u64 timestamp;
} __attribute__((packed));

struct {
    __uint(type, BPF_MAP_TYPE_LPM_TRIE);
    __uint(max_entries, 65536);
    __type(key, struct lpm_key);
    __type(value, struct route_entry);
    __uint(map_flags, BPF_F_NO_PREALLOC);
} forest_mnp_geohash_routes SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 262144);
} forest_events SEC(".maps");

SEC("xdp")
int forest_mnp_xdp_prog(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    // Parse Ethernet header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    // Only process IPv4
    if (eth->h_proto != bpf_htons(ETH_P_IP))
        return XDP_PASS;

    // Parse IP header
    struct iphdr *iph = (void *)(eth + 1);
    if ((void *)(iph + 1) > data_end)
        return XDP_PASS;

    // Only process UDP
    if (iph->protocol != IPPROTO_UDP)
        return XDP_PASS;

    // Parse UDP header
    struct udphdr *udph = (void *)iph + (iph->ihl * 4);
    if ((void *)(udph + 1) > data_end)
        return XDP_PASS;

    // Check for MNP port
    if (bpf_ntohs(udph->dest) != MNP_PORT)
        return XDP_PASS;

    // Parse MNP header
    struct mnp_header *mnp = (void *)(udph + 1);
    if ((void *)(mnp + 1) > data_end)
        return XDP_PASS;

    // Verify MNP version
    __u8 version = (mnp->version_flags >> 4) & 0x0F;
    if (version != MNP_VERSION)
        return XDP_DROP;  // Drop invalid MNP packets

    // Check TTL
    if (mnp->ttl == 0)
        return XDP_DROP;

    // Geohash-based route lookup
    // ... routing logic using LPM trie ...

    return XDP_PASS;  // Pass to Cilium datapath for further processing
}

char _license[] SEC("license") = "GPL";
`,
};

/**
 * TC (Traffic Control) program for forest zone classification.
 * Runs after Cilium's main datapath to add forest-specific
 * metadata to packet context.
 */
export const ZONE_CLASSIFIER: ForestEBPFProgram = {
  name: 'forest_zone_classifier',
  attachPoint: 'tc-ingress',
  description: 'TC program for forest zone classification and tagging',
  source: `
// forest_zone_classifier.c - TC ingress classifier
//
// Classifies packets by forest zone using the node_zone BPF map.
// Tags packets with zone metadata for Cilium policy evaluation.
//
// Compile: clang -O2 -g -target bpf -c forest_zone_classifier.c -o forest_zone_classifier.o

#include <linux/bpf.h>
#include <linux/pkt_cls.h>
#include <bpf/bpf_helpers.h>

#define ZONE_WAN      0
#define ZONE_LAN      1
#define ZONE_FOREST   2
#define ZONE_DMZ      3
#define ZONE_TRUSTED  4

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 8192);
    __type(key, __u8[16]);     // 128-bit node ID
    __type(value, __u32);      // Zone classification
} forest_node_zones SEC(".maps");

SEC("tc")
int forest_zone_classify(struct __sk_buff *skb) {
    // Extract source identity from Cilium context
    // Lookup zone from forest_node_zones map
    // Set skb->mark with zone classification for policy evaluation
    return TC_ACT_OK;
}

char _license[] SEC("license") = "GPL";
`,
};

/**
 * cgroup/skb program for gossip signal fast-path.
 * Deduplicates gossip signals at the socket level before
 * they reach the application.
 */
export const GOSSIP_FAST_PATH: ForestEBPFProgram = {
  name: 'forest_gossip_fastpath',
  attachPoint: 'cgroup-skb',
  description: 'cgroup/skb program for gossip signal deduplication',
  source: `
// forest_gossip_fastpath.c - Gossip signal deduplication
//
// Deduplicates gossip protocol signals at the socket buffer level.
// Uses an LRU hash map to track recently seen signal IDs and drop
// duplicates before they reach userspace, reducing CPU overhead.
//
// Compile: clang -O2 -g -target bpf -c forest_gossip_fastpath.c -o forest_gossip_fastpath.o

#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

#define GOSSIP_PORT 42001

struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, 32768);
    __type(key, __u8[32]);     // 256-bit signal hash
    __type(value, __u64);      // First-seen timestamp
} forest_signal_dedup SEC(".maps");

SEC("cgroup_skb/ingress")
int forest_gossip_dedup(struct __sk_buff *skb) {
    // Parse UDP payload for gossip signal ID
    // Check dedup map for signal hash
    // If seen: drop (return 0)
    // If new: insert into dedup map, pass (return 1)
    return 1;  // Pass by default
}

char _license[] SEC("license") = "GPL";
`,
};

/**
 * sock_ops program for optimized forest node connections.
 * Enables kernel-level TCP optimizations for forest-to-forest traffic.
 */
export const SOCK_OPS_OPTIMIZER: ForestEBPFProgram = {
  name: 'forest_sock_ops',
  attachPoint: 'sock-ops',
  description: 'sock_ops program for TCP optimization between forest nodes',
  source: `
// forest_sock_ops.c - TCP optimization for forest traffic
//
// Automatically enables TCP optimizations for connections between
// forest nodes: increased window sizes, BBR congestion control,
// and socket-level load balancing.
//
// Compile: clang -O2 -g -target bpf -c forest_sock_ops.c -o forest_sock_ops.o

#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("sockops")
int forest_sock_ops_prog(struct bpf_sock_ops *skops) {
    // On connection establishment between forest nodes:
    // - Set TCP_CONGESTION to bbr
    // - Increase SO_RCVBUF and SO_SNDBUF
    // - Enable TCP_NODELAY for low-latency signaling
    return 1;
}

char _license[] SEC("license") = "GPL";
`,
};

/** Get all custom forest eBPF programs */
export function getForestEBPFPrograms(): ForestEBPFProgram[] {
  return [
    MNP_XDP_PARSER,
    ZONE_CLASSIFIER,
    GOSSIP_FAST_PATH,
    SOCK_OPS_OPTIMIZER,
  ];
}

// =============================================================================
// EBPF MAP CONFIG GENERATOR
// =============================================================================

/** Generate the complete eBPF map configuration for Cilium */
export function createDefaultEBPFMapConfig(): EBPFMapConfig {
  return {
    // Cilium built-in map sizes (tuned for forest workloads)
    ctTableSize: 524288,       // 512K connection tracking entries
    natTableSize: 524288,      // 512K NAT entries
    policyMapSize: 16384,      // 16K policy entries
    neighTableSize: 32768,     // 32K neighbor entries

    // Custom forest maps
    forestMaps: getForestEBPFMaps(),
  };
}
