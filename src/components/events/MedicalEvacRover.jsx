/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MedicalEvacRover = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [roverState, setRoverState] = useState('DOCKED'); // DOCKED, DISPATCHED, CROWD_PARTING, EXTRACTING
  
  // Rover Telemetry
  const [batteryLevel, setBatteryLevel] = useState(100); 
  const [pathResistance, setPathResistance] = useState(0); // Crowd density blocking path %
  const [distance, setDistance] = useState(0); // meters to target/base
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '17:00:00', type: 'SYS', msg: 'Autonomous Medical Fleet (AMF) Online.' },
    { id: 2, time: '17:00:02', type: 'SYS', msg: 'Solar charging nominal. Rovers docked at Med Tent Alpha.' }
  ]);

  // Visualizer State
  const [roverPos, setRoverPos] = useState({ x: 50, y: 90 }); // Starts at bottom (Med Tent)
  const [targetPos, setTargetPos] = useState(null);
  const [crowd, setCrowd] = useState([]);
  const [acousticPulses, setAcousticPulses] = useState([]);

  // Initialize random crowd
  useEffect(() => {
      const initialCrowd = Array.from({length: 120}).map((_, i) => ({
          id: i,
          x: 10 + Math.random() * 80,
          y: 20 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
      }));
      setCrowd(initialCrowd);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (roverState !== 'DOCKED') {
              setBatteryLevel(prev => Math.max(0, prev - 0.1));
          } else {
              setBatteryLevel(prev => Math.min(100, prev + 0.5)); // Solar charging
          }

          // Ambient Crowd Movement
          setCrowd(prev => prev.map(p => {
              let newX = p.x + p.vx;
              let newY = p.y + p.vy;
              
              // Bounce off walls
              if (newX < 5 || newX > 95) p.vx *= -1;
              if (newY < 10 || newY > 80) p.vy *= -1;
              
              // Crowd Parting Logic (Acoustic Repulsion)
              if (roverState === 'CROWD_PARTING') {
                  const dx = newX - roverPos.x;
                  const dy = newY - roverPos.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  
                  if (dist < 20) { // If within acoustic blast radius
                      // Push away from rover
                      newX += (dx/dist) * 1.5;
                      newY += (dy/dist) * 1.5;
                  }
              }

              return { ...p, x: Math.max(5, Math.min(95, newX)), y: Math.max(10, Math.min(80, newY)) };
          }));

          // Rover Movement Logic
          if (targetPos) {
              const dx = targetPos.x - roverPos.x;
              const dy = targetPos.y - roverPos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              setDistance(dist * 3); // Scaled for meters
              
              // Calculate Path Resistance based on crowd in front of rover
              let resistance = 0;
              crowd.forEach(p => {
                  const pdx = p.x - roverPos.x;
                  const pdy = p.y - roverPos.y;
                  const pDist = Math.sqrt(pdx*pdx + pdy*pdy);
                  // If crowd is close and in the direction of travel
                  if (pDist < 10 && (pdx * dx + pdy * dy) > 0) {
                      resistance += 5;
                  }
              });
              setPathResistance(Math.min(100, resistance));

              if (dist < 2) {
                  // Reached Target
                  if (roverState === 'DISPATCHED' || roverState === 'CROWD_PARTING') {
                      setRoverState('EXTRACTING');
                      setTargetPos({ x: 50, y: 90 }); // Set target back to base
                      setPathResistance(0);
                      addLog('SUCCESS', 'Patient secured on autonomous stretcher.');
                      addLog('ACTION', 'Initiating Evacuation Protocol. Routing back to Med Tent.');
                  } else if (roverState === 'EXTRACTING') {
                      setRoverState('DOCKED');
                      setTargetPos(null);
                      setDistance(0);
                      setPathResistance(0);
                      setRoverPos({ x: 50, y: 90 });
                      addLog('SUCCESS', 'Patient delivered safely. Rover docking for solar recharge.');
                  }
              } else {
                  // Move Rover
                  if (resistance > 60 && roverState !== 'CROWD_PARTING') {
                      // Stuck in crowd
                      setRoverState('CROWD_PARTING');
                      addLog('WARN', 'Path blocked by dense crowd (85% Resistance).');
                      addLog('ACTION', 'Emitting 40Hz acoustic bass pulses to part the crowd.');
                  } 
                  
                  if (roverState === 'CROWD_PARTING') {
                      // Move very slowly while parting
                      setRoverPos(prev => ({ x: prev.x + (dx/dist) * 0.2, y: prev.y + (dy/dist) * 0.2 }));
                      
                      // Emit acoustic visual pulses
                      if (Math.random() > 0.7) {
                          setAcousticPulses(prev => [...prev, { id: Date.now(), radius: 0, opacity: 1 }].slice(-3));
                      }
                  } else {
                      // Normal speed
                      setRoverPos(prev => ({ x: prev.x + (dx/dist) * 0.8, y: prev.y + (dy/dist) * 0.8 }));
                  }
              }
          }

          // Expand acoustic pulses
          setAcousticPulses(prev => prev.map(p => ({
              ...p,
              radius: p.radius + 2,
              opacity: p.opacity - 0.05
          })).filter(p => p.opacity > 0));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, roverState, targetPos, roverPos, crowd]);

  const triggerDispatch = () => {
    if (!systemActive || roverState !== 'DOCKED') return;
    
    setRoverState('DISPATCHED');
    setTargetPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 30 }); // Random incident deep in crowd
    
    addLog('CRIT', 'Medical Emergency reported at Stage Left (Grid C-4).');
    addLog('ACTION', 'Dispatching narrow-chassis autonomous Stretcher Rover.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setRoverState('DOCKED');
      setRoverPos({ x: 50, y: 90 });
      setTargetPos(null);
      setDistance(0);
      setPathResistance(0);
      addLog('SYS', 'LiDAR & Ultrasonic pathfinding sensors armed.');
    } else {
      setSystemActive(false);
      setRoverState('DOCKED');
      setTargetPos(null);
      setAcousticPulses([]);
      addLog('WARN', 'Autonomous Fleet Offline. Relying on human cart drivers.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050202] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚑</span> Autonomous Medical Evac
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Solar-Powered Medical <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-pink-500">Evacuation Rovers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Standard golf-cart ambulances are simply too wide to navigate through densely packed festival crowds, fatally delaying critical medical evacuations while security guards scream at attendees to move. Eventra solves this by deploying a fleet of ultra-narrow, stretcher-sized autonomous rovers. When dispatched, the rover uses LiDAR and ultrasonic sensors to calculate the path of least resistance. If stuck, it emits low-frequency 40Hz acoustic bass pulses—which humans naturally and subconsciously step away from—gently parting the crowd autonomously to extract the patient safely.
          </p>

          <div className="bg-[#0a0202] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎛️</span> Rover Telemetry Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Recall Fleet (E-Stop)' : 'Deploy Autonomous Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Distance to Target */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 roverState !== 'DOCKED' ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Target Distance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     roverState !== 'DOCKED' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {distance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m</span>
                 </div>
               </div>

               {/* Path Resistance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 pathResistance > 60 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Path Resistance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     pathResistance > 60 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(pathResistance)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Solar Battery */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Solar Cell Array
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {batteryLevel.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>LiDAR Nav Ledger</span>
                 {roverState === 'DISPATCHED' && <span className="text-blue-400 font-black animate-pulse">ROUTING TO INCIDENT</span>}
                 {roverState === 'CROWD_PARTING' && <span className="text-orange-400 font-black animate-pulse">EMITTING ACOUSTIC PULSES</span>}
                 {roverState === 'EXTRACTING' && <span className="text-emerald-400 font-black">EXTRACTING PATIENT</span>}
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
            
            {/* Rover Top-Down Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#03080a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">LiDAR TOP-DOWN PREVIS</span>
                <span className="text-[8px] font-mono text-slate-400">ROVER CAM-1</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DRIVE SYSTEMS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 overflow-hidden">
                      
                      {/* Grid Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                      {/* Med Tent Base */}
                      <div className="absolute bottom-0 inset-x-0 h-16 bg-red-900/20 border-t-2 border-red-500/50 flex items-end justify-center pb-2 z-10">
                          <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Med Tent Alpha</span>
                      </div>

                      {/* The Crowd */}
                      <div className="absolute inset-0 z-20 pointer-events-none">
                          {crowd.map(c => (
                              <div 
                                  key={c.id} 
                                  className="absolute w-1.5 h-1.5 bg-slate-600 rounded-full"
                                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                              ></div>
                          ))}
                      </div>

                      {/* Incident Target */}
                      {targetPos && (
                          <div className="absolute z-10 animate-pulse" style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className="w-6 h-6 bg-red-500/30 rounded-full flex items-center justify-center border border-red-500">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                          </div>
                      )}

                      {/* The Rover */}
                      <div 
                          className={`absolute w-3 h-8 border rounded-sm flex items-center justify-center transition-colors duration-300 z-30 shadow-lg`}
                          style={{ 
                              left: `${roverPos.x}%`, 
                              top: `${roverPos.y}%`, 
                              transform: `translate(-50%, -50%) ${targetPos ? `rotate(${Math.atan2(targetPos.y - roverPos.y, targetPos.x - roverPos.x) * (180/Math.PI) + 90}deg)` : ''}`,
                              backgroundColor: roverState === 'EXTRACTING' ? '#10b981' : '#3b82f6',
                              borderColor: roverState === 'EXTRACTING' ? '#059669' : '#2563eb'
                          }}
                      >
                          {/* Siren lights */}
                          {(roverState === 'DISPATCHED' || roverState === 'CROWD_PARTING') && (
                              <>
                                  <div className="absolute top-0 w-full h-1 bg-red-500 animate-[ping_0.5s_linear_infinite]"></div>
                                  <div className="absolute bottom-0 w-full h-1 bg-blue-500 animate-[ping_0.5s_linear_infinite_0.25s]"></div>
                              </>
                          )}
                          
                          {/* Stretcher loaded indicator */}
                          {roverState === 'EXTRACTING' && (
                              <div className="w-1.5 h-4 bg-white/80 rounded-sm"></div>
                          )}
                      </div>

                      {/* Acoustic Crowd Parting Pulses */}
                      <div className="absolute inset-0 z-10 pointer-events-none">
                          {acousticPulses.map(pulse => (
                              <div 
                                  key={pulse.id}
                                  className="absolute rounded-full border-2 border-orange-500"
                                  style={{
                                      width: `${pulse.radius * 2}%`,
                                      height: `${pulse.radius * 2}%`,
                                      left: `${roverPos.x - pulse.radius}%`,
                                      top: `${roverPos.y - pulse.radius}%`,
                                      opacity: pulse.opacity,
                                      boxShadow: `inset 0 0 10px rgba(249,115,22,0.5)`
                                  }}
                              ></div>
                          ))}
                      </div>

                  </div>
                )}

              </div>
            </div>

            {/* Dispatch Controls */}
            <div className="w-full bg-[#0a0202] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Emergency Operations</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={triggerDispatch}
                   disabled={!systemActive || roverState !== 'DOCKED'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || roverState !== 'DOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                   }`}
                 >
                   🚨 Dispatch Rover to Incident
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MedicalEvacRover;
