/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HolographicTelepresence = () => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [streamState, setStreamState] = useState('IDLE'); // IDLE, BUFFERING, BEAMING, SYNC_ERROR
  
  // Pipeline Metrics
  const [latency, setLatency] = useState(0); // ms
  const [packetLoss, setPacketLoss] = useState(0); // %
  const [resolution, setResolution] = useState(0); // 1-100 scale for visualizer
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'London Volumetric Capture Studio: STANDBY.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Miami Main Stage Pepper\'s Ghost Array: STANDBY.' }
  ]);

  // Visualizer State
  const [glitchFactor, setGlitchFactor] = useState(0);
  const [hologramPosition, setHologramPosition] = useState(0);

  useEffect(() => {
    let loop;
    
    if (pipelineActive) {
      loop = setInterval(() => {
          
          if (streamState === 'BEAMING') {
              setLatency(prev => prev + ((Math.random() * 4 + 16) - prev) * 0.2); // Target ~18ms
              setPacketLoss(Math.random() * 0.05); // Near zero
              setResolution(100);
              setGlitchFactor(0);
              
              // Slight idle sway for the hologram
              setHologramPosition(Math.sin(Date.now() / 1500) * 10);
              
          } else if (streamState === 'SYNC_ERROR') {
              setLatency(prev => prev + ((Math.random() * 50 + 150) - prev) * 0.2); // Spike to 150ms+
              setPacketLoss(Math.random() * 15 + 5); // 5-20% loss
              setResolution(prev => Math.max(30, prev - 10)); // Degrade quality
              setGlitchFactor(Math.random() * 20); // Heavy glitching
          } else if (streamState === 'BUFFERING') {
              setLatency(0);
              setPacketLoss(0);
              setResolution(prev => Math.min(100, prev + 20));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [pipelineActive, streamState]);

  const triggerEvent = (type) => {
    if (!pipelineActive || streamState === 'BUFFERING') return;
    
    if (type === 'BEAM') {
        setStreamState('BUFFERING');
        addLog('ACTION', 'Initiating 5G volumetric stream from London studio.');
        
        setTimeout(() => {
            setStreamState('BEAMING');
            addLog('SUCCESS', 'Telepresence established. Audio-visual sync locked at <20ms latency.');
            addLog('SYS', 'Rendering life-sized 3D artist asset to main stage array.');
        }, 2000);
    } else if (type === 'GLITCH') {
        setStreamState('SYNC_ERROR');
        addLog('CRIT', 'Network degradation detected. Packet loss spiking over 15%.');
        addLog('WARN', 'Audio-visual de-sync imminent. Attempting to interpolate frames.');
        
        // Auto-recover after a few seconds
        setTimeout(() => {
            if (pipelineActive) {
                setStreamState('BEAMING');
                addLog('SUCCESS', 'FEC (Forward Error Correction) successful. 5G link restabilized.');
            }
        }, 4000);
    }
  };

  const togglePipeline = () => {
    if (!pipelineActive) {
      setPipelineActive(true);
      setStreamState('IDLE');
      setLatency(0);
      setPacketLoss(0);
      setResolution(0);
      setGlitchFactor(0);
      addLog('SYS', 'Global CDN & 5G Edge Nodes initialized. Ready for incoming volumetric data.');
    } else {
      setPipelineActive(false);
      setStreamState('IDLE');
      setResolution(0);
      addLog('WARN', 'Terminating 5G link. Dissipating stage holograms.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040812] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌐</span> Ultra-Low Latency Media
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Holographic Telepresence <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Artist Collaboration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Surprise guest appearances generate massive hype, but flying a pop star across the world for a 3-minute vocal cameo is logistically impossible and highly expensive. Eventra fixes this by integrating a 5G low-latency holographic telepresence pipeline. An artist performing in a volumetric capture studio in London is beamed live into the Eventra servers in Miami. The system renders the artist as a flawless, life-sized 3D hologram on the main stage, allowing them to perform a duet with the live DJ in perfect sync.
          </p>

          <div className="bg-[#0a1120] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🛰️</span> 5G Volumetric Link
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={togglePipeline}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     pipelineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                   }`}
                 >
                   {pipelineActive ? 'Sever Telepresence Link' : 'Initialize 5G Node'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamState === 'SYNC_ERROR' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 streamState === 'BEAMING' ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Round-Trip Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamState === 'SYNC_ERROR' ? 'text-red-400' :
                     streamState === 'BEAMING' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {latency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Packet Loss */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamState === 'SYNC_ERROR' ? 'bg-orange-950/40 border-orange-500/50' :
                 streamState === 'BEAMING' ? 'bg-emerald-950/20 border-emerald-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Packet Loss (UDP)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamState === 'SYNC_ERROR' ? 'text-orange-400' :
                     streamState === 'BEAMING' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {packetLoss.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Resolution */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamState === 'BEAMING' ? 'bg-indigo-950/20 border-indigo-900/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Quality
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamState === 'BEAMING' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {resolution === 100 ? '4K' : resolution > 0 ? '720p' : 'OFF'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">3D</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05070a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Volumetric Streaming Log</span>
                 {streamState === 'SYNC_ERROR' && <span className="text-red-500 animate-pulse">NETWORK GLITCH</span>}
                 {streamState === 'BUFFERING' && <span className="text-sky-400 animate-pulse">ESTABLISHING LINK...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' :
                       'text-slate-400'
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
            
            {/* Stage Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!pipelineActive ? 'bg-slate-900' : 'bg-[#03050a]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">MAIN STAGE (MIAMI)</span>
                <span className="text-[8px] font-mono text-slate-400">PEPPER'S GHOST ARRAY</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-end pb-8">
                
                {/* DJ Booth */}
                <div className="w-32 h-10 bg-slate-800 border-t-2 border-slate-600 absolute bottom-6 z-30 flex items-center justify-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase">Live DJ</span>
                </div>

                {!pipelineActive || streamState === 'IDLE' ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative mb-20">HOLOGRAM ARRAY INACTIVE</span>
                ) : streamState === 'BUFFERING' ? (
                   <div className="z-10 relative mb-20 flex flex-col items-center">
                       <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                       <span className="text-[8px] font-mono text-sky-400 uppercase tracking-widest">Buffering 3D Mesh...</span>
                   </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-20">
                      
                      {/* Holographic Projection Core */}
                      <div className="relative flex justify-center" style={{ transform: `translateX(${hologramPosition}px)` }}>
                          
                          {/* Base projection light beam */}
                          <div className="absolute bottom-0 w-32 h-64 bg-gradient-to-t from-sky-500/40 via-sky-500/10 to-transparent blur-md filter" style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 0, 0 0)'}}></div>
                          
                          {/* The Hologram Artist (Abstracted) */}
                          <div className="relative w-16 h-48 mt-16 flex flex-col items-center">
                              
                              {/* Glitch Effect Containers */}
                              <div className="absolute inset-0 flex flex-col items-center z-30" style={{ transform: `translateX(${glitchFactor > 0 ? (Math.random()-0.5)*glitchFactor : 0}px)` }}>
                                  
                                  {/* Head */}
                                  <div className={`w-10 h-12 rounded-full mb-1 ${streamState === 'SYNC_ERROR' ? 'bg-red-400/80' : 'bg-sky-200/90'} shadow-[0_0_20px_rgba(186,230,253,0.8)]`}></div>
                                  
                                  {/* Body */}
                                  <div className={`w-16 h-24 rounded-t-xl ${streamState === 'SYNC_ERROR' ? 'bg-red-400/70' : 'bg-sky-300/80'} shadow-[0_0_20px_rgba(125,211,252,0.6)]`}></div>
                                  
                                  {/* Scanlines overlay for holo-effect */}
                                  <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent_0,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] pointer-events-none rounded-xl"></div>
                              </div>
                              
                              {/* Chromatic aberration layers during glitch */}
                              {streamState === 'SYNC_ERROR' && (
                                  <>
                                      <div className="absolute inset-0 flex flex-col items-center opacity-50 z-20 mix-blend-screen" style={{ transform: `translateX(-${glitchFactor*1.5}px)` }}>
                                          <div className="w-10 h-12 rounded-full mb-1 bg-cyan-500"></div>
                                          <div className="w-16 h-24 rounded-t-xl bg-cyan-500"></div>
                                      </div>
                                      <div className="absolute inset-0 flex flex-col items-center opacity-50 z-20 mix-blend-screen" style={{ transform: `translateX(${glitchFactor*1.5}px)` }}>
                                          <div className="w-10 h-12 rounded-full mb-1 bg-fuchsia-500"></div>
                                          <div className="w-16 h-24 rounded-t-xl bg-fuchsia-500"></div>
                                      </div>
                                  </>
                              )}

                          </div>
                          
                      </div>

                      {/* HUD Overlays */}
                      <div className="absolute top-10 left-4 bg-black/50 border border-slate-700 px-2 py-1 rounded backdrop-blur">
                          <span className="text-[7px] font-mono text-sky-400 block">SRC: LONDON STUDIO</span>
                          <span className="text-[7px] font-mono text-slate-400">LATENCY: {latency.toFixed(1)}ms</span>
                      </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0a1120] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Telepresence</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerEvent('BEAM')}
                   disabled={!pipelineActive || streamState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !pipelineActive || streamState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-sky-950/40 border-sky-600 text-sky-400 hover:bg-sky-900/60 shadow-[0_0_15px_rgba(2,132,199,0.3)] animate-pulse'
                   }`}
                 >
                   Beam Guest Artist Live (London → Miami)
                 </button>

                 <button 
                   onClick={() => triggerEvent('GLITCH')}
                   disabled={!pipelineActive || streamState !== 'BEAMING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !pipelineActive || streamState !== 'BEAMING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-500 hover:bg-orange-900/60'
                   }`}
                 >
                   Simulate Network Packet Loss (Glitch)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HolographicTelepresence;
