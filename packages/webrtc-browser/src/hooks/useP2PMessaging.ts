/**
 * useP2PMessaging Hook
 *
 * Hook for handling P2P messaging with received message state.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebRTCPeerManager } from '../peer-manager';
import type { WebRTCMessage } from '../types';

export interface ReceivedMessage {
  id: string;
  from: string;
  data: unknown;
  timestamp: number;
}

export interface UseP2PMessagingOptions {
  /** The peer manager instance */
  manager: WebRTCPeerManager | null;
  /** Maximum number of messages to keep in history */
  maxMessages?: number;
  /** Filter function for messages */
  filter?: (message: WebRTCMessage) => boolean;
}

export interface UseP2PMessagingReturn {
  /** Array of received messages */
  messages: ReceivedMessage[];
  /** Send a message to a specific peer */
  sendTo: (peerId: string, data: unknown) => void;
  /** Broadcast a message to all peers */
  broadcast: (data: unknown) => void;
  /** Clear message history */
  clearMessages: () => void;
  /** Last received message */
  lastMessage: ReceivedMessage | null;
  /** Number of messages sent */
  messagesSent: number;
  /** Number of messages received */
  messagesReceived: number;
}

/**
 * Hook for P2P messaging
 *
 * @example
 * ```tsx
 * function Chat({ manager }) {
 *   const { messages, sendTo, broadcast, lastMessage } = useP2PMessaging({
 *     manager,
 *     maxMessages: 100,
 *   });
 *
 *   const [input, setInput] = useState('');
 *
 *   return (
 *     <div>
 *       <div className="messages">
 *         {messages.map(m => (
 *           <div key={m.id}>{m.from}: {JSON.stringify(m.data)}</div>
 *         ))}
 *       </div>
 *       <input value={input} onChange={e => setInput(e.target.value)} />
 *       <button onClick={() => { broadcast(input); setInput(''); }}>
 *         Send to All
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useP2PMessaging({
  manager,
  maxMessages = 100,
  filter,
}: UseP2PMessagingOptions): UseP2PMessagingReturn {
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [messagesSent, setMessagesSent] = useState(0);
  const [messagesReceived, setMessagesReceived] = useState(0);
  const lastMessageRef = useRef<ReceivedMessage | null>(null);

  // Handle incoming messages
  useEffect(() => {
    if (!manager) return;

    const handleMessage = ({
      message,
      from,
    }: {
      message: WebRTCMessage;
      from: string;
    }) => {
      // Apply filter if provided
      if (filter && !filter(message)) {
        return;
      }

      // Only handle DATA messages for this hook
      if (message.type !== 'DATA') {
        return;
      }

      const receivedMessage: ReceivedMessage = {
        id: message.id,
        from,
        data: message.payload,
        timestamp: message.timestamp,
      };

      lastMessageRef.current = receivedMessage;
      setMessagesReceived((prev) => prev + 1);

      setMessages((prev) => {
        const updated = [...prev, receivedMessage];
        // Trim to max messages
        if (updated.length > maxMessages) {
          return updated.slice(-maxMessages);
        }
        return updated;
      });
    };

    const handleSent = () => {
      setMessagesSent((prev) => prev + 1);
    };

    manager.on('message:received', handleMessage);
    manager.on('message:sent', handleSent);

    return () => {
      manager.off('message:received', handleMessage);
      manager.off('message:sent', handleSent);
    };
  }, [manager, maxMessages, filter]);

  // Send to specific peer
  const sendTo = useCallback(
    (peerId: string, data: unknown) => {
      if (!manager) {
        throw new Error('No peer manager available');
      }
      manager.send(peerId, 'DATA', data);
    },
    [manager]
  );

  // Broadcast to all peers
  const broadcast = useCallback(
    (data: unknown) => {
      if (!manager) {
        throw new Error('No peer manager available');
      }
      manager.broadcast('DATA', data);
    },
    [manager]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    lastMessageRef.current = null;
  }, []);

  return {
    messages,
    sendTo,
    broadcast,
    clearMessages,
    lastMessage: lastMessageRef.current,
    messagesSent,
    messagesReceived,
  };
}
