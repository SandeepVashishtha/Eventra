/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BlockchainTicketEscrow = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Web3 Metrics
  const [activeEscrows, setActiveEscrows] = useState(0); 
  const [l2GasFee, setL2GasFee] = useState(0.012); // USD
  const [fraudPrevented, setFraudPrevented] = useState(42500); // USD
  const [totalTransactions, setTotalTransactions] = useState(8420);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Layer-2 Smart Contracts deployed to mainnet.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting P2P ticket resale requests...' }
  ]);

  // Visualizer State
  const [txState, setTxState] = useState('IDLE'); // IDLE, ESCROW_LOCKED, GEO_VERIFYING, FUNDS_RELEASED
  const [buyerGeo, setBuyerGeo] = useState('OFFSITE'); // OFFSITE, AT_GATE
  const [sellerBalance, setSellerBalance] = useState(0.0);
  const [escrowBalance, setEscrowBalance] = useState(0.0);
  const [buyerBalance, setBuyerBalance] = useState(450.0);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveEscrows(1240 + Math.floor(Math.random() * 20));
          setL2GasFee(0.010 + Math.random() * 0.005);
      }, 2000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const initiatePurchase = () => {
      if (!systemActive || txState !== 'IDLE') return;
      
      setTxState('ESCROW_LOCKED');
      setBuyerBalance(prev => prev - 250.0);
      setEscrowBalance(250.0);
      
      addLog('ACTION', 'Buyer initiated purchase of Ticket NFT #4829 for $250.');
      addLog('SYS', 'Smart Contract: Funds locked in decentralized escrow vault.');
  };

  const simulateArrival = () => {
      if (!systemActive || txState !== 'ESCROW_LOCKED') return;
      
      setTxState('GEO_VERIFYING');
      setBuyerGeo('AT_GATE');
      
      addLog('ACTION', 'Buyer arrived at Festival Gate North.');
      addLog('SYS', 'Oracle Network: Verifying GPS geofence and RFID scan data.');
      
      setTimeout(() => {
          if (!systemActive) return;
          
          setTxState('FUNDS_RELEASED');
          setEscrowBalance(0.0);
          setSellerBalance(prev => prev + 250.0);
          setTotalTransactions(prev => prev + 1);
          
          addLog('SUCCESS', 'Smart Contract Triggered: Gate verification successful.');
          addLog('SUCCESS', 'Funds automatically released to Seller wallet. Zero fraud risk.');
          
          setTimeout(() => {
              setTxState('IDLE');
              setBuyerGeo('OFFSITE');
          }, 3000);

      }, 2000); // Verification delay
  };

  const reportScam = () => {
      if (!systemActive || txState !== 'ESCROW_LOCKED') return;
      
      addLog('CRIT', 'Buyer reported fake ticket at gate (Invalid QR/RFID).');
      addLog('SYS', 'Smart Contract Reverted: Refund issued to Buyer immediately.');
      
      setTxState('IDLE');
      setEscrowBalance(0.0);
      setBuyerBalance(prev => prev + 250.0);
      setFraudPrevented(prev => prev + 250);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'P2P Web3 Marketplace Online. Layer-2 connection stable.');
    } else {
      setSystemActive(false);
      setActiveEscrows(0);
      setTxState('IDLE');
      setEscrowBalance(0.0);
      addLog('WARN', 'Marketplace Offline. Falling back to unsafe legacy transfers.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060410] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-backed Ticket <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500">Escrow System</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees frequently get scammed buying fake or duplicate PDF tickets on third-party secondary markets, while centralized exchanges charge exorbitant 30% convenience fees. Eventra solves this by minting all festival tickets as dynamic NFTs on a low-fee Layer-2 blockchain. We implement a decentralized escrow smart contract for P2P resales. When a buyer purchases a ticket, their funds are held in escrow. The smart contract strictly releases the funds to the seller *only* once the buyer's app GPS geofencing and physical gate scan confirms they successfully entered the festival.
          </p>

          <div className="bg-[#0c0818] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Layer-2 Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Smart Contracts' : 'Deploy Escrow Vaults'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Escrows */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Escrows
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {activeEscrows.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* L2 Gas Fee */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Avg L2 Gas
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {systemActive ? l2GasFee.toFixed(3) : '0.000'}
                   </span>
                 </div>
               </div>
               
               {/* Fraud Prevented */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fraud Prevented
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {(fraudPrevented / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>
               
               {/* Total Tx */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Tx
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {totalTransactions.toLocaleString()}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Smart Contract Ledger</span>
                 {txState === 'ESCROW_LOCKED' && <span className="text-indigo-400 font-black animate-pulse">AWAITING GEO-VERIFICATION...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* Web3 UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0c0818]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">WEB3 P2P EXCHANGE</span>
                <span className="text-[8px] font-mono text-slate-400">TX_STATE: {txState}</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4 px-6 items-center">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">BLOCKCHAIN OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col items-center justify-between">
                        
                        {/* Participants Wallets */}
                        <div className="w-full flex justify-between items-start pt-2">
                            {/* Buyer Wallet */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-900/50 border-2 border-blue-500 flex items-center justify-center text-lg mb-1 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    🧑
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">Buyer</span>
                                <span className="text-[10px] font-mono text-slate-300">${buyerBalance.toFixed(2)}</span>
                            </div>

                            {/* Ticket NFT */}
                            <div className={`w-16 h-20 rounded border flex flex-col items-center justify-center transition-all duration-700 ${
                                txState === 'IDLE' ? 'bg-purple-900/30 border-purple-500/50 -translate-x-16' : 
                                'bg-emerald-900/30 border-emerald-500/50 translate-x-16'
                            }`}>
                                <span className="text-xs">🎟️</span>
                                <span className="text-[5px] font-mono mt-1 text-slate-400">NFT #4829</span>
                            </div>

                            {/* Seller Wallet */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-orange-900/50 border-2 border-orange-500 flex items-center justify-center text-lg mb-1 shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                                    👩
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">Seller</span>
                                <span className="text-[10px] font-mono text-slate-300">${sellerBalance.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Central Smart Contract Escrow */}
                        <div className="w-full flex flex-col items-center relative mt-4">
                            
                            {/* Flow Lines */}
                            <div className="absolute top-1/2 left-8 w-16 h-px bg-slate-700 -z-10"></div>
                            <div className="absolute top-1/2 right-8 w-16 h-px bg-slate-700 -z-10"></div>

                            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center relative transition-all duration-500 ${
                                txState === 'ESCROW_LOCKED' ? 'border-indigo-500 bg-indigo-950/40 shadow-[0_0_30px_rgba(99,102,241,0.5)] scale-110' :
                                txState === 'GEO_VERIFYING' ? 'border-sky-500 bg-sky-950/40 shadow-[0_0_30px_rgba(14,165,233,0.5)] scale-110 animate-pulse' :
                                txState === 'FUNDS_RELEASED' ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]' :
                                'border-slate-800 bg-slate-900'
                            }`}>
                                <span className="text-xl mb-1">
                                    {txState === 'IDLE' ? '⛓️' : txState === 'ESCROW_LOCKED' ? '🔒' : txState === 'GEO_VERIFYING' ? '📡' : '✅'}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 text-center px-2">
                                    {txState === 'IDLE' ? 'Smart Contract' : txState === 'ESCROW_LOCKED' ? 'Funds Locked' : txState === 'GEO_VERIFYING' ? 'Verifying Gate' : 'Escrow Cleared'}
                                </span>
                                <span className={`text-lg font-mono font-black mt-1 ${
                                    escrowBalance > 0 ? 'text-indigo-400' : 'text-slate-600'
                                }`}>
                                    ${escrowBalance.toFixed(2)}
                                </span>
                            </div>

                        </div>

                        {/* Eventra App GPS Status Simulator */}
                        <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 mt-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Buyer GPS Geofence</span>
                                <div className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${
                                        buyerGeo === 'OFFSITE' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                                    }`}></span>
                                    <span className={`text-[10px] font-mono ${
                                        buyerGeo === 'OFFSITE' ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                        {buyerGeo === 'OFFSITE' ? 'OFFSITE_TRANSIT' : 'AT_FESTIVAL_GATE_N'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0c0818] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Resale Lifecycle</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={initiatePurchase}
                   disabled={!systemActive || txState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || txState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                   }`}
                 >
                   💸 Buyer Pays (Funds to Escrow)
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={simulateArrival}
                   disabled={!systemActive || txState !== 'ESCROW_LOCKED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || txState !== 'ESCROW_LOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   ✅ Buyer Scans at Gate
                 </button>
                 
                 <button 
                   onClick={reportScam}
                   disabled={!systemActive || txState !== 'ESCROW_LOCKED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || txState !== 'ESCROW_LOCKED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ❌ Fake Ticket (Refund)
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BlockchainTicketEscrow;
