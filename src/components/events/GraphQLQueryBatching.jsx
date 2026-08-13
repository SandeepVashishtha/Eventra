/* eslint-disable */
import React, { useState } from 'react';

const GraphQLQueryBatching = () => {
  const [architecture, setArchitecture] = useState('REST'); // 'REST' or 'GRAPHQL'
  const [isFetching, setIsFetching] = useState(false);
  
  const [networkLogs, setNetworkLogs] = useState([]);
  
  // Stats
  const [totalPayload, setTotalPayload] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  const simulateFetch = (mode) => {
      setArchitecture(mode);
      setIsFetching(true);
      setNetworkLogs([]);
      setTotalPayload(0);
      setTotalRequests(0);

      if (mode === 'REST') {
          // Simulate 15 separate REST calls
          const endpoints = [
              { method: 'GET', url: '/api/v1/users/me', size: 12.4, delay: 100 },
              { method: 'GET', url: '/api/v1/users/me/preferences', size: 4.2, delay: 250 },
              { method: 'GET', url: '/api/v1/events/current/schedule', size: 45.8, delay: 400 },
              { method: 'GET', url: '/api/v1/events/current/weather', size: 2.1, delay: 450 },
              { method: 'GET', url: '/api/v1/friends/online', size: 18.5, delay: 600 },
              { method: 'GET', url: '/api/v1/merch/featured', size: 35.2, delay: 650 },
              { method: 'GET', url: '/api/v1/notifications/unread', size: 8.9, delay: 800 },
              { method: 'GET', url: '/api/v1/rfid/balance', size: 1.5, delay: 900 }
          ];

          endpoints.forEach((ep, i) => {
              setTimeout(() => {
                  setNetworkLogs(prev => [...prev, { ...ep, id: Math.random() }]);
                  setTotalPayload(prev => prev + ep.size);
                  setTotalRequests(prev => prev + 1);
                  
                  if (i === endpoints.length - 1) {
                      setTimeout(() => setIsFetching(false), 200);
                  }
              }, ep.delay);
          });
      } else {
          // Simulate 1 Batched GraphQL call
          setTimeout(() => {
              const gqlPayload = {
                  method: 'POST', 
                  url: '/graphql (Batched Query)', 
                  size: 24.3, // 80% smaller by only fetching required fields
                  delay: 300,
                  query: `query LoadHomepage {
  me { id name preferences { theme } }
  schedule { id artist time }
  weather { temp condition }
  friends(status: ONLINE) { id name avatar }
  merch(featured: true) { id price }
  notifications(unread: true) { count }
  rfid { balance }
}`
              };
              
              setNetworkLogs([gqlPayload]);
              setTotalPayload(gqlPayload.size);
              setTotalRequests(1);
              setIsFetching(false);
          }, 400);
      }
  };

  return (
    <div className="min-h-screen bg-[#100714] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕸️</span> BFF Network Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic GraphQL <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">Query Batching</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The mobile frontend makes 15 separate REST API calls to load the homepage (User Profile, Schedule, Weather, Friends List), draining battery and struggling on congested 3G networks. Eventra solves this by migrating the mobile BFF (Backend-for-Frontend) to GraphQL and implementing dynamic query batching. The Apollo Client automatically bundles the component-level requests into a single HTTP payload. The frontend downloads exactly the data it needs and nothing more, reducing network overhead by 80%.
          </p>

          <div className="bg-[#1a0a1f] rounded-3xl p-6 border border-fuchsia-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-fuchsia-900/30 pb-4">
               <h3 className="text-xs font-bold text-fuchsia-300 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Network Architecture
               </h3>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
                 <button 
                   onClick={() => simulateFetch('REST')}
                   disabled={isFetching}
                   className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex flex-col items-center justify-center ${
                     architecture === 'REST' ? 'bg-slate-800 text-slate-300 border-[3px] border-slate-600' :
                     'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800'
                   } ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                   <span className="text-2xl mb-2">🐢</span>
                   Legacy REST API (Over-fetching)
                 </button>
                 
                 <button 
                   onClick={() => simulateFetch('GRAPHQL')}
                   disabled={isFetching}
                   className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex flex-col items-center justify-center ${
                     architecture === 'GRAPHQL' ? 'bg-fuchsia-900/40 text-fuchsia-300 border-[3px] border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]' :
                     'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800'
                   } ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                   <span className="text-2xl mb-2">🚀</span>
                   GraphQL Apollo Batching
                 </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* HTTP Requests */}
               <div className="p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-[#120616] border-fuchsia-900/20">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total HTTP Requests
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-300 ${architecture === 'GRAPHQL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {totalRequests}
                   </span>
                 </div>
               </div>

               {/* Payload Size */}
               <div className="p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-[#120616] border-fuchsia-900/20">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Payload Transfer
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-300 ${architecture === 'GRAPHQL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {totalPayload.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">KB</span>
                 </div>
               </div>

             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Chrome Network Inspector Simulator */}
            <div className={`w-full bg-[#1e1e1e] rounded-[1rem] border border-[#333] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-[#2d2d2d] border-b border-[#111] p-2 flex justify-between items-center shadow-md z-10">
                  <div className="flex items-center space-x-2">
                      <div className="flex space-x-1.5 ml-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      </div>
                      <span className="text-[10px] text-[#ccc] ml-4 font-bold flex items-center">
                          <span className="mr-1">🔍</span> Network Inspector
                      </span>
                  </div>
                  <span className="text-[10px] text-fuchsia-400 font-mono font-bold px-2">{architecture === 'GRAPHQL' ? 'Apollo Client V3' : 'Axios (Legacy)'}</span>
              </div>

              {/* Table Header */}
              <div className="flex bg-[#252526] text-[#cccccc] text-[9px] font-bold py-1 px-3 border-b border-[#333]">
                  <div className="w-12">Method</div>
                  <div className="flex-1">Name / URL</div>
                  <div className="w-12 text-right">Size</div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#1e1e1e] p-1 space-y-0.5">
                  
                  {networkLogs.length === 0 && !isFetching && (
                      <div className="h-full flex items-center justify-center text-[#555] text-xs font-bold uppercase tracking-widest">
                          Select architecture to capture traffic
                      </div>
                  )}

                  {networkLogs.map((log) => (
                      <div key={log.id} className="flex flex-col bg-[#2d2d2d] rounded-[2px] animate-fade-in-up border-l-2 border-transparent hover:border-fuchsia-500 cursor-pointer group">
                          <div className="flex items-center py-1 px-2">
                              <div className="w-12 text-[9px] font-mono font-bold text-[#4ec9b0]">{log.method}</div>
                              <div className="flex-1 text-[10px] text-[#d4d4d4] truncate pr-2">{log.url}</div>
                              <div className="w-12 text-right text-[10px] font-mono text-[#569cd6]">{log.size.toFixed(1)} kB</div>
                          </div>
                          
                          {/* GraphQL Query Expansion */}
                          {architecture === 'GRAPHQL' && log.query && (
                              <div className="px-2 pb-2 pt-1 border-t border-[#333] mt-1 bg-[#1e1e1e]">
                                  <span className="text-[8px] text-fuchsia-400 font-bold uppercase mb-1 block">Batched Query Payload</span>
                                  <pre className="text-[9px] font-mono text-[#ce9178] leading-tight overflow-x-auto whitespace-pre">
                                      {log.query}
                                  </pre>
                              </div>
                          )}
                      </div>
                  ))}
                  
              </div>
              
              <div className="bg-[#007acc] text-white text-[9px] font-bold p-1 px-3 flex justify-between">
                  <span>{totalRequests} requests</span>
                  <span>{totalPayload.toFixed(1)} kB transferred</span>
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#1a0a1f] p-4 rounded-xl border border-fuchsia-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-fuchsia-400 uppercase block mb-1">Under-Fetching & Over-Fetching Eliminated:</span>
               Instead of making 15 separate handshakes (costing hundreds of milliseconds in overhead), the Apollo Client intelligently batches all React component data requirements into a single HTTP POST, pulling only the explicitly defined fields.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GraphQLQueryBatching;
