/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricFatigueDetection = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Health Metrics
  const [operatorBpm, setOperatorBpm] = useState(72); 
  const [operatorHrv, setOperatorHrv] = useState(65); // Heart Rate Variability (ms)
  const [fatigueLevel, setFatigueLevel] = useState('OPTIMAL'); // OPTIMAL, WARNING, CRITICAL
  
  // System Metrics
  const [activeOperators, setActiveOperators] = useState(45);
  const [accidentsPrevented, setAccidentsPrevented] = useState(12);
  const [avgFleetHrv, setAvgFleetHrv] = useState(58);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '02:00:00', type: 'SYS', msg: 'HealthKit / Google Fit API bridges initialized.' },
    { id: 2, time: '02:00:02', type: 'SYS', msg: 'Awaiting biometric telemetry from wearable devices.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (isMonitoring) {
      loop = setInterval(() => {
          
          if (fatigueLevel === 'OPTIMAL') {
              setOperatorBpm(prev => prev + (Math.random() > 0.5 ? 1 : -1));
              setOperatorHrv(prev => Math.max(50, prev - (Math.random() * 0.5)));
          } else if (fatigueLevel === 'WARNING') {
              setOperatorBpm(prev => Math.min(110, prev + (Math.random() * 2)));
              setOperatorHrv(prev => Math.max(30, prev - (Math.random() * 1.5)));
          } else if (fatigueLevel === 'CRITICAL') {
              // Critical stress/fatigue, low HRV, high resting BPM
              setOperatorBpm(prev => Math.min(130, prev + (Math.random() * 3)));
              setOperatorHrv(prev => Math.max(15, prev - (Math.random() * 2)));
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [isMonitoring, fatigueLevel]);

  const simulateFatigue = () => {
      if (!isMonitoring) return;
      
      setFatigueLevel('WARNING');
      addLog('WARN', 'Operator #8492 (Forklift): HRV dropping. Fatigue warning issued.');
      
      setTimeout(() => {
          setFatigueLevel('CRITICAL');
          addLog('CRIT', 'Operator #8492 (Forklift): SEVERE ACUTE FATIGUE DETECTED.');
          addLog('ACTION', 'Revoking digital ignition QR code. Dispatching Safety Officer.');
          setAccidentsPrevented(prev => prev + 1);
      }, 4000);
  };

  const resetVitals = () => {
      setFatigueLevel('OPTIMAL');
      setOperatorBpm(72);
      setOperatorHrv(65);
      addLog('SUCCESS', 'Operator completed mandatory 4-hour rest period. Ignition restored.');
  };

  const toggleSystem = () => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      setFatigueLevel('OPTIMAL');
      setOperatorBpm(72);
      setOperatorHrv(65);
      addLog('SYS', 'Biometric stream connected. Monitoring 45 active machinery operators.');
    } else {
      setIsMonitoring(false);
      addLog('WARN', 'Biometric monitoring suspended. Reverting to visual supervisor checks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050103] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❤️</span> Occupational Safety Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Fatigue Detection <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-orange-500">for Machinery Operators</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Forklift drivers and riggers work grueling 18-hour shifts during festival load-in, leading to severe fatigue that causes critical accidents and dropped equipment. Visually guessing if a worker looks "too tired" is dangerous. Eventra solves this by integrating Apple Watch and Garmin Health APIs into the Staff App to continuously monitor Heart Rate Variability (HRV) and biometric stress markers. If the algorithm detects severe acute fatigue, it automatically sends an alert to the safety officer and temporarily revokes the operator's digital ignition QR code until they rest.
          </p>

          <div className="bg-[#0a0204] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🎛️</span> HealthKit API Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isMonitoring ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {isMonitoring ? 'Halt Telemetry Stream' : 'Connect Wearables API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Operator HRV */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fatigueLevel === 'CRITICAL' ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' : 
                 fatigueLevel === 'WARNING' ? 'bg-orange-950/40 border-orange-500/50' : 
                 isMonitoring ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Operator HRV
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     fatigueLevel === 'CRITICAL' ? 'text-red-500' : 
                     fatigueLevel === 'WARNING' ? 'text-orange-400' : 
                     isMonitoring ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {operatorHrv.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Operator BPM */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isMonitoring ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Resting BPM
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isMonitoring ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {operatorBpm.toFixed(0)}
                   </span>
                 </div>
               </div>
               
               {/* Fleet HRV Avg */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isMonitoring ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fleet Avg HRV
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isMonitoring ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {avgFleetHrv}
                   </span>
                 </div>
               </div>
               
               {/* Accidents Prevented */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 accidentsPrevented > 12 ? 'bg-blue-950/40 border-blue-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Incidents Prevented
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         accidentsPrevented > 12 ? 'text-blue-400' : 'text-slate-600'
                       }`}>
                         {accidentsPrevented}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030001] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Safety Event Ledger</span>
                 {fatigueLevel === 'CRITICAL' && <span className="text-red-500 font-black animate-pulse">CRITICAL FATIGUE DETECTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' : 'text-slate-400'
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
            
            {/* Wearable / App UI Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 bg-slate-100`}>
              
              <div className="pt-10 pb-4 px-6 bg-white border-b border-slate-200 flex justify-between items-center z-20">
                  <span className="text-sm font-black tracking-widest text-slate-800 uppercase">Operator #8492</span>
                  <div className="px-2 py-1 bg-slate-200 rounded text-[8px] font-bold text-slate-500">FORKLIFT C-3</div>
              </div>

              <div className="flex-1 flex flex-col p-6 relative z-10 overflow-y-auto">
                  
                  {!isMonitoring ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                         <span className="text-4xl opacity-50 mb-4">⌚</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect Apple Watch to Start Shift</span>
                     </div>
                  ) : (
                    <div className="flex flex-col h-full animate-fade-in-up">
                        
                        {/* Biometric Status */}
                        <div className={`rounded-2xl p-4 mb-6 shadow-sm border ${
                            fatigueLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                            fatigueLevel === 'WARNING' ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                    fatigueLevel === 'CRITICAL' ? 'text-red-500' :
                                    fatigueLevel === 'WARNING' ? 'text-orange-500' : 'text-emerald-500'
                                }`}>Biometric Status</span>
                                
                                {fatigueLevel === 'OPTIMAL' ? (
                                    <span className="text-emerald-500 text-lg">✅</span>
                                ) : fatigueLevel === 'WARNING' ? (
                                    <span className="text-orange-500 text-lg">⚠️</span>
                                ) : (
                                    <span className="text-red-500 text-lg animate-pulse">🚨</span>
                                )}
                            </div>
                            
                            <div className="flex justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">HRV (Stress)</span>
                                    <span className={`text-2xl font-black font-mono leading-none ${
                                        fatigueLevel === 'CRITICAL' ? 'text-red-600' : 'text-slate-700'
                                    }`}>{operatorHrv.toFixed(0)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Heart Rate</span>
                                    <span className={`text-2xl font-black font-mono leading-none ${
                                        fatigueLevel === 'CRITICAL' ? 'text-red-600' : 'text-slate-700'
                                    }`}>{operatorBpm.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Ignition Lock */}
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                            
                            {fatigueLevel === 'CRITICAL' && (
                                <div className="absolute inset-0 bg-red-600/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 text-white animate-fade-in-up">
                                    <span className="text-5xl mb-4">🛑</span>
                                    <span className="text-xl font-black uppercase tracking-widest mb-2">IGNITION LOCKED</span>
                                    <span className="text-[10px] opacity-90 font-bold mb-6">SEVERE FATIGUE DETECTED. YOU MUST REST BEFORE OPERATING HEAVY MACHINERY.</span>
                                    
                                    <button 
                                        onClick={resetVitals}
                                        className="px-6 py-2 bg-white text-red-600 font-black text-xs uppercase tracking-widest rounded shadow-lg"
                                    >
                                        Override (Simulate Rest)
                                    </button>
                                </div>
                            )}

                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Scan at Forklift Terminal</span>
                            
                            {/* Fake QR Code */}
                            <div className={`w-40 h-40 border-4 p-2 bg-white ${fatigueLevel === 'CRITICAL' ? 'border-red-500' : 'border-slate-800'}`}>
                                <div className="w-full h-full bg-slate-100 flex flex-wrap" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b), repeating-linear-gradient(45deg, #1e293b 25%, #f1f5f9 25%, #f1f5f9 75%, #1e293b 75%, #1e293b)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                            </div>

                        </div>

                    </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0a0204] p-4 rounded-xl border border-slate-800">
               
               <button 
                   onClick={simulateFatigue}
                   disabled={!isMonitoring || fatigueLevel !== 'OPTIMAL'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !isMonitoring || fatigueLevel !== 'OPTIMAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                   }`}
                 >
                   Inject Fatigue (Drop HRV)
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiometricFatigueDetection;
