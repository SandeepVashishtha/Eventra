import React, { useState } from 'react';

const RemoteAVControlRoom = () => {
  const [activeCamera, setActiveCamera] = useState('CAM 1');
  const [lowerThirdActive, setLowerThirdActive] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState('offline'); // offline, connecting, live
  const [audioLevels, setAudioLevels] = useState({ mic1: 75, mic2: 45, master: 80 });

  const cameras = [
    { id: 'CAM 1', name: 'Center Wide', status: 'live' },
    { id: 'CAM 2', name: 'Stage Left Close', status: 'standby' },
    { id: 'CAM 3', name: 'Stage Right Close', status: 'standby' },
    { id: 'CAM 4', name: 'Audience Reaction', status: 'standby' }
  ];

  const handleCut = (camId) => {
    if (streamingStatus === 'live') {
      setActiveCamera(camId);
    }
  };

  const toggleStream = () => {
    if (streamingStatus === 'offline') {
      setStreamingStatus('connecting');
      setTimeout(() => setStreamingStatus('live'), 1500);
    } else {
      setStreamingStatus('offline');
      setLowerThirdActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-200 overflow-hidden">
      
      {/* Top Bar - Control Room Status */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎛️</span>
            <h1 className="font-black tracking-widest uppercase text-sm">Eventra Cloud AV Control</h1>
          </div>
          <div className="w-px h-6 bg-neutral-700"></div>
          <span className="text-xs font-mono text-neutral-400">Remote Node: Frankfurt (Ping: 12ms)</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {streamingStatus === 'live' && (
            <div className="flex space-x-6 text-[10px] font-mono text-neutral-400">
              <span>DROPPED: 0</span>
              <span>BITRATE: 8.5 Mbps</span>
              <span>OUT: 1080p60</span>
            </div>
          )}
          <button 
            onClick={toggleStream}
            className={`px-6 py-1.5 rounded text-xs font-black uppercase tracking-widest transition ${
              streamingStatus === 'live' ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 
              streamingStatus === 'connecting' ? 'bg-yellow-600 text-white' : 
              'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            {streamingStatus === 'live' ? 'END BROADCAST' : streamingStatus === 'connecting' ? 'CONNECTING...' : 'GO LIVE'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-1 p-2">
        
        {/* Left Panel: Preview/Program & Audio (Col span 8) */}
        <div className="col-span-8 flex flex-col gap-1">
          
          {/* Main Viewer Area */}
          <div className="flex-1 grid grid-cols-2 gap-1">
            {/* PREVIEW */}
            <div className="bg-neutral-900 border border-neutral-800 flex flex-col relative">
              <div className="absolute top-2 left-2 z-10 flex items-center">
                <span className="bg-green-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">PREVIEW</span>
              </div>
              <div className="flex-1 bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                {/* Simulated Preview content */}
                <div className="absolute inset-0 bg-neutral-800 opacity-20"></div>
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale contrast-125 opacity-50"></div>
                <div className="absolute inset-0 border-[4px] border-transparent hover:border-green-500 transition cursor-pointer"></div>
                
                {/* Safe areas */}
                <div className="absolute inset-8 border border-neutral-700/50 border-dashed pointer-events-none"></div>
              </div>
            </div>

            {/* PROGRAM (LIVE) */}
            <div className={`bg-neutral-900 border ${streamingStatus === 'live' ? 'border-red-900' : 'border-neutral-800'} flex flex-col relative`}>
              <div className="absolute top-2 left-2 z-10 flex items-center">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow ${streamingStatus === 'live' ? 'bg-red-600 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                  PROGRAM {streamingStatus === 'live' && '(LIVE)'}
                </span>
              </div>
              <div className="absolute top-2 right-2 z-10 text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded">
                {activeCamera}
              </div>
              
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {streamingStatus === 'offline' ? (
                  <div className="text-neutral-700 font-mono text-sm">NO SIGNAL</div>
                ) : (
                  <>
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                    
                    {/* Simulated Lower Third */}
                    {lowerThirdActive && (
                      <div className="absolute bottom-10 left-10 animate-fade-in-up">
                        <div className="bg-blue-600 text-white px-6 py-2 shadow-lg">
                          <h2 className="text-xl font-black uppercase tracking-wider">Dr. Sarah Jenkins</h2>
                        </div>
                        <div className="bg-white text-blue-900 px-6 py-1 shadow-lg">
                          <p className="text-sm font-bold uppercase">Chief AI Scientist, NexusTech</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className={`absolute inset-0 border-[4px] ${streamingStatus === 'live' ? 'border-red-600' : 'border-transparent'} pointer-events-none`}></div>
              </div>
            </div>
          </div>

          {/* Multiview Switcher */}
          <div className="h-48 grid grid-cols-4 gap-1">
            {cameras.map(cam => (
              <button 
                key={cam.id}
                onClick={() => handleCut(cam.id)}
                disabled={streamingStatus === 'offline'}
                className={`bg-neutral-900 border relative flex flex-col items-start justify-end p-2 group ${
                  activeCamera === cam.id && streamingStatus === 'live' ? 'border-red-600' : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60')] bg-cover bg-center transition ${activeCamera === cam.id && streamingStatus === 'live' ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}`}></div>
                
                <div className="relative z-10 w-full flex justify-between items-end">
                  <div className="bg-black/70 px-2 py-1 rounded">
                    <span className="block text-[9px] font-black uppercase text-neutral-400">{cam.id}</span>
                    <span className="block text-xs font-bold text-white leading-none">{cam.name}</span>
                  </div>
                  {activeCamera === cam.id && streamingStatus === 'live' && (
                    <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_#dc2626]"></span>
                  )}
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Right Panel: Controls & Audio Mixer (Col span 4) */}
        <div className="col-span-4 bg-neutral-900 border border-neutral-800 flex flex-col">
          
          {/* Overlays / Graphics */}
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">Graphics & Overlays</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-neutral-950 p-3 rounded border border-neutral-800">
                <div>
                  <span className="block text-xs font-bold text-white">Speaker Lower Third</span>
                  <span className="block text-[10px] text-neutral-500">Dr. Sarah Jenkins</span>
                </div>
                <button 
                  onClick={() => setLowerThirdActive(!lowerThirdActive)}
                  disabled={streamingStatus === 'offline'}
                  className={`px-3 py-1 text-[10px] font-black uppercase rounded transition ${lowerThirdActive ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                >
                  {lowerThirdActive ? 'CUT' : 'AUTO'}
                </button>
              </div>
              
              <div className="flex items-center justify-between bg-neutral-950 p-3 rounded border border-neutral-800 opacity-50">
                <div>
                  <span className="block text-xs font-bold text-white">Event Logo Bug</span>
                  <span className="block text-[10px] text-neutral-500">Top Right Corner</span>
                </div>
                <button disabled className="px-3 py-1 text-[10px] font-black uppercase rounded bg-neutral-800 text-neutral-500">
                  AUTO
                </button>
              </div>
            </div>
          </div>

          {/* WebRTC Audio Mixer */}
          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4 flex justify-between">
              <span>Audio Mixer</span>
              <span className="text-green-500">WebRTC Opus</span>
            </h3>
            
            <div className="flex-1 flex justify-around items-end pb-4 pt-8">
              
              {/* Mic 1 */}
              <div className="flex flex-col items-center w-16">
                <div className="h-48 w-6 bg-neutral-950 rounded-full border border-neutral-800 relative flex items-end overflow-hidden mb-3">
                  {streamingStatus === 'live' && (
                    <div className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-75" style={{ height: `${audioLevels.mic1}%` }}></div>
                  )}
                  {/* Fader knob mock */}
                  <div className="absolute w-10 h-3 bg-neutral-300 rounded shadow left-1/2 -translate-x-1/2" style={{ bottom: '75%' }}></div>
                </div>
                <button className="w-8 h-8 rounded bg-green-900/30 text-green-500 border border-green-500/50 text-[9px] font-black mb-2 hover:bg-green-900/50 transition">ON</button>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Mic 1</span>
              </div>

              {/* Mic 2 */}
              <div className="flex flex-col items-center w-16">
                <div className="h-48 w-6 bg-neutral-950 rounded-full border border-neutral-800 relative flex items-end overflow-hidden mb-3">
                  {streamingStatus === 'live' && (
                    <div className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-75" style={{ height: `${audioLevels.mic2}%` }}></div>
                  )}
                  <div className="absolute w-10 h-3 bg-neutral-300 rounded shadow left-1/2 -translate-x-1/2" style={{ bottom: '45%' }}></div>
                </div>
                <button className="w-8 h-8 rounded bg-neutral-800 text-neutral-500 border border-neutral-700 text-[9px] font-black mb-2">MUTE</button>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Mic 2</span>
              </div>
              
              {/* Separator */}
              <div className="w-px h-48 bg-neutral-800 mx-2"></div>

              {/* Master */}
              <div className="flex flex-col items-center w-16">
                <div className="h-48 w-6 bg-neutral-950 rounded-full border border-neutral-800 relative flex items-end overflow-hidden mb-3">
                  {streamingStatus === 'live' && (
                    <div className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-75" style={{ height: `${audioLevels.master}%` }}></div>
                  )}
                  <div className="absolute w-10 h-3 bg-red-600 rounded shadow left-1/2 -translate-x-1/2" style={{ bottom: '80%' }}></div>
                </div>
                <span className="text-[9px] font-black text-white bg-black px-2 py-1 rounded mb-2 border border-neutral-800">-3.2 dB</span>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Master</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RemoteAVControlRoom;
