import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_DATA = {
  waitlistPosition: 8,
  historicalCancellationRate: 0.18,
  remainingDays: 7,
  currentCapacity: 95,
  totalCapacity: 100,
  recentCancellations: 3,
};

const EventRegistrationCapacityWaitlistForecast = ({
  forecastData = DEFAULT_DATA,
}) => {
  const forecast = useMemo(() => {
    const {
      waitlistPosition,
      historicalCancellationRate,
      remainingDays,
      currentCapacity,
      totalCapacity,
      recentCancellations,
    } = forecastData;

    const remainingSeats = Math.max(
      totalCapacity - currentCapacity,
      0
    );

    const historicalExpectedCancellations =
      Math.round(
        currentCapacity * historicalCancellationRate
      );

    const cancellationMomentum =
      Math.min(recentCancellations * 2, 15);

    const timeFactor = Math.min(
      remainingDays * 2,
      20
    );

    const capacityFactor =
      remainingSeats > 0
        ? Math.min(remainingSeats * 10, 30)
        : 0;

    const positionFactor =
      waitlistPosition <= 0
        ? 35
        : Math.max(
            0,
            35 - (waitlistPosition - 1) * 4
          );

    let score =
      historicalExpectedCancellations +
      cancellationMomentum +
      timeFactor +
      capacityFactor +
      positionFactor;

    score = Math.min(Math.max(score, 0), 100);

    if (waitlistPosition <= remainingSeats) {
      score = Math.max(score, 85);
    }

    if (remainingDays <= 0) {
      score = Math.min(score, 20);
    }

    const level =
      score >= 70
        ? "High"
        : score >= 40
        ? "Medium"
        : "Low";

    const projectedCancellations = Math.max(
      historicalExpectedCancellations,
      recentCancellations
    );

    const estimatedPromotionPosition =
      projectedCancellations + remainingSeats;

    const likelyToPromote =
      waitlistPosition <= estimatedPromotionPosition;

    return {
      score: Math.round(score),
      level,
      remainingSeats,
      historicalExpectedCancellations,
      projectedCancellations,
      estimatedPromotionPosition,
      likelyToPromote,
    };
  }, [forecastData]);

  const getLevelStyle = () => {
    if (forecast.level === "High") {
      return {
        wrapper:
          "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10",
        text: "text-green-700 dark:text-green-300",
        icon: "text-green-600 dark:text-green-400",
      };
    }

    if (forecast.level === "Medium") {
      return {
        wrapper:
          "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10",
        text: "text-amber-700 dark:text-amber-300",
        icon: "text-amber-600 dark:text-amber-400",
      };
    }

    return {
      wrapper:
        "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10",
      text: "text-red-700 dark:text-red-300",
      icon: "text-red-600 dark:text-red-400",
    };
  };

  const levelStyle = getLevelStyle();

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <TrendingUp size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Forecast
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Waitlist Promotion Forecast
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Estimate the likelihood of receiving a seat based
              on waitlist position, cancellations, capacity, and
              remaining event time.
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl border px-5 py-3 text-center ${levelStyle.wrapper}`}
        >
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Promotion Chance
          </p>

          <p
            className={`mt-1 text-lg font-black ${levelStyle.text}`}
          >
            {forecast.level}
          </p>
        </div>
      </div>

      {/* Main Forecast */}
      <div
        className={`mt-6 rounded-2xl border p-6 ${levelStyle.wrapper}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3
                size={16}
                className={levelStyle.icon}
              />

              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estimated Promotion Score
              </p>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-4xl font-black ${levelStyle.text}`}
              >
                {forecast.score}%
              </span>
            </div>

            <p className="mt-2 text-[7px] text-slate-500 dark:text-slate-400">
              Current waitlist position: #
              {forecastData.waitlistPosition}
            </p>
          </div>

          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p
                className={`text-2xl font-black ${levelStyle.text}`}
              >
                {forecast.score}%
              </p>

              <p className="text-[6px] font-bold text-slate-400">
                likelihood
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Promotion Probability
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Higher scores indicate a stronger chance of
              receiving a seat.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[6px] font-bold ${levelStyle.wrapper} ${levelStyle.text}`}
          >
            {forecast.level} Chance
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              forecast.level === "High"
                ? "bg-green-500"
                : forecast.level === "Medium"
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${forecast.score}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[5px] font-bold text-slate-400">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Waitlist Position"
          value={`#${forecastData.waitlistPosition}`}
          description="current position"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Remaining Seats"
          value={forecast.remainingSeats}
          description="available capacity"
        />

        <MetricCard
          icon={TrendingUp}
          label="Recent Cancellations"
          value={forecastData.recentCancellations}
          description="recent activity"
        />

        <MetricCard
          icon={Clock}
          label="Remaining Time"
          value={`${forecastData.remainingDays}d`}
          description="until event"
        />
      </div>

      {/* Forecast Factors */}
      <div className="mt-6">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Forecast Factors
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FactorCard
            label="Historical Cancellation Rate"
            value={`${Math.round(
              forecastData.historicalCancellationRate * 100
            )}%`}
          />

          <FactorCard
            label="Expected Cancellations"
            value={forecast.historicalExpectedCancellations}
          />

          <FactorCard
            label="Projected Promotion Range"
            value={`Up to #${forecast.estimatedPromotionPosition}`}
          />
        </div>
      </div>

      {/* Promotion Result */}
      <div
        className={`mt-6 rounded-2xl border p-5 ${levelStyle.wrapper}`}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 dark:bg-slate-900">
            {forecast.likelyToPromote ? (
              <CheckCircle2
                size={17}
                className={levelStyle.icon}
              />
            ) : (
              <AlertCircle
                size={17}
                className={levelStyle.icon}
              />
            )}
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Forecast Result
            </p>

            <h3
              className={`mt-1 text-[9px] font-bold ${levelStyle.text}`}
            >
              {forecast.likelyToPromote
                ? "Your position is currently within the projected promotion range."
                : "Your position is currently outside the projected promotion range."}
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              The estimate considers current capacity,
              cancellation patterns, recent cancellation activity,
              remaining time, and your position on the waitlist.
            </p>
          </div>
        </div>
      </div>

      {/* Organizer Insight */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <TrendingUp size={15} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              Forecast Method
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Promotion likelihood combines the participant's
              waitlist position with expected cancellations,
              available capacity, recent cancellation activity,
              and the remaining time before the event.
            </p>
          </div>
        </div>
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
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const FactorCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

export default EventRegistrationCapacityWaitlistForecast;