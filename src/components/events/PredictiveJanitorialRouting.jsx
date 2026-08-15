/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveJanitorialRouting = () => {
  const [isRouting, setIsRouting] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Operations Research routing engine online. Ingesting schedule telemetry.' }
  ]);

  const restrooms = [
      { id: 'RR-A', name: 'Main Stage Restrooms', capacity: 95, color: 'text-rose-500', bg: 'bg-rose-950/50', border: 'border-rose-900', x: 20, y: 20 },
      { id: 'RR-B', name: 'Food Court Restrooms', capacity: 42, color: 'text-amber-500', bg: 'bg-amber-950/50', border: 'border-amber-900', x: 80, y: 30 },
      { id: 'RR-C', name: 'EDM Tent Restrooms', capacity: 88, color: 'text-orange-500', bg: 'bg-orange-950/50', border: 'border-orange-900', x: 50, y: 80 },
      { id: 'RR-D', name: 'VIP Lounge Restrooms', capacity: 15, color: 'text-emerald-500', bg: 'bg-emerald-950/50', border: 'border-emerald-900', x: 10, y: 70 },
  ];

  const generateRoute = () => {
      setIsRouting(true);
      setActiveRoute(null);
      addLog('ACTION', 'Main Stage set just ended. 5,000 attendees surging towards RR-A.');
      addLog('SYS', 'Calculating critical utilization thresholds based on crowd telemetry...');
      
      setTimeout(() => {
          addLog('SYS', 'Executing Traveling Salesperson (TSP) variant with capacity weights...');
          
          setTimeout(() => {
              // Optimized route prioritizes highest capacity first, while minimizing distance
              setActiveRoute(['RR-A', 'RR-C', 'RR-B']);
              setIsRouting(false);
              addLog('SUCCESS', 'Optimal path generated: RR-A -> RR-C -> RR-B. VIP (RR-D) bypassed to save time.');
              addLog('ACTION', 'Dispatching turn-by-turn navigation to Janitorial Squad Alpha.');
          }, 1500);
      }, 1500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> Smart Logistics & Ops Research
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Janitorial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Dispatch Routing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Restrooms become biohazards because janitorial staff clean them on fixed hourly schedules, ignoring the fact that a specific restroom just saw a surge of 5,000 people after a main stage set ended. Eventra solves this using an Operations Research routing engine. It ingests the schedule and crowd density estimates to predict restroom utilization, dynamically generating an optimized path (a TSP variant) to dispatch staff exactly when facilities reach critical capacity.
          </p>

          <div className="bg-[#120a03] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> Operations Center
               </h3>
               <button 
                     onClick={generateRoute}
                     disabled={isRouting}
                     className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition shadow-md flex items-center whitespace-nowrap disabled:opacity-50"
                 >
                     <span className="mr-2">⚡</span> {isRouting ? 'Calculating Path...' : 'Generate Dispatch Route'}
                 </button>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                 {restrooms.map(rr => (
                     <div key={rr.id} className={`border ${rr.border} ${rr.bg} rounded-xl p-4 flex flex-col justify-center`}>
                         <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-white">{rr.name}</span>
                             <span className="text-lg">🚽</span>
                         </div>
                         <div className="w-full bg-slate-900 rounded-full h-1.5 mb-1 overflow-hidden">
                             <div className={`h-full ${rr.color.replace('text-', 'bg-')}`} style={{ width: `${rr.capacity}%` }}></div>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                             <span>Predicted Mess</span>
                             <span className={rr.color}>{rr.capacity}%</span>
                         </div>
                     </div>
                 ))}
             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#0a0501] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Dispatch Logs</span>
                 {isRouting && <span className="text-amber-400 font-black animate-pulse">OPTIMIZING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 
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
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-20"></div>
              
              {/* App Content */}
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-10">
                  
                  <div className="px-4 py-2 bg-amber-600 flex justify-between items-center shadow-md z-20">
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">Staff UI</span>
                          <span className="text-xs text-white font-bold">Janitorial Dispatch</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">A</div>
                  </div>

                  {/* Map Visualizer */}
                  <div className="flex-1 relative bg-slate-950 overflow-hidden">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      
                      {/* Processing Overlay */}
                      {isRouting && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest animate-pulse">Calculating TSP Node Path...</span>
                          </div>
                      )}

                      {/* Map Nodes */}
                      {restrooms.map(rr => (
                          <div 
                              key={rr.id} 
                              className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-lg z-20 transition-all duration-500 ${rr.bg} ${rr.border} ${activeRoute?.includes(rr.id) ? 'scale-110' : 'opacity-50'}`}
                              style={{ left: `${rr.x}%`, top: `${rr.y}%`, transform: `translate(-50%, -50%)` }}
                          >
                              {activeRoute?.includes(rr.id) ? (
                                  <span className="text-white font-black text-xs">{activeRoute.indexOf(rr.id) + 1}</span>
                              ) : (
                                  <span className="opacity-50">🚽</span>
                              )}
                          </div>
                      ))}

                      {/* Path Lines */}
                      {activeRoute && (
                          <svg className="absolute inset-0 w-full h-full z-10 animate-fade-in-up">
                              {activeRoute.map((id, index) => {
                                  if (index === activeRoute.length - 1) return null;
                                  const start = restrooms.find(r => r.id === id);
                                  const end = restrooms.find(r => r.id === activeRoute[index + 1]);
                                  return (
                                      <path 
                                          key={index}
                                          d={`M ${start.x}% ${start.y}% L ${end.x}% ${end.y}%`}
                                          stroke="#f59e0b" 
                                          strokeWidth="3" 
                                          strokeDasharray="5,5" 
                                          className="animate-[dash_1s_linear_infinite]"
                                      />
                                  );
                              })}
                          </svg>
                      )}
                  </div>

                  {/* Route Summary */}
                  <div className={`bg-slate-900 border-t border-slate-800 p-4 transition-all duration-500 h-1/3 flex flex-col ${activeRoute ? 'translate-y-0' : 'translate-y-full opacity-0'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Optimal Route (Urgent)</span>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                          {activeRoute?.map((id, index) => {
                              const rr = restrooms.find(r => r.id === id);
                              return (
                                  <div key={id} className={`flex items-center p-2 rounded-lg border ${index === 0 ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mr-3 ${index === 0 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                          {index + 1}
                                      </div>
                                      <div className="flex flex-col flex-1">
                                          <span className={`text-xs font-bold ${index === 0 ? 'text-white' : 'text-slate-300'}`}>{rr.name}</span>
                                          <span className="text-[9px] text-rose-400 font-mono">Critical Capacity: {rr.capacity}%</span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
                  
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120a03] p-4 rounded-xl border border-amber-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-amber-400 uppercase block mb-1">Algorithmic Logistics (TSP):</span>
               Click <span className="text-white font-bold bg-amber-600 px-1 rounded">Generate Dispatch Route</span>. Instead of cleaners walking to the pristine VIP restroom (15% capacity) just because it's next on a clipboard, the algorithm calculates that the Main Stage (95%) just ended and is critical. It calculates a Traveling Salesperson path that optimizes travel distance while prioritizing the most urgent facilities, instantly sending turn-by-turn navigation to the staff's mobile devices.
            </div>

          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}} />
    </div>
  );
};

export default PredictiveJanitorialRouting;
