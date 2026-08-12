import React, { useState, useEffect } from 'react';

const SponsorDwellTimeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Simulate loading RFID/BLE tracking data
    const timer = setTimeout(() => {
      setMetrics({
        totalImpressions: 4892,
        uniqueVisitors: 1245,
        avgDwellTime: '4m 12s',
        peakHour: '01:30 PM',
        heatmapZones: [
          { name: 'Demo Kiosk A', intensity: 85, color: 'bg-red-500' },
          { name: 'Swag Table', intensity: 92, color: 'bg-red-600' },
          { name: 'Product Display', intensity: 45, color: 'bg-yellow-400' },
          { name: 'Lounge Area', intensity: 20, color: 'bg-green-400' }
        ]
      });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl max-w-4xl mx-auto mt-8 border-t-8 border-purple-600">
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sponsor ROI & Traffic Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Passive BLE/RFID tracking for booth engagement.</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-sm">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
          Live Tracking Active
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-50 rounded-xl p-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-600 font-bold">Aggregating BLE Beacon Data...</h3>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Impressions</p>
              <p className="text-3xl font-black text-gray-800">{metrics.totalImpressions}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Unique Visitors</p>
              <p className="text-3xl font-black text-purple-600">{metrics.uniqueVisitors}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center shadow-sm">
              <p className="text-xs text-purple-500 font-bold uppercase tracking-wider mb-1">Avg. Dwell Time</p>
              <p className="text-3xl font-black text-purple-700">{metrics.avgDwellTime}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Peak Traffic</p>
              <p className="text-3xl font-black text-gray-800">{metrics.peakHour}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heatmap Visualization */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">🔥</span> Booth Heatmap Zones
              </h3>
              <div className="space-y-4">
                {metrics.heatmapZones.map((zone, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-gray-700">{zone.name}</span>
                      <span className="text-gray-500">{zone.intensity}% Activity</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${zone.color}`} style={{ width: `${zone.intensity}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Insights */}
            <div className="bg-gray-900 text-white border border-gray-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-purple-400 mb-3 flex items-center">
                  <span className="text-xl mr-2">💡</span> AI Insights
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">➜</span>
                    The Swag Table generates 92% of traffic, but Demo Kiosk A holds visitors 3x longer.
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">➜</span>
                    Consider moving the Swag Table closer to Demo Kiosk B to balance foot traffic.
                  </li>
                </ul>
              </div>
              <button className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition">
                Export ROI Report (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorDwellTimeDashboard;
