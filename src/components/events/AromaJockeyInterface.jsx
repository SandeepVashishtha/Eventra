/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AromaJockeyInterface = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [activeScent, setActiveScent] = useState('NONE'); // NONE, PINE, CITRUS, OCEAN
  
  // Olfactory Metrics
  const [atomizerTemp, setAtomizerTemp] = useState(65); // °C
  const [terpeneLevel, setTerpeneLevel] = useState(100); // %
  const [crowdSaturation, setCrowdSaturation] = useState(0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:30:00', type: 'SYS', msg: 'Aroma-Jockey HVAC Vaporizers Online.' },
    { id: 2, time: '22:30:02', type: 'SYS', msg: 'Awaiting terpene mixture selection.' }
  ]);

  // Visualizer State
  const [fogParticles, setFogParticles] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (activeScent !== 'NONE') {
              // Heat up atomizers
              setAtomizerTemp(prev => Math.min(220, prev + 5));
              
              if (atomizerTemp > 180) {
                  // Vaporizing
                  setCrowdSaturation(prev => Math.min(100, prev + 2));
                  setTerpeneLevel(prev => Math.max(0, prev - 0.5));
                  
                  // Spawn fog particles
                  setFogParticles(prev => {
                      const newParticle = {
                          id: Date.now() + Math.random(),
                          x: Math.random() * 100,
                          size: Math.random() * 40 + 20,
                          opacity: Math.random() * 0.5 + 0.3,
                          type: activeScent
                      };
                      return [...prev.filter(p => Date.now() - p.id < 4000), newParticle];
                  });
              }
          } else {
              // Cool down and clear fog
              setAtomizerTemp(prev => Math.max(65, prev - 2));
              setCrowdSaturation(prev => Math.max(0, prev - 3));
              setFogParticles(prev => prev.filter(p => Date.now() - p.id < 2000));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, activeScent, atomizerTemp]);

  const triggerScent = (type) => {
    if (!systemActive) return;
    
    if (activeScent === type) {
        setActiveScent('NONE');
        addLog('ACTION', `Halting vaporization. Engaging exhaust fans.`);
        return;
    }
    
    setActiveScent(type);
    
    const names = {
        'PINE': 'Alpine Forest (Pinene)',
        'CITRUS': 'Electric Citrus (Limonene)',
        'OCEAN': 'Deep Ocean Breeze (Linalool)'
    };
    
    addLog('ACTION', `Aroma-Jockey selected: ${names[type]}.`);
    addLog('SYS', `Heating ceramic atomizers to 220°C for optimal terpene dispersion.`);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setTerpeneLevel(100);
      setCrowdSaturation(0);
      setActiveScent('NONE');
      addLog('SYS', 'Multi-Sensory Olfactory Array Linked to DMX Rigging.');
    } else {
      setSystemActive(false);
      setActiveScent('NONE');
      setFogParticles([]);
      addLog('WARN', 'Vaporizers Offline. Returning to standard visual-only FX.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const getScentColor = (type, opacity = 1) => {
      switch(type) {
          case 'PINE': return `rgba(34, 197, 94, ${opacity})`; // Green
          case 'CITRUS': return `rgba(234, 179, 8, ${opacity})`; // Yellow
          case 'OCEAN': return `rgba(56, 189, 248, ${opacity})`; // Blue
          default: return `rgba(255, 255, 255, ${opacity})`;
      }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌿</span> Olfactory Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Scent-Responsive Dancefloor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Aroma-Jockey UI</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals are highly visual and auditory, but entirely neglect the olfactory senses, and dense crowds often smell terrible after 10 hours of dancing. Eventra solves this by implementing a digital interface for an "Aroma Jockey." The UI connects to high-capacity, heated scent vaporizers embedded in the stage rigging. It allows the operator to dynamically mix and trigger different terpene-based atmospheric scents timed perfectly with the emotional shifts in the music and visual lighting cues.
          </p>

          <div className="bg-[#080b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Vaporizer Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Purge Vaporizers' : 'Ignite Atomizers'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 atomizerTemp > 180 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Atomizer Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     atomizerTemp > 180 ? 'text-orange-400' :
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(atomizerTemp)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°C</span>
                 </div>
               </div>

               {/* Terpene Level */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Fluid Reserves
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {terpeneLevel.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Saturation */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdSaturation > 80 ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Crowd Saturation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdSaturation > 80 ? 'text-indigo-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {Math.floor(crowdSaturation)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Atmospheric Telemetry Log</span>
                 {atomizerTemp > 180 && activeScent !== 'NONE' && <span className="text-teal-400 font-black animate-pulse">VAPORIZING</span>}
                 {atomizerTemp < 180 && activeScent !== 'NONE' && <span className="text-orange-400 animate-pulse">HEATING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' :
                       'text-slate-400'
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
            
            {/* Stage Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">STAGE RIGGING VIEW</span>
                <span className="text-[8px] font-mono text-slate-400">OLFACTORY DYNAMICS</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col justify-end">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col z-20">
                      
                      {/* Truss/Rigging */}
                      <div className="absolute top-12 inset-x-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMGwxMCAxME0xMCAwTDAgMTAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] z-30">
                          {/* Vaporizer Nozzles */}
                          <div className="absolute -bottom-2 left-1/4 w-4 h-4 bg-slate-800 rounded-b"></div>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-b"></div>
                          <div className="absolute -bottom-2 right-1/4 w-4 h-4 bg-slate-800 rounded-b"></div>
                      </div>

                      {/* Stage/Crowd Area */}
                      <div className="absolute bottom-0 inset-x-0 h-24 bg-slate-900/50 border-t border-slate-800 flex justify-center items-end px-2 z-10">
                          <span className="text-3xl filter brightness-50 mb-2">👥👥👥👥👥</span>
                      </div>

                      {/* Vapor Particles */}
                      <div className="absolute inset-0 pointer-events-none z-20">
                          {fogParticles.map(p => (
                              <div 
                                  key={p.id}
                                  className="absolute rounded-full blur-xl animate-[fall_4s_linear]"
                                  style={{
                                      left: `${p.x}%`,
                                      top: '-10%',
                                      width: `${p.size}px`,
                                      height: `${p.size}px`,
                                      backgroundColor: getScentColor(p.type, p.opacity),
                                      boxShadow: `0 0 ${p.size}px ${getScentColor(p.type, p.opacity)}`
                                  }}
                              ></div>
                          ))}
                      </div>

                      {/* Vapor Heater Status */}
                      {activeScent !== 'NONE' && (
                          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 flex items-center bg-black/60 rounded px-2 py-1 backdrop-blur border border-slate-800">
                              <span className="text-[10px] mr-2">🔥</span>
                              <div className="w-16 h-1 bg-slate-800 rounded overflow-hidden">
                                  <div 
                                      className="h-full bg-orange-500 transition-all duration-300"
                                      style={{ width: `${(atomizerTemp / 220) * 100}%` }}
                                  ></div>
                              </div>
                          </div>
                      )}

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes fall {
                        0% { transform: translateY(0) scale(0.5); opacity: 0; }
                        20% { opacity: 1; transform: translateY(100px) scale(1.5); }
                        80% { opacity: 0.8; transform: translateY(300px) scale(3); }
                        100% { opacity: 0; transform: translateY(400px) scale(4); }
                    }
                `}} />

              </div>
            </div>

            {/* Aroma Jockey Controls */}
            <div className="w-full bg-[#080b12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Aroma-Jockey Mixer Deck</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerScent('PINE')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     activeScent === 'PINE' ? 'bg-green-950/60 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   🌲 Alpine<br/>Pinene
                 </button>

                 <button 
                   onClick={() => triggerScent('CITRUS')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     activeScent === 'CITRUS' ? 'bg-yellow-950/60 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   🍋 Citrus<br/>Limonene
                 </button>

                 <button 
                   onClick={() => triggerScent('OCEAN')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     activeScent === 'OCEAN' ? 'bg-blue-950/60 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   🌊 Ocean<br/>Linalool
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AromaJockeyInterface;
