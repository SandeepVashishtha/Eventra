import React, { useState, useEffect } from 'react';

const GamifiedEventLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Alex Rivera', role: 'Developer', points: 4250, badge: '🏆', rank: 1, trend: 'up' },
    { id: 2, name: 'Sam Chen', role: 'Designer', points: 3900, badge: '🥇', rank: 2, trend: 'same' },
    { id: 3, name: 'Jordan Lee', role: 'Product Manager', points: 3750, badge: '🥈', rank: 3, trend: 'up' },
    { id: 4, name: 'Casey Smith', role: 'Engineer', points: 3200, badge: '🥉', rank: 4, trend: 'down' },
    { id: 5, name: 'Taylor Swift', role: 'Marketer', points: 2950, badge: '⭐', rank: 5, trend: 'same' },
  ]);

  // Simulate real-time point updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        let updated = [...prev];
        const randomUserIdx = Math.floor(Math.random() * updated.length);
        const pointsEarned = Math.floor(Math.random() * 50) + 10;
        
        updated[randomUserIdx] = {
          ...updated[randomUserIdx],
          points: updated[randomUserIdx].points + pointsEarned
        };
        
        // Sort and assign new ranks/trends
        updated.sort((a, b) => b.points - a.points);
        updated = updated.map((user, idx) => {
          let newTrend = 'same';
          if (user.rank > idx + 1) newTrend = 'up';
          if (user.rank < idx + 1) newTrend = 'down';
          
          return { ...user, rank: idx + 1, trend: newTrend };
        });
        
        return updated;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentUser = {
    rank: 142,
    points: 850,
    nextTier: 1000
  };

  const progressPercentage = (currentUser.points / currentUser.nextTier) * 100;

  return (
    <div className="p-6 bg-slate-900 min-h-[700px] flex items-center justify-center font-sans text-slate-200">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Leaderboard Column */}
        <div className="md:col-span-2 bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700 relative overflow-hidden flex flex-col h-[600px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">
                Global Leaderboard
              </h2>
              <p className="text-slate-400 text-sm mt-1">Real-time WebSockets synchronization</p>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700 flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mt-1"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 relative z-10 pr-2 custom-scrollbar">
            {leaderboard.map((user) => (
              <div 
                key={user.id} 
                className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between hover:bg-slate-700 transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 text-center flex flex-col items-center">
                    <span className={`font-black text-xl ${user.rank <= 3 ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                      #{user.rank}
                    </span>
                    {user.trend === 'up' && <span className="text-green-400 text-xs">▲</span>}
                    {user.trend === 'down' && <span className="text-red-400 text-xs">▼</span>}
                    {user.trend === 'same' && <span className="text-slate-600 text-xs">-</span>}
                  </div>
                  
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl border border-slate-600">
                    {user.badge}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg leading-tight">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{user.role}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-black text-fuchsia-400">{user.points.toLocaleString()}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / My Status */}
        <div className="flex flex-col space-y-6 h-[600px]">
          
          {/* Current User Status */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 shadow-xl border border-indigo-700 text-center">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">My Status</h3>
            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 border-4 border-indigo-500 flex items-center justify-center text-4xl">
              🧑‍🚀
            </div>
            <h2 className="text-2xl font-black text-white">Rank #{currentUser.rank}</h2>
            
            <div className="mt-6 bg-black/30 p-4 rounded-xl border border-white/10 text-left">
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-slate-300 text-sm">Next Tier: Silver</span>
                <span className="text-xs font-bold text-fuchsia-400">{currentUser.points} / {currentUser.nextTier} XP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-[10px] text-indigo-300 text-center">150 XP needed to unlock VIP Lounge</p>
            </div>
          </div>

          {/* Earn Points Actions */}
          <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">How to Earn XP</h3>
            
            <div className="space-y-3 overflow-y-auto pr-1">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center group cursor-pointer hover:border-fuchsia-500 transition">
                <div>
                  <p className="font-bold text-slate-300 text-sm group-hover:text-fuchsia-400 transition">Visit Sponsor Booth</p>
                  <p className="text-xs text-slate-500">Scan QR code</p>
                </div>
                <span className="bg-fuchsia-900/50 text-fuchsia-400 text-xs font-black px-2 py-1 rounded">+50 XP</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center group cursor-pointer hover:border-fuchsia-500 transition">
                <div>
                  <p className="font-bold text-slate-300 text-sm group-hover:text-fuchsia-400 transition">Ask a Question</p>
                  <p className="text-xs text-slate-500">During live Q&A</p>
                </div>
                <span className="bg-fuchsia-900/50 text-fuchsia-400 text-xs font-black px-2 py-1 rounded">+25 XP</span>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center group cursor-pointer hover:border-fuchsia-500 transition">
                <div>
                  <p className="font-bold text-slate-300 text-sm group-hover:text-fuchsia-400 transition">Submit Survey</p>
                  <p className="text-xs text-slate-500">Post-event feedback</p>
                </div>
                <span className="bg-fuchsia-900/50 text-fuchsia-400 text-xs font-black px-2 py-1 rounded">+100 XP</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default GamifiedEventLeaderboard;
