import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileBadge,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CERTIFICATES = [
  {
    id: "cert-1",
    eventName: "AI Hackathon 2026",
    certificateType: "Participation Certificate",
    issueDate: "2026-08-01",
    status: "Issued",
    certificateUrl: "/certificates/ai-hackathon-2026.pdf",
  },
  {
    id: "cert-2",
    eventName: "Web Development Workshop",
    certificateType: "Completion Certificate",
    issueDate: "2026-07-25",
    status: "Issued",
    certificateUrl:
      "/certificates/web-development-workshop.pdf",
  },
  {
    id: "cert-3",
    eventName: "Cloud Computing Seminar",
    certificateType: "Participation Certificate",
    issueDate: "2026-07-15",
    status: "Pending",
    certificateUrl: null,
  },
];

const CertificateDownloadCenter = ({
  certificates = DEFAULT_CERTIFICATES,
  onPreview,
  onDownload,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [previewCertificate, setPreviewCertificate] =
    useState(null);

  const filteredCertificates = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return certificates.filter(
      (certificate) => {
        const matchesSearch =
          !query ||
          certificate.eventName
            .toLowerCase()
            .includes(query) ||
          certificate.certificateType
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          certificate.status ===
            statusFilter;

        const matchesType =
          typeFilter === "All" ||
          certificate.certificateType ===
            typeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      }
    );
  }, [
    certificates,
    search,
    statusFilter,
    typeFilter,
  ]);

  const certificateTypes = useMemo(() => {
    return [
      "All",
      ...new Set(
        certificates.map(
          (certificate) =>
            certificate.certificateType
        )
      ),
    ];
  }, [certificates]);

  const issuedCount =
    certificates.filter(
      (certificate) =>
        certificate.status ===
        "Issued"
    ).length;

  const pendingCount =
    certificates.filter(
      (certificate) =>
        certificate.status ===
        "Pending"
    ).length;

  const handlePreview = (certificate) => {
    setPreviewCertificate(
      certificate
    );

    onPreview?.(certificate);
  };

  const handleDownload = async (
    certificate
  ) => {
    if (
      certificate.status !==
      "Issued"
    ) {
      return;
    }

    await onDownload?.(
      certificate
    );

    if (
      certificate.certificateUrl
    ) {
      const link =
        document.createElement(
          "a"
        );

      link.href =
        certificate.certificateUrl;

      link.download = `${certificate.eventName
        .replace(
          /[^a-z0-9]+/gi,
          "-"
        )
        .toLowerCase()}-certificate.pdf`;

      link.target = "_blank";

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();
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
            <Award size={21} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Achievements
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              My Certificates
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Access, preview, and download certificates
              earned from Eventra events.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Total Certificates
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {certificates.length}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total"
          value={certificates.length}
          icon={FileBadge}
        />

        <StatCard
          label="Issued"
          value={issuedCount}
          icon={CheckCircle2}
        />

        <StatCard
          label="Pending"
          value={pendingCount}
          icon={CalendarDays}
        />
      </div>

      {/* Search */}
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
              placeholder="Search by event or certificate type..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="All">
              All Statuses
            </option>
            <option value="Issued">
              Issued
            </option>
            <option value="Pending">
              Pending
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {certificateTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type === "All"
                    ? "All Types"
                    : type}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Certificate List */}
      <div className="mt-5 space-y-3">
        {filteredCertificates.length ===
        0 ? (
          <EmptyState />
        ) : (
          filteredCertificates.map(
            (certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={
                  certificate
                }
                onPreview={() =>
                  handlePreview(
                    certificate
                  )
                }
                onDownload={() =>
                  handleDownload(
                    certificate
                  )
                }
              />
            )
          )
        )}
      </div>

      {/* Preview */}
      {previewCertificate && (
        <CertificatePreview
          certificate={
            previewCertificate
          }
          onClose={() =>
            setPreviewCertificate(
              null
            )
          }
          onDownload={() =>
            handleDownload(
              previewCertificate
            )
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Certificate Card
--------------------------------- */

const CertificateCard = ({
  certificate,
  onPreview,
  onDownload,
}) => {
  const isIssued =
    certificate.status ===
    "Issued";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isIssued
                ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
            }`}
          >
            {isIssued ? (
              <Award size={19} />
            ) : (
              <CalendarDays size={19} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {certificate.eventName}
              </h3>

              <StatusBadge
                status={
                  certificate.status
                }
              />
            </div>

            <p className="mt-1 text-[8px] text-slate-500 dark:text-slate-400">
              {certificate.certificateType}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[6px] text-slate-400">
                <CalendarDays size={10} />
                Issued{" "}
                {formatDate(
                  certificate.issueDate
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            disabled={!isIssued}
            onClick={onDownload}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[7px] font-bold ${
              isIssued
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            <Download size={13} />
            {isIssued
              ? "Download"
              : "Not Available"}
          </button>
        </div>
      </div>
    </article>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const isIssued =
    status === "Issued";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6px] font-bold ${
        isIssued
          ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
          : "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
      }`}
    >
      {isIssued ? (
        <CheckCircle2 size={9} />
      ) : (
        <CalendarDays size={9} />
      )}

      {status}
    </span>
  );
};

/* --------------------------------
   Certificate Preview
--------------------------------- */

const CertificatePreview = ({
  certificate,
  onClose,
  onDownload,
}) => {
  const isIssued =
    certificate.status ===
    "Issued";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Certificate Preview
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {certificate.eventName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Mockup */}
        <div className="mt-6 rounded-2xl border-4 border-double border-indigo-200 bg-slate-50 p-6 dark:border-indigo-900 dark:bg-slate-950 sm:p-10">
          <div className="mx-auto max-w-xl border border-indigo-100 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-12">
            <Award
              size={42}
              className="mx-auto text-indigo-600 dark:text-indigo-400"
            />

            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              Certificate
            </p>

            <h4 className="mt-4 text-2xl font-black text-slate-800 dark:text-white">
              {certificate.certificateType}
            </h4>

            <p className="mt-5 text-[8px] text-slate-500 dark:text-slate-400">
              This certificate recognizes the participant's
              achievement at
            </p>

            <p className="mt-3 text-lg font-bold text-slate-800 dark:text-white">
              {certificate.eventName}
            </p>

            <div className="mx-auto mt-8 h-px max-w-xs bg-slate-200 dark:bg-slate-700" />

            <p className="mt-4 text-[7px] text-slate-400">
              Issue Date:{" "}
              {formatDate(
                certificate.issueDate
              )}
            </p>

            {!isIssued && (
              <div className="mt-5 rounded-xl bg-amber-50 p-3 text-[7px] font-semibold text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
                This certificate is currently pending and
                cannot be downloaded yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!isIssued}
            onClick={onDownload}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[8px] font-bold ${
              isIssued
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            <Download size={14} />
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <Icon
          size={14}
          className="text-indigo-500"
        />
      </div>

      <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
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
      <Award
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No certificates found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filter.
      </p>
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default CertificateDownloadCenter;