/* eslint-disable */
import React, { useState, useEffect } from 'react';

const FogDroneCooling = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [droneState, setDroneState] = useState('DOCKED'); // DOCKED, DEPLOYING, MISTING, RETURNING
  
  // Thermodynamic Metrics
  const [ambientTemp, setAmbientTemp] = useState(98.6); // Fahrenheit
  const [bladderCapacity, setBladderCapacity] = useState(100); // % of atomized water
  const [crowdHeatIndex, setCrowdHeatIndex] = useState(105.2); // Heat index of the densest pocket
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Thermal Computer Vision Matrix Online.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Heavy-Lift Fog Drone standing by at refilling station.' }
  ]);

  // Visualizer State
  const [dronePos, setDronePos] = useState({ x: 10, y: 10 }); // Docked top left
  const [targetPos, setTargetPos] = useState(null);
  
  // Heatmap generation (Simulating 16 zones)
  const [heatZones, setHeatZones] = useState(Array.from({length: 16}).map((_, i) => ({
      id: i,
      tempOffset: Math.random() * 15 // Add to ambient to get local zone temp
  })));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          // Gradually heat up all zones if no drone
          setHeatZones(prev => prev.map(z => ({
              ...z,
              tempOffset: Math.min(25, z.tempOffset + 0.1)
          })));

          // Calculate max heat index
          const maxOffset = Math.max(...heatZones.map(z => z.tempOffset));
          setCrowdHeatIndex(ambientTemp + maxOffset);

          if (droneState !== 'DOCKED') {
              setBatteryLevel(prev => Math.max(0, prev - 0.2)); // arbitrary battery
          }

          // Drone Movement Logic
          if (targetPos) {
              const dx = targetPos.x - dronePos.x;
              const dy = targetPos.y - dronePos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              if (dist < 2) {
                  // Reached Target
                  if (droneState === 'DEPLOYING') {
                      setDroneState('MISTING');
                      addLog('ACTION', 'Target acquired. Deploying hyper-localized evaporative mist.');
                      
                      // Mist for a few seconds
                      setTimeout(() => {
                          if (systemActive) {
                              setDroneState('RETURNING');
                              setTargetPos({ x: 10, y: 10 }); // Back to dock
                              addLog('SUCCESS', 'Micro-climate cooled by 12°. Drone returning to base.');
                          }
                      }, 4000);
                      
                  } else if (droneState === 'RETURNING') {
                      setDroneState('DOCKED');
                      setTargetPos(null);
                      setBladderCapacity(100); // Refilled
                      addLog('SYS', 'Drone docked. Refilling atomized water bladder.');
                  }
              } else {
                  // Move Drone
                  const speed = droneState === 'MISTING' ? 0.5 : 2.0;
                  setDronePos(prev => ({ x: prev.x + (dx/dist) * speed, y: prev.y + (dy/dist) * speed }));
              }
          }

          // Misting Logic (Cool down the zone the drone is over)
          if (droneState === 'MISTING') {
              setBladderCapacity(prev => Math.max(0, prev - 2));
              
              setHeatZones(prev => prev.map((z, i) => {
                  // Convert 1D index to x,y grid
                  const zx = (i % 4) * 25 + 12.5;
                  const zy = Math.floor(i / 4) * 25 + 12.5;
                  
                  // If drone is near this zone, cool it down rapidly
                  const dzx = dronePos.x - zx;
                  const dzy = dronePos.y - zy;
                  if (Math.sqrt(dzx*dzx + dzy*dzy) < 30) {
                      return { ...z, tempOffset: Math.max(-5, z.tempOffset - 1.5) };
                  }
                  return z;
              }));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, droneState, targetPos, dronePos, ambientTemp, heatZones]);

  // Dummy state for battery since I forgot to declare it above but used it
  const [batteryLevel, setBatteryLevel] = useState(100);

  const triggerDispatch = () => {
    if (!systemActive || droneState !== 'DOCKED') return;
    
    // Find hottest zone
    let maxTemp = -99;
    let targetIdx = 0;
    heatZones.forEach((z, i) => {
        if (z.tempOffset > maxTemp) {
            maxTemp = z.tempOffset;
            targetIdx = i;
        }
    });
    
    const targetX = (targetIdx % 4) * 25 + 12.5;
    const targetY = Math.floor(targetIdx / 4) * 25 + 12.5;
    
    setDroneState('DEPLOYING');
    setTargetPos({ x: targetX, y: targetY });
    
    addLog('CRIT', `Thermal AI detected dangerous heat pocket (${(ambientTemp + maxTemp).toFixed(1)}°F).`);
    addLog('ACTION', 'Dispatching Fog Drone to Sector 4 for localized cooling.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setDroneState('DOCKED');
      setDronePos({ x: 10, y: 10 });
      setTargetPos(null);
      setBladderCapacity(100);
      setBatteryLevel(100);
      addLog('SYS', 'Evaporative Thermodynamics engine online.');
    } else {
      setSystemActive(false);
      setDroneState('DOCKED');
      setTargetPos(null);
      addLog('WARN', 'Swarm Drone Logistics Offline. Attendees exposed to high heat index.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❄️</span> Micro-Climate Manipulation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Hyper-Local Evaporative <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500">Fog Drones</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Static misting tents only cool a tiny area of the festival, leaving thousands of attendees sweltering in the direct sun at the main stage. Eventra solves this by deploying a fleet of heavy-lift drones equipped with high-pressure atomized water bladders. Eventra's AI monitors thermal camera feeds of the crowd. When it detects a dense pocket of attendees reaching dangerous temperatures, it autonomously dispatches a fog drone to hover 50 feet above them, deploying a hyper-localized evaporative cooling mist that drops the ambient temperature by 10 degrees before returning to base.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> Thermodynamics Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Ground Fleet' : 'Launch Thermal UAVs'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Max Heat Index */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdHeatIndex > 115 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 crowdHeatIndex > 105 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Peak Heat Index
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     crowdHeatIndex > 115 ? 'text-red-500' : 
                     crowdHeatIndex > 105 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {crowdHeatIndex.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>

               {/* Ambient Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Base Ambient
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {ambientTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>
               
               {/* Water Bladder */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bladderCapacity < 30 ? 'bg-blue-950/20 border-blue-900/50' : 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Atomized H2O
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bladderCapacity < 30 ? 'text-blue-500' : 'text-cyan-400'
                   }`}>
                     {Math.floor(bladderCapacity)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010204] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Swarm Logistics Ledger</span>
                 {droneState === 'DEPLOYING' && <span className="text-sky-400 font-black animate-pulse">DRONE IN TRANSIT</span>}
                 {droneState === 'MISTING' && <span className="text-cyan-400 font-black animate-pulse">DEPLOYING MICRO-MIST</span>}
                 {droneState === 'RETURNING' && <span className="text-emerald-400 font-black">RTB (RETURN TO BASE)</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' : 'text-slate-400'
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
            
            {/* Thermal Camera Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">THERMAL COMPUTER VISION</span>
                <span className="text-[8px] font-mono text-slate-400">MAIN STAGE (TOP-DOWN)</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">INFRARED SENSORS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 grid grid-cols-4 grid-rows-4">
                      
                      {/* Thermal Heatmap Zones */}
                      {heatZones.map(zone => {
                          const temp = ambientTemp + zone.tempOffset;
                          
                          // Determine color based on temperature
                          let color = '#1e3a8a'; // Cold Blue
                          if (temp > 95) color = '#0f766e'; // Teal
                          if (temp > 105) color = '#a16207'; // Yellow/Orange
                          if (temp > 115) color = '#b91c1c'; // Danger Red
                          if (temp > 120) color = '#7f1d1d'; // Deep Red
                          
                          return (
                              <div 
                                  key={zone.id} 
                                  className="w-full h-full transition-colors duration-1000 blur-md scale-110"
                                  style={{ backgroundColor: color }}
                              ></div>
                          );
                      })}

                      {/* Docking Station */}
                      <div className="absolute top-0 left-0 w-12 h-12 bg-black/40 border-r border-b border-white/20 z-30 flex items-start justify-start p-1">
                          <span className="text-[6px] font-black uppercase tracking-widest text-slate-400">Dock</span>
                      </div>

                      {/* The Fog Drone */}
                      <div 
                          className="absolute w-8 h-8 z-40 transition-all duration-300 flex items-center justify-center"
                          style={{ left: `${dronePos.x}%`, top: `${dronePos.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                          {/* Rotors */}
                          <div className="absolute top-0 left-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                          
                          {/* Drone Body */}
                          <div className="w-4 h-4 bg-slate-300 rounded-sm shadow-xl flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                          </div>

                          {/* Misting Particle Effect */}
                          {droneState === 'MISTING' && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2 pointer-events-none">
                                  <div className="w-16 h-16 bg-cyan-400/40 rounded-full blur-xl animate-pulse"></div>
                                  <div className="absolute inset-0 w-16 h-16 bg-blue-300/30 rounded-full blur-md animate-[ping_1s_ease-out_infinite]"></div>
                              </div>
                          )}
                      </div>

                  </div>
                )}

              </div>
            </div>

            {/* Drone Triggers */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">AI Logistics Overseer</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={triggerDispatch}
                   disabled={!systemActive || droneState !== 'DOCKED'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || droneState !== 'DOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse'
                   }`}
                 >
                   🚁 Auto-Dispatch Fog Drone to Hottest Sector
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default FogDroneCooling;
