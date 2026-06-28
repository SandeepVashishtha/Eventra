const LOCKS = new Map();

class Lock {
  constructor() {
    this.releaseFn = null;
    this.promise = new Promise((resolve) => {
      this.releaseFn = resolve;
    });
  }

  release() {
    if (this.releaseFn) {
      this.releaseFn();
      this.releaseFn = null;
    }
  }
}

class InMemoryLockManager {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key, ttlMs = 30000) {
    let lock = this.locks.get(key);
    const prevLock = lock;

    // Create new lock for this acquisition
    lock = new Lock();
    
    // Set the new lock in the map
    this.locks.set(key, lock);

    // Wait for previous lock to be released (FIFO ordering)
    if (prevLock) {
      await prevLock.promise;
    }

    // Note: TTL is ignored for in-memory locks to prevent
    // race conditions where timeout releases lock while
    // protected function is still executing.
    // In a distributed system with Redis, TTL would be handled
    // differently with proper ownership tracking.

    let released = false;
    let timeoutId = null;

    const releaseFn = () => {
      if (released) return;
      released = true;
      if (timeoutId) clearTimeout(timeoutId);
      
      // Release the lock
      lock.release();
      
      // Only delete from map if this is still the current lock
      // This prevents deleting a newer lock that replaced this one
      if (this.locks.get(key) === lock) {
        this.locks.delete(key);
      }
    };

    if (ttlMs > 0) {
      timeoutId = setTimeout(() => {
        releaseFn();
      }, ttlMs);
    }

    return releaseFn;
  }
}

let instance = null;

export function getLockManager() {
  if (!instance) {
    instance = new InMemoryLockManager();
  }
  return instance;
}

// For testing only - reset the singleton instance
export function resetLockManager() {
  instance = null;
}

export async function withLock(key, fn, ttlMs = 30000) {
  const manager = getLockManager();
  const release = await manager.acquire(key, ttlMs);
  try {
    return await fn();
  } finally {
    release();
  }
}
