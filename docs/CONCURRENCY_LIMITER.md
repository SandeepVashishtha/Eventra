# Concurrency Limiter Queue Race Condition Fix

## Problem

Under high-frequency or synchronized asynchronous task execution, the `ConcurrencyLimiter` suffered from a microtask queue race condition:
- The limiter decremented `activeCount` synchronously during task completion (`next()`).
- However, the resuming promise callback for a queued task was resolved asynchronously via the microtask queue.
- If new tasks were submitted in the same event-loop tick after `activeCount` was decremented but before the microtask scheduled the next queue entry, the limiter saw `activeCount < concurrency` and ran the new task immediately.
- This bypassed the queue, causing the concurrency limit to be breached (e.g., executing multiple concurrent tasks when concurrency was set to 1).

## Solution

1. **Synchronous Slot Reservation**: Redesigned the `ConcurrencyLimiter` in [concurrency.js](file:///c:/Users/Sandeep/Downloads/repo/Eventra/api/_lib/concurrency.js) to perform slot reservation synchronously inside `_next()`. The active count is kept high, and we immediately delegate the slot to the next waiting promise resolver without decrementing and incrementing.
2. **Robust Type Safety**: Created full TypeScript definitions for the limiter and its helper functions in [concurrency.d.ts](file:///c:/Users/Sandeep/Downloads/repo/Eventra/api/_lib/concurrency.d.ts).
3. **Comprehensive Regression Testing**: Added unit tests in [concurrency.test.mjs](file:///c:/Users/Sandeep/Downloads/repo/Eventra/tests/concurrency.test.mjs) that simulate rapid synchronous queue tasks to assert that the concurrency limit is strictly maintained.
