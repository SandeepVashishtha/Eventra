import {
  AlertTriangle,
  CheckCircle2,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    name: "AI Workshop",
    speaker: "Dr. Mehta",
    capacity: 50,
    registered: 46,
    venue: "Room A",
  },
  {
    id: 2,
    name: "Web Development",
    speaker: "Priya Shah",
    capacity: 80,
    registered: 52,
    venue: "Room B",
  },
  {
    id: 3,
    name: "Cloud Computing",
    speaker: "Rahul Patel",
    capacity: 60,
    registered: 57,
    venue: "Room C",
  },
  {
    id: 4,
    name: "Data Science Fundamentals",
    speaker: "Neha Joshi",
    capacity: 100,
    registered: 100,
    venue: "Main Hall",
  },
];

const getOccupancy = (registered, capacity) => {
  if (!capacity || capacity <= 0) return 0;

  return Math.min(
    100,
    Math.round((registered / capacity) * 100)
  );
};

const getOccupancyStatus = (percentage) => {
  if (percentage >= 100) {
    return {
      label: "Full",
      description: "No seats remaining",
      icon: XCircle,
      badge:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      bar: "bg-red-500",
    };
  }

  if (percentage >= 90) {
    return {
      label: "Almost Full",
      description: "Very limited availability",
      icon: AlertTriangle,
      badge:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      bar: "bg-orange-500",
    };
  }

  if (percentage >= 75) {
    return {
      label: "Low Availability",
      description: "Limited seats available",
      icon: AlertTriangle,
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "Available",
    description: "Seats available",
    icon: CheckCircle2,
    badge:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    bar: "bg-green-500",
  };
};

const EventSessionOccupancyIndicator = ({
  sessions = DEFAULT_SESSIONS,
  title = "Session Occupancy",
}) => {
  const sessionData = useMemo(() => {
    return sessions.map((session) => {
      const percentage = getOccupancy(
        session.registered,
        session.capacity
      );

      const seatsRemaining = Math.max(
        0,
        session.capacity - session.registered
      );

      return {
        ...session,
        percentage,
        seatsRemaining,
        status: getOccupancyStatus(percentage),
      };
    });
  }, [sessions]);

  const summary = useMemo(() => {
    const totalCapacity = sessionData.reduce(
      (sum, session) => sum + session.capacity,
      0
    );

    const totalRegistered = sessionData.reduce(
      (sum, session) => sum + session.registered,
      0
    );

    const fullSessions = sessionData.filter(
      (session) => session.percentage >= 100
    ).length;

    const almostFullSessions = sessionData.filter(
      (session) =>
        session.percentage >= 90 &&
        session.percentage < 100
    ).length;

    const overallOccupancy =
      totalCapacity > 0
        ? Math.round(
            (totalRegistered / totalCapacity) * 100
          )
        : 0;

    return {
      totalCapacity,
      totalRegistered,
      fullSessions,
      almostFullSessions,
      overallOccupancy,
    };
  }, [sessionData]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Capacity
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Check current occupancy and seat availability for
              individual event sessions.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Overall Occupancy
          </p>

          <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
            {summary.overallOccupancy}%
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Registered"
          value={summary.totalRegistered}
        />

        <SummaryCard
          label="Total Capacity"
          value={summary.totalCapacity}
        />

        <SummaryCard
          label="Full Sessions"
          value={summary.fullSessions}
        />
      </div>

      {/* Session Cards */}
      <div className="mt-6 space-y-3">
        {sessionData.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
          />
        ))}
      </div>

      {/* Capacity Warning */}
      {summary.almostFullSessions > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-amber-500"
          />

          <div>
            <p className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
              High session demand
            </p>

            <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
              {summary.almostFullSessions} session
              {summary.almostFullSessions !== 1
                ? "s are"
                : " is"}{" "}
              almost full. Participants should consider
              registering early.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Session Card
--------------------------------- */

const SessionCard = ({ session }) => {
  const StatusIcon = session.status.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Session Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              {session.name}
            </h3>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[5px] font-bold ${session.status.badge}`}
            >
              <StatusIcon size={9} />
              {session.status.label}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-[6px] text-slate-400">
              Speaker:{" "}
              <strong className="text-slate-500 dark:text-slate-300">
                {session.speaker}
              </strong>
            </span>

            <span className="text-[6px] text-slate-400">
              Venue:{" "}
              <strong className="text-slate-500 dark:text-slate-300">
                {session.venue}
              </strong>
            </span>
          </div>
        </div>

        {/* Occupancy */}
        <div className="w-full lg:w-72">
          <div className="flex items-center justify-between">
            <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
              Occupancy
            </span>

            <span className="text-[8px] font-black text-slate-800 dark:text-white">
              {session.percentage}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${session.status.bar}`}
              style={{
                width: `${session.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Seats */}
        <div className="min-w-[120px] text-left lg:text-right">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Availability
          </p>

          <p
            className={`mt-1 text-[9px] font-black ${
              session.seatsRemaining === 0
                ? "text-red-500"
                : session.seatsRemaining <= 10
                ? "text-orange-500"
                : "text-green-500"
            }`}
          >
            {session.seatsRemaining === 0
              ? "Full"
              : `${session.seatsRemaining} seats remaining`}
          </p>

          <p className="mt-1 text-[5px] text-slate-400">
            {session.registered} / {session.capacity} registered
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventSessionOccupancyIndicator;