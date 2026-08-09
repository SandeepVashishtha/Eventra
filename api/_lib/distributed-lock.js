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

    lock = new Lock();
    this.locks.set(key, lock);

    const timeout = setTimeout(() => {
      if (this.locks.get(key) === lock) {
        this.locks.delete(key);
        lock.release();
      }
    }, ttlMs);

    if (prevLock) {
      await prevLock.promise;
    }

    clearTimeout(timeout);

    let released = false;
    return () => {
      if (released) return;
      released = true;
      lock.release();
      if (this.locks.get(key) === lock) {
        this.locks.delete(key);
      }
    };
  }
}

let instance = null;

export function getLockManager() {
  if (!instance) {
    instance = new InMemoryLockManager();
  }
  return instance;
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
