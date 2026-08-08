/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EdgeComputeAcousticThreat = () => {
  const [networkActive, setNetworkActive] = useState(false);
  const [threatStatus, setThreatStatus] = useState('NOMINAL'); // NOMINAL, ANALYZING, THREAT_DETECTED
  
  // Acoustic Metrics
  const [activeMics, setActiveMics] = useState(0);
  const [ambientNoiseSPL, setAmbientNoiseSPL] = useState(115);
  const [lastTDOA, setLastTDOA] = useState('N/A');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Edge-Compute Acoustic Array online.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Neural acoustic classifier loaded into hardware memory.' }
  ]);

  // Triangulation Map State
  const [micNodes, setMicNodes] = useState([]);
  const [threatOrigin, setThreatOrigin] = useState(null);

  useEffect(() => {
    // Generate Mic Array along the perimeter/trussing
    const nodes = [];
    for(let i=0; i<12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        nodes.push({
            id: `MIC-${i+1}`,
            x: 50 + Math.cos(angle) * 40,
            y: 50 + Math.sin(angle) * 40,
            status: 'ACTIVE'
        });
    }
    setMicNodes(nodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (networkActive) {
      if (threatStatus === 'NOMINAL') {
        loop = setInterval(() => {
          setActiveMics(12);
          setAmbientNoiseSPL(115 + (Math.random() * 4 - 2)); // Normal festival loud noise
        }, 300);
      } else if (threatStatus === 'ANALYZING') {
         // Simulate neural net analyzing the sound
         let step = 0;
         loop = setInterval(() => {
            step++;
            if (step > 15) {
                clearInterval(loop);
                setThreatStatus('THREAT_DETECTED');
                setLastTDOA('14.2ms variance');
                
                // Set threat coordinates
                setThreatOrigin({ x: 65, y: 35, type: 'BALLISTIC_ANOMALY' });
                
                addLog('CRIT', 'High-Velocity Acoustic Anomaly classified. Match confidence: 99.4%');
                addLog('ACTION', 'TDOA Triangulation complete. Dispatching exact XYZ coordinates to Law Enforcement.');
            }
         }, 100);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [networkActive, threatStatus]);

  const triggerFirework = () => {
    if (networkActive && threatStatus === 'NOMINAL') {
      addLog('WARN', 'Loud pop detected. Neural classifier analyzing signature...');
      setAmbientNoiseSPL(135); // Sudden spike
      setTimeout(() => {
         addLog('SYS', 'Signature matched: Pyrotechnic/Firework. Ignored.');
      }, 1500);
    }
  };

  const triggerThreat = () => {
    if (networkActive && threatStatus === 'NOMINAL') {
      setThreatStatus('ANALYZING');
      setAmbientNoiseSPL(142); // Ballistic shockwave spike
      addLog('WARN', 'Extreme Acoustic Transient detected. Engaging TDOA triangulation over 12 nodes...');
    }
  };

  const resetNetwork = () => {
    setThreatStatus('NOMINAL');
    setThreatOrigin(null);
    setLastTDOA('N/A');
    addLog('SYS', 'System reset. Resuming nominal monitoring.');
  };

  const toggleNetwork = () => {
    if (!networkActive) {
      setNetworkActive(true);
      addLog('SYS', 'Acoustic Threat Detection armed. Edge microphones actively listening.');
    } else {
      setNetworkActive(false);
      resetNetwork();
      setActiveMics(0);
      addLog('WARN', 'Threat Detection Offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Public Safety Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Edge-Compute Acoustic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Threat Detection Array</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In a high-noise festival environment (115dB+), it is nearly impossible for attendees or security to identify the source or nature of a loud pop, heavily delaying police response. Eventra deploys specialized edge-compute microphones across the festival trussing. The system runs a low-latency neural acoustic classifier directly on the hardware. If a ballistic shockwave or gunshot signature is detected over the loud music, the system uses time-difference-of-arrival (TDOA) across the mic array to triangulate the exact XYZ coordinates, instantly alerting law enforcement.
          </p>

          <div className="bg-[#0b0404] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎙️</span> Hardware Classifier Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     networkActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(185,28,28,0.5)]'
                   }`}
                 >
                   {networkActive ? 'Disarm Acoustic Array' : 'Initialize TDOA Network'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Edge Microphones */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Edge Mics
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     networkActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeMics}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Nodes</span>
                 </div>
               </div>

               {/* Ambient Noise */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 threatStatus === 'THREAT_DETECTED' ? 'bg-red-950/60 border-red-500/80 shadow-inner' :
                 networkActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Spl Floor
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     threatStatus === 'THREAT_DETECTED' ? 'text-red-500' :
                     networkActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(ambientNoiseSPL)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* TDOA Variance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 threatStatus === 'THREAT_DETECTED' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   TDOA Triangulation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-lg font-black font-mono leading-tight ${
                     threatStatus === 'THREAT_DETECTED' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {lastTDOA}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Neural Classifier Log</span>
                 {threatStatus === 'ANALYZING' && <span className="text-orange-400 animate-pulse">Running DSP Inference...</span>}
                 {threatStatus === 'THREAT_DETECTED' && <span className="text-red-500 animate-pulse">THREAT CONFIRMED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* TDOA Triangulation Map */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">SPATIAL TRIANGULATION</span>
                <span className="text-[8px] font-mono text-slate-400">TDOA SENSOR GRID</span>
              </div>

              <div className="flex-1 relative bg-[#020306] overflow-hidden flex flex-col">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                {/* Nodes and Triangulation Graphics */}
                <div className="absolute inset-0 z-10">
                    
                    {/* The Mic Nodes */}
                    {micNodes.map(mic => (
                        <div 
                            key={mic.id}
                            className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${networkActive ? 'bg-blue-400 shadow-[0_0_5px_#60a5fa]' : 'bg-slate-700'}`}
                            style={{ top: `${mic.y}%`, left: `${mic.x}%` }}
                        >
                            {/* Listening Pulse */}
                            {networkActive && threatStatus === 'NOMINAL' && (
                                <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-50"></div>
                            )}
                        </div>
                    ))}

                    {/* Analyzing / Triangulating State */}
                    {threatStatus === 'ANALYZING' && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {micNodes.map((mic, i) => (
                                <line 
                                    key={i} 
                                    x1="50%" y1="50%" 
                                    x2={`${mic.x}%`} y2={`${mic.y}%`} 
                                    stroke="rgba(6, 182, 212, 0.4)" 
                                    strokeWidth="1" 
                                    strokeDasharray="2 2"
                                    className="animate-pulse"
                                />
                            ))}
                        </svg>
                    )}

                    {/* Threat Origin Render */}
                    {threatOrigin && (
                        <>
                            {/* Exact XYZ marker */}
                            <div 
                                className="absolute w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_20px_#ef4444]"
                                style={{ top: `${threatOrigin.y}%`, left: `${threatOrigin.x}%` }}
                            >
                                <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                            
                            {/* Lines from mics to threat (TDOA Vectors) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                {micNodes.map((mic, i) => {
                                    // Only draw lines from a few closest mics to simulate triangulation
                                    if (i % 3 !== 0) return null;
                                    return (
                                        <line 
                                            key={i} 
                                            x1={`${threatOrigin.x}%`} y1={`${threatOrigin.y}%`} 
                                            x2={`${mic.x}%`} y2={`${mic.y}%`} 
                                            stroke="rgba(239, 68, 68, 0.6)" 
                                            strokeWidth="1.5" 
                                        />
                                    );
                                })}
                            </svg>
                        </>
                    )}
                </div>
                
                {/* Alert Overlays */}
                {threatStatus === 'ANALYZING' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col z-30 bg-black/80 p-3 rounded border border-orange-500/50 text-center backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">ACOUSTIC ANOMALY</span>
                    <span className="text-[8px] font-mono text-white">Running Neural Inference...</span>
                  </div>
                )}

                {threatStatus === 'THREAT_DETECTED' && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col z-30 bg-red-950/90 p-3 rounded border border-red-500/80 text-center shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse w-3/4 backdrop-blur-sm">
                    <span className="text-[12px] font-black uppercase tracking-widest text-white border-b border-red-500/50 pb-1 mb-1">BALLISTIC THREAT CONFIRMED</span>
                    <span className="text-[8px] font-mono text-red-200">Coords: 34.0522° N, 118.2437° W</span>
                    <span className="text-[8px] font-mono text-cyan-400 mt-1 bg-black/50 py-1">API: Law Enforcement Dispatched</span>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={triggerFirework}
                disabled={!networkActive || threatStatus !== 'NOMINAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !networkActive || threatStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Inject Pyrotechnic Pop
              </button>
              
              <button 
                onClick={triggerThreat}
                disabled={!networkActive || threatStatus !== 'NOMINAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !networkActive || threatStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Ballistic Anomaly
              </button>
            </div>
            
            <button 
                onClick={resetNetwork}
                disabled={threatStatus === 'NOMINAL'}
                className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  threatStatus === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Acoustic Sensors
              </button>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EdgeComputeAcousticThreat;
