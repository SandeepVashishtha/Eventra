/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WasteSortingRovers = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [fleetState, setFleetState] = useState('DORMANT'); // DORMANT, CHARGING, SORTING, DUMPING
  
  // Swarm Metrics
  const [activeRovers, setActiveRovers] = useState(0);
  const [aluminumSorted, setAluminumSorted] = useState(0); // kg
  const [compostSorted, setCompostSorted] = useState(0); // kg
  const [plasticSorted, setPlasticSorted] = useState(0); // kg
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '04:00:00', type: 'SYS', msg: 'Solar Rover Fleet Management UI Initialized.' },
    { id: 2, time: '04:00:02', type: 'SYS', msg: 'Awaiting off-hours deployment command.' }
  ]);

  // Visualizer State
  const [solarInput, setSolarInput] = useState(0); // kW
  const [rovers, setRovers] = useState([]);

  useEffect(() => {
    let loop;
    
    if (fleetActive) {
      loop = setInterval(() => {
          
          if (fleetState === 'SORTING') {
              setSolarInput(Math.max(0, Math.sin(Date.now() / 5000) * 150)); // Simulating sun output
              
              setAluminumSorted(prev => prev + (Math.random() * 2));
              setCompostSorted(prev => prev + (Math.random() * 3));
              setPlasticSorted(prev => prev + (Math.random() * 1.5));

              // Animate rovers moving around
              setRovers(prev => prev.map(rover => {
                  let newX = rover.x + (Math.random() * 4 - 2);
                  let newY = rover.y + (Math.random() * 4 - 2);
                  
                  // Keep in bounds
                  if (newX < 10) newX = 10; if (newX > 90) newX = 90;
                  if (newY < 10) newY = 10; if (newY > 90) newY = 90;

                  return { ...rover, x: newX, y: newY, picking: Math.random() > 0.8 };
              }));

          } else if (fleetState === 'DUMPING') {
              // Rovers move towards center bins
              setRovers(prev => prev.map(rover => {
                  const dx = 50 - rover.x;
                  const dy = 50 - rover.y;
                  return { ...rover, x: rover.x + dx * 0.1, y: rover.y + dy * 0.1, picking: false };
              }));
          } else if (fleetState === 'CHARGING') {
              setSolarInput(185); // High solar input
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive, fleetState]);

  const triggerEvent = (type) => {
    if (!fleetActive) return;
    
    if (type === 'DEPLOY') {
        if (fleetState === 'SORTING') return;
        setFleetState('SORTING');
        
        // Generate random starting positions for rovers
        const newRovers = Array.from({ length: 45 }, (_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            picking: false
        }));
        setRovers(newRovers);
        
        addLog('ACTION', 'Deploying 45 Rovers to Main Stage footprint.');
        addLog('AI', 'Edge-Compute CV engaged. Identifying recyclables vs compost.');
    } else if (type === 'DUMP') {
        if (fleetState !== 'SORTING') return;
        setFleetState('DUMPING');
        addLog('WARN', 'Internal hoppers full. Recalling swarm to centralized dump bins.');
        
        setTimeout(() => {
            setFleetState('CHARGING');
            setRovers([]); // Hide them inside the charging bay
            addLog('SUCCESS', 'Waste deposited correctly. Swarm entering solar charging cycle.');
        }, 3000);
    }
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      setActiveRovers(45);
      addLog('SYS', 'Swarm API Linked. Rovers awaiting deployment sequence.');
    } else {
      setFleetActive(false);
      setFleetState('DORMANT');
      setActiveRovers(0);
      setRovers([]);
      setSolarInput(0);
      addLog('WARN', 'Fleet Offline. Returning to manual waste management.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050602] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Automated Sanitation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Solar-Powered <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">Waste Sorting Rovers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Post-festival cleanup requires hundreds of manual laborers picking up trash by hand, and attendees rarely sort their recycling, leading to massive landfill waste. Eventra solves this by deploying a swarm fleet of solar-powered, Roomba-style rovers across the festival grounds during off-hours. The rovers use Edge-Compute Computer Vision to identify, pick up, and internally sort aluminum cans, plastic cups, and compostable plates.
          </p>

          <div className="bg-[#0b0e08] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🔋</span> Swarm Fleet Management
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Hibernate Fleet' : 'Initialize Rover AI'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Aluminum */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetState === 'SORTING' ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Aluminum Yield
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetState === 'SORTING' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(aluminumSorted)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

               {/* Compost */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetState === 'SORTING' ? 'bg-lime-950/30 border-lime-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Compost Yield
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetState === 'SORTING' ? 'text-lime-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(compostSorted)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>
               
               {/* Plastic */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetState === 'SORTING' ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Plastic Yield
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetState === 'SORTING' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(plasticSorted)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030402] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Swarm Telemetry Log</span>
                 {fleetState === 'SORTING' && <span className="text-lime-400 animate-pulse">CV SCANNING...</span>}
                 {fleetState === 'DUMPING' && <span className="text-amber-400 animate-pulse">RECALLING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-lime-400 font-bold' :
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* GIS Map Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !fleetActive ? 'bg-slate-900' : 'bg-[#060a04]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-400">GIS SATELLITE VIEW</span>
                <span className="text-[8px] font-mono text-slate-400">ROVER GPS PINGS</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Background Festival Map Layer */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiM4NGNjMTYiLz48L3N2Zz4=')]"></div>

                {/* Festival Grounds Outlines */}
                <div className="absolute inset-4 border border-lime-900/30 rounded-[3rem] pointer-events-none"></div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-16 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center pointer-events-none z-10">
                    <span className="text-[8px] font-black text-slate-600 uppercase">Main Stage</span>
                </div>

                {/* Dumpster Area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-amber-500/50 rounded-full flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-xl opacity-50 mb-1">🗑️</span>
                    <span className="text-[6px] font-black text-amber-500 uppercase">Sort Bay</span>
                </div>

                {!fleetActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative">FLEET DORMANT</span>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Rovers */}
                      {rovers.map(rover => (
                          <div 
                              key={rover.id}
                              className="absolute w-2.5 h-2.5 bg-lime-500 rounded-sm shadow-[0_0_10px_rgba(132,204,22,0.8)] transition-all duration-150 flex items-center justify-center"
                              style={{ 
                                  left: `${rover.x}%`, 
                                  top: `${rover.y}%`,
                                  transform: 'translate(-50%, -50%)'
                              }}
                          >
                              {rover.picking && fleetState === 'SORTING' && (
                                  <div className="absolute w-4 h-4 border border-cyan-400 rounded-full animate-ping"></div>
                              )}
                          </div>
                      ))}

                      {fleetState === 'CHARGING' && (
                          <div className="absolute inset-0 flex items-center justify-center flex-col animate-fade-in z-30">
                              <span className="text-4xl mb-2">☀️</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">Solar Charging Cycle</span>
                              <span className="text-[8px] font-mono text-slate-400 mt-1">Input: {solarInput.toFixed(1)} kW</span>
                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0e08] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Manage Swarm Operations</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('DEPLOY')}
                   disabled={!fleetActive || fleetState === 'SORTING' || fleetState === 'DUMPING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || fleetState === 'SORTING' || fleetState === 'DUMPING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-lime-950/40 border-lime-600 text-lime-400 hover:bg-lime-900/60 shadow-[0_0_15px_rgba(132,204,22,0.3)]'
                   }`}
                 >
                   Deploy 45 Rovers (Off-Hours)
                 </button>

                 <button 
                   onClick={() => triggerEvent('DUMP')}
                   disabled={!fleetActive || fleetState !== 'SORTING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || fleetState !== 'SORTING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-500 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                   }`}
                 >
                   Recall to Central Dump Bay
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WasteSortingRovers;
