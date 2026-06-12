import React, { useState } from "react";

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);

  const mockScan = () => {
    // Mock the result of scanning a QR code at the door
    const result = {
      attendeeName: "John Doe",
      ticketId: "TKT-" + Math.floor(Math.random() * 100000),
      status: "Verified",
      timestamp: new Date().toLocaleTimeString(),
    };
    setScanResult(result);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-900 p-6 text-white">
      <h2 className="mb-6 text-3xl font-bold">Event Door Scanner</h2>

      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
        <div className="relative mx-auto mb-6 flex h-64 w-64 items-center justify-center overflow-hidden rounded-lg border-4 border-dashed border-slate-600">
          <div className="absolute inset-0 animate-pulse bg-blue-500/10"></div>
          <span className="text-slate-400">Camera Feed Placeholder</span>
        </div>

        <button
          onClick={mockScan}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500"
        >
          Simulate Scan Ticket
        </button>
      </div>

      {scanResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 w-full max-w-md rounded-xl border border-emerald-500/50 bg-emerald-900/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-emerald-400">Check-In Successful!</h3>
          <p className="mb-1 text-lg">{scanResult.attendeeName}</p>
          <p className="text-sm text-slate-400">ID: {scanResult.ticketId}</p>
          <p className="mt-4 text-xs text-slate-500">Scanned at: {scanResult.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
