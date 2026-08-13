import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    name: "AI Hackathon 2026",
    registrations: 420,
    attendance: 356,
    feedbackRating: 4.7,
    capacity: 500,
    engagement: 86,
  },
  {
    id: 2,
    name: "Tech Innovation Summit",
    registrations: 380,
    attendance: 294,
    feedbackRating: 4.5,
    capacity: 450,
    engagement: 79,
  },
  {
    id: 3,
    name: "Web Development Workshop",
    registrations: 240,
    attendance: 218,
    feedbackRating: 4.8,
    capacity: 250,
    engagement: 91,
  },
];

const METRICS = {
  registrations: {
    label: "Registrations",
    icon: Users,
    format: (value) => value,
  },
  attendance: {
    label: "Attendance",
    icon: CheckCircle2,
    format: (value) => value,
  },
  feedbackRating: {
    label: "Feedback Rating",
    icon: MessageSquare,
    format: (value) => `${value.toFixed(1)}/5`,
  },
  conversion: {
    label: "Registration Conversion",
    icon: Activity,
    format: (value) => `${value.toFixed(1)}%`,
  },
  utilization: {
    label: "Capacity Utilization",
    icon: BarChart3,
    format: (value) => `${value.toFixed(1)}%`,
  },
  engagement: {
    label: "Engagement",
    icon: Activity,
    format: (value) => `${value}%`,
  },
};

const OrganizerPerformanceComparison = ({
  events = DEFAULT_EVENTS,
}) => {
  const [selectedMetric, setSelectedMetric] =
    useState("registrations");

  const [selectedEvents, setSelectedEvents] =
    useState(
      events.map((event) => event.id)
    );

  const processedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,

      conversion:
        event.registrations > 0
          ? (event.attendance /
              event.registrations) *
            100
          : 0,

      utilization:
        event.capacity > 0
          ? (event.attendance /
              event.capacity) *
            100
          : 0,
    }));
  }, [events]);

  const visibleEvents = processedEvents.filter(
    (event) =>
      selectedEvents.includes(event.id)
  );

  const ranking = [...visibleEvents].sort(
    (a, b) =>
      b[selectedMetric] -
      a[selectedMetric]
  );

  const highest =
    ranking.length > 0
      ? ranking[0]
      : null;

  const toggleEvent = (id) => {
    setSelectedEvents((current) => {
      if (current.includes(id)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter(
          (eventId) => eventId !== id
        );
      }

      return [...current, id];
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Performance Comparison
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Compare registrations, attendance, feedback, conversion,
              capacity utilization, and engagement across your events.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {Object.entries(METRICS).map(
            ([key, metric]) => {
              const Icon = metric.icon;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setSelectedMetric(key)
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[6px] font-bold transition ${
                    selectedMetric === key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700"
                  }`}
                >
                  <Icon size={11} />
                  {metric.label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Event Selection */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Compare Events
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Select the events you want to compare.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {selectedEvents.length} selected
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {processedEvents.map((event) => {
            const selected =
              selectedEvents.includes(
                event.id
              );

            return (
              <button
                key={event.id}
                type="button"
                onClick={() =>
                  toggleEvent(event.id)
                }
                className={`rounded-xl px-3 py-2.5 text-[6px] font-bold transition ${
                  selected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {event.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Winner */}
      {highest && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 dark:bg-slate-900 dark:text-green-400">
              <ArrowUp size={17} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                Top Performing Event
              </p>

              <p className="mt-1 text-[9px] font-black text-slate-800 dark:text-white">
                {highest.name}
              </p>

              <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
                {METRICS[selectedMetric].label}:{" "}
                {METRICS[selectedMetric].format(
                  highest[selectedMetric]
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                <th className="px-4 py-4 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Event
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Registrations
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Attendance
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Feedback
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Conversion
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Capacity
                </th>

                <th className="px-4 py-4 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Engagement
                </th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((event, index) => {
                const isWinner =
                  index === 0;

                return (
                  <tr
                    key={event.id}
                    className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${
                      isWinner
                        ? "bg-indigo-50/40 dark:bg-indigo-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[7px] font-black ${
                            isWinner
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          #{index + 1}
                        </span>

                        <div>
                          <p className="text-[7px] font-bold text-slate-800 dark:text-white">
                            {event.name}
                          </p>

                          {isWinner && (
                            <span className="text-[5px] font-bold uppercase text-indigo-500">
                              Best performer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <MetricCell
                      value={event.registrations}
                      active={
                        selectedMetric ===
                        "registrations"
                      }
                    />

                    <MetricCell
                      value={event.attendance}
                      active={
                        selectedMetric ===
                        "attendance"
                      }
                    />

                    <MetricCell
                      value={`${event.feedbackRating.toFixed(
                        1
                      )}/5`}
                      active={
                        selectedMetric ===
                        "feedbackRating"
                      }
                    />

                    <MetricCell
                      value={`${event.conversion.toFixed(
                        1
                      )}%`}
                      active={
                        selectedMetric ===
                        "conversion"
                      }
                    />

                    <MetricCell
                      value={`${event.utilization.toFixed(
                        1
                      )}%`}
                      active={
                        selectedMetric ===
                        "utilization"
                      }
                    />

                    <MetricCell
                      value={`${event.engagement}%`}
                      active={
                        selectedMetric ===
                        "engagement"
                      }
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!ranking.length && (
          <div className="p-10 text-center text-[8px] text-slate-400">
            Select at least one event to compare.
          </div>
        )}
      </div>

      {/* Performance Cards */}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {ranking.map((event, index) => (
          <PerformanceCard
            key={event.id}
            event={event}
            rank={index + 1}
            metric={selectedMetric}
          />
        ))}
      </div>
    </section>
  );
};

/* --------------------------------
   Metric Cell
--------------------------------- */

const MetricCell = ({
  value,
  active,
}) => {
  return (
    <td
      className={`px-4 py-4 text-right text-[7px] font-bold ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300"
      }`}
    >
      {value}
    </td>
  );
};

/* --------------------------------
   Performance Card
--------------------------------- */

const PerformanceCard = ({
  event,
  rank,
  metric,
}) => {
  const metricInfo =
    METRICS[metric];

  const Icon = metricInfo.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Icon size={15} />
          </div>

          <div>
            <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
              Rank #{rank}
            </p>

            <h4 className="mt-1 text-[7px] font-bold text-slate-800 dark:text-white">
              {event.name}
            </h4>
          </div>
        </div>

        {rank === 1 ? (
          <ArrowUp
            size={13}
            className="text-green-500"
          />
        ) : (
          <ArrowDown
            size={13}
            className="text-slate-400"
          />
        )}
      </div>

      <div className="mt-4">
        <p className="text-[6px] text-slate-400">
          {metricInfo.label}
        </p>

        <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
          {metricInfo.format(
            event[metric]
          )}
        </p>
      </div>
    </div>
  );
};

export default OrganizerPerformanceComparison;