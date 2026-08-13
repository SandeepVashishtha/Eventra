import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Search,
  Send,
  TrendingUp,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_INVITATIONS = [
  {
    id: "inv-1",
    eventId: "event-1",
    eventName: "Tech Innovation Summit",
    participantName: "Rahul Sharma",
    email: "rahul@example.com",
    status: "accepted",
    sentAt: "2026-08-10T10:30:00",
    respondedAt: "2026-08-10T12:00:00",
  },
  {
    id: "inv-2",
    eventId: "event-1",
    eventName: "Tech Innovation Summit",
    participantName: "Priya Patel",
    email: "priya@example.com",
    status: "pending",
    sentAt: "2026-08-11T09:15:00",
  },
  {
    id: "inv-3",
    eventId: "event-2",
    eventName: "AI Hackathon",
    participantName: "Amit Shah",
    email: "amit@example.com",
    status: "declined",
    sentAt: "2026-08-08T14:20:00",
    respondedAt: "2026-08-09T11:10:00",
  },
  {
    id: "inv-4",
    eventId: "event-2",
    eventName: "AI Hackathon",
    participantName: "Neha Joshi",
    email: "neha@example.com",
    status: "expired",
    sentAt: "2026-07-30T10:00:00",
  },
];

const STATUS_CONFIG = {
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    classes:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  declined: {
    label: "Declined",
    icon: XCircle,
    classes:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    classes:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    icon: UserX,
    classes:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ParticipantInvitationTracking = ({
  invitations = DEFAULT_INVITATIONS,
  events = [],
  onInvitationUpdate,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [eventFilter, setEventFilter] =
    useState("all");
  const [dateFilter, setDateFilter] =
    useState("all");

  const eventOptions = useMemo(() => {
    const map = new Map();

    invitations.forEach((invitation) => {
      if (!map.has(invitation.eventId)) {
        map.set(
          invitation.eventId,
          invitation.eventName
        );
      }
    });

    events.forEach((event) => {
      map.set(event.id, event.name);
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [invitations, events]);

  const filteredInvitations = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const now = new Date();

    return invitations.filter((invitation) => {
      const matchesSearch =
        !query ||
        invitation.participantName
          ?.toLowerCase()
          .includes(query) ||
        invitation.email
          ?.toLowerCase()
          .includes(query) ||
        invitation.eventName
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        invitation.status === statusFilter;

      const matchesEvent =
        eventFilter === "all" ||
        invitation.eventId === eventFilter;

      let matchesDate = true;

      if (dateFilter !== "all") {
        const sentDate = new Date(
          invitation.sentAt
        );

        if (dateFilter === "today") {
          matchesDate =
            sentDate.toDateString() ===
            now.toDateString();
        }

        if (dateFilter === "7days") {
          const sevenDaysAgo =
            new Date(now);

          sevenDaysAgo.setDate(
            now.getDate() - 7
          );

          matchesDate =
            sentDate >= sevenDaysAgo;
        }

        if (dateFilter === "30days") {
          const thirtyDaysAgo =
            new Date(now);

          thirtyDaysAgo.setDate(
            now.getDate() - 30
          );

          matchesDate =
            sentDate >= thirtyDaysAgo;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEvent &&
        matchesDate
      );
    });
  }, [
    invitations,
    search,
    statusFilter,
    eventFilter,
    dateFilter,
  ]);

  const statistics = useMemo(() => {
    return invitations.reduce(
      (stats, invitation) => {
        stats.total += 1;

        if (
          stats[invitation.status] !==
          undefined
        ) {
          stats[invitation.status] += 1;
        }

        return stats;
      },
      {
        total: 0,
        accepted: 0,
        declined: 0,
        pending: 0,
        expired: 0,
      }
    );
  }, [invitations]);

  const responseRate =
    statistics.total > 0
      ? Math.round(
          ((statistics.accepted +
            statistics.declined) /
            statistics.total) *
            100
        )
      : 0;

  const handleStatusUpdate = async (
    invitation,
    status
  ) => {
    const updatedInvitation = {
      ...invitation,
      status,
      respondedAt:
        new Date().toISOString(),
    };

    await onInvitationUpdate?.(
      updatedInvitation
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Mail size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Invitation Tracking
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Monitor invitation responses across events and
              understand participant outreach performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 dark:bg-slate-900">
          <TrendingUp
            size={14}
            className="text-indigo-500"
          />

          <div>
            <p className="text-[6px] uppercase tracking-wide text-slate-400">
              Response Rate
            </p>

            <p className="text-sm font-black text-slate-800 dark:text-white">
              {responseRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Sent"
          value={statistics.total}
          icon={Send}
        />

        <StatCard
          label="Accepted"
          value={statistics.accepted}
          icon={CheckCircle2}
          type="success"
        />

        <StatCard
          label="Declined"
          value={statistics.declined}
          icon={XCircle}
          type="danger"
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
          icon={Clock3}
          type="warning"
        />

        <StatCard
          label="Expired"
          value={statistics.expired}
          icon={UserX}
          type="neutral"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search participant..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <FilterSelect
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              {
                value: "all",
                label: "All Events",
              },
              ...eventOptions.map(
                (event) => ({
                  value: event.id,
                  label: event.name,
                })
              ),
            ]}
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              {
                value: "all",
                label: "All Statuses",
              },
              {
                value: "accepted",
                label: "Accepted",
              },
              {
                value: "declined",
                label: "Declined",
              },
              {
                value: "pending",
                label: "Pending",
              },
              {
                value: "expired",
                label: "Expired",
              },
            ]}
          />

          <FilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              {
                value: "all",
                label: "All Dates",
              },
              {
                value: "today",
                label: "Today",
              },
              {
                value: "7days",
                label: "Last 7 Days",
              },
              {
                value: "30days",
                label: "Last 30 Days",
              },
            ]}
          />
        </div>
      </div>

      {/* Invitation Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Invitation Activity
            </h3>

            <span className="text-[7px] text-slate-400">
              {filteredInvitations.length} records
            </span>
          </div>
        </div>

        {filteredInvitations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <TableHead>
                      Participant
                    </TableHead>

                    <TableHead>
                      Event
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Sent
                    </TableHead>

                    <TableHead>
                      Response
                    </TableHead>

                    <TableHead>
                      Action
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvitations.map(
                    (invitation) => (
                      <InvitationRow
                        key={invitation.id}
                        invitation={invitation}
                        onStatusUpdate={
                          handleStatusUpdate
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
              {filteredInvitations.map(
                (invitation) => (
                  <MobileInvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onStatusUpdate={
                      handleStatusUpdate
                    }
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Invitation Row
--------------------------------- */

const InvitationRow = ({
  invitation,
  onStatusUpdate,
}) => {
  const config =
    STATUS_CONFIG[
      invitation.status
    ] || STATUS_CONFIG.pending;

  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="px-5 py-4">
        <div>
          <p className="text-[8px] font-bold text-slate-800 dark:text-white">
            {invitation.participantName}
          </p>

          <p className="mt-1 text-[6px] text-slate-400">
            {invitation.email}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="max-w-36 text-[7px] font-semibold text-slate-600 dark:text-slate-300">
          {invitation.eventName}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={invitation.status}
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1 text-[7px] text-slate-500 dark:text-slate-400">
          <CalendarDays size={10} />
          {formatDate(
            invitation.sentAt
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-[7px] text-slate-500 dark:text-slate-400">
          {formatDate(
            invitation.respondedAt
          )}
        </span>
      </td>

      <td className="px-5 py-4">
        {invitation.status ===
          "pending" && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() =>
                onStatusUpdate(
                  invitation,
                  "accepted"
                )
              }
              className="rounded-lg p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
              title="Mark accepted"
            >
              <CheckCircle2 size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                onStatusUpdate(
                  invitation,
                  "declined"
                )
              }
              className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
              title="Mark declined"
            >
              <XCircle size={13} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

/* --------------------------------
   Mobile Card
--------------------------------- */

const MobileInvitationCard = ({
  invitation,
  onStatusUpdate,
}) => {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            {invitation.participantName}
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            {invitation.email}
          </p>
        </div>

        <StatusBadge
          status={invitation.status}
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
          {invitation.eventName}
        </p>

        <div className="mt-2 flex flex-wrap gap-3 text-[6px] text-slate-400">
          <span>
            Sent:{" "}
            {formatDate(
              invitation.sentAt
            )}
          </span>

          <span>
            Response:{" "}
            {formatDate(
              invitation.respondedAt
            )}
          </span>
        </div>
      </div>

      {invitation.status ===
        "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              onStatusUpdate(
                invitation,
                "accepted"
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-[7px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400"
          >
            <CheckCircle2 size={12} />
            Accepted
          </button>

          <button
            type="button"
            onClick={() =>
              onStatusUpdate(
                invitation,
                "declined"
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[7px] font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400"
          >
            <XCircle size={12} />
            Declined
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[6px] font-bold ${config.classes}`}
    >
      <Icon size={10} />

      {config.label}
    </span>
  );
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  label,
  value,
  icon: Icon,
  type = "neutral",
}) => {
  const iconClasses = {
    neutral:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
    success:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
    danger:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClasses[type]}`}
      >
        <Icon size={14} />
      </div>

      <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Filter Select
--------------------------------- */

const FilterSelect = ({
  value,
  onChange,
  options,
}) => {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

/* --------------------------------
   Table Head
--------------------------------- */

const TableHead = ({
  children,
}) => {
  return (
    <th className="px-5 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="p-12 text-center">
      <Mail
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No invitations found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filter settings.
      </p>
    </div>
  );
};

export default ParticipantInvitationTracking;