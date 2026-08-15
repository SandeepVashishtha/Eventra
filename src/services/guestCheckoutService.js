import { apiUtils, API_ENDPOINTS } from "../config/api";
import {
  buildGuestRegistrationPayload,
  buildGuestTicket,
  buildAccountClaimPayload,
  saveGuestTicket,
} from "../utils/guestCheckoutUtils";
 
/**
 * Guest checkout API helpers for strictly free events.
 *
 * The guest endpoints are intentionally unauthenticated: the backend creates a
 * passwordless shadow account from the posted name/email and returns the
 * registration used to render the attendee's ticket QR code.
 */
 
const handleError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};
 
/**
 * RSVP to a free event as a guest and persist the resulting ticket locally so
 * the attendee can reopen their QR code without signing in.
 */
export const registerGuest = async ({ event, name, email, marketingOptIn = false }) => {
  const eventId = event?.id ?? event?.eventId;
  if (!eventId) throw new Error("Event is missing an id");

  const payload = buildGuestRegistrationPayload({ event, name, email, marketingOptIn });

  try {
    const response = await apiUtils.post(API_ENDPOINTS.EVENTS.GUEST_REGISTER(eventId), payload);
    const registration = (await response.json()) || {};
    const ticket = buildGuestTicket({
      event,
      name,
      email,
      registration: { ...registration, reference: registration.reference || payload.reference },
    });
    saveGuestTicket(ticket);
    return ticket;
  } catch (error) {
    handleError(error, "Failed to complete guest RSVP");
  }
};

/**
 * Upgrade a shadow account to a full account by setting a password. Tickets
 * already issued to the email stay attached to it.
 */
export const claimGuestAccount = async ({ email, password }) => {
  const payload = buildAccountClaimPayload({ email, password });

  try {
    const response = await apiUtils.post(API_ENDPOINTS.AUTH.CLAIM_GUEST_ACCOUNT, payload);
    return await response.json();
  } catch (error) {
    handleError(error, "Failed to claim guest account");
  }
};
