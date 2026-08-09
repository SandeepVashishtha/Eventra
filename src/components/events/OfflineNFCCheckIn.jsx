import React, { useState, useEffect } from 'react';

const OfflineNFCCheckIn = () => {
  const [networkStatus, setNetworkStatus] = useState('online'); // online, offline
  const [syncQueue, setSyncQueue] = useState([]);
  const [checkInState, setCheckInState] = useState('idle'); // idle, scanning, printing, complete
  const [currentAttendee, setCurrentAttendee] = useState(null);

  // Toggle network status every 15 seconds for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStatus(prev => {
        const newStatus = prev === 'online' ? 'offline' : 'online';
        if (newStatus === 'online') {
          // Flush queue when coming back online
          setTimeout(() => {
            setSyncQueue([]);
          }, 1500);
        }
        return newStatus;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const simulateNFCTap = () => {
    setCheckInState('scanning');
    
    setTimeout(() => {
      const attendee = {
        id: `ATT-${Math.floor(Math.random() * 9000) + 1000}`,
        name: 'Jane Doe',
        company: 'InnovateTech',
        ticketType: 'VIP All-Access',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setCurrentAttendee(attendee);
      setCheckInState('printing');

      if (networkStatus === 'offline') {
        setSyncQueue(prev => [...prev, attendee]);
      }

      setTimeout(() => {
        setCheckInState('complete');
        setTimeout(() => setCheckInState('idle'), 3000);
      }, 2000);

    }, 1000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-[600px] flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kiosk Screen Mockup */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col relative h-[500px]">
          
          {/* Status Bar */}
          <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold">
            <div className="flex items-center space-x-3">
              <span>Eventra Kiosk #04</span>
              <span className={`flex items-center px-2 py-0.5 rounded ${networkStatus === 'online' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {networkStatus === 'online' ? (
                  <><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Online Sync Active</>
                ) : (
                  <><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse"></span> Offline Mode</>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span>🖨️ Printer: Connected (Zebra ZD500)</span>
              <span>🔋 92%</span>
            </div>
          </div>

          {/* Main Interface */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            {checkInState === 'idle' && (
              <div className="animate-fade-in cursor-pointer" onClick={simulateNFCTap}>
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome to TechCon 2026</h2>
                <p className="text-gray-500 font-medium">Tap your NFC ticket or phone on the reader below to print your badge.</p>
                <p className="text-xs text-blue-500 font-bold mt-8">(Click here to simulate tap)</p>
              </div>
            )}

            {checkInState === 'scanning' && (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-2xl font-black text-gray-800">Reading NFC Data...</h2>
                {networkStatus === 'offline' && (
                  <p className="text-sm text-gray-500 mt-2">Authenticating via local cache.</p>
                )}
              </div>
            )}

            {checkInState === 'printing' && currentAttendee && (
              <div className="animate-fade-in w-full max-w-sm">
                <h2 className="text-2xl font-black text-gray-800 mb-6">Badge Printing...</h2>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                  <h3 className="text-xl font-bold text-gray-900">{currentAttendee.name}</h3>
                  <p className="text-gray-500 font-medium border-b border-gray-100 pb-3 mb-3">{currentAttendee.company}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{currentAttendee.ticketType}</span>
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {checkInState === 'complete' && (
              <div className="animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">You're Checked In!</h2>
                <p className="text-gray-500 font-medium">Please collect your badge from the printer slot.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Diagnostics Panel */}
        <div className="md:col-span-1 bg-gray-900 rounded-3xl shadow-xl p-6 text-white flex flex-col border border-gray-800">
          <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Background Sync Worker</h3>
          
          <div className={`p-4 rounded-xl border mb-6 ${networkStatus === 'online' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="font-bold">{networkStatus === 'online' ? 'Connection Stable' : 'Connection Lost'}</span>
            </div>
            <p className="text-xs text-gray-400">
              {networkStatus === 'online' ? 'Live syncing with central database via WebSockets.' : 'Local fallback mode active. Caching scans in IndexedDB.'}
            </p>
          </div>

          <div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-gray-300">Offline Queue</h4>
              <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded font-mono">{syncQueue.length} items</span>
            </div>

            {syncQueue.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-8">
                Queue is empty.<br/>All check-ins synced to server.
              </div>
            ) : (
              <div className="space-y-2">
                {syncQueue.map((item, idx) => (
                  <div key={idx} className="bg-gray-900 p-2 rounded flex justify-between items-center text-xs border border-gray-700">
                    <div>
                      <span className="text-gray-400 block">{item.id}</span>
                      <span className="text-gray-200">{item.name}</span>
                    </div>
                    <span className="text-yellow-500">Pending Sync</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {networkStatus === 'online' && syncQueue.length > 0 && (
            <div className="mt-4 bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg text-xs text-blue-200 flex items-center">
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
              Flushing queue to server...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OfflineNFCCheckIn;
