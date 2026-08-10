import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Info,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const RegistrationWaitlistPosition = ({
  position,
  totalWaitlist = 0,
  availableSeats = 0,
  eventFull = true,
  previousPosition = null,
  estimatedStatus,
  updatedAt,
  className = "",
}) => {
  const safePosition = Math.max(
    0,
    Number(position) || 0
  );

  const safeTotal = Math.max(
    0,
    Number(totalWaitlist) || 0
  );

  const safeSeats = Math.max(
    0,
    Number(availableSeats) || 0
  );

  const positionChange = useMemo(() => {
    if (
      previousPosition === null ||
      previousPosition === undefined
    ) {
      return 0;
    }

    return (
      Number(previousPosition) -
      safePosition
    );
  }, [
    previousPosition,
    safePosition,
  ]);

  const progress =
    safeTotal > 0 && safePosition > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((safeTotal -
              safePosition +
              1) /
              safeTotal) *
              100
          )
        )
      : 0;

  const status =
    estimatedStatus ||
    getEstimatedStatus(
      safePosition,
      safeTotal,
      safeSeats
    );

  const statusStyles =
    getStatusStyles(status);

  const formattedUpdatedAt =
    formatUpdatedAt(updatedAt);

  return (
    <section
      aria-labelledby="waitlist-position-title"
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Users
            size={19}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="waitlist-position-title"
            className="text-sm font-bold text-slate-800 dark:text-white"
          >
            Waitlist Position
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Your position updates automatically as
            seats become available.
          </p>
        </div>

        {formattedUpdatedAt && (
          <span className="hidden items-center gap-1 text-[9px] text-slate-400 sm:flex">
            <Clock3 size={11} />
            {formattedUpdatedAt}
          </span>
        )}
      </div>

      {/* Position */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-800/60">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Your Current Position
        </p>

        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
            #{safePosition || "—"}
          </span>

          {safeTotal > 0 && (
            <span className="text-sm font-medium text-slate-400">
              of {safeTotal}
            </span>
          )}
        </div>

        {/* Position movement */}
        {positionChange !== 0 && (
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              positionChange > 0
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {positionChange > 0 ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )}

            {positionChange > 0
              ? `Moved up ${positionChange} ${
                  positionChange === 1
                    ? "place"
                    : "places"
                }`
              : `Moved down ${Math.abs(
                  positionChange
                )} ${
                  Math.abs(positionChange) === 1
                    ? "place"
                    : "places"
                }`}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Waitlist"
          value={safeTotal}
        />

        <StatCard
          label="Available Seats"
          value={safeSeats}
        />

        <StatCard
          label="Your Position"
          value={
            safePosition
              ? `#${safePosition}`
              : "—"
          }
        />
      </div>

      {/* Progress */}
      {safeTotal > 0 && safePosition > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Waitlist progress
            </span>

            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>

          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={Math.round(
              progress
            )}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Waitlist progress"
          >
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Estimated status */}
      <div
        className={`mt-5 rounded-xl border p-4 ${statusStyles.container}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusStyles.icon}`}
          >
            <Info
              size={15}
              className={statusStyles.text}
            />
          </div>

          <div>
            <p
              className={`text-xs font-bold ${statusStyles.text}`}
            >
              {statusStyles.label}
            </p>

            <p
              className={`mt-1 text-[11px] leading-5 ${statusStyles.description}`}
            >
              {statusStyles.descriptionText}
            </p>
          </div>
        </div>
      </div>

      {/* Availability notice */}
      {safeSeats > 0 && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="text-[11px] font-semibold text-green-700 dark:text-green-400">
            {safeSeats}{" "}
            {safeSeats === 1
              ? "seat is"
              : "seats are"}{" "}
            currently available.
          </p>

          <p className="mt-1 text-[10px] leading-4 text-green-600/80 dark:text-green-400/80">
            Waitlist positions may update as
            registrations are processed.
          </p>
        </div>
      )}

      {/* Event full notice */}
      {eventFull &&
        safeSeats === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              This event is currently full.
            </p>

            <p className="mt-1 text-[10px] leading-4 text-amber-600/80 dark:text-amber-400/80">
              You will be notified if a registration
              slot becomes available.
            </p>
          </div>
        )}
    </section>
  );
};

/* ----------------------------------
   Statistic card
----------------------------------- */

const StatCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Estimated status
----------------------------------- */

const getEstimatedStatus = (
  position,
  total,
  availableSeats
) => {
  if (availableSeats > 0) {
    return "available";
  }

  if (!position || !total) {
    return "unknown";
  }

  const ratio =
    position / total;

  if (position <= 3) {
    return "high";
  }

  if (ratio <= 0.25) {
    return "high";
  }

  if (ratio <= 0.6) {
    return "medium";
  }

  return "low";
};

/* ----------------------------------
   Status styles
----------------------------------- */

const getStatusStyles = (
  status
) => {
  const styles = {
    available: {
      label: "Seats Available",
      text: "text-green-700 dark:text-green-400",
      description:
        "Registration slots are currently available. Complete registration as soon as possible.",
      container:
        "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10",
      icon:
        "bg-green-100 dark:bg-green-900/30",
      descriptionText:
        "Registration slots are currently available. Complete registration as soon as possible.",
    },

    high: {
      label: "High Chance",
      text: "text-green-700 dark:text-green-400",
      description:
        "Your position is near the front of the waitlist, so you may have a good chance of receiving a slot.",
      container:
        "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10",
      icon:
        "bg-green-100 dark:bg-green-900/30",
      descriptionText:
        "Your position is near the front of the waitlist, so you may have a good chance of receiving a slot.",
    },

    medium: {
      label: "Moderate Chance",
      text: "text-amber-700 dark:text-amber-400",
      description:
        "Your position is in the middle of the waitlist. Availability will depend on cancellations.",
      container:
        "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10",
      icon:
        "bg-amber-100 dark:bg-amber-900/30",
      descriptionText:
        "Your position is in the middle of the waitlist. Availability will depend on cancellations.",
    },

    low: {
      label: "Lower Chance",
      text: "text-red-700 dark:text-red-400",
      description:
        "There are many participants ahead of you. Consider checking other available events.",
      container:
        "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10",
      icon:
        "bg-red-100 dark:bg-red-900/30",
      descriptionText:
        "There are many participants ahead of you. Consider checking other available events.",
    },

    unknown: {
      label: "Status Unavailable",
      text: "text-slate-700 dark:text-slate-300",
      description:
        "Waitlist information is currently unavailable.",
      container:
        "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
      icon:
        "bg-slate-100 dark:bg-slate-800",
      descriptionText:
        "Waitlist information is currently unavailable.",
    },
  };

  return (
    styles[status] ||
    styles.unknown
  );
};

/* ----------------------------------
   Updated time
----------------------------------- */

const formatUpdatedAt = (
  value
) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default RegistrationWaitlistPosition;