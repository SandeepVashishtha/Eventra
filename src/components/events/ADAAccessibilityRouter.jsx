/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ADAAccessibilityRouter = () => {
  const [isAdaMode, setIsAdaMode] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routePath, setRoutePath] = useState(['A', 'B', 'C', 'E']);
  const [routeStats, setRouteStats] = useState({ distance: 450, estTime: '8 mins' });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Graph Topology Loaded: 450 nodes, 1200 edges.' },
    { id: 2, time: '10:00:01', type: 'SUCCESS', msg: 'Standard shortest-path (A*) generated.' }
  ]);

  // Map Nodes (Graph representation for visualization)
  const nodes = {
      'A': { x: 10, y: 80, label: 'Main Gate' },
      'B': { x: 40, y: 80, label: 'Food Court' },
      'C': { x: 70, y: 50, label: 'Grand Staircase (Unsafe)', hazard: true },
      'D': { x: 40, y: 20, label: 'Paved Ramp (ADA)' },
      'E': { x: 90, y: 20, label: 'Main Stage' }
  };

  const toggleAdaMode = () => {
      setIsAdaMode(!isAdaMode);
      setIsCalculating(true);
      setRoutePath([]);
      
      addLog('ACTION', !isAdaMode ? 'ADA Mode Toggled ON. Re-weighting graph nodes...' : 'ADA Mode Toggled OFF. Reverting to standard weights.');
      
      setTimeout(() => {
          if (!isAdaMode) {
              // ADA Mode ON
              addLog('SYS', 'Dijkstra Engine: Applied +1000 cost penalty to [Stairs, Steep Mud, Unpaved].');
              addLog('SUCCESS', 'Accessible route calculated. Avoiding node C (Grand Staircase).');
              setRoutePath(['A', 'B', 'D', 'E']);
              setRouteStats({ distance: 620, estTime: '12 mins' });
          } else {
              // ADA Mode OFF
              addLog('SYS', 'Dijkstra Engine: Standard weights applied. Optimizing for shortest distance.');
              setRoutePath(['A', 'B', 'C', 'E']);
              setRouteStats({ distance: 450, estTime: '8 mins' });
          }
          setIsCalculating(false);
      }, 1200);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper to draw SVG lines between nodes
  const renderRouteLines = () => {
      if (routePath.length === 0) return null;
      
      const lines = [];
      for (let i = 0; i < routePath.length - 1; i++) {
          const start = nodes[routePath[i]];
          const end = nodes[routePath[i+1]];
          lines.push(
              <line 
                  key={`line-${i}`}
                  x1={`${start.x}%`} 
                  y1={`${start.y}%`} 
                  x2={`${end.x}%`} 
                  y2={`${end.y}%`} 
                  stroke={isAdaMode ? '#3b82f6' : '#6366f1'} // Blue for ADA, Indigo for standard
                  strokeWidth="4"
                  strokeDasharray={isCalculating ? "5, 5" : "0"}
                  className={isCalculating ? "animate-pulse" : ""}
                  strokeLinecap="round"
              />
          );
      }
      return lines;
  };

  return (
    <div className="min-h-screen bg-[#061214] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿️</span> Frontend Algorithms & Graph Theory
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            ADA Accessibility <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500">Routing Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees in wheelchairs are often directed by standard map routing tools down paths that contain stairs, thick mud, or steep inclines, ruining their festival experience. Eventra solves this by implementing a custom pathfinding algorithm (A*) directly on the frontend map UI. When "ADA Mode" is toggled, the routing engine dynamically re-weights the graph nodes to penalize stairs and steep topographies, drawing a safe, accessible route.
          </p>

          <div className="bg-[#0b1b1e] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Dijkstra Matrix Config
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAdaMode}
                   disabled={isCalculating}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isAdaMode ? 'bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' :
                     'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                   }`}
                 >
                   {isCalculating ? (
                       <><span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></span> RECALCULATING...</>
                   ) : isAdaMode ? (
                       <><span className="mr-2">✓</span> ADA Mode Active</>
                   ) : (
                       <><span className="mr-2">♿️</span> Enable ADA Wheelchair Mode</>
                   )}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Total Distance */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isAdaMode ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Route Distance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isAdaMode ? 'text-teal-400' : 'text-slate-600'}`}>
                     {routeStats.distance}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">Meters</span>
                 </div>
               </div>

               {/* Traversal Time */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isAdaMode ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Est. Traversal Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isAdaMode ? 'text-cyan-400' : 'text-slate-600'}`}>
                     {routeStats.estTime.split(' ')[0]}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">{routeStats.estTime.split(' ')[1]}</span>
                 </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04090b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Pathfinding Engine Logs (A*)</span>
                 {isCalculating && <span className="text-blue-400 font-black animate-pulse">RE-WEIGHTING GRAPH...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Map Visualizer (Mobile App Simulator) */}
            <div className={`w-full bg-[#f8fafc] rounded-[2.5rem] border-[12px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[650px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              {/* Header */}
              <div className="bg-white border-b border-slate-200 p-6 pb-4 shadow-sm z-20 relative">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl cursor-pointer">←</span>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-800">Navigation</span>
                      <span className="text-xl">⚙️</span>
                  </div>
                  
                  <div className="bg-slate-100 rounded-xl p-3 flex flex-col space-y-2 border border-slate-200">
                      <div className="flex items-center text-xs">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></span>
                          <span className="text-slate-500">Start:</span>
                          <span className="ml-1 font-bold text-slate-800">Main Gate</span>
                      </div>
                      <div className="border-t border-slate-200"></div>
                      <div className="flex items-center text-xs">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mr-3"></span>
                          <span className="text-slate-500">Dest:</span>
                          <span className="ml-1 font-bold text-slate-800">Main Stage</span>
                      </div>
                  </div>
                  
                  {isAdaMode && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-center text-[10px] font-bold text-blue-700 animate-fade-in-up">
                          ♿️ Wheelchair Accessible Route Selected
                      </div>
                  )}
              </div>

              {/* Map Area */}
              <div className="flex-1 bg-[#e2e8f0] relative overflow-hidden">
                  
                  {/* Terrain/Features */}
                  <div className="absolute top-[40%] right-[10%] w-[120px] h-[80px] bg-emerald-200/50 rounded-full blur-md"></div>
                  <div className="absolute top-[60%] left-[20%] w-[150px] h-[100px] bg-slate-300/50 rounded-full blur-md"></div>

                  {/* SVG Graph Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-md">
                      
                      {/* Base Graph Edges (Faded) */}
                      <line x1="10%" y1="80%" x2="40%" y2="80%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="40%" y1="80%" x2="70%" y2="50%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="70%" y1="50%" x2="90%" y2="20%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      
                      <line x1="40%" y1="80%" x2="40%" y2="20%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="40%" y1="20%" x2="90%" y2="20%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                      {/* Active Route Line */}
                      {renderRouteLines()}
                  </svg>

                  {/* Nodes Overlay */}
                  {Object.entries(nodes).map(([key, node]) => (
                      <div 
                          key={key}
                          className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20"
                          style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      >
                          <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white ${
                              key === 'A' ? 'bg-indigo-500' :
                              key === 'E' ? 'bg-rose-500' :
                              node.hazard ? 'bg-amber-500' : 'bg-slate-400'
                          }`}>
                              {key === 'A' || key === 'E' ? '' : '•'}
                          </div>
                          
                          {/* Label */}
                          <div className={`mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ${
                              node.hazard ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                              {node.label}
                          </div>
                          
                          {/* Penalty Visualizer (only show on hazard when ADA is active) */}
                          {isAdaMode && node.hazard && (
                              <div className="absolute -top-6 bg-red-600 text-white text-[7px] font-black px-1 py-0.5 rounded animate-bounce shadow-lg">
                                  AVOIDED (+1000 cost)
                              </div>
                          )}
                      </div>
                  ))}

                  {isCalculating && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-800 bg-white px-4 py-2 rounded-xl shadow-xl flex items-center">
                              <span className="w-3 h-3 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mr-2"></span> Pathfinding...
                          </span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b1b1e] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">Graph Node Re-weighting:</span>
               Click <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Enable ADA Wheelchair Mode</span>. The standard shortest-path route forces attendees directly over the <span className="text-amber-500 font-bold">Grand Staircase (Node C)</span>. By toggling ADA mode, the Dijkstra algorithm dynamically assigns a massive cost penalty (+1000) to hazard nodes, instantly re-routing the user along the paved ramp (Node D) to ensure a safe, accessible journey.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ADAAccessibilityRouter;
