/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AdaTransportDispatch = () => {
  const [algorithmActive, setAlgorithmActive] = useState(false);
  
  // Fleet Metrics
  const [activeCarts, setActiveCarts] = useState(12);
  const [requestsPending, setRequestsPending] = useState(0); 
  const [avgWaitTime, setAvgWaitTime] = useState(45.2); // Minutes (baseline manual)
  const [totalCompletedRides, setTotalCompletedRides] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'ADA Fleet Management system initialized.' },
    { id: 2, time: '12:00:02', type: 'WARN', msg: 'Manual radio dispatch active. High inefficiency detected.' }
  ]);

  // Visualizer State
  const [mapNodes, setMapNodes] = useState([
      { id: 'N_GATE', x: 20, y: 15, label: 'North Gate' },
      { id: 'M_STAGE', x: 80, y: 30, label: 'Main Stage' },
      { id: 'MED_TENT', x: 50, y: 60, label: 'Medical' },
      { id: 'ADA_CAMP', x: 20, y: 85, label: 'ADA Camping' },
      { id: 'FOOD_C', x: 80, y: 85, label: 'Food Court' }
  ]);
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [cartPos, setCartPos] = useState({ x: 20, y: 15 });

  useEffect(() => {
    let loop;
    
    if (algorithmActive) {
      loop = setInterval(() => {
          
          setRequestsPending(Math.floor(Math.random() * 5));
          
          // Algorithm actively optimizing wait times
          setAvgWaitTime(prev => {
              if (prev > 14.5) return prev - (Math.random() * 2);
              return 12.5 + (Math.random() * 3); // Stabilize around 12-15 mins
          });

      }, 1500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [algorithmActive]);

  const dispatchCart = () => {
      if (!algorithmActive || activeRoute) return;
      
      const start = mapNodes[3]; // ADA Camping
      const end = mapNodes[1]; // Main Stage
      const via = mapNodes[2]; // Medical (fastest path avoiding crowds)
      
      addLog('ACTION', 'Ride request received from ADA Camping to Main Stage.');
      addLog('SYS', 'Dijkstra Engine running... avoiding high-density pedestrian zones.');
      
      setCartPos({ x: start.x, y: start.y });
      
      setTimeout(() => {
          setActiveRoute({ start, via, end });
          addLog('SUCCESS', 'Optimal path found: ADA_CAMP -> MED_TENT -> M_STAGE. Dispatching Cart #04.');
          
          // Animate cart moving to 'via' point
          setTimeout(() => { setCartPos({ x: via.x, y: via.y }); }, 1000);
          
          // Animate cart moving to 'end' point
          setTimeout(() => { 
              setCartPos({ x: end.x, y: end.y }); 
              addLog('SUCCESS', 'Passenger dropped off successfully. Cart #04 available for next dispatch.');
              setTotalCompletedRides(prev => prev + 1);
              
              setTimeout(() => { setActiveRoute(null); }, 2000);
          }, 2500);
          
      }, 800);
  };

  const toggleSystem = () => {
    if (!algorithmActive) {
      setAlgorithmActive(true);
      addLog('SYS', 'Algorithmic Dispatch active. Ingesting crowd heatmaps.');
    } else {
      setAlgorithmActive(false);
      setAvgWaitTime(45.2);
      setRequestsPending(12);
      addLog('CRIT', 'Algorithm disabled. Reverting to manual radio dispatch. Expect delays.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000b18] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> Accessibility & Fleet Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated ADA Transport <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500">Dispatch Algorithm</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            ADA golf cart shuttles are currently dispatched manually via radio, leading to chaotic routing, empty return trips, and unacceptable wait times for disabled attendees who rely on them. Eventra solves this by building an algorithmic dispatch backend similar to a rideshare service. Disabled attendees request a pickup via the app. The backend uses Dijkstra’s routing algorithm combined with real-time crowd density heatmaps to route the nearest available golf cart through the fastest, least-crowded pedestrian paths, optimizing fleet efficiency.
          </p>

          <div className="bg-[#050f1f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Fleet Optimization Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     algorithmActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {algorithmActive ? 'Revert to Manual Radio' : 'Engage Smart Dispatch'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Avg Wait Time */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 !algorithmActive ? 'bg-red-950/20 border-red-900/50' : 
                 avgWaitTime < 20 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Avg Fleet Wait Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     !algorithmActive ? 'text-red-400' : 
                     avgWaitTime < 20 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {avgWaitTime.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mins</span>
                 </div>
               </div>

               {/* Requests Pending */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 requestsPending > 0 ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Queue
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     requestsPending > 0 ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {requestsPending}
                   </span>
                 </div>
               </div>
               
               {/* Total Rides */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 algorithmActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Completed
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         algorithmActive ? 'text-slate-300' : 'text-slate-600'
                       }`}>
                         {totalCompletedRides}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#01040a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dijkstra Routing Ledger</span>
                 {activeRoute && <span className="text-cyan-400 font-black animate-pulse">COMPUTING SHORTEST PATH...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1 uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
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
            
            {/* Map Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !algorithmActive ? 'bg-slate-900' : 'bg-[#030a17]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">DISPATCH MAP UI</span>
                <span className={`text-[8px] font-mono ${algorithmActive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {algorithmActive ? 'ALGO_ACTIVE' : 'MANUAL_MODE'}
                </span>
              </div>

              <div className="flex-1 relative p-4">
                  
                  {!algorithmActive ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in-up bg-slate-900/90 z-30">
                         <span className="text-4xl opacity-50 mb-4 grayscale">📻</span>
                         <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Manual Dispatch</h3>
                         <p className="text-xs text-red-400 font-bold leading-relaxed px-8">Warning: System operating without routing intelligence. Severe wait times expected.</p>
                     </div>
                  ) : (
                    <div className="absolute inset-0 z-20">
                        
                        {/* Static Map Background Elements */}
                        <div className="absolute top-[25%] left-[10%] w-[80%] h-[50%] border border-slate-800 rounded-[50px] opacity-30"></div>
                        <div className="absolute top-[40%] left-[30%] w-[40%] h-[20%] border border-slate-700 bg-slate-800/20 rounded-lg opacity-40 flex items-center justify-center">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest">High Crowd Density</span>
                        </div>

                        {/* SVG for routing lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {/* Base possible routes (dim) */}
                            <path d="M 20% 15% L 50% 60%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                            <path d="M 50% 60% L 80% 30%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                            <path d="M 20% 85% L 50% 60%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                            <path d="M 50% 60% L 80% 85%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                            
                            {/* Active Dijkstra Route (Bright) */}
                            {activeRoute && (
                                <>
                                    <path 
                                        d={`M ${activeRoute.start.x}% ${activeRoute.start.y}% L ${activeRoute.via.x}% ${activeRoute.via.y}%`} 
                                        stroke="#10b981" 
                                        strokeWidth="3" 
                                        fill="none" 
                                        className="animate-draw-line"
                                    />
                                    <path 
                                        d={`M ${activeRoute.via.x}% ${activeRoute.via.y}% L ${activeRoute.end.x}% ${activeRoute.end.y}%`} 
                                        stroke="#10b981" 
                                        strokeWidth="3" 
                                        fill="none" 
                                        className="animate-draw-line delay-500"
                                    />
                                </>
                            )}
                        </svg>

                        {/* Nodes */}
                        {mapNodes.map((node) => (
                            <div 
                                key={node.id} 
                                className="absolute w-8 h-8 -ml-4 -mt-4 bg-slate-900 border-2 border-blue-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] z-20"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="absolute top-10 text-[8px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-700">
                                    {node.label}
                                </span>
                            </div>
                        ))}

                        {/* The Golf Cart */}
                        <div 
                            className="absolute w-8 h-8 -ml-4 -mt-4 z-30 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center"
                            style={{ left: `${cartPos.x}%`, top: `${cartPos.y}%` }}
                        >
                            <div className="bg-yellow-400 p-1.5 rounded-md border-2 border-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center">
                                <span className="text-xs">🛺</span>
                            </div>
                            <span className="absolute -bottom-5 text-[6px] font-mono text-yellow-400 bg-black/80 px-1 rounded">CART_04</span>
                        </div>
                        
                    </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050f1f] p-4 rounded-xl border border-slate-800">
               
               <button 
                   onClick={dispatchCart}
                   disabled={!algorithmActive || activeRoute !== null}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !algorithmActive || activeRoute !== null ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   {activeRoute ? 'Dispatch In Progress...' : 'Simulate Ride Request'}
               </button>

            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-draw-line {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw 1s forwards;
        }
        @keyframes draw {
            to {
                stroke-dashoffset: 0;
            }
        }
        .delay-500 {
            animation-delay: 0.8s;
        }
      `}} />
      
    </div>
  );
};

export default AdaTransportDispatch;
