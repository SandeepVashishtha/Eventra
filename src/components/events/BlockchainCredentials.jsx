import React, { useState } from 'react';

const BlockchainCredentials = () => {
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [hash, setHash] = useState('');

  const handleMint = () => {
    setMinting(true);
    setTimeout(() => {
      setMinting(false);
      setMinted(true);
      setHash('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200 flex justify-center items-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            W3C Verifiable Credentials
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Immutable Proof of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Attendance</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Generate tamper-proof micro-credentials anchored on a public blockchain ledger. Instantly verifiable by medical boards, legal associations, and employers via a cryptographic public link.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">🚫</span>
              <h4 className="font-bold text-white text-sm">Zero Forgery</h4>
              <p className="text-xs text-slate-500 mt-1">Unlike static PDF certificates.</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">🔗</span>
              <h4 className="font-bold text-white text-sm">Public Ledger</h4>
              <p className="text-xs text-slate-500 mt-1">1-click employer verification.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Credential Dashboard */}
        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
          
          {/* Background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            
            <h3 className="text-xl font-black text-white mb-6">CME Certificate Issuance</h3>

            {/* Certificate Preview */}
            <div className={`w-full max-w-sm bg-gradient-to-br from-indigo-900 to-slate-900 border-2 rounded-2xl p-6 shadow-xl mb-8 transition-colors duration-500 ${minted ? 'border-emerald-500 shadow-emerald-500/20' : 'border-indigo-500/30'}`}>
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">⚕️</span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded border border-indigo-500/30">
                  {minted ? 'VERIFIED' : 'PENDING MINT'}
                </span>
              </div>
              
              <h4 className="font-black text-white text-lg leading-tight mb-2">Advanced Medical Ethics 2026</h4>
              <p className="text-xs text-indigo-200 mb-6 font-medium">Awarded to: Dr. Sarah Jenkins</p>
              
              <div className="flex justify-between items-end border-t border-indigo-500/30 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Credits Earned</p>
                  <p className="text-xl font-black text-white">12.0 CME</p>
                </div>
                
                {minted && (
                   <div className="w-10 h-10 bg-white p-1 rounded-sm">
                     {/* Simulated QR Code */}
                     <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80"></div>
                   </div>
                )}
              </div>
            </div>

            {/* Action Area */}
            <div className="w-full">
              {!minted ? (
                <button 
                  onClick={handleMint}
                  disabled={minting}
                  className={`w-full py-4 rounded-xl font-black shadow-lg transition flex items-center justify-center ${minting ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {minting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Minting to Polygon Network...
                    </>
                  ) : (
                    'Mint Credential to Blockchain'
                  )}
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in w-full">
                  <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-xl flex items-center">
                    <span className="text-emerald-400 text-xl mr-3">✓</span>
                    <div>
                      <p className="font-bold text-emerald-400 text-sm">Successfully Anchored</p>
                      <p className="text-[10px] text-emerald-500 font-mono mt-1 w-48 truncate">TxHash: {hash}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition text-sm">
                      Copy Public Link
                    </button>
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center">
                      <span className="mr-2">in</span> Add to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainCredentials;
