import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  QrCode,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: "session-001",
    title: "Opening Keynote",
    speaker: "Event Organizer",
    startTime: "09:00",
    endTime: "10:00",
    date: "2026-08-20",
  },
  {
    id: "session-002",
    title: "AI & Machine Learning",
    speaker: "Dr. Ananya Shah",
    startTime: "10:15",
    endTime: "11:30",
    date: "2026-08-20",
  },
  {
    id: "session-003",
    title: "Building Modern Web Apps",
    speaker: "Rahul Mehta",
    startTime: "11:45",
    endTime: "13:00",
    date: "2026-08-20",
  },
];

const DEFAULT_PARTICIPANTS = [
  {
    id: "REG-1001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
  },
  {
    id: "REG-1002",
    name: "Priya Patel",
    email: "priya@example.com",
  },
  {
    id: "REG-1003",
    name: "Rahul Joshi",
    email: "rahul@example.com",
  },
  {
    id: "REG-1004",
    name: "Neha Shah",
    email: "neha@example.com",
  },
];

const createAttendance = (
  sessions,
  participants
) => {
  const result = {};

  sessions.forEach((session) => {
    result[session.id] = {};

    participants.forEach(
      (participant) => {
        result[session.id][
          participant.id
        ] = {
          status: "Absent",
          checkInTime: null,
          method: null,
        };
      }
    );
  });

  return result;
};

const EventSessionAttendanceTracking = ({
  eventId = "event-14260",
  eventTitle = "AI & ML Hackathon",
  sessions = DEFAULT_SESSIONS,
  participants = DEFAULT_PARTICIPANTS,
  initialAttendance,
  onAttendanceChange,
  onCheckIn,
  onExport,
}) => {
  const [attendance, setAttendance] =
    useState(
      initialAttendance ||
        createAttendance(
          sessions,
          participants
        )
    );

  const [selectedSession, setSelectedSession] =
    useState(
      sessions[0]?.id || ""
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [showQR, setShowQR] =
    useState(false);

  const session =
    sessions.find(
      (item) =>
        item.id === selectedSession
    ) || sessions[0];

  const records =
    attendance[
      session?.id
    ] || {};

  const filteredParticipants =
    useMemo(() => {
      return participants.filter(
        (participant) => {
          const record =
            records[participant.id];

          const query =
            search.toLowerCase();

          const matchesSearch =
            participant.name
              .toLowerCase()
              .includes(query) ||
            participant.email
              .toLowerCase()
              .includes(query) ||
            participant.id
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "All" ||
            record?.status === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      participants,
      records,
      search,
      filter,
    ]);

  const getStats = (sessionId) => {
    const sessionRecords =
      attendance[sessionId] || {};

    const total =
      participants.length;

    const present =
      participants.filter(
        (participant) =>
          sessionRecords[
            participant.id
          ]?.status === "Present"
      ).length;

    const absent = total - present;

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (present / total) * 100
          );

    return {
      total,
      present,
      absent,
      percentage,
    };
  };

  const currentStats =
    getStats(session?.id);

  const updateAttendance = async (
    participantId,
    status,
    method = "Manual"
  ) => {
    if (!session) return;

    const previous =
      attendance[session.id]?.[
        participantId
      ];

    const record = {
      status,
      method,
      checkInTime:
        status === "Present"
          ? previous?.checkInTime ||
            new Date().toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : null,
    };

    setAttendance((current) => ({
      ...current,
      [session.id]: {
        ...(current[session.id] || {}),
        [participantId]: record,
      },
    }));

    const payload = {
      eventId,
      eventTitle,
      sessionId: session.id,
      participantId,
      status,
      method,
      record,
    };

    await onAttendanceChange?.(
      payload
    );

    if (status === "Present") {
      await onCheckIn?.(payload);
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "Registration ID",
        "Participant",
        "Email",
        "Session",
        "Date",
        "Status",
        "Check-in Time",
        "Method",
      ],
    ];

    sessions.forEach((currentSession) => {
      participants.forEach(
        (participant) => {
          const record =
            attendance[
              currentSession.id
            ]?.[participant.id] || {};

          rows.push([
            participant.id,
            participant.name,
            participant.email,
            currentSession.title,
            currentSession.date,
            record.status || "Absent",
            record.checkInTime || "",
            record.method || "",
          ]);
        }
      );
    });

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "event-session-attendance.csv";

    link.click();

    URL.revokeObjectURL(url);

    onExport?.({
      eventId,
      eventTitle,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Attendance Tracking
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track attendance for every individual event session.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-indigo-700"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={15} />}
          label="Participants"
          value={participants.length}
        />

        <StatCard
          icon={<CheckCircle2 size={15} />}
          label="Present"
          value={currentStats.present}
        />

        <StatCard
          icon={<XCircle size={15} />}
          label="Absent"
          value={currentStats.absent}
        />

        <StatCard
          icon={<BarChart3 size={15} />}
          label="Attendance"
          value={`${currentStats.percentage}%`}
        />
      </div>

      {/* Sessions */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Calendar
            size={14}
            className="text-indigo-600"
          />

          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Event Sessions
          </h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((item) => {
            const stats =
              getStats(item.id);

            const active =
              item.id ===
              selectedSession;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedSession(
                    item.id
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  {item.title}
                </h4>

                <p className="mt-1 text-[8px] text-slate-400">
                  {item.date} ·{" "}
                  {item.startTime} -{" "}
                  {item.endTime}
                </p>

                <p className="mt-1 text-[8px] text-slate-400">
                  {item.speaker}
                </p>

                <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{
                      width: `${stats.percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.present}/
                  {stats.total} present ·{" "}
                  {stats.percentage}%
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected session */}
      {session && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {session.title}
              </h3>

              <p className="mt-1 text-[8px] text-slate-400">
                {session.date} ·{" "}
                {session.startTime} -{" "}
                {session.endTime}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowQR(true)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[9px] font-bold text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              <QrCode size={14} />
              QR Check-in
            </button>
          </div>

          {/* Search */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search participant..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[9px] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="All">
                All
              </option>

              <option value="Present">
                Present
              </option>

              <option value="Absent">
                Absent
              </option>
            </select>
          </div>

          {/* Attendance table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <TableHeader>
                    Participant
                  </TableHeader>

                  <TableHeader>
                    Registration ID
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader>
                    Check-in Time
                  </TableHeader>

                  <TableHeader>
                    Method
                  </TableHeader>

                  <TableHeader>
                    Action
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.map(
                  (participant) => {
                    const record =
                      records[
                        participant.id
                      ] || {
                        status:
                          "Absent",
                      };

                    const isPresent =
                      record.status ===
                      "Present";

                    return (
                      <tr
                        key={
                          participant.id
                        }
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="px-3 py-3">
                          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                            {participant.name}
                          </p>

                          <p className="text-[7px] text-slate-400">
                            {participant.email}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-[8px] text-slate-500">
                          {participant.id}
                        </td>

                        <td className="px-3 py-3">
                          <StatusBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        <td className="px-3 py-3 text-[8px] text-slate-500">
                          {record.checkInTime ||
                            "—"}
                        </td>

                        <td className="px-3 py-3 text-[8px] text-slate-500">
                          {record.method ||
                            "—"}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={
                                isPresent
                              }
                              onClick={() =>
                                updateAttendance(
                                  participant.id,
                                  "Present",
                                  "Manual"
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 disabled:opacity-40 dark:bg-green-900/20 dark:text-green-400"
                              title="Mark Present"
                            >
                              <Check
                                size={12}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                !isPresent
                              }
                              onClick={() =>
                                updateAttendance(
                                  participant.id,
                                  "Absent",
                                  "Manual"
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 disabled:opacity-40 dark:bg-red-900/20 dark:text-red-400"
                              title="Mark Absent"
                            >
                              <X
                                size={12}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {filteredParticipants.length ===
            0 && (
            <div className="py-8 text-center text-[9px] text-slate-400">
              No participants found.
            </div>
          )}
        </div>
      )}

      {/* QR modal */}
      {showQR && session && (
        <QRModal
          session={session}
          participants={
            participants
          }
          records={records}
          onClose={() =>
            setShowQR(false)
          }
          onCheckIn={(participantId) => {
            updateAttendance(
              participantId,
              "Present",
              "QR Check-in"
            );

            setShowQR(false);
          }}
        />
      )}
    </section>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const TableHeader = ({
  children,
}) => (
  <th className="px-3 py-3 text-left text-[7px] font-bold uppercase tracking-wide text-slate-400">
    {children}
  </th>
);

const StatusBadge = ({
  status,
}) => {
  const present =
    status === "Present";

  return (
    <span
      className={`rounded-full px-2 py-1 text-[7px] font-bold ${
        present
          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );
};

const QRModal = ({
  session,
  participants,
  records,
  onClose,
  onCheckIn,
}) => {
  const [registrationId, setRegistrationId] =
    useState("");

  const [error, setError] =
    useState("");

  const submit = (event) => {
    event.preventDefault();

    const id =
      registrationId
        .trim()
        .toUpperCase();

    const participant =
      participants.find(
        (item) =>
          item.id.toUpperCase() === id
      );

    if (!participant) {
      setError(
        "Registration ID not found."
      );
      return;
    }

    if (
      records[participant.id]
        ?.status === "Present"
    ) {
      setError(
        "Participant is already checked in."
      );
      return;
    }

    onCheckIn(participant.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              QR Session Check-in
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              {session.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-5 flex justify-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
          <QrCode
            size={120}
            strokeWidth={1}
            className="text-slate-700 dark:text-slate-200"
          />
        </div>

        <p className="mt-4 text-center text-[8px] text-slate-400">
          Enter the participant's registration ID to simulate a QR scan.
        </p>

        <form
          onSubmit={submit}
          className="mt-4"
        >
          <input
            value={registrationId}
            onChange={(event) =>
              setRegistrationId(
                event.target.value
              )
            }
            placeholder="REG-1001"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          {error && (
            <p className="mt-2 text-[8px] text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-indigo-700"
          >
            Check In
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventSessionAttendanceTracking;