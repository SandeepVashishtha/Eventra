/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AIPostEventHighlightReel = () => {
  const [pipelineState, setPipelineState] = useState('idle'); // idle, ingesting, analyzing, generating, complete
  const [progress, setProgress] = useState(0);
  
  const [stats, setStats] = useState({
    clipsIngested: 0,
    clipsFiltered: 0,
    beatsMapped: 0
  });

  const [aiLog, setAiLog] = useState([
    { id: 1, time: '00:00:00', type: 'SYS', msg: 'Event #994 [Neon Desert Festival] concluded. Gen-AI Video Pipeline sleeping.' }
  ]);

  useEffect(() => {
    let loop;
    if (pipelineState === 'ingesting') {
      loop = setInterval(() => {
        setProgress(prev => {
          if (prev >= 25) {
            setPipelineState('analyzing');
            addLog('AI', 'Ingestion complete. Running Computer Vision energy analysis...');
            return prev;
          }
          return prev + 2;
        });
        setStats(s => ({ ...s, clipsIngested: s.clipsIngested + Math.floor(Math.random() * 400 + 100) }));
      }, 150);
    } 
    else if (pipelineState === 'analyzing') {
      loop = setInterval(() => {
        setProgress(prev => {
          if (prev >= 60) {
            setPipelineState('generating');
            addLog('AUDIO', 'Energy mapping complete. Syncing clips to master BPM (128 BPM).');
            return prev;
          }
          return prev + 1;
        });
        setStats(s => ({ ...s, clipsFiltered: s.clipsFiltered + Math.floor(Math.random() * 50 + 10) }));
      }, 200);
    }
    else if (pipelineState === 'generating') {
      loop = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setPipelineState('complete');
            addLog('SUCCESS', 'Final render complete. 60-second 4K MP4 available for download.');
            return 100;
          }
          return prev + 2;
        });
        setStats(s => ({ ...s, beatsMapped: s.beatsMapped + Math.floor(Math.random() * 10 + 2) }));
      }, 150);
    }

    return () => clearInterval(loop);
  }, [pipelineState]);

  const triggerPipeline = () => {
    if (pipelineState === 'idle') {
      setPipelineState('ingesting');
      setProgress(0);
      setStats({ clipsIngested: 0, clipsFiltered: 0, beatsMapped: 0 });
      addLog('SYS', 'Triggering Pipeline. Scraping #NeonDesert2026 across social APIs...');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setAiLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎬</span> Cloud AI Video Generation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Post-Event <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Highlight Reel</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Event organizers normally spend thousands of dollars and wait weeks for video editors to manually cut together a promotional recap video. Eventra revolutionizes this with a cloud-based Generative AI pipeline. Immediately after the festival ends, it scrapes thousands of crowd-sourced videos via hashtag, uses computer vision to isolate high-energy clips, matches them to the headline track's BPM, and automatically renders a professional-grade 60-second highlight reel in minutes.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">⚙️</span> Generation Pipeline Console
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={triggerPipeline}
                   disabled={pipelineState !== 'idle'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     pipelineState !== 'idle' ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {pipelineState === 'idle' ? 'Initialize AI Engine' : 
                    pipelineState === 'complete' ? 'Render Complete' : 'Pipeline Active...'}
                 </button>
               </div>
             </div>

             {/* Progress Master */}
             <div className="mb-6">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                 <span>Master Render Progress</span>
                 <span className="text-blue-400 font-mono">{progress}%</span>
               </div>
               <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                   style={{ width: `${progress}%` }}
                 ></div>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               <div className={`p-3 rounded-xl border flex flex-col justify-center transition-all ${
                 pipelineState === 'ingesting' || pipelineState === 'analyzing' || pipelineState === 'generating' || pipelineState === 'complete' ? 'bg-slate-900 border-blue-500/50 shadow-inner' : 'bg-slate-950 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Clips Scraped</span>
                 <span className="text-2xl font-black font-mono text-white leading-none">{stats.clipsIngested.toLocaleString()}</span>
               </div>

               <div className={`p-3 rounded-xl border flex flex-col justify-center transition-all ${
                 pipelineState === 'analyzing' || pipelineState === 'generating' || pipelineState === 'complete' ? 'bg-slate-900 border-purple-500/50 shadow-inner' : 'bg-slate-950 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">High-Energy Filter</span>
                 <span className="text-2xl font-black font-mono text-white leading-none">{stats.clipsFiltered.toLocaleString()}</span>
               </div>
               
               <div className={`p-3 rounded-xl border flex flex-col justify-center transition-all ${
                 pipelineState === 'generating' || pipelineState === 'complete' ? 'bg-slate-900 border-indigo-500/50 shadow-inner' : 'bg-slate-950 border-slate-800'
               }`}>
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">BPM Cuts Mapped</span>
                 <span className="text-2xl font-black font-mono text-white leading-none">{stats.beatsMapped.toLocaleString()}</span>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cloud Processing Matrix</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {aiLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'AUDIO' ? 'text-purple-400' :
                       log.type === 'AI' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Render / Video Preview Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-lg border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/50 backdrop-blur-sm border-b border-white/10">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center">
                Render Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center">
                REC_OUT_vFinal.mp4
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
               
               {/* Timeline / Video Layout */}
               
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBWMGgyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-20 z-0"></div>

               {/* Simulated Video Preview Frame */}
               <div className="w-[90%] h-48 bg-slate-900 border border-slate-700 rounded-lg relative z-10 overflow-hidden shadow-2xl flex items-center justify-center">
                 
                 {pipelineState === 'idle' && (
                   <span className="text-slate-700 font-mono text-sm uppercase font-bold">Awaiting Data...</span>
                 )}

                 {pipelineState === 'ingesting' && (
                   <div className="flex flex-wrap gap-1 p-2 opacity-50">
                     {[...Array(24)].map((_, i) => (
                       <div key={i} className="w-8 h-8 bg-slate-700 rounded animate-pulse" style={{ animationDelay: `${Math.random()}s`}}></div>
                     ))}
                   </div>
                 )}

                 {pipelineState === 'analyzing' && (
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">CV Energy Scoring</span>
                   </div>
                 )}

                 {pipelineState === 'generating' && (
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 animate-pulse flex flex-col items-center justify-center">
                     <span className="text-5xl mb-2">🕺</span>
                     <span className="text-[10px] font-mono text-white bg-black/50 px-2 py-1 rounded">BPM Sync Active</span>
                   </div>
                 )}

                 {pipelineState === 'complete' && (
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540039155733-d7696d4eb98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center flex items-center justify-center">
                     <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 cursor-pointer hover:bg-white/30 transition">
                       <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                     </div>
                   </div>
                 )}

               </div>

               {/* Simulated Video Editing Timeline */}
               <div className="w-[90%] h-32 mt-6 bg-black border border-slate-800 rounded-lg relative z-10 overflow-hidden flex flex-col p-2">
                 
                 <div className="text-[8px] font-mono text-slate-500 mb-1 flex justify-between px-1">
                   <span>00:00:00</span>
                   <span>00:00:30</span>
                   <span>00:01:00</span>
                 </div>

                 {/* Video Track */}
                 <div className="h-6 bg-slate-900 rounded mb-1 relative overflow-hidden flex">
                   {pipelineState === 'generating' || pipelineState === 'complete' ? (
                     <>
                       <div className="h-full w-[20%] bg-blue-800 border-r border-slate-950"></div>
                       <div className="h-full w-[15%] bg-blue-700 border-r border-slate-950"></div>
                       <div className="h-full w-[5%] bg-indigo-600 border-r border-slate-950"></div>
                       <div className="h-full w-[10%] bg-blue-600 border-r border-slate-950"></div>
                       <div className="h-full w-[25%] bg-indigo-800 border-r border-slate-950"></div>
                       <div className="h-full w-[25%] bg-purple-700 border-r border-slate-950"></div>
                     </>
                   ) : (
                     <div className="h-full w-full bg-slate-800/50"></div>
                   )}
                 </div>

                 {/* Audio Track */}
                 <div className="h-10 bg-slate-900 rounded relative overflow-hidden flex items-center justify-center">
                   {pipelineState === 'generating' || pipelineState === 'complete' ? (
                     <div className="w-full h-full opacity-60 flex items-center justify-around px-1">
                       {/* Fake waveform */}
                       {[...Array(40)].map((_, i) => (
                         <div key={i} className="w-1 bg-purple-500 rounded-full" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                       ))}
                     </div>
                   ) : (
                     <div className="h-full w-full bg-slate-800/50"></div>
                   )}
                 </div>

                 {/* Playhead */}
                 <div className="absolute top-4 bottom-2 left-[30%] w-px bg-red-500 z-20">
                   <div className="w-2 h-2 -ml-[3.5px] -mt-1 bg-red-500 rotate-45"></div>
                 </div>

               </div>
               
               {/* Final Download Button Overlay */}
               {pipelineState === 'complete' && (
                 <button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs py-3 px-8 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-105 transition-transform z-20">
                   Download MP4 (4K)
                 </button>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIPostEventHighlightReel;
