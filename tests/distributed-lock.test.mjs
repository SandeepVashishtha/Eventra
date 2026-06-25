/**
 * Distributed Lock Concurrency Tests
 * 
 * Tests for the distributed lock implementation covering:
 * - Mutual exclusion guarantees
 * - Lock expiration behavior
 * - FIFO ordering of queued waiters
 * - Ownership safety
 * - Backward compatibility
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('Distributed Lock - Mutual Exclusion', () => {
  beforeEach(async () => {
    const { resetLockManager } = await import('../api/_lib/distributed-lock.js');
    resetLockManager();
  });

  it('should maintain exclusive access while protected function executes', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const executionLog = [];
    const criticalSectionActive = new Set();

    async function simulateSlowOperation(callerId, durationMs) {
      executionLog.push(`[${callerId}] ENTERING`);
      criticalSectionActive.add(callerId);
      
      if (criticalSectionActive.size > 1) {
        executionLog.push(`CONCURRENCY BUG: ${Array.from(criticalSectionActive).join(' and ')}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, durationMs));
      
      criticalSectionActive.delete(callerId);
      executionLog.push(`[${callerId}] EXITING`);
    }

    // Caller A takes 200ms
    const callerA = withLock('test-key-1', async () => {
      await simulateSlowOperation('A', 200);
    });

    // Wait 50ms then Caller B tries to acquire
    await new Promise(resolve => setTimeout(resolve, 50));
    const callerB = withLock('test-key-1', async () => {
      await simulateSlowOperation('B', 50);
    });

    await Promise.all([callerA, callerB]);

    // Verify no concurrent execution
    const hasConcurrencyBug = executionLog.some(log => log.includes('CONCURRENCY BUG'));
    assert.strictEqual(hasConcurrencyBug, false, 'Critical sections should not overlap');
    
    // Verify A completed before B started
    const aEnterIndex = executionLog.findIndex(log => log.includes('[A] ENTERING'));
    const aExitIndex = executionLog.findIndex(log => log.includes('[A] EXITING'));
    const bEnterIndex = executionLog.findIndex(log => log.includes('[B] ENTERING'));
    
    assert.ok(aExitIndex < bEnterIndex, 'Caller A should exit before Caller B enters');
  });

  it('should prevent concurrent execution with multiple callers', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const executionOrder = [];
    const activeCount = { value: 0 };
    let maxConcurrent = 0;

    async function task(id) {
      executionOrder.push(`${id}-start`);
      activeCount.value++;
      maxConcurrent = Math.max(maxConcurrent, activeCount.value);
      await new Promise(resolve => setTimeout(resolve, 20));
      activeCount.value--;
      executionOrder.push(`${id}-end`);
    }

    // Launch 5 concurrent tasks
    const tasks = ['A', 'B', 'C', 'D', 'E'].map(id => 
      withLock('test-key-2', () => task(id))
    );

    await Promise.all(tasks);

    // Verify sequential execution (max concurrent should be 1)
    assert.strictEqual(maxConcurrent, 1, 'Only one task should execute at a time');
    
    // Verify no overlapping starts/ends
    for (let i = 0; i < executionOrder.length - 1; i++) {
      const current = executionOrder[i];
      const next = executionOrder[i + 1];
      const currentId = current.split('-')[0];
      const nextId = next.split('-')[0];
      
      // If current is start, next should be end of same task or start of different task
      // But never start of different task before end of current
      if (current.endsWith('-start') && next.endsWith('-start')) {
        assert.fail(`Task ${nextId} started before ${currentId} ended`);
      }
    }
  });
});

describe('Distributed Lock - FIFO Ordering', () => {
  beforeEach(async () => {
    const { resetLockManager } = await import('../api/_lib/distributed-lock.js');
    resetLockManager();
  });

  it('should maintain FIFO order for queued waiters', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const executionLog = [];

    // Caller A acquires first
    const callerA = withLock('test-key-3', async () => {
      executionLog.push('A-start');
      await new Promise(resolve => setTimeout(resolve, 50));
      executionLog.push('A-end');
    });

    // Caller B queues immediately
    const callerB = withLock('test-key-3', async () => {
      executionLog.push('B-start');
      await new Promise(resolve => setTimeout(resolve, 30));
      executionLog.push('B-end');
    });

    // Caller C queues immediately
    const callerC = withLock('test-key-3', async () => {
      executionLog.push('C-start');
      await new Promise(resolve => setTimeout(resolve, 20));
      executionLog.push('C-end');
    });

    await Promise.all([callerA, callerB, callerC]);

    // Verify A -> B -> C order
    const aStart = executionLog.indexOf('A-start');
    const aEnd = executionLog.indexOf('A-end');
    const bStart = executionLog.indexOf('B-start');
    const bEnd = executionLog.indexOf('B-end');
    const cStart = executionLog.indexOf('C-start');
    const cEnd = executionLog.indexOf('C-end');

    assert.ok(aStart < aEnd, 'A should start before ending');
    assert.ok(aEnd < bStart, 'A should end before B starts');
    assert.ok(bStart < bEnd, 'B should start before ending');
    assert.ok(bEnd < cStart, 'B should end before C starts');
    assert.ok(cStart < cEnd, 'C should start before ending');
  });

  it('should prevent waiter bypass with delayed arrivals', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const executionLog = [];

    // Caller A acquires
    const callerA = withLock('test-key-4', async () => {
      executionLog.push('A-start');
      await new Promise(resolve => setTimeout(resolve, 100));
      executionLog.push('A-end');
    });

    // Caller B queues immediately
    const callerB = withLock('test-key-4', async () => {
      executionLog.push('B-start');
      await new Promise(resolve => setTimeout(resolve, 50));
      executionLog.push('B-end');
    });

    // Wait 60ms, then Caller C arrives
    await new Promise(resolve => setTimeout(resolve, 60));
    const callerC = withLock('test-key-4', async () => {
      executionLog.push('C-start');
      await new Promise(resolve => setTimeout(resolve, 30));
      executionLog.push('C-end');
    });

    await Promise.all([callerA, callerB, callerC]);

    // Verify C didn't bypass B
    const bStart = executionLog.indexOf('B-start');
    const bEnd = executionLog.indexOf('B-end');
    const cStart = executionLog.indexOf('C-start');

    assert.ok(bEnd < cStart, 'Caller B should complete before Caller C starts (no bypass)');
  });
});

describe('Distributed Lock - Ownership Safety', () => {
  beforeEach(async () => {
    const { resetLockManager } = await import('../api/_lib/distributed-lock.js');
    resetLockManager();
  });

  it('should prevent stale release from affecting newer lock', async () => {
    const { getLockManager } = await import('../api/_lib/distributed-lock.js');
    const manager = getLockManager();
    
    // First acquisition
    const release1 = await manager.acquire('test-key-5');
    
    // Second acquisition (queues behind first)
    const release2Promise = manager.acquire('test-key-5');
    
    // Release first lock
    release1();
    
    // Second lock should now be acquired
    const release2 = await release2Promise;
    
    // Try to release first lock again (should be idempotent)
    release1();
    
    // Second lock should still be held
    // Verify by trying to acquire a third lock
    const release3Promise = manager.acquire('test-key-5');
    let acquired = false;
    release3Promise.then(() => { acquired = true; });
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    assert.strictEqual(acquired, false, 'Third lock should not acquire while second is held');
    
    // Release second lock
    release2();
    
    // Now third should acquire
    await release3Promise;
  });

  it('should handle multiple releases gracefully', async () => {
    const { getLockManager } = await import('../api/_lib/distributed-lock.js');
    const manager = getLockManager();
    
    const release = await manager.acquire('test-key-6');
    
    // Release multiple times (should be idempotent)
    release();
    release();
    release();
    
    // Should not throw and should allow new acquisition
    const release2 = await manager.acquire('test-key-6');
    release2();
  });
});

describe('Distributed Lock - Backward Compatibility', () => {
  beforeEach(async () => {
    const { resetLockManager } = await import('../api/_lib/distributed-lock.js');
    resetLockManager();
  });

  it('should support withLock API with default TTL', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    let executed = false;
    await withLock('test-key-7', async () => {
      executed = true;
    });
    
    assert.strictEqual(executed, true);
  });

  it('should support withLock API with custom TTL', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    let executed = false;
    await withLock('test-key-8', async () => {
      executed = true;
    }, 5000);
    
    assert.strictEqual(executed, true);
  });

  it('should return result from protected function', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    const result = await withLock('test-key-9', async () => {
      return 42;
    });
    
    assert.strictEqual(result, 42);
  });

  it('should propagate errors from protected function', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    await assert.rejects(
      async () => {
        await withLock('test-key-10', async () => {
          throw new Error('Test error');
        });
      },
      /Test error/
    );
  });

  it('should release lock even if function throws', async () => {
    const { withLock, getLockManager } = await import('../api/_lib/distributed-lock.js');
    const manager = getLockManager();
    
    try {
      await withLock('test-key-11', async () => {
        throw new Error('Test error');
      });
    } catch (e) {
      // Expected
    }
    
    // Lock should be released, allowing new acquisition
    const release = await manager.acquire('test-key-11');
    release();
  });

  it('should support Infinity TTL', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    let executed = false;
    await withLock('test-key-12', async () => {
      executed = true;
    }, Infinity);
    
    assert.strictEqual(executed, true);
  });
});

describe('Distributed Lock - Edge Cases', () => {
  beforeEach(async () => {
    const { resetLockManager } = await import('../api/_lib/distributed-lock.js');
    resetLockManager();
  });

  it('should handle different keys independently', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const executionLog = [];

    const task1 = withLock('key-1', async () => {
      executionLog.push('key1-start');
      await new Promise(resolve => setTimeout(resolve, 50));
      executionLog.push('key1-end');
    });

    const task2 = withLock('key-2', async () => {
      executionLog.push('key2-start');
      await new Promise(resolve => setTimeout(resolve, 50));
      executionLog.push('key2-end');
    });

    await Promise.all([task1, task2]);

    // Both should be able to execute concurrently (different keys)
    const key1Start = executionLog.indexOf('key1-start');
    const key2Start = executionLog.indexOf('key2-start');
    
    // They should start close to each other (concurrent)
    assert.ok(Math.abs(key1Start - key2Start) <= 1, 'Different keys should allow concurrent execution');
  });

  it('should handle zero TTL', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    
    let executed = false;
    await withLock('test-key-13', async () => {
      executed = true;
    }, 0);
    
    assert.strictEqual(executed, true);
  });

  it('should handle rapid sequential acquisitions', async () => {
    const { withLock } = await import('../api/_lib/distributed-lock.js');
    const count = 10;
    const results = [];

    for (let i = 0; i < count; i++) {
      const result = await withLock('test-key-14', async () => {
        return i;
      });
      results.push(result);
    }

    // Verify all executed in order
    assert.deepStrictEqual(results, Array.from({ length: count }, (_, i) => i));
  });
});
