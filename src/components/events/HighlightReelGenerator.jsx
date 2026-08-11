import React, { useState } from 'react';

const HighlightReelGenerator = () => {
  const [processing, setProcessing] = useState(false);
  const [reelReady, setReelReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const startGeneration = () => {
    setProcessing(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setProcessing(false);
          setReelReady(true);
        }, 800);
      } else {
        setProgress(currentProgress);
      }
    }, 500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-3xl mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Highlight Reel Generator</h2>
          <p className="text-gray-500 mt-1">Automated post-event promotional video splicing.</p>
        </div>
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-sm">
          🎬
        </div>
      </div>

      {!processing && !reelReady ? (
        <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center">
          <p className="text-gray-600 mb-6 font-medium text-center max-w-lg">
            Ready to analyze 48 hours of session footage. The AI will scan for moments of high audience engagement (chat volume spikes, applause) and splice them into a 2-minute promotional reel.
          </p>
          <button 
            onClick={startGeneration}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow transition transform hover:-translate-y-1"
          >
            Start Video Analysis
          </button>
        </div>
      ) : processing ? (
        <div className="bg-gray-900 text-white p-8 rounded-xl border border-gray-800 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-gray-300 font-bold uppercase tracking-wider mb-2 text-sm">Processing Footage</p>
          
          <div className="w-full max-w-md bg-gray-800 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-gray-700">
            <div className="bg-red-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-red-400 font-mono text-xs">{progress}% Complete</p>
          
          <div className="mt-6 flex flex-col items-center space-y-1 text-xs text-gray-500 font-mono">
            {progress > 20 && <p className="animate-fade-in text-gray-400">✅ Analyzed audio stems for applause...</p>}
            {progress > 50 && <p className="animate-fade-in text-gray-400">✅ Correlated Twitch chat volume spikes...</p>}
            {progress > 80 && <p className="animate-fade-in text-gray-400">✅ Splicing optimal timestamps...</p>}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <h3 className="font-bold text-green-900">Highlight Reel Generated Successfully</h3>
              <p className="text-sm text-green-700">Compiled 12 high-engagement moments into a 2m 14s promotional video.</p>
            </div>
          </div>
          
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800 group">
            <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1280x720/111111/ff0000?text=Auto-Generated+Highlight+Reel')] bg-cover opacity-80 group-hover:opacity-100 transition duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.7)] transition transform hover:scale-110">
                <span className="ml-1 text-2xl">▶</span>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded text-white text-xs font-mono border border-gray-700">
              02:14 / 1080p
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-300 hover:bg-gray-200 transition">
              Open in Video Editor
            </button>
            <button className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition">
              Export to Marketing Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighlightReelGenerator;
