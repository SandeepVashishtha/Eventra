import React, { useState, useEffect } from 'react';

const DIDTicketing = () => {
  const [verificationState, setVerificationState] = useState('idle'); // idle, scanning, verified, failed
  
  // Simulated cryptographic ticket data
  const [ticketData, setTicketData] = useState(null);

  const simulateScan = () => {
    setVerificationState('scanning');
    setTicketData(null);
    
    setTimeout(() => {
      // 90% chance of success, 10% chance of fake/scalped ticket
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setVerificationState('verified');
        setTicketData({
          did: 'did:ethr:0x8f...39c2',
          issuer: 'Eventra_Global_Authority',
          owner: 'Elena Rostova',
          ticketType: 'VIP All-Access',
          timestamp: new Date().toISOString(),
          cryptographicHash: '0x94f8e2...a1b9'
        });
      } else {
        setVerificationState('failed');
      }
      
      setTimeout(() => {
        setVerificationState('idle');
      }, 5000); // Reset after 5 seconds
      
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Security & Anti-Fraud
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Decentralized Identity <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">(DID) Ticketing</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Solve the billion-dollar ticket scalping industry. Static QR codes are easily screenshotted and sold to multiple victims. Eventra issues W3C Verifiable Credentials directly to a user's secure identity wallet, cryptographically tied to their biometrics, making secondary market scalping mathematically impossible.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Cryptographic Verification Log</h3>
             
             <div className="space-y-4 relative z-10 min-h-[200px]">
               {verificationState === 'idle' && !ticketData && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                   <span className="text-4xl mb-2">📡</span>
                   <p className="text-sm font-bold uppercase tracking-widest">Waiting for Gate Scan...</p>
                 </div>
               )}
               
               {verificationState === 'scanning' && (
                 <div className="h-full flex flex-col items-center justify-center text-emerald-600 py-10 animate-pulse">
                   <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-sm font-bold uppercase tracking-widest font-mono">Verifying W3C Credential Signature...</p>
                 </div>
               )}

               {verificationState === 'verified' && ticketData && (
                 <div className="bg-slate-900 rounded-2xl p-5 text-white animate-fade-in-up border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                   <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                     <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Signature Valid
                     </span>
                     <span className="text-xs text-slate-400 font-mono">Block: 1849201</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                       <span className="block text-[10px] text-slate-500 font-bold uppercase">DID Owner</span>
                       <span className="block text-sm font-black text-slate-200">{ticketData.owner}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] text-slate-500 font-bold uppercase">Access Level</span>
                       <span className="block text-sm font-black text-emerald-400">{ticketData.ticketType}</span>
                     </div>
                   </div>
                   
                   <div className="bg-black/50 p-3 rounded-lg border border-slate-800">
                     <span className="block text-[8px] text-slate-500 uppercase font-bold mb-1">Zero-Knowledge Proof Hash</span>
                     <span className="block text-[10px] font-mono text-slate-400 break-all">{ticketData.cryptographicHash}</span>
                   </div>
                 </div>
               )}

               {verificationState === 'failed' && (
                 <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-500 animate-fade-in-up shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                   <div className="flex items-center space-x-3 mb-2">
                     <span className="text-3xl">🛑</span>
                     <div>
                       <h4 className="font-black text-rose-700">Verification Failed</h4>
                       <span className="text-[10px] text-rose-600 font-bold uppercase">Invalid Signature / Counterfeit Detected</span>
                     </div>
                   </div>
                   <p className="text-xs text-rose-800 mt-2">The presented QR code is a static screenshot and lacks the dynamic cryptographic signature required for entry. Confiscate and direct to box office.</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Side: Identity Wallet Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-slate-50">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 pb-2 text-center">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Secure Identity Wallet</h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center">
              
              {/* The DID Ticket */}
              <div className="w-full bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center transform transition-transform hover:scale-105">
                
                {/* Holographic overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-blue-500/20 opacity-50 z-0 pointer-events-none"></div>
                
                <div className="relative z-10 w-full text-center mb-6">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Global Summit '26</span>
                  <h3 className="text-xl font-black">VIP All-Access</h3>
                </div>

                {/* Dynamic QR Code Simulator */}
                <div className="relative z-10 w-48 h-48 bg-white rounded-2xl p-3 shadow-inner flex items-center justify-center mb-6 overflow-hidden group cursor-pointer" onClick={simulateScan}>
                  
                  {/* Fake QR Pattern */}
                  <div className="w-full h-full border-4 border-slate-900 relative">
                    <div className="absolute top-2 left-2 w-8 h-8 border-4 border-slate-900"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-4 border-slate-900"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-slate-900"></div>
                    
                    {/* Dynamic sweeping line simulating rolling cryptography */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-[scan_2s_linear_infinite]"></div>
                    
                    <div className="absolute inset-8 grid grid-cols-4 grid-rows-4 gap-1">
                       {[...Array(16)].map((_, i) => (
                         <div key={i} className={`bg-slate-900 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}></div>
                       ))}
                    </div>
                  </div>
                  
                  {/* Click instruction */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-sm uppercase tracking-widest text-center">Tap to<br/>Simulate Gate Scan</span>
                  </div>
                </div>

                <div className="relative z-10 w-full bg-black/40 rounded-xl p-3 border border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">DID Owner</span>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">✓ Biometric Verified</span>
                  </div>
                  <span className="text-sm font-black">Elena Rostova</span>
                </div>

              </div>
              
              <p className="mt-8 text-[10px] text-slate-400 text-center font-mono max-w-[250px]">
                This credential regenerates its cryptographic signature every 30 seconds. Screenshots will be rejected at the gate.
              </p>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DIDTicketing;
