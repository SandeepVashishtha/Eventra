/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARVIPBottleServiceTracking = () => {
  const [arActive, setArActive] = useState(false);
  const [orderStatus, setOrderStatus] = useState('IDLE'); // IDLE, ORDER_PLACED, LOCATING, DELIVERED
  
  // AR HUD metrics
  const [targetDistance, setTargetDistance] = useState(45.2);
  const [targetHeading, setTargetHeading] = useState(12);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '01:30:00', type: 'SYS', msg: 'Spatial Anchoring Engine initialized.' },
    { id: 2, time: '01:30:02', type: 'SYS', msg: 'Waitstaff AR HUD synced. Awaiting VIP App orders.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (arActive && orderStatus === 'LOCATING') {
      loop = setInterval(() => {
        setTargetDistance(prev => {
          const next = prev - (Math.random() * 2 + 1);
          if (next <= 2) {
            clearInterval(loop);
            setOrderStatus('DELIVERED');
            addLog('SUCCESS', 'Target reached. Bottle service delivered to Table 42.');
            return 0;
          }
          return next;
        });
        
        setTargetHeading(prev => prev + (Math.random() * 4 - 2));
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [arActive, orderStatus]);

  const simulateOrder = () => {
    if (arActive && orderStatus === 'IDLE') {
      setOrderStatus('ORDER_PLACED');
      addLog('ACTION', 'New VIP Order: 2x Dom Pérignon ($5,000). Client: T. Jenkins.');
      
      setTimeout(() => {
        addLog('SYS', 'Generating spatial anchor at client iOS device coordinates...');
        
        setTimeout(() => {
          setOrderStatus('LOCATING');
          setTargetDistance(45.2);
          setTargetHeading(12);
          addLog('WEB3', 'Spatial Waypoint active in AR HUD. Proceed to Table 42.');
        }, 1200);
      }, 1000);
    }
  };

  const resetSystem = () => {
    setOrderStatus('IDLE');
    setTargetDistance(45.2);
    setTargetHeading(0);
    addLog('SYS', 'Order cleared. HUD returning to standby scan mode.');
  };

  const toggleAR = () => {
    if (!arActive) {
      setArActive(true);
      addLog('SYS', 'AR Glasses online. Indoor positioning system active.');
    } else {
      setArActive(false);
      resetSystem();
      addLog('WARN', 'AR Glasses offline. Reverting to manual table searches (NOT RECOMMENDED).');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Spatial Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🍾</span> Spatial Anchoring Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AR-Based VIP Table <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Bottle Service Tracking</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In massive VIP areas with hundreds of tables, waitstaff struggle to locate the exact client who ordered a $5,000 bottle of champagne in the dark, 110dB club environment. They often waste time shouting names while the ice melts. Eventra solves this by utilizing Enterprise Augmented Reality and precise indoor spatial anchoring. When a VIP client orders via the app, the system generates a spatial anchor at their exact location. Waitstaff wearing AR glasses see a glowing virtual waypoint hovering directly over the correct table, even if the client has moved slightly, ensuring rapid, premium service.
          </p>

          <div className="bg-[#0f0c05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">👓</span> XR Server Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAR}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     arActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                   }`}
                 >
                   {arActive ? 'Power Down AR Link' : 'Initialize Staff HUDs'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Order Queue */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 orderStatus === 'ORDER_PLACED' ? 'bg-amber-950/40 border-amber-500/50 shadow-inner' :
                 arActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live VIP Queue
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     orderStatus === 'ORDER_PLACED' ? 'text-amber-400' : 
                     arActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {orderStatus === 'IDLE' || orderStatus === 'DELIVERED' ? '0 Pending' : '1 Active Order'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {orderStatus === 'IDLE' || orderStatus === 'DELIVERED' ? 'Awaiting App Input' : 'Dom Pérignon x2 ($5K)'}
                   </span>
                 </div>
               </div>

               {/* Tracking Telemetry */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 orderStatus === 'LOCATING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 orderStatus === 'DELIVERED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 arActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Spatial Tracking Status
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     orderStatus === 'LOCATING' ? 'text-cyan-400' : 
                     orderStatus === 'DELIVERED' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {orderStatus === 'LOCATING' ? 'Anchoring...' : 
                      orderStatus === 'DELIVERED' ? 'SUCCESS' : 'IDLE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {orderStatus === 'LOCATING' ? `Dist: ${targetDistance.toFixed(1)}m` : 
                      orderStatus === 'DELIVERED' ? 'Anchor Released' : '---'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Spatial Compute Log</span>
                 {orderStatus === 'LOCATING' && <span className="text-cyan-400 animate-pulse">Tracking Anchor...</span>}
                 {orderStatus === 'DELIVERED' && <span className="text-emerald-500 animate-pulse">Service Complete</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' :
                       log.type === 'WEB3' || log.type === 'SYS' && log.msg.includes('Generating') ? 'text-cyan-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: AR Glass Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* AR Glasses HUD Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[12px] border-black shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[360px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              arActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 drop-shadow-md">OPTICS ONLINE</span>
                <span className="text-[10px] font-mono text-cyan-400/80 drop-shadow-md">STAFF ID: JENKINS</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                
                {!arActive ? (
                  <div className="z-10 text-center opacity-40">
                    <span className="text-4xl block mb-2">🕶️</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HUD Powered Off</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                     {/* Simulated Club Environment (Dark, out of focus) */}
                     <div className="absolute inset-0 bg-[#080810] blur-sm">
                       {/* Strobes/Lasers in background */}
                       <div className="absolute top-1/4 left-0 w-full h-1 bg-fuchsia-600/20 shadow-[0_0_20px_#c026d3] transform rotate-12"></div>
                       <div className="absolute top-1/3 right-0 w-full h-1 bg-blue-600/20 shadow-[0_0_20px_#2563eb] transform -rotate-6"></div>
                       
                       {/* Tables (Silhouettes) */}
                       <div className="absolute bottom-10 left-[20%] w-20 h-8 bg-black/80 rounded-full border-t border-slate-800"></div>
                       <div className="absolute bottom-[20%] right-[30%] w-32 h-12 bg-black/80 rounded-full border-t border-slate-800"></div>
                     </div>

                     {/* AR HUD Overlay Elements */}
                     <div className="absolute inset-0 pointer-events-none z-20">
                       
                       {/* Crosshair */}
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
                         <div className="w-16 h-16 border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
                           <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                         </div>
                       </div>

                       {/* Status Text (Top Left) */}
                       {orderStatus === 'ORDER_PLACED' && (
                         <div className="absolute top-12 left-4 text-cyan-400 font-mono text-[9px] bg-cyan-900/40 p-2 rounded border border-cyan-500/50 backdrop-blur-md animate-fade-in-up">
                           > INCOMING ORDER<br/>
                           > VIP TBL 42<br/>
                           > CALC SPATIAL ANCHOR...
                         </div>
                       )}

                       {/* Spatial Waypoint (The glowing marker) */}
                       {orderStatus === 'LOCATING' && (
                         <div className="absolute bottom-[20%] right-[30%] w-32 h-32 flex flex-col items-center justify-end">
                           
                           {/* Floating Distance Text */}
                           <div className="bg-black/80 border border-cyan-500 text-cyan-400 text-[10px] font-mono font-black px-2 py-1 rounded mb-2 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                             {targetDistance.toFixed(1)}m
                           </div>
                           
                           {/* Glowing Pillar/Marker */}
                           <div className="w-0.5 h-full bg-gradient-to-t from-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-pulse"></div>
                           
                           {/* Base Circle on Table */}
                           <div className="w-24 h-6 border-2 border-cyan-400 rounded-full transform -rotate-12 shadow-[0_0_20px_#22d3ee_inset] bg-cyan-400/10"></div>
                         </div>
                       )}

                       {/* Delivery Confirmed Overlay */}
                       {orderStatus === 'DELIVERED' && (
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center bg-emerald-950/80 border border-emerald-500 p-4 rounded-xl backdrop-blur-md animate-fade-in-up">
                           <span className="text-3xl block mb-2">✅</span>
                           <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Target Reached</h3>
                           <p className="text-[9px] text-emerald-200 mt-1">Serve Dom Pérignon to T. Jenkins</p>
                         </div>
                       )}

                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Application Flow Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateOrder}
                disabled={!arActive || orderStatus !== 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !arActive || orderStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-amber-950/40 border-amber-900 text-amber-500 hover:bg-amber-900/60'
                }`}
              >
                VIP App Order Placed
              </button>
              
              <button 
                onClick={resetSystem}
                disabled={orderStatus !== 'DELIVERED'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  orderStatus !== 'DELIVERED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-500 hover:bg-cyan-900/60'
                }`}
              >
                Clear HUD (Reset)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ARVIPBottleServiceTracking;
