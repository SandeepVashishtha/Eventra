import React from "react";
import { FileText, X, Download } from "lucide-react";

export default function StreamTranscriptDrawer({
  transcriptList = [],
  isOpen = false,
  onClose = () => {},
}) {
  if (!isOpen) return null;

  const handleExportTranscript = () => {
    const text = transcriptList
      .map((item) => `[${new Date(item.timestamp).toLocaleTimeString()}] ${item.text}`)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event_keynote_transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Live Presentation Transcript
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTranscript}
            title="Download Transcript TXT"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Transcript Log List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto font-sans text-xs">
        {transcriptList.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            No presentation captions recorded yet.
          </div>
        ) : (
          transcriptList.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>Keynote Speaker</span>
                <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
