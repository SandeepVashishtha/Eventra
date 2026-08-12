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

  it("should generate dynamic TOTP QR payload with timeWindow", () => {
    const payload = buildTicketQrPayload({ registration: { registrationId: "REG-101" } });
    assert.ok(payload);
    assert.equal(payload.ticketId, "REG-101");
    assert.ok(payload.totpToken);
    assert.ok(payload.timeWindow);

    const jsonStr = buildTicketQrValue(payload);
    assert.ok(jsonStr.includes("REG-101"));
  });

  it("should validate current TOTP time window and reject expired windows", () => {
    const validPayload = buildTicketQrPayload({ registration: { registrationId: "REG-101" } });
    assert.equal(validateTicketQrWindow(validPayload), true);

    const expiredPayload = {
      ...validPayload,
      timeWindow: validPayload.timeWindow - 5, // 5 windows ago (>15s * 5 = 75s ago)
    };
    assert.equal(validateTicketQrWindow(expiredPayload), false);
  });
});
