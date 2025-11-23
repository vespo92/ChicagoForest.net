/**
 * usePeerDiscovery Hook
 *
 * Hook for discovering and managing peer lists.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { useState, useEffect, useCallback } from 'react';
import type { WebRTCPeerManager } from '../peer-manager';
import type { BrowserPeerInfo, WebRTCPeerConnection } from '../types';

export interface UsePeerDiscoveryOptions {
  /** The peer manager instance */
  manager: WebRTCPeerManager | null;
  /** Polling interval for peer discovery in ms */
  pollInterval?: number;
  /** Auto-request peers on connect */
  autoDiscover?: boolean;
}

export interface UsePeerDiscoveryReturn {
  /** List of discovered peers (not yet connected) */
  discoveredPeers: BrowserPeerInfo[];
  /** List of connected peers */
  connectedPeers: WebRTCPeerConnection[];
  /** All known peers (discovered + connected) */
  allPeers: BrowserPeerInfo[];
  /** Whether discovery is in progress */
  isDiscovering: boolean;
  /** Request peer list from connected peers */
  discoverPeers: () => void;
  /** Connect to a discovered peer */
  connectToPeer: (peerId: string) => Promise<WebRTCPeerConnection>;
  /** Refresh the peer lists */
  refresh: () => void;
}

/**
 * Hook for peer discovery
 *
 * @example
 * ```tsx
 * function PeerList({ manager }) {
 *   const {
 *     discoveredPeers,
 *     connectedPeers,
 *     discoverPeers,
 *     connectToPeer,
 *   } = usePeerDiscovery({ manager, autoDiscover: true });
 *
 *   return (
 *     <div>
 *       <h3>Connected ({connectedPeers.length})</h3>
 *       {connectedPeers.map(p => <div key={p.peerId}>{p.peerId}</div>)}
 *
 *       <h3>Available ({discoveredPeers.length})</h3>
 *       {discoveredPeers.map(p => (
 *         <div key={p.peerId}>
 *           {p.peerId}
 *           <button onClick={() => connectToPeer(p.peerId)}>Connect</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePeerDiscovery({
  manager,
  pollInterval = 30000,
  autoDiscover = true,
}: UsePeerDiscoveryOptions): UsePeerDiscoveryReturn {
  const [discoveredPeers, setDiscoveredPeers] = useState<BrowserPeerInfo[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<WebRTCPeerConnection[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Refresh peer lists from manager
  const refresh = useCallback(() => {
    if (manager) {
      setDiscoveredPeers(manager.getDiscoveredPeers());
      setConnectedPeers(manager.getConnectedPeers());
    }
  }, [manager]);

  // Request peer discovery
  const discoverPeers = useCallback(() => {
    if (manager) {
      setIsDiscovering(true);
      manager.requestPeers();
      // Discovery is async, wait a bit then refresh
      setTimeout(() => {
        refresh();
        setIsDiscovering(false);
      }, 2000);
    }
  }, [manager, refresh]);

  // Connect to a discovered peer
  const connectToPeer = useCallback(
    async (peerId: string) => {
      if (!manager) {
        throw new Error('No peer manager available');
      }
      const connection = await manager.connect(peerId);
      refresh();
      return connection;
    },
    [manager, refresh]
  );

  // Set up event listeners
  useEffect(() => {
    if (!manager) return;

    const handlePeerConnected = () => refresh();
    const handlePeerDisconnected = () => refresh();
    const handlePeerDiscovered = () => refresh();

    manager.on('peer:connected', handlePeerConnected);
    manager.on('peer:disconnected', handlePeerDisconnected);
    manager.on('peer:discovered', handlePeerDiscovered);

    // Initial refresh
    refresh();

    return () => {
      manager.off('peer:connected', handlePeerConnected);
      manager.off('peer:disconnected', handlePeerDisconnected);
      manager.off('peer:discovered', handlePeerDiscovered);
    };
  }, [manager, refresh]);

  // Auto-discover on manager ready
  useEffect(() => {
    if (manager && autoDiscover && manager.isConnected) {
      discoverPeers();
    }
  }, [manager?.isConnected, autoDiscover]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for peers periodically
  useEffect(() => {
    if (!manager || !pollInterval) return;

    const interval = setInterval(() => {
      if (manager.isConnected && manager.getConnectedPeers().length > 0) {
        discoverPeers();
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [manager, pollInterval, discoverPeers]);

  // Compute all known peers
  const connectedPeerIds = new Set(connectedPeers.map((p) => p.peerId));
  const allPeers = [
    ...discoveredPeers,
    ...connectedPeers.map((p): BrowserPeerInfo => ({
      peerId: p.peerId,
      nodeId: p.nodeId || p.peerId,
      publicKey: '',
      lastSeen: p.lastActivity || Date.now(),
      reputation: 50,
      capabilities: [],
      metadata: {},
    })),
  ].filter(
    (peer, index, self) =>
      self.findIndex((p) => p.peerId === peer.peerId) === index
  );

  return {
    discoveredPeers: discoveredPeers.filter((p) => !connectedPeerIds.has(p.peerId)),
    connectedPeers,
    allPeers,
    isDiscovering,
    discoverPeers,
    connectToPeer,
    refresh,
  };
}
