/* eslint-disable */
import React, { useState, useEffect } from 'react';

const IotGeneratorTelemetry = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Grid Metrics
  const [fuelSaved, setFuelSaved] = useState(0); // Gallons
  const [carbonReduced, setCarbonReduced] = useState(0); // kg
  const [overallEfficiency, setOverallEfficiency] = useState(58); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'AWS IoT Core MODBUS bridge established.' },
    { id: 2, time: '20:00:02', type: 'WARN', msg: 'GEN_1 approaching critical thermal limits.' }
  ]);

  // Visualizer State - Generator Nodes
  // Optimal diesel generator efficiency is usually around 70-80% load.
  // Low load (< 30%) causes wet stacking. High load (> 90%) is dangerous.
  const [generators, setGenerators] = useState([
      { id: 'GEN_MAIN_STAGE', capacity: 500, load: 475, status: 'CRITICAL', loads: ['Audio PA', 'Lighting Rig', 'Video Walls', 'Chill Zone AC'] },
      { id: 'GEN_FOOD_COURT', capacity: 250, load: 45, status: 'INEFFICIENT', loads: ['Vendor Fridges', 'POS Tents'] },
      { id: 'GEN_CAMPING', capacity: 250, load: 60, status: 'INEFFICIENT', loads: ['Festoon Lighting', 'Shower Trailers'] }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (isOptimizing) {
              setFuelSaved(prev => prev + (Math.random() * 2));
              setCarbonReduced(prev => prev + (Math.random() * 5.4));
              setOverallEfficiency(prev => Math.min(84, prev + 1.5));
          } else {
              // Fluctuate baseline inefficiency
              setOverallEfficiency(58 + (Math.random() * 4 - 2));
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isOptimizing]);

  const balanceLoad = () => {
      if (!systemActive || isOptimizing) return;
      
      addLog('ACTION', 'Initiating Dynamic Load Balancing via smart breakers...');
      
      // Step 1: Analyze
      setTimeout(() => {
          addLog('SYS', 'Analyzing engine BSFC (Brake Specific Fuel Consumption) curves.');
          
          // Step 2: Execute Shifts
          setTimeout(() => {
              setIsOptimizing(true);
              
              setGenerators([
                  // Shift 'Chill Zone AC' to Food Court, shift some Video power to Camping (abstractly)
                  { id: 'GEN_MAIN_STAGE', capacity: 500, load: 380, status: 'OPTIMAL', loads: ['Audio PA', 'Lighting Rig', 'Video Walls (Primary)'] },
                  { id: 'GEN_FOOD_COURT', capacity: 250, load: 180, status: 'OPTIMAL', loads: ['Vendor Fridges', 'POS Tents', 'Chill Zone AC'] },
                  { id: 'GEN_CAMPING', capacity: 250, load: 195, status: 'OPTIMAL', loads: ['Festoon Lighting', 'Shower Trailers', 'Video Walls (Delay)'] }
              ]);

              addLog('SUCCESS', 'Non-critical loads shifted successfully. Wet-stacking prevented.');
              addLog('SUCCESS', 'All engines operating within peak efficiency curve (70-80%).');
          }, 1500);

      }, 800);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Telemetry stream active. Monitoring 3 primary power nodes.');
    } else {
      setSystemActive(false);
      setIsOptimizing(false);
      setFuelSaved(0);
      setCarbonReduced(0);
      setGenerators([
          { id: 'GEN_MAIN_STAGE', capacity: 500, load: 475, status: 'CRITICAL', loads: ['Audio PA', 'Lighting Rig', 'Video Walls', 'Chill Zone AC'] },
          { id: 'GEN_FOOD_COURT', capacity: 250, load: 45, status: 'INEFFICIENT', loads: ['Vendor Fridges', 'POS Tents'] },
          { id: 'GEN_CAMPING', capacity: 250, load: 60, status: 'INEFFICIENT', loads: ['Festoon Lighting', 'Shower Trailers'] }
      ]);
      addLog('WARN', 'IoT bridge disconnected. Smart breakers reverted to static state.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Energy Grid Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            IoT Generator Telemetry & <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-500 to-teal-500">Dynamic Load Balancing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive diesel generators run continuously at inefficient loads to handle unpredictable peak spikes, wasting thousands of gallons of fuel through "wet-stacking" and generating excessive carbon emissions. Eventra solves this by ingesting real-time MODBUS telemetry (voltage, RPM, fuel consumption) from all stage generators via AWS IoT Core. A background worker analyzes the thermodynamic efficiency curves and dynamically shifts non-critical power loads (like chill-zone AC) to different generator nodes, keeping all engines running at their absolute peak fuel efficiency percentage.
          </p>

          <div className="bg-[#0b0f14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🎛️</span> AWS IoT Core Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Telemetry Stream' : 'Connect MODBUS Gateway'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Efficiency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isOptimizing ? 'bg-emerald-950/40 border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                 systemActive ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Grid Efficiency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     isOptimizing ? 'text-emerald-400' : 
                     systemActive ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {overallEfficiency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Fuel Saved */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isOptimizing ? 'bg-lime-950/40 border-lime-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fuel Saved
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isOptimizing ? 'text-lime-400' : 'text-slate-600'
                   }`}>
                     {fuelSaved.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">gal</span>
                 </div>
               </div>
               
               {/* Carbon Reduced */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isOptimizing ? 'bg-teal-950/40 border-teal-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   CO2 Emissions Reduced
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isOptimizing ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {carbonReduced.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030406] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Power Orchestrator Ledger</span>
                 {isOptimizing && <span className="text-lime-400 font-black animate-pulse">BSFC CURVES OPTIMIZED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Grid UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[480px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#030406]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-lime-400">MICRO-GRID STATUS</span>
                <span className={`text-[8px] font-mono ${isOptimizing ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isOptimizing ? 'BALANCED' : 'UNBALANCED'}
                </span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 p-6 overflow-y-auto">
                  
                  {!systemActive ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                         <span className="text-4xl opacity-50 mb-4">🔌</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sensors Offline</span>
                     </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                        
                        {generators.map((gen, idx) => {
                            const loadPercentage = (gen.load / gen.capacity) * 100;
                            
                            // Determine visual state based on load
                            let stateColor = 'bg-slate-700';
                            let textColor = 'text-slate-400';
                            let barColor = 'bg-slate-500';
                            let glow = '';
                            
                            if (gen.status === 'CRITICAL') {
                                stateColor = 'bg-red-950/40 border-red-900/50';
                                textColor = 'text-red-400';
                                barColor = 'bg-red-500';
                                glow = 'shadow-[0_0_15px_rgba(239,68,68,0.4)]';
                            } else if (gen.status === 'INEFFICIENT') {
                                stateColor = 'bg-amber-950/40 border-amber-900/50';
                                textColor = 'text-amber-400';
                                barColor = 'bg-amber-500';
                            } else if (gen.status === 'OPTIMAL') {
                                stateColor = 'bg-emerald-950/30 border-emerald-900/50';
                                textColor = 'text-emerald-400';
                                barColor = 'bg-emerald-500';
                                glow = 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';
                            }

                            return (
                                <div key={gen.id} className={`p-4 rounded-xl border transition-all duration-1000 ${stateColor} ${glow}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>
                                            {gen.id}
                                        </span>
                                        <span className={`text-xs font-mono font-bold ${textColor}`}>
                                            {gen.load} / {gen.capacity} kW
                                        </span>
                                    </div>
                                    
                                    {/* Load Bar */}
                                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden mb-3 border border-slate-800 relative">
                                        {/* Optimal Zone Marker */}
                                        <div className="absolute top-0 bottom-0 left-[70%] w-[15%] bg-emerald-500/20 z-10 border-x border-emerald-500/30"></div>
                                        
                                        <div 
                                            className={`h-full transition-all duration-1000 ease-in-out relative z-20 ${barColor}`}
                                            style={{ width: `${loadPercentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Active Loads (Tags) */}
                                    <div className="flex flex-wrap gap-1">
                                        {gen.loads.map(load => (
                                            <span key={load} className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-colors duration-1000 ${
                                                isOptimizing ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}>
                                                {load}
                                            </span>
                                        ))}
                                    </div>

                                    {gen.status === 'CRITICAL' && (
                                        <div className="mt-2 text-[8px] font-black text-red-500 uppercase flex items-center animate-pulse">
                                            <span className="mr-1">⚠️</span> Warning: Load exceeds thermal limit
                                        </div>
                                    )}
                                    {gen.status === 'INEFFICIENT' && (
                                        <div className="mt-2 text-[8px] font-bold text-amber-500 flex items-center">
                                            <span className="mr-1">ℹ️</span> Inefficient: Wet-stacking likely
                                        </div>
                                    )}
                                    {gen.status === 'OPTIMAL' && (
                                        <div className="mt-2 text-[8px] font-bold text-emerald-400 flex items-center">
                                            <span className="mr-1">✅</span> Operating at peak BSFC efficiency
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0b0f14] p-4 rounded-xl border border-slate-800">
               
               <button 
                   onClick={balanceLoad}
                   disabled={!systemActive || isOptimizing}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || isOptimizing ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-lime-950/40 border-lime-600 text-lime-400 hover:bg-lime-900/60 shadow-[0_0_15px_rgba(132,204,22,0.3)]'
                   }`}
                 >
                   ⚡ Engage Dynamic Load Balancer
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default IotGeneratorTelemetry;
