import React, { useState } from "react";
import { X, Calendar, Link, Download } from "lucide-react";
import { generateICSFeedString } from "../../../utils/calendar/icsGenerator";
import SyncStatusWidget from "./SyncStatusWidget";

export default function CalendarExportModal({ isOpen = false, onClose = () => {} }) {
  const [copied, setCopied] = useState(false);

  const downloadIcsFile = () => {
    const events = [
      { id: "101", title: "Web3 Developer Summit", description: "Hands on building", start: "2026-08-20T10:00:00Z", end: "2026-08-20T12:00:00Z" }
    ];
    const icsText = generateICSFeedString(events);
    const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_eventra_schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-xs select-none">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl space-y-4 text-white">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Calendar Integration feeds</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-400">
          Subscribe to your schedules. Changes sync directly to Google Calendar, Apple Calendar, and Outlook.
        </p>

        <div className="flex gap-2">
          <button
            onClick={downloadIcsFile}
            className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <Download className="w-4 h-4" /> Download .ICS file
          </button>
        </div>

        <SyncStatusWidget />
      </div>
    </div>
  );
}
