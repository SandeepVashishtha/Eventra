import React, { useState, useEffect } from 'react';

const SponsorFootfallAnalytics = () => {
  const [liveFootfall, setLiveFootfall] = useState(42);
  const [avgDwellTime, setAvgDwellTime] = useState(8.4); // minutes

  // Simulate real-time BLE beacon data
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFootfall(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(0, prev + change);
      });
      
      setAvgDwellTime(prev => {
        const change = (Math.random() * 0.4) - 0.2;
        return Math.max(1, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900">Acme Corp ROI Dashboard</h1>
              <span className="bg-blue-100 text-blue-700 text-xs font-black uppercase px-2 py-1 rounded border border-blue-200 tracking-wider">
                Diamond Sponsor
              </span>
            </div>
            <p className="text-slate-500 font-medium">Real-time spatial engagement and BLE footfall metrics.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>BLE Beacons Active</span>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded-lg shadow transition">
              Export PDF Report
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Live Booth Traffic</p>
            <div className="flex items-baseline space-x-2 relative z-10">
              <h2 className="text-4xl font-black text-blue-600">{liveFootfall}</h2>
              <span className="text-sm font-bold text-slate-400">attendees</span>
            </div>
            <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center">
              <span className="mr-1">↑</span> 12% vs hourly avg
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Impressions (Passive)</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-4xl font-black text-slate-800">14.2k</h2>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">Walked within 50ft of booth</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Engagements (Active)</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-4xl font-black text-slate-800">3,104</h2>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">Dwell time > 2 minutes</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Avg. Dwell Time</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-4xl font-black text-slate-800">{avgDwellTime.toFixed(1)}</h2>
              <span className="text-sm font-bold text-slate-400">mins</span>
            </div>
            <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center">
              <span className="mr-1">↓</span> 2% vs yesterday
            </p>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Spatial Heatmap Simulation */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Booth Spatial Heatmap</h3>
              <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg px-3 py-1 outline-none">
                <option>Today (Live)</option>
                <option>Yesterday</option>
                <option>Cumulative</option>
              </select>
            </div>
            
            <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative min-h-[300px]">
              {/* Floorplan grid simulation */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              
              {/* Booth structural elements */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-48 border-2 border-slate-600 rounded-sm bg-slate-800/50 flex flex-col items-center justify-center">
                <span className="text-slate-500 font-bold text-2xl tracking-widest uppercase">Acme Corp</span>
                
                {/* Heat zones */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/80 rounded-full blur-2xl transform translate-x-4 -translate-y-4 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-400/70 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Traffic Density</p>
                <div className="w-32 h-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Side Panel: Demographics & Peak Times */}
          <div className="lg:col-span-1 space-y-8">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Peak Engagement Hours</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>10:00 AM - 11:00 AM</span>
                    <span>1,204 visitors</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>01:00 PM - 02:00 PM</span>
                    <span>845 visitors</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>03:00 PM - 04:00 PM</span>
                    <span>412 visitors</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-300 h-full rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Top Attendee Personas</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Based on profiles of users who dwelled &gt; 2 mins.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Software Engineers</span>
                  <span className="text-sm font-black text-slate-900">42%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Product Managers</span>
                  <span className="text-sm font-black text-slate-900">28%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">CTO / VP Eng</span>
                  <span className="text-sm font-black text-slate-900">15%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorFootfallAnalytics;
