/**
 * api/_lib/ticket-token-config.test.js
 *
 * Tests for ticket token expiration configuration module.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  getTicketJwtExpiry,
  getDefaultExpiry,
  validateExpiryConfig,
  parseDuration,
} from "./ticket-token-config.js";

describe("ticket-token-config", () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.TICKET_JWT_EXPIRY;
    delete process.env.TICKET_JWT_EXPIRY;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.TICKET_JWT_EXPIRY = originalEnv;
    } else {
      delete process.env.TICKET_JWT_EXPIRY;
    }
  });

  describe("parseDuration", () => {
    it("parses seconds correctly", () => {
      assert.strictEqual(parseDuration("30s"), 30);
      assert.strictEqual(parseDuration("60s"), 60);
    });

    it("parses minutes correctly", () => {
      assert.strictEqual(parseDuration("5m"), 300);
      assert.strictEqual(parseDuration("60m"), 3600);
    });

    it("parses hours correctly", () => {
      assert.strictEqual(parseDuration("2h"), 7200);
      assert.strictEqual(parseDuration("24h"), 86400);
    });

    it("parses days correctly", () => {
      assert.strictEqual(parseDuration("1d"), 86400);
      assert.strictEqual(parseDuration("30d"), 2592000);
      assert.strictEqual(parseDuration("365d"), 31536000);
    });

    it("returns null for invalid formats", () => {
      assert.strictEqual(parseDuration("abc"), null);
      assert.strictEqual(parseDuration("30"), null);
      assert.strictEqual(parseDuration("30x"), null);
      assert.strictEqual(parseDuration(""), null);
      assert.strictEqual(parseDuration(null), null);
      assert.strictEqual(parseDuration(undefined), null);
    });

    it("returns null for zero or negative values", () => {
      assert.strictEqual(parseDuration("0d"), null);
      assert.strictEqual(parseDuration("-1d"), null);
    });
  });

  describe("validateExpiryConfig", () => {
    it("validates correct durations", () => {
      assert.strictEqual(validateExpiryConfig("1h"), true);
      assert.strictEqual(validateExpiryConfig("30d"), true);
      assert.strictEqual(validateExpiryConfig("365d"), true);
    });

    it("rejects invalid durations", () => {
      assert.strictEqual(validateExpiryConfig("abc"), false);
      assert.strictEqual(validateExpiryConfig("0d"), false);
      assert.strictEqual(validateExpiryConfig("-1d"), false);
    });

    it("rejects durations that are too short (< 1 hour)", () => {
      assert.strictEqual(validateExpiryConfig("30m"), false);
      assert.strictEqual(validateExpiryConfig("59m"), false);
      assert.strictEqual(validateExpiryConfig("1s"), false);
    });

    it("rejects durations that are too long (> 365 days)", () => {
      assert.strictEqual(validateExpiryConfig("366d"), false);
      assert.strictEqual(validateExpiryConfig("400d"), false);
    });
  });

  describe("getDefaultExpiry", () => {
    it("returns default 30d", () => {
      assert.strictEqual(getDefaultExpiry(), "30d");
    });
  });

  describe("getTicketJwtExpiry", () => {
    it("returns default expiry when no env var set", () => {
      const result = getTicketJwtExpiry();
      assert.strictEqual(result, "30d");
    });

    it("returns configured expiry from env var", () => {
      process.env.TICKET_JWT_EXPIRY = "7d";
      const result = getTicketJwtExpiry();
      assert.strictEqual(result, "7d");
    });

    it("falls back to default for invalid env var", () => {
      process.env.TICKET_JWT_EXPIRY = "invalid";
      const result = getTicketJwtExpiry();
      assert.strictEqual(result, "30d");
    });

    it("falls back to default for env var that is too short", () => {
      process.env.TICKET_JWT_EXPIRY = "30m";
      const result = getTicketJwtExpiry();
      assert.strictEqual(result, "30d");
    });

    it("falls back to default for env var that is too long", () => {
      process.env.TICKET_JWT_EXPIRY = "400d";
      const result = getTicketJwtExpiry();
      assert.strictEqual(result, "30d");
    });

    describe("event-aware expiration", () => {
      it("returns Unix timestamp when event end time is provided", () => {
        const eventEndTime = new Date("2026-08-20T18:00:00Z");
        const result = getTicketJwtExpiry({ eventEndTime });

        assert.strictEqual(typeof result, "number");
        // Should be event end + 24 hours grace period
        const expectedExpiry = Math.floor(
          (new Date(eventEndTime).getTime() + 24 * 60 * 60 * 1000) / 1000
        );
        assert.strictEqual(result, expectedExpiry);
      });

      it("handles event end time as ISO string", () => {
        const eventEndTime = "2026-08-20T18:00:00Z";
        const result = getTicketJwtExpiry({ eventEndTime });

        assert.strictEqual(typeof result, "number");
        const expectedExpiry = Math.floor(
          (new Date(eventEndTime).getTime() + 24 * 60 * 60 * 1000) / 1000
        );
        assert.strictEqual(result, expectedExpiry);
      });

      it("falls back to configured expiry when event end time is invalid", () => {
        process.env.TICKET_JWT_EXPIRY = "7d";
        const result = getTicketJwtExpiry({ eventEndTime: "invalid-date" });
        assert.strictEqual(result, "7d");
      });

      it("falls back to default when event end time is null", () => {
        const result = getTicketJwtExpiry({ eventEndTime: null });
        assert.strictEqual(result, "30d");
      });

      it("falls back to default when event end time is undefined", () => {
        const result = getTicketJwtExpiry({ eventEndTime: undefined });
        assert.strictEqual(result, "30d");
      });

      it("prioritizes event-aware over env var", () => {
        process.env.TICKET_JWT_EXPIRY = "7d";
        const eventEndTime = new Date("2026-08-20T18:00:00Z");
        const result = getTicketJwtExpiry({ eventEndTime });

        assert.strictEqual(typeof result, "number");
        const expectedExpiry = Math.floor(
          (new Date(eventEndTime).getTime() + 24 * 60 * 60 * 1000) / 1000
        );
        assert.strictEqual(result, expectedExpiry);
      });
    });
  });
});
