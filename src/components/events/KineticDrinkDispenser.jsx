/* eslint-disable */
import React, { useState, useEffect } from 'react';

const KineticDrinkDispenser = () => {
  const [stationActive, setStationActive] = useState(false);
  const [dispenseState, setDispenseState] = useState('IDLE'); // IDLE, SCANNING, VALIDATING, DISPENSING, REJECTED
  
  // Kinetic Metrics
  const [kineticScore, setKineticScore] = useState(0); // Joules/hr
  const [hydrationRewards, setHydrationRewards] = useState(1450); // Total free waters dispensed
  const [stationQueue, setStationQueue] = useState(0); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Dancefloor Station #4 Auto-Dispenser Online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting NFC / BLE Wristband proximity.' }
  ]);

  // Visualizer State
  const [fluidLevel, setFluidLevel] = useState(100);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    let loop;
    
    if (stationActive) {
      loop = setInterval(() => {
          
          if (dispenseState === 'IDLE') {
              // Simulate general crowd kinetic energy baseline
              setKineticScore(prev => Math.max(120, prev + (Math.random() * 20 - 10)));
              setStationQueue(Math.floor(Math.random() * 3));
          } else if (dispenseState === 'DISPENSING') {
              setFluidLevel(prev => {
                  const next = prev - 2;
                  if (next <= 0) return 100; // Auto-refill simulation
                  return next;
              });
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [stationActive, dispenseState]);

  const triggerEvent = (type) => {
    if (!stationActive || dispenseState !== 'IDLE') return;
    
    if (type === 'HIGH_ENERGY') {
        setDispenseState('SCANNING');
        addLog('ACTION', 'BLE Proximity trigger detected. Scanning smart wristband.');
        
        setTimeout(() => {
            setDispenseState('VALIDATING');
            const userEnergy = 850 + Math.floor(Math.random() * 400); // High score
            setActiveUser({ id: '0x9A4F', energy: userEnergy, reward: 'FREE WATER' });
            addLog('AI', `User ${'0x9A4F'} kinetic expenditure: ${userEnergy} J/hr.`);
            
            setTimeout(() => {
                setDispenseState('DISPENSING');
                setHydrationRewards(prev => prev + 1);
                addLog('SUCCESS', 'Threshold met! Priority queue bypassed. Dispensing Hydration Reward.');
                
                setTimeout(() => {
                    setDispenseState('IDLE');
                    setActiveUser(null);
                }, 3000);
            }, 1500);
        }, 1500);
    } else if (type === 'LOW_ENERGY') {
        setDispenseState('SCANNING');
        addLog('ACTION', 'BLE Proximity trigger detected. Scanning smart wristband.');
        
        setTimeout(() => {
            setDispenseState('VALIDATING');
            const userEnergy = 120 + Math.floor(Math.random() * 50); // Low score
            setActiveUser({ id: '0x3C1B', energy: userEnergy, reward: 'DENIED' });
            addLog('AI', `User ${'0x3C1B'} kinetic expenditure: ${userEnergy} J/hr.`);
            
            setTimeout(() => {
                setDispenseState('REJECTED');
                addLog('WARN', 'Kinetic threshold not met (Requires >500 J/hr).');
                addLog('SYS', 'Reward denied. User directed to standard bar queue.');
                
                setTimeout(() => {
                    setDispenseState('IDLE');
                    setActiveUser(null);
                }, 3000);
            }, 1500);
        }, 1500);
    }
  };

  const toggleStation = () => {
    if (!stationActive) {
      setStationActive(true);
      setKineticScore(250);
      setFluidLevel(100);
      addLog('SYS', 'Accelerometer telemetry API linked. Dispenser valves primed.');
    } else {
      setStationActive(false);
      setDispenseState('IDLE');
      setActiveUser(null);
      setKineticScore(0);
      addLog('WARN', 'Auto-Dispenser offline. Reverting to manual bartender service.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020610] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💧</span> IoT Gamification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic-Responsive Automated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Drink Dispensers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Bar lines at high-energy stages are incredibly long, and attendees don't want to stop dancing to wait 20 minutes for a simple mixed drink or water. Eventra solves this by installing automated, self-serve beverage dispensers right on the dancefloor. These kiosks interface with the accelerometers in the attendees' smart wristbands. By calculating their kinetic energy expenditure over the last hour, the system gamifies hydration—rewarding the hardest dancers with instant, free priority dispensing without ever interacting with a bartender.
          </p>

          <div className="bg-[#050b16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🚰</span> Dispenser Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStation}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     stationActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {stationActive ? 'Lock Dispenser Valves' : 'Initialize IoT Kiosk'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Kinetic Score */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispenseState === 'DISPENSING' ? 'bg-cyan-950/20 border-cyan-900/50 shadow-inner' :
                 dispenseState === 'REJECTED' ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Base Kinetic Energy
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     dispenseState === 'DISPENSING' ? 'text-cyan-400' :
                     dispenseState === 'REJECTED' ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(kineticScore)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">J/hr</span>
                 </div>
               </div>

               {/* Rewards Dispensed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stationActive ? 'bg-blue-950/20 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Hydration Rewards
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stationActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {hydrationRewards}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units</span>
                 </div>
               </div>
               
               {/* Queue Status */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stationQueue > 0 ? 'bg-amber-950/30 border-amber-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Station Queue
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stationQueue > 0 ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {stationQueue}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Pax</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Valve & Acceleration Log</span>
                 {dispenseState === 'SCANNING' && <span className="text-cyan-400 animate-pulse">BLE HANDSHAKE...</span>}
                 {dispenseState === 'DISPENSING' && <span className="text-blue-400 animate-pulse">VALVE OPEN</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Dispenser Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !stationActive ? 'bg-slate-900' : 'bg-[#080d1a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">KIOSK #4 INTERFACE</span>
                <span className="text-[8px] font-mono text-slate-400">DANCEFLOOR ZONE</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center p-6 pt-16">
                
                {!stationActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative mt-20">KIOSK POWERED DOWN</span>
                ) : (
                  <div className="w-full h-full flex flex-col items-center relative z-20">
                      
                      {/* UI Screen on the Dispenser */}
                      <div className={`w-full h-32 rounded-xl border-2 flex flex-col items-center justify-center p-2 mb-8 transition-colors duration-300 shadow-xl ${
                          dispenseState === 'IDLE' ? 'bg-[#030612] border-slate-800' :
                          dispenseState === 'SCANNING' ? 'bg-blue-950/40 border-blue-500/50' :
                          dispenseState === 'VALIDATING' ? 'bg-indigo-950/40 border-indigo-500/50' :
                          dispenseState === 'REJECTED' ? 'bg-red-950/40 border-red-500' :
                          'bg-cyan-950/40 border-cyan-500' // DISPENSING
                      }`}>
                          
                          {dispenseState === 'IDLE' && (
                              <>
                                  <span className="text-3xl mb-2 animate-bounce">📱</span>
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tap Smart Wristband</span>
                              </>
                          )}

                          {dispenseState === 'SCANNING' && (
                              <>
                                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Reading Accelerometer...</span>
                              </>
                          )}

                          {dispenseState === 'VALIDATING' && activeUser && (
                              <div className="flex flex-col items-center animate-fade-in">
                                  <span className="text-[8px] font-mono text-slate-400 mb-1">USER: {activeUser.id}</span>
                                  <span className="text-[14px] font-black uppercase text-white">{activeUser.energy} Joules/hr</span>
                                  <span className="text-[9px] font-bold text-indigo-400 mt-1">Calculating Threshold...</span>
                              </div>
                          )}

                          {dispenseState === 'REJECTED' && (
                              <div className="flex flex-col items-center animate-fade-in">
                                  <span className="text-3xl mb-1">❌</span>
                                  <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Low Energy Detected</span>
                                  <span className="text-[7px] font-mono text-red-400 mt-1">Dance harder to unlock rewards.</span>
                              </div>
                          )}

                          {dispenseState === 'DISPENSING' && (
                              <div className="flex flex-col items-center animate-fade-in">
                                  <span className="text-3xl mb-1">🏆</span>
                                  <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Threshold Passed!</span>
                                  <span className="text-[7px] font-mono text-cyan-200 mt-1">Dispensing Free Hydration.</span>
                              </div>
                          )}

                      </div>

                      {/* Physical Dispenser Mockup */}
                      <div className="relative w-48 h-40 flex flex-col items-center mt-auto">
                          
                          {/* Nozzle Assembly */}
                          <div className="w-16 h-8 bg-slate-800 rounded-b-xl border-x-2 border-b-2 border-slate-700 z-30 relative shadow-lg flex justify-center">
                              <div className="w-4 h-2 bg-slate-900 absolute -bottom-2 rounded-b"></div>
                          </div>

                          {/* Fluid Stream */}
                          <div className={`w-2 h-20 bg-cyan-400/80 absolute top-10 z-20 rounded-full blur-[1px] transition-all duration-300 ${
                              dispenseState === 'DISPENSING' ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 origin-top'
                          }`}></div>
                          
                          {/* Cup/Receptacle */}
                          <div className="w-20 h-24 absolute bottom-0 border-x-2 border-b-2 border-slate-600 rounded-b-lg bg-black/50 z-10 overflow-hidden flex items-end shadow-inner">
                              <div 
                                  className="w-full bg-cyan-500/30 backdrop-blur-sm transition-all duration-100 border-t border-cyan-400/50"
                                  style={{ height: `${100 - fluidLevel}%` }}
                              >
                                  {/* Bubbles */}
                                  {dispenseState === 'DISPENSING' && (
                                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] animate-[moveUp_1s_linear_infinite]"></div>
                                  )}
                              </div>
                          </div>
                          
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes moveUp {
                        0% { background-position: 0 0; }
                        100% { background-position: 0 -20px; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#050b16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User Interaction</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('HIGH_ENERGY')}
                   disabled={!stationActive || dispenseState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !stationActive || dispenseState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                   }`}
                 >
                   High-Energy User Tap (800+ J)
                 </button>

                 <button 
                   onClick={() => triggerEvent('LOW_ENERGY')}
                   disabled={!stationActive || dispenseState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !stationActive || dispenseState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Low-Energy User Tap (100 J)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default KineticDrinkDispenser;
