/**
 * @chicago-forest/webrtc-browser
 *
 * WebRTC/PeerJS browser P2P for zero-install web participation
 * in Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import { createPeerManager, useWebRTC } from '@chicago-forest/webrtc-browser';
 *
 * // Vanilla JS/TS usage
 * const manager = createPeerManager({
 *   peerIdPrefix: 'forest-',
 *   debug: true,
 * });
 *
 * await manager.initialize();
 * console.log('My peer ID:', manager.peerId);
 *
 * // Connect to another peer
 * await manager.connect('forest-abc123');
 *
 * // Send messages
 * manager.send('forest-abc123', 'DATA', { hello: 'world' });
 *
 * // React usage
 * function App() {
 *   const { peerId, connectedPeers, connect, sendMessage } = useWebRTC({
 *     autoConnect: true,
 *   });
 *
 *   return <div>Connected as: {peerId}</div>;
 * }
 * ```
 */

// Core peer manager
export { WebRTCPeerManager, createPeerManager } from './peer-manager';

// Identity utilities
export {
  createBrowserIdentity,
  generateBrowserKeyPair,
  generatePeerId,
  deriveNodeId,
  storeIdentity,
  retrieveIdentity,
  getOrCreateIdentity,
  serializeBrowserIdentity,
  deserializeBrowserIdentity,
  signMessage,
  verifySignature,
} from './identity';

// Types
export type {
  WebRTCConfig,
  WebRTCConnectionState,
  WebRTCPeerConnection,
  BrowserPeerInfo,
  WebRTCMessageType,
  WebRTCMessage,
  WebRTCEventType,
  WebRTCEventDataMap,
  WebRTCStats,
} from './types';

export { DEFAULT_WEBRTC_CONFIG, BROWSER_CAPABILITIES } from './types';

// React hooks (re-exported for convenience)
export { useWebRTC } from './hooks/useWebRTC';
export { usePeerConnection } from './hooks/usePeerConnection';
export { usePeerDiscovery } from './hooks/usePeerDiscovery';
export { useP2PMessaging } from './hooks/useP2PMessaging';

// Hook types
export type { UseWebRTCOptions, UseWebRTCReturn } from './hooks/useWebRTC';
export type { UsePeerConnectionOptions, UsePeerConnectionReturn } from './hooks/usePeerConnection';
export type { UsePeerDiscoveryOptions, UsePeerDiscoveryReturn } from './hooks/usePeerDiscovery';
export type { UseP2PMessagingOptions, UseP2PMessagingReturn, ReceivedMessage } from './hooks/useP2PMessaging';

/**
 * Package version
 */
export const VERSION = '0.1.0';

/**
 * Package name
 */
export const PACKAGE_NAME = '@chicago-forest/webrtc-browser';
