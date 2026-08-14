/**
 * useWebSocketWithLongPolling.js
 *
 * React hook for WebSocket connections with automatic long-polling fallback
 * for low bandwidth mode.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * At large music festivals, cellular towers become completely overwhelmed.
 * WebSocket connections can be unreliable on congested networks.
 *
 * This hook provides automatic fallback to long-polling when low bandwidth mode
 * is enabled, ensuring real-time functionality works even on poor connections.
 *
 * FEATURES
 * --------
 *  1. Automatic WebSocket connection when available
 *  2. Automatic long-polling fallback in low bandwidth mode
 *  3. React-friendly state management
 *  4. Memory leak prevention with cleanup
 *  5. Message buffering when connection is down
 *
 * USAGE
 * -----
 *   import useWebSocketWithLongPolling from 'hooks/useWebSocketWithLongPolling';
 *
 *   const { send, lastMessage, isConnected, isUsingLongPolling, error } = 
 *     useWebSocketWithLongPolling({
 *       url: 'wss://example.com/socket',
 *       longPollUrl: '/api/messages/poll',
 *     });
 *
 *   // Send message
 *   const handleSend = () => {
 *     send({ type: 'chat', text: 'Hello' });
 *   };
 *
 *   // Display connection status
 *   <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
 *   <div>Using long-polling: {isUsingLongPolling ? 'Yes' : 'No'}</div>
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketWithLongPolling } from 'utils/WebSocketWithLongPolling';

/**
 * React hook for WebSocket connections with long-polling fallback
 */
export default function useWebSocketWithLongPolling({
  url,
  longPollUrl,
  onOpen,
  onClose,
  onError,
  pollInterval = 5000,
  maxReconnectAttempts = 5,
  baseDelayMs = 1000,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isUsingLongPolling, setIsUsingLongPolling] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  // Handle incoming messages
  const handleMessage = useCallback((message) => {
    setLastMessage(message);
  }, []);

  // Handle connection open
  const handleOpen = useCallback(() => {
    setIsConnected(true);
    setError(null);
    if (onOpen) onOpen();
  }, [onOpen]);

  // Handle connection close
  const handleClose = useCallback(() => {
    setIsConnected(false);
    if (onClose) onClose();
  }, [onClose]);

  // Handle errors
  const handleError = useCallback((err) => {
    setError(err);
    if (onError) onError(err);
  }, [onError]);

  // Handle connection status changes from WebSocket manager
  const handleStatusChange = useCallback(() => {
    if (wsRef.current) {
      const status = wsRef.current.getConnectionStatus();
      setIsConnected(status.isConnected);
      setIsUsingLongPolling(status.isUsingLongPolling);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!url || !longPollUrl) return;

    // Create WebSocket manager
    wsRef.current = new WebSocketWithLongPolling({
      url,
      longPollUrl,
      onMessage: (message) => {
        handleMessage(message);
        handleStatusChange();
      },
      onOpen: () => {
        handleOpen();
        handleStatusChange();
      },
      onClose: () => {
        handleClose();
        handleStatusChange();
      },
      onError: handleError,
      pollInterval,
      maxReconnectAttempts,
      baseDelayMs,
    });

    // Connect
    wsRef.current.connect();

    // Check connection status periodically to detect mode changes
    const intervalId = setInterval(() => {
      if (wsRef.current) {
        const status = wsRef.current.getConnectionStatus();
        setIsConnected(status.isConnected);
        setIsUsingLongPolling(status.isUsingLongPolling);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.cleanup();
        wsRef.current = null;
      }
    };
  }, [
    url,
    longPollUrl,
    handleMessage,
    handleOpen,
    handleClose,
    handleError,
    handleStatusChange,
    pollInterval,
    maxReconnectAttempts,
    baseDelayMs,
  ]);

  // Send message
  const send = useCallback((message) => {
    if (wsRef.current) {
      wsRef.current.send(message);
    }
  }, []);

  // Get current connection status
  const getConnectionStatus = useCallback(() => {
    if (wsRef.current) {
      return wsRef.current.getConnectionStatus();
    }
    return {
      isConnected: false,
      isUsingLongPolling: false,
      messageQueueLength: 0,
      reconnectAttempts: 0,
    };
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.reconnect();
    }
  }, []);

  return {
    send,
    lastMessage,
    isConnected,
    isUsingLongPolling,
    error,
    getConnectionStatus,
    reconnect,
  };
}