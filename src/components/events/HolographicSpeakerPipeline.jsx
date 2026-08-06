import React, { useState, useEffect } from 'react';

const HolographicSpeakerPipeline = () => {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, calibrating, streaming, error
  const [bitrate, setBitrate] = useState(0);

  // Hologram metrics that fluctuate when streaming
  const [metrics, setMetrics] = useState({
    latency: 0,
    fps: 0,
    droppedFrames: 0
  });

  const togglePipeline = () => {
    if (pipelineActive) {
      setPipelineActive(false);
      setStatus('idle');
      setBitrate(0);
      setMetrics({ latency: 0, fps: 0, droppedFrames: 0 });
    } else {
      setPipelineActive(true);
      setStatus('calibrating');
      
      setTimeout(() => {
        setStatus('streaming');
      }, 3000);
    }
  };

  useEffect(() => {
    if (status !== 'streaming') return;

    const interval = setInterval(() => {
      // Simulate WebRTC metrics for volumetric video
      setBitrate(prev => {
        const target = 45000 + (Math.random() * 5000); // ~45-50 Mbps for volumetric 4K
        return Math.floor(target);
      });
      
      setMetrics({
        latency: Math.floor(12 + Math.random() * 8), // 12-20ms
        fps: 60 - Math.floor(Math.random() * 2), // 59-60fps
        droppedFrames: Math.random() > 0.95 ? 1 : 0 // rare dropped frame
      });
    }, 500);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full animate-pulse">
                Experimental AV
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Holographic Projection Pipeline</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Ditch the massive carbon footprint of international flights and boring Zoom screens. Our WebRTC rendering engine processes a volumetric green-screen feed from a remote speaker's studio and outputs a stereoscopic signal for jaw-dropping, life-size 3D holographic projection live on your physical stage.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Pipeline Controls & Telemetry (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">WebRTC Render Engine</h3>
              
              <button 
                onClick={togglePipeline}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center shadow-lg ${pipelineActive ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50'}`}
              >
                {pipelineActive ? '■ Terminate Connection' : '▶ Initialize Holo-Stream'}
              </button>
            </div>

            {/* Pipeline Status Blocks */}
            <div className="space-y-4 mb-8">
              
              {/* Studio Input */}
              <div className={`p-4 rounded-xl border transition-all ${status === 'streaming' || status === 'calibrating' ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center">
                    <span className="text-lg mr-2">🎙️</span> Remote Studio Feed
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${status === 'streaming' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {status === 'streaming' ? 'Receiving 4K Volumetric' : 'Offline'}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${status === 'streaming' ? 'bg-emerald-500 w-full' : 'w-0'}`}></div>
                </div>
              </div>

              {/* Eventra Processing */}
              <div className={`p-4 rounded-xl border transition-all ${status === 'streaming' ? 'bg-cyan-950/30 border-cyan-500/50' : status === 'calibrating' ? 'bg-amber-950/30 border-amber-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center">
                    <span className="text-lg mr-2">⚙️</span> Eventra Engine
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${status === 'streaming' ? 'bg-cyan-900/50 text-cyan-400' : status === 'calibrating' ? 'bg-amber-900/50 text-amber-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    {status === 'calibrating' ? 'Calibrating Chroma Key...' : status === 'streaming' ? 'Rendering Stereoscopic' : 'Standby'}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${status === 'streaming' ? 'bg-cyan-500 w-full' : status === 'calibrating' ? 'bg-amber-500 w-1/2 animate-pulse' : 'w-0'}`}></div>
                </div>
              </div>

              {/* Stage Output */}
              <div className={`p-4 rounded-xl border transition-all ${status === 'streaming' ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center">
                    <span className="text-lg mr-2">📽️</span> Physical Venue Projector
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${status === 'streaming' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {status === 'streaming' ? 'Live on Stage' : 'No Signal'}
                  </span>
                </div>
              </div>

            </div>

            {/* Network Telemetry */}
            <div className="mt-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Live Network Telemetry</h4>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-[10px] text-slate-400 block uppercase font-mono">Bandwidth</span>
                   <span className={`text-xl font-black transition-colors ${status === 'streaming' ? 'text-emerald-400' : 'text-slate-600'}`}>
                     {(bitrate / 1000).toFixed(1)} <span className="text-[10px]">Mbps</span>
                   </span>
                 </div>
                 <div>
                   <span className="text-[10px] text-slate-400 block uppercase font-mono">Latency</span>
                   <span className={`text-xl font-black transition-colors ${status === 'streaming' ? 'text-cyan-400' : 'text-slate-600'}`}>
                     {metrics.latency} <span className="text-[10px]">ms</span>
                   </span>
                 </div>
                 <div>
                   <span className="text-[10px] text-slate-400 block uppercase font-mono">Render FPS</span>
                   <span className={`text-xl font-black transition-colors ${status === 'streaming' ? 'text-purple-400' : 'text-slate-600'}`}>
                     {metrics.fps}
                   </span>
                 </div>
                 <div>
                   <span className="text-[10px] text-slate-400 block uppercase font-mono">Dropped Frames</span>
                   <span className={`text-xl font-black transition-colors ${metrics.droppedFrames > 0 ? 'text-amber-500' : 'text-slate-600'}`}>
                     {metrics.droppedFrames}
                   </span>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* Right Side: Visual Output Simulator (Col span 7) */}
        <div className="lg:col-span-7 bg-black rounded-3xl border-4 border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="absolute top-4 left-4 z-20 flex space-x-2">
            <span className="bg-black/60 backdrop-blur-sm border border-slate-700 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
              Output: Venue Hologram Projector
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20">
            {status === 'streaming' && (
               <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded flex items-center shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse">
                 <span className="w-2 h-2 bg-white rounded-full mr-2"></span> LIVE
               </span>
            )}
          </div>

          {/* Hologram Stage Visualization */}
          <div className="flex-1 relative flex items-end justify-center pb-20">
            
            {/* The physical stage (dark) */}
            <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
            <div className="absolute bottom-0 w-3/4 h-8 bg-slate-800 rounded-t-[100%] mx-auto z-10 opacity-50 shadow-[0_-10px_30px_rgba(0,0,0,1)]"></div>

            {status === 'idle' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 z-20">
                <span className="text-6xl mb-4 opacity-50">📽️</span>
                <p className="font-mono text-sm uppercase tracking-widest">Awaiting Volumetric Signal</p>
              </div>
            ) : status === 'calibrating' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                {/* Calibration Grid */}
                <div className="w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center relative">
                  <div className="absolute w-full h-px bg-cyan-500/50"></div>
                  <div className="absolute h-full w-px bg-cyan-500/50"></div>
                  <div className="w-full h-full border border-cyan-500/50 rounded-full animate-ping opacity-20"></div>
                </div>
                <p className="font-mono text-cyan-400 text-sm mt-8 uppercase tracking-widest animate-pulse">Applying Chroma Key Mask...</p>
              </div>
            ) : (
              /* The Hologram */
              <div className="relative z-20 animate-fade-in-up">
                
                {/* Volumetric Projection Beam Effect */}
                <div className="absolute -top-64 -inset-x-32 bottom-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-cyan-400/30 blur-2xl z-0" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
                
                {/* The "Speaker" */}
                <div className="relative z-10 w-48 h-96">
                   {/* Fallback silhouette for visual representation */}
                   <div className="absolute inset-0 bg-cyan-100 rounded-t-[100px] opacity-80 mix-blend-screen shadow-[0_0_50px_rgba(6,182,212,0.8)] filter drop-shadow-[0_0_20px_rgba(6,182,212,1)]" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 80% 30%, 100% 40%, 90% 100%, 10% 100%, 0% 40%, 20% 30%)' }}></div>
                   
                   {/* Scanline overlay for holo effect */}
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KPC9zdmc+')] z-20 mix-blend-overlay"></div>
                </div>
                
                {/* Projection Base / Platform */}
                <div className="absolute -bottom-8 -inset-x-12 h-16 bg-cyan-900/50 rounded-full filter blur-md"></div>
                <div className="absolute -bottom-4 -inset-x-4 h-8 bg-cyan-400/80 rounded-full filter blur-xl shadow-[0_0_60px_rgba(34,211,238,1)]"></div>
              </div>
            )}
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default HolographicSpeakerPipeline;
