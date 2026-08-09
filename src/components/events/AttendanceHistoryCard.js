import {
  Award,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import {
  getAttendanceEventDetails,
} from "../../utils/attendanceHistoryUtils";

const AttendanceHistoryCard = ({ event }) => {
  if (!event) return null;

  const details =
    getAttendanceEventDetails(event);

  const isAttended = details.attended;
  const isUpcoming =
    details.attendanceStatus === "Upcoming";

  const certificateIssued =
    details.certificate.status === "Issued";

  const certificatePending =
    details.certificate.status === "Pending";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Event header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {details.type}
          </span>

          <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-800 dark:text-white">
            {details.name}
          </h3>
        </div>

        <AttendanceStatusBadge
          status={details.attendanceStatus}
        />
      </div>

      {/* Event details */}
      <div className="mt-5 space-y-3">
        <DetailRow
          icon={CalendarDays}
          value={details.date}
        />

        {details.venue && (
          <DetailRow
            icon={MapPin}
            value={details.venue}
          />
        )}

        <DetailRow
          icon={
            isUpcoming
              ? Clock
              : isAttended
                ? CheckCircle
                : XCircle
          }
          value={
            isUpcoming
              ? "Upcoming event"
              : isAttended
                ? "Attendance recorded"
                : details.attendanceStatus
          }
        />
      </div>

      {/* Certificate */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award
              size={18}
              className={
                certificateIssued
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400"
              }
            />

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Certificate
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {details.certificate.status}
              </p>
            </div>
          </div>

          {certificateIssued &&
            details.certificate
              .certificateUrl && (
              <a
                href={
                  details.certificate
                    .certificateUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                View Certificate
              </a>
            )}
        </div>

        {certificatePending && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Your certificate is being prepared.
          </p>
        )}

        {!certificateIssued &&
          !certificatePending && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              No certificate is currently available
              for this event.
            </p>
          )}
      </div>
    </article>
  );
};

const DetailRow = ({
  icon: Icon,
  value,
}) => (
  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
    <Icon
      size={17}
      className="shrink-0 text-slate-400 dark:text-slate-500"
    />

    <span>{value}</span>
  </div>
);

const AttendanceStatusBadge = ({
  status,
}) => {
  const normalizedStatus = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  const isAttended =
    normalizedStatus === "attended" ||
    normalizedStatus === "present" ||
    normalizedStatus === "checked in" ||
    normalizedStatus === "checked-in";

  const isUpcoming =
    normalizedStatus === "upcoming";

  const isCancelled =
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled";

  let className =
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  if (isAttended) {
    className =
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  } else if (isUpcoming) {
    className =
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  } else if (isCancelled) {
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

export default AttendanceHistoryCard;