/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousEVValet = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [chargingStatus, setChargingStatus] = useState('IDLE'); // IDLE, ROUTING, CHARGING, COMPLETE
  const [batteryLevel, setBatteryLevel] = useState(14); // Attendee EV battery %
  const [robotBattery, setRobotBattery] = useState(100);
  
  const [fleetLog, setFleetLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Fleet Management System connected. 12 ZIGGY units on standby.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting attendee drop-off coordinates.' }
  ]);

  useEffect(() => {
    let loop;
    if (fleetActive && chargingStatus === 'CHARGING') {
      loop = setInterval(() => {
        setBatteryLevel(prev => {
          const next = prev + 1.5;
          if (next >= 80) {
            completeCharge();
          }
          return Math.min(100, next);
        });
        setRobotBattery(prev => Math.max(0, prev - 0.5));
      }, 300);
    }
    return () => clearInterval(loop);
  }, [fleetActive, chargingStatus]);

  const requestCharge = () => {
    if (fleetActive && chargingStatus === 'IDLE') {
      setChargingStatus('ROUTING');
      addLog('NAV', 'Attendee EV located at Lot C, Spot 104. Dispatching Unit-03.');
      
      setTimeout(() => {
        addLog('ACTION', 'Unit-03 navigating physical environment. Obstacle avoidance active.');
        
        setTimeout(() => {
          setChargingStatus('CHARGING');
          addLog('SUCCESS', 'Unit-03 arrived at Spot 104. Robotic arm plugged in. Initiating DC Fast Charge.');
        }, 2000);
      }, 1000);
    }
  };

  const completeCharge = () => {
    setChargingStatus('COMPLETE');
    addLog('SYS', 'Target SOC (80%) reached. Unplugging robotic arm.');
    setTimeout(() => {
      addLog('NAV', 'Unit-03 returning to central charging hub.');
      setTimeout(() => {
        setChargingStatus('IDLE');
        setBatteryLevel(14); // Reset for next demo
        setRobotBattery(100);
      }, 2000);
    }, 1000);
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      addLog('SYS', 'Lot C open. Fleet Management autonomous routing enabled.');
    } else {
      setFleetActive(false);
      setChargingStatus('IDLE');
      addLog('WARN', 'Fleet disabled. All units returning to base.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setFleetLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔋</span> Vehicle-to-Grid Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Autonomous EV Charging <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Valet Fleet Integration</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees driving electric vehicles to remote festival grounds often run out of battery over the 3-day weekend, causing massive gridlock on Monday morning. Instead of forcing organizers to dig up dirt fields to install permanent, expensive charging pillars, Eventra integrates with autonomous charging robot fleets (like Ziggy). Attendees simply park in a standard spot and request a charge via the app. Eventra sends the GPS coordinates to the fleet, which autonomously navigates the lot, plugs into the EV, charges it, and returns to base.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🤖</span> Autonomous Fleet Management
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Disable Fleet' : 'Engage Autonomous Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Fleet Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 chargingStatus === 'ROUTING' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 chargingStatus === 'CHARGING' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Unit-03 Telemetry</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     chargingStatus === 'ROUTING' ? 'text-blue-400' :
                     chargingStatus === 'CHARGING' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {chargingStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {chargingStatus === 'IDLE' ? 'Awaiting Dispatch' : 
                      chargingStatus === 'ROUTING' ? 'Navigating to Lot C' : 
                      chargingStatus === 'COMPLETE' ? 'Returning to Hub' : 'DC Fast Charging...'}
                   </span>
                 </div>
               </div>

               {/* Power Draw */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Unit-03 Battery Pack</span>
                     <span className="text-xs font-mono font-bold text-teal-400">{robotBattery.toFixed(0)}%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${robotBattery}%` }}></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-1">
                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Attendee EV SOC</span>
                     <span className="text-xs font-mono font-bold text-emerald-400">{batteryLevel.toFixed(0)}%</span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${batteryLevel}%` }}></div>
                   </div>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Routing Log</span>
                 {chargingStatus === 'ROUTING' && <span className="text-blue-400 animate-pulse">Navigating...</span>}
                 {chargingStatus === 'CHARGING' && <span className="text-emerald-500 animate-pulse">Charging...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {fleetLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'NAV' ? 'text-blue-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Eventra Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-50 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                Eventra Attendee App
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-100 overflow-hidden pt-16 p-5 justify-between">
               
               <div>
                 <h2 className="text-2xl font-black text-slate-900 leading-tight">My Vehicle</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Lot C • Spot 104</p>
                 
                 {/* EV Visualization */}
                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 text-center">
                   <div className="text-6xl mb-4">🚙</div>
                   <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Tesla Model Y</p>
                   
                   <div className="flex items-center justify-center space-x-2 mt-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Battery</span>
                     <div className="flex items-end">
                       <span className="text-3xl font-black font-mono text-slate-800 leading-none">{batteryLevel.toFixed(0)}</span>
                       <span className="text-xs font-bold text-slate-500 ml-1 pb-0.5">%</span>
                     </div>
                   </div>
                   
                   {/* Battery Bar */}
                   <div className="w-full h-3 bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-200">
                     <div 
                       className={`h-full transition-all duration-300 ${
                         batteryLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'
                       }`}
                       style={{ width: `${batteryLevel}%` }}
                     ></div>
                   </div>
                 </div>
               </div>

               {/* Action Section */}
               <div className="mb-4">
                 {chargingStatus === 'IDLE' ? (
                   <button 
                     onClick={requestCharge}
                     disabled={!fleetActive}
                     className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md ${
                       fleetActive ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {fleetActive ? 'Request Robot Valet Charge' : 'Valet Service Offline'}
                   </button>
                 ) : chargingStatus === 'ROUTING' ? (
                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                     <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                     <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Robot En Route</p>
                     <p className="text-[9px] font-bold text-blue-600 uppercase">Unit-03 is navigating to Spot 104.</p>
                   </div>
                 ) : chargingStatus === 'CHARGING' ? (
                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>
                     <span className="text-3xl block mb-2 relative z-10">⚡</span>
                     <p className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-1 relative z-10">Fast Charging</p>
                     <p className="text-[9px] font-bold text-emerald-700 uppercase relative z-10">Target: 80% SOC</p>
                   </div>
                 ) : (
                   <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                     <span className="text-3xl block mb-2">✅</span>
                     <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Charge Complete</p>
                     <p className="text-[9px] font-bold text-slate-500 uppercase">Ready for departure on Monday.</p>
                   </div>
                 )}
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutonomousEVValet;
