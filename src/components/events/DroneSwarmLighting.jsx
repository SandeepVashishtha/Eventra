/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneSwarmLighting = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [formation, setFormation] = useState('DOCKED'); // DOCKED, LINEAR, ORBITAL, HELIX
  
  // Swarm Metrics
  const [activeDrones, setActiveDrones] = useState(0); 
  const [batteryLevel, setBatteryLevel] = useState(100); // %
  const [windResistance, setWindResistance] = useState(4.2); // knots
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Art-Net DMX Lighting Protocol Initialized.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Heavy-Lift Quadcopter Swarm standing by on launchpad.' }
  ]);

  // Visualizer State
  const [dronePositions, setDronePositions] = useState([]);
  
  // Initialize 40 drones (Base formation: Docked)
  useEffect(() => {
      const initialDrones = Array.from({length: 40}).map((_, i) => ({
          id: i,
          x: 10 + (i % 8) * 10, // Grid on ground
          y: 90 + Math.floor(i / 8) * 4,
          z: 0.1, // Scale
          color: '#334155' // Off
      }));
      setDronePositions(initialDrones);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setWindResistance(4.0 + (Math.random() * 2)); // Fluctuating wind
          
          if (formation !== 'DOCKED') {
              setBatteryLevel(prev => Math.max(0, prev - 0.2));
          } else {
              setBatteryLevel(prev => Math.min(100, prev + 0.8));
          }
          
          // Animate positions based on target formation
          setDronePositions(prev => prev.map((drone, i) => {
              let targetX, targetY, targetZ, color;
              const time = Date.now() / 1000;
              
              if (formation === 'DOCKED') {
                  targetX = 10 + (i % 8) * 10;
                  targetY = 90 + Math.floor(i / 8) * 4;
                  targetZ = 0.5;
                  color = systemActive ? '#10b981' : '#334155'; // Green charging or Off
              } 
              else if (formation === 'LINEAR') {
                  // Standard straight truss line above stage
                  targetX = 5 + (i * 2.3);
                  targetY = 20;
                  targetZ = 1.0;
                  // Alternating Cyan and Magenta
                  color = i % 2 === 0 ? '#06b6d4' : '#ec4899';
              }
              else if (formation === 'ORBITAL') {
                  // Crown circle rotating around center
                  const radius = 35;
                  const angle = (i / 40) * Math.PI * 2 + (time * 0.5); // Rotation
                  targetX = 50 + Math.cos(angle) * radius;
                  targetY = 40 + Math.sin(angle) * (radius * 0.3); // Elliptical perspective
                  targetZ = 0.8 + Math.sin(angle) * 0.4;
                  color = '#eab308'; // Gold
              }
              else if (formation === 'HELIX') {
                  // Double helix spiral going up
                  const turns = 3;
                  const angle = (i / 40) * Math.PI * 2 * turns + (time);
                  const radius = 20;
                  targetX = 50 + Math.cos(angle) * radius;
                  targetY = 80 - (i * 1.5); // Ascending
                  targetZ = 0.8 + Math.sin(angle) * 0.4;
                  
                  // Color spectrum based on height
                  color = `hsl(${(i/40) * 360}, 100%, 60%)`;
              }
              
              // Smooth easing interpolation (Simulating drone flight physics)
              const ease = 0.05; // Flight speed
              return {
                  ...drone,
                  x: drone.x + (targetX - drone.x) * ease,
                  y: drone.y + (targetY - drone.y) * ease,
                  z: drone.z + (targetZ - drone.z) * ease,
                  color: color
              };
          }));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, formation]);

  const triggerFormation = (type) => {
    if (!systemActive) return;
    
    setFormation(type);
    
    if (type === 'LINEAR') {
        setActiveDrones(40);
        addLog('ACTION', 'DMX Command: Transitioning to [Linear Truss] formation.');
        addLog('SUCCESS', 'Swarm stabilized at 60ft. High-lumen LEDs engaged.');
    } else if (type === 'ORBITAL') {
        setActiveDrones(40);
        addLog('ACTION', 'DMX Command: Transitioning to [Orbital Crown] 3D array.');
        addLog('SUCCESS', 'Calculating spatial trajectories. Dynamic rotation active.');
    } else if (type === 'HELIX') {
        setActiveDrones(40);
        addLog('ACTION', 'DMX Command: Transitioning to [Double Helix] vertical spiral.');
        addLog('WARN', 'Ascension pattern active. Monitoring wind resistance.');
    } else if (type === 'DOCKED') {
        setActiveDrones(0);
        addLog('SYS', 'DMX Command: Swarm returning to launchpad for charging.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setFormation('DOCKED');
      setActiveDrones(0);
      addLog('SYS', 'Swarm Robotics AI Online. Syncing with Lighting Console (Art-Net).');
    } else {
      setSystemActive(false);
      setFormation('DOCKED');
      setActiveDrones(0);
      addLog('CRIT', 'Emergency Stop triggered. Drones grounding immediately.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05020a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> Swarm Robotics AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Drone Swarm <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">Stage Lighting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional stage lighting requires massive, heavy steel trusses that take days to build, limit creative freedom, and pose a structural collapse risk in high winds. Eventra revolutionizes stage production by replacing static trusses with a synchronized swarm of heavy-lift quadcopters carrying high-lumen LED arrays. Eventra's lighting control software (via Art-Net/DMX) interfaces directly with the drone fleet's spatial AI, allowing lighting designers to dynamically move the lights through the air in 3D space, creating impossible floating geometric arrays.
          </p>

          <div className="bg-[#0a0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Swarm Flight Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Ground Swarm (E-Stop)' : 'Arm Flight Systems'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Drones */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 formation !== 'DOCKED' ? 'bg-pink-950/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Airborne Units
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     formation !== 'DOCKED' ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {activeDrones}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/40</span>
                 </div>
               </div>

               {/* Battery Level */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 batteryLevel < 30 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Fleet Power
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     batteryLevel < 30 ? 'text-orange-400' : 
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(batteryLevel)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Wind Resistance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 windResistance > 10 ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Wind Shear
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     windResistance > 10 ? 'text-blue-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {windResistance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kts</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Art-Net DMX Console</span>
                 {formation === 'LINEAR' && <span className="text-cyan-400 font-black animate-pulse">TRUSS MODE</span>}
                 {formation === 'ORBITAL' && <span className="text-yellow-400 font-black animate-pulse">ORBITAL MODE</span>}
                 {formation === 'HELIX' && <span className="text-pink-400 font-black animate-pulse">HELIX MODE</span>}
                 {formation === 'DOCKED' && systemActive && <span className="text-emerald-400 font-black">CHARGING</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* 3D Stage Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#05020a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">3D SPATIAL PREVIS</span>
                <span className="text-[8px] font-mono text-slate-400">FRONT ELEVATION</span>
              </div>

              <div className="flex-1 relative overflow-hidden perspective-[1000px]">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DRONES UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-end">
                      
                      {/* Background Fog / Haze */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>

                      {/* Main Stage Structure */}
                      <div className="relative w-full h-24 bg-black border-t-2 border-slate-800 flex justify-center items-end pb-4 z-10">
                          {/* DJ Booth */}
                          <div className="w-16 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <span className="text-[6px] font-black text-slate-500">STAGE</span>
                          </div>
                      </div>

                      {/* Launchpad / Docking Station (Ground) */}
                      <div className="absolute bottom-24 inset-x-0 h-4 border-b border-emerald-900/50 flex justify-center z-0">
                          <span className="text-[6px] text-emerald-900 font-bold uppercase mt-1">Charging Dock</span>
                      </div>

                      {/* The Drone Swarm */}
                      <div className="absolute inset-0 z-30 pointer-events-none">
                          {dronePositions.map(drone => (
                              <div 
                                  key={drone.id}
                                  className="absolute w-3 h-3 rounded-full flex items-center justify-center transition-transform duration-75"
                                  style={{ 
                                      left: `${drone.x}%`, 
                                      top: `${drone.y}%`,
                                      transform: `translate(-50%, -50%) scale(${drone.z})`,
                                      zIndex: Math.floor(drone.z * 100)
                                  }}
                              >
                                  {/* LED Light Glow */}
                                  <div 
                                      className="absolute inset-0 rounded-full blur-[2px]"
                                      style={{ backgroundColor: drone.color, boxShadow: `0 0 ${15 * drone.z}px ${drone.color}` }}
                                  ></div>
                                  {/* Physical Drone Body */}
                                  <div className="w-1 h-1 bg-white rounded-full relative z-10"></div>
                                  
                                  {/* Simulated Light Beam pointing down if in the air */}
                                  {formation !== 'DOCKED' && (
                                      <div 
                                          className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-32 origin-top opacity-30"
                                          style={{ 
                                              background: `linear-gradient(to bottom, ${drone.color}, transparent)`,
                                              transform: 'perspective(100px) rotateX(-45deg)'
                                          }}
                                      ></div>
                                  )}
                              </div>
                          ))}
                      </div>

                  </div>
                )}

              </div>
            </div>

            {/* DMX Scene Controls */}
            <div className="w-full bg-[#0a0512] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">DMX Formation Cues</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerFormation('LINEAR')}
                   disabled={!systemActive || formation === 'LINEAR'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || formation === 'LINEAR' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   Linear Truss<br/>(Standard)
                 </button>

                 <button 
                   onClick={() => triggerFormation('ORBITAL')}
                   disabled={!systemActive || formation === 'ORBITAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || formation === 'ORBITAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-600 text-yellow-400 hover:bg-yellow-900/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                   }`}
                 >
                   Orbital Crown<br/>(Dynamic 3D)
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerFormation('HELIX')}
                   disabled={!systemActive || formation === 'HELIX'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || formation === 'HELIX' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                   }`}
                 >
                   Double Helix<br/>(Vertical Scale)
                 </button>

                 <button 
                   onClick={() => triggerFormation('DOCKED')}
                   disabled={!systemActive || formation === 'DOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || formation === 'DOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   Recall Swarm<br/>(Dock & Charge)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneSwarmLighting;
