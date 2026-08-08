import React, { useState } from 'react';

const SponsorInventoryTracker = () => {
  const [scanMode, setScanMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([
    { id: 'SWG-001', name: 'Premium Tech Hoodie', size: 'Large', total: 100, current: 85, alertThreshold: 15 },
    { id: 'SWG-002', name: 'Premium Tech Hoodie', size: 'Medium', total: 150, current: 18, alertThreshold: 22 },
    { id: 'SWG-003', name: 'Yeti Logo Tumbler', size: 'N/A', total: 300, current: 280, alertThreshold: 45 },
    { id: 'SWG-004', name: 'Mechanical Keyboard', size: 'N/A', total: 20, current: 2, alertThreshold: 5 } // Critical
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, item: 'Mechanical Keyboard', message: 'CRITICAL: Stock below 10%', time: '10 mins ago' },
    { id: 2, item: 'Premium Tech Hoodie (M)', message: 'WARNING: Reached 15% threshold. Replenishment requested.', time: 'Just now' }
  ]);

  const handleScanAndDispense = () => {
    if (!selectedItem) return;

    setScanMode(true);
    
    setTimeout(() => {
      setScanMode(false);
      
      setItems(prev => prev.map(item => {
        if (item.id === selectedItem) {
          const newCurrent = Math.max(0, item.current - 1);
          
          // Trigger new alert if crossing threshold
          if (newCurrent === item.alertThreshold) {
            setAlerts(prevAlerts => [
              { id: Date.now(), item: item.name, message: `WARNING: Reached threshold. Replenishment requested.`, time: 'Just now' },
              ...prevAlerts
            ]);
          }
          
          return { ...item, current: newCurrent };
        }
        return item;
      }));
      
      setSelectedItem(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📦</span> Logistics & Operations
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Booth Inventory <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Real-Time Sync</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop forcing sponsors to manually count boxes under their tables. Our lightweight inventory tracker integrates directly into the Lead Scanner App. Every time a badge is scanned to give away swag, it deducts from digital stock and automatically alerts the warehouse team when replenishment is needed.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
               <span className="text-[10px] bg-red-500/20 text-red-400 font-bold uppercase px-2 py-1 rounded border border-red-500/30 flex items-center animate-pulse">
                 <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span> Warehouse Comms Active
               </span>
             </div>
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Warehouse Alerts Log</h3>
             
             <div className="space-y-3">
               {alerts.map(alert => (
                 <div key={alert.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 animate-fade-in-up">
                   <div className="flex justify-between items-start mb-1">
                     <span className="font-bold text-slate-200 text-sm">{alert.item}</span>
                     <span className="text-[9px] font-mono text-slate-500">{alert.time}</span>
                   </div>
                   <p className={`text-xs ${alert.message.includes('CRITICAL') ? 'text-red-400 font-bold' : 'text-amber-400'}`}>
                     {alert.message}
                   </p>
                 </div>
               ))}
               
               {alerts.length === 0 && (
                 <div className="text-center py-4">
                   <span className="text-slate-500 text-xs font-mono">No active alerts. Inventory stable.</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Side: Scanner App Simulator (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full max-w-[400px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Status Bar */}
            <div className="h-12 bg-teal-600 flex justify-between items-center px-6 text-white text-xs font-bold">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="bg-teal-600 px-6 pb-6 shadow-md text-white z-10">
              <h2 className="text-2xl font-black mb-1">Acme Corp Booth</h2>
              <p className="text-xs text-teal-200 font-mono">Booth #402 • Lead Scanner Pro</p>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
              
              {scanMode ? (
                // Scanning State Overlay
                <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-48 h-48 border-2 border-teal-500/50 rounded-2xl relative flex items-center justify-center mb-6 overflow-hidden bg-black/50">
                    <div className="w-full h-1 bg-teal-400 absolute top-0 shadow-[0_0_15px_#2dd4bf] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    <span className="text-5xl opacity-50">👤</span>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">Scanning Attendee Badge...</h3>
                  <p className="text-teal-400 text-xs font-mono">Dispensing selected item & syncing database.</p>
                </div>
              ) : null}

              {/* Step 1: Select Item to Dispense */}
              <div className="p-6 pb-2 border-b border-slate-200 bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Swag to Dispense</h3>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {items.map(item => {
                    const percentLeft = (item.current / item.total) * 100;
                    const isCritical = item.current <= item.alertThreshold;
                    const isSelected = selectedItem === item.id;
                    
                    return (
                      <button 
                        key={item.id}
                        onClick={() => setSelectedItem(item.id)}
                        disabled={item.current === 0}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex justify-between items-center ${
                          item.current === 0 ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed' :
                          isSelected ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className={`block font-bold text-sm ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>{item.name}</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Size: {item.size} | SKU: {item.id}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className={`block text-lg font-black leading-none ${isCritical ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                            {item.current}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Left</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Scan Action */}
              <div className="flex-1 p-6 flex flex-col justify-end bg-slate-50">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Currently Dispensing</span>
                  {selectedItem ? (
                    <span className="block text-lg font-black text-teal-700">{items.find(i => i.id === selectedItem).name}</span>
                  ) : (
                    <span className="block text-sm font-bold text-slate-400">Select an item above</span>
                  )}
                </div>

                <button 
                  onClick={handleScanAndDispense}
                  disabled={!selectedItem || scanMode}
                  className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center transition-all ${!selectedItem ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white transform hover:-translate-y-1'}`}
                >
                  <span className="text-2xl mr-3">📷</span> Scan Badge to Dispense
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SponsorInventoryTracker;
