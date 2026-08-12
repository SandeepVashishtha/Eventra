import React, { useState } from 'react';

const NFCSmartBadgeVending = () => {
  const [transactionState, setTransactionState] = useState('idle'); // idle, tapping, processing, success, dispensed
  const [walletBalance, setWalletBalance] = useState(145.50);
  
  // Transaction Log
  const [txLog, setTxLog] = useState([
    { id: 'TX-889', item: 'T-Shirt (Merch Booth)', amount: 35.00, time: '14:20' }
  ]);

  const simulateTap = () => {
    setTransactionState('tapping');
    
    setTimeout(() => {
      setTransactionState('processing');
      
      setTimeout(() => {
        setTransactionState('success');
        setWalletBalance(prev => prev - 4.50);
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        setTxLog(prev => [{ id: `TX-${Math.floor(Math.random()*900)+100}`, item: 'Smart Water (Vending #4)', amount: 4.50, time: timeStr }, ...prev].slice(0, 4));
        
        setTimeout(() => {
          setTransactionState('dispensed');
          
          setTimeout(() => {
            setTransactionState('idle');
          }, 3000);
          
        }, 1500);
        
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Eventra Wallet App (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💳</span> FinTech Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Contactless NFC <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Smart-Badge Vending</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Attendees don't want to pull out their credit cards or phones every time they want a $4 bottle of water from a crowded venue. Eventra integrates directly with smart vending machine APIs. Attendees securely link their credit card to the Eventra mobile wallet. By simply tapping their physical NFC-enabled event badge on any vending machine, the transaction is instantly processed through the backend, turning the badge into a universal frictionless payment mechanism.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[420px] max-w-md mx-auto lg:mx-0">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-black text-slate-800">Eventra Wallet</h3>
               <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span> Linked to Visa •••• 4242
               </span>
             </div>

             {/* Digital ID / NFC Badge Representation */}
             <div className={`w-full h-48 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${
               transactionState === 'processing' ? 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-[0_0_30px_rgba(56,189,248,0.5)]' :
               transactionState === 'success' || transactionState === 'dispensed' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
               'bg-gradient-to-br from-slate-800 to-slate-900'
             }`}>
               {/* NFC Waves Animation */}
               <div className="absolute right-4 top-4 text-white/50">
                 <svg className={`w-8 h-8 ${transactionState === 'tapping' ? 'animate-ping text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
               </div>
               
               <div>
                 <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">VIP Attendee</p>
                 <p className="text-white font-black text-xl">Alex Mercer</p>
               </div>
               
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-white/70 text-[10px] uppercase tracking-widest mb-1">Available Balance</p>
                   <p className="text-white font-mono font-bold text-2xl">${walletBalance.toFixed(2)}</p>
                 </div>
                 <div className="text-white text-3xl">NFC))</div>
               </div>
             </div>

             {/* Transaction History */}
             <div className="mt-6 flex-1 flex flex-col">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Recent Transactions</h4>
               
               <div className="flex-1 overflow-y-auto space-y-3">
                 {txLog.map((tx, i) => (
                   <div key={i} className="flex justify-between items-center animate-fade-in">
                     <div className="flex items-center">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                         {tx.item.includes('Water') ? '💧' : '🛍️'}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{tx.item}</p>
                         <p className="text-[10px] text-slate-400 font-mono">{tx.id} • {tx.time}</p>
                       </div>
                     </div>
                     <span className="font-mono font-bold text-slate-600">-${tx.amount.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Smart Vending Machine Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-slate-800 rounded-t-3xl border-8 border-slate-900 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* Vending Machine Header / Screen */}
            <div className="h-40 bg-black p-4 flex flex-col items-center justify-center relative border-b-8 border-slate-700">
               <div className="absolute top-2 right-4 text-emerald-500 text-[10px] font-mono">ONLINE</div>
               
               {transactionState === 'idle' ? (
                 <div className="text-center">
                   <h2 className="text-sky-400 font-black text-2xl mb-1 tracking-widest">SMART VEND</h2>
                   <p className="text-white text-xs font-bold animate-pulse">TAP EVENT BADGE TO PURCHASE</p>
                 </div>
               ) : transactionState === 'tapping' ? (
                 <div className="text-center text-white">
                   <div className="text-3xl mb-2 animate-bounce">📱</div>
                   <p className="text-xs font-bold uppercase tracking-widest">Reading NFC...</p>
                 </div>
               ) : transactionState === 'processing' ? (
                 <div className="text-center text-sky-400">
                   <div className="w-8 h-8 border-4 border-slate-700 border-t-sky-400 rounded-full animate-spin mx-auto mb-2"></div>
                   <p className="text-[10px] font-mono uppercase tracking-widest">Processing Payment API...</p>
                 </div>
               ) : transactionState === 'success' ? (
                 <div className="text-center text-emerald-400">
                   <div className="text-3xl mb-1">✅</div>
                   <p className="text-xs font-black uppercase tracking-widest">Payment Approved</p>
                   <p className="text-[10px] font-mono text-white mt-1">Dispensing Item A4...</p>
                 </div>
               ) : (
                 <div className="text-center text-white">
                   <p className="text-lg font-black uppercase tracking-widest">Please Take Your Item</p>
                   <p className="text-[10px] text-slate-400 mt-1">Enjoy the event!</p>
                 </div>
               )}
            </div>

            {/* Vending Machine Glass/Products */}
            <div className="flex-1 bg-slate-900/50 p-6 grid grid-cols-3 gap-4 relative shadow-inner">
               
               {/* Product Grid */}
               {[1,2,3,4,5,6].map((item, i) => (
                 <div key={i} className="flex flex-col items-center justify-end h-24 border-b-2 border-slate-700 relative">
                   {/* The product (Water Bottle) */}
                   <div className={`w-8 h-16 bg-gradient-to-b from-sky-300 to-blue-500 rounded-t-lg rounded-b shadow-lg relative ${
                     (i === 3 && transactionState === 'dispensed') ? 'translate-y-48 opacity-0 transition-all duration-1000' : 
                     (i === 3 && transactionState === 'success') ? 'animate-bounce' : ''
                   }`}>
                     <div className="absolute top-2 inset-x-0 h-4 bg-white/20"></div>
                     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-slate-200 rounded-t"></div>
                   </div>
                   {/* Coil */}
                   <div className="w-12 h-4 border-2 border-slate-500 rounded-full absolute bottom-0 opacity-50"></div>
                   
                   <span className="absolute -bottom-5 text-[8px] bg-black text-white px-1 font-mono rounded">
                     {i === 3 ? 'A4 - $4.50' : `A${i+1} - $4.50`}
                   </span>
                 </div>
               ))}
               
               {/* Glass Reflection */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Vending Machine Dispenser Tray */}
            <div className="h-32 bg-slate-800 border-t-8 border-slate-900 flex justify-center items-end pb-4 relative">
              <div className="w-3/4 h-20 bg-black rounded-lg border-t-4 border-slate-700 shadow-inner relative overflow-hidden flex justify-center items-center">
                 {/* Item lands in tray */}
                 {transactionState === 'dispensed' && (
                   <div className="w-8 h-16 bg-gradient-to-b from-sky-300 to-blue-500 rounded animate-fade-in transform rotate-90 absolute"></div>
                 )}
                 <div className="absolute top-0 inset-x-0 h-2 bg-black/50 shadow-md"></div>
              </div>
            </div>

            {/* Simulated Attendee Action Button */}
            {transactionState === 'idle' && (
              <button 
                onClick={simulateTap}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-500 hover:bg-sky-400 text-white font-black text-xs px-6 py-4 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.6)] animate-bounce z-50 uppercase tracking-widest"
              >
                Simulate Badge Tap
              </button>
            )}

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default NFCSmartBadgeVending;
