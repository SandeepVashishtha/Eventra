import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AgendaCRDTStore } from "../src/utils/crdt/agendaCrdtStore.js";

describe("CRDT Collaborative Agenda Store Tests", () => {
  it("should enforce Last-Write-Wins (LWW) CRDT resolution rule", () => {
    const store = new AgendaCRDTStore();

    store.updateSlot("slot-1", { title: "Opening Keynote", track: "Main Stage" }, 1000);
    store.updateSlot("slot-1", { title: "Opening Keynote V2", track: "Main Stage" }, 2000);

    const slots = store.getAllSlots();
    assert.equal(slots[0].title, "Opening Keynote V2");

    // Attempt stale write with timestamp 1500 (should be rejected)
    const updated = store.updateSlot("slot-1", { title: "Stale Keynote", track: "Main Stage" }, 1500);
    assert.equal(updated, false);
    assert.equal(store.getAllSlots()[0].title, "Opening Keynote V2");
  });

  it("should merge remote CRDT state trees seamlessly", () => {
    const localStore = new AgendaCRDTStore();
    const remoteSlots = [
      { id: "slot-2", title: "AI Workshop", startTime: "10:00 AM", timestamp: 1050 },
    ];

    localStore.mergeState(remoteSlots);
    const slots = localStore.getAllSlots();
    assert.equal(slots.length, 1);
    assert.equal(slots[0].title, "AI Workshop");
  });
});
