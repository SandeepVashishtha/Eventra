/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicSurgeShuttles = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [exodusState, setExodusState] = useState('IDLE'); // IDLE, EARLY_DEPARTURE, PEAK_EXODUS
  
  // Fleet Pricing Metrics
  const [crowdDensity, setCrowdDensity] = useState(10); // % of total capacity heading to exits
  const [shuttlePrice, setShuttlePrice] = useState(15.00); // USD
  const [waitTime, setWaitTime] = useState(5); // Minutes
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Autonomous EV Fleet Controller Online.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'Computer vision tracking exit path telemetry.' }
  ]);

  // Visualizer State
  const [demandCurve, setDemandCurve] = useState(Array(20).fill(10));
  const [shuttles, setShuttles] = useState([
      { id: 1, pos: 10, loading: false },
      { id: 2, pos: 40, loading: false },
      { id: 3, pos: 70, loading: false },
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          // Update demand curve based on state
          setDemandCurve(prev => {
              const newCurve = [...prev.slice(1)];
              
              let currentDemand = crowdDensity;
              // Add slight noise
              currentDemand += (Math.random() - 0.5) * 5;
              newCurve.push(Math.max(5, Math.min(100, currentDemand)));
              
              return newCurve;
          });

          // Dynamic Pricing Algo
          if (exodusState === 'EARLY_DEPARTURE') {
              setShuttlePrice(prev => Math.max(0.00, prev - 0.5)); // Drop to free
              setWaitTime(prev => Math.max(0, prev - 1));
          } else if (exodusState === 'PEAK_EXODUS') {
              setShuttlePrice(prev => Math.min(85.00, prev + 2.5)); // Surge up
              setWaitTime(prev => Math.min(120, prev + 5)); // Long wait
          } else {
              setShuttlePrice(prev => {
                  const target = 15.00;
                  return prev + (target - prev) * 0.1;
              });
              setWaitTime(5);
          }

          // Move shuttles in a loop
          setShuttles(prev => prev.map(s => {
              if (s.loading) {
                  return { ...s }; // Stopped
              }
              
              let newPos = s.pos + (exodusState === 'PEAK_EXODUS' ? 0.5 : 1.5); // Slower traffic at peak
              
              if (newPos > 100) {
                  newPos = 0; // Loop around
              }
              
              return { ...s, pos: newPos };
          }));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, exodusState, crowdDensity]);

  const triggerEvent = (scenario) => {
    if (!systemActive) return;
    
    setExodusState(scenario);
    
    if (scenario === 'EARLY_DEPARTURE') {
        setCrowdDensity(15);
        addLog('ACTION', 'Time: 00:00 (1 Hr Before Close). Low exit density detected.');
        addLog('SUCCESS', 'Dynamic Pricing: Dropping fare to $0.00 to incentivize early departures.');
        
        // Make shuttles load quickly
        setShuttles(prev => prev.map((s, i) => {
            setTimeout(() => {
                setShuttles(curr => curr.map(cs => cs.id === s.id ? { ...cs, loading: true } : cs));
                setTimeout(() => {
                    setShuttles(curr => curr.map(cs => cs.id === s.id ? { ...cs, loading: false } : cs));
                }, 1000); // Quick load
            }, i * 500);
            return s;
        }));
        
    } else if (scenario === 'PEAK_EXODUS') {
        setCrowdDensity(95);
        addLog('CRIT', 'Time: 01:00 (Festival Close). MASS EXODUS DETECTED. 50k pax moving to exits.');
        addLog('WARN', 'Dynamic Pricing: Surging fare to $85.00 to stagger demand curve.');
        
        // Traffic jam shuttles
        setShuttles(prev => prev.map(s => ({ ...s, loading: true })));
        setTimeout(() => {
            if (systemActive) setShuttles(prev => prev.map(s => ({ ...s, loading: false })));
        }, 4000); // Long wait
        
    } else if (scenario === 'IDLE') {
        setCrowdDensity(10);
        addLog('SYS', 'Crowd density nominal. Base fare restored.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setExodusState('IDLE');
      setCrowdDensity(10);
      setShuttlePrice(15.00);
      setWaitTime(5);
      setDemandCurve(Array(20).fill(10));
      addLog('SYS', 'Dynamic Surge Pricing Algorithm Active.');
    } else {
      setSystemActive(false);
      setExodusState('IDLE');
      setDemandCurve(Array(20).fill(10));
      addLog('WARN', 'Pricing Algorithm Offline. Flat rate applies. Expect massive queues.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070502] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚌</span> Autonomous Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Surge Pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">Fleet Management</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At the end of the night, 50,000 people rush the shuttle lines simultaneously, creating dangerous crushes and multi-hour wait times. Eventra solves this by managing a fleet of autonomous EV shuttles using a dynamic surge pricing model. Using computer vision to track the density of the crowd heading for the exits, Eventra dynamically drops the shuttle price to $0 to incentivize people to leave an hour early. At peak exodus, it surges the price to stagger the demand curve, allowing attendees to lock in a later departure time while they hang back and avoid the crush.
          </p>

          <div className="bg-[#120a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Market Demand Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Pricing Algo' : 'Activate Dynamic Fares'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Live Shuttle Fare */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 exodusState === 'PEAK_EXODUS' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 exodusState === 'EARLY_DEPARTURE' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Live EV Fare
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     shuttlePrice > 40 ? 'text-red-500' : 
                     shuttlePrice === 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {shuttlePrice.toFixed(2)}
                   </span>
                 </div>
               </div>

               {/* Exit Crowd Density */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdDensity > 80 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Exit Density CV
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdDensity > 80 ? 'text-orange-500' : 'text-slate-600'
                   }`}>
                     {Math.floor(crowdDensity)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Queue Wait Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 waitTime > 60 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Queue ETA
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     waitTime > 60 ? 'text-red-500' : 'text-slate-600'
                   }`}>
                     {waitTime}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">min</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Pricing Engine</span>
                 {exodusState === 'EARLY_DEPARTURE' && <span className="text-emerald-400 font-black animate-pulse">SUBSIDIZING EARLY EXITS (FREE)</span>}
                 {exodusState === 'PEAK_EXODUS' && <span className="text-red-500 font-black animate-pulse">SURGING TO STAGGER DEMAND</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* Surge Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#120a05]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">MARKET DEMAND CURVE</span>
                <span className="text-[8px] font-mono text-slate-400">CV DENSITY</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-6 px-4">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between">
                      
                      {/* Demand Graph Area */}
                      <div className="h-1/2 w-full border-b border-slate-700/50 relative flex items-end">
                          
                          {/* Graph bars */}
                          <div className="absolute inset-0 flex items-end justify-between px-2 gap-1 pb-1">
                              {demandCurve.map((val, i) => {
                                  let colorClass = 'bg-blue-500/50';
                                  if (val > 80) colorClass = 'bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                                  else if (val > 50) colorClass = 'bg-orange-500/60';
                                  
                                  return (
                                      <div 
                                          key={i} 
                                          className={`w-full rounded-t-sm transition-all duration-300 ${colorClass}`}
                                          style={{ height: `${val}%` }}
                                      ></div>
                                  );
                              })}
                          </div>
                          
                          {/* Y-Axis Labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-1 px-1 opacity-50">
                              <span className="text-[8px] font-mono text-white">MAX</span>
                              <span className="text-[8px] font-mono text-white">MIN</span>
                          </div>
                      </div>

                      {/* Fleet Operations Map */}
                      <div className="h-1/2 w-full relative overflow-hidden flex flex-col justify-center">
                          
                          {/* Road */}
                          <div className="w-full h-12 bg-slate-800 border-y-2 border-slate-700 relative">
                              {/* Dotted center line */}
                              <div className="absolute top-1/2 -translate-y-1/2 w-full h-0 border-t-2 border-dashed border-white/20"></div>
                              
                              {/* Shuttle Stop Zone */}
                              <div className="absolute right-4 top-0 h-full w-16 bg-blue-500/20 border-x border-blue-500/50 flex flex-col items-center justify-center">
                                  <span className="text-[8px] font-black uppercase text-blue-400">Loading</span>
                              </div>

                              {/* EV Shuttles */}
                              {shuttles.map(s => (
                                  <div 
                                      key={s.id}
                                      className={`absolute top-1/2 -translate-y-1/2 w-8 h-4 rounded-sm flex items-center justify-center transition-all duration-300 ${
                                          s.loading ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'bg-slate-300'
                                      }`}
                                      style={{ left: `${s.pos}%` }}
                                  >
                                      {/* Windows */}
                                      <div className="absolute left-1 right-2 h-2 bg-slate-900 rounded-sm"></div>
                                      {/* Headlights */}
                                      <div className="absolute right-0 top-0.5 w-1 h-1 bg-yellow-200 shadow-[2px_0_5px_rgba(253,224,71,0.8)]"></div>
                                      <div className="absolute right-0 bottom-0.5 w-1 h-1 bg-yellow-200 shadow-[2px_0_5px_rgba(253,224,71,0.8)]"></div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* Crowd Indicators */}
                          <div className="mt-4 flex justify-end pr-4">
                              <span className="text-[8px] font-black uppercase text-slate-500 flex items-center">
                                  Exodus Queue: 
                                  <span className={`ml-2 px-2 py-0.5 rounded ${
                                      exodusState === 'PEAK_EXODUS' ? 'bg-red-500 text-white animate-pulse' :
                                      exodusState === 'EARLY_DEPARTURE' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                                  }`}>
                                      {Math.floor(crowdDensity)}% Full
                                  </span>
                              </span>
                          </div>

                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#120a05] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Timeline</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerEvent('EARLY_DEPARTURE')}
                   disabled={!systemActive || exodusState === 'EARLY_DEPARTURE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || exodusState === 'EARLY_DEPARTURE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   🕛 1 Hr Before Close<br/>(Incentivize Early)
                 </button>

                 <button 
                   onClick={() => triggerEvent('PEAK_EXODUS')}
                   disabled={!systemActive || exodusState === 'PEAK_EXODUS'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || exodusState === 'PEAK_EXODUS' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   🕐 2:00 AM<br/>(Mass Exodus Peak)
                 </button>
               </div>
               
               <button 
                 onClick={() => triggerEvent('IDLE')}
                 disabled={!systemActive || exodusState === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                   !systemActive || exodusState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Reset to Nominal Base Fare
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicSurgeShuttles;
