/* eslint-disable */
import React, { useState, useEffect } from 'react';

const StructuralIntegrityPreCog = () => {
  const [modelActive, setModelActive] = useState(false);
  const [structuralState, setStructuralState] = useState('NOMINAL'); // NOMINAL, RESONANCE_DETECTED, IMMINENT_FAILURE
  
  // Telemetry Metrics (Nodes A, B, C on main truss)
  const [strainTension, setStrainTension] = useState(12.5); // kN
  const [vibrationFreq, setVibrationFreq] = useState(4.2); // Hz
  const [anomalyConfidence, setAnomalyConfidence] = useState(1.0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Stage Truss IoT telemetry array online.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Deep-Learning Anomaly Detection (Pre-Cog) initialized.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (modelActive && structuralState === 'NOMINAL') {
      loop = setInterval(() => {
        // Normal wind/crowd loads
        setStrainTension(Math.max(10, Math.min(15, 12.5 + (Math.random() * 2 - 1))));
        setVibrationFreq(Math.max(2, Math.min(6, 4 + (Math.random() * 1.5 - 0.75))));
        setAnomalyConfidence(Math.max(0.5, Math.random() * 3));
      }, 800);
    } else if (structuralState === 'RESONANCE_DETECTED') {
      loop = setInterval(() => {
        // Crowd jumping hits the resonant frequency of the steel truss
        setStrainTension(prev => Math.min(45, prev + 2.5));
        setVibrationFreq(prev => Math.min(18, prev + 1.2)); // Dangerous harmonic
        setAnomalyConfidence(prev => Math.min(99.9, prev + 8));
        
        if (strainTension > 38 && anomalyConfidence > 90) {
          setStructuralState('IMMINENT_FAILURE');
          addLog('CRIT', `FATAL STRUCTURAL SHEAR PREDICTED. Node C approaching failure threshold (40kN).`);
          
          setTimeout(() => {
            addLog('ACTION', 'TRIGGERING AUTOMATED LIFE-SAFETY EVACUATION ALARM.');
            addLog('SYS', 'Audio PA muted. Egress lighting flashing red.');
          }, 600);
        }
      }, 600);
    } else if (structuralState === 'IMMINENT_FAILURE') {
      loop = setInterval(() => {
         // Fluctuating at failure point until load is removed
         setStrainTension(Math.max(38, Math.min(42, 40 + (Math.random() * 4 - 2))));
         setVibrationFreq(Math.max(16, Math.min(19, 17.5 + (Math.random() * 2 - 1))));
      }, 300);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [modelActive, structuralState, strainTension, anomalyConfidence]);

  const injectHarmonicResonance = () => {
    if (modelActive && structuralState === 'NOMINAL') {
      setStructuralState('RESONANCE_DETECTED');
      addLog('WARN', 'Abnormal high-frequency vibration detected. Crowd jump syncing with steel resonance.');
      addLog('AI', 'Neural net calculating time-to-mechanical-failure...');
    }
  };

  const clearEvacuation = () => {
    setStructuralState('NOMINAL');
    setStrainTension(12.5);
    setVibrationFreq(4.2);
    setAnomalyConfidence(1.0);
    addLog('SUCCESS', 'Crowd dispersed. Resonant load removed. Structural tension nominal.');
  };

  const toggleModel = () => {
    if (!modelActive) {
      setModelActive(true);
      addLog('SYS', 'Pre-Cog Neural Network Armed. Ingesting continuous strain telemetry.');
    } else {
      setModelActive(false);
      setStructuralState('NOMINAL');
      addLog('WARN', 'AI Pre-Cog offline. Relying on visual inspections for stage integrity.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0703] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: AI Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏗️</span> Predictive Maintenance AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Structural Integrity <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Deep-Learning Pre-Cog</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive stage rigging can fail catastrophically due to invisible material fatigue, wind stress, or dynamic crowd resonance, often providing zero visual warning before collapse. Eventra solves this by attaching IoT strain gauges and accelerometers to key structural nodes of the stage trussing. This high-frequency vibration data is fed into a deep-learning anomaly detection model (Pre-Cog). If the AI detects a resonant frequency or strain pattern indicative of impending mechanical failure, it instantly triggers an automated evacuation alarm before the steel yields.
          </p>

          <div className="bg-[#170e0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🧠</span> Pre-Cog Neural Net
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleModel}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     modelActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {modelActive ? 'Disable Pre-Cog Model' : 'Engage Telemetry Feed'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Strain Tension */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 structuralState === 'IMMINENT_FAILURE' ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                 structuralState === 'RESONANCE_DETECTED' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 modelActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Node C Strain (Peak)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     structuralState === 'IMMINENT_FAILURE' ? 'text-white' :
                     structuralState === 'RESONANCE_DETECTED' ? 'text-orange-400 animate-pulse' :
                     modelActive ? 'text-orange-500' : 'text-slate-600'
                   }`}>
                     {modelActive ? strainTension.toFixed(1) : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kN</span>
                 </div>
               </div>

               {/* Vibration Frequency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 structuralState !== 'NOMINAL' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 modelActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Oscillation Freq
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     structuralState !== 'NOMINAL' ? 'text-yellow-400' :
                     modelActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {modelActive ? vibrationFreq.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

               {/* AI Confidence */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 structuralState === 'IMMINENT_FAILURE' ? 'bg-red-950/40 border-red-500/50' :
                 modelActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Anomaly Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     structuralState === 'IMMINENT_FAILURE' ? 'text-red-500' :
                     modelActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {modelActive ? anomalyConfidence.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090301] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Inference & Telemetry Log</span>
                 {structuralState === 'RESONANCE_DETECTED' && <span className="text-orange-400 animate-pulse">Analyzing Pattern...</span>}
                 {structuralState === 'IMMINENT_FAILURE' && <span className="text-red-500 animate-pulse">EVACUATE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-red-400 font-bold' : 
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
            
            {/* Structural Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">TRUSS WIREFRAME POV</span>
                <span className="text-[8px] font-mono text-slate-400">STRAIN TELEMETRY</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-4 pt-10">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-30 z-0"></div>

                {/* 3D Wireframe Representation of Stage Arch */}
                <div className="relative w-full h-full flex justify-center z-10 perspective-[800px]">
                   
                   {/* Left Leg */}
                   <div className="absolute left-[15%] bottom-0 w-8 h-40 border-2 border-slate-600 bg-slate-800/50 flex flex-col justify-between p-1">
                     <div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div>
                   </div>

                   {/* Right Leg */}
                   <div className="absolute right-[15%] bottom-0 w-8 h-40 border-2 border-slate-600 bg-slate-800/50 flex flex-col justify-between p-1">
                     <div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div><div className="w-full h-[2px] bg-slate-500"></div>
                   </div>

                   {/* Top Arch / Main Truss */}
                   <div className={`absolute top-[20%] w-[70%] h-12 border-4 bg-slate-800/80 flex items-center justify-center transition-all duration-100 ${
                     structuralState === 'IMMINENT_FAILURE' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' :
                     structuralState === 'RESONANCE_DETECTED' ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
                     'border-slate-500 shadow-none'
                   }`}
                   style={{
                     // Vibrate the truss based on frequency state
                     transform: modelActive && structuralState !== 'NOMINAL' ? `translateY(${Math.sin(Date.now() / (200 / vibrationFreq)) * (structuralState === 'IMMINENT_FAILURE' ? 4 : 2)}px)` : 'none'
                   }}>
                      {/* Cross-bracing UI */}
                      <svg width="100%" height="100%" className="absolute inset-0 opacity-50">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="2" />
                      </svg>
                      
                      {/* Node C Sensor */}
                      <div className={`absolute w-6 h-6 rounded-full border-[3px] z-20 flex items-center justify-center ${
                         structuralState === 'IMMINENT_FAILURE' ? 'border-white bg-red-500 animate-pulse' :
                         structuralState === 'RESONANCE_DETECTED' ? 'border-orange-200 bg-orange-500' :
                         'border-emerald-200 bg-emerald-500'
                      }`}>
                        <span className="text-[6px] font-black text-black">C</span>
                      </div>
                   </div>

                </div>

                {/* Alarm Overlay */}
                {structuralState === 'IMMINENT_FAILURE' && (
                  <div className="absolute inset-0 bg-red-900/50 z-30 pointer-events-none flex flex-col items-center justify-center border-[8px] border-red-500 animate-[pulse_0.5s_infinite]">
                     <div className="bg-black/90 text-red-500 px-6 py-4 rounded border-2 border-red-500 font-black tracking-widest text-2xl shadow-2xl flex flex-col items-center">
                       <span>EVACUATE</span>
                       <span className="text-[10px] text-white mt-2">STAGE COLLAPSE IMMINENT</span>
                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={injectHarmonicResonance}
                disabled={!modelActive || structuralState !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !modelActive || structuralState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Harmonic Resonance
              </button>
              
              <button 
                onClick={clearEvacuation}
                disabled={structuralState === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  structuralState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Clear Evacuation Alarm
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default StructuralIntegrityPreCog;
