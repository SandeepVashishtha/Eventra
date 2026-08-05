import React, { useState, useEffect } from 'react';

const SponsorGazeTracking = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveGazeCount, setLiveGazeCount] = useState(142);
  const [gazeHistory, setGazeHistory] = useState([20, 35, 45, 60, 50, 70, 85, 110, 95, 130, 120, 142]);

  // Simulate real-time gaze tracking data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGazeCount(prev => {
        const fluctuation = Math.floor(Math.random() * 15) - 5; // -5 to +10
        const newCount = Math.max(0, prev + fluctuation);
        
        setGazeHistory(history => {
          const newHistory = [...history, newCount];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
        
        return newCount;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...gazeHistory, 150);

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center text-white">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-purple-500/30 flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1.5 animate-pulse"></span>
                Webcam AI Active
              </span>
              <h1 className="text-3xl font-black text-white">Sponsor ROI Dashboard</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">Stop relying on vanity metrics. Track "True Attention" via opt-in anonymized gaze tracking to prove exact brand exposure during virtual sessions.</p>
          </div>
          
          <div className="mt-6 md:mt-0 flex space-x-2">
            <button className="bg-slate-900 text-slate-300 font-bold px-4 py-2 rounded-xl shadow-sm border border-slate-700 hover:bg-slate-700 transition">
              Export PDF
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Page Views (Legacy)</p>
            <p className="text-3xl font-black text-white">12,450</p>
            <p className="text-xs text-slate-500 mt-2">Opened the tab</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">True Attention Views</p>
            <p className="text-3xl font-black text-purple-400">8,214</p>
            <p className="text-xs text-slate-500 mt-2">Actually looked at banner</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Avg. Gaze Duration</p>
            <p className="text-3xl font-black text-emerald-400">4.2s</p>
            <p className="text-xs text-slate-500 mt-2">+1.5s vs industry avg</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">CTR</p>
            <p className="text-3xl font-black text-blue-400">6.8%</p>
            <p className="text-xs text-slate-500 mt-2">From True Attention pool</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col h-[450px]">
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-white">Live Attention Flow (Keynote Room)</h2>
              <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Live Viewers: {liveGazeCount}</span>
              </div>
            </div>

            {/* Simulated Live Chart */}
            <div className="flex-1 relative border-l border-b border-slate-700 p-2 flex items-end justify-between space-x-1">
              
              {/* Y-Axis Labels */}
              <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[10px] text-slate-500">
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 border-t border-slate-700/50" style={{ top: '33%' }}></div>
              <div className="absolute inset-0 border-t border-slate-700/50" style={{ top: '66%' }}></div>

              {/* Bars */}
              {gazeHistory.map((val, i) => (
                <div key={i} className="flex-1 relative group h-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-sm transition-all duration-500 relative"
                    style={{ height: `${(val / maxValue) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap transition-opacity z-10 border border-slate-700 shadow-lg">
                    {val} eyes on banner
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-2 text-[10px] text-slate-500">
              <span>T - 1 Min</span>
              <span>Now</span>
            </div>

          </div>

          {/* Right Column: Asset Performance */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl h-[450px] flex flex-col">
              <h3 className="font-bold text-white mb-6 border-b border-slate-700 pb-2">Top Performing Assets</h3>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                
                {/* Asset 1 */}
                <div className="bg-slate-900 p-4 rounded-xl border border-purple-500/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                  <h4 className="font-bold text-slate-200 text-sm mb-1">Sidebar Banner A</h4>
                  <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest">Placement: Keynote Room</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black text-white">4.8s</p>
                      <p className="text-[10px] text-emerald-400 font-bold">Avg. Dwell Time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-300">4,210</p>
                      <p className="text-[10px] text-slate-500">Total Gazes</p>
                    </div>
                  </div>
                </div>

                {/* Asset 2 */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 relative overflow-hidden hover:border-slate-600 transition">
                  <h4 className="font-bold text-slate-200 text-sm mb-1">Pre-Roll Video</h4>
                  <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest">Placement: Track 2 Breakout</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black text-white">12.1s</p>
                      <p className="text-[10px] text-emerald-400 font-bold">Avg. Dwell Time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-300">1,845</p>
                      <p className="text-[10px] text-slate-500">Total Gazes</p>
                    </div>
                  </div>
                </div>

                {/* Asset 3 */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 relative overflow-hidden hover:border-slate-600 transition">
                  <h4 className="font-bold text-slate-200 text-sm mb-1">Lower Third Logo</h4>
                  <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest">Placement: Workshop B</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black text-white">1.2s</p>
                      <p className="text-[10px] text-emerald-400 font-bold">Avg. Dwell Time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-300">8,920</p>
                      <p className="text-[10px] text-slate-500">Total Gazes</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SponsorGazeTracking;
