import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const OFFER_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

const EventParticipantWaitlistAutoExpiry = ({
  initialOffer,
  confirmationMinutes = 30,
  onAccept,
  onDecline,
  onExpire,
  onPromoteNext,
  className = "",
}) => {
  const [offer, setOffer] = useState(
    initialOffer || null
  );

  const [remainingSeconds, setRemainingSeconds] =
    useState(() =>
      getRemainingSeconds(
        initialOffer?.expiresAt
      )
    );

  const [processing, setProcessing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const isPending =
    offer?.status === OFFER_STATUS.PENDING;

  const isExpired =
    isPending && remainingSeconds <= 0;

  const formattedTime = useMemo(
    () => formatCountdown(remainingSeconds),
    [remainingSeconds]
  );

  /*
   * Countdown timer.
   * Once the timer reaches zero, the promotion
   * offer is automatically expired.
   */
  useEffect(() => {
    if (!isPending) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(
        getRemainingSeconds(offer.expiresAt)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [offer, isPending]);

  /*
   * Automatically expire the offer when the
   * confirmation period ends.
   */
  useEffect(() => {
    if (!isPending || remainingSeconds > 0) {
      return;
    }

    expireOffer();
  }, [remainingSeconds, isPending]);

  const expireOffer = async () => {
    if (!offer || offer.status !== OFFER_STATUS.PENDING) {
      return;
    }

    setProcessing(true);
    setError("");

    const expiredOffer = {
      ...offer,
      status: OFFER_STATUS.EXPIRED,
      expiredAt: new Date().toISOString(),
    };

    try {
      setOffer(expiredOffer);

      await onExpire?.(expiredOffer);

      setMessage(
        "The waitlist offer expired because no response was received."
      );

      await onPromoteNext?.({
        eventId: offer.eventId,
        sessionId: offer.sessionId,
        previousParticipantId:
          offer.participantId,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to process the expired offer."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!offer || !isPending || remainingSeconds <= 0) {
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    const acceptedOffer = {
      ...offer,
      status: OFFER_STATUS.ACCEPTED,
      respondedAt: new Date().toISOString(),
    };

    try {
      setOffer(acceptedOffer);

      await onAccept?.(acceptedOffer);

      setMessage(
        "Your waitlist promotion has been accepted."
      );
    } catch (err) {
      setOffer(offer);

      setError(
        err?.message ||
          "Unable to accept the waitlist offer."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!offer || !isPending) {
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    const declinedOffer = {
      ...offer,
      status: OFFER_STATUS.DECLINED,
      respondedAt: new Date().toISOString(),
    };

    try {
      setOffer(declinedOffer);

      await onDecline?.(declinedOffer);

      setMessage(
        "You declined the waitlist promotion."
      );

      await onPromoteNext?.({
        eventId: offer.eventId,
        sessionId: offer.sessionId,
        previousParticipantId:
          offer.participantId,
      });
    } catch (err) {
      setOffer(offer);

      setError(
        err?.message ||
          "Unable to decline the waitlist offer."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!offer) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900 ${className}`}
      >
        <Clock
          size={24}
          className="mx-auto text-slate-400"
        />

        <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          No active waitlist offer
        </p>

        <p className="mt-1 text-[8px] text-slate-400">
          You currently do not have a pending promotion
          offer.
        </p>
      </div>
    );
  }

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <UserCheck size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Waitlist Promotion
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            A Seat Is Available
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You have been promoted from the waitlist.
          </p>
        </div>
      </div>

      {/* Event details */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          Event
        </p>

        <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
          {offer.eventName || "Event"}
        </h3>

        {offer.sessionName && (
          <p className="mt-1 text-[8px] text-slate-400">
            Session: {offer.sessionName}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoCard
            label="Previous Position"
            value={
              offer.previousPosition
                ? `#${offer.previousPosition}`
                : "Waitlisted"
            }
          />

          <InfoCard
            label="Seat Available"
            value="1"
          />
        </div>
      </div>

      {/* Countdown */}
      {isPending && !isExpired && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900/30 dark:bg-amber-900/10">
          <Clock
            size={20}
            className="mx-auto text-amber-600 dark:text-amber-400"
          />

          <p className="mt-2 text-[8px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Confirmation Required
          </p>

          <p className="mt-2 text-3xl font-black tracking-wider text-amber-700 dark:text-amber-400">
            {formattedTime}
          </p>

          <p className="mt-2 text-[7px] text-amber-700/70 dark:text-amber-400/70">
            Accept this offer before the timer expires.
          </p>
        </div>
      )}

      {/* Expired */}
      {offer.status === OFFER_STATUS.EXPIRED && (
        <StatusMessage
          icon={<Clock size={17} />}
          title="Offer Expired"
          description="The confirmation period ended without a response. The seat can now be offered to the next eligible participant."
          type="warning"
        />
      )}

      {/* Accepted */}
      {offer.status === OFFER_STATUS.ACCEPTED && (
        <StatusMessage
          icon={<CheckCircle2 size={17} />}
          title="Promotion Accepted"
          description="Your waitlist promotion has been accepted and the seat has been reserved for you."
          type="success"
        />
      )}

      {/* Declined */}
      {offer.status === OFFER_STATUS.DECLINED && (
        <StatusMessage
          icon={<UserX size={17} />}
          title="Promotion Declined"
          description="You declined this seat. The seat can now be offered to the next eligible participant."
          type="neutral"
        />
      )}

      {/* Actions */}
      {isPending && !isExpired && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={processing}
            onClick={handleAccept}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserCheck size={14} />

            {processing
              ? "Processing..."
              : "Accept Seat"}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleDecline}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[8px] font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
          >
            <UserX size={14} />
            Decline
          </button>
        </div>
      )}

      {/* Status */}
      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <AlertTriangle
            size={14}
            className="shrink-0"
          />
          {error}
        </div>
      )}
    </section>
  );
};

const InfoCard = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const StatusMessage = ({
  icon,
  title,
  description,
  type,
}) => {
  const styles = {
    success:
      "border-green-200 bg-green-50 text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400",

    warning:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400",

    neutral:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <div
      className={`mt-5 rounded-2xl border p-4 ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {icon}
        </div>

        <div>
          <p className="text-[9px] font-bold">
            {title}
          </p>

          <p className="mt-1 text-[7px] leading-4 opacity-75">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const getRemainingSeconds = (
  expiresAt
) => {
  if (!expiresAt) {
    return 0;
  }

  const expiration =
    new Date(expiresAt).getTime();

  if (Number.isNaN(expiration)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (expiration - Date.now()) / 1000
    )
  );
};

const formatCountdown = (
  totalSeconds
) => {
  const seconds = Math.max(
    0,
    totalSeconds
  );

  const minutes = Math.floor(
    seconds / 60
  );

  const remaining =
    seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remaining).padStart(
    2,
    "0"
  )}`;
};

export default EventParticipantWaitlistAutoExpiry;