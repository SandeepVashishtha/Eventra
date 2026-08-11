import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    registrationStatus: "Registered",
    attendanceStatus: "Attended",
    team: "Team Alpha",
    registrationDate: "2026-08-01",
    category: "Student",
    eligibilityStatus: "Eligible",
  },
  {
    id: "P002",
    name: "Priya Patel",
    email: "priya@example.com",
    registrationStatus: "Registered",
    attendanceStatus: "Not Attended",
    team: "Team Beta",
    registrationDate: "2026-08-03",
    category: "Student",
    eligibilityStatus: "Eligible",
  },
  {
    id: "P003",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    registrationStatus: "Pending",
    attendanceStatus: "Not Attended",
    team: "Unassigned",
    registrationDate: "2026-08-05",
    category: "Professional",
    eligibilityStatus: "Pending",
  },
  {
    id: "P004",
    name: "Neha Shah",
    email: "neha@example.com",
    registrationStatus: "Registered",
    attendanceStatus: "Attended",
    team: "Team Alpha",
    registrationDate: "2026-08-06",
    category: "Professional",
    eligibilityStatus: "Eligible",
  },
  {
    id: "P005",
    name: "Karan Joshi",
    email: "karan@example.com",
    registrationStatus: "Rejected",
    attendanceStatus: "Not Attended",
    team: "Unassigned",
    registrationDate: "2026-08-07",
    category: "Student",
    eligibilityStatus: "Not Eligible",
  },
];

const EventParticipantExportFilters = ({
  participants = DEFAULT_PARTICIPANTS,
  eventName = "Event Participant Report",
  onExport,
  className = "",
}) => {
  const [registrationStatus, setRegistrationStatus] =
    useState("All");

  const [attendanceStatus, setAttendanceStatus] =
    useState("All");

  const [team, setTeam] =
    useState("All");

  const [category, setCategory] =
    useState("All");

  const [eligibilityStatus, setEligibilityStatus] =
    useState("All");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const teams = useMemo(
    () => [
      "All",
      ...unique(
        participants.map(
          (participant) =>
            participant.team
        )
      ),
    ],
    [participants]
  );

  const categories = useMemo(
    () => [
      "All",
      ...unique(
        participants.map(
          (participant) =>
            participant.category
        )
      ),
    ],
    [participants]
  );

  const filteredParticipants = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return participants.filter(
      (participant) => {
        const matchesSearch =
          !normalizedSearch ||
          participant.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          participant.email
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          participant.id
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesRegistration =
          registrationStatus ===
            "All" ||
          participant.registrationStatus ===
            registrationStatus;

        const matchesAttendance =
          attendanceStatus ===
            "All" ||
          participant.attendanceStatus ===
            attendanceStatus;

        const matchesTeam =
          team === "All" ||
          participant.team === team;

        const matchesCategory =
          category === "All" ||
          participant.category ===
            category;

        const matchesEligibility =
          eligibilityStatus ===
            "All" ||
          participant.eligibilityStatus ===
            eligibilityStatus;

        const matchesFromDate =
          !fromDate ||
          participant.registrationDate >=
            fromDate;

        const matchesToDate =
          !toDate ||
          participant.registrationDate <=
            toDate;

        return (
          matchesSearch &&
          matchesRegistration &&
          matchesAttendance &&
          matchesTeam &&
          matchesCategory &&
          matchesEligibility &&
          matchesFromDate &&
          matchesToDate
        );
      }
    );
  }, [
    participants,
    search,
    registrationStatus,
    attendanceStatus,
    team,
    category,
    eligibilityStatus,
    fromDate,
    toDate,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (registrationStatus !== "All")
      count++;

    if (attendanceStatus !== "All")
      count++;

    if (team !== "All")
      count++;

    if (category !== "All")
      count++;

    if (eligibilityStatus !== "All")
      count++;

    if (fromDate)
      count++;

    if (toDate)
      count++;

    if (search.trim())
      count++;

    return count;
  }, [
    registrationStatus,
    attendanceStatus,
    team,
    category,
    eligibilityStatus,
    fromDate,
    toDate,
    search,
  ]);

  const resetFilters = () => {
    setRegistrationStatus("All");
    setAttendanceStatus("All");
    setTeam("All");
    setCategory("All");
    setEligibilityStatus("All");
    setFromDate("");
    setToDate("");
    setSearch("");
    setMessage("");
  };

  const handleExport = async (format) => {
    if (
      filteredParticipants.length ===
      0
    ) {
      setMessage(
        "There are no participants matching the selected filters."
      );
      return;
    }

    setExporting(true);
    setMessage("");

    const exportData =
      filteredParticipants.map(
        (participant) => ({
          ID: participant.id,
          Name: participant.name,
          Email: participant.email,
          "Registration Status":
            participant.registrationStatus,
          "Attendance Status":
            participant.attendanceStatus,
          Team: participant.team,
          "Registration Date":
            participant.registrationDate,
          Category:
            participant.category,
          "Eligibility Status":
            participant.eligibilityStatus,
        })
      );

    onExport?.({
      format,
      eventName,
      filters: {
        registrationStatus,
        attendanceStatus,
        team,
        category,
        eligibilityStatus,
        fromDate,
        toDate,
        search,
      },
      participants:
        exportData,
    });

    if (format === "CSV") {
      downloadCSV(
        exportData,
        eventName
      );
    }

    if (format === "PDF") {
      downloadPDF(
        exportData,
        eventName
      );
    }

    setMessage(
      `${filteredParticipants.length} participant${
        filteredParticipants.length ===
        1
          ? ""
          : "s"
      } exported as ${format}.`
    );

    setExporting(false);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Filter
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Export Filters
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Filter participant records before exporting targeted
              CSV or PDF reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={11} />
            {filteredParticipants.length} /{" "}
            {participants.length}
          </span>

          {activeFilterCount > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              {activeFilterCount} active
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Search Participants
        </label>

        <div className="relative">
          <Users
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
            placeholder="Search by participant name, email, or registration ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Filters
            </h3>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[8px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={10} />
            Reset
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label="Registration Status"
            value={registrationStatus}
            onChange={
              setRegistrationStatus
            }
            options={[
              "All",
              "Registered",
              "Pending",
              "Rejected",
              "Cancelled",
            ]}
          />

          <SelectField
            label="Attendance Status"
            value={attendanceStatus}
            onChange={
              setAttendanceStatus
            }
            options={[
              "All",
              "Attended",
              "Not Attended",
            ]}
          />

          <SelectField
            label="Team"
            value={team}
            onChange={setTeam}
            options={teams}
          />

          <SelectField
            label="Participant Category"
            value={category}
            onChange={setCategory}
            options={categories}
          />

          <SelectField
            label="Eligibility Status"
            value={eligibilityStatus}
            onChange={
              setEligibilityStatus
            }
            options={[
              "All",
              "Eligible",
              "Not Eligible",
              "Pending",
            ]}
          />

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              <Calendar size={11} />
              Registration Date
            </label>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-[9px] text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              />

              <input
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-[9px] text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            Export Preview
          </p>

          <p className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">
            {filteredParticipants.length} participant
            {filteredParticipants.length ===
            1
              ? ""
              : "s"}
            {" "}selected
          </p>

          <p className="mt-1 text-[9px] text-indigo-600 dark:text-indigo-400">
            Only the filtered records will be included in the
            exported report.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              exporting ||
              filteredParticipants.length ===
                0
            }
            onClick={() =>
              handleExport("CSV")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[10px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            type="button"
            disabled={
              exporting ||
              filteredParticipants.length ===
                0
            }
            onClick={() =>
              handleExport("PDF")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-[10px] font-bold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <FileText size={13} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Filtered Participants
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Preview the records that will be exported.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {filteredParticipants.length ===
          0 ? (
            <EmptyState
              onReset={resetFilters}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                    <TableHeader>
                      Participant
                    </TableHeader>

                    <TableHeader>
                      Registration
                    </TableHeader>

                    <TableHeader>
                      Attendance
                    </TableHeader>

                    <TableHeader>
                      Team
                    </TableHeader>

                    <TableHeader>
                      Category
                    </TableHeader>

                    <TableHeader>
                      Eligibility
                    </TableHeader>

                    <TableHeader>
                      Date
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredParticipants.map(
                    (participant) => (
                      <ParticipantRow
                        key={
                          participant.id
                        }
                        participant={
                          participant
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          <Check size={13} />
          {message}
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Select field
----------------------------------- */

const SelectField = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-[10px] font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

/* ----------------------------------
   Table
----------------------------------- */

const TableHeader = ({
  children,
}) => {
  return (
    <th className="px-4 py-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
};

const ParticipantRow = ({
  participant,
}) => {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
            {participant.name}
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            {participant.email}
          </p>

          <p className="mt-0.5 text-[8px] text-indigo-500">
            {participant.id}
          </p>
        </div>
      </td>

      <td className="px-4 py-3">
        <StatusBadge
          value={
            participant.registrationStatus
          }
        />
      </td>

      <td className="px-4 py-3">
        <StatusBadge
          value={
            participant.attendanceStatus
          }
        />
      </td>

      <td className="px-4 py-3 text-[9px] font-medium text-slate-600 dark:text-slate-300">
        {participant.team}
      </td>

      <td className="px-4 py-3">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {participant.category}
        </span>
      </td>

      <td className="px-4 py-3">
        <StatusBadge
          value={
            participant.eligibilityStatus
          }
        />
      </td>

      <td className="px-4 py-3 text-[9px] text-slate-500 dark:text-slate-400">
        {formatDateOnly(
          participant.registrationDate
        )}
      </td>
    </tr>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  value,
}) => {
  const styles = {
    Registered:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",

    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",

    Rejected:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",

    Cancelled:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",

    Attended:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",

    "Not Attended":
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",

    Eligible:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",

    "Not Eligible":
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-1 text-[7px] font-bold uppercase tracking-wide ${
        styles[value] ||
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {value}
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  onReset,
}) => {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Filter size={19} />
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No participants found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
        No participant records match the current search and
        filters.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
      >
        Reset Filters
      </button>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const unique = (items) => [
  ...new Set(
    items.filter(Boolean)
  ),
];

const formatDateOnly = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(date);
};

const escapeCSV = (
  value
) => {
  const stringValue =
    String(value ?? "");

  return `"${stringValue.replace(
    /"/g,
    '""'
  )}"`;
};

const downloadCSV = (
  rows,
  eventName
) => {
  if (!rows.length) {
    return;
  }

  const headers =
    Object.keys(rows[0]);

  const csv = [
    headers.map(
      escapeCSV
    ).join(","),
    ...rows.map((row) =>
      headers
        .map((header) =>
          escapeCSV(
            row[header]
          )
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download = `${sanitizeFileName(
    eventName
  )}-participants.csv`;

  document.body.appendChild(
    anchor
  );

  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

/*
 * Lightweight browser-side PDF export.
 * Creates a printable report without requiring
 * an additional PDF dependency.
 */
const downloadPDF = (
  rows,
  eventName
) => {
  if (!rows.length) {
    return;
  }

  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHTML(
            row.ID
          )}</td>
          <td>${escapeHTML(
            row.Name
          )}</td>
          <td>${escapeHTML(
            row.Email
          )}</td>
          <td>${escapeHTML(
            row[
              "Registration Status"
            ]
          )}</td>
          <td>${escapeHTML(
            row[
              "Attendance Status"
            ]
          )}</td>
          <td>${escapeHTML(
            row.Team
          )}</td>
          <td>${escapeHTML(
            row.Category
          )}</td>
          <td>${escapeHTML(
            row[
              "Eligibility Status"
            ]
          )}</td>
          <td>${escapeHTML(
            row[
              "Registration Date"
            ]
          )}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHTML(
          eventName
        )}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #1e293b;
          }

          h1 {
            margin-bottom: 6px;
          }

          p {
            color: #64748b;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th,
          td {
            border: 1px solid #cbd5e1;
            padding: 7px;
            text-align: left;
          }

          th {
            background: #f1f5f9;
          }

          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>

      <body>
        <h1>${escapeHTML(
          eventName
        )}</h1>

        <p>
          Participant Export Report —
          ${rows.length} participant${
    rows.length === 1
      ? ""
      : "s"
  }
        </p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Registration</th>
              <th>Attendance</th>
              <th>Team</th>
              <th>Category</th>
              <th>Eligibility</th>
              <th>Registration Date</th>
            </tr>
          </thead>

          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(
    html
  );
  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);
};

const escapeHTML = (
  value
) => {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};

const sanitizeFileName = (
  value
) => {
  return String(value)
    .trim()
    .replace(
      /[^a-z0-9]+/gi,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .toLowerCase();
};

export default EventParticipantExportFilters;