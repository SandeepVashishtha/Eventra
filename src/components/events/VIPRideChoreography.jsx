/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VIPRideChoreography = () => {
  const [engineActive, setEngineActive] = useState(false);
  
  // Convoys heading to the loading dock
  const [convoys, setConvoys] = useState([
    { id: 'C-Alpha', vip: 'Elon M.', eta: 15.2, targetEta: 15.0, distance: 4.2, speed: 65, command: 'Maintain' },
    { id: 'C-Beta', vip: 'Taylor S.', eta: 15.8, targetEta: 18.0, distance: 4.8, speed: 70, command: 'Slow Down' },
    { id: 'C-Gamma', vip: 'Tim C.', eta: 22.4, targetEta: 21.0, distance: 7.1, speed: 55, command: 'Speed Up' }
  ]);

  const [dispatchLog, setDispatchLog] = useState([
    { id: 1, time: '17:30:00', type: 'SYS', msg: 'Fleet telemetry locked. Awaiting choreograph engine start.' }
  ]);

  useEffect(() => {
    let loop;
    if (engineActive) {
      loop = setInterval(() => {
        setConvoys(prev => {
          let conflictResolved = true;
          
          const updated = prev.map(c => {
            // Distance slowly decreases
            const newDist = Math.max(0, c.distance - (c.speed * 0.005));
            
            // Adjust speed based on command to hit target ETA
            let newSpeed = c.speed;
            let newEta = newDist / (newSpeed * 0.016); // Rough calc
            
            if (Math.abs(newEta - c.targetEta) > 0.5) {
              conflictResolved = false;
              if (newEta < c.targetEta) {
                newSpeed = Math.max(30, c.speed - 2); // Slow down
                c.command = 'Reduce Speed 15%';
              } else {
                newSpeed = Math.min(85, c.speed + 2); // Speed up
                c.command = 'Increase Speed 10%';
              }
            } else {
              c.command = 'Maintain Pace';
            }

            return { ...c, distance: newDist, speed: newSpeed, eta: newEta };
          });
          
          if (conflictResolved && Math.random() > 0.9) {
             addLog('OPT', 'Convoys perfectly staggered. 3-minute intervals locked.');
          }

          return updated;
        });

      }, 1000);
    }
    return () => clearInterval(loop);
  }, [engineActive]);

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'Algorithmic choreography engine engaged.');
      addLog('CMD', 'Transmitting pacing commands to Black-Car fleet APNs.');
    } else {
      setEngineActive(false);
      addLog('SYS', 'Choreography paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setDispatchLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> Fleet Logistics Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            VIP Ride-Choreography <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Dispatch System</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At high-end summits, multiple VIPs arriving at the exact same time causes massive traffic jams at the private loading dock, exposing them to paparazzi and security risks. Eventra solves this by algorithmically choreographing the black-car fleet. The engine calculates precise ETAs and automatically issues speed-up or slow-down commands directly to the drivers' apps, perfectly staggering dock arrivals exactly 3 minutes apart.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">⏱️</span> Dock Arrival Sequencer
               </h3>
               
               <button 
                 onClick={toggleEngine}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   engineActive ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/50' :
                   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
                 }`}
               >
                 {engineActive ? 'Engine Running' : 'Engage Auto-Stagger'}
               </button>
             </div>

             <div className="space-y-3 mb-6">
               {/* Convoy Grid */}
               <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">
                 <div className="col-span-3">Convoy / VIP</div>
                 <div className="col-span-3 text-center">Live ETA</div>
                 <div className="col-span-3 text-center">Target ETA</div>
                 <div className="col-span-3 text-right">Telemetry</div>
               </div>
               
               {convoys.map((c, i) => (
                 <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center relative overflow-hidden">
                   
                   {/* Background warning for ETA mismatch */}
                   {engineActive && Math.abs(c.eta - c.targetEta) > 1.0 && (
                     <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
                   )}
                   
                   <div className="grid grid-cols-12 gap-4 w-full relative z-10 items-center">
                     <div className="col-span-3">
                       <span className="font-bold text-white text-sm block">{c.id}</span>
                       <span className="text-[10px] text-slate-500">{c.vip}</span>
                     </div>
                     
                     <div className="col-span-3 text-center">
                       <span className={`text-xl font-black font-mono ${
                         Math.abs(c.eta - c.targetEta) <= 0.5 ? 'text-emerald-400' : 'text-rose-400'
                       }`}>{c.eta.toFixed(1)}</span>
                       <span className="text-[10px] text-slate-500 ml-1">min</span>
                     </div>
                     
                     <div className="col-span-3 text-center">
                       <span className="text-lg font-bold font-mono text-cyan-400">{c.targetEta.toFixed(1)}</span>
                       <span className="text-[10px] text-slate-500 ml-1">min</span>
                     </div>
                     
                     <div className="col-span-3 text-right">
                       <span className="text-xs font-mono text-white block">{c.speed.toFixed(0)} mph</span>
                       <span className="text-[10px] text-slate-500">{c.distance.toFixed(1)} mi out</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* Dispatch Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Network Routing Commands</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {dispatchLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'OPT' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CMD' ? 'text-cyan-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Driver App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-[3rem] border-[12px] border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 bg-black/50 backdrop-blur-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-900">
               
               {/* Maps Graphic Background */}
               <div className="absolute inset-0 z-0 opacity-40">
                 {/* Fake roads */}
                 <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-slate-800 transform -translate-x-1/2 -skew-x-12"></div>
                 <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-800 transform -translate-y-1/2 skew-y-6"></div>
                 
                 {/* Car blip */}
                 <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10">
                   <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-50"></div>
                 </div>
                 
                 <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-indigo-500/20 rounded-full border border-indigo-500/50 flex items-center justify-center">
                   <span className="text-[10px] font-bold text-indigo-300">DOCK</span>
                 </div>
               </div>

               {/* Top Navigation HUD */}
               <div className="relative z-10 pt-16 px-4">
                 <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl">
                   <div className="flex justify-between items-start">
                     <div>
                       <h2 className="font-black text-white text-2xl">Convoy Beta</h2>
                       <p className="text-[10px] font-mono text-slate-400">VIP: Taylor S. (3 pax)</p>
                     </div>
                     <div className="text-right">
                       <span className="text-3xl font-black text-white">{convoys[1].speed.toFixed(0)}</span>
                       <span className="text-xs text-slate-500 ml-1">mph</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Command Override Popup */}
               <div className="mt-auto relative z-20 pb-8 px-4">
                 
                 {!engineActive ? (
                   <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg text-center">
                     <span className="text-3xl mb-2 block">🛣️</span>
                     <h3 className="font-bold text-white">Route Optimal</h3>
                     <p className="text-xs text-slate-400 mt-1">Proceed to loading dock at normal speed.</p>
                   </div>
                 ) : convoys[1].command === 'Maintain Pace' ? (
                   <div className="bg-emerald-900/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center animate-fade-in-up">
                     <span className="text-4xl mb-2 block">✅</span>
                     <h3 className="font-black text-white uppercase tracking-widest text-lg">Pace Locked</h3>
                     <p className="text-xs text-emerald-200 mt-1">Arrival perfectly staggered for 18:00 min.</p>
                   </div>
                 ) : (
                   <div className="bg-rose-900/90 backdrop-blur-md rounded-2xl p-6 border border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)] text-center animate-fade-in-up relative overflow-hidden">
                     <div className="absolute top-0 inset-x-0 h-2 bg-rose-500 animate-pulse"></div>
                     <span className="text-4xl mb-2 block animate-bounce">⚠️</span>
                     <h3 className="font-black text-white uppercase tracking-widest text-xl mb-1">Dock Conflict</h3>
                     
                     <div className="bg-black/50 rounded-xl p-4 mt-3">
                       <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest mb-1">Network Command</p>
                       <p className="font-black text-2xl text-white">{convoys[1].command}</p>
                     </div>
                     
                     <p className="text-xs text-rose-200 mt-4">Adjusting arrival to prevent 3-car backlog at security gate.</p>
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

export default VIPRideChoreography;
