import React, { useState } from 'react';

const SmartContractRevenueSplit = () => {
  const [transactionState, setTransactionState] = useState('idle'); // idle, processing, complete
  const [purchaseAmount] = useState(15.00); // 15 USDC
  const [vendorCut] = useState(80); // 80%
  const [organizerCut] = useState(20); // 20%
  
  // Balances
  const [vendorBalance, setVendorBalance] = useState(1450.00);
  const [organizerBalance, setOrganizerBalance] = useState(38400.00);
  
  // Transaction Log
  const [txLog, setTxLog] = useState([
    { id: 1, time: '14:20', event: 'POS Smart Contract Initialized (RevenueSplit.sol)' },
    { id: 2, time: '14:21', event: `Contract loaded. Split parameters: Vendor ${vendorCut}% | Organizer ${organizerCut}%.` }
  ]);

  const simulatePurchase = () => {
    setTransactionState('processing');
    addLog('NFC payment tapped. Requesting customer USDC allowance...');
    
    setTimeout(() => {
      addLog(`Allowance confirmed. Executing buyMeal(${purchaseAmount} USDC)...`);
      
      setTimeout(() => {
        const vCut = purchaseAmount * (vendorCut / 100);
        const oCut = purchaseAmount * (organizerCut / 100);
        
        setVendorBalance(prev => prev + vCut);
        setOrganizerBalance(prev => prev + oCut);
        
        setTransactionState('complete');
        addLog(`SUCCESS: Contract routed ${vCut.toFixed(2)} USDC to Vendor Wallet.`);
        addLog(`SUCCESS: Contract routed ${oCut.toFixed(2)} USDC to Organizer Wallet.`);
        
        setTimeout(() => {
          setTransactionState('idle');
        }, 3000);
        
      }, 2000);
      
    }, 1500);
  };

  const addLog = (event) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTxLog(prev => [...prev, { id: Date.now(), time: timeStr, event }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💸</span> Web3 FinTech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart-Contract Vendor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Revenue Splitting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Organizers often take 30 days post-event to calculate percentage-based revenue cuts for food vendors, leading to massive accounting disputes and delayed payments. Eventra transitions the vendor point-of-sale (POS) system to the blockchain. When an attendee buys a meal, the smart contract instantly splits the transaction mathematically based on the agreed-upon terms, routing funds directly to the respective wallets. Zero manual accounting required.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🔗</span> Contract Auditor
               </h3>
               <span className="bg-black text-teal-500 px-3 py-1 rounded-full text-[10px] font-mono border border-slate-800">
                 Status: ACTIVE (Polygon)
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Vendor Wallet */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 transactionState === 'complete' ? 'bg-teal-900/40 border-teal-500/50 scale-[1.02]' : 'bg-black border-slate-800'
               }`}>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Vendor Wallet</span>
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Cut: {vendorCut}%</span>
                 </div>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     transactionState === 'complete' ? 'text-teal-400' : 'text-white'
                   }`}>
                     {vendorBalance.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">USDC</span>
                 </div>
               </div>

               {/* Organizer Wallet */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 transactionState === 'complete' ? 'bg-cyan-900/40 border-cyan-500/50 scale-[1.02]' : 'bg-black border-slate-800'
               }`}>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Organizer Wallet</span>
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Cut: {organizerCut}%</span>
                 </div>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     transactionState === 'complete' ? 'text-cyan-400' : 'text-white'
                   }`}>
                     {organizerBalance.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">USDC</span>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Blockchain Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {txLog.map((log) => (
                   <div key={log.id} className={`flex items-start animate-fade-in-up ${
                     log.event.includes('SUCCESS') ? 'text-emerald-400 font-bold' :
                     log.event.includes('processing') ? 'text-teal-400' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.event}</span>
                   </div>
                 ))}
                 
                 {transactionState === 'processing' && (
                   <div className="text-teal-400 animate-pulse mt-2 flex items-center">
                     <span className="mr-2">🔄</span> Awaiting block confirmation...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Vendor POS (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-30 bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 px-6 flex flex-col bg-slate-50">
               
               {/* Header Info */}
               <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                   🍔
                 </div>
                 <h2 className="font-black text-slate-900 text-xl">SmashBurger Co.</h2>
                 <p className="text-[10px] font-mono text-slate-500 mt-1">POS Terminal #4</p>
               </div>

               {/* Cart */}
               <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Current Order</p>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-800 text-sm">Double Smashburger</span>
                     <span className="font-mono text-sm text-slate-600">12.00</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-800 text-sm">Fries</span>
                     <span className="font-mono text-sm text-slate-600">3.00</span>
                   </div>
                 </div>
                 
                 <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end">
                   <span className="font-black text-slate-800">Total</span>
                   <span className="font-black font-mono text-2xl text-teal-600 leading-none">{purchaseAmount.toFixed(2)} <span className="text-xs">USDC</span></span>
                 </div>
               </div>

               {/* Action Area */}
               <div className="relative h-24 flex flex-col justify-end">
                 
                 {transactionState === 'idle' && (
                   <button 
                     onClick={simulatePurchase}
                     className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.2)] uppercase tracking-widest text-sm hover:bg-slate-800 transition transform hover:-translate-y-1"
                   >
                     Tap NFC to Pay
                   </button>
                 )}

                 {transactionState === 'processing' && (
                   <div className="w-full bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col items-center justify-center h-full">
                     <div className="flex items-center space-x-3">
                       <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-teal-700 font-bold text-xs uppercase tracking-widest">Routing via Smart Contract...</span>
                     </div>
                   </div>
                 )}

                 {transactionState === 'complete' && (
                   <div className="w-full bg-emerald-500 text-white rounded-xl p-4 shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center animate-fade-in text-center h-full relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
                     <div className="flex items-center space-x-2 relative z-10">
                       <span className="text-2xl">✅</span>
                       <span className="font-black text-lg">Payment Complete</span>
                     </div>
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

export default SmartContractRevenueSplit;
