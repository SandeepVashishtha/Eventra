/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BlockchainCarbonTracking = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [emissionsSource, setEmissionsSource] = useState('IDLE'); // IDLE, DIESEL_GENERATOR, SHUTTLE_FLEET
  
  // Carbon Metrics
  const [totalEmissions, setTotalEmissions] = useState(0); // Tons of CO2
  const [offsetsBurned, setOffsetsBurned] = useState(0); // BCT (Base Carbon Tonnes)
  const [netCarbon, setNetCarbon] = useState(0); // Total - Offsets
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Web3 Carbon Ledger (Polygon Network) Online.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting IoT Fuel Telemetry data streams.' }
  ]);

  // Visualizer State
  const [emissionNodes, setEmissionNodes] = useState([]);
  const [burning, setBurning] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (emissionsSource === 'DIESEL_GENERATOR') {
              // Heavy, steady emissions
              setTotalEmissions(prev => prev + 0.5);
              
              if (Math.random() > 0.4) {
                  setEmissionNodes(prev => [...prev, { id: Date.now(), x: 20, y: 30, type: 'CO2' }].slice(-10));
              }
              
          } else if (emissionsSource === 'SHUTTLE_FLEET') {
              // Sporadic, smaller emissions
              setTotalEmissions(prev => prev + 0.2);
              
              if (Math.random() > 0.2) {
                  setEmissionNodes(prev => [...prev, { id: Date.now(), x: 20, y: 70, type: 'CO2' }].slice(-10));
              }
          }
          
          // Animate nodes moving towards the ledger
          setEmissionNodes(prev => prev.map(node => ({
              ...node,
              x: node.x + 3
          })).filter(node => node.x < 50)); // Remove when they hit the ledger
          
          // Auto-Burn Logic (Keeping Net Carbon at 0)
          setNetCarbon(totalEmissions - offsetsBurned);
          
          if (netCarbon > 2) {
              setBurning(true);
              setOffsetsBurned(prev => prev + 2.5); // Buy/Burn tokens
              
              if (emissionsSource !== 'IDLE') {
                  addLog('ACTION', `Smart Contract: Auto-purchasing 2.5 BCT (Base Carbon Tonnes).`);
                  addLog('SUCCESS', `Tx Confirmed. Burning tokens to offset recent emissions.`);
              }
          } else {
              setBurning(false);
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, emissionsSource, totalEmissions, offsetsBurned, netCarbon]);

  const triggerEmissions = (type) => {
    if (!systemActive) return;
    
    setEmissionsSource(type);
    
    if (type === 'DIESEL_GENERATOR') {
        addLog('WARN', 'IoT Telemetry: Main Stage Diesel Gen #4 running at 90% load.');
        addLog('SYS', 'Logging fuel consumption (Liters/Hr) to immutable blockchain.');
    } else if (type === 'SHUTTLE_FLEET') {
        addLog('WARN', 'IoT Telemetry: 15 Shuttle Buses en route from parking lots.');
        addLog('SYS', 'Aggregating fleet OBD2 exhaust data. Hashing to ledger.');
    } else if (type === 'IDLE') {
        addLog('SYS', 'Emission sources powered down. Telemetry idling.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setEmissionsSource('IDLE');
      setTotalEmissions(0);
      setOffsetsBurned(0);
      setNetCarbon(0);
      addLog('SYS', 'Immutable Carbon Tracking Ledger Activated. Verifying Zero-Knowledge proofs.');
    } else {
      setSystemActive(false);
      setEmissionsSource('IDLE');
      setEmissionNodes([]);
      setBurning(false);
      addLog('CRIT', 'Ledger Offline. Carbon neutrality can no longer be cryptographically verified.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020804] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> Web3 Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-Verified <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500">Carbon Tracking</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals often claim to be "carbon neutral," but attendees have no way to verify if this is genuine or just corporate greenwashing. Eventra solves this by implementing a transparent, immutable carbon tracking ledger. Every diesel generator, shuttle bus, and food vendor reports their actual fuel consumption to Eventra's IoT network, automatically logging the data to a public blockchain. Eventra then uses smart contracts to automatically purchase and burn verified carbon offset tokens (e.g., Toucan Protocol) to perfectly match real-time emissions, providing absolute cryptographic proof of carbon neutrality.
          </p>

          <div className="bg-[#05100a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Net-Zero Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Blockchain Logging' : 'Initialize IoT Ledger'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Gross Emissions */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 emissionsSource !== 'IDLE' ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Gross CO2 Emitted
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     emissionsSource !== 'IDLE' ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(totalEmissions)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Tons</span>
                 </div>
               </div>

               {/* Tokens Burned */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 burning ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Tokens Burned
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     burning ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(offsetsBurned)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BCT</span>
                 </div>
               </div>
               
               {/* Net Carbon */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 netCarbon <= 2 && systemActive ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Net Carbon Status
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     netCarbon <= 2 && systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.max(0, netCarbon).toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Tons</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010302] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>On-Chain Emissions Ledger</span>
                 {emissionsSource !== 'IDLE' && !burning && <span className="text-orange-400 font-black animate-pulse">RECORDING EMISSIONS</span>}
                 {burning && <span className="text-red-500 font-black animate-pulse">BURNING OFFSET TOKENS</span>}
                 {netCarbon <= 2 && systemActive && !burning && <span className="text-emerald-400 font-black">100% CARBON NEUTRAL</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
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
            
            {/* Blockchain Flow Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#010804]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">SMART CONTRACT ESCROW</span>
                <span className="text-[8px] font-mono text-slate-400">NODE 1184</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center py-12 px-8 overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NETWORK UNREACHABLE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between">
                      
                      {/* Connection lines background */}
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0">
                          {/* Left (Sources) to Center (Ledger) */}
                          <path d="M 20% 30% L 50% 50%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="5 5" />
                          <path d="M 20% 70% L 50% 50%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="5 5" />
                          
                          {/* Center (Ledger) to Right (Burn Address) */}
                          <path d="M 50% 50% L 80% 50%" stroke={burning ? '#ef4444' : 'rgba(255,255,255,0.05)'} strokeWidth="4" strokeDasharray="5 5" className={burning ? 'animate-[flowRight_0.5s_linear_infinite]' : ''}/>
                      </svg>

                      {/* Data Particles (Emissions) */}
                      <div className="absolute inset-0 z-10 pointer-events-none">
                          {emissionNodes.map(node => (
                              <div 
                                  key={node.id}
                                  className="absolute w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,1)]"
                                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                              ></div>
                          ))}
                      </div>

                      <div className="flex justify-between w-full h-full items-center z-20">
                          
                          {/* Left: Emission Sources */}
                          <div className="w-1/4 h-full flex flex-col justify-around">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                                  emissionsSource === 'DIESEL_GENERATOR' ? 'bg-orange-900/50 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-[#111] border-slate-700'
                              }`}>
                                  <span className="text-xl">🏭</span>
                              </div>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                                  emissionsSource === 'SHUTTLE_FLEET' ? 'bg-orange-900/50 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-[#111] border-slate-700'
                              }`}>
                                  <span className="text-xl">🚌</span>
                              </div>
                          </div>

                          {/* Center: Blockchain Ledger */}
                          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-[#05100a] transition-all duration-300 shadow-2xl relative overflow-hidden ${
                              burning ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                              emissionsSource !== 'IDLE' ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'border-slate-800'
                          }`}>
                              <span className="text-2xl mb-1">⛓️</span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Web3 Ledger</span>
                          </div>

                          {/* Right: Offset Burn Address */}
                          <div className={`w-1/4 flex justify-end`}>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all relative overflow-hidden ${
                                  burning ? 'bg-red-900/50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-[#111] border-slate-700'
                              }`}>
                                  {burning && <div className="absolute inset-0 bg-red-500/20 animate-ping"></div>}
                                  <span className="text-xl relative z-10">🔥</span>
                              </div>
                          </div>

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes flowRight {
                        from { stroke-dashoffset: 10; }
                        to { stroke-dashoffset: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* IoT Triggers */}
            <div className="w-full bg-[#05100a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate IoT Data Stream</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerEmissions('DIESEL_GENERATOR')}
                   disabled={!systemActive || emissionsSource === 'DIESEL_GENERATOR'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || emissionsSource === 'DIESEL_GENERATOR' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   🏭 Power On Diesel Gen
                 </button>

                 <button 
                   onClick={() => triggerEmissions('SHUTTLE_FLEET')}
                   disabled={!systemActive || emissionsSource === 'SHUTTLE_FLEET'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || emissionsSource === 'SHUTTLE_FLEET' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   🚌 Dispatch Shuttle Fleet
                 </button>
               </div>
               
               <button 
                 onClick={() => triggerEmissions('IDLE')}
                 disabled={!systemActive || emissionsSource === 'IDLE'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                   !systemActive || emissionsSource === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                 }`}
               >
                 Power Down All Sources (Zero Emissions)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BlockchainCarbonTracking;
