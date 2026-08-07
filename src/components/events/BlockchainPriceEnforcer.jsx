/* eslint-disable */
import React, { useState } from 'react';

const BlockchainPriceEnforcer = () => {
  const [contractActive, setContractActive] = useState(false);
  const [listingPrice, setListingPrice] = useState(150); // Original price is 150
  const [transactionStatus, setTransactionStatus] = useState('IDLE'); // IDLE, SIMULATING, APPROVED, REVERTED
  
  const [txLog, setTxLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Polygon L2 RPC Node connected.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'Eventra Ticket Contract (ERC-721A) loaded.' }
  ]);

  const originalPrice = 150;
  const maxMarkupPercent = 20;
  const priceCeiling = originalPrice * (1 + maxMarkupPercent / 100); // 180

  const handlePriceChange = (e) => {
    setListingPrice(Number(e.target.value));
    setTransactionStatus('IDLE');
  };

  const simulateTransfer = () => {
    if (contractActive && transactionStatus === 'IDLE') {
      setTransactionStatus('SIMULATING');
      addLog('ACTION', `Attempting to list Ticket #8294 for $${listingPrice}.00`);
      addLog('WEB3', 'Executing smart contract call: safeTransferFrom()');
      
      setTimeout(() => {
        addLog('WEB3', `Checking modifier: require(msg.value <= priceCeiling) // Ceiling is $${priceCeiling}.00`);
        
        setTimeout(() => {
          if (listingPrice > priceCeiling) {
            setTransactionStatus('REVERTED');
            addLog('CRIT', 'Transaction Reverted: SCALPER_PROTECTION_ENGAGED');
            addLog('WARN', `Listing price ($${listingPrice}) exceeds 120% ceiling ($${priceCeiling}).`);
          } else {
            setTransactionStatus('APPROVED');
            addLog('SUCCESS', 'Transaction Confirmed. Ticket listed on decentralized secondary market.');
          }
          
          setTimeout(() => {
            setTransactionStatus('IDLE');
          }, 5000);
          
        }, 1200);
      }, 1000);
    }
  };

  const toggleContract = () => {
    if (!contractActive) {
      setContractActive(true);
      addLog('SYS', 'Smart Contract Anti-Scalping logic engaged across all active mints.');
    } else {
      setContractActive(false);
      setTransactionStatus('IDLE');
      addLog('WARN', 'Anti-Scalping protections disabled. Tickets vulnerable to open-market manipulation.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setTxLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Ticketing Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-backed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">Resale Price Ceiling</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Scalpers routinely deploy bots to buy thousands of tickets, only to immediately resell them on third-party sites for a 500% markup. This prices out genuine fans and extracts value entirely outside of the festival's ecosystem. Eventra solves this by minting all tickets as dynamic NFTs on a Layer-2 blockchain (like Polygon). We embed hardcoded smart contract logic that caps the maximum resale value to exactly 120% of face value. If a user tries to transfer the ticket to another wallet for more than the capped amount, the cryptography automatically rejects the transaction.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">📜</span> Smart Contract Parameters
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleContract}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     contractActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {contractActive ? 'Bypass Contract Logic' : 'Deploy Anti-Scalp Logic'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Financial Parameters */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Mint Configuration</span>
                 <div className="space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-400">Face Value:</span>
                     <span className="text-sm font-mono font-bold text-white">${originalPrice}.00</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-400">Max Markup (+{maxMarkupPercent}%):</span>
                     <span className="text-sm font-mono font-bold text-fuchsia-400">+${originalPrice * (maxMarkupPercent/100)}.00</span>
                   </div>
                   <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-300">Hard Ceiling:</span>
                     <span className="text-lg font-mono font-black text-rose-500">${priceCeiling}.00</span>
                   </div>
                 </div>
               </div>

               {/* EVM Execution Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 transactionStatus === 'SIMULATING' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 transactionStatus === 'APPROVED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 transactionStatus === 'REVERTED' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">EVM Transaction State</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     transactionStatus === 'APPROVED' ? 'text-emerald-400' :
                     transactionStatus === 'REVERTED' ? 'text-red-500' :
                     transactionStatus === 'SIMULATING' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {transactionStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {transactionStatus === 'IDLE' ? 'Awaiting Interaction' : 
                      transactionStatus === 'SIMULATING' ? 'Simulating Gas / Logic' : 
                      transactionStatus === 'APPROVED' ? 'Block Mined. NFT Transferred.' : 'Tx Dropped. Violation.'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>RPC Node Log</span>
                 {transactionStatus === 'SIMULATING' && <span className="text-blue-400 animate-pulse">Processing Block...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {txLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WEB3' ? 'text-blue-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Scalper DEX Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Third-Party Marketplace Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-slate-800 shadow-2xl relative flex flex-col h-[420px] overflow-hidden font-sans mb-6 bg-slate-100 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-3 bg-white border-b border-slate-200 flex justify-between items-center z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">🎟️ StubX Marketplace</span>
                <span className="text-[9px] font-mono bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Wallet Connected</span>
              </div>

              <div className="flex-1 relative flex flex-col p-6 mt-10 bg-slate-50">
                
                <h2 className="text-xl font-black text-slate-900 mb-1">List Ticket For Sale</h2>
                <p className="text-xs text-slate-500 mb-6">Eventra 2026 - 3-Day GA Pass (Ticket #8294)</p>

                {/* NFT Visualizer */}
                <div className="w-full h-32 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-xl shadow-lg mb-6 flex flex-col justify-between p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20 mix-blend-overlay"></div>
                  <div className="flex justify-between items-start z-10">
                    <span className="text-white font-black uppercase tracking-widest text-sm">Eventra '26</span>
                    <span className="text-white/80 font-mono text-[10px]">#8294</span>
                  </div>
                  <div className="z-10">
                    <span className="text-white/60 text-[8px] uppercase tracking-widest block">Face Value</span>
                    <span className="text-white font-mono font-bold">$150.00</span>
                  </div>
                </div>

                {/* Price Input Form */}
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Set Resale Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={listingPrice}
                      onChange={handlePriceChange}
                      disabled={transactionStatus !== 'IDLE'}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-black text-slate-800 outline-none focus:border-purple-500 transition disabled:opacity-50"
                    />
                  </div>
                  {listingPrice > priceCeiling && contractActive && (
                    <p className="text-[9px] font-bold text-rose-500 mt-2 flex items-center">
                      ⚠️ Exceeds smart contract ceiling ($180)
                    </p>
                  )}
                </div>

                {/* Result Overlay */}
                {transactionStatus === 'REVERTED' && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">✕</div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Transaction Reverted</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The blockchain rejected this listing. The Eventra smart contract strictly prohibits resales exceeding 120% of face value.
                    </p>
                  </div>
                )}
                
                {transactionStatus === 'APPROVED' && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">✓</div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">Listing Approved</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your ticket is now listed for ${listingPrice}.00. The smart contract successfully verified this price is under the anti-scalping ceiling.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Interaction Button */}
            <button 
              onClick={simulateTransfer}
              disabled={!contractActive || transactionStatus !== 'IDLE'}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                !contractActive || transactionStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-[0_10px_30px_rgba(147,51,234,0.4)]'
              }`}
            >
              {transactionStatus === 'SIMULATING' ? 'Signing Transaction...' : 'Sign Wallet Transaction'}
            </button>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BlockchainPriceEnforcer;
