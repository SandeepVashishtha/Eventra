import React, { useState, useEffect } from 'react';

const EdgeTicketValidator = () => {
  const [networkStatus, setNetworkStatus] = useState('cloud'); // cloud, failing, edge
  const [syncedLedger, setSyncedLedger] = useState(14502);
  const [scansProcessed, setScansProcessed] = useState(3840);
  
  const [scanState, setScanState] = useState('idle'); // idle, scanning, valid, invalid
  
  const triggerNetworkFailure = () => {
    setNetworkStatus('failing');
    setTimeout(() => {
      setNetworkStatus('edge');
    }, 2000);
  };

  const restoreNetwork = () => {
    setNetworkStatus('cloud');
    // Simulate syncing local cache back to cloud
    setSyncedLedger(prev => prev + 15);
  };

  const simulateScan = () => {
    setScanState('scanning');
    
    setTimeout(() => {
      const isValid = Math.random() > 0.15; // 85% valid rate
      
      if (isValid) {
        setScanState('valid');
        setScansProcessed(prev => prev + 1);
      } else {
        setScanState('invalid');
      }
      
      setTimeout(() => {
        setScanState('idle');
      }, 1500);
    }, networkStatus === 'edge' ? 50 : 350); // Edge is actually faster due to local latency
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Infrastructure Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Kubernetes Edge Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Offline Edge <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Validation Kiosks</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Ensure 100% uptime for mission-critical ingress operations. When the venue's cloud internet connection goes down, Eventra's localized Kubernetes cluster architecture seamlessly switches to a local edge-computing mesh network. Kiosks instantly validate offline cryptographic signatures using the cached ledger without dropping a single scan.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Global Ingress Controller</h3>
               
               {networkStatus === 'cloud' ? (
                 <button onClick={triggerNetworkFailure} className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900">
                   Kill Cloud Connection
                 </button>
               ) : networkStatus === 'edge' ? (
                 <button onClick={restoreNetwork} className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                   Restore Cloud Sync
                 </button>
               ) : (
                 <span className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-900/50 text-amber-400 border border-amber-500/50">
                   Failing Over...
                 </span>
               )}
             </div>
             
             {/* Architecture Visualization */}
             <div className="flex-1 flex flex-col justify-center relative">
               
               {/* Cloud Node */}
               <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 p-4 rounded-xl border flex flex-col items-center transition-all duration-500 ${
                 networkStatus === 'cloud' ? 'bg-sky-900/20 border-sky-500/50' : 'bg-neutral-900 border-neutral-800 opacity-30'
               }`}>
                 <span className="text-2xl mb-1">☁️</span>
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">AWS Core Ledger</span>
               </div>

               {/* Connection Lines */}
               <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                 <div className="w-0.5 h-32 bg-neutral-800 relative">
                   {networkStatus === 'cloud' && <div className="absolute inset-0 bg-sky-500 animate-[pulse_1s_ease-in-out_infinite]"></div>}
                   {networkStatus === 'failing' && <div className="absolute inset-0 bg-rose-500 animate-[pulse_0.2s_ease-in-out_infinite]"></div>}
                 </div>
               </div>

               {/* Edge Cluster */}
               <div className="absolute bottom-0 inset-x-4 p-4 rounded-xl border border-neutral-700 bg-neutral-900 flex justify-between items-center relative overflow-hidden">
                 {networkStatus === 'edge' && (
                   <div className="absolute inset-0 bg-emerald-900/10 border-2 border-emerald-500/50 rounded-xl"></div>
                 )}
                 
                 <div className="relative z-10 flex flex-col items-start">
                   <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Local Venue k3s Cluster</span>
                   <span className={`text-xs font-mono font-bold ${networkStatus === 'edge' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                     {networkStatus === 'edge' ? 'ACTIVE (ISOLATED MODE)' : 'STANDBY (SYNCING)'}
                   </span>
                 </div>

                 <div className="relative z-10 text-right">
                   <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Cached Ledger</span>
                   <span className="text-lg font-black text-white font-mono">{syncedLedger.toLocaleString()} Keys</span>
                 </div>
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Kiosk UI Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full bg-neutral-800 rounded-3xl border-8 border-neutral-900 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* Kiosk Header Bar */}
            <div className={`p-3 border-b flex justify-between items-center z-20 transition-colors duration-500 ${
              networkStatus === 'cloud' ? 'bg-sky-900 border-sky-800' : 
              networkStatus === 'failing' ? 'bg-rose-900 border-rose-800' : 
              'bg-emerald-900 border-emerald-800'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-black uppercase tracking-widest">Gate 4 Kiosk</span>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[8px] font-mono text-white">ID: KSK-09</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] text-white/80 font-bold uppercase tracking-widest">
                  {networkStatus === 'cloud' ? 'Cloud Sync' : networkStatus === 'failing' ? 'Connection Lost' : 'Offline Edge'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus === 'cloud' ? 'bg-sky-400 animate-pulse' : 
                  networkStatus === 'failing' ? 'bg-rose-400' : 
                  'bg-emerald-400 animate-pulse'
                }`}></div>
              </div>
            </div>

            {/* Main Interface */}
            <div className="flex-1 relative bg-neutral-950 flex flex-col items-center justify-center p-6">
              
              {scanState === 'idle' ? (
                <div className="text-center w-full animate-fade-in">
                  <div className="w-32 h-32 border-4 border-dashed border-neutral-700 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-neutral-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-neutral-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-neutral-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-neutral-500 rounded-br-lg"></div>
                    <span className="text-5xl text-neutral-600">📱</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-white mb-2">Scan Ticket</h2>
                  <p className="text-neutral-500 text-sm mb-12">Hold QR code below the scanner.</p>

                  <button 
                    onClick={simulateScan}
                    className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition shadow-xl ${
                      networkStatus === 'failing' ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-white hover:bg-neutral-200 text-black shadow-white/10 hover:shadow-white/20'
                    }`}
                    disabled={networkStatus === 'failing'}
                  >
                    Simulate Scan
                  </button>
                </div>
              ) : scanState === 'scanning' ? (
                <div className="text-center w-full">
                  <div className="w-32 h-32 border-4 border-neutral-800 border-t-white rounded-full mx-auto mb-8 animate-spin"></div>
                  <h2 className="text-xl font-black text-white mb-2">Verifying Cryptography...</h2>
                  <p className="text-neutral-500 text-xs font-mono">
                    {networkStatus === 'cloud' ? 'Querying AWS Core Ledger via API' : 'Validating local ECDSA signature via Edge Cache'}
                  </p>
                  
                  {networkStatus === 'edge' && (
                    <div className="mt-6 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-3 py-2 rounded inline-block">
                      ⚡ 4ms Local Validation Latency
                    </div>
                  )}
                </div>
              ) : scanState === 'valid' ? (
                <div className="text-center w-full animate-fade-in-up">
                  <div className="w-full aspect-square bg-green-500 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] mb-8">
                    <span className="text-white text-7xl font-black mb-2">✓</span>
                    <span className="text-green-100 font-black uppercase tracking-widest text-lg">Valid Entry</span>
                  </div>
                  <h3 className="font-bold text-white text-xl mb-1">VIP Pass</h3>
                  <p className="text-neutral-400 text-sm">Welcome to Eventra.</p>
                </div>
              ) : (
                <div className="text-center w-full animate-fade-in-up">
                  <div className="w-full aspect-square bg-rose-600 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.4)] mb-8">
                    <span className="text-white text-7xl font-black mb-2">✕</span>
                    <span className="text-rose-200 font-black uppercase tracking-widest text-lg">Invalid Code</span>
                  </div>
                  <h3 className="font-bold text-white text-xl mb-1">Signature Failed</h3>
                  <p className="text-neutral-400 text-sm">Please visit the help desk.</p>
                </div>
              )}

            </div>
            
            {/* Stats Bar */}
            <div className="bg-neutral-900 h-16 border-t border-neutral-800 flex justify-between items-center px-6">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Total Processed</span>
              <span className="text-white font-black font-mono text-lg">{scansProcessed.toLocaleString()}</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EdgeTicketValidator;
