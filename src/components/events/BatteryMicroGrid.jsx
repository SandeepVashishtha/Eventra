/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BatteryMicroGrid = () => {
  const [gridActive, setGridActive] = useState(false);
  const [networkState, setNetworkState] = useState('IDLE'); // IDLE, SCANNING, MATCHED, SWAPPED
  
  // Grid Metrics
  const [pucksInCirculation, setPucksInCirculation] = useState(0);
  const [p2pSwaps, setP2pSwaps] = useState(0);
  const [networkEfficiency, setNetworkEfficiency] = useState(0); // % of attendees powered
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'IoT Battery Micro-Grid Tracker initialized.' },
    { id: 2, time: '16:00:02', type: 'SYS', msg: 'Awaiting P2P swap routing requests.' }
  ]);

  // Visualizer State
  const [userNode, setUserNode] = useState({ battery: 10, pulsing: false });
  const [peerNode, setPeerNode] = useState({ battery: 100, distance: 0, visible: false });
  const [contractStatus, setContractStatus] = useState(null);

  useEffect(() => {
    let loop;
    
    if (gridActive) {
      loop = setInterval(() => {
          
          if (networkState === 'IDLE') {
              setNetworkEfficiency(prev => Math.min(95, prev + Math.random()));
              if(userNode.battery > 0 && Math.random() > 0.8) {
                  setUserNode(prev => ({...prev, battery: Math.max(0, prev.battery - 1)}));
              }
          }
          
      }, 500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [gridActive, networkState, userNode.battery]);

  const triggerP2PSwap = () => {
    if (!gridActive || networkState !== 'IDLE') return;
    
    setNetworkState('SCANNING');
    setUserNode(prev => ({ ...prev, pulsing: true }));
    addLog('ACTION', 'User puck depleted (0%). Initiating BLE proximity scan for peers.');
    
    setTimeout(() => {
        setNetworkState('MATCHED');
        const dist = Math.floor(Math.random() * 8) + 2; // 2-10 feet
        setPeerNode({ battery: 100, distance: dist, visible: true });
        setUserNode(prev => ({ ...prev, pulsing: false }));
        addLog('AI', `Match found! Peer with 100% puck located ${dist}ft away.`);
        addLog('SYS', 'Routing user to peer. Executing escrow smart contract for swap.');
        setContractStatus('AWAITING HANDSHAKE...');
        
        setTimeout(() => {
            setNetworkState('SWAPPED');
            setContractStatus('ESCROW CLEARED: $1.50');
            setUserNode({ battery: 100, pulsing: false });
            setPeerNode({ battery: 0, distance: dist, visible: true });
            setP2pSwaps(prev => prev + 1);
            
            addLog('SUCCESS', 'P2P Physical Swap Confirmed via NFC handshake.');
            addLog('SYS', 'Micro-transaction $1.50 paid to Peer for logistics. Both users powered.');
            
            setTimeout(() => {
                setNetworkState('IDLE');
                setPeerNode(prev => ({ ...prev, visible: false }));
                setContractStatus(null);
            }, 5000);
            
        }, 3000); // Wait for physical swap
    }, 2000); // Wait for scan
  };

  const toggleGrid = () => {
    if (!gridActive) {
      setGridActive(true);
      setPucksInCirculation(15420);
      setNetworkEfficiency(82);
      setUserNode({ battery: 0, pulsing: false }); // Start dead for demo
      addLog('SYS', '50 Kiosks Online. 15,420 Magnetic Pucks currently deployed in crowd.');
    } else {
      setGridActive(false);
      setPucksInCirculation(0);
      setNetworkEfficiency(0);
      setNetworkState('IDLE');
      setPeerNode({ battery: 100, distance: 0, visible: false });
      setContractStatus(null);
      addLog('WARN', 'Micro-Grid tracker offline. Users reverting to localized kiosks.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060806] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔋</span> Decentralized Power
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Crowd-Sourced Battery <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">Swapping Micro-Grid</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Mobile power banks run out of charge quickly, and phone charging locker stations have two-hour wait times, leaving thousands of attendees stranded without a way to find their friends. Eventra fixes this by deploying a decentralized micro-grid. Attendees check out standardized magnetic power-pucks. When a user's puck dies, the app uses BLE proximity to direct them to another attendee standing 10 feet away who has a fresh puck, facilitating an instant peer-to-peer swap via a smart contract micro-transaction.
          </p>

          <div className="bg-[#0b100c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">📡</span> P2P Grid Logistics
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleGrid}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     gridActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {gridActive ? 'Disable Micro-Grid' : 'Initialize IoT Tracking'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Pucks Active */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridActive ? 'bg-lime-950/20 border-lime-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Pucks
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gridActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {pucksInCirculation.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* P2P Swaps */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 p2pSwaps > 0 ? 'bg-green-950/40 border-green-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   P2P Swaps Verified
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     p2pSwaps > 0 ? 'text-green-400' : 'text-slate-600'
                   }`}>
                     {p2pSwaps}
                   </span>
                 </div>
               </div>
               
               {/* Grid Efficiency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gridActive && networkEfficiency > 90 ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                 gridActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Grid Saturation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gridActive && networkEfficiency > 90 ? 'text-emerald-400' :
                     gridActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {networkEfficiency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040604] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Contract / Location Log</span>
                 {networkState === 'SCANNING' && <span className="text-lime-400 animate-pulse">PROXIMITY SCAN...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-green-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-lime-400 font-bold' :
                       log.type === 'AI' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!gridActive ? 'bg-slate-900' : 'bg-[#0a100c]'}`}>
              
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-xl z-40"></div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center p-6 pt-10">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(132,204,22,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(132,204,22,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                {!gridActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-10">GRID OFFLINE</span>
                ) : (
                  <div className="w-full h-full flex flex-col relative z-10">
                      
                      {/* Top Status */}
                      <div className="flex justify-between items-center mb-8 px-2">
                          <span className="text-xl font-black text-white">PowerGrid</span>
                          <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                              userNode.battery > 50 ? 'bg-green-900/50 text-green-400' :
                              userNode.battery > 15 ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-500 animate-pulse'
                          }`}>
                              Puck: {userNode.battery}%
                          </div>
                      </div>

                      {/* Main Radar / Swap UI */}
                      <div className="flex-1 relative flex items-center justify-center">
                          
                          {/* Radar Rings */}
                          <div className="absolute w-48 h-48 border border-lime-900/30 rounded-full"></div>
                          <div className="absolute w-32 h-32 border border-lime-900/50 rounded-full"></div>
                          
                          {/* Scanning Sweep */}
                          {networkState === 'SCANNING' && (
                              <div className="absolute w-48 h-48 rounded-full border-r-2 border-lime-400 animate-[spin_1.5s_linear_infinite] opacity-50">
                                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-transparent to-lime-500/20 rounded-r-full"></div>
                              </div>
                          )}

                          {/* Center Node (User) */}
                          <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center z-20 transition-colors ${
                              userNode.battery > 50 ? 'bg-green-950 border-green-500' :
                              userNode.battery > 0 ? 'bg-yellow-950 border-yellow-500' : 'bg-red-950 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                          }`}>
                              <span className="text-xl">📱</span>
                              
                              {/* Pulse Effect when scanning */}
                              {userNode.pulsing && (
                                  <div className="absolute w-full h-full rounded-full border border-red-500 animate-ping"></div>
                              )}
                          </div>

                          {/* Peer Node */}
                          {peerNode.visible && (
                              <div className="absolute top-4 right-8 flex flex-col items-center animate-fade-in">
                                  <div className={`w-10 h-10 rounded-full border-2 bg-green-950 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center relative`}>
                                      <span className="text-sm">👤</span>
                                      
                                      {/* Connection Line to User */}
                                      {networkState === 'MATCHED' && (
                                          <div className="absolute top-1/2 -left-20 w-20 border-b-2 border-dashed border-lime-500 origin-left opacity-50 transform rotate-[25deg]"></div>
                                      )}
                                      
                                      {/* NFC Handshake Ping */}
                                      {networkState === 'SWAPPED' && (
                                          <div className="absolute w-full h-full rounded-full border-2 border-green-400 animate-ping"></div>
                                      )}
                                  </div>
                                  <div className="bg-black/80 px-2 py-1 rounded mt-1 border border-slate-800 flex flex-col items-center">
                                      <span className="text-[7px] font-black uppercase text-lime-400">Peer • {peerNode.distance}ft</span>
                                      <span className="text-[7px] font-mono text-slate-400">Puck: {peerNode.battery}%</span>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Bottom Status / Contract Panel */}
                      <div className="mt-auto h-24 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                          {networkState === 'IDLE' ? (
                              <>
                                  <span className="text-[12px] font-black uppercase tracking-widest text-white">System Nominal</span>
                                  <span className="text-[9px] font-mono text-slate-400 mt-1 text-center">Enjoy the festival. Puck has power.</span>
                              </>
                          ) : (
                              <>
                                  <span className={`text-[12px] font-black uppercase tracking-widest z-10 ${
                                      networkState === 'SWAPPED' ? 'text-green-400' : 'text-lime-400'
                                  }`}>
                                      {networkState === 'SCANNING' ? 'Locating Fresh Puck...' : 
                                       networkState === 'MATCHED' ? 'Peer Found. Approach.' : 'Swap Successful!'}
                                  </span>
                                  
                                  {contractStatus && (
                                      <div className="mt-2 bg-black/50 border border-slate-700 px-3 py-1 rounded z-10">
                                          <span className="text-[8px] font-mono text-slate-300">{contractStatus}</span>
                                      </div>
                                  )}
                                  
                                  {/* Contract pulsing bg */}
                                  {networkState === 'MATCHED' && (
                                      <div className="absolute inset-0 bg-lime-500/10 animate-pulse pointer-events-none"></div>
                                  )}
                                  {networkState === 'SWAPPED' && (
                                      <div className="absolute inset-0 bg-green-500/20 pointer-events-none"></div>
                                  )}
                              </>
                          )}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b100c] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Edge Case</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerP2PSwap}
                   disabled={!gridActive || networkState !== 'IDLE' || userNode.battery > 0}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !gridActive || networkState !== 'IDLE' || userNode.battery > 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-lime-950/40 border-lime-600 text-lime-400 hover:bg-lime-900/60 shadow-[0_0_15px_rgba(132,204,22,0.3)] animate-pulse'
                   }`}
                 >
                   {userNode.battery > 0 && gridActive ? 'Wait for Puck to Die...' : 'User Puck Dead: Initiate P2P Swap'}
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BatteryMicroGrid;
