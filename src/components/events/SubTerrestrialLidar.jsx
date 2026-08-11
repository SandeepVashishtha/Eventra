/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SubTerrestrialLidar = () => {
  const [sensorsActive, setSensorsActive] = useState(false);
  const [crowdDensity, setCrowdDensity] = useState('NOMINAL'); // NOMINAL, DENSE, CRUSH, TRAMPLE
  
  // Telemetry Metrics
  const [activeNodes, setActiveNodes] = useState(0);
  const [avgPressure, setAvgPressure] = useState(25); // psi
  const [anomalyCount, setAnomalyCount] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Sub-Terrestrial LiDAR matrix booted.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting spatial pressure telemetry.' }
  ]);

  // Heatmap visualization state
  const [gridData, setGridData] = useState(Array(144).fill(0));
  const [alertTarget, setAlertTarget] = useState(null); // {x, y, type}

  useEffect(() => {
    let loop;
    
    if (sensorsActive) {
      loop = setInterval(() => {
          
          let basePressure = 20;
          let centerPressure = 20;
          
          if (crowdDensity === 'NOMINAL') {
              basePressure = 25;
              centerPressure = 30;
          } else if (crowdDensity === 'DENSE') {
              basePressure = 45;
              centerPressure = 75;
          } else if (crowdDensity === 'CRUSH') {
              basePressure = 60;
              centerPressure = 120; // Dangerous levels
          } else if (crowdDensity === 'TRAMPLE') {
              basePressure = 50;
              centerPressure = 80; // Trample has localized extreme anomalies
          }
          
          setAvgPressure(prev => prev + (basePressure - prev) * 0.1);

          // Update grid data
          setGridData(prev => prev.map((_, i) => {
              const x = i % 12;
              const y = Math.floor(i / 12);
              
              // Distance from center (6,6)
              const dx = x - 6;
              const dy = y - 6;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              let val = Math.max(0, centerPressure - (dist * 10)) + (Math.random() * 15);
              
              // Inject anomalies if trample
              if (crowdDensity === 'TRAMPLE' && alertTarget) {
                  if (x === alertTarget.x && y === alertTarget.y) {
                      val = 200; // Static body mass anomaly
                  }
              }

              return Math.min(200, val);
          }));

      }, 150);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [sensorsActive, crowdDensity, alertTarget]);

  const simulateDense = () => {
    if (!sensorsActive) return;
    setCrowdDensity('DENSE');
    setAlertTarget(null);
    addLog('ACTION', 'Crowd condensing near center stage barriers.');
    addLog('SYS', 'Spatial pressure nominal. Monitor for surge vectors.');
  };

  const simulateCrush = () => {
    if (!sensorsActive) return;
    setCrowdDensity('CRUSH');
    setAlertTarget(null);
    addLog('WARN', 'MASS SURGE DETECTED. Forward pressure exceeding 100psi.');
    addLog('AI', 'WARNING: Crowd crush dynamics forming at Sector 4. Dispatching barrier security.');
    setAnomalyCount(prev => prev + 1);
  };

  const simulateTrample = () => {
    if (!sensorsActive) return;
    setCrowdDensity('TRAMPLE');
    
    // Pick a random location near center
    const x = Math.floor(Math.random() * 4) + 4;
    const y = Math.floor(Math.random() * 4) + 4;
    
    setAlertTarget({ x, y, type: 'FALL_DETECTED' });
    
    addLog('CRIT', `MEDICAL EMERGENCY: Static anomaly detected at Coordinates [${x}, ${y}].`);
    addLog('AI', 'Profile matches a fallen attendee being trampled. Top-down visibility is zero.');
    addLog('ACTION', `Routing rapid-response EMTs to exact GPS coordinates immediately.`);
    setAnomalyCount(prev => prev + 1);
  };

  const toggleSensors = () => {
    if (!sensorsActive) {
      setSensorsActive(true);
      setActiveNodes(14400);
      setCrowdDensity('NOMINAL');
      addLog('SYS', '14,400 LiDAR/Pressure nodes online. Analyzing bi-pedal footfalls.');
    } else {
      setSensorsActive(false);
      setActiveNodes(0);
      setCrowdDensity('NOMINAL');
      setAlertTarget(null);
      setGridData(Array(144).fill(0));
      addLog('WARN', 'Sub-terrestrial telemetry offline. Relying on top-down cameras.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Telemetry Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Life-Safety Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Sub-Terrestrial LiDAR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Crowd Crush Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Top-down surveillance cameras fail to detect dangerous crowd surges or trampling events when attendees are packed shoulder-to-shoulder, as people on the ground are completely obscured by the bodies above them. Eventra solves this by embedding a sub-terrestrial matrix of LiDAR and pressure sensors directly into the structural flooring of the festival. This AI-driven dashboard tracks real-time spatial pressure. If the system detects the localized impact footprint of someone falling and not getting back up during a surge, it instantly routes EMTs to the exact XYZ coordinate before a fatality occurs.
          </p>

          <div className="bg-[#140b0b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🦶</span> Biomechanical Pressure Matrix
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSensors}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     sensorsActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {sensorsActive ? 'Deactivate Matrix' : 'Engage Sub-Terrestrial LiDAR'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sensorsActive ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Floor Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     sensorsActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeNodes.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Avg Pressure */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 avgPressure > 80 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 sensorsActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Avg Spatial Pressure
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     avgPressure > 80 ? 'text-orange-400 animate-pulse' :
                     sensorsActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(avgPressure)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">psi</span>
                 </div>
               </div>
               
               {/* Anomalies Detected */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 anomalyCount > 0 ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Anomalies Detected
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     anomalyCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {anomalyCount}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Events</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090303] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Anomaly Log</span>
                 {crowdDensity === 'CRUSH' && <span className="text-orange-400 animate-pulse">MASS SURGE DETECTED</span>}
                 {crowdDensity === 'TRAMPLE' && <span className="text-rose-500 animate-pulse">MEDICAL EMERGENCY</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Heatmap Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">FLOOR LiDAR FEED</span>
                <span className="text-[8px] font-mono text-slate-400">PRESSURE HEATMAP</span>
              </div>

              <div className="flex-1 relative bg-[#050202] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Stage Reference */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-slate-800 rounded flex items-center justify-center z-20">
                    <span className="text-[6px] font-black uppercase tracking-widest text-slate-500 absolute -top-3">MAIN STAGE BARRIER</span>
                </div>

                {!sensorsActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center z-10">
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                   </div>
                ) : (
                  <div className="flex-1 relative mt-4">
                      
                      {/* Grid representation (12x12) */}
                      <div className="w-full h-full grid grid-cols-12 grid-rows-12 gap-0.5 opacity-90 mix-blend-screen">
                          {gridData.map((val, i) => {
                              // Color gradient calculation based on pressure (val)
                              // Low: Blue, Med: Green/Yellow, High: Red, Extreme: White
                              let r=0, g=0, b=0, a=0.8;
                              
                              if (val < 20) {
                                  r = 15; g = 23; b = 42; // slate-900
                                  a = 0.5;
                              } else if (val < 60) {
                                  r = 16; g = 185; b = 129; // emerald-500
                              } else if (val < 100) {
                                  r = 234; g = 179; b = 8; // yellow-500
                              } else if (val < 160) {
                                  r = 249; g = 115; b = 22; // orange-500
                              } else {
                                  r = 225; g = 29; b = 72; // rose-600
                                  if (val > 190) { r=255; g=255; b=255; } // Critical white-hot
                              }

                              const isAlertTarget = alertTarget && (i % 12 === alertTarget.x) && (Math.floor(i / 12) === alertTarget.y);
                              
                              return (
                                  <div 
                                      key={i} 
                                      className={`w-full h-full rounded-[1px] transition-colors duration-[150ms] ${isAlertTarget ? 'animate-pulse ring-2 ring-white z-10 scale-150' : ''}`}
                                      style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }}
                                  ></div>
                              )
                          })}
                      </div>

                      {/* Topographic Contour overlay effect */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050202]/50 to-[#050202] pointer-events-none"></div>

                      {/* HUD Overlays */}
                      {crowdDensity === 'CRUSH' && (
                         <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex justify-center z-30 pointer-events-none w-full">
                             <div className="bg-orange-950/90 border border-orange-500/50 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_rgba(249,115,22,0.6)] backdrop-blur-sm animate-pulse">
                                <span className="text-[12px] font-black uppercase tracking-widest text-orange-400">DANGEROUS SURGE VECTORS</span>
                                <span className="text-[9px] font-mono text-white mt-1">Sustained barrier pressure >100psi.</span>
                             </div>
                         </div>
                      )}

                      {crowdDensity === 'TRAMPLE' && alertTarget && (
                         <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex justify-center z-30 pointer-events-none w-full">
                             <div className="bg-rose-950/90 border-2 border-rose-500 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_40px_rgba(225,29,72,0.8)] backdrop-blur-sm">
                                <span className="text-[14px] font-black uppercase tracking-widest text-white flex items-center">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-ping"></span>
                                    MEDICAL EMERGENCY
                                </span>
                                <span className="text-[9px] font-mono text-rose-300 mt-1">Static footprint detected. Probable trample.</span>
                                <div className="mt-2 bg-black px-2 py-1 rounded border border-rose-900 flex space-x-2">
                                    <span className="text-[8px] font-mono text-slate-400">ROUTING EMT TO:</span>
                                    <span className="text-[8px] font-mono text-white">X:{alertTarget.x} Y:{alertTarget.y}</span>
                                </div>
                             </div>
                         </div>
                      )}
                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#140b0b] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Crowd Dynamics</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={simulateDense}
                   disabled={!sensorsActive || crowdDensity === 'DENSE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !sensorsActive || crowdDensity === 'DENSE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                   }`}
                 >
                   Dense Crowd
                 </button>
                 
                 <button 
                   onClick={simulateCrush}
                   disabled={!sensorsActive || crowdDensity === 'CRUSH'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !sensorsActive || crowdDensity === 'CRUSH' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                   }`}
                 >
                   Mass Surge
                 </button>

                 <button 
                   onClick={simulateTrample}
                   disabled={!sensorsActive || crowdDensity === 'TRAMPLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !sensorsActive || crowdDensity === 'TRAMPLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-white hover:bg-rose-900/60 shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse'
                   }`}
                 >
                   Inject Trample
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SubTerrestrialLidar;
