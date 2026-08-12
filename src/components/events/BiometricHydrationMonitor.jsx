/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricHydrationMonitor = () => {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [heartRate, setHeartRate] = useState(115); // bpm
  const [skinTemp, setSkinTemp] = useState(98.6); // Fahrenheit
  const [dehydrated, setDehydrated] = useState(false);
  
  const [medLog, setMedLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'HIPAA-compliant WebSockets established with HealthKit/WearOS.' },
    { id: 2, time: '13:00:05', type: 'SYS', msg: 'Tracking 14,204 opted-in attendee wearables in Sector 3.' }
  ]);

  useEffect(() => {
    let loop;
    if (monitoringActive) {
      loop = setInterval(() => {
        if (!dehydrated) {
          // Standard dancing vitals
          setHeartRate(prev => Math.max(90, Math.min(140, prev + (Math.random() * 10 - 5))));
          setSkinTemp(prev => Math.max(98.0, Math.min(100.5, prev + (Math.random() * 0.4 - 0.2))));
        } else {
          // Dangerous biometric state
          setHeartRate(prev => Math.min(185, prev + (Math.random() * 8 + 2)));
          setSkinTemp(prev => Math.min(104.5, prev + (Math.random() * 0.5 + 0.1)));
        }
      }, 1000);
    }
    return () => clearInterval(loop);
  }, [monitoringActive, dehydrated]);

  const simulateDehydration = () => {
    if (monitoringActive && !dehydrated) {
      setDehydrated(true);
      
      addLog('WARN', 'BIOMETRIC ANOMALY: User ID #9921 showing severe HRV decay and hyperthermia.');
      
      setTimeout(() => {
        addLog('ACTION', 'Pushing push notification to User #9921: "Immediate Hydration Required. 150ft to Water Station C."');
        
        setTimeout(() => {
          addLog('CRIT', 'User #9921 heart rate exceeded 170bpm threshold. Dispatching Roaming Med Team to their GPS coordinate.');
        }, 3000);
      }, 1500);
    }
  };

  const resolveIncident = () => {
    setDehydrated(false);
    setHeartRate(105);
    setSkinTemp(98.6);
    addLog('SUCCESS', 'Med Team intercepted User #9921. IV fluids administered. Returning to baseline.');
  };

  const toggleMonitoring = () => {
    if (!monitoringActive) {
      setMonitoringActive(true);
      setDehydrated(false);
      setHeartRate(115);
      setSkinTemp(98.6);
      addLog('SYS', 'Active Biometric Telemetry engaged. Analyzing crowd health vectors.');
    } else {
      setMonitoringActive(false);
      setDehydrated(false);
      addLog('SYS', 'Telemetry stream paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setMedLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Med Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚕️</span> Proactive Medical Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Hydration <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Wearable Monitoring</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Dehydration is the #1 cause of medical emergencies at outdoor summer festivals, but EMTs have no proactive way to find dehydrated attendees before they pass out. Eventra integrates with Apple Watch/WearOS APIs to monitor opt-in attendees' heart rate variability and skin temperature. If severe biometric markers of dehydration are detected, the app automatically pushes an alert urging them to a specific nearby water station, and immediately flags their real-time GPS coordinate to roaming medical staff for an intervention.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🫀</span> HealthKit API Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 {dehydrated ? (
                   <button 
                     onClick={resolveIncident}
                     className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-emerald-900/40 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900/60"
                   >
                     Mark Medically Resolved
                   </button>
                 ) : (
                   <>
                     <button 
                       onClick={toggleMonitoring}
                       className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-700 ${
                         monitoringActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500'
                       }`}
                     >
                       {monitoringActive ? 'Pause Stream' : 'Initialize Wearables'}
                     </button>
                     <button 
                       onClick={simulateDehydration}
                       disabled={!monitoringActive}
                       className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                         !monitoringActive ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed' :
                         'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                       }`}
                     >
                       Simulate Collapse Risk
                     </button>
                   </>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Heart Rate Display */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 heartRate > 160 ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Aggregate HRV / BPM</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     heartRate > 160 ? 'text-red-500' : 'text-white'
                   }`}>
                     {heartRate.toFixed(0)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">bpm</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   {heartRate > 160 ? (
                     <><span className="text-red-500 mr-1 animate-ping">❤️</span> Tachycardia Detected</>
                   ) : monitoringActive ? (
                     <><span className="text-emerald-500 mr-1">❤️</span> Normal Sinus Rhythm</>
                   ) : (
                     <><span className="text-slate-600 mr-1">❤️</span> Sensors Idle</>
                   )}
                 </div>
               </div>

               {/* Skin Temp */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 skinTemp > 102 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Surface Skin Temp</span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className={`text-4xl font-black font-mono leading-none ${
                       skinTemp > 102 ? 'text-orange-500' : 'text-white'
                     }`}>
                       {skinTemp.toFixed(1)}°
                     </span>
                     <span className="text-sm font-bold text-slate-600 ml-2 pb-1">F</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-3">
                     <div 
                       className={`h-full transition-all duration-300 ${skinTemp > 102 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                       style={{ width: `${((skinTemp - 90) / 20) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Medical Dispatch Log</span>
                 {monitoringActive && !dehydrated && <span className="text-emerald-400 animate-pulse">Scanning...</span>}
                 {dehydrated && <span className="text-red-500 animate-pulse">EMERGENCY PROTOCOL</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {medLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'WARN' ? 'text-orange-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App / Smartwatch Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[300px] flex flex-col items-center">
            
            {/* Phone Screen Mockup */}
            <div className="w-full bg-slate-50 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl relative flex flex-col h-[500px] overflow-hidden font-sans mb-8">
              
              <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
                <span className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                  Eventra Attendee App
                </span>
              </div>

              <div className="flex-1 relative flex flex-col bg-slate-100 overflow-hidden pt-16 p-5 justify-center">
                
                {!dehydrated ? (
                  <div className="text-center opacity-40">
                    <span className="text-5xl block mb-4">🎶</span>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">Enjoy the Show</h2>
                    <p className="text-xs font-bold text-slate-500">HealthKit syncing quietly in background.</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-fast text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500 opacity-10"></div>
                    <span className="text-4xl block mb-2 relative z-10">💧</span>
                    <h2 className="text-xl font-black text-red-600 uppercase tracking-widest mb-2 relative z-10">Hydration Warning</h2>
                    <p className="text-sm font-bold text-red-800 mb-4 relative z-10">Your biometric data indicates severe dehydration risk.</p>
                    
                    <button className="w-full bg-red-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-md relative z-10 border border-red-400">
                      Route to Water Station C
                    </button>
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-3 relative z-10">Medical staff notified of your location.</p>
                  </div>
                )}

              </div>
            </div>

            {/* Smartwatch Mockup */}
            <div className="w-40 h-48 bg-slate-900 rounded-[2rem] border-[6px] border-slate-700 shadow-2xl relative flex flex-col overflow-hidden font-sans">
              
              <div className="absolute right-[-6px] top-10 w-2 h-8 bg-slate-600 rounded-l"></div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-3 bg-black">
                {monitoringActive ? (
                  <>
                    <span className={`text-2xl mb-1 ${dehydrated ? 'text-red-500 animate-ping' : 'text-emerald-500'}`}>❤️</span>
                    <span className={`text-3xl font-black font-mono leading-none ${dehydrated ? 'text-red-500' : 'text-white'}`}>
                      {heartRate.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">BPM</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Opted Out of Health Data</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
};

export default BiometricHydrationMonitor;
