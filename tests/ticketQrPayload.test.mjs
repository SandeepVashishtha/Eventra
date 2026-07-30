import assert from "node:assert/strict";
import { buildTicketQrPayload, buildTicketQrValue, getTicketHolderName } from "../src/utils/ticketQrPayload.js";

const event = {
  id: 10287,
  title: "Eventra Summit",
};

const user = {
  firstName: "Asha",
  lastName: "Rao",
  email: "asha@example.com",
};

const registration = {
  registrationId: "reg-123",
  qrToken: "signed-ticket-token",
};

const payload = buildTicketQrPayload({
  event,
  user,
  registration,
  serialNumber: "EVT-ASH-9XY7Z",
});

assert.deepStrictEqual(payload, {
  ticketId: "signed-ticket-token",
  registrationId: "reg-123",
  eventId: 10287,
  eventName: "Eventra Summit",
  userName: "Asha Rao",
});

assert.deepStrictEqual(JSON.parse(buildTicketQrValue(payload)), payload);

assert.deepStrictEqual(
  buildTicketQrPayload({
    event,
    user: {},
    registration: null,
    serialNumber: "EVT-GUE-00001",
  }),
  {
    ticketId: "EVT-GUE-00001",
    registrationId: "EVT-GUE-00001",
    eventId: 10287,
    eventName: "Eventra Summit",
    userName: "Eventra Guest",
  },
);

assert.equal(getTicketHolderName({ fullName: "Priya Shah", firstName: "Ignored" }), "Priya Shah");
