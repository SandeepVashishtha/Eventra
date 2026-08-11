/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SanitationPredictiveRouting = () => {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [zoneStatus, setZoneStatus] = useState('NOMINAL'); // NOMINAL, DEGRADING, CRITICAL, ROUTING
  
  // Sensor Metrics for "Zone C (Sahara Tent)"
  const [ammoniaLevel, setAmmoniaLevel] = useState(15); // ppm (parts per million)
  const [tankCapacity, setTankCapacity] = useState(40); // percentage %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:30:00', type: 'SYS', msg: 'IoT gas and laser depth sensors active across 500 units.' },
    { id: 2, time: '14:30:02', type: 'SYS', msg: 'Dynamic vehicle routing algorithm (VRP) standing by.' }
  ]);

  useEffect(() => {
    let loop;
    if (monitoringActive && zoneStatus === 'NOMINAL') {
      loop = setInterval(() => {
        setAmmoniaLevel(prev => Math.min(30, Math.max(10, prev + (Math.random() * 2 - 0.5))));
        setTankCapacity(prev => Math.min(100, Math.max(0, prev + 0.1)));
      }, 1000);
    } else if (zoneStatus === 'DEGRADING') {
      loop = setInterval(() => {
        setAmmoniaLevel(prev => Math.min(150, prev + 4));
        setTankCapacity(prev => Math.min(95, prev + 2));
        
        if (ammoniaLevel > 80 || tankCapacity > 85) {
          setZoneStatus('CRITICAL');
          addLog('CRIT', 'Zone C (Sahara Tent) toxicity / capacity critical.');
          
          setTimeout(() => {
            setZoneStatus('ROUTING');
            addLog('ACTION', 'Regenerating Pumper Truck routes. Prioritizing Zone C.');
            addLog('SYS', 'Truck 04 dispatched. ETA: 4 mins.');
          }, 1500);
        }
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [monitoringActive, zoneStatus, ammoniaLevel, tankCapacity]);

  const simulateUsageSpike = () => {
    if (monitoringActive && zoneStatus === 'NOMINAL') {
      setZoneStatus('DEGRADING');
      addLog('WARN', 'Massive influx detected at Zone C following set conclusion.');
    }
  };

  const markServiced = () => {
    setZoneStatus('NOMINAL');
    setAmmoniaLevel(5);
    setTankCapacity(2);
    addLog('SUCCESS', 'Truck 04 completed service at Zone C. Tanks pumped and deodorized.');
  };

  const toggleMonitoring = () => {
    if (!monitoringActive) {
      setMonitoringActive(true);
      addLog('SYS', 'Sanitation telemetry armed. Monitoring bio-hazards in real-time.');
    } else {
      setMonitoringActive(false);
      markServiced();
      addLog('WARN', 'Telemetry offline. Trucks reverting to blind, rigid schedules.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#110603] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚛</span> Dynamic Vehicle Routing (VRP)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Sanitation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Odor & Capacity Management</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Restrooms become biohazards rapidly in the summer heat. Currently, pumping trucks operate on a blind, rigid schedule, wasting diesel driving around while units that actually need immediate servicing overflow. Eventra solves this by installing IoT ammonia/methane gas sensors and laser distance sensors in the holding tanks of all portable restrooms. The algorithm analyzes gas concentration and fill-level in real-time, dynamically generating an optimized routing map for sanitation trucks that instantly prioritizes zones approaching critical capacity or toxic odor levels.
          </p>

          <div className="bg-[#1f0f0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">☣️</span> Zone C (Sahara) Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMonitoring}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     monitoringActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {monitoringActive ? 'Disable Telemetry' : 'Arm IoT Sensors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Gas Concentration Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 zoneStatus === 'DEGRADING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 monitoringActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Ammonia/Methane (PPM)</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? 'text-red-500' :
                     zoneStatus === 'DEGRADING' ? 'text-yellow-400' :
                     monitoringActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {monitoringActive ? Math.floor(ammoniaLevel) : '---'}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-1">ppm</span>
                 </div>
               </div>

               {/* Laser Capacity Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 zoneStatus === 'DEGRADING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 monitoringActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Laser Depth Capacity</span>
                 <div className="w-full h-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative">
                    <div className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                      tankCapacity > 85 ? 'bg-red-500' : tankCapacity > 60 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`} style={{ width: `${monitoringActive ? tankCapacity : 0}%` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono z-10 drop-shadow-md text-white">
                      {monitoringActive ? `${Math.floor(tankCapacity)}%` : 'OFF'}
                    </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#0f0704] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Sanitation AI Routing Log</span>
                 {zoneStatus === 'DEGRADING' && <span className="text-yellow-400 animate-pulse">Analyzing Spikes...</span>}
                 {zoneStatus === 'ROUTING' && <span className="text-orange-400 animate-pulse">Truck Dispatched!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' || log.type === 'SYS' && log.msg.includes('Truck') ? 'text-orange-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Truck Routing Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Truck iPad Simulator */}
            <div className={`w-full rounded-[1rem] border-[10px] border-[#18181b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[360px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 h-6 px-4 flex justify-between items-center z-40 bg-[#18181b] border-b border-slate-800">
                <span className="text-[8px] font-bold text-slate-500">TRUCK 04 | PUMPER</span>
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Eventra Logistics Fleet</span>
              </div>

              <div className="flex-1 relative bg-slate-800 overflow-hidden flex flex-col">
                
                {/* Simulated Map View */}
                <div className="flex-1 relative bg-[#1e293b]">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0xdmgtMzhWMzl6IiBmaWxsPSIjMzM0MTU1IiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] opacity-30"></div>
                  
                  {/* Service Roads */}
                  <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    <path d="M 50 250 L 300 250 M 300 250 L 300 50" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Active Route Path */}
                    {zoneStatus === 'ROUTING' && (
                      <path d="M 50 250 L 300 250 L 300 50" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-dash" strokeDasharray="10,10" />
                    )}
                  </svg>

                  {/* Truck Marker */}
                  <div className={`absolute z-20 flex flex-col items-center transition-all duration-1000 ease-in-out ${
                    zoneStatus === 'ROUTING' ? 'top-[50px] right-[70px]' : 'bottom-[70px] left-[30px]'
                  }`}>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-800 text-sm">🚛</div>
                  </div>

                  {/* Zone C Restroom Bank */}
                  <div className="absolute top-[30px] right-[60px] z-20 flex flex-col items-center">
                    {zoneStatus === 'DEGRADING' && (
                      <div className="absolute inset-0 w-12 h-12 -ml-2 -mt-2 border-2 border-yellow-500 rounded-full animate-ping opacity-50 z-0"></div>
                    )}
                    {zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? (
                      <div className="absolute inset-0 w-12 h-12 -ml-2 -mt-2 border-2 border-red-500 rounded-full animate-ping opacity-50 z-0"></div>
                    ) : null}
                    
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs z-10 shadow-lg ${
                      zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? 'bg-red-500 border-2 border-white' : 
                      zoneStatus === 'DEGRADING' ? 'bg-yellow-500 border-2 border-white' : 
                      'bg-slate-700 border-2 border-slate-500'
                    }`}>
                      {zoneStatus === 'CRITICAL' || zoneStatus === 'ROUTING' ? '☣️' : '🚻'}
                    </div>
                    <span className="bg-slate-900/80 px-1 rounded text-[8px] font-bold text-slate-300 mt-1">Zone C</span>
                  </div>

                </div>

                {/* Dashboard Bottom Bar */}
                <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center px-4">
                  {zoneStatus === 'ROUTING' ? (
                    <div className="w-full bg-orange-900/30 border border-orange-500/50 rounded-lg p-3 animate-fade-in-up">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest">Priority Dispatch</h4>
                          <p className="text-[10px] text-orange-300 font-bold">Zone C (Sahara) - Toxicity Critical</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-white font-mono">4 MIN</span>
                          <span className="text-[8px] block text-slate-400">ETA</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center opacity-50">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Standby Mode</h4>
                      <p className="text-[10px] text-slate-500">Awaiting VRP assignment.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateUsageSpike}
                disabled={!monitoringActive || zoneStatus !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !monitoringActive || zoneStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Inject Mass Usage Event
              </button>
              
              <button 
                onClick={markServiced}
                disabled={zoneStatus !== 'ROUTING'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  zoneStatus !== 'ROUTING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Service Complete (Pump)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SanitationPredictiveRouting;
