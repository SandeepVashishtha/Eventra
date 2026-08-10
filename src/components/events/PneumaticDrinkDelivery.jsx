/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PneumaticDrinkDelivery = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [routingState, setRoutingState] = useState('IDLE'); // IDLE, LOADING, ROUTING, DELIVERED
  
  // Pneumatic Metrics
  const [vacuumPressure, setVacuumPressure] = useState(0); // PSI
  const [activeCapsules, setActiveCapsules] = useState(0); 
  const [lastDeliveryTime, setLastDeliveryTime] = useState(0); // Seconds
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Subterranean Pneumatic Logistics Network Online.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'All vacuum routing valves nominal. Awaiting VIP orders.' }
  ]);

  // Visualizer State
  const [capsuleProgress, setCapsuleProgress] = useState(0); // 0 to 100
  const [targetCabana, setTargetCabana] = useState(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (routingState === 'IDLE') {
              setVacuumPressure(prev => {
                  const idlePsi = 15;
                  return prev < idlePsi ? prev + 1 : prev > idlePsi ? prev - 1 : idlePsi + (Math.random() - 0.5);
              });
          } else if (routingState === 'LOADING') {
              setVacuumPressure(prev => Math.min(85, prev + 5)); // Spooling up compressors
          } else if (routingState === 'ROUTING') {
              setVacuumPressure(prev => Math.max(80, prev + (Math.random() * 4 - 2))); // High pressure transit
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, routingState]);

  const triggerOrder = (cabanaId) => {
    if (!systemActive || routingState !== 'IDLE') return;
    
    setRoutingState('LOADING');
    setTargetCabana(cabanaId);
    
    addLog('ACTION', `VIP Order Received: Dom Perignon to Cabana ${cabanaId}.`);
    addLog('SYS', 'Bartender loaded shock-absorbent capsule. Spooling vacuum compressors...');
    
    setTimeout(() => {
        setRoutingState('ROUTING');
        setActiveCapsules(1);
        addLog('SUCCESS', `Capsule injected into main subterranean artery. PSI at 85.`);
        
        const startTime = Date.now();
        
        // Animate capsule transit
        let progress = 0;
        const transitInterval = setInterval(() => {
            progress += 2;
            setCapsuleProgress(progress);
            
            if (progress === 30) addLog('NET', `Valve Switch: Diverting from Main Artery to Sector ${cabanaId > 3 ? 'B' : 'A'}.`);
            if (progress === 70) addLog('NET', `Approaching Cabana ${cabanaId} terminal. Engaging decelerators.`);
            
            if (progress >= 100) {
                clearInterval(transitInterval);
                const deliverySecs = ((Date.now() - startTime) / 1000).toFixed(1);
                
                setRoutingState('DELIVERED');
                setActiveCapsules(0);
                setLastDeliveryTime(deliverySecs);
                
                addLog('SUCCESS', `Capsule arrived at Cabana ${cabanaId} receptacle in ${deliverySecs}s.`);
                
                setTimeout(() => {
                    setRoutingState('IDLE');
                    setCapsuleProgress(0);
                    setTargetCabana(null);
                    addLog('SYS', 'Routing valves reset. Compressors returning to idle state.');
                }, 3000);
            }
        }, 50); // Fast transit simulation
        
    }, 2000); // 2 second loading delay
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setRoutingState('IDLE');
      setVacuumPressure(15);
      addLog('SYS', 'Pneumatic Control API Initialized. Subterranean valves unlocked.');
    } else {
      setSystemActive(false);
      setRoutingState('IDLE');
      setVacuumPressure(0);
      setCapsuleProgress(0);
      setActiveCapsules(0);
      setTargetCabana(null);
      addLog('WARN', 'Compressors Offline. Returning to manual waitstaff delivery.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚀</span> Pneumatic Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous Subterranean <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">Drink Delivery</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            VIP table service is incredibly inefficient, requiring servers to carry heavy trays of expensive glass bottles through dense, unpredictable crowds, risking spills and injuries. Eventra solves this by installing a subterranean pneumatic tube network connecting the main bar directly to the VIP cabanas. Eventra provides a tablet interface to autonomously manage the vacuum routing valves, delivering a shock-absorbent capsule directly to the VIP table in under 15 seconds.
          </p>

          <div className="bg-[#0b0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Valve & Compressor Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Depressurize Network' : 'Spool Compressors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Vacuum PSI */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 vacuumPressure > 60 ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Line Pressure
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     vacuumPressure > 60 ? 'text-fuchsia-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {Math.floor(vacuumPressure)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">PSI</span>
                 </div>
               </div>

               {/* Active Capsules */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeCapsules > 0 ? 'bg-blue-950/30 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   In-Transit
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     activeCapsules > 0 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {activeCapsules}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Pods</span>
                 </div>
               </div>
               
               {/* Transit Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routingState === 'DELIVERED' ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Last Delivery
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     routingState === 'DELIVERED' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {lastDeliveryTime}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">sec</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Subterranean Routing Log</span>
                 {routingState === 'LOADING' && <span className="text-orange-400 animate-pulse">PRESSURIZING...</span>}
                 {routingState === 'ROUTING' && <span className="text-fuchsia-400 font-black animate-pulse">CAPSULE IN TRANSIT</span>}
                 {routingState === 'DELIVERED' && <span className="text-emerald-400 font-black">ORDER FULFILLED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'NET' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Tube Network Map Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0514]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">SUBTERRANEAN MAP</span>
                <span className="text-[8px] font-mono text-slate-400">SECTOR 7G</span>
              </div>

              <div className="flex-1 relative overflow-hidden p-6 pt-16 z-20">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NETWORK DEPRESSURIZED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative">
                      
                      {/* Main Bar (Origin) */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30">
                          <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-slate-900 ${
                              routingState === 'LOADING' ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'border-slate-600'
                          }`}>
                              <span className="text-2xl">🍸</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 bg-black/50 px-1 rounded">Main Bar Hub</span>
                      </div>

                      {/* VIP Cabanas (Destinations) */}
                      {[1, 2, 3].map(i => (
                          <div key={i} className="absolute bottom-8 flex flex-col items-center z-30" style={{ left: `${(i * 25)}%`, transform: 'translateX(-50%)' }}>
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-slate-900 ${
                                  targetCabana === i && routingState === 'DELIVERED' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 
                                  targetCabana === i && routingState === 'ROUTING' ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'border-slate-700'
                              }`}>
                                  <span className="text-xs">👑</span>
                              </div>
                              <span className="text-[8px] font-black uppercase text-slate-500 mt-1">Cabana {i}</span>
                          </div>
                      ))}

                      {/* Pneumatic Tube Layout (SVG) */}
                      <svg width="100%" height="100%" className="absolute inset-0 z-10 pointer-events-none">
                          <defs>
                              <filter id="neonGlow">
                                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                  <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                              </filter>
                          </defs>

                          {/* Main Trunk */}
                          <path d="M 50% 15% L 50% 50%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
                          
                          {/* Branches to Cabanas */}
                          <path d="M 50% 50% L 25% 50% L 25% 85%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinejoin="round" fill="none" />
                          <path d="M 50% 50% L 50% 85%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
                          <path d="M 50% 50% L 75% 50% L 75% 85%" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinejoin="round" fill="none" />

                          {/* Active Tube Highlight (Routing logic mapping) */}
                          {routingState === 'ROUTING' && targetCabana && (
                              <path 
                                  d={
                                      targetCabana === 1 ? "M 50% 15% L 50% 50% L 25% 50% L 25% 85%" :
                                      targetCabana === 2 ? "M 50% 15% L 50% 85%" :
                                      "M 50% 15% L 50% 50% L 75% 50% L 75% 85%"
                                  }
                                  stroke="#d946ef" // Fuchsia-500
                                  strokeWidth="2" 
                                  fill="none"
                                  strokeLinejoin="round"
                                  filter="url(#neonGlow)"
                              />
                          )}

                          {/* The Capsule (Animated Dot along SVG Path) */}
                          {routingState === 'ROUTING' && targetCabana && (
                              <circle r="6" fill="#60a5fa" filter="url(#neonGlow)">
                                  <animateMotion 
                                      dur="5s" 
                                      repeatCount="1" 
                                      fill="freeze"
                                      path={
                                          targetCabana === 1 ? "M 160 50 L 160 160 L 80 160 L 80 280" : // Very rough pixel mapping for the SVG viewbox (assuming roughly 320x320)
                                          targetCabana === 2 ? "M 160 50 L 160 280" :
                                          "M 160 50 L 160 160 L 240 160 L 240 280"
                                      }
                                      // NOTE: React SVG animateMotion paths are complex without fixed viewboxes. 
                                      // Using a simplified percentage-based CSS approach below instead for the visual dot.
                                  />
                              </circle>
                          )}
                      </svg>

                      {/* Fallback CSS-based Capsule Animation (More reliable in this mockup) */}
                      {routingState === 'ROUTING' && targetCabana && (
                          <div 
                              className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)] z-20 transition-all duration-[50ms] ease-linear"
                              style={{
                                  left: capsuleProgress < 50 ? '50%' : `${targetCabana === 1 ? 25 : targetCabana === 2 ? 50 : 75}%`,
                                  top: capsuleProgress < 50 ? `${15 + (capsuleProgress * 0.7)}%` : `${50 + ((capsuleProgress - 50) * 0.7)}%`,
                                  transform: 'translate(-50%, -50%)'
                              }}
                          ></div>
                      )}

                  </div>
                )}

              </div>
            </div>

            {/* VIP Cabana Controls */}
            <div className="w-full bg-[#0b0512] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">VIP Tablet Interface</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerOrder(1)}
                   disabled={!systemActive || routingState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || routingState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                   }`}
                 >
                   Order to<br/>Cabana 1
                 </button>

                 <button 
                   onClick={() => triggerOrder(2)}
                   disabled={!systemActive || routingState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || routingState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                   }`}
                 >
                   Order to<br/>Cabana 2
                 </button>

                 <button 
                   onClick={() => triggerOrder(3)}
                   disabled={!systemActive || routingState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || routingState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                   }`}
                 >
                   Order to<br/>Cabana 3
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PneumaticDrinkDelivery;
