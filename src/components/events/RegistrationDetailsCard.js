import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";

const RegistrationDetailsCard = ({
  registration,
}) => {
  if (!registration) return null;

  const {
    eventName,
    eventDate,
    eventTime,
    venue,
    meetingLink,
    status = "Registered",
  } = registration;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      {/* Event Name */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Event
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
          {eventName || "Event Name Unavailable"}
        </h2>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {eventDate && (
          <DetailRow
            icon={<CalendarDays size={19} />}
            label="Date"
            value={formatDate(eventDate)}
          />
        )}

        {eventTime && (
          <DetailRow
            icon={<Clock size={19} />}
            label="Time"
            value={eventTime}
          />
        )}

        {venue && !meetingLink && (
          <DetailRow
            icon={<MapPin size={19} />}
            label="Venue"
            value={venue}
          />
        )}

        {meetingLink && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
              <MapPin size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Meeting
              </p>

              <a
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Join Meeting
              </a>
            </div>
          </div>
        )}

        {/* Registration Status */}
        <div className="flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="text-green-600 dark:text-green-400">
            <CheckCircle size={19} />
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registration Status
            </p>

            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
};

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

export default RegistrationDetailsCard;