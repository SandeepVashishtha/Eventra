/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticAcousticFloor = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [activeStem, setActiveStem] = useState('IDLE'); // IDLE, KICK_DRUM, BASSLINE, SYNTH_LEAD
  
  // DSP & Haptic Metrics
  const [transducerFreq, setTransducerFreq] = useState(0); // Hz
  const [hapticAmplitude, setHapticAmplitude] = useState(0); // %
  const [dspLatency, setDspLatency] = useState(4.2); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'ADA Haptic Viewing Platform Online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Digital Signal Processing (DSP) engine awaiting audio feed.' }
  ]);

  // Visualizer State
  const [floorVibration, setFloorVibration] = useState(0);
  const [vestVibration, setVestVibration] = useState(0);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setDspLatency(4.0 + (Math.random() * 0.4)); // Ultra-low latency fluctuation
          
          if (activeStem === 'IDLE') {
              setTransducerFreq(0);
              setHapticAmplitude(0);
              setFloorVibration(0);
              setVestVibration(0);
          } else if (activeStem === 'KICK_DRUM') {
              // Low frequency, high impact, mostly floor
              const beat = Math.random() > 0.5;
              setTransducerFreq(beat ? 45 : 0);
              setHapticAmplitude(beat ? 95 : 0);
              setFloorVibration(beat ? 10 : 0);
              setVestVibration(beat ? 2 : 0);
          } else if (activeStem === 'BASSLINE') {
              // Sustained low-mid frequency, floor + lower vest
              const sustain = 60 + (Math.random() * 20);
              setTransducerFreq(sustain);
              setHapticAmplitude(75 + (Math.random() * 10));
              setFloorVibration(4 + (Math.random() * 2));
              setVestVibration(6 + (Math.random() * 2));
          } else if (activeStem === 'SYNTH_LEAD') {
              // High frequency, low impact, mostly vest (chest)
              const melody = 400 + (Math.random() * 200);
              setTransducerFreq(melody);
              setHapticAmplitude(40 + (Math.random() * 20));
              setFloorVibration(1);
              setVestVibration(8 + (Math.random() * 4));
          }

      }, 150); // Fast polling for audio rhythm simulation
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, activeStem]);

  const triggerStem = (type) => {
    if (!systemActive) return;
    
    setActiveStem(type);
    
    if (type === 'KICK_DRUM') {
        addLog('ACTION', 'DSP isolating Sub-Bass transient (Kick Drum).');
        addLog('SUCCESS', 'Routing 45Hz impulse to primary floor transducers.');
    } else if (type === 'BASSLINE') {
        addLog('ACTION', 'DSP isolating continuous Low-Mid waveform (808 Bass).');
        addLog('SUCCESS', 'Routing sustained oscillation to floor and lower vest actuators.');
    } else if (type === 'SYNTH_LEAD') {
        addLog('ACTION', 'DSP isolating High-Mid melody stem (Synth).');
        addLog('SUCCESS', 'Routing high-frequency micro-vibrations to upper chest vest actuators.');
    } else if (type === 'IDLE') {
        addLog('WARN', 'Track ended. Floor returning to neutral state.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveStem('IDLE');
      addLog('SYS', 'Real-time Audio DSP and Haptic Transducers Armed.');
    } else {
      setSystemActive(false);
      setActiveStem('IDLE');
      setTransducerFreq(0);
      setHapticAmplitude(0);
      setFloorVibration(0);
      setVestVibration(0);
      addLog('WARN', 'Haptic Platform Offline. Audio feed severed.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020610] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦻</span> ADA Accessibility Tech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Feedback <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Acoustic Floors</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Live music festivals are historically inaccessible to deaf and hard-of-hearing attendees, who cannot fully experience the intricacies of the audio performance. Eventra solves this by designing a specialized ADA viewing platform equipped with localized directional haptic transducers. Eventra runs a real-time Digital Signal Processing (DSP) algorithm that isolates specific musical stems from the live audio feed and routes them as distinct vibratory frequencies directly to the floor and specialized haptic vests, allowing attendees to physically "feel" the music in high definition.
          </p>

          <div className="bg-[#050b1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Real-Time DSP Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt DSP Engine' : 'Initialize ADA Platform'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Transducer Freq */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeStem !== 'IDLE' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Output Frequency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     activeStem === 'SYNTH_LEAD' ? 'text-pink-400' : 
                     activeStem === 'BASSLINE' ? 'text-indigo-400' :
                     activeStem === 'KICK_DRUM' ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(transducerFreq)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

               {/* Amplitude */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 hapticAmplitude > 0 ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Haptic Amplitude
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     hapticAmplitude > 80 ? 'text-red-400' : 
                     hapticAmplitude > 40 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(hapticAmplitude)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* DSP Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Processing Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? dspLatency.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Audio Isolation Ledger</span>
                 {activeStem === 'KICK_DRUM' && <span className="text-red-400 font-black animate-pulse">45Hz KICK ROUTED TO FLOOR</span>}
                 {activeStem === 'BASSLINE' && <span className="text-indigo-400 font-black animate-pulse">80Hz BASS ROUTED TO CORE</span>}
                 {activeStem === 'SYNTH_LEAD' && <span className="text-pink-400 font-black animate-pulse">400Hz MELODY ROUTED TO CHEST</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
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
            
            {/* Haptic Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#050b1a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">ADA VIEWING PLATFORM</span>
                <span className="text-[8px] font-mono text-slate-400">HAPTIC MAPPING</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-8 items-center justify-end">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">TRANSDUCERS UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col items-center justify-end">
                      
                      {/* Audio Waveform Background */}
                      <div className="absolute inset-x-0 top-1/4 h-32 flex items-center justify-center opacity-20 pointer-events-none px-4">
                          {Array.from({length: 40}).map((_, i) => (
                              <div 
                                  key={i} 
                                  className="w-1 mx-0.5 bg-white rounded-full transition-all duration-75"
                                  style={{
                                      height: `${Math.max(10, Math.random() * (activeStem !== 'IDLE' ? hapticAmplitude : 10))}%`
                                  }}
                              ></div>
                          ))}
                      </div>

                      {/* Attendee wearing Haptic Vest */}
                      <div className="relative z-30 mb-2 flex flex-col items-center" style={{ transform: `translate(${Math.random() * vestVibration - vestVibration/2}px, ${Math.random() * vestVibration - vestVibration/2}px)` }}>
                          
                          {/* Head (Headphones) */}
                          <div className="w-12 h-12 bg-slate-800 border-2 border-slate-700 rounded-full relative mb-1 shadow-lg">
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-700 rounded-l-full border border-slate-600"></div>
                              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-700 rounded-r-full border border-slate-600"></div>
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 border-t-4 border-slate-700 rounded-t-full"></div>
                          </div>

                          {/* Upper Body (Haptic Vest) */}
                          <div className="w-20 h-24 bg-slate-900 border-2 border-blue-900 rounded-xl relative shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
                              
                              {/* Vest Design Details */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                              
                              {/* Vest Actuators (Upper Chest - Melodies) */}
                              <div className="absolute top-4 inset-x-2 flex justify-between px-2">
                                  <div className={`w-4 h-4 rounded-full border border-slate-600 transition-colors duration-75 ${
                                      activeStem === 'SYNTH_LEAD' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'bg-black'
                                  }`}></div>
                                  <div className={`w-4 h-4 rounded-full border border-slate-600 transition-colors duration-75 ${
                                      activeStem === 'SYNTH_LEAD' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'bg-black'
                                  }`}></div>
                              </div>

                              {/* Vest Actuators (Core/Ribs - Bassline) */}
                              <div className="absolute bottom-6 inset-x-2 flex justify-between px-1">
                                  <div className={`w-3 h-8 rounded-full border border-slate-600 transition-colors duration-75 ${
                                      activeStem === 'BASSLINE' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-black'
                                  }`}></div>
                                  <div className={`w-3 h-8 rounded-full border border-slate-600 transition-colors duration-75 ${
                                      activeStem === 'BASSLINE' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-black'
                                  }`}></div>
                              </div>

                              {/* Center Glowing Hub */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-blue-500/50 bg-black rounded-full flex items-center justify-center">
                                  <div className={`w-3 h-3 rounded-full ${activeStem !== 'IDLE' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
                              </div>
                          </div>

                          {/* Legs */}
                          <div className="flex gap-4 -mt-2 z-[-1]">
                              <div className="w-5 h-16 bg-slate-800 rounded-b border-x border-b border-slate-700"></div>
                              <div className="w-5 h-16 bg-slate-800 rounded-b border-x border-b border-slate-700"></div>
                          </div>
                      </div>

                      {/* Acoustic Haptic Floor */}
                      <div 
                          className="w-[90%] h-12 bg-slate-900 border-2 border-slate-700 rounded-t-xl relative overflow-hidden flex flex-col justify-center items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20"
                          style={{ transform: `translate(${Math.random() * floorVibration - floorVibration/2}px, ${Math.random() * floorVibration - floorVibration/2}px)` }}
                      >
                          {/* Sub-floor Transducers */}
                          <div className="absolute inset-0 flex justify-around items-center px-4 opacity-50">
                              {[1,2,3,4].map(i => (
                                  <div key={i} className={`w-8 h-8 rounded-full border-4 border-slate-800 flex items-center justify-center transition-all duration-75 ${
                                      activeStem === 'KICK_DRUM' ? 'border-red-500 bg-red-900/50 shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-110' :
                                      activeStem === 'BASSLINE' ? 'border-indigo-500 bg-indigo-900/50 scale-105' : 'bg-black'
                                  }`}>
                                      <div className={`w-2 h-2 rounded-full ${activeStem === 'KICK_DRUM' ? 'bg-white' : 'bg-slate-700'}`}></div>
                                  </div>
                              ))}
                          </div>
                          <span className="relative z-10 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-black/50 px-2 rounded">ADA Platform Actuators</span>
                      </div>

                      {/* Visual representations of sound waves hitting the body */}
                      {activeStem === 'KICK_DRUM' && (
                          <div className="absolute bottom-16 w-full flex justify-center pointer-events-none">
                              <div className="w-48 h-24 border-t-8 border-red-500 rounded-full animate-ping opacity-0"></div>
                          </div>
                      )}
                      
                  </div>
                )}
                
              </div>
            </div>

            {/* Audio Stem Simulation Controls */}
            <div className="w-full bg-[#050b1a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Audio Stems</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerStem('KICK_DRUM')}
                   disabled={!systemActive || activeStem === 'KICK_DRUM'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || activeStem === 'KICK_DRUM' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   Sub-Bass Kick Drum
                 </button>

                 <button 
                   onClick={() => triggerStem('BASSLINE')}
                   disabled={!systemActive || activeStem === 'BASSLINE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || activeStem === 'BASSLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                   }`}
                 >
                   Sustained 808 Bass
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerStem('SYNTH_LEAD')}
                   disabled={!systemActive || activeStem === 'SYNTH_LEAD'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || activeStem === 'SYNTH_LEAD' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                   }`}
                 >
                   High-Freq Synth Melody
                 </button>
                 
                 <button 
                   onClick={() => triggerStem('IDLE')}
                   disabled={!systemActive || activeStem === 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || activeStem === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Stop Playback
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HapticAcousticFloor;
