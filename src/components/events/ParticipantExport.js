import { useState } from "react";
import { Download, Users, Loader2 } from "lucide-react";
import ExportFormatSelector from "./ExportFormatSelector";
import {
  exportParticipantsToCSV,
  exportParticipantsToExcel,
  exportParticipantsToPDF,
} from "../../utils/participantExportUtils";

const ParticipantExport = ({ participants = [] }) => {
  const [format, setFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!participants.length || isExporting) return;

    setIsExporting(true);

    try {
      if (format === "csv") {
        exportParticipantsToCSV(participants);
      } else if (format === "excel") {
        await exportParticipantsToExcel(participants);
      } else if (format === "pdf") {
        await exportParticipantsToPDF(participants);
      }
    } catch (error) {
      console.error("Failed to export participants:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Users
            size={22}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Export Participants
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export registered participant information.
          </p>
        </div>
      </div>

      {/* Participant count */}
      <div className="mb-5 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Registered Participants
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
          {participants.length}
        </p>
      </div>

      {/* Format selector */}
      <ExportFormatSelector
        value={format}
        onChange={setFormat}
      />

      {/* Export button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={!participants.length || isExporting}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
          !participants.length || isExporting
            ? "cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={18} />
            Export as {format.toUpperCase()}
          </>
        )}
      </button>

      {/* Empty state */}
      {!participants.length && (
        <p className="mt-3 text-center text-xs text-slate-500">
          No participants are available to export.
        </p>
      )}
    </div>
  );
};

export default ParticipantExport;