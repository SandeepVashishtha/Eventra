import React, { useState, useEffect } from 'react';

const GamifiedEngagementLeaderboard = () => {
  const [userScore, setUserScore] = useState({ points: 1450, rank: 42 });
  const [activeQuests] = useState([
    { id: 1, title: 'Visit Platinum Sponsors', desc: 'Scan your badge at all 3 Platinum sponsor booths.', points: 500, progress: 2, total: 3 },
    { id: 2, title: 'Early Riser', desc: 'Attend the 8:00 AM Keynote session.', points: 200, progress: 1, total: 1, completed: true },
    { id: 3, title: 'Feedback Guru', desc: 'Complete 3 post-session surveys.', points: 300, progress: 1, total: 3 }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Alex Chen', points: 3420, trend: 'up', avatar: '😎' },
    { id: 2, name: 'Sarah Jenkins', points: 3150, trend: 'stable', avatar: '🚀' },
    { id: 3, name: 'Marcus Ty', points: 2900, trend: 'up', avatar: '💻' },
    { id: 4, name: 'Elena R.', points: 2850, trend: 'down', avatar: '🔥' },
    { id: 5, name: 'David Miller (You)', points: 1450, trend: 'up', avatar: '👑', isUser: true }
  ]);

  // Simulate real-time points updates via WebSocket
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        const newBoard = [...prev];
        // Randomly give someone points to simulate live activity
        const randomUserIdx = Math.floor(Math.random() * 4);
        newBoard[randomUserIdx] = {
          ...newBoard[randomUserIdx],
          points: newBoard[randomUserIdx].points + 50
        };
        // Sort to maintain leaderboard order
        return newBoard.sort((a, b) => b.points - a.points);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Event Quest</h2>
            <p className="text-sm text-slate-500 mt-1">Earn points, climb the leaderboard, win prizes.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Player Stats & Quests */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Player Dashboard */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl border-2 border-white/40">
                    👑
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">David Miller</h3>
                    <p className="text-indigo-200 text-sm font-medium">Rank #{userScore.rank} • Novice Networker</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Points</p>
                  <p className="text-4xl font-black font-mono">{userScore.points.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Active Quests */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">🎯</span> Active Quests
              </h3>
              
              <div className="space-y-4">
                {activeQuests.map(quest => (
                  <div key={quest.id} className={`p-4 rounded-xl border ${quest.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-bold ${quest.completed ? 'text-emerald-800' : 'text-slate-800'}`}>{quest.title}</h4>
                        <p className={`text-xs ${quest.completed ? 'text-emerald-600' : 'text-slate-500'}`}>{quest.desc}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${quest.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {quest.completed ? 'Earned' : `+${quest.points} PTS`}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${quest.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {quest.progress}/{quest.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Global Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="bg-slate-900 p-5 text-white">
                <h3 className="font-bold flex items-center">
                  <span className="mr-2">🏆</span> Global Leaderboard
                </h3>
                <p className="text-xs text-slate-400 mt-1">Top 3 win a free ticket to next year!</p>
              </div>
              
              <div className="flex-1 p-0">
                <ul className="divide-y divide-slate-100">
                  {leaderboard.map((user, idx) => (
                    <li key={user.name} className={`p-4 flex items-center transition-colors ${user.isUser ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                      <div className={`w-6 text-center font-bold mr-3 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                        {idx + 1}
                      </div>
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-lg mr-3 shadow-sm border border-slate-200">
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${user.isUser ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {user.name}
                        </p>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-700">{user.points.toLocaleString()}</span>
                        {user.trend === 'up' && <span className="text-green-500 text-xs">▲</span>}
                        {user.trend === 'down' && <span className="text-red-500 text-xs">▼</span>}
                        {user.trend === 'stable' && <span className="text-slate-300 text-xs">-</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
                  View Full Rankings →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GamifiedEngagementLeaderboard;
