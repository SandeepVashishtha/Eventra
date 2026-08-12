import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

const EventRegistrationConfirmationResend = ({
  registration,
  onResendConfirmation,
  className = "",
}) => {
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!registration) {
    return null;
  }

  const {
    eventName = "Event",
    registrationId = "N/A",
    email = "",
    dateTime = "",
    venue = "",
    meetingLink = "",
    status = "Registered",
  } = registration;

  const handleResend = async () => {
    if (!email) {
      setError(
        "No verified email address is available for this registration."
      );
      return;
    }

    setIsSending(true);
    setSuccess("");
    setError("");

    try {
      await onResendConfirmation?.({
        registrationId,
        email,
        eventName,
      });

      setSuccess(
        `Confirmation sent successfully to ${maskEmail(email)}.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to resend the registration confirmation."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Mail
            size={21}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Registration Confirmation
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Resend Confirmation
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Send the latest registration details to your verified
            email address.
          </p>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-green-700 dark:text-green-400">
            {success}
          </p>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Event information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {eventName}
            </h3>
          </div>

          <span className="rounded-full bg-green-50 px-3 py-1.5 text-[7px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
            {status}
          </span>
        </div>

        {/* Registration ID */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={<FileText size={14} />}
            label="Registration ID"
            value={registrationId}
          />

          <InfoCard
            icon={<Mail size={14} />}
            label="Verified Email"
            value={maskEmail(email)}
          />

          <InfoCard
            icon={<Clock size={14} />}
            label="Date & Time"
            value={
              dateTime
                ? formatDateTime(dateTime)
                : "Not available"
            }
          />

          <InfoCard
            icon={<MapPin size={14} />}
            label="Venue"
            value={venue || "Online / Not specified"}
          />
        </div>

        {/* Meeting link */}
        {meetingLink && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
              Meeting Link
            </p>

            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-[9px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {meetingLink}
            </a>
          </div>
        )}
      </div>

      {/* Email security */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <ShieldCheck
          size={16}
          className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
        />

        <div>
          <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300">
            Secure delivery
          </p>

          <p className="mt-1 text-[8px] leading-4 text-blue-600/80 dark:text-blue-400">
            The confirmation will only be sent to the verified
            email associated with this registration.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            Need your confirmation again?
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            We will send the latest registration information.
          </p>
        </div>

        <button
          type="button"
          disabled={isSending || !email}
          onClick={handleResend}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={
              isSending
                ? "animate-spin"
                : ""
            }
          />

          {isSending
            ? "Sending..."
            : "Resend Confirmation"}
        </button>
      </div>
    </section>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}

      <p className="text-[7px] font-bold uppercase tracking-wide">
        {label}
      </p>
    </div>

    <p className="mt-2 truncate text-[9px] font-bold text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

const maskEmail = (email) => {
  if (!email || !email.includes("@")) {
    return "Verified email";
  }

  const [username, domain] =
    email.split("@");

  if (username.length <= 2) {
    return `${username[0] || ""}***@${domain}`;
  }

  return `${username.slice(
    0,
    2
  )}***@${domain}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

export default EventRegistrationConfirmationResend;