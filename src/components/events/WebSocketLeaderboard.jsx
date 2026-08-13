import React, { useState, useEffect } from 'react';

const WebSocketLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Alex Johnson', company: 'TechCorp', points: 1450, avatar: 'bg-indigo-500' },
    { id: 2, name: 'Samantha Lee', company: 'DataSys', points: 1320, avatar: 'bg-pink-500' },
    { id: 3, name: 'Marcus Chen', company: 'InnovateIO', points: 1280, avatar: 'bg-emerald-500' },
    { id: 4, name: 'Priya Patel', company: 'CloudNet', points: 1150, avatar: 'bg-amber-500' },
    { id: 5, name: 'David Kim', company: 'Securify', points: 950, avatar: 'bg-blue-500' }
  ]);
  
  const [recentAction, setRecentAction] = useState(null);

  // Simulate WebSocket real-time updates
  useEffect(() => {
    const wsInterval = setInterval(() => {
      // Pick a random user to get points
      const userIndex = Math.floor(Math.random() * leaderboard.length);
      const pointsEarned = Math.floor(Math.random() * 5) * 10 + 10; // 10 to 50 points
      
      const actions = ['Visited Sponsor Booth', 'Asked Q&A Question', 'Completed Poll', 'Networking Request Accepted'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      setLeaderboard(prev => {
        const newBoard = [...prev];
        newBoard[userIndex].points += pointsEarned;
        
        // Sort descending
        return newBoard.sort((a, b) => b.points - a.points);
      });

      setRecentAction({
        name: leaderboard[userIndex].name,
        action: action,
        points: pointsEarned,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      
    }, 3500); // Trigger an update every 3.5 seconds

    return () => clearInterval(wsInterval);
  }, [leaderboard]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">WebSocket Connected</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Live Gamification Leaderboard</h1>
            <p className="text-slate-500 text-sm mt-1">Attendees earn points instantly. Watch the rankings shift in real-time.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Rank</p>
               <p className="font-black text-indigo-600 text-xl">#42</p>
             </div>
             <div className="h-8 w-px bg-slate-200"></div>
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Points</p>
               <p className="font-black text-slate-900 text-xl">450</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex justify-between items-center">
              <span>Top Attendees</span>
              <span className="text-xs font-medium text-slate-500">Updates live</span>
            </h2>

            <div className="space-y-4 relative">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ease-in-out ${index === 0 ? 'bg-amber-50 border-amber-200 shadow-sm transform scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                  style={{ zIndex: 10 - index }} // ensure top items overlap correctly during transitions
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 font-black text-center ${index === 0 ? 'text-amber-500 text-2xl' : index === 1 ? 'text-slate-400 text-xl' : index === 2 ? 'text-amber-700 text-xl' : 'text-slate-300'}`}>
                      #{index + 1}
                    </div>
                    <div className={`w-12 h-12 rounded-full ${user.avatar} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-bold ${index === 0 ? 'text-amber-900' : 'text-slate-800'}`}>{user.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{user.company}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-black transition-colors duration-300 ${index === 0 ? 'text-amber-600' : 'text-indigo-600'}`}>
                      {user.points}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white h-full flex flex-col">
              <h3 className="font-bold mb-4 border-b border-slate-700 pb-2">Live Activity Stream</h3>
              
              <div className="flex-1 overflow-hidden relative">
                {/* Gradient fade out at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                
                {recentAction ? (
                  <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-slide-down">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-emerald-400 text-sm">+{recentAction.points} pts</span>
                        <span className="text-xs text-slate-500 font-mono">{recentAction.time}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-200">{recentAction.name}</p>
                      <p className="text-xs text-slate-400">{recentAction.action}</p>
                    </div>
                    
                    {/* Ghost items to simulate history */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 opacity-60">
                      <div className="w-16 h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="w-32 h-3 bg-slate-700 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-slate-700 rounded"></div>
                    </div>
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 opacity-30">
                       <div className="w-16 h-4 bg-slate-700/50 rounded mb-2"></div>
                       <div className="w-32 h-3 bg-slate-700/50 rounded mb-1"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <span className="text-2xl mb-2 animate-pulse">📡</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-center">Listening for events...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WebSocketLeaderboard;
