/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WaterStationPressureMonitor = () => {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [stationStatus, setStationStatus] = useState('NOMINAL'); // NOMINAL, DROPPING, CRITICAL, OFFLINE
  
  const [pressurePSI, setPressurePSI] = useState(65);
  const [flowRateGPM, setFlowRateGPM] = useState(42);
  const [tankLevel, setTankLevel] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'IoT inline flow meters connected across 12 hydration zones.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Fluid dynamics AI initialized. Monitoring gallons-per-minute (GPM).' }
  ]);

  useEffect(() => {
    let loop;
    if (monitoringActive && stationStatus === 'NOMINAL') {
      loop = setInterval(() => {
        setPressurePSI(prev => Math.max(60, prev + (Math.random() * 2 - 1)));
        setFlowRateGPM(prev => Math.max(38, prev + (Math.random() * 3 - 1.5)));
        setTankLevel(prev => Math.max(0, prev - 0.2));
      }, 1000);
    } else if (stationStatus === 'DROPPING') {
      loop = setInterval(() => {
        setPressurePSI(prev => Math.max(20, prev - 3));
        setFlowRateGPM(prev => Math.max(10, prev - 2));
        setTankLevel(prev => Math.max(0, prev - 0.5));
        
        if (pressurePSI < 30) {
          setStationStatus('CRITICAL');
          addLog('CRIT', 'Station 04 (Main Stage) pressure critical. ETA to dry: 15 mins.');
          
          setTimeout(() => {
            setStationStatus('OFFLINE');
            addLog('ACTION', 'Auto-dispatching plumbing team to Station 04.');
            addLog('WEB3', 'Temporarily removing Station 04 from the public Eventra App map to prevent lines.');
          }, 2000);
        }
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [monitoringActive, stationStatus, pressurePSI]);

  const simulatePressureDrop = () => {
    if (monitoringActive && stationStatus === 'NOMINAL') {
      setStationStatus('DROPPING');
      addLog('WARN', 'Rapid pressure drop detected at Station 04. Possible pump failure or extreme demand.');
    }
  };

  const resetStation = () => {
    setStationStatus('NOMINAL');
    setPressurePSI(65);
    setFlowRateGPM(42);
    setTankLevel(100);
    addLog('SYS', 'Plumbing team resolved issue. Station 04 back online and visible on map.');
  };

  const toggleMonitoring = () => {
    if (!monitoringActive) {
      setMonitoringActive(true);
      addLog('SYS', 'Hydration telemetry online. Real-time monitoring active.');
    } else {
      setMonitoringActive(false);
      resetStation();
      addLog('WARN', 'Telemetry offline. Relying on manual reports.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040c17] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💧</span> Fluid Dynamics AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Water Station <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Pressure Monitoring</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees often wait 45 minutes in line for water, only to reach the front and find that the station has lost pressure or run completely dry during peak heat hours. Eventra prevents this by installing IoT flow meters at every hydration station. The AI monitors the gallons-per-minute (GPM) output. When it detects a severe pressure drop and calculates the station will fail within 15 minutes, it automatically dispatches the plumbing staff and dynamically removes the broken station from the attendee map, preventing thousands of people from joining a dead line.
          </p>

          <div className="bg-[#0b162c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🚰</span> Station 04 Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMonitoring}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     monitoringActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {monitoringActive ? 'Disable Telemetry' : 'Arm IoT Sensors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Pressure Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stationStatus === 'OFFLINE' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 stationStatus === 'CRITICAL' || stationStatus === 'DROPPING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 monitoringActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Pressure (PSI)</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stationStatus === 'OFFLINE' ? 'text-red-500' :
                     stationStatus === 'CRITICAL' || stationStatus === 'DROPPING' ? 'text-yellow-400' :
                     monitoringActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {monitoringActive ? pressurePSI.toFixed(1) : '---'}
                   </span>
                 </div>
               </div>

               {/* Flow Rate Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stationStatus === 'OFFLINE' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 monitoringActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Flow Rate (GPM)</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stationStatus === 'OFFLINE' ? 'text-red-500' :
                     monitoringActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {monitoringActive ? flowRateGPM.toFixed(1) : '---'}
                   </span>
                 </div>
               </div>

               {/* Tank Level */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 monitoringActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Tank Reserve</span>
                 <div className="w-full h-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
                    <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300" style={{ width: `${monitoringActive ? tankLevel : 0}%` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono z-10 drop-shadow-md">
                      {monitoringActive ? `${tankLevel.toFixed(1)}%` : 'OFF'}
                    </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040c17] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Fluid AI Log</span>
                 {stationStatus === 'OFFLINE' && <span className="text-red-500 animate-pulse">Station Unreachable</span>}
                 {stationStatus === 'DROPPING' && <span className="text-yellow-400 animate-pulse">Analyzing Drop...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' || log.type === 'CRIT' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Map Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Attendee Phone Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-2xl relative flex flex-col h-[500px] overflow-hidden font-sans mb-4 bg-slate-100 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              {/* Header */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-end pb-1 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-800">14:00</span>
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Eventra Public Map</span>
              </div>

              {/* Map Interface */}
              <div className="flex-1 relative bg-[#e2e8f0] overflow-hidden">
                <div className="absolute inset-0 bg-[#f1f5f9] z-0"></div>
                
                {/* Roads/Paths */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                  <path d="M 50 100 L 250 150 L 300 400" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
                  <path d="M 250 150 L 150 350 L 50 450" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
                </svg>
                
                {/* Normal Hydration Station 03 */}
                <div className="absolute top-[120px] left-[60px] flex flex-col items-center z-20">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs">💧</div>
                  <span className="bg-white/80 px-1 rounded text-[8px] font-bold text-slate-700 mt-1">Water 03</span>
                </div>

                {/* Normal Hydration Station 05 */}
                <div className="absolute bottom-[100px] right-[60px] flex flex-col items-center z-20">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs">💧</div>
                  <span className="bg-white/80 px-1 rounded text-[8px] font-bold text-slate-700 mt-1">Water 05</span>
                </div>

                {/* Problematic Hydration Station 04 */}
                <div className={`absolute top-[130px] right-[70px] flex flex-col items-center z-20 transition-all duration-500 ${stationStatus === 'OFFLINE' ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}>
                  {stationStatus === 'DROPPING' && (
                    <div className="absolute inset-0 w-12 h-12 -ml-2 -mt-2 border-2 border-yellow-500 rounded-full animate-ping opacity-50 z-0"></div>
                  )}
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs z-10 ${
                    stationStatus === 'CRITICAL' || stationStatus === 'DROPPING' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {stationStatus === 'CRITICAL' || stationStatus === 'DROPPING' ? '⚠️' : '💧'}
                  </div>
                  <span className="bg-white/80 px-1 rounded text-[8px] font-bold text-slate-700 mt-1">Water 04</span>
                </div>

                {/* Push Notification Overlay */}
                {stationStatus === 'OFFLINE' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-3 rounded-2xl shadow-xl z-30 flex items-center space-x-3 w-[85%] border border-slate-200 animate-fade-in-up">
                    <div className="text-xl">🛠️</div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Station Offline</h4>
                      <p className="text-[9px] text-slate-500 leading-tight">Water 04 is currently closed for maintenance. Please route to Water 03 or 05.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulatePressureDrop}
                disabled={!monitoringActive || stationStatus !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !monitoringActive || stationStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-yellow-900/40 border-yellow-800 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Simulate Pressure Drop
              </button>
              
              <button 
                onClick={resetStation}
                disabled={!monitoringActive || stationStatus === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !monitoringActive || stationStatus === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-cyan-900/40 border-cyan-800 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Plumbing Fixed (Reset)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WaterStationPressureMonitor;
