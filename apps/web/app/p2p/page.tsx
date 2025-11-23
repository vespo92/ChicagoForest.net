'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

/**
 * P2P Browser Connection Page
 *
 * Zero-install WebRTC browser participation in Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

// Dynamic import for WebRTC (browser-only)
interface PeerInfo {
  peerId: string;
  state: string;
  latency?: number;
  bytesSent: number;
  bytesReceived: number;
}

interface NetworkStats {
  peerId: string;
  connectedPeers: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  messagesSent: number;
  messagesReceived: number;
  uptime: number;
  averageLatency?: number;
}

interface ReceivedMessage {
  id: string;
  from: string;
  data: unknown;
  timestamp: number;
}

export default function P2PPage() {
  const [isClient, setIsClient] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<PeerInfo[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [targetPeerId, setTargetPeerId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!isClient) return;

    setIsConnecting(true);
    setError(null);

    try {
      const { createPeerManager } = await import('@chicago-forest/webrtc-browser');
      const peerManager = createPeerManager({
        peerIdPrefix: 'forest-',
        debug: false,
      });

      // Set up event listeners
      peerManager.on('open', ({ peerId: id }: { peerId: string }) => {
        setPeerId(id);
        setIsConnected(true);
        setIsConnecting(false);
      });

      peerManager.on('close', () => {
        setIsConnected(false);
        setPeerId(null);
      });

      peerManager.on('error', ({ error: err }: { error: Error }) => {
        setError(err.message);
        setIsConnecting(false);
      });

      peerManager.on('peer:connected', () => {
        setConnectedPeers(peerManager.getConnectedPeers());
        setStats(peerManager.getStats());
      });

      peerManager.on('peer:disconnected', () => {
        setConnectedPeers(peerManager.getConnectedPeers());
        setStats(peerManager.getStats());
      });

      peerManager.on('message:received', ({ message, from }: { message: any; from: string }) => {
        if (message.type === 'DATA') {
          setMessages((prev) => [
            ...prev.slice(-49),
            {
              id: message.id,
              from,
              data: message.payload,
              timestamp: message.timestamp,
            },
          ]);
        }
      });

      await peerManager.initialize();
      setManager(peerManager);

      // Update stats periodically
      const interval = setInterval(() => {
        if (peerManager.isConnected) {
          setStats(peerManager.getStats());
          setConnectedPeers(peerManager.getConnectedPeers());
        }
      }, 5000);

      return () => clearInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  }, [isClient]);

  const handleDisconnect = useCallback(() => {
    if (manager) {
      manager.destroy();
      setManager(null);
      setIsConnected(false);
      setPeerId(null);
      setConnectedPeers([]);
      setStats(null);
      setMessages([]);
    }
  }, [manager]);

  const handleConnectToPeer = useCallback(async () => {
    if (!manager || !targetPeerId.trim()) return;

    try {
      await manager.connect(targetPeerId.trim());
      setTargetPeerId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to peer');
    }
  }, [manager, targetPeerId]);

  const handleSendMessage = useCallback(() => {
    if (!manager || !messageInput.trim()) return;

    try {
      manager.broadcast('DATA', { text: messageInput, timestamp: Date.now() });
      setMessageInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [manager, messageInput]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-emerald-400 text-sm font-semibold">
                WEBRTC • PEERJS • ZERO-INSTALL
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
              Browser P2P
              <br />
              Connection
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Connect directly to other browsers in the Chicago Forest Network.
              No installation required - just open this page and join the mesh.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm">
              <strong>THEORETICAL FRAMEWORK:</strong> This is a demonstration of WebRTC P2P technology
              as part of an AI-generated educational project. The Chicago Forest Network is a conceptual
              vision for decentralized infrastructure, not operational systems.
            </p>
          </div>
        </div>
      </section>

      {/* Connection Panel */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Network Status</h2>

            {!isClient ? (
              <div className="text-gray-400">Loading...</div>
            ) : !isConnected ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Click the button below to connect to the P2P signaling server and join the network.
                </p>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  {isConnecting ? 'Connecting...' : 'Connect to Network'}
                </button>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Connection Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Peer ID</h3>
                    <div className="font-mono text-emerald-400 text-lg break-all">
                      {peerId}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(peerId || '')}
                      className="text-xs text-gray-400 hover:text-white mt-2"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Network Stats</h3>
                    {stats && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Connected:</span>{' '}
                          <span className="text-white">{stats.connectedPeers}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uptime:</span>{' '}
                          <span className="text-white">{formatUptime(stats.uptime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sent:</span>{' '}
                          <span className="text-white">{formatBytes(stats.totalBytesSent)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Received:</span>{' '}
                          <span className="text-white">{formatBytes(stats.totalBytesReceived)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connect to Peer */}
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Connect to Peer</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetPeerId}
                      onChange={(e) => setTargetPeerId(e.target.value)}
                      placeholder="Enter peer ID (e.g., forest-abc12345)"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleConnectToPeer}
                      disabled={!targetPeerId.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                {/* Connected Peers */}
                {connectedPeers.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      Connected Peers ({connectedPeers.length})
                    </h3>
                    <div className="space-y-2">
                      {connectedPeers.map((peer) => (
                        <div
                          key={peer.peerId}
                          className="flex items-center justify-between bg-slate-800/50 rounded p-3"
                        >
                          <div>
                            <div className="font-mono text-sm text-white">{peer.peerId}</div>
                            <div className="text-xs text-gray-500">
                              {peer.latency ? `${peer.latency}ms` : 'measuring...'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                peer.state === 'connected' ? 'bg-emerald-400' : 'bg-yellow-400'
                              }`}
                            />
                            <span className="text-xs text-gray-400">{peer.state}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messaging */}
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Broadcast Message</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message to broadcast..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || connectedPeers.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Send
                    </button>
                  </div>

                  {messages.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Received Messages</h4>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-slate-800/50 rounded p-2 text-sm"
                        >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="font-mono">{msg.from}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-white">
                            {typeof msg.data === 'object' && msg.data !== null && 'text' in msg.data
                              ? String((msg.data as { text: string }).text)
                              : JSON.stringify(msg.data)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Disconnect */}
                <div className="flex justify-center">
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            How Browser P2P Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">WebRTC Technology</h3>
              <p className="text-gray-400">
                Uses WebRTC (Web Real-Time Communication) for direct browser-to-browser connections.
                No plugins or installations needed - works in Chrome, Firefox, Edge, and Safari.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-3">PeerJS Signaling</h3>
              <p className="text-gray-400">
                PeerJS provides the signaling server for initial peer discovery. Once connected,
                data flows directly between browsers without going through any server.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">DTLS Encryption</h3>
              <p className="text-gray-400">
                All WebRTC data channels are encrypted with DTLS (Datagram Transport Layer Security).
                Your messages are secure from source to destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Potential Applications
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Decentralized Chat</h3>
              <p className="text-gray-400">
                Send messages directly between browsers without centralized servers. Perfect for
                private communication and community coordination.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">File Sharing</h3>
              <p className="text-gray-400">
                Transfer files directly between browsers using P2P data channels. Fast, secure,
                and without uploading to any cloud service.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Real-Time Collaboration</h3>
              <p className="text-gray-400">
                Build collaborative applications where data syncs in real-time between participants
                without a central database.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Mesh Network Entry</h3>
              <p className="text-gray-400">
                Connect browser participants to the broader Chicago Forest mesh network, enabling
                web users to join the decentralized infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Technology Stack
          </h2>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
            <div className="space-y-4">
              <div className="border-l-4 border-emerald-500 pl-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">@chicago-forest/webrtc-browser</h3>
                <p className="text-gray-400 mb-2">
                  Custom package providing WebRTC peer management with PeerJS integration.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">PeerJS</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">WebRTC</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">React Hooks</span>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-blue-400 mb-2">Browser Crypto API</h3>
                <p className="text-gray-400 mb-2">
                  Uses Web Crypto API for browser-compatible identity generation (ECDSA P-256).
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">ECDSA</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">SHA-256</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">P-256</span>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-purple-400 mb-2">Event-Driven Architecture</h3>
                <p className="text-gray-400 mb-2">
                  Uses EventEmitter3 for reactive peer and message handling.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">EventEmitter3</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore the Network
          </h2>
          <p className="text-emerald-100 mb-6">
            Learn more about the Chicago Forest Network ecosystem.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/mesh"
              className="bg-white hover:bg-gray-100 text-emerald-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Mesh Network
            </Link>
            <Link
              href="/packages"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
