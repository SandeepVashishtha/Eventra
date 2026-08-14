/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const ServerSentEventsDelay = () => {
  const [isSseEnabled, setIsSseEnabled] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  
  const [reqCount, setReqCount] = useState(0);
  const [dbLoad, setDbLoad] = useState(5);
  const [serverStatus, setServerStatus] = useState('STABLE'); // STABLE, STRAINED, CRASHED
  
  const [setTime, setSetTime] = useState("21:00");
  const [clientSetTime, setClientSetTime] = useState("21:00");
  
  const reqIntervalRef = useRef(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:30:00', type: 'SYS', msg: 'Festival gateway online. 100,000 active client devices connected.' }
  ]);

  // Background polling simulation
  useEffect(() => {
      if (serverStatus === 'CRASHED' || simulationComplete) {
          if (reqIntervalRef.current) clearInterval(reqIntervalRef.current);
          return;
      }

      if (!isSseEnabled) {
          // HTTP Polling: Massively increase requests per second
          reqIntervalRef.current = setInterval(() => {
              setReqCount(prev => prev + Math.floor(Math.random() * 5000 + 2000));
              setDbLoad(prev => Math.min(prev + 2, 95));
              
              if (dbLoad > 85 && serverStatus !== 'STRAINED') {
                  setServerStatus('STRAINED');
                  addLog('WARN', 'High Database CPU usage detected due to excessive HTTP polling.');
              }
          }, 1000);
      } else {
          // SSE: Persistent connection, minimal requests
          if (reqIntervalRef.current) clearInterval(reqIntervalRef.current);
          setDbLoad(2);
          setServerStatus('STABLE');
      }

      return () => {
          if (reqIntervalRef.current) clearInterval(reqIntervalRef.current);
      };
  }, [isSseEnabled, serverStatus, simulationComplete, dbLoad]);

  const broadcastDelay = () => {
      setIsSimulating(true);
      setSimulationComplete(false);
      addLog('ACTION', 'Stage Manager: Broadcasting 30-minute delay for Main Stage headliner...');
      
      setTimeout(() => {
          setSetTime("21:30");
          
          if (isSseEnabled) {
              addLog('SYS', 'Server pushing update payload via established SSE streams...');
              
              setTimeout(() => {
                  setClientSetTime("21:30");
                  setIsSimulating(false);
                  setSimulationComplete(true);
                  addLog('SUCCESS', 'Pushed update to 100,000 clients instantly. Zero database overhead.');
              }, 800);
              
          } else {
              // Simulating DDOS from pull-to-refresh
              addLog('CRIT', 'Users notice delay. 100,000 clients initiate simultaneous Pull-to-Refresh HTTP GETs.');
              
              setReqCount(prev => prev + 100000);
              setDbLoad(100);
              setServerStatus('CRASHED');
              
              setTimeout(() => {
                  setIsSimulating(false);
                  setSimulationComplete(true);
                  addLog('CRIT', 'Database Connection Pool Exhausted. System DDOS\'d. Outage Occurred.');
              }, 1200);
          }
      }, 1000);
  };

  const toggleSSE = () => {
      const newState = !isSseEnabled;
      setIsSseEnabled(newState);
      setIsSimulating(false);
      setSimulationComplete(false);
      setReqCount(0);
      setDbLoad(5);
      setServerStatus('STABLE');
      setSetTime("21:00");
      setClientSetTime("21:00");
      
      if (reqIntervalRef.current) clearInterval(reqIntervalRef.current);
      
      if (newState) {
          addLog('SUCCESS', 'Server-Sent Events (SSE) enabled. Clients establishing long-lived unidirectional streams.');
      } else {
          addLog('CRIT', 'HTTP REST enabled. Clients reverting to short-lived pull polling loops.');
      }
  };
  
  const resetSystem = () => {
      setIsSimulating(false);
      setSimulationComplete(false);
      setReqCount(0);
      setDbLoad(5);
      setServerStatus('STABLE');
      setSetTime("21:00");
      setClientSetTime("21:00");
      addLog('SYS', 'System rebooted. Baseline traffic restored.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Real-Time APIs & Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Server-Sent Events (SSE) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Real-Time Data Streaming</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a headliner is delayed by 30 minutes, 100,000 users constantly hit "pull-to-refresh" on the schedule page to check for updates. This traditional HTTP polling creates a massive self-inflicted DDoS load that routinely crashes the backend database. Eventra solves this by replacing HTTP polling with Server-Sent Events (SSE). The frontend establishes a persistent, unidirectional connection to the server. When the stage manager updates the set time, the backend pushes the update instantly to all 100,000 clients simultaneously with minimal overhead.
          </p>

          <div className="bg-[#050b14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Network Protocol Config
               </h3>
               {(simulationComplete || serverStatus === 'CRASHED') && (
                   <button onClick={resetSystem} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reboot Server</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* SSE Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Data Transmission Protocol</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isSseEnabled ? 'Active: SSE text/event-stream (Push)' : 'Inactive: Legacy HTTP REST (Pull Polling)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleSSE}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isSseEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isSseEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={broadcastDelay}
                     disabled={isSimulating || simulationComplete || serverStatus === 'CRASHED'}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center ${
                         serverStatus === 'CRASHED' ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         simulationComplete ? 'bg-slate-800 text-cyan-500 border-cyan-900 cursor-not-allowed' :
                         isSimulating ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                     }`}
                 >
                     {isSimulating ? (
                         <span className="animate-pulse">Broadcasting Update...</span>
                     ) : serverStatus === 'CRASHED' ? (
                         'Server Offline'
                     ) : simulationComplete ? (
                         'Broadcast Complete'
                     ) : (
                         <>Broadcast 30-Min Stage Delay 📢</>
                     )}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>API Gateway Logs</span>
                 {isSimulating && <span className="text-cyan-400 font-black animate-pulse">TRANSMITTING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Network Topology Visualizer</span>
                      <span className="text-xs text-white font-bold">100,000 Concurrent Clients</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Top: API Backend */}
                  <div className="w-full flex flex-col items-center z-20">
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          serverStatus === 'CRASHED' ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-950/40' : 
                          serverStatus === 'STRAINED' ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-950/30' : 
                          'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">🗄️</span> Eventra Main API DB
                              </span>
                              
                              {/* DB Load Meter */}
                              <div className="flex items-center">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-500 mr-2">Load</span>
                                  <span className={`text-xs font-mono font-bold ${
                                      dbLoad > 85 ? 'text-rose-500' : dbLoad > 50 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>{dbLoad}%</span>
                              </div>
                          </div>

                          <div className="flex justify-between items-center mt-3">
                              <div className="flex flex-col">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-500">Requests Processed</span>
                                  <span className="text-lg font-mono font-black text-cyan-400">{reqCount.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-500">Headliner Time (Source)</span>
                                  <span className="text-lg font-mono font-black text-white">{setTime}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Connection Pipes */}
                  <div className="flex-1 relative flex justify-center items-center py-4 z-10 w-full">
                      
                      {isSseEnabled ? (
                          // SSE: One thick persistent pipe per abstract group
                          <div className="w-full h-full flex justify-around">
                              <div className="w-1 h-full bg-cyan-900/50 relative overflow-hidden">
                                  {isSimulating && <div className="w-full h-8 bg-cyan-400 absolute top-0 shadow-[0_0_15px_cyan] animate-[drop_0.8s_linear_forwards]"></div>}
                              </div>
                              <div className="w-1 h-full bg-cyan-900/50 relative overflow-hidden">
                                  {isSimulating && <div className="w-full h-8 bg-cyan-400 absolute top-0 shadow-[0_0_15px_cyan] animate-[drop_0.8s_linear_forwards] [animation-delay:0.1s]"></div>}
                              </div>
                              <div className="w-1 h-full bg-cyan-900/50 relative overflow-hidden">
                                  {isSimulating && <div className="w-full h-8 bg-cyan-400 absolute top-0 shadow-[0_0_15px_cyan] animate-[drop_0.8s_linear_forwards] [animation-delay:0.2s]"></div>}
                              </div>
                          </div>
                      ) : (
                          // HTTP Polling: Chaotic upwards arrows
                          <div className="w-full h-full relative">
                              {!simulationComplete && (
                                  <>
                                      <div className="absolute left-1/4 bottom-0 w-0.5 h-10 bg-slate-600 animate-[rise_1s_linear_infinite]"></div>
                                      <div className="absolute left-1/2 bottom-0 w-0.5 h-10 bg-slate-600 animate-[rise_0.8s_linear_infinite] [animation-delay:0.3s]"></div>
                                      <div className="absolute right-1/4 bottom-0 w-0.5 h-10 bg-slate-600 animate-[rise_1.2s_linear_infinite] [animation-delay:0.5s]"></div>
                                  </>
                              )}
                              {isSimulating && (
                                  // Massive DDOS spike
                                  <div className="absolute inset-x-0 bottom-0 flex justify-around opacity-50">
                                      {Array(10).fill(0).map((_, i) => (
                                          <div key={i} className="w-1 h-32 bg-rose-500 animate-[rise_0.4s_linear_infinite]" style={{animationDelay: `${Math.random() * 0.5}s`}}></div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}
                      
                      {/* Connection Label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-400 z-20">
                              {isSseEnabled ? 'Persistent SSE Stream (TCP)' : 'Short-Lived HTTP GETs'}
                          </span>
                      </div>
                  </div>

                  {/* Bottom: Client Devices */}
                  <div className="w-full flex justify-between z-20">
                      
                      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 flex flex-col items-center w-[30%]">
                          <span className="text-xl mb-1">📱</span>
                          <span className="text-[10px] font-mono font-bold text-white mb-2">{clientSetTime}</span>
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Client Node</span>
                      </div>
                      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 flex flex-col items-center w-[30%]">
                          <span className="text-xl mb-1">📱</span>
                          <span className="text-[10px] font-mono font-bold text-white mb-2">{clientSetTime}</span>
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Client Node</span>
                      </div>
                      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 flex flex-col items-center w-[30%] relative">
                          <span className="text-xl mb-1">📱</span>
                          <span className="text-[10px] font-mono font-bold text-white mb-2">{clientSetTime}</span>
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Client Node</span>
                          
                          <div className="absolute -top-3 -right-3 text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-1 rounded-full whitespace-nowrap">
                              +99,997 more
                          </div>
                      </div>

                  </div>

                  {/* Crash Overlay */}
                  {serverStatus === 'CRASHED' && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30 animate-fade-in-up rounded-[1.5rem]">
                          <span className="text-5xl mb-3">🔥</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">Self-Inflicted DDoS<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">Pull-to-Refresh crushed the DB</span></span>
                      </div>
                  )}

                  {/* Success Overlay */}
                  {simulationComplete && isSseEnabled && (
                      <div className="absolute inset-0 bg-cyan-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30 animate-fade-in-up rounded-[1.5rem]">
                          <span className="text-5xl mb-3">🚀</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">Real-Time Sync Achieved<br/><span className="text-[10px] font-normal text-cyan-200 mt-1 block">100k clients updated instantly with zero overhead</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050b14] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Solving the Pull-to-Refresh DDoS:</span>
               With SSE disabled, wait a few seconds. Notice the request count ticking up as clients constantly poll the API. Click <span className="text-white font-bold bg-slate-800 px-1 rounded">Broadcast Delay</span>. Users notice the delay and desperately pull-to-refresh simultaneously, spiking requests by 100,000 instantly and melting the database.<br/><br/>Toggle <span className="text-cyan-400 font-bold bg-slate-800 px-1 rounded">Data Protocol</span> to SSE. The client establishes a single, quiet connection. The API load drops to near zero. Click Broadcast. The server pushes the update down the open pipe. 100,000 clients sync instantly without making a single HTTP GET request.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drop {
          0% { top: 0; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes rise {
          0% { bottom: 0; opacity: 1; transform: translateY(0); }
          100% { bottom: 100%; opacity: 0; transform: translateY(-50px); }
        }
      `}} />
    </div>
  );
};

export default ServerSentEventsDelay;
