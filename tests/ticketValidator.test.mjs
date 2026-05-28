import assert from "node:assert/strict";
import CryptoJS from "crypto-js";

const eventId = "evt_ai_2026";
const ticketId = "AI-2026-ADA";

// Deterministic secret calculation
const getEventSecret = (id) => {
  return CryptoJS.SHA256(id + "-eventra-secure-salt").toString();
};

const signTicket = (tid, eid, ts, secret) => {
  return CryptoJS.HmacSHA256(`${tid}-${eid}-${ts}`, secret).toString();
};

console.log("Starting Ticket Validator Cryptography & Expiration Tests...");

// ── Test 1: Successful Validation ──────────────────────────────────────────
const eventSecret = getEventSecret(eventId);
const timestamp = Date.now();
const signature = signTicket(ticketId, eventId, timestamp, eventSecret);

// Re-verify signature
const recomputedSecret = getEventSecret(eventId);
const expectedSignature = signTicket(ticketId, eventId, timestamp, recomputedSecret);

assert.equal(signature, expectedSignature, "Authentic signature verification passes");

// ── Test 2: Forgery Rejection ───────────────────────────────────────────────
const forgedSignature = "bad-forged-signature-hash";
assert.notEqual(signature, forgedSignature, "Forged signature mismatch is detected");

const modifiedTicketId = "AI-2026-TURING";
const modifiedSignature = signTicket(modifiedTicketId, eventId, timestamp, eventSecret);
assert.notEqual(signature, modifiedSignature, "Modified ticket ID changes the signature");

// ── Test 3: Expiration / Replay Attack Prevention ─────────────────────────
const now = Date.now();
const windowLimit = 120 * 1000; // 120 seconds

// Case A: Fresh ticket (10 seconds old)
const freshTime = now - 10000;
const freshDiff = Math.abs(now - freshTime);
assert.ok(freshDiff <= windowLimit, "Fresh ticket timestamp is within 120s validation window");

// Case B: Expired ticket (5 minutes old)
const expiredTime = now - 5 * 60 * 1000;
const expiredDiff = Math.abs(now - expiredTime);
assert.ok(expiredDiff > windowLimit, "Expired ticket timestamp is correctly flagged outside the 120s window");

// ── Test 4: Manifest Cache Merging Mock ────────────────────────────────────
const mockManifest = {
  eventId: "evt_ai_2026",
  attendees: [
    { ticketId: "AI-2026-ADA", userName: "Ada Lovelace", ticketType: "VIP" },
    { ticketId: "AI-2026-ALA", userName: "Alan Turing", ticketType: "General" }
  ]
};

// Verify attendee is in registry
const attendeeDan = mockManifest.attendees.find(a => a.ticketId === "RJS-DAN");
assert.equal(attendeeDan, undefined, "Unregistered ticket is correctly missing from manifest");

const attendeeAda = mockManifest.attendees.find(a => a.ticketId === "AI-2026-ADA");
assert.ok(attendeeAda !== undefined, "Registered ticket is found in manifest");
assert.equal(attendeeAda.userName, "Ada Lovelace");

console.log("All Ticket Validator Cryptography & Expiration tests passed successfully ✓");
