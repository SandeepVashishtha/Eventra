/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutoMedEvacPods = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [activeMissions, setActiveMissions] = useState([]);
  
  // Fleet Metrics
  const [availablePods, setAvailablePods] = useState(4);
  const [h2FuelLevel, setH2FuelLevel] = useState(100); // Hydrogen %
  const [livesSaved, setLivesSaved] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '19:00:00', type: 'SYS', msg: 'Hydro-Cell Auto-Evac Fleet Online.' },
    { id: 2, time: '19:00:02', type: 'SYS', msg: 'Awaiting MEDEVAC dispatch coordinates.' }
  ]);

  // Simulation loop
  useEffect(() => {
    let loop;
    
    if (fleetActive) {
      loop = setInterval(() => {
          
          setActiveMissions(prev => {
              let next = [...prev];
              
              next.forEach(m => {
                  if (m.status === 'OUTBOUND') {
                      m.progress += (Math.random() * 2) + 1;
                      
                      // Simulate ultrasonic obstacle detection slowing down the pod
                      if (Math.random() > 0.7) {
                          m.obstacle = true;
                          m.progress -= 1; // Slow down
                          if(Math.random() > 0.8) {
                             addLog('AI', `Pod #${m.podId} re-routing around dense crowd cluster.`);
                          }
                      } else {
                          m.obstacle = false;
                      }

                      if (m.progress >= 100) {
                          m.progress = 100;
                          m.status = 'LOADING';
                          addLog('ACTION', `Pod #${m.podId} arrived at Zone ${m.zone}. Loading patient.`);
                      }
                  } else if (m.status === 'LOADING') {
                      m.waitTimer = (m.waitTimer || 0) + 1;
                      if (m.waitTimer > 25) { // simulate EMT loading patient
                          m.status = 'INBOUND';
                          addLog('CRIT', `Patient secured. Pod #${m.podId} returning to Medical Tent.`);
                      }
                  } else if (m.status === 'INBOUND') {
                      // Faster return trip as path is already cleared
                      m.progress -= (Math.random() * 3) + 2; 
                      m.obstacle = false;
                      if (m.progress <= 0) {
                          m.status = 'COMPLETE';
                          addLog('SUCCESS', `Pod #${m.podId} arrived at Medical Tent. Patient transferred.`);
                          setAvailablePods(p => p + 1);
                          setLivesSaved(l => l + 1);
                          setH2FuelLevel(f => Math.max(0, f - 12)); // Consume fuel
                      }
                  }
              });
              
              return next.filter(m => m.status !== 'COMPLETE');
          });

      }, 150);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive]);

  const dispatchMedevac = () => {
    if (!fleetActive || availablePods <= 0) return;
    
    const newPodId = Math.floor(Math.random() * 89) + 10;
    const zoneLetter = ['A', 'B', 'C', 'D'][Math.floor(Math.random()*4)];
    const zoneNum = Math.floor(Math.random() * 9) + 1;
    const severity = ['TRAUMA', 'HEAT_STROKE', 'CARDIAC', 'UNKNOWN'][Math.floor(Math.random()*4)];
    
    setAvailablePods(p => p - 1);
    
    setActiveMissions(prev => [...prev, {
        id: Date.now(),
        podId: newPodId,
        zone: `${zoneLetter}${zoneNum}`,
        severity: severity,
        progress: 0,
        status: 'OUTBOUND',
        obstacle: false
    }]);
    
    addLog('CRIT', `EMERGENCY MEDEVAC TRIGGERED: Zone ${zoneLetter}${zoneNum}. Severity: ${severity}.`);
    addLog('SYS', `Dispatching Autonomous Pod #${newPodId}. Broadcasting path-clear alerts to nearby attendees.`);
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      setAvailablePods(4);
      setH2FuelLevel(100);
      addLog('SYS', 'Hydro-Cell Evac Fleet active. Ultrasonic sensors engaged.');
    } else {
      setFleetActive(false);
      setActiveMissions([]);
      addLog('WARN', 'Evac Fleet Offline. Recalling to base.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Command Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚑</span> Life-Safety Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Hydro-Cell <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">Medical Evacuation Pods</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When an attendee suffers a severe medical emergency deep in the crowd, it takes traditional golf carts too long to navigate through 50,000 dense, dancing people, risking fatal delays. Eventra solves this by deploying tracked, autonomous medical evacuation pods powered by zero-emission hydrogen fuel cells. When an emergency is flagged, the system clears a virtual path via app alerts, while the pod uses ultrasonic sensors to autonomously and safely navigate the mob, retrieve the patient, and return to the medical tent.
          </p>

          <div className="bg-[#120808] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🚁</span> Fleet Command
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Stand Down Fleet' : 'Boot Evac Systems'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Available Pods */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive && availablePods > 0 ? 'bg-rose-950/20 border-rose-900/50' : 
                 fleetActive && availablePods === 0 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Standby Pods
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetActive && availablePods > 0 ? 'text-white' : 
                     fleetActive ? 'text-red-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {availablePods}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/ 4</span>
                 </div>
               </div>

               {/* H2 Fuel */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 h2FuelLevel < 25 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' :
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   H₂ Cell Reserve
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     h2FuelLevel < 25 ? 'text-orange-400 animate-pulse' :
                     fleetActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {h2FuelLevel}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Transports Completed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 livesSaved > 0 ? 'bg-emerald-950/20 border-emerald-900/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Evacs Completed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     livesSaved > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {livesSaved}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090303] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Telemetry Log</span>
                 {activeMissions.length > 0 && <span className="text-rose-400 animate-pulse">MISSION ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' :
                       log.type === 'AI' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Fleet Tracker Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!fleetActive ? 'bg-slate-900' : 'bg-[#050303]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">EVAC TRACKER</span>
                <span className="text-[8px] font-mono text-slate-400">RADAR / ULTRASONIC FEED</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-10">
                
                {/* HUD Grid Background */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e11d48_1px,transparent_1px),linear-gradient(to_bottom,#e11d48_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                {!fleetActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center z-10">
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FLEET IN STANDBY</span>
                   </div>
                ) : activeMissions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center z-10">
                        <div className="w-16 h-16 border-2 border-dashed border-rose-900 rounded-full flex items-center justify-center animate-pulse mb-2">
                            <span className="text-2xl">✚</span>
                        </div>
                        <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">AWAITING MEDEVAC DISPATCH</span>
                    </div>
                ) : (
                  <div className="flex-1 relative mt-4 overflow-y-auto pr-2 space-y-3 z-10">
                      
                      {activeMissions.map((mission) => (
                          <div key={mission.id} className="bg-slate-900/80 border border-slate-700 p-3 rounded-lg relative overflow-hidden backdrop-blur shadow-lg">
                              
                              <div className="flex justify-between items-center mb-2 relative z-10">
                                  <span className="text-[10px] font-black uppercase text-white tracking-widest">POD #{mission.podId}</span>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                      mission.status === 'OUTBOUND' ? 'bg-orange-900/50 text-orange-400 border border-orange-800' :
                                      mission.status === 'LOADING' ? 'bg-rose-900/50 text-rose-400 border border-rose-800 animate-pulse' :
                                      'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                                  }`}>
                                      {mission.status}
                                  </span>
                              </div>

                              <div className="flex justify-between items-end mb-3 relative z-10">
                                  <div className="flex flex-col">
                                      <span className="text-[8px] text-slate-500 uppercase">Destination</span>
                                      <span className="text-xs font-bold text-white">Zone {mission.zone}</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                      <span className="text-[8px] text-slate-500 uppercase">Severity</span>
                                      <span className={`text-xs font-black uppercase ${mission.severity === 'TRAUMA' || mission.severity === 'CARDIAC' ? 'text-red-500' : 'text-orange-400'}`}>
                                          {mission.severity}
                                      </span>
                                  </div>
                              </div>

                              {/* Progress Bar with Obstacles */}
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative z-10 flex">
                                  <div 
                                      className={`h-full transition-all duration-150 ${
                                          mission.status === 'INBOUND' ? 'bg-emerald-500' : 
                                          mission.obstacle ? 'bg-yellow-400' : 'bg-rose-500'
                                      }`} 
                                      style={{ width: `${mission.progress}%` }}
                                  ></div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-1 relative z-10">
                                  <span className="text-[7px] font-mono text-slate-500">BASE</span>
                                  
                                  {/* Obstacle warning */}
                                  <div className="flex-1 flex justify-center">
                                      {mission.obstacle && mission.status === 'OUTBOUND' && (
                                          <span className="text-[7px] font-black uppercase text-yellow-400 animate-ping">AVOIDING CROWD...</span>
                                      )}
                                      {mission.status === 'LOADING' && (
                                          <span className="text-[7px] font-black uppercase text-rose-400 animate-pulse">PATIENT TRANSFER IN PROGRESS...</span>
                                      )}
                                  </div>

                                  <span className="text-[7px] font-mono text-slate-500">SCENE</span>
                              </div>

                              {/* Background highlight if critical */}
                              {(mission.severity === 'CARDIAC' || mission.severity === 'TRAUMA') && (
                                  <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                              )}
                          </div>
                      ))}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120808] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Trigger Emergency Response</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={dispatchMedevac}
                   disabled={!fleetActive || availablePods <= 0}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || availablePods <= 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-white hover:bg-rose-900/60 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse'
                   }`}
                 >
                   {availablePods <= 0 && fleetActive ? 'No Pods Available' : 'Dispatch Medevac to Crowd'}
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutoMedEvacPods;
