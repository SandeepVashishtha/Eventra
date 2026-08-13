import {
  AlertTriangle,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  TrendingDown,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_CANCELLATIONS = [
  {
    id: 1,
    date: "2026-08-01",
    reason: "Schedule Conflict",
    category: "Student",
  },
  {
    id: 2,
    date: "2026-08-02",
    reason: "Personal Reason",
    category: "Professional",
  },
  {
    id: 3,
    date: "2026-08-02",
    reason: "Schedule Conflict",
    category: "Student",
  },
  {
    id: 4,
    date: "2026-08-04",
    reason: "Travel Issue",
    category: "Professional",
  },
  {
    id: 5,
    date: "2026-08-05",
    reason: "Personal Reason",
    category: "Student",
  },
  {
    id: 6,
    date: "2026-08-06",
    reason: "Other",
    category: "Student",
  },
];

const EventRegistrationCancellationAnalytics = ({
  cancellations = DEFAULT_CANCELLATIONS,
  totalRegistrations = 100,
}) => {
  const analytics = useMemo(() => {
    const totalCancellations = cancellations.length;

    const cancellationPercentage =
      totalRegistrations > 0
        ? (totalCancellations / totalRegistrations) * 100
        : 0;

    const byDate = cancellations.reduce((result, item) => {
      result[item.date] = (result[item.date] || 0) + 1;
      return result;
    }, {});

    const byReason = cancellations.reduce((result, item) => {
      result[item.reason] = (result[item.reason] || 0) + 1;
      return result;
    }, {});

    const byCategory = cancellations.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + 1;
      return result;
    }, {});

    const reasonEntries = Object.entries(byReason).sort(
      (a, b) => b[1] - a[1]
    );

    const categoryEntries = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1]
    );

    const dateEntries = Object.entries(byDate).sort(
      (a, b) => a[0].localeCompare(b[0])
    );

    return {
      totalCancellations,
      cancellationPercentage,
      reasonEntries,
      categoryEntries,
      dateEntries,
    };
  }, [cancellations, totalRegistrations]);

  const highestReason = analytics.reasonEntries[0];
  const highestCategory = analytics.categoryEntries[0];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <TrendingDown size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Cancellation Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Understand cancellation volume, timing, reasons,
              and participant-category patterns.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Total Registrations
          </p>

          <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
            {totalRegistrations}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingDown}
          label="Total Cancellations"
          value={analytics.totalCancellations}
        />

        <MetricCard
          icon={CircleAlert}
          label="Cancellation Rate"
          value={`${analytics.cancellationPercentage.toFixed(1)}%`}
        />

        <MetricCard
          icon={ClipboardList}
          label="Cancellation Reasons"
          value={analytics.reasonEntries.length}
        />

        <MetricCard
          icon={Users}
          label="Categories Affected"
          value={analytics.categoryEntries.length}
        />
      </div>

      {/* Cancellation Rate */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Overall Cancellation Rate
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Cancellations compared with total registrations.
            </p>
          </div>

          <p className="text-lg font-black text-red-600 dark:text-red-400">
            {analytics.cancellationPercentage.toFixed(1)}%
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                analytics.cancellationPercentage,
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] font-bold text-slate-400">
          <span>
            {analytics.totalCancellations} cancelled
          </span>

          <span>
            {Math.max(
              totalRegistrations -
                analytics.totalCancellations,
              0
            )}{" "}
            retained
          </span>
        </div>
      </div>

      {/* Cancellations by Date */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Cancellations by Date
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Identify when cancellation activity is highest.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {analytics.dateEntries.map(([date, count]) => {
            const percentage =
              analytics.totalCancellations > 0
                ? (count / analytics.totalCancellations) * 100
                : 0;

            return (
              <div key={date}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                    {formatDate(date)}
                  </span>

                  <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                    {count}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasons + Categories */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Reasons */}
        <AnalyticsPanel
          icon={ClipboardList}
          title="Cancellation Reasons"
          description="Most common reasons provided by participants."
        >
          {analytics.reasonEntries.map(
            ([reason, count]) => {
              const percentage =
                analytics.totalCancellations > 0
                  ? (count /
                      analytics.totalCancellations) *
                    100
                  : 0;

              return (
                <div key={reason}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                      {reason}
                    </span>

                    <span className="text-[7px] font-black text-red-600 dark:text-red-400">
                      {count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </AnalyticsPanel>

        {/* Categories */}
        <AnalyticsPanel
          icon={Users}
          title="Cancellation by Category"
          description="Compare cancellation volume across participant groups."
        >
          {analytics.categoryEntries.map(
            ([category, count]) => {
              const percentage =
                analytics.totalCancellations > 0
                  ? (count /
                      analytics.totalCancellations) *
                    100
                  : 0;

              return (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                      {category}
                    </span>

                    <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                      {count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </AnalyticsPanel>
      </div>

      {/* Insights */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {highestReason && (
          <InsightCard
            icon={AlertTriangle}
            title="Most Common Cancellation Reason"
            value={highestReason[0]}
            description={`${highestReason[1]} participant${
              highestReason[1] === 1 ? "" : "s"
            } cancelled for this reason.`}
          />
        )}

        {highestCategory && (
          <InsightCard
            icon={Users}
            title="Most Affected Category"
            value={highestCategory[0]}
            description={`${highestCategory[1]} cancellation${
              highestCategory[1] === 1 ? "" : "s"
            } came from this participant category.`}
          />
        )}
      </div>

      {/* Cancellation Records */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Cancellation Records
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Detailed cancellation activity for the event.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {cancellations.map((cancellation) => (
            <div
              key={cancellation.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <TrendingDown size={13} />
                </div>

                <div>
                  <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
                    {cancellation.reason}
                  </p>

                  <p className="mt-1 text-[6px] text-slate-400">
                    {formatDate(cancellation.date)}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[6px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {cancellation.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const AnalyticsPanel = ({
  icon: Icon,
  title,
  description,
  children,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <Icon
        size={16}
        className="text-indigo-600 dark:text-indigo-400"
      />

      <div>
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-[7px] text-slate-400">
          {description}
        </p>
      </div>
    </div>

    <div className="mt-5 space-y-5">
      {children}
    </div>
  </div>
);

const InsightCard = ({
  icon: Icon,
  title,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
    <div className="flex items-start gap-3">
      <Icon
        size={16}
        className="mt-0.5 text-amber-600 dark:text-amber-400"
      />

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          {title}
        </p>

        <h3 className="mt-1 text-[10px] font-black text-amber-800 dark:text-amber-300">
          {value}
        </h3>

        <p className="mt-1 text-[7px] text-amber-700 dark:text-amber-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const formatDate = (date) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default EventRegistrationCancellationAnalytics;