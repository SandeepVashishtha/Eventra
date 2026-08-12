import React, { useState } from 'react';

const SpeakerPrepPortal = () => {
  const [activeTab, setActiveTab] = useState('triage'); // triage, upcoming, discarded

  const questions = [
    {
      id: 1,
      text: "How do you see AI impacting junior developer roles in the next 5 years?",
      author: "Alex Chen",
      upvotes: 124,
      groupedCount: 5,
      sentiment: 'positive',
      tags: ['AI/ML', 'Career', 'Future Trends']
    },
    {
      id: 2,
      text: "What specific security frameworks does your new edge-compute model use?",
      author: "Sarah J.",
      upvotes: 89,
      groupedCount: 2,
      sentiment: 'neutral',
      tags: ['Security', 'Technical', 'Infrastructure']
    },
    {
      id: 3,
      text: "Can you elaborate on the latency issues mentioned on slide 14?",
      author: "Marcus T.",
      upvotes: 67,
      groupedCount: 0,
      sentiment: 'neutral',
      tags: ['Clarification', 'Performance']
    }
  ];

  const discardedQuestions = [
    { id: 4, text: "[Filtered by Auto-Mod: Inappropriate Language]", reason: "Profanity" },
    { id: 5, text: "Will this be recorded?", reason: "Repetitive (Answered in intro)" }
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-[600px] rounded-xl shadow-2xl max-w-5xl mx-auto mt-8 border border-gray-800 text-white flex flex-col">
      {/* Top Navigation Bar - Tablet Optimized */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Speaker Portal: Q&A Triage
          </h2>
          <p className="text-gray-400 text-sm mt-1">Keynote: The Future of Edge Computing</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-xl font-bold text-gray-200">14:22:05</p>
            <p className="text-xs text-red-400 font-bold uppercase">12 Mins Remaining</p>
          </div>
          <button className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 border border-gray-700">
            ⚙️
          </button>
        </div>
      </div>

      <div className="flex flex-1 mt-6 gap-6">
        {/* Sidebar */}
        <div className="w-1/4 space-y-2 hidden md:block">
          <button 
            onClick={() => setActiveTab('triage')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition ${activeTab === 'triage' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            🔥 Top Questions
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            🕒 Live Feed (Unfiltered)
          </button>
          <button 
            onClick={() => setActiveTab('discarded')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition ${activeTab === 'discarded' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            🗑️ Auto-Discarded
          </button>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">AI Moderator Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Asked</span><span className="font-bold">142</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Grouped</span><span className="font-bold text-blue-400">86</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Filtered</span><span className="font-bold text-red-400">14</span></div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-950 rounded-xl border border-gray-800 p-6 overflow-y-auto max-h-[600px] shadow-inner">
          {activeTab === 'triage' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-300">Highest Ranked by AI</h3>
                <span className="text-xs font-bold bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full border border-blue-800">
                  Sorted by: Upvotes + Relevance
                </span>
              </div>

              {questions.map((q) => (
                <div key={q.id} className="bg-gray-900 border border-gray-700 p-5 rounded-xl hover:border-gray-500 transition cursor-pointer relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center bg-gray-800 px-3 py-1 rounded-lg">
                        <span className="text-lg font-black text-white">{q.upvotes}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Votes</span>
                      </div>
                      {q.groupedCount > 0 && (
                        <div className="bg-emerald-900/30 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-800">
                          + {q.groupedCount} Similar Questions Grouped
                        </div>
                      )}
                    </div>
                    <button className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg font-medium transition border border-gray-600">
                      Mark Answered
                    </button>
                  </div>
                  
                  <p className="text-xl font-medium text-gray-100 leading-snug mb-3">{q.text}</p>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 font-medium">Asked by <span className="text-gray-300">{q.author}</span></p>
                    <div className="flex space-x-2">
                      {q.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discarded' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-300 mb-4">Filtered by AI Auto-Mod</h3>
              {discardedQuestions.map((q) => (
                <div key={q.id} className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 italic mb-1">{q.text}</p>
                    <p className="text-xs font-bold text-red-500 uppercase">Reason: {q.reason}</p>
                  </div>
                  <button className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-600">Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerPrepPortal;
