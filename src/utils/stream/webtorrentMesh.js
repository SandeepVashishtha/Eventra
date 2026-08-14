/**
 * WebTorrent Mesh Stream Sharing Utility (#17706)
 * Enables peer-to-peer video segment sharing among keynote viewers
 * using WebTorrent and WebRTC Data Channels
 */

/**
 * WebTorrentMeshManager - Manages P2P video stream sharing
 * Features:
 * - Low-latency P2P video stream sharing
 * - Dynamic bandwidth tracking
 * - CDN fallback mechanism
 * - Connection health monitoring
 */
export class WebTorrentMeshManager {
  constructor(streamUrl, options = {}) {
    this.streamUrl = streamUrl;
    this.options = {
      maxPeers: 50,
      segmentSize: 4 * 1024 * 1024, // 4MB segments
      WebTorrent: null, // Will be initialized if available
      ...options,
    };

    // Connection state
    this.client = null;
    this.torrent = null;
    this.activePeers = new Set();
    this.peerConnections = new Map();
    this.isSeeding = false;
    this.isP2pActive = false;

    // Bandwidth tracking
    this.p2pDownloadedBytes = 0;
    this.cdnDownloadedBytes = 0;
    this.p2pUploadedBytes = 0;
    this.lastBytesTime = Date.now();
    this.bandwidthHistory = [];

    // Connection health
    this.connectionQuality = 1.0; // 0-1 scale
    this.latencyMs = 0;
    this.packetLoss = 0;

    // Initialize if WebTorrent is available
    this.initialize();
  }

  /**
   * Initialize WebTorrent client
   */
  initialize() {
    try {
      // Check if WebTorrent is available (either global or passed in)
      const WebTorrent = this.options.WebTorrent || window.WebTorrent;
      
      if (WebTorrent) {
        this.client = new WebTorrent({
          tracker: {
            rtcConfig: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
              ],
            },
          },
        });

        this.setupEventListeners();
        this.isP2pActive = true;
      } else {
        console.warn('WebTorrent not available, falling back to CDN only');
        this.isP2pActive = false;
      }
    } catch (error) {
      console.error('Failed to initialize WebTorrent:', error);
      this.isP2pActive = false;
    }
  }

  /**
   * Set up event listeners for the WebTorrent client
   */
  setupEventListeners() {
    if (!this.client) return;

    this.client.on('error', (err) => {
      console.error('WebTorrent error:', err);
      this.isP2pActive = false;
    });

    this.client.on('warning', (err) => {
      console.warn('WebTorrent warning:', err);
    });
  }

  /**
   * Start streaming from a URL
   * @param {string} url - The stream URL (can be magnet, torrent, or HTTP)
   */
  async startStream(url = this.streamUrl) {
    if (!this.client || !this.isP2pActive) {
      console.warn('WebTorrent not active, falling back to CDN');
      this.cdnDownloadedBytes += this.estimateSegmentSize();
      return { success: false, error: 'WebTorrent not available' };
    }

    try {
      this.torrent = await this.client.add(url);
      this.isSeeding = false;

      this.torrent.on('done', () => {
        this.isSeeding = true;
        this.seedToPeers();
      });

      this.torrent.on('wire', (wire) => {
        const peerId = wire.peerId.toString('hex').substring(0, 7);
        this.activePeers.add(peerId);
        
        wire.on('download', (bytes) => {
          this.p2pDownloadedBytes += bytes;
          this.updateBandwidthHistory();
        });

        wire.on('upload', (bytes) => {
          this.p2pUploadedBytes += bytes;
          this.updateBandwidthHistory();
        });
      });

      this.torrent.on('error', (err) => {
        console.error('Torrent error:', err);
      });

      return { success: true, torrent: this.torrent };
    } catch (error) {
      console.error('Failed to start stream:', error);
      this.cdnDownloadedBytes += this.estimateSegmentSize();
      return { success: false, error: error.message };
    }
  }

  /**
   * Seed downloaded segments to other peers
   */
  seedToPeers() {
    if (!this.torrent || !this.isSeeding) return;

    this.torrent.files.forEach((file) => {
      file.getBuffer((err, buffer) => {
        if (err) return;
        // Buffer is now available for sharing with peers
        this.p2pUploadedBytes += buffer.length;
      });
    });
  }

  /**
   * Get a video segment via P2P or CDN fallback
   * @param {number} segmentIndex - The segment index to fetch
   */
  async getSegment(segmentIndex) {
    if (!this.torrent) {
      // CDN fallback
      const segment = await this.fetchFromCDN(segmentIndex);
      this.cdnDownloadedBytes += segment.length;
      return segment;
    }

    // Try to get from P2P first
    try {
      const segment = await this.getSegmentFromTorrent(segmentIndex);
      this.p2pDownloadedBytes += segment.length;
      return segment;
    } catch (error) {
      // Fallback to CDN
      console.warn(`P2P fetch failed for segment ${segmentIndex}, falling back to CDN`);
      const segment = await this.fetchFromCDN(segmentIndex);
      this.cdnDownloadedBytes += segment.length;
      return segment;
    }
  }

  /**
   * Get segment from WebTorrent
   */
  async getSegmentFromTorrent(segmentIndex) {
    return new Promise((resolve, reject) => {
      if (!this.torrent || !this.torrent.files[segmentIndex]) {
        return reject(new Error('Segment not available'));
      }

      const file = this.torrent.files[segmentIndex];
      file.getBuffer((err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });
  }

  /**
   * Fetch segment from CDN as fallback
   */
  async fetchFromCDN(segmentIndex) {
    // In a real implementation, this would fetch from the actual CDN
    // For simulation purposes, return a mock segment
    return new ArrayBuffer(this.options.segmentSize);
  }

  /**
   * Simulate a peer joining the swarm
   */
  simulatePeerJoin() {
    const mockPeerId = `peer-${Date.now()}`;
    this.activePeers.add(mockPeerId);
    
    // Simulate bandwidth from new peer
    const mockBytes = 15 * 1024 * 1024; // 15MB
    this.p2pDownloadedBytes += mockBytes;
    this.updateBandwidthHistory();

    // Limit peers to max
    if (this.activePeers.size > this.options.maxPeers) {
      const oldestPeer = Array.from(this.activePeers)[0];
      this.activePeers.delete(oldestPeer);
    }
  }

  /**
   * Simulate a peer leaving the swarm
   */
  simulatePeerLeave() {
    if (this.activePeers.size > 0) {
      const peerToRemove = Array.from(this.activePeers)[0];
      this.activePeers.delete(peerToRemove);
    }
  }

  /**
   * Trigger CDN fallback mode
   */
  triggerCdnFallback() {
    this.isP2pActive = false;
    this.activePeers.clear();
    this.connectionQuality = 0;
  }

  /**
   * Reactivate P2P mode
   */
  reactivateP2P() {
    this.isP2pActive = true;
    this.connectionQuality = 1.0;
  }

  /**
   * Update bandwidth history for tracking
   */
  updateBandwidthHistory() {
    const now = Date.now();
    const timeDiff = now - this.lastBytesTime;
    
    if (timeDiff >= 1000) { // Update every second
      const totalP2P = this.p2pDownloadedBytes + this.p2pUploadedBytes;
      this.bandwidthHistory.push({
        timestamp: now,
        p2pDownloadedMB: Math.round(this.p2pDownloadedBytes / (1024 * 1024)),
        cdnDownloadedMB: Math.round(this.cdnDownloadedBytes / (1024 * 1024)),
        p2pUploadedMB: Math.round(this.p2pUploadedBytes / (1024 * 1024)),
        activePeers: this.activePeers.size,
      });

      // Keep only last 60 entries (60 seconds of history)
      if (this.bandwidthHistory.length > 60) {
        this.bandwidthHistory.shift();
      }

      this.lastBytesTime = now;
    }
  }

  /**
   * Get current swarm statistics
   */
  getSwarmStats() {
    const totalBytes = this.p2pDownloadedBytes + this.cdnDownloadedBytes;
    const savingsPercent = totalBytes > 0 
      ? Math.round((this.p2pDownloadedBytes / totalBytes) * 100) 
      : 0;

    return {
      activePeers: this.activePeers.size,
      p2pDownloadedMB: Math.round(this.p2pDownloadedBytes / (1024 * 1024)),
      cdnDownloadedMB: Math.round(this.cdnDownloadedBytes / (1024 * 1024)),
      p2pUploadedMB: Math.round(this.p2pUploadedBytes / (1024 * 1024)),
      savingsPercent,
      isP2pActive: this.isP2pActive && this.activePeers.size > 0,
      connectionQuality: this.connectionQuality,
      latencyMs: this.latencyMs,
      isSeeding: this.isSeeding,
      totalPeers: this.options.maxPeers,
    };
  }

  /**
   * Get connection health metrics
   */
  getConnectionHealth() {
    return {
      quality: this.connectionQuality,
      latencyMs: this.latencyMs,
      packetLoss: this.packetLoss,
      status: this.connectionQuality > 0.7 ? 'excellent' 
        : this.connectionQuality > 0.4 ? 'good' 
        : this.connectionQuality > 0.1 ? 'fair' 
        : 'poor',
    };
  }

  /**
   * Get bandwidth history for the tracker
   */
  getBandwidthHistory() {
    return [...this.bandwidthHistory];
  }

  /**
   * Estimate segment size based on options
   */
  estimateSegmentSize() {
    return this.options.segmentSize || 4 * 1024 * 1024;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.activePeers.clear();
    this.peerConnections.clear();
    this.torrent = null;
    this.isP2pActive = false;
    this.isSeeding = false;
  }
}

/**
 * Calculate bandwidth savings percentage
 * @param {number} p2pBytes - Bytes downloaded via P2P
 * @param {number} cdnBytes - Bytes downloaded via CDN
 * @returns {number} Savings percentage (0-100)
 */
export function calculateBandwidthSavings(p2pBytes = 0, cdnBytes = 0) {
  const total = p2pBytes + cdnBytes;
  if (total === 0) return 0;
  return Math.round((p2pBytes / total) * 100);
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string (e.g., "450 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if WebTorrent is available in the environment
 * @returns {boolean} True if WebTorrent is available
 */
export function isWebTorrentAvailable() {
  return !!(window.WebTorrent || typeof WebTorrent !== 'undefined');
}

/**
 * Load WebTorrent script dynamically if not already loaded
 * @param {string} cdnUrl - CDN URL for WebTorrent library
 * @returns {Promise<boolean>} True if loaded successfully
 */
export async function loadWebTorrent(cdnUrl = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js') {
  if (isWebTorrentAvailable()) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = cdnUrl;
    script.onload = () => {
      if (isWebTorrentAvailable()) {
        resolve(true);
      } else {
        console.error('WebTorrent failed to load');
        resolve(false);
      }
    };
    script.onerror = () => {
      console.error('Failed to load WebTorrent script');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export default WebTorrentMeshManager;
