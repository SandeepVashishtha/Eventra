import React, { useState } from 'react';

const LiveStreamSyndication = () => {
  const [broadcasting, setBroadcasting] = useState(false);
  const [destinations, setDestinations] = useState([
    { id: 'youtube', name: 'YouTube Live', icon: '▶️', status: 'ready', bitrate: 0, connected: true },
    { id: 'linkedin', name: 'LinkedIn Live', icon: '💼', status: 'ready', bitrate: 0, connected: true },
    { id: 'twitch', name: 'Twitch', icon: '🟪', status: 'ready', bitrate: 0, connected: false },
    { id: 'custom', name: 'Custom RTMP', icon: '⚙️', status: 'ready', bitrate: 0, connected: true }
  ]);

  const [mainStreamStatus, setMainStreamStatus] = useState({
    fps: 0,
    bitrate: 0,
    droppedFrames: 0
  });

  const toggleBroadcast = () => {
    if (broadcasting) {
      setBroadcasting(false);
      setMainStreamStatus({ fps: 0, bitrate: 0, droppedFrames: 0 });
      setDestinations(prev => prev.map(d => ({ ...d, status: 'ready', bitrate: 0 })));
    } else {
      setBroadcasting(true);
      // Simulate stream metrics
      const streamInterval = setInterval(() => {
        setMainStreamStatus(prev => ({
          fps: Math.random() > 0.9 ? 59 : 60,
          bitrate: Math.floor(Math.random() * 500) + 7500, // ~8000 kbps
          droppedFrames: prev.droppedFrames + (Math.random() > 0.95 ? 1 : 0)
        }));

        setDestinations(prev => prev.map(d => {
          if (!d.connected) return d;
          return {
            ...d,
            status: 'live',
            bitrate: Math.floor(Math.random() * 300) + 4000 // Transcoded outputs
          };
        }));
      }, 1000);

      // Store interval ID to clear later in a real app
      window.syndicationInterval = streamInterval;
    }
  };

  // Cleanup for simulation
  React.useEffect(() => {
    return () => {
      if (window.syndicationInterval) clearInterval(window.syndicationInterval);
    };
  }, []);

  const toggleConnection = (id) => {
    if (broadcasting) return; // Cannot toggle while live
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, connected: !d.connected } : d
    ));
  };

  return (
    <div className="p-6 bg-slate-900 rounded-2xl shadow-2xl max-w-5xl mx-auto mt-8 border border-slate-700 text-slate-200 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 tracking-tight">
            RTMP Restream Studio
          </h2>
          <p className="text-sm text-slate-400 mt-1">Ingest once, broadcast everywhere via Eventra cloud transcoding.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={toggleBroadcast}
            className={`px-8 py-3 rounded-full font-black text-lg shadow-xl transition-all flex items-center ${broadcasting ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950'}`}
          >
            {broadcasting ? (
              <><span className="w-3 h-3 bg-white rounded-full mr-3"></span> END BROADCAST</>
            ) : (
              <><span className="mr-2">📡</span> GO LIVE</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Ingest Preview */}
        <div className="lg:col-span-8 bg-black rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-xs font-bold border-b border-slate-700">
            <span className="text-slate-400 uppercase tracking-widest">Main Ingest Source</span>
            <span className="bg-slate-900 text-blue-400 px-2 py-1 rounded border border-slate-700 font-mono">
              rtmp://ingest.eventra.com/live/key_8f92a...
            </span>
          </div>
          
          <div className={`flex-1 relative flex items-center justify-center ${broadcasting ? "bg-[url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" : "bg-slate-900"}`}>
            {!broadcasting && (
              <div className="text-center text-slate-600">
                <span className="text-6xl block mb-2">📹</span>
                <p className="font-bold">Awaiting Stream Signal...</p>
                <p className="text-xs mt-1 font-mono">Connect your OBS/vMix encoder</p>
              </div>
            )}
            
            {broadcasting && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg flex items-center">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                LIVE
              </div>
            )}
          </div>
          
          <div className="bg-slate-950 p-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Resolution</p>
              <p className="font-mono font-bold text-slate-300">1080p60</p>
            </div>
            <div className="border-l border-r border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Ingest Bitrate</p>
              <p className={`font-mono font-bold ${broadcasting ? 'text-emerald-400' : 'text-slate-600'}`}>
                {mainStreamStatus.bitrate} kbps
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dropped Frames</p>
              <p className={`font-mono font-bold ${mainStreamStatus.droppedFrames > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                {mainStreamStatus.droppedFrames}
              </p>
            </div>
          </div>
        </div>

        {/* Syndication Destinations */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-[500px]">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-slate-300 mb-1">Destinations</h3>
            <p className="text-xs text-slate-500 mb-4">Select platforms to restream to.</p>
            
            <div className="space-y-3 overflow-y-auto pr-2 max-h-[380px]">
              {destinations.map(dest => (
                <div 
                  key={dest.id} 
                  className={`p-3 rounded-lg border transition-all ${
                    dest.connected ? 'bg-slate-700 border-slate-500' : 'bg-slate-900 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{dest.icon}</span>
                      <span className="font-bold text-sm text-white">{dest.name}</span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div 
                      onClick={() => toggleConnection(dest.id)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer ${broadcasting ? 'opacity-50 cursor-not-allowed' : ''} ${dest.connected ? 'bg-blue-500' : 'bg-slate-600'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${dest.connected ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </div>

                  {dest.connected && (
                    <div className="bg-slate-900 rounded p-2 flex justify-between items-center mt-2 border border-slate-800">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${dest.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{dest.status}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{dest.bitrate} kbps</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveStreamSyndication;
