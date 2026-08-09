/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RoboticRiggingSwarm = () => {
  const [swarmActive, setSwarmActive] = useState(false);
  const [swarmPhase, setSwarmPhase] = useState('STANDBY'); // STANDBY, DECONSTRUCTING, TRANSPORTING
  
  // Swarm Logistics Metrics
  const [activeRobots, setActiveRobots] = useState(0);
  const [trussSegments, setTrussSegments] = useState(450); // Total pieces to move
  const [ledPanels, setLedPanels] = useState(1200); // Total panels to move
  
  // Progress tracking
  const [completionPercent, setCompletionPercent] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '02:00:00', type: 'SYS', msg: 'Swarm Robotics Control API online.' },
    { id: 2, time: '02:00:02', type: 'SYS', msg: 'Awaiting CAD Blueprint Deconstruction Map.' }
  ]);

  // Stage visualization map (3D spatial representation)
  const [stageNodes, setStageNodes] = useState([]);
  
  useEffect(() => {
    // Generate initial stage structure (Arch/Rigging)
    const initialNodes = [];
    // Base truss
    for(let i=0; i<20; i++) {
        initialNodes.push({ id: `TR-${i}`, x: 10 + (i*4), y: 80, type: 'TRUSS', state: 'MOUNTED' });
    }
    // Vertical columns
    for(let i=0; i<15; i++) {
        initialNodes.push({ id: `VC1-${i}`, x: 20, y: 80 - (i*4), type: 'TRUSS', state: 'MOUNTED' });
        initialNodes.push({ id: `VC2-${i}`, x: 80, y: 80 - (i*4), type: 'TRUSS', state: 'MOUNTED' });
    }
    // Top Arch
    for(let i=0; i<16; i++) {
        initialNodes.push({ id: `TA-${i}`, x: 20 + (i*4), y: 20, type: 'TRUSS', state: 'MOUNTED' });
    }
    // LED Screen (Center)
    for(let x=0; x<10; x++) {
        for(let y=0; y<10; y++) {
            initialNodes.push({ id: `LED-${x}-${y}`, x: 30 + (x*4), y: 30 + (y*4), type: 'LED', state: 'MOUNTED' });
        }
    }
    setStageNodes(initialNodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (swarmActive) {
      if (swarmPhase === 'DECONSTRUCTING') {
        loop = setInterval(() => {
          setActiveRobots(Math.max(40, Math.min(65, activeRobots + Math.floor(Math.random() * 5))));
          
          setTrussSegments(prev => Math.max(0, prev - Math.floor(Math.random() * 3)));
          setLedPanels(prev => Math.max(0, prev - Math.floor(Math.random() * 8)));
          
          const totalRemaining = trussSegments + ledPanels;
          const totalStart = 450 + 1200;
          setCompletionPercent(((totalStart - totalRemaining) / totalStart) * 100);

          // Animate Stage Deconstruction
          setStageNodes(prev => {
             const newNodes = [...prev];
             // Find a mounted node and mark it as being dismantled
             const mountedNodes = newNodes.filter(n => n.state === 'MOUNTED');
             if (mountedNodes.length > 0) {
                 const targetIndex = Math.floor(Math.random() * Math.min(10, mountedNodes.length)); // Take from top usually
                 const nodeToDismantle = mountedNodes[targetIndex];
                 
                 const nodeIndex = newNodes.findIndex(n => n.id === nodeToDismantle.id);
                 newNodes[nodeIndex] = { ...newNodes[nodeIndex], state: 'DISMANTLING' };
                 
                 // Add a robot handling it
                 newNodes.push({
                     id: `BOT-${Date.now()}`,
                     x: newNodes[nodeIndex].x,
                     y: newNodes[nodeIndex].y,
                     type: 'ROBOT',
                     state: 'ACTIVE',
                     targetId: newNodes[nodeIndex].id
                 });
             }

             // Process dismantling nodes
             newNodes.forEach((node, i) => {
                 if (node.state === 'DISMANTLING') {
                     if (Math.random() > 0.7) {
                         newNodes[i].state = 'REMOVED';
                         // Remove the robot attached to it
                         const botIndex = newNodes.findIndex(n => n.type === 'ROBOT' && n.targetId === node.id);
                         if (botIndex > -1) newNodes.splice(botIndex, 1);
                     }
                 }
             });

             return newNodes;
          });

          if (trussSegments <= 0 && ledPanels <= 0) {
              setSwarmPhase('TRANSPORTING');
              addLog('SUCCESS', 'Stage structure completely dismantled. Commencing ground transport.');
          }

        }, 150);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [swarmActive, swarmPhase, activeRobots, trussSegments, ledPanels]);

  const initiateDeconstruction = () => {
    if (swarmActive && swarmPhase === 'STANDBY') {
      setSwarmPhase('DECONSTRUCTING');
      addLog('ACTION', 'Executing 3D CAD Teardown Sequence. Dispatching Climbing & Aerial Bots.');
      addLog('ROBOTICS', 'Local Mesh Network established. Collision avoidance active.');
    }
  };

  const resetSwarm = () => {
    setSwarmPhase('STANDBY');
    setActiveRobots(0);
    setTrussSegments(450);
    setLedPanels(1200);
    setCompletionPercent(0);
    
    // Regenerate Stage
    const initialNodes = [];
    for(let i=0; i<20; i++) { initialNodes.push({ id: `TR-${i}`, x: 10 + (i*4), y: 80, type: 'TRUSS', state: 'MOUNTED' }); }
    for(let i=0; i<15; i++) {
        initialNodes.push({ id: `VC1-${i}`, x: 20, y: 80 - (i*4), type: 'TRUSS', state: 'MOUNTED' });
        initialNodes.push({ id: `VC2-${i}`, x: 80, y: 80 - (i*4), type: 'TRUSS', state: 'MOUNTED' });
    }
    for(let i=0; i<16; i++) { initialNodes.push({ id: `TA-${i}`, x: 20 + (i*4), y: 20, type: 'TRUSS', state: 'MOUNTED' }); }
    for(let x=0; x<10; x++) {
        for(let y=0; y<10; y++) {
            initialNodes.push({ id: `LED-${x}-${y}`, x: 30 + (x*4), y: 30 + (y*4), type: 'LED', state: 'MOUNTED' });
        }
    }
    setStageNodes(initialNodes);
    addLog('SYS', 'Structural components reset to initial build state.');
  };

  const toggleSwarm = () => {
    if (!swarmActive) {
      setSwarmActive(true);
      addLog('SYS', 'Autonomous Rigging Swarm Armed. Area cleared of human personnel.');
    } else {
      setSwarmActive(false);
      resetSwarm();
      addLog('WARN', 'Swarm deactivated. Engaging manual human rigging crews.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0f12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦾</span> Automated Construction Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Robotic Stage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Rigging & Deconstruction Swarm</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Building and tearing down massive festival stages traditionally requires hundreds of riggers working at dangerous heights for days, leading to immense labor costs and severe safety risks. Eventra revolutionizes this by implementing a swarm robotics control API. A synchronized fleet of autonomous climbing robots and heavy-lift drones seamlessly coordinate via a local mesh network to assemble and deconstruct the trussing, lighting fixtures, and LED panels based on exact 3D CAD blueprints, completing the teardown in a fraction of the time with zero human risk.
          </p>

          <div className="bg-[#11191f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">⚙️</span> Swarm Telemetry Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSwarm}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     swarmActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {swarmActive ? 'Halt Swarm Operations' : 'Initialize Rigging Swarm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Robots */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 swarmPhase === 'DECONSTRUCTING' ? 'bg-teal-950/20 border-teal-900/50' :
                 swarmActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Drones/Bots
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     swarmActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeRobots}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units</span>
                 </div>
               </div>

               {/* Truss Remaining */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 swarmPhase === 'DECONSTRUCTING' && trussSegments > 0 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 swarmActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Truss / Rigging
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     swarmPhase === 'DECONSTRUCTING' && trussSegments > 0 ? 'text-cyan-400' :
                     swarmActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {swarmActive ? trussSegments : '450'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Segs</span>
                 </div>
               </div>
               
               {/* LED Panels Remaining */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 swarmPhase === 'DECONSTRUCTING' && ledPanels > 0 ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 swarmActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   LED Video Wall
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     swarmPhase === 'DECONSTRUCTING' && ledPanels > 0 ? 'text-indigo-400' :
                     swarmActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {swarmActive ? ledPanels : '1200'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Panels</span>
                 </div>
               </div>

             </div>

             {/* Progress Bar */}
             {swarmActive && (
                 <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden border border-slate-800">
                     <div 
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 transition-all duration-300 ease-out" 
                        style={{ width: `${completionPercent}%` }}
                     ></div>
                 </div>
             )}

             {/* System Log */}
             <div className="flex-1 bg-[#090d12] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Swarm Robotics Log</span>
                 {swarmPhase === 'DECONSTRUCTING' && <span className="text-cyan-400 animate-pulse">Dismantling Active...</span>}
                 {swarmPhase === 'TRANSPORTING' && <span className="text-emerald-400 animate-pulse">DECONSTRUCTION COMPLETE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'ROBOTICS' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* 3D CAD Teardown Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">STAGE 3D SPATIAL MAP</span>
                <span className="text-[8px] font-mono text-slate-400">SWARM COORDINATION</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    
                    {/* Stage Render Container */}
                    <div className="relative w-[80%] h-[80%]">
                        
                        {/* Rendering the Stage Nodes */}
                        {stageNodes.map(node => {
                            if (node.state === 'REMOVED') return null;

                            let bgColor = 'bg-slate-700'; // Default Truss
                            if (node.type === 'LED') bgColor = 'bg-indigo-900 border border-indigo-500/50';
                            
                            let sizeClass = 'w-2 h-2';
                            if (node.type === 'LED') sizeClass = 'w-3 h-3';

                            // Visuals for robots actively dismantling
                            if (node.type === 'ROBOT') {
                                return (
                                    <div 
                                      key={node.id} 
                                      className="absolute w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf] animate-ping z-30" 
                                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                    ></div>
                                );
                            }

                            return (
                                <div 
                                    key={node.id} 
                                    className={`absolute ${sizeClass} ${bgColor} ${node.state === 'DISMANTLING' ? 'opacity-50 blur-[1px]' : ''} transition-all duration-100 z-10`} 
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                ></div>
                            );
                        })}

                    </div>
                </div>

                {/* Overlays */}
                {swarmPhase === 'DECONSTRUCTING' && (
                  <div className="absolute bottom-4 left-4 flex flex-col z-30 bg-black/60 p-2 rounded border border-teal-900/50">
                    <span className="text-[6px] font-mono text-cyan-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-1 animate-pulse"></span>
                        Robot Collision Avoidance: ACTIVE
                    </span>
                    <span className="text-[6px] font-mono text-cyan-400 mt-1 flex items-center">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1 animate-pulse"></span>
                        CAD Model Sync: 120Hz
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={initiateDeconstruction}
                disabled={!swarmActive || swarmPhase !== 'STANDBY'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !swarmActive || swarmPhase !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-teal-950/40 border-teal-900 text-teal-400 hover:bg-teal-900/60'
                }`}
              >
                Execute 3D Teardown Protocol
              </button>
              
              <button 
                onClick={resetSwarm}
                disabled={!swarmActive || swarmPhase === 'STANDBY'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !swarmActive || swarmPhase === 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Stage Structure
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default RoboticRiggingSwarm;
