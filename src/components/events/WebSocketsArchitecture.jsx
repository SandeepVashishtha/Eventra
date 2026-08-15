/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebSocketsArchitecture = () => {
  const [isSpiking, setIsSpiking] = useState(false);
  const [connections, setConnections] = useState(1205);
  const [cpuLoad, setCpuLoad] = useState(12);
  const [latency, setLatency] = useState(42);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Elixir/OTP WebSocket cluster online. Awaiting TCP connections.' }
  ]);

  useEffect(() => {
      let interval;
      if (isSpiking) {
          // Rapidly increase connections to simulate a spike
          interval = setInterval(() => {
              setConnections(prev => {
                  if (prev >= 105432) {
                      clearInterval(interval);
                      return 105432;
                  }
                  return prev + Math.floor(Math.random() * 8000) + 2000;
              });
              setCpuLoad(prev => Math.min(prev + 2, 68)); // Erlang is efficient, CPU only hits ~68%
              setLatency(prev => Math.min(prev + 5, 112)); // Latency stays sub-second
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isSpiking]);

  const triggerSpike = () => {
      if (isSpiking) return;
      setIsSpiking(true);
      
      addLog('CRIT', 'THUNDERING HERD: Headliner announced via Push Notification.');
      addLog('WARN', 'Massive inbound traffic spike detected. 100,000+ users opening Global Chat...');
      
      setTimeout(() => {
          addLog('SYS', 'Load Balancer multiplexing TCP connections across Erlang Worker Nodes...');
          
          setTimeout(() => {
              addLog('SUCCESS', '100k Concurrent WebSockets established. Zero dropped packets.');
              addLog('ACTION', 'System stabilized. Sub-second latency maintained across cluster.');
          }, 2000);
      }, 500);
  };
  
  const resetDemo = () => {
      setIsSpiking(false);
      setConnections(1205);
      setCpuLoad(12);
      setLatency(42);
      addLog('SYS', 'Traffic normalized. Connections closed.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02070a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> DevOps & Distributed Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            High-Concurrency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">WebSockets Visualizer</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the headliner is announced, 100,000 concurrent users open the app's global chat room. Traditional HTTP polling instantly crashes the server under the "thundering herd" problem, creating a self-inflicted DDoS attack. Eventra solves this using a highly scalable WebSockets architecture (similar to Erlang/Elixir OTP). Thousands of persistent TCP connections are multiplexed and load-balanced across worker nodes, handling massive spikes with sub-second latency and zero dropped packets.
          </p>

          <div className="bg-[#050c12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Traffic Simulator Controls
               </h3>
               {connections > 100000 && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="grid grid-cols-3 gap-3 mb-6">
                 
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-1">Active TCP Sockets</span>
                     <span className={`text-2xl font-black font-mono transition-colors ${connections > 50000 ? 'text-fuchsia-400' : 'text-cyan-400'}`}>
                         {connections.toLocaleString()}
                     </span>
                 </div>

                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-1">Cluster CPU Load</span>
                     <span className={`text-2xl font-black font-mono ${cpuLoad > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                         {cpuLoad}%
                     </span>
                 </div>

                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-1">P99 Latency</span>
                     <span className="text-2xl font-black font-mono text-emerald-400">
                         {latency}ms
                     </span>
                 </div>

             </div>

             <div className="flex justify-center mb-6">
                 <button 
                     onClick={triggerSpike}
                     disabled={isSpiking || connections > 100000}
                     className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg ${
                         connections > 100000 ? 'bg-slate-800 text-slate-500 border border-slate-700' : 
                         isSpiking ? 'bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500 cursor-not-allowed' :
                         'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                     }`}
                 >
                     {isSpiking && connections < 100000 ? 'Multiplexing Sockets...' : connections >= 100000 ? 'Cluster Stabilized' : 'Trigger Thundering Herd (100k Spike)'}
                 </button>
             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#020508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Load Balancer Logs</span>
                 {isSpiking && connections < 100000 && <span className="text-fuchsia-400 font-black animate-pulse">SCALING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
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
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Distributed Topology Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Live Traffic Topology</span>
                      <span className="text-xs text-white font-bold">WebSockets Cluster</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Incoming Traffic Cloud */}
                  <div className="relative w-full h-24 flex items-center justify-center mb-8">
                      <div className="text-5xl z-10">☁️</div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {/* Render connection particles based on load */}
                          {Array.from({ length: isSpiking ? 40 : 10 }).map((_, i) => (
                              <div 
                                  key={i} 
                                  className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
                                  style={{
                                      left: `${40 + Math.random() * 20}%`,
                                      top: '80%',
                                      animation: `fall ${isSpiking ? 0.3 + Math.random() * 0.2 : 1 + Math.random()}s linear infinite`
                                  }}
                              ></div>
                          ))}
                      </div>
                      <span className="absolute -right-4 top-0 bg-slate-800 text-[9px] font-mono font-bold px-2 py-1 rounded border border-slate-700">
                          {connections.toLocaleString()} Users
                      </span>
                  </div>

                  {/* Load Balancer */}
                  <div className={`w-32 py-2 rounded-lg border-2 text-center z-20 mb-12 transition-colors ${
                      isSpiking ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]' : 'bg-slate-800 border-slate-600'
                  }`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">Load Balancer</span>
                      {isSpiking && <span className="block text-[8px] text-fuchsia-400 font-mono animate-pulse">Multiplexing...</span>}
                  </div>

                  {/* Connection Lines to Workers */}
                  <div className="absolute top-44 left-1/2 w-full flex justify-between px-10 z-10 pointer-events-none">
                      <svg width="100%" height="100" className="absolute left-0 -translate-x-1/4">
                          <path d="M 200 0 C 120 50, 80 50, 40 100" fill="none" stroke={isSpiking ? '#d946ef' : '#334155'} strokeWidth="2" strokeDasharray={isSpiking ? '4,4' : '0'} className={isSpiking ? 'animate-[dash_0.5s_linear_infinite]' : ''} />
                      </svg>
                      <svg width="100%" height="100" className="absolute left-0">
                          <path d="M 200 0 C 200 50, 200 50, 200 100" fill="none" stroke={isSpiking ? '#d946ef' : '#334155'} strokeWidth="2" strokeDasharray={isSpiking ? '4,4' : '0'} className={isSpiking ? 'animate-[dash_0.5s_linear_infinite]' : ''} />
                      </svg>
                      <svg width="100%" height="100" className="absolute right-0 translate-x-1/4">
                          <path d="M 50 0 C 130 50, 170 50, 210 100" fill="none" stroke={isSpiking ? '#d946ef' : '#334155'} strokeWidth="2" strokeDasharray={isSpiking ? '4,4' : '0'} className={isSpiking ? 'animate-[dash_0.5s_linear_infinite]' : ''} />
                      </svg>
                  </div>

                  {/* Worker Nodes */}
                  <div className="w-full flex justify-between mt-auto z-20 px-2 pb-6">
                      
                      {[1, 2, 3].map(node => (
                          <div key={node} className={`flex flex-col items-center w-24 relative transition-all duration-500`}>
                              <div className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center text-3xl mb-2 relative overflow-hidden ${
                                  isSpiking ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-slate-700'
                              }`}>
                                  {/* CPU visualizer inside node */}
                                  <div className="absolute bottom-0 left-0 w-full bg-cyan-900/30 transition-all duration-300" style={{ height: `${isSpiking ? 68 + (Math.random()*10 - 5) : 12}%` }}></div>
                                  <span className="relative z-10">🖥️</span>
                              </div>
                              <span className="text-[9px] font-black text-white uppercase tracking-widest">Node 0{node}</span>
                              <span className="text-[8px] text-slate-500 font-mono mt-1">{(connections/3).toFixed(0)} sockets</span>
                          </div>
                      ))}

                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050c12] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Stateful WebSocket Architecture:</span>
               Click <span className="text-white font-bold bg-cyan-600 px-1 rounded">Trigger Thundering Herd</span>. A push notification sends 100,000 users into the app simultaneously. Traditional HTTP REST polling (asking the server "any new messages?" every 5 seconds) would generate 20,000 requests per second and instantly crash the database. Instead, Eventra uses a lightweight WebSockets cluster (Erlang/Elixir). The load balancer multiplexes 100k persistent, stateful TCP connections across 3 worker nodes. The CPU maxes out at a stable 68%, maintaining sub-second latency and zero downtime.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
        @keyframes fall {
          to {
            transform: translateY(150px);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
};

export default WebSocketsArchitecture;
