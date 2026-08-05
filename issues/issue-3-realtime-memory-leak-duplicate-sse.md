## RealTimeContext's Split-Provider Architecture Creates Duplicate SSE Connections Causing Memory Leaks and Re-render Cascades

### Severity: High
### Category: Bug (Performance / Memory Leak)

## Description

The `RealTimeContext.js` file was split into two separate providers (`LeaderboardProvider` and `AnalyticsProvider`) to avoid global re-renders (as documented in the code comments at line 130-131). However, the implementation has a critical flaw: **each call to `useRealTimeConnection` creates an independent SSE connection to the server**.

### Bug 1 — Duplicate SSE Connections Per Component Instance

**File:** `src/context/RealTimeContext.js` (lines 64-116)

```jsx
function LeaderboardProvider({ children }) {
  // ...
  const { status } = useRealTimeConnection("/stream/leaderboard", { onMessage });
  // ...
}

function AnalyticsProvider({ children }) {
  // ...
  const { status } = useRealTimeConnection("/stream/analytics", { onMessage });
  // ...
}
```

Each provider calls `useRealTimeConnection` with a different stream path. However, the `RealTimeProvider` composition (line 120-128) nests them:

```jsx
export function RealTimeProvider({ children }) {
  return (
    <LeaderboardProvider>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </LeaderboardProvider>
  );
}
```

If the app mounts **multiple instances** of `RealTimeProvider` or if the parent re-renders and causes the providers to remount (which can happen if the parent lacks memoization), **each mount creates a new SSE connection** for `/stream/leaderboard` AND `/stream/analytics`. The old connections are not guaranteed to be cleaned up because...

### Bug 2 — No Connection Pooling or Reference Counting

The `useRealTimeConnection` hook (in `src/hooks/useRealTimeConnection.js`) presumably creates a new `EventSource` or `WebSocket` connection each time it is called. Since there is no singleton/shared connection manager:

- If 3 components use `useLeaderboardStream()`, there should only be **1 SSE connection** to `/stream/leaderboard`, but currently there are **3**
- The connection cleanup on unmount may not properly close the underlying socket if `useRealTimeConnection` manages its own `EventSource` instance without cleanup guarantees
- React Strict Mode (used in development) double-invokes effects, creating **6 connections** temporarily

### Bug 3 — Re-render Cascade Despite Split Architecture

The code comment says: "These hooks now ONLY re-render when their specific stream updates!" (line 133). However, the `status` state is synced via `useEffect`:

```jsx
useEffect(() => {
  dispatch({ type: "STATUS", payload: status });
}, [status]);
```

When the SSE connection status changes (CONNECTING -> OPEN -> CLOSED -> RECONNECTING), **every consumer** of that context re-renders. If the SSE connection has flaky connectivity, this creates a re-render storm on every reconnection attempt. The `LeaderboardContext.Provider value={{...state}}` creates a **new object reference every render**, so `React.memo` wrappers cannot prevent child re-renders.

### Bug 4 — No Exponential Backoff in Reconnection Strategy

SSE connections can fail for many reasons (network blips, server restart, rate limiting). If `useRealTimeConnection` uses a fixed-interval reconnection strategy, it can create a reconnection storm:

- Server restart: All clients reconnect simultaneously at the same interval
- Network blip: Multiple rapid connect/disconnect cycles create context state churn
- No jitter: Synchronized reconnection attempts amplify server load on recovery

## Impact

- **Memory leak:** SSE connections are not properly pooled or deduplicated. Each context consumer opens a new connection. Over time, especially with SPA navigation, the browser accumulates stale EventSource/WebSocket handles.
- **Performance degradation:** Duplicate SSE connections consume server resources (each connection keeps a TCP socket open). With many users, this multiplies server load.
- **Re-render storms:** Connection status changes propagate to all consumers, defeating the purpose of the split-provider architecture.
- **Battery drain on mobile:** Multiple persistent connections consume radio resources unnecessarily.

## Files Affected

1. **`src/context/RealTimeContext.js`** — Major refactor needed for connection sharing
2. **`src/hooks/useRealTimeConnection.js`** — Needs to support shared connections via a connection registry/singleton
3. **Any component using `useLeaderboardStream()` or `useAnalyticsStream()`** — May need memoization fixes

## Suggested Fix

1. **Create a shared SSE connection manager** (e.g., `src/services/sseConnectionManager.js`) that implements:
   - Singleton connections per stream path (reference-counted)
   - Proper cleanup only when all consumers unmount
   - Exponential backoff with jitter for reconnection
   - Connection pooling (reuse EventSource for same stream)

2. **Fix context value memoization** in `LeaderboardProvider` and `AnalyticsProvider` by wrapping the value in `useMemo`:
   ```js
   const value = useMemo(() => state, [state.contributors, state.lastSynced, state.status]);
   ```

3. **Throttle STATUS dispatches** to prevent re-render storms during flaky connections — batch status changes within a 500ms window.
