/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticVestSync = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Audio Metrics
  const [masterVolume, setMasterVolume] = useState(-18); // dB
  const [activeVests, setActiveVests] = useState(0); 
  const [transmitLatency, setTransmitLatency] = useState(0); // ms
  
  // Frequency Bands
  const [subBass, setSubBass] = useState(0); // 20-60Hz
  const [midRange, setMidRange] = useState(0); // 300-2000Hz
  const [highFreq, setHighFreq] = useState(0); // 5000Hz+
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'DSP Band-Splitter bridging FOH Master Out.' },
    { id: 2, time: '21:30:02', type: 'SYS', msg: 'Awaiting Bluetooth Haptic Vest pairings...' }
  ]);

  // Visualizer State
  const [musicState, setMusicState] = useState('IDLE'); // IDLE, BUILDUP, DROP
  const [eqBars, setEqBars] = useState(Array.from({ length: 16 }).fill(0));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setActiveVests(142 + Math.floor(Math.random() * 5));
          setTransmitLatency(4 + Math.random() * 2);

          // Simulate Audio based on music state
          let targetSub = 10;
          let targetMid = 30;
          let targetHigh = 20;

          if (musicState === 'BUILDUP') {
              targetSub = 20 + Math.random() * 10;
              targetMid = 60 + Math.random() * 30;
              targetHigh = 80 + Math.random() * 20;
          } else if (musicState === 'DROP') {
              targetSub = 90 + Math.random() * 10;
              targetMid = 40 + Math.random() * 20;
              targetHigh = 90 + Math.random() * 10;
          }

          setSubBass(prev => prev + (targetSub - prev) * 0.2);
          setMidRange(prev => prev + (targetMid - prev) * 0.2);
          setHighFreq(prev => prev + (targetHigh - prev) * 0.2);
          
          setMasterVolume(Math.max(-60, -18 + ((targetSub + targetMid) / 20)));

          // Update EQ Bars
          setEqBars(prev => prev.map((_, i) => {
              if (i < 4) return subBass * (0.8 + Math.random() * 0.4); // Bass
              if (i < 12) return midRange * (0.8 + Math.random() * 0.4); // Mids
              return highFreq * (0.8 + Math.random() * 0.4); // Highs
          }));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, musicState, subBass, midRange, highFreq]);

  const triggerEvent = (event) => {
      if (!systemActive) return;
      
      setMusicState(event);
      if (event === 'BUILDUP') {
          addLog('WARN', 'FOH Audio: DJ initiating snare buildup (128 BPM).');
          addLog('SYS', 'Actuators preparing for high-intensity rumble.');
      } else if (event === 'DROP') {
          addLog('CRIT', 'FOH Audio: MASSIVE BASS DROP DETECTED.');
          addLog('ACTION', 'Routing 100% Sub-bass frequencies to Central Chest Actuators.');
          
          setTimeout(() => {
              if (systemActive) setMusicState('IDLE');
          }, 3000); // Drop lasts 3 seconds before returning to normal
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Bluetooth transmitter active. Pairing 142 accessibility vests.');
    } else {
      setSystemActive(false);
      setActiveVests(0);
      setTransmitLatency(0);
      setSubBass(0); setMidRange(0); setHighFreq(0);
      setEqBars(Array.from({ length: 16 }).fill(0));
      setMusicState('IDLE');
      addLog('WARN', 'Haptic Sync Offline. Vests disabled.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦻</span> Accessibility Technology
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Immersive Haptic Vests <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500">Synced to Subwoofers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Deaf and hard-of-hearing attendees often miss out on the intricate production and visceral bassline drops of electronic music performances. Eventra solves this by providing Bluetooth-enabled haptic feedback vests. Eventra's backend splits the master audio feed from the Front of House (FOH) mixing board into specific frequency bands, transmitting them wirelessly to the vests with ultra-low latency. High frequencies trigger shoulder actuators, while deep sub-bass triggers heavy chest rumbles, translating the entire acoustic experience into an immersive somatic mapping.
          </p>

          <div className="bg-[#120815] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> DSP Band-Splitter Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disconnect Master Out' : 'Bridge FOH Audio Feed'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Master Volume */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 musicState === 'DROP' ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse' : 
                 systemActive ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   FOH Master
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     musicState === 'DROP' ? 'text-rose-400' : 'text-fuchsia-400'
                   }`}>
                     {masterVolume.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

               {/* Sub Bass Intensity */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 subBass > 70 ? 'bg-rose-950/40 border-rose-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sub Bass (20Hz)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     subBass > 70 ? 'text-rose-400' : 'text-slate-300'
                   }`}>
                     {subBass.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* High Freq Intensity */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 highFreq > 70 ? 'bg-cyan-950/40 border-cyan-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Highs (10kHz)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     highFreq > 70 ? 'text-cyan-400' : 'text-slate-300'
                   }`}>
                     {highFreq.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Active Vests */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Paired Vests
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeVests}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Haptic Integration Ledger</span>
                 {systemActive && <span className="text-fuchsia-400 font-black animate-pulse">LATENCY: {transmitLatency.toFixed(1)}ms</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold uppercase bg-rose-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Actuator UI Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#120815]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">ACTUATOR MAPPING</span>
                <span className="text-[8px] font-mono text-slate-400">SENSORY SUIT v2</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-between px-4 pt-16 pb-4">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">TRANSMITTER OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col justify-between items-center">
                        
                        {/* Audio EQ Display */}
                        <div className="w-full h-12 flex items-end justify-center space-x-1 mb-4 opacity-50">
                            {eqBars.map((h, i) => {
                                let colorClass = 'bg-cyan-500';
                                if (i < 4) colorClass = 'bg-rose-500';
                                else if (i < 12) colorClass = 'bg-fuchsia-500';
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`w-2 rounded-t-sm transition-all duration-75 ${colorClass}`}
                                        style={{ height: `${Math.max(2, h)}%` }}
                                    ></div>
                                );
                            })}
                        </div>

                        {/* Vest Schematic */}
                        <div className="relative w-48 h-64 border-4 border-slate-800 rounded-3xl bg-slate-900/50 flex flex-col items-center p-4">
                            
                            {/* Head/Neck ref (just visual) */}
                            <div className="w-16 h-8 border-2 border-slate-700 rounded-t-full absolute -top-10 opacity-30"></div>

                            {/* Shoulders (High Freq) */}
                            <div className="w-full flex justify-between absolute top-4 px-2">
                                <div className={`w-10 h-10 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    highFreq > 50 ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-700'
                                }`}>
                                    <div className="w-4 h-4 rounded-full bg-cyan-500" style={{ opacity: highFreq / 100 }}></div>
                                </div>
                                <div className={`w-10 h-10 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    highFreq > 50 ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-700'
                                }`}>
                                    <div className="w-4 h-4 rounded-full bg-cyan-500" style={{ opacity: highFreq / 100 }}></div>
                                </div>
                            </div>

                            {/* Back/Mid (Mid Freq) */}
                            <div className="w-full flex justify-between absolute top-20 px-8">
                                <div className={`w-8 h-16 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    midRange > 50 ? 'border-fuchsia-400 bg-fuchsia-900/40' : 'border-slate-700'
                                }`}>
                                    <div className="w-3 h-10 rounded-full bg-fuchsia-500" style={{ opacity: midRange / 100 }}></div>
                                </div>
                                <div className={`w-8 h-16 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    midRange > 50 ? 'border-fuchsia-400 bg-fuchsia-900/40' : 'border-slate-700'
                                }`}>
                                    <div className="w-3 h-10 rounded-full bg-fuchsia-500" style={{ opacity: midRange / 100 }}></div>
                                </div>
                            </div>

                            {/* Chest/Sternum (Sub Bass) */}
                            <div className={`w-20 h-20 rounded-full border-4 absolute top-24 transition-all duration-75 flex items-center justify-center ${
                                subBass > 70 ? 'border-rose-500 bg-rose-900/40 shadow-[0_0_30px_rgba(244,63,94,0.8)] scale-110' : 'border-slate-700'
                            }`}>
                                <div className={`w-12 h-12 rounded-full bg-rose-500 transition-all duration-75 ${
                                    subBass > 70 ? 'animate-ping opacity-50' : 'opacity-0'
                                }`}></div>
                                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-rose-500" style={{ opacity: subBass / 100 }}></div>
                            </div>

                            {/* Lower Ribs (Sub Bass) */}
                            <div className="w-full flex justify-between absolute bottom-6 px-4">
                                <div className={`w-12 h-8 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    subBass > 50 ? 'border-rose-400 bg-rose-900/40' : 'border-slate-700'
                                }`}>
                                    <div className="w-8 h-4 rounded-full bg-rose-500" style={{ opacity: subBass / 100 }}></div>
                                </div>
                                <div className={`w-12 h-8 rounded-full border-2 transition-all duration-75 flex items-center justify-center ${
                                    subBass > 50 ? 'border-rose-400 bg-rose-900/40' : 'border-slate-700'
                                }`}>
                                    <div className="w-8 h-4 rounded-full bg-rose-500" style={{ opacity: subBass / 100 }}></div>
                                </div>
                            </div>

                        </div>

                        <div className="w-full text-center mt-4">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Freq Mapping</span>
                            <div className="flex justify-center space-x-3 mt-1">
                                <span className="text-[8px] text-rose-400">● 20Hz (Chest)</span>
                                <span className="text-[8px] text-fuchsia-400">● 1kHz (Ribs)</span>
                                <span className="text-[8px] text-cyan-400">● 10kHz (Shoulders)</span>
                            </div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#120815] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate DJ Performance</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerEvent('BUILDUP')}
                   disabled={!systemActive || musicState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || musicState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(192,38,211,0.3)]'
                   }`}
                 >
                   🥁 Snare Buildup (Highs)
                 </button>
                 
                 <button 
                   onClick={() => triggerEvent('DROP')}
                   disabled={!systemActive || musicState !== 'BUILDUP'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || musicState !== 'BUILDUP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                   }`}
                 >
                   💥 Bass Drop (Sub)
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HapticVestSync;
