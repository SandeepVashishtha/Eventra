/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousNarcanDrone = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [droneState, setDroneState] = useState('DOCKED'); // DOCKED, DEPLOYED, DROPPING, RETURNING
  
  // UAV Metrics
  const [altitude, setAltitude] = useState(85); // ft (Docked height)
  const [distanceToTarget, setDistanceToTarget] = useState(0); // meters
  const [batteryLevel, setBatteryLevel] = useState(100); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:15:00', type: 'SYS', msg: 'UAV Medical Response Fleet Online.' },
    { id: 2, time: '23:15:02', type: 'SYS', msg: 'Drone 04 docked in Stage Rigging. Battery 100%.' }
  ]);

  // Visualizer State
  const [dronePos, setDronePos] = useState({ x: 10, y: 10 }); // Top-down coordinate %
  const [targetPos, setTargetPos] = useState(null);
  const [payloadDropped, setPayloadDropped] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (droneState !== 'DOCKED') {
              setBatteryLevel(prev => Math.max(0, prev - 0.1)); // Drain battery
          } else {
              setBatteryLevel(prev => Math.min(100, prev + 0.5)); // Fast charge while docked
          }

      }, 200); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, droneState]);

  const triggerEmergency = () => {
    if (!systemActive || droneState !== 'DOCKED') return;
    
    // Pick a random spot in the crowd
    const targetX = 30 + (Math.random() * 60); // 30-90%
    const targetY = 40 + (Math.random() * 50); // 40-90%
    setTargetPos({ x: targetX, y: targetY });
    
    setDroneState('DEPLOYED');
    setDistanceToTarget(125);
    
    addLog('CRIT', 'MEDICAL SOS RECEIVED via App: Suspected Overdose in Sector 4.');
    addLog('ACTION', 'Dispatching UAV-04 with Naloxone Payload.');
    
    // Simulate flight out
    let flightProgress = 0;
    const flightOutInterval = setInterval(() => {
        flightProgress += 2;
        
        // Move drone visually towards target
        const curX = 10 + ((targetX - 10) * (flightProgress / 100));
        const curY = 10 + ((targetY - 10) * (flightProgress / 100));
        setDronePos({ x: curX, y: curY });
        
        // Update telemetry
        setDistanceToTarget(prev => Math.max(0, prev - 2.5));
        
        if (flightProgress >= 100) {
            clearInterval(flightOutInterval);
            
            // Reached target
            setDroneState('DROPPING');
            setDistanceToTarget(0);
            addLog('SYS', 'Target coordinate reached. Engaging optical flow cameras for safe descent.');
            
            // Descend
            let descent = 85;
            const descentInterval = setInterval(() => {
                descent -= 2;
                setAltitude(descent);
                
                if (descent <= 15) {
                    clearInterval(descentInterval);
                    setAltitude(15);
                    
                    // Drop payload
                    setPayloadDropped(true);
                    addLog('SUCCESS', 'Narcan Payload deployed safely via tether to bystanders.');
                    addLog('ACTION', 'Paramedics are 4 minutes away. Bystanders instructed to administer dose.');
                    
                    setTimeout(() => {
                        // Ascend and return
                        setPayloadDropped(false);
                        setTargetPos(null);
                        setDroneState('RETURNING');
                        addLog('SYS', 'Payload detached. Ascending to 85ft to return to dock.');
                        
                        let returnAltitude = 15;
                        const returnAscendInterval = setInterval(() => {
                            returnAltitude += 2;
                            setAltitude(returnAltitude);
                            
                            if (returnAltitude >= 85) {
                                clearInterval(returnAscendInterval);
                                setAltitude(85);
                                setDistanceToTarget(125);
                                
                                // Fly back
                                let flightBack = 0;
                                const flightBackInterval = setInterval(() => {
                                    flightBack += 2;
                                    
                                    const retX = curX - ((curX - 10) * (flightBack / 100));
                                    const retY = curY - ((curY - 10) * (flightBack / 100));
                                    setDronePos({ x: retX, y: retY });
                                    setDistanceToTarget(prev => Math.max(0, prev - 2.5));
                                    
                                    if (flightBack >= 100) {
                                        clearInterval(flightBackInterval);
                                        setDroneState('DOCKED');
                                        setDistanceToTarget(0);
                                        addLog('SYS', 'UAV-04 Docked and charging. Awaiting next dispatch.');
                                    }
                                }, 50);
                            }
                        }, 50);
                    }, 2000); // Wait 2s at drop height
                }
            }, 50);
        }
    }, 50);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setDroneState('DOCKED');
      setAltitude(85);
      setDistanceToTarget(0);
      setDronePos({ x: 10, y: 10 });
      setTargetPos(null);
      setPayloadDropped(false);
      addLog('SYS', 'Autonomous UAV Fleet Armed. Optical Navigation Sensors active.');
    } else {
      setSystemActive(false);
      setDroneState('DOCKED');
      setDronePos({ x: 10, y: 10 });
      addLog('WARN', 'UAV Fleet Offline. Relying on manual paramedic response.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#110505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚁</span> Crisis Response Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Drone-Delivered Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">Narcan Deployment</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Opiate overdoses require medical intervention within 3 minutes, but it is physically impossible for human paramedics to push through a dense crowd of 50,000 people in that timeframe. Eventra solves this via an autonomous quadcopter drone docked in the stage rigging. When a bystander flags a crisis via the app, the drone is dispatched instantly, using optical flow cameras to safely descend directly over the GPS coordinate and drop a single-use Narcan (Naloxone) spray to bystanders within 45 seconds.
          </p>

          <div className="bg-[#1a0808] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎛️</span> UAV Medical Telemetry: Unit 04
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Ground Fleet' : 'Arm UAV Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Altitude */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 altitude < 40 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Radar Altitude
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     altitude < 40 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {altitude}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">FT</span>
                 </div>
               </div>

               {/* Distance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 droneState === 'DEPLOYED' || droneState === 'RETURNING' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Distance to Target
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     droneState !== 'DOCKED' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {distanceToTarget.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">M</span>
                 </div>
               </div>
               
               {/* Battery */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 batteryLevel < 20 ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Battery Cell
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     batteryLevel < 20 ? 'text-red-500' :
                     batteryLevel === 100 ? 'text-emerald-400' : 'text-slate-300'
                   }`}>
                     {Math.floor(batteryLevel)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dispatch Ledger</span>
                 {droneState === 'DEPLOYED' && <span className="text-red-500 font-black animate-pulse">EN ROUTE TO SOS</span>}
                 {droneState === 'DROPPING' && <span className="text-orange-400 font-black animate-pulse">DESCENDING / DROPPING</span>}
                 {droneState === 'RETURNING' && <span className="text-blue-400 font-black">RTB (RETURNING)</span>}
                 {droneState === 'DOCKED' && systemActive && <span className="text-emerald-400">DOCKED & CHARGING</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Aerial Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0f121a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/50 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">OPTICAL FLOW CVR</span>
                <span className="text-[8px] font-mono text-slate-400">OVERHEAD VIEW</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DRONE DOCKED (POWER OFF)</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Fake Ground / Crowd Map */}
                      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px]">
                          {/* Stage Area */}
                          <div className="absolute top-0 left-0 w-32 h-20 bg-blue-900/20 border-b border-r border-blue-500/30 rounded-br-lg flex items-center justify-center">
                              <span className="text-[8px] font-black text-blue-500/50 uppercase">Main Stage</span>
                          </div>
                      </div>

                      {/* Docking Station */}
                      <div className="absolute top-5 left-5 w-10 h-10 border-2 border-emerald-500/50 rounded flex items-center justify-center bg-emerald-900/20 z-10">
                          <span className="text-[6px] text-emerald-400 font-black">DOCK</span>
                      </div>

                      {/* SOS Target (Only visible when deployed) */}
                      {targetPos && (
                          <div 
                              className="absolute w-12 h-12 z-10 flex items-center justify-center"
                              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                              {/* Pulse rings */}
                              <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
                              <div className="absolute inset-2 border border-red-500 rounded-full animate-ping opacity-75" style={{animationDelay: '0.2s'}}></div>
                              <span className="text-xl filter brightness-200">🆘</span>
                          </div>
                      )}

                      {/* The Drone */}
                      <div 
                          className="absolute z-30 transition-transform duration-75"
                          style={{ 
                              left: `${dronePos.x}%`, 
                              top: `${dronePos.y}%`, 
                              transform: `translate(-50%, -50%) scale(${Math.max(0.4, altitude / 85)})` // Scale based on altitude
                          }}
                      >
                          {/* Drone Body (Top-down view) */}
                          <div className="w-12 h-12 relative flex items-center justify-center">
                              {/* Rotors */}
                              <div className={`absolute top-0 left-0 w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center ${droneState !== 'DOCKED' ? 'animate-[spin_0.1s_linear_infinite]' : ''}`}>
                                  <div className="w-full h-0.5 bg-slate-400"></div>
                              </div>
                              <div className={`absolute top-0 right-0 w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center ${droneState !== 'DOCKED' ? 'animate-[spin_0.1s_linear_infinite]' : ''}`}>
                                  <div className="w-full h-0.5 bg-slate-400"></div>
                              </div>
                              <div className={`absolute bottom-0 left-0 w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center ${droneState !== 'DOCKED' ? 'animate-[spin_0.1s_linear_infinite]' : ''}`}>
                                  <div className="w-full h-0.5 bg-slate-400"></div>
                              </div>
                              <div className={`absolute bottom-0 right-0 w-4 h-4 border border-slate-500 rounded-full flex items-center justify-center ${droneState !== 'DOCKED' ? 'animate-[spin_0.1s_linear_infinite]' : ''}`}>
                                  <div className="w-full h-0.5 bg-slate-400"></div>
                              </div>
                              
                              {/* Chassis */}
                              <div className="w-6 h-6 bg-slate-800 border-2 border-slate-600 rounded-lg shadow-xl flex items-center justify-center overflow-hidden">
                                  {/* Camera sensor indicator */}
                                  <div className={`w-2 h-2 rounded-full ${droneState === 'DROPPING' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                              </div>
                          </div>

                          {/* Dropping Payload Animation */}
                          {payloadDropped && (
                              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white border border-red-500 rounded shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 flex items-center justify-center animate-[drop_2s_ease-in_forwards]" style={{ transform: 'translate(-50%, -50%)' }}>
                                  <span className="text-[6px] font-black text-red-500">RX</span>
                              </div>
                          )}
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes drop {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        90% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Emergency Controls */}
            <div className="w-full bg-[#1a0808] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Crowd App Simulator</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerEmergency}
                   disabled={!systemActive || droneState !== 'DOCKED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || droneState !== 'DOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                   }`}
                 >
                   ⚠️ Flag Medical SOS (Overdose)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutonomousNarcanDrone;
