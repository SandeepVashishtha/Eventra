/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartFabricMerch = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [nfcState, setNfcState] = useState('IDLE'); // IDLE, SCANNING, AUTHENTIC, BOOTLEG
  
  // Blockchain Merch Metrics
  const [totalScans, setTotalScans] = useState(0); 
  const [authenticItems, setAuthenticItems] = useState(0);
  const [twinsMinted, setTwinsMinted] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:30:00', type: 'SYS', msg: 'Cryptographic NFC Hardware Node Online.' },
    { id: 2, time: '14:30:02', type: 'SYS', msg: 'Web3 Wallet connected: 0x8A...3F92' }
  ]);

  // Visualizer State
  const [minting, setMinting] = useState(false);
  const [scanPulse, setScanPulse] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          // Idle ambient pulse
          if (nfcState === 'IDLE') {
              setScanPulse(prev => !prev);
          }
      }, 1500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, nfcState]);

  const triggerNfcScan = (type) => {
    if (!systemActive || nfcState === 'SCANNING' || minting) return;
    
    setNfcState('SCANNING');
    setTotalScans(prev => prev + 1);
    addLog('SYS', 'NFC Hardware interrupt detected. Scanning smart threads...');
    
    // Simulate cryptographic verification delay
    setTimeout(() => {
        if (!systemActive) return;
        
        if (type === 'AUTHENTIC') {
            setNfcState('AUTHENTIC');
            setAuthenticItems(prev => prev + 1);
            addLog('SUCCESS', 'Hardware Signature Verified: 100% Authentic Merch.');
            
            // Trigger Minting Sequence
            setTimeout(() => {
                if (!systemActive) return;
                setMinting(true);
                addLog('ACTION', 'Deploying ERC-721 Smart Contract. Minting Digital Twin...');
                
                setTimeout(() => {
                    if (!systemActive) return;
                    setMinting(false);
                    setTwinsMinted(prev => prev + 1);
                    addLog('SUCCESS', 'Digital Twin NFT delivered to connected Web3 Metaverse Wallet.');
                    
                    setTimeout(() => { if(systemActive) setNfcState('IDLE'); }, 3000);
                }, 2000);
            }, 1000);
            
        } else if (type === 'BOOTLEG') {
            setNfcState('BOOTLEG');
            addLog('CRIT', 'ERROR: Invalid Cryptographic Signature.');
            addLog('WARN', 'Counterfeit Merch Detected. Bootleg item flagged in database.');
            
            setTimeout(() => { if(systemActive) setNfcState('IDLE'); }, 4000);
        }
    }, 1500);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setNfcState('IDLE');
      setTotalScans(0);
      setAuthenticItems(0);
      setTwinsMinted(0);
      setMinting(false);
      addLog('SYS', 'Smart-Fabric Authenticator Active. Awaiting NFC tap.');
    } else {
      setSystemActive(false);
      setNfcState('IDLE');
      setMinting(false);
      addLog('WARN', 'Authenticator Offline. Merch authenticity cannot be verified.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05040a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👕</span> Smart Textiles & Web3
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            NFC Merch Authenticity & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">Digital Twins</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Bootleggers sell fake festival merchandise in the parking lots, stealing revenue, and attendees have no way to prove their merch is officially limited edition. Eventra solves this by embedding encrypted, wash-proof NFC threads directly into the fabric of official apparel. When an attendee taps their phone to the hoodie's sleeve, Eventra verifies the cryptographic hardware signature, instantly proving authenticity. Additionally, it mints a "Digital Twin" NFT of the garment directly to their connected Web3 wallet, allowing their metaverse avatar to wear the exclusive merch.
          </p>

          <div className="bg-[#0a0812] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Web3 Merch Ledger
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable NFC Reader' : 'Enable Mobile Authenticator'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Total Scans */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 nfcState === 'SCANNING' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Garments Tapped
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     nfcState === 'SCANNING' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {totalScans}
                   </span>
                 </div>
               </div>

               {/* Authentic Items */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 nfcState === 'AUTHENTIC' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 nfcState === 'BOOTLEG' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Verified Authentic
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     nfcState === 'AUTHENTIC' ? 'text-emerald-400' : 
                     nfcState === 'BOOTLEG' ? 'text-red-500' : 'text-slate-600'
                   }`}>
                     {authenticItems}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Items</span>
                 </div>
               </div>
               
               {/* NFTs Minted */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 minting ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Digital Twins
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     minting ? 'text-yellow-400' : 'text-slate-600'
                   }`}>
                     {twinsMinted}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Minted</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Hardware Crypto Ledger</span>
                 {nfcState === 'SCANNING' && <span className="text-blue-400 font-black animate-pulse">DECRYPTING NFC THREADS...</span>}
                 {nfcState === 'BOOTLEG' && <span className="text-red-500 font-black animate-pulse">COUNTERFEIT FLAG</span>}
                 {minting && <span className="text-yellow-400 font-black animate-pulse">MINTING NFT...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* NFC & Minting Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0812]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">SMART-FABRIC SCANNER</span>
                <span className="text-[8px] font-mono text-slate-400">ERC-721 NODE</span>
              </div>

              <div className="flex-1 relative flex items-center justify-center overflow-hidden pt-8">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NFC RADIO OFF</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex items-center justify-center">
                      
                      {/* Central Object (The Hoodie) */}
                      <div className="relative z-10 flex flex-col items-center">
                          
                          {/* NFT Extractor Beam (When minting) */}
                          {minting && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-32 h-64 bg-gradient-to-t from-yellow-500/40 to-transparent -mb-8 z-0" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)' }}></div>
                          )}

                          {/* Hoodie SVG Simulation */}
                          <div className={`w-32 h-40 border-4 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10 ${
                              nfcState === 'BOOTLEG' ? 'bg-[#1a0a0a] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' :
                              nfcState === 'AUTHENTIC' || minting ? 'bg-[#0a1a0a] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' :
                              'bg-[#111] border-slate-700'
                          }`}>
                              <span className="text-6xl mb-4">🧥</span>
                              
                              {/* NFC Chip on sleeve (bottom right) */}
                              <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-slate-600 rounded-full flex items-center justify-center bg-slate-800">
                                  {systemActive && scanPulse && nfcState === 'IDLE' && (
                                      <div className="absolute inset-0 border-2 border-blue-400 rounded-full animate-ping opacity-50"></div>
                                  )}
                                  <span className="text-[8px]">NFC</span>
                              </div>

                              {/* Scanning Radar */}
                              {nfcState === 'SCANNING' && (
                                  <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-blue-500 rounded-full animate-ping pointer-events-none opacity-50"></div>
                              )}
                          </div>

                          <span className={`text-[10px] font-black uppercase tracking-widest mt-4 transition-colors ${
                              nfcState === 'BOOTLEG' ? 'text-red-500' :
                              nfcState === 'AUTHENTIC' ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                              {nfcState === 'IDLE' ? 'Festival Merch' :
                               nfcState === 'SCANNING' ? 'Decrypting NFC...' :
                               nfcState === 'BOOTLEG' ? 'Counterfeit Detected' : 'Verified Authentic'}
                          </span>
                      </div>

                      {/* Digital Twin (NFT) Minting Animation */}
                      {minting && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-[floatUp_2s_ease-out_forwards]">
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.8)] border border-yellow-200 flex items-center justify-center">
                                  <span className="text-2xl">🧥</span>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400 mt-2 bg-black/80 px-2 py-1 rounded">Digital Twin Minted</span>
                          </div>
                      )}

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes floatUp {
                        0% { transform: translate(-50%, 50px) scale(0.5); opacity: 0; }
                        20% { opacity: 1; }
                        80% { transform: translate(-50%, -80px) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -100px) scale(1); opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Triggers */}
            <div className="w-full bg-[#0a0812] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Physical NFC Tap</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerNfcScan('AUTHENTIC')}
                   disabled={!systemActive || nfcState !== 'IDLE' || minting}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || nfcState !== 'IDLE' || minting ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   ✅ Tap Authentic Hoodie
                 </button>

                 <button 
                   onClick={() => triggerNfcScan('BOOTLEG')}
                   disabled={!systemActive || nfcState !== 'IDLE' || minting}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || nfcState !== 'IDLE' || minting ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ❌ Tap Parking Lot Bootleg
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartFabricMerch;
