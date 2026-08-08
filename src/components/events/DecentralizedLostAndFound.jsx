import React, { useState } from 'react';

const DecentralizedLostAndFound = () => {
  const [bountyState, setBountyState] = useState('locked'); // locked, verifying, released
  const [bountyAmount] = useState(150.00); // 150 USDC
  const [item] = useState("iPhone 15 Pro Max (Titanium)");
  const [ownerWallet] = useState("0x4A2...8b9C");
  const [finderWallet] = useState("0x9F1...3d7E");
  
  // Transaction Log
  const [txLog, setTxLog] = useState([
    { id: 1, time: '14:20', event: 'Smart Contract Initialized (LostItemBounty.sol)' },
    { id: 2, time: '14:21', event: `150 USDC locked in escrow by ${ownerWallet}.` }
  ]);

  const simulateReturn = () => {
    setBountyState('verifying');
    addLog('NFC tap detected at Official Lost & Found Kiosk.');
    addLog('Requesting cryptographic verification signature...');
    
    setTimeout(() => {
      addLog('Signature valid. Item physically verified by Eventra Staff.');
      addLog('Executing releaseBounty() on Polygon network...');
      
      setTimeout(() => {
        setBountyState('released');
        addLog(`SUCCESS: 150 USDC transferred to finder ${finderWallet}.`);
        addLog('Smart Contract self-destruct sequence initiated.');
      }, 2500);
      
    }, 2000);
  };

  const addLog = (event) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setTxLog(prev => [...prev, { id: Date.now(), time: timeStr, event }]);
  };

  const resetSim = () => {
    setBountyState('locked');
    setTxLog([
      { id: 1, time: '14:20', event: 'Smart Contract Initialized (LostItemBounty.sol)' },
      { id: 2, time: '14:21', event: `150 USDC locked in escrow by ${ownerWallet}.` }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💸</span> Decentralized Finance (DeFi)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Decentralized Lost & Found <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Bounty System</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Attendees lose expensive items like phones and wallets constantly, but have zero financial incentive to trust strangers to return them. Eventra implements a Web3 smart contract bounty system. A user locks a USDC crypto bounty in escrow when an item is lost. When a good samaritan finds the item and verifies it at the lost-and-found tent via NFC, the blockchain instantly and trustlessly releases the bounty to the finder's wallet.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">⛓️</span> Smart Contract Observer
               </h3>
               
               <button 
                 onClick={resetSim}
                 className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm flex items-center bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
               >
                 Reset Contract
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 bountyState === 'locked' ? 'bg-amber-50 border-amber-200' :
                 bountyState === 'verifying' ? 'bg-blue-50 border-blue-200' :
                 'bg-slate-50 border-slate-200 opacity-50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Escrow Vault</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     bountyState === 'locked' || bountyState === 'verifying' ? 'text-amber-500' : 'text-slate-400 line-through'
                   }`}>
                     {bountyAmount.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-1 pb-1">USDC</span>
                 </div>
               </div>

               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 bountyState === 'released' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Finder Payout</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     bountyState === 'released' ? 'text-emerald-500' : 'text-slate-400'
                   }`}>
                     {bountyState === 'released' ? bountyAmount.toFixed(2) : '0.00'}
                   </span>
                   <span className="text-sm font-bold text-slate-400 ml-1 pb-1">USDC</span>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Blockchain Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {txLog.map((log) => (
                   <div key={log.id} className={`flex items-start animate-fade-in-up ${
                     log.event.includes('SUCCESS') ? 'text-emerald-400 font-bold' :
                     log.event.includes('locked') ? 'text-amber-400' :
                     log.event.includes('verifying') ? 'text-blue-400' : 'text-slate-300'
                   }`}>
                     <span className="text-slate-500 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.event}</span>
                   </div>
                 ))}
                 
                 {bountyState === 'verifying' && (
                   <div className="text-blue-400 animate-pulse mt-2 flex items-center">
                     <span className="mr-2">🔄</span> Waiting for block confirmation...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Finder's App Experience (Col span 5) */}
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
               
               {/* Finder Info */}
               <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                   {bountyState === 'released' ? '🤝' : '🔍'}
                 </div>
                 <h2 className="font-black text-slate-900 text-xl">Good Samaritan Portal</h2>
                 <p className="text-[10px] font-mono text-slate-500 mt-1">Wallet ID: {finderWallet}</p>
               </div>

               {/* Item Card */}
               <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 relative overflow-hidden">
                 {/* Bounty Ribbon */}
                 <div className="absolute top-4 -right-8 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 transform rotate-45 shadow-md">
                   {bountyAmount} USDC BOUNTY
                 </div>
                 
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Found Item</p>
                 <p className="font-bold text-slate-800 text-lg pr-12 leading-tight mb-4">{item}</p>
                 
                 <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <span>📍</span>
                   <span>Turn in at <strong className="text-slate-800">Main Kiosk C</strong></span>
                 </div>
               </div>

               {/* Action Area */}
               <div className="mt-auto relative h-40 flex flex-col justify-end">
                 
                 {bountyState === 'locked' && (
                   <button 
                     onClick={simulateReturn}
                     className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] uppercase tracking-widest text-sm hover:bg-blue-500 transition animate-bounce hover:animate-none"
                   >
                     Tap NFC to Verify Return
                   </button>
                 )}

                 {bountyState === 'verifying' && (
                   <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center h-[56px]">
                     <div className="flex items-center space-x-3">
                       <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-blue-700 font-bold text-xs uppercase tracking-widest">Validating Crypto Transfer...</span>
                     </div>
                   </div>
                 )}

                 {bountyState === 'released' && (
                   <div className="w-full bg-emerald-500 text-white rounded-xl p-6 shadow-[0_10px_20px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center animate-fade-in text-center relative overflow-hidden">
                     {/* Confetti effect placeholder */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
                     
                     <span className="text-3xl mb-2 relative z-10">🎉</span>
                     <span className="font-black text-lg leading-tight relative z-10">Bounty Claimed!</span>
                     <span className="text-[10px] mt-1 relative z-10 font-medium">150 USDC added to your wallet.</span>
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

export default DecentralizedLostAndFound;
