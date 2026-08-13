/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicShiftScheduler = () => {
  const [isAutoRouting, setIsAutoRouting] = useState(false);
  const [weatherTemp, setWeatherTemp] = useState(82);
  const [gateScanRate, setGateScanRate] = useState(120);
  
  // Volunteer Assignments
  const [zones, setZones] = useState({
      'Merch Tent': { staff: 5, capacity: 5 },
      'Main Stage': { staff: 15, capacity: 15 },
      'Water Station 1': { staff: 2, capacity: 10 },
      'Medical Tent': { staff: 3, capacity: 12 }
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Static shift assignments active. Waiting for ML override.' }
  ]);

  useEffect(() => {
      let mlLoop;
      
      if (isAutoRouting) {
          mlLoop = setInterval(() => {
              // Simulate environment changing
              setWeatherTemp(prev => {
                  const newTemp = prev + (Math.random() > 0.5 ? 1 : -0.5);
                  return Math.min(105, Math.max(75, newTemp));
              });
              
              setGateScanRate(prev => {
                  return prev + Math.floor(Math.random() * 20);
              });

              // ML Logic: If hot, move staff to water/medical. If high scan rate, move to gates.
              setZones(prev => {
                  let newZones = { ...prev };
                  
                  if (weatherTemp > 95) {
                      // Move staff from Merch/Stage to Water/Med
                      if (newZones['Main Stage'].staff > 4 && Math.random() > 0.3) {
                          newZones['Main Stage'].staff -= 1;
                          if (Math.random() > 0.5 && newZones['Water Station 1'].staff < newZones['Water Station 1'].capacity) {
                              newZones['Water Station 1'].staff += 1;
                              addLog('ACTION', 'ML Route: Pushed Volunteer -> Water Station 1 (Heat Protocol)');
                          } else if (newZones['Medical Tent'].staff < newZones['Medical Tent'].capacity) {
                              newZones['Medical Tent'].staff += 1;
                              addLog('ACTION', 'ML Route: Pushed Volunteer -> Medical Tent (Heat Protocol)');
                          }
                      }
                  } else if (gateScanRate > 250) {
                      // High influx, but simplified here just moving around randomly based on load
                      if (newZones['Merch Tent'].staff > 2 && Math.random() > 0.5) {
                           newZones['Merch Tent'].staff -= 1;
                           newZones['Main Stage'].staff += 1;
                           addLog('SYS', 'ML Route: Reallocating from Merch to Main Stage crowd control.');
                      }
                  }

                  return newZones;
              });

          }, 1500);
      } else {
          // Reset to static
          setWeatherTemp(82);
          setGateScanRate(120);
          setZones({
              'Merch Tent': { staff: 5, capacity: 5 },
              'Main Stage': { staff: 15, capacity: 15 },
              'Water Station 1': { staff: 2, capacity: 10 },
              'Medical Tent': { staff: 3, capacity: 12 }
          });
      }
      
      return () => { if (mlLoop) clearInterval(mlLoop); };
  }, [isAutoRouting, weatherTemp, gateScanRate]);

  const toggleAutoRouting = () => {
      setIsAutoRouting(!isAutoRouting);
      if (!isAutoRouting) {
          addLog('CRIT', 'ML Engine Engaged. Consuming Weather/Gate APIs for dynamic reallocation.');
      } else {
          addLog('WARN', 'ML Engine Offline. Reverted to static shift clipboard.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0f0a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Machine Learning & Operations
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Powered Dynamic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">Shift Scheduling</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Staffing coordinators guess how many volunteers are needed at the medical tent vs. the water stations, often leaving critical areas understaffed while volunteers stand around doing nothing at other locations. Eventra solves this by building a machine learning scheduling engine. It analyzes historical ticket scan rates and current weather APIs to predict where crowds will surge, dynamically pushing UI reassignments to volunteers' phones in real-time.
          </p>

          <div className="bg-[#151a11] rounded-3xl p-6 border border-yellow-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-yellow-900/30 pb-4">
               <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> ML Telemetry Inputs
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAutoRouting}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isAutoRouting ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                     'bg-yellow-600 text-white border border-yellow-500 hover:bg-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.4)]'
                   }`}
                 >
                   {isAutoRouting ? 'Disable ML Engine' : 'Engage ML Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Weather API */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 weatherTemp > 95 ? 'bg-orange-950/30 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Weather API Forecast
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${weatherTemp > 95 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`}>
                     {weatherTemp.toFixed(1)}°F
                   </span>
                 </div>
               </div>

               {/* Gate Scans */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isAutoRouting ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Gate Influx Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isAutoRouting ? 'text-cyan-400' : 'text-slate-600'}`}>
                     {gateScanRate}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1 uppercase">Scans/Min</span>
                 </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#090b07] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Operations Pipeline Log</span>
                 {isAutoRouting && <span className="text-yellow-400 font-black animate-pulse">ML PREDICTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-orange-600 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Coordinator Dashboard</span>
                      <span className="text-xs text-white font-bold">Labor Allocation Matrix</span>
                  </div>
                  {isAutoRouting && (
                      <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500 text-[9px] font-black uppercase px-2 py-1 rounded flex items-center">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-2"></span> AUTO-PILOT
                      </span>
                  )}
              </div>

              {/* Labor Matrix */}
              <div className="flex-1 bg-slate-950 p-4 space-y-4 overflow-y-auto">
                  
                  {Object.entries(zones).map(([zoneName, data]) => {
                      
                      const utilization = data.staff / Math.max(1, data.capacity);
                      
                      return (
                          <div key={zoneName} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden transition-all duration-500">
                              
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-bold text-slate-300">{zoneName}</span>
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                      {data.staff} / {data.capacity} Staff
                                  </span>
                              </div>
                              
                              {/* Staff Pips */}
                              <div className="flex flex-wrap gap-1.5">
                                  {Array.from({ length: data.capacity }).map((_, i) => (
                                      <div 
                                          key={i} 
                                          className={`w-4 h-4 rounded-full transition-all duration-700 ${
                                              i < data.staff ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-100' : 'bg-slate-800 scale-75'
                                          }`}
                                      ></div>
                                  ))}
                              </div>

                              {/* Warnings based on logic */}
                              {zoneName === 'Water Station 1' && weatherTemp > 95 && utilization < 0.5 && (
                                  <div className="absolute top-0 right-0 h-full w-1 bg-rose-500 animate-pulse"></div>
                              )}
                              
                          </div>
                      );
                  })}
                  
                  {/* Push Notification Simulator */}
                  {isAutoRouting && weatherTemp > 95 && (
                      <div className="fixed bottom-12 right-12 bg-white rounded-xl shadow-2xl p-4 w-64 border border-slate-200 animate-fade-in-up transform scale-90 origin-bottom-right">
                          <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center text-white text-[10px] font-black mr-2">E</div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eventra Staff App</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">New Shift Assignment!</h4>
                          <p className="text-xs text-slate-600">The ML engine has re-routed you to <b>Water Station 1</b> due to extreme heat index protocols. Please report immediately.</p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#151a11] p-4 rounded-xl border border-yellow-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-yellow-400 uppercase block mb-1">Algorithmic Reallocation:</span>
               Click <span className="text-white font-bold bg-yellow-600 border border-yellow-500 px-1 rounded">Engage ML Engine</span>. The engine monitors telemetry. If the <span className="text-orange-400 font-bold">Weather API</span> spikes above 95°F, it intelligently pulls volunteers from overstaffed areas (like the Main Stage) and pushes mobile UI re-assignments, dynamically filling the capacity at Medical and Water Tents to prevent heat-stroke casualties.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicShiftScheduler;
