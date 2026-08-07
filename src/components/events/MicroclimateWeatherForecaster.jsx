/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MicroclimateWeatherForecaster = () => {
  const [telemetryActive, setTelemetryActive] = useState(false);
  const [weatherStatus, setWeatherStatus] = useState('NOMINAL'); // NOMINAL, WARNING, CRITICAL_SHEAR
  
  // Weather metrics
  const [windSpeed, setWindSpeed] = useState(12); // mph
  const [barometricPressure, setBarometricPressure] = useState(1013); // hPa
  const [lightningProximity, setLightningProximity] = useState(30); // miles
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'IoT Anemometer & Barometer perimeter online (500 acres).' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Predictive meteorological AI model initialized.' }
  ]);

  useEffect(() => {
    let loop;
    if (telemetryActive && weatherStatus === 'NOMINAL') {
      loop = setInterval(() => {
        setWindSpeed(prev => Math.max(8, prev + (Math.random() * 4 - 2)));
        setBarometricPressure(prev => Math.max(1010, Math.min(1015, prev + (Math.random() * 2 - 1))));
      }, 1000);
    } else if (weatherStatus === 'WARNING') {
      loop = setInterval(() => {
        setWindSpeed(prev => Math.min(45, prev + 5));
        setBarometricPressure(prev => Math.max(995, prev - 3));
        setLightningProximity(prev => Math.max(2, prev - 4));
        
        if (windSpeed > 35 || lightningProximity < 8) {
          setWeatherStatus('CRITICAL_SHEAR');
          addLog('CRIT', 'SEVERE MICRO-BURST DETECTED. Wind > 40mph. Lightning < 5mi.');
          
          setTimeout(() => {
            addLog('ACTION', 'AUTO-TRIGGER: Initiating Stage Evacuation Protocols.');
            addLog('WEB3', 'Pushing emergency take-cover notifications to all 80,000 attendee devices.');
          }, 1500);
        }
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [telemetryActive, weatherStatus, windSpeed, lightningProximity]);

  const simulateMicroburst = () => {
    if (telemetryActive && weatherStatus === 'NOMINAL') {
      setWeatherStatus('WARNING');
      addLog('WARN', 'Rapid barometric pressure drop detected in North Quadrant. Predicting micro-burst in 10 minutes.');
    }
  };

  const resetWeather = () => {
    setWeatherStatus('NOMINAL');
    setWindSpeed(12);
    setBarometricPressure(1013);
    setLightningProximity(30);
    addLog('SYS', 'Storm cell passed. All clear issued. Resuming normal telemetry.');
  };

  const toggleTelemetry = () => {
    if (!telemetryActive) {
      setTelemetryActive(true);
      addLog('SYS', 'Hyper-local microclimate sensors armed. Predictive forecasting active.');
    } else {
      setTelemetryActive(false);
      resetWeather();
      addLog('WARN', 'Sensors offline. Relying on generic municipal forecasts (UNSAFE).');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06101a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Meteorology Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌪️</span> Predictive Meteorological AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Hyper-local Microclimate <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Weather Forecasting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Generic municipal weather forecasts lack the granular precision needed for large outdoor events; they cannot predict sudden, localized micro-bursts of wind or lightning that can collapse a 60-foot stage structure in seconds. Eventra solves this by deploying a perimeter of IoT anemometers and barometer sensors across the 500-acre site. A predictive AI model analyzes this hyper-local telemetry to forecast violent wind shears and lightning strikes with 10-minute warning precision, automatically triggering stage evacuation protocols before disaster strikes.
          </p>

          <div className="bg-[#0b1626] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">📡</span> Sensor Perimeter Array
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleTelemetry}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     telemetryActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {telemetryActive ? 'Disable Sensors' : 'Arm Sensor Network'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Wind Speed */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 weatherStatus === 'CRITICAL_SHEAR' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 weatherStatus === 'WARNING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 telemetryActive ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Wind Speed</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     weatherStatus === 'CRITICAL_SHEAR' ? 'text-red-500' :
                     weatherStatus === 'WARNING' ? 'text-yellow-400' :
                     telemetryActive ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {telemetryActive ? Math.floor(windSpeed) : '---'}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-1">mph</span>
                 </div>
               </div>

               {/* Barometric Pressure */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 weatherStatus === 'CRITICAL_SHEAR' || weatherStatus === 'WARNING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 telemetryActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">Pressure</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     weatherStatus === 'CRITICAL_SHEAR' || weatherStatus === 'WARNING' ? 'text-yellow-400' :
                     telemetryActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {telemetryActive ? Math.floor(barometricPressure) : '---'}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-1">hPa</span>
                 </div>
               </div>

               {/* Lightning Proximity */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 lightningProximity < 8 && telemetryActive ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 telemetryActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">Lightning Dist</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     lightningProximity < 8 && telemetryActive ? 'text-red-500' :
                     telemetryActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {telemetryActive ? Math.floor(lightningProximity) : '---'}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-1">mi</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#06101a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Meteorological AI Log</span>
                 {weatherStatus === 'WARNING' && <span className="text-yellow-400 animate-pulse">Predicting Micro-Burst...</span>}
                 {weatherStatus === 'CRITICAL_SHEAR' && <span className="text-red-500 animate-pulse">Evacuating Site!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' || log.type === 'WEB3' ? 'text-sky-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Radar & Evacuation Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Site Radar Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[320px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">DOPPLER AI</span>
                <span className="text-[8px] font-mono text-slate-400">FESTIVAL PERIMETER (500 ACRES)</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center">
                
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0xdmgtMzhWMzl6IiBmaWxsPSIjMWUyOTNiIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] opacity-20"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sky-900/50"></div>
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-sky-900/50"></div>

                {!telemetryActive ? (
                  <div className="z-10 text-center opacity-40">
                    <span className="text-4xl block mb-2">📡</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Radar Offline</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                     
                     {/* Radar Sweep Animation (Nominal) */}
                     {weatherStatus === 'NOMINAL' && (
                       <div className="absolute w-[300px] h-[300px] rounded-full border border-sky-900/50">
                         <div className="absolute top-0 left-1/2 w-[150px] h-[150px] origin-bottom-left bg-gradient-to-r from-transparent to-sky-500/20 animate-radar-spin border-r-2 border-sky-400"></div>
                       </div>
                     )}

                     {/* Festival Map Outline */}
                     <div className="absolute z-10 w-48 h-32 border-2 border-slate-600/50 rounded-xl flex items-center justify-center">
                        {/* Main Stage Marker */}
                        <div className="absolute top-4 right-4 w-4 h-4 bg-sky-500 border border-white flex items-center justify-center shadow-[0_0_10px_#0ea5e9]">
                          <span className="text-[6px] font-black text-black">MS</span>
                        </div>
                     </div>

                     {/* Weather Threat Rendering */}
                     {(weatherStatus === 'WARNING' || weatherStatus === 'CRITICAL_SHEAR') && (
                       <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-red-500/40 via-yellow-500/20 to-transparent rounded-full blur-xl transition-all duration-1000 ${
                         weatherStatus === 'CRITICAL_SHEAR' ? 'transform scale-150 translate-x-[-10%] translate-y-[20%] animate-pulse' : 'transform translate-x-[20%] translate-y-[-20%]'
                       }`}></div>
                     )}

                     {/* Lightning Strikes */}
                     {weatherStatus === 'CRITICAL_SHEAR' && (
                       <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100">
                         <path d="M 60 10 L 45 45 L 55 50 L 40 90" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" className="animate-flash" />
                         <path d="M 80 20 L 70 40 L 75 45 L 65 70" fill="none" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" className="animate-flash" style={{ animationDelay: '300ms' }} />
                       </svg>
                     )}

                     {/* Evacuation Alert Overlay */}
                     {weatherStatus === 'CRITICAL_SHEAR' && (
                       <div className="absolute inset-0 bg-red-900/40 z-30 flex items-center justify-center backdrop-blur-sm animate-pulse-fast">
                          <div className="bg-black/80 border-2 border-red-500 rounded-xl p-4 text-center">
                            <span className="text-3xl block mb-1">🚨</span>
                            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest block leading-tight">Stage Evacuation<br/>Initiated</span>
                          </div>
                       </div>
                     )}

                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateMicroburst}
                disabled={!telemetryActive || weatherStatus !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !telemetryActive || weatherStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Inject Storm Cell
              </button>
              
              <button 
                onClick={resetWeather}
                disabled={weatherStatus === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  weatherStatus === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Storm Passed (Reset)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MicroclimateWeatherForecaster;
