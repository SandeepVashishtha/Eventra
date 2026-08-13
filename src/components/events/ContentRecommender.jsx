import React, { useState } from 'react';

const ContentRecommender = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendationsReady, setRecommendationsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const recommendedVideos = [
    { id: 1, title: 'Serverless Scaling at Enterprise Levels', match: 98, reason: 'Because you attended "Intro to AWS Lambda"', duration: '45m', thumbnail: 'bg-indigo-900', icon: '⚡' },
    { id: 2, title: 'WebXR: Building the Metaverse', match: 92, reason: 'Based on your connections with 3 VR Developers', duration: '1h 12m', thumbnail: 'bg-fuchsia-900', icon: '🥽' },
    { id: 3, title: 'The Future of Fintech APIs', match: 87, reason: 'Because you rated Stripe\'s keynote 5/5 stars', duration: '38m', thumbnail: 'bg-emerald-900', icon: '💳' },
    { id: 4, title: 'Zero-Knowledge Cryptography', match: 81, reason: 'Trending among other CTOs', duration: '55m', thumbnail: 'bg-slate-800', icon: '🔒' }
  ];

  const generateRecommendations = () => {
    setAnalyzing(true);
    setRecommendationsReady(false);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setAnalyzing(false);
          setRecommendationsReady(true);
        }, 600);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm">
                Netflix-Style ML
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Hyper-Personalized VODs</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">Stop sending attendees to an unorganized video dump. Keep them engaged for months by using their live event data to automatically generate a bespoke Netflix-style dashboard.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
             <button 
               onClick={generateRecommendations}
               disabled={analyzing || recommendationsReady}
               className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center ${analyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : recommendationsReady ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}
             >
               {analyzing ? 'Processing Graph Data...' : recommendationsReady ? 'Recommendations Built' : 'Simulate Event Conclusion'}
             </button>
          </div>
        </div>
      </div>

      {/* Main App Area */}
      <div className="max-w-7xl mx-auto w-full flex-1 relative z-10 flex items-center justify-center min-h-[400px]">
        
        {!recommendationsReady && !analyzing && (
           <div className="text-center opacity-40">
             <span className="text-6xl mb-4 block">🎬</span>
             <h2 className="text-2xl font-bold text-white mb-2">Event is currently live</h2>
             <p className="text-slate-400 max-w-md mx-auto">VOD recommendations will be generated automatically based on attendee behavior once the summit concludes.</p>
           </div>
        )}

        {analyzing && (
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-black text-white mb-4">Building Knowledge Graph</h3>
              
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${progress > 20 ? 'text-emerald-500' : 'text-slate-600'} transition-colors`}>{progress > 20 ? '✓' : '○'}</span>
                  <span className={`text-sm ${progress > 20 ? 'text-slate-300' : 'text-slate-500'} font-bold`}>Parsing Session Attendance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${progress > 50 ? 'text-emerald-500' : 'text-slate-600'} transition-colors`}>{progress > 50 ? '✓' : '○'}</span>
                  <span className={`text-sm ${progress > 50 ? 'text-slate-300' : 'text-slate-500'} font-bold`}>Analyzing Networking Connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${progress > 80 ? 'text-emerald-500' : 'text-slate-600'} transition-colors`}>{progress > 80 ? '✓' : '○'}</span>
                  <span className={`text-sm ${progress > 80 ? 'text-slate-300' : 'text-slate-500'} font-bold`}>Mapping Survey Sentiment</span>
                </div>
              </div>

              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
           </div>
        )}

        {recommendationsReady && (
           <div className="w-full animate-fade-in-up">
              
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Top Picks for Alex</h2>
                  <p className="text-sm text-slate-400 font-medium">Curated based on your activity at Eventra Summit '26</p>
                </div>
                <button className="text-sm font-bold text-red-500 hover:text-red-400 transition">View All History ➔</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedVideos.map((video) => (
                  <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-600 transition duration-300 shadow-lg cursor-pointer">
                    
                    {/* Thumbnail Mockup */}
                    <div className={`h-40 ${video.thumbnail} flex flex-col justify-between p-4 relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      <div className="flex justify-between items-start relative z-10">
                        <span className="text-2xl">{video.icon}</span>
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                          {video.match}% Match
                        </div>
                      </div>

                      <div className="relative z-10 self-end bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white">
                        {video.duration}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-20 bg-black/40">
                         <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/50 transform scale-75 group-hover:scale-100 transition">
                           ▶
                         </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4">
                      <h3 className="font-bold text-white text-base mb-2 leading-tight group-hover:text-red-400 transition">{video.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 leading-snug">
                        {video.reason}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
              
              <div className="mt-12 opacity-50 border-t border-slate-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Because you watched Keynote...</h3>
                <div className="flex space-x-4 overflow-hidden">
                  <div className="w-64 h-36 bg-slate-800 rounded-xl flex-shrink-0"></div>
                  <div className="w-64 h-36 bg-slate-800 rounded-xl flex-shrink-0"></div>
                  <div className="w-64 h-36 bg-slate-800 rounded-xl flex-shrink-0"></div>
                  <div className="w-64 h-36 bg-slate-800 rounded-xl flex-shrink-0"></div>
                  <div className="w-64 h-36 bg-slate-800 rounded-xl flex-shrink-0"></div>
                </div>
              </div>

           </div>
        )}

      </div>
    </div>
  );
};

export default ContentRecommender;
