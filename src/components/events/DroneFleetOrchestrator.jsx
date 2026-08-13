/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneFleetOrchestrator = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Drone Swarm Metrics
  const [activeSwarm, setActiveSwarm] = useState(500); 
  const [standbyFleet, setStandbyFleet] = useState(150); 
  const [totalSwaps, setTotalSwaps] = useState(0); 
  const [avgBattery, setAvgBattery] = useState(100); // %
  const [showDuration, setShowDuration] = useState(0); // minutes
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Swarm Orchestration State Machine booted.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Subscribed to MQTT topics: drone/telemetry/#' }
  ]);

  // Visualizer State
  // We'll simulate a small grid of 36 drones for visual clarity, representing the 500
  const [droneGrid, setDroneGrid] = useState(Array.from({ length: 36 }).map((_, i) => ({
      id: `D_${i}`,
      battery: 80 + Math.random() * 20, // 80-100%
      status: 'ACTIVE' // ACTIVE, SWAPPING_OUT, SWAPPING_IN
  })));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setShowDuration(prev => prev + 0.1); // Speed up time for simulation

          setDroneGrid(prevGrid => {
              let nextGrid = [...prevGrid];
              let sumBattery = 0;
              let currentSwaps = 0;

              nextGrid = nextGrid.map(drone => {
                  let newBattery = drone.battery;
                  let newStatus = drone.status;

                  // Drain battery if active
                  if (drone.status === 'ACTIVE') {
                      newBattery = Math.max(0, drone.battery - (Math.random() * 2.5));
                      
                      // Trigger Swap Threshold
                      if (newBattery <= 15) {
                          newStatus = 'SWAPPING_OUT';
                          currentSwaps++;
                          
                          // Dispatch replacement event
                          if (Math.random() > 0.8) {
                             addLog('ACTION', `MQTT: Drone ${drone.id} battery low (${newBattery.toFixed(0)}%). Dispatching replacement.`);
                          }
                      }
                  } else if (drone.status === 'SWAPPING_OUT') {
                      // Drone is flying down, replacement is flying up
                      newStatus = 'SWAPPING_IN';
                  } else if (drone.status === 'SWAPPING_IN') {
                      // Replacement arrived
                      newStatus = 'ACTIVE';
                      newBattery = 100;
                  }

                  sumBattery += newBattery;
                  return { ...drone, battery: newBattery, status: newStatus };
              });

              setAvgBattery(sumBattery / nextGrid.length);
              
              if (currentSwaps > 0) {
                  setTotalSwaps(prev => prev + currentSwaps);
                  // Deplete standby, occasionally recharge
                  setStandbyFleet(prev => Math.max(0, prev - currentSwaps + (Math.random() > 0.7 ? 2 : 0)));
              }

              return nextGrid;
          });

      }, 800); // 800ms tick rate
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Swarm launch authorized. MQTT telemetry streaming at 50Hz.');
    } else {
      setSystemActive(false);
      addLog('WARN', 'Orchestration halted. Returning swarm to landing pads (RTL).');
      
      // Reset State
      setShowDuration(0);
      setTotalSwaps(0);
      setStandbyFleet(150);
      setAvgBattery(100);
      setDroneGrid(Array.from({ length: 36 }).map((_, i) => ({
          id: `D_${i}`, battery: 80 + Math.random() * 20, status: 'ACTIVE'
      })));
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> IoT Swarm Robotics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Drone Fleet <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500">Battery Swap Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Drone light shows are visually stunning but are strictly limited to about 12-15 minutes due to the battery capacity of the swarm, preventing full-set synchronizations. Eventra solves this by building a high-concurrency state machine backend that tracks the real-time battery telemetry of 500+ drones via MQTT. As a drone's battery approaches 15%, the orchestration engine automatically dispatches a fully charged replacement drone to take its exact coordinate in the swarm, while safely routing the depleted drone back to an automated charging pad, allowing for continuous, multi-hour shows.
          </p>

          <div className="bg-[#0b1120] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> MQTT Orchestration Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Abort Show (RTL)' : 'Launch 500-Drone Swarm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Show Duration */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && showDuration > 15 ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Show Uptime
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive && showDuration > 15 ? 'text-indigo-400' : 
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {showDuration.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">min</span>
                 </div>
               </div>

               {/* Total Swaps */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 totalSwaps > 0 ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Hot Swaps
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     totalSwaps > 0 ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {totalSwaps}
                   </span>
                 </div>
               </div>
               
               {/* Avg Battery */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fleet Health
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {avgBattery.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Standby Fleet */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 standbyFleet < 50 ? 'bg-orange-950/40 border-orange-500/50 animate-pulse' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Standby Queue
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         standbyFleet < 50 ? 'text-orange-400' : 'text-slate-600'
                       }`}>
                         {standbyFleet}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050810] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>MQTT State Machine Ledger</span>
                 {systemActive && <span className="text-cyan-400 font-black animate-pulse">WS://BROKER:1883 [CONNECTED]</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
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
            
            {/* Drone Swarm Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[500px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000511]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">SWARM UI MATRIX</span>
                <span className="text-[8px] font-mono text-slate-400">ACTIVE: {systemActive ? activeSwarm : 0}</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4 overflow-hidden">
                  
                  {/* Sky/Stage Background */}
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
                  
                  {/* "Main Stage" Silhouette */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-black border-t-2 border-indigo-900 z-10 clip-path-stage opacity-80 flex items-center justify-center">
                      <div className="w-full h-1 bg-indigo-500/50 absolute top-0 blur-sm"></div>
                  </div>

                  {/* Charging Pad Representation */}
                  <div className="absolute bottom-2 left-4 bg-slate-900 border border-slate-700 w-16 h-8 rounded flex flex-col items-center justify-center z-10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <span className="text-[5px] text-emerald-400 font-bold tracking-widest uppercase">PAD_A</span>
                      <span className="text-[6px] text-slate-400 font-mono">150 CHG</span>
                  </div>

                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center z-20">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SWARM GROUNDED</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 p-6 flex flex-col">
                        
                        {/* 6x6 Grid simulating the swarm */}
                        <div className="flex-1 grid grid-cols-6 gap-3">
                            {droneGrid.map((drone) => (
                                <div key={drone.id} className="relative flex items-center justify-center">
                                    
                                    {/* The Drone (Dot) */}
                                    <div className={`w-3 h-3 rounded-full absolute transition-all duration-700 ease-in-out ${
                                        drone.status === 'SWAPPING_OUT' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] translate-y-8 scale-75 opacity-50' :
                                        drone.status === 'SWAPPING_IN' ? 'bg-emerald-400 shadow-[0_0_15px_#34d399] translate-y-8 scale-75 opacity-50' :
                                        drone.battery > 50 ? 'bg-white shadow-[0_0_12px_#ffffff]' : 
                                        drone.battery > 25 ? 'bg-yellow-300 shadow-[0_0_10px_#fde047]' : 
                                        'bg-orange-500 shadow-[0_0_10px_#f97316] animate-pulse'
                                    }`}></div>

                                    {/* Telemetry Tooltip */}
                                    <div className="absolute -top-3 text-[4px] font-mono text-slate-400 pointer-events-none opacity-50">
                                        {drone.battery.toFixed(0)}%
                                    </div>

                                </div>
                            ))}
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneFleetOrchestrator;
