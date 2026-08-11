import React, { useState } from 'react';

const BiometricEntry = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // null, 'success', 'fail'

  const simulateScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult('success');
      setTimeout(() => setResult(null), 3000); // reset after 3s
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto mt-8 border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">Contactless Biometric Entry</h2>
        <p className="text-sm text-gray-500">Fast, secure facial recognition check-in.</p>
      </div>

      <div className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center cursor-pointer group" onClick={simulateScan}>
        {/* Placeholder camera feed bg */}
        <div className="absolute inset-0 bg-gray-800 opacity-50 group-hover:opacity-70 transition"></div>
        
        {scanning && (
          <div className="absolute inset-0">
            {/* Scanning line animation */}
            <div className="w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 border-4 border-dashed border-blue-500/50 rounded-xl m-8"></div>
          </div>
        )}

        {!scanning && !result && (
          <div className="z-10 text-white text-center">
            <span className="text-4xl mb-2 block">👤</span>
            <p className="font-medium text-sm">Click to simulate<br/>attendee approach</p>
          </div>
        )}

        {result === 'success' && (
          <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg text-center shadow-lg">
              <p className="font-bold text-gray-800">Sarah Jenkins</p>
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider">VIP PASS VERIFIED</p>
            </div>
            <p className="text-white font-medium text-sm mt-4 bg-black/50 px-3 py-1 rounded-full">Printing badge in 0.5s...</p>
          </div>
        )}

        <style>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
        `}</style>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3 text-sm">
        <span className="text-blue-500 text-lg">ℹ️</span>
        <p className="text-blue-800">Edge-computing cameras process facial data locally in &lt;200ms. No biometrics are stored permanently.</p>
      </div>
    </div>
  );
};

export default BiometricEntry;
