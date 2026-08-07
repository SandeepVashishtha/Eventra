/* eslint-disable */
import React, { useState, useEffect } from 'react';

const TactileTransducerIntegration = () => {
  const [hapticsActive, setHapticsActive] = useState(false);
  const [activeStems, setActiveStems] = useState({ kick: true, bass: true, synth: false });
  
  // Frequency visualizers
  const [kickFreq, setKickFreq] = useState(0);
  const [bassFreq, setBassFreq] = useState(0);
  const [synthFreq, setSynthFreq] = useState(0);

  const [systemLog, setSystemLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'DSP Stem separator initialized. Receiving live FOH mix.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Awaiting SubPac IoT haptic vest connections.' }
  ]);

  useEffect(() => {
    let loop;
    if (hapticsActive) {
      loop = setInterval(() => {
        // Simulate stem frequencies based on a 128bpm dance track
        const isKick = Math.random() > 0.6;
        
        if (activeStems.kick) setKickFreq(isKick ? 100 : Math.random() * 20);
        else setKickFreq(0);
        
        if (activeStems.bass) setBassFreq(isKick ? Math.random() * 30 + 70 : Math.random() * 50);
        else setBassFreq(0);
        
        if (activeStems.synth) setSynthFreq(Math.random() * 80 + 20);
        else setSynthFreq(0);

      }, 250); // 4x a second updates
    } else {
      setKickFreq(0);
      setBassFreq(0);
      setSynthFreq(0);
    }
    return () => clearInterval(loop);
  }, [hapticsActive, activeStems]);

  const toggleHaptics = () => {
    if (!hapticsActive) {
      setHapticsActive(true);
      addLog('ACTION', 'Broadcasting localized haptic telemetry to 142 connected vests.');
    } else {
      setHapticsActive(false);
      addLog('WARN', 'Haptic broadcast terminated.');
    }
  };

  const toggleStem = (stem) => {
    setActiveStems(prev => {
      const newState = { ...prev, [stem]: !prev[stem] };
      addLog('SYS', `Stem routing updated: ${stem.toUpperCase()} is now ${newState[stem] ? 'MAPPED' : 'MUTED'}.`);
      return newState;
    });
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSystemLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Accessibility Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦻</span> Accessible IoT Audio
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Tactile Transducer <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Integration for Deaf Attendees</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Deaf and hard-of-hearing attendees often rely solely on sign language interpreters, missing out entirely on the physical impact and dynamic range of the live music. Eventra bridges this gap by integrating the Front of House (FOH) audio console directly with wearable tactile transducers (like SubPacs) distributed to these attendees. The system automatically separates the live audio stems (kick, bass, synth) and translates these specific frequencies into highly distinct haptic vibrational patterns on the body, allowing users to physically "feel" the complex musical arrangement in real-time.
          </p>

          <div className="bg-[#0b0f19] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> DSP Haptic Stem Router
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleHaptics}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     hapticsActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {hapticsActive ? 'Mute Haptic Array' : 'Transmit Vest Telemetry'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Kick Drum Stem */}
               <div 
                 onClick={() => toggleStem('kick')}
                 className={`p-4 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer ${
                   !activeStems.kick ? 'bg-slate-900 border-slate-800 opacity-50' : 
                   kickFreq > 80 ? 'bg-indigo-900/50 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' : 'bg-slate-800 border-indigo-900'
                 }`}
               >
                 <span className="text-[10px] font-bold uppercase tracking-widest mb-3">Kick (20-60Hz)</span>
                 <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center relative overflow-hidden">
                   <div 
                     className="absolute bottom-0 w-full bg-indigo-500 transition-all duration-150" 
                     style={{ height: `${kickFreq}%` }}
                   ></div>
                 </div>
                 <span className="text-[8px] mt-2 font-mono">{activeStems.kick ? 'MAPPED' : 'MUTED'}</span>
               </div>

               {/* Bass Synth Stem */}
               <div 
                 onClick={() => toggleStem('bass')}
                 className={`p-4 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer ${
                   !activeStems.bass ? 'bg-slate-900 border-slate-800 opacity-50' : 
                   bassFreq > 60 ? 'bg-cyan-900/50 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-800 border-cyan-900'
                 }`}
               >
                 <span className="text-[10px] font-bold uppercase tracking-widest mb-3">Bass (60-250Hz)</span>
                 <div className="w-16 h-16 rounded-full border-4 border-cyan-500 flex items-center justify-center relative overflow-hidden">
                   <div 
                     className="absolute bottom-0 w-full bg-cyan-500 transition-all duration-150" 
                     style={{ height: `${bassFreq}%` }}
                   ></div>
                 </div>
                 <span className="text-[8px] mt-2 font-mono">{activeStems.bass ? 'MAPPED' : 'MUTED'}</span>
               </div>

               {/* Lead Synth Stem */}
               <div 
                 onClick={() => toggleStem('synth')}
                 className={`p-4 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer ${
                   !activeStems.synth ? 'bg-slate-900 border-slate-800 opacity-50' : 
                   synthFreq > 50 ? 'bg-fuchsia-900/50 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'bg-slate-800 border-fuchsia-900'
                 }`}
               >
                 <span className="text-[10px] font-bold uppercase tracking-widest mb-3 text-center">Lead (250Hz+)</span>
                 <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500 flex items-center justify-center relative overflow-hidden">
                   <div 
                     className="absolute bottom-0 w-full bg-fuchsia-500 transition-all duration-150" 
                     style={{ height: `${synthFreq}%` }}
                   ></div>
                 </div>
                 <span className="text-[8px] mt-2 font-mono">{activeStems.synth ? 'MAPPED' : 'MUTED'}</span>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Haptic Network Log</span>
                 {hapticsActive && <span className="text-indigo-400 animate-pulse">Broadcasting UDP...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {systemLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'WARN' ? 'text-rose-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Haptic Vest Visualizer (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            <div className={`w-full rounded-[2rem] border-[4px] border-[#111] shadow-2xl relative flex flex-col h-[500px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-75`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none border-b border-slate-800 bg-black/60 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Vest UI ID: 08A
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                
                {/* Simulated Haptic Vest SVG/Graphic */}
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Vest Outline */}
                  <div className="absolute w-48 h-64 border-4 border-slate-700 rounded-[40px] opacity-50 z-10"></div>
                  <div className="absolute w-24 h-12 border-4 border-slate-700 rounded-b-full top-12 opacity-50 z-10 bg-slate-900"></div>

                  {/* Transducer Nodes (Mapped to Stems) */}
                  
                  {/* Chest / Low End (Kick) */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-20 flex justify-between z-20">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-900 relative flex items-center justify-center">
                      <div className="absolute bg-indigo-500 rounded-full blur-[2px] transition-all duration-75" style={{ width: `${kickFreq}%`, height: `${kickFreq}%`, opacity: kickFreq/100 }}></div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-900 relative flex items-center justify-center">
                      <div className="absolute bg-indigo-500 rounded-full blur-[2px] transition-all duration-75" style={{ width: `${kickFreq}%`, height: `${kickFreq}%`, opacity: kickFreq/100 }}></div>
                    </div>
                  </div>

                  {/* Stomach / Sub (Bass) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-20 h-20 mt-4 rounded-full border-2 border-cyan-900 relative flex items-center justify-center z-20">
                    <div className="absolute bg-cyan-500 rounded-full blur-[4px] transition-all duration-150" style={{ width: `${bassFreq}%`, height: `${bassFreq}%`, opacity: bassFreq/100 }}></div>
                  </div>

                  {/* Shoulders / Mid-Highs (Synth) */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-40 h-8 flex justify-between z-20 px-2">
                    <div className="w-6 h-6 rounded-md border border-fuchsia-900 relative flex items-center justify-center">
                      <div className="absolute bg-fuchsia-500 rounded-md transition-all duration-75" style={{ width: `${synthFreq}%`, height: `${synthFreq}%`, opacity: synthFreq/100 }}></div>
                    </div>
                    <div className="w-6 h-6 rounded-md border border-fuchsia-900 relative flex items-center justify-center">
                      <div className="absolute bg-fuchsia-500 rounded-md transition-all duration-75" style={{ width: `${synthFreq}%`, height: `${synthFreq}%`, opacity: synthFreq/100 }}></div>
                    </div>
                  </div>

                  {/* Visual Impact Ring (Overall intensity) */}
                  {kickFreq > 90 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-indigo-500 rounded-full animate-ping opacity-20 z-0 pointer-events-none"></div>
                  )}

                </div>

                {!hapticsActive && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-slate-500">
                    <span className="text-4xl mb-2">🦺</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Vest Inactive (No Signal)</span>
                  </div>
                )}

              </div>
            </div>

            <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Haptic Translation</span>
              <p className="text-xs text-slate-400">Low frequencies map to heavy central impacts, while highs map to lighter shoulder vibrations.</p>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default TactileTransducerIntegration;
