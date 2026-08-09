/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SwarmDroneChoreography = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [formation, setFormation] = useState('GRID'); // GRID, SPHERE, LOGO
  const [droneCount, setDroneCount] = useState(500);
  const [compiling, setCompiling] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Swarm Control Module initialized. Connected to 500 UAV units.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting 3D spatial geometry input.' }
  ]);

  // Generate 500 drones
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    // Generate initial grid
    const newDrones = [];
    for (let i = 0; i < droneCount; i++) {
      newDrones.push({
        id: i,
        x: (i % 25) * 4, // 25x20 grid
        y: Math.floor(i / 25) * 4,
        z: 0,
        color: '#3b82f6' // Blue default
      });
    }
    setDrones(newDrones);
  }, [droneCount]);

  useEffect(() => {
    let loop;
    if (engineActive && !compiling) {
      loop = setInterval(() => {
        // Micro-adjustments to simulate hovering
        setDrones(prev => prev.map(d => ({
          ...d,
          x: d.x + (Math.random() * 0.4 - 0.2),
          y: d.y + (Math.random() * 0.4 - 0.2),
        })));
      }, 100);
    }
    return () => clearInterval(loop);
  }, [engineActive, compiling]);

  const executeFormation = (targetFormation) => {
    if (engineActive && !compiling) {
      setCompiling(true);
      setFormation(targetFormation);
      
      addLog('CALC', `Calculating collision-free kinematic paths for ${targetFormation} geometry...`);
      
      setTimeout(() => {
        addLog('SUCCESS', 'Pathfinding complete. Uploading telemetry to swarm fleet.');
        
        // Morph the drones into the new shape
        setDrones(prev => prev.map((d, i) => {
          let newX, newY, newColor;
          
          if (targetFormation === 'SPHERE') {
            // Very rough 2D circle projection
            const angle = (i / droneCount) * Math.PI * 8;
            const radius = 30 + Math.random() * 5;
            newX = 50 + Math.cos(angle) * radius;
            newY = 50 + Math.sin(angle) * radius;
            newColor = '#a855f7'; // Purple
          } else if (targetFormation === 'LOGO') {
            // Rough 'E' for Eventra
            if (i < 100) { newX = 20; newY = 20 + (i/100)*60; } // Vertical bar
            else if (i < 200) { newX = 20 + ((i-100)/100)*40; newY = 20; } // Top bar
            else if (i < 300) { newX = 20 + ((i-200)/100)*30; newY = 50; } // Middle bar
            else if (i < 400) { newX = 20 + ((i-300)/100)*40; newY = 80; } // Bottom bar
            else { newX = 50 + Math.random()*20; newY = 50 + Math.random()*20; } // Particles
            newColor = '#10b981'; // Emerald
          } else {
            // Return to GRID
            newX = (i % 25) * 4;
            newY = Math.floor(i / 25) * 4;
            newColor = '#3b82f6'; // Blue
          }
          
          return { ...d, x: newX, y: newY, color: newColor };
        }));

        setTimeout(() => {
          setCompiling(false);
          addLog('ACTION', `Formation ${targetFormation} achieved. Holding spatial coordinates.`);
        }, 1500);

      }, 1000);
    }
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'Swarm engine engaged. Pre-flight checks nominal. Fleet hovering.');
    } else {
      setEngineActive(false);
      setFormation('GRID');
      setDrones(prev => prev.map((d, i) => ({
        ...d, x: (i % 25) * 4, y: Math.floor(i / 25) * 4, color: '#3b82f6'
      })));
      addLog('SYS', 'Land command issued. Swarm returning to base charging pads.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Lighting Director Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> UAV Robotics Control
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Swarm Drone Light Show <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Choreography Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional fireworks are becoming illegal in drought-prone areas, forcing festivals to find alternative massive visual spectacles. Instead of paying expensive third-party companies to hardcode drone shows manually, Eventra provides a 3D visualization and control module directly to the Lighting Director. LDs can import 3D models, and the system automatically calculates collision-free flight paths for 500+ drones, exporting the exact kinematic code needed to execute a synchronized aerial light show above the main stage.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Kinematic Flight Controller
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   disabled={compiling}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Land Swarm Fleet' : 'Launch 500 UAVs'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Formation Control */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 compiling ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3">Execute 3D Geometry</span>
                 
                 <div className="grid grid-cols-3 gap-2">
                   <button 
                     onClick={() => executeFormation('GRID')}
                     disabled={!engineActive || compiling || formation === 'GRID'}
                     className={`py-2 rounded text-[9px] font-black uppercase tracking-widest transition ${
                       formation === 'GRID' ? 'bg-blue-600 text-white' : 
                       !engineActive ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                     }`}
                   >
                     Grid
                   </button>
                   <button 
                     onClick={() => executeFormation('SPHERE')}
                     disabled={!engineActive || compiling || formation === 'SPHERE'}
                     className={`py-2 rounded text-[9px] font-black uppercase tracking-widest transition ${
                       formation === 'SPHERE' ? 'bg-purple-600 text-white' : 
                       !engineActive ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                     }`}
                   >
                     Sphere
                   </button>
                   <button 
                     onClick={() => executeFormation('LOGO')}
                     disabled={!engineActive || compiling || formation === 'LOGO'}
                     className={`py-2 rounded text-[9px] font-black uppercase tracking-widest transition ${
                       formation === 'LOGO' ? 'bg-emerald-600 text-white' : 
                       !engineActive ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                     }`}
                   >
                     Logo
                   </button>
                 </div>
               </div>

               {/* Fleet Status */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Active Drone Units</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-white leading-none">
                     {engineActive ? droneCount : 0}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">/ {droneCount}</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                     compiling ? 'bg-yellow-500 animate-pulse' : 
                     engineActive ? 'bg-emerald-500' : 'bg-slate-700'
                   }`}></span>
                   {compiling ? 'Calculating Paths...' : engineActive ? 'Fleet Holding Position' : 'Grounded'}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Routing Log</span>
                 {compiling && <span className="text-indigo-400 animate-pulse">Computing...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-indigo-300 font-bold' :
                       log.type === 'CALC' ? 'text-yellow-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: 3D Visualization Canvas (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-[#000000] rounded-3xl border-8 border-slate-900 shadow-[0_0_40px_rgba(79,70,229,0.2)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-md border-b border-slate-800">
              <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center">
                Night Sky Canvas
              </span>
              <span className="text-[10px] font-mono text-indigo-500">
                ALT: 400ft
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-[#050505] overflow-hidden pt-12 items-center justify-center p-4">
               
               {/* Starry Background */}
               <div className="absolute inset-0 z-0">
                 {[...Array(30)].map((_, i) => (
                   <div 
                     key={i} 
                     className="absolute w-px h-px bg-white rounded-full opacity-30"
                     style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
                   ></div>
                 ))}
               </div>

               {/* Stage reference at bottom */}
               <div className="absolute bottom-0 w-32 h-4 bg-slate-800 rounded-t-lg z-10 opacity-50 flex justify-center">
                 <div className="w-8 h-1 bg-purple-500 mt-1 rounded shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
               </div>

               {/* Drone Swarm Visualization */}
               <div className="relative w-full aspect-square z-20">
                 
                 {drones.map(drone => (
                   <div 
                     key={drone.id}
                     className="absolute w-1.5 h-1.5 rounded-full transition-all duration-[1500ms] ease-in-out shadow-lg"
                     style={{
                       left: `${drone.x}%`,
                       top: `${drone.y}%`,
                       backgroundColor: engineActive ? drone.color : '#334155',
                       opacity: engineActive ? 1 : 0.2,
                       boxShadow: engineActive ? `0 0 8px ${drone.color}` : 'none',
                       transform: `translate(-50%, -50%) scale(${engineActive ? 1 : 0.5})`
                     }}
                   ></div>
                 ))}

                 {/* Compilation / Pathfinding Overlay */}
                 {compiling && (
                   <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-[1px]">
                     <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                     <span className="absolute text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-24">Calculating Paths</span>
                   </div>
                 )}

               </div>
               
               <div className="absolute bottom-6 text-center z-20">
                 <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">
                   {engineActive ? `Rendering ${droneCount} Light Vectors` : 'System Offline'}
                 </p>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SwarmDroneChoreography;
