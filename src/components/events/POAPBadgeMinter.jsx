import React, { useState } from 'react';

const POAPBadgeMinter = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [mintStatus, setMintStatus] = useState('idle'); // idle, scanning, minting, success
  const [badges, setBadges] = useState([
    { id: 1, event: 'TechSummit 2025', date: 'Oct 14, 2025', type: 'Early Adopter', image: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
    { id: 2, event: 'Web3 Global', date: 'Jan 22, 2026', type: 'VIP Speaker', image: 'bg-gradient-to-br from-emerald-400 to-teal-600' }
  ]);

  const connectWallet = () => {
    setWalletConnected(true);
  };

  const simulateCheckIn = () => {
    if (!walletConnected) return;
    
    setMintStatus('scanning');
    
    setTimeout(() => {
      setMintStatus('minting');
      
      setTimeout(() => {
        setMintStatus('success');
        setBadges([
          { id: Date.now(), event: 'Future of AI Panel', date: 'Aug 5, 2026', type: 'Exclusive Access', image: 'bg-gradient-to-br from-rose-500 to-orange-500' },
          ...badges
        ]);
        
        setTimeout(() => {
          setMintStatus('idle');
        }, 3000);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Collection (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦄</span> Web3 Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Cryptographic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">POAP Badges</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">
            Give your attendees a permanent, verifiable digital souvenir. When they check into a session, instantly mint and airdrop a Proof of Attendance Protocol (POAP) NFT directly to their crypto wallet.
          </p>

          {/* User's Collection */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Digital Passport</h3>
               <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-inner border border-slate-600">
                 {badges.length} Badges
               </span>
             </div>

             <div className="grid grid-cols-3 gap-4">
               {badges.map((badge, idx) => (
                 <div key={badge.id} className={`flex flex-col items-center group animate-fade-in-up`} style={{ animationDelay: `${idx * 100}ms` }}>
                   
                   {/* The Badge Graphic */}
                   <div className={`w-full aspect-square rounded-full ${badge.image} p-1 shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-4 border-slate-900 relative overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 cursor-pointer`}>
                     {/* Gloss effect */}
                     <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full mix-blend-overlay"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center drop-shadow-md">
                       <span className="text-2xl mb-1">🏅</span>
                       <span className="text-[9px] font-black leading-tight">{badge.event}</span>
                     </div>
                   </div>
                   
                   <div className="mt-3 text-center">
                     <span className="block text-xs font-bold text-white mb-0.5">{badge.type}</span>
                     <span className="block text-[9px] text-slate-500 uppercase tracking-widest">{badge.date}</span>
                   </div>
                 </div>
               ))}
               
               {/* Empty Slots */}
               {Array(Math.max(0, 3 - badges.length)).fill(0).map((_, i) => (
                 <div key={`empty-${i}`} className="flex flex-col items-center opacity-30">
                   <div className="w-full aspect-square rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center">
                     <span className="text-slate-500 text-xs font-bold uppercase">Locked</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Side: The Scanner/Minter App (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* Top Bar */}
            <div className="h-10 flex justify-end items-center px-6">
              {!walletConnected ? (
                <button 
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md transition"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500"></div>
                  <span className="text-[10px] font-mono text-slate-300">0x7F...3B9</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              
              {/* Status Text */}
              <div className="text-center mb-10 z-10">
                <h2 className="text-xl font-black text-white mb-2">Future of AI Panel</h2>
                <p className="text-xs text-slate-400">Scan at door to claim your POAP.</p>
              </div>

              {/* NFC / QR Scanner Interaction Area */}
              <div className="relative w-48 h-48 mb-8 z-10 flex items-center justify-center">
                
                {mintStatus === 'idle' && (
                  <button 
                    onClick={simulateCheckIn}
                    disabled={!walletConnected}
                    className={`absolute inset-0 rounded-full border-4 flex items-center justify-center transition-all ${walletConnected ? 'border-fuchsia-500 bg-fuchsia-500/10 cursor-pointer hover:bg-fuchsia-500/20' : 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="text-center">
                      <span className="block text-4xl mb-2">📱</span>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">
                        {walletConnected ? 'Tap to Scan' : 'Connect First'}
                      </span>
                    </div>
                    {walletConnected && <div className="absolute inset-0 border-2 border-fuchsia-400 rounded-full animate-ping opacity-20"></div>}
                  </button>
                )}

                {mintStatus === 'scanning' && (
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-900">
                    <div className="w-full h-1 bg-fuchsia-500 absolute top-0 animate-[scan_1.5s_ease-in-out_infinite] shadow-[0_0_15px_#d946ef]"></div>
                    <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest animate-pulse">Reading NFC...</span>
                  </div>
                )}

                {mintStatus === 'minting' && (
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 flex flex-col items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center px-4">
                      Minting to<br/>Polygon Network
                    </span>
                  </div>
                )}

                {mintStatus === 'success' && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-fade-in">
                    <span className="text-5xl mb-2 drop-shadow-md">🎉</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">
                      POAP Airdropped!
                    </span>
                  </div>
                )}

              </div>
              
              {/* Bottom Context Info */}
              <div className="bg-slate-900 p-4 rounded-2xl w-full border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-mono block">Contract: 0x22C1f6050E56...</span>
                <span className="text-[10px] text-emerald-500 font-mono block mt-1">✓ Gas Fees Covered by Organizer</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default POAPBadgeMinter;
