/**
 * usePeerConnection Hook
 *
 * Hook for managing a single peer connection.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { useState, useEffect, useCallback } from 'react';
import type { WebRTCPeerManager } from '../peer-manager';
import type { WebRTCPeerConnection, WebRTCConnectionState } from '../types';

export interface UsePeerConnectionOptions {
  /** The peer manager instance */
  manager: WebRTCPeerManager | null;
  /** The peer ID to connect to */
  peerId: string;
  /** Auto-connect on mount */
  autoConnect?: boolean;
}

export interface UsePeerConnectionReturn {
  /** Connection state */
  state: WebRTCConnectionState;
  /** Whether connected */
  isConnected: boolean;
  /** Whether connecting */
  isConnecting: boolean;
  /** Connection info */
  connection: WebRTCPeerConnection | null;
  /** Connection error */
  error: Error | null;
  /** Latency in ms */
  latency: number | null;
  /** Connect to the peer */
  connect: () => Promise<void>;
  /** Disconnect from the peer */
  disconnect: () => void;
  /** Send data to the peer */
  send: (data: unknown) => void;
  /** Measure latency */
  ping: () => Promise<number>;
}

/**
 * Hook for managing a single peer connection
 *
 * @example
 * ```tsx
 * function PeerCard({ manager, remotePeerId }) {
 *   const { isConnected, latency, connect, send, ping } = usePeerConnection({
 *     manager,
 *     peerId: remotePeerId,
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *       <p>Latency: {latency}ms</p>
 *       <button onClick={connect}>Connect</button>
 *       <button onClick={() => send({ hello: 'world' })}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePeerConnection({
  manager,
  peerId,
  autoConnect = false,
}: UsePeerConnectionOptions): UsePeerConnectionReturn {
  const [state, setState] = useState<WebRTCConnectionState>('new');
  const [connection, setConnection] = useState<WebRTCPeerConnection | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';

  // Update connection state from manager events
  useEffect(() => {
    if (!manager) return;

    const handleStateChange = ({
      peerId: changedPeerId,
      state: newState,
    }: {
      peerId: string;
      state: WebRTCConnectionState;
    }) => {
      if (changedPeerId === peerId) {
        setState(newState);
      }
    };

    const handleConnected = ({ peer }: { peer: WebRTCPeerConnection }) => {
      if (peer.peerId === peerId) {
        setConnection(peer);
        setState('connected');
      }
    };

    const handleDisconnected = ({ peerId: disconnectedId }: { peerId: string }) => {
      if (disconnectedId === peerId) {
        setConnection(null);
        setState('disconnected');
      }
    };

    manager.on('connection:state-changed', handleStateChange);
    manager.on('peer:connected', handleConnected);
    manager.on('peer:disconnected', handleDisconnected);

    // Check current state
    const peers = manager.getConnectedPeers();
    const existing = peers.find((p) => p.peerId === peerId);
    if (existing) {
      setConnection(existing);
      setState(existing.state);
      if (existing.latency) {
        setLatency(existing.latency);
      }
    }

    return () => {
      manager.off('connection:state-changed', handleStateChange);
      manager.off('peer:connected', handleConnected);
      manager.off('peer:disconnected', handleDisconnected);
    };
  }, [manager, peerId]);

  // Connect to peer
  const connect = useCallback(async () => {
    if (!manager) {
      throw new Error('No peer manager available');
    }

    setError(null);
    setState('connecting');

    try {
      const conn = await manager.connect(peerId);
      setConnection(conn);
      setState('connected');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setState('failed');
    }
  }, [manager, peerId]);

  // Disconnect from peer
  const disconnect = useCallback(() => {
    if (manager) {
      manager.disconnect(peerId);
      setConnection(null);
      setState('disconnected');
    }
  }, [manager, peerId]);

  // Send data to peer
  const send = useCallback(
    (data: unknown) => {
      if (!manager || !isConnected) {
        throw new Error('Not connected to peer');
      }
      manager.send(peerId, 'DATA', data);
    },
    [manager, peerId, isConnected]
  );

  // Measure latency
  const ping = useCallback(async () => {
    if (!manager || !isConnected) {
      throw new Error('Not connected to peer');
    }
    const lat = await manager.measureLatency(peerId);
    setLatency(lat);
    return lat;
  }, [manager, peerId, isConnected]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && manager && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect, manager, isConnected, isConnecting, connect]);

  return {
    state,
    isConnected,
    isConnecting,
    connection,
    error,
    latency,
    connect,
    disconnect,
    send,
    ping,
  };
}
