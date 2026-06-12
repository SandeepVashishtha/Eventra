import assert from "node:assert/strict";

// Mock environment and globals before importing sseMultiplexer

const store = {};
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
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

// Now import the multiplexer
import { sseMultiplexer } from "../src/utils/sseMultiplexer.js";

// Force mock sseMultiplexer state to be the leader for initial tests
sseMultiplexer.isLeader = true;
sseMultiplexer.reconcileConnections();

const runTests = async () => {
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
  // Override sseMultiplexer.channel to use MockBroadcastChannel because of ES Module import hoisting
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

  console.log("🟢 All SSE Multiplexer unit tests completed successfully!");
};

// Run the suite
runTests().catch((err) => {
  console.error("🔴 SSE Multiplexer tests failed:", err);
  process.exit(1);
});
