import { useState } from "react";
import QRCode from "react-qr-code";
import { CheckCircle2, Loader2, Mail, User } from "lucide-react";
import {
  GUEST_CHECKOUT_INELIGIBLE_REASONS,
  getGuestCheckoutEligibility,
  getGuestTicket,
  validateGuestDetails,
} from "../../utils/guestCheckoutUtils";
import { registerGuest } from "../../services/guestCheckoutService";
 
const INELIGIBLE_MESSAGES = {
  [GUEST_CHECKOUT_INELIGIBLE_REASONS.MISSING_EVENT]: "Event details are unavailable.",
  [GUEST_CHECKOUT_INELIGIBLE_REASONS.PAID_EVENT]:
    "Guest checkout is only available for free events. Sign in to buy a ticket.",
  [GUEST_CHECKOUT_INELIGIBLE_REASONS.DISABLED_BY_ORGANIZER]:
    "The organizer requires an Eventra account for this event.",
  [GUEST_CHECKOUT_INELIGIBLE_REASONS.REGISTRATION_CLOSED]:
    "Registration for this event is closed.",
};
 
/**
 * Two-field RSVP for strictly free events: name + email is enough to receive a
 * ticket QR code. The backend provisions a passwordless shadow account, so no
 * password, email verification or profile setup is required.
 */
const GuestCheckoutForm = ({ event, onRegistered }) => {
  const eventId = event?.id ?? event?.eventId;
  const { eligible, reason } = getGuestCheckoutEligibility(event);
 
  const [form, setForm] = useState({ name: "", email: "", marketingOptIn: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ticket, setTicket] = useState(() => getGuestTicket(eventId));
 
  if (!eligible) {
    return (
      <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {INELIGIBLE_MESSAGES[reason]}
      </p>
    );
  }
 
  const handleChange = (field) => (changeEvent) => {
    const value =
      changeEvent.target.type === "checkbox"
        ? changeEvent.target.checked
        : changeEvent.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };
 
  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setSubmitError("");
 
    const validation = validateGuestDetails(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
 
    setSubmitting(true);
    try {
      const issuedTicket = await registerGuest({
        event,
        name: form.name,
        email: form.email,
        marketingOptIn: form.marketingOptIn,
      });
      setTicket(issuedTicket);
      onRegistered?.(issuedTicket);
    } catch (error) {
      setSubmitError(error.message || "Failed to complete guest RSVP");
    } finally {
      setSubmitting(false);
    }
  };
 
  if (ticket) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/40 dark:bg-green-900/10">
        <CheckCircle2 className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          You&apos;re going to {ticket.eventTitle}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Show this QR code at the door. We also emailed it to {ticket.attendeeEmail}.
        </p>
        <div className="mx-auto mt-4 w-fit rounded-lg bg-white p-3">
          <QRCode value={ticket.qrValue} size={144} />
        </div>
        <p className="mt-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          {ticket.reference}
        </p>
      </div>
    );
  }
 
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          RSVP as a guest
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This event is free — just your name and email, no account needed.
        </p>
      </div>
 
      <div>
        <label htmlFor="guest-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="guest-name"
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "guest-name-error" : undefined}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Ada Lovelace"
          />
        </div>
        {errors.name && (
          <p id="guest-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>
 
      <div>
        <label htmlFor="guest-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="guest-email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "guest-email-error" : undefined}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="ada@example.com"
          />
        </div>
        {errors.email && (
          <p id="guest-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
      </div>
 
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={form.marketingOptIn}
          onChange={handleChange("marketingOptIn")}
          className="h-4 w-4 rounded border-slate-300"
        />
        Email me about future events from this organizer
      </label>
 
      {submitError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}
 
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Reserving your spot…" : "Get my free ticket"}
      </button>
 
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        You can set a password later to turn this into a full Eventra account.
      </p>
    </form>
  );
};
 
export default GuestCheckoutForm;
