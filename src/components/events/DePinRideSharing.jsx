/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DePinRideSharing = () => {
  const [protocolActive, setProtocolActive] = useState(false);
  const [rideState, setRideState] = useState('IDLE'); // IDLE, BROADCASTING, PAIRED, IN_TRANSIT, COMPLETED
  
  // Protocol Metrics
  const [activeNodes, setActiveNodes] = useState(0); // Bluetooth Mesh Nodes
  const [totalEscrowed, setTotalEscrowed] = useState(0); // USDC
  const [milesDriven, setMilesDriven] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '02:00:00', type: 'SYS', msg: 'DePIN Ride-Sharing Protocol Initialized.' },
    { id: 2, time: '02:00:02', type: 'SYS', msg: 'Awaiting local BLE Mesh connections.' }
  ]);

  // Visualizer State
  const [passenger, setPassenger] = useState({ distance: 0, fare: 0 });
  const [rideProgress, setRideProgress] = useState(0);

  useEffect(() => {
    let loop;
    
    if (protocolActive) {
      loop = setInterval(() => {
          
          if (rideState === 'IDLE') {
              // Simulate network growth as festival ends
              setActiveNodes(prev => Math.min(8420, prev + Math.floor(Math.random() * 5)));
          } else if (rideState === 'IN_TRANSIT') {
              setRideProgress(prev => {
                  const next = prev + 1.5; // Simulate driving
                  if (next >= 100) {
                      handleDropoff();
                      return 100;
                  }
                  return next;
              });
          }

      }, 200); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [protocolActive, rideState]);

  const handleDropoff = () => {
      setRideState('COMPLETED');
      setMilesDriven(prev => prev + passenger.distance);
      addLog('SUCCESS', 'GPS Oracle verified hotel drop-off location.');
      addLog('SYS', `Smart contract executed. ${passenger.fare} USDC transferred to Driver Wallet.`);
      
      setTimeout(() => {
          setRideState('IDLE');
          setRideProgress(0);
          setPassenger({ distance: 0, fare: 0 });
      }, 5000);
  };

  const triggerEvent = (type) => {
    if (!protocolActive) return;
    
    if (type === 'BROADCAST') {
        if (rideState !== 'IDLE') return;
        setRideState('BROADCASTING');
        addLog('ACTION', 'Broadcasting empty seats over offline BLE mesh.');
        
        setTimeout(() => {
            const dist = Math.floor(Math.random() * 15) + 5; // 5-20 miles
            const fareAmt = dist * 1.5; // $1.50 per mile flat rate (no surge)
            
            setPassenger({ distance: dist, fare: fareAmt });
            setRideState('PAIRED');
            setTotalEscrowed(prev => prev + fareAmt);
            
            addLog('AI', 'Cryptographic handshake complete. Passenger paired offline.');
            addLog('WARN', `Passenger locked ${fareAmt} USDC into escrow contract.`);
            
        }, 3000);
    } else if (type === 'DRIVE') {
        if (rideState !== 'PAIRED') return;
        setRideState('IN_TRANSIT');
        setRideProgress(0);
        addLog('SYS', 'NFC boarding verified. GPS Oracle tracking route.');
    }
  };

  const toggleProtocol = () => {
    if (!protocolActive) {
      setProtocolActive(true);
      setActiveNodes(124);
      setTotalEscrowed(14500); // System-wide metric
      setMilesDriven(450);
      addLog('SYS', 'Cellular networks down. Failing over to BLE Mesh Topology.');
    } else {
      setProtocolActive(false);
      setRideState('IDLE');
      setActiveNodes(0);
      setRideProgress(0);
      addLog('WARN', 'DePIN Protocol offline. Relying on centralized cellular networks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚗</span> Decentralized Physical Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ride-Sharing Protocol</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Uber and Lyft surge pricing hits 800% at the end of the festival, and cellular towers inevitably collapse, making it impossible for 50,000 attendees to coordinate rides home. Eventra fixes this by deploying a Bluetooth Mesh-based Decentralized Ride-Sharing protocol. Attendees with empty seats broadcast secure offline beacons. Passengers connect P2P without internet, locking a cryptocurrency payment into a smart contract that automatically releases to the driver via GPS oracle verification once safely dropped off.
          </p>

          <div className="bg-[#0a0a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🕸️</span> BLE Mesh Network
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleProtocol}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     protocolActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {protocolActive ? 'Disable DePIN Protocol' : 'Initialize Mesh Topology'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 protocolActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Offline Devices
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     protocolActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeNodes.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* TVL Escrow */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 protocolActive ? 'bg-indigo-950/20 border-indigo-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Network Escrow
                 </span>
                 <div className="flex items-end">
                   <span className="text-[14px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none ${
                     protocolActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {totalEscrowed.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Miles Driven */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 milesDriven > 0 ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Miles Driven
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     milesDriven > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {milesDriven}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04040a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Contract / Location Log</span>
                 {rideState === 'BROADCASTING' && <span className="text-blue-400 animate-pulse">BLE BEACON ACTIVE...</span>}
                 {rideState === 'IN_TRANSIT' && <span className="text-orange-400 animate-pulse">GPS TRACKING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
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
            
            {/* User App Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!protocolActive ? 'bg-slate-900' : 'bg-[#0a0a14]'}`}>
              
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-xl z-40"></div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                {!protocolActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-10 text-center block w-full">CELLULAR NETWORK DOWN</span>
                ) : (
                  <div className="w-full h-full flex flex-col relative z-10 px-4 pb-4">
                      
                      {/* Driver Status Header */}
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-xl font-black text-white">DeRide</span>
                          <div className={`px-2 py-1 rounded text-[8px] font-black uppercase flex items-center ${
                              rideState === 'IDLE' ? 'bg-slate-900/50 text-slate-400' :
                              rideState === 'BROADCASTING' ? 'bg-blue-900/50 text-blue-400' : 'bg-emerald-900/50 text-emerald-400'
                          }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  rideState === 'BROADCASTING' ? 'bg-blue-500 animate-pulse' :
                                  rideState === 'IDLE' ? 'bg-slate-500' : 'bg-emerald-500'
                              }`}></span>
                              {rideState === 'IDLE' ? 'Ready' : rideState === 'BROADCASTING' ? 'Beacon On' : 'Active Ride'}
                          </div>
                      </div>

                      {/* Main UI Area */}
                      <div className="flex-1 relative flex flex-col">
                          
                          {rideState === 'IDLE' ? (
                              <div className="flex-1 flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 border-2 border-slate-700 rounded-full flex items-center justify-center mb-4">
                                      <span className="text-2xl opacity-50">🚙</span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">3 Empty Seats<br/>Broadcast to local mesh</span>
                              </div>
                          ) : rideState === 'BROADCASTING' ? (
                              <div className="flex-1 flex flex-col items-center justify-center relative">
                                  {/* Pings */}
                                  <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
                                      <div className="w-16 h-16 rounded-full border border-blue-500 animate-[ping_2s_ease-out_infinite]"></div>
                                      <div className="w-16 h-16 rounded-full border border-blue-500 animate-[ping_2s_ease-out_infinite_0.5s]"></div>
                                  </div>
                                  
                                  <div className="w-16 h-16 bg-blue-950 border-2 border-blue-500 rounded-full flex items-center justify-center z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                      <span className="text-2xl animate-pulse">📡</span>
                                  </div>
                                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center mt-4">P2P Handshake...</span>
                                  <span className="text-[8px] font-mono text-slate-500 mt-1">Bypassing ISP Networks</span>
                              </div>
                          ) : (
                              // PAIRED / IN_TRANSIT / COMPLETED
                              <div className="flex-1 flex flex-col justify-end animate-fade-in pb-2">
                                  
                                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 backdrop-blur shadow-xl relative overflow-hidden">
                                      
                                      {/* Contract Status Background Effect */}
                                      <div className={`absolute inset-0 opacity-10 ${
                                          rideState === 'PAIRED' ? 'bg-yellow-500' :
                                          rideState === 'IN_TRANSIT' ? 'bg-blue-500' : 'bg-emerald-500'
                                      }`}></div>

                                      <div className="flex justify-between items-start mb-4 relative z-10">
                                          <div>
                                              <span className="text-[8px] font-black uppercase text-slate-500">Passenger Found</span>
                                              <h3 className="text-sm font-bold text-white">0x7F2A...9C41</h3>
                                          </div>
                                          <div className="text-right">
                                              <span className="text-[8px] font-black uppercase text-slate-500">Escrow Locked</span>
                                              <span className="block text-sm font-black text-indigo-400">${passenger.fare.toFixed(2)}</span>
                                          </div>
                                      </div>

                                      <div className="mb-4 relative z-10">
                                          <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400 mb-1">
                                              <span>Festival</span>
                                              <span>{passenger.distance} miles</span>
                                              <span>Hotel Dropoff</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                              <div 
                                                  className="h-full bg-blue-500 transition-all duration-150 relative"
                                                  style={{ width: `${rideProgress}%` }}
                                              >
                                                  {rideState === 'IN_TRANSIT' && (
                                                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px]"></div>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      <div className="border-t border-slate-800 pt-3 flex justify-center relative z-10">
                                          <span className={`text-[9px] font-black uppercase tracking-widest flex items-center ${
                                              rideState === 'PAIRED' ? 'text-yellow-400' :
                                              rideState === 'IN_TRANSIT' ? 'text-blue-400' : 'text-emerald-400'
                                          }`}>
                                              {rideState === 'PAIRED' ? (
                                                  <><span className="text-sm mr-2">📱</span> Awaiting NFC Boarding</>
                                              ) : rideState === 'IN_TRANSIT' ? (
                                                  <><span className="text-sm mr-2">📍</span> GPS Oracle Tracking Route</>
                                              ) : (
                                                  <><span className="text-sm mr-2">✅</span> Funds Released to Wallet</>
                                              )}
                                          </span>
                                      </div>

                                  </div>
                              </div>
                          )}

                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0a0a14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate App Flow</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('BROADCAST')}
                   disabled={!protocolActive || rideState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !protocolActive || rideState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   Broadcast Empty Seats
                 </button>

                 <button 
                   onClick={() => triggerEvent('DRIVE')}
                   disabled={!protocolActive || rideState !== 'PAIRED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !protocolActive || rideState !== 'PAIRED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-500 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   Begin Drive (GPS On)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DePinRideSharing;
