/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const AudioMixNormalization = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeStage, setActiveStage] = useState('ACOUSTIC'); // ACOUSTIC, EDM
  const [dbLevel, setDbLevel] = useState(-18);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'HLS Video Stream active. AudioContext initialized.' }
  ]);

  // Audio level simulation loop
  useEffect(() => {
      let interval;
      if (!isTransitioning) {
          interval = setInterval(() => {
              let targetDb;
              let variance = (Math.random() * 4) - 2; // -2 to +2 dB jitter
              
              if (activeStage === 'ACOUSTIC') {
                  targetDb = -20 + variance;
                  if (isCompressing) targetDb = -14 + variance; // Gain makeup applied
              } else { // EDM
                  targetDb = +4 + variance; // Very loud, clipping
                  if (isCompressing) targetDb = -10 + (variance * 0.5); // Hard limited
              }
              
              setDbLevel(prev => {
                  // Smooth transition
                  return prev + (targetDb - prev) * 0.3;
              });
          }, 100);
      }
      return () => clearInterval(interval);
  }, [activeStage, isCompressing, isTransitioning]);

  const switchStage = (stage) => {
      if (activeStage === stage || isTransitioning) return;
      
      setIsTransitioning(true);
      setActiveStage(stage);
      
      addLog('ACTION', `User switched stream to: ${stage === 'ACOUSTIC' ? 'Acoustic Tent' : 'EDM Main Stage'}`);
      
      // Simulate the sudden spike during transition
      if (stage === 'EDM') {
          if (!isCompressing) {
              setDbLevel(12); // Instant painful spike
              addLog('CRIT', 'Uncompressed Audio: Extreme volume spike (+12dB) detected. Clipping occurs.');
          } else {
              setDbLevel(-8); // Instantly caught by compressor
              addLog('SUCCESS', 'Web Audio Compressor: Attack time 5ms. Instantly suppressed volume spike.');
          }
      } else {
           if (!isCompressing) {
              setDbLevel(-30);
              addLog('WARN', 'Uncompressed Audio: Volume drop (-30dB). Barely audible.');
          } else {
              setDbLevel(-16);
              addLog('SYS', 'Web Audio Compressor: Release time 50ms. Applying makeup gain to acoustic feed.');
          }
      }

      setTimeout(() => {
          setIsTransitioning(false);
      }, 500);
  };

  const toggleCompression = () => {
      const newState = !isCompressing;
      setIsCompressing(newState);
      if (newState) {
          addLog('SUCCESS', 'EBU R128 Loudness Normalization enabled. Dynamic Range Compressor active.');
      } else {
          addLog('WARN', 'Normalization bypassed. Raw audio passthrough active.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Convert dB to percentage for the meter (assuming range -40 to +10)
  const getMeterPercentage = (db) => {
      const min = -40;
      const max = 10;
      let p = ((db - min) / (max - min)) * 100;
      return Math.max(0, Math.min(100, p));
  };

  const meterValue = getMeterPercentage(dbLevel);

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Signal Processing & Web Audio API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Audio Mix <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Normalization Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When users watch the festival livestream on the app, transitioning between a quiet acoustic stage and the main EDM stage causes extreme volume spikes, hurting users' ears and degrading the mobile experience. Eventra solves this by implementing a Web Audio API processing pipeline directly in the frontend. It applies a real-time dynamic range compressor and loudness normalization algorithm (EBU R128) to the incoming HLS video stream audio track, creating a perfectly balanced listening experience across all stages.
          </p>

          <div className="bg-[#120703] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> Web Audio Node Graph
               </h3>
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Compressor Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Dynamic Range Compressor (EBU R128)</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isCompressing ? 'Threshold: -14dB | Ratio: 4:1 | Attack: 5ms' : 'Bypassed (Raw HLS Audio Passthrough)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleCompression}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isCompressing ? 'bg-amber-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isCompressing ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <button 
                         onClick={() => switchStage('ACOUSTIC')}
                         className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                             activeStage === 'ACOUSTIC' ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'
                         }`}
                     >
                         <span className="text-3xl mb-2">🎸</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${activeStage === 'ACOUSTIC' ? 'text-cyan-400' : 'text-slate-400'}`}>Acoustic Tent</span>
                     </button>

                     <button 
                         onClick={() => switchStage('EDM')}
                         className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                             activeStage === 'EDM' ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'
                         }`}
                     >
                         <span className="text-3xl mb-2">🎛️</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${activeStage === 'EDM' ? 'text-rose-400' : 'text-slate-400'}`}>EDM Main Stage</span>
                     </button>
                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>AudioContext Logs</span>
                 {isCompressing && <span className="text-amber-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-30"></div>
              
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-10 px-0">
                  
                  {/* Video Player Mockup */}
                  <div className="w-full aspect-video bg-slate-800 relative overflow-hidden group">
                      
                      {/* Video Content */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${activeStage === 'ACOUSTIC' ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-full h-full bg-cyan-900/40 flex items-center justify-center">
                              <span className="text-6xl blur-[1px]">🎸</span>
                          </div>
                      </div>
                      
                      <div className={`absolute inset-0 transition-opacity duration-500 ${activeStage === 'EDM' ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-full h-full bg-rose-900/60 flex items-center justify-center relative">
                              <span className="text-6xl font-black">DJ</span>
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                      </div>

                      {/* Video HUD */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                          <div className="flex items-center text-white text-[10px] font-bold">
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2"></div>
                              LIVE
                          </div>
                      </div>
                  </div>

                  {/* Audio Meter Visualizer */}
                  <div className="p-5 flex-1 flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">Master Output LUFS (Device Speaker)</span>
                      
                      <div className="flex-1 flex items-center justify-center relative px-8">
                          
                          {/* Meter Scale Label */}
                          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] font-mono text-slate-500 py-2">
                              <span>+10</span>
                              <span className="text-rose-400">0</span>
                              <span>-10</span>
                              <span>-20</span>
                              <span>-30</span>
                              <span>-40</span>
                          </div>

                          {/* The Meter Bar Container */}
                          <div className="w-16 h-full bg-slate-900 border border-slate-800 rounded-full relative overflow-hidden">
                              
                              {/* Warning Zones Background */}
                              <div className="absolute top-0 w-full h-[20%] bg-rose-950/30"></div> {/* +10 to 0 (Clipping) */}
                              <div className="absolute top-[20%] w-full h-[20%] bg-amber-950/30"></div> {/* 0 to -10 (Loud) */}
                              
                              {/* The Fill */}
                              <div 
                                  className={`absolute bottom-0 w-full transition-all duration-100 rounded-full ${
                                      dbLevel > 0 ? 'bg-gradient-to-t from-emerald-500 via-amber-500 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' :
                                      dbLevel > -10 ? 'bg-gradient-to-t from-emerald-500 to-amber-500' :
                                      'bg-emerald-500'
                                  }`}
                                  style={{ height: `${meterValue}%` }}
                              ></div>
                          </div>

                      </div>

                      {/* Compression Indicator Overlay */}
                      {isCompressing && (
                          <div className="mt-6 bg-amber-950/30 border border-amber-500/50 rounded-xl p-3 flex items-center text-amber-400 text-[9px] font-bold">
                              <span className="text-xl mr-2">🛡️</span>
                              <div>
                                  <span className="block uppercase tracking-widest text-white mb-0.5">EBU R128 Active</span>
                                  Protecting hearing & normalizing loudness.
                              </div>
                          </div>
                      )}
                      
                      {!isCompressing && dbLevel > 0 && (
                          <div className="mt-6 bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-center text-rose-400 text-[9px] font-bold animate-pulse">
                              <span className="text-xl mr-2">⚠️</span>
                              <div>
                                  <span className="block uppercase tracking-widest text-white mb-0.5">Audio Clipping</span>
                                  Extreme volume detected. Turn down device.
                              </div>
                          </div>
                      )}
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120703] p-4 rounded-xl border border-amber-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-amber-400 uppercase block mb-1">Signal Processing:</span>
               Ensure the Compressor is <span className="text-white font-bold">Bypassed</span>. Switch from Acoustic to EDM. Notice the Master Output meter spike violently into the red (clipping), simulating a painful volume jump for the user. <br/><br/>Now, toggle the <span className="text-white font-bold bg-amber-600 px-1 rounded">Compressor</span> on and switch stages again. The Web Audio API intercepts the signal, instantly suppressing the EDM spike (5ms attack) and applying makeup gain to the quiet Acoustic feed, ensuring a perfectly normalized listening experience.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AudioMixNormalization;
