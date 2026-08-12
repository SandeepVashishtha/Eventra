/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DistributedAREdgeCloud = () => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [arAsset, setArAsset] = useState('OFFLINE'); // OFFLINE, LASERS, DRAGON
  
  // Edge Compute Metrics
  const [edgeLatency, setEdgeLatency] = useState(0); // ms
  const [activeStreams, setActiveStreams] = useState(0);
  const [gpuLoad, setGpuLoad] = useState(0); // %
  const [polysRendered, setPolysRendered] = useState(0); // Millions
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Local 5G Edge-Compute nodes online.' },
    { id: 2, time: '21:30:02', type: 'SYS', msg: 'Awaiting AR Volumetric Pipeline instantiation.' }
  ]);

  // Network Flow Visualization
  const [flowSpeed, setFlowSpeed] = useState(0);

  useEffect(() => {
    let loop;
    
    if (pipelineActive) {
      if (arAsset === 'OFFLINE') {
          loop = setInterval(() => {
              setEdgeLatency(Math.max(4, edgeLatency + (Math.random()*2 - 1)));
              setGpuLoad(Math.max(2, Math.min(10, gpuLoad + (Math.random()*2 - 1))));
              setPolysRendered(0);
              setFlowSpeed(1); // minimal keep-alive flow
          }, 300);
      } else if (arAsset === 'LASERS') {
          loop = setInterval(() => {
              setEdgeLatency(Math.max(5, Math.min(8, edgeLatency + (Math.random() - 0.5))));
              setGpuLoad(Math.max(30, Math.min(45, gpuLoad + (Math.random()*5 - 2.5))));
              setPolysRendered(Math.max(12, Math.min(15, polysRendered + (Math.random() - 0.5))));
              setFlowSpeed(3);
          }, 150);
      } else if (arAsset === 'DRAGON') {
          loop = setInterval(() => {
              setEdgeLatency(Math.max(7, Math.min(11, edgeLatency + (Math.random()*2 - 1))));
              setGpuLoad(Math.max(85, Math.min(98, gpuLoad + (Math.random()*8 - 4))));
              setPolysRendered(Math.max(45, Math.min(55, polysRendered + (Math.random()*4 - 2))));
              setFlowSpeed(8);
          }, 100);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [pipelineActive, arAsset, edgeLatency, gpuLoad, polysRendered]);

  const deployDragon = () => {
    if (pipelineActive) {
      setArAsset('DRAGON');
      addLog('ACTION', 'Asset Triggered: 500ft Volumetric Dragon.');
      addLog('AI', 'Distributing 55M Polygon render across local GPU cluster.');
      addLog('SYS', 'Streaming output to client devices over 5G sub-6GHz.');
    }
  };
  
  const deployLasers = () => {
    if (pipelineActive) {
      setArAsset('LASERS');
      addLog('ACTION', 'Asset Triggered: AR Laser Grid extension.');
      addLog('SYS', 'GPU load nominal. Edge-streaming stable at 6ms latency.');
    }
  };

  const clearAR = () => {
    if (pipelineActive) {
      setArAsset('OFFLINE');
      addLog('WARN', 'AR assets cleared. GPUs idling.');
    }
  };

  const togglePipeline = () => {
    if (!pipelineActive) {
      setPipelineActive(true);
      setActiveStreams(42815);
      setEdgeLatency(5);
      setArAsset('OFFLINE');
      addLog('WEB3', '5G Pipeline armed. Syncing with 42,815 mobile clients.');
    } else {
      setPipelineActive(false);
      setActiveStreams(0);
      setEdgeLatency(0);
      setGpuLoad(0);
      setPolysRendered(0);
      setArAsset('OFFLINE');
      setFlowSpeed(0);
      addLog('WARN', 'Edge Rendering Pipeline shutdown. Mobile fallback (Local render) engaged.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050b0b] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Pipeline Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">☁️</span> Edge Compute Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Distributed Edge-Rendering <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Pipeline for AR Cloud</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Rendering high-fidelity, world-scale Augmented Reality (like a massive virtual dragon flying over the main stage) directly on a smartphone instantly drains batteries, overheats devices, and suffers from low framerates. Eventra circumvents this by implementing a localized 5G Distributed Edge-Rendering Pipeline. The heavy GPU rendering of millions of polygons happens on massive edge servers physically present at the festival. Eventra then streams the rendered, pixel-perfect volumetric video directly to attendees' phones with sub-10ms latency, enabling cinematic AR experiences without taxing mobile hardware.
          </p>

          <div className="bg-[#0b1414] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🖥️</span> Cloud GPU Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={togglePipeline}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     pipelineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {pipelineActive ? 'Sever 5G Edge Connection' : 'Initialize Edge Render Pipeline'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-3 mb-6">
               
               {/* 5G Latency */}
               <div className={`col-span-1 p-3 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 edgeLatency > 15 ? 'bg-orange-950/40 border-orange-500/50' :
                 pipelineActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Network Ping
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     edgeLatency > 15 ? 'text-orange-400' :
                     pipelineActive ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {edgeLatency.toFixed(1)}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* GPU Load */}
               <div className={`col-span-1 p-3 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gpuLoad > 90 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 pipelineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Edge GPU Load
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     gpuLoad > 90 ? 'text-red-400 animate-pulse' :
                     pipelineActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(gpuLoad)}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Polygons Rendered */}
               <div className={`col-span-1 p-3 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 arAsset === 'DRAGON' ? 'bg-emerald-950/30 border-emerald-500/40' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Volume
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     arAsset === 'DRAGON' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(polysRendered)}
                   </span>
                   <span className="text-[9px] font-bold text-slate-500 ml-1 pb-1">M Tris</span>
                 </div>
               </div>

               {/* Active Streams */}
               <div className={`col-span-1 p-3 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 pipelineActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Client Feeds
                 </span>
                 <div className="flex items-end">
                   <span className={`text-lg font-black font-mono leading-none ${
                     pipelineActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeStreams.toLocaleString()}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050808] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cloud Orchestration Log</span>
                 {arAsset === 'DRAGON' && <span className="text-emerald-400 animate-pulse">STREAMING VOLUMETRIC VIDEO</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'WEB3' ? 'text-teal-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' :
                       log.type === 'AI' ? 'text-emerald-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">NETWORK TOPOLOGY</span>
                <span className="text-[8px] font-mono text-slate-400">5G VIDEO STREAMING</span>
              </div>

              <div className="flex-1 relative bg-[#010404] overflow-hidden flex flex-col justify-between p-4 pt-12">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                {/* Cloud / Edge Server Render */}
                <div className="w-full flex justify-center z-10 relative">
                   <div className="w-32 h-16 bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest z-10">LOCAL EDGE GPU</span>
                       {pipelineActive && (
                           <div className="absolute bottom-0 w-full h-1 bg-teal-500 animate-pulse"></div>
                       )}
                       {arAsset === 'DRAGON' && (
                           <div className="absolute inset-0 bg-emerald-500/20 animate-pulse z-0"></div>
                       )}
                   </div>
                </div>

                {/* Network Streaming Lines */}
                <div className="flex-1 w-full relative z-0 flex items-center justify-center">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        {[20, 35, 50, 65, 80].map((x, i) => (
                           <line 
                               key={i} 
                               x1="50%" y1="0%" 
                               x2={`${x}%`} y2="100%" 
                               stroke={!pipelineActive ? "#1e293b" : arAsset === 'DRAGON' ? "#10b981" : arAsset === 'LASERS' ? "#06b6d4" : "#0d9488"}
                               strokeWidth={arAsset === 'DRAGON' ? "3" : "1"} 
                               strokeDasharray={flowSpeed > 0 ? "4 8" : "none"}
                               className={flowSpeed > 0 ? "animate-pulse" : ""}
                               style={{ animationDuration: `${0.5 / flowSpeed}s` }}
                           />
                        ))}
                    </svg>
                </div>

                {/* Client Devices Render */}
                <div className="w-full flex justify-between px-4 z-10 relative mt-auto">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-8 h-12 bg-slate-900 border border-slate-700 rounded relative overflow-hidden flex flex-col justify-end p-0.5">
                            {/* Phone Screen Area */}
                            <div className={`w-full h-full rounded-sm border border-slate-800 ${
                                !pipelineActive ? 'bg-black' :
                                arAsset === 'DRAGON' ? 'bg-gradient-to-b from-emerald-900 to-black animate-pulse' :
                                arAsset === 'LASERS' ? 'bg-gradient-to-b from-cyan-900 to-black' : 'bg-slate-950'
                            }`}>
                                {arAsset === 'DRAGON' && (
                                    <div className="text-[6px] text-center mt-2 text-emerald-400 font-bold">DRAGON.OBJ</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* HUD Alerts */}
                {arAsset === 'DRAGON' && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center z-30 pointer-events-none w-full">
                       <div className="bg-black/90 border border-emerald-500/50 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-sm">
                          <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400">REMOTE RENDERING</span>
                          <span className="text-[9px] font-mono text-slate-300 mt-1">Streaming Video to Mobile UI.</span>
                       </div>
                   </div>
                )}
                
                {pipelineActive && arAsset === 'OFFLINE' && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center z-30 pointer-events-none w-full">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-black/80 px-2 py-1 rounded">5G LINK ESTABLISHED</span>
                   </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b1414] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Cloud Asset Deployment</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={deployLasers}
                   disabled={!pipelineActive || arAsset === 'LASERS'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !pipelineActive || arAsset === 'LASERS' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                   }`}
                 >
                   Inject AR Lasers (Low Poly)
                 </button>
                 
                 <button 
                   onClick={deployDragon}
                   disabled={!pipelineActive || arAsset === 'DRAGON'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !pipelineActive || arAsset === 'DRAGON' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                   }`}
                 >
                   Inject Volumetric Dragon
                 </button>
               </div>
               
               <button 
                   onClick={clearAR}
                   disabled={!pipelineActive || arAsset === 'OFFLINE'}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !pipelineActive || arAsset === 'OFFLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Clear AR Cache (Idle)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DistributedAREdgeCloud;
