import {
  CalendarDays,
  TrendingUp,
  Users,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { useMemo } from "react";

const EventRegistrationCapacityForecast = ({
  currentRegistrations = 180,
  capacity = 250,
  recentRegistrations = [12, 15, 10, 18, 14, 16, 17],
}) => {
  const forecast = useMemo(() => {
    const remainingCapacity = Math.max(
      capacity - currentRegistrations,
      0
    );

    const totalRecent = recentRegistrations.reduce(
      (sum, value) => sum + value,
      0
    );

    const averagePerDay =
      recentRegistrations.length > 0
        ? totalRecent / recentRegistrations.length
        : 0;

    const daysUntilFull =
      averagePerDay > 0
        ? Math.ceil(remainingCapacity / averagePerDay)
        : null;

    const estimatedFullDate =
      daysUntilFull !== null
        ? new Date(
            Date.now() +
              daysUntilFull * 24 * 60 * 60 * 1000
          )
        : null;

    const formattedDate = estimatedFullDate
      ? estimatedFullDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Not enough data";

    const occupancyPercentage =
      capacity > 0
        ? Math.min(
            Math.round(
              (currentRegistrations / capacity) * 100
            ),
            100
          )
        : 0;

    const trend =
      recentRegistrations.length >= 2
        ? recentRegistrations[
            recentRegistrations.length - 1
          ] -
          recentRegistrations[
            recentRegistrations.length - 2
          ]
        : 0;

    return {
      remainingCapacity,
      averagePerDay,
      daysUntilFull,
      formattedDate,
      occupancyPercentage,
      trend,
    };
  }, [currentRegistrations, capacity, recentRegistrations]);

  const getDemandStatus = () => {
    if (forecast.occupancyPercentage >= 90) {
      return {
        label: "Almost Full",
        className:
          "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      };
    }

    if (forecast.occupancyPercentage >= 75) {
      return {
        label: "High Demand",
        className:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      };
    }

    return {
      label: "Healthy Capacity",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    };
  };

  const demandStatus = getDemandStatus();

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Gauge size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Capacity Forecast
            </h2>

            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              Estimate when the event may reach full capacity
              based on recent registration activity.
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-2 text-[6px] font-bold ${demandStatus.className}`}
        >
          {demandStatus.label}
        </span>
      </div>

      {/* Forecast Banner */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              Estimated Full Date
            </p>

            <div className="mt-2 flex items-center gap-2">
              <CalendarDays
                size={19}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                {forecast.formattedDate}
              </p>
            </div>
          </div>

          {forecast.daysUntilFull !== null && (
            <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm dark:bg-slate-900">
              <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
                Estimated Time
              </p>

              <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
                {forecast.daysUntilFull}{" "}
                {forecast.daysUntilFull === 1
                  ? "day"
                  : "days"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Current Registrations"
          value={currentRegistrations}
          description={`of ${capacity} seats`}
        />

        <StatCard
          icon={Gauge}
          label="Remaining Capacity"
          value={forecast.remainingCapacity}
          description="seats available"
        />

        <StatCard
          icon={TrendingUp}
          label="Average / Day"
          value={forecast.averagePerDay.toFixed(1)}
          description="recent registrations"
        />
      </div>

      {/* Occupancy */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Capacity Utilization
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {forecast.occupancyPercentage}% occupied
            </p>
          </div>

          <span className="text-[7px] font-bold text-slate-400">
            {currentRegistrations} / {capacity}
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              forecast.occupancyPercentage >= 90
                ? "bg-red-500"
                : forecast.occupancyPercentage >= 75
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{
              width: `${forecast.occupancyPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Registration Trend */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Recent Registration Trend
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Registrations recorded over the recent period.
            </p>
          </div>

          <div
            className={`flex items-center gap-1 text-[7px] font-bold ${
              forecast.trend > 0
                ? "text-green-600 dark:text-green-400"
                : forecast.trend < 0
                ? "text-red-600 dark:text-red-400"
                : "text-slate-400"
            }`}
          >
            <TrendingUp size={12} />
            {forecast.trend > 0
              ? `+${forecast.trend}`
              : forecast.trend}
          </div>
        </div>

        <div className="mt-5 flex h-28 items-end gap-2">
          {recentRegistrations.map((value, index) => {
            const maxValue = Math.max(
              ...recentRegistrations,
              1
            );

            const height = Math.max(
              (value / maxValue) * 100,
              8
            );

            return (
              <div
                key={index}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[5px] font-bold text-slate-400">
                  {value}
                </span>

                <div
                  className="w-full rounded-t-lg bg-indigo-500 transition-all dark:bg-indigo-600"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      {forecast.occupancyPercentage >= 75 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <h4 className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
              High registration demand
            </h4>

            <p className="mt-1 text-[7px] leading-4 text-amber-600 dark:text-amber-500">
              Registration activity indicates that the event
              may reach capacity soon. Consider reviewing your
              capacity or preparing a waitlist.
            </p>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Forecast Method
        </p>

        <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
          The estimated capacity date is calculated using the
          remaining seats and the average number of registrations
          recorded per day in the supplied recent registration
          data.
        </p>
      </div>
    </section>
  );
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
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

          <p className="text-[6px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationCapacityForecast;