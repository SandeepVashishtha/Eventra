import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
 
const store = {};
globalThis.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};
globalThis.window = { localStorage: globalThis.localStorage };
 
const {
  GUEST_CHECKOUT_INELIGIBLE_REASONS,
  parseTicketPrice,
  isStrictlyFreeEvent,
  getGuestCheckoutEligibility,
  isGuestCheckoutAvailable,
  normalizeGuestName,
  normalizeGuestEmail,
  validateGuestDetails,
  buildGuestReference,
  buildShadowAccountPayload,
  buildGuestRegistrationPayload,
  buildGuestTicket,
  saveGuestTicket,
  getGuestTicket,
  listGuestTickets,
  clearGuestTicket,
  buildAccountClaimPayload,
} = await import("../src/utils/guestCheckoutUtils.js");
 
const freeEvent = { id: 42, title: "Park Cleanup", isFree: true, price: 0 };
 
describe("guest checkout price parsing", () => {
  it("parses numeric, string and currency-formatted prices", () => {
    assert.equal(parseTicketPrice(0), 0);
    assert.equal(parseTicketPrice("Free"), 0);
    assert.equal(parseTicketPrice("$12.50"), 12.5);
    assert.equal(parseTicketPrice("0"), 0);
  });
 
  it("returns null for unreadable prices", () => {
    assert.equal(parseTicketPrice(null), null);
    assert.equal(parseTicketPrice(""), null);
    assert.equal(parseTicketPrice("TBD"), null);
    assert.equal(parseTicketPrice(Number.NaN), null);
  });
});
 
describe("guest checkout eligibility", () => {
  it("accepts strictly free events", () => {
    assert.equal(isStrictlyFreeEvent(freeEvent), true);
    assert.equal(isStrictlyFreeEvent({ price: "Free" }), true);
    assert.equal(isGuestCheckoutAvailable(freeEvent), true);
  });
 
  it("rejects events with any paid signal", () => {
    assert.equal(isStrictlyFreeEvent({ isFree: true, isPaid: true }), false);
    assert.equal(isStrictlyFreeEvent({ price: 0, ticketPrice: 25 }), false);
    assert.equal(
      isStrictlyFreeEvent({ isFree: true, ticketTypes: [{ price: 0 }, { price: 15 }] }),
      false
    );
  });
 
  it("treats an event without price signals as unknown", () => {
    assert.equal(isStrictlyFreeEvent({ id: 1, title: "Mystery" }), false);
  });
 
  it("reports why guest checkout is unavailable", () => {
    assert.equal(
      getGuestCheckoutEligibility(null).reason,
      GUEST_CHECKOUT_INELIGIBLE_REASONS.MISSING_EVENT
    );
    assert.equal(
      getGuestCheckoutEligibility({ price: 20 }).reason,
      GUEST_CHECKOUT_INELIGIBLE_REASONS.PAID_EVENT
    );
    assert.equal(
      getGuestCheckoutEligibility({ ...freeEvent, allowGuestCheckout: false }).reason,
      GUEST_CHECKOUT_INELIGIBLE_REASONS.DISABLED_BY_ORGANIZER
    );
    assert.equal(
      getGuestCheckoutEligibility({ ...freeEvent, registrationOpen: false }).reason,
      GUEST_CHECKOUT_INELIGIBLE_REASONS.REGISTRATION_CLOSED
    );
  });
});
 
describe("guest detail validation", () => {
  it("normalizes whitespace and casing", () => {
    assert.equal(normalizeGuestName("  Ada   Lovelace "), "Ada Lovelace");
    assert.equal(normalizeGuestEmail("  Ada@Example.COM "), "ada@example.com");
    assert.equal(normalizeGuestName(null), "");
  });
 
  it("requires a name and a valid email", () => {
    assert.deepEqual(validateGuestDetails({ name: "", email: "" }).errors, {
      name: "Name is required",
      email: "Email is required",
    });
    assert.equal(validateGuestDetails({ name: "A", email: "a@b.co" }).errors.name,
      "Name must be at least 2 characters");
    assert.equal(
      validateGuestDetails({ name: "Ada", email: "not-an-email" }).errors.email,
      "Enter a valid email address"
    );
  });
 
  it("accepts a valid minimal guest form", () => {
    const result = validateGuestDetails({ name: "Ada Lovelace", email: "ADA@example.com" });
    assert.equal(result.isValid, true);
    assert.deepEqual(result.values, { name: "Ada Lovelace", email: "ada@example.com" });
  });
});
 
describe("guest payloads", () => {
  it("derives a stable reference per event + email", () => {
    const first = buildGuestReference(42, "Ada@example.com");
    assert.equal(first, buildGuestReference(42, "ada@example.com"));
    assert.notEqual(first, buildGuestReference(43, "ada@example.com"));
    assert.match(first, /^GUEST-[0-9A-Z]+$/);
  });
 
  it("builds a passwordless shadow account payload", () => {
    const payload = buildShadowAccountPayload({
      event: freeEvent,
      name: " Ada Lovelace ",
      email: "ADA@example.com",
    });
    assert.deepEqual(payload, {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      accountType: "guest",
      passwordless: true,
      emailVerificationRequired: false,
      source: "guest-checkout",
      eventId: 42,
    });
  });
 
  it("rejects invalid guest details before hitting the API", () => {
    assert.throws(
      () => buildShadowAccountPayload({ event: freeEvent, name: "Ada", email: "nope" }),
      /valid email/
    );
  });
 
  it("wraps the shadow account in the registration payload", () => {
    const payload = buildGuestRegistrationPayload({
      event: freeEvent,
      name: "Ada Lovelace",
      email: "ada@example.com",
      marketingOptIn: true,
    });
    assert.equal(payload.guestCheckout, true);
    assert.equal(payload.marketingOptIn, true);
    assert.equal(payload.reference, buildGuestReference(42, "ada@example.com"));
    assert.equal(payload.shadowAccount.passwordless, true);
  });
});
 
describe("guest tickets", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });
 
  it("builds a ticket with a scannable QR value", () => {
    const ticket = buildGuestTicket({
      event: freeEvent,
      name: "Ada Lovelace",
      email: "ada@example.com",
      registration: { registrationId: "REG-9" },
      issuedAt: 1700000000000,
    });
 
    assert.equal(ticket.ticketId, "REG-9");
    assert.equal(ticket.eventTitle, "Park Cleanup");
    assert.equal(ticket.isGuest, true);
    assert.deepEqual(JSON.parse(ticket.qrValue), {
      ticketId: "REG-9",
      eventId: 42,
      reference: ticket.reference,
      guest: true,
    });
  });
 
  it("falls back to the reference when the backend omits ids", () => {
    const ticket = buildGuestTicket({ event: freeEvent, name: "Ada", email: "ada@example.com" });
    assert.equal(ticket.ticketId, ticket.reference);
  });
 
  it("persists, reads and clears tickets per event", () => {
    const ticket = buildGuestTicket({ event: freeEvent, name: "Ada", email: "ada@example.com" });
    saveGuestTicket(ticket);
 
    assert.deepEqual(getGuestTicket(42), ticket);
    assert.deepEqual(getGuestTicket("42"), ticket);
    assert.equal(listGuestTickets().length, 1);
 
    clearGuestTicket(42);
    assert.equal(getGuestTicket(42), null);
    assert.equal(listGuestTickets().length, 0);
  });
 
  it("ignores tickets without an event id", () => {
    assert.equal(saveGuestTicket({ reference: "GUEST-1" }), null);
    assert.equal(getGuestTicket(undefined), null);
  });
});
 
describe("claiming a shadow account", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });
 
  it("attaches previously issued tickets to the claim", () => {
    saveGuestTicket(buildGuestTicket({ event: freeEvent, name: "Ada", email: "ada@example.com" }));
    saveGuestTicket(
      buildGuestTicket({ event: { id: 7, title: "Open Mic", isFree: true }, name: "Bob", email: "bob@example.com" })
    );
 
    const payload = buildAccountClaimPayload({ email: "ADA@example.com", password: "hunter2hunter" });
    assert.equal(payload.claimShadowAccount, true);
    assert.deepEqual(payload.ticketReferences, [buildGuestReference(42, "ada@example.com")]);
  });
 
  it("rejects weak passwords and bad emails", () => {
    assert.throws(() => buildAccountClaimPayload({ email: "nope", password: "hunter2hunter" }), /valid email/);
    assert.throws(() => buildAccountClaimPayload({ email: "ada@example.com", password: "short" }), /8 characters/);
  });
});
