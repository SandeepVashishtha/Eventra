/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticBaffleControl = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [rt60, setRt60] = useState(3.5); // Initial Reverb Time (seconds) - highly echoey
  const targetRt60 = 1.2; // Optimal for speech
  
  // Baffle states (0% is flush with ceiling, 100% is fully deployed)
  const [baffles, setBaffles] = useState([
    { id: 'Zone A (Stage)', deployed: 0, optimal: 85 },
    { id: 'Zone B (Mid)', deployed: 0, optimal: 60 },
    { id: 'Zone C (Rear)', deployed: 0, optimal: 40 },
    { id: 'Zone D (Wings)', deployed: 0, optimal: 75 }
  ]);

  const [iotLog, setIotLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Acoustic array calibrated. RT60 standing at 3.5s (Critical Echo).' }
  ]);

  useEffect(() => {
    let loop;
    if (systemActive) {
      loop = setInterval(() => {
        setBaffles(prev => {
          let allTuned = true;
          const updated = prev.map(b => {
            if (b.deployed < b.optimal) {
              allTuned = false;
              // Deploy baffles at 2% per tick
              return { ...b, deployed: Math.min(b.optimal, b.deployed + 2) };
            }
            return b;
          });

          // As baffles deploy, RT60 goes down
          const avgDeployment = updated.reduce((sum, b) => sum + (b.deployed / b.optimal), 0) / updated.length;
          // Initial 3.5s -> Target 1.2s. Difference is 2.3s
          const currentRt = 3.5 - (2.3 * avgDeployment);
          setRt60(currentRt);

          if (allTuned) {
            clearInterval(loop);
            setSystemActive(false);
            addLog('SYS', `Room optimized. Final RT60 holding at ${currentRt.toFixed(2)}s.`);
          }

          return updated;
        });

        // Occasional IoT command log
        if (Math.random() > 0.7) {
          const z = ['A', 'B', 'C', 'D'][Math.floor(Math.random()*4)];
          addLog('CMD', `Transmitting Modbus TCP -> Zone ${z} Winch Actuators (STEP_DN)`);
        }
      }, 200);
    }
    return () => clearInterval(loop);
  }, [systemActive]);

  const toggleTuning = () => {
    if (!systemActive && rt60 > 1.5) {
      setSystemActive(true);
      addLog('SYS', 'Auto-Tuning engaged. Calculating absorption coefficients...');
      setTimeout(() => {
        addLog('CMD', 'Activating ceiling winches...');
      }, 500);
    }
  };

  const resetRoom = () => {
    setSystemActive(false);
    setRt60(3.5);
    setBaffles(baffles.map(b => ({ ...b, deployed: 0 })));
    addLog('SYS', 'Baffles retracted. Reverb time returning to baseline (3.5s).');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setIotLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 7));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎙️</span> Acoustic Engineering / IoT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Acoustic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Baffling Actuator Control</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Acoustics in large convention centers are notoriously terrible, often ruining multi-million dollar keynote speeches with massive echoes. Eventra connects directly to motorized acoustic baffling panels in the ceiling via IoT. The system uses the venue's microphone arrays to calculate the room's reverb time (RT60) in real-time, instantly transmitting commands to ceiling actuators to dynamically deploy absorption panels and perfectly tune the room.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> FOH Acoustic Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetRoom}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md border border-slate-700 hover:bg-slate-800 text-slate-400"
                 >
                   Reset Winches
                 </button>
                 <button 
                   onClick={toggleTuning}
                   disabled={systemActive || rt60 < 1.5}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-fuchsia-900 text-fuchsia-400 opacity-50 cursor-not-allowed' :
                     rt60 < 1.5 ? 'bg-emerald-900 text-emerald-400 border border-emerald-500/50' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)]'
                   }`}
                 >
                   {systemActive ? 'Auto-Tuning...' : rt60 < 1.5 ? 'Room Optimized' : 'Engage Auto-Tune'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* RT60 Metric */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${
                 rt60 > 2.5 ? 'bg-rose-900/20 border-rose-500/30' :
                 rt60 > 1.5 ? 'bg-amber-900/20 border-amber-500/30' : 'bg-emerald-900/20 border-emerald-500/30'
               }`}>
                 {systemActive && <div className="absolute inset-0 bg-fuchsia-500/5 animate-pulse"></div>}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 z-10 relative">Live RT60 Reverb</span>
                 <div className="flex items-end z-10 relative">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     rt60 > 2.5 ? 'text-rose-400' : rt60 > 1.5 ? 'text-amber-400' : 'text-emerald-400'
                   }`}>
                     {rt60.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">sec</span>
                 </div>
                 <div className="mt-2 text-[9px] font-mono text-slate-500 z-10 relative">
                   Target: {targetRt60}s (Speech)
                 </div>
               </div>

               {/* Baffle Deployment States */}
               <div className="col-span-2 grid grid-cols-2 gap-3">
                 {baffles.map(b => (
                   <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 relative overflow-hidden">
                     {/* Progress bar background */}
                     <div className="absolute inset-y-0 left-0 bg-fuchsia-500/10 transition-all duration-200" style={{width: `${b.deployed}%`}}></div>
                     
                     <div className="relative z-10 flex justify-between items-center mb-1">
                       <span className="text-[10px] font-bold text-slate-400">{b.id}</span>
                       <span className={`text-[10px] font-mono font-black ${b.deployed === b.optimal ? 'text-emerald-400' : 'text-fuchsia-400'}`}>
                         {Math.floor(b.deployed)}%
                       </span>
                     </div>
                     
                     {/* Actuator status indicator */}
                     <div className="relative z-10 flex items-center space-x-1.5 mt-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         b.deployed === 0 ? 'bg-slate-600' :
                         b.deployed === b.optimal ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]' :
                         'bg-fuchsia-500 animate-pulse shadow-[0_0_5px_rgba(217,70,239,0.8)]'
                       }`}></div>
                       <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">
                         {b.deployed === 0 ? 'Retracted' : b.deployed === b.optimal ? 'Locked' : 'Winch Active'}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>

             </div>

             {/* IoT Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Actuator Command Bus (Modbus TCP)</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {iotLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.msg.includes('Optimized') || log.msg.includes('holding') ? 'text-emerald-400 font-bold' : 
                       log.type === 'CMD' ? 'text-fuchsia-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Venue 3D Visualizer Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-black shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Header / Nav */}
            <div className="absolute top-0 inset-x-0 h-16 flex justify-between items-center px-6 z-30 bg-gradient-to-b from-black/80 to-transparent">
              <span className="font-black text-white tracking-widest uppercase text-sm">Venue CAD</span>
              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                Cross-Section
              </div>
            </div>

            {/* Ceiling Baffle Visualizer */}
            <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-950 relative flex flex-col justify-end overflow-hidden pb-12 pt-20">
               
               {/* Sound wave visualization (Echoes) */}
               {rt60 > 1.5 && (
                 <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none opacity-40">
                   <div className="absolute w-20 h-20 border-2 border-white/20 rounded-full animate-[ping_3s_infinite]"></div>
                   <div className="absolute w-40 h-40 border-2 border-white/10 rounded-full animate-[ping_3s_infinite_1s]"></div>
                   <div className="absolute w-60 h-60 border-2 border-rose-500/10 rounded-full animate-[ping_3s_infinite_2s]"></div>
                   {/* Heavy echoes if rt60 > 2.5 */}
                   {rt60 > 2.5 && (
                     <>
                       <div className="absolute -top-32 w-80 h-80 border border-rose-500/20 rounded-full animate-[ping_2s_infinite]"></div>
                     </>
                   )}
                 </div>
               )}

               {/* Stage & Speaker */}
               <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-slate-900 border-t border-slate-700 flex justify-center items-end px-4 z-10 shadow-2xl">
                 <div className="w-2 h-6 bg-slate-700 mx-1 rounded-t-sm"></div>
                 <div className="w-4 h-12 bg-slate-800 mx-1 rounded-t-md relative flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                 </div> {/* Speaker PA */}
                 <div className="w-2 h-6 bg-slate-700 mx-1 rounded-t-sm"></div>
               </div>
               
               {/* People / Crowd */}
               <div className="absolute bottom-12 inset-x-0 flex justify-between px-10 opacity-30 z-0">
                 {Array.from({length: 12}).map((_, i) => (
                   <div key={i} className="w-3 h-4 bg-slate-500 rounded-t-full transform -translate-y-2"></div>
                 ))}
               </div>

               {/* Ceiling Rigging */}
               <div className="absolute top-20 inset-x-4 h-2 bg-slate-900 border-b border-slate-700 flex justify-between px-2">
                 
                 {/* Baffle Panels hanging from ceiling */}
                 {baffles.map((b, i) => (
                   <div key={b.id} className="relative flex flex-col items-center w-1/4">
                     {/* Winch Box */}
                     <div className="w-6 h-3 bg-slate-800 -mt-1 z-20 rounded-sm relative">
                       {systemActive && b.deployed < b.optimal && (
                         <div className="absolute inset-0 bg-fuchsia-500/30 rounded-sm animate-pulse"></div>
                       )}
                     </div>
                     
                     {/* Cables */}
                     <div className="flex justify-between w-4 absolute top-2 bottom-0 z-10" style={{ height: `${b.deployed * 1.5 + 10}px` }}>
                       <div className="w-px h-full bg-slate-600"></div>
                       <div className="w-px h-full bg-slate-600"></div>
                     </div>
                     
                     {/* Acoustic Panel */}
                     <div 
                       className={`w-16 h-3 rounded-sm absolute transition-all duration-200 z-20 flex items-center justify-center overflow-hidden ${
                         b.deployed > 0 ? 'bg-fuchsia-900/80 border border-fuchsia-500/50 shadow-[0_5px_15px_rgba(0,0,0,0.5)]' : 'bg-slate-700 border border-slate-600'
                       }`}
                       style={{ top: `${b.deployed * 1.5 + 10}px` }}
                     >
                       <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                     </div>
                   </div>
                 ))}
               </div>
               
               {/* Acoustic Overlay Filter */}
               <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
                 rt60 < 1.5 ? 'bg-emerald-900/5 mix-blend-overlay' : 
                 rt60 > 2.5 ? 'bg-rose-900/10 mix-blend-overlay' : 'bg-transparent'
               }`}></div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AcousticBaffleControl;
