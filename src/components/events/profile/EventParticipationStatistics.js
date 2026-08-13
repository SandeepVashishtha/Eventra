import {
  Award,
  CalendarCheck2,
  ChevronDown,
  Code2,
  GraduationCap,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import ParticipationStatCard from "./ParticipationStatCard";

import {
  getEventParticipationStatistics,
  getParticipationActivityLabel,
  getParticipationStatCards,
} from "../../utils/eventParticipationStatsUtils";

const EventParticipationStatistics = ({
  user = {},
  statistics: providedStatistics = null,
  showProgress = true,
  showActivitySummary = true,
  collapsible = false,
  defaultExpanded = true,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] =
    useState(defaultExpanded);

  const statistics = useMemo(() => {
    if (providedStatistics) {
      return providedStatistics;
    }

    return getEventParticipationStatistics(
      user
    );
  }, [user, providedStatistics]);

  const statCards = useMemo(() => {
    return getParticipationStatCards({
      ...user,
      ...statistics,
    });
  }, [user, statistics]);

  const activityLabel =
    getParticipationActivityLabel({
      ...user,
      ...statistics,
    });

  const iconMap = {
    eventsRegistered: CalendarCheck2,
    eventsAttended: CalendarCheck2,
    hackathonsJoined: Code2,
    workshopsAttended: GraduationCap,
    certificatesEarned: Award,
    teamsJoined: Users,
  };

  const progressMap = {
    eventsRegistered: null,

    eventsAttended:
      statistics.eventsRegistered > 0
        ? Math.round(
            (statistics.eventsAttended /
              statistics.eventsRegistered) *
              100
          )
        : 0,

    hackathonsJoined: null,

    workshopsAttended: null,

    certificatesEarned: null,

    teamsJoined: null,
  };

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <CalendarCheck2
                size={21}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Participation Statistics
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Overview of your activity and participation
                across Eventra.
              </p>
            </div>
          </div>

          {collapsible && (
            <button
              type="button"
              onClick={() =>
                setIsExpanded(
                  (current) => !current
                )
              }
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? "Collapse participation statistics"
                  : "Expand participation statistics"
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            >
              <ChevronDown
                size={17}
                className={`transition-transform ${
                  isExpanded
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          )}
        </div>

        {showActivitySummary && (
          <ActivitySummary
            statistics={statistics}
            activityLabel={activityLabel}
          />
        )}
      </div>

      {/* Statistics */}
      {(!collapsible || isExpanded) && (
        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => {
              const Icon =
                iconMap[stat.id] ||
                CalendarCheck2;

              const progress =
                progressMap[stat.id];

              return (
                <ParticipationStatCard
                  key={stat.id}
                  {...stat}
                  icon={Icon}
                  progress={
                    showProgress
                      ? progress
                      : null
                  }
                />
              );
            })}
          </div>

          {/* Attendance progress */}
          {showProgress &&
            statistics.eventsRegistered >
              0 && (
              <AttendanceProgress
                registered={
                  statistics.eventsRegistered
                }
                attended={
                  statistics.eventsAttended
                }
                percentage={
                  statistics.attendancePercentage
                }
              />
            )}
        </div>
      )}
    </section>
  );
};

/**
 * Activity summary shown below the header.
 */
const ActivitySummary = ({
  statistics,
  activityLabel,
}) => {
  const hasActivity =
    Object.values(
      statistics || {}
    ).some(
      (value) =>
        typeof value ===
          "number" &&
        value > 0
    );

  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Activity level
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {activityLabel}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Total activities
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {hasActivity
              ? getTotalActivities(
                  statistics
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Attendance progress section.
 */
const AttendanceProgress = ({
  registered,
  attended,
  percentage,
}) => {
  const safePercentage =
    Math.min(
      100,
      Math.max(
        0,
        Number(percentage) || 0
      )
    );

  return (
    <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Event Attendance
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {attended} of {registered} registered events
            attended
          </p>
        </div>

        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {safePercentage}%
        </span>
      </div>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercentage}
        aria-label="Event attendance percentage"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Calculate a simple total activity count.
 */
const getTotalActivities = (
  statistics = {}
) => {
  return [
    statistics.eventsRegistered,
    statistics.eventsAttended,
    statistics.hackathonsJoined,
    statistics.workshopsAttended,
    statistics.certificatesEarned,
    statistics.teamsJoined,
  ].reduce(
    (total, value) =>
      total +
      (Number(value) || 0),
    0
  );
};

export default EventParticipationStatistics;