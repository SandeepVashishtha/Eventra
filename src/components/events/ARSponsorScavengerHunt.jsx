import React, { useState, useEffect } from 'react';

const ARSponsorScavengerHunt = () => {
  const [huntState, setHuntState] = useState('searching'); // searching, found, scanning, minted
  const [collected, setCollected] = useState(2); // out of 3
  const [cameraActive, setCameraActive] = useState(true);
  
  // AR Target Simulation
  const [reticleActive, setReticleActive] = useState(false);
  
  // Web3 State
  const [walletTx, setWalletTx] = useState(null);

  useEffect(() => {
    let searchSim;
    if (huntState === 'searching') {
      // Simulate panning the camera around until the AR object is detected
      searchSim = setTimeout(() => {
        setReticleActive(true);
        setTimeout(() => {
          setHuntState('found');
        }, 1500);
      }, 3000);
    }
    return () => clearTimeout(searchSim);
  }, [huntState]);

  const captureLogo = () => {
    setHuntState('scanning');
    
    // Simulate capturing and minting process
    setTimeout(() => {
      setCollected(3);
      setCameraActive(false);
      
      setTimeout(() => {
        setHuntState('minted');
        setWalletTx('0x8f3c...9a42');
      }, 1500);
      
    }, 2000);
  };

  const resetHunt = () => {
    setHuntState('searching');
    setCollected(2);
    setCameraActive(true);
    setReticleActive(false);
    setWalletTx(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/50 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🕶️</span> Spatial Computing & Web3
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Augmented Reality Sponsor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Scavenger Hunt</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Sponsors often struggle to drive foot traffic to remote corners of the exhibition hall, resulting in dead zones. Eventra solves this by deploying a WebAR scavenger hunt. Attendees use their camera to find floating 3D sponsor logos hidden in under-utilized zones. Collecting all logos automatically mints an exclusive Polygon NFT badge to their wallet, acting as a cryptographic key to unlock a secret VIP after-party location.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🔗</span> Polygon Blockchain Gateway
               </h3>
               
               <button 
                 onClick={resetHunt}
                 className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
               >
                 Reset Simulation
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Smart Contract Status</span>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                   <span className="text-xl font-black uppercase tracking-widest text-emerald-400">ACTIVE</span>
                 </div>
               </div>

               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">NFTs Minted (Real-time)</span>
                 <span className="text-3xl font-black text-pink-400 font-mono">
                   1,402<span className="text-sm text-neutral-500"> / 5000</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Web3 Tx Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-neutral-400 pr-2">
                 <div className="text-slate-500">
                   &gt; Waiting for next Hunt completion...
                 </div>
                 
                 {huntState === 'scanning' && (
                   <div className="text-yellow-400 animate-pulse mt-2">
                     &gt; Validating AR capture payload from client 0x7A2...
                   </div>
                 )}
                 
                 {huntState === 'minted' && (
                   <div className="text-emerald-400 font-bold space-y-1 mt-2 animate-fade-in-up">
                     <p>&gt; Capture Validated. 3/3 Sponsors found.</p>
                     <p>&gt; Executing smart contract mint()...</p>
                     <p className="text-pink-400">&gt; SUCCESS: NFT transferred to {walletTx}</p>
                     <p>&gt; Decrypting VIP Party coordinates for client.</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile AR App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-10 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-neutral-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md mix-blend-difference">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col justify-end pb-8">
              
              {cameraActive ? (
                // AR Camera View
                <>
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter brightness-50"></div>
                  
                  {/* AR Scanning Grid overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                      backgroundSize: '10% 10%',
                      transform: 'perspective(500px) rotateX(60deg)',
                      transformOrigin: 'bottom'
                  }}></div>

                  {/* AR Target (Floating Logo) */}
                  {reticleActive && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-fade-in">
                      
                      {huntState === 'scanning' && (
                        <div className="absolute inset-0 w-32 h-32 -ml-8 -mt-8 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin z-30"></div>
                      )}
                      
                      {/* Floating 3D Graphic illusion */}
                      <div className={`w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-[0_0_30px_rgba(236,72,153,0.8)] flex items-center justify-center transform transition-transform duration-1000 ${
                        huntState === 'scanning' ? 'scale-125 rotate-12' : 'animate-[bounce_3s_infinite]'
                      }`}>
                        <span className="text-3xl text-white font-black">N</span>
                      </div>
                      
                      {huntState !== 'scanning' && (
                        <div className="mt-4 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                          3/3: NeuralTech Logo
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tracking Reticle UI */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-30">
                     <div className={`w-48 h-48 border-2 ${huntState === 'found' ? 'border-emerald-500' : 'border-white'} relative transition-colors duration-500`}>
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-current -ml-2 -mt-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-current -mr-2 -mt-2"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-current -ml-2 -mb-2"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-current -mr-2 -mb-2"></div>
                     </div>
                  </div>

                  {/* AR Instructions */}
                  <div className="absolute top-16 inset-x-4 text-center z-20">
                    <div className="bg-black/60 backdrop-blur text-white text-xs px-4 py-2 rounded-full inline-block font-bold">
                      {huntState === 'searching' ? 'Pan camera to find the final logo...' : 
                       huntState === 'found' ? 'Target Locked! Tap to Capture.' : 
                       'Capturing & Verifying...'}
                    </div>
                  </div>
                </>
              ) : (
                // Success / Minted Screen
                <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6 z-40 animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.5)] mb-6 animate-[bounce_2s_ease-in-out_infinite_alternate]">
                    <span className="text-4xl text-white">🎟️</span>
                  </div>
                  
                  <h2 className="text-white font-black text-2xl mb-2 text-center">VIP Badge Minted!</h2>
                  
                  <div className="bg-black border border-neutral-700 rounded-xl p-4 w-full mb-6">
                    <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Blockchain Receipt</p>
                    <p className="text-emerald-400 font-mono text-xs break-all">{walletTx}</p>
                  </div>
                  
                  <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-4 w-full text-center">
                    <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-2">Secret Location Unlocked</p>
                    <p className="text-white font-mono text-lg font-bold">BASEMENT LOUNGE B</p>
                    <p className="text-neutral-400 text-[10px] mt-2">Show this cryptographic badge at the door for entry.</p>
                  </div>
                </div>
              )}

              {/* Bottom UI Bar (Only in AR Mode) */}
              {cameraActive && (
                <div className="px-6 z-30 w-full">
                  <div className="bg-black/80 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Hunt Progress</span>
                      <span className="text-pink-400 font-mono font-bold text-sm">{collected}/3</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000" style={{ width: `${(collected/3)*100}%` }}></div>
                    </div>
                  </div>

                  <button 
                    onClick={captureLogo}
                    disabled={huntState !== 'found'}
                    className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest transition shadow-lg ${
                      huntState === 'found' ? 'bg-white text-black shadow-white/20' : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    Capture Sponsor
                  </button>
                </div>
              )}
              
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ARSponsorScavengerHunt;
