import React, { useState, useEffect } from 'react';

const KineticEnergyHarvesting = () => {
  const [liveMode, setLiveMode] = useState(false);
  const [totalEnergy, setTotalEnergy] = useState(48250); // Watt-hours
  const [zones, setZones] = useState([
    { id: 'Z1', name: 'Front Pit Left', currentWattage: 0, totalGenerated: 15400, color: 'from-amber-400 to-orange-500' },
    { id: 'Z2', name: 'Front Pit Right', currentWattage: 0, totalGenerated: 16200, color: 'from-orange-500 to-rose-500' },
    { id: 'Z3', name: 'Mid Floor', currentWattage: 0, totalGenerated: 9850, color: 'from-emerald-400 to-teal-500' },
    { id: 'Z4', name: 'Back Floor', currentWattage: 0, totalGenerated: 6800, color: 'from-sky-400 to-blue-500' }
  ]);

  useEffect(() => {
    let interval;
    if (liveMode) {
      interval = setInterval(() => {
        setZones(prevZones => 
          prevZones.map(zone => {
            // Simulate dynamic crowd jumping
            const isJumping = Math.random() > 0.3;
            const newWattage = isJumping ? Math.floor(Math.random() * 4000) + 1000 : Math.floor(Math.random() * 500);
            
            // Accumulate total
            setTotalEnergy(prev => prev + (newWattage / 3600)); // Rough Wh calculation per second
            
            return {
              ...zone,
              currentWattage: newWattage,
              totalGenerated: zone.totalGenerated + (newWattage / 3600)
            };
          })
        );
      }, 1000); // Update every second
    } else {
      // Reset wattage when off
      setZones(prevZones => prevZones.map(z => ({ ...z, currentWattage: 0 })));
    }
    
    return () => clearInterval(interval);
  }, [liveMode]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Master Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/50 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Sustainability IoT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic Energy <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">Harvesting Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Actively offset the massive carbon footprint of mega-concerts. Eventra integrates directly with smart kinetic dance floors (e.g., Pavegen). The telemetry engine ingests piezoelectric floor data in real-time, displaying a live leaderboard to gamify energy production. See exactly which crowd zones are generating the most wattage to power the stage lighting.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Telemetry Dashboard</h3>
               
               <button 
                 onClick={() => setLiveMode(!liveMode)}
                 className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center ${
                   liveMode ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                 }`}
               >
                 {liveMode && <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 animate-pulse"></span>}
                 {liveMode ? 'Stop Telemetry' : 'Begin Ingestion'}
               </button>
             </div>

             <div className="flex justify-between items-end mb-8 bg-black/50 p-4 rounded-xl border border-slate-800">
               <div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Offset Generated</span>
                 <div className="flex items-baseline space-x-2">
                   <span className="text-4xl font-black text-white font-mono">{Math.floor(totalEnergy).toLocaleString()}</span>
                   <span className="text-sm font-bold text-amber-500">Watt-hours (Wh)</span>
                 </div>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Equivalent To</span>
                 <span className="text-lg font-bold text-emerald-400">🔋 {Math.floor(totalEnergy / 10)} Stage Lights</span>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               {[...zones].sort((a, b) => b.currentWattage - a.currentWattage).map((zone, index) => (
                 <div key={zone.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center relative overflow-hidden">
                   
                   {/* Dynamic Background Bar */}
                   <div 
                     className={`absolute top-0 left-0 h-full bg-gradient-to-r ${zone.color} opacity-10 transition-all duration-300`}
                     style={{ width: \`\${(zone.currentWattage / 5000) * 100}%\` }}
                   ></div>
                   
                   <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center font-black text-slate-500 mr-4 z-10">
                     #{index + 1}
                   </div>
                   
                   <div className="flex-1 z-10">
                     <h4 className="font-bold text-white text-sm">{zone.name}</h4>
                     <p className="text-[10px] text-slate-500 font-mono">Total: {Math.floor(zone.totalGenerated).toLocaleString()} Wh</p>
                   </div>
                   
                   <div className="text-right z-10">
                     <span className={`text-xl font-black font-mono transition-colors duration-300 ${zone.currentWattage > 3000 ? 'text-rose-400' : zone.currentWattage > 1000 ? 'text-amber-400' : 'text-slate-400'}`}>
                       {zone.currentWattage} W
                     </span>
                   </div>
                 </div>
               ))}
             </div>

          </div>
        </div>

        {/* Right Side: Jumbo Screen Gamification (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          
          <div className="w-full bg-black rounded-3xl border-8 border-slate-900 shadow-2xl relative flex flex-col aspect-[4/3] overflow-hidden">
            
            {/* Stage Jumbo Screen Simulator */}
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470229722913-7c090be5c520?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 filter contrast-125"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col p-6 items-center justify-center text-center">
              
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-6 tracking-widest shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse">
                Live Stage Leaderboard
              </span>

              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Make Some Noise</h2>
              <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-8">Power The Main Stage Lights!</p>

              <div className="w-full max-w-sm space-y-4">
                
                {/* Visualizer Bars */}
                <div className="flex items-end justify-center h-32 space-x-2 border-b-2 border-slate-800 pb-2">
                  {zones.map(zone => (
                     <div key={zone.id} className="w-16 flex flex-col items-center">
                       <span className="text-[10px] text-white font-mono mb-1">{zone.currentWattage}w</span>
                       <div 
                         className={`w-full bg-gradient-to-t ${zone.color} rounded-t transition-all duration-[800ms]`}
                         style={{ 
                           height: liveMode ? \`\${Math.max(10, (zone.currentWattage / 5000) * 100)}%\` : '10%',
                           boxShadow: zone.currentWattage > 3000 ? '0 0 20px rgba(245,158,11,0.6)' : 'none'
                         }}
                       ></div>
                       <span className="text-[8px] font-bold text-slate-400 uppercase mt-2 w-full truncate px-1 text-center">{zone.name}</span>
                     </div>
                  ))}
                </div>
                
              </div>

              {liveMode && (
                <div className="mt-8 bg-black/60 backdrop-blur border border-white/10 px-6 py-3 rounded-xl animate-fade-in-up">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Winning Zone</span>
                  <span className="text-lg font-black text-white">
                    {zones.reduce((max, z) => max.currentWattage > z.currentWattage ? max : z).name}
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default KineticEnergyHarvesting;
