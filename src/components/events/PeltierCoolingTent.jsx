/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PeltierCoolingTent = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [climateMode, setClimateMode] = useState('PASSIVE'); // PASSIVE, COOLING
  
  // Thermodynamic Metrics
  const [ambientTemp, setAmbientTemp] = useState(102); // Fahrenheit (External)
  const [tentTemp, setTentTemp] = useState(102); // Fahrenheit (Internal)
  const [peltierDraw, setPeltierDraw] = useState(0); // Watts
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Smart-Textile Infrastructure Online.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Awaiting local weather API polling.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (climateMode === 'PASSIVE') {
              // Greenhouse effect: it gets hotter inside a passive tent
              setAmbientTemp(prev => Math.min(105, prev + 0.1));
              setTentTemp(prev => Math.min(110, prev + 0.3)); // Traps heat
              setPeltierDraw(0);
          } else if (climateMode === 'COOLING') {
              // Peltier active: draws heat away
              setAmbientTemp(prev => Math.min(105, prev + 0.1)); // Sun is still hot
              setTentTemp(prev => Math.max(72, prev - 1.5)); // Rapid active refrigeration
              
              // Modulate power based on temperature differential
              const diff = ambientTemp - tentTemp;
              setPeltierDraw(Math.floor(4500 + (diff * 100) + (Math.random() * 200)));
          }

      }, 150); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, climateMode, ambientTemp, tentTemp]);

  const triggerCooling = (state) => {
    if (!systemActive) return;
    
    if (state === 'PASSIVE' && climateMode === 'COOLING') {
        setClimateMode('PASSIVE');
        addLog('WARN', 'Disengaging Peltier weave. Electrical current halted.');
        addLog('CRIT', 'WARNING: Smart-fabric reverting to standard nylon dynamics. Heat trapping imminent.');
    } else if (state === 'COOLING' && climateMode === 'PASSIVE') {
        setClimateMode('COOLING');
        addLog('ACTION', 'Local API reports 102°F. Engaging Thermoelectric Peltier Weave.');
        addLog('SUCCESS', 'Current flowing. Heat actively transferring from bottom surface to top surface.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setClimateMode('PASSIVE');
      setAmbientTemp(102);
      setTentTemp(105);
      setPeltierDraw(0);
      addLog('SYS', 'Zone A Shade Canopy Micro-Controller Linked.');
    } else {
      setSystemActive(false);
      setClimateMode('PASSIVE');
      setPeltierDraw(0);
      addLog('WARN', 'Canopy Micro-Controller Offline. System unpowered.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070404] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❄️</span> Smart Textiles
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Thermoelectric Peltier <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cooling Tents</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional shade tents trap humidity and hot air underneath them, turning them into suffocating greenhouses during 100-degree summer music festivals. Eventra solves this by constructing shade structures using advanced smart-fabrics interwoven with thermoelectric Peltier threads. Eventra's IoT system manages the electrical current running through the fabric, actively drawing heat away from attendees beneath it and dissipating it out the top, creating a refrigerated zone without loud air conditioning units.
          </p>

          <div className="bg-[#120505] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px] transition-colors duration-1000" style={{ backgroundColor: climateMode === 'COOLING' ? '#051216' : '#120505' }}>
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Climate Control IoT
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Cut Micro-Controller Power' : 'Initialize Smart Fabric'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Ambient Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ambientTemp >= 100 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   External Sun Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     ambientTemp >= 100 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {ambientTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>
               
               {/* Tent Internal Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 tentTemp > 100 && climateMode === 'PASSIVE' ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 
                 climateMode === 'COOLING' && tentTemp <= 80 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Internal Tent Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     tentTemp > 100 && climateMode === 'PASSIVE' ? 'text-red-500' : 
                     climateMode === 'COOLING' && tentTemp <= 80 ? 'text-cyan-400' :
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {tentTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>

               {/* Peltier Load */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 climateMode === 'COOLING' ? 'bg-blue-950/30 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Peltier Power Draw
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     climateMode === 'COOLING' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {(peltierDraw / 1000).toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Thermodynamic Telemetry Log</span>
                 {climateMode === 'PASSIVE' && systemActive && <span className="text-red-500 animate-pulse">GREENHOUSE TRAPPING HEAT</span>}
                 {climateMode === 'COOLING' && <span className="text-cyan-400 font-black animate-pulse">REFRIGERATING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Thermodynamics Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 
                climateMode === 'COOLING' ? 'bg-[#020d1a]' : 'bg-[#1a0802]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">THERMAL CROSS-SECTION</span>
                <span className="text-[8px] font-mono text-slate-400">ZONE A</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-12 z-20">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative">
                      
                      {/* The Sun / External Heat */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500 rounded-full filter blur-[20px] opacity-30"></div>

                      {/* External Heat Waves pushing down */}
                      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none flex justify-around">
                          {[1,2,3,4,5].map(i => (
                              <div key={i} className="w-1 h-32 bg-gradient-to-b from-orange-500 to-transparent opacity-30 transform rotate-12"></div>
                          ))}
                      </div>

                      {/* The Canopy (Smart Fabric) */}
                      <svg width="100%" height="150" className="absolute top-16 inset-x-0 z-30" viewBox="0 0 100 50" preserveAspectRatio="none">
                          <defs>
                              <linearGradient id="fabricGradientPassive" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
                              </linearGradient>
                              <linearGradient id="fabricGradientCooling" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" /> {/* Hot top */}
                                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" /> {/* Cold bottom */}
                              </linearGradient>
                              <filter id="peltierGlow">
                                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                                  <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                              </filter>
                          </defs>

                          {/* Tent Roof Line */}
                          <path 
                              d="M 10 50 Q 50 -10 90 50" 
                              stroke={climateMode === 'COOLING' ? 'url(#fabricGradientCooling)' : 'url(#fabricGradientPassive)'} 
                              strokeWidth="3" 
                              fill="none" 
                              filter={climateMode === 'COOLING' ? 'url(#peltierGlow)' : ''}
                              className="transition-all duration-1000"
                          />
                          
                          {/* Peltier Energy Threads (Animated dashes) */}
                          {climateMode === 'COOLING' && (
                              <path 
                                  d="M 10 50 Q 50 -10 90 50" 
                                  stroke="#22d3ee" // Cyan
                                  strokeWidth="1" 
                                  fill="none"
                                  strokeDasharray="2 4"
                                  className="animate-[dash_0.5s_linear_infinite]"
                              />
                          )}
                      </svg>
                      
                      {/* Tent Poles */}
                      <div className="absolute top-[80px] left-[10%] w-2 bottom-0 bg-slate-800 z-10 border-r border-slate-700"></div>
                      <div className="absolute top-[80px] right-[10%] w-2 bottom-0 bg-slate-800 z-10 border-l border-slate-700"></div>

                      {/* Internal Tent Environment */}
                      <div className={`absolute top-[80px] inset-x-[12%] bottom-0 z-20 flex flex-col justify-end items-center pb-2 transition-colors duration-1000 ${
                          climateMode === 'COOLING' ? 'bg-cyan-900/20' : 'bg-red-900/30'
                      }`}>
                          
                          {/* Attendees */}
                          <div className="text-3xl filter brightness-50">👥👥👥</div>
                          
                          {/* Ambient Temp Readout Floating */}
                          <div className={`absolute top-12 px-2 py-1 rounded text-[10px] font-black border transition-colors duration-1000 ${
                              climateMode === 'COOLING' ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 
                              'bg-red-950/80 border-red-500 text-red-500'
                          }`}>
                              {tentTemp.toFixed(1)}°F
                          </div>
                      </div>

                      {/* Heat Dissipation Visualization */}
                      {climateMode === 'PASSIVE' && (
                          /* Heat pooling inside */
                          <div className="absolute top-[80px] inset-x-[12%] h-32 bg-gradient-to-b from-red-600/50 to-transparent pointer-events-none z-10 filter blur-[10px]"></div>
                      )}

                      {climateMode === 'COOLING' && (
                          <>
                              /* Cold air pooling inside */
                              <div className="absolute top-[80px] inset-x-[12%] bottom-0 bg-gradient-to-t from-cyan-500/30 via-cyan-500/10 to-transparent pointer-events-none z-10 filter blur-[10px]"></div>
                              
                              /* Heat being ejected OUT the top */
                              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-32 h-32 flex justify-around opacity-50 z-40 pointer-events-none">
                                  {[1,2,3].map(i => (
                                      <div key={i} className="w-1 h-full bg-gradient-to-t from-red-500 to-transparent animate-[floatUp_1s_ease-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                  ))}
                              </div>
                          </>
                      )}

                  </div>
                )}

                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes dash {
                        to { stroke-dashoffset: -6; }
                    }
                    @keyframes floatUp {
                        0% { transform: translateY(20px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateY(-50px); opacity: 0; }
                    }
                `}} />
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120505] p-4 rounded-xl border border-slate-800 transition-colors duration-1000" style={{ backgroundColor: climateMode === 'COOLING' ? '#051216' : '#120505' }}>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Fabric State</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerCooling('PASSIVE')}
                   disabled={!systemActive || climateMode === 'PASSIVE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || climateMode === 'PASSIVE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   Passive Nylon (Greenhouse)
                 </button>

                 <button 
                   onClick={() => triggerCooling('COOLING')}
                   disabled={!systemActive || climateMode === 'COOLING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || climateMode === 'COOLING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
                   }`}
                 >
                   Activate Peltier Refrigeration
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PeltierCoolingTent;
