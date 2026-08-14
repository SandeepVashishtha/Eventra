/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebSocketMultiplexing = () => {
  const [isWebSocketsEnabled, setIsWebSocketsEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [lineupA, setLineupA] = useState([]);
  const [lineupB, setLineupB] = useState([]);
  const [lineupC, setLineupC] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Lineup collaboration room initialized. 3 users connected.' }
  ]);

  const executeAction = () => {
      setIsSyncing(true);
      setSyncComplete(false);
      setActiveStep(1);
      
      const newArtist = "Odesza (Main Stage)";
      
      addLog('ACTION', 'User A added "Odesza" to the shared festival itinerary.');
      setLineupA(prev => [...prev, newArtist]); // User A always updates instantly locally
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isWebSocketsEnabled) {
              addLog('SYS', '[Socket.io] Emitting "ADD_ARTIST" payload over persistent TCP connection...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', '[Node.js] Multiplexing event to Room: group_9422');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[Socket.io] Pushing realtime updates to connected clients...');
                      setLineupB(prev => [...prev, newArtist]);
                      setLineupC(prev => [...prev, newArtist]);
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsSyncing(false);
                          setSyncComplete(true);
                          addLog('SUCCESS', 'All clients synchronized instantly via WebSockets (Latency: 12ms).');
                      }, 800);
                  }, 800);
              }, 800);
              
          } else {
              // Legacy HTTP Short-Polling
              addLog('SYS', '[HTTP POST] Writing "Odesza" to SQL Database (Latency: 200ms).');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', '[User B & C] UIs are out of sync. Waiting for next polling cycle...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', '[Node.js] Crushed by 300,000 HTTP GET polling requests/sec.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setLineupB(prev => [...prev, newArtist]);
                          setLineupC(prev => [...prev, newArtist]);
                          setIsSyncing(false);
                          setSyncComplete(true);
                          addLog('SUCCESS', 'Clients eventually synchronized via HTTP polling (Latency: 4500ms).');
                      }, 2500); // Simulated delay for polling cycle
                  }, 2000);
              }, 800);
          }
      }, 500);
  };

  const toggleWebSockets = () => {
      const newState = !isWebSocketsEnabled;
      setIsWebSocketsEnabled(newState);
      setSyncComplete(false);
      setActiveStep(0);
      setLineupA([]);
      setLineupB([]);
      setLineupC([]);
      
      if (newState) {
          addLog('SUCCESS', 'Socket.io engine enabled. TCP connections upgraded (HTTP 101 Switching Protocols).');
      } else {
          addLog('CRIT', 'WebSockets disabled. Falling back to aggressive HTTP short-polling.');
      }
  };

  const resetDemo = () => {
      setIsSyncing(false);
      setSyncComplete(false);
      setActiveStep(0);
      setLineupA([]);
      setLineupB([]);
      setLineupC([]);
      addLog('SYS', 'Session reset. Lineups cleared.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔌</span> Real-Time Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            WebSockets Multiplexing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-500 to-blue-500">Real-Time Collaboration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Groups of 5-10 friends want to build a shared festival schedule together. Currently, they have to constantly refresh the page or rely on aggressive HTTP short-polling to see when someone else adds an artist to the itinerary. This laggy UX destroys collaboration and crushes the Node.js event loop with thousands of unnecessary database queries. Eventra solves this by upgrading the group itinerary feature to use multiplexed WebSockets (Socket.io). When any user modifies the schedule, the action is broadcasted instantly over a persistent TCP connection to all clients in that specific room, updating the UI in real-time (similar to Google Docs).
          </p>

          <div className="bg-[#0b0814] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Collaboration Engine
               </h3>
               {syncComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Clear Itinerary</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* WebSockets Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Network Protocol Layer</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isWebSocketsEnabled ? 'Active: WebSockets (Persistent TCP / Socket.io)' : 'Inactive: REST API (HTTP Short-Polling)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleWebSockets}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isWebSocketsEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isWebSocketsEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAction}
                     disabled={isSyncing || syncComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         syncComplete ? 'bg-slate-800 text-indigo-500 border-indigo-900 cursor-not-allowed' :
                         isSyncing ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                     }`}
                 >
                     {isSyncing ? 'Synchronizing State...' : syncComplete ? 'Collaboration Synced' : "User A: Add 'Odesza' to Lineup"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Node.js Server Log</span>
                 {isSyncing && <span className="text-indigo-400 font-black animate-pulse">ROUTING...</span>}
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
                       log.type === 'SYS' ? 'text-indigo-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Live Client States</span>
                      <span className="text-xs text-white font-bold">Room: group_9422</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Central Node.js Server */}
                  <div className={`w-32 h-16 border-2 flex flex-col items-center justify-center rounded-xl absolute top-[40%] transition-colors duration-500 z-20 ${
                      activeStep >= 3 && !isWebSocketsEnabled ? 'border-rose-500 bg-rose-950/40 animate-pulse' : 
                      activeStep >= 2 ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-700 bg-slate-900'
                  }`}>
                      <span className="text-xl mb-1">{!isWebSocketsEnabled && activeStep >= 3 ? '🔥' : '⚙️'}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          !isWebSocketsEnabled && activeStep >= 3 ? 'text-rose-400' : 'text-slate-500'
                      }`}>
                          Node.js Backend
                      </span>
                      {!isWebSocketsEnabled && activeStep >= 3 && (
                          <div className="absolute -top-3 bg-rose-500 text-white text-[8px] font-bold px-1 rounded">CPU: 99%</div>
                      )}
                  </div>

                  {/* Network Lines */}
                  {/* Line to User A (Top) */}
                  <div className={`absolute top-16 bottom-[60%] left-1/2 w-0.5 transition-colors duration-300 ${
                      isWebSocketsEnabled ? 'bg-indigo-900' : 'border-l-2 border-dashed border-slate-700 bg-transparent'
                  }`}></div>
                  
                  {/* Line to User B (Bottom Left) */}
                  <div className="absolute top-[60%] bottom-16 left-[25%] right-1/2 h-auto flex flex-col">
                      <div className={`w-full flex-1 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${
                          isWebSocketsEnabled ? 'border-indigo-900 border-solid' : 'border-slate-700 border-dashed'
                      }`}></div>
                  </div>
                  
                  {/* Line to User C (Bottom Right) */}
                  <div className="absolute top-[60%] bottom-16 left-1/2 right-[25%] h-auto flex flex-col">
                      <div className={`w-full flex-1 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-300 ${
                          isWebSocketsEnabled ? 'border-indigo-900 border-solid' : 'border-slate-700 border-dashed'
                      }`}></div>
                  </div>

                  {/* Active Transmission Animations */}
                  {activeStep === 2 && (
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full animate-ping z-30"></div>
                  )}
                  {activeStep === 4 && isWebSocketsEnabled && (
                      <>
                          <div className="absolute bottom-24 left-[25%] -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,1)] animate-ping z-30"></div>
                          <div className="absolute bottom-24 right-[25%] translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,1)] animate-ping z-30"></div>
                      </>
                  )}
                  {activeStep >= 3 && !isWebSocketsEnabled && activeStep < 5 && (
                      <>
                          <div className="absolute bottom-20 left-[25%] -translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30"></div>
                          <div className="absolute bottom-24 left-[25%] -translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30 delay-100"></div>
                          <div className="absolute bottom-28 left-[25%] -translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30 delay-200"></div>
                          
                          <div className="absolute bottom-20 right-[25%] translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30"></div>
                          <div className="absolute bottom-24 right-[25%] translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30 delay-100"></div>
                          <div className="absolute bottom-28 right-[25%] translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full animate-ping z-30 delay-200"></div>
                      </>
                  )}

                  {/* Client Nodes */}
                  <div className="w-full h-full relative z-30">
                      
                      {/* User A (Top Center) */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col shadow-lg overflow-hidden">
                          <div className="bg-black py-1 px-2 border-b border-slate-800 text-[8px] font-mono text-slate-500 flex justify-between">
                              <span>User A (You)</span>
                              <span className="text-emerald-500">Live</span>
                          </div>
                          <div className="p-2 min-h-[40px] flex flex-col gap-1 bg-slate-950">
                              {lineupA.map((artist, i) => (
                                  <div key={i} className="text-[9px] bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 px-1 rounded animate-fade-in-up">{artist}</div>
                              ))}
                              {lineupA.length === 0 && <span className="text-[8px] text-slate-600 italic">Empty Schedule</span>}
                          </div>
                      </div>

                      {/* User B (Bottom Left) */}
                      <div className="absolute bottom-0 left-4 w-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col shadow-lg overflow-hidden">
                          <div className="bg-black py-1 px-2 border-b border-slate-800 text-[8px] font-mono text-slate-500 flex justify-between">
                              <span>User B (Friend)</span>
                              <span className={activeStep >= 3 && !isWebSocketsEnabled && activeStep < 5 ? "text-amber-500 animate-pulse" : "text-emerald-500"}>
                                  {!isWebSocketsEnabled && activeStep >= 3 && activeStep < 5 ? 'Polling...' : 'Live'}
                              </span>
                          </div>
                          <div className="p-2 min-h-[40px] flex flex-col gap-1 bg-slate-950">
                              {lineupB.map((artist, i) => (
                                  <div key={i} className="text-[9px] bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 px-1 rounded animate-fade-in-up">{artist}</div>
                              ))}
                              {lineupB.length === 0 && <span className="text-[8px] text-slate-600 italic">Empty Schedule</span>}
                          </div>
                      </div>

                      {/* User C (Bottom Right) */}
                      <div className="absolute bottom-0 right-4 w-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col shadow-lg overflow-hidden">
                          <div className="bg-black py-1 px-2 border-b border-slate-800 text-[8px] font-mono text-slate-500 flex justify-between">
                              <span>User C (Friend)</span>
                              <span className={activeStep >= 3 && !isWebSocketsEnabled && activeStep < 5 ? "text-amber-500 animate-pulse" : "text-emerald-500"}>
                                  {!isWebSocketsEnabled && activeStep >= 3 && activeStep < 5 ? 'Polling...' : 'Live'}
                              </span>
                          </div>
                          <div className="p-2 min-h-[40px] flex flex-col gap-1 bg-slate-950">
                              {lineupC.map((artist, i) => (
                                  <div key={i} className="text-[9px] bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 px-1 rounded animate-fade-in-up">{artist}</div>
                              ))}
                              {lineupC.length === 0 && <span className="text-[8px] text-slate-600 italic">Empty Schedule</span>}
                          </div>
                      </div>

                  </div>

                  {/* Overlays */}
                  {syncComplete && !isWebSocketsEnabled && (
                      <div className="absolute inset-x-4 bottom-4 bg-rose-950/90 backdrop-blur-sm rounded-xl border border-rose-500 flex items-center p-3 text-white z-40 animate-fade-in-up shadow-2xl">
                          <span className="text-2xl mr-3">🐌</span>
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">Polling Delay Detected</span>
                              <span className="text-[9px] text-rose-200 mt-0.5">UI was out of sync for 4.5s. Node.js server suffered high CPU load from useless HTTP GET requests.</span>
                          </div>
                      </div>
                  )}
                  
                  {syncComplete && isWebSocketsEnabled && (
                      <div className="absolute inset-x-4 bottom-4 bg-indigo-950/90 backdrop-blur-sm rounded-xl border border-indigo-500 flex items-center p-3 text-white z-40 animate-fade-in-up shadow-2xl">
                          <span className="text-2xl mr-3">⚡</span>
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">Instant Multicast (12ms)</span>
                              <span className="text-[9px] text-indigo-200 mt-0.5">Action broadcasted to all active room clients via persistent TCP socket without server strain.</span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0814] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Collaboration Syncing:</span>
               With WebSockets OFF, click Add Artist. User A sees the change instantly, but Users B & C remain out of sync. Their phones must repeatedly send HTTP GET requests (polling) every few seconds to check for updates, creating massive delays and crushing the Node server.<br/><br/>Toggle <span className="text-indigo-400 font-bold bg-slate-800 px-1 rounded">Network Protocol</span> ON. The app switches to Socket.io. When User A adds an artist, the backend instantly multiplexes the payload over the open TCP connection to exactly Users B & C. The UIs synchronize magically in 12ms with zero polling overhead.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebSocketMultiplexing;
