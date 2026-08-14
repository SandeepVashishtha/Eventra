/**
 * sseConnectionManager
 * --------------------
 * A shared, reference-counted Server-Sent Events (SSE) connection manager.
 *
 * Every `useRealTimeConnection` consumer that subscribes to the same stream
 * path now shares a SINGLE underlying `EventSource`. The physical connection is
 * opened lazily on the first subscriber and is closed only once the last
 * subscriber for that path unmounts (no leaks, no duplicate connections).
 *
 * Reconnections use exponential backoff with jitter so a flapping backend does
 * not trigger a thundering herd of reconnect attempts.
 */

const SSE_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
};

const BASE_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;
const JITTER_MS = 1000;

function getSseBaseUrl() {
  if (typeof window !== "undefined") {
    return (
      import.meta.env?.VITE_API_URL ||
      import.meta.env?.REACT_APP_API_URL ||
      "http://localhost:8080/api/v1"
    );
  }
  return "http://localhost:8080/api/v1";
}

class SseConnectionManager {
  constructor() {
    // path -> {
    //   refCount, subscribers: Set, statusListeners: Set,
    //   eventSource, status, attempts, timer
    // }
    this.connections = new Map();
  }

  subscribe(path, onMessage, onStatus) {
    if (!path) {
      // Nothing to subscribe to; return a no-op unsubscribe.
      return () => {};
    }

    let entry = this.connections.get(path);
    if (!entry) {
      entry = {
        refCount: 0,
        subscribers: new Set(),
        statusListeners: new Set(),
        eventSource: null,
        status: SSE_STATUS.IDLE,
        attempts: 0,
        timer: null,
      };
      this.connections.set(path, entry);
    }

    entry.refCount += 1;
    if (onMessage) entry.subscribers.add(onMessage);
    if (onStatus) {
      entry.statusListeners.add(onStatus);
      // Immediately report the current status to the new listener.
      onStatus(path, entry.status);
    }

    if (!entry.eventSource) {
      this.openEventSource(path);
    }

    return () => {
      const current = this.connections.get(path);
      if (!current) return;

      current.refCount -= 1;
      if (onMessage) current.subscribers.delete(onMessage);
      if (onStatus) current.statusListeners.delete(onStatus);

      // Only tear down the physical connection once the last consumer leaves.
      if (current.refCount <= 0) {
        this.closeEventSource(path);
        this.connections.delete(path);
      }
    };
  }

  reconnect(path) {
    const entry = this.connections.get(path);
    if (!entry) return;

    this.closeEventSource(path);
    // A manual reconnect starts immediately (bypassing backoff).
    this.openEventSource(path);
  }

  openEventSource(path) {
    const entry = this.connections.get(path);
    if (!entry || entry.eventSource) return;

    const url = `${getSseBaseUrl()}${path}`;
    this.setStatus(path, SSE_STATUS.CONNECTING);

    const source = new EventSource(url, { withCredentials: true });
    entry.eventSource = source;

    source.onopen = () => {
      entry.attempts = 0;
      this.setStatus(path, SSE_STATUS.CONNECTED);
    };

    source.onmessage = (evt) => {
      this.dispatchMessage(path, evt);
    };

    if (typeof source.addEventListener === "function") {
      ["availability", "init", "notification", "leaderboard", "analytics"].forEach(
        (name) => {
          try {
            source.addEventListener(name, (evt) => this.dispatchMessage(path, evt));
          } catch {
            // Unsupported event type on this browser; ignore.
          }
        }
      );
    }

    source.onerror = () => {
      this.closeEventSource(path);
      this.scheduleReconnect(path);
    };
  }

  scheduleReconnect(path) {
    const entry = this.connections.get(path);
    if (!entry || entry.timer) return;

    entry.attempts += 1;
    // Exponential backoff capped at MAX_RECONNECT_MS plus random jitter.
    const backoff = Math.min(
      MAX_RECONNECT_MS,
      BASE_RECONNECT_MS * Math.pow(2, entry.attempts - 1)
    );
    const delay = backoff + Math.floor(Math.random() * JITTER_MS);

    this.setStatus(path, SSE_STATUS.RECONNECTING);

    entry.timer = setTimeout(() => {
      const current = this.connections.get(path);
      if (!current) return;
      current.timer = null;
      // Only reopen if there are still subscribers waiting.
      if (current.refCount > 0 && !current.eventSource) {
        this.openEventSource(path);
      }
    }, delay);
  }

  closeEventSource(path) {
    const entry = this.connections.get(path);
    if (!entry) return;

    if (entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
    if (entry.eventSource) {
      entry.eventSource.close();
      entry.eventSource = null;
    }
  }

  dispatchMessage(path, evt) {
    const entry = this.connections.get(path);
    if (!entry) return;

    let payload = evt.data;
    try {
      payload = JSON.parse(evt.data);
    } catch {
      // Not JSON; pass the raw string through.
    }

    // Ignore heartbeat/ping frames.
    if (payload && payload.type === "ping") return;
    if (evt.type === "ping") return;

    entry.subscribers.forEach((cb) => {
      try {
        cb(payload, evt.type);
      } catch (err) {
        // Isolate a failing subscriber from the others.
        if (typeof console !== "undefined") {
          console.error(`[sseConnectionManager] subscriber error for ${path}:`, err);
        }
      }
    });
  }

  setStatus(path, status) {
    const entry = this.connections.get(path);
    if (!entry || entry.status === status) return;
    entry.status = status;
    entry.statusListeners.forEach((cb) => {
      try {
        cb(path, status);
      } catch {
        // Ignore listener errors.
      }
    });
  }
}

export const sseConnectionManager = new SseConnectionManager();
export { SSE_STATUS as SSE_CONNECTION_STATUS };
export default SseConnectionManager;
