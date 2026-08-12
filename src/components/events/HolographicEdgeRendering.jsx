/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HolographicEdgeRendering = () => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState('OFFLINE'); // OFFLINE, BUFFERING, LIVE_SYNC
  
  // Telemetry Metrics
  const [networkLatency, setNetworkLatency] = useState(0); // ms
  const [packetLoss, setPacketLoss] = useState(0); // %
  const [volumetricFPS, setVolumetricFPS] = useState(0); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:45:00', type: 'SYS', msg: 'Main Stage Holo-Mesh Screen online.' },
    { id: 2, time: '22:45:02', type: 'SYS', msg: 'Awaiting handshakes from Volumetric Capture Studio (London).' }
  ]);

  useEffect(() => {
    let loop;
    
    if (pipelineActive && streamStatus === 'LIVE_SYNC') {
      loop = setInterval(() => {
        // Ultra-low latency 5G edge compute simulation
        setNetworkLatency(Math.max(6, Math.min(12, 8 + (Math.random() * 4 - 2))));
        setPacketLoss(Math.max(0, Math.random() * 0.05));
        setVolumetricFPS(Math.max(58, Math.min(60, 60 - (Math.random() * 2))));
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [pipelineActive, streamStatus]);

  const triggerCameo = () => {
    if (pipelineActive && streamStatus === 'OFFLINE') {
      setStreamStatus('BUFFERING');
      addLog('ACTION', 'Incoming Volumetric Stream: Guest Artist "Snoop Dogg" (London Studio).');
      
      let bufferingTime = 0;
      const bufLoop = setInterval(() => {
        bufferingTime += 100;
        setNetworkLatency(150 - (bufferingTime / 20)); // Latency drops as edge cache warms up
        
        if (bufferingTime >= 2000) {
          clearInterval(bufLoop);
          setStreamStatus('LIVE_SYNC');
          setNetworkLatency(8);
          setVolumetricFPS(60);
          addLog('SUCCESS', '5G Edge-Compute Cache warmed. Hologram locked at sub-10ms latency.');
          addLog('SYS', 'Guest artist live on stage mesh. Bi-directional audio active.');
        }
      }, 100);
    }
  };

  const endCameo = () => {
    setStreamStatus('OFFLINE');
    setNetworkLatency(0);
    setPacketLoss(0);
    setVolumetricFPS(0);
    addLog('WARN', 'Volumetric stream terminated. Holo-Mesh returning to transparent standby.');
  };

  const togglePipeline = () => {
    if (!pipelineActive) {
      setPipelineActive(true);
      addLog('SYS', '5G Edge-Rendering Pipeline initialized. Connected to London AWS Outpost.');
    } else {
      setPipelineActive(false);
      endCameo();
      addLog('WARN', 'Edge pipeline offline. Fallback to 2D pre-recorded MP4 playback.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070511] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Telemetry Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> 5G Volumetric Streaming
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Holographic Artist Presence <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">via 5G Edge Rendering</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Surprise guest appearances are highly anticipated, but physically flying an artist in for a 2-minute cameo is often logistically impossible. Eventra solves this by implementing an ultra-low latency 5G edge-rendering pipeline. A guest artist performs live in a volumetric capture studio (e.g., in London), and the system streams the 3D data directly to edge-compute servers physically located at the festival site (e.g., California). The data is rendered with sub-10ms latency onto a massive holographic mesh screen on the main stage, allowing them to interact and perform seamlessly with the live artist in real-time.
          </p>

          <div className="bg-[#0b0a16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Edge Compute Pipeline
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={togglePipeline}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     pipelineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {pipelineActive ? 'Sever 5G Connection' : 'Establish AWS Outpost Link'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Network Latency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamStatus === 'BUFFERING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 streamStatus === 'LIVE_SYNC' ? 'bg-teal-950/40 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.2)]' :
                 pipelineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   E2E Glass Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamStatus === 'BUFFERING' ? 'text-yellow-400' :
                     streamStatus === 'LIVE_SYNC' ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {pipelineActive && streamStatus !== 'OFFLINE' ? networkLatency.toFixed(1) : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* FPS rendering */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 pipelineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Volumetric Render
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamStatus === 'LIVE_SYNC' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {pipelineActive && streamStatus !== 'OFFLINE' ? Math.floor(volumetricFPS) : 0}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">FPS</span>
                 </div>
               </div>

               {/* Packet Loss */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 pipelineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   5G Packet Loss
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamStatus === 'LIVE_SYNC' ? 'text-green-400' : 'text-slate-600'
                   }`}>
                     {pipelineActive && streamStatus !== 'OFFLINE' ? packetLoss.toFixed(2) : '0.00'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#02030a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Volumetric Transmission Log</span>
                 {streamStatus === 'BUFFERING' && <span className="text-yellow-400 animate-pulse">Warming Edge Cache...</span>}
                 {streamStatus === 'LIVE_SYNC' && <span className="text-teal-400 animate-pulse">Holo-Sync Locked</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-500 font-bold' :
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
            
            {/* Stage Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">MAIN STAGE POV</span>
                <span className="text-[8px] font-mono text-slate-400">PHYSICAL VS VIRTUAL</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-end justify-center pb-4">
                
                {/* Stage Floor */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900 border-t-2 border-slate-700 z-10 transform perspective-1000 rotateX-45"></div>

                {/* Lighting Rigs */}
                <div className="absolute top-0 left-[20%] w-2 h-40 bg-gradient-to-b from-indigo-500/40 to-transparent z-0 transform -rotate-12"></div>
                <div className="absolute top-0 right-[20%] w-2 h-40 bg-gradient-to-b from-indigo-500/40 to-transparent z-0 transform rotate-12"></div>

                <div className="relative w-full h-full flex items-end justify-center pb-12 z-20 space-x-8">
                  
                  {/* Real Artist */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-32 bg-slate-400 rounded-t-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
                    <span className="text-[8px] font-black text-slate-500 mt-2 bg-black/80 px-2 rounded">PHYSICAL</span>
                  </div>

                  {/* Holographic Mesh Display */}
                  <div className="w-24 h-48 border-x border-t border-cyan-900/30 bg-cyan-900/5 relative flex flex-col items-center justify-end pb-2 overflow-hidden">
                     {/* Scanlines / Mesh effect */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiM2N2U4ZjkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] pointer-events-none"></div>

                     {!pipelineActive || streamStatus === 'OFFLINE' ? (
                       <span className="text-[8px] font-black text-slate-600 mt-2 absolute bottom-2">MESH TRANSPARENT</span>
                     ) : streamStatus === 'BUFFERING' ? (
                       <div className="w-full h-full flex flex-col items-center justify-center">
                         <div className="w-8 h-8 border-2 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-2"></div>
                         <span className="text-[8px] font-black text-cyan-500 animate-pulse">WARMING CACHE...</span>
                       </div>
                     ) : (
                       // The Hologram
                       <>
                         <div className="relative z-30">
                           {/* Holographic Glow */}
                           <div className="absolute inset-0 bg-cyan-400/20 blur-xl scale-150"></div>
                           <div className="absolute inset-0 bg-teal-400/30 blur-md scale-110"></div>
                           
                           {/* The 3D Figure */}
                           <div className="w-12 h-32 bg-gradient-to-t from-cyan-400 via-teal-300 to-white rounded-t-full animate-pulse opacity-90 shadow-[0_0_30px_#2dd4bf]"></div>
                           
                           {/* Glitch artifacts */}
                           <div className="absolute top-[20%] left-[-2px] w-14 h-1 bg-white/50 opacity-0 animate-[glitch_3s_infinite_random]"></div>
                           <div className="absolute top-[60%] left-[-4px] w-16 h-0.5 bg-cyan-300/80 opacity-0 animate-[glitch_2.5s_infinite_random]"></div>
                           <style>{`
                             @keyframes glitch {
                               0% { opacity: 0; transform: translateX(0); }
                               2% { opacity: 1; transform: translateX(2px); }
                               4% { opacity: 0; transform: translateX(-2px); }
                               100% { opacity: 0; transform: translateX(0); }
                             }
                           `}</style>
                         </div>
                         <span className="text-[8px] font-black text-teal-300 mt-2 bg-black/80 px-2 rounded z-30 border border-teal-900/50">VOLUMETRIC</span>
                       </>
                     )}
                  </div>

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerCameo}
                disabled={!pipelineActive || streamStatus !== 'OFFLINE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !pipelineActive || streamStatus !== 'OFFLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-teal-950/40 border-teal-900 text-teal-400 hover:bg-teal-900/60'
                }`}
              >
                Trigger Guest Cameo
              </button>
              
              <button 
                onClick={endCameo}
                disabled={streamStatus === 'OFFLINE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  streamStatus === 'OFFLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Terminate Stream
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HolographicEdgeRendering;
