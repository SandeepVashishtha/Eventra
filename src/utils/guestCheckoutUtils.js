/**
 * Guest Checkout utilities for strictly free events.
 *
 * Attendees of a free event can RSVP with only a name and an email address.
 * No password, no email verification and no profile setup: the backend
 * provisions a passwordless "shadow account" that the attendee can later
 * claim by setting a password.
 *
 * This module holds the pure logic behind that flow:
 * - deciding whether an event qualifies for guest checkout,
 * - validating the minimal guest form,
 * - building the shadow-account / registration payloads,
 * - deriving a deterministic ticket reference and QR value,
 * - persisting the resulting guest tickets locally so an attendee can
 *   reopen their QR code without an account,
 * - building the payload used when a guest later claims their account.
 */

import { safeJsonParse } from "./safeJsonParse.js";

const STORAGE_KEY = "eventraGuestTickets";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_GUEST_NAME_LENGTH = 80;

export const GUEST_CHECKOUT_INELIGIBLE_REASONS = {
  MISSING_EVENT: "missing-event",
  PAID_EVENT: "paid-event",
  DISABLED_BY_ORGANIZER: "disabled-by-organizer",
  REGISTRATION_CLOSED: "registration-closed",
};

const getStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return globalThis.localStorage;
};

/**
 * Parse a price that may arrive as a number, `null`, or a display string
 * such as "Free", "$0.00" or "0". Returns `null` when it cannot be read.
 */
export const parseTicketPrice = (price) => {
  if (price === null || price === undefined || price === "") return null;
  if (typeof price === "number") return Number.isFinite(price) ? price : null;
  if (typeof price !== "string") return null;

  const normalized = price.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "free" || normalized === "no cost") return 0;

  const digits = normalized.replace(/[^0-9.-]/g, "");
  if (!/\d/.test(digits)) return null;

  const numeric = Number(digits);
  return Number.isFinite(numeric) ? numeric : null;
};

/**
 * An event is strictly free only when every signal agrees: no paid flag, no
 * positive price and no ticket tier that costs anything.
 */
export const isStrictlyFreeEvent = (event) => {
  if (!event || typeof event !== "object") return false;
  if (event.isPaid === true || event.requiresPayment === true) return false;

  const prices = [
    event.price,
    event.ticketPrice,
    event.registrationFee,
    event.entryFee,
    ...(Array.isArray(event.ticketTypes)
      ? event.ticketTypes.map((tier) => tier?.price ?? tier?.amount)
      : []),
  ];

  const parsed = prices.map(parseTicketPrice).filter((value) => value !== null);
  if (parsed.some((value) => value > 0)) return false;

  if (event.isFree === true) return true;
  // Without any price signal the event is treated as unknown, not free.
  return parsed.length > 0;
};

/**
 * Decide whether the guest checkout flow may be offered for an event.
 */
export const getGuestCheckoutEligibility = (event) => {
  if (!event || typeof event !== "object") {
    return { eligible: false, reason: GUEST_CHECKOUT_INELIGIBLE_REASONS.MISSING_EVENT };
  }
  if (!isStrictlyFreeEvent(event)) {
    return { eligible: false, reason: GUEST_CHECKOUT_INELIGIBLE_REASONS.PAID_EVENT };
  }
  if (event.allowGuestCheckout === false || event.guestCheckoutEnabled === false) {
    return { eligible: false, reason: GUEST_CHECKOUT_INELIGIBLE_REASONS.DISABLED_BY_ORGANIZER };
  }
  if (event.registrationOpen === false || event.registrationClosed === true) {
    return { eligible: false, reason: GUEST_CHECKOUT_INELIGIBLE_REASONS.REGISTRATION_CLOSED };
  }
  return { eligible: true, reason: null };
};

export const isGuestCheckoutAvailable = (event) => getGuestCheckoutEligibility(event).eligible;

export const normalizeGuestName = (name) =>
  String(name ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_GUEST_NAME_LENGTH);

export const normalizeGuestEmail = (email) => String(email ?? "").trim().toLowerCase();

/**
 * Validate the two-field guest form. Returns per-field messages so the form
 * can render them inline.
 */
export const validateGuestDetails = (details = {}) => {
  const name = normalizeGuestName(details.name ?? details.fullName);
  const email = normalizeGuestEmail(details.email);
  const errors = {};

  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address";
  }

  return { isValid: Object.keys(errors).length === 0, errors, values: { name, email } };
};

/**
 * Deterministic, human-readable reference so the same guest re-RSVPing to the
 * same event resolves to the same ticket instead of creating duplicates.
 */
export const buildGuestReference = (eventId, email) => {
  const seed = `${eventId ?? ""}:${normalizeGuestEmail(email)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `GUEST-${Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 8)}`;
};

/**
 * Payload for the passwordless shadow account created behind the RSVP.
 */
export const buildShadowAccountPayload = ({ event, name, email }) => {
  const { isValid, errors, values } = validateGuestDetails({ name, email });
  if (!isValid) {
    const [field] = Object.keys(errors);
    throw new Error(errors[field]);
  }

  return {
    fullName: values.name,
    email: values.email,
    accountType: "guest",
    passwordless: true,
    emailVerificationRequired: false,
    source: "guest-checkout",
    eventId: event?.id ?? event?.eventId ?? null,
  };
};

/**
 * Payload posted to the event registration endpoint for a guest RSVP.
 */
export const buildGuestRegistrationPayload = ({ event, name, email, marketingOptIn = false }) => {
  const shadowAccount = buildShadowAccountPayload({ event, name, email });

  return {
    guestCheckout: true,
    fullName: shadowAccount.fullName,
    email: shadowAccount.email,
    marketingOptIn: Boolean(marketingOptIn),
    reference: buildGuestReference(shadowAccount.eventId, shadowAccount.email),
    shadowAccount,
  };
};

/**
 * Build the ticket handed back to the guest, including the QR value that the
 * organizer's scanner reads at the door.
 */
export const buildGuestTicket = ({ event, name, email, registration = {}, issuedAt = Date.now() }) => {
  const values = validateGuestDetails({ name, email }).values;
  const eventId = event?.id ?? event?.eventId ?? null;
  const reference = registration.reference || buildGuestReference(eventId, values.email);
  const ticketId = registration.ticketId || registration.registrationId || reference;

  return {
    ticketId,
    reference,
    eventId,
    eventTitle: event?.title ?? event?.name ?? "Event",
    attendeeName: values.name,
    attendeeEmail: values.email,
    isGuest: true,
    issuedAt,
    qrValue: JSON.stringify({ ticketId, eventId, reference, guest: true }),
  };
};

const readGuestTickets = () => {
  const storage = getStorage();
  if (!storage) return {};
  const parsed = safeJsonParse(storage.getItem(STORAGE_KEY), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
};

const writeGuestTickets = (tickets) => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Storage may be full or unavailable; the ticket is still shown in-session.
  }
};

export const saveGuestTicket = (ticket) => {
  if (!ticket?.eventId) return null;
  const tickets = readGuestTickets();
  tickets[String(ticket.eventId)] = ticket;
  writeGuestTickets(tickets);
  return ticket;
};

export const getGuestTicket = (eventId) => {
  if (eventId === null || eventId === undefined) return null;
  return readGuestTickets()[String(eventId)] ?? null;
};

export const listGuestTickets = () => Object.values(readGuestTickets());

export const clearGuestTicket = (eventId) => {
  const tickets = readGuestTickets();
  delete tickets[String(eventId)];
  writeGuestTickets(tickets);
};

/**
 * Payload used when a guest later upgrades their shadow account by choosing a
 * password. Every ticket already issued to that email stays attached to it.
 */
export const buildAccountClaimPayload = ({ email, password }) => {
  const normalizedEmail = normalizeGuestEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) throw new Error("Enter a valid email address");
  if (!password || String(password).length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return {
    email: normalizedEmail,
    password: String(password),
    claimShadowAccount: true,
    ticketReferences: listGuestTickets()
      .filter((ticket) => ticket.attendeeEmail === normalizedEmail)
      .map((ticket) => ticket.reference),
  };
};
