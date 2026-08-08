/* eslint-disable */
import React, { useState, useEffect } from 'react';

const P2PMeshTicketing = () => {
  const [meshActive, setMeshActive] = useState(false);
  const [networkState, setNetworkState] = useState('ONLINE'); // ONLINE, OFFLINE_MESH
  
  // Mesh Metrics
  const [activeScanners, setActiveScanners] = useState(0);
  const [syncedState, setSyncedState] = useState(100); // % of devices synced
  const [doubleScansPrevented, setDoubleScansPrevented] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Gate Scanners connected to Central AWS Server.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Merkle Tree cache downloaded locally to all devices.' }
  ]);

  // Scan simulation state
  const [scanStatus, setScanStatus] = useState(null); // VALID, INVALID, DOUBLE
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let loop;
    
    if (meshActive && networkState === 'OFFLINE_MESH') {
      // Simulate continuous P2P syncing while offline
      loop = setInterval(() => {
          setSyncedState(prev => {
             const drop = Math.random() > 0.8 ? 5 : 0;
             const recover = Math.random() > 0.4 ? 2 : 0;
             return Math.max(90, Math.min(100, prev - drop + recover));
          });
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [meshActive, networkState]);

  const simulateScan = (type) => {
    if (!meshActive || scanning) return;
    
    setScanning(true);
    setScanStatus(null);
    
    // Simulating zk-proof verification time
    setTimeout(() => {
        setScanning(false);
        setScanStatus(type);
        
        if (type === 'VALID') {
            addLog('SUCCESS', 'zk-Proof Valid. Cryptographic signature matches local Merkle root.');
            if (networkState === 'OFFLINE_MESH') {
                addLog('WEB3', 'Broadcasting state change to P2P Mesh network (Device #4 -> Device #12).');
            }
        } else if (type === 'DOUBLE') {
            addLog('CRIT', 'DOUBLE SCAN DETECTED. Ticket 0x8F2 was scanned at Gate C 42 seconds ago.');
            setDoubleScansPrevented(prev => prev + 1);
        } else {
            addLog('WARN', 'INVALID SIGNATURE. Cryptographic proof failed verification.');
        }
        
        // Clear status after a moment
        setTimeout(() => setScanStatus(null), 2500);
    }, 600);
  };

  const cutInternet = () => {
    if (!meshActive) return;
    setNetworkState('OFFLINE_MESH');
    setSyncedState(98);
    addLog('CRIT', 'AWS CONNECTION LOST. Main ISP fiber cut detected.');
    addLog('ACTION', 'Failing over to Local P2P Mesh Network. Zero-Knowledge validation active.');
  };

  const restoreInternet = () => {
    if (!meshActive) return;
    setNetworkState('ONLINE');
    setSyncedState(100);
    addLog('SUCCESS', 'AWS connection restored. Uploading local P2P state cache to central server.');
  };

  const toggleMesh = () => {
    if (!meshActive) {
      setMeshActive(true);
      setActiveScanners(45);
      addLog('SYS', 'Ticketing Scanners booted. Synchronizing initial state.');
    } else {
      setMeshActive(false);
      setActiveScanners(0);
      setNetworkState('ONLINE');
      addLog('WARN', 'Ticketing System Offline. Gates halted.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07090b] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: System Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔗</span> Offline Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized P2P Mesh <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ticketing Verification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the internet goes down at the front gates, central AWS ticket servers fail, causing massive lines and forcing security to blindly wave unverified people through. Eventra fixes this with a decentralized zero-knowledge (zk) rollup ticketing system. Staff scanning devices operate on a local mesh network, cryptographically verifying ticket signatures against a locally cached Merkle tree. Even with zero internet connection, the devices synchronize state peer-to-peer across the gates, preventing double-scans entirely offline and ensuring the festival entrance never halts.
          </p>

          <div className="bg-[#0b1016] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📡</span> P2P Gate Network Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMesh}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     meshActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {meshActive ? 'Power Down Scanners' : 'Boot Scanner Fleet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Network Status */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkState === 'OFFLINE_MESH' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 meshActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Uplink State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none ${
                     networkState === 'OFFLINE_MESH' ? 'text-orange-400 animate-pulse' :
                     meshActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {networkState}
                   </span>
                 </div>
               </div>

               {/* Active Scanners */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 meshActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   P2P Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     meshActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeScanners}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Devices</span>
                 </div>
               </div>
               
               {/* Double Scans Prevented */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 doubleScansPrevented > 0 ? 'bg-red-950/30 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Frauds Blocked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     doubleScansPrevented > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {doubleScansPrevented}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Scans</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05070a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cryptographic Verification Log</span>
                 {networkState === 'OFFLINE_MESH' && <span className="text-orange-400 animate-pulse">P2P MESH ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' :
                       log.type === 'WEB3' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Handheld Scanner Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${networkState === 'OFFLINE_MESH' ? 'bg-[#0f0900]' : 'bg-slate-900'}`}>
              
              {/* Scanner Notch / Camera area */}
              <div className="absolute top-0 inset-x-0 h-6 bg-[#1e293b] rounded-b-2xl z-30 w-32 mx-auto flex justify-center items-center">
                  <div className="w-16 h-2 bg-black rounded-full"></div>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Connection Status Bar */}
                <div className={`w-full px-3 py-1.5 rounded-full flex justify-between items-center mb-4 ${
                    networkState === 'OFFLINE_MESH' ? 'bg-orange-950 border border-orange-500/50' : 'bg-slate-800 border border-slate-700'
                }`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${networkState === 'OFFLINE_MESH' ? 'text-orange-400' : 'text-slate-400'}`}>
                        {networkState === 'OFFLINE_MESH' ? 'P2P MESH MODE' : 'AWS CLOUD SYNC'}
                    </span>
                    <div className="flex items-center space-x-1">
                        <span className="text-[8px] font-mono text-slate-500">Nodes: {activeScanners}</span>
                        <div className={`w-2 h-2 rounded-full ${networkState === 'OFFLINE_MESH' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    </div>
                </div>

                {/* Scan Area UI */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    
                    {!meshActive ? (
                       <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest">DEVICE OFFLINE</span>
                    ) : scanning ? (
                        <div className="flex flex-col items-center">
                            {/* Scanning Animation */}
                            <div className="w-32 h-32 border-2 border-dashed border-blue-500 rounded-lg relative overflow-hidden mb-4">
                                <div className="absolute top-0 inset-x-0 h-1 bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-scan"></div>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 animate-pulse">Computing zk-Proof...</span>
                        </div>
                    ) : scanStatus === 'VALID' ? (
                        <div className="flex flex-col items-center animate-bounce">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                <span className="text-4xl text-white">✓</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-emerald-400">ACCESS GRANTED</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1">Sig Valid: 0x9A4...</span>
                        </div>
                    ) : scanStatus === 'DOUBLE' ? (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                                <span className="text-4xl text-white">✖</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-red-500">DOUBLE SCAN</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1">Ticket already used.</span>
                        </div>
                    ) : scanStatus === 'INVALID' ? (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                                <span className="text-4xl text-white">!</span>
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-widest text-orange-400">INVALID PROOF</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1">Cryptographic mismatch.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-30">
                            <div className="w-32 h-32 border-2 border-slate-500 rounded-lg mb-4"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">READY TO SCAN</span>
                        </div>
                    )}
                </div>

                {/* Mesh Status Footer (Only in offline mode) */}
                {meshActive && networkState === 'OFFLINE_MESH' && (
                    <div className="mt-auto bg-orange-950/50 border border-orange-900/50 p-2 rounded flex flex-col items-center">
                        <span className="text-[8px] font-mono text-orange-400 mb-1">Local Mesh Sync: {syncedState.toFixed(1)}%</span>
                        <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${syncedState}%` }}></div>
                        </div>
                    </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b1016] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Network Disruption & Hardware Simulator</span>
               
               {/* Internet Cut Controls */}
               <div className="flex space-x-2 mb-4 border-b border-slate-800 pb-4">
                 <button 
                   onClick={cutInternet}
                   disabled={!meshActive || networkState === 'OFFLINE_MESH'}
                   className={`flex-1 py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !meshActive || networkState === 'OFFLINE_MESH' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-400 hover:bg-red-900/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                   }`}
                 >
                   Simulate ISP Outage
                 </button>
                 <button 
                   onClick={restoreInternet}
                   disabled={!meshActive || networkState === 'ONLINE'}
                   className={`flex-1 py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !meshActive || networkState === 'ONLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60'
                   }`}
                 >
                   Restore AWS Link
                 </button>
               </div>

               {/* Scan Triggers */}
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => simulateScan('VALID')}
                   disabled={!meshActive || scanning}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !meshActive || scanning ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-900 text-blue-400 hover:bg-blue-900/60'
                   }`}
                 >
                   Scan Valid Ticket
                 </button>
                 
                 <button 
                   onClick={() => simulateScan('DOUBLE')}
                   disabled={!meshActive || scanning}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !meshActive || scanning ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-400 hover:bg-red-900/60'
                   }`}
                 >
                   Scan Used Ticket
                 </button>

                 <button 
                   onClick={() => simulateScan('INVALID')}
                   disabled={!meshActive || scanning}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !meshActive || scanning ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Scan Fake Ticket
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default P2PMeshTicketing;
