import React, { useState, useEffect } from 'react';

const WearableHealthMonitoring = () => {
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    // Simulate incoming health anomalies
    const timer1 = setTimeout(() => {
      setAlerts(prev => [...prev, {
        id: 1,
        time: '14:22',
        zone: 'Main Stage Mosh Pit',
        anomaly: 'Elevated Heart Rate Cluster (avg 185bpm)',
        severity: 'medium',
        count: 14
      }]);
    }, 2000);
    
    const timer2 = setTimeout(() => {
      setAlerts(prev => [...prev, {
        id: 2,
        time: '14:25',
        zone: 'Outdoor Food Court',
        anomaly: 'High Body Temp Alert (Heat exhaustion risk)',
        severity: 'high',
        count: 3
      }]);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl max-w-2xl mx-auto mt-8 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">❤️‍🩹</span>
          <div>
            <h2 className="text-xl font-bold">Medical Tent Dashboard</h2>
            <p className="text-sm text-gray-400">Wearable Health Anomaly Detection</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wide flex items-center border border-green-500/50">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Apple Health / Google Fit Sync Active
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6 flex justify-between items-center text-sm">
        <span className="text-gray-400">Total Opt-in Attendees: <strong className="text-white">8,402</strong></span>
        <span className="text-gray-400">Status: <strong className="text-green-400">Nominal Baseline</strong></span>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-300 mb-2">Live Anomaly Alerts</h3>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded">
            Monitoring vitals... No anomalies detected.
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border ${
              alert.severity === 'high' ? 'bg-red-900/30 border-red-500/50' : 'bg-yellow-900/30 border-yellow-500/50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                  }`}>
                    {alert.severity === 'high' ? 'CRITICAL' : 'WARNING'}
                  </span>
                  <span className="text-gray-400 text-sm">{alert.time}</span>
                </div>
                <span className="text-xs font-mono bg-black/50 px-2 py-1 rounded text-gray-300">
                  {alert.count} instances
                </span>
              </div>
              <h4 className="font-bold text-lg">{alert.anomaly}</h4>
              <p className="text-sm text-gray-400 mt-1">📍 {alert.zone}</p>
              
              <div className="mt-3 flex space-x-2">
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition">Dispatch EMTs</button>
                <button className="px-3 py-1 border border-gray-600 hover:bg-gray-700 rounded text-sm transition">Dismiss</button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-6 text-center">
        All data is strictly anonymized clusters. No PII is transmitted to the medical dashboard.
      </p>
    </div>
  );
};

export default WearableHealthMonitoring;
