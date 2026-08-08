/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneSwarmAPI = () => {
  const [swarmActive, setSwarmActive] = useState(false);
  const [formationState, setFormationState] = useState('IDLE'); // IDLE, DEPLOYING, FORMATION_LOCK
  
  // Bidding & Telemetry State
  const [currentBidder, setCurrentBidder] = useState('None');
  const [bidAmount, setBidAmount] = useState(0); // CPM
  const [activeShape, setActiveShape] = useState('STANDBY'); // STANDBY, QR_CODE, RED_BULL
  const [droneBattery, setDroneBattery] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'UAV Command Center online. 500 LED drones docked.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Programmatic Header Bidding API listening for RTB requests.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (swarmActive && formationState === 'IDLE') {
      loop = setInterval(() => {
        // Simulating incoming bids on the API
        const newBid = Math.floor(Math.random() * 50) + 120; // $120-$170 CPM
        setBidAmount(newBid);
      }, 1500);
    } else if (formationState === 'DEPLOYING') {
      loop = setInterval(() => {
        setDroneBattery(prev => Math.max(0, prev - 1));
      }, 800);
      
      setTimeout(() => {
        setFormationState('FORMATION_LOCK');
        addLog('SUCCESS', `Swarm achieved structural lock. Displaying 3D geometry: ${activeShape}.`);
        addLog('WEB3', `Charging sponsor ${currentBidder} at $${bidAmount} CPM.`);
      }, 4000);
      
    } else if (formationState === 'FORMATION_LOCK') {
      loop = setInterval(() => {
        setDroneBattery(prev => Math.max(0, prev - 0.5));
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [swarmActive, formationState, activeShape, currentBidder, bidAmount]);

  const acceptBidRedBull = () => {
    if (swarmActive && formationState === 'IDLE') {
      setCurrentBidder('Red Bull');
      setBidAmount(250);
      setActiveShape('RED_BULL_LOGO');
      setFormationState('DEPLOYING');
      addLog('ACTION', 'High bid accepted: Red Bull ($250 CPM).');
      addLog('SYS', 'Dispatching 500 UAVs to Stage 1 airspace (High Density).');
    }
  };

  const deployQRCode = () => {
    if (swarmActive && formationState === 'IDLE') {
      setCurrentBidder('Eventra VIP');
      setBidAmount(0); // Internal
      setActiveShape('3D_QR_CODE');
      setFormationState('DEPLOYING');
      addLog('ACTION', 'Internal override: Deploying Scannable VIP Upgrade QR Code.');
      addLog('SYS', 'Dispatching 500 UAVs to Central Hub airspace.');
    }
  };

  const recallSwarm = () => {
    setFormationState('IDLE');
    setActiveShape('STANDBY');
    setCurrentBidder('None');
    setBidAmount(0);
    setDroneBattery(100);
    addLog('WARN', 'Recalling UAV swarm to charging docks. Airspace clear.');
  };

  const toggleAPI = () => {
    if (!swarmActive) {
      setSwarmActive(true);
      addLog('SYS', 'Header Bidding API active. Accepting RTB payloads.');
    } else {
      setSwarmActive(false);
      recallSwarm();
      addLog('WARN', 'Advertising API offline. Swarm grounded.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000511] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: API Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> UAV Ad-Tech API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Drone Swarm Aerial LED <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Advertising API</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Static physical billboards around the festival are boring, fixed, and cannot dynamically react to the crowd's location. Eventra solves this by exposing a programmatic API that interfaces with a fleet of 500 LED drones. Sponsors use a real-time bidding (RTB) system to purchase air-time based on live crowd density metrics. Once a bid is won, the API automatically triggers the swarm to launch and form dynamic 3D QR codes, sponsor logos, or artist names in the sky directly above the target audience.
          </p>

          <div className="bg-[#05101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📈</span> Real-Time Bidding Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAPI}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     swarmActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {swarmActive ? 'Disable RTB Exchange' : 'Open Exchange API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Winning Bidder */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 formationState !== 'IDLE' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 swarmActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active Campaign
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     formationState !== 'IDLE' ? 'text-cyan-400' :
                     swarmActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {swarmActive ? currentBidder : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono flex items-center">
                     {formationState !== 'IDLE' ? (
                       <><span className="text-green-400 mr-1">●</span> Rendering {activeShape}</>
                     ) : 'Awaiting Bids...'}
                   </span>
                 </div>
               </div>

               {/* Live Bid Rate */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 swarmActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Market Rate (CPM)
                 </span>
                 <div className="flex items-end">
                   <span className="text-xl font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none ${
                     formationState !== 'IDLE' ? 'text-white' : 
                     swarmActive ? 'text-green-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {swarmActive ? bidAmount : '0'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#01060b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>UAV Telemetry & RTB Log</span>
                 {formationState === 'DEPLOYING' && <span className="text-cyan-400 animate-pulse">Launching Swarm...</span>}
                 {formationState === 'FORMATION_LOCK' && <span className="text-blue-400 animate-pulse">Airspace Locked</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-emerald-400 font-bold' : 'text-slate-400'
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
            
            {/* Airspace Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">STAGE 1 AIRSPACE</span>
                <span className="text-[8px] font-mono text-slate-400">UNITS: 500 | BATT: {Math.floor(droneBattery)}%</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center p-6">
                
                {/* Night Sky Background */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-black z-0"></div>
                
                {/* Stage Glow at Bottom */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-radial from-purple-900/40 to-transparent z-0 opacity-60"></div>

                {/* Drone Swarm Visualization */}
                <div className="relative w-full h-full z-10 flex items-center justify-center">
                  
                  {formationState === 'IDLE' && (
                    <div className="text-center opacity-30 mt-12">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Airspace Clear</span>
                    </div>
                  )}

                  {formationState === 'DEPLOYING' && (
                    <div className="w-48 h-48 relative animate-[spin_10s_linear_infinite] mt-8">
                       {Array.from({ length: 24 }).map((_, i) => (
                         <div 
                           key={i} 
                           className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"
                           style={{
                             top: `${Math.random() * 100}%`,
                             left: `${Math.random() * 100}%`,
                             animation: `ping ${Math.random() * 2 + 1}s infinite`
                           }}
                         ></div>
                       ))}
                    </div>
                  )}

                  {formationState === 'FORMATION_LOCK' && activeShape === 'RED_BULL_LOGO' && (
                    <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                       {/* Abstract Red Bull Logo via Dots */}
                       <div className="flex space-x-2">
                         {/* Left Bull */}
                         <div className="w-16 h-12 relative">
                           <div className="absolute top-2 right-0 w-8 h-8 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] animate-pulse"></div>
                           <div className="absolute top-0 right-4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                         </div>
                         {/* Sun */}
                         <div className="w-12 h-12 bg-yellow-400 rounded-full shadow-[0_0_20px_#facc15] z-0"></div>
                         {/* Right Bull */}
                         <div className="w-16 h-12 relative">
                           <div className="absolute top-2 left-0 w-8 h-8 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] animate-pulse"></div>
                           <div className="absolute top-0 left-4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                         </div>
                       </div>
                       <span className="text-[10px] font-black tracking-widest text-white mt-4 drop-shadow-[0_0_5px_#ffffff]">RED BULL</span>
                    </div>
                  )}

                  {formationState === 'FORMATION_LOCK' && activeShape === '3D_QR_CODE' && (
                    <div className="mt-8 animate-fade-in-up">
                       {/* Simulated QR Code via Grid of Dots */}
                       <div className="grid grid-cols-5 gap-1 p-2 border-4 border-cyan-400 shadow-[0_0_20px_#22d3ee]">
                         {Array.from({ length: 25 }).map((_, i) => (
                           <div 
                             key={i} 
                             className={`w-3 h-3 ${Math.random() > 0.4 ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-transparent'}`}
                           ></div>
                         ))}
                       </div>
                       <div className="text-center mt-4">
                         <span className="text-[8px] font-black tracking-widest text-cyan-400 bg-cyan-900/40 px-2 py-1 rounded">SCAN FOR VIP UPGRADE</span>
                       </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#05101a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">API Dispatch Triggers</span>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                   onClick={acceptBidRedBull}
                   disabled={!swarmActive || formationState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !swarmActive || formationState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-900 text-blue-400 hover:bg-blue-900/60'
                   }`}
                 >
                   Accept Bid: Red Bull
                 </button>
                 
                 <button 
                   onClick={deployQRCode}
                   disabled={!swarmActive || formationState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !swarmActive || formationState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                   }`}
                 >
                   Inject Override: QR Code
                 </button>
               </div>

               <button 
                 onClick={recallSwarm}
                 disabled={formationState === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                   formationState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Recall Swarm to Docks
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneSwarmAPI;
