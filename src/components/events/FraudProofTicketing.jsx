import React, { useState, useEffect } from 'react';

const FraudProofTicketing = () => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [qrKey, setQrKey] = useState(0);

  // Simulate dynamic QR code refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reset timer and update QR key to force re-render
          setQrKey(k => k + 1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Polygon Layer-2 Powered
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Fraud-Proof <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">NFT Ticketing</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Eliminate ticket scalping and counterfeit entries. Your ticket is a cryptographically secure NFT tied to your wallet, featuring a dynamic QR code that refreshes every 15 seconds to prevent screenshots.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">📸</span>
              <h4 className="font-bold text-white text-sm">Screenshot Proof</h4>
              <p className="text-xs text-slate-500 mt-1">Static images fail at the gate.</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">🛡️</span>
              <h4 className="font-bold text-white text-sm">Smart Contract</h4>
              <p className="text-xs text-slate-500 mt-1">Guarantees true ownership.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center">
          <div className="w-[340px] bg-black rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            <div className="flex-1 bg-slate-50 flex flex-col relative pt-12 pb-6 px-6">
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-900 font-black text-xl">Eventra</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                </div>
              </div>

              {/* The Ticket Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full relative">
                
                {/* Visual Header */}
                <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-500 relative flex items-center justify-center p-6">
                  <div className="absolute top-2 right-3 text-white/50 text-[10px] font-mono">
                    Token #8492
                  </div>
                  <h3 className="text-white font-black text-2xl text-center leading-tight drop-shadow-md">
                    Global Tech Summit 2026
                  </h3>
                </div>
                
                {/* Scalloped edges */}
                <div className="flex justify-between items-center -mt-3 -mx-3 relative z-10">
                  <div className="w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200"></div>
                  <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                  <div className="w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200"></div>
                </div>

                <div className="p-6 flex flex-col items-center flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admit One</p>
                  
                  {/* Dynamic QR Container */}
                  <div className="relative">
                    {/* The QR Code (Simulated) */}
                    <div 
                      key={qrKey} // Forces re-render animation when key changes
                      className="w-48 h-48 bg-white border-4 border-slate-100 p-2 rounded-xl animate-fade-in shadow-inner relative"
                    >
                      <div 
                        className="w-full h-full bg-cover opacity-80"
                        style={{
                          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')`,
                          filter: `hue-rotate(${qrKey * 45}deg)` // Shift color slightly to visually prove it changed
                        }}
                      ></div>
                      
                      {/* Scanning laser effect */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 shadow-[0_0_10px_#a855f7] animate-scan"></div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center w-full">
                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                      <span>Refreshes in:</span>
                      <span className={`font-mono text-lg ${timeLeft <= 3 ? 'text-red-500' : 'text-purple-600'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 linear ${timeLeft <= 3 ? 'bg-red-500' : 'bg-purple-500'}`}
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 text-center w-full border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center">
                      <span className="text-green-500 mr-1">✓</span> Verified Wallet: 0x7a...4f2c
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FraudProofTicketing;
