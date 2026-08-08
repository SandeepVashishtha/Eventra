/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AGVInventoryRebalancer = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [barAStatus, setBarAStatus] = useState('NOMINAL'); // NOMINAL, DEPLETING, REPLENISHING
  
  // Inventory Metrics
  const [barAInventory, setBarAInventory] = useState(120); // bottles
  const [warehouseInventory, setWarehouseInventory] = useState(5000); // bottles
  const [depletionRate, setDepletionRate] = useState(1); // bottles per second
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '19:00:00', type: 'SYS', msg: 'POS Predictive Depletion Model online.' },
    { id: 2, time: '19:00:02', type: 'SYS', msg: 'AGV Swarm (24 Units) standing by in central warehouse.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (fleetActive && barAStatus === 'NOMINAL') {
      loop = setInterval(() => {
        setBarAInventory(prev => Math.max(80, prev - (Math.random() > 0.5 ? 1 : 0)));
      }, 1000);
    } else if (barAStatus === 'DEPLETING') {
      loop = setInterval(() => {
        setBarAInventory(prev => Math.max(15, prev - depletionRate));
        
        if (barAInventory <= 35) {
          setBarAStatus('REPLENISHING');
          addLog('CRIT', 'Bar A vodka inventory critical (< 35). Predicted exhaustion: 8 minutes.');
          
          setTimeout(() => {
            addLog('ACTION', 'Auto-dispatching AGV-07 via underground perimeter tunnel.');
            addLog('SYS', 'AGV-07 loaded with 48 units. ETA to Bar A: 3 minutes.');
          }, 800);
        }
      }, 800);
    } else if (barAStatus === 'REPLENISHING') {
      loop = setInterval(() => {
        // Simulating AGV transit time, then instant restock
        setBarAInventory(prev => {
          if (prev < 40) return prev; // Wait for AGV
          return prev;
        });
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [fleetActive, barAStatus, barAInventory, depletionRate]);

  const triggerRush = () => {
    if (fleetActive && barAStatus === 'NOMINAL') {
      setBarAStatus('DEPLETING');
      setDepletionRate(3); // Fast depletion
      addLog('WARN', 'Massive crowd surge at Bar A. POS velocity spiked 400%.');
    }
  };

  const completeRestock = () => {
    setBarAStatus('NOMINAL');
    setBarAInventory(prev => prev + 48);
    setWarehouseInventory(prev => prev - 48);
    setDepletionRate(1);
    addLog('SUCCESS', 'AGV-07 arrived at Bar A. Inventory restocked. Revenue bottleneck averted.');
  };

  const toggleFleet = () => {
    if (!fleetActive) {
      setFleetActive(true);
      addLog('SYS', 'AGV Logistics Swarm armed. Monitoring live POS velocity.');
    } else {
      setFleetActive(false);
      setBarAStatus('NOMINAL');
      addLog('WARN', 'AGV Fleet offline. Relying on human runners (Inefficient).');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#061015] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/40 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🤖</span> Autonomous Fulfillment
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Drink Inventory <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Rebalancing via AGV Swarm</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During peak festival hours, high-traffic bars quickly run out of popular inventory like vodka, resulting in lost revenue and angry attendees, while human runners fail to push heavy restock carts through 80,000 tightly packed people. Eventra solves this by integrating the live POS system with a predictive AI and a fleet of Automated Guided Vehicles (AGVs). When the system detects a depletion rate that will exhaust a bar's supply within 20 minutes, it automatically dispatches an AGV from the central warehouse via dedicated perimeter tunnels to restock the bar just-in-time.
          </p>

          <div className="bg-[#0b161c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">📊</span> POS Predictive Logistics
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleFleet}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     fleetActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                   }`}
                 >
                   {fleetActive ? 'Disable Auto-Fulfillment' : 'Engage AGV Swarm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Bar A Inventory */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 barAStatus === 'REPLENISHING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' :
                 barAStatus === 'DEPLETING' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 fleetActive ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Bar A: Vodka Stock
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     barAStatus === 'REPLENISHING' ? 'text-indigo-400 animate-pulse' :
                     barAStatus === 'DEPLETING' ? 'text-red-400' :
                     fleetActive ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {fleetActive ? barAInventory : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units</span>
                 </div>
                 
                 {/* Visual Bar */}
                 <div className="w-full h-1 bg-slate-800 mt-3 rounded overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${
                     barAInventory < 40 ? 'bg-red-500' : 'bg-sky-500'
                   }`} style={{ width: `${(barAInventory / 150) * 100}%` }}></div>
                 </div>
               </div>

               {/* Logistics AI Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 barAStatus === 'REPLENISHING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 fleetActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   AGV Dispatch Status
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     barAStatus === 'REPLENISHING' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {barAStatus === 'REPLENISHING' ? 'AGV-07 EN ROUTE' : 'STANDBY'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {barAStatus === 'REPLENISHING' ? 'Payload: 48 Units (Vodka)' : 'Monitoring POS velocity...'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#01070a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Swarm Control Log</span>
                 {barAStatus === 'DEPLETING' && <span className="text-red-400 animate-pulse">Velocity Spike...</span>}
                 {barAStatus === 'REPLENISHING' && <span className="text-cyan-400 animate-pulse">AGV Dispatched!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
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
            
            {/* Map Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-sky-400">LOGISTICS RADAR</span>
                <span className="text-[8px] font-mono text-slate-400">UNDERGROUND PERIMETER</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center p-6">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-50 z-0"></div>

                <div className="relative w-full h-full">
                  
                  {/* Warehouse (Bottom Left) */}
                  <div className="absolute bottom-[10%] left-[10%] z-20">
                    <div className="w-16 h-12 bg-slate-800 border-2 border-slate-500 rounded flex flex-col items-center justify-center">
                      <span className="text-[8px] font-black text-slate-400">WAREHOUSE</span>
                      <span className="text-[7px] text-slate-500 mt-1">{warehouseInventory} units</span>
                    </div>
                  </div>

                  {/* Bar A (Top Right) */}
                  <div className="absolute top-[10%] right-[10%] z-20">
                    <div className={`w-16 h-12 bg-slate-800 border-2 rounded flex flex-col items-center justify-center transition-colors ${
                      barAStatus === 'DEPLETING' ? 'border-red-500 shadow-[0_0_15px_#ef4444]' : 
                      barAStatus === 'REPLENISHING' ? 'border-indigo-500' : 'border-sky-500'
                    }`}>
                      <span className={`text-[10px] font-black ${barAStatus === 'DEPLETING' ? 'text-red-400' : 'text-sky-400'}`}>BAR A</span>
                    </div>
                  </div>

                  {/* Underground Tunnel Track */}
                  <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    <path 
                      id="agv-path"
                      d="M 50 250 L 50 50 L 300 50" 
                      fill="none" 
                      stroke="#1e293b" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    
                    {/* Active Route Highlight */}
                    {barAStatus === 'REPLENISHING' && (
                      <path 
                        d="M 50 250 L 50 50 L 300 50" 
                        fill="none" 
                        stroke="#0ea5e9" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="animate-dash" 
                        strokeDasharray="10,10" 
                      />
                    )}
                  </svg>

                  {/* AGV Robot Marker */}
                  {barAStatus === 'REPLENISHING' && (
                    <div className="absolute z-30 w-6 h-6 bg-cyan-500 border-2 border-white rounded shadow-[0_0_15px_#06b6d4] flex items-center justify-center" 
                         style={{
                           animation: 'moveAgv 3.5s linear forwards',
                           offsetPath: "path('M 50 250 L 50 50 L 300 50')",
                         }}>
                       <span className="text-[12px]">🤖</span>
                       
                       <style>{`
                         @keyframes moveAgv {
                           0% { offset-distance: 0%; }
                           100% { offset-distance: 100%; }
                         }
                       `}</style>
                    </div>
                  )}

                  {/* Alert Ping at Bar A */}
                  {barAStatus === 'DEPLETING' && (
                    <div className="absolute top-[10%] right-[10%] w-16 h-12 border-2 border-red-500 rounded animate-ping z-10 opacity-70"></div>
                  )}

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerRush}
                disabled={!fleetActive || barAStatus !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !fleetActive || barAStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Bar Surge
              </button>
              
              <button 
                onClick={completeRestock}
                disabled={barAStatus !== 'REPLENISHING'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  barAStatus !== 'REPLENISHING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                AGV Arrives (Restock)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AGVInventoryRebalancer;
