import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_THRESHOLDS = {
  warning: 75,
  critical: 90,
  full: 100,
};

const DEFAULT_SESSIONS = [
  {
    id: "session-1",
    name: "AI & Machine Learning",
    venue: "Hall A",
    capacity: 100,
    registered: 72,
  },
  {
    id: "session-2",
    name: "Web Development Workshop",
    venue: "Lab 2",
    capacity: 80,
    registered: 74,
  },
  {
    id: "session-3",
    name: "Cloud Computing",
    venue: "Hall B",
    capacity: 60,
    registered: 60,
  },
  {
    id: "session-4",
    name: "Cybersecurity Basics",
    venue: "Room 301",
    capacity: 100,
    registered: 42,
  },
];

const SessionCapacityWarning = ({
  sessions = DEFAULT_SESSIONS,
  initialThresholds = DEFAULT_THRESHOLDS,
  onThresholdChange,
  className = "",
}) => {
  const [thresholds, setThresholds] =
    useState(initialThresholds);

  const [showSettings, setShowSettings] =
    useState(false);

  const [filter, setFilter] =
    useState("all");

  const getStatus = (session) => {
    const percentage =
      session.capacity > 0
        ? (session.registered /
            session.capacity) *
          100
        : 0;

    if (
      percentage >=
      thresholds.full
    ) {
      return "full";
    }

    if (
      percentage >=
      thresholds.critical
    ) {
      return "critical";
    }

    if (
      percentage >=
      thresholds.warning
    ) {
      return "warning";
    }

    return "normal";
  };

  const sessionData = useMemo(() => {
    return sessions.map(
      (session) => {
        const percentage =
          session.capacity > 0
            ? (session.registered /
                session.capacity) *
              100
            : 0;

        return {
          ...session,
          percentage,
          status: getStatus(session),
          remaining: Math.max(
            session.capacity -
              session.registered,
            0
          ),
        };
      }
    );
  }, [sessions, thresholds]);

  const filteredSessions =
    sessionData.filter(
      (session) => {
        if (filter === "all") {
          return true;
        }

        return (
          session.status ===
          filter
        );
      }
    );

  const summary = useMemo(() => {
    return {
      total: sessionData.length,
      normal: sessionData.filter(
        (item) =>
          item.status === "normal"
      ).length,
      warning: sessionData.filter(
        (item) =>
          item.status === "warning"
      ).length,
      critical: sessionData.filter(
        (item) =>
          item.status === "critical"
      ).length,
      full: sessionData.filter(
        (item) =>
          item.status === "full"
      ).length,
    };
  }, [sessionData]);

  const updateThreshold = (
    field,
    value
  ) => {
    const numericValue = Number(
      value
    );

    setThresholds((current) => {
      const updated = {
        ...current,
        [field]: numericValue,
      };

      onThresholdChange?.(
        updated
      );

      return updated;
    });
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle
              size={21}
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Capacity Monitoring
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Capacity Warnings
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Monitor individual session capacity and
              identify sessions that are approaching or
              reaching their limits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (current) =>
                !current
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Settings2 size={14} />
          Warning Settings
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryCard
          label="Sessions"
          value={summary.total}
          type="neutral"
        />

        <SummaryCard
          label="Normal"
          value={summary.normal}
          type="normal"
        />

        <SummaryCard
          label="75%+"
          value={summary.warning}
          type="warning"
        />

        <SummaryCard
          label="90%+"
          value={summary.critical}
          type="critical"
        />

        <SummaryCard
          label="Full"
          value={summary.full}
          type="full"
        />
      </div>

      {/* Threshold Settings */}
      {showSettings && (
        <ThresholdSettings
          thresholds={thresholds}
          onChange={
            updateThreshold
          }
        />
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["all", "All Sessions"],
          ["normal", "Normal"],
          ["warning", "75%+"],
          ["critical", "90%+"],
          ["full", "Full"],
        ].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value)
              }
              className={`rounded-xl px-4 py-2.5 text-[7px] font-bold transition ${
                filter === value
                  ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Sessions */}
      <div className="mt-5 space-y-3">
        {filteredSessions.length ===
        0 ? (
          <EmptyState />
        ) : (
          filteredSessions.map(
            (session) => (
              <SessionCapacityCard
                key={session.id}
                session={session}
              />
            )
          )
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          Capacity thresholds
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LegendItem
            type="warning"
            label={`${thresholds.warning}% capacity`}
            description="Session is approaching capacity."
          />

          <LegendItem
            type="critical"
            label={`${thresholds.critical}% capacity`}
            description="Organizer attention recommended."
          />

          <LegendItem
            type="full"
            label={`${thresholds.full}% capacity`}
            description="No additional seats available."
          />
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Session Capacity Card
--------------------------------- */

const SessionCapacityCard = ({
  session,
}) => {
  const statusConfig = {
    normal: {
      label: "Normal",
      icon: CheckCircle2,
      wrapper:
        "border-slate-200 dark:border-slate-700",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
      bar: "bg-green-500",
    },

    warning: {
      label: "Approaching Capacity",
      icon: AlertTriangle,
      wrapper:
        "border-amber-200 dark:border-amber-900/40",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
      bar: "bg-amber-500",
    },

    critical: {
      label: "High Capacity",
      icon: AlertCircle,
      wrapper:
        "border-orange-200 dark:border-orange-900/40",
      badge:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
      bar: "bg-orange-500",
    },

    full: {
      label: "Full",
      icon: AlertCircle,
      wrapper:
        "border-red-200 dark:border-red-900/40",
      badge:
        "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
      bar: "bg-red-500",
    },
  };

  const config =
    statusConfig[
      session.status
    ];

  const Icon = config.icon;

  const progress =
    Math.min(
      Math.max(
        session.percentage,
        0
      ),
      100
    );

  return (
    <article
      className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 ${config.wrapper}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Session Info */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.badge}`}
          >
            <Icon size={18} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {session.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${config.badge}`}
              >
                {config.label}
              </span>
            </div>

            {session.venue && (
              <p className="mt-1 text-[7px] text-slate-400">
                Venue:{" "}
                {session.venue}
              </p>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users
              size={15}
              className="text-slate-400"
            />

            <div>
              <p className="text-[6px] uppercase tracking-wide text-slate-400">
                Registered
              </p>

              <p className="text-[10px] font-black text-slate-800 dark:text-white">
                {session.registered}
                <span className="font-medium text-slate-400">
                  {" "}
                  /{" "}
                  {session.capacity}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {Math.round(
                session.percentage
              )}
              %
            </p>

            <p className="text-[6px] text-slate-400">
              capacity
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${config.bar}`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between">
          <span className="text-[6px] text-slate-400">
            {session.registered} registered
          </span>

          <span
            className={`text-[6px] font-bold ${
              session.remaining === 0
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            {session.remaining === 0
              ? "No seats remaining"
              : `${session.remaining} seats remaining`}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {session.status !==
        "normal" && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl p-3 ${config.badge}`}
        >
          <Icon
            size={13}
            className="mt-0.5 shrink-0"
          />

          <p className="text-[7px] leading-4">
            {session.status ===
              "warning" &&
              `This session has reached ${Math.round(
                session.percentage
              )}% capacity. Consider monitoring registrations closely.`}

            {session.status ===
              "critical" &&
              `This session has reached ${Math.round(
                session.percentage
              )}% capacity. Only ${session.remaining} seat${
                session.remaining === 1
                  ? ""
                  : "s"
              } remain.`}

            {session.status ===
              "full" &&
              "This session has reached full capacity. New registrations should be prevented or added to the session waitlist."}
          </p>
        </div>
      )}
    </article>
  );
};

/* --------------------------------
   Threshold Settings
--------------------------------- */

const ThresholdSettings = ({
  thresholds,
  onChange,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex items-start gap-3">
        <Settings2
          size={17}
          className="mt-0.5 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
            Configure Warning Thresholds
          </p>

          <p className="mt-1 text-[7px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
            Choose when organizers should receive capacity
            warnings.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ThresholdInput
          label="Warning"
          value={thresholds.warning}
          description="Approaching capacity"
          onChange={(value) =>
            onChange(
              "warning",
              value
            )
          }
        />

        <ThresholdInput
          label="Critical"
          value={thresholds.critical}
          description="High capacity"
          onChange={(value) =>
            onChange(
              "critical",
              value
            )
          }
        />

        <ThresholdInput
          label="Full"
          value={thresholds.full}
          description="No seats available"
          onChange={(value) =>
            onChange(
              "full",
              value
            )
          }
        />
      </div>
    </div>
  );
};

/* --------------------------------
   Threshold Input
--------------------------------- */

const ThresholdInput = ({
  label,
  value,
  description,
  onChange,
}) => {
  return (
    <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="100"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <span className="text-xs font-bold text-slate-400">
          %
        </span>
      </div>

      <p className="mt-2 text-[6px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  type,
}) => {
  const styles = {
    neutral:
      "text-slate-800 dark:text-white",
    normal:
      "text-green-600 dark:text-green-400",
    warning:
      "text-amber-600 dark:text-amber-400",
    critical:
      "text-orange-600 dark:text-orange-400",
    full:
      "text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${styles[type]}`}
      >
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Legend
--------------------------------- */

const LegendItem = ({
  type,
  label,
  description,
}) => {
  const styles = {
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
    critical:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
    full:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  };

  const Icon =
    type === "full"
      ? AlertCircle
      : AlertTriangle;

  return (
    <div className="flex items-start gap-2">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles[type]}`}
      >
        <Icon size={13} />
      </div>

      <div>
        <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
          {label}
        </p>

        <p className="mt-1 text-[6px] leading-3 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <Users
        size={28}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No sessions found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing the capacity filter.
      </p>
    </div>
  );
};

export default SessionCapacityWarning;