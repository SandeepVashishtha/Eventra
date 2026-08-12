import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_CHECK_INS = [
  { id: 1, participant: "Aarav Shah", time: "08:15", late: false },
  { id: 2, participant: "Diya Patel", time: "08:32", late: false },
  { id: 3, participant: "Rahul Mehta", time: "08:47", late: false },
  { id: 4, participant: "Jainiksha Patel", time: "09:05", late: true },
  { id: 5, participant: "Krisha Joshi", time: "09:18", late: true },
  { id: 6, participant: "Dev Shah", time: "09:32", late: true },
  { id: 7, participant: "Riya Desai", time: "10:05", late: true },
];

const DEFAULT_HOURLY_DATA = [
  { hour: "08:00", count: 3 },
  { hour: "09:00", count: 3 },
  { hour: "10:00", count: 1 },
  { hour: "11:00", count: 0 },
  { hour: "12:00", count: 0 },
  { hour: "13:00", count: 0 },
];

const ParticipantCheckInAnalytics = ({
  checkIns = DEFAULT_CHECK_INS,
  totalRegistrations = 10,
  lateArrivalThreshold = "09:00",
  hourlyData = DEFAULT_HOURLY_DATA,
}) => {
  const analytics = useMemo(() => {
    const totalCheckedIn = checkIns.length;

    const lateArrivals = checkIns.filter(
      (item) =>
        item.late ||
        item.time > lateArrivalThreshold
    ).length;

    const completionPercentage =
      totalRegistrations > 0
        ? Math.round(
            (totalCheckedIn / totalRegistrations) *
              100
          )
        : 0;

    const peakHour =
      hourlyData.length > 0
        ? hourlyData.reduce(
            (peak, current) =>
              current.count > peak.count
                ? current
                : peak,
            hourlyData[0]
          )
        : null;

    return {
      totalCheckedIn,
      lateArrivals,
      completionPercentage,
      peakHour,
    };
  }, [
    checkIns,
    totalRegistrations,
    lateArrivalThreshold,
    hourlyData,
  ]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Check-In Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Monitor participant arrival patterns and check-in
              completion throughout the event.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <Activity
            size={13}
            className="text-green-500"
          />

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            Live Check-In Data
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          icon={Users}
          label="Total Checked In"
          value={analytics.totalCheckedIn}
          subtitle={`of ${totalRegistrations} registered`}
        />

        <AnalyticsCard
          icon={Clock3}
          label="Peak Arrival"
          value={
            analytics.peakHour
              ? formatHour(analytics.peakHour.hour)
              : "--"
          }
          subtitle={
            analytics.peakHour
              ? `${analytics.peakHour.count} arrivals`
              : "No data"
          }
        />

        <AnalyticsCard
          icon={Activity}
          label="Late Arrivals"
          value={analytics.lateArrivals}
          subtitle={`after ${formatHour(
            lateArrivalThreshold
          )}`}
        />

        <AnalyticsCard
          icon={CheckCircle2}
          label="Completion"
          value={`${analytics.completionPercentage}%`}
          subtitle="registration check-in rate"
        />
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Hourly Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Check-Ins by Hour
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Participant arrival distribution throughout the event.
              </p>
            </div>

            <BarChart3
              size={16}
              className="text-slate-400"
            />
          </div>

          <HourlyChart data={hourlyData} />
        </div>

        {/* Peak Arrival */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Arrival Overview
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Quick interpretation of today's check-in activity.
          </p>

          <div className="mt-5 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-900/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
              <Clock3 size={19} />
            </div>

            <p className="mt-4 text-[7px] font-bold uppercase tracking-wide text-indigo-500">
              Peak Arrival Time
            </p>

            <p className="mt-1 text-2xl font-black text-indigo-900 dark:text-indigo-300">
              {analytics.peakHour
                ? formatHour(
                    analytics.peakHour.hour
                  )
                : "--"}
            </p>

            <p className="mt-2 text-[7px] text-indigo-700/70 dark:text-indigo-400/70">
              {analytics.peakHour
                ? `${analytics.peakHour.count} participants checked in during this hour.`
                : "No check-in data available."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat
              label="Early Arrivals"
              value={checkIns.filter(
                (item) =>
                  item.time <=
                  lateArrivalThreshold
              ).length}
            />

            <MiniStat
              label="Late Arrivals"
              value={analytics.lateArrivals}
            />
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Check-In Completion
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Percentage of registered participants who have checked in.
            </p>
          </div>

          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {analytics.completionPercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                analytics.completionPercentage,
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] font-semibold text-slate-400">
          <span>
            {analytics.totalCheckedIn} checked in
          </span>

          <span>
            {Math.max(
              totalRegistrations -
                analytics.totalCheckedIn,
              0
            )}{" "}
            remaining
          </span>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Recent Check-Ins
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Latest participant arrivals.
            </p>
          </div>

          <span className="rounded-full bg-green-50 px-3 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {checkIns.length} Checked In
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="pb-3 text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Participant
                </th>

                <th className="pb-3 text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Check-In Time
                </th>

                <th className="pb-3 text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Arrival Status
                </th>
              </tr>
            </thead>

            <tbody>
              {checkIns.map((item) => {
                const isLate =
                  item.late ||
                  item.time > lateArrivalThreshold;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          {getInitials(
                            item.participant
                          )}
                        </div>

                        <span className="text-[7px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.participant}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                      {formatHour(item.time)}
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[6px] font-bold ${
                          isLate
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {isLate
                          ? "Late Arrival"
                          : "On Time"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staffing Insight */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <Activity
          size={16}
          className="mt-0.5 shrink-0 text-blue-500"
        />

        <div>
          <p className="text-[8px] font-bold text-blue-700 dark:text-blue-400">
            Staffing Insight
          </p>

          <p className="mt-1 text-[7px] leading-4 text-blue-700/70 dark:text-blue-400/70">
            {analytics.peakHour
              ? `The highest arrival volume occurred around ${formatHour(
                  analytics.peakHour.hour
                )}. Consider assigning additional check-in staff during this period for future events.`
              : "More check-in data is required to generate staffing insights."}
          </p>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Analytics Card
--------------------------------- */

const AnalyticsCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[6px] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
};

/* --------------------------------
   Hourly Chart
--------------------------------- */

const HourlyChart = ({ data }) => {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <div className="mt-6">
      <div className="flex h-52 items-end gap-2 border-b border-slate-200 px-2 dark:border-slate-700">
        {data.map((item) => {
          const height =
            item.count === 0
              ? 2
              : Math.max(
                  (item.count / maxCount) * 100,
                  8
                );

          return (
            <div
              key={item.hour}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div className="mb-2 text-center text-[6px] font-bold text-slate-500 dark:text-slate-400">
                {item.count}
              </div>

              <div
                className="w-full rounded-t-lg bg-indigo-500 transition-all duration-500"
                style={{
                  height: `${height}%`,
                  minHeight: "2px",
                }}
                title={`${formatHour(
                  item.hour
                )}: ${item.count} check-ins`}
              />

              <div className="mt-2 truncate text-center text-[5px] font-semibold text-slate-400">
                {formatHour(item.hour)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* --------------------------------
   Mini Stat
--------------------------------- */

const MiniStat = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const formatHour = (time) => {
  if (!time) return "--";

  const [hours, minutes = "00"] =
    time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default ParticipantCheckInAnalytics;