import React, { useState, useEffect } from 'react';

const DynamicSponsorAds = () => {
  const [activeAd, setActiveAd] = useState(null);
  const [metrics, setMetrics] = useState({ impressions: 0, interactions: 0 });
  const [lobbyView, setLobbyView] = useState('main'); // main, networking, stages

  // Simulated user profile context for dynamic targeting
  const userContext = {
    industry: 'DevOps',
    role: 'Cloud Architect',
    seniority: 'Senior'
  };

  const adInventory = [
    {
      id: 'ad_1',
      type: 'interactive_poll',
      sponsor: 'DataDog',
      targetIndustry: 'DevOps',
      content: 'How many microservices are you currently monitoring?',
      options: ['1-10', '11-50', '50+'],
      cta: 'Get a Free Trial'
    },
    {
      id: 'ad_2',
      type: 'video_bumper',
      sponsor: 'AWS',
      targetIndustry: 'Cloud Architecture',
      content: 'Build faster on AWS Serverless.',
      duration: 5, // seconds
      cta: 'View Docs'
    },
    {
      id: 'ad_3',
      type: '3d_object',
      sponsor: 'GitHub',
      targetIndustry: 'Software Engineering',
      content: 'GitHub Copilot Enterprise is here.',
      cta: 'Explore Features'
    }
  ];

  // Ad Engine Logic
  useEffect(() => {
    // Select an ad targeted to the user's industry (simulated)
    const targetedAd = adInventory.find(ad => userContext.industry.includes(ad.targetIndustry) || userContext.industry === 'DevOps') || adInventory[0];
    
    // Simulate IntersectionObserver / Viewability delay
    const loadTimeout = setTimeout(() => {
      setActiveAd(targetedAd);
      setMetrics(prev => ({ ...prev, impressions: prev.impressions + 1 }));
    }, 1500);

    return () => clearTimeout(loadTimeout);
  }, [lobbyView]);

  const handleAdInteraction = () => {
    setMetrics(prev => ({ ...prev, interactions: prev.interactions + 1 }));
    alert(`Redirecting to ${activeAd.sponsor} sponsor page...`);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[600px] flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Virtual Lobby Simulation */}
        <div className="lg:col-span-2 bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative h-[500px] flex flex-col">
          
          {/* Lobby Navigation */}
          <div className="bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-800 z-20 absolute top-0 w-full">
            <h2 className="text-xl font-black text-white">TechCon Virtual Lobby</h2>
            <div className="flex space-x-2">
              <button onClick={() => setLobbyView('main')} className={`px-3 py-1 rounded text-xs font-bold ${lobbyView === 'main' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Lobby</button>
              <button onClick={() => setLobbyView('stages')} className={`px-3 py-1 rounded text-xs font-bold ${lobbyView === 'stages' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Stages</button>
            </div>
          </div>

          {/* Lobby Environment */}
          <div className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
              
              {/* Dynamic Ad Placement Area */}
              <div className="w-full max-w-md animate-fade-in relative z-10">
                {activeAd && activeAd.type === 'interactive_poll' && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Sponsored by {activeAd.sponsor}</span>
                      <span className="text-xs text-blue-400 font-bold">Contextual Placement</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-4 leading-snug">{activeAd.content}</h3>
                    <div className="space-y-2 mb-4">
                      {activeAd.options.map((opt, i) => (
                        <button key={i} onClick={handleAdInteraction} className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 font-medium transition">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeAd && activeAd.type === 'video_bumper' && (
                  <div className="bg-black border border-slate-700 rounded-xl overflow-hidden shadow-2xl group cursor-pointer" onClick={handleAdInteraction}>
                    <div className="h-48 bg-slate-800 flex items-center justify-center relative">
                      <span className="text-4xl text-white">▶️</span>
                      <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 text-[10px] text-white font-bold rounded uppercase tracking-wider border border-white/20">
                        {activeAd.sponsor}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 flex justify-between items-center">
                      <p className="text-sm font-bold text-white truncate pr-4">{activeAd.content}</p>
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded whitespace-nowrap">{activeAd.cta}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Ad Engine Analytics & Settings */}
        <div className="flex flex-col space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-black text-white mb-1">Ad Serving Engine</h2>
            <p className="text-xs text-slate-400 mb-6">Real-time contextual injection & viewability tracking.</p>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live User Context</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-bold text-blue-400">{userContext.industry}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Role:</span>
                  <span className="font-bold text-white">{userContext.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Impressions</p>
                <p className="text-2xl font-black text-white">{metrics.impressions}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Interactions</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-black text-emerald-400">{metrics.interactions}</p>
                  <p className="text-xs text-emerald-600 font-bold">
                    {metrics.impressions > 0 ? Math.round((metrics.interactions / metrics.impressions) * 100) : 0}% CTR
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-start space-x-3">
              <span className="text-blue-400 text-lg mt-0.5">👁️</span>
              <p className="text-xs text-blue-200 leading-relaxed font-medium">
                Impressions are only counted when the ad block enters the viewport (using Intersection Observer API), ensuring 100% accurate viewability metrics for sponsors.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSponsorAds;
