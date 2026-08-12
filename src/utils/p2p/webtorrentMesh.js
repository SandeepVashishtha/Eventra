/**
 * WebTorrent P2P Video Mesh & Swarm Bandwidth Calculator (#14043)
 */

export class WebTorrentMeshManager {
  constructor(streamUrl) {
    this.streamUrl = streamUrl;
    this.activePeers = 14;
    this.p2pDownloadedBytes = 450 * 1024 * 1024; // 450MB
    this.cdnDownloadedBytes = 150 * 1024 * 1024; // 150MB
    this.isP2pActive = true;
  }

  getSwarmStats() {
    const totalBytes = this.p2pDownloadedBytes + this.cdnDownloadedBytes;
    const savingsPercent = totalBytes > 0 ? Math.round((this.p2pDownloadedBytes / totalBytes) * 100) : 0;

    return {
      activePeers: this.activePeers,
      p2pDownloadedMB: Math.round(this.p2pDownloadedBytes / (1024 * 1024)),
      cdnDownloadedMB: Math.round(this.cdnDownloadedBytes / (1024 * 1024)),
      savingsPercent,
      isP2pActive: this.isP2pActive,
    };
  }

  simulatePeerJoin() {
    this.activePeers += 1;
    this.p2pDownloadedBytes += 15 * 1024 * 1024;
  }

  triggerCdnFallback() {
    this.isP2pActive = false;
    this.activePeers = 0;
  }
}

export function calculateBandwidthSavings(p2pBytes = 0, cdnBytes = 0) {
  const total = p2pBytes + cdnBytes;
  if (total === 0) return 0;
  return Math.round((p2pBytes / total) * 100);
}
