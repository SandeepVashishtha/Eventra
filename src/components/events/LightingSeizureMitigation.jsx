/* eslint-disable */
import React, { useState, useEffect } from 'react';

const LightingSeizureMitigation = () => {
  const [vjActive, setVjActive] = useState(false);
  const [strobeHz, setStrobeHz] = useState(2); // Hertz
  const [dmxOutput, setDmxOutput] = useState(2); // Final output to physical lights
  const [mitigationActive, setMitigationActive] = useState(false);
  
  const [engineLog, setEngineLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'DMX Interceptor Node online. Neural safety protocol engaged.' }
  ]);

  // Seizure danger zone: typically 15-25 Hz
  const DANGER_ZONE_MIN = 15;
  const DANGER_ZONE_MAX = 25;

  useEffect(() => {
    let loop;
    if (vjActive) {
      loop = setInterval(() => {
        // VJ is ramping up the strobe
        setStrobeHz(prev => {
          let next = prev + (Math.random() * 2);
          if (next > 35) next = 2; // Loop back down
          return next;
        });
      }, 500);
    }
    return () => clearInterval(loop);
  }, [vjActive]);

  useEffect(() => {
    // Safety Algorithm Layer
    if (strobeHz >= DANGER_ZONE_MIN && strobeHz <= DANGER_ZONE_MAX) {
      if (!mitigationActive) {
        setMitigationActive(true);
        addLog('WARN', `DANGEROUS FREQUENCY DETECTED: ${strobeHz.toFixed(1)} Hz. Entering high-risk seizure range.`);
        addLog('SAFE', 'Dampening DMX output signal to max 12 Hz.');
      }
      setDmxOutput(12.0); // Cap it safely below the danger zone
    } else {
      if (mitigationActive) {
        setMitigationActive(false);
        addLog('SYS', 'Frequency safe. Restoring 1:1 DMX passthrough.');
      }
      setDmxOutput(strobeHz);
    }
  }, [strobeHz, mitigationActive]);

  const toggleVj = () => {
    if (!vjActive) {
      setVjActive(true);
      addLog('SYS', 'Receiving Art-Net/DMX stream from VJ Console.');
    } else {
      setVjActive(false);
      setStrobeHz(2);
      addLog('SYS', 'VJ stream paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setEngineLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Neural Safety Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Algorithmic Lighting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">Seizure Mitigation</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Aggressive strobe lighting at EDM festivals can accidentally trigger photosensitive epileptic seizures in vulnerable attendees, causing severe medical emergencies. Eventra deploys an AI middle-layer between the VJ software and the physical DMX lighting rig. The system intercepts the visual output in real-time. If the strobe pattern hits the specific Hz frequency known to trigger epilepsy (15-25 Hz), the system instantly dampens the signal, protecting the crowd without stopping the show.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> DMX Interceptor Node
               </h3>
               
               <button 
                 onClick={toggleVj}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   vjActive ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' :
                   'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                 }`}
               >
                 {vjActive ? 'Halt VJ Stream' : 'Simulate VJ Strobe Ramp'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6 relative">
               
               {/* VJ Console Input */}
               <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Input: VJ Console (Raw)</span>
                 <div className="flex items-end z-10">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     strobeHz >= DANGER_ZONE_MIN && strobeHz <= DANGER_ZONE_MAX ? 'text-red-500 animate-pulse' : 'text-neutral-300'
                   }`}>
                     {strobeHz.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-neutral-600 ml-2 pb-1">Hz</span>
                 </div>
               </div>

               {/* Physical Rig Output */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mitigationActive ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)_inset]' : 'border-neutral-800 bg-neutral-900'
               }`}>
                 {mitigationActive && (
                   <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg animate-fade-in">
                     Safety Override
                   </div>
                 )}
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Output: Stage DMX Rig</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     mitigationActive ? 'text-emerald-400' : 'text-neutral-300'
                   }`}>
                     {dmxOutput.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-neutral-600 ml-2 pb-1">Hz</span>
                 </div>
               </div>

             </div>

             {/* DMX Log */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2 flex justify-between">
                 <span>Protocol Interceptor Log</span>
                 {mitigationActive && <span className="text-emerald-400 animate-pulse">Filtering...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {engineLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'WARN' ? 'text-red-400 font-bold' : 
                       log.type === 'SAFE' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visual Strobe Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-neutral-900 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Header / Nav */}
            <div className="absolute top-0 inset-x-0 h-16 flex justify-between items-center px-6 z-30 bg-gradient-to-b from-black/80 to-transparent">
              <span className="font-black text-white tracking-widest uppercase text-sm">Stage Render</span>
              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                Visualizer
              </div>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-black">
               
               {/* Stage Structure */}
               <div className="absolute bottom-20 inset-x-10 h-32 border-2 border-neutral-800 rounded-t-[50px] z-10 flex flex-col items-center justify-end pb-4">
                 <div className="w-20 h-10 bg-neutral-900 border-t border-neutral-700 rounded flex items-center justify-center text-3xl">
                   🎧
                 </div>
               </div>

               {/* Simulated Strobe Lighting Array */}
               <div className="absolute top-32 inset-x-8 h-10 flex justify-between px-4 z-20">
                 {/* 
                    Using CSS animations to simulate the strobe. 
                    The duration is 1/Hz seconds.
                 */}
                 {[...Array(5)].map((_, i) => (
                   <div 
                     key={i} 
                     className="w-8 h-8 rounded-full bg-white opacity-0"
                     style={vjActive ? {
                       animation: `strobeSim ${1 / dmxOutput}s linear infinite`,
                       animationDelay: `${i * 0.05}s` // Slight offset for cool visual effect
                     } : {}}
                   >
                     {/* Glow artifact */}
                     <div className="absolute -inset-10 bg-white rounded-full blur-2xl opacity-50 mix-blend-screen pointer-events-none"></div>
                   </div>
                 ))}
               </div>
               
               <style dangerouslySetInnerHTML={{__html: `
                 @keyframes strobeSim {
                   0%, 40% { opacity: 0; }
                   50% { opacity: 1; filter: brightness(2); }
                   60%, 100% { opacity: 0; }
                 }
               `}} />

               {/* UI Overlay Indicators */}
               <div className="absolute bottom-4 inset-x-0 text-center z-30">
                 {mitigationActive ? (
                   <div className="inline-block bg-emerald-900/80 backdrop-blur-md text-emerald-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-fade-in-up">
                     🛡️ Output Dampened: Safe Range
                   </div>
                 ) : vjActive && strobeHz > 2 ? (
                   <div className="inline-block bg-neutral-900/80 backdrop-blur-md text-neutral-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-neutral-700 animate-fade-in-up">
                     Strobe Array Active
                   </div>
                 ) : (
                   <div className="inline-block bg-neutral-900/80 backdrop-blur-md text-neutral-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-neutral-800">
                     Awaiting DMX Signal
                   </div>
                 )}
               </div>

               {/* Dangerous Input Warning Overlay (Only shows what the VJ is *trying* to do) */}
               {strobeHz >= DANGER_ZONE_MIN && strobeHz <= DANGER_ZONE_MAX && (
                 <div className="absolute top-20 right-6 text-right z-30 animate-fade-in">
                   <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Raw Input Danger</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LightingSeizureMitigation;
