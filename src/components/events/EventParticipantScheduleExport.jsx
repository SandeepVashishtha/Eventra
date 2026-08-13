import {
  Calendar,
  CalendarDays,
  Check,
  Download,
  FileText,
  MapPin,
  UserRound,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    name: "AI & Machine Learning Workshop",
    speaker: "Dr. Priya Sharma",
    start: "2026-08-22T10:00:00",
    end: "2026-08-22T11:30:00",
    venue: "Hall A",
  },
  {
    id: 2,
    name: "Modern React Development",
    speaker: "Rahul Mehta",
    start: "2026-08-22T12:00:00",
    end: "2026-08-22T13:00:00",
    venue: "Room 204",
  },
  {
    id: 3,
    name: "Data Science & Analytics",
    speaker: "Ananya Patel",
    start: "2026-08-22T14:00:00",
    end: "2026-08-22T15:30:00",
    venue: "Lab 2",
  },
];

const EventParticipantScheduleExport = ({
  sessions = DEFAULT_SESSIONS,
}) => {
  const [selectedIds, setSelectedIds] = useState(
    sessions.map((session) => session.id)
  );

  const selectedSessions = sessions.filter((session) =>
    selectedIds.includes(session.id)
  );

  const toggleSession = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === sessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sessions.map((session) => session.id));
    }
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  const formatTime = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));

  const escapeICalText = (value) =>
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");

  const toICalDate = (date) => {
    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    const seconds = String(value.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const exportICS = () => {
    if (!selectedSessions.length) return;

    const events = selectedSessions.map((session) => {
      const start = toICalDate(session.start);
      const end = toICalDate(session.end);

      return [
        "BEGIN:VEVENT",
        `UID:eventra-session-${session.id}@eventra`,
        `DTSTAMP:${toICalDate(new Date())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeICalText(session.name)}`,
        `DESCRIPTION:${escapeICalText(
          `Speaker: ${session.speaker}`
        )}`,
        `LOCATION:${escapeICalText(session.venue)}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eventra//Participant Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    downloadFile(
      calendar,
      "eventra-schedule.ics",
      "text/calendar;charset=utf-8"
    );
  };

  const exportPDF = () => {
    if (!selectedSessions.length) return;

    const rows = selectedSessions
      .map(
        (session) => `
          <tr>
            <td>${session.name}</td>
            <td>${session.speaker}</td>
            <td>
              ${formatDate(session.start)}<br />
              ${formatTime(session.start)} -
              ${formatTime(session.end)}
            </td>
            <td>${session.venue}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Eventra Schedule</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
            }

            h1 {
              margin-bottom: 6px;
            }

            p {
              color: #64748b;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 12px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #f1f5f9;
            }
          </style>
        </head>

        <body>
          <h1>Eventra Participant Schedule</h1>
          <p>
            Exported ${new Date().toLocaleDateString()}
          </p>

          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Speaker</th>
                <th>Date & Time</th>
                <th>Venue</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=700"
    );

    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const exportCalendarEvents = () => {
    selectedSessions.forEach((session) => {
      const calendarUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(session.name)}` +
        `&dates=${toICalDate(session.start)}/${toICalDate(
          session.end
        )}` +
        `&details=${encodeURIComponent(
          `Speaker: ${session.speaker}`
        )}` +
        `&location=${encodeURIComponent(session.venue)}`;

      window.open(calendarUrl, "_blank");
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarDays size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Schedule Export
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Export your personalized event schedule to a
              calendar or save it as a printable PDF.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-center dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
            Selected Sessions
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {selectedSessions.length}
          </p>
        </div>
      </div>

      {/* Select All */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-[8px] font-bold text-slate-800 dark:text-white">
            Select Sessions
          </p>

          <p className="mt-1 text-[6px] text-slate-400">
            Choose which sessions should be included in your
            export.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[6px] font-bold text-white hover:bg-indigo-700"
        >
          {selectedIds.length === sessions.length
            ? "Clear All"
            : "Select All"}
        </button>
      </div>

      {/* Sessions */}
      <div className="mt-5 space-y-3">
        {sessions.map((session) => {
          const selected = selectedIds.includes(session.id);

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => toggleSession(session.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {selected && <Check size={12} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                        {session.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-1.5">
                        <UserRound
                          size={10}
                          className="text-slate-400"
                        />

                        <span className="text-[6px] text-slate-400">
                          {session.speaker}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1.5 text-[5px] font-bold text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400">
                      {formatDate(session.start)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1 text-[6px] text-slate-500 dark:text-slate-400">
                      <Calendar size={10} />
                      {formatTime(session.start)} -{" "}
                      {formatTime(session.end)}
                    </span>

                    <span className="flex items-center gap-1 text-[6px] text-slate-500 dark:text-slate-400">
                      <MapPin size={10} />
                      {session.venue}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Export Options */}
      <div className="mt-6">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Export Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ExportCard
            icon={Calendar}
            title="ICS Calendar"
            description="Download an .ics file for calendar applications."
            button="Download .ics"
            onClick={exportICS}
            disabled={!selectedSessions.length}
          />

          <ExportCard
            icon={FileText}
            title="PDF Schedule"
            description="Create a printable schedule containing your sessions."
            button="Export PDF"
            onClick={exportPDF}
            disabled={!selectedSessions.length}
          />

          <ExportCard
            icon={CalendarDays}
            title="Calendar Events"
            description="Add each selected session to Google Calendar."
            button="Add to Calendar"
            onClick={exportCalendarEvents}
            disabled={!selectedSessions.length}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Export Preview
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              These sessions will be included in your export.
            </p>
          </div>

          <Download
            size={16}
            className="text-indigo-500"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-3 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Session
                </th>

                <th className="px-3 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Speaker
                </th>

                <th className="px-3 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Time
                </th>

                <th className="px-3 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Venue
                </th>
              </tr>
            </thead>

            <tbody>
              {selectedSessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-3 py-4 text-[7px] font-bold text-slate-700 dark:text-slate-300">
                    {session.name}
                  </td>

                  <td className="px-3 py-4 text-[7px] text-slate-500 dark:text-slate-400">
                    {session.speaker}
                  </td>

                  <td className="px-3 py-4 text-[7px] text-slate-500 dark:text-slate-400">
                    {formatDate(session.start)}
                    <br />
                    {formatTime(session.start)} -{" "}
                    {formatTime(session.end)}
                  </td>

                  <td className="px-3 py-4 text-[7px] text-slate-500 dark:text-slate-400">
                    {session.venue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!selectedSessions.length && (
          <div className="py-8 text-center">
            <CalendarDays
              size={24}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-600 dark:text-slate-300">
              No sessions selected
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Select at least one session to export your schedule.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const ExportCard = ({
  icon: Icon,
  title,
  description,
  button,
  onClick,
  disabled,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      <Icon size={17} />
    </div>

    <h4 className="mt-4 text-[9px] font-bold text-slate-800 dark:text-white">
      {title}
    </h4>

    <p className="mt-2 min-h-[32px] text-[6px] leading-4 text-slate-400">
      {description}
    </p>

    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[6px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download size={11} />
      {button}
    </button>
  </div>
);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

export default EventParticipantScheduleExport;