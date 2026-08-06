import React, { useState, useEffect } from 'react';

const SmartPowerGrid = () => {
  const [powerData, setPowerData] = useState([
    { id: 'Booth A1', usage: 1450, limit: 1500, status: 'warning' },
    { id: 'Booth A2', usage: 420, limit: 1500, status: 'normal' },
    { id: 'Main Stage', usage: 8900, limit: 10000, status: 'normal' },
    { id: 'Food Court', usage: 4100, limit: 4000, status: 'critical' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPowerData(prev => prev.map(booth => {
        const fluctuation = Math.floor(Math.random() * 100) - 40;
        const newUsage = Math.max(0, booth.usage + fluctuation);
        let status = 'normal';
        if (newUsage > booth.limit) status = 'critical';
        else if (newUsage > booth.limit * 0.9) status = 'warning';
        return { ...booth, usage: newUsage, status };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl max-w-3xl mx-auto mt-8 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Intelligent Power Management</h2>
          <p className="text-gray-400 text-sm">Real-time venue grid API integration</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Venue Draw</p>
          <p className="text-2xl font-mono text-blue-400 font-bold">14.8 kW</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <h3 className="font-semibold text-gray-300 mb-3">Live Circuit Monitoring</h3>
        <div className="space-y-4">
          {powerData.map((booth, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="w-1/4">
                <span className="font-medium">{booth.id}</span>
              </div>
              <div className="w-1/2 px-4">
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      booth.status === 'critical' ? 'bg-red-500' : booth.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (booth.usage / booth.limit) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-1/4 text-right">
                <span className="font-mono text-sm">{booth.usage}W / {booth.limit}W</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
          <h4 className="font-bold text-red-400 text-sm mb-2">Automated Throttling</h4>
          <p className="text-xs text-gray-400 mb-3">Non-essential systems in critical zones are automatically dimmed to prevent breakers from tripping.</p>
          <button className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white text-xs font-bold rounded">View Throttled Systems</button>
        </div>
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
          <h4 className="font-bold text-blue-400 text-sm mb-2">Vendor Billing Export</h4>
          <p className="text-xs text-gray-400 mb-3">Exact kilowatt-hour usage is tracked per booth for accurate post-event billing.</p>
          <button className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs font-bold rounded">Generate Invoice CSV</button>
        </div>
      </div>
    </div>
  );
};

export default SmartPowerGrid;
