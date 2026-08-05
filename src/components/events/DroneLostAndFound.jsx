import React, { useState, useEffect } from 'react';

const DroneLostAndFound = () => {
  const [systemState, setSystemState] = useState('standby'); // standby, launching, searching, found, recovering
  const [signalStrength, setSignalStrength] = useState(0);
  const [dronePos, setDronePos] = useState({ x: 50, y: 80 }); // Percentages
  const [targetPos, setTargetPos] = useState({ x: 25, y: 30 }); // Target location (hidden initially)

  useEffect(() => {
    let searchInterval;
    
    if (systemState === 'launching') {
      setTimeout(() => setSystemState('searching'), 2000);
    } else if (systemState === 'searching') {
      
      searchInterval = setInterval(() => {
        setDronePos(prev => {
          // Move drone towards target slowly with some zig-zag (sweeping)
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 2) {
            clearInterval(searchInterval);
            setSystemState('found');
            setSignalStrength(100);
            
            setTimeout(() => setSystemState('recovering'), 2000);
            setTimeout(() => setSystemState('standby'), 8000);
            
            return prev; // Stay at target
          }
          
          // Calculate signal strength based on distance
          const newSignal = Math.max(0, 100 - (dist * 1.5));
          setSignalStrength(newSignal);
          
          // Sweep motion
          const moveX = prev.x + (dx * 0.1) + (Math.sin(Date.now() / 500) * 2);
          const moveY = prev.y + (dy * 0.1);
          
          return { x: moveX, y: moveY };
        });
      }, 100);
      
    } else if (systemState === 'standby') {
      setDronePos({ x: 50, y: 80 });
      setSignalStrength(0);
      // Randomize target for next time
      setTargetPos({ 
        x: 10 + Math.random() * 80, 
        y: 10 + Math.random() * 50 
      });
    }
    
    return () => clearInterval(searchInterval);
  }, [systemState, targetPos]);

  const reportLostItem = () => {
    setSystemState('launching');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Flight Controller (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/50 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> Autonomous Hardware
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Drone-Based Lost <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">& Found Retrieval</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Attendees lose critical items on massive festival grounds and spend hours searching for them. Eventra solves this by dispatching small, automated drones to sweep the GPS area. The drone triangulates the attendee's BLE signal (e.g., Apple AirTag), hovers over the exact item, and transmits the precise coordinates to ground recovery staff.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Fleet Telemetry Dashboard</h3>
               <span className={`px-2 py-1 rounded text-[10px] font-mono flex items-center border ${
                 systemState !== 'standby' ? 'bg-amber-900/50 text-amber-400 border-amber-500/30' : 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30'
               }`}>
                 <span className={`w-1.5 h-1.5 rounded-full mr-2 ${systemState !== 'standby' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                 {systemState !== 'standby' ? 'DRONE 04 ACTIVE' : 'ALL CLEAR'}
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
               
               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Target BLE Signal Strength</span>
                 <div className="flex items-end justify-between">
                   <div className="flex items-end space-x-1 h-8">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className={`w-3 rounded-t transition-all duration-300 ${
                         i < (signalStrength / 20) ? 'bg-amber-500' : 'bg-neutral-800'
                       }`} style={{ height: \`\${(i+1)*20}%\` }}></div>
                     ))}
                   </div>
                   <span className="text-2xl font-black text-amber-400 font-mono">{Math.floor(signalStrength)}%</span>
                 </div>
               </div>

               <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Drone Coordinates</span>
                 <span className="text-xl font-black text-white font-mono">
                   {systemState === 'standby' ? 'HOME BASE' : \`\${dronePos.x.toFixed(4)}N, \${dronePos.y.toFixed(4)}W\`}
                 </span>
                 <span className="text-[10px] text-neutral-500 font-mono mt-1">ALT: {systemState === 'searching' ? '45m' : systemState === 'found' ? '5m' : '0m'}</span>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Flight Controller Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1 text-neutral-400">
                 {systemState === 'standby' && (
                   <p>Drone fleet at standby. Batteries at 100%.</p>
                 )}
                 {systemState === 'launching' && (
                   <div className="text-sky-400">
                     <p>&gt; RECEIVED SOS: Lost Item (Car Keys)</p>
                     <p>&gt; Dispatching Drone 04 to general sector...</p>
                     <p>&gt; Pre-flight checks complete. Liftoff.</p>
                   </div>
                 )}
                 {systemState === 'searching' && (
                   <div className="text-amber-400">
                     <p>&gt; Initiating sweeping pattern over Sector 7.</p>
                     <p>&gt; Scanning for BLE signature (AirTag ID: 49A-B2)...</p>
                   </div>
                 )}
                 {systemState === 'found' && (
                   <div className="text-emerald-400 font-bold space-y-2">
                     <p>&gt; SIGNAL PEAK REACHED. Target acquired.</p>
                     <p>&gt; Descending to 5m hover.</p>
                     <p className="bg-emerald-900/30 p-2 border border-emerald-500/30 rounded mt-2">
                       TRANSMITTING EXACT COORDINATES TO RECOVERY STAFF
                     </p>
                   </div>
                 )}
                 {systemState === 'recovering' && (
                   <div className="text-sky-400">
                     <p>&gt; Recovery staff dispatched.</p>
                     <p>&gt; Drone 04 returning to base.</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visual Map & Mobile App (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-[2rem] border-[8px] border-neutral-900 shadow-2xl relative overflow-hidden flex flex-col aspect-square">
            
            {/* Map Header */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-4 flex justify-between items-center z-30 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                Satellite View
              </span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-900/30 px-2 py-0.5 rounded border border-amber-500/30">
                UAV TRACKING ACTIVE
              </span>
            </div>

            {/* Satellite Map Canvas */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden">
              {/* Fake satellite grass background */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590489956461-8d02df925055?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale opacity-40"></div>
              
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '10% 10%'
              }}></div>

              {/* Home Base */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 border-2 border-neutral-600 rounded flex items-center justify-center bg-black/50 backdrop-blur z-10">
                <span className="text-white text-[8px] font-bold">BASE</span>
              </div>

              {/* The Drone */}
              {(systemState !== 'standby') && (
                <div 
                  className="absolute w-8 h-8 z-30 transition-all duration-100 ease-linear flex items-center justify-center"
                  style={{ 
                    left: \`\${dronePos.x}%\`, 
                    top: \`\${dronePos.y}%\`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Drone body */}
                  <div className="w-3 h-3 bg-white rounded-sm z-10"></div>
                  {/* Drone rotors */}
                  <div className="absolute top-0 left-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border border-slate-400 rounded-full animate-spin"></div>
                  
                  {/* Drone Scan Area (Only when searching) */}
                  {systemState === 'searching' && (
                    <div className="absolute w-32 h-32 bg-amber-500/20 rounded-full animate-ping border border-amber-500/50 pointer-events-none" style={{ animationDuration: '2s' }}></div>
                  )}
                </div>
              )}

              {/* The Target (Item) - Only visible when found to simulate discovery */}
              {systemState === 'found' && (
                <div 
                  className="absolute w-4 h-4 bg-emerald-500 rounded-full z-20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,1)] animate-bounce"
                  style={{ 
                    left: \`\${targetPos.x}%\`, 
                    top: \`\${targetPos.y}%\`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="absolute w-8 h-8 border-2 border-emerald-500 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
          </div>

          {/* Attendee Mobile App Simulator */}
          <div className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden">
            
            <div className="z-10">
              <h4 className="text-white font-bold text-sm">Lost an Item?</h4>
              <p className="text-neutral-400 text-[10px]">Ensure your AirTag is registered.</p>
            </div>
            
            {systemState === 'standby' ? (
              <button 
                onClick={reportLostItem}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest transition shadow-lg z-10"
              >
                SOS Dispatch
              </button>
            ) : systemState === 'found' ? (
              <div className="bg-emerald-900/50 text-emerald-400 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest border border-emerald-500/30 z-10">
                Item Located
              </div>
            ) : (
              <div className="bg-neutral-800 text-neutral-400 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest flex items-center z-10">
                <div className="w-3 h-3 border-2 border-neutral-600 border-t-amber-400 rounded-full animate-spin mr-2"></div>
                Searching...
              </div>
            )}
            
            {/* Background design */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-900/20 to-transparent pointer-events-none"></div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default DroneLostAndFound;
