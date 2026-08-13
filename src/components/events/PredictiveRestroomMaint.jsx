/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveRestroomMaint = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // IoT Metrics
  const [ammoniaLevel, setAmmoniaLevel] = useState(12); // ppm
  const [trafficCount, setTrafficCount] = useState(450); // Total visitors
  const [predictedFailure, setPredictedFailure] = useState(85); // Minutes until critical
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '15:00:00', type: 'SYS', msg: 'Predictive Maintenance ML Model Online.' },
    { id: 2, time: '15:00:02', type: 'SYS', msg: 'Ingesting IoT telemetry from Cluster Alpha.' }
  ]);

  // Visualizer State
  const [clusterState, setClusterState] = useState('NOMINAL'); // NOMINAL, DEGRADING, CRITICAL, CLEANING
  const [crewPos, setCrewPos] = useState({ x: -20, active: false });

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (clusterState !== 'CLEANING') {
              // Traffic goes up
              setTrafficCount(prev => prev + Math.floor(Math.random() * 3));
              
              // Ammonia goes up slowly
              setAmmoniaLevel(prev => {
                  const next = prev + (Math.random() * 0.5);
                  if (next > 50 && clusterState !== 'CRITICAL') setClusterState('CRITICAL');
                  else if (next > 30 && clusterState !== 'DEGRADING' && clusterState !== 'CRITICAL') setClusterState('DEGRADING');
                  return next;
              });

              // Predictive ML updates ETA
              setPredictedFailure(prev => {
                  const next = Math.max(0, prev - (Math.random() * 0.5));
                  
                  // Auto-dispatch crew 15 mins before failure
                  if (next < 15 && !crewPos.active && clusterState !== 'CLEANING') {
                      dispatchCrew();
                  }
                  return next;
              });
          }

          // Move crew if active
          if (crewPos.active && clusterState !== 'CLEANING') {
              setCrewPos(prev => {
                  const nextX = prev.x + 2;
                  if (nextX >= 50) {
                      // Crew arrived
                      setClusterState('CLEANING');
                      addLog('SUCCESS', 'Sanitation Crew arrived at Cluster Alpha. Commencing deep clean.');
                      
                      // Simulate cleaning time
                      setTimeout(() => {
                          if (systemActive) {
                              setAmmoniaLevel(5);
                              setPredictedFailure(120);
                              setClusterState('NOMINAL');
                              setCrewPos({ x: 120, active: false }); // Drive away
                              addLog('SYS', 'Cluster Alpha cleaned. Telemetry reset.');
                          }
                      }, 4000);
                      return { ...prev, x: 50 };
                  }
                  return { ...prev, x: nextX };
              });
          }

      }, 150); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, clusterState, crewPos]);

  const dispatchCrew = () => {
      setCrewPos({ x: -20, active: true });
      addLog('ACTION', 'ETA < 15 mins. ML Auto-Dispatching Sanitation Crew to Cluster Alpha.');
  };

  const simulateRush = () => {
      if (!systemActive || clusterState === 'CLEANING') return;
      
      setTrafficCount(prev => prev + 150);
      setAmmoniaLevel(prev => prev + 25);
      setPredictedFailure(12); // Force it below 15 to trigger auto-dispatch
      addLog('CRIT', 'Post-set bathroom rush detected! Traffic spiked +150 pax.');
      addLog('WARN', 'Ammonia concentration soaring. Failure ETA updated.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setAmmoniaLevel(12);
      setTrafficCount(450);
      setPredictedFailure(85);
      setClusterState('NOMINAL');
      setCrewPos({ x: -20, active: false });
      addLog('SYS', 'IoT Ammonia Sensors & IR Door Counters Active.');
    } else {
      setSystemActive(false);
      setCrewPos({ x: -20, active: false });
      addLog('WARN', 'ML Predictive Engine Offline. Reverting to blind hourly checks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050604] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧻</span> IoT Predictive Maintenance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Restroom <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-500 to-green-500">Sanitation AI</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival porta-potties become unusable rapidly, and maintenance crews rely on fixed hourly schedules rather than actual usage, inevitably leading to overflowing units. Eventra solves this by equipping restroom clusters with IoT ammonia gas sensors and infrared door counters. The backend ML model analyzes gas concentration curves and foot traffic throughput to accurately predict failure thresholds. It dynamically routes sanitation crews to specific clusters exactly 15 minutes before they reach critical unsuitability.
          </p>

          <div className="bg-[#0b0c0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🎛️</span> Cluster Alpha Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt ML Engine' : 'Deploy IoT Sensors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Ammonia Levels */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ammoniaLevel > 50 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 ammoniaLevel > 30 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Ammonia (NH3)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     ammoniaLevel > 50 ? 'text-red-400' : 
                     ammoniaLevel > 30 ? 'text-orange-400' : 'text-lime-400'
                   }`}>
                     {ammoniaLevel.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ppm</span>
                 </div>
               </div>

               {/* Traffic Count */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   IR Door Count
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {trafficCount}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pax</span>
                 </div>
               </div>
               
               {/* ML Failure Prediction */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 predictedFailure < 15 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' :
                 predictedFailure < 45 ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Critical ETA
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     predictedFailure < 15 ? 'text-red-400' : 
                     predictedFailure < 45 ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(predictedFailure)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">min</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Workforce Routing Ledger</span>
                 {crewPos.active && <span className="text-yellow-400 font-black animate-pulse">CREW EN ROUTE</span>}
                 {clusterState === 'CLEANING' && <span className="text-blue-400 font-black animate-pulse">CLEANING IN PROGRESS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-blue-400 font-bold' : 
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
            
            {/* Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0c0a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-400">RESTROOM CLUSTER ALPHA</span>
                <span className="text-[8px] font-mono text-slate-400">GAS / IR SENSORS</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col items-center justify-center">
                        
                        {/* Ammonia Gas Cloud Visualization */}
                        <div 
                            className="absolute inset-0 transition-all duration-1000 z-0 pointer-events-none"
                            style={{
                                background: clusterState === 'CRITICAL' ? 'radial-gradient(circle, rgba(132,204,22,0.3) 0%, rgba(0,0,0,0) 70%)' :
                                            clusterState === 'DEGRADING' ? 'radial-gradient(circle, rgba(132,204,22,0.15) 0%, rgba(0,0,0,0) 50%)' : 'none',
                                filter: 'blur(20px)'
                            }}
                        ></div>

                        {/* Porta-Potties */}
                        <div className="flex space-x-2 z-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`w-12 h-24 rounded-t-md border-2 relative overflow-hidden transition-colors duration-500 ${
                                        clusterState === 'CLEANING' ? 'bg-blue-900 border-blue-500' :
                                        clusterState === 'CRITICAL' ? 'bg-[#2a301a] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                                        clusterState === 'DEGRADING' ? 'bg-[#1f2416] border-orange-500' : 'bg-slate-800 border-lime-500/50'
                                    }`}>
                                        {/* Roof line */}
                                        <div className="w-full h-2 bg-black/40"></div>
                                        {/* Door */}
                                        <div className="absolute bottom-0 left-1 right-1 h-20 border border-black/30 rounded-t-sm flex flex-col items-center pt-2">
                                            {/* Vent */}
                                            <div className="w-6 h-2 flex flex-col justify-between">
                                                <div className="w-full h-px bg-black/40"></div>
                                                <div className="w-full h-px bg-black/40"></div>
                                            </div>
                                            {/* Handle */}
                                            <div className="absolute right-1 top-10 w-1 h-3 bg-slate-400 rounded-full"></div>
                                            
                                            {/* Clean visualizer */}
                                            {clusterState === 'CLEANING' && (
                                                <div className="absolute inset-0 bg-blue-400/20 backdrop-blur-[1px] animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Crew Truck */}
                        <div 
                            className="absolute bottom-8 w-16 h-8 bg-yellow-500 rounded-md border-2 border-yellow-600 shadow-xl z-20 flex items-center justify-center transition-all duration-300"
                            style={{ left: `${crewPos.x}%`, transform: 'translateX(-50%)', opacity: crewPos.active || clusterState === 'CLEANING' ? 1 : 0 }}
                        >
                            <span className="text-[10px] font-black uppercase text-yellow-900">CREW</span>
                            {/* Flashing light */}
                            <div className="absolute -top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0b0c0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Traffic Events</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={simulateRush}
                   disabled={!systemActive || clusterState === 'CLEANING'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || clusterState === 'CLEANING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   🚽 Simulate Post-Set Restroom Rush
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveRestroomMaint;
