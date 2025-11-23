/**
 * useWebRTC Hook
 *
 * Main hook for WebRTC browser P2P networking.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCPeerManager, createPeerManager } from '../peer-manager';
import type {
  WebRTCConfig,
  WebRTCPeerConnection,
  WebRTCStats,
  BrowserPeerInfo,
  WebRTCEventDataMap,
} from '../types';

export interface UseWebRTCOptions extends WebRTCConfig {
  /** Auto-connect on mount */
  autoConnect?: boolean;
}

export interface UseWebRTCReturn {
  /** Local peer ID */
  peerId: string | null;
  /** Whether connected to signaling server */
  isConnected: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Connection error if any */
  error: Error | null;
  /** List of connected peers */
  connectedPeers: WebRTCPeerConnection[];
  /** List of discovered peers */
  discoveredPeers: BrowserPeerInfo[];
  /** Network statistics */
  stats: WebRTCStats | null;
  /** Connect to signaling server */
  connect: () => Promise<void>;
  /** Disconnect from signaling server */
  disconnect: () => void;
  /** Connect to a specific peer */
  connectToPeer: (peerId: string) => Promise<WebRTCPeerConnection>;
  /** Disconnect from a specific peer */
  disconnectFromPeer: (peerId: string) => void;
  /** Send message to a peer */
  sendMessage: (peerId: string, data: unknown) => void;
  /** Broadcast message to all peers */
  broadcast: (data: unknown) => void;
  /** Request peer discovery */
  requestPeers: () => void;
  /** Measure latency to a peer */
  measureLatency: (peerId: string) => Promise<number>;
  /** The underlying peer manager instance */
  manager: WebRTCPeerManager | null;
}

/**
 * React hook for WebRTC browser P2P networking
 *
 * @example
 * ```tsx
 * function App() {
 *   const {
 *     peerId,
 *     isConnected,
 *     connectedPeers,
 *     connect,
 *     sendMessage,
 *   } = useWebRTC({ autoConnect: true });
 *
 *   return (
 *     <div>
 *       <p>My Peer ID: {peerId}</p>
 *       <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
 *       <p>Peers: {connectedPeers.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
  const { autoConnect = false, ...config } = options;

  const managerRef = useRef<WebRTCPeerManager | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<WebRTCPeerConnection[]>([]);
  const [discoveredPeers, setDiscoveredPeers] = useState<BrowserPeerInfo[]>([]);
  const [stats, setStats] = useState<WebRTCStats | null>(null);

  // Update peers list
  const updatePeers = useCallback(() => {
    if (managerRef.current) {
      setConnectedPeers(managerRef.current.getConnectedPeers());
      setDiscoveredPeers(managerRef.current.getDiscoveredPeers());
      setStats(managerRef.current.getStats());
    }
  }, []);

  // Connect to signaling server
  const connect = useCallback(async () => {
    if (managerRef.current?.isConnected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      if (!managerRef.current) {
        managerRef.current = createPeerManager(config);
      }

      const manager = managerRef.current;

      // Set up event listeners
      manager.on('open', ({ peerId: id }) => {
        setPeerId(id);
        setIsConnected(true);
        setIsConnecting(false);
      });

      manager.on('close', () => {
        setIsConnected(false);
        setPeerId(null);
      });

      manager.on('error', ({ error: err }) => {
        setError(err);
        setIsConnecting(false);
      });

      manager.on('peer:connected', () => updatePeers());
      manager.on('peer:disconnected', () => updatePeers());
      manager.on('peer:discovered', () => updatePeers());
      manager.on('connection:state-changed', () => updatePeers());

      await manager.initialize();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsConnecting(false);
    }
  }, [config, updatePeers]);

  // Disconnect from signaling server
  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.destroy();
      managerRef.current = null;
      setIsConnected(false);
      setPeerId(null);
      setConnectedPeers([]);
      setDiscoveredPeers([]);
      setStats(null);
    }
  }, []);

  // Connect to a specific peer
  const connectToPeer = useCallback(async (remotePeerId: string) => {
    if (!managerRef.current) {
      throw new Error('Not connected to signaling server');
    }
    const connection = await managerRef.current.connect(remotePeerId);
    updatePeers();
    return connection;
  }, [updatePeers]);

  // Disconnect from a specific peer
  const disconnectFromPeer = useCallback((remotePeerId: string) => {
    if (managerRef.current) {
      managerRef.current.disconnect(remotePeerId);
      updatePeers();
    }
  }, [updatePeers]);

  // Send message to a peer
  const sendMessage = useCallback((remotePeerId: string, data: unknown) => {
    if (!managerRef.current) {
      throw new Error('Not connected to signaling server');
    }
    managerRef.current.send(remotePeerId, 'DATA', data);
  }, []);

  // Broadcast message to all peers
  const broadcast = useCallback((data: unknown) => {
    if (!managerRef.current) {
      throw new Error('Not connected to signaling server');
    }
    managerRef.current.broadcast('DATA', data);
  }, []);

  // Request peer discovery
  const requestPeers = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.requestPeers();
    }
  }, []);

  // Measure latency to a peer
  const measureLatency = useCallback(async (remotePeerId: string) => {
    if (!managerRef.current) {
      throw new Error('Not connected to signaling server');
    }
    return managerRef.current.measureLatency(remotePeerId);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only run on mount/unmount

  // Update stats periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (managerRef.current) {
        setStats(managerRef.current.getStats());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    peerId,
    isConnected,
    isConnecting,
    error,
    connectedPeers,
    discoveredPeers,
    stats,
    connect,
    disconnect,
    connectToPeer,
    disconnectFromPeer,
    sendMessage,
    broadcast,
    requestPeers,
    measureLatency,
    manager: managerRef.current,
  };
}
