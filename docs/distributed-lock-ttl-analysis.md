# Distributed Lock TTL Usage Analysis

## Investigation Summary

Investigated all usages of `withLock()` and `acquire()` in the repository to determine if any caller relies on TTL expiration behavior.

## Search Results

### Production Code Usage

**File: `api/events/register.js` (Line 76)**
```javascript
await withLock(`register:${eventId}`, async () => {
  // Event existence check
  const event = await getEventById(eventId);
  // ... registration logic
  // Atomic insert
  const registration = await registerAttendee(eventId, user.id);
  res.status(201).json({ ... });
}, 30000).catch((err) => {
  // Handle CAPACITY_FULL, DUPLICATE_REGISTRATION errors
});
```

**Analysis:**
- Uses TTL of 30000ms (30 seconds)
- TTL is intended as a safety timeout for hung operations
- Lock release relies on normal function completion (via `finally` block in `withLock`)
- The `.catch()` handler is for registration errors, not TTL expiration
- **Does NOT rely on TTL expiration semantics**

### Test Code Usage

**Files:**
- `tests/distributed-lock.test.mjs` - 19 matches (new tests)
- `tests/distributedLock.test.mjs` - 5 matches (existing tests)

**Analysis:**
- All usages are for testing lock behavior
- One test specifically tests TTL behavior with custom values
- No production dependency on TTL expiration

### Infinity TTL Usage

**Search Results:**
- `tests/distributed-lock.test.mjs` - Tests Infinity TTL parameter
- Other Infinity usages: animation loops, price ranges, cache ages (unrelated to locks)

**Analysis:**
- Only used in tests to verify parameter handling
- No production code uses Infinity TTL

## Conclusion

**No production caller relies on TTL expiration behavior.**

The only production usage (`api/events/register.js`) uses TTL as a safety timeout, but:
1. Lock release is guaranteed by the `finally` block in `withLock()`
2. The function completes normally or throws errors that are caught
3. TTL expiration was never the intended release mechanism
4. The 30-second TTL is a defensive measure against hung operations

## Impact of Fix

The fix that removes TTL-based automatic release for in-memory locks:
- ✅ Does NOT break existing production code
- ✅ Preserves mutual exclusion guarantees
- ✅ Maintains backward compatibility
- ✅ Eliminates the race condition where timeout releases lock while function executes

## Recommendation

**No redesign needed.** The current fix is appropriate because:
1. No production code relies on TTL expiration
2. In-memory locks don't need TTL for correctness (single-process)
3. The `finally` block in `withLock()` guarantees lock release
4. TTL would only be needed for distributed systems (Redis) with process crash recovery
