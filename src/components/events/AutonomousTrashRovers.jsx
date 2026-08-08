/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousTrashRovers = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [roverState, setRoverState] = useState('CHARGING'); // CHARGING, PATROLLING, COMPACTING
  
  // Rover Fleet Metrics
  const [activeRovers, setActiveRovers] = useState(0);
  
  // Compaction Metrics (kg)
  const [aluminum, setAluminum] = useState(0);
  const [plastic, setPlastic] = useState(0);
  const [compost, setCompost] = useState(0);
  const [landfill, setLandfill] = useState(0); // non-recyclables
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '04:00:00', type: 'SYS', msg: 'Solar-powered Rover Fleet online.' },
    { id: 2, time: '04:00:02', type: 'SYS', msg: 'Optical AI Sorting models loaded.' }
  ]);

  // Trash field state (simulating ground debris)
  const [debris, setDebris] = useState([]);
  const [roverPos, setRoverPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Generate initial trash field
    const initialDebris = [];
    for(let i=0; i<40; i++) {
        const type = Math.random();
        let cat = 'PLASTIC';
        if (type > 0.4) cat = 'ALUMINUM';
        if (type > 0.7) cat = 'COMPOST';
        if (type > 0.9) cat = 'LANDFILL';
        
        initialDebris.push({ 
            id: `D-${i}`, 
            x: Math.random() * 80 + 10, 
            y: Math.random() * 80 + 10, 
            category: cat,
            status: 'GROUND' 
        });
    }
    setDebris(initialDebris);
  }, []);

  useEffect(() => {
    let loop;
    
    if (fleetActive && roverState === 'PATROLLING') {
      loop = setInterval(() => {
          
          setDebris(prev => {
             const groundDebris = prev.filter(d => d.status === 'GROUND');
             if (groundDebris.length === 0) {
                 // No debris left, spawn some more (people dropping trash)
                 if (Math.random() > 0.9) {
                     const newD = [];
                     for(let i=0; i<5; i++) newD.push({ id: `D-${Date.now()}-${i}`, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, category: 'ALUMINUM', status: 'GROUND' });
                     return [...prev, ...newD];
                 }
                 return prev;
             }
             
             // Move rover towards nearest debris
             let target = groundDebris[0];
             let minDist = 999;
             
             groundDebris.forEach(d => {
                 const dist = Math.sqrt(Math.pow(d.x - roverPos.x, 2) + Math.pow(d.y - roverPos.y, 2));
                 if (dist < minDist) {
                     minDist = dist;
                     target = d;
                 }
             });

             let newX = roverPos.x;
             let newY = roverPos.y;

             if (minDist > 5) {
                 // Move
                 const dx = target.x - roverPos.x;
                 const dy = target.y - roverPos.y;
                 newX += (dx / minDist) * 4;
                 newY += (dy / minDist) * 4;
                 setRoverPos({ x: newX, y: newY });
                 return prev;
             } else {
                 // Pick it up
                 setRoverPos({ x: target.x, y: target.y });
                 setRoverState('COMPACTING');
                 
                 // Process the type
                 setTimeout(() => {
                     if (target.category === 'ALUMINUM') setAluminum(a => +(a + 0.1).toFixed(1));
                     if (target.category === 'PLASTIC') setPlastic(p => +(p + 0.05).toFixed(2));
                     if (target.category === 'COMPOST') setCompost(c => +(c + 0.2).toFixed(1));
                     if (target.category === 'LANDFILL') setLandfill(l => +(l + 0.1).toFixed(1));
                     
                     addLog('AI', `Optical Sorter identified: ${target.category}. Compacted internally.`);
                     setRoverState('PATROLLING');
                 }, 800);

                 return prev.map(d => d.id === target.id ? { ...d, status: 'COLLECTED' } : d);
             }
          });
          
      }, 150);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive, roverState, roverPos]);

  const deployFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      setActiveRovers(24);
      setRoverState('PATROLLING');
      addLog('SYS', 'Fleet deployed. 24 Rovers navigating festival grounds.');
    } else {
      setFleetActive(false);
      setActiveRovers(0);
      setRoverState('CHARGING');
      addLog('WARN', 'Recall issued. Rovers returning to charging hubs.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070b05] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Automated Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Trash Sorting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">& Compaction Rovers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Post-festival cleanup requires massive human labor, and attendees rarely sort their recycling properly, resulting in thousands of tons of recyclable materials going straight to landfills. Eventra solves this by deploying a fleet of solar-powered autonomous rovers that patrol the festival grounds. Equipped with computer vision and robotic manipulation arms, the rovers identify and pick up debris. Inside the rover, an AI-driven optical sorter separates aluminum, plastic, and compostables into separate high-pressure compaction chambers, fully automating the sustainability pipeline.
          </p>

          <div className="bg-[#111912] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🔋</span> Fleet Telemetry & Compaction Yield
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={deployFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-white shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Recall Fleet to Hubs' : 'Deploy Patrol Rovers'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-3 mb-6">
               
               {/* Aluminum */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Aluminum
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     fleetActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {aluminum}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

               {/* Plastic */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Plastic (PET)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     fleetActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {plastic}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>
               
               {/* Compost */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive ? 'bg-lime-950/20 border-lime-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Compostable
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     fleetActive ? 'text-lime-400' : 'text-slate-600'
                   }`}>
                     {compost}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

               {/* Landfill */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Landfill (Waste)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     fleetActive ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {landfill}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090e09] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Optical Sorting AI Log</span>
                 {roverState === 'COMPACTING' && <span className="text-emerald-400 animate-pulse">Running Optical Classifier...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'AI' ? 'text-lime-400 font-bold' : 'text-slate-400'
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
            
            {/* Rover POV Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-400">ROVER TOP-DOWN SENSOR POV</span>
                <span className="text-[8px] font-mono text-slate-400">UNIT: RV-04</span>
              </div>

              <div className="flex-1 relative bg-[#060805] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                {!fleetActive ? (
                   <div className="flex-1 flex items-center justify-center z-10">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">DOCKING MODE - CHARGING</span>
                   </div>
                ) : (
                  <>
                    {/* Render Debris Field */}
                    <div className="absolute inset-0 z-10">
                       {debris.map(d => {
                           if (d.status === 'COLLECTED') return null;
                           
                           let iconColor = 'border-slate-500';
                           if (d.category === 'ALUMINUM') iconColor = 'border-slate-300 bg-slate-300/20';
                           if (d.category === 'PLASTIC') iconColor = 'border-blue-400 bg-blue-400/20';
                           if (d.category === 'COMPOST') iconColor = 'border-lime-500 bg-lime-500/20';
                           if (d.category === 'LANDFILL') iconColor = 'border-red-500 bg-red-500/20';

                           return (
                               <div 
                                   key={d.id} 
                                   className={`absolute w-2 h-2 rounded border ${iconColor} transform -translate-x-1/2 -translate-y-1/2`}
                                   style={{ top: `${d.y}%`, left: `${d.x}%` }}
                               ></div>
                           );
                       })}

                       {/* The Rover */}
                       <div 
                          className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[150ms] ease-linear z-20 flex items-center justify-center"
                          style={{ top: `${roverPos.y}%`, left: `${roverPos.x}%` }}
                       >
                           {/* Radar Ring */}
                           <div className="absolute inset-[-10px] rounded-full border border-lime-500/30 animate-ping"></div>
                           {/* Rover Chassis */}
                           <div className="w-6 h-6 bg-slate-800 border-2 border-lime-500 rounded relative">
                              {/* Solar Panel Texture */}
                              <div className="absolute inset-0.5 bg-blue-900/40 grid grid-cols-2 gap-[1px]">
                                 <div className="bg-slate-900/50"></div><div className="bg-slate-900/50"></div>
                                 <div className="bg-slate-900/50"></div><div className="bg-slate-900/50"></div>
                              </div>
                           </div>
                       </div>
                    </div>
                    
                    {/* Manipulator / Compactor Overlay */}
                    {roverState === 'COMPACTING' && (
                       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col z-30 bg-black/90 p-3 rounded border border-emerald-500/50 text-center shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center justify-center">
                             <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-bounce"></div>
                             Robotic Manipulator Active
                          </span>
                          <span className="text-[8px] font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded">Optical AI Categorization in progress...</span>
                       </div>
                    )}
                  </>
                )}

              </div>
            </div>

            <div className="w-full bg-[#111912] p-4 rounded-xl border border-slate-800">
               <div className="flex justify-between text-[8px] font-mono mb-1">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Rover RV-04 Internal Capacity</span>
                  <span className="text-lime-500">72% FULL</span>
               </div>
               
               <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                   {/* Aluminum */}
                   <div className="h-full bg-slate-400" style={{ width: '25%' }}></div>
                   {/* Plastic */}
                   <div className="h-full bg-blue-500" style={{ width: '20%' }}></div>
                   {/* Compost */}
                   <div className="h-full bg-lime-500" style={{ width: '15%' }}></div>
                   {/* Landfill */}
                   <div className="h-full bg-red-500" style={{ width: '12%' }}></div>
               </div>
               
               <div className="flex justify-between mt-2 text-[7px] font-black uppercase tracking-widest text-slate-500">
                   <span className="text-slate-400">AL</span>
                   <span className="text-blue-500">PET</span>
                   <span className="text-lime-500">ORG</span>
                   <span className="text-red-500">LND</span>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutonomousTrashRovers;
