import React, { useState, useEffect } from 'react';

const ADARouteGenerator = () => {
  const [routeState, setRouteState] = useState('optimal'); // optimal, recalculating, diverted
  const [elevatorStatus, setElevatorStatus] = useState('operational'); // operational, broken
  
  // Simulated Map Coordinates
  const [path, setPath] = useState({
    origin: { x: 20, y: 80 },
    destination: { x: 80, y: 20 },
    nodes: [
      { x: 20, y: 80 },
      { x: 50, y: 80 }, // Elevator Bank A
      { x: 50, y: 50 },
      { x: 80, y: 50 },
      { x: 80, y: 20 }
    ],
    distance: 120, // meters
    eta: 4 // mins
  });

  const breakElevator = () => {
    setElevatorStatus('broken');
    setRouteState('recalculating');
    
    // Simulate complex pathfinding algorithm recalculating around the broken elevator
    setTimeout(() => {
      setPath({
        origin: { x: 20, y: 80 },
        destination: { x: 80, y: 20 },
        nodes: [
          { x: 20, y: 80 },
          { x: 20, y: 40 }, // Rerouted to West Ramp
          { x: 60, y: 40 }, 
          { x: 60, y: 20 },
          { x: 80, y: 20 }
        ],
        distance: 185, // meters
        eta: 7 // mins
      });
      setRouteState('diverted');
    }, 2000);
  };

  const fixElevator = () => {
    setElevatorStatus('operational');
    setRouteState('recalculating');
    
    setTimeout(() => {
      setPath({
        origin: { x: 20, y: 80 },
        destination: { x: 80, y: 20 },
        nodes: [
          { x: 20, y: 80 },
          { x: 50, y: 80 }, // Elevator Bank A
          { x: 50, y: 50 },
          { x: 80, y: 50 },
          { x: 80, y: 20 }
        ],
        distance: 120,
        eta: 4
      });
      setRouteState('optimal');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Master Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♿</span> Accessibility Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated ADA-Compliant <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Route Generator</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Wheelchair-bound attendees are frequently directed to static routes that become useless if a single elevator breaks down. Eventra's dynamic routing engine generates strict ADA-compliant paths. If venue staff flag an elevator as "Out of Order" or a ramp as "Heavily Congested" in the backend, the engine instantly recalculates all active ADA routes across the venue to find the next safest path.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">⚙️</span> Facilities Management
               </h3>
               
               <button 
                 onClick={elevatorStatus === 'operational' ? breakElevator : fixElevator}
                 disabled={routeState === 'recalculating'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center disabled:opacity-50 ${
                   elevatorStatus === 'operational' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                 }`}
               >
                 {elevatorStatus === 'operational' ? 'Flag Elevator A as Broken' : 'Restore Elevator A'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Elevator Bank A Status</span>
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${
                     elevatorStatus === 'operational' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                   }`}></div>
                   <span className={`text-2xl font-black uppercase tracking-widest ${
                     elevatorStatus === 'operational' ? 'text-emerald-400' : 'text-rose-500'
                   }`}>{elevatorStatus === 'operational' ? 'OPERATIONAL' : 'OUT OF ORDER'}</span>
                 </div>
               </div>

               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Active ADA Users</span>
                 <span className="text-2xl font-black text-blue-400 font-mono">
                   42 <span className="text-sm text-neutral-500">Routing Sessions</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Pathfinding Engine Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1 text-neutral-400 pr-2">
                 {routeState === 'optimal' && (
                   <p>&gt; All ADA routes calculating normally using primary accessible nodes.</p>
                 )}
                 {elevatorStatus === 'broken' && routeState === 'recalculating' && (
                   <div className="text-amber-400 font-bold">
                     <p className="text-rose-500">&gt; ALERT: Hardware failure detected at Node E-A (Elevator Bank A).</p>
                     <p>&gt; Invalidating 18 active routes passing through Node E-A...</p>
                     <p>&gt; Running A* pathfinding algorithm for alternative ADA-compliant paths...</p>
                   </div>
                 )}
                 {routeState === 'diverted' && (
                   <div className="text-blue-400 font-bold">
                     <p>&gt; Recalculation complete. 18 users successfully rerouted to West Ramp.</p>
                     <p>&gt; Pushing updated vector paths to client devices...</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-[2.5rem] border-[10px] border-neutral-900 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Simulated Map Canvas */}
            <div className="flex-1 relative bg-slate-800 overflow-hidden">
              
              {/* Floorplan Background */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale opacity-20"></div>
              
              {/* Grid */}
              <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                  backgroundSize: '10% 10%'
              }}></div>

              {/* Waypoints */}
              <div className="absolute z-10 w-full h-full pointer-events-none">
                 {/* Origin */}
                 <div className="absolute w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ left: \`\${path.origin.x}%\`, top: \`\${path.origin.y}%\`, transform: 'translate(-50%, -50%)' }}></div>
                 
                 {/* Destination */}
                 <div className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ left: \`\${path.destination.x}%\`, top: \`\${path.destination.y}%\`, transform: 'translate(-50%, -50%)' }}>
                   <span className="text-[10px] text-white">📍</span>
                 </div>

                 {/* Broken Elevator Indicator */}
                 {elevatorStatus === 'broken' && (
                   <div className="absolute w-8 h-8 bg-rose-500/20 rounded-full border border-rose-500 flex items-center justify-center animate-ping" style={{ left: '50%', top: '80%', transform: 'translate(-50%, -50%)' }}>
                   </div>
                 )}
                 <div className={`absolute text-lg ${elevatorStatus === 'broken' ? 'opacity-100 grayscale' : 'opacity-100'}`} style={{ left: '50%', top: '80%', transform: 'translate(-50%, -50%)' }}>
                   {elevatorStatus === 'broken' ? '⛔' : '🛗'}
                 </div>
              </div>

              {/* Render SVG Path */}
              <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                {routeState === 'recalculating' ? (
                  <path 
                    d={\`M \${path.nodes.map(n => \`\${n.x}% \${n.y}%\`).join(' L ')}\`} 
                    fill="none" 
                    stroke="rgba(59,130,246,0.3)" 
                    strokeWidth="6" 
                    strokeDasharray="10 10"
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="animate-pulse"
                  />
                ) : (
                  <>
                    {/* Shadow/Glow */}
                    <path 
                      d={\`M \${path.nodes.map(n => \`\${n.x}% \${n.y}%\`).join(' L ')}\`} 
                      fill="none" 
                      stroke="rgba(59,130,246,0.4)" 
                      strokeWidth="12" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="transition-all duration-1000 ease-in-out"
                    />
                    {/* Main Line */}
                    <path 
                      d={\`M \${path.nodes.map(n => \`\${n.x}% \${n.y}%\`).join(' L ')}\`} 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="4" 
                      strokeDasharray="8 8"
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="transition-all duration-1000 ease-in-out animate-[dash_20s_linear_infinite]"
                      style={{ strokeDashoffset: '1000' }}
                    />
                  </>
                )}
              </svg>

              <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash {
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}} />

              {/* UI Overlay */}
              <div className="absolute top-16 right-4 flex space-x-2">
                <span className="bg-blue-600/90 text-white font-bold text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-blue-500 flex items-center backdrop-blur">
                  <span className="mr-1 text-sm">♿</span> ADA Mode Active
                </span>
              </div>
              
            </div>

            {/* Bottom Sheet UI */}
            <div className="bg-neutral-900 border-t border-neutral-800 p-6 z-20 relative shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
              
              {/* Recalculating overlay */}
              {routeState === 'recalculating' && (
                <div className="absolute inset-0 bg-neutral-900/90 backdrop-blur z-30 flex flex-col items-center justify-center animate-fade-in text-center">
                  <div className="w-8 h-8 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                  <h4 className="text-white font-bold text-sm">Finding Accessible Route</h4>
                  <p className="text-neutral-400 text-xs mt-1">Avoiding Main Elevator...</p>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">North Hall Stage</h2>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Wheelchair Accessible Path</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white font-mono">{path.eta}</span>
                  <span className="text-slate-400 text-sm font-bold ml-1">min</span>
                  <p className="text-neutral-500 text-[10px] font-mono">{path.distance}m</p>
                </div>
              </div>

              {routeState === 'diverted' && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start space-x-3 animate-fade-in">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <h4 className="text-amber-400 font-bold text-xs">Route Updated</h4>
                    <p className="text-neutral-400 text-[10px] mt-1 leading-relaxed">Elevator Bank A is out of service. You have been rerouted via the West Ramp (+3 mins).</p>
                  </div>
                </div>
              )}

              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Start Navigation
              </button>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default ADARouteGenerator;
