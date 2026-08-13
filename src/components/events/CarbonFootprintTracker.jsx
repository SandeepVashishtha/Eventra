/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CarbonFootprintTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Emissions Data (in kg CO2e)
  const [totalEmissions, setTotalEmissions] = useState(145020);
  const [offsetsPurchased, setOffsetsPurchased] = useState(120000);
  
  // Energy Mix (%)
  const [energyMix, setEnergyMix] = useState({
      solar: 35,
      wind: 25,
      fossil: 40
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Sustainability Engine initialized. Smart Grid API endpoint reachable.' }
  ]);

  useEffect(() => {
      let trackerLoop;
      
      if (isTracking) {
          trackerLoop = setInterval(() => {
              // Simulate real-time API data influx
              
              // Fluctuate energy mix slightly
              setEnergyMix(prev => {
                  const shift = (Math.random() - 0.5) * 2; // -1 to +1
                  return {
                      solar: Math.max(0, Math.min(100, prev.solar + shift)),
                      wind: Math.max(0, Math.min(100, prev.wind - (shift / 2))),
                      fossil: Math.max(0, Math.min(100, prev.fossil - (shift / 2)))
                  };
              });

              // Increase emissions based on fossil fuel dependency
              setTotalEmissions(prev => {
                  // If heavily relying on fossil, emissions go up faster
                  const increment = (energyMix.fossil / 100) * 15 + (Math.random() * 5);
                  return prev + increment;
              });

          }, 1000);
      }
      
      return () => { if (trackerLoop) clearInterval(trackerLoop); };
  }, [isTracking, energyMix.fossil]);

  const purchaseOffsets = () => {
      setIsPurchasing(true);
      addLog('ACTION', 'Initiating API call to Gold Standard Carbon Registry...');
      
      setTimeout(() => {
          const deficit = totalEmissions - offsetsPurchased;
          setOffsetsPurchased(prev => prev + deficit);
          setIsPurchasing(false);
          addLog('SUCCESS', `Successfully purchased ${deficit.toFixed(0)} kg CO2e offsets. Net Zero achieved.`);
      }, 1500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const netEmissions = totalEmissions - offsetsPurchased;
  const isNetZero = netEmissions <= 1; // Tolerance

  return (
    <div className="min-h-screen bg-[#06120b] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌍</span> Sustainability & Data Pipelines
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Carbon <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">Footprint Tracking</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals face massive backlash for their environmental impact, but organizers have no way to accurately track their carbon emissions in real-time, often relying on rough estimations months later. Eventra solves this by integrating the festival's software backend with third-party Smart Grid APIs to pull live energy mix data. This React "Sustainability Dashboard" calculates the live CO2 footprint and automates API calls to purchase verified carbon offset credits, ensuring a net-zero software footprint.
          </p>

          <div className="bg-[#0a1711] rounded-3xl p-6 border border-emerald-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-emerald-900/30 pb-4">
               <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Smart Grid Integration
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => {
                       setIsTracking(!isTracking);
                       addLog(isTracking ? 'WARN' : 'SYS', isTracking ? 'Halting Smart Grid API polling.' : 'Polling Smart Grid API (1000ms intervals).');
                   }}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isTracking ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                     'bg-emerald-900/40 text-emerald-400 border border-emerald-500 hover:bg-emerald-800/60'
                   }`}
                 >
                   {isTracking ? 'Halt Telemetry' : 'Begin Live Tracking'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Gross Emissions */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isTracking ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Gross CO2e Emissions
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isTracking ? 'text-rose-400' : 'text-slate-600'}`}>
                     {(totalEmissions / 1000).toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">Tons</span>
                 </div>
               </div>

               {/* Net Emissions */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isNetZero ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-amber-950/20 border-amber-900/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Net Carbon Footprint
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isNetZero ? 'text-emerald-400' : 'text-amber-400'}`}>
                     {Math.max(0, netEmissions / 1000).toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-1 pb-1">Tons</span>
                 </div>
               </div>

             </div>
             
             {/* API Action */}
             <div className="mb-4">
                 <button
                    onClick={purchaseOffsets}
                    disabled={isNetZero || isPurchasing}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                        isNetZero ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-500 cursor-not-allowed opacity-50' :
                        isPurchasing ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-wait' :
                        'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_rgba(13,148,136,0.4)]'
                    }`}
                 >
                     {isNetZero ? (
                         <><span className="mr-2">✅</span> NET ZERO ACHIEVED</>
                     ) : isPurchasing ? (
                         <><span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></span> PROCESSING API CALL...</>
                     ) : (
                         <><span className="mr-2">🌱</span> PURCHASE OFFSET CREDITS (API)</>
                     )}
                 </button>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040806] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Data Pipeline Log</span>
                 {isTracking && <span className="text-emerald-400 font-black animate-pulse">INGESTING DATA...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' : 'text-slate-400'
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
            
            {/* Sustainability Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[2rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Dashboard</span>
                      <span className="text-xs text-white font-bold">Eventra Sustainability</span>
                  </div>
                  {isNetZero ? (
                      <span className="text-xl">🌿</span>
                  ) : (
                      <span className="text-xl grayscale opacity-50">🏭</span>
                  )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border ${isNetZero ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-rose-950/30 border-rose-900/50'} flex items-center justify-between`}>
                      <div>
                          <h4 className={`text-sm font-black ${isNetZero ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isNetZero ? 'Net Zero Operation' : 'Carbon Deficit Detected'}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">Status based on real-time telemetry.</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isNetZero ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400 animate-pulse'}`}>
                          {isNetZero ? '✓' : '!'}
                      </div>
                  </div>
                  
                  {/* Live Energy Mix Chart (CSS Simulated) */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Live Smart Grid Mix</span>
                      
                      <div className="w-full h-8 flex rounded-md overflow-hidden bg-slate-900 border border-slate-700 shadow-inner">
                          <div className="bg-amber-400 transition-all duration-[1000ms] ease-out flex items-center justify-center" style={{ width: `${energyMix.solar}%` }}></div>
                          <div className="bg-sky-400 transition-all duration-[1000ms] ease-out flex items-center justify-center" style={{ width: `${energyMix.wind}%` }}></div>
                          <div className="bg-slate-500 transition-all duration-[1000ms] ease-out flex items-center justify-center" style={{ width: `${energyMix.fossil}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between mt-3 text-[9px] font-bold">
                          <div className="flex items-center text-amber-400"><span className="w-2 h-2 bg-amber-400 rounded-full mr-1"></span> Solar ({energyMix.solar.toFixed(1)}%)</div>
                          <div className="flex items-center text-sky-400"><span className="w-2 h-2 bg-sky-400 rounded-full mr-1"></span> Wind ({energyMix.wind.toFixed(1)}%)</div>
                          <div className="flex items-center text-slate-400"><span className="w-2 h-2 bg-slate-500 rounded-full mr-1"></span> Fossil ({energyMix.fossil.toFixed(1)}%)</div>
                      </div>
                  </div>
                  
                  {/* Offset Breakdown */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Carbon Ledger</span>
                      
                      <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                              <span className="text-xs text-slate-300">Generated Emissions</span>
                              <span className="text-xs font-mono text-rose-400 font-bold">{totalEmissions.toFixed(0)} kg</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                              <span className="text-xs text-slate-300">Offset Credits Applied</span>
                              <span className="text-xs font-mono text-emerald-400 font-bold">- {offsetsPurchased.toFixed(0)} kg</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                              <span className="text-xs font-black text-white">Net Balance</span>
                              <span className={`text-xs font-mono font-black ${isNetZero ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {Math.max(0, netEmissions).toFixed(0)} kg
                              </span>
                          </div>
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a1711] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Automated ESG Compliance:</span>
               Click <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Begin Live Tracking</span> to poll the grid API. As fossil fuel dependency increases emissions, the Net Balance grows. Click <span className="text-teal-400 font-bold bg-teal-900/40 border border-teal-500 px-1 rounded">Purchase Offset Credits</span> to trigger the automated purchase API and restore Net Zero.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CarbonFootprintTracker;
