/**
 * api/_lib/ticketToken.test.js
 *
 * Tests for ticket token generation and verification.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import {
  generateTicketToken,
  signTicketJwt,
  verifyTicketJwt,
} from "./ticketToken.js";

describe("ticketToken", () => {
  let originalEnv;
  let testSecret;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.TICKET_JWT_EXPIRY;
    delete process.env.TICKET_JWT_EXPIRY;
    // Set a test secret
    testSecret = "test-secret-key-for-jwt-signing";
    process.env.JWT_SECRET = testSecret;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.TICKET_JWT_EXPIRY = originalEnv;
    } else {
      delete process.env.TICKET_JWT_EXPIRY;
    }
    delete process.env.JWT_SECRET;
  });

  describe("generateTicketToken", () => {
    it("generates a valid UUID v4", () => {
      const token = generateTicketToken();
      assert.strictEqual(typeof token, "string");
      assert.match(token, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it("generates unique tokens", () => {
      const token1 = generateTicketToken();
      const token2 = generateTicketToken();
      assert.notStrictEqual(token1, token2);
    });
  });

  describe("signTicketJwt", () => {
    it("signs a ticket JWT with default expiry", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      assert.strictEqual(typeof jwtToken, "string");
      assert.match(jwtToken, /^eyJ/); // JWTs start with eyJ
    });

    it("signs a ticket JWT with configured expiry", () => {
      process.env.TICKET_JWT_EXPIRY = "7d";
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      assert.strictEqual(typeof jwtToken, "string");

      // Decode to check expiration
      const decoded = jwt.decode(jwtToken);
      assert.ok(decoded.exp);
      const now = Math.floor(Date.now() / 1000);
      const expirySeconds = decoded.exp - now;
      // Should be approximately 7 days (604800 seconds)
      assert.ok(expirySeconds > 600000 && expirySeconds < 610000);
    });

    it("signs a ticket JWT with event-aware expiry", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";
      const eventEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
        eventEndTime,
      });

      assert.strictEqual(typeof jwtToken, "string");

      // Decode to check expiration
      const decoded = jwt.decode(jwtToken);
      assert.ok(decoded.exp);
      const expectedExpiry = Math.floor(
        (new Date(eventEndTime).getTime() + 24 * 60 * 60 * 1000) / 1000
      );
      assert.strictEqual(decoded.exp, expectedExpiry);
    });

    it("includes correct payload in JWT", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      const decoded = jwt.decode(jwtToken);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
      assert.strictEqual(decoded.sub, "ticket");
    });

    it("does not include PII in JWT", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      const decoded = jwt.decode(jwtToken);
      assert.strictEqual(decoded.name, undefined);
      assert.strictEqual(decoded.email, undefined);
      assert.strictEqual(decoded.phone, undefined);
    });
  });

  describe("verifyTicketJwt", () => {
    it("verifies a valid JWT", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      const decoded = verifyTicketJwt(jwtToken);
      assert.ok(decoded);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
    });

    it("returns null for invalid JWT", () => {
      const decoded = verifyTicketJwt("invalid-jwt-token");
      assert.strictEqual(decoded, null);
    });

    it("returns null for null input", () => {
      const decoded = verifyTicketJwt(null);
      assert.strictEqual(decoded, null);
    });

    it("returns null for undefined input", () => {
      const decoded = verifyTicketJwt(undefined);
      assert.strictEqual(decoded, null);
    });

    it("returns null for non-string input", () => {
      const decoded = verifyTicketJwt(123);
      assert.strictEqual(decoded, null);
    });

    it("returns null for expired JWT", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      // Sign with immediate expiration
      const jwtToken = jwt.sign(
        { ticketToken, eventId: String(eventId), registrationId },
        testSecret,
        { expiresIn: "0s", subject: "ticket" }
      );

      // Wait a moment to ensure expiration
      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded, null);
    });

    it("returns null for JWT with wrong subject", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = jwt.sign(
        { ticketToken, eventId: String(eventId), registrationId },
        testSecret,
        { expiresIn: "30d", subject: "wrong-subject" }
      );

      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded, null);
    });

    it("returns null for JWT with missing ticketToken", () => {
      const jwtToken = jwt.sign(
        { eventId: "event-123", registrationId: "reg-456" },
        testSecret,
        { expiresIn: "30d", subject: "ticket" }
      );

      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded, null);
    });

    it("verifies previously issued JWTs (backward compatibility)", () => {
      // Simulate a JWT issued with the old 365d expiration
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const oldJwtToken = jwt.sign(
        { ticketToken, eventId: String(eventId), registrationId },
        testSecret,
        { expiresIn: "365d", subject: "ticket" }
      );

      const decoded = verifyTicketJwt(oldJwtToken);
      assert.ok(decoded);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
    });
  });

  describe("integration: sign and verify", () => {
    it("round-trips correctly with default expiry", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
    });

    it("round-trips correctly with event-aware expiry", () => {
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";
      const eventEndTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
        eventEndTime,
      });

      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
    });

    it("round-trips correctly with configured expiry", () => {
      process.env.TICKET_JWT_EXPIRY = "14d";
      const ticketToken = generateTicketToken();
      const eventId = "event-123";
      const registrationId = "reg-456";

      const jwtToken = signTicketJwt({
        ticketToken,
        eventId,
        registrationId,
      });

      const decoded = verifyTicketJwt(jwtToken);
      assert.strictEqual(decoded.ticketToken, ticketToken);
      assert.strictEqual(decoded.eventId, "event-123");
      assert.strictEqual(decoded.registrationId, registrationId);
    });
  });
});
