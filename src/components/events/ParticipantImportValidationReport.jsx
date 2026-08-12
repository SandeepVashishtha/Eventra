import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileWarning,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_CONFIG = {
  valid: {
    label: "Valid",
    icon: CheckCircle2,
    classes:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  duplicate: {
    label: "Duplicate",
    icon: RefreshCw,
    classes:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  missing: {
    label: "Missing Fields",
    icon: FileWarning,
    classes:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
  },
  invalid_email: {
    label: "Invalid Email",
    icon: XCircle,
    classes:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
  invalid_data: {
    label: "Invalid Data",
    icon: AlertCircle,
    classes:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
};

const ParticipantImportValidationReport = ({
  records = [],
  requiredFields = ["name", "email"],
  onConfirmImport,
  className = "",
}) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] =
    useState(false);

  const validatedRecords = useMemo(() => {
    return records.map((record, index) => ({
      ...record,
      rowNumber:
        record.rowNumber || index + 2,
      validation: validateRecord(
        record,
        records,
        requiredFields
      ),
    }));
  }, [records, requiredFields]);

  const summary = useMemo(() => {
    return {
      total: validatedRecords.length,
      valid: validatedRecords.filter(
        (item) =>
          item.validation.status === "valid"
      ).length,
      duplicate: validatedRecords.filter(
        (item) =>
          item.validation.status ===
          "duplicate"
      ).length,
      missing: validatedRecords.filter(
        (item) =>
          item.validation.status ===
          "missing"
      ).length,
      invalidEmail:
        validatedRecords.filter(
          (item) =>
            item.validation.status ===
            "invalid_email"
        ).length,
      invalidData:
        validatedRecords.filter(
          (item) =>
            item.validation.status ===
            "invalid_data"
        ).length,
    };
  }, [validatedRecords]);

  const filteredRecords = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return validatedRecords.filter(
      (record) => {
        const matchesFilter =
          filter === "all" ||
          record.validation.status ===
            filter;

        const matchesSearch =
          !query ||
          String(record.name || "")
            .toLowerCase()
            .includes(query) ||
          String(record.email || "")
            .toLowerCase()
            .includes(query) ||
          String(record.registrationId || "")
            .toLowerCase()
            .includes(query);

        return (
          matchesFilter &&
          matchesSearch
        );
      }
    );
  }, [
    validatedRecords,
    filter,
    search,
  ]);

  const handleDownload = () => {
    setDownloading(true);

    try {
      const csv = createValidationCsv(
        validatedRecords
      );

      downloadCsv(
        csv,
        "participant-validation-report.csv"
      );
    } finally {
      setTimeout(
        () => setDownloading(false),
        300
      );
    }
  };

  const handleConfirmImport = () => {
    const validRecords =
      validatedRecords
        .filter(
          (record) =>
            record.validation.status ===
            "valid"
        )
        .map(
          (record) => record
        );

    onConfirmImport?.(validRecords);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Participant Import
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Validation Report
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
            Review imported participant records before
            confirming the bulk import.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!validatedRecords.length}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Download size={14} />

          {downloading
            ? "Preparing..."
            : "Download Report"}
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard
          label="Total"
          value={summary.total}
          type="neutral"
        />

        <SummaryCard
          label="Valid"
          value={summary.valid}
          type="success"
        />

        <SummaryCard
          label="Duplicates"
          value={summary.duplicate}
          type="warning"
        />

        <SummaryCard
          label="Missing"
          value={summary.missing}
          type="warning"
        />

        <SummaryCard
          label="Invalid Email"
          value={summary.invalidEmail}
          type="danger"
        />

        <SummaryCard
          label="Invalid Data"
          value={summary.invalidData}
          type="danger"
        />
      </div>

      {/* Import Safety Message */}
      {summary.valid < summary.total && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
              Some records will be skipped
            </p>

            <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
              Only {summary.valid} valid record
              {summary.valid !== 1
                ? "s are"
                : " is"}{" "}
              ready for import. Invalid, duplicate, or
              incomplete records should be reviewed first.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email, or registration ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white lg:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={filter === "valid"}
              onClick={() =>
                setFilter("valid")
              }
            >
              Valid
            </FilterButton>

            <FilterButton
              active={
                filter === "duplicate"
              }
              onClick={() =>
                setFilter("duplicate")
              }
            >
              Duplicates
            </FilterButton>

            <FilterButton
              active={
                filter === "missing"
              }
              onClick={() =>
                setFilter("missing")
              }
            >
              Missing
            </FilterButton>

            <FilterButton
              active={
                filter === "invalid_email"
              }
              onClick={() =>
                setFilter("invalid_email")
              }
            >
              Invalid Email
            </FilterButton>

            <FilterButton
              active={
                filter === "invalid_data"
              }
              onClick={() =>
                setFilter("invalid_data")
              }
            >
              Invalid Data
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Validation Results
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Rows that are invalid will not be imported.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {filteredRecords.length} rows
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {filteredRecords.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Row
                    </th>

                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Participant
                    </th>

                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Email
                    </th>

                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Registration ID
                    </th>

                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Validation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
                    (record) => (
                      <ValidationRow
                        key={`${record.rowNumber}-${record.email}`}
                        record={record}
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-semibold text-slate-500 dark:text-slate-400">
            {summary.valid} valid record
            {summary.valid !== 1
              ? "s"
              : ""}{" "}
            will be imported.
          </p>
        </div>

        <button
          type="button"
          disabled={summary.valid === 0}
          onClick={handleConfirmImport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          Confirm Import
        </button>
      </div>
    </section>
  );
};

/* --------------------------------
   Validation Row
--------------------------------- */

const ValidationRow = ({
  record,
}) => {
  const config =
    STATUS_CONFIG[
      record.validation.status
    ] || STATUS_CONFIG.invalid_data;

  const Icon = config.icon;

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="px-4 py-4 text-[8px] font-bold text-slate-500 dark:text-slate-400">
        #{record.rowNumber}
      </td>

      <td className="px-4 py-4">
        <p className="text-[8px] font-bold text-slate-800 dark:text-white">
          {record.name || "—"}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-[8px] text-slate-500 dark:text-slate-400">
          {record.email || "—"}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-[8px] text-slate-500 dark:text-slate-400">
          {record.registrationId || "—"}
        </p>
      </td>

      <td className="px-4 py-4">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {record.registrationStatus ||
            "Pending"}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="max-w-[240px]">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[6px] font-bold ${config.classes}`}
          >
            <Icon size={11} />
            {config.label}
          </span>

          {record.validation.errors
            .length > 0 && (
            <ul className="mt-2 space-y-1">
              {record.validation.errors.map(
                (error) => (
                  <li
                    key={error}
                    className="text-[6px] leading-3 text-red-500"
                  >
                    • {error}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </td>
    </tr>
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
  const styles =
    getSummaryStyles(type);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${styles}`}
      >
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Filter Button
--------------------------------- */

const FilterButton = ({
  active,
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-[7px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="p-10 text-center">
      <FileWarning
        size={28}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No records found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing the filter or search term.
      </p>
    </div>
  );
};

/* --------------------------------
   Validation Logic
--------------------------------- */

const validateRecord = (
  record,
  records,
  requiredFields
) => {
  const errors = [];

  const missingFields =
    requiredFields.filter(
      (field) =>
        record[field] === undefined ||
        record[field] === null ||
        String(record[field]).trim() === ""
    );

  if (missingFields.length > 0) {
    errors.push(
      `Missing: ${missingFields.join(", ")}`
    );
  }

  if (
    record.email &&
    !isValidEmail(record.email)
  ) {
    errors.push(
      "Invalid email address"
    );
  }

  if (
    record.registrationStatus &&
    ![
      "pending",
      "confirmed",
      "approved",
      "cancelled",
      "completed",
    ].includes(
      String(
        record.registrationStatus
      ).toLowerCase()
    )
  ) {
    errors.push(
      "Invalid registration status"
    );
  }

  if (
    record.registrationId &&
    records.some(
      (other) =>
        other !== record &&
        other.registrationId &&
        String(
          other.registrationId
        ).trim() ===
          String(
            record.registrationId
          ).trim()
    )
  ) {
    errors.push(
      "Duplicate registration ID"
    );
  }

  if (
    record.email &&
    records.some(
      (other) =>
        other !== record &&
        other.email &&
        String(
          other.email
        ).trim().toLowerCase() ===
          String(
            record.email
          ).trim().toLowerCase()
    )
  ) {
    errors.push(
      "Duplicate email address"
    );
  }

  let status = "valid";

  if (
    errors.some((error) =>
      error.startsWith("Missing:")
    )
  ) {
    status = "missing";
  } else if (
    errors.some((error) =>
      error.includes(
        "Invalid email"
      )
    )
  ) {
    status = "invalid_email";
  } else if (
    errors.some((error) =>
      error.includes("Duplicate")
    )
  ) {
    status = "duplicate";
  } else if (
    errors.length > 0
  ) {
    status = "invalid_data";
  }

  return {
    status,
    errors,
  };
};

const isValidEmail = (
  email
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

/* --------------------------------
   CSV Report
--------------------------------- */

const createValidationCsv = (
  records
) => {
  const headers = [
    "Row",
    "Name",
    "Email",
    "Registration ID",
    "Registration Status",
    "Validation Status",
    "Errors",
  ];

  const rows = records.map(
    (record) => [
      record.rowNumber,
      record.name || "",
      record.email || "",
      record.registrationId || "",
      record.registrationStatus ||
        "",
      record.validation.status,
      record.validation.errors.join(
        "; "
      ),
    ]
  );

  return [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map(csvEscape)
        .join(",")
    )
    .join("\n");
};

const csvEscape = (
  value
) => {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(
      /"/g,
      '""'
    )}"`;
  }

  return text;
};

const downloadCsv = (
  content,
  filename
) => {
  const blob = new Blob(
    [content],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

/* --------------------------------
   Styles
--------------------------------- */

const getSummaryStyles = (
  type
) => {
  if (type === "success") {
    return "text-green-600 dark:text-green-400";
  }

  if (type === "warning") {
    return "text-amber-600 dark:text-amber-400";
  }

  if (type === "danger") {
    return "text-red-600 dark:text-red-400";
  }

  return "text-slate-800 dark:text-white";
};

export default ParticipantImportValidationReport;