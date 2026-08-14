/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ActiveActiveDatabase = () => {
  const [isDistributedEnabled, setIsDistributedEnabled] = useState(false);
  const [isDisaster, setIsDisaster] = useState(false);
  const [disasterComplete, setDisasterComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Database topology initialized. Handling global read/write traffic.' }
  ]);

  const executeDisaster = () => {
      setIsDisaster(true);
      setDisasterComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'WARNING: Massive power grid failure in Virginia.');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('CRIT', 'us-east-1 Region completely offline.');
          
          setTimeout(() => {
              setActiveStep(3);
              
              if (isDistributedEnabled) {
                  addLog('SYS', '[Spanner] TrueTime™ sync detected node loss. Raft consensus active.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', '[Spanner] EU-West & AP-South maintain quorum (2/3 nodes).');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SUCCESS', 'Writes transparently re-routed to EU-West in <10ms. Zero data loss (RPO=0).');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsDisaster(false);
                              setDisasterComplete(true);
                              addLog('SUCCESS', 'Platform remained 100% online globally during tier-1 disaster.');
                          }, 1200);
                      }, 1200);
                  }, 1200);
                  
              } else {
                  // Legacy PostgreSQL (Active-Passive or Single Node)
                  addLog('WARN', '[PostgreSQL] Master node is DEAD. Connection pools exhausted.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('CRIT', '[PostgreSQL] Read replicas in EU cannot accept WRITE operations.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', 'FATAL: Global ticketing checkout API is fully offline.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsDisaster(false);
                              setDisasterComplete(true);
                              addLog('CRIT', 'Major Outage! Manual promotion required. Probable data loss for in-flight transactions.');
                          }, 1500);
                      }, 1500);
                  }, 1200);
              }
          }, 1500);
      }, 1000);
  };

  const toggleDistributed = () => {
      const newState = !isDistributedEnabled;
      setIsDistributedEnabled(newState);
      setDisasterComplete(false);
      setActiveStep(0);
      
      if (newState) {
          addLog('SUCCESS', 'Distributed SQL Engine (Google Cloud Spanner) enabled. Multi-region Active-Active topology.');
      } else {
          addLog('CRIT', 'Distributed SQL disabled. Reverted to monolithic PostgreSQL Active-Passive architecture.');
      }
  };

  const resetDemo = () => {
      setIsDisaster(false);
      setDisasterComplete(false);
      setActiveStep(0);
      addLog('SYS', 'us-east-1 power restored. Cluster re-synchronized.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💾</span> Database Architecture & DR
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Region Active-Active <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">Distributed SQL (Spanner)</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Currently, the core Eventra database (PostgreSQL) lives entirely in AWS `us-east-1`. While we have read-replicas in Europe, they cannot accept writes. When `us-east-1` experiences a massive regional outage, the entire global ticketing checkout system crashes hard. SREs must manually intervene to promote replicas, causing lengthy downtime and potential data loss for in-flight transactions. Eventra solves this by migrating to a Distributed SQL engine like Google Cloud Spanner or CockroachDB. By configuring a true Active-Active multi-region topology, writes can happen anywhere. If an entire continent goes dark, the Raft consensus algorithm maintains quorum across the remaining regions, providing 100% seamless uptime and RPO=0.
          </p>

          <div className="bg-[#120516] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Disaster Recovery Configuration
               </h3>
               {disasterComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Restore US-East Region</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Distributed Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">SQL Storage Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isDistributedEnabled ? 'Active: Cloud Spanner (Multi-Master / Paxos)' : 'Inactive: PostgreSQL (Active-Passive Single Writer)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleDistributed}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isDistributedEnabled ? 'bg-purple-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isDistributedEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeDisaster}
                     disabled={isDisaster || disasterComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         disasterComplete ? 'bg-slate-800 text-purple-500 border-purple-900 cursor-not-allowed' :
                         isDisaster ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                     }`}
                 >
                     {isDisaster ? 'Simulating Tier-1 Regional Outage...' : disasterComplete ? 'Outage Simulation Concluded' : "Simulate US-East-1 Regional Outage"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Distributed Consensus Log</span>
                 {isDisaster && <span className="text-purple-400 font-black animate-pulse">MONITORING QUORUM...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-purple-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Database Topology</span>
                      <span className="text-xs text-white font-bold">Multi-Region Write Paths</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Traffic Generator */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-700 shadow-lg z-30">
                      Global API Gateway (Writes)
                  </div>

                  {/* Network Paths */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                      <svg width="100%" height="100%">
                          {/* To US-East */}
                          <path d="M 210 30 C 210 100, 100 120, 100 200" fill="none" stroke={activeStep >= 2 ? '#ef4444' : '#a855f7'} strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 1 ? 'opacity-50' : 'opacity-20'} />
                          {/* To EU-West */}
                          <path d="M 210 30 C 210 100, 300 120, 300 160" fill="none" stroke={!isDistributedEnabled && activeStep >= 2 ? '#ef4444' : '#a855f7'} strokeWidth="2" strokeDasharray="4 4" className={activeStep >= 1 ? 'opacity-50' : 'opacity-20'} />
                          {/* Cross-Region Sync/Consensus Line */}
                          <path d="M 100 250 L 300 210" fill="none" stroke={activeStep >= 2 ? 'transparent' : '#10b981'} strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                          <path d="M 300 250 L 210 400" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                          <path d="M 100 300 L 210 400" fill="none" stroke={activeStep >= 2 ? 'transparent' : '#10b981'} strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                      </svg>

                      {/* Write Packets */}
                      {/* US Packet */}
                      {activeStep < 2 && (
                          <div className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)] animate-[travelLeft_1s_infinite]"></div>
                      )}
                      
                      {/* EU Packet (Only writes if Distributed is ON) */}
                      {isDistributedEnabled && activeStep < 6 && (
                          <div className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)] animate-[travelRight_1s_infinite_0.5s]"></div>
                      )}
                      
                      {/* App attempting to write to EU in legacy when US is dead */}
                      {!isDistributedEnabled && activeStep >= 4 && activeStep < 6 && (
                          <div className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-[travelRightCrash_1s_forwards]"></div>
                      )}
                  </div>

                  {/* US-East Region Node */}
                  <div className={`absolute top-[200px] left-6 w-32 border-2 rounded-xl p-3 flex flex-col z-20 transition-all duration-500 ${
                      activeStep >= 2 ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.4)] rotate-3' : 'border-purple-500 bg-purple-950/20'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-1 text-base">🇺🇸</span> US-East</span>
                      </span>
                      <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px]">
                          {activeStep >= 2 ? (
                              <div className="text-red-500 text-center font-bold animate-pulse">
                                  POWER FAILURE<br/>OFFLINE
                              </div>
                          ) : (
                              <div className="text-slate-400 text-center">
                                  <div className="text-purple-400 mb-1 font-bold">R/W Active</div>
                                  <div>{!isDistributedEnabled ? 'MASTER' : 'Paxos Node'}</div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* EU-West Region Node */}
                  <div className={`absolute top-[160px] right-6 w-32 border-2 rounded-xl p-3 flex flex-col z-20 transition-all duration-500 ${
                      !isDistributedEnabled && activeStep >= 4 ? 'border-red-500 bg-red-950/20' : 
                      isDistributedEnabled && activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105' : 'border-purple-500 bg-purple-950/20'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-1 text-base">🇪🇺</span> EU-West</span>
                      </span>
                      <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px] h-14">
                          {!isDistributedEnabled ? (
                              <div className="text-slate-400 text-center">
                                  <div className={activeStep >= 4 ? "text-red-500 font-bold animate-pulse" : "text-blue-400 mb-1 font-bold"}>
                                      {activeStep >= 4 ? 'READ ONLY (NO WRITES)' : 'Read-Only'}
                                  </div>
                                  <div>REPLICA</div>
                              </div>
                          ) : (
                              <div className="text-slate-400 text-center">
                                  <div className="text-emerald-400 mb-1 font-bold">R/W Active</div>
                                  <div className={activeStep >= 4 ? 'text-emerald-300 font-bold animate-pulse' : ''}>
                                      {activeStep >= 4 ? 'Serving Global Writes' : 'Paxos Node'}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* AP-South Region Node (Only visible for distributed consensus) */}
                  <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-32 border-2 rounded-xl p-3 flex flex-col z-20 transition-all duration-500 ${
                      !isDistributedEnabled ? 'opacity-20 grayscale' : 'border-purple-500 bg-purple-950/20'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-1 text-base">🇸🇬</span> AP-South</span>
                      </span>
                      <div className="bg-black/50 p-2 rounded border border-slate-800 flex-1 flex flex-col justify-center items-center font-mono text-[8px] h-10">
                          {isDistributedEnabled ? (
                              <div className="text-slate-400 text-center">
                                  <div className="text-emerald-400 mb-1 font-bold">R/W Active</div>
                                  <div>Paxos Node</div>
                              </div>
                          ) : (
                              <div className="text-slate-600">Not Configured</div>
                          )}
                      </div>
                  </div>
                  
                  {/* Consensus HUD */}
                  {isDistributedEnabled && (
                      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-xl border border-slate-700 flex flex-col items-center z-30 shadow-lg backdrop-blur-md">
                          <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mb-1">Raft/Paxos Quorum</span>
                          <div className="flex gap-1">
                              <div className={`w-3 h-3 rounded-full ${activeStep >= 2 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          </div>
                          <span className={`text-[9px] font-mono font-bold mt-1 ${activeStep >= 2 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                              {activeStep >= 2 ? '2/3 NODES (QUORUM OK)' : '3/3 NODES HEALTHY'}
                          </span>
                      </div>
                  )}

                  {/* Overlays */}
                  {disasterComplete && !isDistributedEnabled && (
                      <div className="absolute inset-x-4 top-1/3 bg-red-950/95 backdrop-blur-sm rounded-xl border border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">🔥</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-red-500">Global Outage</span>
                          <p className="text-[9px] text-red-200 leading-relaxed font-mono">
                              Because standard PostgreSQL only allows a single Primary writer node in US-East, the regional outage took the entire checkout API offline globally. SRE intervention required.
                          </p>
                      </div>
                  )}
                  
                  {disasterComplete && isDistributedEnabled && (
                      <div className="absolute inset-x-4 top-1/3 bg-emerald-950/95 backdrop-blur-sm rounded-xl border border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">✅</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-emerald-400">Zero Downtime</span>
                          <p className="text-[9px] text-emerald-200 leading-relaxed font-mono">
                              Cloud Spanner's Active-Active architecture maintained quorum between EU-West and AP-South. Database writes were transparently routed to surviving regions instantly, with zero data loss.
                          </p>
                      </div>
                  )}

                  {/* Custom Keyframes */}
                  <style>{`
                      @keyframes travelLeft {
                          0% { transform: translate(195px, 30px); opacity: 0; }
                          20% { opacity: 1; }
                          80% { opacity: 1; }
                          100% { transform: translate(100px, 200px); opacity: 0; }
                      }
                      @keyframes travelRight {
                          0% { transform: translate(215px, 30px); opacity: 0; }
                          20% { opacity: 1; }
                          80% { opacity: 1; }
                          100% { transform: translate(300px, 160px); opacity: 0; }
                      }
                      @keyframes travelRightCrash {
                          0% { transform: translate(215px, 30px); opacity: 0; }
                          20% { opacity: 1; }
                          95% { opacity: 1; transform: translate(300px, 160px); }
                          100% { transform: translate(300px, 160px) scale(3); opacity: 0; }
                      }
                  `}</style>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120516] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">High Availability & Distributed SQL:</span>
               With Spanner OFF, click Simulate Outage. Eventra relies on a monolithic PostgreSQL database in `us-east-1`. When AWS Virginia goes down, the European replicas cannot accept WRITE traffic (Active-Passive). The entire checkout system crashes globally.<br/><br/>Toggle <span className="text-purple-400 font-bold bg-slate-800 px-1 rounded">SQL Storage Engine</span> ON. Eventra now uses Distributed SQL (Spanner). Data is synchronously replicated across three global continents (Active-Active). When US-East dies, the Raft consensus protocol instantly determines that EU and AP still form a quorum (2/3 nodes). Database writes continue seamlessly globally. Zero downtime.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ActiveActiveDatabase;
