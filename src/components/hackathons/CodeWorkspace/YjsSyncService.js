class YjsSyncService {
  constructor() {
    this.callback = null;
    this.roomId = null;
  }

  connect(roomId, onSyncCallback) {
    this.roomId = roomId;
    this.callback = onSyncCallback;
    console.log(`[YjsSync] Mock sync service connected to room ${roomId}`);
  }

  broadcastChange(newCode) {
    // In a real application, this sends delta changes over WebSocket or WebRTC
    // For now we simulate local updates
    console.debug("[YjsSync] Broadcast change payload:", newCode.length);
  }

  disconnect() {
    this.roomId = null;
    this.callback = null;
    console.log("[YjsSync] Disconnected.");
  }
}

export default new YjsSyncService();
