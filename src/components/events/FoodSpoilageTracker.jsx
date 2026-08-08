import React, { useState, useEffect } from 'react';

const FoodSpoilageTracker = () => {
  const [liveMode, setLiveMode] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  
  const [platters, setPlatters] = useState([
    { id: 'p1', name: 'Raw Sushi Bar', location: 'Hall A (South Wall)', baseTemp: 4.2, currentTemp: 4.2, threshold: 8.0, safetyMinutes: 120, remainingMinutes: 120, risk: 'low', type: 'seafood' },
    { id: 'p2', name: 'Artisan Cheese Board', location: 'VIP Lounge', baseTemp: 18.5, currentTemp: 18.5, threshold: 25.0, safetyMinutes: 240, remainingMinutes: 240, risk: 'low', type: 'dairy' },
    { id: 'p3', name: 'Shrimp Cocktail Tower', location: 'Hall B (Center)', baseTemp: 3.5, currentTemp: 3.5, threshold: 6.0, safetyMinutes: 90, remainingMinutes: 90, risk: 'low', type: 'seafood' },
    { id: 'p4', name: 'Vegetable Crudités', location: 'Breakout Room 3', baseTemp: 12.0, currentTemp: 12.0, threshold: 21.0, safetyMinutes: 300, remainingMinutes: 300, risk: 'low', type: 'produce' }
  ]);

  useEffect(() => {
    let interval;
    if (liveMode) {
      interval = setInterval(() => {
        setPlatters(prev => {
          let alertTriggered = null;
          
          const updated = prev.map(platter => {
            // Simulate ambient temperature rising as ice melts/room heats up
            const tempIncrease = Math.random() * (platter.type === 'seafood' ? 0.3 : 0.1);
            const newTemp = platter.currentTemp + tempIncrease;
            
            // Calculate accelerated spoilage based on temperature threshold
            let minuteReduction = 1; // Base normal time passing
            if (newTemp > platter.threshold) {
              minuteReduction = 5; // Degrades 5x faster above safety threshold
            }
            
            const newRemaining = Math.max(0, platter.remainingMinutes - minuteReduction);
            
            let newRisk = 'low';
            if (newRemaining <= 30) newRisk = 'critical';
            else if (newRemaining <= 60) newRisk = 'warning';
            
            // Trigger alert for critical items
            if (newRisk === 'critical' && platter.risk !== 'critical' && !alertTriggered) {
              alertTriggered = platter;
            }
            
            return {
              ...platter,
              currentTemp: newTemp,
              remainingMinutes: newRemaining,
              risk: newRisk
            };
          });
          
          if (alertTriggered) {
            setActiveAlert(alertTriggered);
            // Auto-hide alert after 5s
            setTimeout(() => setActiveAlert(null), 5000);
          }
          
          return updated;
        });
      }, 1000); // Fast simulation (1s = ~1 min)
    }
    return () => clearInterval(interval);
  }, [liveMode]);

  const resetSensors = () => {
    setLiveMode(false);
    setPlatters(platters.map(p => ({
      ...p,
      currentTemp: p.baseTemp,
      remainingMinutes: p.safetyMinutes,
      risk: 'low'
    })));
  };

  const getFormatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌡️</span> IoT Sensor Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Predictive Food <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Spoilage Tracker</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop staff from guessing how long the shrimp has been sitting out. Eventra integrates with wireless temperature sensors placed directly on catering buffets. The predictive engine calculates the exact safe consumption window based on real-time ambient temperatures and food types, alerting logistics teams exactly when to ice, swap, or safely donate platters before they become a liability.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6">
               <div>
                 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Active Buffet Fleet</h3>
                 <span className="text-[10px] text-slate-500 font-mono">Sensors Connected: 4 / 4</span>
               </div>
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSensors}
                   className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                 >
                   Reset Ice
                 </button>
                 <button 
                   onClick={() => setLiveMode(!liveMode)}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     liveMode ? 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200' : 'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {liveMode && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 animate-pulse"></span>}
                   {liveMode ? 'Pause Telemetry' : 'Start Simulation'}
                 </button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {platters.sort((a, b) => a.remainingMinutes - b.remainingMinutes).map(platter => (
                 <div key={platter.id} className={`bg-white border p-4 rounded-2xl relative overflow-hidden transition-all duration-500 ${
                   platter.risk === 'critical' ? 'border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.15)]' :
                   platter.risk === 'warning' ? 'border-amber-300' : 'border-slate-200'
                 }`}>
                   
                   <div className="flex justify-between items-start mb-3 relative z-10">
                     <div>
                       <h4 className="font-bold text-slate-900 leading-tight">{platter.name}</h4>
                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{platter.location}</span>
                     </div>
                     <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                       platter.risk === 'critical' ? 'bg-rose-100 text-rose-700' :
                       platter.risk === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                     }`}>
                       {platter.risk === 'critical' ? 'SPOILAGE IMMINENT' : platter.risk === 'warning' ? 'WARNING ZONE' : 'SAFE'}
                     </span>
                   </div>

                   <div className="grid grid-cols-2 gap-4 relative z-10">
                     {/* Temperature Gauge */}
                     <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                       <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block w-12 leading-tight">Live Temp</span>
                       <div className="text-right flex-1">
                         <span className={`text-xl font-black font-mono transition-colors duration-300 ${platter.currentTemp > platter.threshold ? 'text-rose-500' : 'text-slate-700'}`}>
                           {platter.currentTemp.toFixed(1)}°C
                         </span>
                         <span className="block text-[8px] text-slate-400 font-mono mt-[-2px]">Thresh: {platter.threshold.toFixed(1)}°C</span>
                       </div>
                     </div>
                     
                     {/* Time Gauge */}
                     <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                       <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block w-12 leading-tight">Safe Time</span>
                       <div className="text-right flex-1">
                         <span className={`text-xl font-black font-mono transition-colors duration-300 ${platter.risk === 'critical' ? 'text-rose-500' : platter.risk === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                           {getFormatTime(platter.remainingMinutes)}
                         </span>
                         <span className="block text-[8px] text-slate-400 font-mono mt-[-2px]">Est. Window</span>
                       </div>
                     </div>
                   </div>

                   {/* Dynamic Progress Bar */}
                   <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-100">
                     <div className={`h-full transition-all duration-1000 ${
                       platter.risk === 'critical' ? 'bg-rose-500' : platter.risk === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                     }`} style={{ width: \`\${(platter.remainingMinutes / platter.safetyMinutes) * 100}%\` }}></div>
                   </div>

                 </div>
               ))}
             </div>

          </div>
        </div>

        {/* Right Side: Kitchen Staff App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-950 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-black text-white">Logistics</h2>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Kitchen Staff Comm</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-lg">👨‍🍳</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-black flex flex-col relative overflow-hidden p-4 space-y-4">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500">
                   <span className="text-teal-400 text-xl font-black">4</span>
                 </div>
                 <div>
                   <h4 className="text-white font-bold">Active Sensors</h4>
                   <p className="text-slate-400 text-xs">All telemetry online.</p>
                 </div>
              </div>

              {/* Chat Interface Simulation */}
              <div className="flex-1 overflow-y-auto space-y-4 pt-4 flex flex-col justify-end pb-4">
                
                <div className="self-start max-w-[85%] bg-slate-800 text-white p-3 rounded-2xl rounded-tl-sm text-sm border border-slate-700">
                  Prep complete. All buffets have been deployed to the floor.
                  <span className="block text-[8px] text-slate-400 mt-1 text-right">09:00 AM</span>
                </div>
                
                <div className="self-end max-w-[85%] bg-teal-600 text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-md">
                  Copy that. Sensor mesh is initialized and tracking temperatures.
                  <span className="block text-[8px] text-teal-200 mt-1 text-right">09:02 AM</span>
                </div>

                {liveMode && (
                  <div className="self-start max-w-[85%] bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm border border-slate-700 animate-fade-in-up">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">System</span>
                    </div>
                    Telemetry tracking active. Fast-forwarding simulation...
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Floating OS-Level Alert Simulation */}
        {activeAlert && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm animate-fade-in-up">
            <div className="bg-rose-600/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_50px_rgba(225,29,72,0.5)] border border-rose-400 flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-lg text-white">
                ⚠️
              </div>
              <div className="flex-1">
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Critical Spoilage Alert</h4>
                <p className="text-rose-100 text-xs mb-2">
                  <span className="font-bold">{activeAlert.name}</span> in <span className="font-bold">{activeAlert.location}</span> has exceeded temperature thresholds ({activeAlert.currentTemp.toFixed(1)}°C).
                </p>
                <div className="bg-black/30 rounded p-2 text-[10px] text-white font-mono">
                  ACTION REQUIRED: Apply fresh ice or pull platter in {activeAlert.remainingMinutes} minutes to avoid liability.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FoodSpoilageTracker;
