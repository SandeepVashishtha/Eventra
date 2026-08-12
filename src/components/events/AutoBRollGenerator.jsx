import React, { useState } from 'react';

const AutoBRollGenerator = () => {
  const [pipelineState, setPipelineState] = useState('idle'); // idle, uploading, processing, complete
  
  const [clips, setClips] = useState([
    { id: 1, source: 'User_492', quality: '1080p', status: 'pending' },
    { id: 2, source: 'User_118', quality: '4K', status: 'pending' },
    { id: 3, source: 'User_773', quality: '720p', status: 'pending' }
  ]);
  
  const [processingLog, setProcessingLog] = useState([]);

  const startPipeline = () => {
    setPipelineState('uploading');
    setProcessingLog(['Ingesting 3 user-submitted video payloads...']);
    
    setTimeout(() => {
      setPipelineState('processing');
      setProcessingLog(prev => [...prev, '[AI Vision] Filtering unusable/blurry frames...']);
      
      // Update clip statuses to processing
      setClips(prev => prev.map(c => ({...c, status: 'processing'})));
      
      setTimeout(() => {
        setProcessingLog(prev => [...prev, '[AI Vision] Running software stabilization algorithm...']);
        
        setTimeout(() => {
          setProcessingLog(prev => [...prev, '[Color Grade] Applying global event LUT (Cinematic Teal/Orange)...']);
          
          setTimeout(() => {
            setProcessingLog(prev => [...prev, '[Audio Engine] Syncing cuts to master track beats (120 BPM)...']);
            
            setTimeout(() => {
              setProcessingLog(prev => [...prev, 'Render complete. Auto-B-Roll ready for export.']);
              setPipelineState('complete');
              
              // Update clip statuses to complete
              setClips(prev => prev.map(c => ({...c, status: 'complete'})));
              
            }, 2500);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Pipeline Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> AI Video Production
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            AI-Powered Auto <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-rose-500">B-Roll Generator</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Event videographers can't be everywhere. Eventra's "Shared Perspective" engine ingests raw smartphone video directly from the crowd. Our AI vision model automatically stabilizes the shaky footage, applies a global color grade, and algorithmically stitches the best clips into a dynamic, multi-angle montage synced to music.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing Pipeline</h3>
               <button 
                 onClick={startPipeline}
                 disabled={pipelineState !== 'idle'}
                 className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition shadow-lg ${
                   pipelineState !== 'idle' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                 }`}
               >
                 Execute AI Render
               </button>
             </div>
             
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-y-auto flex flex-col">
               <div className="flex-1 space-y-2">
                 {processingLog.map((log, i) => (
                   <div key={i} className="animate-fade-in-up">
                     <span className="text-slate-600 mr-2">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
                     <span className={`${
                       log.includes('complete') ? 'text-emerald-400' :
                       log.includes('[AI Vision]') ? 'text-fuchsia-400' :
                       log.includes('[Color Grade]') ? 'text-rose-400' :
                       log.includes('[Audio Engine]') ? 'text-amber-400' : 'text-slate-300'
                     }`}>{log}</span>
                   </div>
                 ))}
                 {pipelineState === 'processing' && (
                   <div className="text-slate-500 animate-pulse flex space-x-1 mt-2">
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animation-delay-150"></div>
                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animation-delay-300"></div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Visual Monitor (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="w-full bg-black rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden aspect-[4/5] flex flex-col">
            
            {/* Monitor Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center z-20">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse"></span> Preview Monitor
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1920x1080 • H.265</span>
            </div>

            {/* Video Canvas */}
            <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
              
              {pipelineState === 'idle' ? (
                <div className="text-center text-slate-600 animate-pulse">
                  <span className="text-4xl block mb-2">🎞️</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Awaiting Footage Input</span>
                </div>
              ) : pipelineState === 'uploading' ? (
                <div className="grid grid-cols-2 gap-2 p-4 w-full h-full">
                  <div className="bg-slate-800 rounded flex items-center justify-center border border-slate-700 animate-pulse">
                    <span className="text-[10px] font-mono text-slate-500">Ingesting RAW_01.mp4</span>
                  </div>
                  <div className="bg-slate-800 rounded flex items-center justify-center border border-slate-700 animate-pulse">
                    <span className="text-[10px] font-mono text-slate-500">Ingesting RAW_02.mov</span>
                  </div>
                </div>
              ) : pipelineState === 'processing' ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                  
                  {/* Fake AI overlays */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-fuchsia-500/50 rounded flex items-center justify-center">
                      <span className="text-[8px] text-fuchsia-400 bg-black/50 px-1 absolute -top-3 left-0">STABILIZING TRACK</span>
                    </div>
                    
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-fuchsia-500">
                      <div className="h-full bg-white w-20 animate-[slide_1s_linear_infinite]"></div>
                    </div>
                  </div>
                  
                  {/* Split screen effect to show "color grading" */}
                  <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-white/50 backdrop-blur-[1px] filter sepia-[.3] hue-rotate-[180deg]"></div>
                </div>
              ) : (
                <div className="absolute inset-0">
                  {/* Final "Masterpiece" */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter contrast-125 saturate-150"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition duration-300">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 cursor-pointer hover:scale-110 transition transform">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg">
                    Ready for Export
                  </div>
                </div>
              )}

            </div>
            
            {/* Timeline UI */}
            <div className="h-20 bg-slate-900 border-t border-slate-800 p-2 flex space-x-1">
              {clips.map(clip => (
                <div key={clip.id} className="flex-1 relative overflow-hidden rounded bg-slate-800 border border-slate-700">
                  
                  {clip.status === 'processing' && (
                    <div className="absolute inset-0 bg-fuchsia-500/20 animate-pulse"></div>
                  )}
                  {clip.status === 'complete' && (
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  )}
                  
                  <div className="absolute bottom-1 left-1 text-[8px] font-mono font-bold text-slate-400">{clip.source}</div>
                  
                  {clip.status === 'complete' && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(500%); }
        }
      `}} />
    </div>
  );
};

export default AutoBRollGenerator;
