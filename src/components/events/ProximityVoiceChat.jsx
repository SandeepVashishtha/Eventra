/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ProximityVoiceChat = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [transmissionState, setTransmissionState] = useState('IDLE'); // IDLE, CLEAN, TOXIC, SCREAMING
  
  // Mesh Network Metrics
  const [activeNodes, setActiveNodes] = useState(0); 
  const [meshLatency, setMeshLatency] = useState(0); // ms
  const [blockedTransmissions, setBlockedTransmissions] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Ad-hoc Wi-Fi Direct / BLE Mesh initialized.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Edge-AI NLP Moderation Model loaded into RAM.' }
  ]);

  // Visualizer State
  const [nodes, setNodes] = useState([]);
  const [broadcastWaves, setBroadcastWaves] = useState([]);
  const [intercepted, setIntercepted] = useState(false);

  // Initialize static mesh nodes
  useEffect(() => {
      const initialNodes = Array.from({length: 12}).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 35 + (i % 2 === 0 ? 10 : 0); // Staggered circle
          return {
              id: i,
              x: 50 + Math.cos(angle) * radius,
              y: 50 + Math.sin(angle) * radius,
              active: false
          };
      });
      // Add "User" node in center
      initialNodes.push({ id: 'USER', x: 50, y: 50, active: true });
      setNodes(initialNodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (transmissionState === 'IDLE') {
              setActiveNodes(12);
              setMeshLatency(12 + Math.random() * 8); // Fast local ping
              
          } else if (transmissionState === 'CLEAN') {
              // Emitting clean voice waves to mesh
              if (Math.random() > 0.6) {
                  setBroadcastWaves(prev => [...prev, { id: Date.now(), radius: 0, opacity: 1, color: '#10b981' }].slice(-4));
              }
              
              // Light up receiving nodes
              setNodes(prev => prev.map(n => ({
                  ...n,
                  active: n.id === 'USER' || Math.random() > 0.3
              })));
              
          } else if (transmissionState === 'TOXIC' || transmissionState === 'SCREAMING') {
              // Edge AI intercepts immediately (no waves leave center)
              if (Math.random() > 0.8) {
                  setBroadcastWaves(prev => [...prev, { id: Date.now(), radius: 0, opacity: 1, color: '#ef4444' }].slice(-1)); // Blocked wave
              }
              
              // Mesh nodes stay dark, they didn't hear it
              setNodes(prev => prev.map(n => ({
                  ...n,
                  active: n.id === 'USER'
              })));
          }

          // Expand broadcast waves
          setBroadcastWaves(prev => prev.map(w => ({
              ...w,
              radius: w.radius + (intercepted ? 2 : 5), // Blocked waves die fast
              opacity: w.opacity - (intercepted ? 0.2 : 0.05)
          })).filter(w => w.opacity > 0));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, transmissionState, intercepted]);

  const triggerAudio = (type) => {
    if (!systemActive) return;
    
    setTransmissionState(type);
    
    if (type === 'CLEAN') {
        setIntercepted(false);
        addLog('ACTION', 'User Voice Input: "Hey squad, meet me at the water station."');
        addLog('SUCCESS', 'NLP: Safe intent detected. Broadcasting to encrypted mesh.');
    } else if (type === 'TOXIC') {
        setIntercepted(true);
        setBlockedTransmissions(prev => prev + 1);
        addLog('ACTION', 'User Voice Input: [Hate Speech Detected / Harassment]');
        addLog('CRIT', 'Edge-AI NLP Intercept! Audio payload deleted locally before broadcast.');
    } else if (type === 'SCREAMING') {
        setIntercepted(true);
        setBlockedTransmissions(prev => prev + 1);
        addLog('ACTION', 'User Voice Input: [High-Decibel Non-Verbal Audio / Trolling]');
        addLog('CRIT', 'DSP Clip Intercept! Audio threshold exceeded. Muting transmitter.');
    } else if (type === 'IDLE') {
        setIntercepted(false);
        setNodes(prev => prev.map(n => ({ ...n, active: n.id === 'USER' })));
        addLog('SYS', 'Microphone standby. Mesh network stable.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setTransmissionState('IDLE');
      setActiveNodes(12);
      setMeshLatency(15);
      setBlockedTransmissions(0);
      setIntercepted(false);
      addLog('SYS', 'Offline Proximity Mesh Activated. Linking local squad devices.');
    } else {
      setSystemActive(false);
      setTransmissionState('IDLE');
      setActiveNodes(0);
      setMeshLatency(0);
      setBroadcastWaves([]);
      addLog('WARN', 'Mesh Offline. Returning to congested cellular towers.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#08020a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Decentralized Comms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Moderated Proximity <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500">Voice Network</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When cellular networks inevitably collapse at festivals under the weight of 50,000 phones, friends lose each other instantly and have no way to communicate. Eventra solves this by building an ad-hoc, encrypted proximity voice chat network directly into the app using Wi-Fi Direct and Bluetooth Mesh. Users can seamlessly talk to their squad completely offline. To prevent proximity trolling or abuse, a lightweight edge-AI Natural Language Processing (NLP) model runs locally on the device, instantly intercepting and muting hate speech or screaming *before* it is ever broadcast across the mesh.
          </p>

          <div className="bg-[#0e0414] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Mesh Node Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disconnect Mesh' : 'Establish Ad-Hoc Network'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Linked Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Linked Devices
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {activeNodes}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Nodes</span>
                 </div>
               </div>

               {/* Mesh Ping */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   P2P Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {meshLatency.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Blocked by AI */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 blockedTransmissions > 0 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Toxicity Blocked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     blockedTransmissions > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {blockedTransmissions}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Muted</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05010a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Edge NLP Ledger</span>
                 {transmissionState === 'CLEAN' && <span className="text-emerald-400 font-black animate-pulse">BROADCASTING SAFE AUDIO</span>}
                 {(transmissionState === 'TOXIC' || transmissionState === 'SCREAMING') && <span className="text-red-500 font-black animate-pulse">MIC MUTED BY AI</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Mesh Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0e0414]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">P2P MESH TOPOLOGY</span>
                <span className="text-[8px] font-mono text-slate-400">OFFLINE MODE</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NO CARRIER</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 to-transparent">
                      
                      {/* Connection Lines (Mesh Topology) */}
                      <svg width="100%" height="100%" className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                          {nodes.map(n1 => (
                              nodes.map(n2 => {
                                  // Draw lines only if relatively close to simulate mesh jumps
                                  const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
                                  if (dist > 0 && dist < 45) {
                                      return (
                                          <line 
                                              key={`${n1.id}-${n2.id}`} 
                                              x1={`${n1.x}%`} y1={`${n1.y}%`} 
                                              x2={`${n2.x}%`} y2={`${n2.y}%`} 
                                              stroke={n1.active && n2.active ? '#10b981' : '#475569'} 
                                              strokeWidth={n1.active && n2.active ? '1.5' : '0.5'}
                                          />
                                      );
                                  }
                                  return null;
                              })
                          ))}
                      </svg>

                      {/* Audio Broadcast Waves */}
                      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
                          {broadcastWaves.map(wave => (
                              <div 
                                  key={wave.id}
                                  className="absolute rounded-full border-2"
                                  style={{
                                      width: `${wave.radius * 2}%`,
                                      height: `${wave.radius * 2}%`,
                                      left: `${50 - wave.radius}%`,
                                      top: `${50 - wave.radius}%`,
                                      opacity: wave.opacity,
                                      borderColor: wave.color,
                                      boxShadow: `0 0 10px ${wave.color}80`
                                  }}
                              ></div>
                          ))}
                      </div>

                      {/* Intercept Icon */}
                      {intercepted && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-[ping_0.5s_ease-out_infinite]">
                              <span className="text-red-500 text-3xl">🚫</span>
                          </div>
                      )}

                      {/* Device Nodes */}
                      <div className="absolute inset-0 z-20 pointer-events-none">
                          {nodes.map(node => (
                              <div 
                                  key={node.id}
                                  className={`absolute flex items-center justify-center rounded-full transition-all duration-300 ${
                                      node.id === 'USER' ? 'w-8 h-8 bg-fuchsia-600 border-2 border-fuchsia-400 shadow-[0_0_20px_rgba(192,38,211,0.6)] z-30' :
                                      node.active ? 'w-4 h-4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'w-3 h-3 bg-slate-800 border border-slate-600'
                                  }`}
                                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                              >
                                  {node.id === 'USER' && (
                                      <span className="text-white text-xs">🎙️</span>
                                  )}
                              </div>
                          ))}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Mic Controls */}
            <div className="w-full bg-[#0e0414] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Microphone Input</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => triggerAudio('CLEAN')}
                   disabled={!systemActive || transmissionState === 'CLEAN'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transmissionState === 'CLEAN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   ✅ Speak (Safe / Coordination)
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerAudio('TOXIC')}
                   disabled={!systemActive || transmissionState === 'TOXIC'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transmissionState === 'TOXIC' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   🤬 Speak (Hate Speech)
                 </button>

                 <button 
                   onClick={() => triggerAudio('SCREAMING')}
                   disabled={!systemActive || transmissionState === 'SCREAMING'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transmissionState === 'SCREAMING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   📢 Troll (Mic Screaming)
                 </button>
               </div>

               <button 
                 onClick={() => triggerAudio('IDLE')}
                 disabled={!systemActive || transmissionState === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                   !systemActive || transmissionState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Release PTT (Stop Transmitting)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ProximityVoiceChat;
