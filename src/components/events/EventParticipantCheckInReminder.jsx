import {
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Send,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const EventParticipantCheckInReminder = ({
  event,
  participant,
  onSendReminder,
  onCheckIn,
  className = "",
}) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [reminderSent, setReminderSent] = useState(false);

  const hasCheckedIn =
    participant?.checkedIn === true;

  const eventStarted = useMemo(() => {
    if (!event?.startTime) return false;

    const startTime = new Date(event.startTime);

    if (Number.isNaN(startTime.getTime())) {
      return false;
    }

    return new Date() >= startTime;
  }, [event?.startTime]);

  // Stop showing the reminder after successful check-in.
  useEffect(() => {
    if (hasCheckedIn) {
      setReminderSent(false);
      setMessage(
        "Check-in completed successfully."
      );
    }
  }, [hasCheckedIn]);

  const handleReminder = async () => {
    if (hasCheckedIn) {
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await onSendReminder?.({
        event,
        participant,
      });

      setReminderSent(true);

      setMessage(
        "Check-in reminder sent successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to send check-in reminder."
      );
    } finally {
      setSending(false);
    }
  };

  const handleCheckIn = async () => {
    setSending(true);
    setMessage("");

    try {
      await onCheckIn?.({
        event,
        participant,
      });

      setMessage(
        "Check-in completed successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to complete check-in."
      );
    } finally {
      setSending(false);
    }
  };

  // Do not show reminder after check-in.
  if (hasCheckedIn) {
    return (
      <div
        className={`rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <UserCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Check-in completed
            </p>

            <p className="mt-1 text-[8px] text-green-700/70 dark:text-green-400/70">
              You are successfully checked in for{" "}
              {event?.name || "this event"}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <Bell size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Check-In Reminder
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Complete Your Check-In
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {eventStarted
              ? "The event has started. Please complete your check-in."
              : "You will receive a reminder when the event begins."}
          </p>
        </div>
      </div>

      {/* Event information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          Event
        </p>

        <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
          {event?.name || "Event"}
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem
            icon={<Clock size={13} />}
            label="Start Time"
            value={formatDate(
              event?.startTime
            )}
          />

          <InfoItem
            icon={<MapPin size={13} />}
            label="Check-In Location"
            value={
              event?.checkInLocation ||
              event?.venue ||
              "Event venue"
            }
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <QrCode
            size={17}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
              Check-In Instructions
            </p>

            <p className="mt-1 text-[8px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
              {event?.checkInInstructions ||
                "Show your registration QR code at the check-in desk to complete attendance verification."}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {event?.checkInQrCode && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
            Your Check-In QR Code
          </p>

          <img
            src={event.checkInQrCode}
            alt="Event check-in QR code"
            className="mx-auto mt-4 h-40 w-40 rounded-xl object-contain"
          />

          {participant?.registrationId && (
            <p className="mt-3 text-[7px] text-slate-400">
              Registration ID:{" "}
              {participant.registrationId}
            </p>
          )}
        </div>
      )}

      {/* Support */}
      {event?.supportContact && (
        <div className="mt-4 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
          <p className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            Need help?
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            Contact: {event.supportContact}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={sending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserCheck size={14} />

          {sending
            ? "Processing..."
            : "Complete Check-In"}
        </button>

        {!reminderSent && (
          <button
            type="button"
            onClick={handleReminder}
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-[8px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400"
          >
            <Send size={13} />
            Send Reminder
          </button>
        )}
      </div>

      {/* Reminder status */}
      {reminderSent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          Check-in reminder sent.
        </div>
      )}

      {/* Message */}
      {message && !reminderSent && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-[8px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </div>
      )}
    </section>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5 text-slate-400">
      {icon}
    </div>

    <div>
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[8px] font-semibold text-slate-700 dark:text-slate-300">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default EventParticipantCheckInReminder;