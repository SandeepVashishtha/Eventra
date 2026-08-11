import React, { useState, useEffect } from 'react';

const VendorInventoryPrediction = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(14); // 14:00 (2 PM)
  
  // Real-time Inputs for the AI
  const [weather, setWeather] = useState({ temp: 85, condition: 'Sunny' });
  const [gateVelocity, setGateVelocity] = useState(1200); // scans per hour
  
  // Vendor Inventory Items
  const [inventory, setInventory] = useState([
    { id: 'I1', name: 'Wagyu Smashburgers', currentPrep: 450, predictedDemand: 450, status: 'optimal' },
    { id: 'I2', name: 'Cold Brew Iced Coffee', currentPrep: 800, predictedDemand: 800, status: 'optimal' },
    { id: 'I3', name: 'Hot Truffle Soup', currentPrep: 150, predictedDemand: 150, status: 'optimal' }
  ]);

  const [aiAlert, setAiAlert] = useState(null);

  useEffect(() => {
    let clockInterval;
    
    if (engineActive) {
      clockInterval = setInterval(() => {
        setTimeOfDay(prev => {
          const newTime = prev + 1;
          
          if (newTime === 16) { // 4 PM - Weather shift
            setWeather({ temp: 62, condition: 'Heavy Rain' });
            setGateVelocity(400); // People stop coming in
            
            // AI recalculates
            setInventory([
              { id: 'I1', name: 'Wagyu Smashburgers', currentPrep: 450, predictedDemand: 200, status: 'over-prepped' },
              { id: 'I2', name: 'Cold Brew Iced Coffee', currentPrep: 800, predictedDemand: 150, status: 'critical-waste' },
              { id: 'I3', name: 'Hot Truffle Soup', currentPrep: 150, predictedDemand: 600, status: 'under-prepped' }
            ]);
            
            setAiAlert("MASSIVE DEMAND SHIFT: Stop prepping iced coffee immediately to prevent 650 units of waste. Pivot all staff to hot soup.");
          }
          
          if (newTime >= 22) { // 10 PM
            clearInterval(clockInterval);
            setEngineActive(false);
          }
          
          return newTime;
        });
      }, 3000); // 3 seconds = 1 hour simulation
    }
    
    return () => clearInterval(clockInterval);
  }, [engineActive]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Sustainability AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Zero-Waste Inventory <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Prediction Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Food vendors at multi-day festivals often throw away thousands of pounds of perishable food due to inaccurate gut-feeling demand forecasting. Eventra's AI prediction engine analyzes live weather telemetry, real-time gate scan velocity, and historical consumption rates. It predicts exactly how many units of specific foods need to be prepped per hour, alerting kitchens instantly to scale down and prevent massive environmental waste.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🧠</span> AI Engine Telemetry
               </h3>
               
               <button 
                 onClick={() => {
                   setEngineActive(!engineActive);
                   if(!engineActive) {
                     setTimeOfDay(14);
                     setWeather({ temp: 85, condition: 'Sunny' });
                     setGateVelocity(1200);
                     setAiAlert(null);
                     setInventory([
                       { id: 'I1', name: 'Wagyu Smashburgers', currentPrep: 450, predictedDemand: 450, status: 'optimal' },
                       { id: 'I2', name: 'Cold Brew Iced Coffee', currentPrep: 800, predictedDemand: 800, status: 'optimal' },
                       { id: 'I3', name: 'Hot Truffle Soup', currentPrep: 150, predictedDemand: 150, status: 'optimal' }
                     ]);
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   engineActive ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                 }`}
               >
                 {engineActive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>}
                 {engineActive ? 'Simulation Running...' : 'Start Time-Lapse (2PM - 10PM)'}
               </button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Live Weather API</span>
                 <span className="text-lg font-black text-slate-700 flex items-center">
                   {weather.condition === 'Sunny' ? '☀️' : '🌧️'} {weather.temp}°F
                 </span>
               </div>
               
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Gate Velocity</span>
                 <span className="text-lg font-black text-slate-700 font-mono">
                   {gateVelocity} <span className="text-[9px]">scans/hr</span>
                 </span>
               </div>
               
               <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Time of Day</span>
                 <span className="text-2xl font-black text-white font-mono">
                   {timeOfDay}:00
                 </span>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Vendor: The Gourmet Truck</span>
               
               {inventory.map((item) => (
                 <div key={item.id} className={`p-3 rounded-xl relative overflow-hidden flex items-center border transition-colors duration-500 ${
                   item.status === 'critical-waste' ? 'bg-rose-50 border-rose-200' :
                   item.status === 'under-prepped' ? 'bg-amber-50 border-amber-200' :
                   item.status === 'over-prepped' ? 'bg-orange-50 border-orange-200' :
                   'bg-white border-slate-200'
                 }`}>
                   
                   <div className="flex-1">
                     <span className="text-slate-900 font-bold text-sm block">{item.name}</span>
                     
                     <div className="flex items-center space-x-4 mt-2">
                       <div>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">Current Prep</span>
                         <span className="block font-mono font-black text-slate-700">{item.currentPrep}</span>
                       </div>
                       <div className="text-xl text-slate-300">→</div>
                       <div>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">AI Prediction</span>
                         <span className={`block font-mono font-black ${
                           item.status === 'critical-waste' ? 'text-rose-600' :
                           item.status === 'under-prepped' ? 'text-amber-600' : 'text-emerald-600'
                         }`}>{item.predictedDemand}</span>
                       </div>
                     </div>
                   </div>

                   <div className="w-32 text-right">
                     <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                         item.status === 'critical-waste' ? 'bg-rose-100 text-rose-700' :
                         item.status === 'under-prepped' ? 'bg-amber-100 text-amber-700' :
                         item.status === 'over-prepped' ? 'bg-orange-100 text-orange-700' :
                         'bg-emerald-100 text-emerald-700'
                       }`}>
                       {item.status.replace('-', ' ')}
                     </span>
                     
                     {item.status === 'critical-waste' && (
                       <span className="block text-[10px] text-rose-500 font-bold mt-2">
                         POTENTIAL WASTE: {item.currentPrep - item.predictedDemand} units
                       </span>
                     )}
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
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20 bg-slate-900">
              <span>{timeOfDay}:00</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
              <div>
                <h2 className="text-xl font-black text-white">Kitchen Display System</h2>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">The Gourmet Truck</span>
              </div>
            </div>

            {/* Mobile Content Foreground */}
            <div className="relative flex-1 flex flex-col p-4 z-10 bg-black overflow-y-auto">
              
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
                <h4 className="text-white font-bold mb-3 border-b border-slate-700 pb-2">Active Prep Tickets</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Wagyu Smashburgers</span>
                    <span className="bg-slate-700 text-white font-mono text-xs px-2 py-1 rounded">450 x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Cold Brew Iced Coffee</span>
                    <span className="bg-slate-700 text-white font-mono text-xs px-2 py-1 rounded">800 x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Hot Truffle Soup</span>
                    <span className="bg-slate-700 text-white font-mono text-xs px-2 py-1 rounded">150 x</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Push Notification Simulation */}
              {aiAlert && (
                <div className="bg-rose-900/90 backdrop-blur border border-rose-500 rounded-2xl p-5 shadow-2xl animate-fade-in-up mt-auto mb-4 relative overflow-hidden">
                  
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-400 animate-pulse"></div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl mt-1">⚠️</div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">AI Predictive Alert</h4>
                      <p className="text-rose-100 text-xs leading-relaxed mb-4 font-bold">
                        {aiAlert}
                      </p>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition">
                          Acknowledge & Adjust
                        </button>
                      </div>
                    </div>
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

export default VendorInventoryPrediction;
