import React, { useState } from 'react';

const ARVIPNavigation = () => {
  const [navState, setNavState] = useState('idle'); // idle, scanning, navigating, arrived
  const [distance, setDistance] = useState(250);
  const [instruction, setInstruction] = useState('Continue Straight');

  const startNavigation = () => {
    setNavState('scanning');
    
    setTimeout(() => {
      setNavState('navigating');
      setDistance(250);
      
      // Simulate walking
      let currentDist = 250;
      const walkInterval = setInterval(() => {
        currentDist -= 25;
        setDistance(Math.max(0, currentDist));
        
        if (currentDist === 150) {
          setInstruction('Turn Right at Hallway C');
        } else if (currentDist === 100) {
          setInstruction('Proceed through VIP Doors');
        } else if (currentDist === 50) {
          setInstruction('Approaching Secret Speakeasy');
        } else if (currentDist <= 0) {
          clearInterval(walkInterval);
          setNavState('arrived');
          
          setTimeout(() => {
            setNavState('idle');
          }, 4000);
        }
      }, 1000); // update every second
      
    }, 2000); // 2s scanning phase
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Master Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧭</span> Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Augmented Reality <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">VIP Navigation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Confusing 2D paper maps are useless for finding secret speakeasy lounges or exclusive backstage meet-and-greets. Eventra introduces a WebXR navigation overlay. VIP attendees open their camera, and the app utilizes VPS (Visual Positioning System) to render glowing AR arrows directly onto the physical floor, guiding them turn-by-turn.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">VPS Telemetry Matrix</h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono">WEBXR: ACTIVE</span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-black p-4 rounded-xl border border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Localization Anchor</span>
                 <span className="text-lg font-black text-purple-400 font-mono">Node_84_Alpha</span>
                 <p className="text-[9px] text-slate-600 mt-1 font-mono">Confidence: {navState === 'idle' ? '0%' : '98.4%'}</p>
               </div>
               <div className="bg-black p-4 rounded-xl border border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Target Destination</span>
                 <span className="text-lg font-black text-pink-400 font-mono">Hidden Lounge B</span>
                 <p className="text-[9px] text-slate-600 mt-1 font-mono">Clearance: VIP Tier 1</p>
               </div>
             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative">
               <span className="text-slate-500 uppercase font-bold tracking-widest text-[10px] block mb-2">Spatial Mesh Render Log</span>
               
               <div className="space-y-1">
                 {navState === 'scanning' && (
                   <div className="text-amber-400 animate-pulse">
                     <p>&gt; Accessing device camera feed...</p>
                     <p>&gt; Scanning physical environment...</p>
                     <p>&gt; Triangulating via local VPS anchors...</p>
                   </div>
                 )}
                 {navState === 'navigating' && (
                   <div className="text-sky-400">
                     <p className="text-emerald-400">&gt; Environment localized successfully.</p>
                     <p>&gt; Injecting WebXR directional arrows into DOM...</p>
                     <p>&gt; Calculating shortest route to Hidden Lounge B...</p>
                     <p className="animate-fade-in-up mt-2 text-purple-400 font-bold">
                       &gt; Distance updating: {distance}ft remaining.
                     </p>
                   </div>
                 )}
                 {navState === 'arrived' && (
                   <div className="text-emerald-400">
                     <p>&gt; Target coordinates reached.</p>
                     <p>&gt; Terminating AR session. Have a great time.</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile AR Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-neutral-950 flex flex-col relative overflow-hidden">
              
              {navState === 'idle' ? (
                // Standby State
                <div className="flex-1 flex flex-col p-6 items-center justify-center relative z-20">
                  <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <span className="text-4xl text-purple-500">🗺️</span>
                  </div>
                  <h2 className="text-xl font-black text-white text-center mb-2">Secret Speakeasy Lounge</h2>
                  <p className="text-slate-400 text-xs text-center mb-8 px-4">This location is hidden. Use AR Navigation to find the secret entrance.</p>
                  
                  <button 
                    onClick={startNavigation}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center"
                  >
                    <span className="mr-2">📷</span> Launch AR Guide
                  </button>
                </div>
              ) : (
                // AR Active State
                <div className="absolute inset-0 z-10 flex flex-col">
                  
                  {/* Camera Background (Simulated Convention Hall) */}
                  <div className="absolute inset-0 z-0">
                    <div className={`w-full h-full bg-[url('https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter transition-all duration-1000 ${navState === 'scanning' ? 'blur-sm grayscale' : 'blur-none'}`}></div>
                  </div>

                  {navState === 'scanning' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="w-20 h-20 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                      <span className="text-white font-bold tracking-widest uppercase text-xs animate-pulse">Scanning Environment...</span>
                    </div>
                  )}

                  {navState === 'navigating' && (
                    <>
                      {/* WebXR AR Arrow Simulation */}
                      <div className="absolute bottom-1/4 inset-x-0 z-10 flex flex-col items-center justify-center pointer-events-none transform perspective-[800px]">
                        
                        <div className="w-32 h-64 relative animate-[float_3s_ease-in-out_infinite] transform rotateX-45">
                           {/* Glow effect */}
                           <div className="absolute inset-0 bg-purple-500/30 filter blur-xl rounded-full"></div>
                           
                           {/* Actual Arrow SVG */}
                           <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                             <defs>
                               <linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
                                 <stop offset="0%" style={{stopColor: '#ec4899', stopOpacity: 0.8}} />
                                 <stop offset="100%" style={{stopColor: '#a855f7', stopOpacity: 1}} />
                               </linearGradient>
                             </defs>
                             <path d="M50 0 L100 50 L75 50 L75 200 L25 200 L25 50 L0 50 Z" fill="url(#grad1)" />
                             
                             {/* Pulsing overlay line */}
                             <path d="M50 10 L50 190" stroke="white" strokeWidth="4" strokeLinecap="round" className="animate-[dash_1s_linear_infinite]" strokeDasharray="10, 20" opacity="0.8" />
                           </svg>
                        </div>
                        
                      </div>

                      {/* HUD Overlays */}
                      <div className="absolute top-16 inset-x-4 z-20">
                        <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">Direction</span>
                            <span className="text-white font-black text-lg">{instruction}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Distance</span>
                            <span className="text-white font-black text-2xl font-mono">{distance} <span className="text-sm text-slate-400">ft</span></span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {navState === 'arrived' && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                      <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex flex-col items-center justify-center border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-6">
                        <span className="text-6xl mb-2">🥂</span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-2">You've Arrived.</h3>
                      <p className="text-sm text-slate-300">Show this screen to the security guard.</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateX(60deg); }
          50% { transform: translateY(-20px) rotateX(60deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
      `}} />
    </div>
  );
};

export default ARVIPNavigation;
