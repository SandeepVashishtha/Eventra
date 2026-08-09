/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticSubBassSync = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [bassState, setBassState] = useState('IDLE'); // IDLE, ACTIVE, BASS_DROP
  
  // Audio & Kinetic Metrics
  const [danteSubFreq, setDanteSubFreq] = useState(0); // Hz
  const [kineticIntensity, setKineticIntensity] = useState(0); // %
  const [acousticBleed, setAcousticBleed] = useState(0); // dB(A)
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Piezoelectric floor array (VIP & Dance Zone) online.' },
    { id: 2, time: '21:30:02', type: 'SYS', msg: 'Dante Network Audio interface connected. Listening to Sub stems.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (engineActive && bassState === 'IDLE') {
      loop = setInterval(() => {
        // Ambient track bass (subtle)
        setDanteSubFreq(Math.max(40, Math.min(60, 50 + (Math.random() * 10 - 5))));
        setKineticIntensity(Math.max(10, Math.random() * 25));
        setAcousticBleed(0); // Silent to the neighborhood
      }, 300);
    } else if (engineActive && bassState === 'BASS_DROP') {
      loop = setInterval(() => {
        // Massive bass drop
        setDanteSubFreq(Math.max(25, Math.min(35, 30 + (Math.random() * 5 - 2.5)))); // Deep Hz
        setKineticIntensity(Math.min(100, 85 + (Math.random() * 15)));
        setAcousticBleed(Math.random() * 0.5); // Still virtually silent externally
      }, 100);
      
      setTimeout(() => {
        setBassState('IDLE');
        addLog('SYS', 'Transient decay complete. Resuming ambient sync.');
      }, 3000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [engineActive, bassState]);

  const triggerBassDrop = () => {
    if (engineActive && bassState === 'IDLE') {
      setBassState('BASS_DROP');
      addLog('ACTION', 'Massive Sub-Bass Transient detected on Dante Channel 12.');
      addLog('WEB3', 'DSP translating 30Hz audio to 100% kinetic vibration.');
    }
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'Audio-to-Kinetic DSP Engine Armed.');
    } else {
      setEngineActive(false);
      setBassState('IDLE');
      setDanteSubFreq(0);
      setKineticIntensity(0);
      setAcousticBleed(0);
      addLog('WARN', 'Haptic Floor offline. Fans relying on airborne acoustics only.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: DSP Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📳</span> Tactile Audio Translation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Floor Sub-Bass <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Synchronization Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Strict municipal noise ordinances force festivals to heavily limit audible sub-bass frequencies, leaving electronic music fans feeling physically disconnected from the impact of the music. Eventra solves this by installing interlocking piezoelectric haptic floor panels across the dance zones. Our DSP engine intercepts the raw sub-bass audio stems directly from the DJ's Dante network and translates the transients into precise kinetic vibrations. Attendees physically feel the massive bass drops rattling through their feet, while generating zero airborne acoustic pollution for the surrounding city.
          </p>

          <div className="bg-[#120a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Audio-to-Kinetic Matrix
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Bypass Haptic Translation' : 'Engage DSP Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Audio Input Freq */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bassState === 'BASS_DROP' ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Dante Sub Input
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bassState === 'BASS_DROP' ? 'text-pink-400' :
                     engineActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {engineActive ? Math.floor(danteSubFreq) : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

               {/* Kinetic Output Intensity */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bassState === 'BASS_DROP' ? 'bg-fuchsia-950/60 border-fuchsia-500/80 shadow-[0_0_20px_rgba(217,70,239,0.3)]' :
                 engineActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Haptic Output
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     bassState === 'BASS_DROP' ? 'text-fuchsia-400' :
                     engineActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {engineActive ? Math.floor(kineticIntensity) : 0}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Acoustic Bleed */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Airborne Bleed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     engineActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {engineActive ? acousticBleed.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050207] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Piezoelectric Translation Log</span>
                 {bassState === 'BASS_DROP' && <span className="text-fuchsia-400 animate-pulse">Kinetic Overdrive!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Tactile Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">KINETIC FLOOR ARRAY</span>
                <span className="text-[8px] font-mono text-slate-400">VIP & DANCE ZONES</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-end pb-8 p-6">
                
                {/* Simulated Floor Panels (Isometric) */}
                <div className="relative w-full h-48 transform perspective-1000 rotateX-60 scale-125 z-10 flex flex-wrap justify-center content-start">
                  
                  {Array.from({ length: 36 }).map((_, i) => {
                    // Randomize vibration slightly per panel for organic feel
                    const isVibrating = engineActive;
                    const vibIntensity = isVibrating ? (bassState === 'BASS_DROP' ? Math.random() * 20 : Math.random() * 2) : 0;
                    
                    return (
                      <div 
                        key={i}
                        className={`w-12 h-12 m-[1px] border transition-colors duration-75 ${
                          !engineActive ? 'bg-slate-900 border-slate-800' :
                          bassState === 'BASS_DROP' ? 'bg-fuchsia-900/60 border-fuchsia-400/80' : 
                          'bg-purple-900/20 border-purple-500/30'
                        }`}
                        style={{
                          transform: isVibrating ? `translateY(-${vibIntensity}px)` : 'none',
                          boxShadow: bassState === 'BASS_DROP' ? '0 0 15px rgba(217,70,239,0.5) inset' : 'none'
                        }}
                      ></div>
                    );
                  })}
                  
                </div>

                {/* Sub-Bass Audio Wave (Background) */}
                <div className="absolute top-1/3 inset-x-0 h-32 flex items-center justify-center opacity-30 z-0 pointer-events-none blur-sm">
                   <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                     <path 
                       d={
                         bassState === 'BASS_DROP' 
                         ? "M 0 50 Q 50 -50, 100 50 T 200 50 T 300 50 T 400 50" 
                         : "M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50"
                       }
                       fill="none" 
                       stroke="#c026d3" 
                       strokeWidth={bassState === 'BASS_DROP' ? "15" : "5"}
                       className={engineActive ? 'animate-dash' : ''}
                       style={{ strokeDasharray: '400', animationDuration: bassState === 'BASS_DROP' ? '0.2s' : '2s' }}
                     />
                   </svg>
                </div>

                {/* Status Overlay */}
                <div className="absolute top-[20%] z-20 flex flex-col items-center">
                   {bassState === 'BASS_DROP' && (
                     <>
                       <span className="text-4xl animate-bounce">🫨</span>
                       <span className="text-[10px] font-black tracking-widest text-fuchsia-300 bg-fuchsia-900/60 px-3 py-1 rounded-full border border-fuchsia-500 mt-2 shadow-[0_0_20px_#d946ef]">
                         TACTILE BASS ACTIVE
                       </span>
                     </>
                   )}
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full">
              <button 
                onClick={triggerBassDrop}
                disabled={!engineActive || bassState !== 'IDLE'}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition shadow-md border ${
                  !engineActive || bassState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-pink-950/40 border-pink-900 text-pink-500 hover:bg-pink-900/60 shadow-[0_10px_30px_rgba(236,72,153,0.2)]'
                }`}
              >
                Simulate DJ Bass Drop
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HapticSubBassSync;
