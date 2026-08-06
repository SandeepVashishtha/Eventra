import React, { useState, useEffect } from 'react';

const OfflinePWACheckIn = () => {
  const [isOnline, setIsOnline] = useState(false); // Simulate starting offline in a deadzone
  const [syncing, setSyncing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [scannedList, setScannedList] = useState([]);
  
  // Simulate scanning a ticket
  const handleScan = () => {
    const newScan = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'pending' // pending sync
    };
    
    setScannedList(prev => [newScan, ...prev]);
    setScanCount(prev => prev + 1);
  };

  // Simulate regaining connection and syncing
  const toggleConnection = () => {
    if (!isOnline) {
      setIsOnline(true);
      if (scannedList.filter(s => s.status === 'pending').length > 0) {
        setSyncing(true);
        // Simulate sync delay
        setTimeout(() => {
          setScannedList(prev => prev.map(s => ({ ...s, status: 'synced' })));
          setSyncing(false);
        }, 2000);
      }
    } else {
      setIsOnline(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Service Workers Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Offline-First <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">PWA Staff App</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Dead zones won't stop your event. Keep scanning tickets seamlessly even when the venue WiFi goes down. Data caches locally in IndexedDB and syncs automatically when the connection returns.
          </p>
          
          <div className="pt-4 border-t border-slate-800">
             <button 
                onClick={toggleConnection}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-700 transition shadow-lg"
             >
               {isOnline ? 'Simulate Connection Drop' : 'Simulate Connection Restored'}
             </button>
          </div>
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center relative">
          
          {/* Simulated Scanner Device Frame */}
          <div className="w-[340px] h-[720px] bg-black rounded-[2.5rem] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Top Status Bar */}
            <div className={`h-10 flex items-center justify-between px-4 transition-colors duration-500 ${isOnline ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <span className="text-[10px] font-black uppercase text-white tracking-widest">
                {isOnline ? (syncing ? 'Syncing...' : 'Online') : 'Offline Mode'}
              </span>
              <span className="text-white text-xs">
                {isOnline ? (syncing ? '🔄' : '📶') : '⚠️'}
              </span>
            </div>

            {/* App Content */}
            <div className="flex-1 bg-slate-50 flex flex-col relative text-slate-800">
              
              {/* Header Stats */}
              <div className="bg-white p-4 shadow-sm border-b border-slate-200 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Scans</p>
                  <p className="font-black text-2xl text-slate-900">{scanCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Sync</p>
                  <p className={`font-black text-2xl ${scannedList.filter(s => s.status === 'pending').length > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                    {scannedList.filter(s => s.status === 'pending').length}
                  </p>
                </div>
              </div>

              {/* Main Scanner Action */}
              <div className="p-6 flex flex-col items-center justify-center border-b border-slate-200 bg-slate-50">
                <button 
                  onClick={handleScan}
                  disabled={syncing}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 ${syncing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'}`}
                >
                  <span className="text-4xl mb-1">📷</span>
                  <span className="font-black uppercase tracking-widest text-xs">Scan</span>
                </button>
                <p className="text-xs text-slate-400 font-bold mt-4">
                  Tap to simulate QR scan
                </p>
              </div>

              {/* Local Cache Log */}
              <div className="flex-1 bg-white overflow-hidden flex flex-col">
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase">Local Scan Log</span>
                  {syncing && <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {scannedList.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-8">No recent scans.</div>
                  ) : (
                    scannedList.map((scan, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-700">TKT-{scan.id.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-500">{scan.time}</p>
                        </div>
                        
                        {scan.status === 'pending' ? (
                          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-200 flex items-center">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
                            Cached
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 flex items-center animate-fade-in">
                            ✓ Synced
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfflinePWACheckIn;
