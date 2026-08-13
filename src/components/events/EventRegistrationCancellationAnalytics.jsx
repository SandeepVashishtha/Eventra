import {
  BarChart3,
  CalendarDays,
  CircleAlert,
  TrendingDown,
  Users,
  XCircle,
} from "lucide-react";

const DEFAULT_DATA = {
  totalRegistrations: 500,
  totalCancellations: 42,

  cancellationsOverTime: [
    { label: "Aug 1", count: 3 },
    { label: "Aug 2", count: 5 },
    { label: "Aug 3", count: 7 },
    { label: "Aug 4", count: 4 },
    { label: "Aug 5", count: 9 },
    { label: "Aug 6", count: 6 },
    { label: "Aug 7", count: 8 },
  ],

  cancellationReasons: [
    { reason: "Schedule Conflict", count: 18 },
    { reason: "Personal Reason", count: 10 },
    { reason: "Travel Issue", count: 7 },
    { reason: "Health Issue", count: 4 },
    { reason: "Other", count: 3 },
  ],

  participantCategories: [
    { category: "Students", registrations: 250, cancellations: 15 },
    { category: "Professionals", registrations: 150, cancellations: 18 },
    { category: "Researchers", registrations: 70, cancellations: 6 },
    { category: "Others", registrations: 30, cancellations: 3 },
  ],

  deadlineAnalysis: {
    beforeDeadline: {
      registrations: 320,
      cancellations: 18,
    },
    afterDeadline: {
      registrations: 180,
      cancellations: 24,
    },
  },
};

const EventRegistrationCancellationAnalytics = ({
  data = DEFAULT_DATA,
}) => {
  const totalRegistrations = data.totalRegistrations || 0;
  const totalCancellations = data.totalCancellations || 0;

  const cancellationPercentage =
    totalRegistrations > 0
      ? (totalCancellations / totalRegistrations) * 100
      : 0;

  const mostCommonReason =
    [...data.cancellationReasons].sort(
      (a, b) => b.count - a.count
    )[0]?.reason || "No data";

  const beforeDeadlineRate =
    data.deadlineAnalysis.beforeDeadline.registrations > 0
      ? (data.deadlineAnalysis.beforeDeadline.cancellations /
          data.deadlineAnalysis.beforeDeadline.registrations) *
        100
      : 0;

  const afterDeadlineRate =
    data.deadlineAnalysis.afterDeadline.registrations > 0
      ? (data.deadlineAnalysis.afterDeadline.cancellations /
          data.deadlineAnalysis.afterDeadline.registrations) *
        100
      : 0;

  const peakCancellationDay =
    [...data.cancellationsOverTime].sort(
      (a, b) => b.count - a.count
    )[0] || { label: "-", count: 0 };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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
              Understand cancellation patterns, reasons, timing,
              and participant categories.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white px-5 py-3 dark:border-red-900/30 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Cancellation Rate
          </p>

          <p className="mt-1 text-lg font-black text-red-600 dark:text-red-400">
            {cancellationPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total Registrations"
          value={totalRegistrations.toLocaleString()}
        />

        <SummaryCard
          icon={XCircle}
          label="Total Cancellations"
          value={totalCancellations.toLocaleString()}
        />

        <SummaryCard
          icon={TrendingDown}
          label="Cancellation Rate"
          value={`${cancellationPercentage.toFixed(1)}%`}
        />

        <SummaryCard
          icon={CircleAlert}
          label="Common Reason"
          value={mostCommonReason}
          compact
        />
      </div>

      {/* Cancellation Rate Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Overall Cancellation Rate
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {totalCancellations} cancellations from{" "}
              {totalRegistrations} total registrations.
            </p>
          </div>

          <span className="text-[10px] font-black text-red-600 dark:text-red-400">
            {cancellationPercentage.toFixed(1)}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-500"
            style={{
              width: `${Math.min(cancellationPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Cancellations Over Time */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={16}
              className="text-red-600 dark:text-red-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Cancellations Over Time
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Track when registration cancellations are occurring.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-900/20">
            <p className="text-[5px] font-bold uppercase text-red-500">
              Peak Day
            </p>

            <p className="mt-1 text-[8px] font-black text-red-600 dark:text-red-400">
              {peakCancellationDay.label} ·{" "}
              {peakCancellationDay.count}
            </p>
          </div>
        </div>

        <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto">
          {data.cancellationsOverTime.map((item) => {
            const maxCount = Math.max(
              ...data.cancellationsOverTime.map(
                (entry) => entry.count
              ),
              1
            );

            const height = (item.count / maxCount) * 100;

            return (
              <div
                key={item.label}
                className="flex min-w-[45px] flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
                  {item.count}
                </span>

                <div className="flex h-36 w-full items-end rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div
                    className="w-full rounded-lg bg-red-500 transition-all duration-500"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="text-[6px] font-bold text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancellation Reasons */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CircleAlert
            size={16}
            className="text-red-600 dark:text-red-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Cancellation Reasons
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Identify the most common reasons participants cancel.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.cancellationReasons.map((item) => {
            const percentage =
              totalCancellations > 0
                ? (item.count / totalCancellations) * 100
                : 0;

            return (
              <div key={item.reason}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                    {item.reason}
                  </span>

                  <span className="text-[7px] font-black text-red-600 dark:text-red-400">
                    {item.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
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

      {/* Participant Category */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Users
              size={16}
              className="text-red-600 dark:text-red-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Cancellation Rate by Participant Category
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Compare cancellation behavior across participant
                groups.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.participantCategories.map((item) => {
            const rate =
              item.registrations > 0
                ? (item.cancellations / item.registrations) * 100
                : 0;

            return (
              <div key={item.category} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                      {item.category}
                    </h4>

                    <p className="mt-1 text-[6px] text-slate-400">
                      {item.cancellations} cancellations /{" "}
                      {item.registrations} registrations
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[5px] font-bold ${
                      rate >= 10
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : rate >= 5
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    {rate.toFixed(1)}% Cancellation
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(rate * 5, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadline Analysis */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <BarChart3
            size={16}
            className="text-red-600 dark:text-red-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Cancellation Before vs After Deadline
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Compare cancellation activity around important
              registration deadlines.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DeadlineCard
            title="Before Deadline"
            registrations={
              data.deadlineAnalysis.beforeDeadline.registrations
            }
            cancellations={
              data.deadlineAnalysis.beforeDeadline.cancellations
            }
            rate={beforeDeadlineRate}
          />

          <DeadlineCard
            title="After Deadline"
            registrations={
              data.deadlineAnalysis.afterDeadline.registrations
            }
            cancellations={
              data.deadlineAnalysis.afterDeadline.cancellations
            }
            rate={afterDeadlineRate}
          />
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  compact = false,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 font-black text-slate-800 dark:text-white ${
            compact
              ? "truncate text-[8px]"
              : "text-lg"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

const DeadlineCard = ({
  title,
  registrations,
  cancellations,
  rate,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
    <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
      {title}
    </h4>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <p className="text-[6px] font-bold uppercase text-slate-400">
          Registrations
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {registrations}
        </p>
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase text-slate-400">
          Cancellations
        </p>

        <p className="mt-1 text-lg font-black text-red-600 dark:text-red-400">
          {cancellations}
        </p>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <span className="text-[7px] font-bold text-slate-400">
        Cancellation Rate
      </span>

      <span className="text-[8px] font-black text-red-600 dark:text-red-400">
        {rate.toFixed(1)}%
      </span>
    </div>

    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white dark:bg-slate-700">
      <div
        className="h-full rounded-full bg-red-500"
        style={{
          width: `${Math.min(rate * 5, 100)}%`,
        }}
      />
    </div>
  </div>
);

export default EventRegistrationCancellationAnalytics;