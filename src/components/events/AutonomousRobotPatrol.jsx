/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousRobotPatrol = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [patrolState, setPatrolState] = useState('PATROLLING'); // PATROLLING, INVESTIGATING, THREAT_DETECTED
  
  // Robot Telemetry
  const [batteryLevel, setBatteryLevel] = useState(87); // %
  const [thermalConfidence, setThermalConfidence] = useState(0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '02:00:00', type: 'SYS', msg: 'Fleet Command initialized. 12 quadruped units deployed.' },
    { id: 2, time: '02:00:02', type: 'SYS', msg: 'Perimeter thermal tracking active. Standby.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (fleetActive && patrolState === 'PATROLLING') {
      loop = setInterval(() => {
        setBatteryLevel(prev => Math.max(15, prev - 0.1));
        setThermalConfidence(Math.random() * 5); // Background noise
      }, 1000);
    } else if (patrolState === 'INVESTIGATING') {
      loop = setInterval(() => {
        setThermalConfidence(prev => Math.min(65, prev + 15));
        
        if (thermalConfidence > 55) {
          setPatrolState('THREAT_DETECTED');
          addLog('CRIT', 'POSITIVE HUMAN SIGNATURE DETECTED AT PERIMETER FENCE (SECTOR 4).');
          
          setTimeout(() => {
            addLog('ACTION', 'Streaming live thermal video to Central Command...');
            addLog('WEB3', 'Dispatching Human Security Intercept Team to GPS: 34.05, -118.24');
          }, 1500);
        }
      }, 600);
    } else if (patrolState === 'THREAT_DETECTED') {
      loop = setInterval(() => {
        setThermalConfidence(prev => Math.min(98, prev + 2)); // Lock on
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive, patrolState, thermalConfidence]);

  const simulateBreach = () => {
    if (fleetActive && patrolState === 'PATROLLING') {
      setPatrolState('INVESTIGATING');
      addLog('WARN', 'Robot 04 detected thermal anomaly in Sector 4. Investigating...');
    }
  };

  const clearThreat = () => {
    setPatrolState('PATROLLING');
    setThermalConfidence(0);
    addLog('SUCCESS', 'Threat cleared by Intercept Team. Robot 04 resuming perimeter patrol.');
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      addLog('SYS', 'Autonomous Robot Fleet armed. Patrolling 500-acre perimeter.');
    } else {
      setFleetActive(false);
      setPatrolState('PATROLLING');
      addLog('WARN', 'Robotic Fleet offline. Relying on human perimeter guards.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060805] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Fleet Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🐕</span> Autonomous Robotics Fleet
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Robot Security <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Patrol Integration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Human security guards easily get fatigued patrolling the dark, expansive perimeter fences of a 500-acre festival site at 3 AM, leading to fence-jumpers and unauthorized access going unnoticed. Eventra solves this by integrating the security dashboard with a fleet of autonomous robotic quadrupeds. The system auto-assigns patrol routes. If a robot's thermal computer vision detects a human signature near a breached fence line, Eventra instantly alerts central command with a live thermal video feed and exact GPS coordinates for rapid interception.
          </p>

          <div className="bg-[#121008] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">📡</span> Fleet Command Console
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Recall Fleet to Base' : 'Deploy Quadruped Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Fleet Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 patrolState === 'THREAT_DETECTED' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 patrolState === 'INVESTIGATING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 fleetActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Fleet Operating Status
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     patrolState === 'THREAT_DETECTED' ? 'text-red-500 animate-pulse' :
                     patrolState === 'INVESTIGATING' ? 'text-yellow-400' :
                     fleetActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {fleetActive ? (patrolState === 'THREAT_DETECTED' ? 'THREAT FOUND' : patrolState === 'INVESTIGATING' ? 'INVESTIGATING' : 'PATROLLING') : 'DORMANT'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {fleetActive ? '12/12 Units Active' : '0/12 Units Active'}
                   </span>
                 </div>
               </div>

               {/* Target Confidence */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 patrolState === 'THREAT_DETECTED' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Thermal Threat Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     patrolState === 'THREAT_DETECTED' ? 'text-red-500' : 
                     fleetActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {fleetActive ? Math.floor(thermalConfidence) : 0}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Ops Log</span>
                 {patrolState === 'INVESTIGATING' && <span className="text-yellow-400 animate-pulse">Tracking Anomaly...</span>}
                 {patrolState === 'THREAT_DETECTED' && <span className="text-red-500 animate-pulse">Human Target Locked</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
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
            
            {/* Thermal Camera Simulator */}
            <div className={`w-full rounded-[1rem] border-[8px] border-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">ROBOT 04: THERMAL OPTICS</span>
                <span className="text-[8px] font-mono text-orange-400">GPS: 34.05, -118.24</span>
              </div>

              <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-4">
                
                {/* Simulated Thermal Background (Cold) */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-indigo-950/60 z-0">
                  {/* Fence Line */}
                  <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-cyan-900/50"></div>
                  <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-cyan-900/50"></div>
                  <div className="absolute top-[30%] left-0 w-[40%] h-0.5 bg-cyan-900/50 transform rotate-12"></div>
                </div>

                {!fleetActive ? (
                  <div className="z-10 text-center opacity-40">
                     <span className="text-4xl block mb-2">💤</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optics Sleeping</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full z-10 flex items-center justify-center">
                     
                     {/* Thermal Target (Human) */}
                     {patrolState !== 'PATROLLING' && (
                       <div className={`absolute bottom-[20%] left-[30%] flex flex-col items-center transition-all duration-1000 ${
                         patrolState === 'THREAT_DETECTED' ? 'transform scale-110 translate-x-4' : ''
                       }`}>
                         
                         {/* Heat Signature Glow */}
                         <div className="absolute inset-0 w-16 h-32 bg-red-500/40 blur-xl rounded-full"></div>
                         <div className="absolute inset-0 w-12 h-24 bg-yellow-500/50 blur-lg rounded-full mt-4"></div>
                         <div className="absolute inset-0 w-8 h-16 bg-white/60 blur-md rounded-full mt-8"></div>
                         
                         {/* Bounding Box */}
                         <div className={`absolute w-20 h-40 border-2 transition-all duration-300 ${
                           patrolState === 'THREAT_DETECTED' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'border-yellow-500 border-dashed'
                         }`}>
                            <span className={`absolute -top-5 left-0 text-[7px] font-mono px-1 font-black ${
                              patrolState === 'THREAT_DETECTED' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                            }`}>
                              HUMAN {Math.floor(thermalConfidence)}%
                            </span>
                         </div>
                       </div>
                     )}

                     {/* Grid / HUD Overlay */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0xdmgtMzhWMzl6IiBmaWxsPSIjYTg4OGQ4IiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] pointer-events-none"></div>
                     
                     {/* Crosshair */}
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
                       <div className="w-8 h-8 border border-white/50 rounded-full flex items-center justify-center">
                         <div className="w-1 h-1 bg-white rounded-full"></div>
                       </div>
                     </div>

                  </div>
                )}
                
              </div>
              
              {/* Battery Bar */}
              <div className="h-1 w-full bg-slate-900 relative">
                <div className="h-full bg-green-500" style={{ width: `${fleetActive ? batteryLevel : 0}%` }}></div>
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateBreach}
                disabled={!fleetActive || patrolState !== 'PATROLLING'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !fleetActive || patrolState !== 'PATROLLING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Fence Breach (Threat)
              </button>
              
              <button 
                onClick={clearThreat}
                disabled={patrolState !== 'THREAT_DETECTED'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  patrolState !== 'THREAT_DETECTED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Human Intercept (Clear)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutonomousRobotPatrol;
