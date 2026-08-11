import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
  UserPlus,
} from "lucide-react";
import { useMemo } from "react";

const EventRegistrationStatistics = ({
  totalRegistered = 0,
  capacity = 0,
  teamsFormed = 0,
  waitlistCount = 0,
  waitlistEnabled = false,
  className = "",
}) => {
  const statistics = useMemo(() => {
    const registered = Math.max(
      0,
      Number(totalRegistered) || 0
    );

    const eventCapacity = Math.max(
      0,
      Number(capacity) || 0
    );

    const teams = Math.max(
      0,
      Number(teamsFormed) || 0
    );

    const waitlist = Math.max(
      0,
      Number(waitlistCount) || 0
    );

    const registrationPercentage =
      eventCapacity > 0
        ? Math.min(
            100,
            Math.round(
              (registered /
                eventCapacity) *
                100
            )
          )
        : 0;

    const availableSeats =
      Math.max(
        0,
        eventCapacity - registered
      );

    const isFull =
      eventCapacity > 0 &&
      registered >= eventCapacity;

    return {
      registered,
      eventCapacity,
      teams,
      waitlist,
      registrationPercentage,
      availableSeats,
      isFull,
    };
  }, [
    totalRegistered,
    capacity,
    teamsFormed,
    waitlistCount,
  ]);

  const getCapacityStatus = () => {
    if (statistics.isFull) {
      return {
        label: "Event Full",
        className:
          "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      };
    }

    if (
      statistics.registrationPercentage >=
      80
    ) {
      return {
        label: "Filling Fast",
        className:
          "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      };
    }

    return {
      label: "Seats Available",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    };
  };

  const status =
    getCapacityStatus();

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <BarChart3
            size={21}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Event Overview
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Registration Statistics
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            See the current registration activity and
            available capacity before joining this event.
          </p>
        </div>

        <span
          className={`hidden rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide sm:inline-flex ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Mobile status */}
      <div
        className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide sm:hidden ${status.className}`}
      >
        {status.label}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={17} />}
          label="Registered"
          value={
            statistics.registered
          }
          description="Total participants"
        />

        <StatCard
          icon={<UserPlus size={17} />}
          label="Available Seats"
          value={
            statistics.eventCapacity >
            0
              ? statistics.availableSeats
              : "—"
          }
          description={
            statistics.eventCapacity >
            0
              ? `of ${statistics.eventCapacity} seats`
              : "Capacity not specified"
          }
        />

        <StatCard
          icon={<BarChart3 size={17} />}
          label="Registration"
          value={`${statistics.registrationPercentage}%`}
          description="Capacity filled"
        />

        <StatCard
          icon={<Users size={17} />}
          label="Teams Formed"
          value={
            statistics.teams
          }
          description="Registered teams"
        />
      </div>

      {/* Capacity progress */}
      {statistics.eventCapacity >
        0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Registration Capacity
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {
                  statistics.registrationPercentage
                }
                %
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {statistics.registered} /{" "}
                {
                  statistics.eventCapacity
                }
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                participants registered
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                statistics.isFull
                  ? "bg-red-500"
                  : statistics.registrationPercentage >=
                    80
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{
                width: `${statistics.registrationPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              {statistics.isFull
                ? "Registration capacity has been reached."
                : `${statistics.availableSeats} seat${
                    statistics.availableSeats ===
                    1
                      ? ""
                      : "s"
                  } remaining`}
            </p>

            {statistics.isFull ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 dark:text-red-400">
                <Clock3 size={11} />
                Full
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400">
                <CheckCircle2 size={11} />
                Open
              </span>
            )}
          </div>
        </div>
      )}

      {/* Waitlist */}
      {waitlistEnabled && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Clock3 size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Waitlist
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                {statistics.waitlist} participant
                {statistics.waitlist ===
                1
                  ? ""
                  : "s"} waiting
              </p>

              <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                Join the waitlist if registration capacity is
                reached.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interest message */}
      {statistics.registered > 0 && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Users
            size={15}
            className="shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <p className="text-[10px] leading-4 text-indigo-700 dark:text-indigo-300">
            <strong>
              {statistics.registered} participant
              {statistics.registered === 1
                ? ""
                : "s"}
            </strong>{" "}
            {statistics.registered === 1
              ? "has"
              : "have"}{" "}
            already registered for this event.
          </p>
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Statistic card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default EventRegistrationStatistics;