/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EEGChilloutDome = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [domeState, setDomeState] = useState('STANDBY'); // STANDBY, CALIBRATING, ACTIVE, OVERLOAD
  
  // Biometric Metrics
  const [activeHeadsets, setActiveHeadsets] = useState(0);
  const [avgHeartRate, setAvgHeartRate] = useState(0); // BPM
  const [thetaWaveDominance, setThetaWaveDominance] = useState(0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Geodesic Dome #3 Neuro-Feedback Engine Online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting EEG headset connections.' }
  ]);

  // Visualizer State
  const [brainwaves, setBrainwaves] = useState(Array(40).fill(0));
  const [audioFreq, setAudioFreq] = useState(432); // Hz

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (domeState === 'ACTIVE') {
              // Gradually lower heart rate and increase Theta waves
              setAvgHeartRate(prev => Math.max(62, prev - (Math.random() * 0.5)));
              setThetaWaveDominance(prev => Math.min(85, prev + (Math.random() * 1)));
              
              // Procedural audio freq adjustment (binaural beats)
              setAudioFreq(prev => prev - (prev > 174 ? 1 : 0)); 
              
              // Smooth, rolling brainwaves (Theta)
              setBrainwaves(prev => {
                  const val = Math.sin(Date.now() / 800) * 40 + Math.random() * 10;
                  return [...prev.slice(1), val];
              });

          } else if (domeState === 'OVERLOAD') {
              // High heart rate, low Theta (high Beta/Gamma anxiety state)
              setAvgHeartRate(prev => Math.min(135, prev + (Math.random() * 2)));
              setThetaWaveDominance(prev => Math.max(12, prev - (Math.random() * 2)));
              setAudioFreq(852);
              
              // Jagged, erratic brainwaves (Anxiety)
              setBrainwaves(prev => {
                  const val = (Math.random() - 0.5) * 100;
                  return [...prev.slice(1), val];
              });
          } else if (domeState === 'STANDBY') {
              setBrainwaves(Array(40).fill(0));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, domeState]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    if (type === 'OVERLOAD') {
        setDomeState('OVERLOAD');
        setActiveHeadsets(45);
        addLog('WARN', 'Sensory overload detected in incoming crowd. Beta wave spike.');
        addLog('ACTION', 'Initiating emergency procedural calming protocol.');
        
        // Auto-recover back to active calming
        setTimeout(() => {
            if (systemActive) {
                setDomeState('ACTIVE');
                addLog('SYS', 'Binaural frequencies deployed. Inducing Theta state...');
            }
        }, 3000);
    } else if (type === 'CALIBRATE') {
        setDomeState('CALIBRATING');
        setActiveHeadsets(12);
        setAvgHeartRate(110);
        setThetaWaveDominance(25);
        addLog('ACTION', 'Calibrating EEG headsets. Establishing baseline neural activity.');
        
        setTimeout(() => {
            setDomeState('ACTIVE');
            addLog('SUCCESS', 'Calibration complete. Procedural audio and LED therapy engaged.');
        }, 2000);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setDomeState('STANDBY');
      setActiveHeadsets(0);
      setAvgHeartRate(0);
      setThetaWaveDominance(0);
      addLog('SYS', 'EEG API Connected. Audio/Visual synthesis engine primed.');
    } else {
      setSystemActive(false);
      setDomeState('STANDBY');
      setActiveHeadsets(0);
      addLog('WARN', 'Dome Offline. Reverting to standard ambient lighting.');
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
          <div className="inline-block bg-violet-900/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Cognitive Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Neuro-Feedback EEG <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Chillout Domes</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees often experience sensory overload at massive music festivals, leading to anxiety and panic attacks. Standard "chillout" zones are often just loud tents with beanbags. Eventra solves this by deploying geodesic domes equipped with non-invasive EEG headsets. The platform analyzes the aggregate brainwave data in real-time to procedurally generate ambient, binaural soundscapes and soft LED visuals that actively lower the collective heart rate and induce calmness.
          </p>

          <div className="bg-[#0b0812] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🎛️</span> Biofeedback Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Neuro-Link' : 'Initialize Dome AI'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Headsets */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && activeHeadsets > 0 ? 'bg-violet-950/20 border-violet-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active EEGs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive && activeHeadsets > 0 ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeHeadsets}
                   </span>
                 </div>
               </div>

               {/* Heart Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 domeState === 'OVERLOAD' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 domeState === 'ACTIVE' ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Avg Heart Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     domeState === 'OVERLOAD' ? 'text-red-400' :
                     domeState === 'ACTIVE' ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(avgHeartRate)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BPM</span>
                 </div>
               </div>
               
               {/* Theta Waves */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 thetaWaveDominance > 60 ? 'bg-emerald-950/30 border-emerald-500/50 shadow-inner' :
                 domeState === 'OVERLOAD' ? 'bg-orange-950/40 border-orange-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Theta Dominance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     thetaWaveDominance > 60 ? 'text-emerald-400' :
                     domeState === 'OVERLOAD' ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {thetaWaveDominance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Neural Telemetry Log</span>
                 {domeState === 'CALIBRATING' && <span className="text-violet-400 animate-pulse">SYNCING...</span>}
                 {domeState === 'OVERLOAD' && <span className="text-red-500 animate-pulse">SENSORY OVERLOAD DETECTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' :
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
            
            {/* Dome Simulator */}
            <div className={`w-full rounded-[2rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-700 ${
                !systemActive ? 'bg-slate-900' : 
                domeState === 'OVERLOAD' ? 'bg-[#1a0505]' : 
                domeState === 'ACTIVE' && thetaWaveDominance > 70 ? 'bg-[#021008]' : 'bg-[#0a0514]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/40 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-400">DOME #3 INTERIOR</span>
                <span className="text-[8px] font-mono text-slate-400">PROCEDURAL FX</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6">
                
                {!systemActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative">DOME POWERED DOWN</span>
                ) : (
                  <div className="w-full h-full flex flex-col items-center relative z-20">
                      
                      {/* Generative Visuals (Mandala/Orb) */}
                      <div className="relative w-48 h-48 mt-4 flex items-center justify-center">
                          {domeState === 'ACTIVE' && (
                              <>
                                  <div className="absolute w-full h-full rounded-full bg-emerald-500/10 blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
                                  <div className="absolute w-32 h-32 rounded-full border border-teal-500/30 animate-[spin_10s_linear_infinite]"></div>
                                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/50 animate-[spin_7s_linear_infinite_reverse]"></div>
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-[pulse_3s_ease-in-out_infinite]"></div>
                              </>
                          )}

                          {domeState === 'OVERLOAD' && (
                              <>
                                  <div className="absolute w-full h-full rounded-full bg-red-500/20 blur-xl animate-pulse"></div>
                                  <div className="absolute w-40 h-40 rounded-sm border-2 border-red-500/50 transform rotate-45 animate-[ping_1s_ease-out_infinite]"></div>
                                  <div className="w-16 h-16 rounded-sm transform rotate-45 bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.8)] flex items-center justify-center">
                                      <span className="text-xl animate-bounce">⚠️</span>
                                  </div>
                              </>
                          )}

                          {domeState === 'CALIBRATING' && (
                              <div className="flex flex-col items-center">
                                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                  <span className="text-[8px] font-black uppercase text-violet-400 tracking-widest">Scanning Cortex...</span>
                              </div>
                          )}
                      </div>

                      {/* Live EEG Waveform */}
                      <div className="w-full h-20 mt-auto relative border border-slate-800 bg-black/50 rounded-lg overflow-hidden flex items-end px-2 pb-2">
                          <span className="absolute top-1 left-2 text-[7px] font-mono text-slate-500">AGGREGATE EEG (µV)</span>
                          
                          <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="z-10">
                              <polyline 
                                  points={brainwaves.map((val, i) => `${i * 10},${50 - val}`).join(' ')}
                                  fill="none" 
                                  stroke={domeState === 'OVERLOAD' ? '#ef4444' : domeState === 'ACTIVE' ? '#10b981' : '#6366f1'} 
                                  strokeWidth="2" 
                                  className="transition-all duration-300"
                              />
                          </svg>
                          
                          {/* Grid lines */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                      </div>

                      {/* Audio Output HUD */}
                      <div className="w-full mt-2 flex justify-between bg-black/50 border border-slate-800 p-2 rounded-lg">
                          <div className="flex flex-col">
                              <span className="text-[7px] font-mono text-slate-500">BINAURAL FREQ</span>
                              <span className={`text-[10px] font-black ${domeState === 'OVERLOAD' ? 'text-red-400' : 'text-violet-400'}`}>{audioFreq} Hz</span>
                          </div>
                          <div className="flex flex-col text-right">
                              <span className="text-[7px] font-mono text-slate-500">COGNITIVE STATE</span>
                              <span className={`text-[10px] font-black ${domeState === 'ACTIVE' && thetaWaveDominance > 50 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {domeState === 'OVERLOAD' ? 'BETA (ANXIETY)' : domeState === 'ACTIVE' ? 'THETA (RELAXED)' : 'UNKNOWN'}
                              </span>
                          </div>
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0812] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Crowd Mindset</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('CALIBRATE')}
                   disabled={!systemActive || domeState !== 'STANDBY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || domeState !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-violet-950/40 border-violet-600 text-violet-400 hover:bg-violet-900/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                   }`}
                 >
                   Admit Crowd (Calibrate)
                 </button>

                 <button 
                   onClick={() => triggerEvent('OVERLOAD')}
                   disabled={!systemActive || domeState === 'STANDBY' || domeState === 'OVERLOAD'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || domeState === 'STANDBY' || domeState === 'OVERLOAD' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                   }`}
                 >
                   Simulate Panic / Overload
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EEGChilloutDome;
