/* eslint-disable */
import React, { useState, useEffect } from 'react';

const KineticEnergyHarvesting = () => {
  const [gridActive, setGridActive] = useState(false);
  const [crowdState, setCrowdState] = useState('IDLE'); // IDLE, DANCING, MOSHPIT, JUMPING
  
  // Energy Metrics
  const [currentPower, setCurrentPower] = useState(0); // kW
  const [totalEnergy, setTotalEnergy] = useState(1450.5); // kWh
  const [gridSaturation, setGridSaturation] = useState(45); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Piezoelectric Dancefloor Array initialized.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting mechanical stress telemetry.' }
  ]);

  // Floor grid visualization
  const [floorTiles, setFloorTiles] = useState(Array(100).fill(0));

  useEffect(() => {
    let loop;
    
    if (gridActive) {
      loop = setInterval(() => {
          
          let targetPower = 0;
          let tileActivity = 0.1;
          
          if (crowdState === 'DANCING') {
              targetPower = 250 + Math.random() * 50;
              tileActivity = 0.4;
          } else if (crowdState === 'JUMPING') {
              targetPower = 800 + Math.random() * 200;
              tileActivity = 0.9;
          } else if (crowdState === 'MOSHPIT') {
              targetPower = 600 + Math.random() * 300;
              tileActivity = 0.7; // localized but intense
          } else {
              targetPower = Math.random() * 20; // just walking
          }
          
          // Smooth power transition
          setCurrentPower(prev => {
             const diff = targetPower - prev;
             return prev + (diff * 0.2);
          });
          
          // Accumulate total energy (kW to kWh conversion roughly simulated for speed)
          setTotalEnergy(prev => prev + (targetPower / 3600));
          
          // Grid saturation
          setGridSaturation(prev => Math.min(100, prev + (targetPower > 500 ? 0.5 : (targetPower < 100 ? -0.1 : 0))));

          // Visual tiles
          setFloorTiles(prev => prev.map(() => {
              if (crowdState === 'MOSHPIT') {
                  // Moshpit is a circle in the middle
                  return Math.random() > 0.7 ? Math.random() * 100 : 0;
              } else {
                  return Math.random() < tileActivity ? Math.random() * 100 : Math.random() * 20;
              }
          }));

      }, 100);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [gridActive, crowdState]);

  const simulateCrowd = (state, logMsg) => {
    if (!gridActive) return;
    setCrowdState(state);
    addLog('ACTION', logMsg);
    if (state === 'JUMPING') {
        addLog('AI', 'Mass synchronous mechanical impact detected. Power generation spiking.');
    } else if (state === 'MOSHPIT') {
        addLog('WARN', 'Irregular high-velocity impacts detected in Sector B.');
    }
  };

  const toggleGrid = () => {
    if (!gridActive) {
      setGridActive(true);
      addLog('SYS', 'Micro-Grid Relays closed. Piezoelectric harvesting active.');
    } else {
      setGridActive(false);
      setCrowdState('IDLE');
      setCurrentPower(0);
      setFloorTiles(Array(100).fill(0));
      addLog('WARN', 'Harvesting disabled. Relying entirely on diesel generators.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0f05] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Energy Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Renewable Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic Dancefloor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">Energy Harvesting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive electronic festivals consume megawatts of diesel-generated power, drawing intense criticism for their carbon footprint. Eventra solves this by installing piezoelectric kinetic energy tiles across the main stage dancefloor. This telemetry dashboard tracks the real-time mechanical stress of 50,000 attendees dancing and jumping in unison, converting their physical exertion directly into stored electrical kilowatts to power the massive LED screens and audio amplifiers, proving that raving can be sustainable.
          </p>

          <div className="bg-[#121c0b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🔋</span> Kinetic Micro-Grid
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleGrid}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     gridActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-white shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {gridActive ? 'Disconnect Floor Array' : 'Engage Piezoelectric Floor'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Live Output */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 currentPower > 600 ? 'bg-lime-950/40 border-lime-500/50 shadow-inner' :
                 gridActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Live Output
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     currentPower > 600 ? 'text-lime-400 animate-pulse' :
                     gridActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(currentPower)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

               {/* Total Energy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Harvested Total
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gridActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {totalEnergy.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kWh</span>
                 </div>
               </div>
               
               {/* Battery Saturation */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridSaturation > 90 ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Battery Saturation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gridSaturation > 90 ? 'text-yellow-400' : 'text-slate-600'
                   }`}>
                     {gridSaturation.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050802] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Transducer Telemetry Log</span>
                 {currentPower > 600 && <span className="text-lime-400 animate-pulse">GRID OVERFLOWING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-lime-400 font-bold' :
                       log.type === 'AI' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-400">FLOOR POV</span>
                <span className="text-[8px] font-mono text-slate-400">PIEZOELECTRIC HEATMAP</span>
              </div>

              <div className="flex-1 relative bg-[#020501] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Stage Reference */}
                <div className="w-full h-8 bg-black border-b border-slate-800 mb-4 flex items-center justify-center relative">
                    <span className="text-[10px] font-black uppercase text-slate-600">MAIN STAGE</span>
                    {/* Energy beam from floor to stage */}
                    {currentPower > 100 && (
                        <div className="absolute -bottom-2 w-full h-4 bg-gradient-to-t from-lime-500/0 to-lime-500/50 animate-pulse pointer-events-none blur-sm"></div>
                    )}
                </div>

                {!gridActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center z-10">
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FLOOR ARRAY DEACTIVATED</span>
                   </div>
                ) : (
                  <div className="flex-1 relative">
                      
                      {/* Grid representation */}
                      <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-1 perspective-[800px] transform rotateX-[30deg]">
                          {floorTiles.map((intensity, i) => {
                              // Center logic for moshpit
                              const row = Math.floor(i / 10);
                              const col = i % 10;
                              const isCenter = row >= 3 && row <= 6 && col >= 3 && col <= 6;
                              
                              let colorClass = 'bg-slate-900/50';
                              let shadow = 'none';
                              
                              if (intensity > 80) {
                                  colorClass = 'bg-lime-400';
                                  shadow = '0 0 15px rgba(163, 230, 53, 0.8)';
                              } else if (intensity > 40) {
                                  colorClass = 'bg-emerald-500';
                                  shadow = '0 0 10px rgba(16, 185, 129, 0.5)';
                              } else if (intensity > 10) {
                                  colorClass = 'bg-teal-700';
                              }

                              if (crowdState === 'MOSHPIT' && isCenter && intensity === 0) {
                                  // The hole in the middle of a moshpit
                                  colorClass = 'bg-black border border-red-900/30';
                              }

                              return (
                                  <div 
                                      key={i} 
                                      className={`w-full h-full rounded-sm transition-colors duration-100 border border-black/50 ${colorClass}`}
                                      style={{ boxShadow: shadow }}
                                  ></div>
                              )
                          })}
                      </div>

                      {/* HUD Overlay */}
                      {crowdState === 'JUMPING' && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="bg-lime-950/80 border border-lime-500 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_rgba(163,230,53,0.5)] animate-pulse">
                                <span className="text-[12px] font-black uppercase tracking-widest text-lime-400">MASS KINETIC EVENT</span>
                                <span className="text-[9px] font-mono text-white mt-1">Generating +1MW Peak Power</span>
                             </div>
                         </div>
                      )}
                      {crowdState === 'MOSHPIT' && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="bg-red-950/80 border border-red-500 px-4 py-1.5 rounded flex items-center shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">IRREGULAR STRESS DETECTED</span>
                             </div>
                         </div>
                      )}
                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#121c0b] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Crowd Mechanics</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => simulateCrowd('DANCING', 'Crowd activity: Standard dancing (120 BPM).')}
                   disabled={!gridActive || crowdState === 'DANCING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !gridActive || crowdState === 'DANCING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-teal-950/40 border-teal-900 text-teal-400 hover:bg-teal-900/60'
                   }`}
                 >
                   Standard Dancing
                 </button>
                 
                 <button 
                   onClick={() => simulateCrowd('MOSHPIT', 'Crowd activity: Circular moshpit formation.')}
                   disabled={!gridActive || crowdState === 'MOSHPIT'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !gridActive || crowdState === 'MOSHPIT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Circular Moshpit
                 </button>
               </div>
               
               <button 
                   onClick={() => simulateCrowd('JUMPING', 'Crowd activity: Unison jumping (Bass Drop).')}
                   disabled={!gridActive || crowdState === 'JUMPING'}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !gridActive || crowdState === 'JUMPING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-lime-950/40 border-lime-500 text-lime-400 hover:bg-lime-900 shadow-[0_0_15px_rgba(163,230,53,0.3)] animate-pulse'
                   }`}
                 >
                   Bass Drop (Mass Unison Jump)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default KineticEnergyHarvesting;
