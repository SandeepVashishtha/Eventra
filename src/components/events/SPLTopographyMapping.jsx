/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SPLTopographyMapping = () => {
  const [mappingActive, setMappingActive] = useState(false);
  const [delayTowersAdjusted, setDelayTowersAdjusted] = useState(false);
  
  // Matrix representing SPL across a 4x4 grid of the crowd
  // Values are dB (70 to 120)
  const [splGrid, setSplGrid] = useState(Array(16).fill(85));
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'IoT SPL Microphone array booted. Connecting to FOH console.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Awaiting spatial audio ingestion.' }
  ]);

  useEffect(() => {
    let loop;
    if (mappingActive) {
      loop = setInterval(() => {
        setSplGrid(prev => {
          return prev.map((val, idx) => {
            // If delay towers are adjusted, smooth out the variance
            if (delayTowersAdjusted) {
              const target = 100 - (Math.floor(idx / 4) * 2); // Gradual roll-off from front to back
              return target + (Math.random() * 4 - 2); 
            }
            
            // Otherwise simulate bad acoustics (bass traps, dead zones)
            if (idx === 12 || idx === 15) {
              return 118 + Math.random() * 5; // Dangerous Bass Trap in back corners
            }
            if (idx === 5 || idx === 6) {
              return 75 + Math.random() * 5; // Phase cancellation dead zone in middle
            }
            if (idx < 4) {
              return 110 + Math.random() * 5; // Very loud at the front rail
            }
            return 90 + Math.random() * 10; // Nominal variance
          });
        });
      }, 500);
    } else {
      setSplGrid(Array(16).fill(85));
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [mappingActive, delayTowersAdjusted]);

  const adjustDelayTowers = () => {
    if (mappingActive && !delayTowersAdjusted) {
      addLog('ACTION', 'Recalculating DSP time-alignment for Delay Towers L & R.');
      setTimeout(() => {
        addLog('SYS', 'Pushing phase alignment correction to L'Acoustics K1 array.');
        setTimeout(() => {
          setDelayTowersAdjusted(true);
          addLog('SUCCESS', 'Dead zones eliminated. Bass traps dispersed. SPL normalized across field.');
        }, 800);
      }, 500);
    }
  };

  const toggleMapping = () => {
    if (!mappingActive) {
      setMappingActive(true);
      setDelayTowersAdjusted(false);
      addLog('SYS', 'Ingesting telemetry from 16 IoT microphones. Generating 3D topographic heat map.');
    } else {
      setMappingActive(false);
      setDelayTowersAdjusted(false);
      addLog('WARN', 'Spatial acoustics mapping offline. FOH flying blind.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper to color map based on SPL danger
  const getSplColor = (db) => {
    if (db >= 115) return '#ef4444'; // Red (Danger)
    if (db >= 105) return '#f97316'; // Orange
    if (db >= 95) return '#fbbf24';  // Yellow
    if (db >= 85) return '#34d399';  // Green (Good)
    return '#3b82f6';                // Blue (Too quiet / Dead zone)
  };

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops/Context Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔈</span> FOH Acoustic Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic SPL <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Topography Mapping</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Front of House (FOH) audio engineers only hear what the mix sounds like from their specific booth. They are often completely unaware of acoustic dead zones caused by phase cancellation or dangerously loud bass traps forming in the back corners of the crowd. Eventra solves this by deploying a grid of IoT SPL microphones across the festival grounds. The dashboard ingests this acoustic data in real-time, generating a dynamic 3D spatial heat map. Engineers can instantly visualize where sound is peaking or dropping out, and algorithmically adjust the DSP timing of the delay towers to ensure a perfect mix for all 80,000 attendees.
          </p>

          <div className="bg-[#0b1221] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Spatial Audio DSP Matrix
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMapping}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     mappingActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {mappingActive ? 'Disconnect Mics' : 'Enable Live Topography'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Average SPL Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mappingActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Global Average SPL
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${mappingActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                     {mappingActive ? (splGrid.reduce((a,b)=>a+b,0)/16).toFixed(1) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">dB(C)</span>
                 </div>
               </div>

               {/* Acoustic Variance Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 delayTowersAdjusted ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 mappingActive ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex flex-col">
                   <span>Spatial Variance (ΔdB)</span>
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     delayTowersAdjusted ? 'text-emerald-400' :
                     mappingActive ? 'text-red-500' : 'text-slate-600'
                   }`}>
                     {mappingActive ? (Math.max(...splGrid) - Math.min(...splGrid)).toFixed(1) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">dB</span>
                 </div>
                 <span className="text-[9px] font-bold mt-2 uppercase tracking-widest text-slate-500">
                   {mappingActive && !delayTowersAdjusted ? '⚠️ High variance detected (Bass Traps)' : 
                    delayTowersAdjusted ? '✅ Acoustic field normalized' : 'Awaiting Data'}
                 </span>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050914] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>DSP Telemetry Log</span>
                 {mappingActive && !delayTowersAdjusted && <span className="text-indigo-400 animate-pulse">Mapping IoT Array...</span>}
                 {delayTowersAdjusted && <span className="text-emerald-400">Delay Aligned</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: 3D Topography Heatmap Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300 ${
              mappingActive && !delayTowersAdjusted ? 'shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 
              delayTowersAdjusted ? 'shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/60 backdrop-blur-sm border-b border-white/10 flex justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Topographic Spl Heatmap
                </span>
                <span className="text-[9px] font-mono text-slate-500">Grid: 4x4 IoT</span>
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-[#02040a] overflow-hidden perspective-[1000px] p-6 pt-12">
                
                {/* 3D Grid representing the crowd area */}
                <div className="relative w-full h-full transform-style-3d rotate-x-[60deg] rotate-z-[-15deg] scale-110">
                  
                  {/* Stage Mockup */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-black border-2 border-slate-700 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Stage</span>
                  </div>

                  {/* FOH Booth */}
                  <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 w-12 h-8 bg-slate-800 border-2 border-slate-600 flex items-center justify-center z-20 shadow-lg">
                    <span className="text-[8px] font-bold text-white">FOH</span>
                  </div>

                  {/* IoT Microphone Grid */}
                  <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full p-2 relative z-10">
                    {splGrid.map((db, idx) => (
                      <div 
                        key={idx}
                        className="relative flex items-center justify-center transition-all duration-500"
                      >
                        {mappingActive && (
                          <>
                            {/* The "Topography" elevation block */}
                            <div 
                              className="absolute bottom-0 w-full rounded-sm opacity-80 shadow-2xl transition-all duration-500"
                              style={{ 
                                height: `${Math.max(10, (db - 60) * 1.5)}%`, 
                                backgroundColor: getSplColor(db),
                                boxShadow: `0 0 15px ${getSplColor(db)}`
                              }}
                            ></div>
                            
                            {/* Data overlay */}
                            <span className="absolute top-1/2 transform -translate-y-1/2 text-[10px] font-black font-mono text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-30">
                              {Math.floor(db)}
                            </span>
                            
                            {/* Warning markers for dangerous zones */}
                            {db >= 115 && !delayTowersAdjusted && (
                              <div className="absolute -top-6 text-[10px] animate-bounce z-40 bg-red-600 text-white px-1 rounded font-bold">TRAP</div>
                            )}
                            {db <= 80 && !delayTowersAdjusted && (
                              <div className="absolute -top-6 text-[10px] animate-bounce z-40 bg-blue-600 text-white px-1 rounded font-bold">DEAD</div>
                            )}
                          </>
                        )}
                        {!mappingActive && (
                          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Floor Grid Lines */}
                  <div className="absolute inset-0 border border-slate-800 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:25%_25%] z-0 pointer-events-none"></div>

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">DSP Calibration Tools</span>
              
              <button 
                onClick={adjustDelayTowers}
                disabled={!mappingActive || delayTowersAdjusted}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !mappingActive || delayTowersAdjusted ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Auto-Align Delay Towers
              </button>
              
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SPLTopographyMapping;
