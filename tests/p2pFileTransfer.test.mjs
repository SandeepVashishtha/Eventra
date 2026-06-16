import assert from "node:assert/strict";

// Setup mocks on globalThis before importing the module
globalThis.window = {};
globalThis.RTCSessionDescription = class RTCSessionDescription {
  constructor(desc) {
    this.type = desc?.type || "offer";
    this.sdp = desc?.sdp || "";
  }
};
globalThis.RTCIceCandidate = class RTCIceCandidate {
  constructor(candidate) {
    this.candidate = candidate;
  }
};

class MockRTCPeerConnection {
  constructor() {
    this.remoteDescription = null;
    this.localDescription = null;
    this.addedCandidates = [];
  }
  async createOffer() {
    return { type: "offer", sdp: "dummy-sdp" };
  }
  async createAnswer() {
    return { type: "answer", sdp: "dummy-sdp" };
  }
  async setRemoteDescription(desc) {
    this.remoteDescription = desc;
  }
  async setLocalDescription(desc) {
    this.localDescription = desc;
  }
  async addIceCandidate(candidate) {
    this.addedCandidates.push(candidate);
  }
  close() {}
  createDataChannel(label) {
    return {
      label,
      readyState: "connecting",
      send: () => {},
      close: () => {}
    };
  }
}
globalThis.RTCPeerConnection = MockRTCPeerConnection;

class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.listeners = [];
  }
  addEventListener(type, listener) {
    if (type === "message") {
      this.listeners.push(listener);
    }
  }
  removeEventListener(type, listener) {
    if (type === "message") {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }
  postMessage(message) {
    // Simulate async receive by other listeners
  }
}
globalThis.BroadcastChannel = MockBroadcastChannel;

// Now import the coordinator
const { P2PFileTransferCoordinator } = await import("../src/utils/p2pFileTransfer.js");

// Define test cases
async function runTests() {
  console.log("Starting P2PFileTransferCoordinator tests...");

  // Test Case 1: ICE candidates should be queued if remote description is not set yet
  {
    const coordinator = new P2PFileTransferCoordinator("test-file-1", "test.txt", () => {});
    coordinator.pc = new MockRTCPeerConnection();
    coordinator.setupSignaling();

    // Trigger signaling message handler for P2P_ICE when remote description is null
    const handler = coordinator.onMessageListener;
    const testCandidate = { candidate: "candidate:12345 1 UDP 1234 192.168.1.1 12345 typ host" };
    
    // Simulate candidate message arriving from peerId
    // We need to match coordinator's expectations
    // p2pFileTransfer peerId is dynamically created, we can just extract it or mock it
    // Wait, let's see how peerId is constructed in p2pFileTransfer:
    // const peerId = `peer_${Math.random().toString(36).substring(2, 7)}`;
    // Since peerId is private and generated inside the module, let's inspect the coordinator or make our message target it.
    // The conditional check is:
    // if (msg.to === peerId && this.pc)
    // How do we find the module's generated peerId?
    // Let's look at getSignalingChannel postMessage output or see if we can trigger the message.
    // Since the peerId is not exported, how can we target the message?
    // Ah! In setupSignaling:
    // if (msg.from === peerId) return;
    // if (msg.to === peerId && this.pc)
    // Wait, is there a way to get peerId? No, it's not exported.
    // BUT wait! In connectToPeer(targetPeerId):
    // it posts P2P_OFFER to targetPeerId with from: peerId!
    // So if we call connectToPeer("some-target"), it will call bc.postMessage with from: peerId!
    // Let's capture peerId by subclassing/mocking BroadcastChannel's postMessage!
    
    let capturedPeerId = null;
    coordinator.bc.postMessage = (msg) => {
      if (msg.from) {
        capturedPeerId = msg.from;
      }
    };
    
    await coordinator.connectToPeer("target-peer");
    assert.ok(capturedPeerId, "Should capture peerId from postMessage");
    
    // Now trigger message handler for P2P_ICE
    await handler({
      data: {
        fileId: "test-file-1",
        type: "P2P_ICE",
        from: "target-peer",
        to: capturedPeerId,
        candidate: testCandidate
      }
    });

    assert.equal(coordinator.queuedRemoteCandidates.length, 1, "ICE Candidate should be queued because remoteDescription is not set yet");
    assert.deepEqual(coordinator.queuedRemoteCandidates[0], testCandidate, "Queued candidate should match the sent candidate");
    assert.equal(coordinator.pc.addedCandidates.length, 0, "No candidates should be added to RTCPeerConnection yet");

    // Set remote description and process queue
    await coordinator.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: "" }));
    await coordinator.processQueuedCandidates();

    assert.equal(coordinator.queuedRemoteCandidates.length, 0, "Queue should be empty after processing");
    assert.equal(coordinator.pc.addedCandidates.length, 1, "Candidate should be added to RTCPeerConnection after remoteDescription is set");
    assert.deepEqual(coordinator.pc.addedCandidates[0].candidate, testCandidate, "Added candidate should match the queued candidate");
    
    coordinator.cleanup();
  }

  // Test Case 2: ICE candidates should be applied immediately if remote description is already set
  {
    const coordinator = new P2PFileTransferCoordinator("test-file-2", "test.txt", () => {});
    coordinator.pc = new MockRTCPeerConnection();
    coordinator.setupSignaling();

    let capturedPeerId = null;
    coordinator.bc.postMessage = (msg) => {
      if (msg.from) {
        capturedPeerId = msg.from;
      }
    };
    
    await coordinator.connectToPeer("target-peer");
    
    // Set remote description first
    await coordinator.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: "" }));

    const handler = coordinator.onMessageListener;
    const testCandidate = { candidate: "candidate:67890 1 UDP 1234 192.168.1.2 12345 typ host" };

    await handler({
      data: {
        fileId: "test-file-2",
        type: "P2P_ICE",
        from: "target-peer",
        to: capturedPeerId,
        candidate: testCandidate
      }
    });

    assert.equal(coordinator.queuedRemoteCandidates.length, 0, "ICE Candidate should NOT be queued");
    assert.equal(coordinator.pc.addedCandidates.length, 1, "Candidate should be added immediately to RTCPeerConnection");
    assert.deepEqual(coordinator.pc.addedCandidates[0].candidate, testCandidate, "Added candidate should match the sent candidate");

    coordinator.cleanup();
  }

  // Test Case 3: ICE candidates should be queued even if RTCPeerConnection is null / not initialized yet
  {
    const coordinator = new P2PFileTransferCoordinator("test-file-3", "test.txt", () => {});
    coordinator.setupSignaling();

    let capturedPeerId = null;
    coordinator.bc.postMessage = (msg) => {
      if (msg.from) {
        capturedPeerId = msg.from;
      }
    };
    
    await coordinator.connectToPeer("target-peer");
    assert.ok(capturedPeerId, "Should capture peerId");

    // Simulate pc being null (not initialized yet)
    coordinator.pc = null;
    coordinator.queuedRemoteCandidates = [];

    const handler = coordinator.onMessageListener;
    const testCandidate = { candidate: "candidate:11111 1 UDP 1234 192.168.1.3 12345 typ host" };

    await handler({
      data: {
        fileId: "test-file-3",
        type: "P2P_ICE",
        from: "target-peer",
        to: capturedPeerId,
        candidate: testCandidate
      }
    });

    assert.equal(coordinator.queuedRemoteCandidates.length, 1, "ICE Candidate should be queued even if PC is null");
    assert.deepEqual(coordinator.queuedRemoteCandidates[0], testCandidate, "Queued candidate should match sent candidate");

    // Initialize PC and remoteDescription, then process queue
    coordinator.pc = new MockRTCPeerConnection();
    await coordinator.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: "" }));
    await coordinator.processQueuedCandidates();

    assert.equal(coordinator.queuedRemoteCandidates.length, 0, "Queue should be empty after processing");
    assert.equal(coordinator.pc.addedCandidates.length, 1, "Candidate should be added to RTCPeerConnection");
    assert.deepEqual(coordinator.pc.addedCandidates[0].candidate, testCandidate, "Added candidate should match queued candidate");

    coordinator.cleanup();
  }

  console.log("All P2PFileTransferCoordinator tests passed successfully! ✓");
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
