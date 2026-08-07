/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ADAAccessibilityPathfinding = () => {
  const [routingMode, setRoutingMode] = useState('STANDARD'); // STANDARD, ADA
  const [navigating, setNavigating] = useState(false);
  
  const [appLog, setAppLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Eventra Maps Engine initialized.' },
    { id: 2, time: '11:00:02', type: 'API', msg: 'Loaded topology data: elevation gradients, stairs, paved surfaces.' }
  ]);

  // Graph representation for visualization
  // Nodes: A(Entrance), B(Food Court), C(VIP Lounge - up stairs), D(Main Stage), E(Ramp)
  const mapNodes = [
    { id: 'A', x: 20, y: 80, label: 'Gate 1' },
    { id: 'B', x: 50, y: 70, label: 'Food Court' },
    { id: 'C', x: 80, y: 40, label: 'VIP Lounge (Elevated)' },
    { id: 'D', x: 50, y: 20, label: 'Main Stage' },
    { id: 'E', x: 80, y: 80, label: 'ADA Ramp' } // Alternative path to VIP
  ];

  const standardPath = [
    { from: 'A', to: 'B', type: 'paved' },
    { from: 'B', to: 'D', type: 'grass' },
    { from: 'B', to: 'C', type: 'stairs' }
  ];

  const adaPath = [
    { from: 'A', to: 'B', type: 'paved' },
    { from: 'B', to: 'E', type: 'paved' },
    { from: 'E', to: 'C', type: 'ramp' },
    // Route to stage avoiding grass
    { from: 'E', to: 'D', type: 'paved' }
  ];

  const startNavigation = () => {
    if (!navigating) {
      setNavigating(true);
      addLog('NAV', `Routing to Main Stage & VIP Lounge via ${routingMode} algorithm.`);
      
      if (routingMode === 'STANDARD') {
        addLog('WARN', 'Warning: Standard route includes 15% gradient grass and a 12-step staircase.');
      } else {
        addLog('ADA', 'Calculating weighted graph... avoiding unpaved surfaces and stairs.');
        setTimeout(() => {
          addLog('ADA', 'Route generated. 100% paved. Ramp access to VIP Lounge confirmed.');
        }, 600);
      }

      setTimeout(() => {
        setNavigating(false);
      }, 4000);
    }
  };

  const toggleMode = () => {
    if (routingMode === 'STANDARD') {
      setRoutingMode('ADA');
      addLog('SYS', 'ADA Accessibility Mode enabled. Graph weights updated.');
    } else {
      setRoutingMode('STANDARD');
      addLog('SYS', 'Standard routing enabled. Graph weights reset to shortest-distance.');
    }
    setNavigating(false);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setAppLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const currentPath = routingMode === 'STANDARD' ? standardPath : adaPath;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> Accessibility & Pathfinding
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Automated ADA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Accessibility Routing</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Standard digital festival maps treat all attendees equally, accidentally routing wheelchair users toward steep grassy hills or impassable staircases. Eventra solves this by building an ADA-specific routing layer into the map architecture. Using a specialized weighted graph algorithm, the app calculates routes that strictly utilize paved paths, ramps, and elevators, ensuring seamless and safe navigation for all disabled attendees.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🔀</span> Graph Weighting Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMode}
                   disabled={navigating}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-200 ${
                     navigating ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white hover:bg-slate-50 text-slate-600'
                   }`}
                 >
                   Toggle Mode: {routingMode === 'ADA' ? 'ADA' : 'STANDARD'}
                 </button>
                 <button 
                   onClick={startNavigation}
                   disabled={navigating}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     navigating ? 'bg-blue-100 text-blue-500 border border-blue-200 cursor-not-allowed' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {navigating ? 'Calculating Route...' : 'Simulate Pathfinding'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Algorithm Rules */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routingMode === 'ADA' ? 'bg-blue-50 border-blue-200 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 'bg-slate-50 border-slate-200'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Algorithm Heuristics</span>
                 <div className="flex flex-col space-y-1">
                   <div className="flex items-center text-[10px] font-mono font-bold">
                     <span className={`w-2 h-2 rounded-full mr-2 ${routingMode === 'ADA' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                     <span className={routingMode === 'ADA' ? 'text-blue-700' : 'text-slate-600'}>Shortest Distance</span>
                     {routingMode === 'STANDARD' && <span className="ml-auto text-emerald-500">ACTIVE</span>}
                   </div>
                   <div className="flex items-center text-[10px] font-mono font-bold">
                     <span className={`w-2 h-2 rounded-full mr-2 ${routingMode === 'ADA' ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                     <span className={routingMode === 'ADA' ? 'text-blue-700' : 'text-slate-400'}>Avoid Stairs (Cost: ∞)</span>
                     {routingMode === 'ADA' && <span className="ml-auto text-emerald-500">ACTIVE</span>}
                   </div>
                   <div className="flex items-center text-[10px] font-mono font-bold">
                     <span className={`w-2 h-2 rounded-full mr-2 ${routingMode === 'ADA' ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                     <span className={routingMode === 'ADA' ? 'text-blue-700' : 'text-slate-400'}>Avoid Grass (Cost: ∞)</span>
                     {routingMode === 'ADA' && <span className="ml-auto text-emerald-500">ACTIVE</span>}
                   </div>
                 </div>
               </div>

               {/* Route Safety Score */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routingMode === 'ADA' ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-rose-50 border-rose-200 shadow-inner'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Wheelchair Accessibility</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     routingMode === 'ADA' ? 'text-emerald-600' : 'text-rose-600'
                   }`}>
                     {routingMode === 'ADA' ? '100%' : '14%'}
                   </span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   {routingMode === 'ADA' ? (
                     <><span className="text-emerald-500 mr-1">✅</span> Fully Accessible Route</>
                   ) : (
                     <><span className="text-rose-500 mr-1">❌</span> Route Blocked by Stairs</>
                   )}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Routing Matrix</span>
                 {navigating && <span className="text-blue-400 animate-pulse">Calculating...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {appLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ADA' ? 'text-blue-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'NAV' ? 'text-white' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Map Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-emerald-900/10 rounded-3xl border-8 border-white shadow-[0_0_50px_rgba(0,0,0,0.1)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
              <span className="text-slate-800 text-[10px] font-black uppercase tracking-widest flex items-center">
                Attendee App Map
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                routingMode === 'ADA' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {routingMode === 'ADA' ? 'ADA Mode' : 'Standard'}
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-[#eef2f6] overflow-hidden pt-12">
               
               {/* Terrain Backgrounds */}
               <div className="absolute top-[10%] bottom-[40%] left-[30%] right-[30%] bg-emerald-200/50 rounded-full blur-2xl z-0"></div> {/* Grass area */}
               <div className="absolute top-[30%] right-[10%] w-[40%] h-[30%] bg-slate-300/50 rounded-xl z-0 border border-slate-300"></div> {/* Elevated VIP structure */}
               
               {/* Terrain Labels */}
               <div className="absolute top-[35%] left-[40%] z-0 text-[10px] font-bold text-emerald-700/50 uppercase transform -rotate-12">Grassy Hill</div>
               
               {/* Stairs Marker */}
               <div className="absolute top-[55%] right-[25%] z-0 text-[8px] font-bold text-slate-500 uppercase flex flex-col items-center">
                 <div className="w-6 h-6 border-y border-slate-400 flex flex-col justify-between p-0.5 mb-1 bg-slate-200">
                   <div className="h-px bg-slate-400"></div>
                   <div className="h-px bg-slate-400"></div>
                   <div className="h-px bg-slate-400"></div>
                 </div>
                 Stairs
               </div>

               {/* Graph Edges (Routes) */}
               <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                 {/* Draw all possible physical paths faintly */}
                 <line x1="20%" y1="80%" x2="50%" y2="70%" stroke="#cbd5e1" strokeWidth="6" /> {/* Paved to Food */}
                 <line x1="50%" y1="70%" x2="50%" y2="20%" stroke="#86efac" strokeWidth="6" strokeDasharray="4 4" /> {/* Grass to Stage */}
                 <line x1="50%" y1="70%" x2="80%" y2="40%" stroke="#cbd5e1" strokeWidth="6" /> {/* Stairs to VIP */}
                 <line x1="50%" y1="70%" x2="80%" y2="80%" stroke="#cbd5e1" strokeWidth="6" /> {/* Paved to Ramp base */}
                 <line x1="80%" y1="80%" x2="80%" y2="40%" stroke="#cbd5e1" strokeWidth="6" /> {/* Ramp to VIP */}
                 <line x1="80%" y1="80%" x2="50%" y2="20%" stroke="#cbd5e1" strokeWidth="6" /> {/* Paved to Stage */}

                 {/* Draw the actively selected path */}
                 {navigating && currentPath.map((path, i) => {
                   const nodeFrom = mapNodes.find(n => n.id === path.from);
                   const nodeTo = mapNodes.find(n => n.id === path.to);
                   
                   const isBlocked = routingMode === 'STANDARD' && (path.type === 'stairs' || path.type === 'grass');
                   
                   return (
                     <g key={i}>
                       {/* Active Route Line */}
                       <line 
                         x1={`${nodeFrom.x}%`} y1={`${nodeFrom.y}%`} 
                         x2={`${nodeTo.x}%`} y2={`${nodeTo.y}%`} 
                         stroke={routingMode === 'ADA' ? '#3b82f6' : isBlocked ? '#ef4444' : '#64748b'} // blue or red/slate
                         strokeWidth="4" 
                         strokeDasharray="8 6"
                         className="animate-flow"
                       />
                       
                       {/* Blocked indicator on standard route */}
                       {isBlocked && (
                         <circle 
                           cx={`${(nodeFrom.x + nodeTo.x) / 2}%`} 
                           cy={`${(nodeFrom.y + nodeTo.y) / 2}%`} 
                           r="8" 
                           fill="#ef4444" 
                           className="animate-pulse" 
                         />
                       )}
                       {isBlocked && (
                         <text 
                           x={`${(nodeFrom.x + nodeTo.x) / 2}%`} 
                           y={`${(nodeFrom.y + nodeTo.y) / 2}%`} 
                           fill="white" 
                           fontSize="10" 
                           fontWeight="bold"
                           textAnchor="middle" 
                           dominantBaseline="central"
                         >!</text>
                       )}
                     </g>
                   );
                 })}
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes flow {
                     from { stroke-dashoffset: 14; }
                     to { stroke-dashoffset: 0; }
                   }
                   .animate-flow { animation: flow 0.5s linear infinite; }
                 `}} />
               </svg>

               {/* Nodes (Locations) */}
               {mapNodes.map(node => (
                 <div 
                   key={node.id}
                   className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full z-20 flex items-center justify-center border-2 transition-all duration-300 ${
                     node.id === 'D' ? 'bg-purple-600 border-purple-800 text-white' : // Stage
                     node.id === 'C' ? 'bg-yellow-400 border-yellow-600' : // VIP
                     'bg-white border-slate-300 text-slate-500'
                   }`}
                   style={{ left: `${node.x}%`, top: `${node.y}%` }}
                 >
                   {node.id === 'D' ? '🎪' : node.id === 'C' ? '🥂' : <span className="text-[10px] font-bold">{node.id}</span>}
                   
                   {/* Node Label */}
                   <span className="absolute -bottom-5 whitespace-nowrap text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/80 px-1 rounded backdrop-blur-sm">
                     {node.label}
                   </span>
                 </div>
               ))}

               {/* App UI Overlay */}
               {navigating && (
                 <div className="absolute bottom-6 inset-x-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-30 animate-fade-in-up">
                   <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                     <div className="flex items-center space-x-2">
                       <span className="text-xl">{routingMode === 'ADA' ? '♿' : '🚶'}</span>
                       <div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Navigation Active</p>
                         <p className={`text-sm font-black ${routingMode === 'ADA' ? 'text-blue-600' : 'text-slate-700'}`}>
                           {routingMode === 'ADA' ? 'Accessible Route' : 'Direct Route'}
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     {routingMode === 'ADA' ? (
                       <>
                         <div className="flex items-center text-[10px] font-bold text-slate-600">
                           <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-2">↑</span>
                           Proceed 200ft on paved path.
                         </div>
                         <div className="flex items-center text-[10px] font-bold text-slate-600">
                           <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-2">↗</span>
                           Take ADA Ramp to VIP Lounge.
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 p-1 rounded border border-rose-100">
                           <span className="w-4 h-4 bg-rose-200 text-rose-700 rounded flex items-center justify-center mr-2">!</span>
                           Warning: Route crosses steep grass.
                         </div>
                         <div className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 p-1 rounded border border-rose-100">
                           <span className="w-4 h-4 bg-rose-200 text-rose-700 rounded flex items-center justify-center mr-2">!</span>
                           Warning: Route requires stairs.
                         </div>
                       </>
                     )}
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

export default ADAAccessibilityPathfinding;
