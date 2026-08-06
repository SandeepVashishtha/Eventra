/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicSurgePricing = () => {
  const [intermissionActive, setIntermissionActive] = useState(false);
  
  // Simulation State
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins in seconds
  const [queueLength, setQueueLength] = useState(15); // pax
  
  // Pricing State
  const basePrice = 12.00;
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [expressPrice, setExpressPrice] = useState(12.00);

  const [algoLog, setAlgoLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'Micro-economics engine initialized. Awaiting Intermission trigger.' }
  ]);

  useEffect(() => {
    let loop;
    if (intermissionActive && timeRemaining > 0) {
      loop = setInterval(() => {
        
        // Time ticks down much faster for demo purposes
        setTimeRemaining(prev => {
          const nextTime = Math.max(0, prev - 15);
          
          // Queue grows as time ticks down, peaking around 10 mins left, then panicking
          setQueueLength(prevQ => {
            if (nextTime > 600) {
              return prevQ + Math.floor(Math.random() * 5); // Growing steadily
            } else if (nextTime > 120) {
              return prevQ + Math.floor(Math.random() * 15); // Panic buying
            } else {
              return Math.max(0, prevQ - Math.floor(Math.random() * 10)); // Resolving
            }
          });

          return nextTime;
        });

      }, 1000);
    } else if (timeRemaining <= 0) {
      setIntermissionActive(false);
    }
    
    return () => clearInterval(loop);
  }, [intermissionActive, timeRemaining]);

  // Recalculate price whenever queue or time changes
  useEffect(() => {
    if (intermissionActive) {
      // Algorithmic Pricing Logic
      // Factors: 
      // 1. Queue Density (High Queue = High Surge)
      // 2. Time Scarcity (Low Time = High Surge)
      
      let densityFactor = queueLength / 50; // Normalize against 50 pax
      
      // Time pressure multiplier (exponential as it gets closer to 0)
      let timeFactor = 0;
      if (timeRemaining < 900 && timeRemaining > 0) {
        timeFactor = Math.pow((900 - timeRemaining) / 900, 2) * 1.5;
      }

      let rawMultiplier = 1.0 + densityFactor + timeFactor;
      
      // Cap at 3.5x surge
      const finalMultiplier = Math.min(3.5, Math.max(1.0, rawMultiplier));
      
      setSurgeMultiplier(finalMultiplier);
      setExpressPrice(basePrice * finalMultiplier);

      // Log significant surge jumps
      if (finalMultiplier > 2.0 && Math.random() > 0.8) {
        addLog('SURGE', `High Demand: Express multiplier adjusted to ${finalMultiplier.toFixed(2)}x`);
      }
    }
  }, [queueLength, timeRemaining, intermissionActive]);

  const triggerIntermission = () => {
    if (!intermissionActive) {
      setIntermissionActive(true);
      setTimeRemaining(1800); // Reset to 30 mins
      setQueueLength(15);
      addLog('SYS', 'Intermission started. Activating dynamic pricing grid.');
    } else {
      setIntermissionActive(false);
      addLog('SYS', 'Simulation paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAlgoLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: FinTech Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Yield Management FinTech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Dynamic Surge-Pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Concession Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            During short intermissions, concession lines stretch for hundreds of feet, causing attendees to miss the show and organizers to lose massive revenue from high-intent buyers. Eventra applies Uber-style micro-economics to physical queues. As the intermission clock ticks down and the general line grows, the algorithm dynamically surges the price of the "VIP Express Lane". Price-sensitive buyers wait in the normal line, while time-sensitive buyers pay the premium.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📊</span> Algorithmic Pricing Matrix
               </h3>
               
               <button 
                 onClick={triggerIntermission}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   intermissionActive ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                   'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                 }`}
               >
                 {intermissionActive ? 'Pause Sim' : 'Trigger Intermission'}
               </button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Time Scarcity */}
               <div className="col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Intermission Clock</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${timeRemaining < 600 && intermissionActive ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>
                     {formatTime(timeRemaining)}
                   </span>
                 </div>
               </div>

               {/* Queue Density */}
               <div className="col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Gen-Admin Queue</span>
                 <div className="flex items-end">
                   <span className="text-3xl font-black font-mono text-slate-800 leading-none">
                     {queueLength}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-0.5">pax</span>
                 </div>
               </div>
               
               {/* Algorithmic Surge Multiplier */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 surgeMultiplier > 2.0 ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Surge Multiplier</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${surgeMultiplier > 2.0 ? 'text-indigo-600' : 'text-slate-800'}`}>
                     {surgeMultiplier.toFixed(2)}x
                   </span>
                 </div>
               </div>

             </div>

             {/* Pricing Graph Representation */}
             <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Rate: $12.00</span>
                
                <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-600 transition-all duration-300" style={{ width: `${(surgeMultiplier / 3.5) * 100}%` }}></div>
                </div>
                
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Cap: $42.00</span>
             </div>

             {/* FinTech Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Micro-Economics Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {algoLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SURGE' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-30">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-16 pb-6 px-4 flex flex-col bg-slate-50 relative overflow-hidden">
               
               <div className="text-center mb-6 z-10">
                 <h2 className="font-black text-slate-900 text-2xl tracking-tight">Bar 4: Main Hall</h2>
                 <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest animate-pulse">
                   Intermission: {formatTime(timeRemaining)}
                 </p>
               </div>

               {/* Standard Menu Item */}
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 z-10 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <div className="text-3xl">🍺</div>
                   <div>
                     <h3 className="font-bold text-slate-800 text-sm">Craft IPA (16oz)</h3>
                     <p className="text-[10px] text-slate-500">General Admission Line</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-slate-900 text-lg">${basePrice.toFixed(2)}</p>
                   <p className="text-[9px] font-bold text-rose-500 uppercase">~{Math.ceil(queueLength * 1.2)} min wait</p>
                 </div>
               </div>
               
               <div className="text-center my-2 z-10">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">— OR —</span>
               </div>

               {/* Express Pass (Dynamic Price) */}
               <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-indigo-500/30 z-10 mt-2 relative overflow-hidden">
                 
                 {/* Premium Background artifact */}
                 <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                     <div className="inline-block bg-indigo-500 text-white px-2 py-0.5 rounded uppercase tracking-widest text-[8px] font-black mb-2">
                       ⚡ VIP Express
                     </div>
                     <h3 className="font-bold text-white text-lg leading-tight">Craft IPA (16oz)</h3>
                     <p className="text-[10px] text-indigo-300 mt-1">Skip the entire line. Ready now.</p>
                   </div>
                   
                   <div className="text-right">
                     <p className={`font-black text-3xl transition-colors duration-500 ${surgeMultiplier > 2.0 ? 'text-indigo-400' : 'text-white'}`}>
                       ${expressPrice.toFixed(2)}
                     </p>
                     
                     {surgeMultiplier > 1.1 && (
                       <div className="flex items-center justify-end mt-1 animate-fade-in text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                         <span className="mr-1">📈</span> High Demand
                       </div>
                     )}
                   </div>
                 </div>
                 
                 <button className="w-full bg-white text-slate-900 font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm hover:bg-indigo-50 transition relative z-10">
                   Pay & Skip Line
                 </button>
               </div>
               
               <div className="mt-auto text-center z-10 pt-8">
                 <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed max-w-[250px] mx-auto">
                   Express pricing updates dynamically based on remaining intermission time and queue density.
                 </p>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSurgePricing;
