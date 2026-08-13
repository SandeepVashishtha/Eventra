/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ArWayfindingAnchors = () => {
  const [arActive, setArActive] = useState(false);
  
  // AR Metrics
  const [activeSessions, setActiveSessions] = useState(0); 
  const [anchorsCreated, setAnchorsCreated] = useState(2405); 
  const [gpsAccuracy, setGpsAccuracy] = useState(12.5); // meters
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:20:00', type: 'SYS', msg: 'WebXR / ARCore session initialized. Waiting for camera permissions.' },
    { id: 2, time: '14:20:02', type: 'SYS', msg: 'High-precision Geolocation API standby.' }
  ]);

  // Visualizer State
  const [spatialAnchorDropped, setSpatialAnchorDropped] = useState(false);
  const [distanceToAnchor, setDistanceToAnchor] = useState(0);
  const [cameraPan, setCameraPan] = useState(0);

  useEffect(() => {
    let loop;
    
    if (arActive) {
      loop = setInterval(() => {
          setActiveSessions(prev => Math.min(8402, prev + Math.floor(Math.random() * 20)));
          setGpsAccuracy(2.1 + (Math.random() * 1.5)); // High precision achieved when AR is active
          
          if (spatialAnchorDropped) {
             setCameraPan(Math.sin(Date.now() / 1000) * 15); // gentle swaying to simulate phone held in hand
          }
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [arActive, spatialAnchorDropped]);

  const toggleAr = () => {
      setArActive(!arActive);
      if (!arActive) {
          addLog('SUCCESS', 'Camera access granted. WebXR Device API active.');
          addLog('SYS', 'Mapping localized point cloud environment...');
      } else {
          addLog('WARN', 'AR session terminated. Returning to standard 2D Maps.');
          setSpatialAnchorDropped(false);
          setActiveSessions(0);
          setGpsAccuracy(12.5);
      }
  };

  const dropAnchor = () => {
      if (!arActive) return;
      setSpatialAnchorDropped(true);
      setDistanceToAnchor(142); // meters away initially
      setAnchorsCreated(prev => prev + 1);
      
      addLog('ACTION', 'Dropped Persistent Spatial Anchor at [Lat: 33.72, Lon: -116.23]');
      addLog('SUCCESS', 'Anchor sync via Cloud Anchors API complete. Shareable link generated.');
  };
  
  const simulateWalking = () => {
      if (!arActive || !spatialAnchorDropped || distanceToAnchor <= 0) return;
      
      setDistanceToAnchor(prev => {
          const next = prev - 25;
          if (next <= 0) {
              addLog('SUCCESS', 'ARRIVED: Spatial Anchor destination reached.');
              return 0;
          }
          addLog('SYS', `Tracking... ${next} meters to anchor.`);
          return next;
      });
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👓</span> Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AR Wayfinding with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">Persistent Spatial Anchors</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees get hopelessly lost trying to find their friends or specific tents in crowded, visually uniform camping grounds at night. Standard GPS pins are practically useless, drifting by 10-20 meters and providing zero directional context. Eventra solves this by implementing a software-based Augmented Reality (AR) wayfinding system via WebXR. Users drop virtual "Spatial Anchors" in their physical environment. Friends can follow rendered, glowing 3D arrows through their phone camera UI that guide them directly to the exact spatial coordinate.
          </p>

          <div className="bg-[#0b0602] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> WebXR Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAr}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     arActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                   {arActive ? 'Deactivate Camera' : 'Launch AR Session'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Engine State */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 arActive ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Spatial Mapping
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     arActive ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {arActive ? 'TRACKING_ACTIVE' : 'IDLE'}
                   </span>
                 </div>
               </div>

               {/* GPS Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 arActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   GPS Drift
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     arActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     ±{gpsAccuracy.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m</span>
                 </div>
               </div>
               
               {/* Global Anchors */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Global Anchors
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {anchorsCreated}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030100] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ARCore Session Ledger</span>
                 {spatialAnchorDropped && <span className="text-orange-400 font-black animate-pulse">RENDERING 3D OVERLAYS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-500 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* Mobile AR Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !arActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-40 bg-gradient-to-b from-black/80 to-transparent">
                  <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow-md">AR Navigation</span>
                  <div className="flex gap-2">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${arActive ? 'bg-amber-900/50 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-500'}`}>
                          WebXR
                      </span>
                  </div>
              </div>

              <div className="flex-1 relative overflow-hidden bg-[#0d121c]">
                  
                  {!arActive ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in-up z-20 p-6">
                         <span className="text-6xl mb-6 opacity-30 grayscale">📸</span>
                         <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Camera Inactive</h3>
                         <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">Activate the camera to render AR spatial anchors in your physical environment.</p>
                     </div>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden">
                        
                        {/* Fake Camera Feed Background (Blurred festival image approximation) */}
                        <div className="absolute inset-0 bg-slate-900 opacity-60">
                            {/* Simulate point cloud scanning */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxmaWx0ZXIgaWQ9J24nPjxmZVR1cmJ1bGVuY2UgdHlwZT0nZnJhY3RhbE5vaXNlJyBiYXNlRnJlcXVlbmN5PScwLjk5JyBudW1PY3RhdmVzPScyJyBzdGl0Y2hUaWxlcz0nc3RpdGNoJy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI24pJyBvcGFjaXR5PScwLjA1Jy8+PC9zdmc+')] mix-blend-screen opacity-30"></div>
                            
                            {/* Scanning reticle */}
                            {!spatialAnchorDropped && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-white/20 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white/80 rounded-tl"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white/80 rounded-tr"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white/80 rounded-bl"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white/80 rounded-br"></div>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white font-mono tracking-widest whitespace-nowrap animate-pulse">SCANNING ENVIRONMENT</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3D AR Layer */}
                        {spatialAnchorDropped && (
                            <div 
                                className="absolute inset-0 flex justify-center items-center transition-transform duration-300 ease-out preserve-3d"
                                style={{ perspective: '800px', transform: `translateX(${cameraPan}px)` }}
                            >
                                
                                {distanceToAnchor > 0 ? (
                                    /* Distant AR Arrow Path */
                                    <div className="flex flex-col items-center justify-end h-full pb-32 animate-fade-in-up">
                                        
                                        {/* Floating glowing arrow */}
                                        <div className="w-16 h-16 relative animate-bounce z-30 mb-8" style={{ transform: 'rotateX(45deg)' }}>
                                            <div className="absolute inset-0 bg-orange-500 rounded-full blur-[20px] opacity-60"></div>
                                            <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[40px] border-b-orange-400 mx-auto relative z-10 drop-shadow-[0_0_10px_#f97316]"></div>
                                            <div className="w-6 h-8 bg-orange-400 mx-auto relative -mt-1 z-10 drop-shadow-[0_0_10px_#f97316]"></div>
                                        </div>
                                        
                                        {/* Distance Tag */}
                                        <div className="bg-black/70 backdrop-blur border border-orange-500/50 text-white px-3 py-1 rounded-full text-xs font-black font-mono shadow-[0_0_20px_rgba(249,115,22,0.4)] z-30">
                                            {distanceToAnchor}m AHEAD
                                        </div>

                                        {/* Simulated AR Path on Ground */}
                                        <div className="w-full h-48 absolute bottom-0 perspective-ground border-x border-orange-500/20" style={{ background: 'linear-gradient(to top, rgba(249, 115, 22, 0.2), transparent)' }}></div>

                                    </div>
                                ) : (
                                    /* Arrived at Anchor */
                                    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up z-30">
                                        <div className="w-24 h-24 relative mb-4">
                                            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[30px] opacity-70 animate-pulse"></div>
                                            <div className="w-full h-full bg-emerald-500/20 border-4 border-emerald-400 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_#34d399]">
                                                <span className="text-4xl">📍</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/80 backdrop-blur border border-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest text-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                                            Destination<br/>Reached
                                        </div>
                                    </div>
                                )}
                                
                            </div>
                        )}
                        
                    </div>
                  )}

              </div>
              
              {/* Fake Phone UI Overlays */}
              {arActive && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur flex items-center justify-center z-50 shadow-lg cursor-pointer">
                     <div className="w-8 h-8 bg-white rounded-full"></div>
                 </div>
              )}
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0b0602] p-4 rounded-xl border border-slate-800 flex space-x-2">
               
               <button 
                   onClick={dropAnchor}
                   disabled={!arActive || spatialAnchorDropped}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !arActive || spatialAnchorDropped ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                   }`}
                 >
                   Drop Spatial Anchor
               </button>

               <button 
                   onClick={simulateWalking}
                   disabled={!arActive || !spatialAnchorDropped || distanceToAnchor <= 0}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !arActive || !spatialAnchorDropped || distanceToAnchor <= 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60'
                   }`}
                 >
                   Walk Towards
               </button>

            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d {
            transform-style: preserve-3d;
        }
        .perspective-ground {
            transform: rotateX(60deg) scale(2);
            transform-origin: bottom;
        }
      `}} />

    </div>
  );
};

export default ArWayfindingAnchors;
