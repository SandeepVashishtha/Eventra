/**
 * WebRTC Data Channel peer-to-peer file transfer handlers (#16270)
 */

export class PeerFileConnection {
  constructor(peerId, onChunkReceived = () => {}) {
    this.peerId = peerId;
    this.onChunkReceived = onChunkReceived;
    this.chunks = [];
  }

  receiveChunk(index, total, dataBuffer) {
    this.chunks[index] = dataBuffer;
    this.onChunkReceived(this.chunks.filter(Boolean).length, total);
  }

  isComplete(total) {
    return this.chunks.filter(Boolean).length === total;
  }

  assembleFile() {
    return new Blob(this.chunks);
  }
}
