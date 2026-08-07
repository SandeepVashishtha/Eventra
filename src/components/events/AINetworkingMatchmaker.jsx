import React, { useState } from 'react';

const AINetworkingMatchmaker = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [meetingStatus, setMeetingStatus] = useState({});

  const matches = [
    {
      id: 'm1',
      name: 'Dr. Sarah Jenkins',
      role: 'VP of AI Research',
      company: 'TechNova Global',
      matchScore: 96,
      avatar: '👩‍🔬',
      reasons: ['Both attending "Future of LLMs"', 'Shared interest in vector databases', 'Complementary industries (HealthTech / AI)'],
      availability: ['14:00', '15:30', '16:00']
    },
    {
      id: 'm2',
      name: 'Marcus Ty',
      role: 'Lead Cloud Architect',
      company: 'DataStream Inc.',
      matchScore: 89,
      avatar: '👨‍💻',
      reasons: ['You bookmarked his upcoming keynote', 'Previous mutual connections', 'Shared interest in Kubernetes scaling'],
      availability: ['11:00', '13:15']
    },
    {
      id: 'm3',
      name: 'Elena Rodriguez',
      role: 'Product Manager',
      company: 'CloudScale',
      matchScore: 82,
      avatar: '👩‍💼',
      reasons: ['Looking for DevOps tooling (your specialty)', 'Attending same networking lunch'],
      availability: ['10:30', '14:45']
    }
  ];

  const requestMeeting = (matchId, time) => {
    setMeetingStatus(prev => ({
      ...prev,
      [matchId]: { status: 'requesting', time }
    }));

    setTimeout(() => {
      setMeetingStatus(prev => ({
        ...prev,
        [matchId]: { status: 'scheduled', time }
      }));
    }, 1500);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl font-black mb-2 flex items-center justify-center md:justify-start">
              <span className="mr-3">🤝</span> AI Matchmaker
            </h1>
            <p className="text-indigo-200 font-medium">Stop wandering. Let algorithms find your next big connection.</p>
          </div>
          
          <div className="relative z-10 bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest mb-1">Vector Model Status</p>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-mono font-bold text-white text-lg">Optimized</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'suggestions' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Top Connections
          </button>
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'scheduled' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            My Meetings
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'suggestions' ? (
          <div className="space-y-6">
            {matches.map(match => (
              <div key={match.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl border border-slate-200">
                          {match.avatar}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">{match.name}</h3>
                          <p className="text-indigo-600 font-bold text-sm">{match.role} @ {match.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 font-black text-lg px-3 py-1 rounded-lg border border-green-200 inline-block">
                          {match.matchScore}%
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Match Score</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Why you should meet</h4>
                      <ul className="space-y-2">
                        {match.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700 font-medium">
                            <span className="text-indigo-500 mt-0.5">✦</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Scheduling Action */}
                  <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
                    {meetingStatus[match.id]?.status === 'scheduled' ? (
                      <div className="text-center bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-3xl mb-2">✅</div>
                        <h4 className="font-black text-green-900">Meeting Set!</h4>
                        <p className="text-xs font-bold text-green-700 mt-1">Today at {meetingStatus[match.id].time}</p>
                        <p className="text-[10px] text-slate-500 mt-2">Added to itinerary</p>
                      </div>
                    ) : meetingStatus[match.id]?.status === 'requesting' ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-bold text-indigo-900">Securing slot...</p>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center md:text-left">Mutual Availability</h4>
                        <div className="space-y-2">
                          {match.availability.map(time => (
                            <button 
                              key={time}
                              onClick={() => requestMeeting(match.id, time)}
                              className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                              Book {time}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Your Schedule is Clear</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Any 1-on-1 meetings you book through the AI Matchmaker will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINetworkingMatchmaker;
