/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SemanticLostAndFound = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Vector Database (pgvector) initialized. LLM embeddings loaded.' }
  ]);

  const databaseItems = [
      { id: 'LF-8812', title: 'Navy Mobile Cover', img: '📱', similarity: 0.94, tags: ['electronics', 'dark blue', 'protective'] },
      { id: 'LF-9104', title: 'Black Wallet', img: '💳', similarity: 0.12, tags: ['leather', 'money'] },
      { id: 'LF-3342', title: 'Cyan iPhone Shell', img: '📱', similarity: 0.86, tags: ['electronics', 'light blue', 'apple'] },
      { id: 'LF-7761', title: 'Keys on Lanyard', img: '🔑', similarity: 0.05, tags: ['metal', 'red strap'] },
      { id: 'LF-1123', title: 'Indigo Phone Protector', img: '📱', similarity: 0.91, tags: ['electronics', 'purple-blue', 'case'] }
  ];

  const handleSearch = (e) => {
      e.preventDefault();
      if (!searchQuery.trim() || isSearching) return;
      
      setIsSearching(true);
      setResults([]);
      addLog('ACTION', `User searched for: "${searchQuery}"`);
      addLog('SYS', 'Calling LLM API to generate 1536-dimensional vector embedding for search query...');
      
      setTimeout(() => {
          addLog('SYS', 'Executing Cosine Similarity Vector Search against Pinecone index...');
          
          setTimeout(() => {
              // Simulate semantic matching - if query has 'blue' or 'phone' or 'case', return the right items
              const q = searchQuery.toLowerCase();
              let matched = [];
              
              if (q.includes('blue') || q.includes('phone') || q.includes('case')) {
                  matched = databaseItems
                      .filter(item => item.similarity > 0.8)
                      .sort((a, b) => b.similarity - a.similarity);
              } else {
                  // Random fuzzy match just for simulation
                  matched = [databaseItems[1], databaseItems[3]];
              }
              
              setResults(matched);
              setIsSearching(false);
              addLog('SUCCESS', `Returned ${matched.length} semantically relevant items. Exact keyword match was NOT required.`);
          }, 1500);
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070512] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> AI & Natural Language Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Semantic Search <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-500">Vector Database</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees lose items constantly, but finding a lost "blue phone case" fails if the staff member logged it as a "navy mobile cover" using traditional exact-match SQL queries. Eventra solves this with an AI-powered semantic search engine. The backend uses a Large Language Model (LLM) to generate vector embeddings of descriptions. When a user searches, the system uses cosine similarity to return conceptually matching items, even if the keywords don't match.
          </p>

          <div className="bg-[#0b0a17] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Attendee Search UI
               </h3>
             </div>

             <div className="flex-1 flex flex-col justify-center mb-6">
                 
                 <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <span className="text-slate-500 text-xl">🔍</span>
                     </div>
                     <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="e.g. 'I lost my blue phone case near the main stage'"
                         className="w-full bg-[#111827] border-2 border-slate-700 text-white rounded-2xl pl-12 pr-24 py-4 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
                     />
                     <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                         <button 
                             type="submit"
                             disabled={isSearching || !searchQuery.trim()}
                             className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                             {isSearching ? '...' : 'Search'}
                         </button>
                     </div>
                 </form>
                 
                 <div className="mt-6 text-center text-[10px] text-slate-500 uppercase tracking-widest">
                     Try searching for <span className="text-indigo-400 cursor-pointer" onClick={() => setSearchQuery('blue phone case')}>"blue phone case"</span>
                 </div>
                 
             </div>
             
             {/* System Log */}
             <div className="h-32 bg-[#050308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Vector Engine Logs</span>
                 {isSearching && <span className="text-indigo-400 font-black animate-pulse">EMBEDDING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-purple-300 font-bold' : 'text-slate-400'
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
            
            {/* Vector DB Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Vector Database Visualizer</span>
                      <span className="text-xs text-white font-bold">Cosine Similarity Matches</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {!isSearching && results.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                          <div className="text-6xl mb-4 grayscale">🗄️</div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center">
                              Awaiting Semantic Query
                          </span>
                      </div>
                  )}

                  {isSearching && (
                      <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="relative w-32 h-32 mb-6">
                              {/* Vector Embedding Animation */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:10px_10px] animate-[pulse_1s_infinite]"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                              <div className="absolute top-0 right-0 text-[8px] font-mono text-indigo-300 bg-slate-900 px-1 rounded shadow-lg">[0.12, -0.45, 0.88...]</div>
                              <div className="absolute bottom-0 left-0 text-[8px] font-mono text-indigo-300 bg-slate-900 px-1 rounded shadow-lg">[-0.91, 0.33, 0.11...]</div>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest animate-pulse">Calculating Cosine Distance...</span>
                      </div>
                  )}

                  {!isSearching && results.length > 0 && (
                      <div className="flex-1 flex flex-col animate-fade-in-up">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                              Top Semantic Matches
                          </div>
                          
                          <div className="space-y-4 overflow-y-auto pr-2 pb-4">
                              {results.map((item, index) => (
                                  <div key={item.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center relative overflow-hidden group">
                                      
                                      {/* Similarity Score Background Bar */}
                                      <div className="absolute top-0 left-0 bottom-0 bg-indigo-900/20 z-0 transition-all duration-1000" style={{ width: `${item.similarity * 100}%` }}></div>
                                      
                                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-3xl mr-4 z-10 shadow-md">
                                          {item.img}
                                      </div>
                                      
                                      <div className="flex flex-col flex-1 z-10">
                                          <span className="text-white font-bold text-sm mb-1">{item.title}</span>
                                          <div className="flex flex-wrap gap-1">
                                              {item.tags.map((tag, i) => (
                                                  <span key={i} className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                                      {tag}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                      
                                      <div className="flex flex-col items-end justify-center z-10 ml-2">
                                          <span className="text-[8px] uppercase font-bold text-slate-500 mb-1">Match</span>
                                          <span className={`text-lg font-black font-mono ${index === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                              {(item.similarity * 100).toFixed(1)}%
                                          </span>
                                      </div>
                                      
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0a17] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Semantic NLP Matching:</span>
               Click the <span className="text-indigo-400 cursor-pointer hover:underline font-bold">"blue phone case"</span> hint text and click <span className="text-white font-bold bg-indigo-600 px-1 rounded">Search</span>. Notice that the exact phrase "blue phone case" does not exist in the database. A traditional SQL database would return 0 results. However, the AI generates a vector embedding for the search query and compares it mathematically to the items in the Vector Database, successfully determining that a "Navy Mobile Cover" is a 94.0% conceptual match.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SemanticLostAndFound;
