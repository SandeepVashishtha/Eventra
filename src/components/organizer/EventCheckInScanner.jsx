import React, { useState } from "react";
import { Camera, QrCode, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import CheckInStatusCard from "./CheckInStatusCard";
import "./scanner.css";

export default function EventCheckInScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanInput, setScanInput] = useState("");

  const startScan = () => {
    setIsScanning(true);
    setScanResult(null);
  };

  const handleSimulateScan = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    // Simulate database lookup validation
    setIsScanning(false);
    const parsedId = Number(scanInput);
    if (parsedId > 0 && parsedId < 100) {
      setScanResult({
        success: true,
        ticketId: parsedId,
        attendee: "Amit Patel",
        event: "AI Workshop",
        checkedInAt: new Date().toLocaleTimeString()
      });
    } else if (parsedId >= 100 && parsedId < 200) {
      setScanResult({
        success: false,
        reason: "DUPLICATE",
        message: "This ticket has already been checked in.",
        ticketId: parsedId
      });
    } else {
      setScanResult({
        success: false,
        reason: "INVALID",
        message: "Invalid ticket token barcode.",
        ticketId: parsedId
      });
    }
    setScanInput("");
  };

  return (
    <div className="checkin-scanner-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <QrCode className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Event Entry Check-in Gate</h2>
      </div>

      <div className="scanner-view-box bg-slate-950 rounded-2xl aspect-video relative flex flex-col items-center justify-center border border-slate-850 overflow-hidden mb-6">
        {isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="scanner-laser w-full h-0.5 bg-red-500 absolute top-0 animate-bounce" />
            <Camera className="w-12 h-12 text-slate-500 mb-2 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting scan camera signal...</span>
          </div>
        ) : (
          <div className="text-center text-slate-400 p-4">
            <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <span className="text-xs font-semibold block uppercase">Camera Scanner Idle</span>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={startScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/20 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" /> Activate Camera
        </button>
      </div>

      <form onSubmit={handleSimulateScan} className="flex gap-2 items-center mb-6">
        <input
          type="text"
          placeholder="Simulate barcode scanner input (e.g. 42 for success, 102 for duplicate, 300 for invalid)"
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-205 focus:outline-none"
        />
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-700">
          Enter
        </button>
      </form>

      {scanResult && <CheckInStatusCard result={scanResult} />}
    </div>
  );
}
