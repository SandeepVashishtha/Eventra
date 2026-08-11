import { logger } from "./logger.js";

const MULTIPLEX_CHANNEL_NAME = "eventra_sse_multiplexer";
const LOCK_NAME = "eventra_sse_leader_lock";
const HEARTBEAT_KEY = "eventra_sse_leader_heartbeat";
const TAB_ID = Math.random().toString(36).substring(2, 9);

export class SseMultiplexer {
  constructor(options = {}) {
    this.tabId = TAB_ID;
    this.isLeader = false;
    this.localSubscriptions = new Map(); // path -> Set of local callbacks
    this.globalSubscribers = new Map(); // path -> Set of tabIds
    this.activeEventSources = new Map(); // path -> EventSource instance
    this.pathStatuses = new Map(); // path -> status string
    this.statusListeners = new Set(); // callbacks listening to status changes

    // --- New Resiliency & Feature State ---
    this.lastEventIds = new Map(); // path -> string (Last-Event-ID)
    this.watchdogTimers = new Map(); // path -> timeout timer
    this.reconnectAttempts = new Map(); // path -> retry count
    this.getAuthToken = options.getAuthToken || null; // dynamic token resolver
    this.staleTimeoutMs = options.staleTimeoutMs || 45000; // 45s connection watchdog

    if (typeof window !== "undefined") {
      this.channel = new BroadcastChannel(MULTIPLEX_CHANNEL_NAME);
      this.channel.onmessage = (e) => this.handleBroadcastMessage(e.data);

      this.setupLeaderElection();
      window.addEventListener("beforeunload", () => this.teardown());
    }
  }

  // --- 1. Leadership Election Management ---
  setupLeaderElection() {
    if (typeof navigator?.locks?.request === "function") {
      navigator.locks
        .request(LOCK_NAME, async () => {
          logger.log(`[SSE Multiplexer] Tab ${this.tabId} acquired lock and became LEADER.`);
          this.isLeader = true;
          this.queryGlobalSubscribers();
          this.reconcileConnections();

          await new Promise((resolve) => {
            this.releaseLockPromise = resolve;
          });
        })
        .catch((err) => {
          logger.warn("[SSE Multiplexer] Web Locks election failed, falling back to LocalStorage:", err);
          this.setupLocalStorageElection();
        });
    } else {
      this.setupLocalStorageElection();
    }
  }

  setupLocalStorageElection() {
    const HEARTBEAT_INTERVAL = 3000;
    const HEARTBEAT_TIMEOUT = 7000;

    const checkLeader = () => {
      if (this.isLeader) return;

      const now = Date.now();
      const heartbeat = localStorage.getItem(HEARTBEAT_KEY);

      if (heartbeat) {
        try {
          const parsed = JSON.parse(heartbeat);
          if (parsed && now - parsed.timestamp < HEARTBEAT_TIMEOUT && parsed.tabId !== this.tabId) {
            return;
          }
        } catch {}
      }

      this.claimLocalStorageLeadership();
    };

    this.localStorageInterval = setInterval(checkLeader, HEARTBEAT_INTERVAL);
    checkLeader();
  }

  claimLocalStorageLeadership() {
    this.isLeader = true;
    logger.log(`[SSE Multiplexer] Tab ${this.tabId} claimed leadership via LocalStorage.`);

    const writeHeartbeat = () => {
      try {
        localStorage.setItem(
          HEARTBEAT_KEY,
          JSON.stringify({ tabId: this.tabId, timestamp: Date.now() })
        );
      } catch {}
    };
    writeHeartbeat();

    this.heartbeatInterval = setInterval(writeHeartbeat, 2000);
    this.queryGlobalSubscribers();
    this.reconcileConnections();
  }

  // --- 2. Subscription Management ---
  subscribe(path, callback, statusCallback) {
    if (!this.localSubscriptions.has(path)) {
      this.localSubscriptions.set(path, new Set());
      this.broadcastMessage({ type: "SUBSCRIBE", tabId: this.tabId, path });
      this.addGlobalSubscriber(path, this.tabId);
    }

    this.localSubscriptions.get(path).add(callback);
    if (statusCallback) {
      this.statusListeners.add(statusCallback);
      statusCallback(path, this.pathStatuses.get(path) || "idle");
    }

    if (this.isLeader) {
      this.reconcileConnections();
    }

    return () => {
      const subs = this.localSubscriptions.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.localSubscriptions.delete(path);
          this.broadcastMessage({ type: "UNSUBSCRIBE", tabId: this.tabId, path });
          this.removeGlobalSubscriber(path, this.tabId);

          if (this.isLeader) {
            this.reconcileConnections();
          }
        }
      }
      if (statusCallback) {
        this.statusListeners.delete(statusCallback);
      }
    };
  }

  reconnect(path) {
    if (this.isLeader) {
      this.closeEventSource(path);
      this.scheduleReconnect(path, 0); // Immediate forced reconnect
    } else {
      this.broadcastMessage({ type: "RECONNECT_REQUEST", tabId: this.tabId, path });
    }
  }

  // --- 3. Cross-Tab Message Routing ---
  broadcastMessage(message) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        logger.warn("[SSE Multiplexer] Broadcast post failed:", err);
      }
    }
  }

  handleBroadcastMessage(msg) {
    if (!msg || msg.tabId === this.tabId) return;

    switch (msg.type) {
      case "SUBSCRIBE":
        this.addGlobalSubscriber(msg.path, msg.tabId);
        if (this.isLeader) this.reconcileConnections();
        break;

      case "UNSUBSCRIBE":
        this.removeGlobalSubscriber(msg.path, msg.tabId);
        if (this.isLeader) this.reconcileConnections();
        break;

      case "UNSUBSCRIBE_ALL":
        if (msg.paths) {
          msg.paths.forEach((p) => this.removeGlobalSubscriber(p, msg.tabId));
          if (this.isLeader) this.reconcileConnections();
        }
        break;

      case "QUERY_SUBSCRIBERS":
        if (this.localSubscriptions.size > 0) {
          this.broadcastMessage({
            type: "SUBSCRIBERS_RESPONSE",
            tabId: this.tabId,
            paths: Array.from(this.localSubscriptions.keys()),
            lastEventIds: Object.fromEntries(this.lastEventIds),
          });
        }
        break;

      case "SUBSCRIBERS_RESPONSE":
        if (msg.paths) {
          msg.paths.forEach((p) => this.addGlobalSubscriber(p, msg.tabId));
        }
        if (msg.lastEventIds) {
          Object.entries(msg.lastEventIds).forEach(([path, lastId]) => {
            if (!this.lastEventIds.has(path)) this.lastEventIds.set(path, lastId);
          });
        }
        if (this.isLeader) this.reconcileConnections();
        break;

      case "SSE_MESSAGE":
        if (msg.lastEventId) {
          this.lastEventIds.set(msg.path, msg.lastEventId);
        }
        this.dispatchLocalMessage(msg.path, msg.data, msg.eventType);
        break;

      case "SSE_STATUS":
        this.updatePathStatus(msg.path, msg.status);
        break;

      case "RECONNECT_REQUEST":
        if (this.isLeader) {
          this.reconnect(msg.path);
        }
        break;
    }
  }

  addGlobalSubscriber(path, tabId) {
    if (!this.globalSubscribers.has(path)) {
      this.globalSubscribers.set(path, new Set());
    }
    this.globalSubscribers.get(path).add(tabId);
  }

  removeGlobalSubscriber(path, tabId) {
    const set = this.globalSubscribers.get(path);
    if (set) {
      set.delete(tabId);
      if (set.size === 0) {
        this.globalSubscribers.delete(path);
      }
    }
  }

  queryGlobalSubscribers() {
    this.broadcastMessage({ type: "QUERY_SUBSCRIBERS", tabId: this.tabId });
  }

  // --- 4. Connection Lifecycle & Watchdog Engine ---
  reconcileConnections() {
    if (!this.isLeader) return;

    const activePaths = new Set([
      ...Array.from(this.localSubscriptions.keys()),
      ...Array.from(this.globalSubscribers.keys()),
    ]);

    for (const [path] of this.activeEventSources.entries()) {
      if (!activePaths.has(path)) {
        logger.log(`[SSE Multiplexer] Closing inactive connection to path: ${path}`);
        this.closeEventSource(path);
        this.updatePathStatus(path, "idle");
      }
    }

    for (const path of activePaths) {
      if (!this.activeEventSources.has(path)) {
        this.openEventSource(path);
      }
    }
  }

  async openEventSource(path) {
    const sseBaseUrl =
      typeof window !== "undefined"
        ? process.env.VITE_API_URL ||
          process.env.REACT_APP_API_URL ||
          "http://localhost:8080/api/v1"
        : "http://localhost:8080/api/v1";

    let url = `${sseBaseUrl}${path}`;
    const urlParams = new URLSearchParams();

    // 1. Dynamic Auth Token Injection
    if (typeof this.getAuthToken === "function") {
      try {
        const token = await this.getAuthToken();
        if (token) urlParams.append("token", token);
      } catch (err) {
        logger.error("[SSE Multiplexer] Failed to retrieve auth token:", err);
      }
    }

    // 2. Last-Event-ID Failover Recovery
    const lastEventId = this.lastEventIds.get(path);
    if (lastEventId) {
      urlParams.append("lastEventId", lastEventId);
    }

    const queryString = urlParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    logger.log(`[SSE Multiplexer] Leader tab opening physical EventSource: ${url}`);
    this.updatePathStatus(path, "connecting");

    const source = new EventSource(url, { withCredentials: true });
    this.activeEventSources.set(path, source);
    this.resetWatchdog(path);

    source.onopen = () => {
      this.reconnectAttempts.set(path, 0); // Reset retry counter on success
      this.updatePathStatus(path, "connected");
      this.resetWatchdog(path);
    };

    source.onmessage = (evt) => {
      this.resetWatchdog(path);

      if (evt.lastEventId) {
        this.lastEventIds.set(path, evt.lastEventId);
      }

      let payload = evt.data;
      try {
        payload = JSON.parse(evt.data);
      } catch {}

      // Heartbeat message handler (ignore ping frames, reset watchdog)
      if (payload?.type === "ping" || evt.type === "ping") return;

      this.dispatchLocalMessage(path, payload, evt.type);

      this.broadcastMessage({
        type: "SSE_MESSAGE",
        path,
        data: payload,
        eventType: evt.type,
        lastEventId: evt.lastEventId,
      });
    };

    source.onerror = () => {
      this.clearWatchdog(path);
      this.closeEventSource(path);
      this.scheduleReconnect(path);
    };
  }

  // --- 5. Exponential Backoff & Watchdog Logic ---
  scheduleReconnect(path, overrideDelay) {
    if (!this.isLeader) return;

    const attempts = (this.reconnectAttempts.get(path) || 0) + 1;
    this.reconnectAttempts.set(path, attempts);

    // Exponential Backoff calculation: base 1s, max 30s + jitter
    const delay =
      overrideDelay !== undefined
        ? overrideDelay
        : Math.min(30000, Math.pow(2, attempts) * 1000) + Math.random() * 1000;

    logger.warn(`[SSE Multiplexer] Reconnecting ${path} in ${Math.round(delay)}ms (Attempt ${attempts})`);
    this.updatePathStatus(path, "reconnecting");

    setTimeout(() => {
      if (this.isLeader) {
        this.openEventSource(path);
      }
    }, delay);
  }

  resetWatchdog(path) {
    this.clearWatchdog(path);
    if (!this.isLeader || this.staleTimeoutMs <= 0) return;

    // Force disconnect and retry if no ping/data arrives before staleTimeoutMs
    this.watchdogTimers.set(
      path,
      setTimeout(() => {
        logger.warn(`[SSE Multiplexer] Connection stale for ${path}. Forcing reconnect.`);
        this.reconnect(path);
      }, this.staleTimeoutMs)
    );
  }

  clearWatchdog(path) {
    if (this.watchdogTimers.has(path)) {
      clearTimeout(this.watchdogTimers.get(path));
      this.watchdogTimers.delete(path);
    }
  }

  closeEventSource(path) {
    this.clearWatchdog(path);
    const source = this.activeEventSources.get(path);
    if (source) {
      source.close();
      this.activeEventSources.delete(path);
    }
  }

  dispatchLocalMessage(path, data, eventType) {
    const callbacks = this.localSubscriptions.get(path);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data, eventType);
        } catch (err) {
          logger.error(`[SSE Multiplexer] Error inside local message callback for ${path}:`, err);
        }
      });
    }
  }

  updatePathStatus(path, status) {
    this.pathStatuses.set(path, status);

    if (this.isLeader) {
      this.broadcastMessage({ type: "SSE_STATUS", path, status });
    }

    this.statusListeners.forEach((listener) => {
      try {
        listener(path, status);
      } catch (err) {
        logger.error("[SSE Multiplexer] Error inside status listener callback:", err);
      }
    });
  }

  // --- 6. Unload Cleanup ---
  teardown() {
    logger.log(`[SSE Multiplexer] Teardown triggered for tab: ${this.tabId}`);

    if (this.channel) {
      this.broadcastMessage({
        type: "UNSUBSCRIBE_ALL",
        tabId: this.tabId,
        paths: Array.from(this.localSubscriptions.keys()),
      });
      this.channel.close();
    }

    for (const path of this.activeEventSources.keys()) {
      this.closeEventSource(path);
    }

    if (this.releaseLockPromise) this.releaseLockPromise();
    if (this.localStorageInterval) clearInterval(this.localStorageInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    if (this.isLeader) {
      try {
        localStorage.removeItem(HEARTBEAT_KEY);
      } catch {}
    }
  }
}

export const sseMultiplexer = new SseMultiplexer();