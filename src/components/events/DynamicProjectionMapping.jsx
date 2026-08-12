/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicProjectionMapping = () => {
  const [mappingActive, setMappingActive] = useState(false);
  const [windSimulation, setWindSimulation] = useState(false);
  
  // CV and Projection Metrics
  const [fps, setFps] = useState(0);
  const [trackingConfidence, setTrackingConfidence] = useState(99.8);
  const [warpOffset, setWarpOffset] = useState({ x: 0, y: 0, skewX: 0 }); // In pixels/degrees
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: '4K Projector Array initialized.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Computer Vision Edge Detection armed.' }
  ]);

  // Stage Architecture Contours (Simulated 3D points of the physical stage)
  const [stagePoints, setStagePoints] = useState([
      { id: 'TL', x: 20, y: 20 },
      { id: 'TR', x: 80, y: 20 },
      { id: 'BL', x: 10, y: 80 },
      { id: 'BR', x: 90, y: 80 },
      { id: 'C', x: 50, y: 50 } // Center focal point
  ]);

  useEffect(() => {
    let loop;
    
    if (mappingActive) {
      loop = setInterval(() => {
          setFps(Math.floor(Math.random() * 5 + 58)); // 58-62 fps
          
          if (windSimulation) {
              setTrackingConfidence(Math.max(94.0, Math.min(98.5, trackingConfidence + (Math.random()*4-2))));
              
              // Simulate physical stage swaying in the wind
              const swayX = Math.sin(Date.now() / 500) * 8; // Max 8% sway
              const swayY = Math.cos(Date.now() / 800) * 3;
              const skew = Math.sin(Date.now() / 400) * 5;
              
              setWarpOffset({ x: swayX, y: swayY, skewX: skew });
              
              setStagePoints([
                  { id: 'TL', x: 20 + swayX, y: 20 + swayY },
                  { id: 'TR', x: 80 + swayX, y: 20 + swayY },
                  { id: 'BL', x: 10 + swayX, y: 80 + swayY },
                  { id: 'BR', x: 90 + swayX, y: 80 + swayY },
                  { id: 'C', x: 50 + swayX, y: 50 + swayY }
              ]);

          } else {
              setTrackingConfidence(99.9);
              setWarpOffset({ x: 0, y: 0, skewX: 0 });
              setStagePoints([
                  { id: 'TL', x: 20, y: 20 },
                  { id: 'TR', x: 80, y: 20 },
                  { id: 'BL', x: 10, y: 80 },
                  { id: 'BR', x: 90, y: 80 },
                  { id: 'C', x: 50, y: 50 }
              ]);
          }

      }, 1000 / 60); // 60 updates per second for smooth simulation
    } else {
        setFps(0);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [mappingActive, windSimulation, trackingConfidence]);

  const toggleWind = () => {
    if (mappingActive) {
      const newWindState = !windSimulation;
      setWindSimulation(newWindState);
      if (newWindState) {
          addLog('WARN', 'High wind sheer detected (35mph). Physical structure swaying.');
          addLog('AI', 'Dynamic perspective warping engaged. Re-calculating grid.');
      } else {
          addLog('SUCCESS', 'Wind subsided. Structure stabilized to origin vectors.');
      }
    }
  };

  const toggleMapping = () => {
    if (!mappingActive) {
      setMappingActive(true);
      addLog('SYS', 'CV Contour Tracking online. Projectors synchronized to 3D geometry.');
    } else {
      setMappingActive(false);
      setWindSimulation(false);
      setWarpOffset({ x: 0, y: 0, skewX: 0 });
      setStagePoints([
          { id: 'TL', x: 20, y: 20 },
          { id: 'TR', x: 80, y: 20 },
          { id: 'BL', x: 10, y: 80 },
          { id: 'BR', x: 90, y: 80 },
          { id: 'C', x: 50, y: 50 }
      ]);
      addLog('WARN', 'CV Cameras Offline. Relying on static calibration grid.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05090f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Mapping Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> Real-Time Projection Mapping
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Projection Mapping <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">via Computer Vision</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Projection mapping onto complex physical stage structures requires hours of manual calibration. If strong wind or crowd vibrations shift the physical stage even slightly, the projection breaks, bleeding light into the sky and looking distorted. Eventra integrates computer vision cameras focused on the physical architecture. The system uses real-time edge detection and spatial tracking to continuously map the precise 3D geometry of the moving structure. It dynamically warps and recalculates the video output of the massive 4K projectors at 60 FPS, ensuring the visual illusion remains pixel-perfect.
          </p>

          <div className="bg-[#0b101c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">📐</span> Spatial Warping Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMapping}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     mappingActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {mappingActive ? 'Disable CV Tracking' : 'Initialize CV Edge Detection'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Engine FPS */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mappingActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Target
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     mappingActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {fps}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">FPS</span>
                 </div>
               </div>

               {/* Tracking Confidence */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 windSimulation ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 mappingActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Tracking Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     windSimulation ? 'text-indigo-400' :
                     mappingActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {trackingConfidence.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Warp Offset X */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 windSimulation ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   X-Axis Deformation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     windSimulation ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {warpOffset.x.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">cm</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05080c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Contour Mapping Log</span>
                 {windSimulation && <span className="text-indigo-400 animate-pulse">Warping output to match physical sway...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">CAMERA POV</span>
                <span className="text-[8px] font-mono text-slate-400">EDGE DETECTION OVERLAY</span>
              </div>

              <div className="flex-1 relative bg-[#020408] overflow-hidden flex flex-col items-center justify-center p-8">
                
                {!mappingActive ? (
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING CALIBRATION</span>
                ) : (
                  <>
                    {/* The Physical Stage Architecture (represented by connecting the points) */}
                    <div className="absolute inset-0 z-10 p-8">
                        <svg className="w-full h-full overflow-visible">
                            {/* Original Static Calibration Outline (where the projector WOULD shoot if not corrected) */}
                            {windSimulation && (
                                <polygon 
                                   points="20%,20% 80%,20% 90%,80% 10%,80%" 
                                   fill="none" 
                                   stroke="rgba(239, 68, 68, 0.4)" 
                                   strokeWidth="1" 
                                   strokeDasharray="4 4"
                                />
                            )}
                            
                            {/* Dynamic Physical Stage Outline (moving in wind) */}
                            <polygon 
                               points={`${stagePoints[0].x}%,${stagePoints[0].y}% ${stagePoints[1].x}%,${stagePoints[1].y}% ${stagePoints[3].x}%,${stagePoints[3].y}% ${stagePoints[2].x}%,${stagePoints[2].y}%`} 
                               fill="none" 
                               stroke="#4f46e5" 
                               strokeWidth="2"
                               className="transition-all duration-75 ease-linear"
                            />
                            
                            {/* Inner Grid Warping */}
                            <line x1={`${stagePoints[0].x}%`} y1={`${stagePoints[0].y}%`} x2={`${stagePoints[3].x}%`} y2={`${stagePoints[3].y}%`} stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.5" className="transition-all duration-75 ease-linear" />
                            <line x1={`${stagePoints[1].x}%`} y1={`${stagePoints[1].y}%`} x2={`${stagePoints[2].x}%`} y2={`${stagePoints[2].y}%`} stroke="#4f46e5" strokeWidth="0.5" strokeOpacity="0.5" className="transition-all duration-75 ease-linear" />

                            {/* Tracking Nodes */}
                            {stagePoints.map((p, i) => (
                                <circle 
                                  key={i} 
                                  cx={`${p.x}%`} 
                                  cy={`${p.y}%`} 
                                  r="4" 
                                  fill="#22d3ee"
                                  className="transition-all duration-75 ease-linear"
                                />
                            ))}
                        </svg>
                    </div>

                    {/* Projected Content (Warping to fit the moving physical polygon) */}
                    <div 
                        className="absolute z-20 w-[60%] h-[60%] bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-60 mix-blend-screen overflow-hidden flex items-center justify-center transition-all duration-75 ease-linear"
                        style={{
                           // Simulate perspective warping using transform matrix/skew based on physical tracking
                           clipPath: `polygon(
                               ${(stagePoints[0].x - 20) * 1.5 + 0}% ${(stagePoints[0].y - 20) * 1.5 + 0}%, 
                               ${(stagePoints[1].x - 20) * 1.5 + 100}% ${(stagePoints[1].y - 20) * 1.5 + 0}%, 
                               ${(stagePoints[3].x - 10) * 1.5 + 100}% ${(stagePoints[3].y - 20) * 1.5 + 100}%, 
                               ${(stagePoints[2].x - 10) * 1.5 + 0}% ${(stagePoints[2].y - 20) * 1.5 + 100}%
                           )`,
                           transform: `skewX(${warpOffset.skewX}deg) translateX(${warpOffset.x}px) translateY(${warpOffset.y}px)`
                        }}
                    >
                       {/* Projected Visual Loop */}
                       <div className="w-[150%] h-[150%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwbC00MCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] animate-[spin_10s_linear_infinite]"></div>
                    </div>

                    {/* HUD Alerts */}
                    {windSimulation && (
                       <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
                           <div className="bg-indigo-950/80 border border-indigo-500/50 px-3 py-1 rounded flex items-center shadow-[0_0_15px_rgba(79,70,229,0.5)] backdrop-blur-sm">
                              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1 animate-pulse"></span>
                                  DYNAMIC WARPING ACTIVE
                              </span>
                           </div>
                       </div>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-1 gap-3">
              <button 
                onClick={toggleWind}
                disabled={!mappingActive}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !mappingActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  windSimulation ? 'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60' :
                  'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:bg-indigo-900/60'
                }`}
              >
                {windSimulation ? 'Stop Wind Gust' : 'Simulate 35mph Wind Gust'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicProjectionMapping;
