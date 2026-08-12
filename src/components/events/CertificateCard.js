import {
  Award,
  Calendar,
  Download,
  Eye,
  Clock,
} from "lucide-react";

const CertificateCard = ({ certificate }) => {
  if (!certificate) return null;

  const isIssued = certificate.status === "Issued";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300 p-6">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div className="flex items-center gap-3">

          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Award
              size={28}
              className="text-indigo-600"
            />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {certificate.title}
            </h3>

            <p className="text-sm text-slate-500">
              {certificate.eventName}
            </p>

          </div>

        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isIssued
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
          }`}
        >
          {certificate.status}
        </span>

      </div>

      {/* Category */}

      <div className="mt-5">

        <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-3 py-1">
          {certificate.category}
        </span>

      </div>

      {/* Date */}

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">

        <Calendar size={16} />

        <span>
          Issued:{" "}
          {certificate.issueDate || "Not Available"}
        </span>

      </div>

      {/* Pending */}

      {!isIssued && (
        <div className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">

          <Clock size={16} />

          <span className="text-sm">
            Certificate is under processing.
          </span>

        </div>
      )}

      {/* Actions */}

      <div className="mt-6 flex gap-3">

        <button
          disabled={!isIssued}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            isIssued
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Eye size={18} />
          View
        </button>

        <button
          disabled={!isIssued}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            isIssued
              ? "border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              : "border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Download size={18} />
          Download
        </button>

      </div>

    </div>
  );
};

export default CertificateCard;