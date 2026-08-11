import React, { useState, useEffect } from 'react';

const AutoCaptionGenerator = () => {
  const [pipelineState, setPipelineState] = useState('idle'); // idle, extracting, transcribing, syncing, complete
  const [progress, setProgress] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);

  const vodQueue = [
    { id: 'VOD-842', title: 'Future of AI Keynote', duration: '45:20', speaker: 'Dr. Sarah Jenkins', status: 'pending' },
    { id: 'VOD-843', title: 'Web3 Architecture Deep Dive', duration: '52:14', speaker: 'Marcus Vance', status: 'pending' }
  ];

  const [processedVods, setProcessedVods] = useState([
    { id: 'VOD-840', title: 'Opening Ceremony', duration: '24:10', speaker: 'Event Team', status: 'published', lang: 'EN, ES, FR' },
    { id: 'VOD-841', title: 'Sponsor Showcase Panel', duration: '35:45', speaker: 'Various', status: 'published', lang: 'EN' }
  ]);

  const startPipeline = (video) => {
    setActiveVideo(video);
    setPipelineState('extracting');
    setProgress(0);
    
    // Simulate pipeline steps
    setTimeout(() => {
      setPipelineState('transcribing');
      setProgress(25);
      
      let transcriptionProgress = 25;
      const tInterval = setInterval(() => {
        transcriptionProgress += 2;
        setProgress(transcriptionProgress);
        
        if (transcriptionProgress >= 85) {
          clearInterval(tInterval);
          setPipelineState('syncing');
          
          setTimeout(() => {
            setProgress(100);
            setPipelineState('complete');
            
            setTimeout(() => {
              setProcessedVods(prev => [{ ...video, status: 'published', lang: 'EN' }, ...prev]);
              setActiveVideo(null);
              setPipelineState('idle');
            }, 2000);
          }, 1500);
        }
      }, 100);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Compliance & Accessibility
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">VOD Captioning Engine</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Ensure 100% ADA accessibility compliance without expensive human transcription services. Our background worker utilizes advanced Speech-to-Text AI (Whisper) to automatically extract, transcribe, and sync highly accurate closed captions (.vtt) for raw session recordings before they hit your VOD dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Pipeline Visualizer (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col h-[650px]">
          
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white">AI Processing Pipeline</h2>
            {pipelineState !== 'idle' && pipelineState !== 'complete' && (
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center animate-pulse">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Processing VOD
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950 rounded-2xl border-4 border-slate-800 p-6">
            
            {activeVideo ? (
              <div className="h-full flex flex-col justify-between">
                
                {/* Video Info */}
                <div className="text-center mb-8">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Target Asset</span>
                  <h3 className="text-lg font-black text-white">{activeVideo.title}</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {activeVideo.id} | Duration: {activeVideo.duration}</span>
                </div>

                {/* Processing Visualizer */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  
                  {/* Progress Ring */}
                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-500 transition-all duration-300" strokeDasharray="552.9" strokeDashoffset={552.9 - (552.9 * progress) / 100} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-white">{progress}%</span>
                    </div>
                  </div>

                  {/* Active Step Text */}
                  <div className="text-center h-16">
                    {pipelineState === 'extracting' && (
                      <div className="animate-fade-in-up">
                        <span className="block font-black text-amber-500 text-lg mb-1">1. Extracting Audio</span>
                        <span className="text-xs text-slate-400 font-mono">Separating raw audio track via FFmpeg</span>
                      </div>
                    )}
                    {pipelineState === 'transcribing' && (
                      <div className="animate-fade-in-up">
                        <span className="block font-black text-blue-500 text-lg mb-1">2. AI Transcription</span>
                        <span className="text-xs text-slate-400 font-mono">Whisper AI processing tensors...</span>
                      </div>
                    )}
                    {pipelineState === 'syncing' && (
                      <div className="animate-fade-in-up">
                        <span className="block font-black text-purple-500 text-lg mb-1">3. VTT Syncing</span>
                        <span className="text-xs text-slate-400 font-mono">Aligning timestamps & compiling .vtt file</span>
                      </div>
                    )}
                    {pipelineState === 'complete' && (
                      <div className="animate-fade-in-up">
                        <span className="block font-black text-emerald-500 text-lg mb-1">4. Ready for VOD</span>
                        <span className="text-xs text-slate-400 font-mono">Captions successfully attached to asset</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtitle preview mock */}
                {pipelineState === 'transcribing' && progress > 50 && (
                  <div className="bg-black/50 p-4 rounded-xl border border-slate-800 mt-6 h-20 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 text-[8px] bg-blue-900/50 text-blue-400 px-1 py-0.5 font-mono">Live Transcription Buffer</div>
                    <p className="text-white text-sm font-bold text-center typing-animation">
                      "...and that's exactly why we believe <span className="bg-yellow-500/30 text-yellow-300 px-1 rounded">artificial intelligence</span> will revolutionize..."
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <span className="text-5xl mb-4">🎙️</span>
                <p className="text-white font-bold text-lg">AI Pipeline Idle</p>
                <p className="text-sm text-slate-400 mt-2">Select a pending video from the queue to generate captions.</p>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Side: VOD Queue & Published (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Pending Queue */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
               <span>Pending Processing Queue</span>
               <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px]">{vodQueue.length} Raw Files</span>
             </h3>
             
             <div className="space-y-3">
               {vodQueue.map(video => (
                 <div key={video.id} className={`bg-slate-950 border p-4 rounded-xl flex flex-col transition-all ${activeVideo?.id === video.id ? 'border-emerald-500 opacity-50' : 'border-slate-800'}`}>
                   
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h4 className="text-sm font-bold text-white mb-0.5">{video.title}</h4>
                       <span className="text-[10px] text-slate-500 font-mono">Duration: {video.duration}</span>
                     </div>
                     <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                       RAW MP4
                     </span>
                   </div>
                   
                   <button 
                     onClick={() => startPipeline(video)}
                     disabled={pipelineState !== 'idle'}
                     className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center ${pipelineState === 'idle' ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                   >
                     {activeVideo?.id === video.id ? 'Processing...' : 'Run Auto-Captioning AI'}
                   </button>
                 </div>
               ))}
             </div>
          </div>

          {/* Published Library */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Published to VOD Portal</h3>
             
             <div className="flex-1 overflow-y-auto pr-1 space-y-3">
               {processedVods.map(video => (
                 <div key={video.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between animate-fade-in-up">
                   
                   <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800">
                       <span className="text-xl">▶️</span>
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-white mb-0.5">{video.title}</h4>
                       <div className="flex space-x-2">
                         <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center">
                           <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1"></span> ADA Compliant
                         </span>
                       </div>
                     </div>
                   </div>

                   <div className="text-right">
                     <span className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Captions (.vtt)</span>
                     <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded">{video.lang}</span>
                   </div>
                   
                 </div>
               ))}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AutoCaptionGenerator;
