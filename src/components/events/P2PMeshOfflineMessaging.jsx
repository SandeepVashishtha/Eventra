/* eslint-disable */
import React, { useState, useEffect } from 'react';

const P2PMeshOfflineMessaging = () => {
  const [meshActive, setMeshActive] = useState(false);
  const [networkNodes, setNetworkNodes] = useState(0);
  const [simulatingSend, setSimulatingSend] = useState(false);
  const [msgStatus, setMsgStatus] = useState('IDLE'); // IDLE, ROUTING, DELIVERED
  const [hopCount, setHopCount] = useState(0);
  
  const [chatLog, setChatLog] = useState([
    { id: 1, sender: 'system', msg: 'Disconnected from Cellular Network.', time: '21:14' },
    { id: 2, sender: 'system', msg: 'Searching for nearby BLE/Wi-Fi Direct peers...', time: '21:14' }
  ]);

  useEffect(() => {
    let nodeLoop;
    if (meshActive) {
      // Simulate discovering nodes dynamically in a crowd
      nodeLoop = setInterval(() => {
        setNetworkNodes(prev => {
          const change = Math.floor(Math.random() * 5) - 1; // +3 to -1
          return Math.max(12, prev + change);
        });
      }, 2000);
    } else {
      setNetworkNodes(0);
    }
    
    return () => { if (nodeLoop) clearInterval(nodeLoop); };
  }, [meshActive]);

  const simulateMessageSend = () => {
    if (meshActive && !simulatingSend) {
      setSimulatingSend(true);
      setMsgStatus('ROUTING');
      setHopCount(0);
      
      const newMsgId = Date.now();
      setChatLog(prev => [...prev, { id: newMsgId, sender: 'me', msg: 'I am at the main stage left speaker! Wya?', time: '21:15' }]);

      // Simulate message hopping across attendee phones
      let currentHops = 0;
      const hopInterval = setInterval(() => {
        currentHops += 1;
        setHopCount(currentHops);
        
        if (currentHops >= 4) { // Target reached after 4 hops
          clearInterval(hopInterval);
          setTimeout(() => {
            setMsgStatus('DELIVERED');
            setSimulatingSend(false);
            
            // Auto reply via mesh
            setTimeout(() => {
              setChatLog(prev => [...prev, { id: Date.now()+1, sender: 'friend', msg: 'On my way! Sending my GPS ping.', time: '21:15', isPing: true }]);
              setMsgStatus('IDLE');
            }, 1500);
            
          }, 500);
        }
      }, 800); // 800ms per hop simulation
    }
  };

  const toggleMesh = () => {
    if (!meshActive) {
      setMeshActive(true);
      setNetworkNodes(14);
      setChatLog(prev => [...prev, { id: Date.now(), sender: 'system', msg: 'P2P Mesh Network established. Bypassing cell towers.', time: '21:15' }]);
    } else {
      setMeshActive(false);
      setNetworkNodes(0);
      setChatLog(prev => [...prev, { id: Date.now(), sender: 'system', msg: 'P2P Mesh disabled. Reverting to cellular.', time: '21:16' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops/Context Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6 pt-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Decentralized P2P Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            P2P Mesh Network <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Offline Messaging</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During peak festival hours, 100,000 cell phones overwhelm local cell towers, leaving attendees unable to communicate with their friends via SMS or data. Eventra integrates a peer-to-peer (P2P) mesh networking protocol directly into the app using Bluetooth Low Energy (BLE) and Wi-Fi Direct. Attendee phones act as decentralized nodes, bridging encrypted connections through each other. This allows text messages and GPS coordinates to dynamically hop across the crowd until they reach the intended recipient, completely bypassing traditional failing cellular infrastructure.
          </p>

          <div className="bg-[#0f1115] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[350px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🌐</span> Mesh Network Topology
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMesh}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     meshActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {meshActive ? 'Disable Antenna' : 'Initialize P2P Node'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Node Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 meshActive ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Connected Peers (Radius)
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-tight ${meshActive ? 'text-sky-400' : 'text-slate-600'}`}>
                     {meshActive ? networkNodes : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Via BLE / Wi-Fi Direct
                   </span>
                 </div>
               </div>

               {/* Routing Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 msgStatus === 'ROUTING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active Packet Routing
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-tight ${msgStatus === 'ROUTING' ? 'text-indigo-400' : 'text-slate-600'}`}>
                     {msgStatus === 'ROUTING' ? `Hop ${hopCount}/4` : 'IDLE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {msgStatus === 'ROUTING' ? 'Encrypting payload...' : 'Awaiting transmission'}
                   </span>
                 </div>
               </div>

             </div>

             {/* Visualizer */}
             <div className="flex-1 bg-[#050505] rounded-xl border border-slate-800 overflow-hidden relative flex flex-col justify-center items-center shadow-inner mt-auto">
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">Crowd Topology Simulation</span>
                
                {meshActive ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Origin Node */}
                    <div className="absolute left-[10%] w-3 h-3 bg-white rounded-full z-10 shadow-[0_0_10px_white]"></div>
                    <span className="absolute left-[8%] top-[60%] text-[8px] font-mono text-slate-400">YOU</span>
                    
                    {/* Intermediate Nodes */}
                    <div className={`absolute left-[30%] top-[30%] w-2 h-2 bg-sky-500 rounded-full transition-all duration-300 ${hopCount >= 1 ? 'scale-150 shadow-[0_0_15px_#0ea5e9]' : 'opacity-30'}`}></div>
                    <div className={`absolute left-[50%] top-[60%] w-2 h-2 bg-sky-500 rounded-full transition-all duration-300 ${hopCount >= 2 ? 'scale-150 shadow-[0_0_15px_#0ea5e9]' : 'opacity-30'}`}></div>
                    <div className={`absolute left-[70%] top-[40%] w-2 h-2 bg-sky-500 rounded-full transition-all duration-300 ${hopCount >= 3 ? 'scale-150 shadow-[0_0_15px_#0ea5e9]' : 'opacity-30'}`}></div>
                    
                    {/* Target Node */}
                    <div className={`absolute right-[10%] w-3 h-3 rounded-full z-10 transition-all duration-300 ${msgStatus === 'DELIVERED' ? 'bg-emerald-400 shadow-[0_0_15px_#34d399]' : 'bg-slate-600'}`}></div>
                    <span className="absolute right-[8%] top-[60%] text-[8px] font-mono text-slate-400">FRIEND</span>
                    
                    {/* Routing Line Animation */}
                    {msgStatus === 'ROUTING' && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <path 
                          d="M 10% 50% L 30% 30% L 50% 60% L 70% 40% L 90% 50%" 
                          fill="none" 
                          stroke="#4f46e5" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4"
                          className="animate-pulse"
                        />
                      </svg>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-700 text-2xl">📡 <span className="text-[10px] ml-1 uppercase font-bold tracking-widest block text-center mt-1">Offline</span></div>
                )}
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Phone Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Phone Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans mb-4 bg-slate-950 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-end pb-1 z-40 bg-slate-950/90 backdrop-blur-md">
                <span className="text-[10px] font-bold text-white">21:15</span>
                <div className="flex items-center space-x-1">
                  {meshActive ? (
                    <span className="text-[8px] font-bold text-sky-400 uppercase tracking-widest px-2 py-0.5 bg-sky-900/30 rounded border border-sky-500/20">Mesh Mode</span>
                  ) : (
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-900/30 rounded border border-red-500/20">No Service</span>
                  )}
                  <div className="w-4 h-2 bg-white rounded-sm relative">
                    <div className="absolute left-[-2px] top-[2px] w-[2px] h-[4px] bg-white rounded-l-sm"></div>
                  </div>
                </div>
              </div>

              {/* Chat App Header */}
              <div className="pt-14 pb-3 px-4 border-b border-slate-800 bg-slate-900/50 flex items-center z-30">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white mr-3">SK</div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">Sarah (Squad)</h2>
                  <p className="text-[9px] text-slate-400 flex items-center">
                    {meshActive ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Via Eventra Mesh</>
                    ) : (
                      <><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span> Offline</>
                    )}
                  </p>
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 flex flex-col pt-4 scrollbar-hide pb-20">
                
                {chatLog.map((log) => {
                  if (log.sender === 'system') {
                    return (
                      <div key={log.id} className="text-center animate-fade-in-up">
                        <span className="inline-block bg-slate-900 text-slate-500 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-800">
                          {log.msg}
                        </span>
                      </div>
                    );
                  }
                  
                  const isMe = log.sender === 'me';
                  
                  return (
                    <div key={log.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up w-full`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMe ? 'bg-sky-600 text-white rounded-tr-sm' : 'bg-slate-800 text-white rounded-tl-sm'
                      }`}>
                        {log.isPing ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">📍</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">Shared GPS Pin</span>
                              <span className="text-[9px] text-slate-400 font-mono">33.6784° N, 116.2371° W</span>
                            </div>
                          </div>
                        ) : (
                          <p>{log.msg}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-1 text-[9px] text-slate-500 space-x-1">
                        <span>{log.time}</span>
                        {isMe && (
                          <span className={msgStatus === 'DELIVERED' ? 'text-sky-400' : 'text-slate-500'}>
                            {msgStatus === 'ROUTING' ? 'Routing...' : msgStatus === 'DELIVERED' ? 'Delivered' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 z-30">
                <button className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">+</button>
                <div className="flex-1 h-9 bg-slate-950 border border-slate-800 rounded-full px-4 flex items-center text-xs text-slate-500">
                  {simulatingSend ? 'Sending...' : 'Type a message...'}
                </div>
                <button 
                  onClick={simulateMessageSend}
                  disabled={!meshActive || simulatingSend || msgStatus === 'ROUTING'}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    !meshActive || simulatingSend ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-400'
                  }`}
                >
                  ↑
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default P2PMeshOfflineMessaging;
