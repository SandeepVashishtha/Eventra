/**
 * Sync Mutex Lock & Idempotency Key Manager for Offline IndexedDB Queue
 * Prevents double-submit race conditions and duplicate HTTP payloads during network recovery.
 */

export const QUEUE_ITEM_STATUS = {
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

export class SyncMutexLock {
  constructor() {
    this.isLocked = false;
    this.activeMutexId = null;
  }

  /**
   * Acquire atomic lock for queue flushing
   */
  async acquireLock() {
    if (this.isLocked) {
      return false; // Mutex already held by another flush invocation
    }
    this.isLocked = true;
    this.activeMutexId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `mutex-${Date.now()}`;
    return this.activeMutexId;
  }

  /**
   * Release atomic lock
   */
  releaseLock(mutexId) {
    if (this.activeMutexId === mutexId || !mutexId) {
      this.isLocked = false;
      this.activeMutexId = null;
      return true;
    }
    return false;
  }

  /**
   * Generate an Idempotency-Key UUID header payload for backend request deduplication
   */
  generateIdempotencyKey() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `idempotency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const globalSyncMutex = new SyncMutexLock();
export default globalSyncMutex;
