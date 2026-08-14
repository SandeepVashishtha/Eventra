/**
 * WebSocketWithLongPolling.js
 *
 * Enhanced WebSocket connection manager with automatic long-polling fallback
 * for low bandwidth mode. When low bandwidth mode is enabled, the connection
 * automatically falls back to aggressive long-polling instead of WebSockets.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * At large music festivals, cellular towers become completely overwhelmed.
 * WebSocket connections can be unreliable on congested networks, leading to
 * connection drops and poor real-time updates.
 *
 * When low bandwidth mode is enabled, this manager automatically uses long-polling
 * which is more resilient on poor connections and uses less overhead.
 *
 * FEATURES
 * --------
 *  1. Automatic WebSocket connection when available
 *  2. Automatic long-polling fallback in low bandwidth mode
 *  3. Exponential backoff for reconnection attempts
 *  4. Memory leak prevention with proper cleanup
 *  5. Message buffering when connection is down
 *  6. Seamless failover between WebSocket and long-polling
 *
 * USAGE
 * -----
 *   import WebSocketWithLongPolling from 'utils/WebSocketWithLongPolling';
 *
 *   const ws = new WebSocketWithLongPolling({
 *     url: 'wss://example.com/socket',
 *     longPollUrl: '/api/messages/poll',
 *     onMessage: (data) => console.log('New message:', data),
 *     onOpen: () => console.log('Connected'),
 *     onClose: () => console.log('Disconnected'),
 *   });
 *
 *   // Connect
 *   ws.connect();
 *
 *   // Send message
 *   ws.send({ type: 'chat', text: 'Hello' });
 *
 *   // Cleanup
 *   ws.cleanup();
 */

import { isLowBandwidthModeEnabled } from './lowBandwidthMode';

export class WebSocketWithLongPolling {
  constructor({ 
    url, 
    longPollUrl, 
    onMessage = () => {}, 
    onOpen = () => {}, 
    onClose = () => {},
    onError = () => {},
    pollInterval = 5000, // 5 seconds for long-polling
    maxReconnectAttempts = 5,
    baseDelayMs = 1000,
  }) {
    this.url = url;
    this.longPollUrl = longPollUrl;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.pollInterval = pollInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.baseDelayMs = baseDelayMs;
    
    // State
    this.socket = null;
    this.reconnectTimeoutId = null;
    this.reconnectAttempts = 0;
    this.pollTimeoutId = null;
    this.messageQueue = [];
    this.isConnected = false;
    this.isUsingLongPolling = false;
    this.lastMessageId = null;
    this.abortController = null;
  }

  /**
   * Check if we should use long-polling instead of WebSocket
   */
  shouldUseLongPolling() {
    return isLowBandwidthModeEnabled();
  }

  /**
   * Connect using the appropriate method (WebSocket or long-polling)
   */
  connect() {
    this.cleanup();
    
    this.isUsingLongPolling = this.shouldUseLongPolling();
    
    if (this.isUsingLongPolling) {
      this.startLongPolling();
    } else {
      this.connectWebSocket();
    }
  }

  /**
   * Connect using WebSocket
   */
  connectWebSocket() {
    if (typeof WebSocket === "undefined") {
      // Fallback to long-polling if WebSocket is not available
      this.isUsingLongPolling = true;
      this.startLongPolling();
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.flushMessageQueue();
        this.onOpen();
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.onClose();
        this.scheduleReconnection();
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch {
          // If not JSON, pass raw data
          this.onMessage(event.data);
        }
      };
    } catch (err) {
      this.onError(err);
      this.scheduleReconnection();
    }
  }

  /**
   * Start long-polling connection
   */
  startLongPolling() {
    // Check if low bandwidth mode changed during polling
    if (!this.shouldUseLongPolling()) {
      this.isUsingLongPolling = false;
      this.connectWebSocket();
      return;
    }

    this.pollMessages();
  }

  /**
   * Poll for new messages using long-polling
   */
  async pollMessages() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.abortController = new AbortController();
    
    try {
      const url = new URL(this.longPollUrl);
      if (this.lastMessageId) {
        url.searchParams.append('since', this.lastMessageId);
      }
      
      const response = await fetch(url.toString(), {
        signal: this.abortController.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Process all messages
        data.forEach(msg => {
          this.lastMessageId = msg.id || this.lastMessageId;
          this.onMessage(msg);
        });
        
        if (!this.isConnected) {
          this.isConnected = true;
          this.flushMessageQueue();
          this.onOpen();
        }
      }
      
      // Schedule next poll
      this.pollTimeoutId = setTimeout(() => {
        this.isPolling = false;
        this.pollMessages();
      }, this.pollInterval);
      
    } catch (error) {
      this.isPolling = false;
      if (error.name !== 'AbortError') {
        this.onError(error);
        // Retry immediately on error
        this.pollTimeoutId = setTimeout(() => {
          this.pollMessages();
        }, 1000);
      }
    }
  }

  /**
   * Send a message using the appropriate method
   */
  send(message) {
    if (this.isConnected) {
      if (this.isUsingLongPolling) {
        // Send via POST for long-polling
        this.sendLongPollMessage(message);
      } else {
        // Send via WebSocket
        this.sendWebSocketMessage(message);
      }
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Send message via WebSocket
   */
  sendWebSocketMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        this.socket.send(data);
      } catch (error) {
        this.onError(error);
      }
    }
  }

  /**
   * Send message via long-polling POST
   */
  async sendLongPollMessage(message) {
    try {
      await fetch(this.longPollUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * Flush queued messages when connection is established
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.isUsingLongPolling) {
        this.sendLongPollMessage(message);
      } else {
        this.sendWebSocketMessage(message);
      }
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.baseDelayMs * Math.pow(2, this.reconnectAttempts);

    this.reconnectTimeoutId = setTimeout(() => {
      // Re-check if we should use long-polling
      this.isUsingLongPolling = this.shouldUseLongPolling();
      this.connect();
    }, delay);
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    // Clear WebSocket
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;

      try {
        this.socket.close();
      } catch (e) {}
      this.socket = null;
    }

    // Clear long-polling
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.isPolling = false;
    this.isConnected = false;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }

  /**
   * Reconnect with current settings
   */
  reconnect() {
    this.cleanup();
    this.connect();
  }

  /**
   * Check current connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isUsingLongPolling: this.isUsingLongPolling,
      messageQueueLength: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}