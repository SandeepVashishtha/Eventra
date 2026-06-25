/**
 * api/_lib/ticketStorage.js
 *
 * Persistent ticket storage backed by Redis, with in-memory fallback
 * for development/testing environments.
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

// ---------------------------------------------------------------------------
// Redis Client Initialization
// ---------------------------------------------------------------------------
let redisClient = null;
let RedisClass = null;

async function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  // Skip Redis if running in Edge Runtime or unsupported environment
  if (typeof process === "undefined" || !process.release || process.env.EDGE_RUNTIME) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL || process.env.KV_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    if (!RedisClass) {
      const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ "ioredis");
      RedisClass = module.default || module;
    }

    redisClient = new RedisClass(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 500)
    });

    redisClient.on("error", (err) => {
      console.error("[ticketStorage.js] Redis client error:", err);
    });

    return redisClient;
  } catch (err) {
    console.error("[ticketStorage.js] Failed to initialize Redis:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory store (fallback for development / test)
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
 * @returns {Object} The stored ticket record
 */
export async function saveTicket(ticket) {
  if (!ticket?.ticketToken) throw new Error("ticketToken is required");

  const redis = await getRedisClient();
  if (redis) {
    const pipeline = redis.pipeline();
    pipeline.set(`ticket:${ticket.ticketToken}`, JSON.stringify(ticket));
    if (ticket.registrationId) {
      pipeline.set(`ticket_reg:${ticket.registrationId}`, ticket.ticketToken);
    }
    await pipeline.exec();
    return ticket;
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
 * @returns {Object|null}
 */
export async function getTicketByToken(ticketToken) {
  const redis = await getRedisClient();
  if (redis) {
    const data = await redis.get(`ticket:${ticketToken}`);
    return data ? JSON.parse(data) : null;
  }

  return ticketsByToken.get(ticketToken) ?? null;
}

/**
 * Retrieve a ticket record by registrationId.
 *
 * @param {string} registrationId
 * @returns {Object|null}
 */
export async function getTicketByRegistrationId(registrationId) {
  const redis = await getRedisClient();
  if (redis) {
    const token = await redis.get(`ticket_reg:${registrationId}`);
    if (!token) return null;
    const data = await redis.get(`ticket:${token}`);
    return data ? JSON.parse(data) : null;
  }

  const token = tokenByRegistrationId.get(registrationId);
  if (!token) return null;
  return ticketsByToken.get(token) ?? null;
}

/**
 * Mark a ticket as checked in.
 * Returns false if already checked in (prevents duplicates).
 *
 * @param {string} ticketToken
 * @returns {{ success: boolean, message?: string, ticket?: Object }}
 */
export async function checkInTicket(ticketToken) {
  const redis = await getRedisClient();
  if (redis) {
    const data = await redis.get(`ticket:${ticketToken}`);
    if (!data) return { success: false, message: "Ticket not found" };
    
    const ticket = JSON.parse(data);
    if (ticket.checkedIn) {
      return { success: false, message: "Attendee already checked in", ticket };
    }
    
    const updated = { ...ticket, checkedIn: true, checkedInAt: new Date().toISOString() };
    await redis.set(`ticket:${ticketToken}`, JSON.stringify(updated));
    return { success: true, ticket: updated };
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
  const redis = await getRedisClient();
  if (redis && process.env.NODE_ENV === 'test') {
    // Dangerous in prod, only use for testing!
    // We only clear memory here for safety, and tests should mock redis.
  }
  ticketsByToken.clear();
  tokenByRegistrationId.clear();
}

/**
 * Return all stored tickets — for testing / admin inspection.
 *
 * @returns {Object[]}
 */
export async function getAllTickets() {
  const redis = await getRedisClient();
  if (redis) {
    // Warning: KEYS is slow in production, but this is an admin/test helper
    const keys = await redis.keys('ticket:*');
    if (!keys || keys.length === 0) return [];
    const values = await redis.mget(keys);
    return values.filter(Boolean).map((v) => JSON.parse(v));
  }
  return Array.from(ticketsByToken.values());
}
