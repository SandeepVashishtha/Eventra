/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PiezoelectricDancefloor = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [crowdActivity, setCrowdActivity] = useState('IDLE'); // IDLE, DANCING, MOSH_PIT
  
  // Piezo Metrics
  const [stepsPerMinute, setStepsPerMinute] = useState(0); 
  const [kineticPower, setKineticPower] = useState(0); // kW current output
  const [totalEnergy, setTotalEnergy] = useState(14.5); // kWh accumulated
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '19:00:00', type: 'SYS', msg: 'Piezoelectric Tile Grid Online.' },
    { id: 2, time: '19:00:02', type: 'SYS', msg: 'Grid calibrated. Awaiting kinetic impact.' }
  ]);

  // Visualizer State
  const [activeTiles, setActiveTiles] = useState(Array(100).fill(0));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (crowdActivity === 'IDLE') {
              setStepsPerMinute(prev => Math.max(120, prev - 15));
              setKineticPower(prev => Math.max(0.5, prev - 0.2));
              
              // Random light footfalls
              setActiveTiles(Array.from({ length: 100 }, () => Math.random() > 0.9 ? 1 : 0));
              
          } else if (crowdActivity === 'DANCING') {
              setStepsPerMinute(1300 + (Math.random() * 200));
              setKineticPower(18.5 + (Math.random() * 2));
              setTotalEnergy(prev => prev + 0.005);
              
              // Rhythmic/dense footfalls
              setActiveTiles(Array.from({ length: 100 }, () => Math.random() > 0.6 ? 2 : 0));
              
          } else if (crowdActivity === 'MOSH_PIT') {
              setStepsPerMinute(4500 + (Math.random() * 500));
              setKineticPower(45.0 + (Math.random() * 5));
              setTotalEnergy(prev => prev + 0.015);
              
              // Heavy, chaotic footfalls
              setActiveTiles(Array.from({ length: 100 }, () => {
                  const val = Math.random();
                  return val > 0.8 ? 3 : val > 0.4 ? 2 : 1;
              }));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, crowdActivity]);

  const triggerActivity = (type) => {
    if (!systemActive) return;
    
    setCrowdActivity(type);
    
    if (type === 'DANCING') {
        addLog('ACTION', 'Crowd BPM sync detected. High-frequency tile compression active.');
        addLog('SUCCESS', 'Kinetic power exceeding 18kW. Offsetting stage lighting draw.');
    } else if (type === 'MOSH_PIT') {
        addLog('CRIT', 'Violent kinetic impacts detected in central sectors.');
        addLog('ACTION', 'Piezo crystals under max compression. Harvesting 45kW peak load.');
    } else if (type === 'IDLE') {
        addLog('WARN', 'Crowd activity dropping. Floor returning to baseline idle output.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setCrowdActivity('IDLE');
      addLog('SYS', 'Piezoelectric Inverters Armed. Sub-floor grid listening for impact.');
    } else {
      setSystemActive(false);
      setCrowdActivity('IDLE');
      setStepsPerMinute(0);
      setKineticPower(0);
      setActiveTiles(Array(100).fill(0));
      addLog('WARN', 'Inverters Offline. Kinetic energy being lost as heat and vibration.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // 0: Off, 1: Light (Blue), 2: Med (Yellow), 3: Heavy (Red)
  const getTileColor = (val) => {
      if (val === 1) return 'bg-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
      if (val === 2) return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] border border-yellow-300';
      if (val === 3) return 'bg-white shadow-[0_0_20px_rgba(255,255,255,1)] border-2 border-red-500';
      return 'bg-slate-900 border border-slate-800'; // Off
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Gamified Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Piezoelectric Kinetic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">Energy Dancefloors</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The kinetic energy generated by 50,000 people jumping simultaneously is entirely wasted as heat and vibration. Eventra solves this by integrating piezoelectric energy-harvesting tiles directly into the main stage dancefloor. Eventra's IoT dashboard tracks the kinetic energy generated by the crowd in real-time, converting the physical impact of dancing into usable electricity. This gamifies sustainability, showing the crowd exactly how much of the stage lighting they are powering through their own movement.
          </p>

          <div className="bg-[#120a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Kinetic Inverter Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Harvesting' : 'Engage Piezo Grid'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Impacts/Min */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdActivity !== 'IDLE' ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Floor Impacts
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     crowdActivity === 'MOSH_PIT' ? 'text-orange-400' : 
                     crowdActivity === 'DANCING' ? 'text-yellow-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(stepsPerMinute)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/min</span>
                 </div>
               </div>

               {/* Kinetic Power (kW) */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 kineticPower > 10 ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Output
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     kineticPower > 10 ? 'text-yellow-400' : 'text-slate-600'
                   }`}>
                     {kineticPower.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>
               
               {/* Total Energy (kWh) */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Harvested
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {totalEnergy.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kWh</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Piezo Crystal Ledger</span>
                 {crowdActivity === 'DANCING' && <span className="text-yellow-400 font-black animate-pulse">HARVESTING DANCE ENERGY</span>}
                 {crowdActivity === 'MOSH_PIT' && <span className="text-red-500 font-black animate-pulse">PEAK MOSH IMPACTS!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-yellow-400 font-bold' : 
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
            
            {/* Floor Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0f0a05]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">PIEZO-FLOOR MATRIX</span>
                <span className="text-[8px] font-mono text-slate-400">ZONE 1 (STAGE FRONT)</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4 px-4 overflow-hidden">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">GRID UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col">
                      
                      {/* Grid of 100 tiles (10x10) */}
                      <div className="flex-1 relative" style={{ perspective: '800px' }}>
                          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0.5 transform rotate-x-[30deg] scale-110 origin-bottom transition-all duration-300">
                              {activeTiles.map((val, i) => (
                                  <div 
                                      key={i} 
                                      className={`w-full h-full rounded-[1px] transition-colors duration-100 ${getTileColor(val)}`}
                                  ></div>
                              ))}
                          </div>
                      </div>

                      {/* Energy Flow Animation */}
                      <div className="h-24 w-full relative flex flex-col justify-end items-center border-t border-yellow-500/30 pt-2 mt-4 bg-gradient-to-t from-[#1a1005] to-transparent">
                          
                          {/* Laser lines representing electricity flowing from floor to battery */}
                          <svg width="100%" height="40" className="absolute top-0 left-0">
                              {[1,2,3,4,5].map(i => (
                                  <path 
                                      key={i}
                                      d={`M ${i * 20}% 0 Q 50% 20 50% 40`} 
                                      stroke={crowdActivity !== 'IDLE' ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.05)'} 
                                      strokeWidth="2" 
                                      fill="none" 
                                      className={crowdActivity !== 'IDLE' ? 'animate-[dashDown_0.5s_linear_infinite]' : ''}
                                      strokeDasharray={crowdActivity !== 'IDLE' ? '5 5' : '0'}
                                  />
                              ))}
                          </svg>

                          <div className="relative z-10 flex items-center bg-black border-2 border-slate-700 rounded-lg p-2 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                              <span className="text-xl mr-2 filter brightness-150">🔋</span>
                              <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Main Battery Bank</span>
                                  <span className={`text-sm font-mono font-bold ${
                                      crowdActivity === 'MOSH_PIT' ? 'text-red-500' :
                                      crowdActivity === 'DANCING' ? 'text-yellow-400' : 'text-slate-400'
                                  }`}>
                                      +{kineticPower.toFixed(1)} kW
                                  </span>
                              </div>
                          </div>
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes dashDown {
                        to { stroke-dashoffset: -10; }
                    }
                `}} />

              </div>
            </div>

            {/* Crowd Simulation Controls */}
            <div className="w-full bg-[#120a05] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Crowd Physics</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerActivity('IDLE')}
                   disabled={!systemActive || crowdActivity === 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdActivity === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   Idle<br/>(Standing)
                 </button>

                 <button 
                   onClick={() => triggerActivity('DANCING')}
                   disabled={!systemActive || crowdActivity === 'DANCING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdActivity === 'DANCING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-600 text-yellow-400 hover:bg-yellow-900/60 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse'
                   }`}
                 >
                   Dancing<br/>(Rhythmic)
                 </button>

                 <button 
                   onClick={() => triggerActivity('MOSH_PIT')}
                   disabled={!systemActive || crowdActivity === 'MOSH_PIT'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdActivity === 'MOSH_PIT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   Mosh Pit<br/>(Heavy Impact)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PiezoelectricDancefloor;
