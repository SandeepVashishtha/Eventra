import assert from "node:assert/strict";

process.env.REACT_APP_API_URL = "https://api.example.test";

// Mock environment and globals before importing sseMultiplexer

const store = {};
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  location: {
    origin: "https://api.example.test",
  },
  localStorage: {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
  },
};
globalThis.localStorage = globalThis.window.localStorage;

// Mock BroadcastChannel for tab coordination
const channels = new Set();
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.closed = false;
    channels.add(this);
  }
  postMessage(data) {
    if (this.closed) return;
    // Broadcast to all OTHER channel instances
    for (const ch of channels) {
      if (ch !== this && !ch.closed) {
        ch.onmessage?.({ data });
      }
    }
  }
  close() {
    this.closed = true;
    channels.delete(this);
  }
}
globalThis.BroadcastChannel = MockBroadcastChannel;

// Mock Web Locks API using Object.defineProperty to bypass read-only property
let lockAcquiredCallback = null;
Object.defineProperty(globalThis, "navigator", {
  value: {
    locks: {
      request: async (name, callback) => {
        lockAcquiredCallback = callback;
        // Resolve immediately to simulate lock acquisition
        return callback({});
      },
    },
  },
  writable: true,
  configurable: true,
});

// Mock EventSource
const eventSources = [];
class MockEventSource {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.closed = false;
    eventSources.push(this);
    // Simulate connection open immediately to keep test simple and fast
    setTimeout(() => {
      this.onopen?.();
    }, 5);
  }
  close() {
    this.closed = true;
  }
  emitMessage(data, type = "message") {
    this.onmessage?.({
      data: typeof data === "string" ? data : JSON.stringify(data),
      type,
    });
  }
}
globalThis.EventSource = MockEventSource;

// Now import the multiplexer dynamically to ensure environment variable is set first
const { sseMultiplexer } = await import("../src/utils/sseMultiplexer.js");

// Force mock sseMultiplexer state to be the leader for initial tests
sseMultiplexer.isLeader = true;
sseMultiplexer.reconcileConnections();

const runTests = async () => {
  process.env.REACT_APP_API_URL = "https://api.example.test";

  // Test 1: Local subscription and message delivery
  let receivedData = null;
  let receivedType = null;
  const unsubscribe = sseMultiplexer.subscribe("/stream/leaderboard", (data, type) => {
    receivedData = data;
    receivedType = type;
  });

  // Reconcile and trigger open EventSource
  sseMultiplexer.reconcileConnections();
  assert.equal(eventSources.length, 1);
  assert.equal(eventSources[0].closed, false);
  assert.equal(eventSources[0].url, "https://api.example.test/stream/leaderboard");

  // Wait for the async connection open simulated by MockEventSource
  await new Promise((resolve) => setTimeout(resolve, 15));

  // Emit a mock message
  eventSources[0].emitMessage({ contributors: [{ name: "Alice" }] }, "update");

  // Validate message propagation
  assert.deepEqual(receivedData, { contributors: [{ name: "Alice" }] });
  assert.equal(receivedType, "update");

  // Test 2: Status reporting
  let currentStatus = null;
  const unsubscribeStatus = sseMultiplexer.subscribe(
    "/stream/leaderboard",
    () => {},
    (path, status) => {
      currentStatus = status;
    }
  );
  assert.equal(currentStatus, "connected");

  // Test 3: Unsubscription and resource teardown
  unsubscribe();
  unsubscribeStatus();
  sseMultiplexer.reconcileConnections();
  assert.equal(eventSources[0].closed, true);

  // Test 4: UNSUBSCRIBE_ALL and multi-tab connection cleanup
  sseMultiplexer.isLeader = true;

  // Simulate Tab B subscribing to "/stream/analytics" by broadcasting a SUBSCRIBE event
  sseMultiplexer.handleBroadcastMessage({
    type: "SUBSCRIBE",
    tabId: "tab_b",
    path: "/stream/analytics",
  });

  // Reconcile on leader Tab A
  sseMultiplexer.reconcileConnections();

  // We should have opened an EventSource connection for /stream/analytics
  assert.equal(eventSources.length, 2);
  const analyticsSource = eventSources[1];
  assert.equal(analyticsSource.closed, false);

  // Now simulate Tab B closing and broadcasting UNSUBSCRIBE_ALL
  sseMultiplexer.handleBroadcastMessage({
    type: "UNSUBSCRIBE_ALL",
    tabId: "tab_b",
    paths: ["/stream/analytics"],
  });

  // Reconcile on leader Tab A
  sseMultiplexer.reconcileConnections();

  // The EventSource for /stream/analytics should now be closed because there are no remaining global subscribers
  assert.equal(analyticsSource.closed, true);

  // Test 5: Heartbeat mechanisms (PING/PONG and pruning)
  // Replace the import-time channel so the test controls every active mock channel.
  // Leaving the old channel open lets status broadcasts loop back into the same
  // singleton through a stale listener, which creates recursive warning noise.
  sseMultiplexer.channel?.close();
  sseMultiplexer.channel = new globalThis.BroadcastChannel("eventra_sse_multiplexer");
  sseMultiplexer.channel.onmessage = (e) => sseMultiplexer.handleBroadcastMessage(e.data);

  // Register tab_c for "/stream/alerts"
  sseMultiplexer.handleBroadcastMessage({
    type: "SUBSCRIBE",
    tabId: "tab_c",
    path: "/stream/alerts",
  });
  sseMultiplexer.reconcileConnections();
  assert.equal(eventSources.length, 3);
  const alertsSource = eventSources[2];
  assert.equal(alertsSource.closed, false);

  // Start heartbeat checks with very small interval: 10ms, maxMissed = 3 => 30ms timeout
  sseMultiplexer.startHeartbeatChecks(10, 3);

  // Case 5A: Active follower responds to PING with PONG
  let receivedPingsCount = 0;
  const followerChannel = new globalThis.BroadcastChannel("eventra_sse_multiplexer");
  followerChannel.onmessage = (e) => {
    if (e.data && e.data.type === "PING") {
      receivedPingsCount++;
      followerChannel.postMessage({
        type: "PONG",
        tabId: "tab_c",
      });
    }
  };

  // Wait 45ms (should have fired a few heartbeats and received PONGs)
  await new Promise((resolve) => setTimeout(resolve, 45));
  assert.ok(receivedPingsCount > 0, "Should have received PING messages");
  // verify tab_c is still registered and connection is open
  assert.equal(alertsSource.closed, false, "Active follower connection should remain open");

  // Case 5B: Follower crashes / stops responding to PING
  // Close the follower's channel to simulate crash/unresponsiveness
  followerChannel.close();

  // Wait 45ms (misses heartbeats)
  await new Promise((resolve) => setTimeout(resolve, 45));

  // Verify that tab_c has been pruned and the connection has been closed
  assert.equal(
    alertsSource.closed,
    true,
    "Crashed/inactive follower connection should be automatically closed"
  );

  // Stop heartbeat checks
  sseMultiplexer.stopHeartbeatChecks();
  if (sseMultiplexer.heartbeatInterval) {
    clearInterval(sseMultiplexer.heartbeatInterval);
    sseMultiplexer.heartbeatInterval = null;
  }

  // Test 6: localStorage fallback verifies ownership before accepting leadership
  delete store.eventra_sse_leader_heartbeat;
  sseMultiplexer.isLeader = false;
  sseMultiplexer.localStorageLeadershipToken = null;
  if (sseMultiplexer.localStorageClaimTimeout) {
    clearTimeout(sseMultiplexer.localStorageClaimTimeout);
    sseMultiplexer.localStorageClaimTimeout = null;
  }

  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    sseMultiplexer.claimLocalStorageLeadership(0);
    const firstClaim = JSON.parse(store.eventra_sse_leader_heartbeat);
    assert.equal(firstClaim.tabId, sseMultiplexer.tabId);

    store.eventra_sse_leader_heartbeat = JSON.stringify({
      tabId: "competing_tab",
      token: "competing-token",
      timestamp: Date.now(),
    });

    await new Promise((resolve) => setTimeout(resolve, 35));
    assert.equal(
      sseMultiplexer.isLeader,
      false,
      "A tab must not become leader after another tab overwrites its claim"
    );

    delete store.eventra_sse_leader_heartbeat;
    sseMultiplexer.claimLocalStorageLeadership(0);
    await new Promise((resolve) => setTimeout(resolve, 35));
    assert.equal(
      sseMultiplexer.isLeader,
      true,
      "A tab should become leader when its claim token survives confirmation"
    );
  } finally {
    Math.random = originalRandom;
    sseMultiplexer.stopHeartbeatChecks();
    sseMultiplexer.channel?.close();
    followerChannel?.close();
    channels.clear();
    if (sseMultiplexer.heartbeatInterval) {
      clearInterval(sseMultiplexer.heartbeatInterval);
      sseMultiplexer.heartbeatInterval = null;
    }
    if (sseMultiplexer.localStorageClaimTimeout) {
      clearTimeout(sseMultiplexer.localStorageClaimTimeout);
      sseMultiplexer.localStorageClaimTimeout = null;
    }
    delete store.eventra_sse_leader_heartbeat;
  }

  // Test 7: Leader broadcasts current path status immediately upon receiving a SUBSCRIBE or SUBSCRIBERS_RESPONSE request from a follower tab
  sseMultiplexer.channel?.close();
  sseMultiplexer.channel = new globalThis.BroadcastChannel("eventra_sse_multiplexer");
  sseMultiplexer.channel.onmessage = (e) => sseMultiplexer.handleBroadcastMessage(e.data);

  sseMultiplexer.isLeader = true;
  sseMultiplexer.updatePathStatus("/stream/status_sync", "connected");

  let receivedStatusMsg = null;
  const statusTestChannel = new globalThis.BroadcastChannel("eventra_sse_multiplexer");
  statusTestChannel.onmessage = (e) => {
    if (e.data && e.data.type === "SSE_STATUS" && e.data.path === "/stream/status_sync") {
      receivedStatusMsg = e.data;
    }
  };

  // Simulate follower tab subscribing to "/stream/status_sync"
  sseMultiplexer.handleBroadcastMessage({
    type: "SUBSCRIBE",
    tabId: "tab_b",
    path: "/stream/status_sync",
  });

  // Wait for the async connection open simulated by MockEventSource
  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.ok(receivedStatusMsg !== null, "Follower should receive current connection status on SUBSCRIBE");
  assert.equal(receivedStatusMsg.status, "connected");
  assert.equal(receivedStatusMsg.tabId, sseMultiplexer.tabId, "Broadcast message should contain leader's tabId");

  // Verify same for SUBSCRIBERS_RESPONSE
  receivedStatusMsg = null;
  sseMultiplexer.handleBroadcastMessage({
    type: "SUBSCRIBERS_RESPONSE",
    tabId: "tab_b",
    paths: ["/stream/status_sync"],
  });
  assert.ok(receivedStatusMsg !== null, "Follower responding with active path should receive current connection status");
  assert.equal(receivedStatusMsg.status, "connected");
  assert.equal(receivedStatusMsg.tabId, sseMultiplexer.tabId, "Broadcast message should contain leader's tabId");

  statusTestChannel.close();

  console.log("🟢 All SSE Multiplexer unit tests completed successfully!");
};

// Run the suite
runTests().catch((err) => {
  console.error("🔴 SSE Multiplexer tests failed:", err);
  process.exit(1);
});
