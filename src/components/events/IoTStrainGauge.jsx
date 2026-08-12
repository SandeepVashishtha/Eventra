/* eslint-disable */
import React, { useState, useEffect } from 'react';

const IoTStrainGauge = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [structuralState, setStructuralState] = useState('NOMINAL'); // NOMINAL, WIND_SHEAR, CRITICAL_FATIGUE
  
  // IoT Structural Metrics
  const [windSpeed, setWindSpeed] = useState(12); // mph
  const [metalStrain, setMetalStrain] = useState(450); // µε (Microstrain)
  const [harmonicResonance, setHarmonicResonance] = useState(2.1); // Hz
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Wireless Strain Gauges and Accelerometers Online.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Stage Rigging Joint #1-12 reporting nominal tension.' }
  ]);

  // Visualizer State
  const [swayOffset, setSwayOffset] = useState(0);
  const [roofHeight, setRoofHeight] = useState(100); // % height (100 is fully raised)
  const [lowering, setLowering] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (structuralState === 'NOMINAL') {
              setWindSpeed(prev => Math.max(5, Math.min(15, prev + (Math.random() - 0.5) * 2)));
              setMetalStrain(prev => Math.max(300, Math.min(500, prev + (Math.random() - 0.5) * 20)));
              setHarmonicResonance(2.0 + Math.random() * 0.5);
              setSwayOffset(Math.sin(Date.now() / 1000) * 1); // Tiny sway
              
          } else if (structuralState === 'WIND_SHEAR') {
              setWindSpeed(prev => Math.min(45, prev + 2)); // High wind
              setMetalStrain(prev => Math.min(1800, prev + 100)); // High strain
              setHarmonicResonance(8.0 + Math.random() * 2);
              setSwayOffset(Math.sin(Date.now() / 500) * 8); // Visible swaying
              
          } else if (structuralState === 'CRITICAL_FATIGUE') {
              setWindSpeed(prev => Math.min(65, prev + 3)); // Severe storm
              setMetalStrain(prev => Math.min(3200, prev + 250)); // Nearing yield strength
              setHarmonicResonance(14.0 + Math.random() * 4);
              setSwayOffset(Math.sin(Date.now() / 200) * 15); // Violent swaying
              
              if (!lowering && metalStrain > 2800) {
                  setLowering(true);
                  addLog('CRIT', 'STRUCTURAL YIELD LIMIT APPROACHING. Micro-fractures detected.');
                  addLog('ACTION', 'Automated Safety Protocol Engaged: Lowering Roof Truss.');
              }
          }
          
          // Lowering animation
          if (lowering) {
              setRoofHeight(prev => {
                  if (prev <= 20) {
                      setLowering(false); // Finished lowering
                      setStructuralState('NOMINAL'); // Safe once lowered
                      addLog('SUCCESS', 'Roof Truss secured at safe ground height. Collapse averted.');
                      return 20;
                  }
                  return prev - 2;
              });
              // While lowering, sway reduces
              setSwayOffset(prev => prev * 0.9);
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, structuralState, metalStrain, lowering]);

  const triggerEvent = (type) => {
    if (!systemActive || lowering) return;
    
    setStructuralState(type);
    
    if (type === 'WIND_SHEAR') {
        addLog('WARN', 'Weather anomaly: Wind shear exceeding 35mph.');
        addLog('ACTION', 'Strain gauges on East Pillar showing increased load (1500 µε).');
    } else if (type === 'CRITICAL_FATIGUE') {
        addLog('CRIT', 'Violent harmonic resonance from subwoofers + 60mph wind.');
    } else if (type === 'NOMINAL') {
        setRoofHeight(100); // Reset roof
        addLog('SYS', 'Rigging tension normalized. Returning to baseline telemetry.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setStructuralState('NOMINAL');
      setRoofHeight(100);
      setLowering(false);
      addLog('SYS', 'Predictive Maintenance Engine Armed. Monitoring load-bearing joints.');
    } else {
      setSystemActive(false);
      setStructuralState('NOMINAL');
      setSwayOffset(0);
      setRoofHeight(100);
      setLowering(false);
      addLog('WARN', 'IoT Telemetry Offline. Relying on manual visual inspections.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏗️</span> Predictive Maintenance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            IoT Strain Gauge <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">Rigging Safety</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            High winds or heavy equipment can cause catastrophic stage rigging collapses, often without any visible warning signs until the metal snaps. Eventra prevents this by embedding wireless IoT strain gauges and accelerometers into the critical load-bearing joints of the stage scaffolding. Eventra aggregates this telemetry in real-time. If the system detects metal fatigue, abnormal harmonic resonance from bass frequencies, or wind-shear strain approaching structural limits, it immediately alerts the production manager and automatically lowers the rigging before a collapse occurs.
          </p>

          <div className="bg-[#120a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Structural Engineering Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Sensors' : 'Activate Rigging IoT'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Metal Strain */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 metalStrain > 2500 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                 metalStrain > 1500 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Tension Strain
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     metalStrain > 2500 ? 'text-red-500' : 
                     metalStrain > 1500 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(metalStrain)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">µε</span>
                 </div>
               </div>

               {/* Wind Speed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 windSpeed > 40 ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Wind Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     windSpeed > 40 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {windSpeed.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mph</span>
                 </div>
               </div>
               
               {/* Harmonic Resonance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 harmonicResonance > 10 ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Vibration
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     harmonicResonance > 10 ? 'text-yellow-400' : 'text-slate-600'
                   }`}>
                     {harmonicResonance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Sensor Aggregator Ledger</span>
                 {lowering && <span className="text-red-500 font-black animate-pulse">EMERGENCY ROOF LOWERING</span>}
                 {!lowering && structuralState === 'CRITICAL_FATIGUE' && <span className="text-red-400 font-black animate-pulse">YIELD STRENGTH NEARING LIMIT</span>}
                 {structuralState === 'WIND_SHEAR' && <span className="text-orange-400 font-black animate-pulse">WARNING: GALE FORCE WINDS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
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
            
            {/* Scaffolding Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0502]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">STRUCTURAL TWIN</span>
                <span className="text-[8px] font-mono text-slate-400">MAIN STAGE (FRONT)</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex items-end justify-center pb-8 pt-16">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CAD MODEL OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex justify-center items-end">
                      
                      {/* Wind Visualization */}
                      {windSpeed > 20 && (
                          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex flex-col justify-around">
                              {Array.from({length: 5}).map((_, i) => (
                                  <div key={i} className="h-0.5 bg-blue-300 rounded-full animate-[wind_1s_linear_infinite]" style={{
                                      width: `${Math.random() * 50 + 20}%`,
                                      animationDuration: `${1 / (windSpeed / 20)}s`,
                                      marginLeft: `${Math.random() * 50}%`
                                  }}></div>
                              ))}
                          </div>
                      )}

                      {/* Stage Floor */}
                      <div className="absolute bottom-4 inset-x-4 h-4 bg-slate-800 border-2 border-slate-700 rounded z-10"></div>

                      {/* Scaffolding Structure */}
                      <div 
                          className="relative w-48 h-64 border-x-4 border-slate-600 transition-all duration-100 origin-bottom"
                          style={{ transform: `skewX(${swayOffset}deg)` }}
                      >
                          {/* Cross bracing */}
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(71,85,105,0.8)_49%,rgba(71,85,105,0.8)_51%,transparent_52%),linear-gradient(-45deg,transparent_48%,rgba(71,85,105,0.8)_49%,rgba(71,85,105,0.8)_51%,transparent_52%)] bg-[size:3rem_3rem]"></div>

                          {/* Roof Truss (Moves up and down) */}
                          <div 
                              className="absolute inset-x-[-1rem] h-8 bg-slate-800 border-2 border-slate-500 rounded flex items-center justify-between px-2 z-20 transition-all duration-300"
                              style={{ bottom: `${roofHeight}%` }} // CSS bottom so 100% is top of pillars
                          >
                              {/* Lights hanging off truss */}
                              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] -mb-8"></div>
                              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] -mb-8"></div>
                              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] -mb-8"></div>

                              {/* Roof Strain Sensors */}
                              <div className={`absolute top-0 left-4 w-2 h-2 rounded-full -mt-1 ${
                                  metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping' :
                                  metalStrain > 1500 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-emerald-500'
                              }`}></div>
                              <div className={`absolute top-0 right-4 w-2 h-2 rounded-full -mt-1 ${
                                  metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping' :
                                  metalStrain > 1500 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-emerald-500'
                              }`}></div>
                          </div>

                          {/* Base Strain Sensors (Fixed) */}
                          <div className={`absolute bottom-0 -left-1 w-2 h-4 rounded ${
                              metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' :
                              metalStrain > 1500 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}></div>
                          <div className={`absolute bottom-0 -right-1 w-2 h-4 rounded ${
                              metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' :
                              metalStrain > 1500 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}></div>

                          {/* Middle Joint Sensors */}
                          <div className={`absolute top-1/2 -left-1 w-2 h-2 rounded-full ${
                              metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' :
                              metalStrain > 1500 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}></div>
                          <div className={`absolute top-1/2 -right-1 w-2 h-2 rounded-full ${
                              metalStrain > 2500 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' :
                              metalStrain > 1500 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}></div>
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes wind {
                        0% { transform: translateX(200px); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateX(-200px); opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Weather / Stress Controls */}
            <div className="w-full bg-[#120a05] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Weather & Load Anomaly</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerEvent('NOMINAL')}
                   disabled={!systemActive || structuralState === 'NOMINAL' || lowering}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || structuralState === 'NOMINAL' || lowering ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   Safe<br/>(Clear Skies)
                 </button>

                 <button 
                   onClick={() => triggerEvent('WIND_SHEAR')}
                   disabled={!systemActive || structuralState === 'WIND_SHEAR' || lowering}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || structuralState === 'WIND_SHEAR' || lowering ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   Storm<br/>(40mph Wind)
                 </button>

                 <button 
                   onClick={() => triggerEvent('CRITICAL_FATIGUE')}
                   disabled={!systemActive || structuralState === 'CRITICAL_FATIGUE' || lowering}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || structuralState === 'CRITICAL_FATIGUE' || lowering ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   Fatigue<br/>(Yield Limit)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default IoTStrainGauge;
