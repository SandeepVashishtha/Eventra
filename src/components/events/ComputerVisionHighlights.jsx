import React, { useState } from 'react';

const ComputerVisionHighlights = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reelReady, setReelReady] = useState(false);

  const handleGenerate = () => {
    setAnalyzing(true);
    setReelReady(false);
    setProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setAnalyzing(false);
          setReelReady(true);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  const detectedClips = [
    { time: '14:22', trigger: 'Sustained Applause (>85dB)', length: '12s' },
    { time: '42:10', trigger: 'High Audience Laughter', length: '8s' },
    { time: '1:05:44', trigger: 'Visual Excitement / Standing Ovation', length: '15s' },
    { time: '1:42:05', trigger: 'Keynote Speaker High Energy (Audio Spike)', length: '10s' }
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-pink-500/30">Computer Vision + Audio NLP</span>
              <h1 className="text-2xl font-black text-white">AI Highlight Reel Generator</h1>
            </div>
            <p className="text-slate-400 text-sm">Automatically extract the most engaging moments from hours of session footage.</p>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={analyzing}
            className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center ${analyzing ? 'bg-slate-700 text-slate-500 cursor-wait' : 'bg-pink-600 hover:bg-pink-500 text-white'}`}
          >
            {analyzing ? 'Processing Video...' : reelReady ? 'Regenerate Reel' : 'Extract Highlights'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Video Processing View */}
          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden h-[450px] flex flex-col">
            
            {!analyzing && !reelReady ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <span className="text-6xl mb-4 opacity-50">🎬</span>
                <p className="font-bold">Select 'Extract Highlights' to run CV models on raw footage.</p>
                <p className="text-xs mt-2 opacity-60">Input: Keynote_MainStage_Raw.mp4 (2h 14m)</p>
              </div>
            ) : analyzing ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between text-sm font-bold text-pink-400 mb-2 px-2">
                  <span>Analyzing frames & audio waveforms...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                  <div className="h-full bg-gradient-to-r from-pink-600 to-purple-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
                
                {/* Simulated Waveform / CV Box */}
                <div className="mt-12 h-32 w-full border-t border-b border-pink-500/30 flex items-center justify-between px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
                  
                  {/* Moving scanline */}
                  <div className="w-1 h-full bg-pink-500 absolute left-0 animate-scan shadow-[0_0_15px_#ec4899]"></div>
                  
                  {/* Fake waveforms */}
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 bg-pink-500/50 rounded-t" style={{ height: `${Math.random() * 100}%` }}></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative group">
                {/* Final Reel Player Mockup */}
                <div className="absolute inset-0 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
                  {/* Play Button overlay */}
                  <div className="w-16 h-16 bg-pink-600/90 rounded-full flex items-center justify-center text-white text-2xl shadow-[0_0_30px_rgba(236,72,153,0.6)] cursor-pointer hover:scale-110 transition-transform">
                    ▶
                  </div>
                  <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-bold font-mono">
                    Official_Highlight_Reel.mp4
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-white text-xs font-bold font-mono">
                    01:00
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detected Moments */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col h-[450px]">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-2">Timeline Extraction Log</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {!reelReady && !analyzing ? (
                <p className="text-slate-500 text-sm italic">Waiting for analysis...</p>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  {detectedClips.map((clip, idx) => (
                    <div key={idx} className={`bg-slate-900 p-4 rounded-xl border flex items-center justify-between ${analyzing && progress < (idx + 1) * 25 ? 'opacity-30 border-slate-700' : 'border-pink-500/30'}`}>
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-pink-400 font-bold bg-pink-500/10 px-2 py-1 rounded text-sm">{clip.time}</span>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{clip.trigger}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Spliced: {clip.length}</p>
                        </div>
                      </div>
                      <span className="text-slate-600">✂️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {reelReady && (
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-3">
                <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition text-sm">
                  Download MP4
                </button>
                <button className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center">
                  Share to Twitter
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComputerVisionHighlights;
