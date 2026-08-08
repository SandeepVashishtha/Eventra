import React, { useState, useEffect } from 'react';

const SmartContractAffiliatePayouts = () => {
  const [purchaseActive, setPurchaseActive] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: '0x8f3...2a1', affiliate: 'CryptoDaily', tickets: 2, amount: 600, split: { org: 540, aff: 60 }, status: 'settled', time: '10 mins ago' },
    { id: '0x4b9...9c4', affiliate: 'Web3Meetups', tickets: 1, amount: 300, split: { org: 270, aff: 30 }, status: 'settled', time: '1 hour ago' }
  ]);
  
  const [contractBalance, setContractBalance] = useState({ org: 42500, aff: 4720 });

  const simulateTicketPurchase = () => {
    setPurchaseActive(true);
    
    setTimeout(() => {
      // Execute the smart contract split
      const ticketPrice = 300;
      const orgCut = ticketPrice * 0.90; // 90%
      const affCut = ticketPrice * 0.10; // 10%
      
      const newTx = {
        id: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 5)}`,
        affiliate: 'TechInfluencer_X',
        tickets: 1,
        amount: ticketPrice,
        split: { org: orgCut, aff: affCut },
        status: 'settled',
        time: 'Just now'
      };

      setTransactions(prev => [newTx, ...prev]);
      setContractBalance(prev => ({
        org: prev.org + orgCut,
        aff: prev.aff + affCut
      }));
      setPurchaseActive(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 & Blockchain
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Smart Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Affiliate Payouts</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Eliminate accounting overhead and manual monthly wire transfers. Our Ethereum smart contracts automatically and instantly split ticket revenue between the organizer and the affiliate promoter the exact second a sale is made.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Smart Contract</h3>
             
             <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 mb-6 border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">VERIFIED</div>
               <p className="text-indigo-400 mb-2">// AffiliateSplitter.sol</p>
               <p><span className="text-pink-500">function</span> <span className="text-emerald-400">processTicketSale</span>() <span className="text-pink-500">public payable</span> {'{'}</p>
               <p className="ml-4"><span className="text-blue-400">uint256</span> affiliateCut = msg.value * 10 / 100;</p>
               <p className="ml-4"><span className="text-blue-400">uint256</span> organizerCut = msg.value - affiliateCut;</p>
               <p className="ml-4 mt-2 text-slate-500">// Instant on-chain routing</p>
               <p className="ml-4">affiliateWallet.<span className="text-emerald-400">transfer</span>(affiliateCut);</p>
               <p className="ml-4">organizerWallet.<span className="text-emerald-400">transfer</span>(organizerCut);</p>
               <p>{'}'}</p>
             </div>

             <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
               <span className="text-sm font-bold text-slate-700">Contract Address</span>
               <span className="text-xs font-mono text-indigo-600 font-bold">0x7A2...9F14</span>
             </div>
          </div>
        </div>

        {/* Right Side: Ledger & Simulation (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Live Ledger</h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">USDC Transactions</p>
            </div>
            
            <button 
              onClick={simulateTicketPurchase}
              disabled={purchaseActive}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center shadow-sm ${purchaseActive ? 'bg-indigo-100 text-indigo-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {purchaseActive ? (
                <><span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></span> Executing Contract...</>
              ) : (
                'Simulate Affiliate Sale (1 TKT)'
              )}
            </button>
          </div>

          {/* Balance Overview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Organizer Wallet</h4>
              <span className="text-3xl font-black text-slate-900">${contractBalance.org.toLocaleString()} <span className="text-sm text-slate-400 font-normal">USDC</span></span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -mr-8 -mt-8"></div>
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Affiliate Payouts</h4>
              <span className="text-3xl font-black text-indigo-700">${contractBalance.aff.toLocaleString()} <span className="text-sm text-indigo-400 font-normal">USDC</span></span>
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              On-Chain Settlement History
            </h3>
            
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition animate-fade-in-up">
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        {tx.affiliate}
                      </span>
                      <span className="text-xs text-slate-500 font-mono hidden md:inline">{tx.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{tx.time}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Ticket Purchase ({tx.tickets}x)</p>
                      <p className="text-xs text-slate-500 mt-0.5">Total Paid: ${tx.amount} USDC</p>
                    </div>
                    
                    {/* The Split Visualization */}
                    <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Org (90%)</p>
                        <p className="text-sm font-black text-slate-900">+${tx.split.org}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">Aff (10%)</p>
                        <p className="text-sm font-black text-indigo-600">+${tx.split.aff}</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SmartContractAffiliatePayouts;
