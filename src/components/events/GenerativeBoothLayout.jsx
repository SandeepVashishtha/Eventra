/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenerativeBoothLayout = () => {
  const [optimizerState, setOptimizerState] = useState('idle'); // idle, generating, complete
  const [generationCount, setGenerationCount] = useState(0);
  const [fitnessScore, setFitnessScore] = useState(42.5); // 0-100 score of layout quality
  
  // The layout configuration
  const [booths, setBooths] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Genetic Algorithm Engine initialized. Awaiting parameters.' }
  ]);

  // Initial bad layout
  useEffect(() => {
    generateRandomLayout();
  }, []);

  const generateRandomLayout = () => {
    const newBooths = [];
    for (let i = 0; i < 12; i++) {
      newBooths.push({
        id: i,
        x: Math.random() * 70 + 10,
        y: Math.random() * 70 + 10,
        type: i % 3 === 0 ? 'merch' : 'food',
        rotation: Math.floor(Math.random() * 4) * 90
      });
    }
    setBooths(newBooths);
  };

  useEffect(() => {
    let loop;
    if (optimizerState === 'generating') {
      loop = setInterval(() => {
        setGenerationCount(prev => {
          if (prev >= 500) {
            setOptimizerState('complete');
            addLog('SUCCESS', 'Optimal permutation found. Bottlenecks reduced by 84%.');
            return 500;
          }
          
          // As generations progress, fitness score goes up
          setFitnessScore(f => {
            const next = f + (Math.random() * 1.5);
            return Math.min(98.7, next);
          });

          // Visually shake/move the booths as it "calculates"
          setBooths(current => current.map(b => {
            // Towards the end, they settle into a nice U-shape or grid
            if (prev > 400) {
               // Settle into a nice grid along the edges
               const isTop = b.id < 6;
               return {
                 ...b,
                 x: 15 + (b.id % 6) * 14,
                 y: isTop ? 20 : 80,
                 rotation: 0
               };
            } else {
               // Random mutations
               return {
                 ...b,
                 x: Math.max(5, Math.min(85, b.x + (Math.random() * 10 - 5))),
                 y: Math.max(5, Math.min(85, b.y + (Math.random() * 10 - 5))),
                 rotation: Math.random() > 0.8 ? (b.rotation + 90) % 360 : b.rotation
               };
            }
          }));

          if (prev % 100 === 0 && prev > 0) {
            addLog('GEN', `Generation ${prev} complete. Culling low-fitness mutations...`);
          }

          return prev + 10;
        });
      }, 100);
    }
    return () => clearInterval(loop);
  }, [optimizerState]);

  const startOptimization = () => {
    if (optimizerState === 'idle' || optimizerState === 'complete') {
      setOptimizerState('generating');
      setGenerationCount(0);
      setFitnessScore(42.5);
      generateRandomLayout();
      addLog('AI', 'Executing Genetic Algorithm. Mutating spatial coordinates...');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/50 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧬</span> Genetic Algorithms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative Layout <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">Optimization</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Organizers usually guess where to place food vendors and merch booths on a 2D CAD file, often creating terrible crowd bottlenecks and dead zones with zero foot traffic. Eventra solves this with a generative design algorithm. The system takes venue dimensions and historical foot-traffic data, then uses a genetic algorithm to simulate thousands of layout permutations, ultimately spitting out the mathematically perfect floor plan to maximize revenue and minimize crowding.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">📐</span> Spatial Optimization Engine
               </h3>
               
               <button 
                 onClick={startOptimization}
                 disabled={optimizerState === 'generating'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   optimizerState === 'generating' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                   'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)]'
                 }`}
               >
                 {optimizerState === 'generating' ? 'Simulating Mutations...' : 'Run Generative Design'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Algorithm Progress */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Evolutionary Generation</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-white leading-none">
                     {generationCount}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">/ 500</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-pink-500 transition-all duration-75"
                     style={{ width: `${(generationCount / 500) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* Fitness Score */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 optimizerState === 'complete' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Layout Fitness Score</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     optimizerState === 'complete' ? 'text-emerald-500' : 'text-slate-300'
                   }`}>
                     {fitnessScore.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">/ 100</span>
                 </div>
                 
                 <div className="absolute top-3 right-3">
                   {optimizerState === 'generating' && (
                     <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest animate-pulse">
                       Mutating...
                     </span>
                   )}
                   {optimizerState === 'complete' && (
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                       Optimized
                     </span>
                   )}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Algorithm Matrix Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'AI' ? 'text-pink-400 font-bold' :
                       log.type === 'GEN' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: CAD Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-xl border border-slate-700 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-slate-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Digital Blueprint
              </span>
              <span className="text-[10px] font-mono text-pink-400">
                LIVE_MUTATION_VIEW
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-[#0a0f14]">
               
               {/* CAD Blueprint Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(#1e293b_1px,transparent_1px),linear-gradient(90deg,#1e293b_1px,transparent_1px)] bg-[size:20px_20px]"></div>
               <div className="absolute inset-0 bg-[linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)] bg-[size:100px_100px]"></div>

               {/* Stage Area (Fixed) */}
               <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-40 h-16 border-t-2 border-x-2 border-slate-500 bg-slate-800/50 flex items-center justify-center rounded-t-lg z-10">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Stage</span>
               </div>
               
               {/* Main Entrance (Fixed) */}
               <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-32 h-8 border-b-2 border-x-2 border-emerald-500/50 bg-emerald-900/20 flex items-center justify-center rounded-b-lg z-10">
                 <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Gate 1</span>
               </div>

               {/* Simulated Heatmap of Foot Traffic */}
               <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${optimizerState === 'complete' ? 'opacity-100' : 'opacity-0'}`}>
                 {/* High traffic path from entrance to stage */}
                 <div className="absolute left-[40%] top-[10%] w-[20%] h-[70%] bg-rose-500/10 blur-xl rounded-full"></div>
                 {/* Traffic flowing out to the sides where booths are */}
                 <div className="absolute left-[15%] top-[30%] w-[20%] h-[40%] bg-yellow-500/10 blur-lg rounded-full"></div>
                 <div className="absolute right-[15%] top-[30%] w-[20%] h-[40%] bg-yellow-500/10 blur-lg rounded-full"></div>
               </div>

               {/* The Mutating Booths */}
               <div className="absolute inset-0 z-20 mt-10 mb-20 mx-4">
                 {booths.map(booth => (
                   <div 
                     key={booth.id}
                     className={`absolute w-8 h-8 flex items-center justify-center border transition-all ${
                       optimizerState === 'generating' ? 'duration-100 ease-linear' : 'duration-1000 ease-out'
                     } ${
                       booth.type === 'food' ? 'bg-orange-900/80 border-orange-500' : 'bg-purple-900/80 border-purple-500'
                     } ${
                       optimizerState === 'generating' ? 'shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'shadow-none'
                     }`}
                     style={{ 
                       left: `${booth.x}%`, 
                       top: `${booth.y}%`,
                       transform: `rotate(${booth.rotation}deg)`
                     }}
                   >
                     <span className="text-[14px]">
                       {booth.type === 'food' ? '🍔' : '👕'}
                     </span>
                     
                     {/* Overlay flashing during generation */}
                     {optimizerState === 'generating' && (
                       <div className="absolute inset-0 bg-white/20"></div>
                     )}
                   </div>
                 ))}
               </div>

               {/* Complete Overlay UI */}
               {optimizerState === 'complete' && (
                 <div className="absolute bottom-24 inset-x-6 bg-black/90 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md z-30 animate-fade-in-up">
                   <div className="flex items-center mb-2">
                     <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-lg mr-3 shadow-inner">
                       ✅
                     </div>
                     <div>
                       <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mb-1">Optimum Generated</p>
                       <p className="text-sm font-black text-white">Bottlenecks Minimized</p>
                     </div>
                   </div>
                   <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[9px] font-mono">
                     <div>
                       <span className="text-slate-500 block mb-1">Expected Flow</span>
                       <span className="text-emerald-300 font-bold">+ 34% Efficiency</span>
                     </div>
                     <div>
                       <span className="text-slate-500 block mb-1">Vendor Visibilty</span>
                       <span className="text-emerald-300 font-bold">100% Coverage</span>
                     </div>
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

export default GenerativeBoothLayout;
