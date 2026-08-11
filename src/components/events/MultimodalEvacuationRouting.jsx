/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MultimodalEvacuationRouting = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [hazardLocation, setHazardLocation] = useState(null); // 'NORTH', 'EAST'
  const [crowdFlow, setCrowdFlow] = useState(0); // Simulation of people evacuated
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'Graph routing engine initialized. Standard egress flows active.' }
  ]);

  // Nodes for the map (0: Center Stage, 1: North Exit, 2: East Exit, 3: South Exit, 4: West Exit)
  const mapNodes = [
    { id: 'CENTER', x: 50, y: 50 },
    { id: 'NORTH', x: 50, y: 10, label: 'Gate N (Main)' },
    { id: 'EAST', x: 90, y: 50, label: 'Gate E' },
    { id: 'SOUTH', x: 50, y: 90, label: 'Gate S' },
    { id: 'WEST', x: 10, y: 50, label: 'Gate W' }
  ];

  useEffect(() => {
    let loop;
    if (emergencyActive) {
      loop = setInterval(() => {
        setCrowdFlow(prev => Math.min(100, prev + (Math.random() * 2 + 1)));
      }, 500);
    }
    return () => clearInterval(loop);
  }, [emergencyActive]);

  const triggerEmergency = (zone) => {
    if (!emergencyActive) {
      setEmergencyActive(true);
      setHazardLocation(zone);
      setCrowdFlow(0);
      
      addLog('CRIT', `ACTIVE HAZARD DETECTED: Fire at ${zone} zone.`);
      addLog('SYS', `Recalculating egress paths. Executing Dijkstra's algorithm to avoid ${zone}...`);
      
      setTimeout(() => {
        addLog('ACTION', 'Dynamic routing engaged. Splitting crowd flow to alternative safe exits.');
        addLog('SYS', 'Pushing AR wayfinding overrides to 28,401 attendee devices.');
      }, 800);
    }
  };

  const resetSystem = () => {
    setEmergencyActive(false);
    setHazardLocation(null);
    setCrowdFlow(0);
    addLog('SYS', 'Emergency cleared. Returning to standard routing.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔥</span> Emergency Pathfinding
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Multi-modal Evacuation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">Routing Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            In an active emergency like a fire, standard static exit signs often cause deadly stampedes toward the main entrance, leading people directly into a hazard or a crowd crush. Eventra solves this by implementing a dynamic evacuation engine using Dijkstra's algorithm. If a hazard breaks out, the system calculates the safest routes away from the danger zone. It instantly overrides digital signage and pushes custom AR wayfinding arrows to attendees' phones, dynamically splitting the crowd across multiple safe exits.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🗺️</span> Dynamic Egress Graph
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSystem}
                   disabled={!emergencyActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-200 ${
                     !emergencyActive ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-600'
                   }`}
                 >
                   Reset
                 </button>
                 <button 
                   onClick={() => triggerEmergency('NORTH')}
                   disabled={emergencyActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     emergencyActive ? 'bg-orange-100 text-orange-500 border border-orange-200 cursor-not-allowed' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                   Simulate North Fire
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Evacuation Efficiency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 emergencyActive ? 'bg-orange-50 border-orange-200 shadow-inner' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Crowd Dispersal Rate</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     emergencyActive ? 'text-orange-600' : 'text-slate-800'
                   }`}>
                     {emergencyActive ? crowdFlow.toFixed(1) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-2 pb-1">%</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emergencyActive ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></span>
                   Active Flow Balancing
                 </div>
               </div>

               {/* Routing Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 emergencyActive ? 'bg-rose-50 border-rose-200 shadow-inner' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Dijkstra Node Status</span>
                 <div className="flex flex-col">
                   {emergencyActive ? (
                     <>
                       <span className="text-2xl font-black font-mono text-rose-600 leading-tight">
                         AVERTING {hazardLocation}
                       </span>
                       <span className="text-[9px] font-bold text-rose-500 mt-1 uppercase tracking-widest">
                         Hazard Avoidance Active
                       </span>
                     </>
                   ) : (
                     <>
                       <span className="text-2xl font-black font-mono text-emerald-600 leading-tight">
                         OPTIMAL
                       </span>
                       <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">
                         Static Routing Active
                       </span>
                     </>
                   )}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Override Log</span>
                 {emergencyActive && <span className="text-orange-400 animate-pulse">Routing...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-rose-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Graph/AR Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-lg border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-slate-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Global Evac Matrix
              </span>
              <span className="text-[10px] font-mono text-orange-400 flex items-center">
                LIVE_NODE_MAP
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
               
               {/* Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

               {/* Graph Edges (Routes) */}
               <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                 {['NORTH', 'EAST', 'SOUTH', 'WEST'].map((dir, i) => {
                   const targetNode = mapNodes.find(n => n.id === dir);
                   
                   // Determine if this route is blocked by a hazard
                   const isBlocked = hazardLocation === dir;
                   
                   // Determine if this route is currently active
                   const isActive = emergencyActive && !isBlocked;

                   return (
                     <g key={i}>
                       {/* Base edge */}
                       <line 
                         x1="50%" y1="50%" 
                         x2={`${targetNode.x}%`} y2={`${targetNode.y}%`} 
                         stroke={isBlocked ? '#ef4444' : '#334155'} 
                         strokeWidth={isBlocked ? "4" : "2"}
                         strokeDasharray={isBlocked ? "0" : "5,5"}
                       />
                       
                       {/* Active Flow Animation */}
                       {isActive && (
                         <line 
                           x1="50%" y1="50%" 
                           x2={`${targetNode.x}%`} y2={`${targetNode.y}%`} 
                           stroke="#10b981" // emerald-500
                           strokeWidth="4"
                           strokeDasharray="10 10"
                           className="animate-flow"
                         />
                       )}
                       
                       {/* Blocked X mark */}
                       {isBlocked && (
                         <text 
                           x={`${(50 + targetNode.x) / 2}%`} 
                           y={`${(50 + targetNode.y) / 2}%`} 
                           fill="#ef4444" 
                           fontSize="24" 
                           textAnchor="middle" 
                           dominantBaseline="central"
                           className="animate-pulse"
                         >❌</text>
                       )}
                     </g>
                   );
                 })}
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes flow {
                     from { stroke-dashoffset: 20; }
                     to { stroke-dashoffset: 0; }
                   }
                   .animate-flow { animation: flow 0.5s linear infinite; }
                 `}} />
               </svg>

               {/* Nodes */}
               {mapNodes.map(node => (
                 <div 
                   key={node.id}
                   className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full z-20 flex items-center justify-center border-4 transition-all duration-300 ${
                     node.id === 'CENTER' ? 'bg-slate-800 border-slate-600' :
                     hazardLocation === node.id ? 'bg-red-900 border-red-500 animate-pulse' :
                     emergencyActive ? 'bg-emerald-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-900 border-slate-700'
                   }`}
                   style={{ left: `${node.x}%`, top: `${node.y}%` }}
                 >
                   {node.id === 'CENTER' ? (
                     <span className="text-xl">🎪</span>
                   ) : hazardLocation === node.id ? (
                     <span className="text-xl">🔥</span>
                   ) : emergencyActive ? (
                     <span className="text-lg font-black text-emerald-400">EXIT</span>
                   ) : (
                     <span className="text-[8px] font-bold text-slate-500">GATE</span>
                   )}
                   
                   {/* Node Label */}
                   {node.label && (
                     <span className={`absolute whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                       node.y < 50 ? 'bottom-full mb-2' : node.y > 50 ? 'top-full mt-2' : node.x > 50 ? 'left-full ml-2' : 'right-full mr-2'
                     } ${
                       hazardLocation === node.id ? 'bg-red-500 text-white' : 
                       emergencyActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                     }`}>
                       {node.label}
                     </span>
                   )}
                 </div>
               ))}

               {/* Simulated Attendee AR Overlay Preview */}
               {emergencyActive && (
                 <div className="absolute bottom-6 inset-x-6 bg-emerald-900/90 border border-emerald-500 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in-up z-30 backdrop-blur-sm">
                   <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest leading-none mb-3 border-b border-emerald-500/50 pb-2">
                     Attendee Device Override Active
                   </p>
                   <div className="flex flex-col items-center">
                     <span className="text-3xl font-black text-white mb-1">TURN RIGHT</span>
                     <span className="text-sm font-bold text-emerald-300 uppercase tracking-widest mb-3">Proceed to Gate E</span>
                     
                     <div className="w-16 h-16 border-4 border-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                       {/* Arrow SVG */}
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M5 12h14M12 5l7 7-7 7"/>
                       </svg>
                     </div>
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MultimodalEvacuationRouting;
