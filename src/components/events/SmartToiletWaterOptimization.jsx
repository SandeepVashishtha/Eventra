/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartToiletWaterOptimization = () => {
  const [intermissionActive, setIntermissionActive] = useState(false);
  const [waterPressure, setWaterPressure] = useState(65.0); // PSI
  const [flushVolume, setFlushVolume] = useState(1.6); // GPF (Gallons per flush)
  const [optimizationTriggered, setOptimizationTriggered] = useState(false);
  
  const CRITICAL_PRESSURE = 35.0;

  const [iotLog, setIotLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'IoT Flow-Meters connected to Main Plumbing Line A.' },
    { id: 2, time: '21:00:05', type: 'ACTUATOR', msg: 'Electronic flush valves synced. Baseline volume set to 1.6 GPF.' }
  ]);

  useEffect(() => {
    let loop;
    if (intermissionActive) {
      loop = setInterval(() => {
        setWaterPressure(prev => {
          let next;
          if (!optimizationTriggered) {
            // Pressure drops fast due to mass usage
            next = prev - (Math.random() * 2 + 1.5);
          } else {
            // Pressure stabilizes/recovers slowly after optimization
            next = prev + (Math.random() * 1.5);
          }
          return Math.max(10, Math.min(65, next));
        });
      }, 300);
    }
    return () => clearInterval(loop);
  }, [intermissionActive, optimizationTriggered]);

  useEffect(() => {
    // Safety Logic
    if (intermissionActive && !optimizationTriggered) {
      if (waterPressure <= CRITICAL_PRESSURE) {
        setOptimizationTriggered(true);
        setFlushVolume(0.8); // Drop flush volume by half
        
        addLog('WARN', `CRITICAL PRESSURE DROP DETECTED (${waterPressure.toFixed(1)} PSI).`);
        setTimeout(() => {
          addLog('ACTION', 'Auto-adjusting 250 electronic flush valves to low-volume mode (0.8 GPF).');
          setTimeout(() => {
            addLog('SUCCESS', 'Total system failure prevented. Pressure stabilizing.');
          }, 1000);
        }, 500);
      }
    }
  }, [waterPressure, intermissionActive, optimizationTriggered]);

  const toggleIntermission = () => {
    if (!intermissionActive) {
      setIntermissionActive(true);
      setOptimizationTriggered(false);
      setFlushVolume(1.6);
      setWaterPressure(65.0);
      addLog('EVENT', 'Headline act finished set. Mass intermission initiated.');
    } else {
      setIntermissionActive(false);
      setOptimizationTriggered(false);
      setFlushVolume(1.6);
      setWaterPressure(65.0);
      addLog('SYS', 'Intermission concluded. Resetting flush valves to 1.6 GPF baseline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setIotLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Civil Eng Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-100 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💧</span> Civil Engineering IoT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Smart Toilet Water-Usage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Optimization Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            When an act ends at a massive festival, 10,000+ attendees rush the restrooms simultaneously. This mass intermission causes mainline water pressure to drop to critical levels, leading to cascading plumbing failures and overflowing toilets. Eventra solves this by merging civil engineering with IoT. Flow-meters monitor mainline pressure; if it dips below 35 PSI, the backend automatically reprograms all electronic flush valves from 1.6 GPF down to 0.8 GPF, saving the plumbing infrastructure instantly.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🚰</span> Main Plumbing Line Telemetry
               </h3>
               
               <button 
                 onClick={toggleIntermission}
                 disabled={intermissionActive && !optimizationTriggered}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm flex items-center ${
                   intermissionActive && !optimizationTriggered ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' :
                   intermissionActive ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200' :
                   'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                 }`}
               >
                 {intermissionActive && !optimizationTriggered ? 'Mass Flush Event Active...' : intermissionActive ? 'Reset Simulation' : 'Simulate Intermission Rush'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Pressure Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 waterPressure <= CRITICAL_PRESSURE && !optimizationTriggered ? 'bg-rose-50 border-rose-200 shadow-inner' : 
                 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Mainline Water Pressure</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     waterPressure <= CRITICAL_PRESSURE && !optimizationTriggered ? 'text-rose-500' : 
                     optimizationTriggered ? 'text-emerald-500' : 'text-slate-700'
                   }`}>
                     {waterPressure.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-2 pb-1">PSI</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${waterPressure <= CRITICAL_PRESSURE && !optimizationTriggered ? 'bg-rose-500' : optimizationTriggered ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
                     style={{ width: `${(waterPressure / 80) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* Valve Status Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 optimizationTriggered ? 'bg-cyan-50 border-cyan-200 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">IoT Flush Valve Actuators</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-500 ${
                     optimizationTriggered ? 'text-cyan-600' : 'text-slate-700'
                   }`}>
                     {flushVolume.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-2 pb-1">GPF</span>
                 </div>
                 
                 <div className="absolute top-3 right-3 flex items-center space-x-1">
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                     optimizationTriggered ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-200 text-slate-500'
                   }`}>
                     {optimizationTriggered ? 'LOW-VOL MODE' : 'STANDARD'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Plumbing IoT Matrix Log</span>
                 <span className="text-cyan-400 animate-pulse">Monitoring Flow...</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {iotLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-rose-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-300' :
                       log.type === 'EVENT' ? 'text-purple-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Plumbing Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-100 rounded-[2.5rem] border-8 border-white shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-white/80 text-cyan-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-cyan-100 backdrop-blur-md shadow-sm">
                Restroom Trailer Array
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
               
               {/* Background Tile Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px] z-0"></div>

               {/* Simulated Main Water Line */}
               <div className="absolute top-20 bottom-10 left-[20%] w-3 bg-slate-300 border-x border-slate-400 z-10 flex flex-col items-center">
                 {/* Flow meter graphic */}
                 <div className="absolute top-10 w-8 h-8 bg-cyan-700 rounded-full border-2 border-slate-400 flex items-center justify-center shadow-md">
                   <div className="w-4 h-1 bg-white animate-spin" style={{ animationDuration: `${Math.max(0.1, waterPressure / 65)}s` }}></div>
                 </div>
               </div>

               {/* Toilet Cubicles */}
               <div className="absolute top-24 right-10 bottom-10 w-[60%] flex flex-col justify-around z-20">
                 
                 {[1, 2, 3, 4].map((stall) => (
                   <div key={stall} className="relative flex items-center mb-6">
                     {/* Pipe branch */}
                     <div className="absolute -left-16 w-16 h-2 bg-slate-300 border-y border-slate-400">
                       {/* Water flow indicator animation */}
                       {intermissionActive && (
                         <div className="absolute inset-0 bg-cyan-400/50" style={{ 
                           animation: `flowRight ${optimizationTriggered ? 0.8 : 0.4}s linear infinite` 
                         }}></div>
                       )}
                     </div>
                     
                     <style dangerouslySetInnerHTML={{__html: `
                       @keyframes flowRight {
                         from { transform: translateX(-100%); }
                         to { transform: translateX(100%); }
                       }
                     `}} />

                     {/* Electronic Valve */}
                     <div className={`absolute -left-2 w-4 h-6 rounded-sm border z-10 transition-colors duration-300 ${
                       optimizationTriggered ? 'bg-cyan-500 border-cyan-700' : 'bg-slate-700 border-slate-900'
                     }`}>
                       <div className={`w-1 h-1 rounded-full m-1 ${optimizationTriggered ? 'bg-white animate-pulse' : 'bg-red-500'}`}></div>
                     </div>

                     {/* Toilet graphic */}
                     <div className="w-16 h-12 bg-white rounded-t-xl rounded-b-md shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-slate-200 relative flex flex-col items-center pt-2 overflow-hidden">
                       <div className="w-10 h-6 bg-slate-100 rounded-full border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
                         {/* Water level inside bowl */}
                         <div className={`w-full bg-cyan-500/50 transition-all duration-300 ${
                           intermissionActive && !optimizationTriggered ? 'h-full animate-pulse bg-blue-500/60' : // High flush
                           intermissionActive && optimizationTriggered ? 'h-1/2 bg-cyan-400/60' : // Low flush
                           'h-2' // Idle
                         }`}></div>
                       </div>
                       
                       {/* Usage Indicator */}
                       {intermissionActive && (
                         <span className="absolute -right-6 top-0 text-[10px] bg-rose-100 text-rose-600 font-bold px-1 rounded animate-pulse">IN USE</span>
                       )}
                     </div>
                   </div>
                 ))}
                 
               </div>

               {/* System Status Overlay */}
               <div className="absolute bottom-6 inset-x-6 bg-white/90 border border-slate-200 p-4 rounded-2xl shadow-xl backdrop-blur-md z-30">
                 
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center space-x-2">
                     <span className="text-xl">📊</span>
                     <div>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">System Load</p>
                       <p className={`text-sm font-black ${intermissionActive ? 'text-rose-600' : 'text-slate-700'}`}>
                         {intermissionActive ? 'PEAK CAPACITY' : 'NORMAL'}
                       </p>
                     </div>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Valve Actuation</p>
                     <p className={`text-xs font-mono font-bold mt-1 ${optimizationTriggered ? 'text-cyan-600' : 'text-slate-700'}`}>
                       {flushVolume} GAL
                     </p>
                   </div>
                 </div>

                 {/* Optimization Alert */}
                 <div className={`mt-2 p-2 rounded-lg text-center transition-all duration-300 ${
                   optimizationTriggered ? 'bg-cyan-100 border border-cyan-200' : 
                   intermissionActive ? 'bg-rose-100 border border-rose-200 animate-pulse' : 'bg-slate-100 border border-slate-200 opacity-50'
                 }`}>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${
                     optimizationTriggered ? 'text-cyan-700' : 
                     intermissionActive ? 'text-rose-700' : 'text-slate-500'
                   }`}>
                     {optimizationTriggered ? 'Flow Optimized - Plumbing Safe' : 
                      intermissionActive ? 'Warning: Pressure Dropping' : 'Standby Monitoring'}
                   </p>
                 </div>

               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartToiletWaterOptimization;
