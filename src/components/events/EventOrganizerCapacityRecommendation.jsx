import {
  BarChart3,
  Building2,
  CheckCircle2,
  History,
  Lightbulb,
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_DATA = {
  previousRegistrations: 850,
  previousAttendance: 680,
  venueCapacity: 900,
  expectedAttendance: 720,
  waitlistSize: 85,
};

const EventOrganizerCapacityRecommendation = ({
  capacityData = DEFAULT_DATA,
}) => {
  const recommendation = useMemo(() => {
    const {
      previousRegistrations,
      previousAttendance,
      venueCapacity,
      expectedAttendance,
      waitlistSize,
    } = capacityData;

    const historicalAttendanceRate =
      previousRegistrations > 0
        ? previousAttendance / previousRegistrations
        : 0;

    const historicalDemand =
      previousRegistrations + waitlistSize;

    const demandBasedCapacity = Math.ceil(
      historicalDemand * 0.9
    );

    const expectedBasedCapacity = Math.ceil(
      expectedAttendance * 1.1
    );

    const historicalBasedCapacity = Math.ceil(
      previousAttendance * 1.15
    );

    const rawRecommendation = Math.max(
      demandBasedCapacity,
      expectedBasedCapacity,
      historicalBasedCapacity
    );

    const suggestedCapacity = Math.min(
      Math.max(rawRecommendation, expectedAttendance),
      venueCapacity
    );

    const utilization =
      venueCapacity > 0
        ? (suggestedCapacity / venueCapacity) * 100
        : 0;

    const projectedAttendanceRate =
      suggestedCapacity > 0
        ? (expectedAttendance / suggestedCapacity) * 100
        : 0;

    const spareCapacity = Math.max(
      suggestedCapacity - expectedAttendance,
      0
    );

    const confidence =
      historicalAttendanceRate >= 0.8 &&
      previousRegistrations > 0
        ? "High"
        : historicalAttendanceRate >= 0.6
        ? "Moderate"
        : "Low";

    return {
      historicalAttendanceRate,
      demandBasedCapacity,
      expectedBasedCapacity,
      historicalBasedCapacity,
      suggestedCapacity,
      utilization,
      projectedAttendanceRate,
      spareCapacity,
      confidence,
    };
  }, [capacityData]);

  const factors = [
    {
      icon: History,
      label: "Previous Registrations",
      value: capacityData.previousRegistrations,
      description: "historical demand",
    },
    {
      icon: UserCheck,
      label: "Previous Attendance",
      value: capacityData.previousAttendance,
      description: "historical participation",
    },
    {
      icon: Building2,
      label: "Venue Capacity",
      value: capacityData.venueCapacity,
      description: "maximum available",
    },
    {
      icon: Users,
      label: "Expected Attendance",
      value: capacityData.expectedAttendance,
      description: "forecasted participants",
    },
    {
      icon: UserPlus,
      label: "Waitlist Size",
      value: capacityData.waitlistSize,
      description: "additional demand",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Lightbulb size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Capacity Recommendation
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Get a recommended event capacity using historical
              registrations, attendance, venue limits, expected
              attendance, and waitlist demand.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-center dark:border-green-900/30 dark:bg-green-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
            Recommendation Confidence
          </p>

          <p className="mt-1 text-lg font-black text-green-600 dark:text-green-400">
            {recommendation.confidence}
          </p>
        </div>
      </div>

      {/* Main Recommendation */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                Suggested Event Capacity
              </p>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
                {recommendation.suggestedCapacity}
              </span>

              <span className="text-sm font-bold text-indigo-400">
                / {capacityData.venueCapacity}
              </span>
            </div>

            <p className="mt-2 text-[7px] text-indigo-600 dark:text-indigo-400">
              Recommended capacity based on current demand and
              historical participation.
            </p>
          </div>

          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-indigo-200 dark:border-indigo-900">
            <div className="text-center">
              <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {Math.round(recommendation.utilization)}%
              </p>

              <p className="text-[6px] font-bold text-indigo-400">
                venue usage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Suggested"
          value={recommendation.suggestedCapacity}
          description="recommended capacity"
        />

        <MetricCard
          icon={UserCheck}
          label="Expected"
          value={capacityData.expectedAttendance}
          description="expected attendance"
        />

        <MetricCard
          icon={Building2}
          label="Venue Limit"
          value={capacityData.venueCapacity}
          description="maximum capacity"
        />

        <MetricCard
          icon={UserPlus}
          label="Buffer"
          value={recommendation.spareCapacity}
          description="capacity above forecast"
        />
      </div>

      {/* Capacity Visualization */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Recommended Capacity Utilization
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Expected attendance compared with the recommended
              capacity.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {Math.round(
              recommendation.projectedAttendanceRate
            )}
            % expected
          </span>
        </div>

        <div className="mt-5">
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${Math.min(
                  recommendation.projectedAttendanceRate,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[6px] font-bold text-slate-400">
            <span>0</span>

            <span>
              {recommendation.suggestedCapacity} recommended
            </span>

            <span>{capacityData.venueCapacity} max</span>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="mt-6">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Recommendation Factors
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {factors.map((factor) => (
            <FactorCard
              key={factor.label}
              icon={factor.icon}
              label={factor.label}
              value={factor.value}
              description={factor.description}
            />
          ))}
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <BarChart3 size={15} />
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Calculation Breakdown
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Capacity estimates generated from the available
              event data.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <CalculationCard
            title="Demand-Based"
            value={recommendation.demandBasedCapacity}
            description="Uses registrations and waitlist demand."
          />

          <CalculationCard
            title="Expected Attendance"
            value={recommendation.expectedBasedCapacity}
            description="Adds a planning buffer to forecasted attendance."
          />

          <CalculationCard
            title="Historical Attendance"
            value={recommendation.historicalBasedCapacity}
            description="Uses previous attendance with a safety buffer."
          />
        </div>
      </div>

      {/* Recommendation Insight */}
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-green-600 dark:bg-slate-900 dark:text-green-400">
            <CheckCircle2 size={16} />
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
              Planning Recommendation
            </p>

            <h3 className="mt-1 text-[9px] font-bold text-green-800 dark:text-green-300">
              Consider setting capacity to{" "}
              {recommendation.suggestedCapacity} participants.
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
              This leaves an estimated buffer of{" "}
              {recommendation.spareCapacity} seats above expected
              attendance while staying within the venue limit of{" "}
              {capacityData.venueCapacity}.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <Lightbulb size={15} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              How the recommendation works
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              The recommendation compares historical demand,
              previous attendance, expected attendance, and
              waitlist activity. The suggested value is capped at
              the venue's maximum capacity to reduce overbooking
              risk.
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

const FactorCard = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      <Icon size={14} />
    </div>

    <p className="mt-3 text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[5px] text-slate-400">
      {description}
    </p>
  </div>
);

const CalculationCard = ({
  title,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {title}
    </p>

    <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-2 text-[6px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

export default EventOrganizerCapacityRecommendation;