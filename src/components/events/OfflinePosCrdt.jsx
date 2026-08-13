/* eslint-disable */
import React, { useState, useEffect } from 'react';

const OfflinePosCrdt = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  // PWA & CRDT Metrics
  const [offlineTxCount, setOfflineTxCount] = useState(0); 
  const [unsyncedRevenue, setUnsyncedRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(14520.50);
  const [crdtConflictsResolved, setCrdtConflictsResolved] = useState(12);
  const [syncState, setSyncState] = useState('SYNCED'); // SYNCED, SYNCING, OFFLINE
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'Service Worker registered. PWA initialized.' },
    { id: 2, time: '12:00:02', type: 'SYS', msg: 'CRDT state merged with Cloud DB.' }
  ]);

  // Visualizer State (POS System)
  const [cart, setCart] = useState([]);
  const [txQueue, setTxQueue] = useState([]); // Represents IndexedDB offline storage

  const posItems = [
      { id: 'itm_1', name: 'Festival Burger', price: 15.00 },
      { id: 'itm_2', name: 'Vegan Wrap', price: 12.00 },
      { id: 'itm_3', name: 'Craft Beer', price: 10.00 },
      { id: 'itm_4', name: 'Water Bottle', price: 5.00 }
  ];

  const addToCart = (item) => {
      setCart(prev => [...prev, item]);
  };

  const checkout = () => {
      if (cart.length === 0) return;
      
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const newTx = { id: Date.now(), items: cart, total, timestamp: new Date().toISOString() };
      
      if (isOnline) {
          // Process immediately
          setTotalRevenue(prev => prev + total);
          addLog('SUCCESS', `Tx processed via Cloud DB: $${total.toFixed(2)}`);
      } else {
          // Store offline
          setTxQueue(prev => [...prev, newTx]);
          setOfflineTxCount(prev => prev + 1);
          setUnsyncedRevenue(prev => prev + total);
          addLog('WARN', `Offline Tx saved to IndexedDB CRDT store: $${total.toFixed(2)}`);
      }
      
      setCart([]);
  };

  const toggleConnection = () => {
      if (isOnline) {
          setIsOnline(false);
          setSyncState('OFFLINE');
          addLog('CRIT', 'Network Connection Lost. PWA switching to Offline-First mode.');
      } else {
          setIsOnline(true);
          setSyncState('SYNCING');
          addLog('SYS', 'Network Connection Restored. Initiating CRDT Auto-Merge...');
          
          // Simulate CRDT Merge
          setTimeout(() => {
              if (txQueue.length > 0) {
                  const mergedTotal = txQueue.reduce((sum, tx) => sum + tx.total, 0);
                  setTotalRevenue(prev => prev + mergedTotal);
                  
                  // Simulate resolving a conflict
                  if (Math.random() > 0.5) {
                      setCrdtConflictsResolved(prev => prev + 1);
                      addLog('ACTION', 'CRDT Vector Clock conflict detected & automatically resolved.');
                  }
                  
                  addLog('SUCCESS', `Synced ${txQueue.length} offline transactions. Merged $${mergedTotal.toFixed(2)}.`);
              } else {
                  addLog('SUCCESS', 'CRDT state synchronized. No offline transactions to merge.');
              }
              
              setTxQueue([]);
              setOfflineTxCount(0);
              setUnsyncedRevenue(0);
              setSyncState('SYNCED');
          }, 2500);
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔄</span> Offline-First Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            PWA Synchronization via <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500">CRDTs for Vendor POS</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Food and merchandise vendors lose thousands of dollars in sales when their Point of Sale (POS) terminals lose internet connection in crowded festival fields. Writing down credit cards on paper is a massive PCI compliance risk. Eventra solves this by building an Offline-first Progressive Web App (PWA). We utilize Conflict-free Replicated Data Types (CRDTs) and IndexedDB to securely store encrypted transactions locally. When the internet connection is restored, the CRDT protocol automatically merges the offline state with the master cloud database without conflict.
          </p>

          <div className="bg-[#0a0508] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> CRDT Sync Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleConnection}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !isOnline ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {isOnline ? 'Sever Network Connection' : 'Restore Network Access'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Sync State */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 syncState === 'OFFLINE' ? 'bg-red-950/40 border-red-900/50' : 
                 syncState === 'SYNCING' ? 'bg-blue-950/40 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse' :
                 'bg-emerald-950/20 border-emerald-900/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sync State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none transition-colors duration-300 ${
                     syncState === 'OFFLINE' ? 'text-red-400' : 
                     syncState === 'SYNCING' ? 'text-blue-400' : 'text-emerald-400'
                   }`}>
                     {syncState}
                   </span>
                 </div>
               </div>

               {/* Offline Queue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 offlineTxCount > 0 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   IndexedDB Queue
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     offlineTxCount > 0 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {offlineTxCount}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Tx</span>
                 </div>
               </div>
               
               {/* Unsynced Revenue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 unsyncedRevenue > 0 ? 'bg-rose-950/40 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Unsynced Rev
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     unsyncedRevenue > 0 ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {unsyncedRevenue.toFixed(0)}
                   </span>
                 </div>
               </div>
               
               {/* Total Revenue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Revenue
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-xl font-black font-mono leading-none text-emerald-400`}>
                     {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>CRDT Protocol Ledger</span>
                 {!isOnline && <span className="text-red-400 font-black animate-pulse">NETWORK DISCONNECTED</span>}
                 {syncState === 'SYNCING' && <span className="text-blue-400 font-black animate-pulse">AUTO-MERGING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* Vendor POS Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 transition-colors duration-1000 bg-white`}>
              
              {/* POS Header */}
              <div className={`h-12 flex justify-between items-center px-4 shadow-sm z-10 transition-colors ${
                  isOnline ? 'bg-emerald-600' : 'bg-red-600'
              }`}>
                  <span className="text-white font-black tracking-widest uppercase text-sm">EVENTRA POS</span>
                  <div className="flex items-center bg-black/20 px-2 py-1 rounded-full">
                      <span className="text-white text-[10px] font-bold mr-2 uppercase">{isOnline ? 'Online' : 'Offline Mode'}</span>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300 shadow-[0_0_8px_#6ee7b7]' : 'bg-red-300 animate-pulse shadow-[0_0_8px_#fca5a5]'}`}></span>
                  </div>
              </div>

              <div className="flex-1 flex flex-col bg-slate-50">
                  
                  {/* Cart Display */}
                  <div className="h-48 bg-white border-b flex flex-col">
                      <div className="p-3 bg-slate-100 border-b flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 uppercase">Current Order</span>
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border">
                              {cart.length} Items
                          </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-2">
                          {cart.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Cart is empty</div>
                          ) : (
                              cart.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                      <span className="text-sm font-mono text-slate-700">${item.price.toFixed(2)}</span>
                                  </div>
                              ))
                          )}
                      </div>
                      
                      <div className="p-4 bg-slate-50 border-t flex justify-between items-end">
                          <span className="text-sm font-bold text-slate-500 uppercase">Total</span>
                          <span className="text-3xl font-black font-mono text-emerald-600">
                              ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                          </span>
                      </div>
                  </div>

                  {/* Menu Grid */}
                  <div className="flex-1 p-3 grid grid-cols-2 gap-3 overflow-y-auto">
                      {posItems.map(item => (
                          <button 
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center active:bg-slate-100 active:border-slate-300 transition-colors shadow-sm"
                          >
                              <span className="text-sm font-bold text-slate-700 text-center mb-1">{item.name}</span>
                              <span className="text-xs font-mono text-slate-500">${item.price.toFixed(2)}</span>
                          </button>
                      ))}
                  </div>

                  {/* Checkout Button */}
                  <div className="p-4 bg-white border-t">
                      <button 
                          onClick={checkout}
                          disabled={cart.length === 0}
                          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center shadow-lg ${
                              cart.length === 0 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                              : isOnline 
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                      >
                          {cart.length === 0 ? 'Add Items' : isOnline ? 'Pay Now' : 'Pay Offline (Queue)'}
                      </button>
                  </div>

              </div>
              
              {/* Internal DB visual indicator */}
              <div className="absolute bottom-0 inset-x-0 h-1 z-20 flex">
                  {syncState === 'OFFLINE' && (
                      <div className="w-full bg-orange-500 animate-pulse"></div>
                  )}
                  {syncState === 'SYNCING' && (
                      <div className="w-full bg-blue-500 relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/40 w-1/4 animate-bounce" style={{ animationDuration: '0.5s', animationDirection: 'alternate' }}></div>
                      </div>
                  )}
              </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default OfflinePosCrdt;
