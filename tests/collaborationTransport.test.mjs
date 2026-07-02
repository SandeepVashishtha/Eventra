import assert from "node:assert/strict";
import { createCollaborationTransport } from "../src/utils/collaborationTransport.js";

const messages = [];
class FakeBroadcastChannel {
  constructor(name) {
    this.name = name;
  }

  postMessage(message) {
    messages.push({ channel: this.name, message });
  }

  close() {}
}

const transport = createCollaborationTransport("event-42", {
  BroadcastChannelImpl: FakeBroadcastChannel,
  clientId: "client-a",
});

const delivered = transport.broadcast("add", { id: "chair-1" });

assert.equal(delivered, true);
assert.deepEqual(messages[0], {
  channel: "eventra-collaboration-event-42",
  message: {
    action: "add",
    data: { id: "chair-1" },
    roomId: "event-42",
    clientId: "client-a",
  },
});

transport.close();
console.log("collaboration transport tests passed");
