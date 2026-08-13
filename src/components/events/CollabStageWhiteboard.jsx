/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CollabStageWhiteboard = () => {
  const [socketStatus, setSocketStatus] = useState('DISCONNECTED');
  const [latency, setLatency] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'WSS:// protocol ready. Awaiting connection.' }
  ]);

  const [collaborators, setCollaborators] = useState([
      { id: 'u1', name: 'Lighting Director', color: '#ec4899', x: 200, y: 150, active: false },
      { id: 'u2', name: 'Lead Rigger', color: '#14b8a6', x: 300, y: 350, active: false },
      { id: 'u3', name: 'Production Mgr', color: '#eab308', x: 50, y: 50, active: false }
  ]);

  const [elements, setElements] = useState([
      { id: 'e1', type: 'SPEAKER_ARRAY', x: 80, y: 200, lockedBy: null },
      { id: 'e2', type: 'SPEAKER_ARRAY', x: 280, y: 200, lockedBy: null },
      { id: 'e3', type: 'LASER_FIXTURE', x: 180, y: 100, lockedBy: null }
  ]);

  const connectWebSocket = () => {
      setSocketStatus('CONNECTING');
      addLog('ACTION', 'Initiating WebSocket handshake (wss://eventra.io/collab)...');
      
      setTimeout(() => {
          setSocketStatus('CONNECTED');
          addLog('SUCCESS', 'WebSocket connected. Joined channel [Stage_Alpha_Design].');
          
          setCollaborators(prev => prev.map(c => ({ ...c, active: true })));
      }, 1200);
  };

  useEffect(() => {
      let cursorLoop;
      
      if (socketStatus === 'CONNECTED') {
          cursorLoop = setInterval(() => {
              setLatency(15 + Math.random() * 10);
              
              // Simulate remote cursors moving via WS incoming messages
              setCollaborators(prev => prev.map(c => {
                  if (!c.active) return c;
                  
                  // Move randomly but stay within bounds (400x400 roughly)
                  const dx = (Math.random() - 0.5) * 60;
                  const dy = (Math.random() - 0.5) * 60;
                  
                  let newX = c.x + dx;
                  let newY = c.y + dy;
                  
                  if (newX < 0) newX = 20;
                  if (newX > 350) newX = 330;
                  if (newY < 0) newY = 20;
                  if (newY > 350) newY = 330;
                  
                  return { ...c, x: newX, y: newY };
              }));
              
              // Occasionally have a remote user grab and move an element
              if (Math.random() > 0.85) {
                  const targetElement = Math.floor(Math.random() * elements.length);
                  setElements(prev => prev.map((e, idx) => {
                      if (idx === targetElement) {
                          const targetUser = collaborators[Math.floor(Math.random() * collaborators.length)];
                          return {
                              ...e,
                              x: e.x + (Math.random() - 0.5) * 40,
                              y: e.y + (Math.random() - 0.5) * 40,
                              lockedBy: targetUser.color
                          };
                      }
                      return { ...e, lockedBy: null };
                  }));
              }
              
          }, 300); // 300ms network tick
      } else {
          setLatency(0);
          setCollaborators(prev => prev.map(c => ({ ...c, active: false })));
      }
      
      return () => { if (cursorLoop) clearInterval(cursorLoop); };
  }, [socketStatus, collaborators, elements.length]);

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const disconnectWebSocket = () => {
      setSocketStatus('DISCONNECTED');
      addLog('WARN', 'WebSocket closed. Left channel.');
      setElements(prev => prev.map(e => ({ ...e, lockedBy: null })));
  };

  return (
    <div className="min-h-screen bg-[#060714] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔌</span> WebSockets & Real-Time Sync
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Collaborative Stage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">Design Whiteboard</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Lighting designers and production managers try to plan stage layouts over email and static PDFs, leading to massive miscommunications about where rigging points should go. Eventra solves this by building a real-time collaborative digital whiteboard UI (similar to Figma or Miro) directly into the Admin portal. Using WebSockets and HTML5 Canvas, multiple users can draw, drag-and-drop lighting fixtures, and annotate stage blueprints simultaneously in the browser.
          </p>

          <div className="bg-[#0b0c1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> WSS Multiplexer
               </h3>
               
               <div className="flex space-x-2">
                 {socketStatus === 'DISCONNECTED' ? (
                     <button 
                       onClick={connectWebSocket}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-indigo-900/40 border border-indigo-500 text-indigo-400 hover:bg-indigo-800/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                     >
                       Connect WebSocket
                     </button>
                 ) : (
                     <button 
                       onClick={disconnectWebSocket}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                     >
                       Disconnect
                     </button>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Connected Peers */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 socketStatus === 'CONNECTED' ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Peers (Stage_Alpha)
                 </span>
                 <div className="flex items-center space-x-2">
                     <span className={`text-3xl font-black font-mono leading-none ${socketStatus === 'CONNECTED' ? 'text-indigo-400' : 'text-slate-600'}`}>
                         {socketStatus === 'CONNECTED' ? collaborators.length : 0}
                     </span>
                     
                     {socketStatus === 'CONNECTED' && (
                         <div className="flex -space-x-2 ml-2">
                             {collaborators.map(c => (
                                 <div key={c.id} className="w-6 h-6 rounded-full border-2 border-[#0b0c1c] flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: c.color }}>
                                     {c.name.charAt(0)}
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
               </div>

               {/* Socket Latency */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 socketStatus === 'CONNECTED' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Socket Ping Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     socketStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {latency.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04050a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Socket.io / WS Network Log</span>
                 {socketStatus === 'CONNECTED' && <span className="text-indigo-400 font-black animate-pulse">SYNCING STATE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' : 'text-slate-400'
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
            
            {/* HTML5 Canvas Simulator */}
            <div className={`w-full bg-[#1e1e1e] rounded-xl border-4 ${socketStatus === 'CONNECTED' ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'border-slate-800'} relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-[#2d2d2d] border-b border-[#111] p-2 flex justify-between items-center shadow-md z-10">
                  <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">CollabCanvas v2.0</span>
                  </div>
                  {socketStatus === 'CONNECTED' && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/50 uppercase font-black animate-pulse">Live</span>
                  )}
              </div>

              {/* The "Canvas" */}
              <div className="flex-1 bg-[#252526] relative overflow-hidden">
                  
                  {/* Grid / Blueprint background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {/* Static Stage Geometry */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] border-[3px] border-slate-600/50 rounded-t-[100px] bg-slate-800/20 pointer-events-none">
                      <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Stage</span>
                  </div>

                  {/* Render Draggable Elements */}
                  {elements.map((el) => (
                      <div 
                          key={el.id}
                          className="absolute w-12 h-12 flex flex-col items-center justify-center transition-all duration-[300ms] ease-linear"
                          style={{
                              left: `${el.x}px`,
                              top: `${el.y}px`,
                          }}
                      >
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-xl shadow-lg relative ${
                              el.type === 'SPEAKER_ARRAY' ? 'bg-zinc-800 border-2 border-zinc-600' : 'bg-cyan-950 border-2 border-cyan-700'
                          }`}>
                              {el.type === 'SPEAKER_ARRAY' ? '🔊' : '🔦'}
                              
                              {/* Highlight box if a remote user is locking/dragging it */}
                              {el.lockedBy && (
                                  <div className="absolute -inset-1 border-[2px] rounded opacity-80" style={{ borderColor: el.lockedBy }}></div>
                              )}
                          </div>
                      </div>
                  ))}

                  {/* Render Remote Cursors */}
                  {collaborators.map((c) => {
                      if (!c.active) return null;
                      return (
                          <div 
                              key={c.id} 
                              className="absolute pointer-events-none transition-all duration-[300ms] ease-linear z-50 flex flex-col drop-shadow-md"
                              style={{
                                  left: `${c.x}px`,
                                  top: `${c.y}px`,
                              }}
                          >
                              {/* Custom SVG Cursor */}
                              <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-lg" style={{ color: c.color }}>
                                  <path d="M1 1L6.75882 22.8427L10.3705 13.9749L17 9.8787L1 1Z" fill="currentColor" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                              </svg>
                              
                              {/* Name Tag */}
                              <div 
                                className="mt-1 px-2 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap shadow-md"
                                style={{ backgroundColor: c.color }}
                              >
                                  {c.name}
                              </div>
                          </div>
                      )
                  })}

                  {socketStatus === 'DISCONNECTED' && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-700 bg-slate-900 px-4 py-2 rounded">Canvas Offline</span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0c1c] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">HTML5 Real-Time Rendering:</span>
               Click <span className="text-indigo-400 font-bold bg-indigo-900/40 border border-indigo-500 px-1 rounded">Connect WebSocket</span> to open the channel. Simulated remote cursors (Peers) will begin receiving WSS coordinate updates, flying around the blueprint and dragging assets in real-time.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CollabStageWhiteboard;
