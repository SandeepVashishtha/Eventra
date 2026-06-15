export class InMemoryLockManager {
  constructor() {
    this.locks = new Map();
  }

  _getOrCreateQueue(key) {
    if (!this.locks.has(key)) {
      this.locks.set(key, []);
    }
    return this.locks.get(key);
  }

  _cleanQueueIfEmpty(key, queue) {
    if (queue.length === 0) {
      this.locks.delete(key);
    }
  }

  _removeEntry(key, entry) {
    const queue = this.locks.get(key);
    if (!queue) return;
    const index = queue.indexOf(entry);
    if (index !== -1) {
      queue.splice(index, 1);
      this._cleanQueueIfEmpty(key, queue);
    }
  }

  _triggerNext(queue) {
    const nextEntry = queue[0];
    if (nextEntry) {
      this._clearTimeout(nextEntry);
      nextEntry.resolve();
    }
  }

  _clearTimeout(entry) {
    if (entry.timeout) {
      clearTimeout(entry.timeout);
      entry.timeout = null;
    }
  }

  async acquire(key, ttlMs = 30000) {
    const queue = this._getOrCreateQueue(key);

    let resolvePromise;
    let rejectPromise;
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const entry = {
      resolve: resolvePromise,
      reject: rejectPromise,
      timeout: null,
      released: false,
    };

    queue.push(entry);

    if (queue.length > 1) {
      entry.timeout = setTimeout(() => {
        this._removeEntry(key, entry);
        rejectPromise(new Error("Lock acquisition timeout"));
      }, ttlMs);

      await promise;
    }

    return () => {
      if (entry.released) return;
      entry.released = true;

      this._clearTimeout(entry);
      this._removeEntry(key, entry);

      const currentQueue = this.locks.get(key);
      if (currentQueue) {
        this._triggerNext(currentQueue);
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


