/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ServerlessEdgeSchedule = () => {
  const [architecture, setArchitecture] = useState('MONOLITH'); // MONOLITH or EDGE
  const [activeRequests, setActiveRequests] = useState([]);
  const [dbLoad, setDbLoad] = useState(15);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'System initialized. Legacy Postgres DB deployed in us-east-1.' }
  ]);

  const nodes = {
      'us-east': { x: 25, y: 35, label: 'US-East (Origin)' },
      'eu-west': { x: 50, y: 25, label: 'Frankfurt (Edge)' },
      'ap-south': { x: 75, y: 45, label: 'Singapore (Edge)' },
      'sa-east': { x: 35, y: 70, label: 'São Paulo (Edge)' }
  };

  const users = [
      { id: 'u1', loc: { x: 20, y: 40 }, region: 'NA' },
      { id: 'u2', loc: { x: 48, y: 28 }, region: 'EU' },
      { id: 'u3', loc: { x: 80, y: 40 }, region: 'AP' },
      { id: 'u4', loc: { x: 55, y: 20 }, region: 'EU' },
      { id: 'u5', loc: { x: 38, y: 75 }, region: 'SA' }
  ];

  useEffect(() => {
      let interval;
      
      interval = setInterval(() => {
          // Simulate a burst of requests for the schedule
          if (Math.random() > 0.4) {
              const randomUser = users[Math.floor(Math.random() * users.length)];
              const reqId = Date.now() + Math.random();
              
              let targetNode;
              let latency;
              let path;
              
              if (architecture === 'MONOLITH') {
                  // Everyone routes to us-east
                  targetNode = nodes['us-east'];
                  // Calculate distance-based latency roughly
                  const dist = Math.sqrt(Math.pow(randomUser.loc.x - targetNode.x, 2) + Math.pow(randomUser.loc.y - targetNode.y, 2));
                  latency = Math.floor(dist * 8 + 40); // high latency for distant users
                  setDbLoad(prev => Math.min(100, prev + 15));
              } else {
                  // Edge computing - route to nearest
                  if (randomUser.region === 'NA') targetNode = nodes['us-east'];
                  else if (randomUser.region === 'EU') targetNode = nodes['eu-west'];
                  else if (randomUser.region === 'AP') targetNode = nodes['ap-south'];
                  else targetNode = nodes['sa-east'];
                  
                  latency = Math.floor(Math.random() * 15 + 5); // 5-20ms instant cache hit
                  setDbLoad(prev => Math.max(5, prev - 5)); // Origin DB rests
              }

              const newReq = {
                  id: reqId,
                  user: randomUser,
                  target: targetNode,
                  latency: latency
              };

              setActiveRequests(prev => [...prev, newReq]);
              
              // Remove request after visual animation
              setTimeout(() => {
                  setActiveRequests(prev => prev.filter(r => r.id !== reqId));
              }, 1000);
          } else {
              // Cool down DB
              setDbLoad(prev => Math.max(5, prev - 10));
          }

      }, 800);

      return () => clearInterval(interval);
  }, [architecture]);

  // Log architecture changes
  useEffect(() => {
      if (architecture === 'EDGE') {
          addLog('ACTION', 'Deploying V8 Isolates to Global Edge Network (Cloudflare Workers).');
          setTimeout(() => addLog('SUCCESS', 'Schedule JSON cached at 250+ edge nodes globally. Origin DB shielded.'), 1000);
      } else {
          addLog('WARN', 'Traffic routed back to centralized Postgres monolith in us-east-1.');
      }
  }, [architecture]);

  // Log high load
  useEffect(() => {
      if (dbLoad > 85 && architecture === 'MONOLITH') {
          addLog('CRIT', 'Postgres Connection Pool Exhausted. Schedule API timing out (503 Service Unavailable).');
      }
  }, [dbLoad, architecture]);

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060a0f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> DevOps & Edge Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Serverless Edge Computing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-400">Schedule API</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the schedule changes, 50,000 concurrent attendees instantly refresh the app. Hitting a centralized database in us-east-1 from a festival in Europe causes massive cross-ocean latency, connection pool exhaustion, and app timeouts. Eventra solves this by re-architecting the API using Serverless Edge computing. The static schedule JSON is pushed to edge nodes globally. Requests are served instantly from the user's nearest geographic POP with zero database spin-up time.
          </p>

          <div className="bg-[#0a121a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Global Routing Config
               </h3>
               
               <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                 <button 
                     onClick={() => setArchitecture('MONOLITH')}
                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                       architecture === 'MONOLITH' ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(217,119,6,0.4)]' :
                       'text-slate-500 hover:text-slate-400 hover:bg-slate-800'
                     }`}
                 >
                     Legacy Monolith
                 </button>
                 <button 
                     onClick={() => setArchitecture('EDGE')}
                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                       architecture === 'EDGE' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' :
                       'text-slate-500 hover:text-slate-400 hover:bg-slate-800'
                     }`}
                 >
                     Serverless Edge
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Origin DB Load */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-colors ${
                   dbLoad > 85 ? 'bg-rose-950/40 border-rose-900' : 'bg-slate-900 border-slate-800'
               }`}>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 block border-b border-slate-800 pb-2">
                       Origin DB CPU Load (us-east-1)
                   </span>
                   <div className="flex items-end z-10">
                       <span className={`text-4xl font-black font-mono leading-none ${dbLoad > 85 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                           {dbLoad}%
                       </span>
                   </div>
                   <div className="absolute bottom-0 left-0 w-full bg-slate-800/50 h-2">
                       <div className={`h-full transition-all duration-300 ${dbLoad > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${dbLoad}%`}}></div>
                   </div>
               </div>

               {/* Latency Metrics */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center text-[9px] font-mono text-slate-400 relative overflow-hidden">
                   <span className="text-slate-500 font-bold uppercase tracking-widest mb-2 block border-b border-slate-800 pb-2">
                       Avg Global Latency
                   </span>
                   <div className="flex items-end z-10">
                       <span className={`text-4xl font-black font-mono leading-none ${architecture === 'MONOLITH' ? 'text-amber-500' : 'text-blue-400'}`}>
                           {architecture === 'MONOLITH' ? '385' : '14'}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-2 pb-1 uppercase">ms</span>
                   </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>DNS Routing Logs</span>
                 <span className={architecture === 'EDGE' ? 'text-blue-400 animate-pulse' : 'text-amber-500'}>
                     {architecture === 'EDGE' ? 'EDGE ACTIVE' : 'MONOLITH ACTIVE'}
                 </span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1 rounded-sm' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-400' : 'text-slate-400'
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
            
            {/* Global Topology Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Global Network Topology</span>
                      <span className="text-xs text-white font-bold">API Traffic Routing</span>
                  </div>
              </div>

              <div className="flex-1 bg-[#09111c] p-4 flex flex-col relative overflow-hidden">
                  
                  {/* Faux World Map Background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIj48ZyBmaWxsPSIjM2I4MmY2IiBvcGFjaXR5PSIwLjMiPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMjAiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIxMDAiIHI9IjMwIi8+PGNpcmNsZSBjeD0iNjAwIiBjeT0iMTUwIiByPSIyNSIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjMwMCIgcj0iMTUiLz48L2c+PC9zdmc+')] bg-cover bg-no-repeat opacity-20"></div>

                  {/* Draw Nodes */}
                  {Object.entries(nodes).map(([key, node]) => (
                      <div 
                          key={key} 
                          className="absolute flex flex-col items-center"
                          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                          <div className={`w-4 h-4 rounded-full border-2 z-20 shadow-[0_0_15px_currentColor] flex items-center justify-center ${
                              key === 'us-east' ? 'bg-amber-900 border-amber-500 text-amber-500' : 
                              (architecture === 'EDGE' ? 'bg-blue-900 border-blue-500 text-blue-500' : 'bg-slate-800 border-slate-600 text-slate-600 opacity-30')
                          }`}>
                              {key === 'us-east' && <div className={`w-1 h-1 bg-amber-200 rounded-full ${dbLoad > 85 ? 'animate-ping' : ''}`}></div>}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest mt-1 whitespace-nowrap bg-slate-900/80 px-1 rounded ${key === 'us-east' ? 'text-amber-400' : (architecture === 'EDGE' ? 'text-blue-400' : 'text-slate-600 opacity-30')}`}>
                              {node.label}
                          </span>
                      </div>
                  ))}

                  {/* Draw Users and Request Lines */}
                  {users.map(user => (
                      <div 
                          key={user.id} 
                          className="absolute w-2 h-2 bg-slate-400 rounded-full z-10"
                          style={{ left: `${user.loc.x}%`, top: `${user.loc.y}%`, transform: 'translate(-50%, -50%)' }}
                      ></div>
                  ))}

                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {activeRequests.map(req => (
                          <g key={req.id}>
                              <line 
                                  x1={`${req.user.loc.x}%`} 
                                  y1={`${req.user.loc.y}%`} 
                                  x2={`${req.target.x}%`} 
                                  y2={`${req.target.y}%`} 
                                  stroke={architecture === 'MONOLITH' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(59, 130, 246, 0.6)'} 
                                  strokeWidth="2"
                                  strokeDasharray="4"
                                  className="animate-pulse"
                              />
                              {/* Latency Popup near the user */}
                              <text 
                                  x={`${(req.user.loc.x + req.target.x) / 2}%`} 
                                  y={`${(req.user.loc.y + req.target.y) / 2}%`} 
                                  fill={architecture === 'MONOLITH' ? '#f59e0b' : '#3b82f6'} 
                                  fontSize="10"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                              >
                                  {req.latency}ms
                              </text>
                          </g>
                      ))}
                  </svg>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a121a] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">High Availability Architecture:</span>
               In <span className="text-amber-500 font-bold">Legacy Monolith</span> mode, European and Asian traffic is forced across the ocean to the US origin DB, causing 400ms lag and overloading the DB CPU until it crashes. Click <span className="text-white font-bold bg-blue-600 px-1 rounded">Serverless Edge</span>. The backend pushes static JSON to global V8 isolates. The origin DB rests, and users instantly download the schedule from their local POP in 12ms.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ServerlessEdgeSchedule;
