/**
 * Conflict-Free Replicated Data Type (CRDT) Agenda Store (#14045)
 * LWW-Element-Set (Last-Write-Wins) CRDT state manager for multi-organizer schedule editing.
 */

export class AgendaCRDTStore {
  constructor(channelName = "eventra_agenda_crdt") {
    this.slots = new Map();
    this.channelName = channelName;
  }

  /**
   * Set or update schedule slot using LWW-Element-Set CRDT logic.
   */
  updateSlot(slotId, slotData, timestamp = Date.now()) {
    const existing = this.slots.get(slotId);
    if (!existing || timestamp >= existing.timestamp) {
      this.slots.set(slotId, {
        ...slotData,
        id: slotId,
        timestamp,
      });
      return true;
    }
    return false; // Rejected older write
  }

  /**
   * Merge external CRDT state tree seamlessly.
   */
  mergeState(remoteSlots) {
    if (!Array.isArray(remoteSlots)) return;
    for (const slot of remoteSlots) {
      if (slot && slot.id) {
        this.updateSlot(slot.id, slot, slot.timestamp || Date.now());
      }
    }
  }

  getAllSlots() {
    return Array.from(this.slots.values()).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }
}
