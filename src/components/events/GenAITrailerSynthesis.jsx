import React, { useState } from 'react';

const GenAITrailerSynthesis = () => {
  const [generationState, setGenerationState] = useState('idle'); // idle, analyzing, synthesizing, complete
  const [selectedVibe, setSelectedVibe] = useState('high_energy');
  
  const [progress, setProgress] = useState(0);
  
  const startSynthesis = () => {
    setGenerationState('analyzing');
    setProgress(0);
    
    // Simulate multi-modal pipeline
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 15);
        if (next >= 30 && prev < 30) setGenerationState('synthesizing');
        
        if (next >= 100) {
          clearInterval(interval);
          setGenerationState('complete');
          return 100;
        }
        return next;
      });
    }, 500);
  };

  const resetPipeline = () => {
    setGenerationState('idle');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans p-6 text-neutral-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Pipeline Configurator (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎬</span> Multi-Modal GenAI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
            Synthetic Trailer <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600">Production Engine</span>.
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            Stop paying creative agencies $15k to manually edit 60-second promos. Select your raw video archive and a desired "vibe." Eventra's multi-modal pipeline analyzes the clips, selects the highest-engagement moments, synthesizes a royalty-free music track, and automatically edits a highly polished trailer in minutes.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl relative overflow-hidden flex flex-col">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">⚙️</span> Pipeline Parameters
               </h3>
             </div>

             <div className="space-y-6 mb-8">
               
               <div>
                 <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Input Source</label>
                 <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl flex justify-between items-center cursor-not-allowed opacity-70">
                   <div className="flex items-center">
                     <span className="text-2xl mr-3">📁</span>
                     <div>
                       <span className="text-sm font-bold text-neutral-900 block">/archives/event_2025_raw/</span>
                       <span className="text-[10px] text-neutral-500 font-mono">1,402 Clips (84.2 GB)</span>
                     </div>
                   </div>
                   <span className="text-[10px] bg-neutral-200 px-2 py-1 rounded font-bold uppercase">Locked</span>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Target Vibe (Generative Prompt)</label>
                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setSelectedVibe('high_energy')}
                     disabled={generationState !== 'idle'}
                     className={`p-3 rounded-xl border text-left transition ${
                       selectedVibe === 'high_energy' ? 'bg-fuchsia-50 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-white border-neutral-200 hover:border-fuchsia-300'
                     }`}
                   >
                     <span className="text-xs font-black text-neutral-900 uppercase block mb-1">⚡ High-Energy Tech</span>
                     <span className="text-[9px] text-neutral-500 font-mono leading-tight block">Fast cuts, heavy bass, neon color grade.</span>
                   </button>
                   <button 
                     onClick={() => setSelectedVibe('corporate')}
                     disabled={generationState !== 'idle'}
                     className={`p-3 rounded-xl border text-left transition ${
                       selectedVibe === 'corporate' ? 'bg-indigo-50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white border-neutral-200 hover:border-indigo-300'
                     }`}
                   >
                     <span className="text-xs font-black text-neutral-900 uppercase block mb-1">💼 Corporate Pro</span>
                     <span className="text-[9px] text-neutral-500 font-mono leading-tight block">Smooth transitions, orchestral synth, clean grade.</span>
                   </button>
                 </div>
               </div>
               
             </div>

             {generationState === 'idle' ? (
               <button 
                 onClick={startSynthesis}
                 className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition shadow-lg flex items-center justify-center"
               >
                 <span className="mr-2">✨</span> Initialize Synthesis
               </button>
             ) : generationState === 'complete' ? (
               <button 
                 onClick={resetPipeline}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center"
               >
                 <span className="mr-2">✓</span> New Project
               </button>
             ) : (
               <div className="w-full bg-neutral-100 rounded-xl p-4 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-neutral-300 border-t-fuchsia-500 rounded-full animate-spin mb-3"></div>
                 <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1">
                   {generationState === 'analyzing' ? 'Analyzing Raw Footage...' : 'Synthesizing Trailer...'}
                 </span>
                 <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-300" style={{ width: \`\${progress}%\` }}></div>
                 </div>
               </div>
             )}

          </div>
        </div>

        {/* Right Side: Execution Canvas (Col span 6) */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          
          <div className="w-full bg-black rounded-[2rem] border-[8px] border-neutral-900 shadow-2xl relative overflow-hidden flex flex-col aspect-video">
            
            {/* Engine Status Header */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-start z-30 pointer-events-none">
              <span className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white flex items-center border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  generationState === 'idle' ? 'bg-neutral-500' :
                  generationState === 'complete' ? 'bg-emerald-500' : 'bg-fuchsia-500 animate-pulse'
                }`}></span>
                GenAI Rendering Canvas
              </span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                Output: 1080p60
              </span>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
              
              {generationState === 'idle' ? (
                <div className="text-neutral-700 flex flex-col items-center">
                  <span className="text-6xl mb-4 opacity-50">🎬</span>
                  <span className="text-xs font-black uppercase tracking-widest">Canvas Offline</span>
                </div>
              ) : generationState === 'analyzing' ? (
                <div className="absolute inset-0 flex items-center justify-center w-full h-full p-4 gap-2 flex-wrap content-center bg-neutral-950">
                  {/* Simulate analyzing thumbnails */}
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-[22%] aspect-video bg-neutral-800 rounded border border-neutral-700 relative overflow-hidden">
                       <div className="absolute inset-0 bg-fuchsia-500/10" style={{ opacity: Math.random() }}></div>
                       {Math.random() > 0.7 && (
                         <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                       )}
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
              ) : generationState === 'synthesizing' ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                  
                  {/* Synthesis Overlays */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl animate-bounce mb-4">🎵</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-white/20 mb-2">
                      Generating Audio Track
                    </span>
                    <span className="text-[10px] text-fuchsia-400 font-mono">Model: MusicGen-Large (120 BPM)</span>
                  </div>
                  
                  {/* Editing Grid lines */}
                  <div className="absolute inset-0 z-0 pointer-events-none border-x border-white/10 w-1/3 left-1/3"></div>
                  <div className="absolute inset-0 z-0 pointer-events-none border-y border-white/10 h-1/3 top-1/3"></div>
                </div>
              ) : (
                <div className="absolute inset-0 group">
                  {/* Final Output */}
                  <div className={`absolute inset-0 bg-cover bg-center filter transition-all duration-1000 ${
                    selectedVibe === 'high_energy' ? 'bg-[url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")] contrast-125 saturate-150 hue-rotate-15' : 
                    'bg-[url("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")] contrast-100 saturate-100 brightness-110'
                  }`}></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 cursor-pointer hover:scale-110 transition transform">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg">
                    Export Ready (.mp4)
                  </div>
                </div>
              )}

            </div>
            
            {/* Generated Timeline UI */}
            <div className={`h-16 bg-neutral-900 border-t border-neutral-800 p-2 flex space-x-1 transition-opacity duration-1000 ${
              generationState === 'complete' ? 'opacity-100' : 'opacity-20'
            }`}>
               {/* Video Track */}
               <div className="w-full flex flex-col space-y-1">
                 <div className="flex-1 flex space-x-0.5">
                   <div className="w-1/4 bg-blue-500/80 rounded h-full"></div>
                   <div className="w-1/6 bg-fuchsia-500/80 rounded h-full"></div>
                   <div className="w-1/3 bg-emerald-500/80 rounded h-full"></div>
                   <div className="w-1/4 bg-amber-500/80 rounded h-full"></div>
                 </div>
                 {/* Audio Track */}
                 <div className="h-2 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgNWM1IDAgNS01IDEwLTVzNSA1IDEwIDV2LTFjLTUgMC01LTUtMTAtNXMtNSA1LTEwIDV6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiLz48L3N2Zz4=')] opacity-50 rounded bg-neutral-800"></div>
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default GenAITrailerSynthesis;
