/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveInventoryModel = () => {
  const [isMlActive, setIsMlActive] = useState(false);
  const [temperature, setTemperature] = useState(78);
  const [salesVelocity, setSalesVelocity] = useState(45); // units per hour
  
  const [inventory, setInventory] = useState(1200); // Current stock
  const [timeRemaining, setTimeRemaining] = useState('--');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'POS Data stream connected. Awaiting ML pipeline activation.' }
  ]);

  useEffect(() => {
      let mlInterval;
      
      if (isMlActive) {
          mlInterval = setInterval(() => {
              // Simulate fluctuating environmental data
              setTemperature(prev => {
                  const shift = Math.random() > 0.5 ? 2 : -1;
                  return Math.min(105, Math.max(75, prev + shift));
              });
              
              // Sales velocity correlates to temperature
              const baseVelocity = 45;
              const heatMultiplier = temperature > 90 ? 2.5 : temperature > 85 ? 1.5 : 1.0;
              const randomSpike = Math.floor(Math.random() * 20);
              const newVelocity = Math.floor(baseVelocity * heatMultiplier) + randomSpike;
              
              setSalesVelocity(newVelocity);

              // Update inventory (simulating faster time)
              setInventory(prev => Math.max(0, prev - Math.floor(newVelocity / 10)));

              // Run Time-Series Forecast (ARIMA/Prophet mock)
              if (inventory > 0) {
                  const minutesLeft = Math.floor((inventory / newVelocity) * 60);
                  setTimeRemaining(`${minutesLeft} mins`);
                  
                  if (minutesLeft < 45 && Math.random() > 0.7) {
                      addLog('CRIT', `Prophet ML Model Alert: Bottled Water projected to deplete in ${minutesLeft} mins. Triggering restock runner.`);
                  } else if (Math.random() > 0.9) {
                      addLog('SYS', `ARIMA forecast recalculated based on ${temperature.toFixed(0)}°F spike. Velocity: ${newVelocity}/hr.`);
                  }
              } else {
                  setTimeRemaining('DEPLETED');
              }

          }, 1000);
      } else {
          // Reset
          setTemperature(78);
          setSalesVelocity(45);
          setInventory(1200);
          setTimeRemaining('--');
      }
      
      return () => { if (mlInterval) clearInterval(mlInterval); };
  }, [isMlActive, temperature, inventory]);

  const toggleML = () => {
      setIsMlActive(!isMlActive);
      if (!isMlActive) {
          addLog('ACTION', 'Time-Series Forecasting Engine Engaged (Prophet).');
      } else {
          addLog('WARN', 'Forecasting offline. Vendor operating blindly.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper for the chart bars
  const renderChart = () => {
      const bars = [];
      const totalCapacity = 1500;
      
      for (let i = 0; i < 12; i++) {
          // Simulate historical data drops, then the current projection
          let height;
          let isProjection = false;
          
          if (i < 8) {
              // Historical (past 8 hours)
              height = Math.max(10, (totalCapacity - (i * 80)) / totalCapacity * 100);
          } else if (i === 8) {
              // Current
              height = (inventory / totalCapacity) * 100;
          } else {
              // Future projection (dotted/faded)
              isProjection = true;
              height = isMlActive ? Math.max(0, ((inventory - ((i - 8) * salesVelocity)) / totalCapacity) * 100) : 0;
          }

          bars.push(
              <div key={i} className="flex flex-col items-center justify-end h-full w-full mx-1 group">
                  <div 
                      className={`w-full rounded-t-sm transition-all duration-700 ${
                          isProjection ? 'bg-orange-500/30 border-t-2 border-dashed border-orange-500' : 
                          height < 30 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-[6px] text-slate-500 mt-1 uppercase">
                      {isProjection ? `+${i-8}h` : `-${8-i}h`}
                  </span>
              </div>
          );
      }
      return bars;
  };

  return (
    <div className="min-h-screen bg-[#0f0705] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Machine Learning & Data Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Inventory <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-rose-500">Depletion Model</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Food vendors consistently run out of high-demand items (like water and burgers) by 6 PM, losing massive amounts of revenue and leaving attendees hungry. Eventra solves this by ingesting real-time POS data streams and training a time-series forecasting model (like Facebook Prophet). The model analyzes live sales velocity against temperature APIs. The dashboard preemptively flashes warnings to vendors, allowing them to dispatch runners to cold storage before they run out.
          </p>

          <div className="bg-[#1a0f0b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Forecasting Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleML}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isMlActive ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                     'bg-orange-600 text-white border border-orange-500 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                   {isMlActive ? 'Halt Forecasting' : 'Engage ML Time-Series'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Environmental Telemetry */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 temperature > 90 ? 'bg-red-950/30 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Live Temp API
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${temperature > 90 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                     {temperature.toFixed(0)}°
                   </span>
                 </div>
               </div>

               {/* Sales Velocity */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isMlActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   POS Sales Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isMlActive ? 'text-orange-400' : 'text-slate-600'}`}>
                     {salesVelocity}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1 uppercase">Units/Hr</span>
                 </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#0a0604] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Pipeline & ML Logs</span>
                 {isMlActive && <span className="text-orange-400 font-black animate-pulse">FORECASTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-red-600 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* Vendor POS Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Vendor POS Terminal</span>
                      <span className="text-xs text-white font-bold">Item: Bottled Water (500ml)</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative">
                  
                  {/* Current Inventory Hero */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center mb-6">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Current On-Hand Stock</span>
                      <span className="text-5xl font-black font-mono text-white">{inventory.toLocaleString()}</span>
                  </div>

                  {/* ML Projection Warning */}
                  {isMlActive && inventory > 0 ? (
                      <div className={`rounded-xl p-4 border transition-all duration-500 ${
                          parseInt(timeRemaining) < 45 ? 'bg-red-900/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-orange-900/20 border-orange-500/50'
                      }`}>
                          <div className="flex items-center mb-2">
                              <span className="text-xl mr-2">🤖</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${parseInt(timeRemaining) < 45 ? 'text-red-400' : 'text-orange-400'}`}>ML Depletion Forecast</span>
                          </div>
                          
                          <div className="flex justify-between items-end">
                              <span className="text-xs text-slate-300">Est. Time to Zero:</span>
                              <span className={`text-2xl font-black font-mono ${parseInt(timeRemaining) < 45 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                                  {timeRemaining}
                              </span>
                          </div>
                          
                          {parseInt(timeRemaining) < 45 && (
                              <div className="mt-3 bg-red-600 text-white text-[9px] font-black uppercase text-center py-2 rounded">
                                  DISPATCH RUNNER TO COLD STORAGE NOW
                              </div>
                          )}
                      </div>
                  ) : !isMlActive ? (
                      <div className="rounded-xl p-4 bg-slate-900 border border-slate-800 text-center flex items-center justify-center flex-col h-32">
                          <span className="text-slate-600 text-2xl mb-2">🙈</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Forecasting Disabled.<br/>Flying Blind.</span>
                      </div>
                  ) : (
                      <div className="rounded-xl p-4 bg-red-900/30 border border-red-500 text-center">
                          <span className="text-red-500 font-black text-2xl uppercase">OUT OF STOCK</span>
                      </div>
                  )}

                  {/* Micro Chart */}
                  <div className="mt-auto h-32 pt-6">
                      <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-2 block">Burn Rate Trajectory</span>
                      <div className="h-20 flex items-end justify-between border-b border-slate-800 pb-1">
                          {renderChart()}
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#1a0f0b] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Time-Series Forecasting:</span>
               Click <span className="text-white font-bold bg-orange-600 border border-orange-500 px-1 rounded">Engage ML</span>. The system correlates POS sales velocity with temperature API spikes. The UI renders historical burn rates (solid bars) and future projections (dotted bars). When the model calculates that Bottled Water will hit zero in under 45 minutes, the POS terminal flashes a <span className="text-red-500 font-black">CRITICAL</span> alert to preemptively restock.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveInventoryModel;
