import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_EVENT = {
  registrations: 82,
  capacity: 100,
  registrationGrowth: 18,
  waitlistSize: 7,
  daysUntilDeadline: 3,
};

const getRiskLevel = ({
  registrations,
  capacity,
  registrationGrowth,
  waitlistSize,
  daysUntilDeadline,
}) => {
  const capacityRate =
    capacity > 0 ? (registrations / capacity) * 100 : 0;

  let score = 0;

  if (capacityRate >= 90) score += 45;
  else if (capacityRate >= 75) score += 30;
  else if (capacityRate >= 50) score += 15;

  if (registrationGrowth >= 30) score += 25;
  else if (registrationGrowth >= 15) score += 15;
  else if (registrationGrowth > 0) score += 5;

  if (waitlistSize >= 20) score += 20;
  else if (waitlistSize >= 10) score += 15;
  else if (waitlistSize > 0) score += 5;

  if (daysUntilDeadline <= 2) score += 15;
  else if (daysUntilDeadline <= 7) score += 10;
  else if (daysUntilDeadline <= 14) score += 5;

  if (score >= 80 || capacityRate >= 95) {
    return {
      level: "Nearly Full",
      score: Math.min(score, 100),
      description:
        "Registration demand is very high and the event may reach capacity soon.",
    };
  }

  if (score >= 55) {
    return {
      level: "High Demand",
      score,
      description:
        "Registration activity is strong. Remaining capacity may be limited.",
    };
  }

  if (score >= 30) {
    return {
      level: "Moderate Demand",
      score,
      description:
        "Registration activity is steady with moderate demand.",
    };
  }

  return {
    level: "Low Demand",
    score,
    description:
      "Registration demand is currently low compared with available capacity.",
  };
};

const getRiskClasses = (level) => {
  switch (level) {
    case "Nearly Full":
      return {
        container:
          "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10",
        icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        text: "text-red-700 dark:text-red-400",
        bar: "bg-red-500",
      };

    case "High Demand":
      return {
        container:
          "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-900/10",
        icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        text: "text-orange-700 dark:text-orange-400",
        bar: "bg-orange-500",
      };

    case "Moderate Demand":
      return {
        container:
          "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10",
        icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        text: "text-amber-700 dark:text-amber-400",
        bar: "bg-amber-500",
      };

    default:
      return {
        container:
          "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10",
        icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        text: "text-green-700 dark:text-green-400",
        bar: "bg-green-500",
      };
  }
};

const EventRegistrationRiskIndicator = ({
  event = DEFAULT_EVENT,
}) => {
  const risk = useMemo(
    () => getRiskLevel(event),
    [event]
  );

  const classes = getRiskClasses(risk.level);

  const remainingCapacity = Math.max(
    event.capacity - event.registrations,
    0
  );

  const capacityPercentage =
    event.capacity > 0
      ? Math.min(
          Math.round(
            (event.registrations / event.capacity) * 100
          ),
          100
        )
      : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Demand Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Risk Indicator
            </h2>

            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              Identify events with unusually high registration
              demand or limited remaining capacity.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 ${classes.container}`}
        >
          {risk.level === "Low Demand" ? (
            <CheckCircle2 size={13} />
          ) : (
            <AlertTriangle size={13} />
          )}

          <span
            className={`text-[6px] font-bold ${classes.text}`}
          >
            {risk.level}
          </span>
        </div>
      </div>

      {/* Main Risk Card */}
      <div
        className={`mt-6 rounded-2xl border p-5 ${classes.container}`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${classes.icon}`}
            >
              <AlertTriangle size={22} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Current Registration Risk
              </p>

              <h3
                className={`mt-1 text-xl font-black ${classes.text}`}
              >
                {risk.level}
              </h3>

              <p className="mt-1 max-w-lg text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                {risk.description}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[6px] font-bold uppercase text-slate-400">
              Risk Score
            </p>

            <p
              className={`mt-1 text-3xl font-black ${classes.text}`}
            >
              {risk.score}
              <span className="text-sm">/100</span>
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${classes.bar}`}
            style={{
              width: `${risk.score}%`,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Registrations"
          value={event.registrations}
          description={`of ${event.capacity} capacity`}
        />

        <MetricCard
          icon={BarChart3}
          label="Remaining Capacity"
          value={remainingCapacity}
          description="seats available"
        />

        <MetricCard
          icon={TrendingIcon}
          label="Registration Growth"
          value={`${event.registrationGrowth}%`}
          description="recent growth"
        />

        <MetricCard
          icon={Clock3}
          label="Deadline"
          value={event.daysUntilDeadline}
          description={
            event.daysUntilDeadline === 1
              ? "day remaining"
              : "days remaining"
          }
        />
      </div>

      {/* Capacity */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Capacity Consumption
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {event.registrations} registered out of{" "}
              {event.capacity} available seats.
            </p>
          </div>

          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {capacityPercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${classes.bar}`}
            style={{
              width: `${capacityPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] text-slate-400">
          <span>0 registrations</span>
          <span>{remainingCapacity} seats left</span>
          <span>{event.capacity} capacity</span>
        </div>
      </div>

      {/* Demand Factors */}
      <div className="mt-5">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Demand Factors
        </h3>

        <p className="mt-1 text-[7px] text-slate-400">
          Factors contributing to the current registration risk
          level.
        </p>

        <div className="mt-4 space-y-3">
          <FactorRow
            label="Capacity Usage"
            value={`${capacityPercentage}%`}
            progress={capacityPercentage}
          />

          <FactorRow
            label="Registration Growth"
            value={`${event.registrationGrowth}%`}
            progress={Math.min(
              event.registrationGrowth,
              100
            )}
          />

          <FactorRow
            label="Waitlist Pressure"
            value={`${event.waitlistSize} waiting`}
            progress={Math.min(
              event.waitlistSize * 5,
              100
            )}
          />

          <FactorRow
            label="Deadline Proximity"
            value={`${event.daysUntilDeadline} days`}
            progress={Math.max(
              100 - event.daysUntilDeadline * 5,
              0
            )}
          />
        </div>
      </div>

      {/* Waitlist Warning */}
      {event.waitlistSize > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400"
          />

          <div>
            <h4 className="text-[8px] font-bold text-orange-700 dark:text-orange-400">
              Waitlist Activity Detected
            </h4>

            <p className="mt-1 text-[7px] leading-4 text-orange-600 dark:text-orange-400">
              {event.waitlistSize} participant
              {event.waitlistSize === 1 ? "" : "s"} are
              currently waiting for availability.
            </p>
          </div>
        </div>
      )}

      {/* User Guidance */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Registration Guidance
        </h3>

        <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
          {risk.level === "Nearly Full" &&
            "This event is nearly full. Participants should register as soon as possible to secure a place."}

          {risk.level === "High Demand" &&
            "Demand is currently high. Consider registering early because available capacity may decrease quickly."}

          {risk.level === "Moderate Demand" &&
            "Registration activity is moderate. Continue monitoring demand and remaining capacity."}

          {risk.level === "Low Demand" &&
            "There is currently sufficient capacity. Registration demand is relatively low."}
        </p>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const FactorRow = ({
  label,
  value,
  progress,
}) => (
  <div>
    <div className="flex items-center justify-between">
      <span className="text-[7px] font-bold text-slate-600 dark:text-slate-400">
        {label}
      </span>

      <span className="text-[7px] font-black text-slate-700 dark:text-slate-300">
        {value}
      </span>
    </div>

    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
        style={{
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
        }}
      />
    </div>
  </div>
);

const TrendingIcon = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </svg>
);

export default EventRegistrationRiskIndicator;