import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_CONFIG = {
  valid: {
    label: "Valid",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  expiring: {
    label: "Expiring Soon",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
  pending: {
    label: "Verification Pending",
    icon: ShieldCheck,
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
  },
};

const DEFAULT_DOCUMENTS = [
  {
    id: "doc-1",
    participantName: "Rahul Sharma",
    documentName: "Identity Proof",
    uploadDate: "2026-07-01",
    expirationDate: "2026-12-20",
    verificationStatus: "Verified",
  },
  {
    id: "doc-2",
    participantName: "Priya Patel",
    documentName: "Student ID",
    uploadDate: "2026-06-10",
    expirationDate: "2026-08-20",
    verificationStatus: "Verified",
  },
  {
    id: "doc-3",
    participantName: "Amit Shah",
    documentName: "Experience Certificate",
    uploadDate: "2026-05-15",
    expirationDate: "2026-08-10",
    verificationStatus: "Verified",
  },
  {
    id: "doc-4",
    participantName: "Neha Mehta",
    documentName: "Eligibility Document",
    uploadDate: "2026-08-01",
    expirationDate: null,
    verificationStatus: "Pending",
  },
];

const getDaysUntilExpiry = (expirationDate) => {
  if (!expirationDate) {
    return null;
  }

  const today = new Date();
  const expiry = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

const getDocumentStatus = (document) => {
  if (
    document.verificationStatus
      ?.toLowerCase() === "pending"
  ) {
    return "pending";
  }

  const days = getDaysUntilExpiry(
    document.expirationDate
  );

  if (days === null) {
    return "pending";
  }

  if (days < 0) {
    return "expired";
  }

  if (days <= 30) {
    return "expiring";
  }

  return "valid";
};

const formatDate = (value) => {
  if (!value) {
    return "No expiration date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const DocumentExpiryTracking = ({
  documents = DEFAULT_DOCUMENTS,
  onSendReminder,
  onDocumentUpdate,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const processedDocuments = useMemo(() => {
    return documents.map((document) => ({
      ...document,
      status: getDocumentStatus(document),
      daysUntilExpiry: getDaysUntilExpiry(
        document.expirationDate
      ),
    }));
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return processedDocuments.filter(
      (document) => {
        const matchesSearch =
          !query ||
          document.participantName
            ?.toLowerCase()
            .includes(query) ||
          document.documentName
            ?.toLowerCase()
            .includes(query);

        const matchesFilter =
          filter === "all" ||
          document.status === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    processedDocuments,
    search,
    filter,
  ]);

  const summary = useMemo(() => {
    return {
      total: processedDocuments.length,
      valid: processedDocuments.filter(
        (item) => item.status === "valid"
      ).length,
      expiring: processedDocuments.filter(
        (item) =>
          item.status === "expiring"
      ).length,
      expired: processedDocuments.filter(
        (item) =>
          item.status === "expired"
      ).length,
      pending: processedDocuments.filter(
        (item) =>
          item.status === "pending"
      ).length,
    };
  }, [processedDocuments]);

  const handleReminder = async (
    document
  ) => {
    await onSendReminder?.(
      document
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={21} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Document Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Document Expiry Tracking
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Monitor participant documents and identify
              documents that are expired or approaching
              expiration.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Documents
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {summary.total}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryCard
          label="Total"
          value={summary.total}
          type="neutral"
        />

        <SummaryCard
          label="Valid"
          value={summary.valid}
          type="valid"
        />

        <SummaryCard
          label="Expiring Soon"
          value={summary.expiring}
          type="expiring"
        />

        <SummaryCard
          label="Expired"
          value={summary.expired}
          type="expired"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          type="pending"
        />
      </div>

      {/* Search & Filter */}
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
                setSearch(event.target.value)
              }
              placeholder="Search participant or document..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">
              All Documents
            </option>

            <option value="valid">
              Valid
            </option>

            <option value="expiring">
              Expiring Soon
            </option>

            <option value="expired">
              Expired
            </option>

            <option value="pending">
              Verification Pending
            </option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {summary.expired > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div>
            <p className="text-[8px] font-bold text-red-700 dark:text-red-400">
              Expired Documents Require Attention
            </p>

            <p className="mt-1 text-[7px] leading-4 text-red-700/70 dark:text-red-400/70">
              {summary.expired} document
              {summary.expired === 1
                ? ""
                : "s"} have expired and may require
              participant updates.
            </p>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="mt-5 space-y-3">
        {filteredDocuments.length ===
        0 ? (
          <EmptyState />
        ) : (
          filteredDocuments.map(
            (document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onSendReminder={() =>
                  handleReminder(
                    document
                  )
                }
                onDocumentUpdate={
                  onDocumentUpdate
                }
              />
            )
          )
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Document Card
--------------------------------- */

const DocumentCard = ({
  document,
  onSendReminder,
}) => {
  const config =
    STATUS_CONFIG[
      document.status
    ] || STATUS_CONFIG.pending;

  const Icon = config.icon;

  const shouldRemind =
    document.status === "expired" ||
    document.status === "expiring";

  return (
    <article
      className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 ${
        document.status === "expired"
          ? "border-red-200 dark:border-red-900/40"
          : document.status ===
            "expiring"
          ? "border-amber-200 dark:border-amber-900/40"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Document info */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.className}`}
          >
            <Icon size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {document.documentName}
              </h3>

              <StatusBadge
                status={
                  document.status
                }
              />
            </div>

            <p className="mt-1 text-[8px] text-slate-500 dark:text-slate-400">
              Participant:{" "}
              <span className="font-semibold">
                {document.participantName}
              </span>
            </p>

            <div className="mt-2 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1 text-[7px] text-slate-400">
                <CalendarDays size={10} />
                Uploaded{" "}
                {formatDate(
                  document.uploadDate
                )}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[7px] ${
                  document.status ===
                  "expired"
                    ? "font-bold text-red-500"
                    : document.status ===
                      "expiring"
                    ? "font-bold text-amber-500"
                    : "text-slate-400"
                }`}
              >
                <Clock3 size={10} />
                Expires{" "}
                {formatDate(
                  document.expirationDate
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {shouldRemind && (
            <button
              type="button"
              onClick={onSendReminder}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-[7px] font-bold text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400"
            >
              <Bell size={13} />
              Notify Participant
            </button>
          )}
        </div>
      </div>

      {/* Expiry message */}
      {document.status ===
        "expired" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-900/10">
          <XCircle
            size={13}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <p className="text-[7px] leading-4 text-red-700 dark:text-red-400">
            This document expired{" "}
            {Math.abs(
              document.daysUntilExpiry || 0
            )}{" "}
            day
            {Math.abs(
              document.daysUntilExpiry || 0
            ) === 1
              ? ""
              : "s"}{" "}
            ago. A valid replacement may be required.
          </p>
        </div>
      )}

      {document.status ===
        "expiring" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/10">
          <AlertCircle
            size={13}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <p className="text-[7px] leading-4 text-amber-700 dark:text-amber-400">
            This document expires in{" "}
            <strong>
              {document.daysUntilExpiry}
            </strong>{" "}
            day
            {document.daysUntilExpiry ===
            1
              ? ""
              : "s"}.
          </p>
        </div>
      )}
    </article>
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6px] font-bold ${config.className}`}
    >
      <Icon size={9} />
      {config.label}
    </span>
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
  const styles = {
    neutral:
      "text-slate-800 dark:text-white",
    valid:
      "text-green-600 dark:text-green-400",
    expiring:
      "text-amber-600 dark:text-amber-400",
    expired:
      "text-red-600 dark:text-red-400",
    pending:
      "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${styles[type]}`}
      >
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <FileText
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No documents found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filter.
      </p>
    </div>
  );
};

export default DocumentExpiryTracking;