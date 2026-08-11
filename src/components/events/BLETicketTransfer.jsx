import React, { useState } from 'react';

const BLETicketTransfer = () => {
  const [transferState, setTransferState] = useState('idle'); // idle, pairing, signing, complete
  
  const [deviceProximity, setDeviceProximity] = useState(0);

  const initiateTransfer = () => {
    setTransferState('pairing');
    
    // Simulate bringing devices closer together
    let distance = 100;
    const interval = setInterval(() => {
      distance -= Math.floor(Math.random() * 15) + 5;
      setDeviceProximity(Math.max(0, distance));
      
      if (distance <= 10) {
        clearInterval(interval);
        setTransferState('signing');
        
        setTimeout(() => {
          setTransferState('complete');
          
          setTimeout(() => {
            setTransferState('idle');
            setDeviceProximity(0);
          }, 4000);
          
        }, 3000);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Tech Explaination (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛜</span> Offline Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Offline P2P <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ticket Transfers</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Terrible cellular reception at venue entrances causes massive bottlenecks when attendees try to transfer tickets to their friends. Eventra utilizes Bluetooth Low Energy (BLE) to facilitate an offline, peer-to-peer transfer. The original ticket holder's app mathematically signs the payload over to the friend's app, allowing the venue scanner to verify the cryptographic signature locally without needing internet access.
          </p>

          <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 shadow-xl relative overflow-hidden">
             
             <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center">
               <span className="text-blue-500 mr-2">🔐</span> Security Protocol Architecture
             </h3>

             <div className="space-y-4 relative z-10">
               
               <div className="flex items-start bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                 <div className="w-10 h-10 bg-indigo-900/30 text-indigo-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-indigo-500/30">1</div>
                 <div>
                   <h4 className="font-bold text-sm text-white mb-1">BLE Handshake Discovery</h4>
                   <p className="text-[10px] text-neutral-500 font-mono">Devices utilize Apple/Google Nearby Connections API to establish a secure, local peer-to-peer tunnel independent of cellular networks.</p>
                 </div>
               </div>

               <div className="flex items-start bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                 <div className="w-10 h-10 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-blue-500/30">2</div>
                 <div>
                   <h4 className="font-bold text-sm text-white mb-1">Cryptographic Payload Signing</h4>
                   <p className="text-[10px] text-neutral-500 font-mono">Original device signs the ticket payload (TicketID + NewOwnerPubKey) using its private key enclave, invalidating its own local copy.</p>
                 </div>
               </div>
               
               <div className="flex items-start bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                 <div className="w-10 h-10 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-emerald-500/30">3</div>
                 <div>
                   <h4 className="font-bold text-sm text-white mb-1">Local Gate Verification</h4>
                   <p className="text-[10px] text-neutral-500 font-mono">Gate scanner parses the new offline QR code and verifies the cryptographically signed chain-of-custody using the public key.</p>
                 </div>
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Dual Mobile Simulators (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center relative">
          
          <div className="w-full max-w-[400px] h-[600px] relative">
            
            {/* Sender Device */}
            <div className={`absolute top-0 left-0 w-[240px] h-[480px] bg-neutral-900 rounded-[2rem] border-8 border-neutral-800 shadow-2xl flex flex-col z-20 transition-all duration-1000 ${
              transferState !== 'idle' ? 'transform -translate-x-12 scale-95 opacity-50' : 'z-30'
            }`}>
              <div className="h-6 bg-black flex justify-between items-center px-4 text-white text-[8px] font-bold">
                <span>Sender App</span>
                <span className="text-rose-500">No Cell Service</span>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-white text-lg mb-2">3-Day VIP Pass</h3>
                  <div className="w-full aspect-square bg-white rounded-xl mb-4 p-2">
                    {/* Fake QR */}
                    <div className={`w-full h-full border-4 border-black p-2 flex flex-wrap gap-1 transition-opacity ${transferState === 'complete' ? 'opacity-20' : 'opacity-100'}`}>
                       {[...Array(16)].map((_, i) => (
                         <div key={i} className={`w-[20%] h-[20%] bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                       ))}
                    </div>
                  </div>
                </div>
                
                {transferState === 'idle' ? (
                  <button 
                    onClick={initiateTransfer}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    Transfer to Friend
                  </button>
                ) : (
                  <div className="text-center pb-4">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                      {transferState === 'complete' ? 'Transfer Sent' : 'Signing Payload...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiver Device */}
            <div className={`absolute bottom-0 right-0 w-[240px] h-[480px] bg-neutral-900 rounded-[2rem] border-8 border-neutral-700 shadow-2xl flex flex-col z-10 transition-all duration-1000 ${
              transferState !== 'idle' ? 'transform -translate-x-12 -translate-y-12 z-30 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'scale-90 opacity-80'
            }`}>
              <div className="h-6 bg-black flex justify-between items-center px-4 text-white text-[8px] font-bold">
                <span>Receiver App</span>
                <span className="text-rose-500">No Cell Service</span>
              </div>
              <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                
                {transferState === 'idle' ? (
                  <div className="text-center opacity-50">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-700">
                      <span className="text-2xl text-neutral-500">📭</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No Tickets Found</span>
                  </div>
                ) : transferState === 'pairing' ? (
                  <div className="text-center w-full">
                    <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30 relative">
                       <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping"></div>
                       <span className="text-blue-500 text-2xl relative z-10">🛜</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">BLE Pairing</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">Hold devices close together...</p>
                    
                    {/* Proximity Bar */}
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${100 - deviceProximity}%` }}></div>
                    </div>
                  </div>
                ) : transferState === 'signing' ? (
                  <div className="text-center w-full">
                    <div className="w-20 h-20 border-4 border-neutral-700 border-t-indigo-500 rounded-full mx-auto mb-6 animate-spin"></div>
                    <h4 className="font-bold text-white text-sm mb-1">Receiving Payload</h4>
                    
                    {/* Cryptographic simulation log */}
                    <div className="bg-black rounded-lg p-2 mt-4 text-[8px] font-mono text-indigo-400 text-left h-24 overflow-hidden border border-neutral-800">
                      <p className="animate-fade-in-up">Handshake complete.</p>
                      <p className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Receiving signed block...</p>
                      <p className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>Verifying ECDSA signature...</p>
                      <p className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>Writing to local storage.</p>
                      <p className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>Generating new offline QR...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full animate-fade-in-up">
                    <div className="w-full aspect-square bg-emerald-500 rounded-xl mb-4 p-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      {/* Fake new QR */}
                      <div className="w-full h-full bg-white p-2 flex flex-wrap gap-1">
                         {[...Array(16)].map((_, i) => (
                           <div key={i} className={`w-[20%] h-[20%] bg-black ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
                         ))}
                      </div>
                    </div>
                    <h3 className="font-black text-white text-lg">Transfer Complete!</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Ready for Gate Scanner</p>
                  </div>
                )}
                
              </div>
            </div>

            {/* Connection visualization overlay */}
            {transferState === 'pairing' && (
              <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center">
                 <svg width="150" height="150" className="absolute" style={{ transform: 'translate(40px, -40px)' }}>
                   <path d="M 0,0 C 50,50 100,50 150,100" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="4" strokeDasharray="5,5" className="animate-[dash_1s_linear_infinite]" />
                 </svg>
              </div>
            )}

          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
      `}} />
    </div>
  );
};

export default BLETicketTransfer;
