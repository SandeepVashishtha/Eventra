/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveWasteManagement = () => {
  const [cvActive, setCvActive] = useState(false);
  const [capacity, setCapacity] = useState(15); // Percentage
  const [dispatched, setDispatched] = useState(false);
  
  const [appLog, setAppLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Edge-compute cameras initialized over Major Disposal Zones.' },
    { id: 2, time: '14:00:05', type: 'SYS', msg: 'YOLOv8 Object Detection loaded. Monitoring physical waste volume.' }
  ]);

  // Trash particles simulation
  const [trash, setTrash] = useState([]);

  useEffect(() => {
    let loop;
    if (cvActive && capacity < 95 && !dispatched) {
      loop = setInterval(() => {
        setCapacity(prev => {
          const next = prev + (Math.random() * 2 + 1);
          if (next >= 85 && !dispatched) {
            triggerDispatch();
          }
          return Math.min(100, next);
        });

        // Add a visual trash item
        setTrash(prev => {
          const newTrash = {
            id: Date.now(),
            x: 20 + Math.random() * 60, // Fall within the bin
            color: ['#94a3b8', '#fbbf24', '#f87171', '#38bdf8'][Math.floor(Math.random() * 4)],
            type: ['cup', 'box', 'bottle'][Math.floor(Math.random() * 3)]
          };
          return [...prev, newTrash];
        });

      }, 1000);
    }
    return () => clearInterval(loop);
  }, [cvActive, capacity, dispatched]);

  const triggerDispatch = () => {
    setDispatched(true);
    addLog('WARN', 'CV ANOMALY: Disposal Zone B-4 capacity exceeded 85% safety threshold.');
    
    setTimeout(() => {
      addLog('ACTION', 'Auto-routing nearest Janitorial Team (Unit 7) via Staff App.');
    }, 800);
  };

  const emptyBin = () => {
    if (dispatched) {
      setCapacity(5);
      setTrash([]);
      setDispatched(false);
      addLog('SUCCESS', 'Unit 7 arrived and cleared Disposal Zone B-4. Biohazard averted.');
    }
  };

  const toggleSystem = () => {
    if (!cvActive) {
      setCvActive(true);
      addLog('SYS', 'Set change occurring at Main Stage. Engaging high-frequency CV scanning.');
    } else {
      setCvActive(false);
      addLog('SYS', 'CV processing paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setAppLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> AI Physical Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Waste Management <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">via Computer Vision</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Trash cans overflow rapidly during set changes, creating biohazards and ruining the aesthetic of the festival grounds. Currently, janitorial staff walk aimlessly around a 500-acre site checking bins manually, which is highly inefficient. Eventra deploys edge-compute cameras above major waste disposal zones. Using YOLOv8 object detection, the system visually calculates the volume of trash accumulating. When a bin hits 85% capacity, it automatically routes the nearest janitorial team to empty it before it overflows.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">👁️</span> YOLOv8 Edge Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 {dispatched ? (
                   <button 
                     onClick={emptyBin}
                     className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                   >
                     Simulate Janitor Empty
                   </button>
                 ) : (
                   <button 
                     onClick={toggleSystem}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                       cvActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                       'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                     }`}
                   >
                     {cvActive ? 'Pause Scanner' : 'Initiate CV Scan'}
                   </button>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Volume Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 capacity >= 85 ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex justify-between">
                   <span>Zone B-4 Capacity</span>
                   <span className="text-slate-600">Threshold: 85%</span>
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     capacity >= 85 ? 'text-red-500' : 'text-emerald-400'
                   }`}>
                     {capacity.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">%</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-300 ${capacity >= 85 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${capacity}%` }}
                   ></div>
                 </div>
               </div>

               {/* Dispatch Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispatched ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Automated Routing</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${dispatched ? 'text-orange-500' : 'text-slate-600'}`}>
                     {dispatched ? 'DISPATCHED' : 'STANDBY'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {dispatched ? 'Unit 7 en route to B-4' : 'Awaiting capacity trigger'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Logistics Dispatch Log</span>
                 {cvActive && !dispatched && <span className="text-emerald-400 animate-pulse">Scanning...</span>}
                 {dispatched && <span className="text-orange-500 animate-pulse">ROUTING STAFF</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {appLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-500 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Computer Vision Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-xl border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-slate-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Disposal Zone B-4
              </span>
              <span className="text-[10px] font-mono text-emerald-500 flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cvActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                CAM_14_YOLO
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-end bg-slate-900 overflow-hidden pb-12">
               
               {/* Noise/Grain overlay to simulate CCTV */}
               <div className="absolute inset-0 opacity-20 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] z-10 pointer-events-none"></div>

               {/* Physical Trash Bin */}
               <div className="w-48 h-64 border-4 border-slate-700 bg-slate-800/50 rounded-b-xl relative z-20 overflow-hidden flex flex-col justify-end">
                 
                 {/* Bounding Box Overlay for the CV */}
                 {cvActive && (
                   <div className={`absolute inset-1 border-2 border-dashed z-40 transition-colors ${
                     capacity >= 85 ? 'border-red-500 bg-red-500/10' : 'border-emerald-500 bg-emerald-500/5'
                   }`}>
                     <div className={`absolute -top-5 left-[-2px] text-[8px] font-mono font-bold text-black px-1 ${
                       capacity >= 85 ? 'bg-red-500' : 'bg-emerald-500'
                     }`}>
                       BIN_VOL: {capacity.toFixed(0)}%
                     </div>
                   </div>
                 )}

                 {/* Simulated Trash Items */}
                 <div 
                   className="w-full bg-slate-700/80 absolute bottom-0 transition-all duration-300 flex flex-wrap-reverse content-start overflow-hidden border-t-2 border-slate-600 border-dashed"
                   style={{ height: `${capacity}%` }}
                 >
                   {trash.map((item) => (
                     <div 
                       key={item.id} 
                       className="w-8 h-8 m-1 opacity-80"
                       style={{ backgroundColor: item.color }}
                     >
                       {cvActive && (
                         <div className="w-full h-full border border-emerald-400 flex items-center justify-center">
                           <span className="text-[5px] text-emerald-400 font-mono">obj</span>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Emergency Alert Overlay on Camera */}
               {capacity >= 85 && !dispatched && (
                 <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 bg-red-600/90 py-2 text-center z-40 animate-pulse">
                   <p className="text-white font-black uppercase tracking-widest text-sm">CAPACITY CRITICAL</p>
                 </div>
               )}
               
               {dispatched && (
                 <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 bg-orange-600/90 py-2 text-center z-40">
                   <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">UNIT 7 DISPATCHED</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PredictiveWasteManagement;
