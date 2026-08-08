/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PyrotechnicAbortProtocol = () => {
  const [systemArmed, setSystemArmed] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState('SAFE'); // SAFE, GUST_DETECTED, HARDWARE_ABORT
  
  // Meteorological Telemetry
  const [windSpeed, setWindSpeed] = useState(8.5); // mph
  const [windDirection, setWindDirection] = useState(180); // degrees (180 = blowing away from crowd)
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'LiDAR Anemometers active on Main Truss.' },
    { id: 2, time: '23:30:02', type: 'SYS', msg: 'DMX Pyro Relay connected. Safety interlock engaged.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemArmed && safetyStatus === 'SAFE') {
      loop = setInterval(() => {
        // Safe baseline wind
        setWindSpeed(prev => Math.max(5, Math.min(12, prev + (Math.random() * 4 - 2))));
        setWindDirection(prev => Math.max(160, Math.min(200, prev + (Math.random() * 10 - 5))));
      }, 800);
    } else if (safetyStatus === 'GUST_DETECTED') {
      loop = setInterval(() => {
        // Wind shifts rapidly towards the crowd (0 degrees is dead front)
        setWindSpeed(prev => Math.min(35, prev + 5));
        setWindDirection(prev => Math.max(10, prev - 45)); 
        
        if (windSpeed > 22 && windDirection < 45) {
          setSafetyStatus('HARDWARE_ABORT');
          addLog('CRIT', `DANGEROUS SHEAR DETECTED. Speed: ${windSpeed.toFixed(1)}mph | Vector: ${Math.floor(windDirection)}°`);
          
          setTimeout(() => {
            addLog('ACTION', 'TRIGGERING DMX HARDWARE INTERRUPT.');
            addLog('SUCCESS', 'Pyrotechnic launch cue aborted. Sparks contained.');
          }, 400);
        }
      }, 400);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemArmed, safetyStatus, windSpeed, windDirection]);

  const injectWindShear = () => {
    if (systemArmed && safetyStatus === 'SAFE') {
      setSafetyStatus('GUST_DETECTED');
      addLog('WARN', 'Sudden microburst detected. Modeling 3D vector field...');
    }
  };

  const clearAbort = () => {
    setSafetyStatus('SAFE');
    setWindSpeed(8.5);
    setWindDirection(180);
    addLog('SYS', 'Wind shear dissipated. Operator manually cleared abort lock.');
  };

  const toggleSystem = () => {
    if (!systemArmed) {
      setSystemArmed(true);
      addLog('SYS', 'Automated Safety Protocol ARMED. Monitoring meteorological vectors.');
    } else {
      setSystemArmed(false);
      setSafetyStatus('SAFE');
      addLog('WARN', 'Safety Protocol offline. Relying on human visual estimation.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper for compass dial rendering
  const getDialTransform = () => {
    // Offset by -90 so that 0 degrees points "UP" towards the crowd in our UI
    return `rotate(${windDirection - 90}deg)`;
  };

  return (
    <div className="min-h-screen bg-[#0a0505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Safety Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔥</span> Life-Safety Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Pyrotechnic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Wind-Shear Abort Protocol</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sudden, invisible wind gusts can blow pyrotechnic sparks or heavy smoke directly into the crowd or onto flammable stage elements, causing severe safety hazards. Relying on a human technician to feel the wind and manually press the emergency stop button is too slow. Eventra solves this by deploying LiDAR anemometers around the stage trussing to continuously model the 3D wind vector field. If a dangerous gust is detected blowing towards the crowd right before a launch cue, the system sends an emergency hardware interrupt to the DMX relays, instantly aborting the fireworks.
          </p>

          <div className="bg-[#1a0a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">⚙️</span> DMX Interlock Status
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemArmed ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {systemArmed ? 'Disarm Safety Interlock' : 'Arm Hardware Relays'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* DMX Relay Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 safetyStatus === 'HARDWARE_ABORT' ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                 systemArmed ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Pyro Launch Cue
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     safetyStatus === 'HARDWARE_ABORT' ? 'text-red-500 animate-pulse' :
                     systemArmed ? 'text-green-400' : 'text-slate-600'
                   }`}>
                     {systemArmed ? (safetyStatus === 'HARDWARE_ABORT' ? 'CUE ABORTED' : 'SYSTEM READY') : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono flex items-center">
                     {safetyStatus === 'HARDWARE_ABORT' ? 'DMX RELAY CUT' : 'DMX RELAY CLOSED'}
                   </span>
                 </div>
               </div>

               {/* Live Wind Speed */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 safetyStatus !== 'SAFE' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 systemArmed ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   LiDAR Wind Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     safetyStatus === 'HARDWARE_ABORT' ? 'text-red-400' : 
                     safetyStatus === 'GUST_DETECTED' ? 'text-orange-400' :
                     systemArmed ? 'text-white' : 'text-slate-600'
                   }`}>
                     {systemArmed ? windSpeed.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">MPH</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#0a0202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Meteorological & Relay Log</span>
                 {safetyStatus === 'GUST_DETECTED' && <span className="text-orange-400 animate-pulse">Calculating Vectors...</span>}
                 {safetyStatus === 'HARDWARE_ABORT' && <span className="text-red-500 animate-pulse">Interrupt Fired</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-green-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-red-400 font-bold' : 'text-slate-400'
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
            
            {/* Wind Vector Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#18181b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">3D VECTOR FIELD</span>
                <span className="text-[8px] font-mono text-slate-400">STAGE ORIENTATION</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-6">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-50 z-0"></div>

                {/* Stage Representation (Top) */}
                <div className="absolute top-[15%] w-32 h-8 bg-slate-800 border-2 border-slate-600 rounded flex items-center justify-center z-20">
                   <span className="text-[8px] font-black text-slate-400">MAIN STAGE (FIREWORKS)</span>
                </div>

                {/* Crowd Representation (Bottom) */}
                <div className="absolute bottom-[10%] w-full h-16 flex justify-center items-end z-20 space-x-1 opacity-40">
                   {Array.from({ length: 30 }).map((_, i) => (
                     <div key={i} className="w-2 h-4 bg-slate-500 rounded-t-full"></div>
                   ))}
                </div>
                <div className="absolute bottom-[2%] w-full text-center z-20">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">CROWD ZONE</span>
                </div>

                {/* Compass / Anemometer Visualizer */}
                <div className="relative w-48 h-48 rounded-full border-2 border-slate-700 mt-4 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
                   
                   {/* Direction Labels */}
                   <span className="absolute -top-4 text-[8px] font-bold text-red-500">CROWD (0°)</span>
                   <span className="absolute -bottom-4 text-[8px] font-bold text-green-500">BACKSTAGE (180°)</span>
                   
                   {/* Center Hub */}
                   <div className={`w-4 h-4 rounded-full z-20 transition-colors ${
                     safetyStatus === 'HARDWARE_ABORT' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse' : 'bg-slate-500'
                   }`}></div>

                   {/* Wind Vector Line */}
                   {systemArmed && (
                     <div 
                       className="absolute w-full h-full rounded-full transition-transform duration-300 flex justify-center"
                       style={{ transform: getDialTransform() }}
                     >
                        <div className={`w-0.5 h-1/2 origin-bottom transition-all duration-300 ${
                          safetyStatus === 'HARDWARE_ABORT' ? 'bg-red-500 h-[60%] shadow-[0_0_10px_#ef4444]' : 
                          safetyStatus === 'GUST_DETECTED' ? 'bg-orange-500 h-[55%]' : 'bg-green-500 h-[30%]'
                        }`}>
                          {/* Arrow Head */}
                          <div className={`absolute -top-1 -left-1.5 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent ${
                            safetyStatus === 'HARDWARE_ABORT' ? 'border-b-red-500' : 
                            safetyStatus === 'GUST_DETECTED' ? 'border-b-orange-500' : 'border-b-green-500'
                          }`}></div>
                        </div>
                     </div>
                   )}

                   {/* Safe Zone Arc (Green, blowing away) */}
                   <svg className="absolute inset-0 w-full h-full opacity-30 transform -rotate-90">
                     <circle cx="96" cy="96" r="94" stroke="#22c55e" strokeWidth="4" fill="none" strokeDasharray="590" strokeDashoffset="442" />
                   </svg>
                   {/* Danger Zone Arc (Red, blowing towards crowd) */}
                   <svg className="absolute inset-0 w-full h-full opacity-30 transform rotate-90">
                     <circle cx="96" cy="96" r="94" stroke="#ef4444" strokeWidth="4" fill="none" strokeDasharray="590" strokeDashoffset="442" />
                   </svg>

                </div>

                {/* Abort Overlay */}
                {safetyStatus === 'HARDWARE_ABORT' && (
                  <div className="absolute inset-0 bg-red-900/30 z-30 pointer-events-none flex items-center justify-center border-4 border-red-500 animate-pulse">
                     <div className="bg-red-500/90 text-white px-6 py-2 rounded font-black tracking-widest text-xl shadow-2xl backdrop-blur-sm">
                       ABORT LOCK
                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={injectWindShear}
                disabled={!systemArmed || safetyStatus !== 'SAFE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !systemArmed || safetyStatus !== 'SAFE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Wind Shear (Gust)
              </button>
              
              <button 
                onClick={clearAbort}
                disabled={safetyStatus === 'SAFE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  safetyStatus === 'SAFE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-green-950/40 border-green-900 text-green-500 hover:bg-green-900/60'
                }`}
              >
                Clear Abort Lock
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PyrotechnicAbortProtocol;
