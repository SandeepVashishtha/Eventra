import React from 'react';
export default function EngagementLeaderboard() {
  const users = [{ name: 'Alex', points: 1200 }, { name: 'Sam', points: 950 }];
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>{i+1}. {u.name}</span>
            <span className="font-bold text-indigo-600">{u.points} pts</span>
          </li>
        ))}
      </ul>
      <button className="mt-4 w-full bg-pink-500 text-white py-2 rounded">Claim Reward</button>
    </div>
  );
}