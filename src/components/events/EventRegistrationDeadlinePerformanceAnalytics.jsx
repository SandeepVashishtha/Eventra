import {
  BarChart3,
  CalendarClock,
  Clock3,
  TrendingUp,
  Users,
} from "lucide-react";

const DEFAULT_DATA = {
  periods: [
    {
      label: "Early Registrations",
      description: "More than two weeks before deadline",
      registrations: 180,
    },
    {
      label: "Mid-Period Registrations",
      description: "Two weeks to one week before deadline",
      registrations: 140,
    },
    {
      label: "Last-Week Registrations",
      description: "Seven days before deadline",
      registrations: 120,
    },
    {
      label: "Last-Day Registrations",
      description: "Final 24 hours before deadline",
      registrations: 60,
    },
  ],
};

const EventRegistrationDeadlinePerformanceAnalytics = ({
  data = DEFAULT_DATA,
}) => {
  const periods = data.periods || [];

  const totalRegistrations = periods.reduce(
    (sum, period) => sum + (period.registrations || 0),
    0
  );

  const peakPeriod =
    [...periods].sort(
      (a, b) => b.registrations - a.registrations
    )[0] || {
      label: "No data",
      registrations: 0,
    };

  const lastDayPeriod =
    periods.find((period) =>
      period.label.toLowerCase().includes("last-day")
    ) || { registrations: 0 };

  const lastDayPercentage =
    totalRegistrations > 0
      ? (lastDayPeriod.registrations / totalRegistrations) * 100
      : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarClock size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Deadline Performance
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Understand when participants register and identify
              last-minute registration behavior.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white px-5 py-3 dark:border-indigo-900/30 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Total Registrations
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {totalRegistrations.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {periods.map((period) => {
          const percentage =
            totalRegistrations > 0
              ? (period.registrations / totalRegistrations) * 100
              : 0;

          return (
            <SummaryCard
              key={period.label}
              icon={Users}
              label={period.label}
              value={period.registrations.toLocaleString()}
              percentage={percentage}
            />
          );
        })}
      </div>

      {/* Registration Distribution */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BarChart3
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Registration Distribution
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Percentage of registrations completed during each
                deadline period.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-900/20">
            <p className="text-[5px] font-bold uppercase text-indigo-500">
              Peak Period
            </p>

            <p className="mt-1 text-[8px] font-black text-indigo-600 dark:text-indigo-400">
              {peakPeriod.label}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {periods.map((period) => {
            const percentage =
              totalRegistrations > 0
                ? (period.registrations / totalRegistrations) * 100
                : 0;

            return (
              <div key={period.label}>
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                      {period.label}
                    </p>

                    <p className="text-[6px] text-slate-400">
                      {period.description}
                    </p>
                  </div>

                  <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">
                    {period.registrations} · {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Timeline */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Clock3
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration Timeline
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Visualize registration activity as the deadline
              approaches.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-slate-100 dark:bg-slate-800" />

            <div className="relative grid grid-cols-4 gap-3">
              {periods.map((period, index) => {
                const percentage =
                  totalRegistrations > 0
                    ? (period.registrations / totalRegistrations) *
                      100
                    : 0;

                return (
                  <div
                    key={period.label}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[6px] font-black text-white">
                      {index + 1}
                    </div>

                    <p className="mt-3 text-[7px] font-bold text-slate-700 dark:text-slate-200">
                      {period.label}
                    </p>

                    <p className="mt-1 text-[6px] font-black text-indigo-600 dark:text-indigo-400">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Last-Minute Insight */}
      <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <TrendingUp size={13} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-amber-800 dark:text-amber-300">
              Registration Behavior Insight
            </h3>

            <p className="mt-1 text-[7px] leading-relaxed text-amber-700 dark:text-amber-400">
              {lastDayPercentage >= 20
                ? `${lastDayPercentage.toFixed(
                    1
                  )}% of registrations occurred during the last day. Consider increasing deadline reminders and earlier promotional activity.`
                : lastDayPercentage >= 10
                  ? `${lastDayPercentage.toFixed(
                      1
                    )}% of registrations occurred during the last day, indicating some last-minute demand.`
                  : "Most registrations were completed before the final day, indicating relatively stable registration activity."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  percentage,
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

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-[6px] font-bold text-indigo-500">
          {percentage.toFixed(1)}%
        </p>
      </div>
    </div>
  </div>
);

export default EventRegistrationDeadlinePerformanceAnalytics;