import { describe, it } from "node:test";
import assert from "node:assert/strict";

class SseBroadcasterMock {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(id) {
    this.subscribers.add(id);
  }

  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  getSubscriberCount() {
    return this.subscribers.size;
  }
}

describe("SSE Connection Decoupling Tests", () => {
  it("should subscribe and unsubscribe client channels cleanly", () => {
    const manager = new SseBroadcasterMock();
    manager.subscribe("conn-1");
    manager.subscribe("conn-2");

    assert.equal(manager.getSubscriberCount(), 2);

    manager.unsubscribe("conn-1");
    assert.equal(manager.getSubscriberCount(), 1);
  });
});
