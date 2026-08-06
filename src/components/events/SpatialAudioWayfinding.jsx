/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SpatialAudioWayfinding = () => {
  const [navActive, setNavActive] = useState(false);
  const [destination, setDestination] = useState(null);
  
  // Navigation Telemetry
  const [distance, setDistance] = useState(450); // feet
  const [userHeading, setUserHeading] = useState(0); // degrees (0-360)
  const [targetBearing, setTargetBearing] = useState(45); // degrees
  
  // Audio State
  const [audioPan, setAudioPan] = useState(0); // -1 (Left) to 1 (Right)
  const [audioVolume, setAudioVolume] = useState(0);
  
  const [systemLog, setSystemLog] = useState([
    { time: '14:20:00', msg: 'ARKit Spatial Audio Engine initialized. Awaiting destination input.' }
  ]);

  const destinations = [
    { id: 'main', name: 'Main Stage', bearing: 45, dist: 450 },
    { id: 'vip', name: 'VIP Lounge', bearing: 180, dist: 120 },
    { id: 'exit', name: 'North Exit', bearing: 310, dist: 850 }
  ];

  useEffect(() => {
    let navLoop;
    if (navActive && destination) {
      navLoop = setInterval(() => {
        // Simulate user turning their head/body
        setUserHeading(prev => {
          // Wander around the target bearing slightly
          const drift = (Math.random() * 20) - 10;
          let newHeading = (prev + drift) % 360;
          if (newHeading < 0) newHeading += 360;
          
          // Calculate relative angle to target (-180 to 180)
          let relativeAngle = destination.bearing - newHeading;
          if (relativeAngle > 180) relativeAngle -= 360;
          if (relativeAngle < -180) relativeAngle += 360;
          
          // Map angle to HRTF panning (-1 to 1)
          // 0 = straight ahead, -90 = hard left, 90 = hard right
          let pan = Math.sin((relativeAngle * Math.PI) / 180);
          setAudioPan(pan);
          
          // Volume increases as you get closer to looking directly at it
          const accuracy = 1 - (Math.abs(relativeAngle) / 180);
          setAudioVolume(Math.max(0.2, accuracy));
          
          return newHeading;
        });
        
        // Simulate walking forward
        setDistance(prev => Math.max(0, prev - (Math.random() * 2)));

      }, 500);
    }
    
    return () => clearInterval(navLoop);
  }, [navActive, destination]);

  const startNavigation = (dest) => {
    setDestination(dest);
    setTargetBearing(dest.bearing);
    setDistance(dest.dist);
    setUserHeading(0); // Reset facing North
    
    addLog(`Destination locked: ${dest.name}.`);
    addLog(`Calculating HRTF (Head-Related Transfer Function) spatial coordinates...`);
    
    setTimeout(() => {
      addLog('3D Audio Beacon engaged. Please put your phone in your pocket.');
      setNavActive(true);
    }, 1500);
  };

  const stopNavigation = () => {
    setNavActive(false);
    setDestination(null);
    setAudioPan(0);
    setAudioVolume(0);
    addLog('Navigation aborted. Audio beacon disengaged.');
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSystemLog(prev => [{ time: timeString, msg }, ...prev].slice(0, 5));
  };

  // Helper to render the compass UI
  const getCompassRotation = () => {
    return -userHeading; // Counter-rotate the compass card
  };

  const getTargetRotation = () => {
    return targetBearing - userHeading; // Relative position of target
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> UI/UX Hardware API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Spatial Audio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Navigation Wayfinding</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Staring down at a digital map while walking through a densely packed festival crowd causes collisions and ruins the immersive experience. Eventra solves this by implementing a spatial audio compass using the iOS/Android ARKit spatial audio engine. Attendees select a destination, put their phone away, and simply follow a subtle 3D audio beacon that physically sounds like it's coming from the exact direction they need to walk.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> ARKit Head-Tracking Telemetry
               </h3>
               
               <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                 <span className={`w-2 h-2 rounded-full ${navActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                 HRTF Engine Status
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Left Channel */}
               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute left-0 inset-y-0 w-1 bg-indigo-500/20"></div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Left Ear (L-CH) Output</span>
                 
                 <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-1">
                   <div className="bg-indigo-500 h-full transition-all duration-300" 
                        style={{ width: `${navActive ? Math.max(0, (0.5 - (audioPan / 2)) * 100 * audioVolume) : 0}%` }}>
                   </div>
                 </div>
                 
                 <div className="flex justify-between text-[10px] font-mono text-slate-400">
                   <span>-1.0</span>
                   <span>Gain</span>
                 </div>
               </div>

               {/* Right Channel */}
               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute right-0 inset-y-0 w-1 bg-violet-500/20"></div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-right">Right Ear (R-CH) Output</span>
                 
                 <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-1 flex justify-end">
                   <div className="bg-violet-500 h-full transition-all duration-300" 
                        style={{ width: `${navActive ? Math.max(0, (0.5 + (audioPan / 2)) * 100 * audioVolume) : 0}%` }}>
                   </div>
                 </div>
                 
                 <div className="flex justify-between text-[10px] font-mono text-slate-400">
                   <span>Gain</span>
                   <span>+1.0</span>
                 </div>
               </div>

             </div>
             
             {/* Math Output */}
             <div className="flex space-x-4 mb-4 text-[10px] font-mono text-slate-500 justify-center">
               <span>User Yaw: <strong className="text-slate-800">{userHeading.toFixed(1)}°</strong></span>
               <span>Target Bear: <strong className="text-indigo-600">{targetBearing.toFixed(1)}°</strong></span>
               <span>Dist: <strong className="text-slate-800">{distance.toFixed(0)}ft</strong></span>
             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">3D Audio Renderer Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {systemLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.msg.includes('engaged') ? 'text-emerald-400 font-bold' : 
                     log.msg.includes('locked') ? 'text-indigo-400' : 'text-slate-300'
                   }`}>
                     <span className="text-slate-500 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App & Visualizer (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 flex flex-col bg-slate-900 relative">
               
               {/* 3D Compass Visualizer (Replaces traditional map) */}
               <div className="flex-1 relative flex flex-col items-center justify-center p-6 border-b border-slate-800 overflow-hidden">
                 
                 {/* Background Sonar Rings */}
                 {navActive && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-32 h-32 border border-indigo-500/30 rounded-full animate-[ping_2s_infinite]"></div>
                     <div className="w-48 h-48 border border-indigo-500/20 rounded-full absolute animate-[ping_3s_infinite]"></div>
                   </div>
                 )}

                 <div className="relative w-48 h-48">
                   {/* User / Center */}
                   <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-lg relative">
                       <span className="text-xl relative z-10 text-slate-300">🎧</span>
                       {/* Directional arrow indicating facing direction */}
                       <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-emerald-400"></div>
                     </div>
                   </div>

                   {/* Rotating Compass Ring */}
                   <div className="absolute inset-0 rounded-full border border-slate-700 transition-transform duration-300 ease-out" style={{ transform: `rotate(${getCompassRotation()}deg)` }}>
                      <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">N</span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-[8px] font-mono text-slate-500">S</span>
                      <span className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">W</span>
                      <span className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">E</span>
                   </div>

                   {/* Audio Target Beacon */}
                   {navActive && (
                     <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `rotate(${getTargetRotation()}deg)` }}>
                       <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                         <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse"></div>
                         {/* Audio Waves graphic */}
                         <div className="flex space-x-0.5 mt-2 opacity-80">
                           <div className="w-0.5 h-2 bg-indigo-400 rounded animate-[bounce_0.5s_infinite_alternate]"></div>
                           <div className="w-0.5 h-4 bg-indigo-400 rounded animate-[bounce_0.3s_infinite_alternate]"></div>
                           <div className="w-0.5 h-2 bg-indigo-400 rounded animate-[bounce_0.7s_infinite_alternate]"></div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>

                 {navActive && (
                   <div className="mt-10 text-center relative z-10">
                     <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Follow the Sound</p>
                     <p className="font-black text-2xl text-white tracking-wide">{distance.toFixed(0)} <span className="text-sm font-bold text-slate-500">ft</span></p>
                   </div>
                 )}
               </div>

               {/* Navigation Controls */}
               <div className="p-6 bg-slate-900">
                 {!navActive ? (
                   <>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Select Destination</p>
                     <div className="space-y-3">
                       {destinations.map(dest => (
                         <button 
                           key={dest.id}
                           onClick={() => startNavigation(dest)}
                           className="w-full bg-slate-800 border border-slate-700 text-left p-4 rounded-xl hover:bg-slate-700 hover:border-indigo-500 transition group flex justify-between items-center"
                         >
                           <span className="font-bold text-white group-hover:text-indigo-400 transition">{dest.name}</span>
                           <span className="text-slate-500 text-xs">🎧 Navigate</span>
                         </button>
                       ))}
                     </div>
                   </>
                 ) : (
                   <div className="text-center h-full flex flex-col justify-center">
                     <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-xl p-4 mb-4">
                       <p className="text-indigo-400 font-bold text-sm mb-1">Navigation Active</p>
                       <p className="text-[10px] text-slate-400">Put your phone in your pocket and follow the spatial audio beacon in your headphones.</p>
                     </div>
                     <button 
                       onClick={stopNavigation}
                       className="w-full bg-transparent border border-slate-700 text-slate-400 font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-slate-800 transition"
                     >
                       Cancel Route
                     </button>
                   </div>
                 )}
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SpatialAudioWayfinding;
