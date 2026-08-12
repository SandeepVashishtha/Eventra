import React, { useState } from 'react';

const ExpressCheckInKiosk = () => {
  const [kioskState, setKioskState] = useState('idle'); // idle, scanning, verified, error

  const handleApproach = () => {
    setKioskState('scanning');
    setTimeout(() => {
      // 90% chance of success for simulation
      if (Math.random() > 0.1) {
        setKioskState('verified');
      } else {
        setKioskState('error');
      }
      
      // Auto-reset kiosk after a few seconds
      setTimeout(() => setKioskState('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-sm mx-auto mt-8 border-4 border-gray-900 overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-wider text-gray-800">Express Kiosk</h2>
        <p className="text-xs text-gray-500 mt-1 font-semibold">Facial Recognition Check-in</p>
      </div>

      <div 
        className="relative w-full aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden mb-6 cursor-pointer group shadow-inner"
        onClick={kioskState === 'idle' ? handleApproach : undefined}
      >
        {/* Placeholder camera feed bg */}
        <div className="absolute inset-0 bg-gray-800 opacity-60 transition group-hover:opacity-80"></div>
        
        {kioskState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 animate-bounce">
              <span className="text-4xl">👋</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Step Forward</h3>
            <p className="text-gray-300 text-sm">Look at the camera to instantly print your badge.</p>
          </div>
        )}

        {kioskState === 'scanning' && (
          <div className="absolute inset-0 z-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 border-4 border-dashed border-blue-500/40 rounded-2xl m-6"></div>
          </div>
        )}

        {kioskState === 'verified' && (
          <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center backdrop-blur-md z-30 p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
              <span className="text-3xl">🖨️</span>
            </div>
            <h3 className="text-white font-black text-2xl mb-1">Welcome!</h3>
            <p className="text-green-100 font-medium text-lg mb-4">David Miller</p>
            
            <div className="bg-black/20 w-full p-3 rounded-lg">
              <p className="text-white text-sm font-bold animate-pulse">Printing Badge...</p>
            </div>
          </div>
        )}

        {kioskState === 'error' && (
          <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center backdrop-blur-md z-30 p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
              <span className="text-3xl text-red-600 font-bold">X</span>
            </div>
            <h3 className="text-white font-black text-xl mb-2">Match Not Found</h3>
            <p className="text-red-100 text-sm">Please step aside to the manual registration desk.</p>
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

      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs text-gray-500 text-center flex flex-col space-y-2">
        <p>🔒 Biometric data is strictly opt-in and deleted immediately post-event.</p>
        <button className="text-blue-600 font-semibold hover:underline">View Privacy Policy</button>
      </div>
    </div>
  );
};

export default ExpressCheckInKiosk;
