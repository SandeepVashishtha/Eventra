import {
  BarChart3,
  CalendarDays,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const EventRegistrationAnalyticsByTime = ({
  registrations = [],
  deadline,
  title = "Registration Analytics",
  className = "",
}) => {
  const [range, setRange] = useState("30");

  const normalizedRegistrations = useMemo(
    () =>
      Array.isArray(registrations)
        ? registrations
            .map(normalizeRegistration)
            .filter(Boolean)
        : [],
    [registrations]
  );

  const chartData = useMemo(
    () =>
      buildChartData(
        normalizedRegistrations,
        Number(range)
      ),
    [normalizedRegistrations, range]
  );

  const analytics = useMemo(
    () =>
      calculateAnalytics(
        normalizedRegistrations,
        chartData,
        deadline
      ),
    [
      normalizedRegistrations,
      chartData,
      deadline,
    ]
  );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Understand when participants register and identify
              important registration trends.
            </p>
          </div>
        </div>

        <div className="relative">
          <CalendarDays
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Select analytics time range"
          >
            {RANGE_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          label="Registrations"
          value={analytics.total}
          icon={<Users size={16} />}
          description={`In selected period`}
        />

        <AnalyticsCard
          label="Growth Rate"
          value={`${analytics.growthRate >= 0 ? "+" : ""}${analytics.growthRate}%`}
          icon={<TrendingUp size={16} />}
          description="Compared with previous period"
        />

        <AnalyticsCard
          label="Peak Day"
          value={
            analytics.peakDay
              ? analytics.peakDay.count
              : 0
          }
          icon={<BarChart3 size={16} />}
          description={
            analytics.peakDay
              ? analytics.peakDay.label
              : "No registrations"
          }
        />

        <AnalyticsCard
          label="Before Deadline"
          value={analytics.beforeDeadline}
          icon={<CalendarDays size={16} />}
          description={
            deadline
              ? `Deadline: ${formatDate(deadline)}`
              : "Deadline not provided"
          }
        />
      </div>

      {/* Chart */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Registration Activity
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Registrations grouped by day.
            </p>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {chartData.length} days
          </span>
        </div>

        <RegistrationChart
          data={chartData}
        />
      </div>

      {/* Trend details */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TrendSummary
          analytics={analytics}
        />

        <RegistrationBreakdown
          registrations={
            normalizedRegistrations
          }
          deadline={deadline}
        />
      </div>
    </section>
  );
};

/* ----------------------------------
   Analytics card
----------------------------------- */

const AnalyticsCard = ({
  label,
  value,
  icon,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Registration chart
----------------------------------- */

const RegistrationChart = ({
  data,
}) => {
  const maxCount = Math.max(
    1,
    ...data.map(
      (item) => item.count
    )
  );

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs text-slate-400">
          No registration data available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex h-64 items-end gap-1 overflow-x-auto border-b border-slate-200 pb-0 dark:border-slate-700">
        {data.map(
          (item, index) => {
            const height =
              item.count === 0
                ? 2
                : Math.max(
                    5,
                    (item.count /
                      maxCount) *
                      220
                  );

            return (
              <div
                key={`${item.date}-${index}`}
                className="group flex h-full min-w-[22px] flex-1 flex-col justify-end"
              >
                <div className="relative flex h-full items-end justify-center">
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-900">
                    {item.count}{" "}
                    {item.count === 1
                      ? "registration"
                      : "registrations"}
                    <br />
                    {item.label}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[26px] rounded-t-md bg-indigo-500 transition-all duration-300 hover:bg-indigo-600"
                    style={{
                      height: `${height}px`,
                    }}
                    aria-label={`${item.label}: ${item.count} registrations`}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex gap-1 overflow-hidden">
        {data.map(
          (item, index) => (
            <div
              key={`${item.date}-label-${index}`}
              className="min-w-[22px] flex-1 text-center"
            >
              <span className="text-[8px] text-slate-400">
                {shouldShowLabel(
                  index,
                  data.length
                )
                  ? item.shortLabel
                  : ""}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   Trend summary
----------------------------------- */

const TrendSummary = ({
  analytics,
}) => {
  const growthPositive =
    analytics.growthRate >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <TrendingUp
          size={15}
          className="text-indigo-500"
        />

        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Registration Trend
        </h3>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            growthPositive
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <TrendingUp
            size={18}
          />
        </div>

        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {growthPositive
              ? "Growing"
              : "Declining"}
          </p>

          <p className="text-[10px] text-slate-400">
            {Math.abs(
              analytics.growthRate
            )}
            % change from the previous period
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniMetric
          label="Avg. / Day"
          value={
            analytics.averagePerDay
          }
        />

        <MiniMetric
          label="Peak"
          value={
            analytics.peakDay
              ? analytics.peakDay.count
              : 0
          }
        />
      </div>
    </div>
  );
};

/* ----------------------------------
   Registration breakdown
----------------------------------- */

const RegistrationBreakdown = ({
  registrations,
  deadline,
}) => {
  const breakdown =
    useMemo(() => {
      let before = 0;
      let after = 0;

      if (!deadline) {
        return {
          before: registrations.length,
          after: 0,
          available: false,
        };
      }

      const deadlineTime =
        new Date(
          deadline
        ).getTime();

      registrations.forEach(
        (registration) => {
          if (
            !registration.registeredAt
          ) {
            return;
          }

          const registeredTime =
            new Date(
              registration.registeredAt
            ).getTime();

          if (
            registeredTime <=
            deadlineTime
          ) {
            before += 1;
          } else {
            after += 1;
          }
        }
      );

      return {
        before,
        after,
        available: true,
      };
    }, [
      registrations,
      deadline,
    ]);

  const total =
    breakdown.before +
    breakdown.after;

  const beforePercentage =
    total > 0
      ? Math.round(
          (breakdown.before /
            total) *
            100
        )
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <CalendarDays
          size={15}
          className="text-indigo-500"
        />

        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Deadline Analysis
        </h3>
      </div>

      {!breakdown.available ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-950">
          <p className="text-xs text-slate-400">
            Provide an event deadline to see registration
            timing analysis.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Registered before deadline
              </span>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {beforePercentage}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{
                  width: `${beforePercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniMetric
              label="Before Deadline"
              value={
                breakdown.before
              }
            />

            <MiniMetric
              label="After Deadline"
              value={
                breakdown.after
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

/* ----------------------------------
   Mini metric
----------------------------------- */

const MiniMetric = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Normalize registration
----------------------------------- */

const normalizeRegistration = (
  registration
) => {
  if (!registration) {
    return null;
  }

  const registeredAt =
    registration.registeredAt ||
    registration.registrationDate ||
    registration.createdAt ||
    registration.timestamp ||
    registration.date;

  if (!registeredAt) {
    return null;
  }

  const date =
    new Date(
      registeredAt
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return {
    ...registration,
    registeredAt:
      date.toISOString(),
  };
};

/* ----------------------------------
   Build chart data
----------------------------------- */

const buildChartData = (
  registrations,
  days
) => {
  const safeDays =
    Math.max(1, days);

  const today =
    startOfDay(
      new Date()
    );

  const startDate =
    addDays(
      today,
      -(safeDays - 1)
    );

  const counts = {};

  registrations.forEach(
    (registration) => {
      const date =
        startOfDay(
          new Date(
            registration.registeredAt
          )
        );

      if (
        date < startDate ||
        date > today
      ) {
        return;
      }

      const key =
        getDateKey(date);

      counts[key] =
        (counts[key] || 0) +
        1;
    }
  );

  return Array.from(
    {
      length: safeDays,
    },
    (_, index) => {
      const date =
        addDays(
          startDate,
          index
        );

      const key =
        getDateKey(date);

      return {
        date: key,
        label: formatDate(
          date
        ),
        shortLabel:
          formatShortDate(
            date
          ),
        count:
          counts[key] || 0,
      };
    }
  );
};

/* ----------------------------------
   Analytics calculations
----------------------------------- */

const calculateAnalytics = (
  registrations,
  chartData,
  deadline
) => {
  const total =
    chartData.reduce(
      (sum, item) =>
        sum + item.count,
      0
    );

  const midpoint =
    Math.floor(
      chartData.length / 2
    );

  const currentPeriod =
    chartData
      .slice(midpoint)
      .reduce(
        (sum, item) =>
          sum + item.count,
        0
      );

  const previousPeriod =
    chartData
      .slice(0, midpoint)
      .reduce(
        (sum, item) =>
          sum + item.count,
        0
      );

  let growthRate = 0;

  if (
    previousPeriod === 0
  ) {
    growthRate =
      currentPeriod > 0
        ? 100
        : 0;
  } else {
    growthRate = Math.round(
      ((currentPeriod -
        previousPeriod) /
        previousPeriod) *
        100
    );
  }

  const peakDay =
    chartData.length > 0
      ? chartData.reduce(
          (peak, item) =>
            item.count >
            peak.count
              ? item
              : peak,
          chartData[0]
        )
      : null;

  const averagePerDay =
    chartData.length > 0
      ? Number(
          (
            total /
            chartData.length
          ).toFixed(1)
        )
      : 0;

  let beforeDeadline = 0;

  if (deadline) {
    const deadlineTime =
      new Date(
        deadline
      ).getTime();

    beforeDeadline =
      registrations.filter(
        (registration) =>
          new Date(
            registration.registeredAt
          ).getTime() <=
          deadlineTime
      ).length;
  }

  return {
    total,
    growthRate,
    peakDay,
    averagePerDay,
    beforeDeadline,
  };
};

/* ----------------------------------
   Date helpers
----------------------------------- */

const startOfDay = (
  date
) => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
};

const addDays = (
  date,
  amount
) => {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() +
      amount
  );

  return result;
};

const getDateKey = (
  date
) => {
  const value =
    new Date(date);

  const year =
    value.getFullYear();

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (
  value
) => {
  if (!value) {
    return "Not provided";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
};

const formatShortDate = (
  value
) => {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  ).format(value);
};

const shouldShowLabel = (
  index,
  length
) => {
  if (length <= 7) {
    return true;
  }

  if (length <= 14) {
    return index % 2 === 0;
  }

  if (length <= 30) {
    return (
      index % 5 === 0 ||
      index === length - 1
    );
  }

  return (
    index % 10 === 0 ||
    index === length - 1
  );
};

export default EventRegistrationAnalyticsByTime;