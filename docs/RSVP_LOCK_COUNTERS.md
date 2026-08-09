# RSVP Lock Counter Concurrency Fix

## Problem

Under concurrent RSVP registration requests, rapid event registrations could trigger race conditions or ReferenceErrors. Specifically:
- `rsvpLockCounters` was accessed dynamically but not initialized or declared correctly in scope, causing a runtime `ReferenceError`.
- Concurrency locks could leak if a promise rejected, blocking subsequent users from registering for the event.

## Solution

1. **RSVP Lock Manager**: Implemented a self-cleaning `RsvpLockManager` utility class in [rsvpLockManager.js](../api/_lib/rsvpLockManager.js) to track and clean up lock counters safely.
2. **Error Isolation**: Wrapped RSVP registration in a robust `try...finally` block in [register.js](../api/events/register.js) to guarantee that event lock leases are always released and counters decremented even on capacity failures or database errors.
3. **Strict Type Safety**: Added full TypeScript definitions for both the manager and the register endpoint to ensure compile-time verification.
4. **Automated Testing**: Created comprehensive unit tests in [rsvpLockManager.test.mjs](../tests/rsvpLockManager.test.mjs) and integration tests in [registerEndpoint.test.mjs](../tests/registerEndpoint.test.mjs) to prevent regressions.
