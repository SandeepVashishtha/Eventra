import React, { useState } from 'react';

const VendorRevenueSplitter = () => {
  const [transactionState, setTransactionState] = useState('idle'); // idle, tapping, processing, complete
  const [activeTx, setActiveTx] = useState(null);

  const [ledger, setLedger] = useState([
    { id: 'tx_821', vendor: 'Tokyo Street Eats', amount: 14.50, orgCut: 2.90, vendorCut: 11.60, currency: 'JPY', status: 'settled' },
    { id: 'tx_822', vendor: 'Berlin Bratwurst', amount: 9.00, orgCut: 1.80, vendorCut: 7.20, currency: 'EUR', status: 'settled' }
  ]);

  const [orgTotal, setOrgTotal] = useState(14820.50);

  const handleNfcTap = () => {
    setTransactionState('tapping');
    
    setTimeout(() => {
      setTransactionState('processing');
      
      const newTx = {
        id: `tx_${Math.floor(Math.random() * 1000) + 900}`,
        vendor: 'Mexico City Tacos',
        amount: 10.00,
        orgCut: 2.00, // 20% flat fee
        vendorCut: 8.00,
        currency: 'MXN', // Target payout currency
        status: 'processing'
      };
      
      setActiveTx(newTx);
      
      setTimeout(() => {
        setTransactionState('complete');
        newTx.status = 'settled';
        
        setLedger(prev => [newTx, ...prev]);
        setOrgTotal(prev => prev + newTx.orgCut);
        
        setTimeout(() => {
          setTransactionState('idle');
          setActiveTx(null);
        }, 3000);
        
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💸</span> FinTech Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Revenue Splitting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">On-Site Economy</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Completely digitize the physical economy of your mega-festival. Eventra acts as the Master Merchant of Record. Attendees pay via RFID wristbands, and our Stripe Connect integration instantly splits the transaction, routing the organizer fee to your master account and the remaining funds to the international vendor's local bank account in their native currency.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Master Organizer Ledger</h3>
               <span className="bg-emerald-900/50 text-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Stripe Connect Live
               </span>
             </div>
             
             <div className="flex justify-between items-end mb-6">
               <div>
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Total Organizer Revenue (20% Cut)</span>
                 <span className="text-3xl font-black text-white font-mono">${orgTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
             </div>

             <div className="space-y-3">
               {ledger.map(tx => (
                 <div key={tx.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between animate-fade-in-up">
                   
                   <div>
                     <span className="block font-bold text-white text-sm">{tx.vendor}</span>
                     <span className="block text-[10px] text-neutral-500 font-mono">TX: {tx.id} • Item Sale: ${tx.amount.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex space-x-4 items-center">
                     <div className="text-right">
                       <span className="block text-[10px] text-emerald-500 font-bold uppercase">Org Cut</span>
                       <span className="block text-sm font-black text-white">+${tx.orgCut.toFixed(2)}</span>
                     </div>
                     <div className="text-right border-l border-neutral-700 pl-4">
                       <span className="block text-[10px] text-yellow-500 font-bold uppercase">Vendor Payout</span>
                       <span className="block text-sm font-black text-neutral-300">
                         ${tx.vendorCut.toFixed(2)} <span className="text-[10px]">→ {tx.currency}</span>
                       </span>
                     </div>
                   </div>
                   
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Side: Vendor Point of Sale Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-neutral-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-10 flex justify-between items-center px-6 text-neutral-900 text-xs font-bold bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Vendor App Header */}
            <div className="bg-white p-6 pb-4 border-b border-neutral-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-black text-neutral-900">Mexico City Tacos</h2>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded">Vendor Terminal 04</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-neutral-50 flex flex-col relative overflow-hidden">
              
              {transactionState === 'idle' ? (
                // POS State
                <div className="flex-1 p-6 flex flex-col justify-between animate-fade-in">
                  <div>
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 flex justify-between items-center shadow-sm">
                      <span className="font-bold text-neutral-800">Al Pastor Taco (x2)</span>
                      <span className="font-black text-neutral-900">$10.00</span>
                    </div>
                    
                    <div className="text-right px-2">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Total Due</span>
                      <span className="text-4xl font-black text-neutral-900">$10.00</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleNfcTap}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-black py-5 rounded-2xl transition shadow-xl flex flex-col items-center justify-center transform hover:-translate-y-1"
                  >
                    <span className="text-3xl mb-2">⌚</span>
                    Tap RFID Wristband
                  </button>
                </div>
              ) : (
                // Processing & Routing State
                <div className="absolute inset-0 bg-neutral-900 z-20 flex flex-col p-6 animate-fade-in-up">
                  
                  {transactionState === 'tapping' ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 border-4 border-yellow-500/30 rounded-full flex items-center justify-center mb-6 relative">
                         <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping"></div>
                         <span className="text-5xl relative z-10">⌚</span>
                      </div>
                      <h3 className="text-white font-black text-xl mb-1">Scanning Wristband</h3>
                      <p className="text-neutral-400 text-xs font-mono">Reading NFC payload...</p>
                    </div>
                  ) : transactionState === 'processing' ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-neutral-700 border-t-yellow-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-white font-black text-xl mb-4">Routing Funds</h3>
                      
                      {/* Visual Routing Split */}
                      <div className="w-full bg-black border border-neutral-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                          <span className="text-xs font-bold text-neutral-400">Total Charged</span>
                          <span className="text-sm font-black text-white">$10.00</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-emerald-500 font-bold uppercase">→ Organizer Acct (20%)</span>
                          <span className="text-xs font-mono text-emerald-400">$2.00</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-yellow-500 font-bold uppercase">→ Vendor Acct (MXN)</span>
                          <span className="text-xs font-mono text-yellow-400">$8.00</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <span className="text-emerald-500 text-5xl">✓</span>
                      </div>
                      <h3 className="text-white font-black text-2xl mb-2">Payment Approved</h3>
                      <p className="text-neutral-400 text-xs text-center">Funds successfully split and queued for payout via Stripe Connect.</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VendorRevenueSplitter;
