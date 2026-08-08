import React, { useState, useEffect } from 'react';

const EdgeLocalCache = () => {
  const [networkStatus, setNetworkStatus] = useState('online'); // online, offline, syncing
  const [cacheStatus, setCacheStatus] = useState(100);
  const [activeTab, setActiveTab] = useState('schedule');
  const [lastSync, setLastSync] = useState('Just now');

  const simulateNetworkDrop = () => {
    setNetworkStatus('offline');
    setTimeout(() => {
      setNetworkStatus('syncing');
      setTimeout(() => {
        setNetworkStatus('online');
        setLastSync('Just now');
      }, 2000);
    }, 4000);
  };

  const scheduleData = [
    { time: '09:00 AM', title: 'Opening Keynote', location: 'Main Hall A' },
    { time: '11:30 AM', title: 'Future of Web3', location: 'Stage B' },
    { time: '01:00 PM', title: 'Networking Lunch', location: 'Expo Floor' },
    { time: '03:45 PM', title: 'AI in Enterprise', location: 'Room 402' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Edge Node Simulator (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Infrastructure
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Edge-Computed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Local Caching</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Basement convention centers are notorious for terrible cellular reception. By aggressively utilizing ServiceWorkers (PWA), the entire event app downloads to the attendee's device. When they lose signal, the app seamlessly switches to offline mode with zero UI disruption.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             
             {/* Simulator Controls */}
             <div className="flex justify-between items-center mb-6 relative z-10">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Network Simulator</h3>
               <button 
                 onClick={simulateNetworkDrop}
                 disabled={networkStatus !== 'online'}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${networkStatus === 'online' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
               >
                 Simulate Signal Drop
               </button>
             </div>

             {/* Backend Cache Status */}
             <div className="space-y-4 relative z-10">
               <div>
                 <div className="flex justify-between text-xs font-bold mb-1">
                   <span className="text-slate-600">ServiceWorker Cache</span>
                   <span className="text-emerald-600">14.2 MB / 14.2 MB</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-full"></div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-4">
                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2">
                   <span className="text-emerald-500">✓</span>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Map Tiles</p>
                     <p className="text-xs font-mono text-slate-700">Cached</p>
                   </div>
                 </div>
                 <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center space-x-2">
                   <span className="text-emerald-500">✓</span>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Schedule DB</p>
                     <p className="text-xs font-mono text-slate-700">IndexedDB</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Mobile App Experience (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full max-w-[380px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-12 bg-slate-900 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                {networkStatus === 'online' ? (
                  <span className="text-emerald-400">5G 📶</span>
                ) : networkStatus === 'offline' ? (
                  <span className="text-red-400">No Service 📵</span>
                ) : (
                  <span className="text-amber-400 animate-pulse">Connecting... 🔄</span>
                )}
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* In-App Network Banner */}
            <div className={`transition-all duration-500 overflow-hidden ${networkStatus === 'offline' ? 'h-8 opacity-100 bg-amber-500' : networkStatus === 'syncing' ? 'h-8 opacity-100 bg-blue-500' : 'h-0 opacity-0 bg-emerald-500'} flex items-center justify-center`}>
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                {networkStatus === 'offline' ? '⚠️ Offline Mode Active (Using Local Cache)' : '🔄 Syncing Background Data...'}
              </span>
            </div>

            {/* App Header */}
            <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-100 z-10 relative">
              <h2 className="text-2xl font-black text-slate-900">TechSummit '26</h2>
              <div className="flex space-x-4 mt-4">
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`text-sm font-bold pb-2 transition-colors ${activeTab === 'schedule' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}
                >
                  Schedule
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`text-sm font-bold pb-2 transition-colors ${activeTab === 'map' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}`}
                >
                  Venue Map
                </button>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
              
              {activeTab === 'schedule' ? (
                <div className="space-y-4">
                  {scheduleData.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex space-x-4 items-center">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-emerald-50 rounded-xl text-emerald-700">
                        <span className="text-xs font-bold">{item.time.split(' ')[0]}</span>
                        <span className="text-[9px] font-black">{item.time.split(' ')[1]}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                          <span className="text-[10px] mr-1">📍</span> {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Proof of cache */}
                  <div className="mt-8 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-full">
                      Last Synced: {lastSync}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-slate-200 rounded-2xl relative overflow-hidden border border-slate-300">
                    {/* Simulated Map rendered from local tiles */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')] bg-cover opacity-50 grayscale"></div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-center z-10">
                      <span className="text-lg block">📍</span>
                      <span className="text-[10px] font-bold text-slate-800">You are here</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 text-xs text-center font-bold text-slate-700">
                      Vector Map Loaded via Cache
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Nav */}
            <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-6">
              <button className="text-emerald-600 flex flex-col items-center">
                <span className="text-lg">📅</span>
                <span className="text-[8px] font-bold mt-1">Event</span>
              </button>
              <button className="text-slate-400 hover:text-slate-600 flex flex-col items-center">
                <span className="text-lg">🤝</span>
                <span className="text-[8px] font-bold mt-1">Network</span>
              </button>
              <button className="text-slate-400 hover:text-slate-600 flex flex-col items-center relative">
                <span className="text-lg">👤</span>
                <span className="text-[8px] font-bold mt-1">Profile</span>
                {networkStatus === 'offline' && <span className="absolute top-0 right-1 w-2 h-2 bg-amber-500 rounded-full border border-white"></span>}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EdgeLocalCache;
