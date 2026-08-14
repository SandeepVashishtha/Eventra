/**
 * useSharedWorker.js
 * 
 * React hook for easy integration with the SharedEnclaveWorker.
 * Provides React-friendly state management and lifecycle handling.
 * 
 * USAGE
 * -----
 * import useSharedWorker from 'hooks/useSharedWorker';
 * 
 * const {
 *   send,
 *   subscribe,
 *   unsubscribe,
 *   isConnected,
 *   isSupported,
 *   status,
 *   error,
 * } = useSharedWorker('wss://your-server.com/socket');
 * 
 * // Send a message
 * send({ type: 'CHAT_MESSAGE', text: 'Hello' });
 * 
 * // Subscribe to a channel
 * subscribe('events');
 * 
 * // Subscribe to incoming messages
 * useEffect(() => {
 *   const unsubscribeFn = onMessage((message) => {
 *     console.log('New message:', message);
 *   });
 *   
 *   return () => unsubscribeFn();
 * }, []);
 * 
 * FEATURES
 * --------
 * - Automatic initialization of Shared Worker
 * - React state for connection status
 * - Easy message sending and receiving
 * - Channel subscription management
 * - Cleanup on component unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  startSharedWorker,
  sendToWorker,
  subscribeToWorker,
  getWorkerStatus,
  getConnectionStatus,
  subscribeToChannel,
  unsubscribeFromChannel,
  disconnectWorker,
  isSharedWorkerSupported,
} from 'utils/worker/sharedWorkerManager';

// Global worker instance to share across all components
let globalWorkerPromise = null;
let globalSubscribers = new Set();

/**
 * React hook for Shared Worker integration
 * @param {string} url - WebSocket server URL
 * @param {Object} [options] - Configuration options
 * @param {number} [options.maxReconnectAttempts] - Maximum reconnection attempts
 * @param {number} [options.baseDelayMs] - Base delay for exponential backoff
 * @param {boolean} [options.autoStart=true] - Whether to auto-start the worker
 * @returns {Object} Hook API
 */
export default function useSharedWorker(url, options = {}) {
  const { autoStart = true, ...workerOptions } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(getWorkerStatus());
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);

  const workerRef = useRef(null);
  const subscriberRef = useRef(null);
  const messageSubscribersRef = useRef(new Set());
  const isMountedRef = useRef(true);

  // Initialize worker if not already done globally
  useEffect(() => {
    isMountedRef.current = true;

    if (!url) {
      setError(new Error('WebSocket URL is required'));
      return;
    }

    if (!isSharedWorkerSupported()) {
      setError(new Error('SharedWorker is not supported in this browser'));
      return;
    }

    // Create global worker promise if it doesn't exist
    if (!globalWorkerPromise) {
      globalWorkerPromise = startSharedWorker(url, workerOptions).catch((err) => {
        globalWorkerPromise = null;
        throw err;
      });
    }

    // Initialize the worker
    const initWorker = async () => {
      try {
        await globalWorkerPromise;
        updateStatus();
        
        // Subscribe to worker messages
        subscriberRef.current = subscribeToWorker((message) => {
          if (isMountedRef.current) {
            handleWorkerMessage(message);
          }
        });

        // Update connection status
        updateConnectionStatus();

        // Start connection status polling
        const interval = setInterval(() => {
          if (isMountedRef.current) {
            updateConnectionStatus();
          }
        }, 1000);

        return () => {
          clearInterval(interval);
          if (subscriberRef.current) {
            subscriberRef.current();
            subscriberRef.current = null;
          }
        };
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
        }
        return () => {};
      }
    };

    const cleanup = initWorker();

    return () => {
      isMountedRef.current = false;
      cleanup.then((fn) => fn && fn());
    };
  }, [url, JSON.stringify(workerOptions)]);

  // Update worker status
  const updateStatus = useCallback(() => {
    const newStatus = getWorkerStatus();
    setStatus(newStatus);
    setIsConnected(newStatus.hasWorker && isConnected);
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    getConnectionStatus()
      .then((connStatus) => {
        if (isMountedRef.current) {
          setIsConnected(connStatus?.isConnected || false);
          setIsConnecting(connStatus?.isConnecting || false);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  // Handle incoming messages from worker
  const handleWorkerMessage = useCallback((message) => {
    switch (message.type) {
      case 'CONNECTED':
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        break;

      case 'DISCONNECTED':
        setIsConnected(false);
        setIsConnecting(false);
        break;

      case 'ERROR':
        setError(message.payload?.error || 'Unknown error');
        break;

      case 'MESSAGE':
        // Add to message queue
        setMessageQueue((prev) => [...prev, message.payload]);
        
        // Notify message subscribers
        messageSubscribersRef.current.forEach((subscriber) => {
          try {
            subscriber(message.payload);
          } catch (e) {
            console.error('[useSharedWorker] Error in message subscriber:', e);
          }
        });
        break;

      case 'SUBSCRIPTIONS_UPDATED':
        setSubscribedChannels(message.payload?.channels || []);
        break;

      case 'WORKER_INIT':
        // Worker initialized
        break;
    }
  }, []);

  // Send a message through the worker
  const send = useCallback((message) => {
    if (!url) {
      return Promise.reject(new Error('WebSocket URL is required'));
    }
    if (!isSharedWorkerSupported()) {
      return Promise.reject(new Error('SharedWorker is not supported'));
    }
    return sendToWorker(message);
  }, [url]);

  // Subscribe to incoming messages
  const onMessage = useCallback((callback) => {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    messageSubscribersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      messageSubscribersRef.current.delete(callback);
    };
  }, []);

  // Subscribe to a channel
  const subscribe = useCallback((channel) => {
    if (!channel) {
      return Promise.reject(new Error('Channel is required'));
    }
    return subscribeToChannel(channel);
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel) => {
    if (!channel) {
      return Promise.reject(new Error('Channel is required'));
    }
    return unsubscribeFromChannel(channel);
  }, []);

  // Subscribe to connection status changes
  const onConnect = useCallback((callback) => {
    const unsubscribeFn = globalSubscribers.add(callback);
    return () => {
      globalSubscribers.delete(callback);
    };
  }, []);

  // Get current connection status
  const getStatus = useCallback(() => {
    return {
      isConnected,
      isConnecting,
      isSupported: isSharedWorkerSupported(),
      error,
      status,
      subscribedChannels,
      messageQueue,
    };
  }, [isConnected, isConnecting, error, status, subscribedChannels, messageQueue]);

  // Disconnect the worker (for cleanup)
  const disconnect = useCallback(() => {
    return disconnectWorker();
  }, []);

  return {
    // Message sending
    send,

    // Message subscription
    onMessage,

    // Channel management
    subscribe,
    unsubscribe,

    // Connection status
    isConnected,
    isConnecting,
    isSupported: isSharedWorkerSupported(),
    error,
    status: getStatus(),

    // Subscribed channels
    subscribedChannels,

    // Message queue
    messageQueue,

    // Cleanup
    disconnect,
    
    // Connection callbacks
    onConnect,
  };
}

/**
 * Hook specifically for session synchronization
 * @param {string} url - WebSocket server URL
 * @param {Object} [options] - Configuration options
 * @returns {Object} Session-specific API
 */
export function useSessionSync(url, options = {}) {
  const {
    send,
    onMessage,
    subscribe,
    unsubscribe,
    isConnected,
    isConnecting,
    error,
    disconnect,
  } = useSharedWorker(url, options);

  const [activeSessions, setActiveSessions] = useState(new Map());
  const [activeTabCount, setActiveTabCount] = useState(0);

  // Subscribe to session-related channels
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to session channel
    subscribe('session');
    subscribe('notifications');

    // Handle incoming session messages
    const unsubscribeFn = onMessage((message) => {
      switch (message?.type) {
        case 'SESSION_UPDATE':
          setActiveSessions((prev) => {
            const newMap = new Map(prev);
            newMap.set(message.sessionId, message.data);
            return newMap;
          });
          break;

        case 'SESSION_TERMINATED':
          setActiveSessions((prev) => {
            const newMap = new Map(prev);
            newMap.delete(message.sessionId);
            return newMap;
          });
          break;

        case 'TAB_COUNT_UPDATE':
          setActiveTabCount(message.count || 0);
          break;

        case 'SESSION_BROADCAST':
          // Handle broadcast messages from other tabs
          break;
      }
    });

    return () => {
      unsubscribeFn();
      unsubscribe('session');
      unsubscribe('notifications');
    };
  }, [isConnected, subscribe, unsubscribe, onMessage]);

  // Broadcast session state to other tabs
  const broadcastSessionState = useCallback((state) => {
    if (!isConnected) {
      console.warn('[useSessionSync] Cannot broadcast: not connected');
      return Promise.resolve(false);
    }

    return send({
      type: 'SESSION_BROADCAST',
      state,
      timestamp: Date.now(),
    });
  }, [isConnected, send]);

  // Request current session state from worker
  const requestSessionState = useCallback(() => {
    if (!isConnected) {
      return Promise.reject(new Error('Not connected'));
    }

    return send({
      type: 'GET_SESSION_STATE',
    });
  }, [isConnected, send]);

  return {
    // Base functionality
    send,
    onMessage,
    isConnected,
    isConnecting,
    error,
    disconnect,

    // Session-specific
    activeSessions,
    activeTabCount,
    broadcastSessionState,
    requestSessionState,

    // Channel management
    subscribe,
    unsubscribe,
  };
}
