/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const AdaptiveBitrateStreaming = () => {
  const [isHlsEnabled, setIsHlsEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [networkDropComplete, setNetworkDropComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Streaming states
  const [bandwidth, setBandwidth] = useState(25000); // kbps
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [bufferLevel, setBufferLevel] = useState(100); // %
  const [isBuffering, setIsBuffering] = useState(false);
  
  const bufferIntervalRef = useRef(null);

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Video Engine initialized. Connecting to Live Stage Feed.' }
  ]);

  // Start the base stream
  useEffect(() => {
      if (!isStreaming && !networkDropComplete && activeStep === 0) {
          // Reset state when not running
          setBandwidth(25000);
          setCurrentQuality('1080p');
          setBufferLevel(100);
          setIsBuffering(false);
          if (bufferIntervalRef.current) clearInterval(bufferIntervalRef.current);
      }
  }, [isStreaming, networkDropComplete, activeStep]);


  const executeNetworkDrop = () => {
      setIsStreaming(true);
      setNetworkDropComplete(false);
      setActiveStep(1);
      
      addLog('ACTION', 'User connected to Virtual Stage (1080p 60FPS). Network: 5G (25 Mbps).');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('CRIT', 'Simulating physical movement: User entered concrete building. Network dropping to 3G...');
          setBandwidth(800); // Drop to 800 kbps
          
          if (isHlsEnabled) {
              // HLS Logic
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', '[HLS Engine] Bandwidth drop detected (25Mbps -> 800kbps).');
                  
                  // Simulate buffer draining slightly before switch
                  setBufferLevel(40);
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('WARN', '[HLS Engine] Manifest swapped mid-stream. Degrading to 144p chunk playlist.');
                      setCurrentQuality('144p');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SUCCESS', 'Bitrate adjusted dynamically. Playback continued without buffering.');
                          
                          // Buffer recovers because bitrate is low
                          bufferIntervalRef.current = setInterval(() => {
                              setBufferLevel(prev => {
                                  if (prev >= 90) {
                                      clearInterval(bufferIntervalRef.current);
                                      return 100;
                                  }
                                  return prev + 10;
                              });
                          }, 300);
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsStreaming(false);
                              setNetworkDropComplete(true);
                          }, 1500);
                      }, 1000);
                  }, 1200);
              }, 1000);
              
          } else {
              // Legacy MP4 Logic
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('WARN', '[Video Player] Downloading 1080p MP4 file over 3G network...');
                  
                  // Buffer drains quickly
                  bufferIntervalRef.current = setInterval(() => {
                      setBufferLevel(prev => {
                          if (prev <= 0) {
                              clearInterval(bufferIntervalRef.current);
                              return 0;
                          }
                          return prev - 25;
                      });
                  }, 400);

                  setTimeout(() => {
                      setActiveStep(4);
                      setIsBuffering(true);
                      addLog('CRIT', 'FATAL: Video buffer empty. Playback stalled (Stuttering).');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('CRIT', 'Player stuck spinning endlessly. User frustrated and abandoned stream.');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsStreaming(false);
                              setNetworkDropComplete(true);
                          }, 1500);
                      }, 2000);
                  }, 1800);
              }, 1000);
          }
      }, 1500);
  };

  const toggleHls = () => {
      const newState = !isHlsEnabled;
      setIsHlsEnabled(newState);
      setNetworkDropComplete(false);
      setActiveStep(0);
      setIsStreaming(false);
      setBufferLevel(100);
      setCurrentQuality('1080p');
      setIsBuffering(false);
      if (bufferIntervalRef.current) clearInterval(bufferIntervalRef.current);
      
      if (newState) {
          addLog('SUCCESS', 'HTTP Live Streaming (HLS) enabled. Transcoder configured for multi-bitrate m3u8 playlists.');
      } else {
          addLog('CRIT', 'HLS disabled. Forcing monolithic 1080p .mp4 delivery via basic progressive download.');
      }
  };

  const resetDemo = () => {
      setIsStreaming(false);
      setNetworkDropComplete(false);
      setActiveStep(0);
      addLog('SYS', 'User returned to 5G coverage zone. Connection reset.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050204] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📺</span> Media Delivery & UX
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Adaptive Bitrate Streaming <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-rose-500 to-orange-500">(HLS Protocol Integration)</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When users stream the virtual festival on their phones, they often move between good networks (5G) and poor networks (3G or concrete buildings). Currently, the app forces a high-quality 1080p MP4 file. When the network drops, the video player's buffer empties instantly, causing playback to freeze endlessly and frustrating users. Eventra solves this by migrating to HTTP Live Streaming (HLS). The backend chunks the video into multiple resolutions. The frontend player continuously monitors the user's bandwidth. If the network degrades, the player dynamically seamlessly swaps the manifest to a lower resolution (e.g., 144p) mid-stream. Quality drops, but playback NEVER stops.
          </p>

          <div className="bg-[#12040b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Transcoding Engine
               </h3>
               {networkDropComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Network</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* HLS Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Streaming Protocol</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isHlsEnabled ? 'Active: HTTP Live Streaming (.m3u8 chunks)' : 'Inactive: Progressive Download (.mp4)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleHls}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isHlsEnabled ? 'bg-fuchsia-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isHlsEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeNetworkDrop}
                     disabled={isStreaming || networkDropComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         networkDropComplete ? 'bg-slate-800 text-fuchsia-500 border-fuchsia-900 cursor-not-allowed' :
                         isStreaming ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                     }`}
                 >
                     {isStreaming ? 'Simulating 3G Network Drop...' : networkDropComplete ? 'Simulation Completed' : "Simulate Network Drop (5G -> 3G)"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#030102] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Media Player Debugger</span>
                 {isStreaming && <span className="text-fuchsia-400 font-black animate-pulse">PLAYING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-fuchsia-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Video Player Simulation</span>
                      <span className="text-xs text-white font-bold">Virtual Festival Main Stage</span>
                  </div>
              </div>

              <div className="flex-1 bg-black p-4 flex flex-col relative overflow-hidden items-center justify-center">
                  
                  {/* The "Video" Layer */}
                  <div className="absolute inset-0 overflow-hidden">
                      {/* Fake abstract video graphics */}
                      <div className={`w-full h-full flex flex-col transition-all duration-700 ${
                          currentQuality === '144p' ? 'blur-[8px] contrast-150 scale-110' : 'blur-0 contrast-100 scale-100'
                      }`}>
                          {/* Laser Lights */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-full border-l-[40px] border-r-[40px] border-b-[300px] border-transparent border-b-fuchsia-500/20 mix-blend-screen -rotate-45 transform origin-top animate-pulse"></div>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-full border-l-[40px] border-r-[40px] border-b-[300px] border-transparent border-b-cyan-500/20 mix-blend-screen rotate-45 transform origin-top animate-pulse delay-75"></div>
                          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-fuchsia-900/40 to-transparent"></div>
                          
                          {/* DJ/Stage Silhouette */}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-16 bg-black rounded-t-full border-t border-fuchsia-500/50"></div>
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-800 rounded-full mb-16 -ml-4 flex items-center justify-center">
                              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                                  isBuffering ? 'animate-none opacity-50' : (activeStep >= 1 ? 'animate-ping' : 'animate-none opacity-50')
                              }`}></div>
                          </div>
                      </div>

                      {/* Pixelation Overlay for 144p effect */}
                      {currentQuality === '144p' && (
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIj48L3JlY3Q+Cjwvc3ZnPg==')] opacity-50 pointer-events-none mix-blend-overlay"></div>
                      )}
                  </div>

                  {/* Buffering Spinner */}
                  {isBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                          <div className="w-16 h-16 border-4 border-slate-700 border-t-fuchsia-500 rounded-full animate-spin"></div>
                          <span className="absolute mt-24 text-white font-bold text-sm uppercase tracking-widest animate-pulse">Buffering...</span>
                      </div>
                  )}

                  {/* Network Indicator Bubble */}
                  <div className="absolute top-4 right-4 bg-black/80 p-2 rounded-xl border border-slate-700 flex flex-col items-end z-30 shadow-lg backdrop-blur-md">
                      <span className={`text-[8px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded ${
                          bandwidth < 1000 ? 'bg-red-950 text-red-500' : 'bg-emerald-950 text-emerald-400'
                      }`}>
                          {bandwidth < 1000 ? 'POOR 3G' : '5G ULTRA'}
                      </span>
                      <span className="text-white font-mono text-xs">{bandwidth} kbps</span>
                  </div>

                  {/* Quality Badge */}
                  <div className={`absolute top-4 left-4 bg-black/80 px-2 py-1 rounded border z-30 shadow-lg backdrop-blur-md transition-colors ${
                      currentQuality === '144p' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-400'
                  }`}>
                      <span className="font-bold text-sm">{currentQuality}</span>
                      <span className="text-[7px] block uppercase tracking-widest text-slate-400">
                          {isHlsEnabled ? 'Auto (HLS)' : 'Fixed (MP4)'}
                      </span>
                  </div>

                  {/* Video Player UI Controls (Bottom) */}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12 z-30 flex flex-col">
                      
                      {/* Progress/Buffer Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-3 relative overflow-hidden cursor-pointer group">
                          {/* Buffer Level (Gray) */}
                          <div className={`absolute top-0 left-0 h-full bg-slate-500 rounded-full transition-all duration-300 ${
                              isBuffering ? 'animate-pulse' : ''
                          }`} style={{ width: `${bufferLevel}%` }}></div>
                          {/* Playhead Level (Fuchsia) */}
                          <div className="absolute top-0 left-0 h-full bg-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]" style={{ width: `${Math.min(bufferLevel, 45)}%` }}></div>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between items-center text-white">
                          <div className="flex items-center gap-3">
                              <span className="text-lg cursor-pointer hover:text-fuchsia-400 transition-colors">
                                  {isBuffering ? '⏸' : '▶'}
                              </span>
                              <span className="text-lg cursor-pointer hover:text-fuchsia-400 transition-colors">🔈</span>
                              <span className="text-[10px] font-mono">
                                  12:45 / 45:00 <span className="text-red-500 font-bold ml-1 animate-pulse">• LIVE</span>
                              </span>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm cursor-pointer hover:text-fuchsia-400 transition-colors">⚙️</span>
                              <span className="text-sm cursor-pointer hover:text-fuchsia-400 transition-colors">🔲</span>
                          </div>
                      </div>
                  </div>

                  {/* Overlays */}
                  {networkDropComplete && !isHlsEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-red-950/95 backdrop-blur-sm rounded-xl border border-red-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">🐌</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-red-500">Playback Frozen</span>
                          <p className="text-[9px] text-slate-300 leading-relaxed font-mono">
                              The fixed MP4 file required 10Mbps to stream. When the network dropped to 3G (800kbps), the buffer instantly emptied, freezing the video entirely.
                          </p>
                      </div>
                  )}
                  
                  {networkDropComplete && isHlsEnabled && (
                      <div className="absolute inset-x-4 top-1/4 bg-emerald-950/95 backdrop-blur-sm rounded-xl border border-emerald-500 flex flex-col items-center justify-center text-white z-40 animate-fade-in-up p-4 text-center shadow-2xl">
                          <span className="text-4xl mb-2">🎥</span>
                          <span className="text-sm font-black uppercase tracking-widest mb-1 text-emerald-400">Uninterrupted Playback</span>
                          <p className="text-[9px] text-emerald-200 leading-relaxed font-mono">
                              The HLS Engine detected the network drop before the buffer emptied. It instantly swapped the manifest to the 144p chunk playlist. Quality degraded, but the music never stopped.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#12040b] p-4 rounded-xl border border-fuchsia-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-fuchsia-400 uppercase block mb-1">HLS Chunk Transcoding:</span>
               With HLS OFF, click Simulate Network Drop. The app forces the massive 1080p video file. When the user walks into a concrete building (3G speed), the video buffer empties faster than it can fill. The video freezes forever (Buffering), ruining the experience.<br/><br/>Toggle <span className="text-fuchsia-400 font-bold bg-slate-800 px-1 rounded">Streaming Protocol</span> ON. The backend has now transcoded the video into tiny 2-second chunks at varying qualities. When the network drops, the frontend player dynamically switches to requesting the ultra-light 144p chunks. The video becomes blurry, but playback remains perfectly smooth.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AdaptiveBitrateStreaming;
