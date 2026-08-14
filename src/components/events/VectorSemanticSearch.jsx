/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VectorSemanticSearch = () => {
  const [isVectorEnabled, setIsVectorEnabled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("chill electronic music");
  const [searchResults, setSearchResults] = useState(null); // null, 'SQL_EMPTY', 'VECTOR_MATCH'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Database connection established. Awaiting queries.' }
  ]);

  const executeSearch = () => {
      setIsSearching(true);
      setSearchResults(null);
      setActiveStep(1);
      
      addLog('ACTION', `User searched for vibe: "${searchQuery}"`);
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isVectorEnabled) {
              addLog('SYS', 'Passing query to LLM Embedding Model...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Generated 1536-dimensional vector embedding [0.12, -0.45, 0.89...]');
                  addLog('WARN', 'Executing Cosine Similarity nearest-neighbor search in Vector DB.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsSearching(false);
                      setSearchResults('VECTOR_MATCH');
                      addLog('SUCCESS', 'Found conceptually similar artists! Cosine Similarity Score: 0.94.');
                  }, 1200);
              }, 1200);
              
          } else {
              // Legacy SQL Search
              addLog('WARN', 'Executing traditional SQL pattern matching: ILIKE "%chill electronic music%"');
              
              setTimeout(() => {
                  setActiveStep(3);
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsSearching(false);
                      setSearchResults('SQL_EMPTY');
                      addLog('CRIT', 'SQL returned 0 rows. Exact keyword match failed.');
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const toggleVector = () => {
      const newState = !isVectorEnabled;
      setIsVectorEnabled(newState);
      setSearchResults(null);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'pgvector extension initialized. Semantic matching active.');
      } else {
          addLog('CRIT', 'Vector DB disabled. Reverting to legacy SQL exact text matching.');
      }
  };

  const resetSearch = () => {
      setIsSearching(false);
      setSearchResults(null);
      setActiveStep(0);
      addLog('SYS', 'Search engine reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030206] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> AI & Search Algorithms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Vector Database <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">Semantic Artist Discovery</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Users frequently search for a specific "vibe" (e.g., "chill electronic music"), but traditional SQL databases only match exact tags. If the artist is tagged as "downtempo ambient", the SQL query returns zero results, ruining discovery. Eventra solves this by implementing a Vector Database (like pgvector). We use an LLM to generate high-dimensional vector embeddings of the artists' biographies and genres. When a user searches for a vibe, the backend performs a cosine similarity search, returning artists that conceptually match the query even if the keywords differ entirely.
          </p>

          <div className="bg-[#080512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Search Architecture
               </h3>
               {searchResults !== null && (
                   <button onClick={resetSearch} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Clear Results</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Vector Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Database Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isVectorEnabled ? 'Active: LLM Embeddings + Vector Search' : 'Inactive: SQL Exact Text Match (ILIKE)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleVector}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isVectorEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isVectorEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Search Input */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col mb-6">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">User Query: Vibe Search</span>
                     <div className="flex items-center bg-black/50 border border-slate-600 rounded px-3 py-2">
                         <span className="text-slate-500 mr-2">🔍</span>
                         <input 
                             type="text" 
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="bg-transparent border-none text-white font-bold outline-none w-full text-sm placeholder-slate-600"
                             placeholder="Type a vibe..."
                             disabled={isSearching}
                         />
                     </div>
                 </div>

                 <button 
                     onClick={executeSearch}
                     disabled={isSearching || searchResults !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         searchResults !== null ? 'bg-slate-800 text-indigo-500 border-indigo-900 cursor-not-allowed' :
                         isSearching ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                     }`}
                 >
                     {isSearching ? 'Querying Database...' : searchResults !== null ? 'Search Complete' : "Execute Search Query"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040208] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend DB Logs</span>
                 {isSearching && <span className="text-indigo-400 font-black animate-pulse">EXECUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Database Search Engine</span>
                      <span className="text-xs text-white font-bold">Query Analyzer</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {isVectorEnabled ? (
                      // Vector DB View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="bg-indigo-950/30 border border-indigo-900 rounded-xl p-4 mb-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Step 1: LLM Embedding</span>
                              <div className="text-[10px] text-slate-300 bg-black/50 p-2 rounded border border-slate-800 font-mono">
                                  text2vec('{searchQuery}')<br/>
                                  <span className="text-purple-400 animate-pulse mt-1 block">
                                      {activeStep >= 2 ? '[0.12, -0.45, 0.89, 0.33, -0.91, 0.22...]' : '...'}
                                  </span>
                              </div>
                          </div>
                          
                          <div className={`bg-slate-900 border rounded-xl p-4 mb-4 flex-1 transition-colors duration-500 ${
                              activeStep >= 3 ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-800'
                          }`}>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Step 2: Vector Search (Cosine Similarity)</span>
                              
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                      <div className="flex flex-col">
                                          <span className="text-white font-bold text-xs">Odesza</span>
                                          <span className="text-[9px] text-slate-500">Tags: downtempo, ambient</span>
                                      </div>
                                      <span className={`text-[10px] font-black font-mono px-2 py-1 rounded ${
                                          activeStep >= 3 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'text-slate-600'
                                      }`}>
                                          {activeStep >= 3 ? '0.94 Match' : '?.??'}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 opacity-70">
                                      <div className="flex flex-col">
                                          <span className="text-white font-bold text-xs">Tycho</span>
                                          <span className="text-[9px] text-slate-500">Tags: idm, ambient</span>
                                      </div>
                                      <span className={`text-[10px] font-black font-mono px-2 py-1 rounded ${
                                          activeStep >= 3 ? 'bg-emerald-950/50 text-emerald-500 border border-emerald-500/30' : 'text-slate-600'
                                      }`}>
                                          {activeStep >= 3 ? '0.88 Match' : '?.??'}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center opacity-30">
                                      <div className="flex flex-col">
                                          <span className="text-white font-bold text-xs">Excision</span>
                                          <span className="text-[9px] text-slate-500">Tags: heavy dubstep</span>
                                      </div>
                                      <span className={`text-[10px] font-black font-mono px-2 py-1 rounded ${
                                          activeStep >= 3 ? 'text-rose-500' : 'text-slate-600'
                                      }`}>
                                          {activeStep >= 3 ? '0.12 Match' : '?.??'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      // Legacy SQL View
                      <div className="flex flex-col h-full animate-fade-in-up">
                          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Legacy SQL Query</span>
                              <div className="text-[10px] text-rose-300 bg-black/50 p-3 rounded border border-rose-900/50 font-mono">
                                  SELECT * FROM artists<br/>
                                  WHERE tags ILIKE '%{searchQuery}%';
                              </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-6">
                              {activeStep >= 3 ? (
                                  <div className="text-center animate-fade-in-up">
                                      <div className="text-4xl mb-3">🕳️</div>
                                      <span className="text-white font-bold block mb-1">0 Results Found</span>
                                      <span className="text-[10px] text-slate-500 leading-relaxed">
                                          No artist has the exact string "{searchQuery}" in their tags.<br/><br/>
                                          (Odesza is tagged "downtempo ambient", which means the same thing, but SQL doesn't understand context).
                                      </span>
                                  </div>
                              ) : (
                                  <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Awaiting Query...</span>
                              )}
                          </div>
                      </div>
                  )}

                  {/* Overlays */}
                  {searchResults === 'VECTOR_MATCH' && (
                      <div className="absolute inset-0 bg-indigo-900/90 backdrop-blur-sm rounded-[1.5rem] border-2 border-indigo-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">✨</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">Semantic Match Found!<br/><span className="text-[10px] font-normal text-indigo-200 mt-1 block">Vector DB understands concept over keyword</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#080512] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Semantic NLP Search:</span>
               With the Vector engine OFF, search for "chill electronic music". The SQL query runs an exact string match. Because the artist is tagged "downtempo ambient", it returns 0 results, completely missing the vibe.<br/><br/>Toggle <span className="text-indigo-400 font-bold bg-slate-800 px-1 rounded">Database Engine</span> ON. When you search, the query is passed to an LLM to generate a dense vector embedding. The database performs a Cosine Similarity math operation, realizing that "downtempo ambient" and "chill electronic music" point to the exact same semantic cluster, returning perfect results despite differing keywords.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VectorSemanticSearch;
