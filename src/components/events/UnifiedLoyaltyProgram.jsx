import React, { useState } from 'react';

const UnifiedLoyaltyProgram = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, rules

  const attendeeData = {
    name: 'Marcus Ty',
    level: 4,
    xp: 8450,
    nextLevelXp: 10000,
    status: 'Gold Member',
    eventsAttended: 6,
    organizer: 'TechNova Global'
  };

  const progressPercentage = (attendeeData.xp / attendeeData.nextLevelXp) * 100;

  const rewardTriggers = [
    { level: 2, reward: '10% Ticket Discount', status: 'unlocked', date: '2025-03-12' },
    { level: 3, reward: 'Free Virtual Swag Bag', status: 'unlocked', date: '2025-08-22' },
    { level: 4, reward: 'VIP Lounge Access', status: 'unlocked', date: '2026-01-15' },
    { level: 5, reward: '25% Ticket Discount & Free Workshop', status: 'locked', date: null }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Organizer Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-2">Unified Global Identity</p>
              <h1 className="text-3xl font-black">{attendeeData.organizer} Loyalty Hub</h1>
              <p className="text-indigo-200 mt-1">Rewarding your continuous engagement across all our events.</p>
            </div>
            
            <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-purple-200 font-bold uppercase">Current Tier</p>
                <p className="text-xl font-black text-yellow-400">{attendeeData.status}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                🏆
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-slate-200 pb-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`pb-2 font-bold text-sm px-2 ${activeTab === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Progress
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`pb-2 font-bold text-sm px-2 ${activeTab === 'rules' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Organizer Rules Engine
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Stats */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-24 h-24 bg-indigo-50 border-4 border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  👨‍💻
                </div>
                <h2 className="text-xl font-black text-slate-900">{attendeeData.name}</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">Attended {attendeeData.eventsAttended} Global Events</p>
                
                <div className="bg-slate-50 rounded-xl p-4 text-left">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-black text-slate-700 text-lg">Level {attendeeData.level}</span>
                    <span className="text-xs font-bold text-indigo-600">{attendeeData.xp.toLocaleString()} / {attendeeData.nextLevelXp.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase text-center">1,550 XP to Level 5</p>
                </div>
              </div>
            </div>

            {/* Right Column: Rewards Timeline */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">Loyalty Rewards Timeline</h3>
              
              <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8">
                {rewardTriggers.map((reward, idx) => (
                  <div key={idx} className="relative pl-8">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${reward.status === 'unlocked' ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white border-slate-300'}`}></div>
                    
                    <div className={`p-4 rounded-xl border ${reward.status === 'unlocked' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-black ${reward.status === 'unlocked' ? 'text-indigo-900' : 'text-slate-600'}`}>
                          Level {reward.level}
                        </h4>
                        {reward.status === 'unlocked' ? (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-1 rounded">Unlocked on {reward.date}</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase px-2 py-1 rounded">Locked</span>
                        )}
                      </div>
                      <p className={`text-sm ${reward.status === 'unlocked' ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                        {reward.reward}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Automation Engine</h2>
                <p className="text-sm text-slate-500 mt-1">Configure cross-event rewards triggers.</p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition text-sm">
                + Create New Rule
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                 <div className="w-8 h-4 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-4"></div>
                 </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">⚡</span>
                <h3 className="font-bold text-slate-800 text-lg">Active Trigger: Level 5 VIP Conversion</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">IF Condition (Trigger)</p>
                  <p className="font-mono text-sm text-indigo-700 font-bold bg-indigo-50 p-2 rounded">
                    Attendee.Level &gt;= 5
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">THEN Action (Execution)</p>
                  <div className="space-y-2">
                    <p className="font-mono text-sm text-emerald-700 font-bold bg-emerald-50 p-2 rounded">
                      Email.SendTemplate('VIP_Discount_25')
                    </p>
                    <p className="font-mono text-sm text-emerald-700 font-bold bg-emerald-50 p-2 rounded">
                      Attendee.Tags.Add('VIP')
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 italic font-medium">
                Note: This rule executes globally across all active and future events under the TechNova Global tenant.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnifiedLoyaltyProgram;
