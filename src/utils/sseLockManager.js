/**
 * SSE Lock Manager for Web Locks API & LocalStorage Leader Election
 * Handles lock acquisition, stale lease cleanup, heartbeat watchdogs,
 * and AbortController-driven garbage collection for multi-tab coordination.
 */

import { logger } from "./logger.js";

const DEFAULT_LOCK_NAME = "eventra_sse_leader_lock";
const DEFAULT_HEARTBEAT_KEY = "eventra_sse_leader_heartbeat";
const STALE_LEASE_TIMEOUT_MS = 3000;
const WATCHDOG_INTERVAL_MS = 1000;

export class SseLockManager {
  constructor(options = {}) {
    this.lockName = options.lockName || DEFAULT_LOCK_NAME;
    this.heartbeatKey = options.heartbeatKey || DEFAULT_HEARTBEAT_KEY;
    this.tabId = options.tabId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9));
    this.onLeadershipAcquired = options.onLeadershipAcquired || (() => {});
    this.onLeadershipLost = options.onLeadershipLost || (() => {});

    this.isLeader = false;
    this.abortController = typeof AbortController !== "undefined" ? new AbortController() : null;
    this.heartbeatTimer = null;
    this.watchdogTimer = null;
    this.releaseLockResolver = null;
  }

  /**
   * Acquire leadership lock using Web Locks API or LocalStorage fallback
   */
  async acquireLock() {
    if (typeof navigator !== "undefined" && navigator.locks?.request) {
      try {
        navigator.locks.request(
          this.lockName,
          { signal: this.abortController?.signal },
          async () => {
            this.setLeader(true);
            await new Promise((resolve) => {
              this.releaseLockResolver = resolve;
            });
            this.setLeader(false);
          }
        ).catch((err) => {
          if (err.name !== "AbortError") {
            logger.warn("[SseLockManager] Web Locks request aborted/failed, using LocalStorage fallback:", err);
            this.fallbackLocalStorageElection();
          }
        });
        return;
      } catch (err) {
        logger.warn("[SseLockManager] Web Locks exception, falling back:", err);
      }
    }

    this.fallbackLocalStorageElection();
  }

  fallbackLocalStorageElection() {
    this.cleanupTimers();

    const attemptClaim = () => {
      if (typeof localStorage === "undefined") return;

      const now = Date.now();
      const rawHeartbeat = localStorage.getItem(this.heartbeatKey);

      let isStale = true;
      if (rawHeartbeat) {
        try {
          const parsed = JSON.parse(rawHeartbeat);
          if (parsed && parsed.tabId !== this.tabId && now - parsed.timestamp < STALE_LEASE_TIMEOUT_MS) {
            isStale = false;
          }
        } catch {
          isStale = true;
        }
      }

      if (isStale) {
        this.writeHeartbeat();
        this.setLeader(true);
      }
    };

    attemptClaim();
    this.watchdogTimer = setInterval(() => {
      if (this.isLeader) {
        this.writeHeartbeat();
      } else {
        attemptClaim();
      }
    }, WATCHDOG_INTERVAL_MS);
  }

  writeHeartbeat() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        this.heartbeatKey,
        JSON.stringify({
          tabId: this.tabId,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      logger.warn("[SseLockManager] Failed to write localStorage heartbeat:", e);
    }
  }

  setLeader(status) {
    if (this.isLeader === status) return;
    this.isLeader = status;

    if (status) {
      this.writeHeartbeat();
      this.onLeadershipAcquired();
    } else {
      this.onLeadershipLost();
    }
  }

  cleanupTimers() {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Gracefully release leadership lock and clean up resources
   */
  release() {
    this.cleanupTimers();
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.releaseLockResolver) {
      this.releaseLockResolver();
      this.releaseLockResolver = null;
    }
    if (typeof localStorage !== "undefined" && this.isLeader) {
      try {
        const raw = localStorage.getItem(this.heartbeatKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.tabId === this.tabId) {
            localStorage.removeItem(this.heartbeatKey);
          }
        }
      } catch {}
    }
    this.setLeader(false);
  }
}

export default SseLockManager;
