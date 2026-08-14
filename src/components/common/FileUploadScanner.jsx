import React, { useState } from "react";
import { Upload, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import "./file-scanner.css";

export default function FileUploadScanner({ onScanComplete }) {
  const [scanStatus, setScanStatus] = useState(null); // scanning, clean, infected
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setScanStatus("scanning");

    // Simulate virus scanner analysis check loops
    setTimeout(() => {
      // Simulate clean file for most files, fake infected for test scripts
      if (file.name.endsWith(".exe") || file.name.endsWith(".bat")) {
        setScanStatus("infected");
        if (onScanComplete) onScanComplete(false);
      } else {
        setScanStatus("clean");
        if (onScanComplete) onScanComplete(true);
      }
    }, 2000);
  };

  return (
    <div className="file-upload-scanner-box p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-sm mx-auto my-8 flex flex-col items-center">
      <h3 className="text-base font-bold mb-4">Secure File Uploader</h3>

      <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-205 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950 cursor-pointer hover:bg-slate-100 transition-colors mb-4 relative">
        <Upload className="w-8 h-8 text-slate-455 mb-2" />
        <span className="text-xs font-semibold text-slate-650">Click to select files</span>
        <input type="file" onChange={handleFileChange} className="hidden" />
      </label>

      {fileName && (
        <div className="w-full p-3 bg-slate-100 dark:bg-slate-850 rounded-xl mb-4 border border-transparent">
          <span className="text-xs font-bold truncate block text-slate-800 dark:text-slate-200">{fileName}</span>
          
          <div className="mt-2.5 flex items-center gap-1.5">
            {scanStatus === "scanning" && (
              <span className="text-[10px] font-bold text-indigo-650 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing security integrity...
              </span>
            )}
            {scanStatus === "clean" && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security Check Passed (Clean)
              </span>
            )}
            {scanStatus === "infected" && (
              <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Malicious Payload Blocked
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
