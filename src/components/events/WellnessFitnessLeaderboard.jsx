import React, { useState, useEffect } from 'react';

const WellnessFitnessLeaderboard = () => {
  const [syncStatus, setSyncStatus] = useState('disconnected'); // disconnected, syncing, synced
  const [userSteps, setUserSteps] = useState(0);

  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Alex Johnson', company: 'FitTech', steps: 14520, isUser: false },
    { id: 2, name: 'Sarah Chen', company: 'HealthCorp', steps: 13890, isUser: false },
    { id: 3, name: 'Marcus Ty', company: 'WellnessInc', steps: 12400, isUser: false },
    { id: 4, name: 'Elena Rodriguez', company: 'MediSoft', steps: 11950, isUser: false },
    { id: 5, name: 'David Miller', company: 'Your Company', steps: 0, isUser: true },
  ]);

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      const fetchedSteps = 12100;
      setUserSteps(fetchedSteps);
      
      setLeaderboard(prev => {
        const newBoard = prev.map(p => p.isUser ? { ...p, steps: fetchedSteps } : p);
        return newBoard.sort((a, b) => b.steps - a.steps);
      });
      
      setSyncStatus('synced');
    }, 2000);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl shadow-xl max-w-lg mx-auto mt-8 border border-teal-100">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mx-auto mb-3">
          🏃‍♂️
        </div>
        <h2 className="text-2xl font-black text-teal-900 tracking-tight">Event Step Challenge</h2>
        <p className="text-sm text-teal-700 mt-1">TechCon 2026 Wellness Retreat 5K</p>
      </div>

      {syncStatus !== 'synced' ? (
        <div className="bg-white p-6 rounded-xl border border-teal-100 text-center shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-2">Join the Challenge</h3>
          <p className="text-sm text-gray-500 mb-6">Sync your wearable device to track your steps live on the event leaderboard.</p>
          
          <button 
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center disabled:opacity-70"
          >
            {syncStatus === 'syncing' ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Syncing API...</>
            ) : (
              'Connect Apple Health / Google Fit'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-teal-200 text-center shadow-md mb-8 transform scale-105 transition-transform">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Your Live Steps</p>
          <p className="text-5xl font-black text-teal-700 font-mono tracking-tighter">
            {userSteps.toLocaleString()}
          </p>
          <div className="mt-3 flex justify-center items-center text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full w-max mx-auto">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Synced Just Now
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-900 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Live Leaderboard</h3>
          <span className="text-xs bg-teal-800 px-2 py-1 rounded text-teal-200 font-medium">Top 5</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {leaderboard.map((person, index) => (
            <div key={person.id} className={`flex items-center p-4 transition ${person.isUser ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${person.isUser ? 'text-teal-900' : 'text-gray-800'}`}>
                  {person.name} {person.isUser && '(You)'}
                </p>
                <p className="text-xs text-gray-500">{person.company}</p>
              </div>
              <div className="text-right">
                <p className={`font-mono font-bold ${person.isUser ? 'text-teal-700' : 'text-gray-600'}`}>
                  {person.steps.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-center text-xs text-teal-600/60 mt-6 font-medium">
        Top 3 attendees win an exclusive VIP dinner with the keynote speakers!
      </p>
    </div>
  );
};

export default WellnessFitnessLeaderboard;
