/**
 * Leak-Free WebSocket Connection & Backoff Manager (#14080)
 */

export class WebSocketConnectionManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectTimeoutId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseDelayMs = 1000;
  }

  connect(onOpen = () => {}, onClose = () => {}) {
    this.cleanup();

    // In non-browser environment, we simulate a connecting state
    if (typeof WebSocket === "undefined") {
      this.reconnectTimeoutId = setTimeout(() => {
        onOpen();
      }, 50);
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        onOpen();
      };

      this.socket.onclose = () => {
        onClose();
        this.scheduleReconnection(onOpen, onClose);
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (err) {
      this.scheduleReconnection(onOpen, onClose);
    }
  }

  scheduleReconnection(onOpen, onClose) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.baseDelayMs * Math.pow(2, this.reconnectAttempts);

    this.reconnectTimeoutId = setTimeout(() => {
      this.connect(onOpen, onClose);
    }, delay);
  }

  cleanup() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.socket) {
      // Clear references to prevent garbage collection leaks
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;

      try {
        this.socket.close();
      } catch (e) {}
      this.socket = null;
    }
  }
}
