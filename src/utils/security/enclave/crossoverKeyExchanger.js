/**
 * Multi-tab cross-handshake cryptographic key exchanger utility (#16279)
 */

export class CrossoverKeyExchanger {
  constructor(channelName = "eventra-secure-sync") {
    this.channelName = channelName;
    this.channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(channelName) : null;
  }

  broadcastHandshake(publicKey) {
    if (this.channel) {
      this.channel.postMessage({
        type: "HANDSHAKE_INIT",
        key: publicKey,
        timestamp: Date.now()
      });
    }
  }

  onHandshakeReceived(callback) {
    if (this.channel) {
      this.channel.onmessage = (e) => {
        if (e.data && e.data.type === "HANDSHAKE_INIT") {
          callback(e.data);
        }
      };
    }
  }

  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}
