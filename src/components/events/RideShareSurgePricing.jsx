/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RideShareSurgePricing = () => {
  const [isSpiking, setIsSpiking] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.2);
  const [predictedMultiplier, setPredictedMultiplier] = useState(1.5);
  const [pushSent, setPushSent] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Polling Ride-Share APIs (Uber/Lyft) for geofence: LAT:34.05, LNG:-118.24.' }
  ]);

  const triggerSurge = () => {
      setIsSpiking(true);
      setPushSent(false);
      addLog('ACTION', 'Simulating Main Stage Finale (23:30). 50,000 attendees moving towards exits.');
      
      setTimeout(() => {
          addLog('SYS', 'Ride-Share API returned Surge Multiplier: 1.8x (Rising Rapidly).');
          setSurgeMultiplier(1.8);
          setPredictedMultiplier(5.2);
          
          setTimeout(() => {
              addLog('WARN', 'Predictive Model: Surge will hit 5.2x in 30 minutes.');
              
              setTimeout(() => {
                  setPushSent(true);
                  addLog('SUCCESS', 'Push notification broadcasted to all users to smooth exit traffic.');
              }, 1000);
          }, 1500);
      }, 1500);
  };
  
  const resetDemo = () => {
      setIsSpiking(false);
      setPushSent(false);
      setSurgeMultiplier(1.2);
      setPredictedMultiplier(1.5);
      addLog('SYS', 'Demo reset. Background polling resumed.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚗</span> API Integrations & Predictive Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Ride-Share <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500">Surge Pricing Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At the end of the festival, 50,000 people request an Uber simultaneously. This thundering herd causes surge pricing to hit 800%, stranding attendees who only find out a 10-minute ride costs $250 after they've already left the gates. Eventra solves this by continuously polling Ride-Share APIs. A predictive model forecasts the surge and pushes a proactive notification to the mobile app, encouraging attendees to leave early and smoothing out the logistical exit bottleneck.
          </p>

          <div className="bg-[#120510] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Backend API Polling
               </h3>
               {pushSent && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 <div className={`border rounded-xl p-4 flex flex-col justify-center transition-colors ${
                     isSpiking ? 'bg-rose-950/40 border-rose-900/50' : 'bg-slate-900 border-slate-800'
                 }`}>
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Live Surge API</span>
                     <div className="flex items-end">
                         <span className={`text-4xl font-black font-mono mr-2 ${isSpiking ? 'text-rose-500' : 'text-emerald-400'}`}>
                             {surgeMultiplier}x
                         </span>
                         {isSpiking && <span className="text-rose-400 text-xl animate-bounce mb-1">↑</span>}
                     </div>
                 </div>

                 <div className={`border rounded-xl p-4 flex flex-col justify-center transition-colors ${
                     isSpiking ? 'bg-fuchsia-950/40 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
                 }`}>
                     <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2">Predictive Model (+30m)</span>
                     <div className="flex items-end">
                         <span className={`text-4xl font-black font-mono mr-2 ${isSpiking ? 'text-fuchsia-400' : 'text-slate-400'}`}>
                             {predictedMultiplier}x
                         </span>
                     </div>
                 </div>
                 
             </div>

             <button 
                 onClick={triggerSurge}
                 disabled={isSpiking}
                 className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors shadow-lg mb-4 ${
                     isSpiking ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                 }`}
             >
                 {isSpiking ? 'Modeling Surge Logistics...' : 'Simulate Festival End (Trigger Surge)'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#040103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ride-Share Webhook Logs</span>
                 {isSpiking && !pushSent && <span className="text-fuchsia-400 font-black animate-pulse">POLLING API...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-30"></div>
              
              {/* Push Notification Overlay */}
              <div className={`absolute top-8 left-4 right-4 bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-600 shadow-2xl z-40 transition-all duration-500 ${
                  pushSent ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
              }`}>
                  <div className="flex items-start">
                      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center mr-3 shrink-0">
                          <span className="text-fuchsia-500 font-black text-xs">EVT</span>
                      </div>
                      <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-white">Eventra Alert</span>
                              <span className="text-[9px] text-slate-400">Just Now</span>
                          </div>
                          <span className="text-[10px] text-slate-300 leading-snug">Ride-share surge is currently <span className="font-bold text-rose-400">1.8x</span> but predicted to hit <span className="font-bold text-rose-400">5.2x</span> in 30 mins. Request a ride now to save money.</span>
                      </div>
                  </div>
              </div>

              {/* App Content */}
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-10 px-4">
                  
                  <div className="flex justify-between items-center mb-6">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">☰</div>
                      <span className="text-white font-bold text-sm">Getting Home</span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</div>
                  </div>

                  <div className={`w-full rounded-2xl p-5 mb-4 transition-colors duration-1000 ${
                      isSpiking ? 'bg-gradient-to-br from-rose-950 to-black border border-rose-900/50' : 'bg-gradient-to-br from-emerald-950 to-black border border-emerald-900/50'
                  }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Current Surge Pricing</span>
                      <div className="flex items-end mb-4">
                          <span className={`text-5xl font-black font-mono transition-colors duration-1000 ${isSpiking ? 'text-rose-500' : 'text-emerald-400'}`}>
                              {surgeMultiplier}x
                          </span>
                      </div>
                      
                      <button className={`w-full py-3 rounded-xl text-xs font-bold transition-colors ${
                          isSpiking ? 'bg-white text-black' : 'bg-emerald-600 text-white'
                      }`}>
                          Request Uber Now
                      </button>
                  </div>

                  {/* Trend Graph */}
                  <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-white">Surge Forecast</span>
                          <span className="text-[9px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">Next 2 Hours</span>
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between px-2 pb-6 relative">
                          {/* Graph background lines */}
                          <div className="absolute top-0 w-full border-t border-slate-800 border-dashed"></div>
                          <div className="absolute top-1/2 w-full border-t border-slate-800 border-dashed"></div>
                          <div className="absolute bottom-6 w-full border-t border-slate-800 border-dashed"></div>
                          
                          {/* Y-axis labels */}
                          <div className="absolute top-0 right-0 text-[8px] font-mono text-slate-500 -translate-y-2">5.0x</div>
                          
                          {/* Bars */}
                          <div className="w-4 bg-emerald-500/50 h-[20%] rounded-t-sm relative z-10"></div>
                          <div className={`w-4 transition-all duration-1000 rounded-t-sm relative z-10 ${isSpiking ? 'bg-rose-500 h-[36%]' : 'bg-emerald-500/50 h-[20%]'}`}></div>
                          <div className={`w-4 transition-all duration-1000 delay-100 rounded-t-sm relative z-10 ${isSpiking ? 'bg-rose-600 h-[60%]' : 'bg-emerald-500/50 h-[22%]'}`}></div>
                          <div className={`w-4 transition-all duration-1000 delay-200 rounded-t-sm relative z-10 ${isSpiking ? 'bg-rose-700 h-[100%]' : 'bg-emerald-500/50 h-[25%]'}`}></div>
                          <div className={`w-4 transition-all duration-1000 delay-300 rounded-t-sm relative z-10 ${isSpiking ? 'bg-rose-800 h-[95%]' : 'bg-emerald-500/50 h-[25%]'}`}></div>
                          <div className={`w-4 transition-all duration-1000 delay-500 rounded-t-sm relative z-10 ${isSpiking ? 'bg-fuchsia-900 h-[60%]' : 'bg-emerald-500/50 h-[20%]'}`}></div>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-[8px] font-mono text-slate-500">
                          <span>Now</span>
                          <span>+30m</span>
                          <span>+1h</span>
                          <span>+2h</span>
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120510] p-4 rounded-xl border border-fuchsia-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-fuchsia-400 uppercase block mb-1">Predictive Analytics:</span>
               Click <span className="text-white font-bold bg-fuchsia-600 px-1 rounded">Simulate Festival End</span>. Instead of 50,000 attendees blindly walking out of the gates and discovering an $250 Uber ride, the backend actively polls the Ride-Share APIs. It identifies the rising surge trend early. By sending a predictive push notification, the app creates a psychological urgency that prompts a percentage of the crowd to leave 30 minutes early, flattening the demand curve and smoothing out the massive logistical exit bottleneck.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default RideShareSurgePricing;
