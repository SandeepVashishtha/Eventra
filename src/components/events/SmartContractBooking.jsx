import React, { useState, useEffect } from 'react';

const SmartContractBooking = () => {
  const [contractState, setContractState] = useState('funded'); // funded, arrived, completed
  const [balance, setBalance] = useState({ escrow: 50.00, artist: 0.00 }); // ETH
  const [gpsVerified, setGpsVerified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // seconds until set finishes (simulated)
  
  // Transaction Log
  const [txLog, setTxLog] = useState([
    { id: '0x1a...', action: 'CONTRACT_DEPLOYED', time: '10:00 AM' },
    { id: '0x2b...', action: 'FUNDS_DEPOSITED (50 ETH)', time: '10:05 AM' }
  ]);

  useEffect(() => {
    let setTimer;
    
    if (contractState === 'arrived') {
      setTimer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(setTimer);
            finishSet();
            return 0;
          }
          return prev - 1;
        });
      }, 100); // Super fast simulation for the demo
    }
    
    return () => clearInterval(setTimer);
  }, [contractState]);

  const simulateArrival = () => {
    setGpsVerified(true);
    
    setTimeout(() => {
      setContractState('arrived');
      setBalance({ escrow: 25.00, artist: 25.00 }); // 50% released
      setTxLog(prev => [...prev, { id: '0x8f...', action: 'GPS_VERIFIED', time: '8:00 PM' }]);
      setTimeout(() => {
        setTxLog(prev => [...prev, { id: '0x9c...', action: 'FUNDS_RELEASED (25 ETH)', time: '8:01 PM' }]);
      }, 500);
    }, 1500);
  };

  const finishSet = () => {
    setContractState('completed');
    setBalance({ escrow: 0.00, artist: 50.00 }); // Remaining 50% released
    setTxLog(prev => [...prev, { id: '0x4d...', action: 'SET_COMPLETED', time: '9:30 PM' }]);
    setTimeout(() => {
      setTxLog(prev => [...prev, { id: '0x5e...', action: 'FUNDS_RELEASED (25 ETH)', time: '9:31 PM' }]);
      setTimeout(() => {
        setTxLog(prev => [...prev, { id: '0x6f...', action: 'CONTRACT_CLOSED', time: '9:31 PM' }]);
      }, 500);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart-Contract Escrow <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">for Talent Booking</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Event organizers constantly battle with artists showing up late, while artists fight organizers for post-event payments. Eventra integrates Ethereum-based smart contracts into the talent booking process. The organizer deposits the booking fee into escrow. The contract utilizes GPS geofencing on the artist's app; when they physically enter the backstage area by call time, 50% of funds are instantly released, with the remainder released upon set completion.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Escrow Dashboard</h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span> ETHEREUM MAINNET
               </span>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-6">
               
               {/* Escrow Balance */}
               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Smart Contract Escrow</span>
                 <div className="flex items-end justify-between">
                   <span className={`text-4xl font-black font-mono transition-all duration-1000 ${
                     balance.escrow === 0 ? 'text-neutral-600' : 'text-purple-400'
                   }`}>
                     {balance.escrow.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-neutral-500 mb-1">ETH</span>
                 </div>
               </div>

               {/* Artist Wallet */}
               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Artist Wallet (Received)</span>
                 <div className="flex items-end justify-between">
                   <span className={`text-4xl font-black font-mono transition-all duration-1000 ${
                     balance.artist > 0 ? 'text-emerald-400' : 'text-neutral-600'
                   }`}>
                     {balance.artist.toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-neutral-500 mb-1">ETH</span>
                 </div>
               </div>

             </div>

             {/* Web3 Transaction Log */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Blockchain Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-neutral-400 pr-2">
                 {txLog.map((tx, i) => (
                   <div key={i} className="flex justify-between items-start animate-fade-in-up">
                     <div>
                       <span className="text-purple-500 mr-2">[{tx.id}]</span>
                       <span className={
                         tx.action.includes('FUNDS_RELEASED') ? 'text-emerald-400 font-bold' : 
                         tx.action.includes('GPS') ? 'text-sky-400' : 'text-neutral-300'
                       }>{tx.action}</span>
                     </div>
                     <span className="text-neutral-600 shrink-0">{tx.time}</span>
                   </div>
                 ))}
                 
                 {contractState === 'funded' && (
                   <div className="text-neutral-600 animate-pulse mt-4">Waiting for Oracle (GPS Geofence) trigger...</div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Artist Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-[2.5rem] border-[10px] border-neutral-900 shadow-2xl relative flex flex-col h-[650px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20 bg-black">
              <span>8:00 PM</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="px-6 py-4 border-b border-neutral-800 z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">Artist Portal</h2>
                <span className="text-[10px] text-purple-400 font-mono">Headliner Call Time: 8:00 PM</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center">
                <span className="text-lg">🎸</span>
              </div>
            </div>

            {/* GPS Map View */}
            <div className="h-48 relative overflow-hidden bg-slate-900 border-b border-neutral-800">
               {/* Map Background */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale opacity-50"></div>
               
               {/* The Geofence */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-purple-500 bg-purple-500/20 flex items-center justify-center">
                 <span className="text-white text-[8px] font-bold uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Backstage Zone</span>
               </div>
               
               {/* The Artist Marker */}
               <div className={`absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] border-2 border-black z-20 transition-all duration-1000 ${
                 gpsVerified ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'bottom-4 left-4'
               }`}></div>
            </div>

            {/* Contract Status UI */}
            <div className="flex-1 flex flex-col p-6 z-10 bg-black">
              
              {contractState === 'funded' && !gpsVerified ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">Awaiting Arrival</h3>
                  <p className="text-neutral-500 text-xs mb-8">Please enter the backstage geofence to unlock your 50% upfront payment.</p>
                  
                  <button 
                    onClick={simulateArrival}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                  >
                    Simulate GPS Entry
                  </button>
                </div>
              ) : contractState === 'funded' && gpsVerified ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-neutral-800 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-white font-bold mb-2">Verifying Location Oracle...</h3>
                    <p className="text-purple-400 text-xs font-mono">Executing smart contract.</p>
                 </div>
              ) : contractState === 'arrived' ? (
                <div className="flex-1 flex flex-col animate-fade-in pt-4">
                  
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
                    <div className="text-2xl mt-1">💸</div>
                    <div>
                      <h4 className="text-emerald-400 font-bold text-sm">Payment Received</h4>
                      <p className="text-neutral-400 text-xs mt-1">25.00 ETH has been deposited to your wallet for arriving on time.</p>
                    </div>
                  </div>
                  
                  <div className="text-center mt-auto mb-auto">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Set Completion Timer</span>
                    <span className="text-4xl font-black text-white font-mono">{timeRemaining}s</span>
                    <p className="text-neutral-500 text-xs mt-2">Remaining 50% held in escrow until set concludes.</p>
                  </div>
                  
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-white font-black text-2xl mb-2">Contract Fulfilled</h3>
                  <p className="text-emerald-400 text-sm font-bold mb-2">Total 50.00 ETH Paid</p>
                  <p className="text-neutral-500 text-xs">Funds are available in your Web3 wallet. Thanks for a great show!</p>
                </div>
              )}

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default SmartContractBooking;
