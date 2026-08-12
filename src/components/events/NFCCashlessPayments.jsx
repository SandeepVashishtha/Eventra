import React, { useState } from 'react';

const NFCCashlessPayments = () => {
  const [bandLinked, setBandLinked] = useState(true);
  const [balance, setBalance] = useState(145.50);
  const [simulatingTap, setSimulatingTap] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 'tx-892', vendor: 'Main Stage Beer Tent', amount: -12.50, time: '2:15 PM' },
    { id: 'tx-891', vendor: 'Festival Merch Shop', amount: -45.00, time: '1:30 PM' },
    { id: 'tx-890', vendor: 'Auto-Reload (Credit Card)', amount: 100.00, time: '12:00 PM' }
  ]);

  const handleSimulateTap = () => {
    setSimulatingTap(true);
    setTransactionSuccess(false);
    
    // Simulate NFC read delay and transaction processing
    setTimeout(() => {
      setSimulatingTap(false);
      setTransactionSuccess(true);
      
      const newTx = {
        id: `tx-${Math.floor(Math.random() * 1000)}`,
        vendor: 'Gourmet Food Truck',
        amount: -18.75,
        time: 'Just now'
      };
      
      setBalance(prev => prev - 18.75);
      setTransactions(prev => [newTx, ...prev]);
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setTransactionSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            NFC Wearable Tech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Frictionless <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Cashless Payments</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Eliminate massive vendor lines. Attendees link their credit cards directly to their NFC smart wristbands, enabling instant tap-to-pay at any vendor POS terminal.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start">
              <span className="text-2xl mb-2 text-rose-500">🏃</span>
              <h4 className="font-bold text-slate-800 text-sm">Kill the Queue</h4>
              <p className="text-xs text-slate-500 mt-1">2x faster than swiping cards.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start">
              <span className="text-2xl mb-2 text-rose-500">📈</span>
              <h4 className="font-bold text-slate-800 text-sm">Boost Revenue</h4>
              <p className="text-xs text-slate-500 mt-1">Frictionless spending increases sales by 30%.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center relative">
          
          {/* Simulated Phone Frame */}
          <div className="w-[360px] h-[720px] bg-white rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            {/* App UI */}
            <div className="flex-1 bg-slate-50 flex flex-col pt-12 pb-6 px-4">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Eventra Pay</h2>
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold">JD</div>
              </div>

              {/* Digital Wristband Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-8">
                {/* NFC Symbol */}
                <div className="absolute top-4 right-4 opacity-30">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.5 12.5C5.5 12.5 7.5 16.5 12 16.5C16.5 16.5 18.5 12.5 18.5 12.5"></path>
                    <path d="M7 9.5C7 9.5 8.5 13.5 12 13.5C15.5 13.5 17 9.5 17 9.5"></path>
                    <path d="M8.5 6.5C8.5 6.5 9.5 10.5 12 10.5C14.5 10.5 15.5 6.5 15.5 6.5"></path>
                  </svg>
                </div>

                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Wristband Balance</p>
                <h3 className="text-4xl font-black text-white mb-6">${balance.toFixed(2)}</h3>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Linked Card</p>
                    <p className="text-white font-mono text-sm">•••• 4242</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <span className="text-[10px] text-white font-bold flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></span>
                      Auto-Reload ON
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulator Action Area */}
              <div className="flex justify-center mb-8 relative h-32 items-center">
                
                {simulatingTap ? (
                  <div className="relative flex justify-center items-center">
                    <div className="w-24 h-24 bg-rose-500/20 rounded-full animate-ping absolute"></div>
                    <div className="w-32 h-32 bg-rose-500/10 rounded-full animate-pulse absolute" style={{ animationDuration: '2s' }}></div>
                    <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center text-white text-2xl z-10 shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                ) : transactionSuccess ? (
                  <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner">
                      ✓
                    </div>
                    <p className="text-sm font-bold text-emerald-600">Payment Approved!</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleSimulateTap}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                  >
                    <span>Simulate Vendor POS Tap</span>
                  </button>
                )}
              </div>

              {/* Transaction History */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Recent Transactions</h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{tx.vendor}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.time} • {tx.id}</p>
                      </div>
                      <span className={`font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NFCCashlessPayments;
