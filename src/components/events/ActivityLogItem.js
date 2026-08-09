import {
  Activity,
  Bell,
  CalendarPlus,
  CalendarX,
  ChevronRight,
  Edit3,
  Megaphone,
  UserMinus,
} from "lucide-react";

import {
  ACTIVITY_TYPES,
  formatActivityTimestamp,
  getActivityLabel,
  getRelativeActivityTime,
} from "../../utils/organizerActivityLogUtils";

const ActivityLogItem = ({
  activity,
  isLast = false,
  onClick,
}) => {
  if (!activity) {
    return null;
  }

  const {
    type,
    eventName,
    details,
    timestamp,
    metadata = {},
  } = activity;

  const Icon = getActivityIcon(type);

  const label = getActivityLabel(type);

  const formattedTime =
    formatActivityTimestamp(timestamp);

  const relativeTime =
    getRelativeActivityTime(timestamp);

  const participantName =
    metadata.participantName;

  const isClickable =
    typeof onClick === "function";

  return (
    <article
      className={`relative flex gap-4 ${
        isClickable
          ? "cursor-pointer"
          : ""
      }`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          isClickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      role={
        isClickable
          ? "button"
          : undefined
      }
      tabIndex={
        isClickable ? 0 : undefined
      }
    >
      {/* Activity icon */}
      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-100 dark:border-slate-900 dark:bg-indigo-900/40">
        <Icon
          size={15}
          className="text-indigo-600 dark:text-indigo-400"
          aria-hidden="true"
        />
      </div>

      {/* Activity content */}
      <div
        className={`min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 transition dark:border-slate-700 dark:bg-slate-900 ${
          isClickable
            ? "hover:border-indigo-300 hover:shadow-sm dark:hover:border-indigo-700"
            : ""
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {label}
            </h3>

            {eventName && (
              <p className="mt-1 truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {eventName}
              </p>
            )}
          </div>

          {isClickable && (
            <ChevronRight
              size={17}
              className="hidden shrink-0 text-slate-400 sm:block"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Details */}
        {details && (
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {details}
          </p>
        )}

        {/* Participant information */}
        {type ===
          ACTIVITY_TYPES.PARTICIPANT_REMOVED &&
          participantName && (
            <div className="mt-3 inline-flex items-center rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
              Participant:{" "}
              {participantName}
            </div>
          )}

        {/* Timestamp */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          {relativeTime && (
            <span>{relativeTime}</span>
          )}

          {formattedTime && (
            <>
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"
              />

              <time
                dateTime={timestamp}
                title={formattedTime}
              >
                {formattedTime}
              </time>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

/**
 * Return an icon according to the activity type.
 */
const getActivityIcon = (type) => {
  switch (type) {
    case ACTIVITY_TYPES.EVENT_CREATED:
      return CalendarPlus;

    case ACTIVITY_TYPES.EVENT_UPDATED:
      return Edit3;

    case ACTIVITY_TYPES.REGISTRATION_OPENED:
      return Bell;

    case ACTIVITY_TYPES.REGISTRATION_CLOSED:
      return CalendarX;

    case ACTIVITY_TYPES.ANNOUNCEMENT_PUBLISHED:
      return Megaphone;

    case ACTIVITY_TYPES.PARTICIPANT_REMOVED:
      return UserMinus;

    case ACTIVITY_TYPES.EVENT_CANCELLED:
      return CalendarX;

    default:
      return Activity;
  }
};

export default ActivityLogItem;