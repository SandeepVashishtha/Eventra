import React, { useState } from 'react';

const AttendeeMatchmaking = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState(null);

  const runAlgorithm = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setMatches([
        { 
          id: 1, 
          name: 'Sarah Chen', 
          role: 'CTO at TechFlow', 
          matchScore: 96,
          tags: ['AI/ML', 'SaaS', 'Seeking Co-founder'],
          meetingSlot: 'Today, 2:30 PM (Networking Lounge A)'
        },
        { 
          id: 2, 
          name: 'Marcus Johnson', 
          role: 'VP Engineering', 
          matchScore: 92,
          tags: ['FinTech', 'Cloud Architecture', 'Hiring'],
          meetingSlot: 'Tomorrow, 10:15 AM (Booth 402)'
        },
        { 
          id: 3, 
          name: 'Elena Rodriguez', 
          role: 'Product Lead', 
          matchScore: 88,
          tags: ['B2B', 'Agile', 'Looking for Mentorship'],
          meetingSlot: 'Tomorrow, 1:00 PM (Coffee Bar)'
        }
      ]);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto mt-8 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl">
          🤝
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Smart Matchmaking</h2>
          <p className="text-sm text-gray-500">AI-driven networking recommendations based on your profile.</p>
        </div>
      </div>

      {!matches && !analyzing ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
          <p className="text-indigo-800 font-medium mb-4">Ready to find your optimal business connections?</p>
          <button 
            onClick={runAlgorithm}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            Analyze Attendees & Propose Meetings
          </button>
        </div>
      ) : analyzing ? (
        <div className="py-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Cross-referencing industry tags and past event behavior...</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h3 className="font-bold text-gray-700">Top Suggested Connections</h3>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">3 High-Value Matches</span>
          </div>

          {matches.map(match => (
            <div key={match.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{match.name}</h4>
                  <p className="text-sm text-gray-600">{match.role}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-indigo-600 font-black text-xl">{match.matchScore}%</div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Match Score</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {match.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-white border border-gray-300 text-gray-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-white border border-indigo-100 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide mb-1">Proposed Mutual Slot</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center">
                    <span className="mr-2">🕒</span> {match.meetingSlot}
                  </p>
                </div>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded hover:bg-indigo-100 transition">
                  Send Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendeeMatchmaking;
