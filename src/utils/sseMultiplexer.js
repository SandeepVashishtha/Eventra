import { logger } from "./logger.js";

const MULTIPLEX_CHANNEL_NAME = "eventra_sse_multiplexer";
const LOCK_NAME = "eventra_sse_leader_lock";
const HEARTBEAT_KEY = "eventra_sse_leader_heartbeat";

const resolveSseBaseUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const configuredUrl =
    process.env.VITE_SSE_URL
    || process.env.VITE_API_URL
    || process.env.REACT_APP_SSE_URL
    || process.env.REACT_APP_API_URL;

  if (!configuredUrl) {
    return null;
  }

  return configuredUrl.replace(/\/$/, "");
};

// Unique identifier for this tab instance
const TAB_ID = Math.random().toString(36).substring(2, 9);

class SseMultiplexer {
  constructor() {
    this.tabId = TAB_ID;
    this.isLeader = false;
    this.localSubscriptions = new Map(); // path -> Set of local callbacks
    this.globalSubscribers = new Map(); // path -> Set of tabIds
    this.activeEventSources = new Map(); // path -> EventSource instance
    this.pathStatuses = new Map(); // path -> status string
    this.statusListeners = new Set(); // callbacks listening to status changes

    if (typeof window !== "undefined") {
      this.channel = new BroadcastChannel(MULTIPLEX_CHANNEL_NAME);
      this.channel.onmessage = (e) => this.handleBroadcastMessage(e.data);

      this.setupLeaderElection();
      
      // Sync on page close / unload
      window.addEventListener("beforeunload", () => this.teardown());
    }
  }

  // --- 1. Leadership Election Management ---
  setupLeaderElection() {
    if (typeof navigator?.locks?.request === "function") {
      // Modern Browsers: Web Locks API provides automatic, zero-latency coordination
      navigator.locks.request(LOCK_NAME, async () => {
        logger.log(`[SSE Multiplexer] Tab ${this.tabId} acquired lock and became LEADER.`);
        this.isLeader = true;
        this.queryGlobalSubscribers();
        this.reconcileConnections();

        // Keep the lock active until tab unloads/unmounts
        await new Promise((resolve) => {
          this.releaseLockPromise = resolve;
        });
      }).catch((err) => {
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
            // Active leader exists
            return;
          }
        } catch {}
      }

      // Try to claim leadership
      this.claimLocalStorageLeadership();
    };

    this.localStorageInterval = setInterval(checkLeader, HEARTBEAT_INTERVAL);
    checkLeader();
  }

  claimLocalStorageLeadership() {
    this.isLeader = true;
    logger.log(`[SSE Multiplexer] Tab ${this.tabId} claimed leadership via LocalStorage.`);

    // Write an immediate heartbeat so other tabs see the new leader without
    // waiting up to HEARTBEAT_INTERVAL (3 s) for the first interval tick.
    const writeHeartbeat = () => {
      try {
        localStorage.setItem(
          HEARTBEAT_KEY,
          JSON.stringify({ tabId: this.tabId, timestamp: Date.now() }),
        );
      } catch {
        // localStorage unavailable — non-fatal, leadership still held in memory
      }
    };
    writeHeartbeat();

    // Heartbeat loop — keep the entry fresh while leadership is held
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
      // Immediately notify client of current status
      statusCallback(path, this.pathStatuses.get(path) || "idle");
    }

    // Trigger local connection check if we are leader
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
      const source = this.activeEventSources.get(path);
      if (source) {
        source.close();
        this.activeEventSources.delete(path);
      }
      this.openEventSource(path);
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
            paths: Array.from(this.localSubscriptions.keys())
          });
        }
        break;

      case "SUBSCRIBERS_RESPONSE":
        if (msg.paths) {
          msg.paths.forEach((p) => this.addGlobalSubscriber(p, msg.tabId));
          if (this.isLeader) this.reconcileConnections();
        }
        break;

      case "SSE_MESSAGE":
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

      default:
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

  // --- 4. EventSource Lifecycle Management (Leader-Only) ---
  reconcileConnections() {
    if (!this.isLeader) return;

    // Get all paths that have at least one subscriber across all tabs
    const activePaths = new Set([
      ...Array.from(this.localSubscriptions.keys()),
      ...Array.from(this.globalSubscribers.keys())
    ]);

    // Close EventSources for paths that are no longer active
    for (const [path, source] of this.activeEventSources.entries()) {
      if (!activePaths.has(path)) {
        logger.log(`[SSE Multiplexer] Closing inactive connection to path: ${path}`);
        source.close();
        this.activeEventSources.delete(path);
        this.updatePathStatus(path, "idle");
      }
    }

    // Open EventSources for newly active paths
    for (const path of activePaths) {
      if (!this.activeEventSources.has(path)) {
        this.openEventSource(path);
      }
    }
  }

  openEventSource(path) {
    const sseBaseUrl = resolveSseBaseUrl();

    if (!sseBaseUrl) {
      logger.warn(`[SSE Multiplexer] Skipping EventSource for ${path}: SSE base URL is not configured`);
      this.updatePathStatus(path, "error");
      return;
    }

    logger.log(`[SSE Multiplexer] Leader tab opening physical EventSource: ${sseBaseUrl}${path}`);
    this.updatePathStatus(path, "connecting");

    const source = new EventSource(`${sseBaseUrl}${path}`, { withCredentials: true });
    this.activeEventSources.set(path, source);

    source.onopen = () => {
      this.updatePathStatus(path, "connected");
    };

    source.onmessage = (evt) => {
      let payload = evt.data;
      try {
        payload = JSON.parse(evt.data);
      } catch {}

      // Dispatch locally
      this.dispatchLocalMessage(path, payload, evt.type);

      // Broadcast to follower tabs
      this.broadcastMessage({
        type: "SSE_MESSAGE",
        path,
        data: payload,
        eventType: evt.type
      });
    };

    source.onerror = () => {
      this.updatePathStatus(path, "reconnecting");
    };
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
    
    // Broadcast status to other tabs if we are the leader
    if (this.isLeader) {
      this.broadcastMessage({ type: "SSE_STATUS", path, status });
    }

    // Trigger local status listeners
    this.statusListeners.forEach((listener) => {
      try {
        listener(path, status);
      } catch (err) {
        logger.error("[SSE Multiplexer] Error inside status listener callback:", err);
      }
    });
  }

  // --- 5. Unload Cleanup ---
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

    // Close all physical EventSources if we were the leader
    for (const source of this.activeEventSources.values()) {
      source.close();
    }
    this.activeEventSources.clear();

    if (this.releaseLockPromise) {
      this.releaseLockPromise();
    }

    if (this.localStorageInterval) clearInterval(this.localStorageInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    // Remove the heartbeat key from localStorage when this tab was the leader.
    //
    // Without this, the stale heartbeat persists after the tab closes. Remaining
    // tabs read it in checkLeader() and see `now - parsed.timestamp < HEARTBEAT_TIMEOUT`
    // (7 000 ms) as still valid, so they refuse to claim leadership for up to 7
    // seconds. During that window no tab owns an SSE connection and real-time
    // updates are silently dropped for all users.
    //
    // A browser crash bypasses beforeunload so the key may still linger —
    // setupLocalStorageElection already handles that via the HEARTBEAT_TIMEOUT
    // expiry. This removal covers the clean-close path.
    if (this.isLeader) {
      try {
        localStorage.removeItem(HEARTBEAT_KEY);
      } catch {
        // Non-fatal — the timeout mechanism in checkLeader will handle expiry
      }
    }
  }
}

// Export single singleton instance across entire application scope
export const sseMultiplexer = new SseMultiplexer();
