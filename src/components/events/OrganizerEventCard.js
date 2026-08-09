import {
  CalendarDays,
  ExternalLink,
  MapPin,
} from "lucide-react";
import {
  formatOrganizerEventDate,
  getOrganizerEventStatus,
} from "../../utils/organizerProfileUtils";

const OrganizerEventCard = ({ event }) => {
  if (!event) return null;

  const eventName =
    event.name ||
    event.title ||
    event.eventName ||
    "Untitled Event";

  const eventType =
    event.eventType ||
    event.type ||
    event.category ||
    "Event";

  const eventDate =
    event.date ||
    event.eventDate ||
    event.startDate;

  const formattedDate =
    formatOrganizerEventDate(eventDate);

  const status =
    getOrganizerEventStatus(event);

  const venue =
    event.venue ||
    event.location?.name ||
    event.location ||
    "";

  const eventUrl =
    event.url ||
    event.eventUrl ||
    event.link ||
    (event.id
      ? `/events/${event.id}`
      : null);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {eventType}
          </span>

          <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-800 dark:text-white">
            {eventName}
          </h3>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* Event information */}
      <div className="mt-5 space-y-3">
        <InfoRow
          icon={CalendarDays}
          value={
            formattedDate ||
            "Date not available"
          }
        />

        {venue && (
          <InfoRow
            icon={MapPin}
            value={venue}
          />
        )}
      </div>

      {/* View event */}
      {eventUrl && (
        <a
          href={eventUrl}
          target={
            eventUrl.startsWith("http")
              ? "_blank"
              : undefined
          }
          rel={
            eventUrl.startsWith("http")
              ? "noopener noreferrer"
              : undefined
          }
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
        >
          View Event
          <ExternalLink
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      )}
    </article>
  );
};

const InfoRow = ({
  icon: Icon,
  value,
}) => (
  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
    <Icon
      size={17}
      className="shrink-0 text-slate-400 dark:text-slate-500"
    />

    <span className="truncate">
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  let className =
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  if (
    normalizedStatus === "upcoming" ||
    normalizedStatus === "scheduled"
  ) {
    className =
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  } else if (
    normalizedStatus === "ongoing" ||
    normalizedStatus === "live"
  ) {
    className =
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  } else if (
    normalizedStatus === "completed" ||
    normalizedStatus === "past"
  ) {
    className =
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  } else if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled"
  ) {
    className =
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default OrganizerEventCard;