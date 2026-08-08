import React, { useState, useEffect } from 'react';

const PredictiveRestroomDispatch = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const THRESHOLD = 500;
  
  // Facilities State
  const [restrooms, setRestrooms] = useState([
    { id: 'RR-North', name: 'North Hall Restrooms', count: 142, status: 'clean', dispatched: false },
    { id: 'RR-South', name: 'South Concourse Restrooms', count: 488, status: 'clean', dispatched: false },
    { id: 'RR-VIP', name: 'VIP Lounge Facilities', count: 86, status: 'clean', dispatched: false },
  ]);

  // Dispatch Log
  const [dispatchLog, setDispatchLog] = useState([
    { time: '14:00', msg: 'Facilities telemetry online. Monitoring photoelectric beams.' }
  ]);

  useEffect(() => {
    let interval;
    if (simulationActive) {
      interval = setInterval(() => {
        setRestrooms(prev => prev.map(rr => {
          if (rr.id === 'RR-South' && !rr.dispatched) {
            const newCount = rr.count + Math.floor(Math.random() * 5) + 1; // High traffic
            
            if (newCount >= THRESHOLD && rr.status === 'clean') {
              triggerDispatch(rr.id, newCount);
              return { ...rr, count: newCount, status: 'critical', dispatched: true };
            }
            return { ...rr, count: newCount };
          }
          return rr; // Keep others static for demo clarity
        }));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [simulationActive]);

  const triggerDispatch = (id, count) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setDispatchLog(prev => [
      { time: timeStr, msg: `ALERT: ${id} exceeded threshold (${count}/${THRESHOLD}).` },
      { time: timeStr, msg: `Algorithmic Dispatch: Routing Janitorial Team Alpha (Distance: 120ft).` },
      ...prev
    ].slice(0, 5));
    
    // Simulate cleanup completion
    setTimeout(() => {
      const finishTime = new Date();
      const finishStr = `${finishTime.getHours().toString().padStart(2, '0')}:${finishTime.getMinutes().toString().padStart(2, '0')}`;
      
      setDispatchLog(prev => [
        { time: finishStr, msg: `RESOLVED: ${id} sanitization complete. Counter reset.` },
        ...prev
      ].slice(0, 5));
      
      setRestrooms(prev => prev.map(rr => 
        rr.id === id ? { ...rr, count: 0, status: 'clean', dispatched: false } : rr
      ));
      
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚽</span> Facilities Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Predictive Restroom <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Maintenance Dispatch</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Restrooms at mega-events become biohazards because janitorial staff clean them on a rigid hourly schedule, regardless of actual usage volume. Eventra integrates with simple photoelectric beam sensors at all restroom entrances to count exact foot traffic. When a specific facility exceeds {THRESHOLD} uses, the system bypasses the static schedule and algorithmically dispatches the closest janitorial team for immediate sanitization.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">📊</span> Photoelectric Sensor Array
               </h3>
               
               <button 
                 onClick={() => setSimulationActive(!simulationActive)}
                 className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition shadow-sm flex items-center ${
                   simulationActive ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 hover:bg-teal-500 text-white'
                 }`}
               >
                 {simulationActive && <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>}
                 {simulationActive ? 'Monitoring Traffic...' : 'Simulate Traffic Spike'}
               </button>
             </div>

             <div className="space-y-4 mb-6">
               {restrooms.map(rr => (
                 <div key={rr.id} className={`p-4 rounded-xl border relative overflow-hidden transition-colors duration-500 ${
                   rr.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                 }`}>
                   {rr.status === 'critical' && (
                     <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg z-10 animate-pulse">
                       BIOHAZARD THRESHOLD REACHED
                     </div>
                   )}
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-slate-700 text-sm">{rr.name}</span>
                     <span className={`text-xl font-black font-mono ${rr.status === 'critical' ? 'text-red-600' : 'text-teal-600'}`}>
                       {rr.count} <span className="text-xs text-slate-400 font-sans">/ {THRESHOLD}</span>
                     </span>
                   </div>
                   
                   {/* Progress Bar */}
                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all duration-300 ${rr.status === 'critical' ? 'bg-red-500' : 'bg-teal-500'}`} 
                       style={{ width: `${Math.min(100, (rr.count / THRESHOLD) * 100)}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Automated Dispatch Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {dispatchLog.map((log, i) => (
                   <div key={i} className={`animate-fade-in-up flex items-start ${
                     log.msg.includes('ALERT') ? 'text-red-400 font-bold' :
                     log.msg.includes('RESOLVED') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                   }`}>
                     <span className="text-slate-500 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Janitorial Staff App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md mix-blend-difference">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App UI */}
            <div className="flex-1 flex flex-col pt-12 pb-6 px-4 bg-slate-900">
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-2xl mb-2 border border-slate-700">🧹</div>
                <h2 className="text-white font-black">Staff Portal</h2>
                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Team Alpha</p>
              </div>

              {restrooms.find(r => r.dispatched) ? (
                // Active Dispatch Alert
                <div className="bg-red-600 rounded-2xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.4)] text-white animate-fade-in flex flex-col h-full border border-red-500 relative overflow-hidden">
                  
                  {/* Warning stripes */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]"></div>
                  
                  <div className="flex items-center space-x-3 mb-6 mt-4">
                    <span className="text-4xl animate-bounce">🚨</span>
                    <div>
                      <h3 className="font-black text-xl leading-tight">PRIORITY DISPATCH</h3>
                      <p className="text-xs font-bold text-red-200 uppercase">Proximity: 120ft Away</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-xl p-4 mb-6">
                    <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest mb-1">Location</p>
                    <p className="font-black text-lg">South Concourse Restrooms</p>
                    
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest mb-1">Trigger Condition</p>
                      <p className="font-mono text-sm">Traffic Threshold Exceeded (>500)</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <button className="w-full bg-white text-red-600 font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm hover:bg-slate-100 transition relative overflow-hidden">
                      {/* Fake sweeping light effect */}
                      <div className="absolute inset-y-0 left-0 w-12 bg-white/50 blur-md transform -skew-x-12 animate-[sweep_2s_infinite]"></div>
                      Accept Task & Navigate
                    </button>
                    <button className="w-full bg-transparent border border-red-400 text-red-200 font-bold py-3 mt-3 rounded-xl uppercase tracking-widest text-xs hover:bg-red-700 transition">
                      Mark as Completed
                    </button>
                  </div>
                  
                </div>
              ) : (
                // Idle State
                <div className="bg-slate-800 rounded-2xl p-6 shadow-inner text-slate-300 flex flex-col items-center justify-center flex-1 border border-slate-700 animate-fade-in">
                  <span className="text-5xl opacity-20 mb-4">☕</span>
                  <h3 className="font-bold text-lg text-white">Standby Mode</h3>
                  <p className="text-center text-xs text-slate-400 mt-2">All facilities are currently below algorithmic thresholds. Take a break until dispatched.</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PredictiveRestroomDispatch;
