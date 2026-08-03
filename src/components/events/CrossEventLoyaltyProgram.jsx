import React, { useState } from 'react';

const CrossEventLoyaltyProgram = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, rewards, history
  const [points, setPoints] = useState(1450);

  const [rewards] = useState([
    { id: 1, title: 'VIP Lounge Upgrade', cost: 1000, event: 'TechCon 2027', icon: '🌟', claimed: false },
    { id: 2, title: 'Early Access Registration', cost: 500, event: 'Any Future Event', icon: '🎫', claimed: true },
    { id: 3, title: 'Exclusive Merch Pack', cost: 2000, event: 'Design Summit 2026', icon: '👕', claimed: false },
    { id: 4, title: '1-on-1 Speaker Meet & Greet', cost: 3500, event: 'AI Dev Conference', icon: '🤝', claimed: false }
  ]);

  const [history] = useState([
    { id: 1, date: 'Oct 12, 2026', action: 'Attended TechCon 2026', points: '+500' },
    { id: 2, date: 'Oct 13, 2026', action: 'Completed Gamified Swag Quest', points: '+250' },
    { id: 3, date: 'Nov 05, 2026', action: 'Redeemed Early Access Pass', points: '-500' },
    { id: 4, date: 'Jan 15, 2027', action: 'Early Bird Ticket Purchase (Design Summit)', points: '+1200' }
  ]);

  const redeemReward = (cost) => {
    if (points >= cost) {
      setPoints(prev => prev - cost);
      alert('Reward redeemed successfully!');
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8 border border-gray-200">
      
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-center mb-6 shadow-md">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
            <span className="text-4xl">👑</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Eventra Elite Pass</h2>
            <p className="text-blue-200 font-medium mt-1">David Miller <span className="mx-2">•</span> Member since 2024</p>
          </div>
        </div>
        
        <div className="bg-black/30 px-6 py-4 rounded-xl border border-white/10 text-center backdrop-blur-md">
          <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Available Points</p>
          <div className="flex items-baseline space-x-1 justify-center">
            <span className="text-4xl font-black text-white">{points.toLocaleString()}</span>
            <span className="text-sm font-bold text-blue-300">PTS</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm w-max">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-2 rounded-md font-bold text-sm transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('rewards')}
          className={`px-5 py-2 rounded-md font-bold text-sm transition ${activeTab === 'rewards' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Redeem Rewards
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-md font-bold text-sm transition ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Point History
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[300px]">
        
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex flex-col justify-center">
              <h3 className="font-bold text-indigo-900 mb-2">Next Tier: Platinum Member</h3>
              <div className="w-full bg-indigo-200 rounded-full h-3 mb-2">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-indigo-700 font-medium">Earn 550 more points to unlock free priority seating across all network events.</p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Upcoming Network Events</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Design Summit 2026</span>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">Earn up to 1500 PTS</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">TechCon 2027</span>
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">Earn up to 2000 PTS</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rewards.map(reward => (
              <div key={reward.id} className="border border-gray-200 p-5 rounded-xl hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {reward.icon}
                  </div>
                  {reward.claimed ? (
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Claimed</span>
                  ) : (
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {reward.cost} PTS
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900">{reward.title}</h4>
                <p className="text-xs text-gray-500 mt-1 mb-4">Valid at: {reward.event}</p>
                
                <button 
                  onClick={() => redeemReward(reward.cost)}
                  disabled={reward.claimed || points < reward.cost}
                  className={`w-full py-2 text-sm font-bold rounded-lg transition ${reward.claimed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : points >= reward.cost ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {reward.claimed ? 'Redeemed' : points >= reward.cost ? 'Redeem Reward' : `Need ${reward.cost - points} more PTS`}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Action</th>
                  <th className="pb-3 font-bold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 text-sm text-gray-500 whitespace-nowrap pr-4">{item.date}</td>
                    <td className="py-4 text-sm font-medium text-gray-800">{item.action}</td>
                    <td className={`py-4 text-sm font-bold text-right whitespace-nowrap ${item.points.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                      {item.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CrossEventLoyaltyProgram;
