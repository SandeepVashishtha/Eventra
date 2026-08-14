/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BGPAnycastRouting = () => {
  const [isAnycastEnabled, setIsAnycastEnabled] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingComplete, setRoutingComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Global network topology initialized. IP: 198.51.100.1 active.' }
  ]);

  const executeRouting = () => {
      setIsRouting(true);
      setRoutingComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'Ticket Drop Initiated. Massive traffic spike from US, EU, and Asia.');
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (isAnycastEnabled) {
              addLog('SYS', '[BGP Router] Broadcasting Anycast prefix 198.51.100.0/24 from all PoPs.');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', '[BGP] Calculating shortest AS-Path vectors...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SUCCESS', '[EU User] TCP packets routed to EU Data Center (Frankfurt).');
                      addLog('SUCCESS', '[Asia User] TCP packets routed to Asia Data Center (Tokyo).');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsRouting(false);
                          setRoutingComplete(true);
                          addLog('SUCCESS', 'Perfect Load Balancing Achieved. Global latency < 35ms.');
                      }, 1200);
                  }, 1200);
              }, 1200);
              
          } else {
              // Legacy DNS Geo-Routing
              addLog('WARN', '[DNS] Attempting Geo-Routing via Route53...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('CRIT', '[ISP Resolver] Cached stale TTL record. Returning US Data Center IP.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('WARN', '[EU User] Packets forced across Atlantic Ocean to US Data Center.');
                      addLog('WARN', '[Asia User] Packets forced across Pacific Ocean to US Data Center.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsRouting(false);
                          setRoutingComplete(true);
                          addLog('CRIT', 'US Data Center Overwhelmed (300% load). Global latency > 250ms.');
                      }, 1200);
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const toggleAnycast = () => {
      const newState = !isAnycastEnabled;
      setIsAnycastEnabled(newState);
      setRoutingComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'BGP Anycast enabled. A single IP is now broadcast from multiple global locations.');
      } else {
          addLog('CRIT', 'BGP Anycast disabled. Reverting to easily-cached DNS Unicast routing.');
      }
  };

  const resetDemo = () => {
      setIsRouting(false);
      setRoutingComplete(false);
      setActiveStep(0);
      addLog('SYS', 'Traffic stabilized. Awaiting next global event.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#030607] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌐</span> Core Internet Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            BGP Anycast Routing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500">Global Load Balancing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During a global ticket drop, Eventra currently relies on standard DNS Geo-routing to send European users to the EU servers and Asian users to the Asia servers. However, ISP DNS resolvers aggressively cache IP addresses (ignoring TTLs). This causes massive volumes of EU/Asia traffic to mistakenly route directly to the US load balancer, crushing the US cluster and causing massive global lag. Eventra solves this by implementing BGP Anycast routing. Instead of relying on DNS, the exact same IP address (`198.51.100.1`) is physically broadcast from all three data centers simultaneously. The fundamental Border Gateway Protocol (BGP) of the internet naturally routes user TCP packets to the physically nearest data center, eliminating DNS caching entirely.
          </p>

          <div className="bg-[#050e11] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Network Protocol Configuration
               </h3>
               {routingComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Global Network</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* BGP Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">IP Routing Strategy</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isAnycastEnabled ? 'Active: BGP Anycast (1 IP, Multiple Locations)' : 'Inactive: DNS Unicast (Unique IP per Location)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleAnycast}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isAnycastEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isAnycastEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeRouting}
                     disabled={isRouting || routingComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         routingComplete ? 'bg-slate-800 text-cyan-500 border-cyan-900 cursor-not-allowed' :
                         isRouting ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                     }`}
                 >
                     {isRouting ? 'Broadcasting TCP Packets...' : routingComplete ? 'Routing Simulation Complete' : "Simulate Global Ticket Drop Traffic"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020506] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>AS (Autonomous System) Logs</span>
                 {isRouting && <span className="text-cyan-400 font-black animate-pulse">ROUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">TCP Routing Visualizer</span>
                      <span className="text-xs text-white font-bold">Global Data Center Load Map</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Map Background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center">
                      <div className="text-[150px]">🗺️</div>
                  </div>

                  {/* Users (Top Layer) */}
                  <div className="w-full flex justify-between px-4 mt-2 z-20">
                      <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1">🇺🇸</span>
                          <span className="bg-black/80 px-2 py-0.5 rounded border border-slate-800 text-[8px] font-bold text-white uppercase tracking-widest">US Users</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1">🇪🇺</span>
                          <span className="bg-black/80 px-2 py-0.5 rounded border border-slate-800 text-[8px] font-bold text-white uppercase tracking-widest">EU Users</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1">🇯🇵</span>
                          <span className="bg-black/80 px-2 py-0.5 rounded border border-slate-800 text-[8px] font-bold text-white uppercase tracking-widest">Asia Users</span>
                      </div>
                  </div>

                  {/* Packets Animation Area */}
                  <div className="flex-1 relative w-full my-4 z-10">
                      
                      {/* US to US Line */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                          <path d="M 60 0 C 60 100, 60 150, 60 200" fill="none" stroke={!isAnycastEnabled && activeStep >= 4 ? '#ef4444' : '#10b981'} strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 3 ? 'opacity-50' : 'opacity-10'} />
                      </svg>
                      {activeStep >= 3 && activeStep < 5 && (
                          <div className={`absolute left-[54px] w-3 h-3 rounded-full z-30 animate-[drop_1s_ease-in_forwards] ${!isAnycastEnabled ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)]'}`}></div>
                      )}

                      {/* EU Logic */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                          {isAnycastEnabled ? (
                              <path d="M 185 0 C 185 100, 185 150, 185 200" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 3 ? 'opacity-50' : 'opacity-10'} />
                          ) : (
                              <path d="M 185 0 C 185 100, 70 150, 60 200" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 3 ? 'opacity-50' : 'opacity-10'} />
                          )}
                      </svg>
                      {activeStep >= 3 && activeStep < 5 && (
                          <div className={`absolute w-3 h-3 rounded-full z-30 ${isAnycastEnabled ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-[dropCenter_1s_ease-in_forwards]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[curveLeft_1s_ease-in_forwards]'}`}></div>
                      )}

                      {/* Asia Logic */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                          {isAnycastEnabled ? (
                              <path d="M 310 0 C 310 100, 310 150, 310 200" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 3 ? 'opacity-50' : 'opacity-10'} />
                          ) : (
                              <path d="M 310 0 C 310 100, 80 150, 60 200" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 3 ? 'opacity-50' : 'opacity-10'} />
                          )}
                      </svg>
                      {activeStep >= 3 && activeStep < 5 && (
                          <div className={`absolute w-3 h-3 rounded-full z-30 ${isAnycastEnabled ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-[dropRight_1s_ease-in_forwards]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[curveFarLeft_1s_ease-in_forwards]'}`}></div>
                      )}

                  </div>

                  {/* Data Centers (Bottom Layer) */}
                  <div className="w-full flex justify-between px-2 mb-4 z-20">
                      
                      {/* US DC */}
                      <div className={`w-[30%] flex flex-col items-center bg-slate-900 border-2 rounded-xl p-2 transition-all duration-500 ${
                          !isAnycastEnabled && activeStep >= 4 ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110' :
                          isAnycastEnabled && activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700'
                      }`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-white mb-1">US Data Center</span>
                          <span className={`text-[7px] font-mono mb-2 px-1 rounded ${isAnycastEnabled ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
                              {isAnycastEnabled ? 'IP: 198.51.100.1' : 'IP: 104.22.40.1'}
                          </span>
                          {/* Load Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${!isAnycastEnabled && activeStep >= 4 ? 'bg-red-500 w-full' : (activeStep >= 4 ? 'bg-emerald-500 w-1/3' : 'bg-slate-500 w-0')}`}></div>
                          </div>
                          {!isAnycastEnabled && activeStep >= 4 && <span className="text-[7px] text-red-500 font-bold mt-1 animate-pulse">300% LOAD</span>}
                      </div>

                      {/* EU DC */}
                      <div className={`w-[30%] flex flex-col items-center bg-slate-900 border-2 rounded-xl p-2 transition-all duration-500 ${
                          isAnycastEnabled && activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 opacity-70'
                      }`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-white mb-1">EU Data Center</span>
                          <span className={`text-[7px] font-mono mb-2 px-1 rounded ${isAnycastEnabled ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
                              {isAnycastEnabled ? 'IP: 198.51.100.1' : 'IP: 89.14.33.1'}
                          </span>
                          {/* Load Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${isAnycastEnabled && activeStep >= 4 ? 'bg-emerald-500 w-1/3' : 'bg-slate-500 w-0'}`}></div>
                          </div>
                      </div>

                      {/* Asia DC */}
                      <div className={`w-[30%] flex flex-col items-center bg-slate-900 border-2 rounded-xl p-2 transition-all duration-500 ${
                          isAnycastEnabled && activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 opacity-70'
                      }`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-white mb-1">Asia Data Center</span>
                          <span className={`text-[7px] font-mono mb-2 px-1 rounded ${isAnycastEnabled ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
                              {isAnycastEnabled ? 'IP: 198.51.100.1' : 'IP: 210.45.12.1'}
                          </span>
                          {/* Load Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${isAnycastEnabled && activeStep >= 4 ? 'bg-emerald-500 w-1/3' : 'bg-slate-500 w-0'}`}></div>
                          </div>
                      </div>

                  </div>

                  {/* Overlays */}
                  {routingComplete && !isAnycastEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-red-950/95 backdrop-blur-sm rounded-xl border border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">💥</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-red-500">Unbalanced Unicast</span>
                          <p className="text-[9px] text-slate-300 leading-relaxed font-mono">
                              ISP DNS resolvers cached the US IP address and ignored TTLs. As a result, European and Asian traffic bypassed their local servers and flooded the US Data Center, causing massive lag and an overload crash.
                          </p>
                      </div>
                  )}
                  
                  {routingComplete && isAnycastEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-emerald-950/95 backdrop-blur-sm rounded-xl border border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">🌐</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-emerald-400">Perfect Anycast Balance</span>
                          <p className="text-[9px] text-emerald-200 leading-relaxed font-mono">
                              By broadcasting the exact same IP (198.51.100.1) from all locations, the internet's BGP core routers naturally steered packets to the shortest physical path. Global load was distributed perfectly without relying on flawed DNS.
                          </p>
                      </div>
                  )}

                  {/* Custom Keyframes */}
                  <style>{`
                      @keyframes drop {
                          0% { top: 0; left: 54px; }
                          100% { top: 200px; left: 54px; opacity: 0; }
                      }
                      @keyframes dropCenter {
                          0% { top: 0; left: 180px; }
                          100% { top: 200px; left: 180px; opacity: 0; }
                      }
                      @keyframes dropRight {
                          0% { top: 0; left: 305px; }
                          100% { top: 200px; left: 305px; opacity: 0; }
                      }
                      @keyframes curveLeft {
                          0% { top: 0; left: 180px; }
                          100% { top: 200px; left: 54px; opacity: 0; }
                      }
                      @keyframes curveFarLeft {
                          0% { top: 0; left: 305px; }
                          100% { top: 200px; left: 54px; opacity: 0; }
                      }
                  `}</style>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050e11] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">BGP vs DNS Routing:</span>
               With BGP OFF, click Simulate Traffic. The system uses standard DNS Geo-routing. However, global ISPs notoriously ignore short DNS TTLs and cache records. Because of this, massive waves of European and Asian users end up with the IP for the US Data Center, routing entirely across the world and crushing a single server.<br/><br/>Toggle <span className="text-cyan-400 font-bold bg-slate-800 px-1 rounded">IP Routing Strategy</span> ON. Eventra now uses BGP Anycast. The same IP is broadcast everywhere. When an Asian user connects, the internet's physical routers mathematically determine that the Tokyo data center is the closest network path for that IP. Traffic balances perfectly.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BGPAnycastRouting;
