/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticAccessibilityNav = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetDestination, setTargetDestination] = useState('MAIN STAGE');
  
  // Navigation State
  const [heading, setHeading] = useState(0); // 0 = straight
  const [distance, setDistance] = useState(145); // meters
  const [hapticFeedback, setHapticFeedback] = useState('IDLE'); // IDLE, LEFT, RIGHT, FORWARD, HAZARD
  
  // Metrics
  const [hapticEventsFired, setHapticEventsFired] = useState(0);
  const [autonomousTrips, setAutonomousTrips] = useState(32);
  const [deviationsCorrected, setDeviationsCorrected] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'CoreMotion & LocationManager APIs bound.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Awaiting destination input from ScreenReader.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (isNavigating) {
      loop = setInterval(() => {
          setDistance(prev => {
              if (prev <= 0) {
                  endNavigation();
                  return 0;
              }
              return prev - (Math.random() * 2); // Simulating walking speed
          });

          // Simulate random heading changes to trigger haptics
          if (Math.random() > 0.8) {
              const drift = (Math.random() * 40) - 20; // -20 to 20 degrees
              setHeading(Math.floor(drift));
              
              if (drift < -10) {
                  triggerHaptic('RIGHT', 'Slight left drift detected. Pulsing right actuator to correct course.');
                  setDeviationsCorrected(prev => prev + 1);
              } else if (drift > 10) {
                  triggerHaptic('LEFT', 'Slight right drift detected. Pulsing left actuator to correct course.');
                  setDeviationsCorrected(prev => prev + 1);
              } else {
                  triggerHaptic('FORWARD', 'On course. Rhythmic forward pacing pulse.');
              }
          }
          
          // Random Hazard
          if (Math.random() > 0.95) {
              triggerHaptic('HAZARD', 'Dynamic obstacle detected (Crowd surge). Rapid warning vibration.');
          }

      }, 1500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [isNavigating]);

  const triggerHaptic = (type, logMsg) => {
      setHapticFeedback(type);
      setHapticEventsFired(prev => prev + 1);
      
      let logType = 'SYS';
      if (type === 'LEFT' || type === 'RIGHT') logType = 'ACTION';
      if (type === 'HAZARD') logType = 'CRIT';
      
      addLog(logType, logMsg);
      
      setTimeout(() => {
          setHapticFeedback('IDLE');
          setHeading(0); // Auto-correct heading visually
      }, 1000);
  };

  const startNavigation = () => {
      if (isNavigating) return;
      setIsNavigating(true);
      setDistance(145);
      setHeading(0);
      setDeviationsCorrected(0);
      addLog('SUCCESS', `Routing to ${targetDestination}. Initializing Taptic Engine.`);
  };

  const endNavigation = () => {
      setIsNavigating(false);
      setHapticFeedback('IDLE');
      addLog('SUCCESS', 'Destination reached successfully via autonomous navigation.');
      setAutonomousTrips(prev => prev + 1);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-white text-black border border-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> Accessibility (a11y)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Accessibility Navigation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">for the Visually Impaired</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Visually impaired attendees struggle immensely to navigate complex, chaotic festival grounds, often requiring a dedicated sighted guide for the entire weekend. Braille maps are useless for dynamically changing crowds and moving obstacles. Eventra solves this by leveraging the smartphone's magnetometer (compass) and high-precision GPS. The app calculates the route to a selected stage and translates the turn-by-turn navigation into directional haptic feedback (e.g., pulsing on the left side of the screen for a left turn, rapid vibration for hazards), allowing visually impaired users to navigate autonomously.
          </p>

          <div className="bg-[#0f172a]/30 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Taptic Engine Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => isNavigating ? endNavigation() : startNavigation()}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isNavigating ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                   }`}
                 >
                   {isNavigating ? 'Cancel Routing' : 'Start Haptic Route'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Haptic Events */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 hapticFeedback !== 'IDLE' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Taptic Pulses
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     hapticFeedback !== 'IDLE' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {hapticEventsFired}
                   </span>
                 </div>
               </div>

               {/* Distance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isNavigating ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Distance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isNavigating ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {distance.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m</span>
                 </div>
               </div>
               
               {/* Deviations Corrected */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 deviationsCorrected > 0 ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Course Corrections
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     deviationsCorrected > 0 ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {deviationsCorrected}
                   </span>
                 </div>
               </div>
               
               {/* Autonomous Trips */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Auto-Trips
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none text-emerald-400`}>
                         {autonomousTrips}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020617] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Sensor & Haptic Ledger</span>
                 {hapticFeedback !== 'IDLE' && <span className="text-cyan-400 font-black animate-pulse">ACTUATOR FIRED ({hapticFeedback})</span>}
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
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* Mobile Haptic Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
                hapticFeedback === 'HAZARD' ? 'scale-95 shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-red-950' : 
                hapticFeedback !== 'IDLE' ? 'scale-[0.98]' : 'bg-black'
            }`}>
              
              {/* High Contrast UI Header */}
              <div className="pt-12 pb-4 px-6 border-b-2 border-white/20 flex flex-col z-20 bg-black">
                  <span className="text-2xl font-black text-white uppercase tracking-widest mb-1">Navigation</span>
                  <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Target: {targetDestination}</span>
              </div>

              <div className="flex-1 flex flex-col relative z-10 overflow-hidden bg-black">
                  
                  {/* Visual Representation of Haptics */}
                  
                  {/* Left Haptic Pulse */}
                  <div className={`absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-cyan-500 to-transparent opacity-0 transition-opacity duration-300 ${
                      hapticFeedback === 'LEFT' ? 'opacity-80 animate-pulse' : ''
                  }`}></div>
                  
                  {/* Right Haptic Pulse */}
                  <div className={`absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-indigo-500 to-transparent opacity-0 transition-opacity duration-300 ${
                      hapticFeedback === 'RIGHT' ? 'opacity-80 animate-pulse' : ''
                  }`}></div>

                  {/* Forward Haptic Pulse */}
                  <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 ${
                      hapticFeedback === 'FORWARD' ? 'opacity-20 animate-pulse' : ''
                  }`}></div>

                  {/* Hazard Full Screen Pulse */}
                  <div className={`absolute inset-0 bg-red-600 opacity-0 transition-opacity duration-100 z-30 ${
                      hapticFeedback === 'HAZARD' ? 'opacity-90 animate-pulse' : ''
                  }`}>
                      <div className="flex h-full items-center justify-center">
                          <span className="text-6xl">⚠️</span>
                      </div>
                  </div>

                  {!isNavigating ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                         <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center mb-6">
                             <span className="text-5xl text-white">🦮</span>
                         </div>
                         <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Ready</h3>
                         <p className="text-sm text-slate-400 font-bold leading-relaxed">System ready for screen reader destination input.</p>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in-up relative z-20">
                        
                        <div className="text-6xl font-black font-mono text-white mb-2 tracking-tighter">
                            {distance.toFixed(0)}<span className="text-3xl text-slate-500">m</span>
                        </div>
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-12">Straight Ahead</span>

                        {/* Compass / Heading Simulator */}
                        <div className="w-48 h-48 rounded-full border-4 border-slate-800 relative flex items-center justify-center">
                            
                            {/* Heading Indicator */}
                            <div className="w-full h-full absolute transition-transform duration-500 ease-in-out"
                                 style={{ transform: `rotate(${heading}deg)` }}>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                            </div>
                            
                            {/* Center Dot */}
                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white"></div>
                        </div>

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

export default HapticAccessibilityNav;
