import React, { useState } from 'react';

const AcousticsOptimizationEngine = () => {
  const [engineState, setEngineState] = useState('idle'); // idle, listening, processing, complete
  const [frequency, setFrequency] = useState(20);
  
  // Parametric EQ State
  const [eqBands, setEqBands] = useState([
    { freq: 60, gain: 0, q: 1.0 },
    { freq: 250, gain: 0, q: 1.0 },
    { freq: 1000, gain: 0, q: 1.0 },
    { freq: 4000, gain: 0, q: 1.0 },
    { freq: 12000, gain: 0, q: 1.0 }
  ]);

  const startAnalysis = () => {
    setEngineState('listening');
    
    // Simulate frequency sweep (20Hz to 20kHz)
    let currentFreq = 20;
    const sweepInterval = setInterval(() => {
      currentFreq *= 1.8;
      if (currentFreq >= 20000) {
        currentFreq = 20000;
        clearInterval(sweepInterval);
        setEngineState('processing');
        
        setTimeout(() => {
          // Generate optimized EQ curve to cut muddy frequencies and boost clarity
          setEqBands([
            { freq: 60, gain: -2.5, q: 1.4 },
            { freq: 250, gain: -6.0, q: 2.8 }, // Cut muddy room resonance
            { freq: 1000, gain: 1.5, q: 1.0 },
            { freq: 4000, gain: 4.0, q: 2.0 }, // Boost vocal clarity
            { freq: 12000, gain: -1.0, q: 1.0 }
          ]);
          setEngineState('complete');
          
          setTimeout(() => setEngineState('idle'), 6000);
        }, 3000);
      }
      setFrequency(Math.floor(currentFreq));
    }, 200);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/50 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎛️</span> AV Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Deep-Learning <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Acoustics Optimizer</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Temporary stages built in massive concrete convention halls suffer from terrible, echoing acoustics. Eventra's deep-learning audio engine analyzes the reverb tails and acoustic reflections of the specific physical room using your smartphone mic. It instantly generates precise parametric EQ filters that the AV team can plug into their mixing board to completely cancel out the room's natural echo.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🌊</span> Neural Audio Processor
               </h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono flex items-center">
                 MIC: ACTIVE (48kHz)
               </span>
             </div>

             {/* Graphic EQ Visualizer */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 relative flex flex-col">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Generated Parametric EQ Curve</span>
               
               <div className="flex-1 relative flex items-end justify-between px-4 pb-8">
                 
                 {/* Center Line (0dB) */}
                 <div className="absolute top-1/2 inset-x-4 h-px bg-neutral-800 border-t border-dashed border-neutral-700"></div>
                 <span className="absolute top-1/2 left-0 transform -translate-y-1/2 text-[8px] font-mono text-neutral-600">0dB</span>

                 {/* Render EQ Bands */}
                 {eqBands.map((band, idx) => {
                   // Map gain (-12 to +12) to height percentage (0 to 100%)
                   const heightPercent = ((band.gain + 12) / 24) * 100;
                   return (
                     <div key={idx} className="flex flex-col items-center z-10 w-1/5 relative h-full justify-end">
                       
                       <div className="absolute w-full h-full flex flex-col justify-end items-center">
                         {/* Slider Track */}
                         <div className="absolute inset-y-0 w-1 bg-neutral-900 rounded-full"></div>
                         
                         {/* EQ Knob */}
                         <div 
                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ease-out absolute ${
                             band.gain === 0 ? 'bg-neutral-800 border-neutral-600' : 
                             band.gain > 0 ? 'bg-emerald-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                             'bg-rose-900 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                           }`}
                           style={{ bottom: \`calc(\${heightPercent}% - 12px)\` }}
                         >
                           <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                         </div>
                       </div>
                       
                       <div className="absolute -bottom-6 text-center">
                         <span className="block text-[10px] text-sky-400 font-bold font-mono">{band.freq >= 1000 ? \`\${band.freq/1000}k\` : band.freq}Hz</span>
                         <span className="block text-[9px] text-neutral-500 font-mono mt-0.5">{band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} dB</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-950 shadow-2xl relative flex flex-col h-[700px] overflow-hidden text-white">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
              
              <div className="p-6 pb-2 border-b border-slate-800">
                <h2 className="text-xl font-black mb-1">Acoustics Optimizer</h2>
                <p className="text-xs text-sky-400 font-mono">Location: Main Hall B</p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {engineState === 'idle' ? (
                  <div className="text-center w-full animate-fade-in">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 mx-auto border border-slate-700 shadow-lg group hover:border-sky-500 transition cursor-pointer" onClick={startAnalysis}>
                      <span className="text-4xl group-hover:scale-110 transition">📡</span>
                    </div>
                    <h3 className="text-xl font-black mb-2">Ready to calibrate.</h3>
                    <p className="text-slate-400 text-sm mb-12">Stand in the center of the room and ensure the PA system is unmuted.</p>
                    
                    <button 
                      onClick={startAnalysis}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl text-lg uppercase tracking-widest transition shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                    >
                      Begin Room Sweep
                    </button>
                  </div>
                ) : engineState === 'listening' ? (
                  <div className="w-full flex flex-col items-center text-center animate-fade-in">
                    {/* Pulsing rings for frequency sweep */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                      <div className="absolute inset-0 rounded-full border-2 border-sky-500 opacity-20 animate-ping" style={{ animationDuration: '1s' }}></div>
                      <div className="absolute inset-4 rounded-full border-2 border-sky-400 opacity-40 animate-ping" style={{ animationDuration: '1.2s' }}></div>
                      <div className="absolute inset-8 rounded-full border-2 border-sky-300 opacity-60 animate-ping" style={{ animationDuration: '1.4s' }}></div>
                      <div className="w-20 h-20 bg-sky-900/50 rounded-full border border-sky-400 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="text-2xl font-black font-mono text-white">{frequency}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black mb-2 text-sky-400">Emitting Sweep</h3>
                    <p className="text-slate-400 text-sm font-mono">Listening for room reflections...</p>
                    
                    <div className="w-full bg-slate-900 h-2 rounded-full mt-8 overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-200" style={{ width: \`\${(frequency / 20000) * 100}%\` }}></div>
                    </div>
                  </div>
                ) : engineState === 'processing' ? (
                  <div className="w-full flex flex-col items-center text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-black mb-2 text-indigo-400">Neural Net Processing</h3>
                    <p className="text-slate-400 text-sm font-mono">Calculating inverse reverb filter...</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col animate-fade-in">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <span className="text-2xl text-emerald-400">✓</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">Calibration Successful</h3>
                    </div>
                    
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-auto">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3 border-b border-slate-800 pb-2">Export Filters To Board</span>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                         <button className="bg-slate-800 py-2 rounded text-xs font-bold hover:bg-sky-900 hover:text-sky-400 transition">Yamaha CL5</button>
                         <button className="bg-slate-800 py-2 rounded text-xs font-bold hover:bg-sky-900 hover:text-sky-400 transition">Behringer X32</button>
                         <button className="bg-slate-800 py-2 rounded text-xs font-bold hover:bg-sky-900 hover:text-sky-400 transition">DiGiCo SD</button>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AcousticsOptimizationEngine;
