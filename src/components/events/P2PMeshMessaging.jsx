/* eslint-disable */
import React, { useState, useEffect } from 'react';

const P2PMeshMessaging = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Network Metrics
  const [networkState, setNetworkState] = useState('LTE'); // LTE, MESH
  const [activeNodes, setActiveNodes] = useState(0); 
  const [packetHops, setPacketHops] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '19:00:00', type: 'SYS', msg: 'App connected to public LTE network.' },
    { id: 2, time: '19:00:02', type: 'SYS', msg: 'Standard HTTPS API routing active.' }
  ]);

  // Visualizer State
  const [msgStatus, setMsgStatus] = useState('IDLE'); // IDLE, ENCRYPTING, ROUTING, DELIVERED
  const [nodes, setNodes] = useState([]);
  const [activePath, setActivePath] = useState([]);

  // Initialize static background nodes (Attendee phones)
  useEffect(() => {
      const initNodes = Array.from({ length: 60 }).map((_, i) => ({
          id: i,
          x: 5 + Math.random() * 90,
          y: 5 + Math.random() * 90,
          isSender: i === 0,
          isReceiver: i === 59,
          active: false
      }));
      // Force sender and receiver to opposite sides
      initNodes[0].x = 10; initNodes[0].y = 80;
      initNodes[59].x = 90; initNodes[59].y = 20;
      setNodes(initNodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive && networkState === 'MESH') {
      setActiveNodes(82405 + Math.floor(Math.random() * 100));
    } else {
      setActiveNodes(0);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, networkState]);

  const sendMessage = () => {
      if (!systemActive || msgStatus !== 'IDLE') return;
      
      setMsgStatus('ENCRYPTING');
      addLog('ACTION', 'User initiated message: "Meet at Main Stage Left".');
      
      if (networkState === 'LTE') {
          addLog('SUCCESS', 'Message delivered via standard LTE cell tower.');
          setTimeout(() => setMsgStatus('IDLE'), 1500);
          return;
      }

      // MESH ROUTING LOGIC
      addLog('SYS', 'Cell network unavailable. Initiating AES-256 E2E Encryption.');
      
      setTimeout(() => {
          if (!systemActive) return;
          
          setMsgStatus('ROUTING');
          addLog('SYS', 'Broadcasting encrypted packet to nearby Wi-Fi Direct/BLE nodes.');
          
          // Animate the packet hopping across the mesh
          let hops = 0;
          let currentPath = [nodes[0]];
          
          const hopInterval = setInterval(() => {
              hops++;
              setPacketHops(hops);
              
              // Find a random node closer to the receiver
              const lastNode = currentPath[currentPath.length - 1];
              const receiver = nodes[59];
              
              if (hops > 6 || Math.hypot(lastNode.x - receiver.x, lastNode.y - receiver.y) < 20) {
                  // Reached destination
                  clearInterval(hopInterval);
                  currentPath.push(receiver);
                  setActivePath(currentPath);
                  
                  setTimeout(() => {
                      if (!systemActive) return;
                      setMsgStatus('DELIVERED');
                      addLog('SUCCESS', `Packet successfully hopped across ${hops + 1} attendee phones.`);
                      addLog('SUCCESS', 'Message decrypted and delivered to recipient.');
                      
                      setTimeout(() => {
                          setMsgStatus('IDLE');
                          setActivePath([]);
                          setPacketHops(0);
                      }, 4000);
                  }, 1000);
                  
              } else {
                  // Hop to a mid-point
                  const candidates = nodes.filter(n => !n.isSender && !n.isReceiver && !currentPath.includes(n));
                  // Sort by distance to receiver
                  candidates.sort((a, b) => {
                      const distA = Math.hypot(a.x - receiver.x, a.y - receiver.y);
                      const distB = Math.hypot(b.x - receiver.x, b.y - receiver.y);
                      return distA - distB;
                  });
                  // Pick one of the best 3
                  currentPath.push(candidates[Math.floor(Math.random() * 3)]);
                  setActivePath([...currentPath]);
              }
          }, 600); // Hop delay

      }, 1500); // Encryption delay
  };

  const toggleNetwork = () => {
      if (!systemActive || msgStatus !== 'IDLE') return;
      
      if (networkState === 'LTE') {
          setNetworkState('MESH');
          addLog('CRIT', 'LTE Towers overloaded by 100k users. Connection dropped.');
          addLog('SYS', 'Failing over to P2P Mesh Networking protocol.');
      } else {
          setNetworkState('LTE');
          addLog('SUCCESS', 'LTE Connection restored. Reverting to standard API routing.');
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setNetworkState('LTE');
      addLog('SYS', 'Messaging Engine initialized.');
    } else {
      setSystemActive(false);
      setNetworkState('LTE');
      setMsgStatus('IDLE');
      setActivePath([]);
      setPacketHops(0);
      addLog('WARN', 'Messaging Engine Offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Decentralized Routing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Peer-to-Peer Encrypted <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500">Mesh Messaging</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When cell networks inevitably collapse under the load of 100,000 phones in a remote field, friends lose each other and cannot send SMS messages, causing panic. Eventra solves this by building an offline peer-to-peer (P2P) messaging protocol into the app utilizing Bluetooth and Wi-Fi Direct. Messages literally hop from phone to phone across the crowd until they reach the recipient. Because we use strict End-to-End Encryption (AES-256), intermediate phones routing the traffic cannot read the packets, ensuring a secure, decentralized communication network without cell towers.
          </p>

          <div className="bg-[#0a0d14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Mesh Routing Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Messaging' : 'Initialize Comm Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Network State */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkState === 'MESH' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse' :
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Transport Layer
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     networkState === 'MESH' ? 'text-indigo-400' : 
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? networkState : 'OFF'}
                   </span>
                 </div>
               </div>

               {/* Active Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkState === 'MESH' ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   P2P Nodes Online
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     networkState === 'MESH' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {activeNodes > 0 ? (activeNodes / 1000).toFixed(1) + 'k' : '0'}
                   </span>
                 </div>
               </div>
               
               {/* Packet Hops */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 msgStatus === 'ROUTING' ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Routing Hops
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     msgStatus === 'ROUTING' || msgStatus === 'DELIVERED' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {packetHops}
                   </span>
                 </div>
               </div>
               
               {/* Encryption */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 msgStatus === 'ENCRYPTING' ? 'bg-purple-950/40 border-purple-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   E2E Crypto
                 </span>
                 <div className="flex flex-col items-start mt-1">
                   <span className={`text-xl font-black font-mono leading-none mb-1 ${
                     msgStatus === 'ENCRYPTING' ? 'text-purple-400 animate-pulse' : 
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     AES
                   </span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">256-bit GCM</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Comm Engine Ledger</span>
                 {msgStatus === 'ROUTING' && <span className="text-blue-400 font-black animate-pulse">HOPPING PACKET...</span>}
                 {msgStatus === 'ENCRYPTING' && <span className="text-purple-400 font-black animate-pulse">LOCKING PAYLOAD...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Mesh UI Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0d14]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">P2P PACKET ROUTING</span>
                <span className="text-[8px] font-mono text-slate-400">Wi-Fi Direct / BLE</span>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NETWORK OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col">
                        
                        {/* Mesh Map (Top half) */}
                        <div className="flex-1 relative border-b border-slate-800 bg-[#05080d]">
                            
                            {/* Grid lines */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                            
                            {/* LTE Tower Indicator */}
                            {networkState === 'LTE' ? (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-30">
                                    <span className="text-4xl text-emerald-500">🗼</span>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">LTE ACTIVE</span>
                                </div>
                            ) : (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-10">
                                    <span className="text-4xl text-red-500">🗼</span>
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">LTE DOWN</span>
                                </div>
                            )}

                            {/* Node Map */}
                            {nodes.map(n => (
                                <div 
                                    key={n.id}
                                    className={`absolute rounded-full transition-all duration-300 ${
                                        n.isSender ? 'bg-green-400 w-3 h-3 z-30 shadow-[0_0_10px_rgba(74,222,128,0.8)]' :
                                        n.isReceiver ? 'bg-pink-400 w-3 h-3 z-30 shadow-[0_0_10px_rgba(244,114,182,0.8)]' :
                                        activePath.includes(n) ? 'bg-indigo-400 w-2 h-2 z-20 shadow-[0_0_5px_rgba(99,102,241,0.8)]' :
                                        'bg-slate-700 w-1 h-1 opacity-50 z-10'
                                    }`}
                                    style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    {n.isSender && <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[6px] font-black text-green-400 uppercase">You</span>}
                                    {n.isReceiver && <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[6px] font-black text-pink-400 uppercase">Alex</span>}
                                    
                                    {/* Pulse effect for nodes actively routing */}
                                    {activePath.includes(n) && msgStatus === 'ROUTING' && n !== nodes[0] && n !== nodes[59] && (
                                        <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
                                    )}
                                </div>
                            ))}

                            {/* Routing Paths (Lines) */}
                            {activePath.length > 1 && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                                    {activePath.map((node, i) => {
                                        if (i === 0) return null;
                                        const prev = activePath[i-1];
                                        return (
                                            <line 
                                                key={`path-${i}`}
                                                x1={`${prev.x}%`} y1={`${prev.y}%`} 
                                                x2={`${node.x}%`} y2={`${node.y}%`} 
                                                stroke="#6366f1" strokeWidth="2" strokeDasharray="4"
                                                className="animate-pulse"
                                            />
                                        )
                                    })}
                                </svg>
                            )}

                        </div>

                        {/* Chat UI (Bottom half) */}
                        <div className="h-40 bg-slate-900 flex flex-col relative">
                            {networkState === 'MESH' && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 animate-pulse"></div>
                            )}
                            
                            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-black/20">
                                <span className="text-[10px] font-bold text-slate-300">Chat: Alex</span>
                                {networkState === 'MESH' ? (
                                    <span className="text-[8px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700 flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping mr-1"></span> P2P MESH
                                    </span>
                                ) : (
                                    <span className="text-[8px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 flex items-center">
                                        LTE ONLINE
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 p-3 flex flex-col justify-end">
                                {/* Message bubble */}
                                {(msgStatus !== 'IDLE' || packetHops > 0) && (
                                    <div className="self-end mb-2 relative">
                                        <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm">
                                            Meet at Main Stage Left
                                        </div>
                                        
                                        {/* Status text */}
                                        <div className="absolute -bottom-4 right-1 flex items-center text-[7px] font-bold text-slate-400">
                                            {msgStatus === 'ENCRYPTING' && (
                                                <><span className="mr-1">🔐</span> Encrypting...</>
                                            )}
                                            {msgStatus === 'ROUTING' && networkState === 'LTE' && (
                                                <><span className="mr-1">🚀</span> Sending...</>
                                            )}
                                            {msgStatus === 'ROUTING' && networkState === 'MESH' && (
                                                <><span className="mr-1 animate-spin">📡</span> Mesh Routing ({packetHops} hops)</>
                                            )}
                                            {msgStatus === 'DELIVERED' && (
                                                <><span className="mr-1 text-emerald-400">✓✓</span> Delivered</>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0a0d14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Offline Environment</span>
               
               <button 
                   onClick={toggleNetwork}
                   disabled={!systemActive || msgStatus !== 'IDLE'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border mb-3 flex items-center justify-center ${
                     !systemActive || msgStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     networkState === 'LTE' ? 'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                     'bg-emerald-950/40 border-emerald-600 text-emerald-500 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   {networkState === 'LTE' ? '💥 Crash Cell Network' : '📶 Restore Cell Network'}
               </button>

               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={sendMessage}
                   disabled={!systemActive || msgStatus !== 'IDLE'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || msgStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   💬 Send Text to Friend
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default P2PMeshMessaging;
