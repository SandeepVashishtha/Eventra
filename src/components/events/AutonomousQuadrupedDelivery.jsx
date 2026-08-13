/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousQuadrupedDelivery = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  
  // Fleet Metrics
  const [availableBots, setAvailableBots] = useState(12);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [gyroStability, setGyroStability] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Quadruped Fleet Management Console initialized.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: '12 Autonomous Units secured at VIP Bar Hub.' }
  ]);

  // Simulation loop for deliveries
  useEffect(() => {
    let loop;
    
    if (fleetActive) {
      loop = setInterval(() => {
          
          setActiveDeliveries(prev => {
              let next = [...prev];
              
              next.forEach(d => {
                  if (d.status === 'PATHING') {
                      d.progress += Math.random() * 5;
                      
                      // Simulate obstacle avoidance
                      if (Math.random() > 0.8) {
                          d.obstacle = true;
                          setGyroStability(prev => Math.max(92, prev - Math.random() * 2));
                      } else {
                          d.obstacle = false;
                          setGyroStability(prev => Math.min(100, prev + 0.5));
                      }

                      if (d.progress >= 100) {
                          d.progress = 100;
                          d.status = 'ARRIVED';
                          addLog('SUCCESS', `Unit #${d.botId} arrived at Cabana ${d.cabana}. Awaiting payload retrieval.`);
                      }
                  } else if (d.status === 'ARRIVED') {
                      d.waitTimer = (d.waitTimer || 0) + 1;
                      if (d.waitTimer > 20) { // simulate user picking up drinks
                          d.status = 'RETURNING';
                          addLog('ACTION', `Payload secured by VIP. Unit #${d.botId} returning to base.`);
                      }
                  } else if (d.status === 'RETURNING') {
                      d.progress -= Math.random() * 6;
                      if (d.progress <= 0) {
                          d.status = 'COMPLETE';
                          addLog('SYS', `Unit #${d.botId} returned to base. Charging and ready.`);
                          setAvailableBots(b => b + 1);
                          setCompletedDeliveries(c => c + 1);
                      }
                  }
              });
              
              return next.filter(d => d.status !== 'COMPLETE');
          });

      }, 200);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive]);

  const dispatchOrder = () => {
    if (!fleetActive || availableBots <= 0) return;
    
    const newBotId = Math.floor(Math.random() * 899) + 100;
    const cabanaNum = Math.floor(Math.random() * 50) + 1;
    const items = ['Dom Pérignon', 'Tequila Don Julio', 'Grey Goose', 'Sparkling Water'][Math.floor(Math.random()*4)];
    
    setAvailableBots(b => b - 1);
    
    setActiveDeliveries(prev => [...prev, {
        id: Date.now(),
        botId: newBotId,
        cabana: cabanaNum,
        item: items,
        progress: 0,
        status: 'PATHING',
        obstacle: false
    }]);
    
    addLog('ACTION', `VIP Order Received: Cabana ${cabanaNum}. Payload: ${items}.`);
    addLog('AI', `Dispatching Unit #${newBotId}. Calculating crowd-avoidance pathing.`);
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      setAvailableBots(12);
      addLog('SYS', 'Quadruped Fleet Online. Gyroscopic stabilization active.');
    } else {
      setFleetActive(false);
      setActiveDeliveries([]);
      addLog('WARN', 'Fleet Offline. Recalling all units to base charging stations.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060408] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Fleet Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🐕</span> Autonomous Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Quadruped VIP <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Beverage Delivery</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            VIP attendees pay thousands for premium cabanas, but still have to wait 30 minutes for a human server to blindly navigate through dense, dancing crowds. Eventra solves this by integrating a fleet of autonomous robotic quadrupeds equipped with gyroscopically stabilized beverage payloads. When a VIP orders bottle service via the app, this UI dispatches a quadruped that uses edge-compute computer vision to seamlessly pathfind around dancing attendees, delivering flawless, unspilled drinks directly to the cabana in under 3 minutes.
          </p>

          <div className="bg-[#120a06] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">📍</span> Quadruped Dispatch Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Recall & Sleep Fleet' : 'Boot Robotics Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Available Bots */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 fleetActive && availableBots > 0 ? 'bg-amber-950/20 border-amber-900/50' : 
                 fleetActive && availableBots === 0 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Available Units
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     fleetActive && availableBots > 0 ? 'text-white' : 
                     fleetActive ? 'text-orange-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {availableBots}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/ 12</span>
                 </div>
               </div>

               {/* Gyro Stability */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gyroStability < 95 ? 'bg-yellow-950/40 border-yellow-500/50' :
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Payload Gyro
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gyroStability < 95 ? 'text-yellow-400 animate-pulse' :
                     fleetActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {gyroStability.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Deliveries */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 completedDeliveries > 0 ? 'bg-emerald-950/20 border-emerald-900/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Orders Fulfilled
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     completedDeliveries > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {completedDeliveries}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090503] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Dispatch Log</span>
                 {activeDeliveries.length > 0 && <span className="text-amber-400 animate-pulse">PATHFINDING ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' :
                       log.type === 'AI' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* Fleet Tracker Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">FLEET TRACKER</span>
                <span className="text-[8px] font-mono text-slate-400">EDGE-COMPUTE NAV</span>
              </div>

              <div className="flex-1 relative bg-[#050302] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* HUD Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwbC00MCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] pointer-events-none"></div>

                {!fleetActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center z-10">
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FLEET IN STANDBY</span>
                   </div>
                ) : activeDeliveries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center z-10">
                        <div className="w-16 h-16 border-2 border-dashed border-amber-900 rounded-full flex items-center justify-center animate-pulse mb-2">
                            <span className="text-xl">🍸</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">AWAITING VIP ORDERS</span>
                    </div>
                ) : (
                  <div className="flex-1 relative mt-4 overflow-y-auto pr-2 space-y-3 z-10">
                      
                      {activeDeliveries.map((delivery) => (
                          <div key={delivery.id} className="bg-slate-900/80 border border-slate-700 p-3 rounded-lg relative overflow-hidden backdrop-blur">
                              
                              <div className="flex justify-between items-center mb-2 relative z-10">
                                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">UNIT #{delivery.botId}</span>
                                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                                      delivery.status === 'PATHING' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                                      delivery.status === 'ARRIVED' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800 animate-pulse' :
                                      'bg-orange-900/50 text-orange-400 border border-orange-800'
                                  }`}>
                                      {delivery.status}
                                  </span>
                              </div>

                              <div className="flex justify-between items-end mb-3 relative z-10">
                                  <div className="flex flex-col">
                                      <span className="text-[8px] text-slate-500 uppercase">Destination</span>
                                      <span className="text-xs font-bold text-white">Cabana {delivery.cabana}</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                      <span className="text-[8px] text-slate-500 uppercase">Payload</span>
                                      <span className="text-xs font-mono text-slate-300">{delivery.item}</span>
                                  </div>
                              </div>

                              {/* Progress Bar with Obstacles */}
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10 flex">
                                  <div 
                                      className={`h-full transition-all duration-200 ${
                                          delivery.status === 'RETURNING' ? 'bg-orange-500' : 'bg-amber-400'
                                      }`} 
                                      style={{ width: `${delivery.progress}%` }}
                                  ></div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-1 relative z-10">
                                  <span className="text-[7px] font-mono text-slate-500">BASE</span>
                                  {delivery.obstacle && delivery.status === 'PATHING' && (
                                      <span className="text-[7px] font-black uppercase text-yellow-500 animate-ping">OBSTACLE DETECTED</span>
                                  )}
                                  <span className="text-[7px] font-mono text-slate-500">CABANA</span>
                              </div>

                              {/* Background highlight if arrived */}
                              {delivery.status === 'ARRIVED' && (
                                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>
                              )}
                          </div>
                      ))}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120a06] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Dispatch Controls</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={dispatchOrder}
                   disabled={!fleetActive || availableBots <= 0}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !fleetActive || availableBots <= 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-400 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                   }`}
                 >
                   {availableBots <= 0 && fleetActive ? 'No Units Available' : 'Dispatch Robot to Cabana'}
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutonomousQuadrupedDelivery;
