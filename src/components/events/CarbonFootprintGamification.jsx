import React, { useState, useEffect } from 'react';

const CarbonFootprintGamification = () => {
  const [ecoPoints, setEcoPoints] = useState(120);
  const [carbonSaved, setCarbonSaved] = useState(4.5); // kg CO2
  const [tier, setTier] = useState('Green'); // Green, Silver, Gold, VIP
  
  // Simulated Leaderboard
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alex M.', points: 840, saved: 32.1 },
    { rank: 2, name: 'Sarah K.', points: 790, saved: 29.5 },
    { rank: 3, name: 'You', points: 120, saved: 4.5 },
    { rank: 4, name: 'David L.', points: 95, saved: 3.2 }
  ]);

  const [notification, setNotification] = useState(null);
  const [scanning, setScanning] = useState(false);

  const checkTierUpgrade = (newPoints) => {
    if (newPoints >= 500 && tier !== 'VIP') {
      setTier('VIP');
      setNotification({
        title: "🌟 VIP STATUS UNLOCKED",
        desc: "Incredible! Your low carbon footprint has earned you an instant upgrade to the backstage VIP lounge."
      });
    } else if (newPoints >= 250 && tier === 'Green') {
      setTier('Gold');
      setNotification({
        title: "🏅 GOLD TIER REACHED",
        desc: "You've earned a free meal voucher at any vegan food truck!"
      });
    }
  };

  const simulateTransit = () => {
    // Simulate GPS detecting public transit arrival
    setNotification({
      title: "🚇 TRANSIT DETECTED",
      desc: "GPS telemetry confirms arrival via Metro. +150 Eco Points!"
    });
    
    setTimeout(() => {
      setEcoPoints(prev => {
        const next = prev + 150;
        checkTierUpgrade(next);
        return next;
      });
      setCarbonSaved(prev => prev + 12.5);
      
      // Update leaderboard
      setLeaderboard(prev => {
        const newLb = [...prev];
        newLb[2] = { ...newLb[2], points: ecoPoints + 150, saved: carbonSaved + 12.5 };
        return newLb.sort((a, b) => b.points - a.points).map((item, index) => ({...item, rank: index + 1}));
      });
    }, 2000);
    
    setTimeout(() => setNotification(null), 6000);
  };

  const simulateScan = () => {
    setScanning(true);
    
    setTimeout(() => {
      setScanning(false);
      setNotification({
        title: "♻️ RECYCLING VERIFIED",
        desc: "Smart Bin 04 scanned successfully. +50 Eco Points!"
      });
      
      setTimeout(() => {
        setEcoPoints(prev => {
          const next = prev + 50;
          checkTierUpgrade(next);
          return next;
        });
        setCarbonSaved(prev => prev + 1.2);
        
        // Update leaderboard
        setLeaderboard(prev => {
          const newLb = [...prev];
          const myIndex = newLb.findIndex(item => item.name === 'You');
          newLb[myIndex] = { ...newLb[myIndex], points: newLb[myIndex].points + 50, saved: newLb[myIndex].saved + 1.2 };
          return newLb.sort((a, b) => b.points - a.points).map((item, index) => ({...item, rank: index + 1}));
        });
      }, 1000);
      
      setTimeout(() => setNotification(null), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Master Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> Sustainability Data
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Real-Time Carbon <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Footprint Gamification</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Event organizers want to host "green events," but usually rely on buying useless post-event carbon offsets. Eventra actually gamifies attendee behavior in real-time. By tracking public transit via GPS telemetry and allowing users to scan QR codes on smart recycling bins, the lowest-carbon attendees are dynamically rewarded with VIP lounge upgrades or backstage passes during the event.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🌍</span> Global Impact Dashboard
               </h3>
               <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-mono flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> LIVE TRACKING
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Total Event CO2 Prevented</span>
                 <span className="text-3xl font-black text-teal-600 font-mono">
                   12,450 <span className="text-sm">kg</span>
                 </span>
               </div>

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Active Eco-Participants</span>
                 <span className="text-3xl font-black text-slate-700 font-mono">
                   8,942 <span className="text-sm">Users</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 overflow-y-auto pr-2 flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Live Leaderboard</span>
               
               <div className="space-y-2 flex-1">
                 {leaderboard.map((user) => (
                   <div key={user.name} className={`flex items-center p-3 rounded-xl border transition-all duration-500 ${
                     user.name === 'You' ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-slate-100'
                   }`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mr-4 ${
                       user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                       user.rank === 2 ? 'bg-slate-200 text-slate-600' :
                       user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                     }`}>
                       #{user.rank}
                     </div>
                     
                     <div className="flex-1">
                       <span className={`font-bold text-sm ${user.name === 'You' ? 'text-teal-700' : 'text-slate-800'}`}>{user.name}</span>
                       <span className="block text-[10px] text-slate-500">{user.saved.toFixed(1)} kg CO2 saved</span>
                     </div>
                     
                     <div className="text-right">
                       <span className="font-black font-mono text-teal-600">{user.points}</span>
                       <span className="block text-[8px] uppercase font-bold text-teal-400">PTS</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Gamification Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-white rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-20 bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header (Eco Tier) */}
            <div className={`p-6 z-10 text-white transition-colors duration-1000 flex flex-col items-center text-center ${
              tier === 'VIP' ? 'bg-gradient-to-br from-indigo-600 to-purple-800' :
              tier === 'Gold' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
              'bg-gradient-to-br from-teal-500 to-emerald-600'
            }`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 border-2 border-white/30 backdrop-blur-sm">
                <span className="text-3xl">
                  {tier === 'VIP' ? '👑' : tier === 'Gold' ? '🏆' : '🌱'}
                </span>
              </div>
              <h2 className="text-2xl font-black">{tier} Tier</h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{ecoPoints} Eco Points</p>
              
              {/* Progress Bar to next tier */}
              {tier !== 'VIP' && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>{ecoPoints}</span>
                    <span>{tier === 'Green' ? '250 (Gold)' : '500 (VIP)'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: \`\${Math.min(100, (ecoPoints / (tier === 'Green' ? 250 : 500)) * 100)}%\` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Action Area */}
            <div className="flex-1 flex flex-col p-6 z-10 bg-slate-50 relative">
              
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Earn Points</h3>
              
              <div className="space-y-4">
                
                {/* Transit Action */}
                <button 
                  onClick={simulateTransit}
                  className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center text-left hover:border-teal-300 hover:shadow-md transition group"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition">
                    🚇
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block text-sm">Public Transit Check-in</span>
                    <span className="text-slate-500 text-[10px]">Verify arrival via Metro/Bus</span>
                  </div>
                  <span className="text-teal-600 font-bold font-mono text-sm">+150</span>
                </button>

                {/* Recycling Action */}
                <button 
                  onClick={simulateScan}
                  disabled={scanning}
                  className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center text-left hover:border-teal-300 hover:shadow-md transition group disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 transition ${
                    scanning ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-500 group-hover:scale-110'
                  }`}>
                    {scanning ? <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div> : '♻️'}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block text-sm">Scan Smart Bin</span>
                    <span className="text-slate-500 text-[10px]">Dispose waste in smart bins</span>
                  </div>
                  <span className="text-teal-600 font-bold font-mono text-sm">+50</span>
                </button>
                
              </div>
              
              {/* Rewards Area */}
              <div className="mt-auto">
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Reward</span>
                    <span className="font-bold text-sm">
                      {tier === 'VIP' ? 'Backstage Access Pass' : 
                       tier === 'Gold' ? 'Free Vegan Meal Voucher' : 
                       '10% off Eco-Merch'}
                    </span>
                  </div>
                  <button className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg">View</button>
                </div>
              </div>

              {/* Dynamic Push Notification Simulation */}
              {notification && (
                <div className="absolute top-4 inset-x-4 bg-white border border-teal-200 rounded-2xl p-4 shadow-2xl animate-fade-in flex items-start space-x-3 z-50">
                  <div className="text-2xl mt-1">🎉</div>
                  <div>
                    <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-1">{notification.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {notification.desc}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default CarbonFootprintGamification;
