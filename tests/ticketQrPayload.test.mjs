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

// The QR must encode ONLY the opaque server-issued token — no PII.
assert.deepStrictEqual(payload, {
  ticketId: "signed-ticket-token",
});

// Round-trip through the encoded value.
assert.deepStrictEqual(JSON.parse(buildTicketQrValue(payload)), payload);

// PII (attendee name, event name, registration id) must never ride in the QR.
const serialisedQr = buildTicketQrValue(payload);
assert.ok(
  !serialisedQr.includes("Asha") && !serialisedQr.includes("Eventra Summit") && !serialisedQr.includes("reg-123"),
  "QR value must not embed attendee name, event name, or registration id",
);

// When no server-issued token exists, no QR payload may be produced.
assert.equal(
  buildTicketQrPayload({
    event,
    user: {},
    registration: null,
  }),
  null,
  "buildTicketQrPayload() returns null when no server-issued token exists",
);

assert.equal(
  buildTicketQrValue(null),
  "",
  "buildTicketQrValue() returns an empty string for a null payload",
);

assert.equal(getTicketHolderName({ fullName: "Priya Shah", firstName: "Ignored" }), "Priya Shah");
