import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WebTorrentMeshManager, calculateBandwidthSavings } from "../src/utils/p2p/webtorrentMesh.js";

describe("Decentralized WebTorrent P2P Mesh Tests", () => {
  it("should calculate bandwidth savings percentage ratio", () => {
    const savings = calculateBandwidthSavings(750, 250);
    assert.equal(savings, 75);
  });

  it("should track P2P swarm peer count and fall back to CDN when isolated", () => {
    const mesh = new WebTorrentMeshManager("https://cdn.example.com/stream.m3u8");
    const initialStats = mesh.getSwarmStats();

    assert.ok(initialStats.activePeers > 0);
    assert.equal(initialStats.isP2pActive, true);
    assert.ok(initialStats.savingsPercent > 50);

    mesh.triggerCdnFallback();
    const fallbackStats = mesh.getSwarmStats();
    assert.equal(fallbackStats.activePeers, 0);
    assert.equal(fallbackStats.isP2pActive, false);
  });
});
