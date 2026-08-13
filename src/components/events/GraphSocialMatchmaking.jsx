/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GraphSocialMatchmaking = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [algorithm, setAlgorithm] = useState('COMMUNITY_DETECTION'); // PAGE_RANK, COMMUNITY_DETECTION
  
  // Neo4j Metrics
  const [nodesExplored, setNodesExplored] = useState(0); 
  const [edgesTraversed, setEdgesTraversed] = useState(0); 
  const [matchConfidence, setMatchConfidence] = useState(0); // %
  const [traversalDepth, setTraversalDepth] = useState(1);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Neo4j Graph Database initialized. 100k nodes loaded.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Awaiting match request from User Node U_4892.' }
  ]);

  // Visualizer State
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  const [activeNodes, setActiveNodes] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive && isSearching) {
      loop = setInterval(() => {
          setNodesExplored(prev => Math.min(8450, prev + Math.floor(Math.random() * 400)));
          setEdgesTraversed(prev => Math.min(25400, prev + Math.floor(Math.random() * 1200)));
          
          if (nodesExplored > 1000) setTraversalDepth(2);
          if (nodesExplored > 4000) setTraversalDepth(3);
          
          // Animate graph nodes
          const newActive = [];
          for (let i = 0; i < 5; i++) {
             newActive.push(Math.floor(Math.random() * 20));
          }
          setActiveNodes(newActive);

      }, 150); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isSearching, nodesExplored]);

  const findMatches = () => {
      if (!systemActive || isSearching) return;
      
      setIsSearching(true);
      setNodesExplored(0);
      setEdgesTraversed(0);
      setTraversalDepth(1);
      setMatchConfidence(0);
      setMatchResults([]);
      setActiveNodes([]);
      
      addLog('ACTION', `Executing ${algorithm} on social graph for Node U_4892.`);
      addLog('SYS', 'Traversing [LIKES_ARTIST] -> [ARTIST] <- [LIKES_ARTIST] relationships.');
      
      setTimeout(() => {
          setIsSearching(false);
          setMatchConfidence(94.5);
          setActiveNodes([2, 7, 14]); // Highlight specific nodes
          
          setMatchResults([
              { id: 'U_1932', name: 'Alex K.', shared: ['Odesza', 'Vegan', 'Camp North'], distance: '0.2 miles away' },
              { id: 'U_8492', name: 'Sarah M.', shared: ['Techno', 'Shuffle Dancer'], distance: '0.5 miles away' }
          ]);

          addLog('SUCCESS', `Traversal complete. Found 2 high-confidence matches at Depth 3.`);
      }, 2500);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Graph Matchmaking Engine Online. Connected to Neo4j Aura.');
    } else {
      setSystemActive(false);
      setIsSearching(false);
      setMatchResults([]);
      setNodesExplored(0);
      setEdgesTraversed(0);
      setActiveNodes([]);
      addLog('WARN', 'Engine Offline. Falling back to simple SQL geo-queries.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Generate static positions for the visual graph
  const graphNodes = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      type: i === 0 ? 'USER_ROOT' : i < 5 ? 'ARTIST' : i < 10 ? 'TAG' : 'USER'
  }));

  return (
    <div className="min-h-screen bg-[#040914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕸️</span> Graph Databases
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Graph Social Matchmaking <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-500 to-indigo-500">via Neo4j</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Solo attendees or small groups struggle to find and connect with other attendees who share their specific niche interests. Standard SQL databases are extremely slow and inefficient for complex many-to-many social relationship queries. Eventra solves this by implementing a Neo4j graph database to map complex user relationships based on their favorited artists, chosen camping zones, and opted-in social tags. We use advanced graph traversal algorithms (like PageRank or Community Detection) to power a "Festival Match" UI, recommending highly relevant, nearby attendees to connect with.
          </p>

          <div className="bg-[#080f1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Neo4j Traversal Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Graph Engine' : 'Connect to Neo4j Aura'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Nodes Explored */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSearching ? 'bg-sky-950/40 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Nodes Visited
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     isSearching ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {nodesExplored.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Edges Traversed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSearching ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Edges Checked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isSearching ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {edgesTraversed.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Traversal Depth */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Hop Depth
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {traversalDepth}
                   </span>
                 </div>
               </div>
               
               {/* Match Confidence */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 matchConfidence > 90 ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Confidence
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         matchConfidence > 90 ? 'text-emerald-400' : 'text-slate-600'
                       }`}>
                         {matchConfidence.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cypher Query Ledger</span>
                 {isSearching && <span className="text-sky-400 font-black animate-pulse">EXECUTING CYPHER_QUERY...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Graph Visualizer Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#04060a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">GRAPH TRAVERSAL</span>
                <span className="text-[8px] font-mono text-slate-400">ALGO: {algorithm}</span>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden pt-12">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DATABASE OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Fake SVG Edges (Lines between nodes) */}
                        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                            {graphNodes.map((n1, i) => (
                                graphNodes.slice(i+1, i+3).map((n2, j) => {
                                    // Make lines light up if searching and nodes are active
                                    const isActiveEdge = isSearching && (activeNodes.includes(i) || activeNodes.includes(i+1+j));
                                    const isMatchEdge = matchResults.length > 0 && (i === 0 || n2.type === 'USER');
                                    
                                    return (
                                        <line 
                                            key={`${i}-${j}`} 
                                            x1={`${n1.x}%`} 
                                            y1={`${n1.y}%`} 
                                            x2={`${n2.x}%`} 
                                            y2={`${n2.y}%`} 
                                            stroke={isActiveEdge ? '#38bdf8' : isMatchEdge ? '#10b981' : '#334155'} 
                                            strokeWidth={isActiveEdge || isMatchEdge ? 2 : 1}
                                        />
                                    )
                                })
                            ))}
                        </svg>

                        {/* Nodes */}
                        {graphNodes.map((node, i) => {
                            let color = 'bg-slate-700'; // Default
                            let size = 'w-3 h-3';
                            let glow = '';
                            
                            if (node.type === 'USER_ROOT') {
                                color = 'bg-blue-500'; size = 'w-6 h-6'; glow = 'shadow-[0_0_15px_#3b82f6]';
                            } else if (node.type === 'ARTIST') {
                                color = 'bg-purple-500'; size = 'w-4 h-4';
                            } else if (node.type === 'TAG') {
                                color = 'bg-orange-500'; size = 'w-4 h-4';
                            }

                            if (isSearching && activeNodes.includes(i)) {
                                color = 'bg-sky-400';
                                glow = 'shadow-[0_0_20px_#38bdf8]';
                            }

                            if (matchResults.length > 0 && (i === 2 || i === 7 || i === 14)) { // Fake highlighted matches
                                color = 'bg-emerald-400';
                                size = 'w-5 h-5';
                                glow = 'shadow-[0_0_20px_#10b981]';
                            }

                            return (
                                <div 
                                    key={i}
                                    className={`absolute rounded-full transition-all duration-300 ${color} ${size} ${glow} -translate-x-1/2 -translate-y-1/2 flex items-center justify-center`}
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    {node.type === 'USER_ROOT' && <span className="text-[10px]">👤</span>}
                                </div>
                            )
                        })}

                        {/* Overlay: Match Results */}
                        {matchResults.length > 0 && (
                            <div className="absolute bottom-4 inset-x-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-3 z-30 animate-fade-in-up">
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Festival Fam Found (Confidence: {matchConfidence}%)</span>
                                
                                {matchResults.map((match, i) => (
                                    <div key={i} className="bg-slate-800 rounded p-2 mb-2 last:mb-0 border border-slate-700 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-xs">🧑‍🎤</div>
                                            <div>
                                                <span className="text-xs font-bold text-white block leading-none mb-1">{match.name}</span>
                                                <span className="text-[8px] text-slate-400 block">{match.shared.join(' • ')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-mono text-emerald-400 block mb-1">{match.distance}</span>
                                            <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[8px] font-bold uppercase text-white transition-colors">Connect</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#080f1a] p-4 rounded-xl border border-slate-800">
               <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Simulate Request</span>
                   
                   <select 
                       value={algorithm}
                       onChange={(e) => setAlgorithm(e.target.value)}
                       disabled={!systemActive || isSearching}
                       className="bg-slate-900 border border-slate-700 text-[8px] font-mono text-slate-400 p-1 rounded outline-none"
                   >
                       <option value="COMMUNITY_DETECTION">Community Detection (Louvain)</option>
                       <option value="PAGE_RANK">PageRank (Influence)</option>
                   </select>
               </div>
               
               <button 
                   onClick={findMatches}
                   disabled={!systemActive || isSearching}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || isSearching ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   🔍 Find Festival Fam (Node U_4892)
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GraphSocialMatchmaking;
