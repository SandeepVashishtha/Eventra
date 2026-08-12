import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  History,
  Loader2,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventRegistrationHistoryExport = ({
  registrations = [],
  onExport,
  className = "",
}) => {
  const [isExporting, setIsExporting] =
    useState(false);

  const [exportType, setExportType] =
    useState("");

  const [error, setError] =
    useState("");

  const summary = useMemo(() => {
    return {
      total: registrations.length,
      attended: registrations.filter(
        (item) =>
          String(
            item.attendanceStatus || ""
          ).toLowerCase() === "attended"
      ).length,
      certificates: registrations.filter(
        (item) =>
          String(
            item.certificateStatus || ""
          ).toLowerCase() === "issued"
      ).length,
    };
  }, [registrations]);

  const handleExport = async (type) => {
    if (!registrations.length) {
      setError(
        "There is no registration history to export."
      );
      return;
    }

    setError("");
    setExportType(type);
    setIsExporting(true);

    try {
      if (onExport) {
        await onExport(
          type,
          registrations
        );
        return;
      }

      if (type === "csv") {
        exportCSV(registrations);
      }

      if (type === "pdf") {
        exportPDF(registrations);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to export registration history."
      );
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participation History
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration History
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Download your personal event participation
              record.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Total Events
          </p>

          <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
            {summary.total}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<History size={15} />}
          label="Registrations"
          value={summary.total}
        />

        <SummaryCard
          icon={<UserCheck size={15} />}
          label="Attended"
          value={summary.attended}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Certificates"
          value={summary.certificates}
        />
      </div>

      {/* Export buttons */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            Export Your History
          </p>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            Choose a format to download your event
            participation history.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ExportButton
            type="csv"
            icon={<Download size={16} />}
            title="Export CSV"
            description="Spreadsheet-friendly format"
            isExporting={
              isExporting &&
              exportType === "csv"
            }
            disabled={isExporting}
            onClick={() =>
              handleExport("csv")
            }
          />

          <ExportButton
            type="pdf"
            icon={<FileText size={16} />}
            title="Export PDF"
            description="Printable participation record"
            isExporting={
              isExporting &&
              exportType === "pdf"
            }
            disabled={isExporting}
            onClick={() =>
              handleExport("pdf")
            }
          />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <X
              size={13}
              className="mt-0.5 shrink-0"
            />

            <p className="text-[8px] font-semibold">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* History preview */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              History Preview
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Information included in your export.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {registrations.length} records
          </span>
        </div>

        {registrations.length > 0 ? (
          <div className="mt-4 space-y-3">
            {registrations.map(
              (registration, index) => (
                <HistoryRow
                  key={
                    registration.id ||
                    registration.registrationId ||
                    index
                  }
                  registration={
                    registration
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptyHistory />
        )}
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      {icon}
    </div>

    <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const ExportButton = ({
  icon,
  title,
  description,
  isExporting,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-900/50 dark:hover:bg-indigo-900/10"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
      {isExporting ? (
        <Loader2
          size={17}
          className="animate-spin"
        />
      ) : (
        icon
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-bold text-slate-800 dark:text-white">
        {isExporting
          ? "Exporting..."
          : title}
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        {description}
      </p>
    </div>
  </button>
);

const HistoryRow = ({
  registration,
}) => {
  const registrationStatus =
    registration.registrationStatus ||
    registration.status ||
    "Registered";

  const attendanceStatus =
    registration.attendanceStatus ||
    "Not marked";

  const certificateStatus =
    registration.certificateStatus ||
    "Not issued";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Calendar size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[9px] font-bold text-slate-800 dark:text-white">
            {registration.eventName ||
              registration.event?.name ||
              registration.event?.title ||
              "Untitled Event"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Info
              label="Registered"
              value={formatDate(
                registration.registrationDate
              )}
            />

            <Info
              label="Event"
              value={formatDate(
                registration.eventDate
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatusBadge
            label="Registration"
            value={
              registrationStatus
            }
          />

          <StatusBadge
            label="Attendance"
            value={
              attendanceStatus
            }
          />

          <StatusBadge
            label="Certificate"
            value={
              certificateStatus
            }
          />
        </div>
      </div>
    </div>
  );
};

const Info = ({
  label,
  value,
}) => (
  <span className="text-[7px] text-slate-400">
    <span className="font-bold">
      {label}:
    </span>{" "}
    {value || "N/A"}
  </span>
);

const StatusBadge = ({
  label,
  value,
}) => {
  const normalized =
    String(value)
      .toLowerCase();

  const positive =
    normalized.includes(
      "attended"
    ) ||
    normalized.includes(
      "confirmed"
    ) ||
    normalized.includes(
      "completed"
    ) ||
    normalized.includes(
      "issued"
    ) ||
    normalized.includes(
      "verified"
    );

  const negative =
    normalized.includes(
      "cancelled"
    ) ||
    normalized.includes(
      "rejected"
    );

  const classes = positive
    ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
    : negative
      ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

  return (
    <div
      className={`rounded-xl px-3 py-2 ${classes}`}
    >
      <p className="text-[6px] font-bold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-1 text-[7px] font-bold">
        {value}
      </p>
    </div>
  );
};

const EmptyHistory = () => (
  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
      <History size={20} />
    </div>

    <h3 className="mt-4 text-[10px] font-bold text-slate-700 dark:text-slate-200">
      No registration history
    </h3>

    <p className="mx-auto mt-1 max-w-sm text-[8px] leading-4 text-slate-400">
      Your event participation history will appear here
      after you register for events.
    </p>
  </div>
);

const formatDate = (
  value
) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* ---------------- CSV EXPORT ---------------- */

const exportCSV = (
  registrations
) => {
  const headers = [
    "Event Name",
    "Registration Date",
    "Event Date",
    "Registration Status",
    "Attendance Status",
    "Certificate Status",
  ];

  const rows = registrations.map(
    (registration) => [
      registration.eventName ||
        registration.event?.name ||
        registration.event?.title ||
        "",

      formatDate(
        registration.registrationDate
      ),

      formatDate(
        registration.eventDate
      ),

      registration.registrationStatus ||
        registration.status ||
        "Registered",

      registration.attendanceStatus ||
        "Not marked",

      registration.certificateStatus ||
        "Not issued",
    ]
  );

  const csv = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) =>
          escapeCSV(value)
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  downloadBlob(
    blob,
    "event-registration-history.csv"
  );
};

const escapeCSV = (
  value
) => {
  const stringValue =
    String(value ?? "");

  if (
    /[",\n]/.test(
      stringValue
    )
  ) {
    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  }

  return stringValue;
};

/* ---------------- PDF EXPORT ---------------- */

const exportPDF = (
  registrations
) => {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

  if (!printWindow) {
    throw new Error(
      "Please allow pop-ups to generate the PDF."
    );
  }

  const rows = registrations
    .map(
      (registration) => `
        <tr>
          <td>
            ${escapeHTML(
              registration.eventName ||
                registration.event?.name ||
                registration.event?.title ||
                "Untitled Event"
            )}
          </td>
          <td>
            ${escapeHTML(
              formatDate(
                registration.registrationDate
              )
            )}
          </td>
          <td>
            ${escapeHTML(
              formatDate(
                registration.eventDate
              )
            )}
          </td>
          <td>
            ${escapeHTML(
              registration.registrationStatus ||
                registration.status ||
                "Registered"
            )}
          </td>
          <td>
            ${escapeHTML(
              registration.attendanceStatus ||
                "Not marked"
            )}
          </td>
          <td>
            ${escapeHTML(
              registration.certificateStatus ||
                "Not issued"
            )}
          </td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Event Registration History</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1e293b;
          }

          h1 {
            margin-bottom: 5px;
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
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }

          th {
            background: #f1f5f9;
            font-weight: bold;
          }

          .footer {
            margin-top: 30px;
            font-size: 11px;
            color: #94a3b8;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>
        <h1>Event Registration History</h1>

        <p>
          Personal event participation record
        </p>

        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Registration Date</th>
              <th>Event Date</th>
              <th>Registration Status</th>
              <th>Attendance Status</th>
              <th>Certificate Status</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);
};

const escapeHTML = (
  value
) =>
  String(value ?? "")
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

const downloadBlob = (
  blob,
  filename
) => {
  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
};

export default EventRegistrationHistoryExport;