import React, { useState } from 'react';

const PostEventChurnPredictor = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [segmented, setSegmented] = useState(false);

  const handleAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setSegmented(true);
    }, 2000);
  };

  const highRiskAttendees = [
    { id: 1, name: 'David Kim', company: 'TechNova', score: 32, reason: 'Missed 3 booked sessions', tier: 'High Risk' },
    { id: 2, name: 'Sarah Connor', company: 'CyberDyne', score: 45, reason: 'Zero booth check-ins', tier: 'Medium Risk' },
    { id: 3, name: 'James Wilson', company: 'MedCorp', score: 28, reason: 'Uninstalled app on Day 1', tier: 'High Risk' }
  ];

  const safeAttendees = [
    { id: 4, name: 'Elena Rostova', company: 'Global Logistics', score: 92, status: 'Super Fan' },
    { id: 5, name: 'Michael Chang', company: 'FinTech Solutions', score: 88, status: 'Loyalist' }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-red-500">📉</span> Churn Prediction Engine
            </h1>
            <p className="text-slate-500 font-medium mt-1">AI-driven analysis of post-event engagement to identify at-risk attendees.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
              Export CSV
            </button>
            <button 
              onClick={handleAnalysis}
              disabled={analyzing || segmented}
              className={`font-bold px-6 py-2 rounded-lg shadow transition ${segmented ? 'bg-green-100 text-green-700 border border-green-200' : analyzing ? 'bg-slate-300 text-slate-600' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {segmented ? 'Audience Segmented ✓' : analyzing ? 'Analyzing Data...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard / Overview */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Attendees</p>
                <p className="text-3xl font-black text-slate-800">1,245</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Predicted Churn</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-black text-red-600">18%</p>
                  <p className="text-xs font-bold text-slate-500">(224 users)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-green-50 rounded-bl-full"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Likely to Return</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-black text-green-600">82%</p>
                  <p className="text-xs font-bold text-slate-500">(1,021 users)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">At-Risk Segment (Needs Intervention)</h2>
              
              {!segmented ? (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="font-medium text-sm">Run analysis to identify churn risks.</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {highRiskAttendees.map((user) => (
                    <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white ${user.score < 30 ? 'bg-red-500' : 'bg-orange-500'}`}>
                            {user.score}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <span className="text-[10px]">📉</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{user.name}</h3>
                          <p className="text-xs text-slate-500">{user.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 md:mx-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Factor</p>
                        <p className="text-sm font-medium text-slate-700 bg-red-50 inline-block px-3 py-1 rounded text-red-800 border border-red-100">
                          {user.reason}
                        </p>
                      </div>

                      <button className="mt-4 md:mt-0 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition text-sm">
                        View Profile
                      </button>
                    </div>
                  ))}
                  
                  <div className="pt-4 text-center">
                    <button className="text-blue-600 font-bold text-sm hover:underline">
                      View all 224 at-risk attendees →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Campaign Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 text-white relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <h2 className="text-lg font-bold text-white mb-2 z-10 relative">Retargeting Campaigns</h2>
              <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed z-10 relative">
                Automatically segment attendees based on their Engagement Score and launch tailored email follow-ups.
              </p>

              <div className="space-y-4 flex-1 z-10 relative">
                
                <div className={`p-4 rounded-xl border transition-all ${segmented ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-red-500/30">High Risk (224)</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Win-Back Campaign</h3>
                  <p className="text-xs text-slate-400 mb-3">Send a personalized apology for any issues and offer a 40% discount for next year.</p>
                  <button disabled={!segmented} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded transition">
                    Launch Campaign
                  </button>
                </div>

                <div className={`p-4 rounded-xl border transition-all ${segmented ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-green-500/30">Loyalists (1,021)</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">Early Bird Upsell</h3>
                  <p className="text-xs text-slate-400 mb-3">Send a "thank you" highlighting key moments, with a VIP upgrade offer for next year.</p>
                  <button disabled={!segmented} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition">
                    Launch Campaign
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PostEventChurnPredictor;
