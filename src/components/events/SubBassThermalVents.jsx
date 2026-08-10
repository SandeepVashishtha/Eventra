/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SubBassThermalVents = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [audioState, setAudioState] = useState('IDLE'); // IDLE, BUILDUP, DROP
  
  // Thermodynamic Metrics
  const [ambientTemp, setAmbientTemp] = useState(72); // Fahrenheit
  const [acousticPressure, setAcousticPressure] = useState(85); // dB SPL
  const [nitrogenReserves, setNitrogenReserves] = useState(5000); // Liters
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'HVAC Thermal Vents online. LN2 valves sealed.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Awaiting Pioneer CDJ sub-frequency telemetry.' }
  ]);

  // Visualizer State
  const [fogOpacity, setFogOpacity] = useState(0);
  const [speakerVibration, setSpeakerVibration] = useState(0);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (audioState === 'IDLE') {
              // Crowd naturally heats up the area
              setAmbientTemp(prev => Math.min(105, prev + (Math.random() * 0.5)));
              setAcousticPressure(Math.random() * 5 + 95); // Base festival volume
              setSpeakerVibration(2);
              setFogOpacity(prev => Math.max(0, prev - 5)); // Fog clears naturally
          } else if (audioState === 'BUILDUP') {
              // Tension builds, crowd packs tighter
              setAmbientTemp(prev => Math.min(110, prev + (Math.random() * 1.5)));
              setAcousticPressure(prev => Math.min(115, prev + 1));
              setSpeakerVibration(prev => Math.min(10, prev + 0.5));
          } else if (audioState === 'DROP') {
              // The Drop hits - maximum vibration, instant cooling
              setAcousticPressure(135 + (Math.random() * 5));
              setSpeakerVibration(25);
              setAmbientTemp(prev => Math.max(68, prev - 5)); // Rapid cooling
              
              setNitrogenReserves(prev => {
                  const next = prev - 25;
                  if (next < 0) return 5000; // Auto-refill for demo
                  return next;
              });
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, audioState]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    if (type === 'BUILDUP') {
        if (audioState === 'BUILDUP' || audioState === 'DROP') return;
        setAudioState('BUILDUP');
        addLog('WARN', 'CDJ Telemetry: High-pass filter sweep detected. Crowd density increasing.');
        addLog('ACTION', 'Pre-charging Liquid Nitrogen (LN2) pneumatic valves.');
    } else if (type === 'DROP') {
        if (audioState === 'DROP') return;
        setAudioState('DROP');
        setFogOpacity(100); // Instant fog deployment
        addLog('CRIT', 'CDJ Telemetry: SUB-BASS DROP DETECTED (35Hz).');
        addLog('SUCCESS', 'FIRING LN2 VENTS! Weaponizing acoustic pressure for rapid thermal dispersion.');
        
        // Auto-recover back to idle
        setTimeout(() => {
            if (systemActive) {
                setAudioState('IDLE');
                addLog('SYS', 'Bass transient passed. Valves closed. Thermal equilibrium stabilizing.');
            }
        }, 4000);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setAmbientTemp(98); // Start hot
      setNitrogenReserves(5000);
      setAudioState('IDLE');
      addLog('SYS', 'Thermal Dissipation Engine Linked to Main Stage Array.');
    } else {
      setSystemActive(false);
      setAudioState('IDLE');
      setFogOpacity(0);
      setSpeakerVibration(0);
      addLog('WARN', 'HVAC System Offline. Crowd thermal risk increasing.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070303] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❄️</span> Thermodynamics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Sub-Bass Thermal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">Dissipation Vents</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive crowds packed tightly near the front of the stage generate dangerous amounts of body heat, often resulting in heatstroke during summer festivals. Eventra solves this by installing specialized thermal dissipation floor vents connected directly to the stage's subwoofer arrays. The software syncs the release of highly pressurized, atomized Liquid Nitrogen exactly with the sub-bass frequencies (the "drop"), weaponizing the acoustic pressure waves to rapidly blast the cooling fog through the dense crowd, instantly dropping ambient temperatures.
          </p>

          <div className="bg-[#120505] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎛️</span> HVAC & Acoustic Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Seal LN2 Valves' : 'Arm Thermal Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Ambient Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ambientTemp >= 100 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 ambientTemp < 80 ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Crowd Core Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-500 ${
                     ambientTemp >= 100 ? 'text-red-500' :
                     ambientTemp < 80 ? 'text-blue-400' : 'text-orange-400'
                   }`}>
                     {ambientTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°F</span>
                 </div>
               </div>

               {/* Acoustic Pressure */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 audioState === 'DROP' ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Acoustic Pressure
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     audioState === 'DROP' ? 'text-purple-400' :
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(acousticPressure)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* LN2 Reserves */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 audioState === 'DROP' ? 'bg-cyan-950/30 border-cyan-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   LN2 Reserves
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {nitrogenReserves}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">L</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Synchronization Log</span>
                 {audioState === 'BUILDUP' && <span className="text-orange-400 animate-pulse">CHARGING VALVES...</span>}
                 {audioState === 'DROP' && <span className="text-cyan-400 font-black animate-ping">LN2 RELEASE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-purple-400 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-red-400 font-bold' :
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
                !systemActive ? 'bg-slate-900' : 
                ambientTemp >= 100 ? 'bg-[#1a0505]' : 
                ambientTemp < 80 ? 'bg-[#050f1a]' : 'bg-[#0f0a05]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">STAGE PIT CAMERA</span>
                <span className="text-[8px] font-mono text-slate-400">THERMAL / ACOUSTIC</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col justify-end">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col">
                      
                      {/* Stage Background */}
                      <div className="absolute top-10 inset-x-0 h-32 bg-slate-900 border-b border-slate-700 flex justify-center items-end px-4 z-10">
                          {/* DJ Booth */}
                          <div className="w-24 h-12 bg-slate-800 border-t-2 border-x-2 border-slate-600 rounded-t mb-2 flex items-center justify-center">
                              <span className="text-xl">🎧</span>
                          </div>
                          
                          {/* Lasers (Only active during Buildup/Drop) */}
                          {(audioState === 'BUILDUP' || audioState === 'DROP') && (
                              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                  <div className="absolute bottom-4 left-1/4 w-0.5 h-64 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] transform -rotate-45 origin-bottom"></div>
                                  <div className="absolute bottom-4 right-1/4 w-0.5 h-64 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)] transform rotate-45 origin-bottom"></div>
                              </div>
                          )}
                      </div>

                      {/* Subwoofer Array */}
                      <div className="absolute bottom-24 inset-x-0 flex justify-center gap-2 z-20">
                          {[1, 2, 3].map((sub) => (
                              <div key={sub} className="w-16 h-16 bg-black border border-slate-800 rounded flex flex-col items-center justify-center p-1">
                                  {/* Speaker Cone */}
                                  <div 
                                      className="w-10 h-10 rounded-full border-4 border-slate-700 bg-slate-900 shadow-inner"
                                      style={{ transform: `scale(${1 + (speakerVibration / 100)})` }}
                                  >
                                      <div className="w-full h-full rounded-full border border-slate-800 bg-slate-950"></div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Floor Vents */}
                      <div className="absolute bottom-16 inset-x-12 h-6 bg-slate-800 rounded flex justify-around items-center px-4 z-10 border border-slate-700">
                          {[1, 2, 3, 4, 5].map(vent => (
                              <div key={vent} className="w-8 h-2 bg-black rounded shadow-inner flex space-x-0.5 p-0.5">
                                  <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                                  <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                                  <div className="w-full h-full bg-slate-700 rounded-sm"></div>
                              </div>
                          ))}
                      </div>

                      {/* The Crowd (Heat map coloring) */}
                      <div className="absolute bottom-0 inset-x-0 h-20 flex justify-center items-end px-2 z-30">
                          <div className={`w-full h-full rounded-t-[3rem] transition-colors duration-1000 flex justify-center items-end pb-2 opacity-80 ${
                              ambientTemp >= 100 ? 'bg-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.5)]' :
                              ambientTemp < 80 ? 'bg-blue-600/40' : 'bg-orange-600/40'
                          }`}>
                              <span className="text-3xl filter brightness-50">👥👥👥👥👥</span>
                          </div>
                      </div>

                      {/* Liquid Nitrogen Fog overlay */}
                      <div 
                          className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-cyan-300 via-white to-transparent pointer-events-none z-40 transition-opacity duration-300"
                          style={{ 
                              opacity: fogOpacity / 100,
                              filter: 'blur(8px)'
                          }}
                      ></div>
                      
                      {/* Shockwave effect on drop */}
                      {audioState === 'DROP' && (
                          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full h-32 border-4 border-purple-500/50 rounded-full animate-[ping_1s_ease-out] pointer-events-none z-20 blur-sm"></div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120505] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate DJ Set</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('BUILDUP')}
                   disabled={!systemActive || audioState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || audioState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   Trigger Buildup (Heat Up)
                 </button>

                 <button 
                   onClick={() => triggerEvent('DROP')}
                   disabled={!systemActive || audioState !== 'BUILDUP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || audioState !== 'BUILDUP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse'
                   }`}
                 >
                   Trigger The Drop (Cooling)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SubBassThermalVents;
