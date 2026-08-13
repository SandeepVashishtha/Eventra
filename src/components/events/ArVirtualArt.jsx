/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ArVirtualArt = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // AR Metrics
  const [activeViewers, setActiveViewers] = useState(0); 
  const [renderLatency, setRenderLatency] = useState(0); // ms
  const [polygonCount, setPolygonCount] = useState(1.2); // Millions
  const [spatialAnchors, setSpatialAnchors] = useState(4); // GPS anchors
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'WebXR Render Engine Initialized.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting spatial mapping data...' }
  ]);

  // Visualizer State
  const [jellyfishY, setJellyfishY] = useState(0);
  const [jellyfishScale, setJellyfishScale] = useState(1);
  const [wireframeMode, setWireframeMode] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveViewers(4250 + Math.floor(Math.random() * 50));
          setRenderLatency(16 + Math.random() * 8); // e.g. 60fps ~ 16ms
          
          // Animate Jellyfish floating
          const time = Date.now() / 1000;
          setJellyfishY(Math.sin(time) * 10);
          setJellyfishScale(1 + Math.sin(time * 2) * 0.05); // Pulsing

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const toggleWireframe = () => {
      if (!systemActive) return;
      setWireframeMode(!wireframeMode);
      if (!wireframeMode) {
          addLog('ACTION', 'Developer mode: Toggled 3D Mesh Wireframes.');
          setPolygonCount(0.8);
      } else {
          addLog('ACTION', 'Developer mode: Toggled High-Fidelity Textures.');
          setPolygonCount(1.2);
      }
  };

  const spawnNewArt = () => {
      if (!systemActive) return;
      setSpatialAnchors(prev => prev + 1);
      addLog('SUCCESS', 'Artist uploaded new spatial anchor: "Cyber-Lotus".');
      addLog('SYS', 'Pushing 3D assets to Edge CDN for local WebXR clients.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'AR Layer Active. Connecting to 4,200+ local WebXR clients.');
    } else {
      setSystemActive(false);
      setActiveViewers(0);
      setRenderLatency(0);
      addLog('WARN', 'AR Layer Offline. Virtual installations desynced.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕶️</span> WebXR Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Augmented Reality <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500">Virtual Art Installations</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Physical art installations are extremely expensive to transport, vulnerable to vandalism, and take up valuable real estate in dense festival crowds. Eventra solves this by implementing a WebXR-based Augmented Reality layer in the Eventra app. Artists can upload massive, 3D animated virtual sculptures (e.g., a 100-foot floating glowing jellyfish) anchored to specific GPS coordinates. Attendees simply hold up their phones to view, interact with, and record videos of the art seamlessly integrated into the physical festival environment, with zero physical footprint.
          </p>

          <div className="bg-[#05070a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> WebXR Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable AR Layer' : 'Initialize Spatial Anchors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Viewers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-pink-950/20 border-pink-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active AR Viewers
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {activeViewers.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Spatial Anchors */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   GPS Anchors
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {spatialAnchors}
                   </span>
                 </div>
               </div>
               
               {/* Polygon Count */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 wireframeMode ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Detail
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     wireframeMode ? 'text-cyan-400' : 'text-slate-300'
                   }`}>
                     {systemActive ? polygonCount.toFixed(1) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">M tris</span>
                 </div>
               </div>
               
               {/* Render Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Client Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {renderLatency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebXR Spatial Ledger</span>
                 {systemActive && <span className="text-pink-400 font-black animate-pulse">TRACKING VIRTUAL CAMERA</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* AR App UI Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[500px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              {/* Phone Header */}
              <div className="absolute top-0 inset-x-0 p-2 text-center z-40 pointer-events-none flex justify-between bg-black/40 backdrop-blur-md">
                <span className="text-[10px] font-black text-white ml-4 drop-shadow-md">9:41</span>
                <span className="text-[10px] font-black text-white mr-4 drop-shadow-md">📶 🔋</span>
              </div>
              
              {/* AR Overlay Header */}
              {systemActive && (
                  <div className="absolute top-10 inset-x-4 flex justify-between items-center z-40">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span>
                          <span className="text-white text-[10px] font-bold">REC</span>
                      </div>
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                          <span className="text-pink-400 text-[10px] font-bold tracking-widest uppercase">GPS Anchored</span>
                      </div>
                  </div>
              )}

              <div className="flex-1 relative flex flex-col overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
                         <span className="text-4xl mb-4 text-slate-600">📸</span>
                         <span className="text-sm font-bold text-slate-500 mb-2">Camera Offline</span>
                         <p className="text-[10px] text-slate-600">Enable AR Layer to view spatial installations.</p>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Fake Camera Feed Background (Festival Crowd) */}
                        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                            {/* Silhouettes of a crowd */}
                            <div className="absolute bottom-0 w-full h-1/3 bg-black opacity-80" style={{ clipPath: 'polygon(0% 100%, 5% 80%, 10% 90%, 15% 75%, 20% 85%, 25% 70%, 30% 90%, 35% 80%, 40% 95%, 45% 75%, 50% 85%, 55% 80%, 60% 90%, 65% 70%, 70% 85%, 75% 80%, 80% 95%, 85% 75%, 90% 85%, 95% 70%, 100% 100%)' }}></div>
                            <div className="absolute bottom-0 w-full h-1/4 bg-slate-800 opacity-60" style={{ clipPath: 'polygon(0% 100%, 8% 70%, 18% 85%, 28% 65%, 38% 80%, 48% 75%, 58% 85%, 68% 70%, 78% 85%, 88% 75%, 98% 85%, 100% 100%)' }}></div>
                            
                            {/* Festival Lights */}
                            <div className="absolute top-1/2 left-1/4 w-1 h-32 bg-cyan-500/30 blur-md transform -translate-y-1/2 rotate-45"></div>
                            <div className="absolute top-1/2 right-1/4 w-1 h-32 bg-purple-500/30 blur-md transform -translate-y-1/2 -rotate-45"></div>
                        </div>

                        {/* 3D AR Object (Jellyfish) */}
                        <div 
                            className="absolute top-[40%] left-1/2 -translate-x-1/2 transition-transform duration-75 flex flex-col items-center drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                            style={{ 
                                transform: `translate(-50%, ${jellyfishY}px) scale(${jellyfishScale})`,
                            }}
                        >
                            {wireframeMode ? (
                                /* Wireframe version */
                                <div className="relative w-40 h-40 flex flex-col items-center opacity-80">
                                    <div className="w-32 h-20 border border-cyan-400 rounded-t-full rounded-b-[40%] absolute top-0 animate-pulse bg-transparent"></div>
                                    <div className="w-28 h-4 border-b border-cyan-400 rounded-[50%] absolute top-10 transform rotate-12"></div>
                                    <div className="w-28 h-4 border-b border-cyan-400 rounded-[50%] absolute top-10 transform -rotate-12"></div>
                                    
                                    {/* Tentacles */}
                                    <svg className="absolute top-16 w-32 h-32 overflow-visible stroke-cyan-400 fill-none" strokeWidth="0.5" strokeDasharray="2">
                                        <path d="M 30,0 Q 20,40 30,80 T 25,120" />
                                        <path d="M 50,0 Q 40,40 55,80 T 45,120" />
                                        <path d="M 70,0 Q 80,40 65,80 T 75,120" />
                                        <path d="M 90,0 Q 100,40 90,80 T 95,120" />
                                    </svg>
                                </div>
                            ) : (
                                /* High-Fidelity version */
                                <div className="relative w-40 h-40 flex flex-col items-center">
                                    <div className="w-32 h-20 bg-gradient-to-b from-pink-400/80 to-purple-500/40 rounded-t-full rounded-b-[40%] absolute top-0 backdrop-blur-sm border border-pink-300/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"></div>
                                    <div className="absolute top-14 flex space-x-1 justify-center w-full">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="w-3 h-3 rounded-full bg-pink-300/60 blur-[1px]"></div>
                                        ))}
                                    </div>
                                    
                                    {/* Tentacles */}
                                    <svg className="absolute top-16 w-32 h-32 overflow-visible stroke-pink-300/60 fill-none" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(236,72,153,0.8))' }}>
                                        <path d="M 30,0 Q 20,40 30,80 T 25,120" className="animate-pulse" style={{ animationDelay: '0ms' }} />
                                        <path d="M 50,0 Q 40,40 55,80 T 45,120" className="animate-pulse" style={{ animationDelay: '200ms' }} />
                                        <path d="M 70,0 Q 80,40 65,80 T 75,120" className="animate-pulse" style={{ animationDelay: '400ms' }} />
                                        <path d="M 90,0 Q 100,40 90,80 T 95,120" className="animate-pulse" style={{ animationDelay: '600ms' }} />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Spatial Anchor Label */}
                            <div className="absolute -bottom-10 bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10 rounded pointer-events-none">
                                <span className="text-[8px] font-mono text-white">Obj: 'Neon-Jelly_01'</span><br/>
                                <span className="text-[6px] font-mono text-slate-400">Dist: 45.2m</span>
                            </div>
                        </div>

                        {/* Scanner UI overlays */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/4 left-8 w-6 h-6 border-t-2 border-l-2 border-white/30"></div>
                            <div className="absolute top-1/4 right-8 w-6 h-6 border-t-2 border-r-2 border-white/30"></div>
                            <div className="absolute bottom-1/4 left-8 w-6 h-6 border-b-2 border-l-2 border-white/30"></div>
                            <div className="absolute bottom-1/4 right-8 w-6 h-6 border-b-2 border-r-2 border-white/30"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full"></div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#05070a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate AR Interactions</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={toggleWireframe}
                   disabled={!systemActive}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                   }`}
                 >
                   📐 {wireframeMode ? 'Render High-Res' : 'Show Wireframe'}
                 </button>
                 
                 <button 
                   onClick={spawnNewArt}
                   disabled={!systemActive}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                   }`}
                 >
                   🎨 Upload New Art
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ArVirtualArt;
