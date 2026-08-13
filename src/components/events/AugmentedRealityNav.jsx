/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AugmentedRealityNav = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [distance, setDistance] = useState(500);
  const [gyroData, setGyroData] = useState({ alpha: 0, beta: 90, gamma: 0 }); // Simulating phone rotation
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Location Services initialized. Rendering static 2D map.' }
  ]);

  // Simulate movement and gyroscope changes
  useEffect(() => {
      if (!isMoving || !isARActive) return;

      const moveInterval = setInterval(() => {
          setDistance(prev => {
              if (prev <= 50) {
                  setIsMoving(false);
                  addLog('SUCCESS', 'Destination Reached: Main Stage. Nav routing complete.');
                  return 0;
              }
              return prev - Math.floor(Math.random() * 15 + 5);
          });
          
          setGyroData(prev => ({
              alpha: prev.alpha + (Math.random() - 0.5) * 10, // Pan left/right
              beta: prev.beta + (Math.random() - 0.5) * 5,    // Tilt up/down
              gamma: prev.gamma + (Math.random() - 0.5) * 5   // Roll
          }));
      }, 800);

      return () => clearInterval(moveInterval);
  }, [isMoving, isARActive]);

  const simulateMovement = () => {
      if (!isARActive) {
          addLog('WARN', 'Cannot simulate AR movement while viewing static 2D map.');
          return;
      }
      setIsMoving(true);
      addLog('ACTION', 'User began walking. Gyroscope and GPS tracking active. Updating AR projection frame.');
  };

  const toggleAR = () => {
      const newState = !isARActive;
      setIsARActive(newState);
      setIsMoving(false);
      setDistance(500);
      setGyroData({ alpha: 0, beta: 90, gamma: 0 });
      
      if (newState) {
          addLog('SUCCESS', 'WebXR Canvas initialized. Accessing device camera and magnetometer.');
          addLog('SYS', 'Calculating 3D vector projection from Geolocation [34.05, -118.24]');
      } else {
          addLog('CRIT', 'WebXR Disabled. Reverting to static PDF map view.');
      }
  };
  
  const resetDemo = () => {
      setIsMoving(false);
      setDistance(500);
      setGyroData({ alpha: 0, beta: 90, gamma: 0 });
      addLog('SYS', 'Navigation reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020603] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👓</span> WebXR & Geolocation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Augmented Reality (AR) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-green-500 to-teal-500">Stage Navigation Overlay</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees often get lost trying to read a static 2D PDF map while navigating a crowded, 500-acre festival ground at night. Eventra solves this by implementing a WebXR/AR.js module. The user opens the camera in the app, and the frontend calculates their device's geolocation and compass gyroscope data. It then projects a floating AR waypoint directly onto the camera feed, guiding them physically to the stage without needing to decipher a traditional map.
          </p>

          <div className="bg-[#050f08] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🎛️</span> Navigation Engine
               </h3>
               {distance === 0 && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Route</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* AR Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">WebXR Camera Overlay</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isARActive ? 'Active: WebGL Spatial Projection via Compass' : 'Inactive: Legacy 2D Static Image'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleAR}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isARActive ? 'bg-lime-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isARActive ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={simulateMovement}
                     disabled={!isARActive || isMoving || distance === 0}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         distance === 0 ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         !isARActive ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' :
                         isMoving ? 'bg-slate-800 text-lime-500 border-slate-700 cursor-not-allowed' : 
                         'bg-lime-600 hover:bg-lime-500 text-[#020603] border-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.3)]'
                     }`}
                 >
                     {!isARActive ? 'Enable AR to Route' : distance === 0 ? 'Destination Reached' : isMoving ? 'Navigating...' : "Simulate User Walking"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#010302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebXR Telemetry Logs</span>
                 {isMoving && <span className="text-lime-400 font-black animate-pulse">TRACKING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-lime-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Mobile Viewport Visualizer */}
            <div className={`w-full max-w-[300px] bg-[#111827] rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Area */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
                  <div className="w-1/3 h-5 bg-slate-800 rounded-b-xl"></div>
              </div>

              <div className="flex-1 relative overflow-hidden bg-slate-900">
                  
                  {isARActive ? (
                      // AR Camera View
                      <div className="absolute inset-0 bg-slate-800">
                          {/* Simulated Camera Background (Dark blur) */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 overflow-hidden">
                              {/* Fake Crowd / Festival Lights */}
                              <div className="absolute bottom-10 left-10 w-20 h-20 bg-fuchsia-500/20 rounded-full blur-2xl"></div>
                              <div className="absolute top-40 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                              <div className="absolute bottom-40 right-20 w-16 h-16 bg-lime-500/10 rounded-full blur-xl"></div>
                              
                              {/* Grid lines for spatial perspective */}
                              <div className="absolute inset-0" style={{
                                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                  backgroundSize: '40px 40px',
                                  transform: `perspective(500px) rotateX(60deg) translateY(${isMoving ? (distance % 40) : 0}px)`,
                                  transformOrigin: 'bottom center'
                              }}></div>
                          </div>

                          {/* UI Overlay */}
                          <div className="absolute top-10 left-4 right-4 flex justify-between z-20">
                              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-bold border border-white/10 flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
                                  LIVE
                              </div>
                              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-mono text-lime-400 border border-lime-500/30">
                                  {distance}ft
                              </div>
                          </div>

                          {/* Floating AR Waypoint */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-transform duration-300 ease-out"
                               style={{
                                   transform: `
                                      translateX(${gyroData.alpha * -1.5}px) 
                                      translateY(${gyroData.beta * -1}px) 
                                      rotateZ(${gyroData.gamma * 0.5}deg) 
                                      scale(${1 + (500 - distance) / 1000})
                                   `
                               }}>
                              
                              {distance > 0 ? (
                                  <div className="flex flex-col items-center animate-[bounce_2s_ease-in-out_infinite]">
                                      <div className="bg-lime-500/90 backdrop-blur-sm text-black font-black text-sm px-4 py-2 rounded-xl shadow-[0_0_30px_rgba(132,204,22,0.5)] border-2 border-lime-300 relative">
                                          MAIN STAGE
                                          {/* Arrow Pointing Down */}
                                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[12px] border-t-lime-500/90 border-r-[10px] border-r-transparent"></div>
                                      </div>
                                      <div className="mt-4 bg-black/60 backdrop-blur-md text-white font-mono text-[10px] px-2 py-1 rounded border border-white/10">
                                          {distance}ft Ahead
                                      </div>
                                  </div>
                              ) : (
                                  <div className="bg-emerald-500/90 backdrop-blur-sm text-white font-black text-lg px-6 py-4 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.8)] border-2 border-white animate-fade-in-up">
                                      YOU HAVE ARRIVED
                                  </div>
                              )}
                          </div>
                          
                          {/* HUD Reticle */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30">
                              <div className="w-48 h-48 border border-white/30 rounded-full flex items-center justify-center">
                                  <div className="w-1 h-4 bg-white/50 absolute top-0"></div>
                                  <div className="w-1 h-4 bg-white/50 absolute bottom-0"></div>
                                  <div className="w-4 h-1 bg-white/50 absolute left-0"></div>
                                  <div className="w-4 h-1 bg-white/50 absolute right-0"></div>
                                  <div className="w-1 h-1 bg-lime-500 rounded-full"></div>
                              </div>
                          </div>

                      </div>
                  ) : (
                      // Static 2D Map View
                      <div className="absolute inset-0 bg-[#f8f9fa] flex flex-col items-center p-4 pt-12">
                          <h4 className="text-slate-800 font-black mb-4">Festival Map PDF</h4>
                          <div className="w-full h-64 bg-slate-200 border-2 border-slate-300 rounded-lg relative overflow-hidden flex items-center justify-center">
                              {/* Fake Map Drawing */}
                              <div className="absolute w-32 h-32 border-4 border-blue-400 rounded-full -top-10 -left-10 opacity-50"></div>
                              <div className="absolute w-40 h-20 border-4 border-rose-400 -bottom-5 -right-5 opacity-50"></div>
                              <div className="w-2 h-2 bg-blue-600 rounded-full absolute top-1/3 left-1/3"></div>
                              <div className="w-4 h-4 bg-rose-600 rounded-sm absolute bottom-1/4 right-1/4"></div>
                              
                              <span className="text-slate-400 font-bold rotate-45 text-xl opacity-20">MAP</span>
                          </div>
                          <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                              You are the blue dot.<br/>Main Stage is the red square.<br/><br/>Good luck figuring out which way you are facing in the dark.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050f08] p-4 rounded-xl border border-lime-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-lime-400 uppercase block mb-1">Spatial Computing:</span>
               With the toggle off, the user has to stare down at a confusing static PDF map, looking up constantly to try and orient themselves in a massive dark field.<br/><br/>Toggle <span className="text-lime-400 font-bold bg-slate-800 px-1 rounded">WebXR</span> ON and click Simulate. The app accesses the phone's camera, GPS, and Gyroscope. The WebGL canvas projects a 3D Waypoint spatially tied to the physical world coordinates. As the user walks, the engine recalculates the vectors, keeping the waypoint locked perfectly over the physical stage in the distance.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AugmentedRealityNav;
