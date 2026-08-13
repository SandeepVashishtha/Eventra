/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricLivenessDetection = () => {
  const [scanTarget, setScanTarget] = useState('HUMAN'); // HUMAN, PHOTO_SPOOF
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: idle, 1: depth, 2: challenge, 3: result
  const [result, setResult] = useState(null); // null, VERIFIED, REJECTED
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Computer Vision module initialized. Awaiting staff webcam feed.' }
  ]);

  const executeScan = () => {
      setIsScanning(true);
      setScanStep(1);
      setResult(null);
      addLog('ACTION', `Starting biometric liveness scan for profile: ${scanTarget === 'HUMAN' ? 'Live Human' : '2D Photo Spoof'}`);
      
      // Step 1: Depth Mapping
      setTimeout(() => {
          setScanStep(2);
          addLog('SYS', 'Analyzing facial topography. Constructing 3D depth map vector...');
          
          if (scanTarget === 'PHOTO_SPOOF') {
              addLog('WARN', 'Depth analysis anomaly: Subject lacks 3D topography. 2D planar surface detected.');
          }
          
          // Step 2: Challenge/Response (Blink)
          setTimeout(() => {
              addLog('SYS', 'Executing biomechanical challenge: Awaiting user "Blink" micro-expression...');
              
              // Step 3: Result
              setTimeout(() => {
                  setScanStep(3);
                  setIsScanning(false);
                  
                  if (scanTarget === 'HUMAN') {
                      setResult('VERIFIED');
                      addLog('SUCCESS', 'Micro-expressions detected. Depth map verified. Subject is a LIVE HUMAN.');
                  } else {
                      setResult('REJECTED');
                      addLog('CRIT', 'Challenge failed: No blink detected. Anti-spoofing engaged. REJECTING application.');
                  }
              }, 2000);
          }, 2000);
      }, 1500);
  };
  
  const resetDemo = () => {
      setIsScanning(false);
      setScanStep(0);
      setResult(null);
      addLog('SYS', 'Camera reset. Ready for next verification.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Computer Vision & Biometrics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Anti-Spoofing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-500 to-blue-500">Liveness Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Remote volunteers try to bypass background checks by holding up a printed photo of someone else to their webcam, creating a severe security vulnerability for backstage access. Eventra solves this using a biometric "Liveness" detection algorithm on the frontend onboarding flow. A neural network analyzes the webcam feed for depth, micro-expressions, and texture to mathematically prove they are a live human, instantly rejecting deepfakes or 2D photos.
          </p>

          <div className="bg-[#050812] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Spoofing Simulator
               </h3>
               {result && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 <button 
                     onClick={() => { setScanTarget('HUMAN'); setResult(null); setScanStep(0); }}
                     disabled={isScanning}
                     className={`p-4 border rounded-xl text-left transition-all ${
                         scanTarget === 'HUMAN' ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 opacity-50'
                     } ${isScanning ? 'cursor-not-allowed' : 'hover:opacity-100'}`}
                 >
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xl">🙋‍♂️</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${scanTarget === 'HUMAN' ? 'text-indigo-400' : 'text-slate-500'}`}>Target Selected</span>
                     </div>
                     <span className="text-xs font-bold text-white block">Real Applicant</span>
                     <span className="text-[9px] text-slate-400 font-mono mt-1 block">Live 3D subject in front of webcam</span>
                 </button>

                 <button 
                     onClick={() => { setScanTarget('PHOTO_SPOOF'); setResult(null); setScanStep(0); }}
                     disabled={isScanning}
                     className={`p-4 border rounded-xl text-left transition-all ${
                         scanTarget === 'PHOTO_SPOOF' ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-800 opacity-50'
                     } ${isScanning ? 'cursor-not-allowed' : 'hover:opacity-100'}`}
                 >
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xl">🖼️</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${scanTarget === 'PHOTO_SPOOF' ? 'text-cyan-400' : 'text-slate-500'}`}>Target Selected</span>
                     </div>
                     <span className="text-xs font-bold text-white block">2D Photo Attack</span>
                     <span className="text-[9px] text-slate-400 font-mono mt-1 block">Applicant holding a printed photo</span>
                 </button>
                 
             </div>

             <button 
                 onClick={executeScan}
                 disabled={isScanning || result !== null}
                 className={`w-full py-3 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors mb-4 ${
                     isScanning || result !== null ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                 }`}
             >
                 {isScanning ? 'Analyzing Video Feed...' : 'Execute Neural Network Scan'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Computer Vision Logs</span>
                 {isScanning && <span className="text-indigo-400 font-black animate-pulse">SCANNING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Live Webcam Feed</span>
                      <span className="text-xs text-white font-bold">Liveness Verification</span>
                  </div>
              </div>

              <div className="flex-1 bg-black p-6 flex flex-col relative overflow-hidden items-center justify-center">
                  
                  {/* Webcam Container */}
                  <div className="relative w-64 h-64 border-4 border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                      
                      {/* Base Image */}
                      <div className={`absolute inset-0 flex items-center justify-center text-7xl transition-all duration-1000 ${scanStep > 0 && scanTarget === 'PHOTO_SPOOF' ? 'grayscale opacity-70' : ''}`}>
                          {scanTarget === 'HUMAN' ? '👨‍💻' : '🖼️'}
                      </div>

                      {/* Scanning Overlay (Step 1: Depth) */}
                      {scanStep >= 1 && (
                          <div className="absolute inset-0 z-10 pointer-events-none">
                              {/* Grid lines */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                              
                              {/* Scanning bar */}
                              <div className={`w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] absolute left-0 ${scanStep === 1 || scanStep === 2 ? 'animate-[scan_1.5s_linear_infinite]' : 'hidden'}`}></div>
                              
                              {/* Target Box */}
                              <div className="absolute inset-10 border-2 border-dashed border-cyan-500/50 rounded-full flex items-center justify-center">
                                  {scanStep === 1 && <span className="bg-cyan-900/80 text-cyan-400 text-[8px] font-mono px-1 rounded uppercase tracking-widest">Mapping Depth...</span>}
                              </div>
                          </div>
                      )}

                      {/* Challenge Overlay (Step 2: Blink) */}
                      {scanStep === 2 && (
                          <div className="absolute inset-x-0 bottom-4 flex justify-center z-20">
                              <div className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                                  Please blink slowly
                              </div>
                          </div>
                      )}

                      {/* 2D Error Indication */}
                      {scanStep >= 2 && scanTarget === 'PHOTO_SPOOF' && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                              <div className="w-48 h-48 border border-amber-500/50 rounded bg-amber-900/20 flex flex-col items-center pt-2">
                                  <span className="text-[8px] text-amber-400 font-mono uppercase bg-amber-900/80 px-1">Flat Planar Surface</span>
                              </div>
                          </div>
                      )}

                      {/* Final Result Overlay */}
                      {scanStep === 3 && (
                          <div className={`absolute inset-0 flex items-center justify-center z-30 backdrop-blur-sm ${
                              result === 'VERIFIED' ? 'bg-emerald-900/60' : 'bg-rose-900/60'
                          }`}>
                              <div className="flex flex-col items-center">
                                  <div className="text-5xl mb-2 bg-white rounded-full">
                                      {result === 'VERIFIED' ? '✅' : '⛔'}
                                  </div>
                                  <span className={`text-xs font-black uppercase tracking-widest ${
                                      result === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'
                                  }`}>
                                      {result === 'VERIFIED' ? 'Live Human Verified' : 'Spoof Detected'}
                                  </span>
                              </div>
                          </div>
                      )}

                  </div>

                  {/* Telemetry Readout */}
                  <div className="w-64 mt-6 space-y-2 font-mono text-[9px] text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span>3D Topography:</span>
                          <span className={scanStep >= 2 ? (scanTarget === 'HUMAN' ? 'text-emerald-400' : 'text-amber-400') : ''}>
                              {scanStep < 2 ? 'Analyzing...' : scanTarget === 'HUMAN' ? 'Valid Depth Map' : '2D Plane Anomaly'}
                          </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span>Micro-Expressions:</span>
                          <span className={scanStep === 3 ? (scanTarget === 'HUMAN' ? 'text-emerald-400' : 'text-rose-400') : ''}>
                              {scanStep < 3 ? 'Awaiting...' : scanTarget === 'HUMAN' ? 'Blink Detected' : '0 Movement Detected'}
                          </span>
                      </div>
                      <div className="flex justify-between">
                          <span>Texture Analysis:</span>
                          <span className={scanStep === 3 ? (scanTarget === 'HUMAN' ? 'text-emerald-400' : 'text-rose-400') : ''}>
                              {scanStep < 3 ? 'Analyzing...' : scanTarget === 'HUMAN' ? 'Organic Skin' : 'Printed Paper/Screen'}
                          </span>
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050812] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Defeating 2D Deepfakes:</span>
               Select <span className="text-white font-bold bg-slate-800 px-1 rounded">2D Photo Attack</span> and Execute. Instead of relying on a human HR rep to guess if a webcam photo is fake, the neural network analyzes the feed. It instantly detects that a printed photo lacks 3D facial depth. It then executes a challenge-response (asking the user to blink). When the printed photo fails to blink, the backend mathematically proves it is a spoof and instantly rejects the application, closing the security loophole.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default BiometricLivenessDetection;
