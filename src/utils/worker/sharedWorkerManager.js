/**
 * sharedWorkerManager.js
 * 
 * Client-side manager for the SharedEnclaveWorker.
 * Provides a clean API for tabs to communicate with the Shared Worker.
 * 
 * USAGE
 * -----
 * import {
 *   startSharedWorker,
 *   sendToWorker,
 *   subscribeToWorker,
 *   unsubscribeFromWorker,
 *   getWorkerStatus,
 *   disconnectWorker,
 * } from 'utils/worker/sharedWorkerManager';
 * 
 * // Start the shared worker
 * startSharedWorker('wss://your-server.com/socket');
 * 
 * // Send a message
 * sendToWorker({ type: 'SUBSCRIBE', channel: 'events' });
 * 
 * // Subscribe to messages
 * const unsubscribe = subscribeToWorker((message) => {
 *   console.log('Received:', message);
 * });
 * 
 * // Get current status
 * const status = getWorkerStatus();
 * 
 * // Disconnect
 * disconnectWorker();
 */

// Global state
let worker = null;
let messageChannel = null;
let messagePort = null;
let messageQueue = [];
let listeners = new Set();
let isInitialized = false;
let workerConfig = null;

// Configuration defaults
const DEFAULT_CONFIG = {
  maxReconnectAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  pingIntervalMs: 30000,
  pongTimeoutMs: 10000,
};

/**
 * Check if SharedWorker is supported in the current environment
 */
export function isSharedWorkerSupported() {
  return (
    typeof window !== 'undefined' &&
    'SharedWorker' in window
  );
}

/**
 * Start the Shared Worker with the given configuration
 * @param {string} url - WebSocket server URL
 * @param {Object} [options] - Additional configuration options
 * @param {number} [options.maxReconnectAttempts] - Maximum reconnection attempts
 * @param {number} [options.baseDelayMs] - Base delay for exponential backoff
 * @param {number} [options.maxDelayMs] - Maximum delay between reconnections
 * @returns {Promise<SharedWorker>} The Shared Worker instance
 */
export async function startSharedWorker(url, options = {}) {
  if (!isSharedWorkerSupported()) {
    console.warn('[SharedWorkerManager] SharedWorker is not supported in this environment');
    throw new Error('SharedWorker is not supported');
  }

  if (isInitialized && worker) {
    console.log('[SharedWorkerManager] Worker already initialized');
    return worker;
  }

  // Build worker URL - the worker file should be in the public folder
  // In development, it might be at a different path
  const workerUrl = getWorkerUrl();
  
  try {
    // Create the Shared Worker
    worker = new SharedWorker(workerUrl, {
      name: 'EventraSharedEnclave',
      type: 'module', // Treat as ES module if needed
    });

    // Store configuration
    workerConfig = { url, ...DEFAULT_CONFIG, ...options };

    // Create a message channel for bidirectional communication
    messageChannel = new MessageChannel();
    messagePort = messageChannel.port1;

    // Setup port communication
    setupPortCommunication(worker.port, messagePort);

    // Send configuration to worker
    worker.port.postMessage({
      type: 'CONFIGURE',
      payload: { url, ...options },
    });

    // Connect to WebSocket
    worker.port.postMessage({
      type: 'CONNECT',
      payload: url,
    });

    isInitialized = true;

    console.log('[SharedWorkerManager] Shared worker started successfully');

    // Process any queued messages
    processMessageQueue();

    return worker;
  } catch (error) {
    console.error('[SharedWorkerManager] Failed to start worker:', error);
    isInitialized = false;
    throw error;
  }
}

/**
 * Setup bidirectional communication with the worker
 */
function setupPortCommunication(workerPort, clientPort) {
  // Forward messages from worker to our port
  workerPort.onmessage = (event) => {
    // Handle initialization message
    if (event.data?.type === 'WORKER_INIT') {
      // Worker is ready, we can use clientPort for communication
      clientPort.onmessage = (msgEvent) => {
        handleIncomingMessage(msgEvent.data);
      };
      return;
    }
    
    handleIncomingMessage(event.data);
  };

  // Forward messages from clientPort to worker (for two-way communication)
  clientPort.onmessage = (event) => {
    handleIncomingMessage(event.data);
  };

  // Start the ports
  workerPort.start();
  clientPort.start();
}

/**
 * Handle incoming messages from the worker
 */
function handleIncomingMessage(message) {
  if (!message) return;

  // Notify all listeners
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch (error) {
      console.error('[SharedWorkerManager] Error in message listener:', error);
    }
  });

  // Handle specific message types
  switch (message.type) {
    case 'CONNECTED':
      console.log('[SharedWorkerManager] WebSocket connected');
      break;
    case 'DISCONNECTED':
      console.log('[SharedWorkerManager] WebSocket disconnected');
      break;
    case 'ERROR':
      console.error('[SharedWorkerManager] WebSocket error:', message.payload?.error);
      break;
    case 'MESSAGE':
      // Forward server messages
      break;
    case 'STATUS':
      // Status update
      break;
  }
}

/**
 * Send a message to the Shared Worker
 * @param {Object} message - Message to send
 * @param {boolean} [queueIfNotReady=false] - Whether to queue the message if worker is not ready
 * @returns {Promise<boolean>} Whether the message was sent successfully
 */
export function sendToWorker(message, queueIfNotReady = true) {
  if (!isInitialized || !worker) {
    if (queueIfNotReady) {
      messageQueue.push(message);
      return Promise.resolve(false);
    }
    throw new Error('Shared worker is not initialized. Call startSharedWorker first.');
  }

  try {
    worker.port.postMessage(message);
    return Promise.resolve(true);
  } catch (error) {
    console.error('[SharedWorkerManager] Failed to send message:', error);
    return Promise.resolve(false);
  }
}

/**
 * Subscribe to messages from the Shared Worker
 * @param {Function} callback - Callback function to receive messages
 * @returns {Function} Unsubscribe function
 */
export function subscribeToWorker(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }

  listeners.add(callback);

  // Return unsubscribe function
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Unsubscribe all listeners
 */
export function clearAllSubscribers() {
  listeners.clear();
}

/**
 * Get current worker and connection status
 * @returns {Object} Status object
 */
export function getWorkerStatus() {
  return {
    isInitialized,
    isSupported: isSharedWorkerSupported(),
    hasWorker: !!worker,
    config: workerConfig,
    listenerCount: listeners.size,
    queuedMessageCount: messageQueue.length,
  };
}

/**
 * Request connection status from the worker
 * @returns {Promise<Object>} Connection status
 */
export function getConnectionStatus() {
  if (!isInitialized || !worker) {
    return Promise.reject(new Error('Worker not initialized'));
  }

  return new Promise((resolve, reject) => {
    const requestId = `status_${Date.now()}`;
    
    const handleResponse = (message) => {
      if (message.type === 'STATUS') {
        unsubscribe();
        resolve(message.payload);
      }
    };

    const unsubscribe = subscribeToWorker(handleResponse);

    worker.port.postMessage({
      type: 'GET_STATUS',
      requestId,
    });

    // Timeout after 1 second
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Timeout waiting for status response'));
    }, 1000);
  });
}

/**
 * Subscribe to a channel via the worker
 * @param {string} channel - Channel to subscribe to
 * @returns {Promise<boolean>}
 */
export function subscribeToChannel(channel) {
  if (!isInitialized || !worker) {
    return Promise.reject(new Error('Worker not initialized'));
  }

  return sendToWorker({
    type: 'SUBSCRIBE',
    payload: channel,
  });
}

/**
 * Unsubscribe from a channel via the worker
 * @param {string} channel - Channel to unsubscribe from
 * @returns {Promise<boolean>}
 */
export function unsubscribeFromChannel(channel) {
  if (!isInitialized || !worker) {
    return Promise.reject(new Error('Worker not initialized'));
  }

  return sendToWorker({
    type: 'UNSUBSCRIBE',
    payload: channel,
  });
}

/**
 * Disconnect the Shared Worker
 */
export function disconnectWorker() {
  if (!isInitialized || !worker) {
    return Promise.resolve(false);
  }

  try {
    // Send disconnect message to worker
    worker.port.postMessage({ type: 'DISCONNECT' });
    
    // Close the port
    if (worker.port) {
      worker.port.close();
    }
    
    // Terminate the worker
    worker.terminate();
    
    // Cleanup
    worker = null;
    isInitialized = false;
    workerConfig = null;
    messageQueue = [];
    listeners.clear();
    
    console.log('[SharedWorkerManager] Worker disconnected');
    return Promise.resolve(true);
  } catch (error) {
    console.error('[SharedWorkerManager] Error disconnecting worker:', error);
    return Promise.resolve(false);
  }
}

/**
 * Reconnect the WebSocket connection
 * @returns {Promise<boolean>}
 */
export function reconnectWorker() {
  if (!isInitialized || !worker) {
    return Promise.reject(new Error('Worker not initialized'));
  }

  return new Promise((resolve) => {
    // Send reconnect message
    worker.port.postMessage({
      type: 'CONNECT',
      payload: workerConfig?.url || '',
    });
    
    resolve(true);
  });
}

/**
 * Process queued messages once worker is ready
 */
function processMessageQueue() {
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    try {
      if (worker && worker.port) {
        worker.port.postMessage(message);
      }
    } catch (error) {
      console.error('[SharedWorkerManager] Error processing queued message:', error);
    }
  }
}

/**
 * Get the URL for the Shared Worker script
 * In production, this should point to the compiled worker file
 */
function getWorkerUrl() {
  // Try to get the URL from global configuration
  if (typeof window !== 'undefined' && window.SHARED_WORKER_URL) {
    return window.SHARED_WORKER_URL;
  }

  // Default development path
  // The worker file needs to be served as a static asset
  // In Vite, you might need to import it directly
  // For now, we use a relative path
  return '/sharedEnclaveWorker.js';
}

/**
 * Set the URL for the Shared Worker script (useful for testing)
 * @param {string} url - Worker script URL
 */
export function setWorkerUrl(url) {
  if (typeof window !== 'undefined') {
    window.SHARED_WORKER_URL = url;
  }
}

/**
 * Cleanup all resources
 */
export function cleanupWorker() {
  disconnectWorker().then(() => {
    worker = null;
    messageChannel = null;
    messagePort = null;
    isInitialized = false;
    workerConfig = null;
    messageQueue = [];
    listeners.clear();
  });
}

// Export types for TypeScript support
export interface SharedWorkerConfig {
  url: string;
  maxReconnectAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  pingIntervalMs?: number;
  pongTimeoutMs?: number;
}

export interface WorkerMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export interface WorkerStatus {
  isInitialized: boolean;
  isSupported: boolean;
  hasWorker: boolean;
  config: SharedWorkerConfig | null;
  listenerCount: number;
  queuedMessageCount: number;
}
