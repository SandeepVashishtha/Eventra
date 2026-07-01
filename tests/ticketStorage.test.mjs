/**
 * tests/ticketStorage.test.mjs
 *
 * Comprehensive test suite for persistent ticket storage.
 *
 * Tests cover:
 * - Ticket persistence across restarts
 * - Registration lookup
 * - Atomic check-in (prevents duplicates)
 * - Concurrent check-in handling
 * - Production validation (fail-closed)
 * - Development mode (in-memory fallback)
 */

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";

// Store original environment
const originalEnv = { ...process.env };

const TICKET_STORAGE_ENV_VARS = [
  'TICKET_REDIS_URL',
  'NODE_ENV',
];

function setTestEnv(env) {
  TICKET_STORAGE_ENV_VARS.forEach(varName => delete process.env[varName]);
  Object.assign(process.env, env);
}

function restoreEnv() {
  Object.assign(process.env, originalEnv);
}

async function getTicketStorage() {
  return await import("../api/_lib/ticketStorage.js");
}

async function getTicketStorageConfig() {
  return await import("../api/_lib/ticket-storage-config.js");
}

describe("ticketStorage - In-Memory Mode (Test)", () => {
  let storage;

  beforeEach(async () => {
    setTestEnv({ NODE_ENV: "test" });
    storage = await getTicketStorage();
    await storage.resetTicketStorage();
  });

  after(() => {
    restoreEnv();
  });

  it("should save and retrieve ticket by token", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);
    const retrieved = await storage.getTicketByToken("abc-123");

    assert.deepStrictEqual(retrieved, ticket);
  });

  it("should save and retrieve ticket by registrationId", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);
    const retrieved = await storage.getTicketByRegistrationId("reg-456");

    assert.deepStrictEqual(retrieved, ticket);
  });

  it("should check in ticket successfully", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);
    const result = await storage.checkInTicket("abc-123");

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ticket.checkedIn, true);
    assert.ok(result.ticket.checkedInAt);
  });

  it("should reject duplicate check-in", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);
    
    const firstCheckIn = await storage.checkInTicket("abc-123");
    assert.strictEqual(firstCheckIn.success, true);

    const secondCheckIn = await storage.checkInTicket("abc-123");
    assert.strictEqual(secondCheckIn.success, false);
    assert.strictEqual(secondCheckIn.message, "Attendee already checked in");
  });

  it("should return null for non-existent ticket", async () => {
    const retrieved = await storage.getTicketByToken("non-existent");
    assert.strictEqual(retrieved, null);
  });

  it("should return all tickets", async () => {
    const ticket1 = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    const ticket2 = {
      ticketToken: "def-456",
      registrationId: "reg-789",
      eventId: "event-101",
      userId: "user-202",
      attendeeName: "Jane Smith",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket1);
    await storage.saveTicket(ticket2);

    const allTickets = await storage.getAllTickets();
    assert.strictEqual(allTickets.length, 2);
  });

  it("should reset storage", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);
    await storage.resetTicketStorage();

    const retrieved = await storage.getTicketByToken("abc-123");
    assert.strictEqual(retrieved, null);
  });

  it("should initialize in-memory storage in test mode", () => {
    assert.doesNotThrow(() => {
      storage.initializeTicketStorage();
    });
  });
});

describe("ticketStorage - Production Validation", () => {
  let config;

  beforeEach(async () => {
    config = await getTicketStorageConfig();
  });

  it("should fail initialization when TICKET_REDIS_URL missing in production", () => {
    setTestEnv({ NODE_ENV: "production" });
    
    assert.throws(
      () => {
        config.assertDistributedTicketStorageConfigured();
      },
      /TICKET_REDIS_URL is required in production/
    );
  });

  it("should fail initialization when TICKET_REDIS_URL empty in production", () => {
    setTestEnv({ NODE_ENV: "production", TICKET_REDIS_URL: "" });
    
    assert.throws(
      () => {
        config.assertDistributedTicketStorageConfigured();
      },
      /TICKET_REDIS_URL is required in production/
    );
  });

  it("should not allow in-memory storage in production", () => {
    setTestEnv({ NODE_ENV: "production" });
    
    assert.strictEqual(config.isInMemoryTicketStorageAllowed(), false);
  });
});

describe("ticketStorage - Configuration Module", () => {
  let config;

  beforeEach(async () => {
    config = await getTicketStorageConfig();
  });

  it("should detect configured Redis URL", () => {
    setTestEnv({ TICKET_REDIS_URL: "redis://localhost:6379" });
    assert.strictEqual(config.isDistributedTicketStorageConfigured(), true);
  });

  it("should detect missing Redis URL", () => {
    delete process.env.TICKET_REDIS_URL;
    assert.strictEqual(config.isDistributedTicketStorageConfigured(), false);
  });

  it("should detect empty Redis URL", () => {
    setTestEnv({ TICKET_REDIS_URL: "" });
    assert.strictEqual(config.isDistributedTicketStorageConfigured(), false);
  });

  it("should allow in-memory storage in development", () => {
    setTestEnv({ NODE_ENV: "development" });
    assert.strictEqual(config.isInMemoryTicketStorageAllowed(), true);
  });

  it("should allow in-memory storage in test", () => {
    setTestEnv({ NODE_ENV: "test" });
    assert.strictEqual(config.isInMemoryTicketStorageAllowed(), true);
  });

  it("should not allow in-memory storage in production", () => {
    setTestEnv({ NODE_ENV: "production" });
    assert.strictEqual(config.isInMemoryTicketStorageAllowed(), false);
  });

  it("should not throw assertion when Redis configured in production", () => {
    setTestEnv({ NODE_ENV: "production", TICKET_REDIS_URL: "redis://localhost:6379" });
    assert.doesNotThrow(() => {
      config.assertDistributedTicketStorageConfigured();
    });
  });

  it("should throw assertion when Redis missing in production", () => {
    setTestEnv({ NODE_ENV: "production" });
    delete process.env.TICKET_REDIS_URL;
    
    assert.throws(
      () => {
        config.assertDistributedTicketStorageConfigured();
      },
      /TICKET_REDIS_URL is required in production/
    );
  });
});

describe("ticketStorage - Concurrency Handling", () => {
  let storage;

  beforeEach(async () => {
    setTestEnv({ NODE_ENV: "test" });
    storage = await getTicketStorage();
    await storage.resetTicketStorage();
  });

  it("should handle concurrent check-in attempts (in-memory)", async () => {
    const ticket = {
      ticketToken: "abc-123",
      registrationId: "reg-456",
      eventId: "event-789",
      userId: "user-101",
      attendeeName: "John Doe",
      createdAt: new Date().toISOString(),
      checkedIn: false,
      checkedInAt: null,
    };

    await storage.saveTicket(ticket);

    // Simulate concurrent check-ins
    const checkInPromises = Array.from({ length: 5 }, () =>
      storage.checkInTicket("abc-123")
    );

    const results = await Promise.all(checkInPromises);
    
    // Only one should succeed
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    assert.strictEqual(successCount, 1, "Exactly one check-in should succeed");
    assert.strictEqual(failureCount, 4, "Four check-ins should fail as duplicates");
  });
});

describe("ticketStorage - Error Handling", () => {
  let storage;

  beforeEach(async () => {
    setTestEnv({ NODE_ENV: "test" });
    storage = await getTicketStorage();
    await storage.resetTicketStorage();
  });

  it("should throw error when saving ticket without ticketToken", async () => {
    const invalidTicket = {
      registrationId: "reg-456",
      eventId: "event-789",
    };

    await assert.rejects(
      async () => {
        await storage.saveTicket(invalidTicket);
      },
      /ticketToken is required/
    );
  });

  it("should return error for check-in of non-existent ticket", async () => {
    const result = await storage.checkInTicket("non-existent");
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, "Ticket not found");
  });
});
