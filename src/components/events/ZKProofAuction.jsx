/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ZKProofAuction = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [auctionState, setAuctionState] = useState('OPEN'); // OPEN, VERIFYING, SETTLED
  
  // Blockchain Metrics
  const [sealedBids, setSealedBids] = useState(0); 
  const [gasFee, setGasFee] = useState(15.2); // Gwei
  const [zkHashRate, setZkHashRate] = useState(0); // TH/s
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Zero-Knowledge (ZK) SNARK Contract Deployed.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Vickrey Auction initialized for "Backstage Pass #1".' }
  ]);

  // Visualizer State
  const [bidStream, setBidStream] = useState([]);
  const [auctionResult, setAuctionResult] = useState(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (auctionState === 'OPEN') {
              setGasFee(prev => prev + (Math.random() - 0.5));
              
              // Simulate incoming sealed bids
              if (Math.random() > 0.6) {
                  setSealedBids(prev => prev + 1);
                  setBidStream(prev => [{
                      id: Date.now(),
                      hash: generateHash(),
                      wallet: `0x${Math.floor(Math.random()*16777215).toString(16).padStart(4, '0')}...`
                  }, ...prev].slice(0, 5));
              }
          } else if (auctionState === 'VERIFYING') {
              setZkHashRate(prev => Math.min(1450, prev + 100)); // Heavy crypto math
          }

      }, 300); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, auctionState]);

  const generateHash = () => {
      const chars = '0123456789abcdef';
      let hash = 'zk_';
      for (let i = 0; i < 16; i++) hash += chars[Math.floor(Math.random() * chars.length)];
      return hash;
  };

  const triggerAuctionClose = () => {
    if (!systemActive || auctionState !== 'OPEN') return;
    
    setAuctionState('VERIFYING');
    addLog('WARN', 'Auction Closed. No further bids accepted.');
    addLog('ACTION', 'Initiating ZK-SNARK mathematical verification of sealed bids...');
    
    setTimeout(() => {
        addLog('SYS', 'Generating cryptographic proofs without revealing absolute bid values.');
        
        setTimeout(() => {
            setAuctionState('SETTLED');
            setZkHashRate(0);
            
            // Vickrey Logic Simulation
            const winner = `0x9A4F...B211`;
            const winningBid = 500; // Fake internal value
            const secondHighestBid = 350; // The price they actually pay
            
            setAuctionResult({
                winner,
                winningBid,
                finalPrice: secondHighestBid
            });
            
            addLog('SUCCESS', `ZK-Proof Verified! Winner: ${winner}.`);
            addLog('ETH', `Vickrey Settlement: Winner pays the 2nd highest bid price ($${secondHighestBid}).`);
            addLog('AI', 'Zero bot-sniping detected. Auction completely fair and private.');
            
        }, 3000);
        
    }, 1500);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setAuctionState('OPEN');
      setSealedBids(0);
      setBidStream([]);
      setAuctionResult(null);
      setZkHashRate(0);
      addLog('SYS', 'ZK-Rollup Layer 2 Engine Online. Awaiting sealed bids.');
    } else {
      setSystemActive(false);
      setAuctionState('OPEN');
      setBidStream([]);
      setAuctionResult(null);
      addLog('WARN', 'Smart Contract paused. Reverting to Web2 legacy ticketing.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Zero-Knowledge Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Sealed-Bid Vickrey <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-500">Backstage Auctions</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Charity auctions for exclusive VIP experiences are often ruined by "snipers" (bots that bid in the last second) or attendees who bid aggressively to show off, intimidating regular fans. Eventra solves this by implementing a sealed-bid Vickrey auction using Zero-Knowledge (ZK) cryptography on the blockchain. Attendees submit their highest bid securely. Eventra uses ZK-proofs to mathematically determine the winner without revealing anyone's actual bid to the public. The winner only pays the price of the 2nd highest bid, guaranteeing a completely fair, bot-proof auction.
          </p>

          <div className="bg-[#0c0812] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">⛓️</span> L2 Smart Contract Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Contract' : 'Deploy ZK Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Sealed Bids */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 auctionState === 'OPEN' && systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Sealed Bids
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {sealedBids}
                   </span>
                 </div>
               </div>

               {/* ZK Hashrate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 auctionState === 'VERIFYING' ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Proof Generation
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     auctionState === 'VERIFYING' ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {zkHashRate}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">TH/s</span>
                 </div>
               </div>
               
               {/* Gas Fee */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Network Gas
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {gasFee.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Gwei</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cryptographic Ledger</span>
                 {auctionState === 'OPEN' && systemActive && <span className="text-purple-400 animate-pulse">ACCEPTING BIDS</span>}
                 {auctionState === 'VERIFYING' && <span className="text-amber-400 font-black animate-pulse">ZK-SNARK COMPUTING...</span>}
                 {auctionState === 'SETTLED' && <span className="text-emerald-400 font-black">CONTRACT SETTLED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
                       log.type === 'ETH' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Blockchain Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#090510]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">MEMPOOL VISUALIZER</span>
                <span className="text-[8px] font-mono text-slate-400">L2 ZK-ROLLUP</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-12">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CONTRACT INACTIVE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col p-4">
                      
                      {/* Auction Item */}
                      <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center mb-4">
                          <div className="w-12 h-12 bg-purple-900/50 rounded flex items-center justify-center border border-purple-500 mr-3">
                              🎟️
                          </div>
                          <div>
                              <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block">Charity Auction</span>
                              <span className="text-[14px] font-bold text-white block">Mainstage Backstage Pass</span>
                          </div>
                      </div>

                      {/* Phase 1: Open Bidding Stream */}
                      {auctionState === 'OPEN' && (
                          <div className="flex-1 flex flex-col">
                              <span className="text-[10px] font-mono text-slate-500 mb-2 border-b border-slate-800 pb-1">LIVE ENCRYPTED BID STREAM</span>
                              <div className="flex-1 overflow-hidden space-y-2 relative">
                                  {bidStream.map(bid => (
                                      <div key={bid.id} className="bg-black/50 border border-slate-800 rounded p-2 flex justify-between items-center animate-fade-in-up">
                                          <div className="flex items-center">
                                              <span className="text-xs mr-2">🔒</span>
                                              <div>
                                                  <span className="text-[8px] font-mono text-slate-500 block">From: {bid.wallet}</span>
                                                  <span className="text-[10px] font-mono text-amber-400 blur-[1px]">Value: {bid.hash}</span>
                                              </div>
                                          </div>
                                          <span className="text-[8px] font-black uppercase text-purple-500 bg-purple-900/20 px-1 rounded">Sealed</span>
                                      </div>
                                  ))}
                                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#090510] to-transparent"></div>
                              </div>
                          </div>
                      )}

                      {/* Phase 2: ZK Verification */}
                      {auctionState === 'VERIFYING' && (
                          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                  {/* Fake math background */}
                                  <span className="font-mono text-xs text-amber-500 text-center break-all">
                                      0x8a92f... 0x11ab... 0x992b... 0x44ca... 0x8a92f... 0x11ab... 0x992b... 0x44ca...
                                      0x8a92f... 0x11ab... 0x992b... 0x44ca... 0x8a92f... 0x11ab... 0x992b... 0x44ca...
                                  </span>
                              </div>
                              
                              <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin z-10 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
                              <span className="text-[12px] font-black uppercase text-amber-400 tracking-widest z-10">Computing ZK-SNARK</span>
                              <span className="text-[9px] text-slate-400 font-mono mt-2 z-10">Proving highest bid without revealing values...</span>
                          </div>
                      )}

                      {/* Phase 3: Vickrey Settlement */}
                      {auctionState === 'SETTLED' && auctionResult && (
                          <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
                              
                              <div className="text-center mb-6">
                                  <span className="text-4xl mb-2 block">✅</span>
                                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Auction Mathematically Verified</span>
                              </div>

                              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                                      <span className="text-[10px] font-mono text-slate-500">WINNING WALLET</span>
                                      <span className="text-[12px] font-mono font-bold text-white">{auctionResult.winner}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2 opacity-50">
                                      <span className="text-[10px] font-mono text-slate-500">THEIR ACTUAL BID (HIDDEN)</span>
                                      <span className="text-[12px] font-mono font-bold text-slate-400 blur-sm">${auctionResult.winningBid}</span>
                                  </div>

                                  <div className="flex justify-between items-center pt-1 bg-emerald-900/20 p-2 rounded border border-emerald-500/50 mt-4">
                                      <div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">Vickrey Settlement</span>
                                          <span className="text-[8px] font-mono text-slate-400">Price of 2nd Highest Bid</span>
                                      </div>
                                      <span className="text-2xl font-black text-emerald-400">${auctionResult.finalPrice}</span>
                                  </div>
                              </div>

                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Smart Contract Controls */}
            <div className="w-full bg-[#0c0812] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Auction Lifecycle</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerAuctionClose}
                   disabled={!systemActive || auctionState !== 'OPEN'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || auctionState !== 'OPEN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                   }`}
                 >
                   Close Auction & Compute ZK-Proof
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ZKProofAuction;
