/* eslint-disable */
import React, { useState, useEffect } from 'react';

const Interactive3DMarketplaceMap = () => {
  const [mapEngineState, setMapEngineState] = useState('UNINITIALIZED'); // UNINITIALIZED, LOADING, READY
  
  // WebGL Metrics
  const [renderedPolygons, setRenderedPolygons] = useState(0); 
  const [activeUsers, setActiveUsers] = useState(0); 
  const [webGlFps, setWebGlFps] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Three.js / React Three Fiber renderer standby.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'Awaiting WebGL context initialization.' }
  ]);

  // Visualizer State
  const [viewAngle, setViewAngle] = useState({ rotateX: 60, rotateZ: -45 }); // Isometric defaults
  
  const [vendors, setVendors] = useState([
      { id: 1, name: 'Spicy Tacos', type: 'FOOD', x: 2, y: 2, waitTime: 4 },
      { id: 2, name: 'Vegan Bowls', type: 'FOOD', x: 5, y: 2, waitTime: 12 },
      { id: 3, name: 'Cold Drinks', type: 'BEVERAGE', x: 2, y: 5, waitTime: 35 }, // Long line
      { id: 4, name: 'Official Merch', type: 'MERCH', x: 5, y: 5, waitTime: 45 }, // Very long line
      { id: 5, name: 'Brand Activation', type: 'BRAND', x: 8, y: 3, waitTime: 2 },
      { id: 6, name: 'Coffee Tent', type: 'BEVERAGE', x: 8, y: 6, waitTime: 8 }
  ]);

  useEffect(() => {
    let loop;
    
    if (mapEngineState === 'READY') {
      loop = setInterval(() => {
          setActiveUsers(prev => Math.min(12500, prev + Math.floor(Math.random() * 15)));
          setWebGlFps(58 + (Math.random() * 2)); // Lock near 60fps
          
          // Randomly update wait times for vendors (simulating POS integration)
          if (Math.random() > 0.7) {
              setVendors(prev => prev.map(v => {
                  if (Math.random() > 0.8) {
                      const newWait = Math.max(1, v.waitTime + (Math.floor(Math.random() * 5) - 2));
                      return { ...v, waitTime: newWait };
                  }
                  return v;
              }));
          }
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [mapEngineState]);

  const initMapEngine = () => {
      setMapEngineState('LOADING');
      addLog('ACTION', 'Mounting React Three Fiber canvas. Compiling shaders...');
      
      let pCount = 0;
      const loadLoop = setInterval(() => {
          pCount += 12000;
          setRenderedPolygons(pCount);
          if (pCount >= 144000) {
              clearInterval(loadLoop);
              setMapEngineState('READY');
              setActiveUsers(3402);
              addLog('SUCCESS', 'WebGL context established. 3D geometry loaded (144k polygons).');
              addLog('SYS', 'Binding real-time POS websocket for wait time telemetry.');
          }
      }, 100);
  };

  const handleDrag = (e) => {
      if (mapEngineState !== 'READY') return;
      // Very basic simulated drag rotation for the isometric view
      // In a real app, orbit controls handle this
  };

  const resetView = () => {
      setViewAngle({ rotateX: 60, rotateZ: -45 });
      addLog('ACTION', 'Camera reset to default isometric projection.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper to color code based on wait times
  const getWaitColor = (minutes) => {
      if (minutes < 10) return 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] text-white';
      if (minutes < 25) return 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-black';
      return 'bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.6)] text-white animate-pulse';
  };

  return (
    <div className="min-h-screen bg-[#000508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> Interactive UI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Web-based 3D Interactive <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500">Marketplace Map</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Standard 2D top-down maps make it incredibly difficult for attendees to visualize and locate specific food vendors or brand activations in dense, multi-level marketplace areas. Eventra solves this by building a highly optimized, interactive 3D map of the festival grounds using Three.js and React Three Fiber. Attendees can intuitively pinch, zoom, and rotate the 3D environment directly in their mobile browser. The map seamlessly integrates with the Point-of-Sale (POS) backend to color-code vendor storefronts based on real-time line wait times.
          </p>

          <div className="bg-[#040b16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🎛️</span> Three.js WebGL Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={initMapEngine}
                   disabled={mapEngineState !== 'UNINITIALIZED'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     mapEngineState !== 'UNINITIALIZED' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-sky-600 hover:bg-sky-500 text-black shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {mapEngineState === 'LOADING' ? 'Compiling Shaders...' : mapEngineState === 'READY' ? 'Canvas Active' : 'Mount 3D Canvas'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Engine State */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mapEngineState === 'LOADING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse' : 
                 mapEngineState === 'READY' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   WebGL Canvas Context
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     mapEngineState === 'LOADING' ? 'text-indigo-400' : 
                     mapEngineState === 'READY' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {mapEngineState}
                   </span>
                 </div>
               </div>

               {/* Polygons */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mapEngineState === 'READY' ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Geometry
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     renderedPolygons > 0 ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {renderedPolygons > 0 ? `${(renderedPolygons / 1000).toFixed(0)}k` : 0}
                   </span>
                 </div>
               </div>
               
               {/* FPS */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mapEngineState === 'READY' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render FPS
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         mapEngineState === 'READY' ? 'text-slate-300' : 'text-slate-600'
                       }`}>
                         {webGlFps.toFixed(0)}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>React Three Fiber Ledger</span>
                 {mapEngineState === 'READY' && <span className="text-sky-400 font-black animate-pulse">DRAW CALLS OPTIMIZED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' : 'text-slate-400'
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
            
            {/* 3D Map Simulator using CSS Isometric Transforms */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                mapEngineState !== 'UNINITIALIZED' ? 'bg-[#0b1121]' : 'bg-black'
            }`}>
              
              <div className="pt-12 pb-4 px-6 border-b border-slate-800 flex justify-between items-center z-40 bg-black/50 backdrop-blur-md absolute top-0 inset-x-0">
                  <span className="text-sm font-black tracking-widest text-white uppercase">Marketplace 3D</span>
                  <div className="flex gap-2">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${mapEngineState === 'READY' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'}`}>
                          POS SYNC
                      </span>
                      <button onClick={resetView} className="text-[8px] font-bold text-sky-400 border border-sky-900 bg-sky-900/30 px-2 rounded uppercase">Reset Cam</button>
                  </div>
              </div>

              <div className="flex-1 relative overflow-hidden" onPointerDown={handleDrag}>
                  
                  {mapEngineState === 'UNINITIALIZED' ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in-up z-20">
                         <span className="text-6xl mb-6 opacity-30 grayscale">🗺️</span>
                         <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">3D Map Engine Offline</h3>
                         <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">Click "Mount 3D Canvas" to initialize WebGL shaders.</p>
                     </div>
                  ) : mapEngineState === 'LOADING' ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0b1121]">
                         <div className="w-16 h-16 border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                         <span className="text-xs font-mono text-sky-400">Loading Geometry...</span>
                     </div>
                  ) : (
                    <div className="absolute inset-0 flex justify-center items-center overflow-hidden bg-[#0a101f]" style={{ perspective: '1000px' }}>
                        
                        {/* 3D Scene Container (CSS Isometric trick) */}
                        <div 
                            className="relative transition-transform duration-500 ease-out preserve-3d"
                            style={{ 
                                width: '300px', 
                                height: '300px',
                                transform: `rotateX(${viewAngle.rotateX}deg) rotateZ(${viewAngle.rotateZ}deg)`
                            }}
                        >
                            
                            {/* Map Base/Ground */}
                            <div className="absolute inset-0 border-4 border-sky-900/40 bg-slate-900/80 shadow-[0_0_50px_rgba(14,165,233,0.1)] rounded-lg grid grid-cols-10 grid-rows-10" style={{ backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)', backgroundSize: '10% 10%' }}>
                                
                                {/* 3D Rendered Vendors */}
                                {vendors.map(v => (
                                    <div 
                                        key={v.id}
                                        className="absolute transition-all duration-500 preserve-3d group cursor-pointer"
                                        style={{
                                            left: `${(v.x / 10) * 100}%`,
                                            top: `${(v.y / 10) * 100}%`,
                                            width: '18%',
                                            height: '18%',
                                            transform: 'translateZ(1px)' // lift off ground slightly
                                        }}
                                    >
                                        {/* The 3D Block (Extruded upwards) */}
                                        <div className={`w-full h-full border absolute transition-all duration-300 transform-style-3d ${getWaitColor(v.waitTime)}`}
                                             style={{ transform: 'translateZ(20px)' /* Height of building */ }}>
                                             
                                             {/* Floating Name Label */}
                                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-[12px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" style={{ transform: `rotateX(-${viewAngle.rotateX}deg) rotateZ(-${viewAngle.rotateZ}deg)` /* counter rotate to face camera */ }}>
                                                 {v.name}
                                             </div>
                                             
                                             {/* Wait time badge (Always visible) */}
                                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap shadow-xl" style={{ transform: `rotateX(-${viewAngle.rotateX}deg) rotateZ(-${viewAngle.rotateZ}deg)` }}>
                                                 {v.waitTime}m
                                             </div>
                                        </div>
                                        
                                        {/* Building Walls (Fake 3D using shadows/borders) */}
                                        <div className="absolute inset-0 bg-black/40 translate-x-[5px] translate-y-[5px] blur-[2px]"></div>
                                    </div>
                                ))}

                                {/* Add a fake "Main Stage" prop to ground the map */}
                                <div className="absolute bg-indigo-900/60 border border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                     style={{ left: '30%', top: '80%', width: '40%', height: '15%', transform: 'translateZ(30px)' }}>
                                    <div className="w-full h-full flex items-center justify-center" style={{ transform: `rotateX(-${viewAngle.rotateX}deg) rotateZ(-${viewAngle.rotateZ}deg)` }}>
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Main Stage</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        {/* On-screen controls */}
                        <div className="absolute bottom-4 inset-x-4 flex justify-between bg-black/60 p-2 rounded-lg backdrop-blur border border-slate-800">
                            <div className="text-[8px] font-bold text-slate-400 uppercase flex flex-col justify-center">
                                <span className="text-emerald-400">&lt; 10m Wait</span>
                                <span className="text-red-500">&gt; 25m Wait</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">+</button>
                                <button className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">-</button>
                            </div>
                        </div>

                    </div>
                  )}

              </div>
              
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d {
            transform-style: preserve-3d;
        }
      `}} />

    </div>
  );
};

export default Interactive3DMarketplaceMap;
