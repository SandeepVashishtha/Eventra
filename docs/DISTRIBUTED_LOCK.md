# In-Memory Distributed Lock Architecture

This document outlines the design and implementation of the `InMemoryLockManager` in `api/_lib/distributed-lock.js`. This module implements a local, in-memory distributed lock manager with FIFO execution ordering and timeout guarantees for concurrent operations.

## Problem Statement: The Overwrite Bug and Queue Starvation

In the previous implementation, lock acquisition worked by checking the current lock for a key and setting a new `Lock` instance in the map:
1. `this.locks.set(key, lock)` was called for every request.
2. If another request came in while the previous request held the lock, the new request overwrote the key in the map with its own `Lock` instance.
3. If multiple requests queued concurrently (e.g., Request A holds the lock, Request B waits, Request C waits), Request B was overwritten by Request C in the `this.locks` map.
4. When Request B's timeout triggered, the check `this.locks.get(key) === lock` failed because the map held Request C's lock.
5. Consequently, Request B's timeout callback could not delete the key or release Request B's lock. This resulted in an infinite deadlock chain: Request B waited forever on Request A, and Request C waited forever on Request B.

## Architecture & Design: FIFO Queue Lock Manager

To resolve the overwrite bug and prevent memory leaks and queue starvation, the lock manager has been redesigned to maintain a queue of requests (waiters) per key:

### 1. Key Map and Queue Structure
Instead of storing a single lock reference, the manager maintains:
```
this.locks = Map<string, QueueEntry[]>
```
Where each `QueueEntry` contains:
- `resolve`: The resolver function for the waiter's acquisition promise.
- `reject`: The rejecter function for when the waiter's acquisition times out.
- `timeout`: The `Timeout` object ID.
- `released`: A boolean flag representing whether the request has been processed/completed.

### 2. Lock Acquisition Flow
When a request calls `acquire(key, ttlMs)`:
1. It registers itself by pushing a new `QueueEntry` to the queue for that key.
2. **Immediate Acquisition**: If it is the only request in the queue (index `0`), it immediately acquires the lock and returns the release function. No timeout handler is set.
3. **Queue Wait & Timeout**: If other requests are ahead in the queue, it schedules a timeout handler. The request then `await`s its acquisition promise.
4. **Acquisition Timeout**: If the timeout triggers before the request reaches the front of the queue, the handler:
   - Removes the entry from the queue.
   - Cleans up the queue map if it becomes empty.
   - Rejects the promise with a `Lock acquisition timeout` error.

### 3. Lock Release Flow
When the lock owner calls the returned `release()` function:
1. It marks the entry as released.
2. It removes the entry from the queue (which is at index `0`).
3. If the queue is now empty, it deletes the key from `this.locks`.
4. If there are pending waiters:
   - It retrieves the next waiter in line (the new index `0`).
   - It synchronously clears the waiter's timeout handler to prevent race conditions.
   - It resolves the waiter's promise, allowing it to acquire the lock and resume execution.

## Safety Guarantees

- **No Starvation**: When a request in the middle of the queue times out, it is spliced out of the queue. The chain remains unbroken, and the next request still executes correctly when the current holder releases.
- **Strict FIFO Ordering**: Requests are served in the exact order they called `acquire`.
- **Memory Safety**: All keys are deleted from the map as soon as the queue becomes empty. No references are leaked.
- **Fail-Safe**: If an operation fails or times out, the lock is freed and the queue continues moving.
