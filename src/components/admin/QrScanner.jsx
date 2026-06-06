import React, { useState } from 'react';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);

  const mockScan = () => {
    // Mock the result of scanning a QR code at the door
    const result = {
      attendeeName: "John Doe",
      ticketId: "TKT-" + Math.floor(Math.random() * 100000),
      status: "Verified",
      timestamp: new Date().toLocaleTimeString()
    };
    setScanResult(result);
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Event Door Scanner</h2>
      
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <div className="w-64 h-64 mx-auto border-4 border-dashed border-slate-600 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
          <span className="text-slate-400">Camera Feed Placeholder</span>
        </div>
        
        <button 
          onClick={mockScan}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          Simulate Scan Ticket
        </button>
      </div>

      {scanResult && (
        <div className="mt-8 w-full max-w-md bg-emerald-900/50 border border-emerald-500/50 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 mb-2">Check-In Successful!</h3>
          <p className="text-lg mb-1">{scanResult.attendeeName}</p>
          <p className="text-sm text-slate-400">ID: {scanResult.ticketId}</p>
          <p className="text-xs text-slate-500 mt-4">Scanned at: {scanResult.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
