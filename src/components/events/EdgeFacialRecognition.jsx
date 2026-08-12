/* eslint-disable */
import React, { useState } from 'react';

const EdgeFacialRecognition = () => {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, verified, rejected
  const [processingTime, setProcessingTime] = useState(0);
  
  const [aiLog, setAiLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'VIP Gate Edge Node initialized. Neural network loaded locally.' }
  ]);

  const triggerScan = (isValid) => {
    if (scanState === 'idle' || scanState === 'verified' || scanState === 'rejected') {
      setScanState('scanning');
      setProcessingTime(0);
      addLog('CAM', 'Motion detected at VIP Turnstile 01. Extracting facial geometry...');
      
      const startTime = performance.now();

      setTimeout(() => {
        const endTime = performance.now();
        const duration = Math.floor(endTime - startTime) + Math.floor(Math.random() * 50); // Simulate ~180-200ms
        
        setProcessingTime(duration);

        if (isValid) {
          setScanState('verified');
          addLog('MATCH', `Biometric hash match found. Latency: ${duration}ms (Cloud-free).`);
          addLog('ACTUATOR', 'Transmitting OPEN command to physical turnstile relay.');
        } else {
          setScanState('rejected');
          addLog('ERR', `No biometric hash match. Latency: ${duration}ms.`);
          addLog('ACTUATOR', 'Turnstile remains locked. Redirecting to manual review.');
        }
        
        setTimeout(() => {
          setScanState('idle');
        }, 5000);

      }, 150); // Fast timeout to simulate edge-compute speed
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setAiLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Edge AI / Access Control
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Edge-Computed Facial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Recognition Fast-Track</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            VIP attendees hate waiting in line for manual ID and ticket barcode scans at private entrances. Eventra solves this via opt-in facial recognition. At the VIP gate, edge-computed cameras scan attendees instantly. The AI processes the biometric hash locally—strictly avoiding sending any photos to the cloud to comply with biometric privacy laws—and triggers the physical turnstile to open in less than 200ms.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">👁️</span> Edge Node Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => triggerScan(false)}
                   disabled={scanState === 'scanning'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-200 ${
                     scanState === 'scanning' ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-600'
                   }`}
                 >
                   Simulate Reject
                 </button>
                 <button 
                   onClick={() => triggerScan(true)}
                   disabled={scanState === 'scanning'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     scanState === 'scanning' ? 'bg-emerald-100 text-emerald-500 border border-emerald-200 cursor-not-allowed' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {scanState === 'scanning' ? 'Processing Inference...' : 'Simulate Valid Scan'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Compute Latency */}
               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Inference Latency</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     scanState === 'scanning' ? 'text-slate-300 blur-sm' : 
                     processingTime > 200 ? 'text-orange-500' : 'text-slate-800'
                   }`}>
                     {scanState === 'scanning' ? '---' : processingTime}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-2 pb-1">ms</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                   Cloud-Free Architecture
                 </div>
               </div>

               {/* Gate Actuator Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 scanState === 'verified' ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 
                 scanState === 'rejected' ? 'bg-rose-50 border-rose-200 shadow-inner' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Turnstile Actuator Relay</span>
                 <div className="flex flex-col">
                   {scanState === 'verified' ? (
                     <>
                       <span className="text-3xl font-black font-mono text-emerald-600 leading-tight">
                         UNLOCKED
                       </span>
                       <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">
                         Access Granted
                       </span>
                     </>
                   ) : scanState === 'rejected' ? (
                     <>
                       <span className="text-3xl font-black font-mono text-rose-600 leading-tight">
                         LOCKED
                       </span>
                       <span className="text-[9px] font-bold text-rose-500 mt-1 uppercase tracking-widest">
                         Access Denied
                       </span>
                     </>
                   ) : (
                     <>
                       <span className="text-3xl font-black font-mono text-slate-400 leading-tight">
                         LOCKED
                       </span>
                       <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                         Standby
                       </span>
                     </>
                   )}
                 </div>
               </div>

             </div>

             {/* Edge Processing Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Local Compute Matrix Log</span>
                 {scanState === 'scanning' && <span className="text-emerald-400 animate-pulse">Running Inference...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {aiLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'MATCH' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ERR' ? 'text-rose-400 font-bold' :
                       log.type === 'ACTUATOR' ? 'text-teal-300' :
                       log.type === 'CAM' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Facial Recognition Camera Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-lg border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/50 backdrop-blur-sm border-b border-white/10">
              <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center">
                Edge_Node_VIP_01
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span> LIVE
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden">
               
               {/* Synthetic Camera Feed (Just a gradient to look like a dark entrance) */}
               <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black z-0 opacity-50"></div>

               {/* Simulated Face Bounding Box */}
               {scanState !== 'idle' && (
                 <div className="absolute z-10 w-48 h-56 border-2 border-emerald-500/50 flex flex-col items-center justify-center animate-fade-in">
                   {/* Corner markers */}
                   <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                   <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                   <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                   <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                   
                   {/* Scanning Grid Effect */}
                   {scanState === 'scanning' && (
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100%_4px] animate-[scan_1s_linear_infinite]"></div>
                   )}
                   
                   <style dangerouslySetInnerHTML={{__html: `
                     @keyframes scan {
                       0% { background-position: 0 0; }
                       100% { background-position: 0 100px; }
                     }
                   `}} />

                   {/* Eyes / Biometric tracking artifacts */}
                   {scanState === 'scanning' && (
                     <div className="flex space-x-8 -mt-8">
                       <div className="w-3 h-3 border border-emerald-400 rounded-full flex items-center justify-center animate-ping"><div className="w-1 h-1 bg-emerald-400 rounded-full"></div></div>
                       <div className="w-3 h-3 border border-emerald-400 rounded-full flex items-center justify-center animate-ping" style={{animationDelay: '0.2s'}}><div className="w-1 h-1 bg-emerald-400 rounded-full"></div></div>
                     </div>
                   )}
                   
                   {/* Hash calculation overlay */}
                   {scanState === 'scanning' && (
                     <div className="absolute bottom-2 inset-x-2 bg-black/60 p-1 text-[8px] font-mono text-emerald-400 overflow-hidden whitespace-nowrap">
                       <span className="animate-pulse">Hash: 0x{Math.floor(Math.random()*99999999).toString(16)}...</span>
                     </div>
                   )}
                 </div>
               )}

               {/* Result Overlay */}
               {scanState === 'verified' && (
                 <div className="absolute inset-x-8 bottom-12 bg-emerald-900/90 border border-emerald-500 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in-up z-20 backdrop-blur-sm">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xl mr-3 shadow-inner">
                       ✅
                     </div>
                     <div>
                       <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest leading-none mb-1">Identity Confirmed</p>
                       <p className="text-lg font-black text-white">Alex Johnson</p>
                     </div>
                   </div>
                   <div className="mt-3 pt-3 border-t border-emerald-500/50 flex justify-between">
                     <span className="text-[9px] font-mono text-emerald-300">Ticket: VIP 3-Day Pass</span>
                     <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest animate-pulse">Gate Open</span>
                   </div>
                 </div>
               )}

               {scanState === 'rejected' && (
                 <div className="absolute inset-x-8 bottom-12 bg-rose-900/90 border border-rose-500 rounded-xl p-4 shadow-[0_0_30px_rgba(225,29,72,0.4)] animate-fade-in-up z-20 backdrop-blur-sm">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-xl mr-3 shadow-inner">
                       ❌
                     </div>
                     <div>
                       <p className="text-[10px] text-rose-200 font-bold uppercase tracking-widest leading-none mb-1">Access Denied</p>
                       <p className="text-sm font-black text-white">Hash Not Found</p>
                     </div>
                   </div>
                   <div className="mt-3 pt-3 border-t border-rose-500/50">
                     <span className="text-[9px] font-mono text-rose-300">Please proceed to manual ID check.</span>
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EdgeFacialRecognition;
