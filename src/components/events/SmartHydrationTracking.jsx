/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartHydrationTracking = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [trackingState, setTrackingState] = useState('NOMINAL'); // NOMINAL, DEHYDRATION_WARN, REFILL_LOGGED
  
  // Biometric/IoT Metrics for a specific user
  const [kineticActivity, setKineticActivity] = useState(0); // Arbitrary unit (e.g., steps/dancing)
  const [waterIntake, setWaterIntake] = useState(0); // fluid oz
  const [hydrationDeficit, setHydrationDeficit] = useState(0); // % Risk
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'RFID Refill Station #12 Online.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting Smart Cup proximity scans.' }
  ]);

  // Visualizer State
  const [cupFillLevel, setCupFillLevel] = useState(0); // %
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (trackingState === 'NOMINAL' || trackingState === 'DEHYDRATION_WARN') {
              // User is dancing, kinetic energy goes up, deficit rises
              setKineticActivity(prev => prev + (Math.random() * 5));
              
              setHydrationDeficit(prev => {
                  // Calculate risk: High activity + low intake = high risk
                  const expectedIntake = kineticActivity * 0.15; 
                  const deficit = expectedIntake - waterIntake;
                  let risk = (deficit / 50) * 100;
                  if (risk < 0) risk = 0;
                  if (risk > 100) risk = 100;
                  
                  if (risk > 75 && trackingState !== 'DEHYDRATION_WARN') {
                      triggerWarning();
                  }
                  
                  return risk;
              });
          }

      }, 500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, trackingState, kineticActivity, waterIntake]);

  const triggerWarning = () => {
      setTrackingState('DEHYDRATION_WARN');
      setShowNotification(true);
      addLog('WARN', 'AI ALERT: Severe hydration deficit detected for User #84A2.');
      addLog('ACTION', 'Push notification dispatched to user device: "Hydrate Immediately."');
      
      setTimeout(() => setShowNotification(false), 5000);
  };

  const simulateRefill = () => {
    if (!systemActive) return;
    
    setTrackingState('REFILL_LOGGED');
    setShowNotification(false);
    addLog('ACTION', 'Smart Cup RFID scanned at Station #12. Dispensing...');
    
    // Animate cup filling
    let fill = 0;
    const fillInterval = setInterval(() => {
        fill += 10;
        setCupFillLevel(fill);
        if (fill >= 100) {
            clearInterval(fillInterval);
            
            // Log intake
            const ouncesPoured = 16;
            setWaterIntake(prev => prev + ouncesPoured);
            
            addLog('SUCCESS', `Dispensed ${ouncesPoured}oz. Logged to User Profile.`);
            addLog('SYS', 'Hydration deficit recalculated. Status: Nominal.');
            
            setTimeout(() => {
                setCupFillLevel(0);
                setTrackingState('NOMINAL');
                setHydrationDeficit(0); // Reset risk for demo
            }, 3000);
        }
    }, 150);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setKineticActivity(300); // Start with some dancing
      setWaterIntake(16);
      setTrackingState('NOMINAL');
      addLog('SYS', 'Biometric IoT Tracking API connected. Monitoring user fluid intake.');
    } else {
      setSystemActive(false);
      setTrackingState('NOMINAL');
      setKineticActivity(0);
      setWaterIntake(0);
      setHydrationDeficit(0);
      setCupFillLevel(0);
      setShowNotification(false);
      addLog('WARN', 'Tracking System Offline. Reverting to manual paper cups.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02070f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚰</span> Preventative Healthcare
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart Cup Hydration <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Level Monitoring</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees frequently forget to drink water while under the influence of alcohol or dancing in the sun, leading to a high rate of severe dehydration emergencies. Eventra solves this by implementing RFID-chipped, reusable smart cups linked to the attendee's profile. The refill stations track the exact volume of water dispensed to each user. Eventra's AI analyzes their kinetic activity (dancing/steps) versus their fluid intake, instantly dispatching push notifications to users identified as high-risk for heatstroke.
          </p>

          <div className="bg-[#050b16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📊</span> User Profile: #84A2
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Tracking' : 'Initialize IoT Monitoring'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Kinetic Activity */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Kinetic Output
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(kineticActivity)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kCal</span>
                 </div>
               </div>

               {/* Water Intake */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 trackingState === 'REFILL_LOGGED' ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Fluid Logged
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     trackingState === 'REFILL_LOGGED' ? 'text-blue-400' :
                     systemActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {waterIntake}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">oz</span>
                 </div>
               </div>
               
               {/* Deficit Risk */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 hydrationDeficit > 75 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Dehydration Risk
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-500 ${
                     hydrationDeficit > 75 ? 'text-red-500' :
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(hydrationDeficit)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010308] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Biometric Telemetry Log</span>
                 {trackingState === 'DEHYDRATION_WARN' && <span className="text-red-500 animate-pulse">DEFICIT DETECTED</span>}
                 {trackingState === 'REFILL_LOGGED' && <span className="text-blue-400 font-black animate-pulse">LOGGING INTAKE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' :
                       'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Kiosk Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#040c1a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">RFID WATER STATION</span>
                <span className="text-[8px] font-mono text-slate-400">ZONE 4</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-12 z-20">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">STATION OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col items-center">
                      
                      {/* Push Notification Overlay */}
                      {showNotification && (
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 bg-red-950/90 border border-red-500 rounded-lg p-3 z-50 shadow-2xl backdrop-blur-md animate-fade-in-up">
                              <div className="flex items-start">
                                  <div className="text-xl mr-3">⚠️</div>
                                  <div>
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest block">Eventra Health Alert</span>
                                      <span className="text-[11px] text-red-200 mt-1 block leading-tight">
                                          Severe hydration deficit detected. Your activity level requires fluid intake immediately to prevent heatstroke.
                                      </span>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Nozzle Area */}
                      <div className="w-full h-24 bg-slate-900 border-b border-slate-700 flex flex-col items-center justify-end pb-2 relative z-30">
                          
                          {/* RFID Reader Light */}
                          <div className={`w-8 h-2 rounded-full mb-4 transition-colors duration-300 ${
                              trackingState === 'REFILL_LOGGED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-red-500'
                          }`}></div>

                          {/* Water Spigot */}
                          <div className="w-6 h-6 bg-slate-700 rounded-b flex items-end justify-center">
                              {/* Flowing Water */}
                              <div className={`w-2 bg-cyan-400/80 rounded-b transition-all duration-300 ${
                                  trackingState === 'REFILL_LOGGED' ? 'h-32 opacity-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'h-0 opacity-0'
                              }`}></div>
                          </div>
                      </div>

                      {/* Smart Cup */}
                      <div className="flex-1 w-full flex items-end justify-center pb-8 relative z-20">
                          <div className="w-24 h-32 border-x-4 border-b-4 border-slate-600 rounded-b-xl relative bg-black/50 overflow-hidden shadow-inner flex items-end">
                              
                              {/* Fluid Inside Cup */}
                              <div 
                                  className="w-full bg-cyan-500/50 backdrop-blur-sm transition-all duration-200 border-t-2 border-cyan-300"
                                  style={{ height: `${cupFillLevel}%` }}
                              >
                                  {cupFillLevel > 0 && (
                                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] animate-[moveUp_1s_linear_infinite]"></div>
                                  )}
                              </div>

                              {/* RFID Chip Mockup */}
                              <div className="absolute bottom-2 right-2 w-4 h-4 border border-slate-500 rounded-sm flex flex-col items-center justify-center opacity-50">
                                  <div className="w-2 h-2 bg-amber-500/30"></div>
                              </div>
                          </div>
                      </div>

                      {/* Display Screen */}
                      <div className="absolute bottom-2 inset-x-4 h-8 bg-slate-900 border border-slate-700 rounded flex justify-between items-center px-3 z-30">
                          <span className="text-[8px] font-mono text-slate-500">STATION STATUS</span>
                          {trackingState === 'REFILL_LOGGED' ? (
                              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">SCAN ACCEPTED</span>
                          ) : (
                              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PLACE SMART CUP</span>
                          )}
                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes moveUp {
                        0% { background-position: 0 0; }
                        100% { background-position: 0 -20px; }
                    }
                `}} />

              </div>
            </div>

            {/* User Action Controls */}
            <div className="w-full bg-[#050b16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Attendee Actions</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={simulateRefill}
                   disabled={!systemActive || trackingState === 'REFILL_LOGGED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || trackingState === 'REFILL_LOGGED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   Scan Cup & Refill Water (16oz)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartHydrationTracking;
