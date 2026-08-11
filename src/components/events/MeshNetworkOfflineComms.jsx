/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MeshNetworkOfflineComms = () => {
  const [networkState, setNetworkState] = useState('active'); // active, sending, delivered
  const [activeNodes, setActiveNodes] = useState(8421);
  
  // Nodes in the visualization
  const [nodes, setNodes] = useState([]);
  const [messagePath, setMessagePath] = useState([]);
  
  const [networkLog, setNetworkLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'Cellular tower capacity exceeded (104%). P2P Mesh Network auto-engaged.' }
  ]);

  // Generate random node field for the visualization
  useEffect(() => {
    const newNodes = [];
    for (let i = 0; i < 60; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        isPath: false
      });
    }
    // Set specific start (bottom left) and end (top right) nodes
    newNodes[0] = { id: 0, x: 10, y: 85, isPath: false, label: 'Sender' };
    newNodes[59] = { id: 59, x: 90, y: 15, isPath: false, label: 'Recipient' };
    setNodes(newNodes);
  }, []);

  const triggerMessage = () => {
    if (networkState === 'active' || networkState === 'delivered') {
      setNetworkState('sending');
      setMessagePath([]);
      
      // Reset node colors
      setNodes(prev => prev.map(n => ({ ...n, isPath: false })));
      
      addLog('MSG', 'User [Alex] initiated offline message to [Sam]: "Meet at Main Stage Left".');
      
      // Simulate finding a path through the mesh graph
      const pathNodes = [0];
      let currentX = 10;
      let currentY = 85;
      
      for (let i = 0; i < 5; i++) {
        // Find a random node that progresses towards top right
        const possibleNodes = nodes.filter(n => n.id !== 0 && n.id !== 59 && n.x > currentX && n.y < currentY);
        if (possibleNodes.length > 0) {
          const nextNode = possibleNodes[Math.floor(Math.random() * possibleNodes.length)];
          pathNodes.push(nextNode.id);
          currentX = nextNode.x;
          currentY = nextNode.y;
        }
      }
      pathNodes.push(59); // Add recipient

      // Animate the path
      let step = 0;
      const loop = setInterval(() => {
        if (step < pathNodes.length) {
          const nodeId = pathNodes[step];
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, isPath: true } : n));
          
          if (step > 0) {
            setMessagePath(prev => [...prev, { from: pathNodes[step-1], to: nodeId }]);
            addLog('HOP', `Packet encrypted & bounced via anonymous peer node #${Math.floor(Math.random()*9000+1000)}.`);
          }
          step++;
        } else {
          clearInterval(loop);
          setNetworkState('delivered');
          addLog('SUCCESS', 'Message delivered to [Sam] via 6 BLE peer hops. Cellular dependency: 0%.');
        }
      }, 500);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setNetworkLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: P2P Network Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> P2P Mesh Routing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Mesh <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Offline Network</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Cell towers instantly overload at festivals with 100,000+ people, leaving attendees completely unable to text their friends. Eventra solves this by embedding a Bluetooth/Wi-Fi Direct peer-to-peer mesh network within the attendee app. Even with zero cellular service, encrypted messages bounce seamlessly from phone to phone across the crowd, acting as anonymous relay nodes, until they reach the intended recipient.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🌐</span> Mesh Graph Routing Engine
               </h3>
               
               <button 
                 onClick={triggerMessage}
                 disabled={networkState === 'sending'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   networkState === 'sending' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                   'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                 }`}
               >
                 {networkState === 'sending' ? 'Routing Packet...' : 'Simulate Offline Message'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Network Status */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Cellular Infrastructure</span>
                 <div className="flex justify-between items-center">
                   <span className="text-xl font-black font-mono text-red-500 leading-tight">
                     OFFLINE
                   </span>
                   <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-500/50">
                     Tower Overload
                   </span>
                 </div>
               </div>

               {/* Mesh Nodes */}
               <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-900/10 relative overflow-hidden flex flex-col justify-center shadow-[inset_0_0_20px_rgba(20,184,166,0.05)]">
                 <span className="text-[10px] text-teal-500/70 font-bold uppercase tracking-widest block mb-2">Active Peer Nodes (Phones)</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-teal-400 leading-none">
                     {activeNodes.toLocaleString()}
                   </span>
                   <div className="flex items-center ml-3 pb-1">
                     <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping mr-1"></span>
                     <span className="text-[8px] font-bold text-teal-500 uppercase tracking-widest">Mesh Active</span>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Graph Protocol Encrypted Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {networkLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'MSG' ? 'text-white font-bold' :
                       log.type === 'HOP' ? 'text-teal-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Network Graph Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-slate-800">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Bluetooth LE Network
              </span>
            </div>

            <div className="flex-1 relative overflow-hidden">
               
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

               {/* Drawing Path Lines */}
               <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                 {messagePath.map((path, i) => {
                   const nodeFrom = nodes.find(n => n.id === path.from);
                   const nodeTo = nodes.find(n => n.id === path.to);
                   if (!nodeFrom || !nodeTo) return null;
                   
                   return (
                     <line 
                       key={i}
                       x1={`${nodeFrom.x}%`} 
                       y1={`${nodeFrom.y}%`} 
                       x2={`${nodeTo.x}%`} 
                       y2={`${nodeTo.y}%`} 
                       stroke="#14b8a6" // teal-500
                       strokeWidth="2" 
                       className="animate-draw-line"
                       strokeDasharray="1000"
                       strokeDashoffset="1000"
                       style={{ animation: 'draw 0.5s forwards' }}
                     />
                   );
                 })}
               </svg>
               
               <style dangerouslySetInnerHTML={{__html: `
                 @keyframes draw {
                   to { stroke-dashoffset: 0; }
                 }
               `}} />

               {/* Drawing Nodes */}
               {nodes.map(node => (
                 <div 
                   key={node.id}
                   className={`absolute rounded-full transition-all duration-300 z-20 flex items-center justify-center ${
                     node.id === 0 || node.id === 59 ? 'w-6 h-6 border-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 
                     node.isPath ? 'w-4 h-4 shadow-[0_0_10px_rgba(20,184,166,0.8)]' : 'w-2 h-2 opacity-30'
                   } ${
                     node.id === 0 ? 'bg-blue-600 border-blue-400' :
                     node.id === 59 ? 'bg-purple-600 border-purple-400' :
                     node.isPath ? 'bg-teal-400 border border-white/50' : 'bg-slate-600'
                   }`}
                   style={{ left: `calc(${node.x}% - 12px)`, top: `calc(${node.y}% - 12px)` }}
                 >
                   {node.label && (
                     <span className="absolute -top-5 bg-black/80 text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                       {node.label}
                     </span>
                   )}
                   {/* Ripple effect when path hits */}
                   {node.isPath && node.id !== 0 && node.id !== 59 && (
                     <div className="absolute inset-0 border border-teal-400 rounded-full animate-ping"></div>
                   )}
                 </div>
               ))}

               {/* Notification UI */}
               {networkState === 'delivered' && (
                 <div className="absolute bottom-6 right-6 bg-slate-900 border border-purple-500/50 rounded-2xl p-4 shadow-2xl z-30 animate-fade-in-up w-64">
                   <div className="flex items-center mb-2">
                     <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3">AL</div>
                     <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">New Message</p>
                       <p className="text-sm font-black text-white">Alex</p>
                     </div>
                   </div>
                   <div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700">
                     <p className="text-xs text-slate-300">Meet at Main Stage Left</p>
                   </div>
                   <div className="mt-2 text-right flex justify-end items-center">
                     <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-1.5"></span>
                     <span className="text-[8px] font-mono text-teal-400">Delivered via MeshNet</span>
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MeshNetworkOfflineComms;
