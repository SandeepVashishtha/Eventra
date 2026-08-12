import {
  ArrowRightLeft,
  Ban,
  CheckCircle2,
  Clock3,
  FilePlus2,
  History,
  RefreshCw,
  Search,
  Trash2,
  User,
  UserRoundX,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const ACTION_CONFIG = {
  created: {
    label: "Registration Created",
    icon: FilePlus2,
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
  },
  approved: {
    label: "Registration Approved",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  rejected: {
    label: "Registration Rejected",
    icon: XCircle,
    className:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
  cancelled: {
    label: "Registration Cancelled",
    icon: Ban,
    className:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
  },
  status_changed: {
    label: "Participant Status Changed",
    icon: RefreshCw,
    className:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400",
  },
  transferred: {
    label: "Registration Transferred",
    icon: ArrowRightLeft,
    className:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400",
  },
  removed: {
    label: "Participant Removed",
    icon: UserRoundX,
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
};

const DEFAULT_LOGS = [
  {
    id: "log-1",
    action: "approved",
    participantName: "Rahul Sharma",
    registrationId: "REG-1024",
    performedBy: "Jainiksha Patel",
    timestamp: "2026-08-12T09:30:00",
    details: "Registration approved by organizer.",
  },
  {
    id: "log-2",
    action: "status_changed",
    participantName: "Priya Patel",
    registrationId: "REG-1023",
    performedBy: "Jainiksha Patel",
    timestamp: "2026-08-12T08:45:00",
    details: "Status changed from pending to approved.",
    previousStatus: "Pending",
    newStatus: "Approved",
  },
  {
    id: "log-3",
    action: "created",
    participantName: "Amit Shah",
    registrationId: "REG-1022",
    performedBy: "Amit Shah",
    timestamp: "2026-08-11T17:20:00",
    details: "New event registration created.",
  },
  {
    id: "log-4",
    action: "cancelled",
    participantName: "Neha Mehta",
    registrationId: "REG-1021",
    performedBy: "Neha Mehta",
    timestamp: "2026-08-11T15:10:00",
    details: "Participant cancelled the registration.",
  },
];

const RegistrationActivityAuditLog = ({
  logs = DEFAULT_LOGS,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("all");

  const [participantFilter, setParticipantFilter] =
    useState("all");

  const filteredLogs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.participantName
          ?.toLowerCase()
          .includes(query) ||
        log.registrationId
          ?.toLowerCase()
          .includes(query) ||
        log.performedBy
          ?.toLowerCase()
          .includes(query) ||
        log.details
          ?.toLowerCase()
          .includes(query);

      const matchesAction =
        actionFilter === "all" ||
        log.action === actionFilter;

      const matchesParticipant =
        participantFilter === "all" ||
        log.participantName ===
          participantFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesParticipant
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    participantFilter,
  ]);

  const participants = useMemo(() => {
    return [
      "all",
      ...new Set(
        logs
          .map(
            (log) =>
              log.participantName
          )
          .filter(Boolean)
      ),
    ];
  }, [logs]);

  const actionCounts = useMemo(() => {
    return Object.keys(ACTION_CONFIG).reduce(
      (result, action) => {
        result[action] = logs.filter(
          (log) =>
            log.action === action
        ).length;

        return result;
      },
      {}
    );
  }, [logs]);

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration History
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Activity Audit Log
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track important registration changes,
              timestamps, and responsible users.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Total Activities
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {logs.length}
          </p>
        </div>
      </div>

      {/* Action Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(ACTION_CONFIG).map(
          ([action, config]) => {
            const Icon = config.icon;

            return (
              <button
                key={action}
                type="button"
                onClick={() =>
                  setActionFilter(
                    action
                  )
                }
                className={`rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 ${
                  actionFilter === action
                    ? "ring-2 ring-indigo-400"
                    : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.className}`}
                >
                  <Icon size={14} />
                </div>

                <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
                  {actionCounts[action] || 0}
                </p>

                <p className="text-[6px] leading-3 text-slate-400">
                  {config.label}
                </p>
              </button>
            );
          }
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search participant, registration ID, user..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">
              All Activities
            </option>

            {Object.entries(
              ACTION_CONFIG
            ).map(
              ([action, config]) => (
                <option
                  key={action}
                  value={action}
                >
                  {config.label}
                </option>
              )
            )}
          </select>

          <select
            value={participantFilter}
            onChange={(event) =>
              setParticipantFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {participants.map(
              (participant) => (
                <option
                  key={participant}
                  value={participant}
                >
                  {participant ===
                  "all"
                    ? "All Participants"
                    : participant}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {filteredLogs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-slate-200 sm:block dark:bg-slate-800" />

            <div className="space-y-4">
              {filteredLogs.map(
                (log) => (
                  <AuditLogItem
                    key={log.id}
                    log={log}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-[7px] text-slate-400">
            Showing{" "}
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {filteredLogs.length}
            </span>{" "}
            of {logs.length} activities
          </p>

          {(search ||
            actionFilter !== "all" ||
            participantFilter !==
              "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActionFilter(
                  "all"
                );
                setParticipantFilter(
                  "all"
                );
              }}
              className="text-[7px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};

/* --------------------------------
   Audit Log Item
--------------------------------- */

const AuditLogItem = ({
  log,
}) => {
  const config =
    ACTION_CONFIG[log.action] ||
    ACTION_CONFIG.created;

  const Icon = config.icon;

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-4 sm:ml-10 sm:p-5 dark:border-slate-700 dark:bg-slate-900">
      {/* Timeline icon */}
      <div
        className={`absolute -left-[3.05rem] top-5 hidden h-10 w-10 items-center justify-center rounded-xl border-4 border-slate-50 sm:flex dark:border-slate-950 ${config.className}`}
      >
        <Icon size={15} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:hidden ${config.className}`}
          >
            <Icon size={17} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                {config.label}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${config.className}`}
              >
                {log.registrationId ||
                  "Registration"}
              </span>
            </div>

            <p className="mt-2 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
              {log.details ||
                "Registration activity recorded."}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-left lg:text-right">
          <div className="inline-flex items-center gap-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock3 size={10} />
            {formatDateTime(
              log.timestamp
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <User size={12} />
          </div>

          <div>
            <p className="text-[6px] uppercase tracking-wide text-slate-400">
              Participant
            </p>

            <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
              {log.participantName ||
                "Unknown participant"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[6px] uppercase tracking-wide text-slate-400">
            Responsible User
          </p>

          <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
            {log.performedBy ||
              "System"}
          </p>
        </div>

        {log.previousStatus &&
          log.newStatus && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {log.previousStatus}
              </span>

              <ArrowRightLeft
                size={11}
                className="text-slate-400"
              />

              <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">
                {log.newStatus}
              </span>
            </div>
          )}
      </div>
    </article>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <History
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No activity found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filters.
      </p>
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default RegistrationActivityAuditLog;