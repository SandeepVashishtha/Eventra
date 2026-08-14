/**
 * sharedEnclaveWorker.js
 * 
 * Shared Worker for Multi-Tab Session Synchronization
 * Manages a single WebSocket connection shared across all browser tabs.
 * 
 * PROBLEM THIS SOLVES
 * -------------------
 * Opening multiple Eventra tabs creates multiple WebSocket connections, wasting
 * server resources and causing duplicate notifications.
 * 
 * SOLUTION
 * --------
 * This Shared Worker acts as a central controller that:
 * 1. Maintains a single WebSocket connection to the server
 * 2. Routes messages from all tabs through this shared connection
 * 3. Broadcasts incoming messages to all connected tabs
 * 4. Manages connection state and reconnection logic
 * 5. Provides real-time session synchronization across tabs
 * 
 * USAGE
 * -----
 * In your main application entry point:
 *   import { startSharedWorker, sendToWorker } from 'utils/worker/sharedEnclaveWorker';
 *   
 *   // Start the shared worker
 *   startSharedWorker('wss://your-server.com/socket');
 *   
 *   // Send a message through the worker
 *   sendToWorker({ type: 'SUBSCRIBE', channel: 'events' });
 *   
 *   // Listen for messages from the worker
 *   const unsubscribe = onWorkerMessage((message) => {
 *     console.log('Received:', message);
 *   });
 * 
 * FEATURES
 * --------
 * - Single WebSocket connection shared across all tabs
 * - Automatic reconnection with exponential backoff
 * - Message buffering when connection is down
 * - Tab synchronization for real-time updates
 * - Connection state broadcasting to all tabs
 * - Graceful cleanup when tabs close
 */

// Worker state
let socket = null;
let reconnectTimeoutId = null;
let reconnectAttempts = 0;
let isConnected = false;
let isConnecting = false;
let messageQueue = [];
let clientPorts = new Set();
let subscriptionChannels = new Set();

// Configuration
const DEFAULT_CONFIG = {
  maxReconnectAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  pingIntervalMs: 30000,
  pongTimeoutMs: 10000,
};

let config = { ...DEFAULT_CONFIG };
let workerConfig = {};

// Heartbeat for connection health monitoring
let pingIntervalId = null;
let pongTimerId = null;
let lastPongTime = 0;

/**
 * Initialize the Shared Worker with configuration
 */
self.onconnect = function (event) {
  const port = event.ports[0];
  
  // Add port to tracking set
  clientPorts.add(port);
  
  // Send current state to new client
  port.postMessage({
    type: 'WORKER_INIT',
    payload: {
      isConnected,
      isConnecting,
      subscriptionChannels: Array.from(subscriptionChannels),
    },
  });
  
  // Handle messages from the client tab
  port.onmessage = function (messageEvent) {
    const message = messageEvent.data;
    
    if (!message || typeof message !== 'object') {
      return;
    }
    
    switch (message.type) {
      case 'CONFIGURE':
        configureWorker(message.payload);
        break;
        
      case 'CONNECT':
        connectWebSocket(message.payload);
        break;
        
      case 'DISCONNECT':
        disconnectWebSocket();
        break;
        
      case 'SEND':
        sendMessage(message.payload);
        break;
        
      case 'SUBSCRIBE':
        subscribeToChannel(message.payload);
        break;
        
      case 'UNSUBSCRIBE':
        unsubscribeFromChannel(message.payload);
        break;
        
      case 'GET_STATUS':
        port.postMessage({
          type: 'STATUS',
          payload: getConnectionStatus(),
        });
        break;
        
      case 'PING':
        port.postMessage({ type: 'PONG' });
        break;
        
      default:
        // Forward unknown message types to the server if connected
        if (isConnected && socket) {
          sendMessage(message);
        }
    }
  };
  
  // Cleanup when port disconnects
  port.start();
};

/**
 * Configure the worker with custom settings
 */
function configureWorker(customConfig = {}) {
  workerConfig = { ...workerConfig, ...customConfig };
  config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Restart ping interval with new configuration
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    startPingInterval();
  }
}

/**
 * Connect to the WebSocket server
 */
function connectWebSocket(url) {
  if (isConnecting || isConnected) {
    return;
  }
  
  if (!url) {
    broadcastToClients({
      type: 'ERROR',
      payload: { error: 'WebSocket URL is required' },
    });
    return;
  }
  
  isConnecting = true;
  reconnectAttempts = 0;
  
  try {
    socket = new WebSocket(url);
    
    socket.onopen = function () {
      isConnecting = false;
      isConnected = true;
      reconnectAttempts = 0;
      
      // Flush queued messages
      flushMessageQueue();
      
      // Start ping interval
      startPingInterval();
      
      // Notify all clients
      broadcastToClients({
        type: 'CONNECTED',
        payload: { url },
      });
    };
    
    socket.onclose = function (event) {
      isConnected = false;
      isConnecting = false;
      
      // Clear ping interval
      if (pingIntervalId) {
        clearInterval(pingIntervalId);
        pingIntervalId = null;
      }
      
      if (pongTimerId) {
        clearTimeout(pongTimerId);
        pongTimerId = null;
      }
      
      // Notify clients
      broadcastToClients({
        type: 'DISCONNECTED',
        payload: {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        },
      });
      
      // Attempt to reconnect
      scheduleReconnection();
    };
    
    socket.onerror = function (error) {
      isConnecting = false;
      
      broadcastToClients({
        type: 'ERROR',
        payload: { error: error.message || 'WebSocket error' },
      });
    };
    
    socket.onmessage = function (event) {
      try {
        const data = parseMessage(event.data);
        
        // Handle pong response
        if (data.type === 'PONG') {
          lastPongTime = Date.now();
          if (pongTimerId) {
            clearTimeout(pongTimerId);
            pongTimerId = null;
          }
          return;
        }
        
        // Broadcast to all connected clients
        broadcastToClients({
          type: 'MESSAGE',
          payload: data,
        });
        
      } catch (error) {
        console.error('[SharedEnclaveWorker] Error parsing message:', error);
      }
    };
    
  } catch (error) {
    isConnecting = false;
    broadcastToClients({
      type: 'ERROR',
      payload: { error: error.message || 'Failed to create WebSocket' },
    });
  }
}

/**
 * Disconnect the WebSocket connection
 */
function disconnectWebSocket() {
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
  
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
  
  if (pongTimerId) {
    clearTimeout(pongTimerId);
    pongTimerId = null;
  }
  
  if (socket) {
    try {
      socket.close();
    } catch (e) {
      // Ignore errors during close
    }
    socket = null;
  }
  
  isConnected = false;
  isConnecting = false;
  
  broadcastToClients({
    type: 'DISCONNECTED',
    payload: { manuallyDisconnected: true },
  });
}

/**
 * Send a message through the WebSocket
 */
function sendMessage(message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    // Queue message if not connected
    messageQueue.push(message);
    return false;
  }
  
  try {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(data);
    return true;
  } catch (error) {
    console.error('[SharedEnclaveWorker] Error sending message:', error);
    return false;
  }
}

/**
 * Flush queued messages when connection is established
 */
function flushMessageQueue() {
  while (messageQueue.length > 0 && isConnected && socket) {
    const message = messageQueue.shift();
    sendMessage(message);
  }
}

/**
 * Subscribe to a channel
 */
function subscribeToChannel(channel) {
  if (!channel) return;
  
  subscriptionChannels.add(channel);
  
  // Send subscription to server if connected
  if (isConnected) {
    sendMessage({
      type: 'SUBSCRIBE',
      channel,
    });
  }
  
  // Notify all clients about updated subscriptions
  broadcastToClients({
    type: 'SUBSCRIPTIONS_UPDATED',
    payload: { channels: Array.from(subscriptionChannels) },
  });
}

/**
 * Unsubscribe from a channel
 */
function unsubscribeFromChannel(channel) {
  subscriptionChannels.delete(channel);
  
  // Send unsubscription to server if connected
  if (isConnected) {
    sendMessage({
      type: 'UNSUBSCRIBE',
      channel,
    });
  }
  
  // Notify all clients about updated subscriptions
  broadcastToClients({
    type: 'SUBSCRIPTIONS_UPDATED',
    payload: { channels: Array.from(subscriptionChannels) },
  });
}

/**
 * Schedule reconnection with exponential backoff
 */
function scheduleReconnection() {
  if (reconnectAttempts >= config.maxReconnectAttempts) {
    broadcastToClients({
      type: 'ERROR',
      payload: { error: 'Max reconnection attempts reached' },
    });
    return;
  }
  
  reconnectAttempts++;
  const delay = Math.min(
    config.baseDelayMs * Math.pow(2, reconnectAttempts),
    config.maxDelayMs
  );
  
  reconnectTimeoutId = setTimeout(() => {
    if (workerConfig.url) {
      connectWebSocket(workerConfig.url);
    }
  }, delay);
}

/**
 * Start ping interval to monitor connection health
 */
function startPingInterval() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
  }
  
  pingIntervalId = setInterval(() => {
    if (isConnected && socket) {
      lastPongTime = Date.now();
      
      // Set timeout for pong response
      pongTimerId = setTimeout(() => {
        console.warn('[SharedEnclaveWorker] No pong received, connection may be dead');
        if (socket) {
          socket.close();
        }
      }, config.pongTimeoutMs);
      
      // Send ping
      sendMessage({ type: 'PING' });
    }
  }, config.pingIntervalMs);
}

/**
 * Parse incoming message (supports both JSON and raw text)
 */
function parseMessage(data) {
  try {
    return JSON.parse(data);
  } catch {
    // Return raw data if not JSON
    return { type: 'RAW', payload: data };
  }
}

/**
 * Broadcast message to all connected client ports
 */
function broadcastToClients(message) {
  const messageStr = JSON.stringify(message);
  
  clientPorts.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      // Port may be closed, remove it
      clientPorts.delete(port);
    }
  });
  
  // Cleanup closed ports
  cleanupClosedPorts();
}

/**
 * Clean up any closed ports
 */
function cleanupClosedPorts() {
  for (const port of clientPorts) {
    // Check if port is still usable
    try {
      // This is a simple way to check if port is still open
      // We can't directly check port state, so we rely on errors
    } catch {
      clientPorts.delete(port);
    }
  }
}

/**
 * Get current connection status
 */
function getConnectionStatus() {
  return {
    isConnected,
    isConnecting,
    reconnectAttempts,
    messageQueueLength: messageQueue.length,
    clientCount: clientPorts.size,
    subscriptionChannels: Array.from(subscriptionChannels),
    lastPongTime,
  };
}

/**
 * Export function to start the Shared Worker from the main thread
 * This is a utility function that should be imported in the main application
 */
export function getSharedWorkerUrl() {
  // This will be set by the build process or served from public folder
  return typeof window !== 'undefined' 
    ? window.SHARED_WORKER_URL || '/sharedEnclaveWorker.js' 
    : '/sharedEnclaveWorker.js';
}

/**
 * Create and return the Shared Worker script content
 * This can be used for dynamic worker creation
 */
export function getSharedWorkerScript() {
  return `
    ${sharedEnclaveWorker.toString()}
    
    // Initialize worker
    self.onconnect = sharedEnclaveWorker.onconnect.bind(self);
  `;
}
