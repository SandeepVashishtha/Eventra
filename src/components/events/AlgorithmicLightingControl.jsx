import React, { useState, useEffect } from 'react';

const AlgorithmicLightingControl = () => {
  const [automationActive, setAutomationActive] = useState(false);
  const [powerSaved, setPowerSaved] = useState(24.5); // kWh
  
  // DMX Zones mapped to hall
  const [zones, setZones] = useState([
    { id: 'Z1', name: 'Aisle A (Entrance)', crowdLevel: 85, targetDim: 100, currentDim: 100 },
    { id: 'Z2', name: 'Aisle B (Food)', crowdLevel: 92, targetDim: 100, currentDim: 100 },
    { id: 'Z3', name: 'Aisle C (B2B)', crowdLevel: 20, targetDim: 60, currentDim: 100 },
    { id: 'Z4', name: 'Aisle D (Empty)', crowdLevel: 5, targetDim: 40, currentDim: 100 },
    { id: 'Z5', name: 'Lounge Area', crowdLevel: 45, targetDim: 75, currentDim: 100 },
    { id: 'Z6', name: 'Tech Stage', crowdLevel: 98, targetDim: 100, currentDim: 100 }
  ]);

  useEffect(() => {
    let dmxInterval;
    let crowdInterval;
    
    if (automationActive) {
      // Simulate slow DMX fading towards targets
      dmxInterval = setInterval(() => {
        setZones(prev => prev.map(zone => {
          let newDim = zone.currentDim;
          if (Math.abs(newDim - zone.targetDim) < 2) {
            newDim = zone.targetDim;
          } else if (newDim > zone.targetDim) {
            newDim -= 2;
          } else if (newDim < zone.targetDim) {
            newDim += 2;
          }
          return { ...zone, currentDim: newDim };
        }));
        
        // Calculate power savings based on how much the lights are dimmed globally
        setPowerSaved(prev => prev + 0.05);
      }, 200);

      // Simulate crowds moving around the venue every few seconds
      crowdInterval = setInterval(() => {
        setZones(prev => prev.map(zone => {
          // Add some randomness to crowd density
          let newCrowd = Math.max(0, Math.min(100, zone.crowdLevel + (Math.random() * 30 - 15)));
          
          // Calculate new target dim based on crowd
          // Base 40%, plus up to 60% depending on crowd
          let newTarget = 40 + (newCrowd * 0.6);
          // Snap high crowd to 100%
          if (newCrowd > 70) newTarget = 100;
          
          return { ...zone, crowdLevel: newCrowd, targetDim: newTarget };
        }));
      }, 3000);
      
    } else {
      // Restore to 100% manual override
      dmxInterval = setInterval(() => {
        setZones(prev => {
          let allMax = true;
          const updated = prev.map(zone => {
            let newDim = zone.currentDim;
            if (newDim < 100) {
              newDim += 5;
              allMax = false;
            }
            if (newDim > 100) newDim = 100;
            return { ...zone, currentDim: newDim, targetDim: 100 };
          });
          
          if (allMax) clearInterval(dmxInterval);
          return updated;
        });
      }, 100);
    }
    
    return () => {
      clearInterval(dmxInterval);
      clearInterval(crowdInterval);
    };
  }, [automationActive]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Infrastructure (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💡</span> Venue Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Algorithmic Lighting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Control System</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Stop blasting exhibition halls with 100% lighting all day. Eventra integrates directly with the venue's DMX lighting control system. By cross-referencing WiFi triangulation data, the algorithm determines exactly where the crowd is concentrated. It automatically dims empty aisles by 40% and raises highly populated zones to 100%, driving massive automated sustainability.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">DMX Controller Dashboard</h3>
               
               <button 
                 onClick={() => setAutomationActive(!automationActive)}
                 className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center ${
                   automationActive ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900' : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                 }`}
               >
                 {automationActive && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>}
                 {automationActive ? 'Algorithmic Mode Active' : 'Enable Smart Dimming'}
               </button>
             </div>

             <div className="flex justify-between items-end mb-6 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
               <div>
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Energy Saved Today</span>
                 <div className="flex items-baseline space-x-2">
                   <span className="text-4xl font-black text-white font-mono">{powerSaved.toFixed(1)}</span>
                   <span className="text-sm font-bold text-emerald-500">kWh</span>
                 </div>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Current Global Load</span>
                 <span className={`text-xl font-bold font-mono transition-colors ${automationActive ? 'text-emerald-400' : 'text-rose-500'}`}>
                   {Math.floor(zones.reduce((acc, z) => acc + z.currentDim, 0) / zones.length)}%
                 </span>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4">
               {zones.map(zone => (
                 <div key={zone.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl relative overflow-hidden flex flex-col justify-between">
                   
                   <div className="flex justify-between items-start mb-4 z-10 relative">
                     <span className="text-white font-bold text-xs truncate mr-2">{zone.name}</span>
                     <span className="text-[10px] text-neutral-500 font-mono">DMX {zone.id}</span>
                   </div>
                   
                   <div className="flex items-end justify-between z-10 relative">
                     <div className="flex flex-col">
                       <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Crowd Density</span>
                       <div className="flex items-end space-x-0.5 h-6">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className={`w-1.5 rounded-t transition-all duration-500 ${
                             i < (zone.crowdLevel / 20) ? (zone.crowdLevel > 70 ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-neutral-800'
                           }`} style={{ height: \`\${(i+1)*20}%\` }}></div>
                         ))}
                       </div>
                     </div>

                     <div className="text-right">
                       <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold mb-1 block">Output</span>
                       <span className={`text-lg font-black font-mono transition-colors duration-500 ${
                         zone.currentDim < 60 ? 'text-emerald-400' : zone.currentDim < 90 ? 'text-yellow-400' : 'text-white'
                       }`}>
                         {Math.floor(zone.currentDim)}%
                       </span>
                     </div>
                   </div>

                   {/* Background Glow indicating brightness */}
                   <div 
                     className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-xl transition-all duration-700 pointer-events-none"
                     style={{ 
                       background: 'radial-gradient(circle, rgba(253,224,71,0.2) 0%, rgba(253,224,71,0) 70%)',
                       opacity: zone.currentDim / 100
                     }}
                   ></div>

                 </div>
               ))}
             </div>

          </div>
        </div>

        {/* Right Side: Map & Live Simulation (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-[2rem] border-[8px] border-neutral-900 shadow-2xl relative overflow-hidden flex flex-col aspect-square">
            
            {/* Map Header */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-4 flex justify-between items-center z-30 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${automationActive ? 'bg-yellow-500 animate-pulse' : 'bg-rose-600'}`}></span>
                Exhibition Hall Plan
              </span>
              <span className="text-[10px] text-neutral-500 font-mono flex items-center">
                WiFi Triangulation Active
              </span>
            </div>

            {/* 2D Floorplan Canvas */}
            <div className="flex-1 relative bg-neutral-950 p-6 flex flex-col justify-between">
              
              <div className="grid grid-cols-2 gap-4 h-full pt-6 relative z-10">
                {zones.map((zone, idx) => (
                  <div key={zone.id} className="relative border border-neutral-800 rounded-lg flex flex-col items-center justify-center overflow-hidden group">
                    
                    {/* Simulated Lighting Overlay */}
                    <div 
                      className="absolute inset-0 bg-yellow-400 transition-opacity duration-500 mix-blend-overlay z-20 pointer-events-none"
                      style={{ opacity: (zone.currentDim / 100) * 0.8 }}
                    ></div>
                    
                    {/* Dark empty space visualization */}
                    <div 
                      className="absolute inset-0 bg-black transition-opacity duration-500 z-10 pointer-events-none"
                      style={{ opacity: 1 - (zone.currentDim / 100) }}
                    ></div>

                    {/* Zone Name */}
                    <span className="relative z-30 text-[10px] font-black text-white/50 uppercase tracking-widest mix-blend-difference">
                      {zone.name}
                    </span>

                    {/* Crowd Simulation Dots */}
                    <div className="absolute inset-0 z-30 p-2 opacity-80 pointer-events-none">
                      {/* Render X dots based on crowdLevel percentage */}
                      {Array.from({ length: Math.floor(zone.crowdLevel / 5) }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_3px_white] transition-all duration-1000"
                          style={{
                            left: \`\${20 + Math.random() * 60}%\`,
                            top: \`\${20 + Math.random() * 60}%\`,
                          }}
                        ></div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '10% 10%'
              }}></div>
            </div>

          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
              <strong>ALGORITHM LOGIC:</strong> System cross-references live MAC address densities from Cisco Meraki access points. DMX dimmers are dynamically adjusted over a 15-second ramp to prevent jarring visual changes. Minimum safety lux level maintained at 40%.
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AlgorithmicLightingControl;
