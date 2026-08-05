import React, { useState, useEffect } from 'react';

const ARSponsorScavengerHunt = () => {
  const [arModeActive, setArModeActive] = useState(false);
  const [tokensCollected, setTokensCollected] = useState(2);
  const [showCaptureAnim, setShowCaptureAnim] = useState(false);
  const [scanning, setScanning] = useState(false);

  const totalTokens = 5;

  const sponsors = [
    { id: 1, name: 'Google Cloud', booth: 'A12', status: 'collected', reward: '100 pts' },
    { id: 2, name: 'Stripe', booth: 'B04', status: 'collected', reward: '100 pts' },
    { id: 3, name: 'Vercel', booth: 'C22', status: 'pending', reward: '150 pts' },
    { id: 4, name: 'MongoDB', booth: 'D05', status: 'pending', reward: '100 pts' },
    { id: 5, name: 'Figma', booth: 'E18', status: 'pending', reward: '200 pts (Rare)' }
  ];

  const handleLaunchAR = () => {
    setArModeActive(true);
    setScanning(true);
  };

  const handleCaptureToken = () => {
    setScanning(false);
    setShowCaptureAnim(true);
    
    setTimeout(() => {
      setTokensCollected(prev => Math.min(prev + 1, totalTokens));
      setShowCaptureAnim(false);
      setArModeActive(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6 text-slate-200">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            WebXR / Augmented Reality
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AR Scavenger <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Hunt</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Gamify the expo floor. Drive massive foot traffic to sponsor booths by hiding virtual 3D tokens that attendees must physically hunt down using their device cameras.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
              <span className="text-2xl mb-2 text-teal-500 block">👣</span>
              <h4 className="font-bold text-white text-sm">Boost Footfall</h4>
              <p className="text-xs text-slate-400 mt-1">Guarantees booth visits for premium sponsors.</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
              <span className="text-2xl mb-2 text-emerald-500 block">📊</span>
              <h4 className="font-bold text-white text-sm">Rich Analytics</h4>
              <p className="text-xs text-slate-400 mt-1">Concrete data on conversion and dwell time.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center relative">
          
          <div className="w-[340px] h-[720px] bg-black rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
            
            {!arModeActive ? (
              <div className="flex-1 bg-slate-50 flex flex-col pt-12 pb-6 px-4">
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Expo Quest 2026</h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">Collect all 5 tokens to win a MacBook Pro!</p>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center mb-8 relative">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-200 flex items-center justify-center relative shadow-inner bg-white">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="56" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-teal-500 transition-all duration-1000 ease-out" 
                        strokeDasharray="351" 
                        strokeDashoffset={351 - (351 * (tokensCollected / totalTokens))} 
                      />
                    </svg>
                    <div className="text-center z-10">
                      <p className="text-3xl font-black text-slate-900">{tokensCollected}/{totalTokens}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Tokens</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Targets</h3>
                  
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className={`p-3 rounded-xl border flex items-center justify-between ${sponsor.status === 'collected' ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner ${sponsor.status === 'collected' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                          {sponsor.status === 'collected' ? '✓' : '🔒'}
                        </div>
                        <div>
                          <p className={`font-bold ${sponsor.status === 'collected' ? 'text-teal-900' : 'text-slate-700'}`}>{sponsor.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booth {sponsor.booth}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black ${sponsor.status === 'collected' ? 'text-teal-600' : 'text-slate-400'}`}>
                        {sponsor.reward}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleLaunchAR}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg transition flex justify-center items-center space-x-2"
                >
                  <span className="text-xl">📷</span>
                  <span>Launch AR Scanner</span>
                </button>

              </div>
            ) : (
              /* AR Camera View Simulation */
              <div className="flex-1 relative bg-slate-900 overflow-hidden">
                
                {/* Simulated Camera Feed (blurred background) */}
                <div className="absolute inset-0 opacity-40">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                </div>

                {/* UI Overlay */}
                <div className="absolute top-12 left-4 right-4 flex justify-between items-start z-20">
                  <button onClick={() => setArModeActive(false)} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold border border-white/20">
                    ✕
                  </button>
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Scanning</span>
                  </div>
                </div>

                {/* AR Viewport Reticle */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-64 h-64 border-2 border-white/30 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                  </div>
                </div>

                {scanning && !showCaptureAnim && (
                  <div className="absolute bottom-32 left-0 right-0 text-center animate-fade-in z-20">
                    <div className="inline-block bg-teal-500/90 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-bounce cursor-pointer border border-teal-400" onClick={handleCaptureToken}>
                      🎯 3D Token Found at Vercel! Tap to capture
                    </div>
                  </div>
                )}

                {showCaptureAnim && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="text-6xl animate-ping mb-4">💎</div>
                    <h3 className="text-2xl font-black text-white text-center px-4">Token Captured!</h3>
                    <p className="text-teal-400 font-bold mt-2">+150 pts</p>
                  </div>
                )}

                {/* Bottom Bar */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-6 z-20">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Point camera at Booth C22</p>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ARSponsorScavengerHunt;
