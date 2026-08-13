import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Gauge,
  TrendingUp,
  Users,
} from "lucide-react";

const DEFAULT_DATA = {
  currentRegistrationRate: 8,
  registrationsPerMinute: 8,
  registrationsPerHour: 420,
  currentRegistrations: 720,
  capacity: 900,
  peakPeriod: "2:00 PM - 3:00 PM",
  peakRegistrations: 96,
  spikeDetected: true,
  spikeThreshold: 25,
};

const EventRegistrationTrafficMonitoring = ({
  data = DEFAULT_DATA,
}) => {
  const capacityPercentage =
    data.capacity > 0
      ? Math.min(
          (data.currentRegistrations / data.capacity) * 100,
          100
        )
      : 0;

  const spikeDetected =
    data.spikeDetected ||
    data.registrationsPerHour >= data.spikeThreshold;

  const remainingCapacity = Math.max(
    data.capacity - data.currentRegistrations,
    0
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Activity size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Registration Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Traffic Monitoring
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Monitor current registration activity, capacity
              consumption, peak periods, and unusual traffic spikes.
            </p>
          </div>
        </div>

        <LiveBadge />
      </div>

      {/* Spike Alert */}
      {spikeDetected && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle size={16} />
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                Registration Spike Detected
              </h3>

              <p className="mt-1 text-[7px] leading-relaxed text-amber-700 dark:text-amber-400">
                Registration activity is currently higher than the
                configured monitoring threshold. Consider monitoring
                capacity and registration system performance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Current Rate"
          value={`${data.currentRegistrationRate}/min`}
          description="Current registration rate"
        />

        <MetricCard
          icon={Clock3}
          label="Hourly Rate"
          value={data.registrationsPerHour}
          description="Registrations per hour"
        />

        <MetricCard
          icon={Users}
          label="Registrations"
          value={`${data.currentRegistrations}/${data.capacity}`}
          description={`${remainingCapacity} seats remaining`}
        />

        <MetricCard
          icon={Gauge}
          label="Capacity Used"
          value={`${capacityPercentage.toFixed(1)}%`}
          description="Current capacity consumption"
        />
      </div>

      {/* Capacity */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Capacity Consumption
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {data.currentRegistrations} registrations out of{" "}
              {data.capacity} available seats.
            </p>
          </div>

          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
            {capacityPercentage.toFixed(1)}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              capacityPercentage >= 90
                ? "bg-red-500"
                : capacityPercentage >= 75
                  ? "bg-amber-500"
                  : "bg-indigo-600"
            }`}
            style={{
              width: `${capacityPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] font-bold text-slate-400">
          <span>0</span>
          <span>{remainingCapacity} remaining</span>
          <span>{data.capacity}</span>
        </div>
      </div>

      {/* Traffic Overview */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TrafficCard
          title="Registration Rate"
          icon={BarChart3}
          value={`${data.registrationsPerMinute} registrations/min`}
          secondary={`${data.registrationsPerHour} registrations/hour`}
        />

        <TrafficCard
          title="Peak Registration Period"
          icon={TrendingUp}
          value={data.peakPeriod}
          secondary={`${data.peakRegistrations} registrations during peak period`}
        />
      </div>

      {/* Monitoring Status */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Gauge
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Traffic Monitoring Status
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Registration activity is continuously evaluated against
              configured thresholds.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatusItem
            label="Registration Traffic"
            value={
              spikeDetected ? "Elevated" : "Normal"
            }
            warning={spikeDetected}
          />

          <StatusItem
            label="Capacity Status"
            value={
              capacityPercentage >= 90
                ? "Nearly Full"
                : capacityPercentage >= 75
                  ? "High Usage"
                  : "Available"
            }
            warning={capacityPercentage >= 90}
          />

          <StatusItem
            label="Peak Period"
            value={data.peakPeriod}
            warning={false}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60">
        <Activity
          size={13}
          className="mt-0.5 shrink-0 text-indigo-500"
        />

        <p className="text-[7px] leading-relaxed text-slate-500 dark:text-slate-400">
          Traffic monitoring helps organizers identify unusual
          registration activity and manage event capacity before
          available seats are exhausted.
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
    <div className="flex items-center justify-between">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>
    </div>

    <p className="mt-4 text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[6px] text-slate-400">
      {description}
    </p>
  </div>
);

const TrafficCard = ({
  title,
  icon: Icon,
  value,
  secondary,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={16} />
      </div>

      <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
    </div>

    <p className="mt-5 text-xl font-black text-slate-900 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      {secondary}
    </p>
  </div>
);

const StatusItem = ({
  label,
  value,
  warning,
}) => (
  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p
      className={`mt-2 text-[8px] font-black ${
        warning
          ? "text-amber-600 dark:text-amber-400"
          : "text-slate-800 dark:text-white"
      }`}
    >
      {value}
    </p>
  </div>
);

const LiveBadge = () => (
  <span className="flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[6px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
    Live Monitoring
  </span>
);

export default EventRegistrationTrafficMonitoring;