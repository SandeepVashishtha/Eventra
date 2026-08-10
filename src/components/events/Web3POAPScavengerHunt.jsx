/* eslint-disable */
import React, { useState, useEffect } from 'react';

const Web3POAPScavengerHunt = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [huntActive, setHuntActive] = useState(false);
  
  // Wallet / Web3 State
  const [walletAddress, setWalletAddress] = useState('0x000...000');
  
  // Scavenger Hunt Beacons (NFC locations)
  const [beacons, setBeacons] = useState([
    { id: 'B1', name: 'Main Stage Sunrise Set', status: 'LOCKED', reward: 'SUNRISE_POAP' },
    { id: 'B2', name: 'Heineken VIP Lounge', status: 'LOCKED', reward: 'SPONSOR_POAP' },
    { id: 'B3', name: 'Secret Forest Stage', status: 'LOCKED', reward: 'UNDERGROUND_POAP' }
  ]);
  
  // Collection State
  const [collectedPOAPs, setCollectedPOAPs] = useState([]);
  const [vipUnlocked, setVipUnlocked] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Web3 Wallet integration initialized.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Awaiting User Wallet Connection via WalletConnect.' }
  ]);

  // NFC Scan Simulation State
  const [scanning, setScanning] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    // Check for unlock condition
    if (collectedPOAPs.length === 3 && !vipUnlocked) {
        setVipUnlocked(true);
        addLog('SUCCESS', 'All 3 POAPs collected! "Platinum VIP Upgrade" smart contract executed.');
    }
  }, [collectedPOAPs, vipUnlocked]);

  const connectWallet = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      setWalletAddress('0x7F9...B4A');
      addLog('WEB3', 'Wallet 0x7F9...B4A securely connected to Eventra dApp.');
      setHuntActive(true);
    } else {
      setWalletConnected(false);
      setWalletAddress('0x000...000');
      setHuntActive(false);
      resetHunt();
      addLog('WARN', 'Wallet disconnected. Scavenger Hunt paused.');
    }
  };

  const simulateNFCScan = (beaconIndex) => {
    if (!walletConnected || scanning || minting || beacons[beaconIndex].status === 'UNLOCKED') return;

    setScanning(true);
    addLog('ACTION', `NFC Beacon detected: ${beacons[beaconIndex].name}. Initiating handshake...`);
    
    setTimeout(() => {
        setScanning(false);
        setMinting(true);
        addLog('WEB3', `Minting ${beacons[beaconIndex].reward} NFT to 0x7F9...B4A on Polygon...`);
        
        setTimeout(() => {
            setMinting(false);
            
            // Update state
            const newBeacons = [...beacons];
            newBeacons[beaconIndex].status = 'UNLOCKED';
            setBeacons(newBeacons);
            
            setCollectedPOAPs(prev => [...prev, newBeacons[beaconIndex].reward]);
            addLog('SUCCESS', `POAP NFT successfully minted! Gas fees covered by Eventra Paymaster.`);
            
        }, 1500); // simulate blockchain mint time
    }, 1000); // simulate NFC read time
  };

  const resetHunt = () => {
    setBeacons([
      { id: 'B1', name: 'Main Stage Sunrise Set', status: 'LOCKED', reward: 'SUNRISE_POAP' },
      { id: 'B2', name: 'Heineken VIP Lounge', status: 'LOCKED', reward: 'SPONSOR_POAP' },
      { id: 'B3', name: 'Secret Forest Stage', status: 'LOCKED', reward: 'UNDERGROUND_POAP' }
    ]);
    setCollectedPOAPs([]);
    setVipUnlocked(false);
    addLog('SYS', 'Hunt progress reset for demonstration.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0714] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏆</span> Gamified Tokenomics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Web3 Proof-of-Attendance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">(POAP) Scavenger Hunt</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sponsor activations and remote stages often struggle to drive foot traffic, and attendees lack permanent, verifiable digital souvenirs of their exact festival journey. Eventra implements a localized Web3 Scavenger Hunt. Attendees use the app to scan physical NFC beacons placed at specific stages or sponsor tents. Each interaction instantly mints a unique Proof-of-Attendance Protocol (POAP) NFT directly to their wallet. Collecting specific combinations programmatically unlocks physical rewards like VIP upgrades via smart contract, turning exploration into a highly engaging, gamified experience.
          </p>

          <div className="bg-[#140b19] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">👛</span> Attendee Web3 Wallet
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={connectWallet}
                   disabled={scanning || minting}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     walletConnected ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {walletConnected ? 'Disconnect Wallet' : 'Connect WalletConnect'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Connected Address */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 walletConnected ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active User Wallet
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     walletConnected ? 'text-white' : 'text-slate-600'
                   }`}>
                     {walletAddress}
                   </span>
                 </div>
               </div>

               {/* POAP Collection Count */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 vipUnlocked ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 collectedPOAPs.length > 0 ? 'bg-pink-950/20 border-pink-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Minted POAPs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     vipUnlocked ? 'text-yellow-400 animate-pulse' :
                     collectedPOAPs.length > 0 ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {collectedPOAPs.length}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/ 3 Required</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#09050b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>EVM Blockchain Log</span>
                 {minting && <span className="text-cyan-400 animate-pulse">Minting NFT on Polygon...</span>}
                 {scanning && <span className="text-purple-400 animate-pulse">Reading NFC Tag...</span>}
                 {vipUnlocked && <span className="text-yellow-400 animate-pulse">VIP UNLOCKED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-500 font-bold' : 'text-slate-400'
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
            
            {/* Scavenger Hunt App UI Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">ATTENDEE APP POV</span>
                <span className="text-[8px] font-mono text-slate-400">QUEST TRACKER</span>
              </div>

              <div className="flex-1 relative bg-[#040206] overflow-hidden flex flex-col p-4 pt-12 space-y-3">
                
                {!walletConnected ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                     <span className="text-4xl mb-4">🦊</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">PLEASE CONNECT WALLET<br/>TO START QUEST</span>
                   </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center bg-purple-950/30 p-2 rounded border border-purple-900/50 mb-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">GRAND PRIZE:</span>
                        <span className="text-[10px] font-black text-yellow-400 bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-600/50">PLATINUM VIP WRISTBAND</span>
                    </div>

                    {/* Beacon List */}
                    {beacons.map((beacon, idx) => (
                        <div 
                          key={beacon.id} 
                          className={`w-full p-3 rounded-lg border ${beacon.status === 'UNLOCKED' ? 'border-pink-500 bg-pink-950/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]' : 'border-slate-700 bg-slate-900'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-white">{beacon.name}</span>
                                {beacon.status === 'UNLOCKED' ? (
                                   <span className="text-[14px]">✅</span>
                                ) : (
                                   <span className="text-[14px] opacity-30">🔒</span>
                                )}
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 block mt-1">NFC REWARD: {beacon.reward}</span>
                            
                            {beacon.status === 'UNLOCKED' && (
                                <div className="mt-2 text-[8px] font-mono text-purple-400 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1"></span>
                                    Minted to Wallet (Polygon)
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Scanning / Minting Overlays */}
                    {scanning && (
                       <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-full border-4 border-dashed border-purple-500 animate-spin mb-4"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse">Reading Physical NFC Tag...</span>
                       </div>
                    )}

                    {minting && (
                       <div className="absolute inset-0 bg-purple-950/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.5)] mb-4 animate-bounce">
                             <span className="text-2xl">🦄</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Minting POAP NFT</span>
                          <span className="text-[8px] font-mono text-pink-300 animate-pulse">Executing Smart Contract...</span>
                       </div>
                    )}

                    {/* VIP Unlock Confetti/Overlay */}
                    {vipUnlocked && !minting && (
                       <div className="absolute inset-0 bg-yellow-950/90 z-30 flex flex-col items-center justify-center backdrop-blur-md p-4 text-center border-4 border-yellow-500">
                          <span className="text-5xl mb-4">👑</span>
                          <span className="text-[14px] font-black uppercase tracking-widest text-yellow-400 mb-2 leading-tight">QUEST COMPLETE!<br/>VIP UPGRADE UNLOCKED</span>
                          <span className="text-[9px] font-mono text-white mb-4">Show this secure digital signature at the VIP gates to claim your physical wristband.</span>
                          <span className="text-[8px] font-mono text-yellow-600 bg-black px-2 py-1 rounded">Sig: 0x93A...F42 (Verified)</span>
                       </div>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#140b19] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Physical NFC Scans</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => simulateNFCScan(0)}
                   disabled={!walletConnected || scanning || minting || beacons[0].status === 'UNLOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !walletConnected || scanning || minting || beacons[0].status === 'UNLOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                   }`}
                 >
                   Scan "Main Stage" NFC
                 </button>
                 
                 <button 
                   onClick={() => simulateNFCScan(1)}
                   disabled={!walletConnected || scanning || minting || beacons[1].status === 'UNLOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !walletConnected || scanning || minting || beacons[1].status === 'UNLOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                   }`}
                 >
                   Scan "Heineken Lounge" NFC
                 </button>

                 <button 
                   onClick={() => simulateNFCScan(2)}
                   disabled={!walletConnected || scanning || minting || beacons[2].status === 'UNLOCKED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !walletConnected || scanning || minting || beacons[2].status === 'UNLOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                   }`}
                 >
                   Scan "Secret Forest" NFC
                 </button>
               </div>
               
               {vipUnlocked && (
                 <button 
                     onClick={resetHunt}
                     className="w-full py-2 mt-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                   >
                     Reset App State
                 </button>
               )}
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Web3POAPScavengerHunt;
