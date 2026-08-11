/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiodegradableWristband = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [bandState, setBandState] = useState('WORN'); // WORN, BURIED, COMPOSTED, SPROUTED
  
  // Eco Metrics
  const [compostProgress, setCompostProgress] = useState(0); // % decomposed
  const [soilMoisture, setSoilMoisture] = useState(0); // % from API
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Mycelium Biomaterials Tracker Online.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'RFID Tag 0x99B4 active. Status: Being worn.' }
  ]);

  // Visualizer State
  const [rain, setRain] = useState([]);
  
  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (bandState === 'WORN') {
              setSoilMoisture(0);
          } else if (bandState === 'BURIED') {
              // Simulate checking local weather API
              if (Math.random() > 0.8) {
                  setSoilMoisture(prev => Math.min(100, prev + 5)); // Raining
                  setRain(prev => [...prev, { id: Date.now(), x: Math.random() * 100, y: 0 }].slice(-10));
              } else {
                  setSoilMoisture(prev => Math.max(20, prev - 1)); // Drying out
              }
              
              // Composting needs moisture
              if (soilMoisture > 40) {
                  setCompostProgress(prev => {
                      const next = prev + 1.5;
                      if (next >= 100) {
                          setBandState('COMPOSTED');
                          addLog('SUCCESS', 'Mycelium matrix fully decomposed. Non-toxic RFID inert.');
                          addLog('ACTION', 'Native wildflower seeds germinating.');
                          return 100;
                      }
                      return next;
                  });
              }
          } else if (bandState === 'COMPOSTED') {
              setCompostProgress(100);
              
              // Sprouting transition
              setTimeout(() => {
                  if (systemActive && bandState === 'COMPOSTED') {
                      setBandState('SPROUTED');
                      setLoyaltyPoints(prev => prev + 500);
                      addLog('SUCCESS', 'Wildflowers sprouted! 500 Eco-Loyalty Points awarded to wallet.');
                  }
              }, 3000);
          }

          // Animate Rain
          setRain(prev => prev.map(r => ({ ...r, y: r.y + 10 })).filter(r => r.y < 80));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, bandState, soilMoisture, compostProgress]);

  const triggerEvent = (scenario) => {
    if (!systemActive) return;
    
    if (scenario === 'BURY') {
        setBandState('BURIED');
        setCompostProgress(0);
        setSoilMoisture(30);
        addLog('ACTION', 'User marked wristband as "Buried" in Eventra App.');
        addLog('SYS', 'Pinging local agricultural API for soil moisture & weather telemetry...');
    } else if (scenario === 'RESET') {
        setBandState('WORN');
        setCompostProgress(0);
        setSoilMoisture(0);
        setRain([]);
        addLog('SYS', 'Tracking new wristband lifecycle.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setBandState('WORN');
      setCompostProgress(0);
      setSoilMoisture(0);
      setLoyaltyPoints(1250);
      addLog('SYS', 'Environmental API Integration Active.');
    } else {
      setSystemActive(false);
      setBandState('WORN');
      setRain([]);
      addLog('WARN', 'Tracker Offline. Cannot verify biodegradation.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070604] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Biomaterials Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biodegradable RFID <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-lime-500">Seed Wristbands</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Millions of plastic RFID festival wristbands end up in landfills or are littered across natural festival grounds every year, taking 500 years to decompose. Eventra solves this by manufacturing official wristbands from a mycelium-based biomaterial embedded with a non-toxic RFID chip and native wildflower seeds. Post-festival, attendees can bury their wristband in the soil and log the GPS coordinates in the app. Eventra cross-references local weather and soil APIs to track the decomposition, automatically granting the user Eco-Loyalty points when the wristband successfully composts and sprouts into flowers.
          </p>

          <div className="bg-[#0b0f0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Eco-Lifecycle Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Tracker' : 'Activate Biomaterial API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Decomposition Progress */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bandState === 'BURIED' ? 'bg-amber-950/40 border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]' :
                 bandState === 'COMPOSTED' || bandState === 'SPROUTED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Decomposition
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     compostProgress >= 100 ? 'text-emerald-500' : 
                     bandState === 'BURIED' ? 'text-amber-500' : 'text-slate-600'
                   }`}>
                     {Math.floor(compostProgress)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Soil Moisture */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 soilMoisture > 50 ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive && bandState === 'BURIED' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Soil Moisture (API)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     soilMoisture > 50 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(soilMoisture)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Loyalty Points */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bandState === 'SPROUTED' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Eco-Loyalty
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bandState === 'SPROUTED' ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     {loyaltyPoints}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pts</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Lifecycle Events Ledger</span>
                 {bandState === 'BURIED' && <span className="text-amber-500 font-black animate-pulse">MONITORING DECOMPOSITION</span>}
                 {bandState === 'SPROUTED' && <span className="text-fuchsia-400 font-black animate-pulse">REWARD GRANTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-amber-500 font-bold' : 'text-slate-400'
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
            
            {/* Eco Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#18110b]' // Earthy dark brown
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">BIOMATERIAL LIFECYCLE</span>
                <span className="text-[8px] font-mono text-slate-400">ID: 0x99B4</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-end overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NO ASSET DETECTED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-end pb-8">
                      
                      {/* Weather (Rain) */}
                      {bandState === 'BURIED' && (
                          <div className="absolute inset-0 z-0 pointer-events-none">
                              {rain.map(r => (
                                  <div 
                                      key={r.id} 
                                      className="absolute w-0.5 h-3 bg-blue-400/50 rounded-full"
                                      style={{ left: `${r.x}%`, top: `${r.y}%` }}
                                  ></div>
                              ))}
                          </div>
                      )}

                      {/* The Wristband Asset */}
                      <div className="relative z-20 flex flex-col items-center">
                          
                          {/* Wrist (If Worn) */}
                          {bandState === 'WORN' && (
                              <div className="w-20 h-40 bg-[#c08668] rounded-t-3xl border-2 border-[#946147] flex items-center justify-center relative">
                                  {/* Wristband */}
                                  <div className="absolute top-12 w-24 h-6 bg-emerald-700 border border-emerald-500 rounded-sm shadow-xl flex items-center justify-center overflow-hidden">
                                      <span className="text-[6px] font-black uppercase text-emerald-300 mr-2">FESTIVAL</span>
                                      <div className="w-2 h-2 bg-slate-900 rounded-full flex items-center justify-center border border-slate-600">
                                          <div className="w-0.5 h-0.5 bg-blue-500 rounded-full animate-ping"></div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* Buried/Composting/Sprouted */}
                          {bandState !== 'WORN' && (
                              <div className="relative flex flex-col items-center justify-end h-64">
                                  
                                  {/* Sprout (If Sprouted) */}
                                  {bandState === 'SPROUTED' && (
                                      <div className="absolute bottom-12 flex flex-col items-center animate-[floatUp_1s_ease-out_forwards]">
                                          <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">🌸</span>
                                          <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                      </div>
                                  )}

                                  {/* Dirt Mound */}
                                  <div className="w-48 h-20 bg-[#3d2616] rounded-t-[100px] border-t-4 border-[#29170b] relative flex items-center justify-center z-10 shadow-2xl">
                                      
                                      {/* Wristband embedded in dirt */}
                                      {bandState === 'BURIED' && (
                                          <div 
                                              className="w-16 h-4 bg-emerald-800/80 border border-emerald-600 rounded-sm absolute top-8 rotate-12 transition-all duration-1000"
                                              style={{ 
                                                  opacity: 1 - (compostProgress / 100),
                                                  filter: `blur(${compostProgress / 10}px)`
                                              }}
                                          >
                                              <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-slate-900 rounded-full flex items-center justify-center border border-slate-600 opacity-50">
                                                  <div className="w-0.5 h-0.5 bg-blue-500/50 rounded-full animate-ping"></div>
                                              </div>
                                          </div>
                                      )}
                                      
                                      {/* Decomposed dirt texture */}
                                      {(bandState === 'COMPOSTED' || bandState === 'SPROUTED') && (
                                          <div className="absolute top-8 w-16 h-8 bg-[#4a2e1b] rounded-full blur-md"></div>
                                      )}
                                      
                                      <span className="absolute bottom-2 text-[8px] font-black uppercase text-[#6b472e]">Nutrient Soil</span>
                                  </div>

                              </div>
                          )}

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes floatUp {
                        0% { transform: translateY(20px) scale(0); opacity: 0; }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }
                `}} />

              </div>
            </div>

            {/* User Actions */}
            <div className="w-full bg-[#0b0f0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">User Lifecycle App Actions</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => triggerEvent('BURY')}
                   disabled={!systemActive || bandState !== 'WORN'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || bandState !== 'WORN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-500 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(217,119,6,0.4)] animate-pulse'
                   }`}
                 >
                   🌱 Bury Wristband Post-Festival
                 </button>
               </div>
               
               <button 
                 onClick={() => triggerEvent('RESET')}
                 disabled={!systemActive || bandState === 'WORN'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                   !systemActive || bandState === 'WORN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Purchase New Ticket (Reset)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiodegradableWristband;
