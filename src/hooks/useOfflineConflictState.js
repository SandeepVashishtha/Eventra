/**
 * useOfflineConflictState
 *
 * Manages the full lifecycle of offline synchronization conflicts:
 *   - Maintains an ordered queue of pending conflicts
 *   - Tracks resolved conflict history (for audit/debug purposes)
 *   - Exposes methods to acknowledge, skip, or bulk-resolve conflicts
 *   - Provides metrics for display in UI (pending count, resolved count, etc.)
 *
 * This hook is separate from useOfflineSync so that the conflict UI can be
 * composed independently of the sync engine — any component or hook can
 * subscribe to the conflict queue without coupling to sync internals.
 *
 * Event contract
 * ─────────────
 * Listens for:   "eventra-offline-conflict"          (dispatched by useOfflineSync)
 * Dispatches:    "eventra-offline-conflict-resolved" (consumed by useOfflineSync)
 *
 * @module useOfflineConflictState
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';
import { reconcileState } from '../utils/offlineQueue';

// How long (ms) the UI keeps a resolved conflict in history before pruning
const HISTORY_RETENTION_MS = 5 * 60 * 1_000; // 5 minutes

// Max conflicts we keep in unresolved queue before auto-discarding oldest
const MAX_PENDING_CONFLICTS = 20;

/**
 * Resolution strategies available to the user.
 * @readonly
 * @enum {string}
 */
export const RESOLUTION_STRATEGY = Object.freeze({
  LOCAL:  'local',   // Keep the local (offline) version
  SERVER: 'server',  // Keep the server (remote) version
  MERGE:  'merge',   // Apply a per-field merge / custom override
});

/**
 * @typedef {object} ConflictEntry
 * @property {string}  id            - Unique ID matching the offline queue item id
 * @property {object}  item          - Full offline queue item (contains payload, endpoint, etc.)
 * @property {object}  serverState   - Server-returned state that conflicts with local
 * @property {object}  report        - Result of reconcileState() — field diffs, versions, timestamps
 * @property {number}  receivedAt    - Unix timestamp (ms) when the conflict was received
 */

/**
 * @typedef {object} ResolvedConflictEntry
 * @property {string}  id            - Offline queue item id
 * @property {string}  strategy      - One of RESOLUTION_STRATEGY values
 * @property {object}  mergedPayload - Final payload that was submitted (if merge strategy)
 * @property {number}  resolvedAt    - Unix timestamp (ms) when resolved
 */

/**
 * useOfflineConflictState()
 *
 * @returns {{
 *   pendingConflicts: ConflictEntry[],
 *   activeConflict:   ConflictEntry | null,
 *   history:          ResolvedConflictEntry[],
 *   pendingCount:     number,
 *   resolvedCount:    number,
 *   resolveActive:    (strategy: string, mergedPayload?: object) => void,
 *   skipActive:       () => void,
 *   resolveAll:       (strategy: string) => void,
 *   clearHistory:     () => void,
 * }}
 */
const useOfflineConflictState = () => {
  // Queue of unresolved conflicts — first item is the "active" one shown to the user
  const [pendingConflicts, setPendingConflicts] = useState([]);
  // Resolved conflict history (kept for diagnostic display)
  const [history, setHistory] = useState([]);

  // Ref to allow stable callback identity in event listeners
  const pendingRef = useRef(pendingConflicts);
  useEffect(() => {
    pendingRef.current = pendingConflicts;
  }, [pendingConflicts]);

  // ─── Listen for new conflict events from useOfflineSync ───────────────────
  useEffect(() => {
    const handleConflictEvent = (e) => {
      const { item, serverState } = e.detail || {};
      if (!item || !item.id) {
        logger.warn('[useOfflineConflictState] Received malformed conflict event — ignoring');
        return;
      }

      // Deduplicate: if we already have a conflict for this item id, ignore
      if (pendingRef.current.some((c) => c.id === item.id)) {
        logger.log(`[useOfflineConflictState] Duplicate conflict for item ${item.id} — skipping`);
        return;
      }

      // Run reconciliation to compute field-level diff report
      let report;
      try {
        report = reconcileState(item, serverState);
      } catch (err) {
        logger.error('[useOfflineConflictState] reconcileState threw unexpectedly:', err);
        report = { hasConflict: true, conflicts: [], localVersion: 1, serverVersion: 1 };
      }

      /** @type {ConflictEntry} */
      const entry = {
        id: item.id,
        item,
        serverState: serverState || {},
        report,
        receivedAt: Date.now(),
      };

      setPendingConflicts((prev) => {
        // Hard cap to prevent unbounded growth
        const trimmed = prev.length >= MAX_PENDING_CONFLICTS ? prev.slice(1) : prev;
        return [...trimmed, entry];
      });

      logger.log(`[useOfflineConflictState] Conflict queued for item ${item.id}. ` +
        `Fields differing: ${report.conflicts.length}. ` +
        `Local v${report.localVersion} ↔ Server v${report.serverVersion}`);
    };

    window.addEventListener('eventra-offline-conflict', handleConflictEvent);
    return () => window.removeEventListener('eventra-offline-conflict', handleConflictEvent);
  }, []); // empty deps — stable listener using pendingRef

  // ─── Prune stale history entries ─────────────────────────────────────────
  useEffect(() => {
    if (history.length === 0) return;
    const interval = setInterval(() => {
      const cutoff = Date.now() - HISTORY_RETENTION_MS;
      setHistory((prev) => prev.filter((h) => h.resolvedAt >= cutoff));
    }, 60_000);
    return () => clearInterval(interval);
  }, [history.length]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const activeConflict = pendingConflicts[0] ?? null;
  const pendingCount   = pendingConflicts.length;
  const resolvedCount  = history.length;

  // ─── Internal: emit resolution event and advance queue ────────────────────
  const _emitResolution = useCallback((conflictId, strategy, mergedPayload) => {
    window.dispatchEvent(
      new CustomEvent('eventra-offline-conflict-resolved', {
        detail: {
          itemId:        conflictId,
          resolution:    strategy,
          mergedPayload: mergedPayload ?? null,
        },
      })
    );

    // Move from pending to history
    setPendingConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    setHistory((prev) => [
      ...prev,
      {
        id:            conflictId,
        strategy,
        mergedPayload: mergedPayload ?? null,
        resolvedAt:    Date.now(),
      },
    ]);

    logger.log(`[useOfflineConflictState] Resolved conflict ${conflictId} via strategy="${strategy}"`);
  }, []);

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Resolve the currently active (first in queue) conflict.
   *
   * @param {string}  strategy      - One of RESOLUTION_STRATEGY values
   * @param {object}  [mergedPayload] - For "merge" strategy: the field-merged payload
   */
  const resolveActive = useCallback((strategy, mergedPayload) => {
    if (!activeConflict) return;
    _emitResolution(activeConflict.id, strategy, mergedPayload);
  }, [activeConflict, _emitResolution]);

  /**
   * Skip the active conflict for now — push it to the back of the queue
   * so the user can deal with other conflicts first.
   */
  const skipActive = useCallback(() => {
    if (!activeConflict) return;
    logger.log(`[useOfflineConflictState] Skipping conflict ${activeConflict.id} — moving to back of queue`);
    setPendingConflicts((prev) => {
      if (prev.length <= 1) return prev; // nothing to skip
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, [activeConflict]);

  /**
   * Bulk-resolve all pending conflicts using the same strategy.
   * Useful for "keep all server" or "keep all local" scenarios.
   *
   * @param {string} strategy - One of RESOLUTION_STRATEGY values
   */
  const resolveAll = useCallback((strategy) => {
    const snapshot = [...pendingRef.current];
    snapshot.forEach((conflict) => {
      _emitResolution(conflict.id, strategy, null);
    });
    logger.log(`[useOfflineConflictState] Bulk-resolved ${snapshot.length} conflict(s) via strategy="${strategy}"`);
  }, [_emitResolution]);

  /**
   * Clear the resolved conflict history.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    pendingConflicts,
    activeConflict,
    history,
    pendingCount,
    resolvedCount,
    resolveActive,
    skipActive,
    resolveAll,
    clearHistory,
  };
};

export default useOfflineConflictState;
