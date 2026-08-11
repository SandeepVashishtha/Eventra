/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutonomousLostAndFound = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [missionState, setMissionState] = useState('IDLE'); // IDLE, SEARCHING, RETRIEVING, SECURED
  
  // Rover Fleet Metrics
  const [activeRovers, setActiveRovers] = useState(0);
  const [bleSignal, setBleSignal] = useState(0); // RSSI Strength 0-100%
  const [itemsSecured, setItemsSecured] = useState(42);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'Lost & Found micro-rover fleet online.' },
    { id: 2, time: '23:30:02', type: 'SYS', msg: 'Awaiting BLE emergency distress beacons.' }
  ]);

  // Target and Rover spatial state
  const [targetPos, setTargetPos] = useState(null);
  const [roverPos, setRoverPos] = useState({ x: 10, y: 10 }); // Hub is at 10,10
  const [targetType, setTargetType] = useState('PHONE'); // PHONE, WALLET

  useEffect(() => {
    let loop;
    
    if (systemActive && (missionState === 'SEARCHING' || missionState === 'RETRIEVING')) {
      loop = setInterval(() => {
          
          setRoverPos(prev => {
              let targetX = missionState === 'SEARCHING' ? targetPos.x : 10;
              let targetY = missionState === 'SEARCHING' ? targetPos.y : 10;
              
              const dx = targetX - prev.x;
              const dy = targetY - prev.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              // Calculate BLE signal strength (inversely proportional to distance)
              if (missionState === 'SEARCHING') {
                  const maxDist = 100; // max diagonalish
                  const signalStr = Math.max(0, 100 - (dist / maxDist) * 100);
                  setBleSignal(signalStr);
              }

              if (dist < 2) {
                  // Reached target
                  if (missionState === 'SEARCHING') {
                      setMissionState('SECURED');
                      setBleSignal(100);
                      
                      addLog('SUCCESS', `Micro-Rover acquired ${targetType}. Ingesting into secure lockbox.`);
                      
                      // Pause then return
                      setTimeout(() => {
                         setMissionState('RETRIEVING');
                         addLog('SYS', 'Item secured. Initiating autonomous return path to Hub.');
                      }, 1500);
                  } else if (missionState === 'RETRIEVING') {
                      setMissionState('IDLE');
                      setTargetPos(null);
                      setBleSignal(0);
                      setItemsSecured(i => i + 1);
                      addLog('SUCCESS', 'Rover docked at Hub. Item logged into Lost & Found inventory.');
                  }
                  return { x: targetX, y: targetY };
              }
              
              // Move rover
              const speed = 1.5;
              return {
                  x: prev.x + (dx/dist)*speed,
                  y: prev.y + (dy/dist)*speed
              };
          });

      }, 100);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, missionState, targetPos, targetType]);

  const triggerLostPhone = () => {
    if (!systemActive || missionState !== 'IDLE') return;
    
    const x = Math.random() * 60 + 30; // Random pos in crowd
    const y = Math.random() * 60 + 30;
    
    setTargetPos({ x, y });
    setTargetType('PHONE');
    setMissionState('SEARCHING');
    addLog('CRIT', 'Distress BLE Signal detected: iPhone 15 Pro (User: Sarah M.)');
    addLog('ACTION', 'Dispatching Micro-Rover to triangulate signal through crowd.');
  };
  
  const triggerLostWallet = () => {
    if (!systemActive || missionState !== 'IDLE') return;
    
    const x = Math.random() * 60 + 30;
    const y = Math.random() * 60 + 30;
    
    setTargetPos({ x, y });
    setTargetType('WALLET');
    setMissionState('SEARCHING');
    addLog('CRIT', 'Distress BLE Signal detected: Ridge Wallet Tracker (User: John D.)');
    addLog('ACTION', 'Dispatching Micro-Rover to triangulate signal through crowd.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveRovers(12);
      addLog('SYS', 'Swarm Robotics L&F System Armed. 12 Rovers on standby.');
    } else {
      setSystemActive(false);
      setActiveRovers(0);
      setMissionState('IDLE');
      setTargetPos(null);
      setRoverPos({ x: 10, y: 10 });
      setBleSignal(0);
      addLog('WARN', 'L&F System Offline. Rovers locked at Hub.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06070a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Fleet Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🤖</span> Autonomous Micro-Robotics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Swarm Robotics Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Lost & Found Retrieval</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees lose thousands of phones, wallets, and keys in the dark, and the manual process relies entirely on honest people finding them and turning them in. Eventra integrates the "Mark as Lost" app feature with a fleet of terrestrial micro-rovers. If a user drops their phone, they trigger its BLE beacon via a friend's app. Eventra automatically dispatches a micro-rover to triangulate the BLE signal through the crowd's feet. The rover locates the item, securely ingests it into a locking compartment, and autonomously returns it to the central Lost & Found hub.
          </p>

          <div className="bg-[#0b1019] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🛜</span> BLE Triangulation Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   disabled={missionState !== 'IDLE'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     missionState !== 'IDLE' ? 'bg-slate-900 text-slate-700 border border-slate-800' :
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Deactivate Fleet' : 'Arm Retrieval Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Standby Rovers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Fleet
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeRovers}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units</span>
                 </div>
               </div>

               {/* BLE Signal Strength */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 missionState === 'SEARCHING' ? 'bg-sky-950/40 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   BLE Target Signal
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     missionState === 'SEARCHING' ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(bleSignal)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">% RSSI</span>
                 </div>
               </div>
               
               {/* Items Retrieved */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 missionState === 'IDLE' && systemActive ? 'bg-emerald-950/20 border-emerald-900/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Secured Inventory
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {itemsSecured}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Items</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05080c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Fleet Operations Log</span>
                 {missionState === 'SEARCHING' && <span className="text-sky-400 animate-pulse">TRIANGULATING BLE BEACON...</span>}
                 {missionState === 'RETRIEVING' && <span className="text-emerald-400 animate-pulse">RETURNING TO HUB...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-sky-400 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">ROVER FLEET MAP</span>
                <span className="text-[8px] font-mono text-slate-400">GPS & BLE TRACKING</span>
              </div>

              <div className="flex-1 relative bg-[#020508] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Background Crowd/Topography */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                {/* The Hub */}
                <div className="absolute top-[10%] left-[10%] w-10 h-10 border-2 border-emerald-500/50 bg-emerald-950/30 rounded flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className="text-[6px] font-black uppercase text-emerald-500">L&F HUB</span>
                </div>

                {!systemActive ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">FLEET DOCKED</span>
                   </div>
                ) : (
                  <>
                    {/* The Lost Item Target */}
                    {targetPos && (
                        <div 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                            style={{ top: `${targetPos.y}%`, left: `${targetPos.x}%` }}
                        >
                            {/* BLE Pulse Rings */}
                            {missionState === 'SEARCHING' && (
                                <div className="absolute inset-[-30px] rounded-full border border-sky-500/50 animate-ping pointer-events-none"></div>
                            )}
                            
                            {missionState === 'SEARCHING' ? (
                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse"></div>
                            ) : (
                                <div className="text-[14px]">✅</div>
                            )}
                            
                            {missionState === 'SEARCHING' && (
                                <span className="text-[6px] font-mono text-sky-400 mt-1 whitespace-nowrap bg-black/50 px-1 rounded">BLE: {targetType}</span>
                            )}
                        </div>
                    )}

                    {/* Pathing Line */}
                    {missionState === 'SEARCHING' && targetPos && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <line 
                                x1={`${roverPos.x}%`} y1={`${roverPos.y}%`} 
                                x2={`${targetPos.x}%`} y2={`${targetPos.y}%`} 
                                stroke="rgba(14, 165, 233, 0.4)" 
                                strokeWidth="1"
                                strokeDasharray="2 4"
                            />
                        </svg>
                    )}

                    {/* Return Pathing Line */}
                    {missionState === 'RETRIEVING' && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <line 
                                x1={`${roverPos.x}%`} y1={`${roverPos.y}%`} 
                                x2="10%" y2="10%" 
                                stroke="rgba(16, 185, 129, 0.4)" 
                                strokeWidth="1"
                                strokeDasharray="2 4"
                            />
                        </svg>
                    )}

                    {/* The Active Rover */}
                    {(missionState !== 'IDLE') && (
                        <div 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[100ms] ease-linear z-20"
                            style={{ top: `${roverPos.y}%`, left: `${roverPos.x}%` }}
                        >
                            <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                                missionState === 'RETRIEVING' || missionState === 'SECURED' ? 'border-emerald-500 bg-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-sky-500 bg-sky-950'
                            }`}>
                                <div className={`w-1 h-1 rounded-full ${missionState === 'RETRIEVING' ? 'bg-emerald-400' : 'bg-sky-400 animate-pulse'}`}></div>
                            </div>
                        </div>
                    )}

                    {/* HUD Alerts */}
                    {missionState === 'SECURED' && (
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center z-30 pointer-events-none w-full">
                           <div className="bg-emerald-950/90 border border-emerald-500/50 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.6)] backdrop-blur-sm">
                              <span className="text-[12px] font-black uppercase tracking-widest text-emerald-400">ITEM ACQUIRED</span>
                              <span className="text-[9px] font-mono text-slate-300 mt-1">Locked in vault. Returning to Hub.</span>
                           </div>
                       </div>
                    )}

                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b1019] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User "Mark as Lost" Ping</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={triggerLostPhone}
                   disabled={!systemActive || missionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || missionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-400 hover:bg-red-900/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                   }`}
                 >
                   Inject Lost Phone (BLE)
                 </button>
                 
                 <button 
                   onClick={triggerLostWallet}
                   disabled={!systemActive || missionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || missionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Inject Lost Wallet (BLE)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutonomousLostAndFound;
