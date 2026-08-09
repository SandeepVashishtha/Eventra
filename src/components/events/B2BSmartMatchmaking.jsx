import React, { useState } from 'react';

const B2BSmartMatchmaking = () => {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState({});

  const matches = [
    { id: 1, name: 'Elena Rodriguez', title: 'VP of Engineering', company: 'CloudScale', matchScore: 98, reason: 'Looking for ML integrations (matches your product offering).', tags: ['Machine Learning', 'SaaS', 'Hiring'] },
    { id: 2, name: 'James Chen', title: 'Founder', company: 'DataFlow', matchScore: 94, reason: 'Attended the same "Future of DBs" keynote.', tags: ['Databases', 'Startup', 'B2B'] },
    { id: 3, name: 'Sarah Jenkins', title: 'CTO', company: 'HealthTech Inc', matchScore: 89, reason: 'Mutual connection: David Kim.', tags: ['Healthcare', 'Security', 'Enterprise'] },
    { id: 4, name: 'Michael O\'Connor', title: 'Director of Sales', company: 'SynergyCorp', matchScore: 85, reason: 'Actively searching for API gateway solutions.', tags: ['Sales', 'API', 'FinTech'] },
    { id: 5, name: 'Priya Patel', title: 'Lead Architect', company: 'Nexus Systems', matchScore: 82, reason: 'Shared interests in Kubernetes & Docker.', tags: ['DevOps', 'Cloud', 'Infrastructure'] }
  ];

  const handleRequest = (id) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRequested(prev => ({ ...prev, [id]: true }));
    }, 1200);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex justify-between items-center text-white">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-indigo-500/30">NLP + Collaborative Filtering</span>
              <h1 className="text-3xl font-black text-white">Smart Matchmaking</h1>
            </div>
            <p className="text-slate-400 text-sm">Stop leaving B2B networking to chance. Here are your top 5 high-value targets based on your profile.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              🤝
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-bold text-slate-600 uppercase tracking-widest text-xs">Your Top Recommendations</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Updated just now</span>
          </div>

          {matches.map((match) => (
            <div key={match.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Match Score Indicator */}
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500"></div>

              <div className="flex-1 flex flex-col pl-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{match.name}</h3>
                    <p className="text-sm font-bold text-slate-500">{match.title} at <span className="text-indigo-600">{match.company}</span></p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
                    <span className="text-xl font-black text-emerald-500">{match.matchScore}%</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 inline-block">
                  <p className="text-xs text-slate-600 flex items-center">
                    <span className="mr-2">💡</span> <strong className="mr-1 text-slate-800">Why meet?</strong> {match.reason}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {match.tags.map((tag, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Area */}
              <div className="md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                {!requested[match.id] ? (
                  <button 
                    onClick={() => handleRequest(match.id)}
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition text-sm flex flex-col items-center justify-center"
                  >
                    <span className="mb-1">Request 15m Mtg</span>
                    <span className="text-[9px] text-slate-400 font-normal">Auto-syncs schedule</span>
                  </button>
                ) : (
                  <div className="w-full bg-green-50 text-green-700 font-bold py-3 px-4 rounded-xl border border-green-200 text-center text-sm flex flex-col items-center justify-center animate-fade-in">
                    <span className="mb-1">✓ Request Sent</span>
                    <span className="text-[9px] text-green-600/70 font-normal">Waiting for confirmation</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default B2BSmartMatchmaking;
