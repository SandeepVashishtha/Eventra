import React, { useState, useEffect } from 'react';

const CrowdDensityHeatmap = () => {
  const [activeZone, setActiveZone] = useState('All');
  
  // Simulated IoT sensor data for different zones
  const [zones, setZones] = useState([
    { id: 1, name: 'Main Keynote Stage', density: 95, status: 'Critical Bottleneck', x: 20, y: 30, size: 'w-48 h-32' },
    { id: 2, name: 'Expo Hall A (Sponsors)', density: 65, status: 'Moderate', x: 60, y: 15, size: 'w-32 h-40' },
    { id: 3, name: 'Dining Area', density: 85, status: 'High Volume', x: 15, y: 70, size: 'w-40 h-24' },
    { id: 4, name: 'Breakout Rooms', density: 30, status: 'Optimal', x: 70, y: 65, size: 'w-24 h-24' },
    { id: 5, name: 'Entrance Hall', density: 45, status: 'Flowing', x: 45, y: 85, size: 'w-20 h-20' }
  ]);

  // Simulate real-time WebRTC updates
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prevZones => 
        prevZones.map(zone => {
          // Add some random fluctuation (-5 to +5)
          const fluctuation = Math.floor(Math.random() * 11) - 5;
          const newDensity = Math.max(10, Math.min(100, zone.density + fluctuation));
          
          let newStatus = 'Optimal';
          if (newDensity > 90) newStatus = 'Critical Bottleneck';
          else if (newDensity > 75) newStatus = 'High Volume';
          else if (newDensity > 50) newStatus = 'Moderate';
          else if (newDensity < 40 && zone.name === 'Entrance Hall') newStatus = 'Flowing';

          return { ...zone, density: newDensity, status: newStatus };
        })
      );
    }, 2000); // 2 second ping rate
    return () => clearInterval(interval);
  }, []);

  const getHeatColor = (density) => {
    if (density > 90) return 'bg-red-500/80 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.7)]';
    if (density > 75) return 'bg-orange-500/70 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]';
    if (density > 50) return 'bg-yellow-400/60 border-yellow-300';
    return 'bg-emerald-400/50 border-emerald-300';
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse">Live WebRTC</span>
              <h1 className="text-2xl font-black text-white">Crowd Density Heatmap</h1>
            </div>
            <p className="text-slate-400 text-sm">IoT WiFi Triangulation Dashboard for Venue Safety & Layout Optimization.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setActiveZone('All')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeZone === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Floor 1 Overview
            </button>
            <button className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 cursor-not-allowed">
              Floor 2 (Locked)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Map View */}
          <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4 z-10 relative">
              <h2 className="text-lg font-bold text-white">Moscone Center - South Hall</h2>
              <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
                <span className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> &gt; 90% (Critical)</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div> 75-90%</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div> 50-75%</span>
                <span className="flex items-center"><div className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></div> &lt; 50%</span>
              </div>
            </div>

            {/* The Blueprint Map Area */}
            <div className="flex-1 bg-slate-900 rounded-2xl border-2 border-slate-700 relative overflow-hidden">
              {/* Blueprint Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              {/* Render Heatmap Zones */}
              {zones.map((zone) => (
                <div 
                  key={zone.id}
                  className={`absolute rounded-xl border-2 transition-colors duration-1000 ease-in-out flex flex-col items-center justify-center p-2 backdrop-blur-sm ${getHeatColor(zone.density)} ${zone.size}`}
                  style={{ top: `${zone.y}%`, left: `${zone.x}%` }}
                >
                  <span className="text-white font-black text-xl drop-shadow-md">{zone.density}%</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center drop-shadow-md truncate w-full">{zone.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
            
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1 overflow-y-auto">
              <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Active Alerts & Dispatch</h3>
              
              <div className="space-y-4">
                {zones.sort((a, b) => b.density - a.density).map((zone) => (
                  <div key={zone.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-200 text-sm">{zone.name}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${zone.density > 90 ? 'bg-red-500/20 text-red-400 border-red-500/30' : zone.density > 75 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                        {zone.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${zone.density > 90 ? 'bg-red-500' : zone.density > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${zone.density}%` }}></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{zone.density}% Vol</span>
                    </div>

                    {zone.density > 90 && (
                      <button className="w-full mt-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        Dispatch Crowd Control Staff
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CrowdDensityHeatmap;
