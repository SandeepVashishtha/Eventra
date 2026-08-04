import React, { useState, useEffect } from 'react';

const CrowdDensityAlerting = () => {
  const [zones, setZones] = useState([
    { id: 'Z1', name: 'Main Stage General Admission', capacity: 5000, current: 3200, status: 'normal' },
    { id: 'Z2', name: 'Food Court Area B', capacity: 1500, current: 800, status: 'normal' },
    { id: 'Z3', name: 'North Exit Hallway', capacity: 800, current: 750, status: 'warning' },
    { id: 'Z4', name: 'VIP Lounge', capacity: 400, current: 150, status: 'normal' }
  ]);

  const [alerts, setAlerts] = useState([]);
  const [simulatorActive, setSimulatorActive] = useState(true);

  useEffect(() => {
    if (!simulatorActive) return;

    const interval = setInterval(() => {
      setZones(prevZones => {
        let newAlerts = [...alerts];
        
        const updatedZones = prevZones.map(zone => {
          // Simulate random crowd movement (-10% to +15% change)
          const change = Math.floor(zone.capacity * (Math.random() * 0.25 - 0.10));
          const newCurrent = Math.max(0, zone.current + change);
          const density = newCurrent / zone.capacity;
          
          let newStatus = 'normal';
          if (density > 0.95) {
            newStatus = 'critical';
            // Generate alert if critical
            if (zone.status !== 'critical') {
              newAlerts.unshift({
                id: Date.now(),
                zone: zone.name,
                message: `CRITICAL: Capacity exceeded (${Math.round(density * 100)}%). Dispatching crowd control.`,
                time: new Date().toLocaleTimeString(),
                type: 'danger'
              });
            }
          } else if (density > 0.80) {
            newStatus = 'warning';
          }

          return { ...zone, current: newCurrent, status: newStatus };
        });

        if (newAlerts.length > alerts.length) {
          setAlerts(newAlerts.slice(0, 5)); // Keep last 5 alerts
        }
        
        return updatedZones;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [simulatorActive, alerts]);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-2xl max-w-5xl mx-auto mt-8 border border-slate-700 flex flex-col md:flex-row gap-6">
      
      {/* Heatmap & Zones Dashboard */}
      <div className="w-full md:w-2/3 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
              Crowd Density Heatmap
            </h2>
            <p className="text-sm text-slate-400 mt-1">Live BLE/WiFi triangulation & automated telemetry alerting.</p>
          </div>
          <button 
            onClick={() => setSimulatorActive(!simulatorActive)}
            className={`px-3 py-1.5 text-xs font-bold rounded border transition ${simulatorActive ? 'bg-rose-900/50 border-rose-500 text-rose-400' : 'bg-emerald-900/50 border-emerald-500 text-emerald-400'}`}
          >
            {simulatorActive ? 'Pause Telemetry' : 'Resume Telemetry'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {zones.map(zone => {
            const densityPercent = Math.min(100, (zone.current / zone.capacity) * 100);
            
            return (
              <div key={zone.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 relative overflow-hidden transition-colors duration-500">
                {zone.status === 'critical' && (
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-200">{zone.name}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${zone.status === 'critical' ? 'bg-rose-900/80 text-rose-400 border-rose-500' : zone.status === 'warning' ? 'bg-orange-900/80 text-orange-400 border-orange-500' : 'bg-emerald-900/80 text-emerald-400 border-emerald-500'}`}>
                    {zone.status}
                  </span>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-black font-mono tracking-tighter">
                      {zone.current.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Devices</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-400">/ {zone.capacity.toLocaleString()}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                  <div 
                    className={`h-full transition-all duration-1000 ${zone.status === 'critical' ? 'bg-rose-500' : zone.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${densityPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Alerting Panel */}
      <div className="w-full md:w-1/3 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-300">Automated Dispatch Alerts</h3>
          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
              <span className="text-3xl mb-2">🛡️</span>
              <p className="text-sm font-medium">All zones nominal.<br/>Monitoring for capacity breaches...</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-lg animate-fade-in">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-rose-400 uppercase">{alert.zone}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                </div>
                <p className="text-sm text-slate-300 leading-tight">{alert.message}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold py-1.5 rounded transition">
                    Acknowledge
                  </button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold py-1.5 rounded transition">
                    View Cameras
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default CrowdDensityAlerting;
