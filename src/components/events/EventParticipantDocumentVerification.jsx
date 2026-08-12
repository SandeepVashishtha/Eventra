import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock3,
    classes:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    classes:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
};

const DEFAULT_DOCUMENTS = [
  {
    id: "student-id",
    name: "Student ID",
    description: "Valid student identification document",
    required: true,
    file: null,
    status: "pending",
    rejectionReason: "",
  },
  {
    id: "eligibility-certificate",
    name: "Eligibility Certificate",
    description: "Proof of eligibility for this event",
    required: false,
    file: null,
    status: "pending",
    rejectionReason: "",
  },
];

const EventParticipantDocumentVerification = ({
  documents = DEFAULT_DOCUMENTS,
  isOrganizer = false,
  onUpload,
  onVerify,
  onReject,
  onDelete,
  className = "",
}) => {
  const [documentList, setDocumentList] =
    useState(documents);

  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [showPreview, setShowPreview] =
    useState(false);

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [error, setError] =
    useState("");

  const updateDocument = (
    documentId,
    updates
  ) => {
    setDocumentList((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              ...updates,
            }
          : document
      )
    );
  };

  const handleUpload = async (
    document,
    file
  ) => {
    setError("");

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only PDF, JPG, PNG, and WEBP files are supported."
      );
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "File size must be less than 5 MB."
      );
      return;
    }

    updateDocument(
      document.id,
      {
        file,
        status: "pending",
        rejectionReason: "",
      }
    );

    await onUpload?.(
      document,
      file
    );
  };

  const handleVerify = async (
    document
  ) => {
    updateDocument(
      document.id,
      {
        status: "verified",
        rejectionReason: "",
      }
    );

    await onVerify?.(document);
  };

  const openRejectModal = (
    document
  ) => {
    setSelectedDocument(
      document
    );
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (
      !selectedDocument ||
      !rejectionReason.trim()
    ) {
      return;
    }

    const reason =
      rejectionReason.trim();

    updateDocument(
      selectedDocument.id,
      {
        status: "rejected",
        rejectionReason: reason,
      }
    );

    await onReject?.(
      selectedDocument,
      reason
    );

    setShowRejectModal(false);
    setSelectedDocument(null);
    setRejectionReason("");
  };

  const openPreview = (
    document
  ) => {
    if (!document.file) {
      return;
    }

    setSelectedDocument(
      document
    );
    setShowPreview(true);
  };

  const handleDelete = async (
    document
  ) => {
    updateDocument(
      document.id,
      {
        file: null,
        status: "pending",
        rejectionReason: "",
      }
    );

    await onDelete?.(document);
  };

  const requiredDocuments =
    documentList.filter(
      (document) =>
        document.required
    );

  const verifiedRequired =
    requiredDocuments.filter(
      (document) =>
        document.status ===
        "verified"
    ).length;

  const verificationPercentage =
    requiredDocuments.length === 0
      ? 100
      : Math.round(
          (verifiedRequired /
            requiredDocuments.length) *
            100
        );

  const verifiedCount =
    documentList.filter(
      (document) =>
        document.status ===
        "verified"
    ).length;

  const rejectedCount =
    documentList.filter(
      (document) =>
        document.status ===
        "rejected"
    ).length;

  const pendingCount =
    documentList.filter(
      (document) =>
        document.status ===
        "pending"
    ).length;

  return (
    <>
      <section
        className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <FileText size={20} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Document Verification
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Participant Documents
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Upload and track documents required for
                event eligibility.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl px-4 py-3 ${
              verificationPercentage === 100
                ? "bg-green-50 dark:bg-green-900/10"
                : "bg-indigo-50 dark:bg-indigo-900/10"
            }`}
          >
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Eligibility
            </p>

            <p
              className={`mt-1 text-sm font-bold ${
                verificationPercentage === 100
                  ? "text-green-600 dark:text-green-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {verificationPercentage}%
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <SummaryCard
            label="Pending"
            value={pendingCount}
            icon={<Clock3 size={14} />}
            className="text-amber-600 dark:text-amber-400"
          />

          <SummaryCard
            label="Verified"
            value={verifiedCount}
            icon={<CheckCircle2 size={14} />}
            className="text-green-600 dark:text-green-400"
          />

          <SummaryCard
            label="Rejected"
            value={rejectedCount}
            icon={<XCircle size={14} />}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
              Required document verification
            </span>

            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
              {verifiedRequired}/
              {requiredDocuments.length}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${verificationPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0"
            />

            <p className="text-[8px] font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* Documents */}
        <div className="mt-6 space-y-3">
          {documentList.map(
            (document) => (
              <DocumentCard
                key={document.id}
                document={document}
                isOrganizer={isOrganizer}
                onUpload={
                  handleUpload
                }
                onPreview={
                  openPreview
                }
                onVerify={
                  handleVerify
                }
                onReject={
                  openRejectModal
                }
                onDelete={
                  handleDelete
                }
              />
            )
          )}
        </div>

        {/* Eligibility status */}
        <div
          className={`mt-5 rounded-2xl border p-4 ${
            verificationPercentage ===
            100
              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationPercentage ===
            100 ? (
              <CheckCircle2
                size={18}
                className="text-green-600 dark:text-green-400"
              />
            ) : (
              <Clock3
                size={18}
                className="text-amber-600 dark:text-amber-400"
              />
            )}

            <div>
              <p
                className={`text-[9px] font-bold ${
                  verificationPercentage ===
                  100
                    ? "text-green-700 dark:text-green-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {verificationPercentage ===
                100
                  ? "All required documents verified"
                  : "Document verification pending"}
              </p>

              <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
                {verificationPercentage ===
                100
                  ? "You have completed all required document verification."
                  : "Complete verification of all required documents to confirm eligibility."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview modal */}
      {showPreview &&
        selectedDocument && (
          <DocumentPreviewModal
            document={
              selectedDocument
            }
            onClose={() => {
              setShowPreview(false);
              setSelectedDocument(
                null
              );
            }}
          />
        )}

      {/* Rejection modal */}
      {showRejectModal &&
        selectedDocument && (
          <RejectDocumentModal
            document={
              selectedDocument
            }
            reason={
              rejectionReason
            }
            onReasonChange={
              setRejectionReason
            }
            onClose={() => {
              setShowRejectModal(
                false
              );
              setSelectedDocument(
                null
              );
            }}
            onConfirm={
              handleReject
            }
          />
        )}
    </>
  );
};

const DocumentCard = ({
  document,
  isOrganizer,
  onUpload,
  onPreview,
  onVerify,
  onReject,
  onDelete,
}) => {
  const config =
    STATUS_CONFIG[
      document.status
    ] || STATUS_CONFIG.pending;

  const StatusIcon =
    config.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* File icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <FileText size={18} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              {document.name}
            </h3>

            {document.required && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[6px] font-bold text-red-500 dark:bg-red-900/10 dark:text-red-400">
                Required
              </span>
            )}
          </div>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            {document.description}
          </p>

          {document.file && (
            <p className="mt-2 truncate text-[7px] font-semibold text-slate-500 dark:text-slate-400">
              {document.file.name}
            </p>
          )}
        </div>

        {/* Status */}
        <div
          className={`flex w-fit shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 ${config.classes}`}
        >
          <StatusIcon size={12} />

          <span className="text-[7px] font-bold">
            {config.label}
          </span>
        </div>
      </div>

      {/* Rejection reason */}
      {document.status ===
        "rejected" &&
        document.rejectionReason && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 dark:bg-red-900/10">
            <p className="text-[7px] font-bold text-red-600 dark:text-red-400">
              Rejection reason
            </p>

            <p className="mt-1 text-[7px] leading-4 text-red-600/80 dark:text-red-400/80">
              {document.rejectionReason}
            </p>
          </div>
        )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {!isOrganizer && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700">
            <Upload size={12} />

            {document.file
              ? "Replace Document"
              : "Upload Document"}

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) =>
                onUpload(
                  document,
                  event.target
                    .files?.[0]
                )
              }
            />
          </label>
        )}

        {document.file && (
          <button
            type="button"
            onClick={() =>
              onPreview(document)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eye size={12} />
            Preview
          </button>
        )}

        {!isOrganizer &&
          document.file && (
            <button
              type="button"
              onClick={() =>
                onDelete(document)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-[7px] font-bold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400"
            >
              <X size={12} />
              Remove
            </button>
          )}

        {isOrganizer &&
          document.file &&
          document.status !==
            "verified" && (
            <button
              type="button"
              onClick={() =>
                onVerify(document)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-green-700"
            >
              <CheckCircle2
                size={12}
              />
              Verify
            </button>
          )}

        {isOrganizer &&
          document.file &&
          document.status !==
            "rejected" && (
            <button
              type="button"
              onClick={() =>
                onReject(document)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-[7px] font-bold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400"
            >
              <XCircle size={12} />
              Reject
            </button>
          )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  icon,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className={className}>
      {icon}
    </div>

    <p className="mt-2 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const DocumentPreviewModal = ({
  document,
  onClose,
}) => {
  const fileUrl =
    document.file
      ? URL.createObjectURL(
          document.file
        )
      : "";

  const isPdf =
    document.file?.type ===
    "application/pdf";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {document.name}
            </h2>

            <p className="mt-1 text-[7px] text-slate-400">
              {document.file?.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title="Document preview"
              className="h-[70vh] w-full rounded-xl bg-white"
            />
          ) : (
            <img
              src={fileUrl}
              alt={document.name}
              className="max-h-[70vh] max-w-full rounded-xl object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const RejectDocumentModal = ({
  document,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Reject Document
          </h2>

          <p className="mt-1 text-[8px] text-slate-400">
            Provide a reason for rejecting{" "}
            {document.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={17} />
        </button>
      </div>

      <textarea
        value={reason}
        onChange={(event) =>
          onReasonChange(
            event.target.value
          )
        }
        rows={5}
        maxLength={500}
        placeholder="Explain why this document was rejected..."
        className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />

      <p className="mt-1 text-right text-[7px] text-slate-400">
        {reason.length}/500
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-5 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!reason.trim()}
          onClick={onConfirm}
          className="rounded-xl bg-red-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject Document
        </button>
      </div>
    </div>
  </div>
);

export default EventParticipantDocumentVerification;