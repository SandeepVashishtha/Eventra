import React, { useState, useEffect } from 'react';

const OfflineP2PCheckIn = () => {
  const [networkStatus, setNetworkStatus] = useState('offline'); // online, offline, syncing
  const [p2pConnections, setP2pConnections] = useState(3);
  const [syncedRecords, setSyncedRecords] = useState(142);
  const [pendingSync, setPendingSync] = useState(12);

  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, duplicate

  const handleScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      // Simulate checking local IndexedDB
      const isDuplicate = Math.random() > 0.8;
      setScanStatus(isDuplicate ? 'duplicate' : 'success');
      
      if (!isDuplicate) {
        setPendingSync(prev => prev + 1);
        setSyncedRecords(prev => prev + 1);
      }

      setTimeout(() => setScanStatus('idle'), 2500);
    }, 800);
  };

  // Simulate network fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStatus(prev => {
        if (prev === 'offline') return 'syncing';
        if (prev === 'syncing') {
          setPendingSync(0);
          return 'online';
        }
        return Math.random() > 0.7 ? 'offline' : 'online';
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-100 min-h-[700px] flex items-center justify-center font-sans text-slate-800">
      
      {/* Tablet Mockup */}
      <div className="w-[800px] bg-white rounded-[2rem] shadow-2xl relative border-8 border-slate-800 overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Side: Scanner UI */}
        <div className="w-full md:w-1/2 bg-slate-900 flex flex-col items-center justify-center relative p-8 text-white">
          
          <div className="absolute top-6 left-6">
            <h2 className="text-2xl font-black tracking-tight">Eventra OS</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Check-in Kiosk 04</p>
          </div>

          <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
            {/* Viewfinder brackets */}
            <div className="absolute inset-0 border-4 border-slate-700 rounded-3xl opacity-50"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl"></div>

            {scanStatus === 'idle' && (
              <div className="text-center animate-pulse opacity-70">
                <span className="text-5xl mb-2 block">📱</span>
                <p className="font-bold text-sm">Align QR Code</p>
              </div>
            )}
            
            {scanStatus === 'scanning' && (
              <div className="w-full h-full relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-30"></div>
                {/* Laser scan line */}
                <div className="w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_1s_ease-in-out_infinite_alternate]"></div>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="text-center animate-fade-in bg-green-500/20 w-full h-full rounded-3xl flex flex-col items-center justify-center border border-green-500/50">
                <span className="text-6xl text-green-400 mb-2">✓</span>
                <p className="font-black text-xl text-green-400">Verified</p>
                <p className="text-xs text-green-200 mt-1">Marcus Ty (VIP)</p>
              </div>
            )}

            {scanStatus === 'duplicate' && (
              <div className="text-center animate-fade-in bg-red-500/20 w-full h-full rounded-3xl flex flex-col items-center justify-center border border-red-500/50">
                <span className="text-6xl text-red-400 mb-2">⚠</span>
                <p className="font-black text-xl text-red-400">Duplicate</p>
                <p className="text-xs text-red-200 mt-1">Already scanned at Kiosk 02</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleScan}
            disabled={scanStatus !== 'idle'}
            className={`w-full max-w-[200px] py-4 rounded-xl font-black shadow-lg transition ${scanStatus !== 'idle' ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            Simulate Scan
          </button>
        </div>

        {/* Right Side: Network & Sync Status */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col border-l border-slate-200">
          
          <h3 className="font-black text-slate-900 text-xl mb-6 flex items-center">
            <span className="mr-2">📡</span> Topology Status
          </h3>

          <div className="space-y-4 flex-1">
            
            {/* Cloud Status */}
            <div className={`p-4 rounded-2xl border-2 transition-colors ${networkStatus === 'online' ? 'bg-green-50 border-green-200' : networkStatus === 'syncing' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">☁️</span>
                  <h4 className={`font-bold ${networkStatus === 'online' ? 'text-green-800' : networkStatus === 'syncing' ? 'text-blue-800' : 'text-red-800'}`}>
                    Cloud Uplink
                  </h4>
                </div>
                {networkStatus === 'online' && <span className="bg-green-200 text-green-800 text-[10px] font-black uppercase px-2 py-1 rounded">Connected</span>}
                {networkStatus === 'syncing' && <span className="bg-blue-200 text-blue-800 text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse">Syncing...</span>}
                {networkStatus === 'offline' && <span className="bg-red-200 text-red-800 text-[10px] font-black uppercase px-2 py-1 rounded">Offline</span>}
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Pending Sync</p>
                  <p className={`text-2xl font-black ${pendingSync > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                    {pendingSync} <span className="text-sm font-bold text-slate-500">records</span>
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-medium max-w-[120px] text-right">
                  {networkStatus === 'offline' ? 'Writing to local IndexedDB fallback.' : 'Pushing batch to central server.'}
                </p>
              </div>
            </div>

            {/* Local P2P Mesh Status */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              {networkStatus === 'offline' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
              )}
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🕸️</span>
                  <h4 className="font-bold text-slate-800">Local P2P Mesh</h4>
                </div>
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-ping"></span>
                  Active
                </span>
              </div>
              
              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed relative z-10">
                Communicating with nearby check-in kiosks via WebRTC/Bluetooth to prevent double-scanning during cloud outages.
              </p>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Active Peers</p>
                  <p className="font-mono text-lg font-black text-blue-600">{p2pConnections}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mesh Sycns</p>
                  <p className="font-mono text-lg font-black text-slate-700">{syncedRecords}</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Health: Optimal</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default OfflineP2PCheckIn;
