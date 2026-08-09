/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PlasmaAcoustics = () => {
  const [plasmaActive, setPlasmaActive] = useState(false);
  const [emitterState, setEmitterState] = useState('IDLE'); // IDLE, NOMINAL, HIGH_FREQ, OVERLOAD
  
  // Physics Metrics
  const [voltage, setVoltage] = useState(0); // kV
  const [thd, setThd] = useState(0.00); // Total Harmonic Distortion %
  const [plasmaTemp, setPlasmaTemp] = useState(25); // Celsius
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'High-Voltage Plasma Emitter array initialized.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting ignition sequence for massless transduction.' }
  ]);

  // Visualizer State
  const [arcIntensity, setArcIntensity] = useState(0);
  const [waveforms, setWaveforms] = useState(Array(5).fill(0));

  useEffect(() => {
    let loop;
    
    if (plasmaActive) {
      loop = setInterval(() => {
          
          let targetVolts = 0;
          let targetTemp = 25;
          let targetThd = 0.00;
          
          if (emitterState === 'NOMINAL') {
              targetVolts = 15 + Math.random() * 2;
              targetTemp = 1800 + Math.random() * 50;
              targetThd = 0.001;
              setArcIntensity(50);
          } else if (emitterState === 'HIGH_FREQ') {
              targetVolts = 25 + Math.random() * 3;
              targetTemp = 2400 + Math.random() * 100;
              targetThd = 0.003;
              setArcIntensity(90);
          } else if (emitterState === 'OVERLOAD') {
              targetVolts = 35 + Math.random() * 5;
              targetTemp = 3200 + Math.random() * 200;
              targetThd = 0.05; // Still insanely low for traditional speakers
              setArcIntensity(120);
          } else {
              targetVolts = 5;
              targetTemp = 800;
              setArcIntensity(10);
          }

          setVoltage(prev => prev + (targetVolts - prev) * 0.1);
          setPlasmaTemp(prev => prev + (targetTemp - prev) * 0.1);
          setThd(targetThd);

          // Audio visualization
          if (emitterState !== 'IDLE') {
              setWaveforms(prev => prev.map(() => Math.random() * arcIntensity));
          } else {
              setWaveforms(Array(5).fill(0));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [plasmaActive, emitterState, arcIntensity]);

  const triggerModulation = (state, logMsg) => {
    if (!plasmaActive) return;
    setEmitterState(state);
    addLog('ACTION', logMsg);
    
    if (state === 'HIGH_FREQ') {
        addLog('SYS', '18kHz - 22kHz modulation active. Zero-mass transient response optimal.');
    } else if (state === 'OVERLOAD') {
        addLog('WARN', 'Thermal limits approaching. Modulating arc width to prevent ozone buildup.');
    }
  };

  const toggleIgnition = () => {
    if (!plasmaActive) {
      setPlasmaActive(true);
      setVoltage(5);
      setEmitterState('IDLE');
      addLog('SYS', 'Igniting primary electrode arc. Plasma field established.');
    } else {
      setPlasmaActive(false);
      setVoltage(0);
      setPlasmaTemp(25);
      setEmitterState('IDLE');
      setWaveforms(Array(5).fill(0));
      setArcIntensity(0);
      addLog('WARN', 'Extinguishing plasma arc. Emitters cooling down.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Massless Transduction
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Plasma-Based <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Acoustic Emitters</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional cone-based speakers suffer from high-frequency distortion at massive volumes, resulting in harsh, piercing treble that causes listening fatigue and hearing damage at outdoor festivals. Eventra replaces standard tweeters with experimental massless plasma emitters. By modulating a high-voltage electrical arc to compress and expand the surrounding air directly, it creates zero-mass, perfectly phase-aligned sound waves. This dashboard monitors plasma integrity and voltage regulation, delivering crystal-clear, distortion-free treble across 500 feet.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Plasma Field Regulator
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleIgnition}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     plasmaActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {plasmaActive ? 'Extinguish Arc' : 'Ignite Plasma Emitters'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* High Voltage */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 plasmaActive && voltage > 30 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 plasmaActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Electrode Voltage
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     plasmaActive && voltage > 30 ? 'text-orange-400 animate-pulse' :
                     plasmaActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {voltage.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kV</span>
                 </div>
               </div>

               {/* THD */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 plasmaActive ? 'bg-blue-950/20 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Audio Distortion (THD)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     plasmaActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {thd.toFixed(3)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Plasma Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 plasmaActive && plasmaTemp > 3000 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Arc Temperature
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     plasmaActive && plasmaTemp > 3000 ? 'text-red-400 animate-pulse' :
                     plasmaActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {Math.floor(plasmaTemp)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°C</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020406] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Physics & Modulation Log</span>
                 {emitterState === 'HIGH_FREQ' && <span className="text-cyan-400 animate-pulse">MODULATING PLASMA...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Plasma Arc Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!plasmaActive ? 'bg-[#03060a]' : 'bg-[#020406]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">ARC CHAMBER</span>
                <span className="text-[8px] font-mono text-slate-400">HIGH-FREQUENCY EMMITER</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4 pt-10">
                
                {/* Physical Chamber / Electrodes */}
                <div className="w-32 h-64 border-2 border-slate-700/50 rounded-[2rem] relative flex items-center justify-center z-10 bg-slate-900/30 overflow-hidden shadow-inner">
                    
                    {/* Top Electrode */}
                    <div className="absolute top-0 w-4 h-16 bg-gradient-to-b from-slate-400 to-slate-800 rounded-b-full shadow-[0_5px_10px_rgba(0,0,0,0.5)] z-20"></div>
                    
                    {/* Bottom Electrode */}
                    <div className="absolute bottom-0 w-4 h-16 bg-gradient-to-t from-slate-400 to-slate-800 rounded-t-full shadow-[0_-5px_10px_rgba(0,0,0,0.5)] z-20"></div>

                    {!plasmaActive ? (
                       <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center mt-12">CHAMBER UNPRESSURIZED</span>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                            
                            {/* The Plasma Arc */}
                            <div className="relative w-full h-32 flex items-center justify-center">
                                {/* Core white hot arc */}
                                <div 
                                    className="w-1 h-full bg-white rounded-full absolute z-30"
                                    style={{ 
                                        boxShadow: `0 0 ${arcIntensity/2}px ${arcIntensity/5}px #fff, 0 0 ${arcIntensity}px ${arcIntensity/2}px #22d3ee`,
                                        transform: `scaleX(${1 + (waveforms[0]/50)}) skewX(${Math.random() * 2 - 1}deg)`,
                                        filter: emitterState === 'OVERLOAD' ? 'hue-rotate(-40deg)' : 'none' // shift to purplish red if overloading
                                    }}
                                ></div>
                                
                                {/* Outer cyan glow */}
                                <div 
                                    className="w-4 h-full bg-cyan-400/50 rounded-full absolute z-20 blur-md transition-transform"
                                    style={{ 
                                        transform: `scaleX(${1 + (waveforms[1]/20)})`,
                                        opacity: emitterState !== 'IDLE' ? 0.8 : 0.2,
                                        filter: emitterState === 'OVERLOAD' ? 'hue-rotate(-40deg)' : 'none'
                                    }}
                                ></div>
                                
                                {/* Audio wave distortion effect (mimicking expanding air) */}
                                {emitterState !== 'IDLE' && (
                                    <div 
                                        className="w-full h-full absolute z-10 border border-cyan-500/20 rounded-full animate-ping"
                                        style={{ animationDuration: `${0.1 + (100-arcIntensity)/500}s` }}
                                    ></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid background styling */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0,transparent_100%)] pointer-events-none"></div>
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Modulate Audio Signal</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerModulation('NOMINAL', 'Injecting standard vocal frequencies (2kHz - 8kHz).')}
                   disabled={!plasmaActive || emitterState === 'NOMINAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !plasmaActive || emitterState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-900 text-blue-400 hover:bg-blue-900/60'
                   }`}
                 >
                   Nominal (Vocal Range)
                 </button>
                 
                 <button 
                   onClick={() => triggerModulation('HIGH_FREQ', 'Injecting high-frequency transient hits (15kHz+).')}
                   disabled={!plasmaActive || emitterState === 'HIGH_FREQ'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !plasmaActive || emitterState === 'HIGH_FREQ' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                   }`}
                 >
                   High-Freq Transients (Crisp Treble)
                 </button>

                 <button 
                   onClick={() => triggerModulation('OVERLOAD', 'WARNING: Injecting maximum amplitude sweep.')}
                   disabled={!plasmaActive || emitterState === 'OVERLOAD'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !plasmaActive || emitterState === 'OVERLOAD' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                   }`}
                 >
                   Stress Test (Max Amplitude)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PlasmaAcoustics;
