/**
 * WebRTC Peer Manager for Hackathon P2P Collaboration
 * Manages RTCPeerConnections, DataChannels for code/canvas sync, and MediaStreams.
 */

const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export class WebRTCPeerManager {
  constructor(roomId, peerId, onMessageCallback, onStatusCallback) {
    this.roomId = roomId;
    this.peerId = peerId;
    this.onMessage = onMessageCallback || (() => {});
    this.onStatus = onStatusCallback || (() => {});
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    this.localStream = null;
    this.isAudioMuted = false;
    this.isVideoOff = false;
  }

  /**
   * Initialize local media stream for audio/video peer collaboration
   */
  async initLocalStream(enableAudio = true, enableVideo = false) {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: enableAudio,
          video: enableVideo,
        });
        return this.localStream;
      }
    } catch (err) {
      console.warn("[WebRTC] Media device access warning:", err.message);
    }
    return null;
  }

  /**
   * Create a peer connection for a target peer ID
   */
  createPeerConnection(targetPeerId) {
    if (typeof RTCPeerConnection === "undefined") {
      console.warn("[WebRTC] RTCPeerConnection is not supported in this environment");
      return null;
    }
    if (this.peerConnections.has(targetPeerId)) {
      return this.peerConnections.get(targetPeerId);
    }

    const pc = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

    // Add local tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Setup Data Channel for code & canvas sync
    const dc = pc.createDataChannel("collaboration_channel", {
      ordered: true,
    });
    this.setupDataChannel(dc, targetPeerId);

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, targetPeerId);
    };

    pc.oniceconnectionstatechange = () => {
      this.onStatus(targetPeerId, pc.iceConnectionState);
    };

    this.peerConnections.set(targetPeerId, pc);
    return pc;
  }

  setupDataChannel(dc, targetPeerId) {
    this.dataChannels.set(targetPeerId, dc);

    dc.onopen = () => {
      this.onStatus(targetPeerId, "connected");
    };

    dc.onclose = () => {
      this.onStatus(targetPeerId, "disconnected");
      this.dataChannels.delete(targetPeerId);
    };

    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(targetPeerId, data);
      } catch (err) {
        console.error("[WebRTC] Data parse error:", err);
      }
    };
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload, sender: this.peerId, timestamp: Date.now() });
    this.dataChannels.forEach((dc) => {
      if (dc.readyState === "open") {
        dc.send(message);
      }
    });
  }

  /**
   * Toggle local audio microphone stream
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioMuted = !audioTrack.enabled;
        return !this.isAudioMuted;
      }
    }
    return false;
  }

  /**
   * Toggle local video camera stream
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoOff = !videoTrack.enabled;
        return !this.isVideoOff;
      }
    }
    return false;
  }

  /**
   * Clean up all active WebRTC peer connections and media tracks
   */
  destroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.dataChannels.forEach((dc) => dc.close());
    this.peerConnections.forEach((pc) => pc.close());
    this.dataChannels.clear();
    this.peerConnections.clear();
  }
}

export default WebRTCPeerManager;
