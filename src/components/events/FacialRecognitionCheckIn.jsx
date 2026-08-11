import React, { useState, useEffect } from 'react';

const FacialRecognitionCheckIn = () => {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, verified
  const [printing, setPrinting] = useState(false);

  // Auto loop the scanning simulation for kiosk display
  useEffect(() => {
    let timer;
    if (scanState === 'scanning') {
      timer = setTimeout(() => {
        setScanState('verified');
        setPrinting(true);
        
        setTimeout(() => {
          setPrinting(false);
          // Reset to idle after printing
          setTimeout(() => {
            setScanState('idle');
          }, 4000);
        }, 3000);

      }, 1500); // Super fast 1.5s scan time
    }
    return () => clearTimeout(timer);
  }, [scanState]);

  const triggerScan = () => {
    if (scanState === 'idle') setScanState('scanning');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6">
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Kiosk Mode Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Express Check-In via <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Facial Recognition</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Completely eliminate entrance queues. Opt-in attendees simply walk up to the kiosk, look at the camera, and their badge prints automatically in under 2 seconds. No phones or QR codes required.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-start">
              <span className="text-2xl mb-2">⚡</span>
              <h4 className="font-bold text-white text-sm">Sub-second Scan</h4>
              <p className="text-xs text-slate-500 mt-1">Faster than digging out a phone.</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-start">
              <span className="text-2xl mb-2">🖨️</span>
              <h4 className="font-bold text-white text-sm">Auto-Print</h4>
              <p className="text-xs text-slate-500 mt-1">Badge prints instantly on verify.</p>
            </div>
          </div>
        </div>

        {/* Right Side: iPad/Tablet Kiosk Simulation */}
        <div className="flex justify-center relative">
          
          {/* Hardware Frame */}
          <div className="w-[450px] h-[600px] bg-slate-800 rounded-[2rem] border-[16px] border-black shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Tablet Camera Hole */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-4 h-4 mt-2 bg-black rounded-full border border-slate-700 shadow-inner"></div>
            </div>

            {/* Kiosk UI */}
            <div className="flex-1 bg-slate-900 flex flex-col relative">
              
              {/* Fake Camera Feed Background */}
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center overflow-hidden">
                 {/* Silhouette placeholder for camera feed */}
                 <div className="w-64 h-80 bg-slate-700/50 rounded-[4rem] filter blur-sm"></div>
                 <div className="absolute top-1/4 w-32 h-32 bg-slate-600/50 rounded-full filter blur-sm"></div>
              </div>

              {/* UI Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-8 backdrop-blur-sm bg-slate-900/60">
                
                {/* Header */}
                <div className="text-center w-full">
                  <h2 className="text-2xl font-black text-white tracking-wide">Eventra Summit '26</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Express VIP Entry</p>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-1 w-full flex flex-col items-center justify-center">
                  
                  {scanState === 'idle' && (
                    <div className="flex flex-col items-center animate-fade-in cursor-pointer" onClick={triggerScan}>
                      <div className="w-40 h-40 border-4 border-dashed border-blue-500 rounded-full flex items-center justify-center text-6xl text-blue-500/50 relative">
                        <span className="animate-pulse">👤</span>
                      </div>
                      <p className="text-white font-bold mt-8 text-xl">Please look at the camera</p>
                      <p className="text-slate-400 text-sm mt-2">(Click to simulate attendee approaching)</p>
                    </div>
                  )}

                  {scanState === 'scanning' && (
                    <div className="flex flex-col items-center animate-fade-in w-full">
                      <div className="relative w-48 h-48 mb-8">
                        {/* Scanning Box */}
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-2xl"></div>
                        {/* Scanning Laser Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_15px_#3b82f6] animate-scan-vertical"></div>
                        
                        {/* Target reticles */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                      </div>
                      <h3 className="text-2xl font-black text-blue-400 animate-pulse">Scanning Bio-points...</h3>
                    </div>
                  )}

                  {scanState === 'verified' && (
                    <div className="flex flex-col items-center animate-fade-in w-full">
                      <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white text-6xl mb-6 border-8 border-emerald-900 shadow-[0_0_40px_rgba(16,185,129,0.5)] transform scale-110 transition-transform">
                        ✓
                      </div>
                      <h3 className="text-3xl font-black text-white mb-2">Welcome Back!</h3>
                      <p className="text-xl text-emerald-400 font-bold">Jonathan Doe</p>
                      <p className="text-sm text-slate-400 mt-1">VIP Ticket • Access Granted</p>
                    </div>
                  )}

                </div>

                {/* Footer Status */}
                <div className="w-full text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Database Connected
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Simulated Printer attachment at bottom */}
          <div className="absolute -bottom-6 w-[350px] h-12 bg-slate-700 rounded-b-3xl z-0 border-x-[12px] border-b-[12px] border-black flex justify-center items-end pb-1">
             <div className="w-48 h-2 bg-black rounded-full relative overflow-hidden">
               {/* Badge sliding out animation */}
               {printing && (
                 <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-16 bg-white animate-slide-down rounded-b shadow-lg border border-slate-300 flex flex-col items-center pt-1">
                   <div className="w-full bg-blue-600 h-2"></div>
                   <p className="text-[8px] font-black text-black mt-1">Jonathan Doe</p>
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacialRecognitionCheckIn;
