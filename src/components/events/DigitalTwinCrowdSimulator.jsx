/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DigitalTwinCrowdSimulator = () => {
  const [simActive, setSimActive] = useState(false);
  const [crisisState, setCrisisState] = useState('NORMAL'); // NORMAL, FIRE, MICROBURST
  
  // RL Agent Metrics
  const [totalAgents, setTotalAgents] = useState(100000);
  const [evacuatedAgents, setEvacuatedAgents] = useState(0);
  const [bottleneckDetected, setBottleneckDetected] = useState(false);
  const [evacTime, setEvacTime] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: '1:1 3D Digital Twin environment loaded.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Reinforcement Learning RL-Agents standing by.' }
  ]);

  // Visualizer states: 
  // We'll simulate 100 particles to represent 100k agents
  const [agents, setAgents] = useState([]);
  
  useEffect(() => {
     // Init agents around Stage A and B
     const initial = [];
     for(let i=0; i<50; i++) {
        // Stage A crowd
        initial.push({ id: `A${i}`, x: 30 + (Math.random()*15-7.5), y: 30 + (Math.random()*15-7.5), state: 'IDLE' });
        // Stage B crowd
        initial.push({ id: `B${i}`, x: 70 + (Math.random()*15-7.5), y: 70 + (Math.random()*15-7.5), state: 'IDLE' });
     }
     setAgents(initial);
  }, []);

  useEffect(() => {
    let loop;
    
    if (simActive) {
      if (crisisState === 'NORMAL') {
         // Casual movement
         loop = setInterval(() => {
             setAgents(prev => prev.map(a => ({
                ...a,
                x: Math.max(10, Math.min(90, a.x + (Math.random() * 2 - 1))),
                y: Math.max(10, Math.min(90, a.y + (Math.random() * 2 - 1)))
             })));
         }, 200);
      } else if (crisisState === 'FIRE' || crisisState === 'MICROBURST') {
         loop = setInterval(() => {
             setEvacTime(prev => prev + 1);
             
             setAgents(prev => {
                let bottlenecks = 0;
                let evacuatingCount = 0;
                
                const next = prev.map(a => {
                   if (a.state === 'EVACUATED') return a;
                   
                   let targetX = 50; // Exit is at bottom middle (50, 95)
                   let targetY = 95; 
                   
                   // Panic behavior vector
                   let dx = targetX - a.x;
                   let dy = targetY - a.y;
                   let dist = Math.sqrt(dx*dx + dy*dy);
                   
                   // Normalize and multiply by speed
                   let speed = crisisState === 'FIRE' ? 3 : 2; // Fire = more panic speed
                   
                   let newX = a.x + (dx/dist)*speed + (Math.random()*2-1);
                   let newY = a.y + (dy/dist)*speed + (Math.random()*2-1);
                   
                   // Simple bottleneck check (if they are near the exit but bunched up)
                   if (newX > 40 && newX < 60 && newY > 80 && newY < 90) {
                      bottlenecks++;
                   }
                   
                   if (newY >= 95) {
                      return { ...a, state: 'EVACUATED' };
                   }
                   
                   evacuatingCount++;
                   return { ...a, x: newX, y: newY };
                });
                
                setBottleneckDetected(bottlenecks > 15);
                setEvacuatedAgents(Math.floor(((100 - evacuatingCount) / 100) * 100000));
                
                if (evacuatingCount === 0) {
                    clearInterval(loop);
                    setSimActive(false);
                    addLog('SUCCESS', `Evacuation complete. Total time: ${evacTime}s.`);
                }
                
                return next;
             });
         }, 100);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [simActive, crisisState, evacTime]);

  const triggerFire = () => {
    if (!simActive || crisisState !== 'NORMAL') return;
    setCrisisState('FIRE');
    addLog('CRIT', 'SIMULATION TRIGGERED: Localized Fire at Stage B.');
    addLog('AI', 'RL Agents exhibiting High-Panic stampede vectors.');
  };

  const triggerMicroburst = () => {
    if (!simActive || crisisState !== 'NORMAL') return;
    setCrisisState('MICROBURST');
    addLog('WARN', 'SIMULATION TRIGGERED: Severe Weather Microburst.');
    addLog('AI', 'RL Agents exhibiting distributed mass-evacuation vectors.');
  };

  const resetSim = () => {
    setCrisisState('NORMAL');
    setSimActive(false);
    setBottleneckDetected(false);
    setEvacuatedAgents(0);
    setEvacTime(0);
    
    const initial = [];
    for(let i=0; i<50; i++) {
        initial.push({ id: `A${i}`, x: 30 + (Math.random()*15-7.5), y: 30 + (Math.random()*15-7.5), state: 'IDLE' });
        initial.push({ id: `B${i}`, x: 70 + (Math.random()*15-7.5), y: 70 + (Math.random()*15-7.5), state: 'IDLE' });
    }
    setAgents(initial);
    addLog('SYS', 'Simulation reset. RL Agents returned to baseline positions.');
  };

  const toggleSim = () => {
    if (!simActive && crisisState === 'NORMAL') {
      setSimActive(true);
      addLog('SYS', 'Digital Twin simulation running. Agents operating autonomously.');
    } else {
      setSimActive(false);
      addLog('WARN', 'Simulation paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060408] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: RL Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> Predictive Crowd Modeling
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Digital Twin Crowd Flow <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Simulator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Emergency evacuation plans are traditionally drawn on static 2D paper maps and rely on theoretical assumptions that completely fall apart during a real panic or stampede. Eventra solves this by creating a 1:1 3D Digital Twin of the physical festival grounds. The system uses advanced reinforcement learning (RL) agents to simulate 100,000 unique attendees with varying physical traits and panic behaviors. Organizers can trigger localized crises (e.g., a stage fire) and observe how the AI crowd reacts in real-time, allowing them to optimize the placement of physical barricades and emergency exits before a mass-casualty event occurs.
          </p>

          <div className="bg-[#110a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🤖</span> RL Agent Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSim}
                   disabled={crisisState !== 'NORMAL' && evacTime > 0} // Can't toggle if mid-crisis
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     (crisisState !== 'NORMAL' && evacTime > 0) ? 'bg-slate-900 text-slate-700 border border-slate-800' :
                     simActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {simActive ? 'Pause Agent Activity' : 'Initialize Baseline Agents'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Evacuation Progress */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 evacuatedAgents === 100000 ? 'bg-emerald-950/20 border-emerald-900/50' :
                 crisisState !== 'NORMAL' ? 'bg-fuchsia-950/20 border-fuchsia-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Evacuated Agents
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     evacuatedAgents === 100000 ? 'text-emerald-400' :
                     crisisState !== 'NORMAL' ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     {evacuatedAgents.toLocaleString()}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-0.5">/ 100k</span>
                 </div>
               </div>

               {/* Bottleneck Warning */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bottleneckDetected ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Stampede Risk
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none ${
                     bottleneckDetected ? 'text-red-500 animate-pulse' : 'text-emerald-500'
                   }`}>
                     {bottleneckDetected ? 'CRITICAL' : 'NOMINAL'}
                   </span>
                 </div>
               </div>
               
               {/* Evac Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crisisState !== 'NORMAL' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   T+ Evac Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crisisState !== 'NORMAL' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {evacTime}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Sec</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050207] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Simulation Engine Log</span>
                 {crisisState !== 'NORMAL' && evacuatedAgents < 100000 && <span className="text-red-400 animate-pulse">EVACUATION IN PROGRESS...</span>}
                 {evacuatedAgents === 100000 && <span className="text-emerald-400 animate-pulse">SIMULATION COMPLETE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'AI' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Digital Twin Map */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">DIGITAL TWIN RENDERER</span>
                <span className="text-[8px] font-mono text-slate-400">RL AGENT PHYSICS</span>
              </div>

              <div className="flex-1 relative bg-[#020204] overflow-hidden flex flex-col">
                
                {/* Physical Topology Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[20%] left-[20%] w-20 h-10 bg-slate-800 border-t border-slate-600 rounded flex items-center justify-center opacity-50"><span className="text-[8px] text-slate-500 font-bold">STAGE A</span></div>
                    <div className="absolute top-[60%] left-[60%] w-20 h-10 bg-slate-800 border-t border-slate-600 rounded flex items-center justify-center opacity-50"><span className="text-[8px] text-slate-500 font-bold">STAGE B</span></div>
                    
                    {/* The Exit Bottleneck (Barricades) */}
                    <div className="absolute bottom-[10%] left-[35%] w-2 h-16 bg-red-900/50 border border-red-500/30 rotate-12"></div>
                    <div className="absolute bottom-[10%] right-[35%] w-2 h-16 bg-red-900/50 border border-red-500/30 -rotate-12"></div>
                    <div className="absolute bottom-0 left-[45%] w-[10%] h-4 bg-emerald-900/50 border-t border-emerald-500 flex items-center justify-center"><span className="text-[6px] text-emerald-500 font-bold">EXIT GATE</span></div>
                </div>

                {/* RL Agents Render */}
                <div className="absolute inset-0 z-10">
                    {agents.map(a => {
                        if (a.state === 'EVACUATED') return null;
                        
                        let color = 'bg-slate-400'; // Normal
                        if (crisisState === 'FIRE') color = 'bg-orange-500 shadow-[0_0_5px_#f97316] animate-pulse'; // Panic
                        if (crisisState === 'MICROBURST') color = 'bg-cyan-400'; 
                        
                        return (
                            <div 
                                key={a.id} 
                                className={`absolute w-1.5 h-1.5 rounded-full ${color} transition-all duration-75`}
                                style={{ top: `${a.y}%`, left: `${a.x}%` }}
                            ></div>
                        );
                    })}
                </div>

                {/* Crisis Events Rendering */}
                {crisisState === 'FIRE' && (
                    <div className="absolute top-[60%] left-[60%] w-32 h-32 bg-red-500/20 rounded-full blur-xl z-0 animate-pulse mix-blend-screen pointer-events-none transform -translate-x-1/4 -translate-y-1/4"></div>
                )}
                {crisisState === 'MICROBURST' && (
                    <div className="absolute inset-0 bg-cyan-900/20 z-0 animate-pulse mix-blend-screen pointer-events-none"></div>
                )}
                
                {/* Bottleneck Warning Overlay */}
                {bottleneckDetected && (
                    <div className="absolute bottom-[15%] left-[50%] transform -translate-x-1/2 flex items-center justify-center z-30 pointer-events-none">
                        <div className="border border-red-500 bg-red-950/80 px-2 py-1 rounded flex items-center shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce">
                           <span className="text-[8px] font-black uppercase tracking-widest text-white">FATAL BOTTLENECK DETECTED</span>
                        </div>
                    </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={triggerFire}
                disabled={!simActive || crisisState !== 'NORMAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !simActive || crisisState !== 'NORMAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Stage Fire (Panic)
              </button>
              
              <button 
                onClick={triggerMicroburst}
                disabled={!simActive || crisisState !== 'NORMAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !simActive || crisisState !== 'NORMAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-500 hover:bg-cyan-900/60'
                }`}
              >
                Inject Severe Weather
              </button>
            </div>
            
            <button 
                onClick={resetSim}
                disabled={crisisState === 'NORMAL' && evacTime === 0}
                className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  crisisState === 'NORMAL' && evacTime === 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Simulation Environment
              </button>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DigitalTwinCrowdSimulator;
