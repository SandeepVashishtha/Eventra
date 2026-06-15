export class InMemoryLockManager {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key, ttlMs = 30000) {
    if (!this.locks.has(key)) {
      this.locks.set(key, []);
    }

    const queue = this.locks.get(key);

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

    if (queue.length === 1) {
      // First in line gets the lock immediately, no waiting/timeout required
    } else {
      entry.timeout = setTimeout(() => {
        const index = queue.indexOf(entry);
        if (index !== -1) {
          queue.splice(index, 1);
          if (queue.length === 0) {
            this.locks.delete(key);
          }
          rejectPromise(new Error("Lock acquisition timeout"));
        }
      }, ttlMs);
    }

    if (queue.length > 1) {
      try {
        await promise;
      } catch (err) {
        throw err;
      }
    }

    return () => {
      if (entry.released) return;
      entry.released = true;

      const index = queue.indexOf(entry);
      if (index !== -1) {
        queue.splice(index, 1);
      }

      if (queue.length === 0) {
        this.locks.delete(key);
      } else {
        const nextEntry = queue[0];
        if (nextEntry.timeout) {
          clearTimeout(nextEntry.timeout);
          nextEntry.timeout = null;
        }
        nextEntry.resolve();
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

