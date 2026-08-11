import React, { useState } from 'react';

const VirtualSwagBag = () => {
  const [points] = useState(450); // Simulated user points from gamified actions
  const [swagItems, setSwagItems] = useState([
    { 
      id: 1, 
      sponsor: 'TechCorp', 
      type: 'Software Trial', 
      title: '6 Months TechCorp Pro', 
      cost: 200, 
      claimed: false,
      icon: '💻'
    },
    { 
      id: 2, 
      sponsor: 'DesignIt', 
      type: 'Discount Code', 
      title: '50% Off Annual Plan', 
      cost: 300, 
      claimed: true,
      icon: '🎨'
    },
    { 
      id: 3, 
      sponsor: 'CloudNet', 
      type: 'E-Book', 
      title: 'The Future of Edge Computing', 
      cost: 150, 
      claimed: false,
      icon: '📚'
    },
    { 
      id: 4, 
      sponsor: 'Eventra', 
      type: 'VIP Upgrade', 
      title: 'VIP Lounge Access Pass', 
      cost: 1000, 
      claimed: false,
      icon: '⭐'
    }
  ]);

  const claimItem = (id) => {
    setSwagItems(prev => prev.map(item => 
      item.id === id ? { ...item, claimed: true } : item
    ));
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg max-w-4xl mx-auto mt-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Virtual Swag Bag</h2>
          <p className="text-gray-500 mt-1">Unlock digital gifts by attending sessions and visiting booths.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-6 py-3 rounded-full border-2 border-indigo-100 shadow-sm flex items-center">
          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs mr-3">Available Balance</span>
          <span className="text-2xl font-black text-indigo-600">{points} <span className="text-sm font-bold">PTS</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swagItems.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border-2 p-5 transition-all ${item.claimed ? 'border-green-200 bg-green-50/30' : points >= item.cost ? 'border-indigo-200 hover:border-indigo-400 shadow-sm' : 'border-gray-200 opacity-75'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.sponsor}</p>
                  <h3 className="font-bold text-gray-800 leading-tight">{item.title}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.type === 'E-Book' ? 'bg-yellow-100 text-yellow-700' : item.type === 'Discount Code' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                  {item.type}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
              <div>
                {item.claimed ? (
                  <p className="text-xs font-bold text-green-600">Successfully Redeemed</p>
                ) : (
                  <p className="text-sm font-bold text-gray-700 flex items-center">
                    <span className="text-indigo-500 mr-1">💎</span> {item.cost} PTS
                  </p>
                )}
              </div>
              
              {item.claimed ? (
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow transition">
                  View Gift Code
                </button>
              ) : (
                <button 
                  onClick={() => claimItem(item.id)}
                  disabled={points < item.cost}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition ${points >= item.cost ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {points >= item.cost ? 'Unlock Swag' : `Need ${item.cost - points} More PTS`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
        <p className="text-indigo-800 text-sm font-medium">
          Sponsors receive detailed, anonymized analytics on swag redemption rates, proving direct ROI for digital placements.
        </p>
      </div>
    </div>
  );
};

export default VirtualSwagBag;
