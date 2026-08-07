import React, { useState, useEffect } from 'react';

const RideshareSurgeMitigation = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45); // mins to end
  
  // Rideshare Market Data
  const [activeDrivers, setActiveDrivers] = useState(42);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [estimatedWait, setEstimatedWait] = useState(5); // mins
  
  const [userNotification, setUserNotification] = useState(null);

  useEffect(() => {
    let simInterval;
    
    if (simulationActive) {
      simInterval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          
          if (newTime === 30) {
            // Trigger API pre-positioning at T-30
            setActiveDrivers(150); // Drivers flood in based on API heads up
            setSurgeMultiplier(1.5); // Slight proactive surge
          }
          
          if (newTime === 15) {
            // Algorithm identifies optimal window for cohort A
            setUserNotification({
              cohort: "Group A",
              message: "Book your ride now to lock in 1.5x surge. Prices are expected to hit 4.5x in 15 minutes."
            });
            setEstimatedWait(3);
          }
          
          if (newTime === 5) {
             // Event almost over, natural demand spikes
             setSurgeMultiplier(3.2);
             setEstimatedWait(12);
          }
          
          if (newTime === 0) {
             // Event over, peak crush without mitigation would be 5x, but here we cap it
             setSurgeMultiplier(2.5); // Mitigated surge!
             setEstimatedWait(8);
             setUserNotification({
               cohort: "Group B",
               message: "Demand is peaking. We recommend waiting 20 minutes for surge to drop back to 1.5x."
             });
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(simInterval);
  }, [simulationActive]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚕</span> City-Level Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Rideshare <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Surge Mitigation API</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When an event ends, attendees face 5x Uber/Lyft surge pricing and 2-hour wait times because the local rideshare ecosystem is instantly overwhelmed. Eventra feeds real-time exit flow rates directly to rideshare APIs to pre-position drivers. Concurrently, it staggers personalized push notifications to attendees, telling them exactly when to request a ride to lock in lower prices.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 API Telemetry Link
               </h3>
               
               <button 
                 onClick={() => {
                   setSimulationActive(!simulationActive);
                   if(!simulationActive) {
                     setTimeRemaining(45);
                     setActiveDrivers(42);
                     setSurgeMultiplier(1.0);
                     setEstimatedWait(5);
                     setUserNotification(null);
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   simulationActive ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-900' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                 }`}
               >
                 {simulationActive && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>}
                 {simulationActive ? 'Telemetry Syncing...' : 'Initiate API Handshake'}
               </button>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="bg-black p-4 rounded-xl border border-slate-800 text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Event End T-Minus</span>
                 <span className={`text-2xl font-black font-mono ${timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                   {timeRemaining}:00
                 </span>
               </div>
               
               <div className="bg-black p-4 rounded-xl border border-slate-800 text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Pre-Positioned Fleet</span>
                 <span className="text-2xl font-black text-indigo-400 font-mono transition-all duration-1000">
                   {activeDrivers} <span className="text-sm">Cars</span>
                 </span>
               </div>

               <div className="bg-black p-4 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                 {/* Visual surge indicator background */}
                 <div className="absolute inset-0 opacity-20 transition-colors duration-1000" 
                      style={{ backgroundColor: surgeMultiplier > 2 ? 'red' : surgeMultiplier > 1 ? 'orange' : 'transparent'}}>
                 </div>
                 
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 relative z-10">Live Market Surge</span>
                 <span className="text-2xl font-black text-white font-mono relative z-10">
                   {surgeMultiplier.toFixed(1)}x
                 </span>
               </div>
             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Rideshare API Traffic Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1 text-slate-400">
                 {!simulationActive && (
                   <p>Awaiting handshake with Uber/Lyft vendor APIs...</p>
                 )}
                 {simulationActive && timeRemaining <= 45 && timeRemaining > 30 && (
                   <div className="text-indigo-400">
                     <p>&gt; Connection established.</p>
                     <p>&gt; Transmitting predicted egress flow models...</p>
                   </div>
                 )}
                 {timeRemaining <= 30 && timeRemaining > 15 && (
                   <div className="text-emerald-400">
                     <p>&gt; API ACK: Pre-positioning protocol initiated.</p>
                     <p>&gt; Routing drivers to Geofence Zone A.</p>
                     <p>&gt; Market liquidity increased by 250%.</p>
                   </div>
                 )}
                 {timeRemaining <= 15 && timeRemaining > 0 && (
                   <div className="text-amber-400 font-bold">
                     <p>&gt; Calculating optimal cohort staggering...</p>
                     <p>&gt; Dispatching early-exit push notifications to 15% of attendees.</p>
                   </div>
                 )}
                 {timeRemaining === 0 && (
                   <div className="text-rose-400 font-bold space-y-2">
                     <p>&gt; EVENT END. Peak egress detected.</p>
                     <p>&gt; Surge mitigated from predicted 5.0x to 2.5x.</p>
                     <p>&gt; Informing remaining attendees to hold for 20 mins.</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Map Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale opacity-40"></div>
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '15% 15%'
            }}></div>

            {/* Drone/Car Markers simulating pre-positioned fleet */}
            <div className="absolute inset-0 z-10 pointer-events-none">
               {Array.from({ length: activeDrivers > 100 ? 15 : 3 }).map((_, i) => (
                 <div key={i} className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,1)] transition-all duration-1000" style={{
                   left: \`\${20 + Math.random() * 60}%\`,
                   top: \`\${20 + Math.random() * 60}%\`,
                 }}></div>
               ))}
            </div>

            {/* Mobile Content Foreground */}
            <div className="relative flex-1 flex flex-col p-6 pt-16 z-20">
              
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-xl mb-auto">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                  <span className="text-white font-bold text-lg">Transit Hub</span>
                  <span className="bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">Live Link</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl">🚗</div>
                    <div>
                      <span className="block text-white font-bold text-sm">Rideshare Wait</span>
                      <span className="block text-slate-400 text-xs font-mono">{estimatedWait} mins</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Pricing</span>
                    <span className={`font-black font-mono ${surgeMultiplier > 1.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {surgeMultiplier.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Push Notification Simulation */}
              {userNotification && (
                <div className="bg-slate-800 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl animate-fade-in-up mt-4 relative overflow-hidden">
                  
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl mt-1">💡</div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Smart Exit Strategy</h4>
                      <p className="text-slate-300 text-xs leading-relaxed mb-4">
                        {userNotification.message}
                      </p>
                      
                      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition">
                        {userNotification.cohort === 'Group A' ? 'Request Ride Now' : 'Set 20m Reminder'}
                      </button>
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

export default RideshareSurgeMitigation;
