/**
 * Mutex-Guarded Serial Queue Offline Storage Manager (#14077)
 * Eliminates concurrent IndexedDB write transaction deadlock and lock contention conflicts.
 */

export class OfflineStorageQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.storage = new Map(); // Simulated memory storage representing IndexedDB store
  }

  /**
   * Push a transaction task sequentially into the queue mutex.
   */
  async enqueueWriteTask(key, data) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Simulate dynamic disk write latency
          await new Promise((res) => setTimeout(res, 50));
          this.storage.set(key, { ...data, key, timestamp: Date.now() });
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (err) {
          console.error("[OfflineStorageQueue] Execution error:", err);
        }
      }
    }

    this.isProcessing = false;
  }

  getItem(key) {
    return this.storage.get(key) || null;
  }

  clear() {
    this.storage.clear();
    this.queue = [];
    this.isProcessing = false;
  }
}
