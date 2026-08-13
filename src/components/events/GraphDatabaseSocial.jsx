/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GraphDatabaseSocial = () => {
  const [isTraversing, setIsTraversing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Neo4j Graph Database connected. Cypher query engine ready.' }
  ]);

  const executeTraversal = () => {
      setIsTraversing(true);
      setShowRecommendations(false);
      addLog('ACTION', 'Executing Cypher Traversal: MATCH (u:User)-[:FRIENDS_WITH*2]->(fof:User)-[:WATCHING]->(s:Stage)...');
      
      setTimeout(() => {
          addLog('SYS', 'Traversing multi-degree edges. Bypassing inefficient SQL JOINs.');
          
          setTimeout(() => {
              setIsTraversing(false);
              setShowRecommendations(true);
              addLog('SUCCESS', 'Query executed in 4.2ms. Found 3 mutual connections at Stage B.');
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsTraversing(false);
      setShowRecommendations(false);
      addLog('SYS', 'Graph topology reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕸️</span> Graph Databases & Algorithms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Social Network Graph <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500">Friend Recommender</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees want to meet up with friends of friends, but traditional relational databases (SQL) are incredibly slow and inefficient at querying complex multi-degree social connections. A 50-line SQL JOIN query would take 12 seconds and crash the database server under load. Eventra solves this by implementing a Graph Database (like Neo4j). It visually maps nodes (Users) and edges (Friendships), enabling highly efficient, sub-millisecond graph traversal algorithms to instantly suggest mutual friends nearby.
          </p>

          <div className="bg-[#120703] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Cypher Query Engine
               </h3>
               {showRecommendations && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4">
                 
                 {/* Cypher Query Input Box */}
                 <div className={`border-2 rounded-xl p-4 flex flex-col relative overflow-hidden transition-all duration-500 ${
                     isTraversing ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'border-slate-800 bg-slate-900/50'
                 }`}>
                     
                     {/* Scanning effect */}
                     {isTraversing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent w-[200%] animate-[slide_1.5s_linear_infinite] z-0"></div>}

                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 relative z-10">Neo4j Graph Traversal Query</span>
                     
                     <div className="bg-black/60 rounded p-3 font-mono text-[10px] text-slate-300 relative z-10 space-y-1">
                         <div><span className="text-orange-400">MATCH</span> (me:User {'{id: "currentUser"}'})</div>
                         <div><span className="text-orange-400">-[:FRIENDS_WITH*1..2]-></span>(fof:User)</div>
                         <div><span className="text-orange-400">-[:WATCHING]-></span>(s:Stage)</div>
                         <div><span className="text-pink-400">RETURN</span> fof.name, s.name</div>
                         <div><span className="text-pink-400">ORDER BY</span> fof.mutualCount <span className="text-blue-400">DESC</span></div>
                     </div>
                 </div>
                 
             </div>

             <button 
                 onClick={executeTraversal}
                 disabled={isTraversing || showRecommendations}
                 className={`w-full py-3 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors mb-4 ${
                     showRecommendations ? 'bg-emerald-600/20 text-emerald-500 border-emerald-500/50 cursor-not-allowed' :
                     isTraversing ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                     'bg-orange-600 hover:bg-orange-500 text-white border-orange-500'
                 }`}
             >
                 {showRecommendations ? 'Query Complete (4.2ms)' : isTraversing ? 'Traversing Graph Edges...' : 'Execute Cypher Query'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Graph Database Logs</span>
                 {isTraversing && <span className="text-orange-400 font-black animate-pulse">TRAVERSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-pink-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Topology Visualizer</span>
                      <span className="text-xs text-white font-bold">Social Graph State</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
                  
                  {/* Graph Canvas */}
                  <div className="absolute inset-0 z-0">
                      
                      {/* Edges (Lines) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {/* CurrentUser to Friend 1 */}
                          <line x1="50%" y1="85%" x2="20%" y2="55%" stroke={showRecommendations ? "#f97316" : "#334155"} strokeWidth={showRecommendations ? "3" : "2"} className={isTraversing ? "animate-[dash_1s_linear_infinite] stroke-orange-500" : ""} strokeDasharray={isTraversing ? "5,5" : "0"} />
                          {/* CurrentUser to Friend 2 */}
                          <line x1="50%" y1="85%" x2="80%" y2="55%" stroke={showRecommendations ? "#f97316" : "#334155"} strokeWidth={showRecommendations ? "3" : "2"} className={isTraversing ? "animate-[dash_1s_linear_infinite] stroke-orange-500" : ""} strokeDasharray={isTraversing ? "5,5" : "0"} />
                          
                          {/* Friend 1 to FOF 1 */}
                          <line x1="20%" y1="55%" x2="35%" y2="30%" stroke={showRecommendations ? "#f97316" : "#334155"} strokeWidth={showRecommendations ? "3" : "2"} className={isTraversing ? "animate-[dash_1s_linear_infinite] stroke-orange-500 delay-100" : ""} strokeDasharray={isTraversing ? "5,5" : "0"} />
                          {/* Friend 2 to FOF 1 */}
                          <line x1="80%" y1="55%" x2="35%" y2="30%" stroke={showRecommendations ? "#f97316" : "#334155"} strokeWidth={showRecommendations ? "3" : "2"} className={isTraversing ? "animate-[dash_1s_linear_infinite] stroke-orange-500 delay-100" : ""} strokeDasharray={isTraversing ? "5,5" : "0"} />
                          
                          {/* FOF 1 to Stage B */}
                          <line x1="35%" y1="30%" x2="75%" y2="20%" stroke={showRecommendations ? "#ec4899" : "#334155"} strokeWidth={showRecommendations ? "3" : "2"} className={isTraversing ? "animate-[dash_1s_linear_infinite] stroke-pink-500 delay-200" : ""} strokeDasharray={isTraversing ? "5,5" : "0"} />
                      </svg>

                      {/* Nodes */}
                      
                      {/* Current User */}
                      <div className="absolute left-1/2 top-[85%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xl bg-slate-800 ${showRecommendations || isTraversing ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'border-slate-600'}`}>
                              👤
                          </div>
                          <span className="text-[9px] font-bold mt-1 text-white bg-black/50 px-1 rounded">You</span>
                      </div>

                      {/* Friend 1 */}
                      <div className="absolute left-[20%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-lg bg-slate-800 ${showRecommendations || isTraversing ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-slate-600'}`}>
                              🧔
                          </div>
                          <span className="text-[9px] mt-1 text-slate-400 bg-black/50 px-1 rounded">Friend</span>
                      </div>

                      {/* Friend 2 */}
                      <div className="absolute left-[80%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-lg bg-slate-800 ${showRecommendations || isTraversing ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-slate-600'}`}>
                              👩
                          </div>
                          <span className="text-[9px] mt-1 text-slate-400 bg-black/50 px-1 rounded">Friend</span>
                      </div>

                      {/* FOF 1 (The target) */}
                      <div className="absolute left-[35%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-2xl transition-all duration-500 ${showRecommendations ? 'border-pink-500 bg-pink-900 shadow-[0_0_20px_rgba(236,72,153,0.8)] scale-110' : isTraversing ? 'border-pink-500/50 bg-slate-800' : 'border-slate-600 bg-slate-800'}`}>
                              👨‍🎤
                          </div>
                          <span className={`text-[10px] font-bold mt-1 px-1 rounded transition-colors ${showRecommendations ? 'text-pink-300 bg-black' : 'text-slate-400 bg-black/50'}`}>Alex (2 Mutuals)</span>
                      </div>

                      {/* Stage Node */}
                      <div className="absolute left-[75%] top-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className={`w-16 h-16 rounded-xl border-4 flex items-center justify-center text-3xl transition-all duration-500 ${showRecommendations ? 'border-rose-500 bg-slate-900 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'border-slate-700 bg-slate-900'}`}>
                              🎪
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-rose-400 bg-black/50 px-1 rounded">Stage B</span>
                      </div>

                  </div>
                  
                  {/* Overlay Result */}
                  {showRecommendations && (
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                          <div className="bg-slate-900/90 backdrop-blur-md border border-pink-500/50 rounded-xl p-4 shadow-2xl animate-fade-in-up">
                              <div className="flex items-start">
                                  <div className="w-10 h-10 rounded-full bg-pink-900/50 border border-pink-500 flex items-center justify-center text-xl mr-3 shrink-0">👋</div>
                                  <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white mb-1">Meet up with Alex!</span>
                                      <span className="text-[10px] text-slate-300 leading-snug">Alex is at <span className="font-bold text-rose-400">Stage B</span>. You share 2 mutual friends. Join them for the next set!</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120703] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Graph Data Modeling:</span>
               Click <span className="text-white font-bold bg-orange-600 px-1 rounded">Execute Query</span>. Traditional relational databases (SQL) must execute highly inefficient "JOIN" operations across millions of rows to find mutual friends. A Graph database (like Neo4j) stores the connections (edges) natively. The Cypher query instantly hops from You ➔ Friends ➔ Friends-of-Friends ➔ Stage. It identifies that "Alex" is at Stage B and shares 2 mutual friends with you, executing the complex social query in just 4.2 milliseconds.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(50%); }
        }
      `}} />
    </div>
  );
};

export default GraphDatabaseSocial;
