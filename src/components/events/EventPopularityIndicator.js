import {
  Eye,
  Flame,
  Heart,
  Users,
  UserRound,
} from "lucide-react";

import {
  formatPopularityNumber,
  getEventPopularityMetrics,
  getRemainingSeatsLabel,
} from "../../utils/eventPopularityUtils";

const EventPopularityIndicator = ({
  event = {},
  showViews = true,
  showInterested = true,
  showRemainingSeats = true,
  showScore = false,
  compact = false,
}) => {
  const metrics =
    getEventPopularityMetrics(event);

  const {
    registrations,
    interested,
    views,
    score,
    isTrending,
    isAlmostFull,
    isFull,
  } = metrics;

  const remainingSeats =
    getRemainingSeatsLabel(event);

  const hasMetrics =
    registrations > 0 ||
    interested > 0 ||
    views > 0 ||
    remainingSeats !== null;

  if (!hasMetrics) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {isTrending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <Flame
              size={13}
              fill="currentColor"
            />
            Trending
          </span>
        )}

        {registrations > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Users size={13} />
            {formatPopularityNumber(
              registrations
            )}{" "}
            registered
          </span>
        )}

        {remainingSeats && (
          <span
            className={`text-xs font-medium ${
              isFull
                ? "text-red-600 dark:text-red-400"
                : isAlmostFull
                ? "text-orange-600 dark:text-orange-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {remainingSeats}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Trending header */}
      {isTrending && (
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <Flame
              size={15}
              fill="currentColor"
            />
            Trending
          </span>

          {showScore && (
            <span className="text-xs font-medium text-slate-400">
              Popularity {score}/100
            </span>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Registrations */}
        <PopularityMetric
          icon={Users}
          label="Registered"
          value={formatPopularityNumber(
            registrations
          )}
        />

        {/* Interested users */}
        {showInterested && (
          <PopularityMetric
            icon={Heart}
            label="Interested"
            value={formatPopularityNumber(
              interested
            )}
          />
        )}

        {/* Views */}
        {showViews && (
          <PopularityMetric
            icon={Eye}
            label="Views"
            value={formatPopularityNumber(
              views
            )}
          />
        )}

        {/* Remaining seats */}
        {showRemainingSeats &&
          remainingSeats && (
            <PopularityMetric
              icon={UserRound}
              label="Availability"
              value={remainingSeats}
              valueClassName={
                isFull
                  ? "text-red-600 dark:text-red-400"
                  : isAlmostFull
                  ? "text-orange-600 dark:text-orange-400"
                  : ""
              }
            />
          )}
      </div>

      {/* Registration progress */}
      {metrics.capacity > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Registration progress
            </span>

            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {metrics.registrationRate}%
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={
              metrics.registrationRate
            }
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Event registration progress"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-red-500"
                  : isAlmostFull
                  ? "bg-orange-500"
                  : "bg-indigo-600"
              }`}
              style={{
                width: `${metrics.registrationRate}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Popularity score */}
      {showScore && !isTrending && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Popularity score
          </span>

          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {score}/100
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Individual popularity metric.
 */
const PopularityMetric = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
        <Icon size={15} />

        <span className="truncate text-xs font-medium">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 truncate text-sm font-bold text-slate-800 dark:text-white ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

export default EventPopularityIndicator;