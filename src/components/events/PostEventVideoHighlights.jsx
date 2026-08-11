import React, { useState } from 'react';

const PostEventVideoHighlights = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedStream, setSelectedStream] = useState('keynote_1');

  const streams = [
    { id: 'keynote_1', name: 'Opening Keynote: The Future of Cloud', duration: '1h 45m', views: '45.2K' },
    { id: 'panel_security', name: 'Security at Scale Panel', duration: '55m', views: '12.8K' },
    { id: 'closing', name: 'Closing Remarks & Awards', duration: '30m', views: '30.1K' }
  ];

  const generatedClips = [
    { id: 1, duration: '0:45', title: 'Major Product Reveal', trigger: 'Applause Spike (120dB)' },
    { id: 2, duration: '0:30', title: 'Q&A: Cost Optimization', trigger: 'Chat Velocity (+400%)' },
    { id: 3, duration: '0:45', title: 'CEO Closing Statement', trigger: 'NLP Sentiment (High Motivation)' }
  ];

  const handleGenerate = () => {
    setAnalyzing(true);
    setComplete(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setComplete(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 300);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-[600px] flex items-center justify-center font-sans text-slate-800">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <span className="mr-3 text-2xl">✂️</span> AI Highlight Reel Generator
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Automate your post-event marketing by letting AI clip your best moments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Source Selection */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4">Source Recordings</h3>
            <div className="space-y-3 flex-1">
              {streams.map(stream => (
                <div 
                  key={stream.id}
                  onClick={() => !analyzing && setSelectedStream(stream.id)}
                  className={`p-3 rounded-xl border-2 transition cursor-pointer ${selectedStream === stream.id ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                >
                  <p className="font-bold text-sm text-slate-800 line-clamp-1">{stream.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-medium">
                    <span>⏱️ {stream.duration}</span>
                    <span>👁️ {stream.views}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button 
                onClick={handleGenerate}
                disabled={analyzing}
                className={`w-full py-3 rounded-xl font-black text-white shadow-lg transition ${analyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30'}`}
              >
                {analyzing ? 'Analyzing VOD...' : 'Generate 2-Min Reel'}
              </button>
            </div>
          </div>

          {/* Right Column: Processing & Output */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 flex flex-col relative overflow-hidden text-white">
            
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <h3 className="font-bold text-slate-200">Video Processing Pipeline</h3>
              {complete && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  Ready to Publish
                </span>
              )}
            </div>

            {/* Main Stage */}
            <div className="flex-1 bg-black rounded-xl border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              
              {!analyzing && !complete && (
                <div className="text-center text-slate-500">
                  <div className="text-4xl mb-3 opacity-50">🤖</div>
                  <p className="font-medium text-sm">Awaiting video source input.</p>
                </div>
              )}

              {analyzing && (
                <div className="text-center z-10">
                  <div className="w-20 h-20 relative mx-auto mb-6">
                    <svg className="animate-spin w-full h-full text-slate-700" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="currentColor"/>
                      <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="#a855f7" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} className="transition-all duration-300"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-sm">
                      {progress}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-purple-400">Scanning Audio Envelopes...</p>
                    <p className="text-xs text-slate-400 font-mono">Parsing chat velocity logs</p>
                  </div>
                </div>
              )}

              {complete && (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center group cursor-pointer">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                      <span className="text-3xl ml-1">▶️</span>
                    </div>
                  </div>
                  
                  {/* Timeline overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-6">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex space-x-1">
                      {generatedClips.map(clip => (
                        <div key={clip.id} className="h-full bg-purple-500 rounded-full" style={{ width: '33%' }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-300">
                      <span>0:00</span>
                      <span>2:00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clips Breakdown */}
            <div className={`mt-6 transition-all duration-500 ${complete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Identified Segments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {generatedClips.map((clip, i) => (
                  <div key={clip.id} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-purple-900/50 text-purple-300 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-purple-500/30">Clip {i+1}</span>
                      <span className="text-xs font-mono text-slate-400">{clip.duration}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-200 mb-1 leading-snug">{clip.title}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Trigger: {clip.trigger}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg transition border border-slate-600">
                  Edit Timeline
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-lg">
                  Export & Share
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEventVideoHighlights;
