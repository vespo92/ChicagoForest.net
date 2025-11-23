/**
 * WebRTC Browser Types
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { NodeId, PeerInfo, NodeCapability } from '@chicago-forest/shared-types';

/**
 * WebRTC connection configuration
 */
export interface WebRTCConfig {
  /** PeerJS server host (default: 0.peerjs.com) */
  peerServer?: {
    host: string;
    port: number;
    path?: string;
    secure?: boolean;
    key?: string;
  };
  /** ICE servers for NAT traversal */
  iceServers?: RTCIceServer[];
  /** Maximum number of peer connections */
  maxConnections?: number;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom peer ID prefix */
  peerIdPrefix?: string;
}

/**
 * Default WebRTC configuration
 */
export const DEFAULT_WEBRTC_CONFIG: Required<WebRTCConfig> = {
  peerServer: {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    key: 'peerjs',
  },
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  maxConnections: 50,
  connectionTimeout: 30000,
  debug: false,
  peerIdPrefix: 'cf-',
};

/**
 * WebRTC peer connection state
 */
export type WebRTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

/**
 * WebRTC peer connection info
 */
export interface WebRTCPeerConnection {
  peerId: string;
  nodeId?: NodeId;
  state: WebRTCConnectionState;
  dataChannel?: RTCDataChannelState;
  connectedAt?: number;
  lastActivity?: number;
  bytesReceived: number;
  bytesSent: number;
  latency?: number;
}

/**
 * Browser peer info for WebRTC participants
 */
export interface BrowserPeerInfo extends Omit<PeerInfo, 'addresses'> {
  peerId: string;
  browserInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
  };
  webrtcCapabilities?: {
    video: boolean;
    audio: boolean;
    data: boolean;
    screen: boolean;
  };
}

/**
 * WebRTC message types
 */
export type WebRTCMessageType =
  | 'HANDSHAKE'
  | 'HANDSHAKE_ACK'
  | 'PING'
  | 'PONG'
  | 'DATA'
  | 'PEER_LIST'
  | 'PEER_REQUEST'
  | 'BROADCAST'
  | 'RELAY'
  | 'ERROR';

/**
 * WebRTC message structure
 */
export interface WebRTCMessage {
  type: WebRTCMessageType;
  id: string;
  from: string;
  to?: string;
  timestamp: number;
  payload: unknown;
  ttl?: number;
}

/**
 * WebRTC event types
 */
export type WebRTCEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'peer:connected'
  | 'peer:disconnected'
  | 'peer:discovered'
  | 'message:received'
  | 'message:sent'
  | 'connection:state-changed';

/**
 * WebRTC event data map
 */
export interface WebRTCEventDataMap {
  open: { peerId: string };
  close: { reason?: string };
  error: { error: Error; type?: string };
  'peer:connected': { peer: WebRTCPeerConnection };
  'peer:disconnected': { peerId: string; reason?: string };
  'peer:discovered': { peer: BrowserPeerInfo };
  'message:received': { message: WebRTCMessage; from: string };
  'message:sent': { message: WebRTCMessage; to: string };
  'connection:state-changed': { peerId: string; state: WebRTCConnectionState };
}

/**
 * WebRTC network statistics
 */
export interface WebRTCStats {
  peerId: string;
  connectedPeers: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  messagesSent: number;
  messagesReceived: number;
  uptime: number;
  averageLatency?: number;
}

/**
 * Browser node capabilities
 */
export const BROWSER_CAPABILITIES: NodeCapability[] = [
  'relay',  // Can relay messages to other browser peers
];
