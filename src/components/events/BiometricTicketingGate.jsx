/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricTicketingGate = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [gateState, setGateState] = useState('IDLE'); // IDLE, SCANNING, AUTHORIZED, REJECTED
  
  // Gate Metrics
  const [throughput, setThroughput] = useState(0); // People per minute
  const [avgScanTime, setAvgScanTime] = useState(0); // ms
  const [spoofAttempts, setSpoofAttempts] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Edge AI Vision System Booted.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Biometric cryptographic ledger synced.' }
  ]);

  // Visualizer State
  const [scanProgress, setScanProgress] = useState(0);
  const [faceMesh, setFaceMesh] = useState([]);
  const [rejectReason, setRejectReason] = useState('');

  // Initialize random face mesh points
  useEffect(() => {
      const mesh = Array.from({length: 40}).map((_, i) => ({
          id: i,
          x: 20 + Math.random() * 60,
          y: 10 + Math.random() * 80,
          active: false
      }));
      setFaceMesh(mesh);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (gateState === 'SCANNING') {
              setScanProgress(prev => {
                  if (prev >= 100) return 100;
                  return prev + 15; // Fast scan (~700ms total)
              });
              
              // Activate mesh points progressively
              setFaceMesh(prev => prev.map(pt => ({
                  ...pt,
                  active: pt.y <= scanProgress
              })));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, gateState, scanProgress]);

  const triggerScan = (scenario) => {
    if (!systemActive || gateState === 'SCANNING') return;
    
    setGateState('SCANNING');
    setScanProgress(0);
    setRejectReason('');
    addLog('SYS', 'Subject approaching turnstile. Initiating 3D depth scan...');
    
    // Simulate Edge AI processing time (~800ms)
    setTimeout(() => {
        if (!systemActive) return;
        
        if (scenario === 'VALID') {
            setGateState('AUTHORIZED');
            setThroughput(prev => Math.min(85, prev + 15)); // High throughput
            setAvgScanTime(784);
            addLog('SUCCESS', '3D Liveness verified. Cryptographic hash matched.');
            addLog('ACTION', 'Turnstile unlocked. Access Granted.');
            
            setTimeout(() => { if(systemActive) setGateState('IDLE'); }, 2000);
            
        } else if (scenario === 'PHOTO_SPOOF') {
            setGateState('REJECTED');
            setRejectReason('2D PHOTO DETECTED');
            setSpoofAttempts(prev => prev + 1);
            setAvgScanTime(620); // Fails faster
            setThroughput(prev => Math.max(0, prev - 5));
            addLog('CRIT', 'Liveness Check Failed: No 3D depth detected (2D Image Spoof).');
            addLog('WARN', 'Turnstile locked. Security flagged.');
            
            setTimeout(() => { if(systemActive) setGateState('IDLE'); }, 3000);
            
        } else if (scenario === 'UNREGISTERED') {
            setGateState('REJECTED');
            setRejectReason('HASH NOT FOUND');
            setAvgScanTime(810);
            setThroughput(prev => Math.max(0, prev - 5));
            addLog('WARN', 'Liveness verified, but biometric hash not found in ticketing ledger.');
            addLog('WARN', 'Turnstile locked. Please visit box office.');
            
            setTimeout(() => { if(systemActive) setGateState('IDLE'); }, 3000);
        }
    }, 800);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setGateState('IDLE');
      setScanProgress(0);
      setThroughput(0);
      setSpoofAttempts(0);
      setAvgScanTime(0);
      addLog('SYS', 'Biometric Turnstiles Armed. 3D LiDAR cameras active.');
    } else {
      setSystemActive(false);
      setGateState('IDLE');
      setScanProgress(0);
      addLog('WARN', 'Biometric Gates Offline. Reverting to manual QR scanning.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#00040a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Identity & Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Liveness <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-500">Ticketing Gates</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Scalpers easily bypass digital QR codes by taking screenshots or stealing accounts, and checking IDs manually at the gate causes massive entry lines. Eventra solves this by integrating opt-in facial recognition with 3D liveness detection at the entry turnstiles. When a user buys a ticket, it is cryptographically bound to their biometric hash. At the gate, they simply walk through; Eventra scans their face, verifies 3D liveness (preventing people from holding up photos), and opens the gate in under 800 milliseconds without the user ever touching their phone.
          </p>

          <div className="bg-[#020814] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Edge AI Gate Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Lock Down Gates' : 'Power On Turnstiles'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Throughput */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 throughput > 50 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Gate Throughput
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     throughput > 50 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {throughput}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pax/min</span>
                 </div>
               </div>

               {/* Avg Scan Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Auth Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {avgScanTime}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Spoof Attempts */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 spoofAttempts > 0 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Spoof Attempts
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     spoofAttempts > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {spoofAttempts}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Blocked</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Edge Vision Ledger</span>
                 {gateState === 'SCANNING' && <span className="text-cyan-400 font-black animate-pulse">EXTRACTING FACIAL MESH...</span>}
                 {gateState === 'AUTHORIZED' && <span className="text-emerald-400 font-black">ACCESS GRANTED</span>}
                 {gateState === 'REJECTED' && <span className="text-red-500 font-black animate-pulse">ACCESS DENIED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Biometric Scanner Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#02040a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">3D LIVENESS SCANNER</span>
                <span className="text-[8px] font-mono text-slate-400">GATE 04</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col items-center justify-center">
                      
                      {/* Scan UI Overlay */}
                      <div className={`absolute inset-8 border-2 rounded-[2rem] transition-colors duration-300 z-30 pointer-events-none ${
                          gateState === 'AUTHORIZED' ? 'border-emerald-500 shadow-[inset_0_0_30px_rgba(16,185,129,0.2)]' :
                          gateState === 'REJECTED' ? 'border-red-500 shadow-[inset_0_0_30px_rgba(239,68,68,0.2)]' :
                          gateState === 'SCANNING' ? 'border-cyan-500/50' : 'border-slate-800'
                      }`}>
                          {/* Corner brackets */}
                          <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-[2rem] transition-colors ${gateState === 'SCANNING' ? 'border-cyan-400' : 'border-transparent'}`}></div>
                          <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-[2rem] transition-colors ${gateState === 'SCANNING' ? 'border-cyan-400' : 'border-transparent'}`}></div>
                          <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-[2rem] transition-colors ${gateState === 'SCANNING' ? 'border-cyan-400' : 'border-transparent'}`}></div>
                          <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-[2rem] transition-colors ${gateState === 'SCANNING' ? 'border-cyan-400' : 'border-transparent'}`}></div>
                      </div>

                      {/* The Face / Mesh */}
                      <div className={`relative w-48 h-64 border border-transparent rounded-[3rem] flex items-center justify-center transition-opacity duration-300 ${gateState === 'IDLE' ? 'opacity-20' : 'opacity-100'}`}>
                          
                          {/* Head Silhouette */}
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-800">
                              <path d="M 50 10 C 30 10 20 30 20 50 C 20 75 35 90 50 90 C 65 90 80 75 80 50 C 80 30 70 10 50 10 Z" fill="currentColor" />
                          </svg>

                          {/* 3D Depth Points */}
                          {gateState !== 'IDLE' && (
                              <div className="absolute inset-0 z-10">
                                  {faceMesh.map(pt => (
                                      <div 
                                          key={pt.id}
                                          className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
                                              gateState === 'AUTHORIZED' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]' :
                                              gateState === 'REJECTED' ? 'bg-red-500' :
                                              pt.active ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'bg-transparent'
                                          }`}
                                          style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                                      ></div>
                                  ))}
                              </div>
                          )}

                          {/* Scanner Bar */}
                          {gateState === 'SCANNING' && (
                              <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] z-20"
                                   style={{ top: `${scanProgress}%` }}
                              ></div>
                          )}

                          {/* Result Text */}
                          {gateState === 'AUTHORIZED' && (
                              <div className="absolute inset-0 flex items-center justify-center z-30">
                                  <div className="bg-emerald-950/80 border border-emerald-500 px-4 py-2 rounded-lg backdrop-blur-sm animate-[bounce_0.5s_ease-out]">
                                      <span className="text-emerald-400 font-black uppercase tracking-widest text-sm">ACCESS GRANTED</span>
                                  </div>
                              </div>
                          )}
                          {gateState === 'REJECTED' && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                                  <div className="bg-red-950/80 border border-red-500 px-4 py-2 rounded-lg backdrop-blur-sm animate-[shake_0.5s_ease-in-out]">
                                      <span className="text-red-500 font-black uppercase tracking-widest text-sm block text-center">ACCESS DENIED</span>
                                      <span className="text-red-400 font-bold uppercase tracking-widest text-[8px] block text-center mt-1">{rejectReason}</span>
                                  </div>
                              </div>
                          )}

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `}} />

              </div>
            </div>

            {/* Gate Triggers */}
            <div className="w-full bg-[#020814] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Turnstile Entry</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => triggerScan('VALID')}
                   disabled={!systemActive || gateState !== 'IDLE'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || gateState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   ✅ Valid Ticket (Live Human)
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerScan('PHOTO_SPOOF')}
                   disabled={!systemActive || gateState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || gateState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   📸 Scalper Spoof<br/>(2D Photo)
                 </button>

                 <button 
                   onClick={() => triggerScan('UNREGISTERED')}
                   disabled={!systemActive || gateState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || gateState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   🚫 No Ticket<br/>(Hash Missing)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiometricTicketingGate;
