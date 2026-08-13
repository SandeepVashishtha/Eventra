/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveLogisticsTeardown = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Logistics Metrics
  const [activeTrucks, setActiveTrucks] = useState(0); 
  const [idleTimeReduced, setIdleTimeReduced] = useState(0); // hours
  const [overtimeSaved, setOvertimeSaved] = useState(0); // USD
  const [loadingEfficiency, setLoadingEfficiency] = useState(45); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Stage teardown initiated. 52 semi-trucks registered.' },
    { id: 2, time: '23:00:02', type: 'WARN', msg: 'Manual coordination detecting heavy dock contention.' }
  ]);

  // Visualizer State
  // Unoptimized layout (lots of gaps, overlap) vs Optimized layout (packed tight)
  const generateSchedule = (optimized) => {
      return [
          { id: 'T_AUDIO_1', type: 'AUDIO', dock: 'DOCK_A', start: optimized ? 0 : 5, duration: 20, color: '#3b82f6' },
          { id: 'T_AUDIO_2', type: 'AUDIO', dock: 'DOCK_A', start: optimized ? 22 : 45, duration: 18, color: '#3b82f6' },
          { id: 'T_LIGHT_1', type: 'LIGHTING', dock: 'DOCK_B', start: optimized ? 0 : 20, duration: 30, color: '#eab308' },
          { id: 'T_LIGHT_2', type: 'LIGHTING', dock: 'DOCK_B', start: optimized ? 32 : 65, duration: 25, color: '#eab308' },
          { id: 'T_VIDEO_1', type: 'VIDEO', dock: 'DOCK_C', start: optimized ? 0 : 10, duration: 15, color: '#a855f7' },
          { id: 'T_VIDEO_2', type: 'VIDEO', dock: 'DOCK_C', start: optimized ? 17 : 40, duration: 20, color: '#a855f7' },
          { id: 'T_RIGGING', type: 'RIGGING', dock: 'DOCK_C', start: optimized ? 39 : 75, duration: 25, color: '#ec4899' },
      ];
  };

  const [truckSchedule, setTruckSchedule] = useState(generateSchedule(false));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveTrucks(12 + Math.floor(Math.random() * 4));
          
          if (isOptimized) {
              setIdleTimeReduced(prev => Math.min(142, prev + 2.5));
              setOvertimeSaved(prev => Math.min(45000, prev + 850));
              setLoadingEfficiency(prev => Math.min(94, prev + 2));
          } else {
              setLoadingEfficiency(45 + Math.random() * 5);
          }

      }, 500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isOptimized]);

  const optimizeSchedule = () => {
      if (!systemActive || isOptimized) return;
      
      addLog('SYS', 'Running ML predictive routing on historical load-out data...');
      
      setTimeout(() => {
          setIsOptimized(true);
          setTruckSchedule(generateSchedule(true));
          addLog('SUCCESS', 'ML Pipeline complete. Generated minute-by-minute dock schedule.');
          addLog('ACTION', 'Auto-dispatching push notifications to 52 truck drivers & crew chiefs.');
      }, 1500);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setIsOptimized(false);
      setIdleTimeReduced(0);
      setOvertimeSaved(0);
      setTruckSchedule(generateSchedule(false));
      addLog('SYS', 'Logistics command center online. Analyzing manifest.');
    } else {
      setSystemActive(false);
      setActiveTrucks(0);
      setIsOptimized(false);
      addLog('WARN', 'Command center offline. Reverting to manual clipboard scheduling.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚛</span> Operations Research
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Logistics ML <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">for Stage Teardown</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Stage teardown (load-out) is a chaotic, inefficient process where dozens of semi-trucks idle for hours waiting for specific lighting rigs or audio gear to be disassembled, costing tens of thousands in union overtime. Eventra solves this by developing a predictive Machine Learning pipeline trained on historical load-out schedules, equipment manifests, and crew sizes. The ML model generates an optimized, minute-by-minute loading dock schedule and disassembly sequence, dynamically dispatching push notifications to crew chiefs and truck drivers to eliminate dock contention.
          </p>

          <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Logistics Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Operations' : 'Initialize Command'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Efficiency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && isOptimized ? 'bg-emerald-950/40 border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                 systemActive && !isOptimized ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Efficiency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive && isOptimized ? 'text-emerald-400' : 
                     systemActive ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {loadingEfficiency.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Active Trucks */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Trucks
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeTrucks}
                   </span>
                 </div>
               </div>
               
               {/* Idle Time Reduced */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isOptimized ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Idle Cut
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isOptimized ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {idleTimeReduced.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">hrs</span>
                 </div>
               </div>
               
               {/* Overtime Saved */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isOptimized ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Union OT Saved
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                       <span className={`text-2xl font-black font-mono leading-none ${
                         isOptimized ? 'text-emerald-400' : 'text-slate-600'
                       }`}>
                         {(overtimeSaved / 1000).toFixed(1)}k
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dispatch Ledger</span>
                 {isOptimized && <span className="text-yellow-400 font-black animate-pulse">OPTIMIZED ROUTING ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* ML Logistics Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0a0a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">LOAD-OUT GANTT</span>
                <span className="text-[8px] font-mono text-slate-400">STATE: {isOptimized ? 'OPTIMIZED' : 'MANUAL'}</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SYSTEM OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col px-4">
                        
                        {/* Time Ruler */}
                        <div className="w-full flex justify-between text-[6px] font-mono text-slate-500 border-b border-slate-800 pb-1 mb-2 ml-12">
                            <span>00:00</span>
                            <span>01:00</span>
                            <span>02:00</span>
                            <span>03:00</span>
                            <span>04:00</span>
                        </div>

                        {/* Docks */}
                        <div className="flex-1 flex flex-col justify-around relative">
                            
                            {/* Vertical Grid Lines */}
                            <div className="absolute inset-0 ml-12 flex justify-between pointer-events-none">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-px h-full bg-slate-800/50 border-r border-dashed border-slate-700/30"></div>
                                ))}
                            </div>

                            {['DOCK_A', 'DOCK_B', 'DOCK_C'].map((dock, index) => (
                                <div key={dock} className="relative h-12 flex items-center w-full">
                                    {/* Dock Label */}
                                    <div className="w-12 shrink-0 bg-slate-900 h-full flex flex-col items-center justify-center border-r border-slate-700 z-30">
                                        <span className="text-[6px] font-black text-slate-400">DOCK</span>
                                        <span className="text-xs font-black text-slate-200">{['A','B','C'][index]}</span>
                                    </div>
                                    
                                    {/* Track */}
                                    <div className="flex-1 h-full bg-slate-950 relative overflow-hidden">
                                        {/* Truck Blocks */}
                                        {truckSchedule.filter(t => t.dock === dock).map(truck => (
                                            <div 
                                                key={truck.id}
                                                className="absolute h-8 top-2 rounded-sm border transition-all duration-1000 ease-in-out flex flex-col justify-center px-1 overflow-hidden"
                                                style={{ 
                                                    left: `${truck.start}%`, 
                                                    width: `${truck.duration}%`,
                                                    backgroundColor: `${truck.color}33`, // 20% opacity
                                                    borderColor: truck.color
                                                }}
                                            >
                                                <span className="text-[5px] font-black tracking-wider" style={{ color: truck.color }}>{truck.type}</span>
                                                <span className="text-[4px] font-mono text-slate-400">{truck.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-2 border-t border-slate-800 flex justify-center space-x-4">
                            <div className="flex items-center"><span className="w-2 h-2 bg-[#3b82f6] rounded-sm mr-1"></span><span className="text-[6px] text-slate-500">AUDIO</span></div>
                            <div className="flex items-center"><span className="w-2 h-2 bg-[#eab308] rounded-sm mr-1"></span><span className="text-[6px] text-slate-500">LIGHTING</span></div>
                            <div className="flex items-center"><span className="w-2 h-2 bg-[#a855f7] rounded-sm mr-1"></span><span className="text-[6px] text-slate-500">VIDEO</span></div>
                            <div className="flex items-center"><span className="w-2 h-2 bg-[#ec4899] rounded-sm mr-1"></span><span className="text-[6px] text-slate-500">RIGGING</span></div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate ML Engine</span>
               
               <button 
                   onClick={optimizeSchedule}
                   disabled={!systemActive || isOptimized}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || isOptimized ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                   }`}
                 >
                   🧠 Run ML Optimizer
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveLogisticsTeardown;
