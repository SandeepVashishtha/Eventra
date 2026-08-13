/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AcousticOfflinePayments = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('OFFLINE'); // OFFLINE, ONLINE
  const [transactionState, setTransactionState] = useState('IDLE'); // IDLE, TRANSMITTING, DECRYPTING, QUEUED
  
  // Acoustic Metrics
  const [freqHz, setFreqHz] = useState(19500); // Sub-audible
  const [payloadBytes, setPayloadBytes] = useState(256); // Encrypted token size
  const [queuedTx, setQueuedTx] = useState(142); // Offline transactions waiting to sync
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'CRIT', msg: 'LTE Cell Towers overloaded. POS Network Connection Lost.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'POS automatically failed over to Acoustic Edge Queuing mode.' }
  ]);

  // Visualizer State
  const [soundwaves, setSoundwaves] = useState([]);
  const [vendorScreen, setVendorScreen] = useState('AWAITING_PAYMENT');

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (transactionState === 'TRANSMITTING') {
              // Generate high-frequency soundwave ripples
              setSoundwaves(prev => [...prev, {
                  id: Date.now() + Math.random(),
                  radius: 10,
                  opacity: 1
              }].slice(-15)); // Keep lots of tight waves for high freq
              
              setFreqHz(19500 + Math.random() * 500); // Fluctuate frequency
          } else {
              setSoundwaves([]);
              setFreqHz(0);
          }

          // Animate waves expanding across the gap between phone and POS
          setSoundwaves(prev => prev.map(w => ({
              ...w,
              radius: w.radius + 5,
              opacity: w.opacity - 0.05
          })).filter(w => w.opacity > 0));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, transactionState]);

  const triggerPayment = () => {
      if (!systemActive || transactionState !== 'IDLE') return;
      
      if (networkStatus === 'ONLINE') {
          addLog('WARN', 'Network is ONLINE. Please use standard Apple Pay/NFC.');
          return;
      }
      
      setTransactionState('TRANSMITTING');
      setPayloadBytes(256);
      addLog('ACTION', 'Attendee initiating OFFLINE payment.');
      addLog('SYS', 'Generating signed, encrypted token. Broadcasting at 19.5kHz...');
      setVendorScreen('LISTENING');
      
      setTimeout(() => {
          if (!systemActive) return;
          
          setTransactionState('DECRYPTING');
          setVendorScreen('DECRYPTING');
          addLog('SUCCESS', 'Vendor iPad microphone captured acoustic payload.');
          addLog('SYS', 'Verifying local cryptography (RSA-2048)...');
          
          setTimeout(() => {
              if (!systemActive) return;
              
              setTransactionState('QUEUED');
              setVendorScreen('APPROVED_OFFLINE');
              setQueuedTx(prev => prev + 1);
              
              addLog('SUCCESS', 'Token verified. Transaction stored in Edge Queue.');
              
              setTimeout(() => {
                  if (systemActive) {
                      setTransactionState('IDLE');
                      setVendorScreen('AWAITING_PAYMENT');
                  }
              }, 2000);
              
          }, 1500);
          
      }, 2000);
  };

  const toggleNetwork = () => {
      if (!systemActive) return;
      
      if (networkStatus === 'OFFLINE') {
          setNetworkStatus('ONLINE');
          addLog('SUCCESS', 'LTE Connection Restored. Payment Gateway Reachable.');
          
          if (queuedTx > 0) {
              addLog('SYS', `Syncing ${queuedTx} queued offline transactions to backend...`);
              setVendorScreen('SYNCING');
              
              let syncCount = queuedTx;
              const syncInterval = setInterval(() => {
                  syncCount -= 10;
                  if (syncCount <= 0) {
                      clearInterval(syncInterval);
                      setQueuedTx(0);
                      setVendorScreen('AWAITING_PAYMENT');
                      addLog('SUCCESS', 'All offline transactions successfully synced and settled.');
                  } else {
                      setQueuedTx(Math.max(0, syncCount));
                  }
              }, 200);
          }
      } else {
          setNetworkStatus('OFFLINE');
          addLog('CRIT', 'Network Connection Lost. Failing over to Acoustic Edge Queuing mode.');
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setNetworkStatus('OFFLINE');
      setQueuedTx(142); // Start with some backlog
      addLog('SYS', 'Acoustic Data Transfer Protocol Initialized.');
    } else {
      setSystemActive(false);
      setTransactionState('IDLE');
      setVendorScreen('AWAITING_PAYMENT');
      addLog('WARN', 'Acoustic Protocol Disabled. Vendor cannot process offline payments.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070503] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💳</span> Offline Edge Queuing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Seamless Offline <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">Acoustic Payments</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When cell towers get overloaded by 100,000 attendees at festivals, standard mobile payments (Apple Pay, QR codes, Credit Cards) completely fail because the POS terminal cannot reach the payment gateway, crashing vendor sales. Eventra solves this by integrating a sub-audible acoustic data transfer protocol. When offline, the attendee's phone generates an encrypted, high-frequency sound pulse (inaudible to humans) containing a signed payment token. The vendor's iPad microphone picks up the pulse, verifies the local cryptography, and securely queues the transaction for processing once connectivity is restored.
          </p>

          <div className="bg-[#120a06] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> Acoustic Protocol Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Hardware Mics' : 'Enable Acoustic Protocol'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Network Status */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkStatus === 'OFFLINE' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   POS Gateway
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     networkStatus === 'OFFLINE' ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                   }`}>
                     {networkStatus}
                   </span>
                 </div>
               </div>

               {/* Frequency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 transactionState === 'TRANSMITTING' ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Carrier Freq
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     transactionState === 'TRANSMITTING' ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {freqHz === 0 ? '0' : (freqHz / 1000).toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kHz</span>
                 </div>
               </div>
               
               {/* Payload */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 transactionState === 'DECRYPTING' ? 'bg-cyan-950/40 border-cyan-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Tx Payload
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {systemActive ? payloadBytes : 0}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">B</span>
                 </div>
               </div>
               
               {/* Edge Queue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 queuedTx > 0 ? 'bg-purple-950/40 border-purple-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Edge Queue
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     queuedTx > 0 ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {queuedTx}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>POS Terminal Ledger</span>
                 {transactionState === 'TRANSMITTING' && <span className="text-amber-400 font-black animate-pulse">BROADCASTING TOKEN...</span>}
                 {transactionState === 'DECRYPTING' && <span className="text-cyan-400 font-black animate-pulse">VERIFYING LOCAL CRYPTO...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 'text-slate-400'
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
            
            {/* Payment UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#120a06]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">ACOUSTIC PAYMENTS</span>
                <span className="text-[8px] font-mono text-slate-400">19.5 kHz LINK</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-between px-6 pt-16 pb-8">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">POS TERMINAL OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col items-center justify-between">
                        
                        {/* Attendee Phone */}
                        <div className={`w-24 h-40 rounded-3xl border-4 flex flex-col items-center justify-center relative transition-all duration-300 z-30 ${
                            transactionState === 'TRANSMITTING' ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-slate-900 border-slate-700'
                        }`}>
                            <div className="w-10 h-1 bg-slate-800 rounded-full absolute top-2"></div>
                            
                            {transactionState === 'TRANSMITTING' ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <span className="text-2xl">🔊</span>
                                    <span className="text-[8px] font-black uppercase text-amber-400 mt-2">EMITTING</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center opacity-50">
                                    <span className="text-2xl">📱</span>
                                    <span className="text-[6px] font-black uppercase text-slate-400 mt-2">ATTENDEE</span>
                                </div>
                            )}

                            {/* Soundwave Origin point */}
                            <div className="absolute -bottom-4 w-2 h-2 rounded-full" id="wave-origin"></div>
                        </div>

                        {/* Gap for soundwaves */}
                        <div className="flex-1 w-full relative flex items-center justify-center -my-8 z-10 overflow-hidden">
                            {/* High-frequency tight soundwaves */}
                            {soundwaves.map(w => (
                                <div 
                                    key={w.id}
                                    className="absolute border border-amber-500/80 rounded-full pointer-events-none"
                                    style={{
                                        width: `${w.radius}px`,
                                        height: `${w.radius}px`,
                                        opacity: w.opacity,
                                        boxShadow: '0 0 5px rgba(245,158,11,0.5)',
                                        top: '0%', // Start near the phone
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Vendor iPad POS */}
                        <div className={`w-40 h-32 rounded-lg border-4 flex flex-col relative transition-all duration-300 z-30 ${
                            transactionState === 'DECRYPTING' ? 'bg-cyan-950/80 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]' :
                            vendorScreen === 'APPROVED_OFFLINE' ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' :
                            vendorScreen === 'SYNCING' ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]' :
                            'bg-slate-900 border-slate-700'
                        }`}>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-400 text-[6px] font-black px-2 py-0.5 rounded-full border border-slate-700">
                                VENDOR POS
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                                {vendorScreen === 'AWAITING_PAYMENT' && (
                                    <>
                                        <span className="text-xl mb-1">💳</span>
                                        <span className="text-[10px] font-bold text-slate-400">Total: $12.00</span>
                                        {networkStatus === 'OFFLINE' && <span className="text-[6px] font-black text-red-500 uppercase mt-1 animate-pulse">OFFLINE MODE ACTIVE</span>}
                                    </>
                                )}
                                {vendorScreen === 'LISTENING' && (
                                    <>
                                        <span className="text-xl mb-1 animate-pulse">🎤</span>
                                        <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Listening for Token...</span>
                                    </>
                                )}
                                {vendorScreen === 'DECRYPTING' && (
                                    <>
                                        <span className="text-xl mb-1">🔐</span>
                                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Decrypting...</span>
                                    </>
                                )}
                                {vendorScreen === 'APPROVED_OFFLINE' && (
                                    <>
                                        <span className="text-xl mb-1">✅</span>
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Approved</span>
                                        <span className="text-[6px] text-emerald-500 uppercase mt-1">Saved to Edge Queue</span>
                                    </>
                                )}
                                {vendorScreen === 'SYNCING' && (
                                    <>
                                        <span className="text-xl mb-1 animate-spin">🔄</span>
                                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Syncing Queue...</span>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#120a06] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Payment Flow</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={triggerPayment}
                   disabled={!systemActive || transactionState !== 'IDLE' || networkStatus === 'ONLINE'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || transactionState !== 'IDLE' || networkStatus === 'ONLINE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-400 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                   }`}
                 >
                   📱 Transmit Acoustic Token
                 </button>
               </div>

               <button 
                   onClick={toggleNetwork}
                   disabled={!systemActive || transactionState !== 'IDLE'}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transactionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     networkStatus === 'OFFLINE' ? 'bg-emerald-950/20 border-emerald-800 text-emerald-500 hover:bg-emerald-900/40' : 
                     'bg-red-950/20 border-red-800 text-red-500 hover:bg-red-900/40'
                   }`}
                 >
                   {networkStatus === 'OFFLINE' ? 'Restore Cell Network (Sync)' : 'Simulate Cell Network Crash'}
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AcousticOfflinePayments;
