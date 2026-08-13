import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  Gauge,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_DATA = {
  currentRegistrations: 86,
  previousRegistrations: 52,
  capacity: 100,
  recentRegistrations: [8, 10, 12, 18, 15, 21, 2],
  previousPeriodRegistrations: [7, 8, 9, 10, 8, 6, 4],
};

const EventOrganizerRegistrationTrendAlerts = ({
  data = DEFAULT_DATA,
}) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [dismissed, setDismissed] = useState([]);

  const alerts = useMemo(() => {
    const {
      currentRegistrations,
      previousRegistrations,
      capacity,
      recentRegistrations,
    } = data;

    const result = [];

    const averageRecent =
      recentRegistrations.length > 0
        ? recentRegistrations.reduce(
            (sum, value) => sum + value,
            0
          ) / recentRegistrations.length
        : 0;

    const latest =
      recentRegistrations[
        recentRegistrations.length - 1
      ] || 0;

    const previous =
      recentRegistrations[
        recentRegistrations.length - 2
      ] || 0;

    const registrationChange =
      previousRegistrations > 0
        ? ((currentRegistrations -
            previousRegistrations) /
            previousRegistrations) *
          100
        : 0;

    const capacityUsed =
      capacity > 0
        ? (currentRegistrations / capacity) * 100
        : 0;

    // Registration spike
    if (
      previous > 0 &&
      latest >= previous * 1.5
    ) {
      result.push({
        id: "spike",
        type: "spike",
        severity: "high",
        title: "Registration spike detected",
        message: `Registrations increased sharply from ${previous} to ${latest}.`,
        value: `+${Math.round(
          ((latest - previous) / previous) * 100
        )}%`,
      });
    }

    // Registration drop
    if (
      previous > 0 &&
      latest <= previous * 0.5
    ) {
      result.push({
        id: "drop",
        type: "drop",
        severity: "high",
        title: "Registration drop detected",
        message: `Recent registrations dropped from ${previous} to ${latest}.`,
        value: `${Math.round(
          ((latest - previous) / previous) * 100
        )}%`,
      });
    }

    // Low activity
    if (
      averageRecent > 0 &&
      latest < averageRecent * 0.4
    ) {
      result.push({
        id: "low-activity",
        type: "low",
        severity: "medium",
        title: "Unusually low activity",
        message:
          "Recent registration activity is significantly below the recent average.",
        value: `${Math.round(
          averageRecent
        )} avg/day`,
      });
    }

    // Rapid capacity consumption
    if (capacityUsed >= 80) {
      result.push({
        id: "capacity",
        type: "capacity",
        severity: capacityUsed >= 95 ? "high" : "medium",
        title: "Capacity is nearly consumed",
        message: `${currentRegistrations} of ${capacity} available seats have been registered.`,
        value: `${Math.round(capacityUsed)}%`,
      });
    }

    // Overall growth
    if (registrationChange >= 25) {
      result.push({
        id: "growth",
        type: "growth",
        severity: "positive",
        title: "Registration growth is strong",
        message:
          "Registration activity is significantly higher than the previous period.",
        value: `+${Math.round(
          registrationChange
        )}%`,
      });
    }

    // No major alert
    if (result.length === 0) {
      result.push({
        id: "healthy",
        type: "healthy",
        severity: "positive",
        title: "Registration activity looks healthy",
        message:
          "No significant registration changes require attention right now.",
        value: "Stable",
      });
    }

    return result;
  }, [data]);

  const visibleAlerts = alerts.filter(
    (alert) => !dismissed.includes(alert.id)
  );

  const dismissAlert = (id) => {
    setDismissed((current) => [
      ...current,
      id,
    ]);
  };

  const resetAlerts = () => {
    setDismissed([]);
  };

  const registrationChange =
    data.previousRegistrations > 0
      ? ((data.currentRegistrations -
          data.previousRegistrations) /
          data.previousRegistrations) *
        100
      : 0;

  const capacityPercentage =
    data.capacity > 0
      ? (data.currentRegistrations /
          data.capacity) *
        100
      : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Trend Alerts
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Get notified when registration activity changes
              significantly or event capacity is being consumed
              rapidly.
            </p>
          </div>
        </div>

        {/* Alert Toggle */}
        <button
          type="button"
          onClick={() =>
            setAlertsEnabled(!alertsEnabled)
          }
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[7px] font-bold transition ${
            alertsEnabled
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
          }`}
        >
          <Bell size={13} />

          {alertsEnabled
            ? "Alerts enabled"
            : "Alerts disabled"}
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Registrations"
          value={data.currentRegistrations}
          description={`Previous: ${data.previousRegistrations}`}
        />

        <MetricCard
          icon={
            registrationChange >= 0
              ? TrendingUp
              : TrendingDown
          }
          label="Period Change"
          value={`${
            registrationChange >= 0 ? "+" : ""
          }${Math.round(registrationChange)}%`}
          description="Compared with previous period"
          positive={registrationChange >= 0}
        />

        <MetricCard
          icon={Gauge}
          label="Capacity Used"
          value={`${Math.round(
            capacityPercentage
          )}%`}
          description={`${data.currentRegistrations}/${data.capacity} seats`}
        />

        <MetricCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={visibleAlerts.length}
          description={
            visibleAlerts.length
              ? "Requires attention"
              : "All clear"
          }
        />
      </div>

      {/* Capacity Progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Registration Capacity
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {data.currentRegistrations} registered out of{" "}
              {data.capacity} seats
            </p>
          </div>

          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {Math.round(capacityPercentage)}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                capacityPercentage,
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[6px] text-slate-400">
          <span>0</span>
          <span>
            {Math.max(
              data.capacity -
                data.currentRegistrations,
              0
            )}{" "}
            seats remaining
          </span>
          <span>{data.capacity}</span>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Trend Alerts
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Automatically detected registration changes.
            </p>
          </div>

          {dismissed.length > 0 && (
            <button
              type="button"
              onClick={resetAlerts}
              className="text-[6px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Restore dismissed
            </button>
          )}
        </div>

        {!alertsEnabled ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <Bell
              size={26}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              Registration alerts are disabled
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Enable alerts to receive important registration
              trend notifications.
            </p>
          </div>
        ) : visibleAlerts.length > 0 ? (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={() =>
                  dismissAlert(alert.id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-green-600 dark:text-green-400"
              />

              <div>
                <p className="text-[8px] font-bold text-green-700 dark:text-green-400">
                  No active alerts
                </p>

                <p className="mt-1 text-[6px] text-green-600 dark:text-green-500">
                  Registration activity is currently within normal
                  levels.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trend Data */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Recent Registration Activity
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Registrations per recent period.
            </p>
          </div>

          <TrendingUp
            size={16}
            className="text-indigo-500"
          />
        </div>

        <TrendChart
          values={data.recentRegistrations}
        />
      </div>
    </section>
  );
};

/* --------------------------------
   Metric Card
--------------------------------- */

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  positive,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      {positive !== undefined && (
        <span
          className={`flex items-center gap-1 text-[6px] font-bold ${
            positive
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUp size={10} />
          ) : (
            <ArrowDown size={10} />
          )}

          {positive ? "Growing" : "Declining"}
        </span>
      )}
    </div>

    <p className="mt-4 text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[6px] text-slate-400">
      {description}
    </p>
  </div>
);

/* --------------------------------
   Alert Card
--------------------------------- */

const AlertCard = ({
  alert,
  onDismiss,
}) => {
  const config = {
    high: {
      wrapper:
        "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10",
      icon:
        "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      title: "text-red-700 dark:text-red-400",
      message: "text-red-600 dark:text-red-500",
    },

    medium: {
      wrapper:
        "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10",
      icon:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      title: "text-amber-700 dark:text-amber-400",
      message: "text-amber-600 dark:text-amber-500",
    },

    positive: {
      wrapper:
        "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10",
      icon:
        "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      title: "text-green-700 dark:text-green-400",
      message: "text-green-600 dark:text-green-500",
    },
  };

  const styles =
    config[alert.severity] || config.medium;

  const Icon =
    alert.type === "spike" ||
    alert.type === "growth"
      ? TrendingUp
      : alert.type === "drop"
      ? TrendingDown
      : alert.type === "healthy"
      ? CheckCircle2
      : AlertTriangle;

  return (
    <div
      className={`rounded-2xl border p-4 ${styles.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              className={`text-[8px] font-bold ${styles.title}`}
            >
              {alert.title}
            </h4>

            <span
              className={`rounded-full bg-white/70 px-2.5 py-1 text-[6px] font-black ${styles.title} dark:bg-slate-900/40`}
            >
              {alert.value}
            </span>
          </div>

          <p
            className={`mt-1 text-[7px] leading-4 ${styles.message}`}
          >
            {alert.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white/50 hover:text-slate-700 dark:hover:bg-slate-900/40"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

/* --------------------------------
   Simple Trend Chart
--------------------------------- */

const TrendChart = ({ values }) => {
  const max = Math.max(...values, 1);

  return (
    <div className="mt-5 flex h-36 items-end gap-2 sm:gap-4">
      {values.map((value, index) => {
        const height = Math.max(
          (value / max) * 100,
          5
        );

        return (
          <div
            key={`${value}-${index}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
              {value}
            </span>

            <div className="flex h-24 w-full items-end rounded-lg bg-slate-100 dark:bg-slate-800">
              <div
                className="w-full rounded-lg bg-indigo-500 transition-all duration-500"
                style={{
                  height: `${height}%`,
                }}
              />
            </div>

            <span className="text-[5px] text-slate-400">
              Day {index + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default EventOrganizerRegistrationTrendAlerts;