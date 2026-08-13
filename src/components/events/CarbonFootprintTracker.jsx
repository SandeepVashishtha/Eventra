/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CarbonFootprintTracker = () => {
  const [isOffsetting, setIsOffsetting] = useState(false);
  const [offsetComplete, setOffsetComplete] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Sustainability Module initialized. Tracking attendee travel emissions.' }
  ]);

  const purchaseOffset = () => {
      setIsOffsetting(true);
      addLog('ACTION', 'User initiated $4.50 Micro-Offset purchase for 450kg CO2e.');
      
      setTimeout(() => {
          addLog('SYS', 'Calling Patch.io Climate API: Creating offset order for Forestry Project...');
          
          setTimeout(() => {
              addLog('WARN', 'Transaction authorized. Executing Stripe payment intent...');
              
              setTimeout(() => {
                  setIsOffsetting(false);
                  setOffsetComplete(true);
                  addLog('SUCCESS', 'Offset confirmed. Cryptographic Eco-Badge issued to user profile.');
              }, 1500);
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsOffsetting(false);
      setOffsetComplete(false);
      addLog('SYS', 'Profile reset. Carbon emissions un-offset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020605] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌍</span> Sustainability & Gamification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Gamified Carbon Footprint <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Offset Tracker</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals pledge to be "carbon neutral," but attendees have no visibility into their actual ecological impact, providing zero incentive for them to carpool or use public transit. Eventra solves this by building an ecological gamification UI in the mobile app. It calculates an attendee's carbon footprint based on their transportation choice and on-site recycling. The backend integrates with Carbon Offset APIs (like Patch.io), allowing users to instantly purchase micro-offsets to turn their profile badge "Green," visualizing their impact on a global leaderboard.
          </p>

          <div className="bg-[#050e09] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Climate API Integration
               </h3>
               {offsetComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col justify-center items-center mb-4">
                 
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full relative overflow-hidden shadow-2xl">
                     <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Patch.io JSON Payload</span>
                         <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">POST /v1/orders</span>
                     </div>
                     <div className="bg-black/60 rounded p-3 font-mono text-[10px] text-slate-300">
                         <div>{'{'}</div>
                         <div className="pl-4">"mass_g": <span className="text-teal-400">450000</span>,</div>
                         <div className="pl-4">"project_id": <span className="text-emerald-400">"pro_test_1234"</span>,</div>
                         <div className="pl-4">"metadata": {'{'}</div>
                         <div className="pl-8">"user_id": <span className="text-cyan-400">"usr_9A2b"</span></div>
                         <div className="pl-4">{'}'}</div>
                         <div>{'}'}</div>
                     </div>
                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Sustainability API Logs</span>
                 {isOffsetting && <span className="text-emerald-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
                       log.type === 'WARN' ? 'text-cyan-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
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
              
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-10 px-4">
                  
                  <div className="flex justify-between items-center mb-6">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">☰</div>
                      <span className="text-white font-bold text-sm">Eco Profile</span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">👤</div>
                  </div>

                  {/* Profile Section */}
                  <div className="flex flex-col items-center mb-8 relative">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 transition-all duration-1000 relative z-10 ${
                          offsetComplete ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110' : 'bg-slate-800 border-slate-700'
                      }`}>
                          {offsetComplete ? '🌱' : '👤'}
                      </div>
                      
                      {offsetComplete && (
                          <div className="absolute inset-0 flex items-center justify-center z-0">
                              <div className="w-24 h-24 rounded-full border-2 border-emerald-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                          </div>
                      )}

                      <h2 className="text-white font-black mt-4">Alex Martinez</h2>
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${offsetComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {offsetComplete ? 'Carbon Neutral Attendee' : 'Standard Attendee'}
                      </span>
                  </div>

                  {/* Emissions Breakdown */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Your Festival Footprint</span>
                      
                      <div className="space-y-3">
                          <div className="flex justify-between items-center">
                              <div className="flex items-center text-xs">
                                  <span className="mr-2">✈️</span> Flight (LAX ➔ JFK)
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">420 kg</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                              <div className="flex items-center text-xs">
                                  <span className="mr-2">🏨</span> Hotel Stay (3 Days)
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">30 kg</span>
                          </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-end">
                          <span className="text-[10px] uppercase text-slate-500">Total Emissions</span>
                          <span className="text-lg font-black font-mono text-white">450 kg <span className="text-xs text-slate-500">CO2e</span></span>
                      </div>
                  </div>

                  {/* Offset Action */}
                  <div className={`mt-auto mb-4 rounded-2xl p-5 border-2 transition-all duration-1000 ${
                      offsetComplete ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-900 border-slate-700'
                  }`}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-white">Offset Status</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${offsetComplete ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {offsetComplete ? '100% Offset' : '0% Offset'}
                          </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full mb-4 overflow-hidden relative">
                          <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                              offsetComplete ? 'w-full bg-emerald-500' : 'w-0 bg-emerald-500'
                          }`}></div>
                          {isOffsetting && <div className="absolute top-0 left-0 h-full w-full bg-emerald-500/20 animate-pulse"></div>}
                      </div>
                      
                      {offsetComplete ? (
                          <div className="w-full py-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 font-black text-xs uppercase tracking-widest text-center">
                              ✅ Offset Complete
                          </div>
                      ) : (
                          <button 
                              onClick={purchaseOffset}
                              disabled={isOffsetting}
                              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${
                                  isOffsetting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg'
                              }`}
                          >
                              {isOffsetting ? 'Processing API...' : 'Offset Now for $4.50'}
                          </button>
                      )}
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050e09] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Ecological Gamification:</span>
               Click <span className="text-white font-bold bg-emerald-600 px-1 rounded">Offset Now</span>. By calculating the exact carbon footprint based on travel data and presenting it in a gamified UI, attendees are incentivized to reduce their impact. The backend instantly calls the Patch.io Climate API, allowing the user to purchase a $4.50 micro-offset for a real-world forestry project. Their profile badge immediately turns Green, establishing social proof and encouraging other attendees to participate.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CarbonFootprintTracker;
