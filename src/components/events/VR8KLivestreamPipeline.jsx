/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VR8KLivestreamPipeline = () => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [latency, setLatency] = useState(0); // ms
  const [bandwidth, setBandwidth] = useState(0); // Gbps
  const [viewers, setViewers] = useState(0);
  
  const [serverLog, setServerLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Media Server standing by. 8K Omnidirectional rigs detected on Main Stage.' },
    { id: 2, time: '21:00:05', type: 'SYS', msg: 'Awaiting WebRTC handshake and encoder initialization.' }
  ]);

  useEffect(() => {
    let loop;
    if (pipelineActive) {
      loop = setInterval(() => {
        // Sub-second latency (usually < 200ms for WebRTC)
        setLatency(prev => Math.max(120, Math.min(250, prev + (Math.random() * 40 - 20))));
        
        // Massive bandwidth for 8K VR
        setBandwidth(prev => Math.max(8.5, Math.min(12.0, prev + (Math.random() * 0.8 - 0.4))));
        
        // Viewer count rising
        setViewers(prev => prev + Math.floor(Math.random() * 50 + 10));
      }, 1000);
    }
    return () => clearInterval(loop);
  }, [pipelineActive]);

  const togglePipeline = () => {
    if (!pipelineActive) {
      setPipelineActive(true);
      setLatency(180);
      setBandwidth(10.2);
      setViewers(14205);
      
      addLog('ACTION', 'Initializing H.265 Hardware Encoders for 8K spherical video.');
      setTimeout(() => {
        addLog('SUCCESS', 'WebRTC Peer-to-Peer network established. Broadcasting at 90 FPS.');
      }, 800);
    } else {
      setPipelineActive(false);
      setLatency(0);
      setBandwidth(0);
      addLog('WARN', 'Terminating WebRTC stream. Cutting feed from Main Stage rigs.');
    }
  };

  const simulatePacketLoss = () => {
    if (pipelineActive) {
      addLog('CRIT', 'UDP Packet Loss detected on Node 4. Initiating auto-failover.');
      setLatency(650); // Spike latency
      setBandwidth(4.2); // Drop bandwidth
      
      setTimeout(() => {
        addLog('SUCCESS', 'Failover complete. Traffic rerouted via Edge CDN. Restoring 8K quality.');
        setLatency(190);
        setBandwidth(10.8);
      }, 2500);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setServerLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Broadcast Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> Immersive Media Server
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            8K VR Zero-Latency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Livestreaming Pipeline</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Remote fans want a visceral experience, but traditional 1080p YouTube livestreams feel flat, disconnected from the crowd energy, and suffer from heavy HTTP latency. Eventra implements a WebRTC-based 8K 360-degree video pipeline. Stage-mounted omnidirectional cameras feed directly into Eventra's Edge Media Server, which stitches the spherical footage and streams it globally with sub-second latency to attendees wearing Meta Quest or Apple Vision Pro headsets.
          </p>

          <div className="bg-[#0f0a1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🌐</span> WebRTC Edge Encoder
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={togglePipeline}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     pipelineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {pipelineActive ? 'Terminate Stream' : 'Initialize 8K Broadcast'}
                 </button>
                 <button 
                   onClick={simulatePacketLoss}
                   disabled={!pipelineActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md ${
                     !pipelineActive ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed' :
                     'bg-orange-900/40 hover:bg-orange-900/60 text-orange-400 border border-orange-500/50'
                   }`}
                 >
                   Inject UDP Packet Loss
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Latency Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 latency > 500 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 pipelineActive ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Glass-to-Glass Latency</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     latency > 500 ? 'text-orange-500' : pipelineActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {latency > 0 ? latency.toFixed(0) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">ms</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   {latency > 500 ? (
                     <><span className="text-orange-500 mr-1 animate-ping">▲</span> Buffering / Failover</>
                   ) : pipelineActive ? (
                     <><span className="text-emerald-500 mr-1">▼</span> Sub-second Sync (WebRTC)</>
                   ) : (
                     <><span className="text-slate-700 mr-1">■</span> Stream Offline</>
                   )}
                 </div>
               </div>

               {/* Throughput & Viewers */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Output Throughput (8K)</span>
                     <span className="text-xs font-mono font-bold text-fuchsia-400">{bandwidth.toFixed(1)} Gbps</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-fuchsia-500 transition-all duration-300" style={{ width: `${(bandwidth / 15) * 100}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Active VR Headsets</span>
                     <span className="text-xs font-mono font-bold text-blue-400">{viewers.toLocaleString()}</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, (viewers / 20000) * 100)}%` }}></div>
                   </div>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Media Server Log</span>
                 {pipelineActive && latency < 500 && <span className="text-emerald-400 animate-pulse">Broadcasting...</span>}
                 {latency > 500 && <span className="text-orange-500 animate-pulse">FAILOVER ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {serverLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: VR Headset Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] bg-slate-900 rounded-[3rem] border-[12px] border-[#111] shadow-[0_0_50px_rgba(147,51,234,0.3)] relative flex flex-col h-[300px] lg:h-[400px] overflow-hidden font-sans lg:mt-[100px]">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 pointer-events-none">
              <span className="text-white/50 text-[9px] font-black uppercase tracking-widest flex items-center drop-shadow-md">
                Apple Vision Pro / Meta Quest Simulator
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden">
               
               {/* VR Binocular Viewport Effect */}
               <div className="absolute inset-0 z-20 pointer-events-none flex">
                 <div className="w-1/2 h-full border-r-2 border-black/80 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.9)] rounded-r-[100px]"></div>
                 <div className="w-1/2 h-full shadow-[inset_20px_0_50px_rgba(0,0,0,0.9)] rounded-l-[100px]"></div>
               </div>

               {pipelineActive ? (
                 <>
                   {/* Simulated 360 Video Feed (Stretched/Curved) */}
                   <div className={`absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 transform scale-110 blur-sm transition-all duration-1000 ${
                     latency > 500 ? 'grayscale contrast-50 blur-md' : 'animate-[spin_120s_linear_infinite]'
                   }`}>
                     {/* Crowd and Lights */}
                     <div className="absolute bottom-0 w-full h-1/2 bg-black/80 blur-md"></div>
                     <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-cyan-500/30 rounded-full blur-2xl mix-blend-screen"></div>
                     <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-fuchsia-500/40 rounded-full blur-2xl mix-blend-screen"></div>
                     
                     {/* Laser rays */}
                     <div className="absolute top-1/2 left-1/2 w-[200%] h-2 bg-white/20 transform -translate-x-1/2 -translate-y-1/2 rotate-45 blur-sm"></div>
                     <div className="absolute top-1/2 left-1/2 w-[200%] h-2 bg-cyan-400/20 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 blur-sm"></div>
                   </div>

                   {/* Buffering Indicator */}
                   {latency > 500 && (
                     <div className="absolute z-30 flex flex-col items-center text-white">
                       <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-3"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-lg">Reconnecting to Peer</span>
                     </div>
                   )}

                   {/* VR UI Overlay */}
                   <div className="absolute bottom-8 z-30 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex space-x-6">
                     <div className="flex flex-col items-center">
                       <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest">Format</span>
                       <span className="text-[10px] font-mono text-white">8K 360°</span>
                     </div>
                     <div className="flex flex-col items-center border-l border-white/10 pl-6">
                       <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest">FPS</span>
                       <span className="text-[10px] font-mono text-emerald-400">90hz</span>
                     </div>
                     <div className="flex flex-col items-center border-l border-white/10 pl-6">
                       <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest">Audio</span>
                       <span className="text-[10px] font-mono text-white">Spatial</span>
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="relative z-10 text-center opacity-30 flex flex-col items-center">
                   <span className="text-4xl block mb-3">🥽</span>
                   <p className="text-[9px] font-bold text-white uppercase tracking-widest">Awaiting Video Stream</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VR8KLivestreamPipeline;
