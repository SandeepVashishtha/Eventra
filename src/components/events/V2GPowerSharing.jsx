/* eslint-disable */
import React, { useState, useEffect } from 'react';

const V2GPowerSharing = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [gridState, setGridState] = useState('IDLE'); // IDLE, PEAK_LOAD
  
  // Microgrid & Web3 Metrics
  const [activeEVs, setActiveEVs] = useState(0); 
  const [stageLoad, setStageLoad] = useState(2.4); // MW (Megawatts)
  const [v2gDischarge, setV2gDischarge] = useState(0); // MW supplied by cars
  const [smartContractPayouts, setSmartContractPayouts] = useState(0.000); // ETH
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Parking Lot V2G Smart Grid Initialized.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Awaiting Web3 Wallet opt-in from EV owners.' }
  ]);

  // Visualizer State
  const [evList, setEvList] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (gridState === 'IDLE') {
              // Standard festival load
              setStageLoad(2.4 + (Math.random() * 0.3));
              setV2gDischarge(0); // Not pulling from cars
              
              // Cars slowly charge/idle
              setEvList(prev => prev.map(car => ({
                  ...car,
                  battery: Math.min(100, car.battery + 0.1),
                  status: 'IDLE'
              })));
              
          } else if (gridState === 'PEAK_LOAD') {
              // Massive bass drop / laser show
              const peakLoad = 8.5 + (Math.random() * 1.5);
              setStageLoad(peakLoad);
              
              // Pull missing power from EVs (V2G)
              const deficit = peakLoad - 3.0; // Assume 3.0MW base generator capacity
              setV2gDischarge(deficit > 0 ? deficit : 0);
              
              // Discharge cars and payout crypto
              let ethPayout = 0;
              setEvList(prev => prev.map(car => {
                  if (car.optIn && car.battery > 20) {
                      ethPayout += 0.001; // Tiny fraction per tick per car
                      return {
                          ...car,
                          battery: Math.max(20, car.battery - 0.8), // Drain battery quickly for demo
                          status: 'DISCHARGING'
                      };
                  }
                  return car;
              }));
              
              setSmartContractPayouts(prev => prev + ethPayout);
          }

      }, 300); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, gridState]);

  const triggerPeakLoad = () => {
    if (!systemActive || gridState === 'PEAK_LOAD') return;
    
    setGridState('PEAK_LOAD');
    addLog('CRIT', 'HEADLINER SET: Massive transient power spike detected (Lasers + Subwoofers).');
    addLog('ACTION', 'Grid Deficit! Executing V2G Smart Contracts...');
    addLog('SUCCESS', 'Micro-discharging 450 connected EVs. Rewarding wallets in ETH.');
    
    setTimeout(() => {
        if (systemActive) {
            setGridState('IDLE');
            addLog('SYS', 'Peak load subsided. Terminating V2G discharge. Smart Contracts settled.');
        }
    }, 5000);
  };

  const simulateEvArrivals = () => {
      // Generate some fake cars in the parking lot
      const cars = Array.from({length: 12}).map((_, i) => ({
          id: i,
          optIn: Math.random() > 0.2, // 80% opt-in rate
          battery: 50 + Math.random() * 40,
          status: 'IDLE'
      }));
      setEvList(cars);
      setActiveEVs(450); // Fake multiplier for metrics
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setGridState('IDLE');
      setStageLoad(2.4);
      setV2gDischarge(0);
      setSmartContractPayouts(0);
      simulateEvArrivals();
      addLog('SYS', 'Microgrid Controller Online. EV Chargers active.');
    } else {
      setSystemActive(false);
      setGridState('IDLE');
      setStageLoad(0);
      setV2gDischarge(0);
      setActiveEVs(0);
      setEvList([]);
      addLog('WARN', 'V2G Network Offline. Reverting to highly polluting Diesel Generators.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Microgrid Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized V2G <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">Power Sharing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Large music festivals consume massive amounts of electricity, typically relying on loud, highly polluting diesel generators to handle peak loads. Eventra solves this by connecting to the EV charging infrastructure in the parking lot. Attendees who drive EVs can opt into a smart contract that micro-discharges their car's battery during peak power loads (e.g., a massive headliner bass drop) in exchange for automated cryptocurrency payouts, turning the parking lot into a massive decentralized battery bank.
          </p>

          <div className="bg-[#050a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🔋</span> V2G IoT Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Sever Grid Connection' : 'Sync EV Chargers to Grid'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Stage Load */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridState === 'PEAK_LOAD' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Main Stage Load
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     gridState === 'PEAK_LOAD' ? 'text-red-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {stageLoad.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">MW</span>
                 </div>
               </div>

               {/* V2G Supplied */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridState === 'PEAK_LOAD' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   V2G Discharge
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gridState === 'PEAK_LOAD' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {v2gDischarge.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">MW</span>
                 </div>
               </div>
               
               {/* Crypto Payout */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 smartContractPayouts > 0 ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Attendee Payouts
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     smartContractPayouts > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {smartContractPayouts.toFixed(3)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ETH</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Smart Contract Ledger</span>
                 {gridState === 'PEAK_LOAD' && <span className="text-blue-400 font-black animate-pulse">V2G DISCHARGING...</span>}
                 {gridState === 'IDLE' && systemActive && <span className="text-slate-500">GRID STABLE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
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
            
            {/* V2G Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#02050a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">MICROGRID TOPOLOGY</span>
                <span className="text-[8px] font-mono text-slate-400">V2G NETWORK</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-12">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">INFRASTRUCTURE UNLINKED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between">
                      
                      {/* Main Stage (Power Sink) */}
                      <div className="w-full bg-[#050a12] border-2 border-slate-800 rounded-lg p-4 relative overflow-hidden flex items-center justify-center h-24">
                          {/* Background Glow */}
                          <div className={`absolute inset-0 opacity-20 transition-colors duration-300 ${gridState === 'PEAK_LOAD' ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`}></div>
                          
                          <div className="flex flex-col items-center z-10">
                              <span className="text-3xl filter brightness-150 mb-1">🎛️</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${gridState === 'PEAK_LOAD' ? 'text-red-400' : 'text-slate-400'}`}>
                                  Main Stage
                              </span>
                              {gridState === 'PEAK_LOAD' && (
                                  <span className="absolute top-2 right-2 text-[8px] text-red-500 font-black animate-pulse border border-red-500/50 bg-red-900/30 px-1 rounded">
                                      DEFICIT: {v2gDischarge.toFixed(1)} MW
                                  </span>
                              )}
                          </div>
                      </div>

                      {/* Power Lines & Flow Animation */}
                      <div className="flex-1 relative flex items-center justify-center">
                          <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                              <path d="M 50% 0 L 50% 100%" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              
                              {/* Particles flowing UP to stage when discharging */}
                              {gridState === 'PEAK_LOAD' && (
                                  <>
                                      <path d="M 50% 100% L 50% 0%" stroke="#3b82f6" strokeWidth="6" strokeDasharray="10 10" className="animate-[flowUp_0.5s_linear_infinite]" filter="blur(2px)"/>
                                      <path d="M 50% 100% L 50% 0%" stroke="#60a5fa" strokeWidth="2" strokeDasharray="10 10" className="animate-[flowUp_0.5s_linear_infinite]"/>
                                  </>
                              )}
                          </svg>

                          {/* ETH Tokens Flowing DOWN to cars */}
                          {gridState === 'PEAK_LOAD' && (
                              <div className="absolute inset-0 flex justify-center pointer-events-none z-30">
                                  <div className="w-8 relative h-full">
                                      {[1,2,3].map(i => (
                                          <div key={i} className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-900/80 border border-emerald-400 rounded-full flex items-center justify-center text-[8px] animate-[floatDown_1.5s_linear_infinite]" style={{animationDelay: `${i * 0.5}s`}}>
                                              <span className="text-emerald-400 font-black">Ξ</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* EV Parking Lot (Power Source) */}
                      <div className="w-full bg-[#050a12] border-2 border-slate-800 rounded-lg p-3 relative flex flex-col">
                          <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Attendee EV Parking Lot</span>
                              <span className="text-[8px] font-mono text-emerald-500 bg-emerald-900/30 px-1 rounded">{activeEVs} Connected</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                              {evList.map(car => (
                                  <div key={car.id} className={`h-10 rounded border flex flex-col items-center justify-center relative overflow-hidden ${
                                      !car.optIn ? 'border-slate-800 bg-slate-900 opacity-50' :
                                      car.status === 'DISCHARGING' ? 'border-blue-500/50 bg-blue-900/20' : 'border-slate-700 bg-slate-800'
                                  }`}>
                                      <span className="text-xs absolute top-0.5 right-1">{!car.optIn ? '🔒' : '🔋'}</span>
                                      <span className="text-lg">🚙</span>
                                      
                                      {/* Battery Bar */}
                                      {car.optIn && (
                                          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                                              <div 
                                                  className={`h-full ${car.status === 'DISCHARGING' ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                                                  style={{width: `${car.battery}%`}}
                                              ></div>
                                          </div>
                                      )}

                                      {/* V2G Indicator */}
                                      {car.status === 'DISCHARGING' && (
                                          <div className="absolute inset-0 border-2 border-blue-500 rounded animate-pulse pointer-events-none"></div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes flowUp {
                        to { stroke-dashoffset: -20; }
                    }
                    @keyframes floatDown {
                        0% { top: 0%; opacity: 0; transform: translate(-50%, 0) scale(0.5); }
                        20% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                        80% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                        100% { top: 100%; opacity: 0; transform: translate(-50%, 0) scale(0.5); }
                    }
                `}} />

              </div>
            </div>

            {/* Stage Event Controls */}
            <div className="w-full bg-[#050a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Festival Load</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerPeakLoad}
                   disabled={!systemActive || gridState === 'PEAK_LOAD'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !systemActive || gridState === 'PEAK_LOAD' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                   }`}
                 >
                   💥 Trigger Headliner Bass Drop (Peak Load)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default V2GPowerSharing;
