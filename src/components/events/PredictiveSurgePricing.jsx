/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveSurgePricing = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(150); // Base price $150
  
  // RL Metrics
  const [projectedRevenue, setProjectedRevenue] = useState(45200); 
  const [conversionRate, setConversionRate] = useState(4.2); // %
  const [aiEpochs, setAiEpochs] = useState(12450); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Reinforcement Learning (PPO) agent loaded.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Awaiting real-time API telemetry to optimize pricing policy.' }
  ]);

  // Environment State
  const [crowdDensity, setCrowdDensity] = useState(40); // %
  const [weather, setWeather] = useState('SUNNY'); // SUNNY, RAIN
  const [vipCapacity, setVipCapacity] = useState(85); // % filled

  useEffect(() => {
    let loop;
    
    if (engineActive) {
      loop = setInterval(() => {
          setAiEpochs(prev => prev + 1);
          
          // AI adjusts pricing based on environment
          let targetPrice = 150; // Base
          
          if (crowdDensity > 80) targetPrice += 50; // High crowd = people want escape to VIP
          if (weather === 'RAIN') targetPrice += 40; // Rain = people want VIP tents
          if (vipCapacity > 95) targetPrice += 100; // Almost full = scarcity premium
          if (vipCapacity < 50) targetPrice -= 30; // Empty = discount to fill
          
          // Add some RL exploration noise
          targetPrice += Math.floor(Math.random() * 10) - 5;
          
          // Smooth the transition
          setCurrentPrice(prev => {
              const diff = targetPrice - prev;
              return prev + (diff * 0.2); // ease towards target
          });
          
          // Update revenue metrics
          setProjectedRevenue(prev => prev + (Math.random() * 50));
          
          if (Math.random() > 0.8) {
              setConversionRate(3.5 + (Math.random() * 2));
              addLog('ACTION', `RL Agent observed new state [Density:${crowdDensity}%, WX:${weather}, Cap:${vipCapacity}%]`);
              addLog('SYS', `Adjusting Q-Value. New dynamic price set to $${targetPrice.toFixed(0)}`);
          }
      }, 1500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [engineActive, crowdDensity, weather, vipCapacity]);

  const toggleEngine = () => {
      setEngineActive(!engineActive);
      if (!engineActive) {
          addLog('SUCCESS', 'RL Pricing Engine activated. Consuming API streams.');
      } else {
          addLog('WARN', 'Engine paused. Reverting to static $150 base pricing.');
          setCurrentPrice(150);
      }
  };

  const simulateWeather = () => {
      const newWx = weather === 'SUNNY' ? 'RAIN' : 'SUNNY';
      setWeather(newWx);
      addLog('CRIT', `External API Event: Weather changed to ${newWx}`);
  };

  const simulateCrowdSurge = () => {
      setCrowdDensity(95);
      addLog('WARN', 'External API Event: Main Stage crowd density spiked to 95%');
  };

  const simulateVipSellout = () => {
      setVipCapacity(98);
      addLog('WARN', 'External API Event: VIP capacity reached 98% (Scarcity)');
  };
  
  const resetEnv = () => {
      setCrowdDensity(40);
      setWeather('SUNNY');
      setVipCapacity(60);
      addLog('SYS', 'Environment reset to baseline conditions.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0902] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> FinTech & Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Surge Pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">via Reinforcement Learning</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Last-minute VIP upgrades are traditionally sold at a static price. Organizers leave money on the table when demand is extremely high, and VIP areas look empty when demand is low because the static price is too steep. Eventra solves this by deploying a backend Reinforcement Learning (RL) pricing engine. The AI analyzes real-time API variables (crowd density, weather, remaining capacity) and dynamically adjusts the price of a VIP upgrade in the mobile app every 5 minutes, maximizing yield and ensuring VIP areas operate at exactly 95% capacity.
          </p>

          <div className="bg-[#141005] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> AI Pricing Engine Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Halt Pricing AI' : 'Activate RL Agent'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Current Dynamic Price */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Dynamic Upgrade Price
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-300 ${
                     engineActive ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     ${currentPrice.toFixed(0)}
                   </span>
                 </div>
               </div>

               {/* Projected Revenue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Yield
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-emerald-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     engineActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {(projectedRevenue / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>
               
               {/* Conversion Rate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Conv. Rate
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {conversionRate.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050401] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>RL Model (PPO) Ledger</span>
                 {engineActive && <span className="text-amber-400 font-black animate-pulse">OPTIMIZING Q-VALUES...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-500 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
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
            
            {/* Real-time Environment Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                engineActive ? 'bg-[#0f0c05] border-[#1e293b]' : 'bg-slate-900 border-[#1e293b]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">RL ENVIRONMENT STATE</span>
                <span className={`text-[8px] font-mono ${engineActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    EPOCH: {aiEpochs}
                </span>
              </div>

              <div className="flex-1 flex flex-col pt-12 px-4 pb-4">
                  
                  {/* External Variables */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 flex flex-col items-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Weather API</span>
                          <span className="text-3xl mb-1">{weather === 'SUNNY' ? '☀️' : '🌧️'}</span>
                          <span className={`text-[10px] font-mono ${weather === 'RAIN' ? 'text-blue-400' : 'text-yellow-400'}`}>{weather}</span>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 flex flex-col items-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Crowd Density</span>
                          <div className="w-full h-2 bg-slate-800 rounded-full mt-2 mb-1 overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${crowdDensity > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${crowdDensity}%`}}></div>
                          </div>
                          <span className="text-[10px] font-mono text-white">{crowdDensity}%</span>
                      </div>
                      <div className="col-span-2 bg-slate-900/80 border border-slate-700 rounded-lg p-3 flex flex-col items-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">VIP Lounge Capacity</span>
                          <div className="w-full h-4 bg-slate-800 rounded-full mt-1 mb-1 overflow-hidden border border-slate-700">
                              <div className={`h-full transition-all duration-500 ${vipCapacity > 90 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${vipCapacity}%`}}></div>
                          </div>
                          <span className="text-[10px] font-mono text-white">{vipCapacity}% Full</span>
                      </div>
                  </div>

                  {/* Mobile App UI Mockup */}
                  <div className="flex-1 bg-black border border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
                      <div className="h-24 bg-gradient-to-br from-yellow-900/40 to-amber-900/20 flex items-center justify-center border-b border-yellow-900/50">
                          <span className="text-5xl drop-shadow-lg">👑</span>
                      </div>
                      <div className="p-4 flex flex-col flex-1 text-center justify-center">
                          <h4 className="text-white font-black uppercase tracking-widest mb-1">Upgrade to VIP</h4>
                          <p className="text-[10px] text-slate-400 mb-4">Escape the crowd. Private bars. Express entry.</p>
                          
                          <button className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-lg flex justify-between items-center px-4 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all">
                              <span>Upgrade Now</span>
                              <div className="flex items-center bg-black/20 px-2 py-1 rounded">
                                  {engineActive && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                                  )}
                                  <span className="font-mono text-lg">${currentPrice.toFixed(0)}</span>
                              </div>
                          </button>
                      </div>
                  </div>
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#141005] p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
               <button 
                   onClick={simulateWeather}
                   disabled={!engineActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !engineActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60'
                   }`}
                 >
                   Toggle Rain
               </button>

               <button 
                   onClick={simulateCrowdSurge}
                   disabled={!engineActive || crowdDensity > 90}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !engineActive || crowdDensity > 90 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60'
                   }`}
                 >
                   Crowd Surge
               </button>

               <button 
                   onClick={simulateVipSellout}
                   disabled={!engineActive || vipCapacity > 95}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !engineActive || vipCapacity > 95 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-500 hover:bg-orange-900/60'
                   }`}
                 >
                   VIP Full
               </button>

               <button 
                   onClick={resetEnv}
                   disabled={!engineActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !engineActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                   }`}
                 >
                   Reset Env
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveSurgePricing;
