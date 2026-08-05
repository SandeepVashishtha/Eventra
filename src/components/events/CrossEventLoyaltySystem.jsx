import React, { useState } from 'react';

const CrossEventLoyaltySystem = () => {
  const [points, setPoints] = useState(14500);
  const [activeTab, setActiveTab] = useState('history'); // history, rewards

  // Mock Data
  const recentActivity = [
    { id: 1, action: 'Early Bird Ticket: Cloud Summit 26', points: '+5,000', type: 'earn', date: 'Yesterday', icon: '🎫' },
    { id: 2, action: 'Post-Event Survey: DevOps Con', points: '+1,500', type: 'earn', date: 'Last Week', icon: '📝' },
    { id: 3, action: 'Redeemed: VIP Lounge Access', points: '-8,000', type: 'spend', date: '2 Months Ago', icon: '🍸' },
    { id: 4, action: 'Purchased TechWeek Merch', points: '+3,000', type: 'earn', date: '3 Months Ago', icon: '👕' }
  ];

  const availableRewards = [
    { id: 101, title: 'VIP Lounge Pass', event: 'Any Global Tech Event', cost: 8000, color: 'from-amber-400 to-orange-500' },
    { id: 102, title: '1-on-1 Speaker Meetup', event: 'Cloud Summit 26', cost: 12000, color: 'from-blue-500 to-indigo-600' },
    { id: 103, title: 'Free General Admission', event: 'DevOps Con 27', cost: 25000, color: 'from-emerald-400 to-teal-500' },
    { id: 104, title: 'Exclusive Merch Pack', event: 'Shipped to Home', cost: 5000, color: 'from-purple-500 to-fuchsia-600' }
  ];

  const handleRedeem = (cost) => {
    if (points >= cost) {
      setPoints(prev => prev - cost);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Master App (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌟</span> Customer Retention
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Cross-Event <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Loyalty Passport</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop treating every event as an isolated transaction. Our global loyalty system allows attendees to earn points across all of your production company's properties—incentivizing early purchases, survey completions, and merchandise sales with exclusive VIP rewards.
          </p>

          {/* Marketing Graphic / Data Structure visual */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Unified Organizer Ecosystem</h3>
             
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
               
               {/* Event A */}
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full md:w-1/3 text-center shadow-sm">
                 <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">☁️</div>
                 <h4 className="font-bold text-slate-800 text-xs uppercase">Cloud Summit</h4>
                 <p className="text-[10px] text-emerald-500 font-bold mt-1">+Earn Points</p>
               </div>

               <div className="hidden md:flex text-slate-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
               </div>

               {/* Central Passport */}
               <div className="bg-indigo-900 border-4 border-indigo-500/30 p-4 rounded-2xl w-full md:w-1/3 text-center shadow-lg relative transform scale-110 z-20">
                 <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-md animate-bounce">Global</div>
                 <h4 className="font-black text-white text-sm">Passport</h4>
                 <p className="text-xs text-indigo-300 font-mono mt-1">1 Account</p>
               </div>

               <div className="hidden md:flex text-slate-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
               </div>

               {/* Event B */}
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full md:w-1/3 text-center shadow-sm">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">⚙️</div>
                 <h4 className="font-bold text-slate-800 text-xs uppercase">DevOps Con</h4>
                 <p className="text-[10px] text-purple-500 font-bold mt-1">Redeem VIP</p>
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Attendee Mobile App (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-slate-50 rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Passport Header */}
            <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm z-10 relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Global Passport</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">GlobalTech Productions</p>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')] bg-cover border-2 border-white shadow-sm"></div>
              </div>

              {/* Point Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 block">Available Balance</span>
                <div className="flex items-end space-x-2">
                  <span className="text-4xl font-black">{points.toLocaleString()}</span>
                  <span className="text-sm font-bold text-indigo-400 mb-1">PTS</span>
                </div>
                
                <div className="mt-6 flex justify-between items-center text-xs font-mono">
                  <span className="text-indigo-200">Platinum Tier</span>
                  <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm">ID: 884-291</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-6 mt-4 space-x-4">
              <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-bold pb-2 transition-colors ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
              >
                Activity
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`text-sm font-bold pb-2 transition-colors flex items-center ${activeTab === 'rewards' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
              >
                Rewards <span className="ml-1.5 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">NEW</span>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              
              {activeTab === 'history' ? (
                <div className="space-y-4">
                  {recentActivity.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-lg border border-slate-100">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{item.action}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">{item.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-black ${item.type === 'earn' ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {availableRewards.map(reward => (
                    <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                      <div className={`h-16 bg-gradient-to-r ${reward.color} flex items-center px-4 relative overflow-hidden`}>
                         <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                         <h4 className="font-black text-white text-sm z-10">{reward.title}</h4>
                      </div>
                      <div className="p-4 flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Valid at: {reward.event}</span>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-600 font-black text-lg">{reward.cost.toLocaleString()} <span className="text-[10px]">PTS</span></span>
                          <button 
                            onClick={() => handleRedeem(reward.cost)}
                            disabled={points < reward.cost}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition ${points >= reward.cost ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                          >
                            {points >= reward.cost ? 'Redeem' : 'Need Points'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom Nav */}
            <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-6">
              <button className="text-slate-400 flex flex-col items-center">
                <span className="text-lg">📅</span>
              </button>
              <button className="text-indigo-600 flex flex-col items-center relative">
                <span className="text-lg">🎫</span>
                <div className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full"></div>
              </button>
              <button className="text-slate-400 flex flex-col items-center">
                <span className="text-lg">👤</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CrossEventLoyaltySystem;
