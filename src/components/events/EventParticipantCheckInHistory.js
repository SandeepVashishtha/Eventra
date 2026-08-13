import {
  CalendarDays,
  Check,
  Clock3,
  LogIn,
  LogOut,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  "all",
  "checked-in",
  "checked-out",
  "not-checked-in",
];

const EventParticipantCheckInHistory = ({
  records = [],
  title = "Participant Check-In History",
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [dateFilter, setDateFilter] =
    useState("");

  const normalizedRecords = useMemo(
    () =>
      Array.isArray(records)
        ? records.map(normalizeRecord)
        : [],
    [records]
  );

  const filteredRecords = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return normalizedRecords.filter(
      (record) => {
        const searchableText = [
          record.participantName,
          record.registrationId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchableText.includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          record.status === statusFilter;

        const matchesDate =
          !dateFilter ||
          getDateKey(record.checkInTime) ===
            dateFilter ||
          getDateKey(record.checkOutTime) ===
            dateFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      }
    );
  }, [
    normalizedRecords,
    search,
    statusFilter,
    dateFilter,
  ]);

  const stats = useMemo(() => {
    return normalizedRecords.reduce(
      (result, record) => {
        result.total += 1;

        if (
          record.status ===
          "checked-in"
        ) {
          result.checkedIn += 1;
        }

        if (
          record.status ===
          "checked-out"
        ) {
          result.checkedOut += 1;
        }

        if (
          record.status ===
          "not-checked-in"
        ) {
          result.notCheckedIn += 1;
        }

        return result;
      },
      {
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        notCheckedIn: 0,
      }
    );
  }, [normalizedRecords]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("");
  };

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    Boolean(dateFilter);

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Clock3
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Attendance
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Track participant arrival, departure, and
              attendance activity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex">
          <StatCard
            label="Total"
            value={stats.total}
          />

          <StatCard
            label="Checked In"
            value={stats.checkedIn}
          />

          <StatCard
            label="Checked Out"
            value={stats.checkedOut}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_170px_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search participant or registration ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold capitalize text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Filter attendance status"
        >
          {STATUS_OPTIONS.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {formatStatusLabel(
                  status
                )}
              </option>
            )
          )}
        </select>

        <div className="relative">
          <CalendarDays
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Filter by date"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Active filter summary */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-400">
          Showing{" "}
          <span className="text-slate-600 dark:text-slate-300">
            {filteredRecords.length}
          </span>{" "}
          of{" "}
          <span className="text-slate-600 dark:text-slate-300">
            {normalizedRecords.length}
          </span>{" "}
          records
        </p>

        {dateFilter && (
          <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
            Date: {formatDate(dateFilter)}
          </p>
        )}
      </div>

      {/* Records */}
      <div className="mt-4">
        {filteredRecords.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {/* Desktop heading */}
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_140px] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 lg:grid dark:border-slate-800 dark:bg-slate-950">
              <TableHeading>
                Participant
              </TableHeading>

              <TableHeading>
                Registration ID
              </TableHeading>

              <TableHeading>
                Check-In
              </TableHeading>

              <TableHeading>
                Check-Out
              </TableHeading>

              <TableHeading>
                Status
              </TableHeading>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map(
                (record, index) => (
                  <CheckInRecord
                    key={
                      record.id ||
                      `${record.registrationId}-${index}`
                    }
                    record={record}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ----------------------------------
   Record
----------------------------------- */

const CheckInRecord = ({
  record,
}) => {
  return (
    <div className="px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
      {/* Desktop */}
      <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_140px] items-center gap-4 lg:grid">
        <ParticipantInfo
          record={record}
        />

        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {record.registrationId ||
              "—"}
          </p>
        </div>

        <TimeCell
          time={
            record.checkInTime
          }
          icon={
            <LogIn size={12} />
          }
        />

        <TimeCell
          time={
            record.checkOutTime
          }
          icon={
            <LogOut size={12} />
          }
        />

        <div>
          <StatusBadge
            status={
              record.status
            }
          />

          {record.durationMinutes >
            0 && (
            <p className="mt-1 text-[9px] text-slate-400">
              {formatDuration(
                record.durationMinutes
              )}
            </p>
          )}
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="lg:hidden">
        <div className="flex items-start gap-3">
          <Avatar
            name={
              record.participantName
            }
            image={
              record.avatar
            }
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {
                  record.participantName
                }
              </h3>

              <StatusBadge
                status={
                  record.status
                }
              />
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              Registration ID:{" "}
              <span className="font-semibold text-slate-500 dark:text-slate-300">
                {record.registrationId ||
                  "—"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <MobileTimeCard
            label="Check-In"
            value={
              record.checkInTime
            }
            icon={
              <LogIn size={13} />
            }
          />

          <MobileTimeCard
            label="Check-Out"
            value={
              record.checkOutTime
            }
            icon={
              <LogOut size={13} />
            }
          />

          <MobileTimeCard
            label="Duration"
            value={
              record.durationMinutes
                ? formatDuration(
                    record.durationMinutes
                  )
                : "—"
            }
            icon={
              <Clock3
                size={13}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Participant info
----------------------------------- */

const ParticipantInfo = ({
  record,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        name={
          record.participantName
        }
        image={
          record.avatar
        }
      />

      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
          {record.participantName}
        </p>

        {record.email && (
          <p className="mt-0.5 truncate text-[9px] text-slate-400">
            {record.email}
          </p>
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   Time cell
----------------------------------- */

const TimeCell = ({
  time,
  icon,
}) => {
  if (!time) {
    return (
      <span className="text-[10px] text-slate-400">
        Not recorded
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
      <span className="text-indigo-500">
        {icon}
      </span>

      {formatDateTime(time)}
    </div>
  );
};

/* ----------------------------------
   Mobile time card
----------------------------------- */

const MobileTimeCard = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        {value
          ? formatDateTime(value)
          : "Not recorded"}
      </p>
    </div>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config = {
    "checked-in": {
      label: "Checked In",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      icon: <LogIn size={10} />,
    },

    "checked-out": {
      label: "Checked Out",
      className:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      icon: <LogOut size={10} />,
    },

    "not-checked-in": {
      label: "Not Checked In",
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      icon: <Clock3 size={10} />,
    },
  };

  const current =
    config[status] ||
    config["not-checked-in"];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${current.className}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
};

/* ----------------------------------
   Stat card
----------------------------------- */

const StatCard = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-[76px] rounded-xl bg-white px-3 py-2 text-center shadow-sm dark:bg-slate-900">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Table heading
----------------------------------- */

const TableHeading = ({
  children,
}) => {
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
};

/* ----------------------------------
   Avatar
----------------------------------- */

const Avatar = ({
  name,
  image,
}) => {
  if (image) {
    return (
      <img
        src={image}
        alt={`${name} profile`}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
    );
  }

  const initials = String(
    name || "Participant"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ||
        ""
    )
    .join("");

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {initials || "P"}
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  hasFilters,
  onClear,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <UserRound
        size={28}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
        {hasFilters
          ? "No matching records"
          : "No check-in records"}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {hasFilters
          ? "Try changing your search or attendance filters."
          : "Participant check-in activity will appear here when records are available."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

/* ----------------------------------
   Normalize record
----------------------------------- */

const normalizeRecord = (
  record = {}
) => {
  const checkInTime =
    record.checkInTime ||
    record.checkedInAt ||
    record.checkIn ||
    null;

  const checkOutTime =
    record.checkOutTime ||
    record.checkedOutAt ||
    record.checkOut ||
    null;

  let status =
    String(
      record.status ||
        record.attendanceStatus ||
        ""
    ).toLowerCase();

  if (
    status !==
      "checked-in" &&
    status !==
      "checked-out" &&
    status !==
      "not-checked-in"
  ) {
    if (checkOutTime) {
      status = "checked-out";
    } else if (checkInTime) {
      status = "checked-in";
    } else {
      status = "not-checked-in";
    }
  }

  const participant =
    record.participant ||
    record.user ||
    {};

  const participantName =
    participant.name ||
    [
      participant.firstName,
      participant.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    record.participantName ||
    record.name ||
    "Event Participant";

  const email =
    participant.email ||
    record.email ||
    "";

  const registrationId =
    record.registrationId ||
    record.registrationID ||
    record.registration_id ||
    record.id ||
    "—";

  const durationMinutes =
    calculateDuration(
      checkInTime,
      checkOutTime
    );

  return {
    ...record,
    id:
      record.id ||
      record.registrationId ||
      registrationId,
    participantName,
    email,
    registrationId,
    checkInTime,
    checkOutTime,
    status,
    durationMinutes,
    avatar:
      participant.avatar ||
      participant.avatarUrl ||
      record.avatar ||
      record.avatarUrl ||
      "",
  };
};

/* ----------------------------------
   Duration
----------------------------------- */

const calculateDuration = (
  start,
  end
) => {
  if (!start || !end) {
    return 0;
  }

  const startDate =
    new Date(start);

  const endDate =
    new Date(end);

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    return 0;
  }

  const difference =
    endDate.getTime() -
    startDate.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.round(
    difference / 60000
  );
};

/* ----------------------------------
   Formatting helpers
----------------------------------- */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not recorded";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
};

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
};

const getDateKey = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatStatusLabel = (
  status
) => {
  if (status === "all") {
    return "All Statuses";
  }

  if (status === "checked-in") {
    return "Checked In";
  }

  if (status === "checked-out") {
    return "Checked Out";
  }

  return "Not Checked In";
};

const formatDuration = (
  minutes
) => {
  if (!minutes || minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remaining =
    minutes % 60;

  if (hours === 0) {
    return `${remaining}m`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};

export default EventParticipantCheckInHistory;