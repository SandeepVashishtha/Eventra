/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicWeatherPricing = () => {
  const [weatherState, setWeatherState] = useState('SUNNY'); // SUNNY, THUNDERSTORM
  const [ticketPrice, setTicketPrice] = useState(150.00);
  const [isProcessing, setIsProcessing] = useState(false);
  const [salesVelocity, setSalesVelocity] = useState(42); // tickets per hour
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Cron job polling National Weather Service API (us-east-1).' }
  ]);

  const toggleWeather = () => {
      if (isProcessing) return;
      setIsProcessing(true);
      
      const newWeather = weatherState === 'SUNNY' ? 'THUNDERSTORM' : 'SUNNY';
      
      addLog('ACTION', `Meteorological Webhook Received: Forecast updated to ${newWeather}.`);
      
      setTimeout(() => {
          setWeatherState(newWeather);
          
          if (newWeather === 'THUNDERSTORM') {
              addLog('WARN', 'Severe weather detected. Walk-up sales velocity projected to hit 0.');
              addLog('SYS', 'Executing dynamic pricing algorithm...');
              
              setTimeout(() => {
                  setTicketPrice(99.00); // 34% drop
                  setSalesVelocity(115); // Velocity increases due to discount
                  setIsProcessing(false);
                  addLog('SUCCESS', 'Price dropped to $99.00. "Rain or Shine" marketing banner injected to frontend.');
              }, 1500);
          } else {
              addLog('SYS', 'Weather clear. Restoring baseline algorithmic pricing ($150.00).');
              setTimeout(() => {
                  setTicketPrice(150.00);
                  setSalesVelocity(42);
                  setIsProcessing(false);
                  addLog('SUCCESS', 'Pricing matrix normalized. Banner removed.');
              }, 1500);
          }
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020812] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛅</span> Algorithmic Pricing & FinTech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Ticket Pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-500">Weather Forensics</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a sudden thunderstorm is forecasted for day 3, walk-up ticket sales drop to zero, leaving the festival with massive unsold capacity and lost Food & Beverage revenue. Eventra solves this with an algorithmic pricing engine. The backend continuously polls real-time meteorological APIs. If severe rain is predicted, the algorithm automatically executes a percentage drop on remaining ticket inventory and flashes a "Rain or Shine" discount banner, maximizing capacity utilization before the storm even hits.
          </p>

          <div className="bg-[#051121] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Meteorological API Controls
               </h3>
               
               <button 
                   onClick={toggleWeather}
                   disabled={isProcessing}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isProcessing ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     weatherState === 'SUNNY' ? 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 
                     'bg-amber-600 text-white hover:bg-amber-500 border border-amber-500'
                   }`}
               >
                   {isProcessing ? 'Fetching API Data...' : weatherState === 'SUNNY' ? '⛈️ Force API Thunderstorm' : '☀️ Restore Sunny Forecast'}
               </button>
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 {/* Live Weather Telemetry */}
                 <div className={`border rounded-xl p-4 flex flex-col justify-center transition-all duration-500 ${
                     weatherState === 'SUNNY' ? 'bg-amber-950/20 border-amber-900/50' : 'bg-indigo-950/40 border-indigo-900/70'
                 }`}>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Live Weather Data (NWS)</span>
                     <div className="flex items-center">
                         <span className="text-4xl mr-4">{weatherState === 'SUNNY' ? '☀️' : '⛈️'}</span>
                         <div className="flex flex-col">
                             <span className={`text-xl font-black ${weatherState === 'SUNNY' ? 'text-amber-400' : 'text-indigo-400'}`}>
                                 {weatherState === 'SUNNY' ? 'Clear Skies' : 'Severe Storm'}
                             </span>
                             <span className="text-[10px] text-slate-400 font-mono mt-1">Precipitation: {weatherState === 'SUNNY' ? '0%' : '98%'}</span>
                         </div>
                     </div>
                 </div>

                 {/* Algorithmic Demand Metrics */}
                 <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Sales Velocity Telemetry</span>
                     <div className="flex items-end space-x-2">
                         <span className={`text-3xl font-black font-mono transition-colors ${weatherState === 'THUNDERSTORM' ? 'text-emerald-400' : 'text-white'}`}>
                             {salesVelocity}
                         </span>
                         <span className="text-xs text-slate-400 pb-1">tx/hour</span>
                     </div>
                     {/* Velocity Chart abstract */}
                     <div className="absolute bottom-0 left-0 w-full h-8 opacity-20 flex items-end justify-between px-2">
                         <div className="w-2 bg-emerald-500 h-[20%]"></div>
                         <div className="w-2 bg-emerald-500 h-[30%]"></div>
                         <div className="w-2 bg-emerald-500 h-[25%]"></div>
                         <div className="w-2 bg-emerald-500 h-[40%]"></div>
                         <div className="w-2 bg-emerald-500 h-[35%]"></div>
                         <div className="w-2 bg-emerald-500 h-[45%]"></div>
                         <div className={`w-2 transition-all duration-1000 ${weatherState === 'THUNDERSTORM' ? 'bg-emerald-500 h-[90%]' : 'bg-emerald-500 h-[40%]'}`}></div>
                         <div className={`w-2 transition-all duration-1000 delay-100 ${weatherState === 'THUNDERSTORM' ? 'bg-emerald-500 h-[100%]' : 'bg-emerald-500 h-[42%]'}`}></div>
                     </div>
                 </div>
                 
             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#02050a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Pricing Algorithm Logs</span>
                 {isProcessing && <span className="text-blue-400 font-black animate-pulse">RECALCULATING MATRIX...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'WARN' ? 'text-rose-500 font-bold bg-rose-950 px-1 rounded' :
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
            
            {/* Mobile Web E-Commerce Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-20"></div>
              
              {/* Browser Bar */}
              <div className="pt-10 pb-2 px-4 bg-slate-800 border-b border-slate-700 flex justify-center">
                  <div className="bg-slate-900 w-full rounded-md text-[10px] text-slate-500 py-1.5 px-3 text-center font-mono">
                      🔒 tickets.eventra.com
                  </div>
              </div>

              {/* App Content */}
              <div className="flex-1 bg-white flex flex-col relative overflow-y-auto">
                  
                  {/* Hero Image */}
                  <div className={`h-40 relative flex flex-col justify-end p-4 transition-all duration-1000 ${
                      weatherState === 'SUNNY' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-slate-700 to-indigo-900'
                  }`}>
                      {weatherState === 'THUNDERSTORM' && (
                          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBMMTAgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>
                      )}
                      <h1 className="text-white font-black text-3xl shadow-sm z-10 relative">Day 3 Pass</h1>
                      <span className="text-white/80 text-xs font-bold shadow-sm z-10 relative">General Admission</span>
                  </div>

                  {/* Dynamic Weather Banner */}
                  <div className={`overflow-hidden transition-all duration-700 ${weatherState === 'THUNDERSTORM' ? 'max-h-24' : 'max-h-0'}`}>
                      <div className="bg-blue-600 text-white p-3 flex items-center justify-between shadow-inner">
                          <div className="flex items-center">
                              <span className="text-2xl mr-2 animate-bounce">☔</span>
                              <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest">Rain or Shine Flash Sale!</span>
                                  <span className="text-[9px] opacity-80">Storm incoming. Grab a poncho and rave on.</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="p-5 flex flex-col items-center border-b border-slate-100">
                      
                      <div className="relative mb-2">
                          <div className="flex items-start justify-center">
                              <span className="text-slate-400 text-lg font-bold mt-1 mr-1">$</span>
                              <span className={`text-5xl font-black transition-all duration-500 ${weatherState === 'THUNDERSTORM' ? 'text-blue-600 scale-110' : 'text-slate-800'}`}>
                                  {ticketPrice.toFixed(0)}
                              </span>
                          </div>
                          
                          {/* Strikethrough original price if discounted */}
                          <div className={`absolute -top-3 -right-6 text-slate-400 font-bold transition-all duration-500 ${weatherState === 'THUNDERSTORM' ? 'opacity-100' : 'opacity-0 scale-90'}`}>
                              <span className="line-through decoration-rose-500 decoration-2">$150</span>
                          </div>
                      </div>

                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Price (Includes Fees)</span>
                  </div>

                  {/* Checkout Button */}
                  <div className="p-5 mt-auto">
                      <button className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-colors ${
                          weatherState === 'THUNDERSTORM' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-black'
                      }`}>
                          Add to Cart
                      </button>
                      <div className="text-center mt-3 text-[9px] text-slate-400 uppercase font-bold tracking-widest flex justify-center items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                          High Demand: {salesVelocity} purchased in last hour
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#051121] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Algorithmic Demand Shaping:</span>
               Click <span className="text-white font-bold bg-indigo-600 px-1 rounded">Force API Thunderstorm</span>. Instead of waiting for a human promoter to realize it's about to rain and scramble to change Stripe prices, the backend algorithm intercepts the meteorological API webhook. It instantly executes a 34% dynamic price drop on the frontend E-Commerce store and injects a psychological "Rain or Shine Flash Sale" banner. As seen in the telemetry, this discount successfully surges the sales velocity, ensuring capacity is maximized before the storm hits.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicWeatherPricing;
