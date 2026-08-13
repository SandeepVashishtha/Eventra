import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    name: "AI Innovation Summit",
    date: "Aug 16, 2026",
    registrations: 850,
    attendance: 720,
    capacity: 900,
    feedbackRating: 4.7,
    cancellationRate: 6.2,
    conversionRate: 72,
    engagement: 88,
  },
  {
    id: 2,
    name: "Hackathon 2026",
    date: "Jul 28, 2026",
    registrations: 780,
    attendance: 650,
    capacity: 800,
    feedbackRating: 4.5,
    cancellationRate: 8.1,
    conversionRate: 68,
    engagement: 82,
  },
  {
    id: 3,
    name: "Web Development Meetup",
    date: "Jun 18, 2026",
    registrations: 620,
    attendance: 540,
    capacity: 700,
    feedbackRating: 4.3,
    cancellationRate: 7.4,
    conversionRate: 64,
    engagement: 76,
  },
];

const METRICS = [
  {
    key: "registrations",
    label: "Registrations",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "attendance",
    label: "Attendance",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "utilization",
    label: "Capacity Utilization",
    format: (value) => `${value.toFixed(1)}%`,
  },
  {
    key: "feedbackRating",
    label: "Feedback Rating",
    format: (value) => `${value.toFixed(1)}/5`,
  },
  {
    key: "cancellationRate",
    label: "Cancellation Rate",
    format: (value) => `${value.toFixed(1)}%`,
  },
  {
    key: "conversionRate",
    label: "Registration Conversion",
    format: (value) => `${value}%`,
  },
  {
    key: "engagement",
    label: "Participant Engagement",
    format: (value) => `${value}%`,
  },
];

const EventOrganizerEventComparisonAnalytics = ({
  events = DEFAULT_EVENTS,
}) => {
  const [selectedIds, setSelectedIds] = useState(
    events.slice(0, 3).map((event) => event.id)
  );

  const selectedEvents = useMemo(
    () =>
      events.filter((event) =>
        selectedIds.includes(event.id)
      ),
    [events, selectedIds]
  );

  const preparedEvents = useMemo(
    () =>
      selectedEvents.map((event) => ({
        ...event,
        utilization:
          event.capacity > 0
            ? (event.attendance / event.capacity) * 100
            : 0,
      })),
    [selectedEvents]
  );

  const toggleEvent = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((eventId) => eventId !== id);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, id];
    });
  };

  const ranking = useMemo(() => {
    return [...preparedEvents].sort(
      (a, b) => b.engagement - a.engagement
    );
  }, [preparedEvents]);

  const averages = useMemo(() => {
    if (!preparedEvents.length) return null;

    const total = preparedEvents.length;

    return {
      registrations:
        preparedEvents.reduce(
          (sum, event) => sum + event.registrations,
          0
        ) / total,

      attendance:
        preparedEvents.reduce(
          (sum, event) => sum + event.attendance,
          0
        ) / total,

      utilization:
        preparedEvents.reduce(
          (sum, event) => sum + event.utilization,
          0
        ) / total,

      feedbackRating:
        preparedEvents.reduce(
          (sum, event) => sum + event.feedbackRating,
          0
        ) / total,

      cancellationRate:
        preparedEvents.reduce(
          (sum, event) => sum + event.cancellationRate,
          0
        ) / total,

      conversionRate:
        preparedEvents.reduce(
          (sum, event) => sum + event.conversionRate,
          0
        ) / total,

      engagement:
        preparedEvents.reduce(
          (sum, event) => sum + event.engagement,
          0
        ) / total,
    };
  }, [preparedEvents]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Comparison Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Compare event performance across registrations,
              attendance, capacity, feedback, cancellations, and
              engagement.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Compared Events
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {preparedEvents.length}
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Select Events to Compare
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Select up to four events for comparison.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const selected = selectedIds.includes(event.id);

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => toggleEvent(event.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/20 dark:ring-indigo-900"
                    : "border-slate-200 hover:border-indigo-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
                      {event.name}
                    </p>

                    <p className="mt-1 text-[6px] text-slate-400">
                      {event.date}
                    </p>
                  </div>

                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selected && <CheckCircle2 size={12} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Metrics */}
      {averages && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Avg Registrations"
            value={averages.registrations.toFixed(0)}
          />

          <SummaryCard
            icon={Users}
            label="Avg Attendance"
            value={averages.attendance.toFixed(0)}
          />

          <SummaryCard
            icon={BarChart3}
            label="Avg Capacity Use"
            value={`${averages.utilization.toFixed(1)}%`}
          />

          <SummaryCard
            icon={TrendingUp}
            label="Avg Engagement"
            value={`${averages.engagement.toFixed(1)}%`}
          />
        </div>
      )}

      {/* Comparison Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="min-w-[800px]">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Performance Comparison
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Compare key performance indicators across selected
              events.
            </p>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60">
                  <th className="px-5 py-4 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                    Metric
                  </th>

                  {preparedEvents.map((event) => (
                    <th
                      key={event.id}
                      className="px-5 py-4 text-left text-[7px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      {event.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {METRICS.map((metric) => (
                  <tr
                    key={metric.key}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-5 py-4 text-[7px] font-bold text-slate-500 dark:text-slate-400">
                      {metric.label}
                    </td>

                    {preparedEvents.map((event) => (
                      <td
                        key={`${event.id}-${metric.key}`}
                        className="px-5 py-4 text-[8px] font-black text-slate-800 dark:text-white"
                      >
                        {metric.format(event[metric.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Comparison */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <BarChart3
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Capacity Utilization
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Compare how effectively each event used its available
              capacity.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {preparedEvents.map((event) => (
            <div key={event.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="truncate text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  {event.name}
                </span>

                <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                  {event.utilization.toFixed(1)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      event.utilization,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <TrendingUp
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Event Performance Ranking
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Events ranked by participant engagement.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {ranking.map((event, index) => (
            <div
              key={event.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[7px] font-black text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                #{index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
                  {event.name}
                </p>

                <p className="mt-1 text-[6px] text-slate-400">
                  {event.registrations} registrations ·{" "}
                  {event.attendance} attended
                </p>
              </div>

              <div className="text-right">
                <p className="text-[6px] font-bold text-slate-400">
                  Engagement
                </p>

                <p className="mt-1 text-[9px] font-black text-indigo-600 dark:text-indigo-400">
                  {event.engagement}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
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
      </div>
    </div>
  </div>
);

export default EventOrganizerEventComparisonAnalytics;