/**
 * Tests for Ticket Token Operations
 * 
 * These tests verify that ticketToken.js correctly:
 * - Generates unique ticket tokens
 * - Signs JWTs with valid JWT_SECRET
 * - Verifies valid JWTs
 * - Returns null for invalid/expired JWTs
 * - Throws when JWT_SECRET is missing
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";
import { generateTicketToken, signTicketJwt, verifyTicketJwt } from "../api/_lib/ticketToken.js";

describe("Ticket Token Operations", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  after(() => {
    // Restore original JWT_SECRET after all tests
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("generateTicketToken()", () => {
    it("generates a valid UUID v4 string", () => {
      const token = generateTicketToken();
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      assert.match(token, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it("generates unique tokens on each call", () => {
      const token1 = generateTicketToken();
      const token2 = generateTicketToken();
      
      assert.notStrictEqual(token1, token2);
    });
  });

  describe("signTicketJwt()", () => {
    it("throws error when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      
      assert.throws(
        () => signTicketJwt({ ticketToken: "test-token", eventId: "123", registrationId: "reg-123" }),
        /JWT_SECRET is not configured/
      );
    });

    it("throws error when JWT_SECRET is empty", () => {
      process.env.JWT_SECRET = "";
      
      assert.throws(
        () => signTicketJwt({ ticketToken: "test-token", eventId: "123", registrationId: "reg-123" }),
        /JWT_SECRET is not configured/
      );
    });

    it("signs a valid JWT when JWT_SECRET is configured", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: "123", registrationId: "reg-123" });
      
      assert.strictEqual(typeof jwt, "string");
      assert.ok(jwt.length > 0);
    });

    it("includes correct payload in signed JWT", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: "123", registrationId: "reg-123" });
      
      // Decode the JWT (without verification for this test)
      const parts = jwt.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      
      assert.strictEqual(payload.ticketToken, ticketToken);
      assert.strictEqual(payload.eventId, "123");
      assert.strictEqual(payload.registrationId, "reg-123");
      assert.strictEqual(payload.sub, "ticket");
    });
  });

  describe("verifyTicketJwt()", () => {
    it("returns null when JWT_SECRET is missing", () => {
      delete process.env.JWT_SECRET;
      
      const result = verifyTicketJwt("any.jwt.token");
      assert.strictEqual(result, null);
    });

    it("returns null for invalid token", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const result = verifyTicketJwt("invalid-token");
      assert.strictEqual(result, null);
    });

    it("returns null for empty string", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const result = verifyTicketJwt("");
      assert.strictEqual(result, null);
    });

    it("returns null for non-string input", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      assert.strictEqual(verifyTicketJwt(null), null);
      assert.strictEqual(verifyTicketJwt(undefined), null);
      assert.strictEqual(verifyTicketJwt(123), null);
      assert.strictEqual(verifyTicketJwt({}), null);
    });

    it("returns null for JWT signed with different secret", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      // Sign with one secret
      const originalSecret = process.env.JWT_SECRET;
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: "123", registrationId: "reg-123" });
      
      // Try to verify with different secret
      process.env.JWT_SECRET = "different-secret";
      const result = verifyTicketJwt(jwt);
      
      assert.strictEqual(result, null);
      
      // Restore secret
      process.env.JWT_SECRET = originalSecret;
    });

    it("verifies a valid JWT and returns payload", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: "123", registrationId: "reg-123" });
      
      const result = verifyTicketJwt(jwt);
      
      assert.notStrictEqual(result, null);
      assert.strictEqual(result.ticketToken, ticketToken);
      assert.strictEqual(result.eventId, "123");
      assert.strictEqual(result.registrationId, "reg-123");
    });

    it("verifies JWT with numeric eventId", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: 123, registrationId: "reg-123" });
      
      const result = verifyTicketJwt(jwt);
      
      assert.notStrictEqual(result, null);
      assert.strictEqual(result.eventId, "123"); // Should be stringified
    });

    it("returns null for JWT without ticketToken in payload", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      // Create a JWT without ticketToken using jsonwebtoken directly
      const jwt = require("jsonwebtoken");
      const invalidJwt = jwt.sign({ eventId: "123", registrationId: "reg-123" }, process.env.JWT_SECRET, { subject: "ticket" });
      
      const result = verifyTicketJwt(invalidJwt);
      
      assert.strictEqual(result, null);
    });
  });

  describe("Integration: sign and verify flow", () => {
    it("successfully signs and verifies a complete ticket JWT", () => {
      process.env.JWT_SECRET = "test-secret-key-for-testing";
      
      const ticketToken = generateTicketToken();
      const jwt = signTicketJwt({ ticketToken, eventId: "event-456", registrationId: "reg-789" });
      const verified = verifyTicketJwt(jwt);
      
      assert.notStrictEqual(verified, null);
      assert.strictEqual(verified.ticketToken, ticketToken);
      assert.strictEqual(verified.eventId, "event-456");
      assert.strictEqual(verified.registrationId, "reg-789");
    });
  });
});
