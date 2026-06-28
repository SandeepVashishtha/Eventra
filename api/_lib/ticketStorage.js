/**
 * api/_lib/ticketStorage.js
 *
 * In-memory ticket storage for development/testing.
 * In production this would be backed by a persistent store (Redis / PostgreSQL).
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

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// File-backed store (development / test / simple deployment)
// ---------------------------------------------------------------------------

/** @type {Map<string, Object>} ticketToken → record */
const ticketsByToken = new Map();

/** @type {Map<string, string>} registrationId → ticketToken */
const tokenByRegistrationId = new Map();

const DATA_FILE = process.env.TICKET_DATA_FILE || path.join(process.cwd(), '.data', 'tickets.json');

// Initialize store from disk
function initStore() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    } else {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      for (const ticket of data) {
        ticketsByToken.set(ticket.ticketToken, ticket);
        if (ticket.registrationId) {
          tokenByRegistrationId.set(ticket.registrationId, ticket.ticketToken);
        }
      }
    }
  } catch (e) {
    console.error("Failed to initialize ticket storage", e);
  }
}

initStore();

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(ticketsByToken.values()), null, 2));
  } catch (e) {
    console.error("Failed to persist ticket storage", e);
  }
}

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
  ticketsByToken.set(ticket.ticketToken, { ...ticket });
  if (ticket.registrationId) {
    tokenByRegistrationId.set(ticket.registrationId, ticket.ticketToken);
  }
  persistStore();
  return ticket;
}

/**
 * Retrieve a ticket record by its unique token.
 *
 * @param {string} ticketToken
 * @returns {Object|null}
 */
export async function getTicketByToken(ticketToken) {
  return ticketsByToken.get(ticketToken) ?? null;
}

/**
 * Retrieve a ticket record by registrationId.
 *
 * @param {string} registrationId
 * @returns {Object|null}
 */
export async function getTicketByRegistrationId(registrationId) {
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
  const ticket = ticketsByToken.get(ticketToken);
  if (!ticket) return { success: false, message: "Ticket not found" };
  if (ticket.checkedIn) {
    return { success: false, message: "Attendee already checked in", ticket };
  }
  const updated = { ...ticket, checkedIn: true, checkedInAt: new Date().toISOString() };
  ticketsByToken.set(ticketToken, updated);
  persistStore();
  return { success: true, ticket: updated };
}

/**
 * Reset the store — for testing only.
 */
export function resetTicketStorage() {
  ticketsByToken.clear();
  tokenByRegistrationId.clear();
  persistStore();
}

/**
 * Return all stored tickets — for testing / admin inspection.
 *
 * @returns {Object[]}
 */
export function getAllTickets() {
  return Array.from(ticketsByToken.values());
}
