import {
  Calendar,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  PauseCircle,
  LoaderCircle,
} from "lucide-react";
import { useMemo } from "react";

const STATUS_CONFIG = {
  Upcoming: {
    icon: Calendar,
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  "Registration Open": {
    icon: CheckCircle2,
    badge:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  "Registration Closed": {
    icon: Clock3,
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  Ongoing: {
    icon: LoaderCircle,
    badge:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  },
  Completed: {
    icon: CheckCircle2,
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  Cancelled: {
    icon: XCircle,
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  Postponed: {
    icon: PauseCircle,
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
};

const EventCompletionStatus = ({
  event,
  organizerStatus,
  className = "",
  showTimeline = true,
}) => {
  const status = useMemo(
    () => getEventStatus(event, organizerStatus),
    [event, organizerStatus]
  );

  const config =
    STATUS_CONFIG[status] || STATUS_CONFIG.Upcoming;

  const Icon = config.icon;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Event Status
          </p>

          <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {event?.title || "Event"}
          </h3>
        </div>

        <StatusBadge status={status} />
      </div>

      {showTimeline && (
        <StatusTimeline
          currentStatus={status}
          organizerStatus={organizerStatus}
        />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {event?.startDate && (
          <InfoItem
            label="Start Date"
            value={formatDate(event.startDate)}
          />
        )}

        {event?.endDate && (
          <InfoItem
            label="End Date"
            value={formatDate(event.endDate)}
          />
        )}

        {event?.registrationDeadline && (
          <InfoItem
            label="Registration Deadline"
            value={formatDate(event.registrationDeadline)}
          />
        )}

        <InfoItem
          label="Current Status"
          value={status}
        />
      </div>

      {status === "Completed" && (
        <StatusMessage
          icon={<CheckCircle2 size={16} />}
          title="Event Completed"
          message="This event has finished. You can view its details and previous event information."
          type="success"
        />
      )}

      {status === "Ongoing" && (
        <StatusMessage
          icon={<LoaderCircle size={16} />}
          title="Event Is Ongoing"
          message="This event is currently in progress."
          type="info"
        />
      )}

      {status === "Cancelled" && (
        <StatusMessage
          icon={<XCircle size={16} />}
          title="Event Cancelled"
          message="This event has been cancelled by the organizer."
          type="danger"
        />
      )}

      {status === "Postponed" && (
        <StatusMessage
          icon={<PauseCircle size={16} />}
          title="Event Postponed"
          message="The organizer has postponed this event. Check the event details for the latest schedule."
          type="warning"
        />
      )}

      {status === "Registration Closed" && (
        <StatusMessage
          icon={<AlertCircle size={16} />}
          title="Registration Closed"
          message="Registration for this event is no longer available."
          type="warning"
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({ status }) => {
  const config =
    STATUS_CONFIG[status] || STATUS_CONFIG.Upcoming;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-bold ${config.badge}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
};

/* ----------------------------------
   Timeline
----------------------------------- */

const StatusTimeline = ({
  currentStatus,
  organizerStatus,
}) => {
  const timeline = [
    "Upcoming",
    "Registration Open",
    "Registration Closed",
    "Ongoing",
    "Completed",
  ];

  const specialStatus =
    currentStatus === "Cancelled" ||
    currentStatus === "Postponed";

  if (specialStatus) {
    return (
      <div className="mt-5 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />

          <span className="text-[8px] text-slate-400">
            Organizer-controlled status
          </span>
        </div>
      </div>
    );
  }

  const currentIndex =
    timeline.indexOf(currentStatus);

  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex min-w-[520px] items-start">
        {timeline.map((status, index) => {
          const completed =
            index <= currentIndex;

          const isCurrent =
            status === currentStatus;

          return (
            <div
              key={status}
              className="relative flex flex-1 flex-col items-center"
            >
              {index > 0 && (
                <div
                  className={`absolute right-1/2 top-3 h-0.5 w-full ${
                    completed
                      ? "bg-indigo-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  completed
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>

              <p
                className={`mt-2 text-center text-[7px] font-bold ${
                  isCurrent
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              >
                {status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------------------
   Info item
----------------------------------- */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Status message
----------------------------------- */

const StatusMessage = ({
  icon,
  title,
  message,
  type,
}) => {
  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-400",
    info:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/10 dark:text-indigo-400",
    warning:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400",
    danger:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400",
  };

  return (
    <div
      className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${styles[type]}`}
    >
      <div className="mt-0.5 shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold">
          {title}
        </p>

        <p className="mt-1 text-[8px] leading-4 opacity-80">
          {message}
        </p>
      </div>
    </div>
  );
};

/* ----------------------------------
   Status calculation
----------------------------------- */

const getEventStatus = (
  event = {},
  organizerStatus
) => {
  /*
   * Organizer-controlled statuses always
   * take priority over automatic statuses.
   */
  if (
    organizerStatus === "Cancelled" ||
    organizerStatus === "Postponed"
  ) {
    return organizerStatus;
  }

  const now = new Date();

  const startDate = parseDate(
    event.startDate
  );

  const endDate = parseDate(
    event.endDate
  );

  const registrationDeadline =
    parseDate(
      event.registrationDeadline
    );

  /*
   * If the event is currently running.
   */
  if (
    startDate &&
    endDate &&
    now >= startDate &&
    now <= endDate
  ) {
    return "Ongoing";
  }

  /*
   * If the event has already finished.
   */
  if (
    endDate &&
    now > endDate
  ) {
    return "Completed";
  }

  /*
   * Registration is open when:
   * - event hasn't started
   * - registration is explicitly open
   * - deadline hasn't passed
   */
  if (
    startDate &&
    now < startDate &&
    event.registrationOpen !== false &&
    (!registrationDeadline ||
      now <= registrationDeadline)
  ) {
    return "Registration Open";
  }

  /*
   * Registration deadline has passed,
   * but event hasn't started.
   */
  if (
    registrationDeadline &&
    now > registrationDeadline &&
    startDate &&
    now < startDate
  ) {
    return "Registration Closed";
  }

  /*
   * Future event without registration.
   */
  if (
    startDate &&
    now < startDate
  ) {
    return "Upcoming";
  }

  return "Upcoming";
};

/* ----------------------------------
   Date parsing
----------------------------------- */

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/* ----------------------------------
   Date formatting
----------------------------------- */

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
};

export default EventCompletionStatus;