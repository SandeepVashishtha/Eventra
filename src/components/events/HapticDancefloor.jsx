/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticDancefloor = () => {
  const [floorActive, setFloorActive] = useState(false);
  const [audioSource, setAudioSource] = useState('IDLE'); // IDLE, TECHNO, DUBSTEP, AMBIENT
  
  // Hardware Metrics
  const [activeActuators, setActiveActuators] = useState(0);
  const [hapticLatency, setHapticLatency] = useState(0); // ms
  const [peakVibration, setPeakVibration] = useState(0); // G-force
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '17:00:00', type: 'SYS', msg: 'Acoustic Metamaterial floor initialized.' },
    { id: 2, time: '17:00:02', type: 'SYS', msg: 'Awaiting sub-bass frequency feed.' }
  ]);

  // Audio/Haptic visual state
  const [waveform, setWaveform] = useState(Array(20).fill(0));
  const [floorRipples, setFloorRipples] = useState([]);

  useEffect(() => {
    let loop;
    
    if (floorActive) {
      loop = setInterval(() => {
          
          let intensityBase = 0;
          let variance = 0;
          
          if (audioSource === 'TECHNO') {
              // Steady, driving 4/4 beat
              const isKick = (Date.now() % 500) < 100; // 120BPM kick drum
              intensityBase = isKick ? 90 : 20;
              variance = 10;
              setPeakVibration(1.2);
          } else if (audioSource === 'DUBSTEP') {
              // Heavy, erratic sub-bass
              intensityBase = 60 + Math.sin(Date.now() / 200) * 40;
              variance = 20;
              setPeakVibration(2.5);
          } else if (audioSource === 'AMBIENT') {
              // Low, smooth rumble
              intensityBase = 30 + Math.sin(Date.now() / 1000) * 10;
              variance = 5;
              setPeakVibration(0.4);
          }

          if (audioSource !== 'IDLE') {
              // Update waveform
              setWaveform(prev => {
                  const next = [...prev.slice(1), Math.max(0, intensityBase + (Math.random() * variance - variance/2))];
                  return next;
              });

              // Add floor ripple effect on high intensity
              if (intensityBase > 80 && Math.random() > 0.5) {
                  setFloorRipples(prev => [...prev, { id: Date.now(), size: 0, opacity: 1 }]);
              }

              setHapticLatency(Math.random() * 2 + 1); // 1-3ms
          } else {
              setWaveform(Array(20).fill(0));
              setPeakVibration(0);
              setHapticLatency(0);
          }

          // Animate ripples
          setFloorRipples(prev => prev.map(r => ({ ...r, size: r.size + 10, opacity: r.opacity - 0.1 })).filter(r => r.opacity > 0));

      }, 50); // Fast update for audio reactivity
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [floorActive, audioSource]);

  const triggerAudio = (type, logMsg) => {
    if (!floorActive) return;
    setAudioSource(type);
    addLog('ACTION', logMsg);
    
    if (type === 'DUBSTEP') {
        addLog('WARN', 'Extreme low-frequency oscillation detected. Actuators at 90% load.');
    } else if (type === 'TECHNO') {
        addLog('SYS', '120BPM transient peaks detected. Locking haptic timing.');
    }
  };

  const toggleFloor = () => {
    if (!floorActive) {
      setFloorActive(true);
      setActiveActuators(1024);
      addLog('SYS', '1,024 Metamaterial Actuators online. DSP active.');
    } else {
      setFloorActive(false);
      setActiveActuators(0);
      setAudioSource('IDLE');
      setWaveform(Array(20).fill(0));
      setFloorRipples([]);
      addLog('WARN', 'Haptic dancefloor offline. Returning to rigid state.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📳</span> Tactile Accessibility
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Feedback <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Dancefloor Metamaterials</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Deaf and hard-of-hearing attendees cannot experience the full impact of the music, and even hearing attendees lose the visceral physical feeling of the bass if they are too far from the subwoofers. Eventra solves this by designing a VIP dancefloor using programmable acoustic metamaterials. This DSP engine translates sub-bass frequencies into low-latency haptic actuation commands. The floor physically vibrates in perfect synchronization with the kick drum, allowing attendees to literally feel the music's texture and rhythm through their feet.
          </p>

          <div className="bg-[#0b0612] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Haptic DSP Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFloor}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     floorActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {floorActive ? 'Lock Actuators (Rigid)' : 'Engage Metamaterials'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Actuators */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 floorActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Floor Actuators
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     floorActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeActuators.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Peak Vibration */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 peakVibration > 2 ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 floorActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Peak Actuation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     peakVibration > 2 ? 'text-pink-400 animate-pulse' :
                     floorActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {peakVibration.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">G</span>
                 </div>
               </div>
               
               {/* DSP Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 floorActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Audio-to-Haptic Sync
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     floorActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {hapticLatency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Digital Signal Processing Log</span>
                 {audioSource !== 'IDLE' && <span className="text-purple-400 animate-pulse">TRANSLATING FREQUENCIES...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-pink-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Haptic Floor Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!floorActive ? 'bg-slate-900' : 'bg-[#0a0514]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">METAMATERIAL FLOOR</span>
                <span className="text-[8px] font-mono text-slate-400">TACTILE VISUALIZER</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
                
                {/* Audio Waveform Input */}
                <div className="h-24 border-b border-purple-900/50 bg-black/50 p-2 flex items-end space-x-1 z-20">
                    <span className="absolute top-2 left-2 text-[7px] font-mono text-slate-500">SUB-BASS INPUT (0-120Hz)</span>
                    {waveform.map((val, i) => (
                        <div 
                            key={i} 
                            className="flex-1 bg-purple-500 transition-all duration-75"
                            style={{ 
                                height: `${Math.max(2, val)}%`,
                                backgroundColor: val > 80 ? '#ec4899' : val > 50 ? '#a855f7' : '#6b21a8',
                                boxShadow: val > 80 ? '0 0 10px #ec4899' : 'none'
                            }}
                        ></div>
                    ))}
                </div>

                {/* Floor Surface Simulation */}
                <div className="flex-1 relative perspective-[1000px] flex items-center justify-center p-8">
                    
                    {!floorActive ? (
                       <div className="w-full h-full border-2 border-slate-700 transform rotateX-45 flex items-center justify-center">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">FLOOR LOCKED (RIGID)</span>
                       </div>
                    ) : (
                      <div 
                          className="w-full h-full relative transform rotateX-45 border border-purple-900/50 rounded transition-transform duration-75"
                          style={{
                              transform: `rotateX(45deg) translateZ(${waveform[19] / 5}px)`,
                              boxShadow: `0 ${waveform[19] / 2}px ${waveform[19]}px rgba(168, 85, 247, 0.2)`
                          }}
                      >
                          {/* Grid lines */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4c1d95_1px,transparent_1px),linear-gradient(to_bottom,#4c1d95_1px,transparent_1px)] bg-[size:10%_10%] opacity-30"></div>
                          
                          {/* Ripples */}
                          {floorRipples.map(ripple => (
                              <div 
                                  key={ripple.id}
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-pink-500 rounded-full"
                                  style={{
                                      width: `${ripple.size}%`,
                                      height: `${ripple.size}%`,
                                      opacity: ripple.opacity,
                                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)'
                                  }}
                              ></div>
                          ))}

                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              {waveform[19] > 80 && (
                                  <span className="text-[10px] font-black text-pink-400 animate-pulse tracking-widest bg-black/80 px-2 rounded">BASS IMPACT</span>
                              )}
                          </div>
                      </div>
                    )}
                </div>
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0612] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Audio Frequencies</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerAudio('TECHNO', 'FOH Feed: 120BPM 4/4 Techno Kick.')}
                   disabled={!floorActive || audioSource === 'TECHNO'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !floorActive || audioSource === 'TECHNO' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                   }`}
                 >
                   Inject Techno Kick (Steady 120BPM)
                 </button>
                 
                 <button 
                   onClick={() => triggerAudio('DUBSTEP', 'FOH Feed: Erratic Sub-Bass Oscillation.')}
                   disabled={!floorActive || audioSource === 'DUBSTEP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !floorActive || audioSource === 'DUBSTEP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                   }`}
                 >
                   Inject Dubstep (Erratic Heavy Sub)
                 </button>

                 <button 
                   onClick={() => triggerAudio('AMBIENT', 'FOH Feed: Low Ambient Rumble.')}
                   disabled={!floorActive || audioSource === 'AMBIENT'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !floorActive || audioSource === 'AMBIENT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:bg-indigo-900/60'
                   }`}
                 >
                   Inject Ambient (Smooth Low Rumble)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HapticDancefloor;
