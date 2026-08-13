/**
 * Simple peer initialization wrappers utilizing WebRTC DataChannels (#17662)
 */

export class WebrtcDataChannel {
  constructor(peerConnectionConfig = {}) {
    this.peerConnection = typeof RTCPeerConnection !== "undefined" ? new RTCPeerConnection(peerConnectionConfig) : null;
    this.dataChannel = null;
  }

  createLocalChannel(label = "slide-sync") {
    if (this.peerConnection) {
      this.dataChannel = this.peerConnection.createDataChannel(label);
      this.setupChannelListeners();
    }
  }

  setupChannelListeners() {
    if (this.dataChannel) {
      this.dataChannel.onopen = () => console.log("[WebRTC] Data channel established");
      this.dataChannel.onclose = () => console.log("[WebRTC] Data channel disconnected");
    }
  }

  sendPayload(data) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(data));
    }
  }
}
