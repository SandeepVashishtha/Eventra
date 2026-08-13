/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicMenuPricing = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Pricing Metrics
  const basePrice = 18.00; // $18 Sushi
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [salesVelocity, setSalesVelocity] = useState(12); // units / hr
  const [wasteAvoided, setWasteAvoided] = useState(0); // lbs
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Algorithmic Pricing Engine Online.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Ingesting perishability constraints for Vendor: Tokyo Drift Sushi.' }
  ]);

  // Visualizer State
  const [inventoryCount, setInventoryCount] = useState(300);
  const [timeUntilExp, setTimeUntilExp] = useState(4.0); // Hours
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(0);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          // Time decreases
          setTimeUntilExp(prev => {
              const next = Math.max(0, prev - 0.05); // Speed up time
              return next;
          });

          // Simulate sales
          setInventoryCount(prev => {
              if (prev <= 0) return 0;
              const chance = flashSaleActive ? 0.6 : 0.1; // Sells much faster during flash sale
              if (Math.random() < chance) {
                  return prev - 1;
              }
              return prev;
          });
          
          // Update Sales Velocity
          setSalesVelocity(flashSaleActive ? 85 : 12 + Math.floor(Math.random() * 5));

      }, 200); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, flashSaleActive]);

  // Algorithm logic reacting to state changes
  useEffect(() => {
      if (!systemActive) return;

      if (timeUntilExp <= 0) {
          // Expired
          setCurrentPrice(0);
          setFlashSaleActive(false);
          return;
      }

      // If we have lots of inventory and low time, drop price
      if (inventoryCount > 100 && timeUntilExp < 2.0 && !flashSaleActive) {
          triggerFlashSale();
      }

      if (flashSaleActive) {
          // Dynamic pricing curve based on remaining time
          const discountFactor = Math.max(0.2, timeUntilExp / 2.0); // Price drops to 20% of base at lowest
          setCurrentPrice(basePrice * discountFactor);
          
          // Accumulate waste avoided metric as we sell
          if (Math.random() > 0.8) setWasteAvoided(prev => prev + 0.5);
      } else {
          setCurrentPrice(basePrice);
      }

  }, [timeUntilExp, inventoryCount, systemActive, flashSaleActive]);


  const triggerFlashSale = () => {
      setFlashSaleActive(true);
      setNotificationsSent(1250); // Push to nearby users
      
      addLog('WARN', `Sales velocity insufficient. ${inventoryCount} units trend towards expiration.`);
      addLog('ACTION', 'Dynamic Pricing Engine engaged. Dropping base price.');
      addLog('SYS', 'Pushing Flash Discount notifications to 1,250 attendees within 500m radius.');
  };

  const simulateRestock = () => {
      if (!systemActive) return;
      
      setInventoryCount(300);
      setTimeUntilExp(4.0);
      setFlashSaleActive(false);
      setCurrentPrice(basePrice);
      setNotificationsSent(0);
      
      addLog('SUCCESS', 'Vendor manually restocked fresh inventory.');
      addLog('SYS', 'Pricing Engine reset to nominal base price ($18.00).');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setInventoryCount(300);
      setTimeUntilExp(4.0);
      setWasteAvoided(0);
      addLog('SYS', 'Inventory tracking and push notification routing initialized.');
    } else {
      setSystemActive(false);
      setFlashSaleActive(false);
      setCurrentPrice(basePrice);
      addLog('WARN', 'Algorithmic Pricing Offline. Vendor reverting to static chalkboards.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-green-900/40 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📉</span> Algorithmic Pricing Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Menu Pricing via <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">Inventory Half-Life</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Food vendors end up throwing away thousands of pounds of perishable food (sushi, fresh fruit) at the end of the festival because they maintain static, high pricing throughout the weekend even as demand drops. Eventra solves this by implementing an algorithmic pricing engine for the vendor POS. The system monitors sales velocity against the item's expiration half-life. If an item is trending toward expiring unsold, the Eventra app dynamically drops the price and automatically routes push notifications to nearby attendees offering localized flash discounts, ensuring zero food waste.
          </p>

          <div className="bg-[#090b0e] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-green-500 text-lg mr-2">🎛️</span> Inventory Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Pricing Engine' : 'Enable Dynamic Pricing'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Current Price */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 flashSaleActive ? 'bg-green-950/40 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Current Price
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300 ${
                     flashSaleActive ? 'text-green-400' : 'text-slate-300'
                   }`}>
                     ${currentPrice.toFixed(2)}
                   </span>
                 </div>
               </div>

               {/* Sales Velocity */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sales Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {salesVelocity}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/hr</span>
                 </div>
               </div>
               
               {/* Expiration ETA */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 timeUntilExp < 1.0 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Expiration ETA
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     timeUntilExp < 1.0 ? 'text-red-400' : 'text-slate-300'
                   }`}>
                     {timeUntilExp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">hrs</span>
                 </div>
               </div>
               
               {/* Waste Avoided */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 wasteAvoided > 0 ? 'bg-emerald-950/40 border-emerald-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Waste Avoided
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     wasteAvoided > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {wasteAvoided.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">lbs</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020304] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Ledger</span>
                 {flashSaleActive && <span className="text-green-400 font-black animate-pulse">FLASH SALE ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-green-400 font-bold' : 'text-slate-400'
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
            
            {/* Vendor UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#090b0e]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-green-400">VENDOR POS VIEW</span>
                <span className="text-[8px] font-mono text-slate-400">TOKYO DRIFT SUSHI</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-between px-4 pt-16 pb-4">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">POS TERMINAL OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col justify-between">
                        
                        {/* Item Card */}
                        <div className={`w-full bg-slate-900 border-2 rounded-xl p-4 transition-all duration-500 ${
                            flashSaleActive ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-slate-800'
                        }`}>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Spicy Tuna Roll</h3>
                                    <span className="text-[10px] text-slate-400 block">Perishable (Max 6 hrs)</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${flashSaleActive ? 'text-green-400' : 'text-white'}`}>
                                        ${currentPrice.toFixed(2)}
                                    </span>
                                    {flashSaleActive && (
                                        <span className="block text-[10px] text-slate-500 line-through">${basePrice.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Inventory Bar */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                                        <span>Inventory Remaining</span>
                                        <span>{inventoryCount} units</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${(inventoryCount / 300) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Freshness Bar */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                                        <span>Freshness Quality</span>
                                        <span className={timeUntilExp < 1 ? 'text-red-400 animate-pulse' : ''}>{timeUntilExp.toFixed(1)} hrs left</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-300 ${
                                                timeUntilExp < 1 ? 'bg-red-500' :
                                                timeUntilExp < 2 ? 'bg-orange-500' : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${(timeUntilExp / 4.0) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Push Notification Visualizer */}
                        <div className={`w-full mt-4 bg-slate-800/80 rounded-lg p-3 border transition-all duration-500 flex flex-col items-center ${
                            flashSaleActive ? 'opacity-100 border-slate-600 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}>
                            <span className="text-xl mb-1 animate-bounce">📱</span>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest text-center">
                                Push Notification Deployed
                            </span>
                            <span className="text-[10px] text-slate-400 text-center mt-1">
                                {notificationsSent.toLocaleString()} attendees within 500m notified of flash discount.
                            </span>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#090b0e] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Inventory Events</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => setTimeUntilExp(1.5)} // Fast forward time
                   disabled={!systemActive || timeUntilExp <= 1.5 || inventoryCount <= 0}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || timeUntilExp <= 1.5 || inventoryCount <= 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   ⏩ Fast Forward Time (Force Expiration Risk)
                 </button>
               </div>

               <button 
                   onClick={simulateRestock}
                   disabled={!systemActive || (timeUntilExp > 3.0 && inventoryCount > 250)}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || (timeUntilExp > 3.0 && inventoryCount > 250) ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/20 border-blue-800 text-blue-500 hover:bg-blue-900/40'
                   }`}
                 >
                   Restock Fresh Inventory
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicMenuPricing;
