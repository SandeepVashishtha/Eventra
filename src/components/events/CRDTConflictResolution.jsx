/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CRDTConflictResolution = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState('IDLE'); // IDLE, SYNCING, MERGED, FLAGGED
  
  const [gateA, setGateA] = useState([]);
  const [gateB, setGateB] = useState([]);
  const [centralDB, setCentralDB] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'CRDT Node sync initialized. All scanners connected to primary.' }
  ]);

  const toggleNetwork = () => {
      setIsOffline(!isOffline);
      if (!isOffline) {
          addLog('CRIT', 'NETWORK OUTAGE: Fiber line cut. Scanners falling back to Offline-First mode.');
          setSyncStatus('IDLE');
      } else {
          addLog('SUCCESS', 'Network restored. Initiating CRDT state merge protocol...');
          executeSync();
      }
  };

  const scanTicket = (gateName, setter) => {
      if (!isOffline) {
          addLog('WARN', 'Please simulate a network outage first to demonstrate CRDT conflict resolution.');
          return;
      }
      
      const scanEvent = {
          ticketId: 'VIP-9942',
          scannedAt: Date.now(),
          gate: gateName,
          vectorClock: gateName === 'Gate A' ? [1, 0, 0] : [0, 1, 0] // Simplified vector clock simulation
      };

      setter(prev => [...prev, scanEvent]);
      addLog('ACTION', `Ticket VIP-9942 scanned OFFLINE at ${gateName}. Stored locally.`);
  };

  const executeSync = () => {
      setSyncStatus('SYNCING');
      
      setTimeout(() => {
          addLog('SYS', 'Merging disparate state vectors via Commutative Replicated Data Types (CRDT)...');
          
          setTimeout(() => {
              // Combine and sort by timestamp
              const merged = [...centralDB, ...gateA, ...gateB].sort((a, b) => a.scannedAt - b.scannedAt);
              setCentralDB(merged);
              setGateA([]);
              setGateB([]);
              
              if (gateA.length > 0 && gateB.length > 0) {
                  setSyncStatus('FLAGGED');
                  addLog('CRIT', 'DOUBLE-SCAN DETECTED: Ticket VIP-9942 was scanned at both gates during outage.');
                  addLog('SUCCESS', 'CRDT merge successful. Fraudulent scans mathematically preserved, NOT overwritten.');
              } else {
                  setSyncStatus('MERGED');
                  addLog('SUCCESS', 'CRDT merge complete. Eventual consistency achieved.');
              }
          }, 1500);
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02080a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Distributed Systems & Offline-First
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Region CRDT <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500">Conflict Resolution Simulator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            If the festival's internet goes down, offline ticket scanners will sync conflicting states when reconnected. A malicious user might exploit the outage by scanning their ticket at Gate A, then having a friend scan the same ticket at Gate B. Eventra solves this using a Conflict-Free Replicated Data Type (CRDT) architecture. Instead of standard SQL overwriting the conflict and losing the fraud data, the CRDT mathematically merges the eventual consistency, preserving all scans and instantly flagging the fraud when the network restores.
          </p>

          <div className="bg-[#050f14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Network Operator Console
               </h3>
               
               <button 
                   onClick={toggleNetwork}
                   disabled={syncStatus === 'SYNCING'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isOffline ? 'bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500' : 'bg-rose-600 text-white hover:bg-rose-500 border border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
               >
                   {isOffline ? '🌐 Restore Network' : '✂️ Cut Fiber Line (Go Offline)'}
               </button>
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 {/* Gate A Simulator */}
                 <div className={`border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                     isOffline ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-50 pointer-events-none'
                 }`}>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Gate A Scanner (Offline)</span>
                     <button 
                         onClick={() => scanTicket('Gate A', setGateA)}
                         className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg text-xs font-bold w-full transition shadow flex items-center justify-center"
                     >
                         <span className="mr-2">📱</span> Scan VIP-9942
                     </button>
                     <div className="mt-4 text-[9px] font-mono text-teal-500 bg-teal-950 px-2 py-1 rounded">
                         Local Queue: {gateA.length}
                     </div>
                 </div>

                 {/* Gate B Simulator */}
                 <div className={`border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                     isOffline ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-50 pointer-events-none'
                 }`}>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Gate B Scanner (Offline)</span>
                     <button 
                         onClick={() => scanTicket('Gate B', setGateB)}
                         className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg text-xs font-bold w-full transition shadow flex items-center justify-center"
                     >
                         <span className="mr-2">📱</span> Scan VIP-9942
                     </button>
                     <div className="mt-4 text-[9px] font-mono text-cyan-500 bg-cyan-950 px-2 py-1 rounded">
                         Local Queue: {gateB.length}
                     </div>
                 </div>
                 
             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Distributed State Logs</span>
                 {syncStatus === 'SYNCING' && <span className="text-teal-400 font-black animate-pulse">MERGING CRDT...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* Distributed Topology Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Eventual Consistency Monitor</span>
                      <span className="text-xs text-white font-bold">CRDT Database State</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Network Status Indicator */}
                  <div className={`absolute top-4 right-4 flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      isOffline ? 'bg-rose-950 text-rose-500 border border-rose-900/50' : 'bg-emerald-950 text-emerald-500 border border-emerald-900/50'
                  }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${isOffline ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {isOffline ? 'Network Offline' : 'Network Online'}
                  </div>

                  {/* Scanners Top Row */}
                  <div className="w-full flex justify-between mt-8 z-20">
                      
                      {/* Gate A Node */}
                      <div className={`flex flex-col items-center w-32 relative transition-all duration-500`}>
                          <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl mb-2 relative ${
                              isOffline ? 'bg-slate-800 border-rose-500/50' : 'bg-slate-800 border-emerald-500/50'
                          }`}>
                              📱
                              {gateA.length > 0 && (
                                  <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {gateA.length}
                                  </div>
                              )}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Gate A Node</span>
                      </div>

                      {/* Connection Lines */}
                      <div className="flex-1 flex items-center justify-center relative">
                          <div className={`w-full h-1 border-t-2 ${isOffline ? 'border-rose-900 border-dashed' : 'border-emerald-500/30 border-solid'}`}></div>
                          
                          {/* Sync Animation */}
                          {syncStatus === 'SYNCING' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-24 h-24 border-2 border-teal-500 border-dashed rounded-full animate-[spin_2s_linear_infinite] opacity-50"></div>
                                  <div className="w-16 h-16 border-2 border-cyan-500 border-t-transparent rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
                              </div>
                          )}
                      </div>

                      {/* Gate B Node */}
                      <div className={`flex flex-col items-center w-32 relative transition-all duration-500`}>
                          <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl mb-2 relative ${
                              isOffline ? 'bg-slate-800 border-rose-500/50' : 'bg-slate-800 border-emerald-500/50'
                          }`}>
                              📱
                              {gateB.length > 0 && (
                                  <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                      {gateB.length}
                                  </div>
                              )}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Gate B Node</span>
                      </div>

                  </div>

                  {/* Central Database Record */}
                  <div className="w-full mt-auto bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-10 transition-all duration-500">
                      <div className={`p-2 text-center text-[10px] font-black uppercase tracking-widest border-b border-slate-700 transition-colors ${
                          syncStatus === 'FLAGGED' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                          Primary DB: Ticket 'VIP-9942' Log
                      </div>
                      <div className="p-4 bg-slate-950 min-h-[120px] flex flex-col justify-end space-y-2">
                          
                          {centralDB.length === 0 ? (
                              <div className="text-center text-[10px] text-slate-600 font-mono italic my-auto">
                                  No scans recorded on primary DB.
                              </div>
                          ) : (
                              centralDB.map((scan, i) => (
                                  <div key={i} className={`text-[9px] font-mono p-2 rounded border flex justify-between items-center animate-fade-in-up ${
                                      syncStatus === 'FLAGGED' ? 'bg-rose-900/10 border-rose-900/50 text-rose-300' : 'bg-teal-900/10 border-teal-900/50 text-teal-300'
                                  }`}>
                                      <span className="opacity-70">[{new Date(scan.scannedAt).toISOString().split('T')[1].slice(0,-1)}]</span>
                                      <span className="font-bold">Scanned at: {scan.gate}</span>
                                      <span className="bg-slate-900 px-1 rounded opacity-50">vClock:[{scan.vectorClock.join(',')}]</span>
                                  </div>
                              ))
                          )}
                          
                      </div>
                  </div>

                  {/* Fraud Overlay */}
                  {syncStatus === 'FLAGGED' && (
                      <div className="absolute bottom-36 left-4 right-4 bg-rose-950/90 border border-rose-500/50 rounded-xl p-4 backdrop-blur-md animate-[bounce_0.5s_ease-out]">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Fraud Detected</span>
                              <span className="text-2xl">🚨</span>
                          </div>
                          <p className="text-[10px] text-rose-200/80">CRDT state merge reveals impossible double-scan physics (same ticket at two physical gates during network partition). Account flagged for security review.</p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050f14] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">Eventual Consistency (CRDT):</span>
               Click <span className="text-white font-bold bg-rose-600 px-1 rounded">Cut Fiber Line</span> to force scanners offline. Simulate a fraudster by scanning <span className="text-white font-bold bg-slate-800 px-1 rounded">VIP-9942</span> at Gate A, then having their friend scan the same ticket at Gate B. When you <span className="text-white font-bold bg-emerald-600 px-1 rounded">Restore Network</span>, a standard SQL database would just overwrite the timestamp. Our CRDT mathematically merges the independent offline vectors, permanently preserving both events and mathematically proving the fraud.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CRDTConflictResolution;
