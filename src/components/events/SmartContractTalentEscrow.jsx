/* eslint-disable */
import React, { useState } from 'react';

const SmartContractTalentEscrow = () => {
  const [escrowState, setEscrowState] = useState('locked'); // locked, arrived, completed
  
  const [artistLocation, setArtistLocation] = useState({ lat: 34.0522, lng: -118.2437, distMiles: 4.5 }); // LA coordinates
  const VENUE_LAT = 34.0411; // Staples Center roughly
  const VENUE_LNG = -118.2673;

  const [txLog, setTxLog] = useState([
    { id: 1, time: '09:00:00', type: 'WEB3', msg: 'Promoter Wallet deposited 500,000 USDC to Escrow Vault.' },
    { id: 2, time: '09:00:05', type: 'SYS', msg: 'Smart Contract deployed: 0x7a2...f93b. Awaiting geofence oracle.' }
  ]);

  const [balances, setBalances] = useState({
    promoter: 1000000,
    vault: 500000,
    artist: 0
  });

  const triggerArrival = () => {
    if (escrowState === 'locked') {
      addLog('SYS', 'GPS Oracle update: Artist convoy approaching venue...');
      
      let currentDist = 4.5;
      const moveLoop = setInterval(() => {
        currentDist -= 1.2;
        if (currentDist <= 0.1) {
          clearInterval(moveLoop);
          setArtistLocation({ lat: VENUE_LAT, lng: VENUE_LNG, distMiles: 0 });
          setEscrowState('arrived');
          
          addLog('GEO', 'GEOFENCE BREACH: Artist on premises. Triggering Oracle.');
          
          setTimeout(() => {
            addLog('WEB3', 'Executing arrival condition. Unlocking 50% funds (250,000 USDC).');
            setBalances({
              promoter: 1000000,
              vault: 250000,
              artist: 250000
            });
          }, 1000);
        } else {
          setArtistLocation(prev => ({ ...prev, distMiles: currentDist }));
        }
      }, 500);
    }
  };

  const triggerSetComplete = () => {
    if (escrowState === 'arrived') {
      addLog('SYS', 'Stage Manager confirmed Set Completion via cryptographically signed transaction.');
      
      setTimeout(() => {
        setEscrowState('completed');
        addLog('WEB3', 'Executing completion condition. Unlocking final 50% funds (250,000 USDC).');
        setBalances({
          promoter: 1000000,
          vault: 0,
          artist: 500000
        });
        addLog('SUCCESS', 'Smart Contract fulfilled. Vault empty. Escrow closed.');
      }, 1500);
    }
  };

  const resetContract = () => {
    setEscrowState('locked');
    setArtistLocation({ lat: 34.0522, lng: -118.2437, distMiles: 4.5 });
    setBalances({
      promoter: 1000000,
      vault: 500000,
      artist: 0
    });
    addLog('SYS', 'Contract reset. 500,000 USDC locked in vault.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTxLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans p-6 text-neutral-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Promoter FinTech Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> DeFi / Web3 FinTech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
            Smart Contract Talent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Booking Escrow</span>.
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            The live music industry is plagued by shady promoters failing to pay artists, or artists pulling out of events last minute, leading to massive legal disputes. Eventra solves this via Web3. The promoter locks the $500,000 artist performance fee in a USDC smart contract vault. Eventra's GPS acts as an oracle: when the artist's phone breaches the venue geofence, 50% unlocks instantly. The remaining 50% unlocks upon set completion. Trustless transactions.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl relative overflow-hidden flex flex-col h-[460px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
               <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🏦</span> USDC Escrow Vault
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetContract}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                 >
                   Reset Contract
                 </button>
               </div>
             </div>

             {/* Ledger Balances */}
             <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="col-span-1 p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block mb-1">Promoter Wallet</span>
                 <span className="text-xl font-black font-mono text-neutral-700 leading-none">
                   ${balances.promoter.toLocaleString()}
                 </span>
               </div>

               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 balances.vault > 0 ? 'bg-purple-50 border-purple-200 shadow-inner' : 'bg-neutral-50 border-neutral-200'
               }`}>
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block mb-1">Locked in Escrow</span>
                 <span className={`text-2xl font-black font-mono leading-none ${balances.vault > 0 ? 'text-purple-600' : 'text-neutral-300'}`}>
                   ${balances.vault.toLocaleString()}
                 </span>
               </div>

               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 balances.artist > 0 ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-neutral-50 border-neutral-200'
               }`}>
                 <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block mb-1">Artist Wallet</span>
                 <span className={`text-2xl font-black font-mono leading-none ${balances.artist > 0 ? 'text-emerald-600' : 'text-neutral-300'}`}>
                   ${balances.artist.toLocaleString()}
                 </span>
               </div>
             </div>

             {/* Smart Contract Triggers */}
             <div className="mb-6 space-y-3">
               <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                 escrowState !== 'locked' ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-white border-neutral-200 shadow-sm'
               }`}>
                 <div>
                   <h4 className="font-bold text-sm text-neutral-800">Condition 1: Physical Arrival</h4>
                   <p className="text-[10px] text-neutral-500 font-mono mt-0.5">IF (artist.distance == 0) THEN transfer(250000, artist)</p>
                 </div>
                 <button 
                   onClick={escrowState === 'locked' ? triggerArrival : undefined}
                   disabled={escrowState !== 'locked'}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     escrowState !== 'locked' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-not-allowed' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {escrowState !== 'locked' ? 'Condition Met' : 'Simulate GPS Arrival'}
                 </button>
               </div>

               <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                 escrowState === 'completed' ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-white border-neutral-200 shadow-sm'
               }`}>
                 <div>
                   <h4 className="font-bold text-sm text-neutral-800">Condition 2: Set Completion</h4>
                   <p className="text-[10px] text-neutral-500 font-mono mt-0.5">IF (set.status == "Complete") THEN transfer(250000, artist)</p>
                 </div>
                 <button 
                   onClick={escrowState === 'arrived' ? triggerSetComplete : undefined}
                   disabled={escrowState !== 'arrived'}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     escrowState === 'completed' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-not-allowed' :
                     escrowState === 'locked' ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {escrowState === 'completed' ? 'Condition Met' : 'Simulate Set End'}
                 </button>
               </div>
             </div>

             {/* Transaction Log */}
             <div className="flex-1 bg-neutral-900 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Blockchain Transaction Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {txLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' :
                       log.type === 'GEO' ? 'text-blue-400' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Geofence Oracle Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-neutral-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-white/80 text-neutral-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-neutral-200 backdrop-blur-md shadow-sm">
                Oracle Data Feed
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-100 overflow-hidden">
               
               {/* Map Background */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHBhdGggZD0iTTAgNDBoODBNNDAgMHY4MCIgc3Ryb2tlPSIjZWFlOGVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-50 z-0"></div>
               
               {/* Roads */}
               <div className="absolute top-0 bottom-0 left-[30%] w-3 bg-slate-200 z-0"></div>
               <div className="absolute top-[40%] left-0 right-0 h-4 bg-slate-200 z-0"></div>

               {/* The Geofenced Venue */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                 <div className={`w-40 h-40 rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-500 ${
                   escrowState !== 'locked' ? 'border-emerald-500 bg-emerald-500/10' : 'border-purple-500 bg-purple-500/10'
                 }`}>
                   <div className="w-16 h-16 bg-white rounded-xl shadow-lg border border-neutral-200 flex flex-col items-center justify-center">
                     <span className="text-2xl mb-1">🏟️</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Venue</span>
                   </div>
                 </div>
               </div>

               {/* The Artist Blip */}
               {escrowState === 'locked' && (
                 <div className="absolute top-[20%] right-[10%] z-20 flex flex-col items-center animate-bounce">
                   <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-white px-2 py-0.5 rounded shadow-sm border border-purple-200 mb-1">
                     Artist GPS
                   </span>
                   <div className="w-4 h-4 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)] border-2 border-white"></div>
                 </div>
               )}
               
               {/* Line showing distance if locked */}
               {escrowState === 'locked' && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                   <line x1="90%" y1="21%" x2="50%" y2="50%" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 4" />
                 </svg>
               )}

               {/* Status HUD Footer */}
               <div className="mt-auto relative z-30 p-6 pb-12 bg-gradient-to-t from-white via-white to-transparent">
                 
                 <div className="bg-white rounded-2xl p-5 shadow-xl border border-neutral-100 mb-4">
                   <div className="flex justify-between items-center mb-3 border-b border-neutral-100 pb-2">
                     <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Oracle Node: 0x99A</span>
                     <span className="text-[10px] font-mono text-purple-500">ACTIVE</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Distance to Gate</span>
                       <span className={`text-xl font-black font-mono leading-none ${escrowState !== 'locked' ? 'text-emerald-500' : 'text-neutral-800'}`}>
                         {artistLocation.distMiles > 0 ? artistLocation.distMiles.toFixed(1) : '0.0'}
                       </span>
                       <span className="text-[9px] font-bold text-neutral-500 ml-1">mi</span>
                     </div>
                     <div>
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Geofence Status</span>
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block ${
                         escrowState !== 'locked' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                       }`}>
                         {escrowState !== 'locked' ? 'BREACHED' : 'OUTSIDE'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {escrowState !== 'locked' && (
                   <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center animate-fade-in-up">
                     <span className="text-xl mb-1 block">💸</span>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Oracle Condition Met</p>
                     <p className="text-xs font-black text-emerald-800">Transmitting to smart contract...</p>
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

export default SmartContractTalentEscrow;
