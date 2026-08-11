/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HeatstrokeTriageSystem = () => {
  const [monitoringActive, setMonitoringActive] = useState(false);
  
  // Biometric & Weather Telemetry
  const [ambientTemp, setAmbientTemp] = useState(96); // Fahrenheit
  const [humidity, setHumidity] = useState(65); // Percent
  const [heatIndex, setHeatIndex] = useState(108); // Calculated
  
  const [sectors, setSectors] = useState([
    { id: 'Sector A', name: 'Main Stage Mosh Pit', avgHR: 110, avgTemp: 98.6, riskScore: 12, status: 'Normal' },
    { id: 'Sector B', name: 'VIP Shaded Lounge', avgHR: 75, avgTemp: 98.2, riskScore: 2, status: 'Normal' },
    { id: 'Sector C', name: 'Food Truck Line', avgHR: 95, avgTemp: 98.8, riskScore: 25, status: 'Elevated' }
  ]);

  const [medicalLog, setMedicalLog] = useState([
    { time: '14:00', type: 'SYS', msg: 'Biometric API Bridge established. 8,421 consenting users connected.' }
  ]);

  useEffect(() => {
    let loop;
    if (monitoringActive) {
      loop = setInterval(() => {
        // Temperature rises slowly
        setAmbientTemp(prev => prev + 0.1);
        
        setSectors(prev => {
          let breachFound = false;
          
          const updated = prev.map(s => {
            if (s.id === 'Sector A') {
              // Rapidly increasing heart rate and temp in the mosh pit
              const newHR = s.avgHR + (Math.random() * 4);
              const newTemp = s.avgTemp + 0.05;
              const newRisk = (newHR / 120) * 50 + (newTemp > 99.5 ? 50 : 0);
              
              let newStatus = s.status;
              if (newRisk > 85 && s.status !== 'CRITICAL') {
                newStatus = 'CRITICAL';
                breachFound = true;
              } else if (newRisk > 50 && s.status === 'Normal') {
                newStatus = 'Warning';
              }
              
              return { ...s, avgHR: newHR, avgTemp: newTemp, riskScore: newRisk, status: newStatus };
            }
            return s; // Keep others static for demo
          });
          
          if (breachFound) {
            triggerDispatch();
          }
          
          return updated;
        });
      }, 1000);
    }
    
    return () => clearInterval(loop);
  }, [monitoringActive]);

  const triggerDispatch = () => {
    addLog('CRIT', 'Hyperthermia probability > 85% in Sector A (Main Stage Mosh Pit).');
    
    setTimeout(() => {
      addLog('DISP', 'Auto-dispatching Med-Team 4 with hydration packs to Sector A.');
    }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setMedicalLog(prev => [{ time: timeString, type, msg }, ...prev].slice(0, 6));
  };

  const toggleSim = () => {
    if (!monitoringActive) {
      addLog('SYS', 'Initiating live biometric aggregation (Anonymized).');
      setMonitoringActive(true);
    } else {
      addLog('SYS', 'Monitoring paused.');
      setMonitoringActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Medical Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚕️</span> Biometric Triage API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Automated Heatstroke <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">Risk Triage System</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            At summer festivals, medical tents get overwhelmed by heatstroke victims because organizers don't know who is at risk until they collapse. Eventra integrates with Apple Health & Google Fit APIs of consenting attendees. The algorithm monitors ambient temperature against aggregate heart rate and body temperature. If hyperthermia probability spikes, it auto-dispatches medics with water to that exact GPS coordinate before anyone passes out.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[460px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🌡️</span> Triage Dashboard
               </h3>
               
               <button 
                 onClick={toggleSim}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm flex items-center ${
                   monitoringActive ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                 }`}
               >
                 {monitoringActive && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 animate-pulse"></span>}
                 {monitoringActive ? 'Monitoring Active' : 'Start Heatwave Sim'}
               </button>
             </div>

             {/* Environment Data */}
             <div className="flex space-x-6 mb-6">
               <div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Ambient Temp</span>
                 <span className="text-2xl font-black font-mono text-slate-800">{ambientTemp.toFixed(1)}°F</span>
               </div>
               <div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Humidity</span>
                 <span className="text-2xl font-black font-mono text-slate-800">{humidity}%</span>
               </div>
               <div className="pl-6 border-l border-slate-200">
                 <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest block mb-1">Heat Index (Feels Like)</span>
                 <span className="text-2xl font-black font-mono text-rose-600">{heatIndex.toFixed(1)}°F</span>
               </div>
             </div>

             {/* Sector Analysis */}
             <div className="space-y-3 mb-6">
               {sectors.map((sector, i) => (
                 <div key={i} className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                   sector.status === 'CRITICAL' ? 'bg-rose-50 border-rose-300 scale-[1.02] shadow-md' : 
                   sector.status === 'Warning' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                 }`}>
                   {/* Risk Bar */}
                   <div className="absolute left-0 inset-y-0 w-1 bg-slate-200">
                     <div className={`h-full transition-all duration-500 ${
                       sector.status === 'CRITICAL' ? 'bg-rose-500' : sector.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                     }`} style={{ height: `${Math.min(100, sector.riskScore)}%` }}></div>
                   </div>
                   
                   <div className="pl-4 flex justify-between items-center">
                     <div>
                       <h4 className="font-bold text-slate-800 text-sm">{sector.name}</h4>
                       <div className="flex space-x-4 mt-1 text-[10px] font-mono text-slate-500">
                         <span>Avg HR: <strong className={sector.avgHR > 120 ? 'text-rose-500' : ''}>{sector.avgHR.toFixed(0)} bpm</strong></span>
                         <span>Avg Temp: <strong className={sector.avgTemp > 99.5 ? 'text-rose-500' : ''}>{sector.avgTemp.toFixed(1)}°F</strong></span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                         sector.status === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
                         sector.status === 'Warning' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
                       }`}>
                         {sector.status}
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* Logs */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Medical Dispatch Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {medicalLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.type === 'CRIT' ? 'text-rose-400 font-bold' : 
                     log.type === 'DISP' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Med-Team App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20 bg-slate-900 border-b border-slate-800">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-8 pb-6 px-4 flex flex-col bg-slate-900 relative">
               
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-slate-800 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                   🚑
                 </div>
                 <h2 className="font-black text-white text-xl tracking-wide">Med-Team Portal</h2>
                 <p className="text-[10px] font-mono text-slate-500 mt-1">Unit: Alpha-4</p>
               </div>

               {sectors[0].status === 'CRITICAL' ? (
                 <div className="bg-rose-600 rounded-2xl p-6 shadow-[0_0_30px_rgba(225,29,72,0.4)] text-white animate-fade-in flex flex-col h-full border border-rose-500 relative overflow-hidden">
                   {/* Warning stripes */}
                   <div className="absolute top-0 inset-x-0 h-4 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]"></div>
                   
                   <div className="flex items-center space-x-3 mb-6 mt-4">
                     <span className="text-4xl animate-pulse">⚠️</span>
                     <div>
                       <h3 className="font-black text-xl leading-tight">PREVENTATIVE DISPATCH</h3>
                       <p className="text-[10px] font-bold text-rose-200 uppercase mt-1">Imminent Heatstroke Risk</p>
                     </div>
                   </div>
                   
                   <div className="bg-black/20 rounded-xl p-4 mb-6">
                     <p className="text-[10px] text-rose-200 font-bold uppercase tracking-widest mb-1">Target Sector</p>
                     <p className="font-black text-lg">Main Stage Mosh Pit</p>
                     
                     <div className="mt-4 pt-4 border-t border-white/20">
                       <p className="text-[10px] text-rose-200 font-bold uppercase tracking-widest mb-1">Trigger Condition</p>
                       <p className="font-mono text-xs">Aggregated HR &gt; 120bpm<br/>Aggregated Temp &gt; 99.5°F</p>
                     </div>
                   </div>
                   
                   <div className="mt-auto">
                     <button className="w-full bg-white text-rose-600 font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm hover:bg-slate-100 transition">
                       Accept & Navigate
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="bg-slate-800 rounded-2xl p-6 shadow-inner text-slate-300 flex flex-col items-center justify-center flex-1 border border-slate-700">
                   <span className="text-5xl opacity-20 mb-4">💤</span>
                   <h3 className="font-bold text-lg text-white">Standby Mode</h3>
                   <p className="text-center text-xs text-slate-400 mt-2">All sectors are within safe biometric limits. Hydrate and stand by.</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeatstrokeTriageSystem;
