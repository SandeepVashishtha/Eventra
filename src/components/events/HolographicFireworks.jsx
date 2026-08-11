/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HolographicFireworks = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [renderState, setRenderState] = useState('IDLE'); // IDLE, CHARGING, RENDERING
  
  // Laser/Plasma Metrics
  const [activeLasers, setActiveLasers] = useState(0); 
  const [plasmaNodes, setPlasmaNodes] = useState(0); // 3D pixels rendered
  const [energyDraw, setEnergyDraw] = useState(1.2); // kW
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:30:00', type: 'SYS', msg: 'Ground-based Nano-Laser Array Online.' },
    { id: 2, time: '22:30:02', type: 'SYS', msg: 'Awaiting spatial intersection coordinates.' }
  ]);

  // Visualizer State
  const [plasmaBursts, setPlasmaBursts] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (renderState === 'IDLE') {
              setEnergyDraw(prev => Math.min(1.5, prev + 0.1));
          } else if (renderState === 'CHARGING') {
              setEnergyDraw(prev => Math.min(85, prev + 15)); // Spooling capacitors
              setActiveLasers(prev => Math.min(5000, prev + 800));
          } else if (renderState === 'RENDERING') {
              setEnergyDraw(prev => 70 + (Math.random() * 10)); // High constant draw
              setActiveLasers(5000);
              
              // Maintain plasma bursts on screen for a short time
              setPlasmaBursts(prev => prev.filter(burst => Date.now() - burst.id < 2000));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, renderState]);

  const triggerFirework = (type) => {
    if (!systemActive || renderState === 'CHARGING') return;
    
    setRenderState('CHARGING');
    addLog('ACTION', 'Calculating aerial focal points for plasma intersection.');
    
    setTimeout(() => {
        setRenderState('RENDERING');
        const burstId = Date.now();
        const nodesToGenerate = type === 'WILLOW' ? 800 : type === 'CHRYSANTHEMUM' ? 1200 : 400;
        
        setPlasmaNodes(nodesToGenerate);
        
        // Add visual burst
        setPlasmaBursts(prev => [...prev, {
            id: burstId,
            type: type,
            x: 20 + Math.random() * 60, // random x position 20-80%
            y: 10 + Math.random() * 40, // random y position 10-50%
            color: type === 'WILLOW' ? '#fbbf24' : type === 'CHRYSANTHEMUM' ? '#ec4899' : '#06b6d4'
        }]);
        
        addLog('SUCCESS', `${nodesToGenerate} plasma nodes ignited simultaneously.`);
        addLog('SYS', `Rendered 3D construct: ${type}. Zero chemical emissions detected.`);
        
        // Auto cooldown
        setTimeout(() => {
            if (systemActive) {
                setRenderState('IDLE');
                setPlasmaNodes(0);
                setActiveLasers(0);
                setEnergyDraw(1.2);
            }
        }, 2000);
        
    }, 1000);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setRenderState('IDLE');
      setActiveLasers(0);
      setPlasmaNodes(0);
      setEnergyDraw(1.2);
      addLog('SYS', 'Volumetric Plasma Display Engine Armed.');
    } else {
      setSystemActive(false);
      setRenderState('IDLE');
      setActiveLasers(0);
      setPlasmaNodes(0);
      setEnergyDraw(0);
      setPlasmaBursts([]);
      addLog('WARN', 'Nano-Lasers offline. Returning to standard lighting.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030107] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💥</span> Volumetric Plasma Displays
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Holographic Fireworks via <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Swarm Nano-Lasers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional fireworks are a massive fire hazard in dry climates, heavily pollute the air with toxic heavy metals, and leave tons of cardboard debris scattered across the festival grounds. Eventra completely eliminates this by deploying a perimeter of thousands of ground-based nano-lasers. By intersecting their beams in the sky, they superheat microscopic pockets of air, creating bright, audible plasma bursts (3D pixels). Eventra orchestrates these in real-time to render massive "holographic fireworks" that are 100% emission-free and infinitely reusable.
          </p>

          <div className="bg-[#0b0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> Laser Orchestration Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disarm Perimeter' : 'Arm Laser Array'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Lasers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderState !== 'IDLE' ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Beams
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     renderState !== 'IDLE' ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {activeLasers}
                   </span>
                 </div>
               </div>

               {/* Plasma Nodes (3D Pixels) */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderState === 'RENDERING' ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Plasma Nodes Rendered
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     renderState === 'RENDERING' ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {plasmaNodes}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">px</span>
                 </div>
               </div>
               
               {/* Energy Draw */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 energyDraw > 50 ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Capacitor Draw
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     energyDraw > 50 ? 'text-indigo-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {energyDraw.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Intersection Telemetry</span>
                 {renderState === 'CHARGING' && <span className="text-indigo-400 animate-pulse">CALCULATING VECTORS...</span>}
                 {renderState === 'RENDERING' && <span className="text-pink-400 font-black animate-pulse">PLASMA IGNITED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-pink-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* Sky Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/50 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">SKY VIEWPORT</span>
                <span className="text-[8px] font-mono text-slate-400">ZERO-EMISSION FX</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ARRAY UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Night Sky Background (Stars) */}
                      <div className="absolute inset-0 z-0">
                          {Array.from({length: 30}).map((_, i) => (
                              <div key={i} className="absolute w-0.5 h-0.5 bg-white/50 rounded-full" style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*80}%`
                              }}></div>
                          ))}
                      </div>

                      {/* Ground Silhouette */}
                      <div className="absolute bottom-0 inset-x-0 h-12 bg-[#050510] border-t border-slate-800 z-30 flex justify-between px-4">
                          {/* Perimeter Laser Emitters */}
                          <div className="w-4 h-full flex flex-col items-center justify-end pb-1">
                              <div className={`w-2 h-4 rounded-t ${renderState !== 'IDLE' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)]' : 'bg-slate-700'}`}></div>
                          </div>
                          <div className="w-4 h-full flex flex-col items-center justify-end pb-1">
                              <div className={`w-2 h-4 rounded-t ${renderState !== 'IDLE' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]' : 'bg-slate-700'}`}></div>
                          </div>
                          <div className="w-4 h-full flex flex-col items-center justify-end pb-1">
                              <div className={`w-2 h-4 rounded-t ${renderState !== 'IDLE' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]' : 'bg-slate-700'}`}></div>
                          </div>
                      </div>

                      {/* Laser Beams intersecting */}
                      {plasmaBursts.map(burst => (
                          <svg key={`beam-${burst.id}`} width="100%" height="100%" className="absolute inset-0 z-10 pointer-events-none opacity-50">
                              <line x1="10%" y1="90%" x2={`${burst.x}%`} y2={`${burst.y}%`} stroke={burst.color} strokeWidth="1" />
                              <line x1="50%" y1="90%" x2={`${burst.x}%`} y2={`${burst.y}%`} stroke={burst.color} strokeWidth="1" />
                              <line x1="90%" y1="90%" x2={`${burst.x}%`} y2={`${burst.y}%`} stroke={burst.color} strokeWidth="1" />
                          </svg>
                      ))}

                      {/* Plasma Bursts (The Fireworks) */}
                      {plasmaBursts.map(burst => (
                          <div 
                              key={burst.id}
                              className="absolute z-20"
                              style={{ left: `${burst.x}%`, top: `${burst.y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                              {/* Central Ignition Core */}
                              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"></div>
                              
                              {/* Simulated Plasma Nodes (Sparks) */}
                              {burst.type === 'WILLOW' && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-[willow_2s_ease-out_forwards]">
                                      {Array.from({length: 12}).map((_, i) => (
                                          <div key={i} className="absolute top-1/2 left-1/2 w-0.5 h-20 origin-top transform" style={{ rotate: `${i * 30}deg` }}>
                                              <div className="w-full h-full bg-gradient-to-b from-[#fbbf24] to-transparent"></div>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              {burst.type === 'CHRYSANTHEMUM' && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-[bloom_0.8s_ease-out_forwards]">
                                      {Array.from({length: 24}).map((_, i) => (
                                          <div key={i} className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#ec4899] rounded-full shadow-[0_0_10px_rgba(236,72,153,1)] transition-transform" 
                                               style={{ transform: `rotate(${i * 15}deg) translateY(-40px)` }}></div>
                                      ))}
                                  </div>
                              )}

                              {burst.type === 'PEONY' && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-[#06b6d4] animate-[ping_1s_ease-out_forwards] shadow-[0_0_30px_rgba(6,182,212,0.8)] opacity-0"></div>
                              )}
                          </div>
                      ))}

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes willow {
                        0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
                        50% { opacity: 1; }
                        100% { transform: translate(-50%, -20%) scale(1); opacity: 0; }
                    }
                    @keyframes bloom {
                        0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Launch Controls */}
            <div className="w-full bg-[#0b0512] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Execute Plasma Rendering</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerFirework('WILLOW')}
                   disabled={!systemActive || renderState === 'CHARGING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || renderState === 'CHARGING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-400 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                   }`}
                 >
                   Gold<br/>Willow
                 </button>

                 <button 
                   onClick={() => triggerFirework('CHRYSANTHEMUM')}
                   disabled={!systemActive || renderState === 'CHARGING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || renderState === 'CHARGING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                   }`}
                 >
                   Magenta<br/>Chrysanthemum
                 </button>

                 <button 
                   onClick={() => triggerFirework('PEONY')}
                   disabled={!systemActive || renderState === 'CHARGING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || renderState === 'CHARGING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   Cyan<br/>Peony Shell
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HolographicFireworks;
