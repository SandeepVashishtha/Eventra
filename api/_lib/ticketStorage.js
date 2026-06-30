/**
 * api/_lib/ticketStorage.js
 *
 * Persistent ticket storage with Redis for production.
 * Falls back to in-memory Map storage for development/testing.
 *
 * Schema for each ticket record:
 * {
 *   ticketToken   : string  — UUID v4 (primary lookup key)
 *   registrationId: string  — UUID v4
 *   eventId       : string
 *   userId        : string
 *   attendeeName  : string  — display name, no sensitive data stored in QR
 *   createdAt     : string  — ISO timestamp
 *   checkedIn     : boolean
 *   checkedInAt   : string|null — ISO timestamp or null
 * }
 */

import Redis from "ioredis";
import {
  isDistributedTicketStorageConfigured,
  isInMemoryTicketStorageAllowed,
  assertDistributedTicketStorageConfigured,
} from "./ticket-storage-config.js";

// ---------------------------------------------------------------------------
// Redis client (production)
// ---------------------------------------------------------------------------

let redisClient = null;
let redisConnected = false;

// Register cleanup hook to close Redis connection on process exit
let cleanupRegistered = false;
function registerCleanupHook() {
  if (cleanupRegistered) return;
  cleanupRegistered = true;
  const cleanup = async () => {
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {
        // Ignore cleanup errors
      }
      redisClient = null;
      redisConnected = false;
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

/**
 * Gets or creates the Redis client for ticket storage.
 *
 * @returns {Redis|null} Redis client or null if not configured
 * @throws {Error} If Redis connection fails
 */
function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  registerCleanupHook();

  if (!isDistributedTicketStorageConfigured()) {
    return null;
  }

  try {
    const redisUrl = process.env.TICKET_REDIS_URL;
    if (!redisUrl) {
      console.error("[TICKET_STORAGE] No Redis URL configured. Set TICKET_REDIS_URL.");
      return null;
    }

    const client = new Redis(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 500);
      },
    });

    client.on("error", (err) => {
      console.error("[TICKET_STORAGE] Redis client error:", err);
      redisConnected = false;
    });

    client.on("connect", () => {
      console.log("[TICKET_STORAGE] Connected to persistent backend (Redis)");
      redisConnected = true;
    });

    redisClient = client;
    return redisClient;
  } catch (err) {
    console.error("[TICKET_STORAGE] Failed to create Redis client:", err);
    redisClient = null;
    redisConnected = false;
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory store (development / test fallback)
// ---------------------------------------------------------------------------

/** @type {Map<string, Object>} ticketToken → record */
const ticketsByToken = new Map();

/** @type {Map<string, string>} registrationId → ticketToken */
const tokenByRegistrationId = new Map();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Persist a newly generated ticket record.
 *
 * @param {Object} ticket
 * @returns {Promise<Object>} The stored ticket record
 * @throws {Error} If ticketToken is missing or storage fails
 */
export async function saveTicket(ticket) {
  if (!ticket?.ticketToken) throw new Error("ticketToken is required");

  const redis = getRedisClient();

  if (redis) {
    // Use Redis for persistent storage
    try {
      const ticketKey = `ticket:${ticket.ticketToken}`;
      const regKey = `ticket:reg:${ticket.registrationId}`;

      const pipeline = redis.pipeline();
      // Store ticket data as JSON
      pipeline.set(ticketKey, JSON.stringify(ticket));
      // Create registration index
      if (ticket.registrationId) {
        pipeline.set(regKey, ticket.ticketToken);
      }
      await pipeline.exec();

      console.log(`[TICKET_STORAGE] Ticket stored: ${ticket.ticketToken}`);
      return ticket;
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to save ticket to Redis:", err);
      // In production, fail loudly
      if (!isInMemoryTicketStorageAllowed()) {
        throw new Error("Ticket storage unavailable. Cannot persist ticket data.");
      }
      // Fall back to in-memory for development
      console.warn("[TICKET_STORAGE] Falling back to in-memory storage");
    }
  }

  // In-memory fallback (development/test only)
  if (!isInMemoryTicketStorageAllowed()) {
    throw new Error(
      "In-memory ticket storage is not permitted in production. Configure TICKET_REDIS_URL."
    );
  }

  ticketsByToken.set(ticket.ticketToken, { ...ticket });
  if (ticket.registrationId) {
    tokenByRegistrationId.set(ticket.registrationId, ticket.ticketToken);
  }
  return ticket;
}

/**
 * Retrieve a ticket record by its unique token.
 *
 * @param {string} ticketToken
 * @returns {Promise<Object|null>}
 */
export async function getTicketByToken(ticketToken) {
  const redis = getRedisClient();

  if (redis) {
    try {
      const ticketKey = `ticket:${ticketToken}`;
      const data = await redis.get(ticketKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to retrieve ticket from Redis:", err);
      // Fall back to in-memory on error
    }
  }

  // In-memory fallback
  return ticketsByToken.get(ticketToken) ?? null;
}

/**
 * Retrieve a ticket record by registrationId.
 *
 * @param {string} registrationId
 * @returns {Promise<Object|null>}
 */
export async function getTicketByRegistrationId(registrationId) {
  const redis = getRedisClient();

  if (redis) {
    try {
      const regKey = `ticket:reg:${registrationId}`;
      const token = await redis.get(regKey);
      if (token) {
        return await getTicketByToken(token);
      }
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to retrieve registration from Redis:", err);
      // Fall back to in-memory on error
    }
  }

  // In-memory fallback
  const token = tokenByRegistrationId.get(registrationId);
  if (!token) return null;
  return ticketsByToken.get(token) ?? null;
}

/**
 * Mark a ticket as checked in.
 * Uses atomic Redis operations to prevent race conditions.
 *
 * @param {string} ticketToken
 * @returns {Promise<{ success: boolean, message?: string, ticket?: Object }>}
 */
export async function checkInTicket(ticketToken) {
  const redis = getRedisClient();

  if (redis) {
    try {
      const ticketKey = `ticket:${ticketToken}`;

      // Atomic check-in using Redis Lua script
      // This prevents race conditions by ensuring only one check-in succeeds
      const luaScript = `
        local ticket = redis.call('GET', KEYS[1])
        if not ticket then
          return {err = "Ticket not found"}
        end
        
        local data = cjson.decode(ticket)
        if data.checkedIn == true then
          return {err = "Attendee already checked in"}
        end
        
        data.checkedIn = true
        data.checkedInAt = ARGV[1]
        redis.call('SET', KEYS[1], cjson.encode(data))
        
        return {ok = cjson.encode(data)}
      `;

      const result = await redis.eval(
        luaScript,
        1,
        ticketKey,
        new Date().toISOString()
      );

      if (result[0] === "err") {
        return { success: false, message: result[1] };
      }

      const updated = JSON.parse(result[1]);
      console.log(`[TICKET_STORAGE] Ticket checked in: ${ticketToken}`);
      return { success: true, ticket: updated };
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to check in ticket via Redis:", err);
      // In production, fail loudly
      if (!isInMemoryTicketStorageAllowed()) {
        throw new Error("Ticket storage unavailable. Cannot perform check-in.");
      }
      // Fall back to in-memory for development
      console.warn("[TICKET_STORAGE] Falling back to in-memory check-in");
    }
  }

  // In-memory fallback (development/test only)
  if (!isInMemoryTicketStorageAllowed()) {
    throw new Error(
      "In-memory ticket storage is not permitted in production. Configure TICKET_REDIS_URL."
    );
  }

  const ticket = ticketsByToken.get(ticketToken);
  if (!ticket) return { success: false, message: "Ticket not found" };
  if (ticket.checkedIn) {
    return { success: false, message: "Attendee already checked in", ticket };
  }
  const updated = { ...ticket, checkedIn: true, checkedInAt: new Date().toISOString() };
  ticketsByToken.set(ticketToken, updated);
  return { success: true, ticket: updated };
}

/**
 * Reset the store — for testing only.
 */
export async function resetTicketStorage() {
  const redis = getRedisClient();

  if (redis) {
    try {
      // Delete all ticket keys
      const ticketKeys = await redis.keys("ticket:*");
      if (ticketKeys.length > 0) {
        await redis.del(...ticketKeys);
      }
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to reset Redis storage:", err);
    }
  }

  // Always clear in-memory store
  ticketsByToken.clear();
  tokenByRegistrationId.clear();
}

/**
 * Return all stored tickets — for testing / admin inspection.
 *
 * @returns {Promise<Object[]>}
 */
export async function getAllTickets() {
  const redis = getRedisClient();

  if (redis) {
    try {
      const ticketKeys = await redis.keys("ticket:*");
      if (ticketKeys.length === 0) {
        return [];
      }

      const tickets = await redis.mget(...ticketKeys);
      return tickets
        .filter((data) => data !== null)
        .map((data) => JSON.parse(data));
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to retrieve all tickets from Redis:", err);
      // Fall back to in-memory on error
    }
  }

  // In-memory fallback
  return Array.from(ticketsByToken.values());
}

/**
 * Initialize ticket storage and validate configuration.
 * Call this during application startup to fail fast if storage is misconfigured.
 *
 * @throws {Error} If production storage is not properly configured
 */
export function initializeTicketStorage() {
  assertDistributedTicketStorageConfigured();

  const redis = getRedisClient();
  if (redis) {
    console.log("[TICKET_STORAGE] Persistent storage initialized (Redis)");
  } else if (isInMemoryTicketStorageAllowed()) {
    console.log("[TICKET_STORAGE] In-memory storage initialized (development/test mode)");
  } else {
    throw new Error(
      "Ticket storage initialization failed: TICKET_REDIS_URL required in production"
    );
  }
}

/**
 * Close the Redis connection (for graceful shutdown).
 *
 * @returns {Promise<void>}
 */
export async function closeTicketStorage() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      redisConnected = false;
      console.log("[TICKET_STORAGE] Redis connection closed");
    } catch (err) {
      console.error("[TICKET_STORAGE] Failed to close Redis connection:", err);
    }
  }
}
