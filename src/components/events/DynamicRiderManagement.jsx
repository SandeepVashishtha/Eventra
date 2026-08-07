/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicRiderManagement = () => {
  const [apiActive, setApiActive] = useState(false);
  const [orderStatus, setOrderStatus] = useState('IDLE'); // IDLE, AGGREGATING, GENERATING_PO, DISPATCHED
  
  // Rider Inventory State
  const [commissaryInventory, setCommissaryInventory] = useState({
    'Casamigos Blanco': 5,
    'Fiji Water (Case)': 12,
    'Towels (Black)': 50,
  });

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'B2B Hospitality API endpoints online.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Listening for Tour Manager Rider Updates via Webhook.' }
  ]);

  const simulateRiderUpdate = () => {
    if (apiActive && orderStatus === 'IDLE') {
      setOrderStatus('AGGREGATING');
      addLog('ACTION', 'Webhook received: Tour Manager (Odesza) added "Casamigos Blanco x8" to Rider.');
      
      setTimeout(() => {
        addLog('SYS', `Checking Backstage Commissary. Current Stock: ${commissaryInventory['Casamigos Blanco']}. Shortfall: 3.`);
        
        setTimeout(() => {
          setOrderStatus('GENERATING_PO');
          addLog('AI', 'Aggregating shortfalls across 150 artists. Generating optimized Purchase Order.');
          
          setTimeout(() => {
            setOrderStatus('DISPATCHED');
            addLog('WEB3', 'B2B API Call: Dispatching automated Sysco/Instacart order for runners.');
            
            setTimeout(() => {
              setOrderStatus('IDLE');
              setCommissaryInventory(prev => ({...prev, 'Casamigos Blanco': prev['Casamigos Blanco'] + 8}));
              addLog('SUCCESS', 'Purchase Order fulfilled. Commissary inventory updated automatically.');
            }, 3000);
            
          }, 1500);
        }, 1500);
      }, 1000);
    }
  };

  const resetAPI = () => {
    setOrderStatus('IDLE');
    setCommissaryInventory({
      'Casamigos Blanco': 5,
      'Fiji Water (Case)': 12,
      'Towels (Black)': 50,
    });
    addLog('SYS', 'Inventory and pipelines reset. Awaiting next payload.');
  };

  const toggleAPI = () => {
    if (!apiActive) {
      setApiActive(true);
      addLog('SYS', 'Dynamic Rider Management API enabled. B2B vendor integrations active.');
    } else {
      setApiActive(false);
      resetAPI();
      addLog('WARN', 'API offline. Production runners must manually read PDF riders.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#061013] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Supply Chain Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📋</span> Automated Supply Chain API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Artist Green Room <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Rider Management</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Artist hospitality riders change constantly up to the day of the show. Production runners typically manage these requests via messy WhatsApp threads and static spreadsheets, leading to missing items and angry talent. Eventra solves this by providing a standardized API portal where tour managers can dynamically update their green room requests. The system instantly aggregates these changes across 150 artists, cross-references them against the live inventory of the backstage commissary, and auto-generates optimized B2B purchase orders for the runners.
          </p>

          <div className="bg-[#0b1619] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🛒</span> B2B Hospitality Aggregator
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAPI}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     apiActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {apiActive ? 'Disable Supply Chain API' : 'Initialize B2B Webhooks'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Internal Commissary */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 orderStatus === 'AGGREGATING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 apiActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Commissary Inventory
                 </span>
                 <div className="flex flex-col space-y-1">
                   {Object.entries(commissaryInventory).map(([item, qty]) => (
                     <div key={item} className="flex justify-between items-center bg-slate-950 px-2 py-1 rounded border border-slate-800">
                       <span className="text-[9px] font-bold text-slate-400">{item}</span>
                       <span className={`text-[10px] font-black font-mono ${qty < 8 && apiActive ? 'text-yellow-500' : 'text-slate-300'}`}>
                         {qty} units
                       </span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* B2B Vendor Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 orderStatus === 'GENERATING_PO' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 orderStatus === 'DISPATCHED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 apiActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Vendor Purchase Orders
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     orderStatus === 'GENERATING_PO' ? 'text-cyan-400' : 
                     orderStatus === 'DISPATCHED' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {orderStatus === 'GENERATING_PO' ? 'Aggregating...' : 
                      orderStatus === 'DISPATCHED' ? 'PO DISPATCHED' : 'Awaiting Input'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {orderStatus === 'GENERATING_PO' ? 'Generating Sysco PO' : 
                      orderStatus === 'DISPATCHED' ? 'Assigned to Runner 4' : '---'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>API Integration Log</span>
                 {orderStatus === 'AGGREGATING' && <span className="text-indigo-400 animate-pulse">Checking Stock...</span>}
                 {orderStatus === 'GENERATING_PO' && <span className="text-cyan-400 animate-pulse">Building Order...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' :
                       log.type === 'AI' || log.type === 'WEB3' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Tour Manager Interface (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Tour Manager Portal Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-slate-800 shadow-2xl relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              apiActive ? 'bg-slate-100' : 'bg-slate-300 grayscale'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 bg-white border-b border-slate-200 flex justify-between items-center z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Eventra Artist Portal</span>
                <span className="text-[9px] font-mono bg-teal-100 text-teal-700 px-2 py-1 rounded-full border border-teal-200">Tour Manager: Odesza</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 p-6 bg-slate-50">
                
                <h2 className="text-xl font-black text-slate-900 mb-1">Update Green Room Rider</h2>
                <p className="text-xs text-slate-500 mb-6 leading-tight">Add or modify hospitality items for your artists. Updates are synced directly to festival logistics.</p>

                {/* Form Simulation */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                   <div className="mb-4">
                     <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Item Category</label>
                     <div className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 font-bold flex justify-between items-center">
                       Spirits & Liquor <span className="text-[10px]">▼</span>
                     </div>
                   </div>
                   
                   <div className="mb-4">
                     <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Specific Item</label>
                     <div className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 font-bold flex justify-between items-center">
                       Casamigos Blanco (750ml) <span className="text-[10px]">▼</span>
                     </div>
                   </div>

                   <div>
                     <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Quantity Needed</label>
                     <div className="flex items-center space-x-4">
                       <input type="range" min="1" max="12" value="8" readOnly className="flex-1 accent-teal-500" />
                       <span className="text-lg font-black text-slate-800 w-8 text-center">8</span>
                     </div>
                   </div>
                </div>

                {/* Processing Overlay */}
                {orderStatus !== 'IDLE' && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                    {orderStatus === 'DISPATCHED' ? (
                      <>
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">✅</div>
                        <h3 className="text-lg font-black text-slate-900 mb-2">Rider Updated</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Your request has been processed. Items will be delivered to Green Room 04 by 3:00 PM.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                        <h3 className="text-lg font-black text-slate-900 mb-2">Syncing Logistics...</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Cross-referencing backstage inventory and generating vendor purchase orders...
                        </p>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateRiderUpdate}
                disabled={!apiActive || orderStatus !== 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !apiActive || orderStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-teal-600 border-teal-500 text-white hover:bg-teal-500'
                }`}
              >
                Submit Rider Update
              </button>
              
              <button 
                onClick={resetAPI}
                disabled={orderStatus === 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  orderStatus === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Environment
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicRiderManagement;
