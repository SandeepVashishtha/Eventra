/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VIPPOAPMinting = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [mintingStatus, setMintingStatus] = useState('IDLE'); // IDLE, SCANNING, HASHING, MINTING, SUCCESS
  const [photoCaptured, setPhotoCaptured] = useState(false);
  
  const [blockLog, setBlockLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'POAP Smart Contract deployed to Polygon Mainnet.' },
    { id: 2, time: '18:00:05', type: 'SYS', msg: 'Awaiting VIP wristband RFID scan.' }
  ]);

  const initiateScan = () => {
    if (scannerActive && mintingStatus === 'IDLE') {
      setMintingStatus('SCANNING');
      addLog('SCAN', 'RFID Scan detected: VIP Pass #8492 (0x7A1...9F4c).');
      
      setTimeout(() => {
        setMintingStatus('HASHING');
        setPhotoCaptured(true);
        addLog('ACTION', 'Official Meet & Greet photo captured.');
        addLog('SYS', 'Generating SHA-256 cryptographic hash of image file...');
        
        setTimeout(() => {
          setMintingStatus('MINTING');
          addLog('WEB3', 'Hash: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4');
          addLog('TX', 'Initiating Mint transaction to Polygon network.');
          
          setTimeout(() => {
            setMintingStatus('SUCCESS');
            addLog('SUCCESS', 'POAP Minted! Transferred to attendee wallet 0x7A1...9F4c.');
            
            setTimeout(() => {
              setMintingStatus('IDLE');
              setPhotoCaptured(false);
            }, 3000);
            
          }, 2000);
        }, 1500);
      }, 1000);
    }
  };

  const toggleScanner = () => {
    if (!scannerActive) {
      setScannerActive(true);
      addLog('SYS', 'RFID Scanner activated at ODESZA VIP Tent.');
    } else {
      setScannerActive(false);
      setMintingStatus('IDLE');
      setPhotoCaptured(false);
      addLog('WARN', 'Scanner offline. Halting POAP distribution.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setBlockLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Minting Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💎</span> Web3 Provenance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-Verified <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">VIP Meet & Greet</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Fans spend thousands of dollars on "VIP Meet & Greet" packages, but historically only receive a standard email with a JPEG attachment as proof, which can be easily faked or lost. Eventra solves this using Web3 cryptographic provenance. When a VIP attendee scans their RFID wristband at the photo booth, the system automatically captures the official photo, generates a SHA-256 hash of the image, and mints a POAP (Proof of Attendance Protocol) NFT directly to their wallet on the Polygon blockchain, creating permanent, verifiable proof of their experience.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🔗</span> Polygon Network Node
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleScanner}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     scannerActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {scannerActive ? 'Disable Scanner' : 'Initialize VIP Minting'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Minting Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 mintingStatus === 'MINTING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-inner' :
                 mintingStatus === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Smart Contract State</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     mintingStatus === 'MINTING' ? 'text-fuchsia-400' :
                     mintingStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {mintingStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {mintingStatus === 'IDLE' ? 'Awaiting RFID Event' : 
                      mintingStatus === 'SCANNING' ? 'Reading Wallet Address' : 
                      mintingStatus === 'HASHING' ? 'Encrypting Image Data' : 
                      mintingStatus === 'MINTING' ? 'Awaiting Block Confirmation' : 'Transaction Verified'}
                   </span>
                 </div>
               </div>

               {/* Cryptographic Hash View */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center space-y-3">
                 
                 <div>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Target Address</span>
                   <span className={`text-xs font-mono font-bold ${mintingStatus !== 'IDLE' ? 'text-pink-400' : 'text-slate-600'}`}>
                     {mintingStatus !== 'IDLE' ? '0x7A14b98...9F4c' : '-----------------'}
                   </span>
                 </div>

                 <div>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Payload SHA-256 Hash</span>
                   <span className={`text-[10px] font-mono break-all leading-tight ${mintingStatus === 'MINTING' || mintingStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-600'}`}>
                     {mintingStatus === 'MINTING' || mintingStatus === 'SUCCESS' 
                       ? '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' 
                       : '----------------------------------------------------------------'}
                   </span>
                 </div>

               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Blockchain Event Log</span>
                 {mintingStatus === 'MINTING' && <span className="text-fuchsia-400 animate-pulse">Broadcasting Tx...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {blockLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-pink-400 font-bold' :
                       log.type === 'TX' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'SCAN' ? 'text-blue-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Photo Booth & Wallet Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Camera / Kiosk Mockup */}
            <div className="w-full bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl relative flex flex-col h-[350px] overflow-hidden font-sans mb-8">
              
              <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
                <span className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                  VIP Photo Kiosk
                </span>
              </div>

              <div className="flex-1 relative flex flex-col bg-slate-800 overflow-hidden pt-16 p-5 justify-center items-center">
                
                {/* Simulated Camera Viewfinder */}
                <div className="w-full h-40 bg-black rounded-xl border border-slate-700 relative overflow-hidden flex items-center justify-center mb-4">
                  
                  {photoCaptured ? (
                    <div className="absolute inset-0 bg-fuchsia-900/30">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20"></div>
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-4xl">📸</span>
                        <span className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest mt-2">Captured</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/50"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/50"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/50"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/50"></div>
                      <span className="text-white/20 text-xs font-mono uppercase tracking-widest">Awaiting Subject</span>
                    </>
                  )}
                  
                </div>

                <button 
                  onClick={initiateScan}
                  disabled={!scannerActive || mintingStatus !== 'IDLE'}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md flex items-center justify-center ${
                    !scannerActive ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800' : 
                    mintingStatus !== 'IDLE' ? 'bg-slate-700 text-slate-500 cursor-wait' :
                    'bg-slate-950 text-white hover:bg-black border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="mr-2 text-lg">🔊</span> {mintingStatus === 'IDLE' ? 'Tap VIP Wristband to Scan' : 'Processing...'}
                </button>

              </div>
            </div>

            {/* User Wallet Mockup */}
            <div className="w-full bg-slate-50 rounded-[2rem] border-[6px] border-slate-300 shadow-2xl relative flex flex-col h-[180px] overflow-hidden font-sans">
              
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MetaMask Wallet</span>
                <span className="text-[9px] font-mono text-slate-500">Polygon L2</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                {mintingStatus === 'SUCCESS' ? (
                  <div className="flex items-center space-x-4 w-full bg-white p-3 rounded-xl border border-fuchsia-200 shadow-sm animate-fade-in-up">
                    <div className="w-12 h-12 bg-gradient-to-tr from-fuchsia-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                      🌟
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">ODESZA 2026 VIP</p>
                      <p className="text-[9px] font-bold text-fuchsia-600 uppercase tracking-widest">POAP NFT Minted</p>
                      <p className="text-[8px] font-mono text-slate-400 mt-1 truncate w-32">0x8f43...aa4</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center opacity-40">
                    <span className="text-2xl block mb-2">🦊</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Incoming Transfers</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VIPPOAPMinting;
