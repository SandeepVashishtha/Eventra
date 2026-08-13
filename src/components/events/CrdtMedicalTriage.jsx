/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrdtMedicalTriage = () => {
  const [networkStatus, setNetworkStatus] = useState('ONLINE'); // ONLINE, OFFLINE
  
  // CRDT Metrics
  const [localEdits, setLocalEdits] = useState(0); 
  const [conflictsAutoResolved, setConflictsAutoResolved] = useState(1402); 
  const [indexedDbUsage, setIndexedDbUsage] = useState(4.2); // MB
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Yjs CRDT Document initialized.' },
    { id: 2, time: '21:00:02', type: 'SUCCESS', msg: 'WebRTC / WebSocket provider connected to sync server.' }
  ]);

  // Visualizer State - Simulating two offline clients editing the same patient
  const [patientRecord, setPatientRecord] = useState({
      id: 'PT-8402',
      name: 'John Doe',
      vitals: 'HR: 85, BP: 120/80',
      medication: 'None'
  });
  
  const [medicAState, setMedicAState] = useState({ ...patientRecord });
  const [medicBState, setMedicBState] = useState({ ...patientRecord });
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let loop;
    
    if (networkStatus === 'ONLINE') {
      loop = setInterval(() => {
          // If online, keep states in sync instantly (simulated)
          if (medicAState.vitals !== medicBState.vitals || medicAState.medication !== medicBState.medication) {
             syncCrdt();
          }
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [networkStatus, medicAState, medicBState]);

  const toggleNetwork = () => {
      if (networkStatus === 'ONLINE') {
          setNetworkStatus('OFFLINE');
          addLog('CRIT', 'NETWORK LOST: Switching to Offline-First IndexedDB storage.');
          addLog('WARN', 'WebSockets disconnected. Edits will be locally queued.');
      } else {
          setNetworkStatus('ONLINE');
          addLog('SYS', 'NETWORK RESTORED: Re-establishing WebSocket connection...');
          setIsSyncing(true);
          
          setTimeout(() => {
              syncCrdt();
              setIsSyncing(false);
              addLog('SUCCESS', 'CRDT State Vectors exchanged. All offline edits merged perfectly.');
          }, 1500);
      }
  };

  const medicAEdit = () => {
      setMedicAState(prev => ({ ...prev, vitals: 'HR: 145 (Tachycardia), BP: 90/60' }));
      setLocalEdits(prev => prev + 1);
      setIndexedDbUsage(prev => prev + 0.1);
      
      if (networkStatus === 'OFFLINE') {
          addLog('ACTION', 'Medic A recorded elevated vitals (OFFLINE).');
      } else {
          addLog('ACTION', 'Medic A recorded elevated vitals.');
      }
  };

  const medicBEdit = () => {
      setMedicBState(prev => ({ ...prev, medication: 'Administered 500ml IV Saline' }));
      setLocalEdits(prev => prev + 1);
      setIndexedDbUsage(prev => prev + 0.1);
      
      if (networkStatus === 'OFFLINE') {
          addLog('ACTION', 'Medic B administered IV Saline (OFFLINE).');
      } else {
          addLog('ACTION', 'Medic B administered IV Saline.');
      }
  };

  const syncCrdt = () => {
      // The magic of CRDT: mathematically merging divergent states without data loss
      const mergedState = {
          ...patientRecord,
          vitals: medicAState.vitals !== patientRecord.vitals ? medicAState.vitals : medicBState.vitals,
          medication: medicBState.medication !== patientRecord.medication ? medicBState.medication : medicAState.medication
      };
      
      // If both edited different fields while offline, they both survive the merge.
      if (medicAState.vitals !== patientRecord.vitals && medicBState.medication !== patientRecord.medication) {
          setConflictsAutoResolved(prev => prev + 1);
      }

      setPatientRecord(mergedState);
      setMedicAState(mergedState);
      setMedicBState(mergedState);
      setLocalEdits(0);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#110505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💾</span> Offline-First Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            CRDT Offline-First <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-pink-500">Medical Triage Sync</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Medical tents often lose Wi-Fi during massive crowd surges. If two medics update a patient's vital signs offline using standard REST APIs, the data overwrites or conflicts when the connection returns, risking a fatal drug interaction. Eventra solves this by refactoring the Medical Triage app to use an offline-first architecture powered by Conflict-free Replicated Data Types (CRDTs). Medics can log vitals entirely offline in the browser. When the network restores, the protocol mathematically guarantees all edits merge without data loss.
          </p>

          <div className="bg-[#1a0a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎛️</span> Yjs CRDT Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   disabled={isSyncing}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isSyncing ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     networkStatus === 'ONLINE' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {isSyncing ? 'SYNCING...' : networkStatus === 'ONLINE' ? 'Kill Network (Simulate Outage)' : 'Restore Network'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Network Status */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkStatus === 'ONLINE' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   WebSocket State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     networkStatus === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'
                   }`}>
                     {networkStatus === 'ONLINE' ? 'CONNECTED' : 'DISCONNECTED'}
                   </span>
                 </div>
               </div>

               {/* Local Edits Queue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 localEdits > 0 ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Queued Edits
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     localEdits > 0 ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {localEdits}
                   </span>
                 </div>
               </div>
               
               {/* CRDT Conflicts Auto-Resolved */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Resolved
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {conflictsAutoResolved}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#0a0404] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>IndexedDB State Vector Ledger</span>
                 {isSyncing && <span className="text-blue-400 font-black animate-pulse">MERGING VECTORS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
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
            
            {/* Split Screen Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                networkStatus === 'OFFLINE' ? 'border-red-900/50 bg-[#140808]' : 'border-[#1e293b] bg-[#0a0f1c]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">CRDT DOCUMENT: {patientRecord.id}</span>
                <span className={`text-[8px] font-mono ${networkStatus === 'ONLINE' ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                    {networkStatus === 'ONLINE' ? '🟢 SYNCED' : '🔴 OFFLINE'}
                </span>
              </div>

              <div className="flex-1 flex flex-col pt-10">
                  
                  {/* Top Half: Medic A Tablet */}
                  <div className="flex-1 border-b-2 border-dashed border-slate-700 p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                              <span className="text-blue-400 mr-2">📱</span> Medic A (iPad)
                          </span>
                          <span className={`text-[8px] font-mono px-1 rounded ${medicAState !== patientRecord && networkStatus === 'OFFLINE' ? 'bg-amber-900/40 text-amber-500 border border-amber-800/50' : 'text-slate-500'}`}>
                              {medicAState !== patientRecord && networkStatus === 'OFFLINE' ? 'UNSYNCED EDITS' : 'UP TO DATE'}
                          </span>
                      </div>
                      
                      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner">
                          <div className="flex justify-between mb-2">
                              <span className="text-xs font-black text-white">{medicAState.name}</span>
                          </div>
                          
                          <div className={`text-[10px] font-mono p-2 rounded mb-2 border ${
                              medicAState.vitals !== patientRecord.vitals ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' : 'bg-black/30 border-slate-800 text-slate-400'
                          }`}>
                              VITALS: {medicAState.vitals}
                          </div>
                          
                          <div className={`text-[10px] font-mono p-2 rounded border bg-black/30 border-slate-800 text-slate-400`}>
                              MEDS: {medicAState.medication}
                          </div>
                      </div>
                      
                      <button 
                          onClick={medicAEdit}
                          disabled={medicAState.vitals !== patientRecord.vitals}
                          className={`mt-2 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition border ${
                              medicAState.vitals !== patientRecord.vitals ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' :
                              'bg-blue-900/30 border-blue-500/50 text-blue-400 hover:bg-blue-900/50'
                          }`}
                      >
                          Edit Vitals
                      </button>
                  </div>

                  {/* Bottom Half: Medic B Tablet */}
                  <div className="flex-1 p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                              <span className="text-purple-400 mr-2">📱</span> Medic B (iPhone)
                          </span>
                          <span className={`text-[8px] font-mono px-1 rounded ${medicBState !== patientRecord && networkStatus === 'OFFLINE' ? 'bg-amber-900/40 text-amber-500 border border-amber-800/50' : 'text-slate-500'}`}>
                              {medicBState !== patientRecord && networkStatus === 'OFFLINE' ? 'UNSYNCED EDITS' : 'UP TO DATE'}
                          </span>
                      </div>
                      
                      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner">
                          <div className="flex justify-between mb-2">
                              <span className="text-xs font-black text-white">{medicBState.name}</span>
                          </div>
                          
                          <div className={`text-[10px] font-mono p-2 rounded mb-2 border bg-black/30 border-slate-800 text-slate-400`}>
                              VITALS: {medicBState.vitals}
                          </div>
                          
                          <div className={`text-[10px] font-mono p-2 rounded border ${
                              medicBState.medication !== patientRecord.medication ? 'bg-purple-900/20 border-purple-500/50 text-purple-300' : 'bg-black/30 border-slate-800 text-slate-400'
                          }`}>
                              MEDS: {medicBState.medication}
                          </div>
                      </div>

                      <button 
                          onClick={medicBEdit}
                          disabled={medicBState.medication !== patientRecord.medication}
                          className={`mt-2 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition border ${
                              medicBState.medication !== patientRecord.medication ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' :
                              'bg-purple-900/30 border-purple-500/50 text-purple-400 hover:bg-purple-900/50'
                          }`}
                      >
                          Add Medication
                      </button>
                  </div>
                
              </div>
              
              {isSyncing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">CRDT Merging State Vectors...</span>
                  </div>
              )}
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#1a0a0a] p-4 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-red-400 uppercase block mb-1">Testing Instructions:</span>
               1. Kill the network.<br/>
               2. Edit on Medic A. Then edit on Medic B.<br/>
               3. Restore the network.<br/>
               <span className="text-slate-500 mt-2 block italic">Observe how both edits survive the merge without overwriting each other, a mathematical guarantee of CRDTs.</span>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrdtMedicalTriage;
