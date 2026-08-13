import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_ACTIVITY = [
  { date: "2026-08-01", registrations: 12 },
  { date: "2026-08-02", registrations: 25 },
  { date: "2026-08-03", registrations: 8 },
  { date: "2026-08-04", registrations: 34 },
  { date: "2026-08-05", registrations: 18 },
  { date: "2026-08-06", registrations: 42 },
  { date: "2026-08-07", registrations: 31 },
  { date: "2026-08-08", registrations: 15 },
  { date: "2026-08-09", registrations: 9 },
  { date: "2026-08-10", registrations: 48 },
  { date: "2026-08-11", registrations: 37 },
  { date: "2026-08-12", registrations: 21 },
  { date: "2026-08-13", registrations: 55 },
  { date: "2026-08-14", registrations: 44 },
  { date: "2026-08-15", registrations: 28 },
  { date: "2026-08-16", registrations: 17 },
  { date: "2026-08-17", registrations: 63 },
  { date: "2026-08-18", registrations: 51 },
  { date: "2026-08-19", registrations: 35 },
  { date: "2026-08-20", registrations: 72 },
  { date: "2026-08-21", registrations: 58 },
  { date: "2026-08-22", registrations: 29 },
  { date: "2026-08-23", registrations: 19 },
  { date: "2026-08-24", registrations: 46 },
  { date: "2026-08-25", registrations: 67 },
  { date: "2026-08-26", registrations: 53 },
  { date: "2026-08-27", registrations: 38 },
  { date: "2026-08-28", registrations: 81 },
  { date: "2026-08-29", registrations: 64 },
  { date: "2026-08-30", registrations: 41 },
  { date: "2026-08-31", registrations: 23 },
];

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const getIntensity = (value, max) => {
  if (!max || value === 0) return 0;

  const ratio = value / max;

  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;

  return 1;
};

const intensityClasses = {
  0: "bg-slate-100 dark:bg-slate-800",
  1: "bg-indigo-100 dark:bg-indigo-950",
  2: "bg-indigo-200 dark:bg-indigo-900",
  3: "bg-indigo-300 dark:bg-indigo-800",
  4: "bg-indigo-400 dark:bg-indigo-700",
  5: "bg-indigo-600 dark:bg-indigo-500",
};

const EventRegistrationActivityHeatmap = ({
  activityData = DEFAULT_ACTIVITY,
}) => {
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const maxRegistrations = useMemo(
    () =>
      Math.max(
        ...activityData.map((item) => item.registrations),
        0
      ),
    [activityData]
  );

  const totalRegistrations = useMemo(
    () =>
      activityData.reduce(
        (total, item) => total + item.registrations,
        0
      ),
    [activityData]
  );

  const averageRegistrations = activityData.length
    ? Math.round(totalRegistrations / activityData.length)
    : 0;

  const peakDay = useMemo(() => {
    if (!activityData.length) return null;

    return activityData.reduce((highest, current) =>
      current.registrations > highest.registrations
        ? current
        : highest
    );
  }, [activityData]);

  const lowestDay = useMemo(() => {
    if (!activityData.length) return null;

    return activityData.reduce((lowest, current) =>
      current.registrations < lowest.registrations
        ? current
        : lowest
    );
  }, [activityData]);

  const weeklyData = useMemo(() => {
    const start = weekOffset * 7;
    return activityData.slice(start, start + 7);
  }, [activityData, weekOffset]);

  const visibleData =
    view === "week" ? weeklyData : activityData;

  const previousWeek = () => {
    setWeekOffset((current) => Math.max(current - 1, 0));
    setSelectedDate(null);
  };

  const nextWeek = () => {
    const maxOffset = Math.max(
      Math.ceil(activityData.length / 7) - 1,
      0
    );

    setWeekOffset((current) =>
      Math.min(current + 1, maxOffset)
    );
    setSelectedDate(null);
  };

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
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Activity Heatmap
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Understand when participant registration activity
              is highest and identify periods with low activity.
            </p>
          </div>
        </div>

        <div className="flex rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              setView("month");
              setSelectedDate(null);
            }}
            className={`rounded-lg px-4 py-2 text-[6px] font-bold ${
              view === "month"
                ? "bg-indigo-600 text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Month
          </button>

          <button
            type="button"
            onClick={() => {
              setView("week");
              setSelectedDate(null);
            }}
            className={`rounded-lg px-4 py-2 text-[6px] font-bold ${
              view === "week"
                ? "bg-indigo-600 text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={TrendingUp}
          label="Total Registrations"
          value={totalRegistrations}
        />

        <SummaryCard
          icon={BarChart3}
          label="Daily Average"
          value={averageRegistrations}
        />

        <SummaryCard
          icon={CalendarDays}
          label="Peak Day"
          value={peakDay ? formatDate(peakDay.date) : "—"}
          secondary={
            peakDay
              ? `${peakDay.registrations} registrations`
              : ""
          }
        />

        <SummaryCard
          icon={Clock3}
          label="Lowest Activity"
          value={
            lowestDay ? formatDate(lowestDay.date) : "—"
          }
          secondary={
            lowestDay
              ? `${lowestDay.registrations} registrations`
              : ""
          }
        />
      </div>

      {/* Heatmap */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration Activity
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Darker cells represent higher registration
              activity.
            </p>
          </div>

          {view === "week" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previousWeek}
                disabled={weekOffset === 0}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30 dark:border-slate-700"
              >
                <ChevronLeft size={13} />
              </button>

              <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
                Week {weekOffset + 1}
              </span>

              <button
                type="button"
                onClick={nextWeek}
                disabled={
                  weekOffset >=
                  Math.ceil(activityData.length / 7) - 1
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30 dark:border-slate-700"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Month Heatmap */}
        {view === "month" && (
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[650px]">
              <div className="grid grid-cols-7 gap-2">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div
                    key={day}
                    className="pb-1 text-center text-[6px] font-bold uppercase text-slate-400"
                  >
                    {day}
                  </div>
                ))}

                {activityData.map((item) => {
                  const intensity = getIntensity(
                    item.registrations,
                    maxRegistrations
                  );

                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() =>
                        setSelectedDate(item)
                      }
                      title={`${formatDate(
                        item.date
                      )}: ${item.registrations} registrations`}
                      className={`group relative min-h-[55px] rounded-xl border border-transparent p-2 text-left transition hover:scale-[1.03] hover:border-indigo-400 ${intensityClasses[intensity]}`}
                    >
                      <span className="block text-[6px] font-bold text-slate-600 dark:text-slate-300">
                        {new Date(
                          `${item.date}T00:00:00`
                        ).getDate()}
                      </span>

                      <span className="mt-2 block text-[8px] font-black text-slate-700 dark:text-white">
                        {item.registrations}
                      </span>

                      <span className="absolute bottom-2 left-2 text-[4px] uppercase text-slate-500 dark:text-slate-300">
                        reg
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-7">
            {visibleData.map((item) => {
              const intensity = getIntensity(
                item.registrations,
                maxRegistrations
              );

              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => setSelectedDate(item)}
                  className={`rounded-2xl border border-transparent p-4 text-center transition hover:scale-[1.02] hover:border-indigo-400 ${intensityClasses[intensity]}`}
                >
                  <p className="text-[6px] font-bold uppercase text-slate-500 dark:text-slate-300">
                    {new Date(
                      `${item.date}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </p>

                  <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
                    {formatDate(item.date)}
                  </p>

                  <p className="mt-4 text-xl font-black text-slate-800 dark:text-white">
                    {item.registrations}
                  </p>

                  <p className="mt-1 text-[5px] uppercase text-slate-500 dark:text-slate-300">
                    registrations
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Activity Level
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[5px] text-slate-400">
              Low
            </span>

            {[0, 1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={`h-3 w-3 rounded ${intensityClasses[level]}`}
              />
            ))}

            <span className="text-[5px] text-slate-400">
              High
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day */}
      {selectedDate && (
        <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                Selected Period
              </p>

              <h3 className="mt-1 text-lg font-bold text-indigo-800 dark:text-indigo-300">
                {formatDate(selectedDate.date)}
              </h3>
            </div>

            <div className="rounded-xl bg-white px-4 py-3 text-center dark:bg-slate-900">
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {selectedDate.registrations}
              </p>

              <p className="text-[5px] font-bold uppercase text-slate-400">
                Registrations
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white dark:bg-slate-900">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${Math.min(
                  (selectedDate.registrations /
                    maxRegistrations) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-3 text-[7px] text-indigo-700 dark:text-indigo-400">
            This period represents{" "}
            {Math.round(
              (selectedDate.registrations /
                Math.max(totalRegistrations, 1)) *
                100
            )}
            % of all registrations in the displayed period.
          </p>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InsightCard
          title="Peak Registration Activity"
          description={
            peakDay
              ? `${formatDate(
                  peakDay.date
                )} recorded the highest activity with ${
                  peakDay.registrations
                } registrations.`
              : "No registration data available."
          }
          type="positive"
        />

        <InsightCard
          title="Low Activity Period"
          description={
            lowestDay
              ? `${formatDate(
                  lowestDay.date
                )} recorded the lowest activity with ${
                  lowestDay.registrations
                } registrations. Consider additional promotion during similar periods.`
              : "No registration data available."
          }
          type="warning"
        />
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  secondary,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>

        {secondary && (
          <p className="mt-1 text-[5px] text-slate-400">
            {secondary}
          </p>
        )}
      </div>
    </div>
  </div>
);

const InsightCard = ({
  title,
  description,
  type,
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      type === "positive"
        ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
        : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
    }`}
  >
    <div className="flex items-start gap-3">
      <TrendingUp
        size={15}
        className={
          type === "positive"
            ? "text-green-600 dark:text-green-400"
            : "text-amber-600 dark:text-amber-400"
        }
      />

      <div>
        <h4 className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          {title}
        </h4>

        <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default EventRegistrationActivityHeatmap;