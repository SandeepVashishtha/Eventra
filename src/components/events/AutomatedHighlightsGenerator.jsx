import React, { useState } from 'react';

const AutomatedHighlightsGenerator = () => {
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, analyzing, rendering, complete
  const [progress, setProgress] = useState(0);

  const keyMoments = [
    { id: 1, time: '14:22', score: 98, type: 'chat_spike', desc: '"This new architecture changes everything!"' },
    { id: 2, time: '28:45', score: 92, type: 'nlp_sentiment', desc: 'Audience reacted strongly to pricing announcement.' },
    { id: 3, time: '41:10', score: 88, type: 'applause', desc: 'Sponsor demo concluded.' }
  ];

  const startGeneration = () => {
    setProcessingStatus('analyzing');
    setProgress(0);
    
    // Simulate multi-stage processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    setTimeout(() => setProcessingStatus('rendering'), 2000);
    setTimeout(() => setProcessingStatus('complete'), 4500);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-3xl shadow-2xl max-w-5xl mx-auto mt-8 border border-gray-800 text-white font-sans flex flex-col md:flex-row gap-8">
      
      {/* Video Preview Area */}
      <div className="w-full md:w-2/3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 tracking-tight">
              AI Highlight Reel Generator
            </h2>
            <p className="text-sm text-gray-400 mt-1">Transform hours of VODs into 2-minute social clips instantly.</p>
          </div>
        </div>

        <div className="bg-black rounded-2xl border border-gray-800 overflow-hidden relative shadow-inner flex-1 min-h-[400px]">
          {processingStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50">
              <span className="text-6xl mb-4">🎬</span>
              <h3 className="text-xl font-bold text-gray-300">Select a Session VOD</h3>
              <p className="text-sm text-gray-500">The AI will analyze the recording to find the best moments.</p>
            </div>
          )}

          {(processingStatus === 'analyzing' || processingStatus === 'rendering') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
              <div className="w-24 h-24 mb-6 relative">
                <svg className="animate-spin w-full h-full text-gray-700" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="currentColor"/>
                  <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="url(#gradient)" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} className="transition-all duration-200"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-lg">
                  {progress}%
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {processingStatus === 'analyzing' ? 'Analyzing NLP Sentiment & Chat...' : 'Rendering FFmpeg Stitches...'}
              </h3>
              <p className="text-sm text-gray-400">Processing "Keynote: Future of Cloud"</p>
            </div>
          )}

          {processingStatus === 'complete' && (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center animate-fade-in">
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition border-2 border-white">
                  <span className="text-4xl ml-2">▶</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-full bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-gray-700">
                  <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
                    <span>00:00</span>
                    <span>02:15</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 relative">
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 flex flex-col">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
          
          <div className="mb-6 border-b border-gray-700 pb-4">
            <h3 className="font-bold text-white mb-1">Source Session</h3>
            <select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-cyan-500 outline-none">
              <option>Keynote: Future of Cloud</option>
              <option>Panel: Security at Scale</option>
              <option>Workshop: React 19</option>
            </select>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white mb-3">AI Identified Key Moments</h3>
            {processingStatus === 'idle' ? (
              <div className="text-center text-gray-500 py-8 text-sm border-2 border-dashed border-gray-700 rounded-xl">
                Run generator to extract moments.
              </div>
            ) : processingStatus === 'complete' ? (
              <div className="space-y-3 animate-fade-in">
                {keyMoments.map((moment, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-cyan-900/50 text-cyan-400 text-[10px] font-bold uppercase px-2 py-1 rounded">
                        Score: {moment.score}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{moment.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-300">{moment.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
               <div className="space-y-3 opacity-50 pointer-events-none">
                 <div className="h-20 bg-gray-900 rounded-xl animate-pulse"></div>
                 <div className="h-20 bg-gray-900 rounded-xl animate-pulse"></div>
                 <div className="h-20 bg-gray-900 rounded-xl animate-pulse"></div>
               </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            {processingStatus === 'complete' ? (
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl shadow-lg transition text-sm">
                  Download MP4
                </button>
                <button className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold py-3 rounded-xl shadow-lg transition text-sm flex items-center justify-center">
                  Share
                </button>
              </div>
            ) : (
              <button 
                onClick={startGeneration}
                disabled={processingStatus !== 'idle'}
                className={`w-full font-black py-3 rounded-xl shadow-lg transition ${processingStatus !== 'idle' ? 'bg-gray-700 text-gray-500' : 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white'}`}
              >
                Generate Highlight Reel
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AutomatedHighlightsGenerator;
