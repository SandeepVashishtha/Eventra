import React, { useState } from 'react';

const TokenGatedAccess = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null); // null, true, false
  const [walletAddress] = useState('0x71C...97d3');

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleVerifyOwnership = (hasToken) => {
    setVerifying(true);
    setAccessGranted(null);
    
    setTimeout(() => {
      setVerifying(false);
      setAccessGranted(hasToken);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 items-center justify-center relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-amber-900/50 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Web3 / Token-Gating
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Token-Gated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Session Access</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Instantly enforce exclusive access to VIP parties or DAO workshops. Attendees simply connect their Web3 wallet, and Eventra verifies their smart contract holdings on-chain before issuing a secure entry badge.
          </p>
          
          <div className="pt-4 flex space-x-4">
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex-1">
               <span className="text-2xl block mb-2">🦊</span>
               <h4 className="font-bold text-white text-sm">WalletConnect Ready</h4>
               <p className="text-xs text-slate-500 mt-1">Supports MetaMask, Coinbase, & 100+ wallets.</p>
             </div>
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex-1">
               <span className="text-2xl block mb-2">⛓️</span>
               <h4 className="font-bold text-white text-sm">On-Chain Verification</h4>
               <p className="text-xs text-slate-500 mt-1">Zero reliance on unscalable Google Forms.</p>
             </div>
          </div>
        </div>

        {/* Right Side: Token-Gate Simulator */}
        <div className="flex justify-center">
          
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-800 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                <span className="text-3xl">🏛️</span>
              </div>
              <h2 className="text-xl font-black text-white">DAO Governance Summit</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Exclusive Alpha Workshop</p>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col justify-center min-h-[350px]">
              
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Entry Requirement</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">ETH</div>
                  <span className="text-white font-bold text-sm">Hold 1+ Developer DAO NFT</span>
                </div>
              </div>

              {!walletConnected ? (
                <div className="text-center animate-fade-in">
                  <button 
                    onClick={handleConnectWallet}
                    className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-3 mb-4"
                  >
                    <span>Connect Wallet to Verify</span>
                  </button>
                  <p className="text-[10px] text-slate-500 font-bold">We do not initiate any transactions. Signature only.</p>
                </div>
              ) : (
                <div className="animate-fade-in text-center flex flex-col items-center">
                  
                  <div className="flex items-center justify-center space-x-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 mb-6">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-slate-400">Connected: {walletAddress}</span>
                  </div>

                  {accessGranted === null && !verifying && (
                    <div className="w-full space-y-3">
                      <p className="text-sm text-slate-400 mb-4">Simulate contract verification outcome:</p>
                      <button 
                        onClick={() => handleVerifyOwnership(true)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition border border-slate-600"
                      >
                        Simulate: Wallet HOLDS Token
                      </button>
                      <button 
                        onClick={() => handleVerifyOwnership(false)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition border border-slate-600"
                      >
                        Simulate: Wallet DOES NOT Hold Token
                      </button>
                    </div>
                  )}

                  {verifying && (
                    <div className="flex flex-col items-center py-6">
                      <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-amber-500 font-bold text-sm">Querying Ethereum Mainnet...</p>
                    </div>
                  )}

                  {accessGranted === true && (
                    <div className="w-full animate-fade-in-up">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-500/50">✓</div>
                      <h3 className="text-xl font-black text-white mb-2">Access Granted</h3>
                      <p className="text-xs text-slate-400 mb-6">Token ownership verified successfully.</p>
                      
                      <div className="bg-white p-4 rounded-xl flex items-center justify-center mx-auto w-48 h-48">
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Eventra_VIP_${walletAddress}`} alt="QR Code" className="opacity-90" />
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-4">Scan at entrance</p>
                    </div>
                  )}

                  {accessGranted === false && (
                    <div className="w-full animate-fade-in-up">
                      <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/50">✕</div>
                      <h3 className="text-xl font-black text-white mb-2">Access Denied</h3>
                      <p className="text-sm text-slate-400 mb-6">No matching token found in this wallet.</p>
                      
                      <button 
                        onClick={() => setAccessGranted(null)}
                        className="text-amber-500 text-xs font-bold hover:underline"
                      >
                        Try a different wallet
                      </button>
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

export default TokenGatedAccess;
