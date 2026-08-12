import React, { useState } from 'react';

const GamificationQuests = () => {
  const [points, setPoints] = useState(1250);
  const [quests, setQuests] = useState([
    { id: 1, title: 'Visit TechCorp Booth', points: 300, completed: true, location: 'Hall A, Booth 12' },
    { id: 2, title: 'Attend Keynote Speech', points: 500, completed: true, location: 'Main Stage' },
    { id: 3, title: 'Scan QR at Startup Alley', points: 200, completed: false, location: 'Hall C' },
    { id: 4, title: 'Network with 5 attendees', points: 400, completed: false, location: 'Anywhere' }
  ]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-8 border-2 border-purple-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Event Quests</h2>
        <p className="text-gray-500 text-sm">Complete location-based challenges to earn rewards!</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white text-center mb-6 shadow-lg transform transition hover:scale-105">
        <p className="text-purple-100 uppercase tracking-widest text-xs font-semibold mb-1">Your Score</p>
        <div className="text-5xl font-black">{points} <span className="text-2xl text-purple-200">pts</span></div>
        <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
          <div className="bg-white h-full rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-xs mt-2 text-purple-100">750 pts to unlock VIP Swag Bag</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Active Quests</h3>
        {quests.map(quest => (
          <div key={quest.id} className={`p-4 rounded-lg border ${quest.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-purple-200 shadow-sm'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-medium ${quest.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{quest.title}</h4>
                <p className="text-xs text-gray-500 mt-1">📍 {quest.location}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold ${quest.completed ? 'text-gray-400' : 'text-purple-600'}`}>+{quest.points}</span>
                {quest.completed && <span className="text-xs text-green-500 font-medium mt-1">✓ Done</span>}
              </div>
            </div>
            {!quest.completed && (
              <button className="mt-3 w-full py-2 bg-purple-50 text-purple-700 font-medium text-sm rounded border border-purple-100 hover:bg-purple-100 transition">
                Open QR Scanner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamificationQuests;
