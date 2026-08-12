import React, { useState, useEffect } from 'react';

const InterpretationAudioRouter = () => {
  const [activeChannel, setActiveChannel] = useState('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [latency, setLatency] = useState(42);
  const [volume, setVolume] = useState(75);
  const [connectedHeadphones, setConnectedHeadphones] = useState('AirPods Pro');

  const channels = [
    { id: 'en', name: 'Original Floor Audio', lang: 'English', icon: '🇺🇸', interpreter: 'None' },
    { id: 'es', name: 'Español', lang: 'Spanish', icon: '🇪🇸', interpreter: 'Maria G.' },
    { id: 'fr', name: 'Français', lang: 'French', icon: '🇫🇷', interpreter: 'Jean-Paul D.' },
    { id: 'ja', name: '日本語', lang: 'Japanese', icon: '🇯🇵', interpreter: 'Kenji S.' },
    { id: 'de', name: 'Deutsch', lang: 'German', icon: '🇩🇪', interpreter: 'Hans M.' }
  ];

  // Simulate ultra-low latency fluctuations
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setLatency(prev => {
        const fluctuation = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(15, Math.min(80, prev + fluctuation));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const changeChannel = (id) => {
    setIsPlaying(false);
    setActiveChannel(id);
    // Simulate brief buffering when switching channels
    setTimeout(() => {
      setIsPlaying(true);
    }, 400);
  };

  const currentSettings = channels.find(c => c.id === activeChannel);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200 p-6 overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="max-w-6xl mx-auto w-full mb-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-900/50 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                Live Translation AV
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Simultaneous Interpretation</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Eliminate expensive, unhygienic RF headsets. Stream the live interpreter's audio feed directly to attendees' personal Bluetooth earbuds over the venue's WiFi with ultra-low latency.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Channel Selector (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Select Language</h3>
              <span className="bg-emerald-900/50 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/30">
                5 Channels Live
              </span>
            </div>
            
            <div className="space-y-3">
              {channels.map((channel) => (
                <button 
                  key={channel.id}
                  onClick={() => changeChannel(channel.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    activeChannel === channel.id 
                      ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl bg-slate-950 p-2 rounded-xl shadow-inner">{channel.icon}</span>
                    <div>
                      <h4 className={`font-black ${activeChannel === channel.id ? 'text-white' : 'text-slate-200'}`}>
                        {channel.name}
                      </h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeChannel === channel.id ? 'text-blue-200' : 'text-slate-500'}`}>
                        {channel.id === 'en' ? 'Main Stage Mic' : `Interpreter: ${channel.interpreter}`}
                      </p>
                    </div>
                  </div>
                  
                  {activeChannel === channel.id && isPlaying && (
                    <div className="flex items-end space-x-1 h-6">
                      <div className="w-1.5 bg-white rounded-t animate-[bounce_1s_infinite_100ms]"></div>
                      <div className="w-1.5 bg-white rounded-t animate-[bounce_1s_infinite_200ms]"></div>
                      <div className="w-1.5 bg-white rounded-t animate-[bounce_1s_infinite_300ms]"></div>
                      <div className="w-1.5 bg-white rounded-t animate-[bounce_1s_infinite_400ms]"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Player Interface (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full max-w-[420px] bg-slate-950 rounded-[3rem] border-[12px] border-slate-800 overflow-hidden shadow-2xl relative flex flex-col h-[750px]">
            
            {/* Phone Status Bar */}
            <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* App UI */}
            <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-950 pt-20 px-6 pb-8 flex flex-col relative">
               
               {/* Event Header */}
               <div className="text-center mb-10">
                 <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Global Summit '26</h2>
                 <p className="text-white font-black text-xl">Keynote: Future of Web3</p>
               </div>

               {/* Large Album Art / Visualizer Area */}
               <div className="w-full aspect-square bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl mb-10 relative overflow-hidden flex items-center justify-center">
                  
                  {/* Ripples when playing */}
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-3xl animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-4 border-2 border-blue-400 rounded-3xl animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                    </>
                  )}

                  <div className="text-center z-10">
                    <span className="text-8xl drop-shadow-2xl">{currentSettings.icon}</span>
                  </div>
                  
                  {/* Bluetooth Connection Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 flex items-center space-x-2">
                    <span className="text-blue-400 text-sm">🎧</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">{connectedHeadphones}</span>
                  </div>
               </div>

               {/* Track Info */}
               <div className="flex justify-between items-end mb-8">
                 <div>
                   <h3 className="text-3xl font-black text-white">{currentSettings.name}</h3>
                   <p className="text-blue-400 font-bold text-sm mt-1">{currentSettings.id === 'en' ? 'Live Stage Feed' : `Live Interpreter: ${currentSettings.interpreter}`}</p>
                 </div>
               </div>

               {/* Main Controls */}
               <div className="flex items-center justify-center space-x-8 mb-10">
                 <button className="text-slate-400 hover:text-white transition text-2xl">⏮</button>
                 
                 <button 
                   onClick={togglePlayback}
                   className="w-20 h-20 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl shadow-[0_0_30px_rgba(37,99,235,0.5)] transition transform hover:scale-105"
                 >
                   {isPlaying ? '⏸' : '▶'}
                 </button>
                 
                 <button className="text-slate-400 hover:text-white transition text-2xl">⏭</button>
               </div>

               {/* Volume Slider */}
               <div className="flex items-center space-x-4 mb-auto">
                 <span className="text-slate-500 text-xs">🔈</span>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={volume} 
                   onChange={(e) => setVolume(e.target.value)}
                   className="flex-1 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500" 
                 />
                 <span className="text-slate-500 text-xs">🔊</span>
               </div>

               {/* Tech Specs Footer */}
               <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
                 <div className="flex items-center space-x-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   <span className="text-slate-400 uppercase">WiFi Stream Active</span>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className="text-slate-500">Latency</span>
                   <span className={`${latency < 50 ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>{latency}ms</span>
                 </div>
               </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default InterpretationAudioRouter;
