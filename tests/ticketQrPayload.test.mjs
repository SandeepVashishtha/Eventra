import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTicketHolderName,
  getTotpTimeWindow,
  buildTicketQrPayload,
  buildTicketQrValue,
  validateTicketQrWindow,
} from "../src/utils/ticketQrPayload.js";

describe("Dynamic Ticket QR Payload & TOTP Rotating Protocol Tests", () => {
  it("should format ticket holder name fallback cleanly", () => {
    assert.equal(getTicketHolderName({ fullName: "Alex Rivera" }), "Alex Rivera");
    assert.equal(getTicketHolderName({ firstName: "Sarah", lastName: "Chen" }), "Sarah Chen");
    assert.equal(getTicketHolderName(null), "Eventra Guest");
  });

  it("should calculate 15s step time window integer", () => {
    const windowNum = getTotpTimeWindow(15);
    assert.ok(typeof windowNum === "number" && windowNum > 0);
  });

  it("should generate an opaque ticket QR payload matching the scanner contract", () => {
    const payload = buildTicketQrPayload({ registration: { registrationId: "REG-101" } });
    assert.ok(payload);
    assert.deepEqual(payload, { ticketId: "REG-101" });
    assert.equal(Object.keys(payload).length, 1);

    const jsonStr = buildTicketQrValue(payload);
    assert.equal(jsonStr, JSON.stringify({ ticketId: "REG-101" }));
    assert.equal(Object.keys(JSON.parse(jsonStr)).length, 1);
  });

  it("should validate current TOTP time window and reject expired windows", () => {
    const validPayload = { timeWindow: getTotpTimeWindow(15) };
    assert.equal(validateTicketQrWindow(validPayload), true);

    const expiredPayload = {
      timeWindow: validPayload.timeWindow - 5, // 5 windows ago (>15s * 5 = 75s ago)
    };
    assert.equal(validateTicketQrWindow(expiredPayload), false);
  });
});
