/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SpatialAudioWebRtc = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [distanceToStage, setDistanceToStage] = useState(150); // meters
  
  // DSP Metrics
  const speedOfSound = 343; // m/s
  const [calculatedDelay, setCalculatedDelay] = useState(0); // ms
  const [syncStatus, setSyncStatus] = useState('UNSYNCED'); // UNSYNCED, SYNCING, PHASE_LOCKED
  
  // System Metrics
  const [activeListeners, setActiveListeners] = useState(4092); 
  const [bandwidthUsage, setBandwidthUsage] = useState(0); // Gbps
  const [avgLatency, setAvgLatency] = useState(0); // WebRTC latency (ms)
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'WebRTC Lossless Audio Daemon initialized.' },
    { id: 2, time: '21:30:02', type: 'SYS', msg: 'Awaiting WebAudio Context connection...' }
  ]);

  useEffect(() => {
    let loop;
    
    if (isStreaming) {
      loop = setInterval(() => {
          setActiveListeners(prev => Math.min(8500, prev + Math.floor(Math.random() * 5)));
          setBandwidthUsage(12.4 + (Math.random() * 2));
          setAvgLatency(18 + Math.random() * 4); // ultra low latency
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [isStreaming]);

  // Recalculate delay whenever distance changes
  useEffect(() => {
      if (!isStreaming) return;
      
      setSyncStatus('SYNCING');
      
      // Physics calculation: t = d / v
      const delaySeconds = distanceToStage / speedOfSound;
      const delayMs = delaySeconds * 1000;
      
      // WebRTC inherent latency compensation (approx 20ms)
      const compensatedDelay = Math.max(0, delayMs - 20);
      
      const timer = setTimeout(() => {
          setCalculatedDelay(compensatedDelay);
          setSyncStatus('PHASE_LOCKED');
          if (Math.random() > 0.7) {
            addLog('SYS', `DSP: Recalculated phase delay for ${distanceToStage}m -> ${compensatedDelay.toFixed(1)}ms`);
          }
      }, 400);

      return () => clearTimeout(timer);
  }, [distanceToStage, isStreaming]);

  const toggleStream = () => {
      setIsStreaming(!isStreaming);
      if (!isStreaming) {
          addLog('SUCCESS', 'WebAudio Context created. Connecting to lossless WebRTC stream.');
          
          // Initial calculation
          setTimeout(() => {
              const delaySeconds = distanceToStage / speedOfSound;
              setCalculatedDelay(Math.max(0, (delaySeconds * 1000) - 20));
              setSyncStatus('PHASE_LOCKED');
              addLog('SUCCESS', 'Phase locked to physical acoustic wavefront.');
          }, 800);
          
      } else {
          addLog('WARN', 'WebAudio Context suspended. Disconnected from WebRTC pool.');
          setSyncStatus('UNSYNCED');
          setCalculatedDelay(0);
          setActiveListeners(4092);
          setBandwidthUsage(0);
          setAvgLatency(0);
      }
  };

  const handleDistanceChange = (e) => {
      setDistanceToStage(parseInt(e.target.value));
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Digital Signal Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Geofenced Spatial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-indigo-500">Audio via WebRTC</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees standing at the back of massive crowds experience terrible sound quality, muddiness, and audio delay due to the physical speed of sound. Eventra solves this by allowing attendees to connect their own high-fidelity earbuds to the app. The app uses GPS geofencing to calculate their exact distance from the stage arrays. It then requests a lossless audio stream via WebRTC, dynamically applying the exact millisecond delay compensation via the WebAudio API to perfectly sync with the physical sound waves hitting them, effectively eliminating the need for expensive, sightline-blocking delay towers.
          </p>

          <div className="bg-[#0a050a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> WebRTC Audio Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStream}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isStreaming ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)]'
                   }`}
                 >
                   {isStreaming ? 'Suspend DSP Engine' : 'Connect Earbuds (Sync)'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* DSP Delay */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 syncStatus === 'SYNCING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)] animate-pulse' : 
                 syncStatus === 'PHASE_LOCKED' ? 'bg-pink-950/20 border-pink-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DSP Buffer Delay
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     syncStatus === 'SYNCING' ? 'text-fuchsia-400' : 
                     syncStatus === 'PHASE_LOCKED' ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {calculatedDelay.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Active Streams */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isStreaming ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Listeners
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isStreaming ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {(activeListeners / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>
               
               {/* Network Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isStreaming ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   WebRTC Latency
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         isStreaming ? 'text-slate-300' : 'text-slate-600'
                       }`}>
                         {avgLatency.toFixed(0)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Audio Worklet Ledger</span>
                 {syncStatus === 'PHASE_LOCKED' && <span className="text-pink-400 font-black animate-pulse">ACOUSTIC PHASE LOCKED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* Mobile Spatial Audio UI Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                isStreaming ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="pt-12 pb-4 px-6 border-b border-slate-800 flex justify-between items-center z-20 bg-black/50 backdrop-blur-md">
                  <span className="text-sm font-black tracking-widest text-white uppercase">Spatial Audio</span>
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-slate-700'}`}></div>
              </div>

              <div className="flex-1 flex flex-col p-6 relative z-10">
                  
                  {!isStreaming ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                         <span className="text-6xl mb-6 opacity-30 grayscale">🎧</span>
                         <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Earbuds Disconnected</h3>
                         <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">Connect your headphones to activate the WebRTC lossless audio stream and eliminate crowd sound delay.</p>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center h-full animate-fade-in-up w-full">
                        
                        {/* Audio Waveform Visualization */}
                        <div className="w-full h-32 flex items-center justify-center gap-1 mb-8 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-gradient-to-t from-fuchsia-600 to-pink-400 rounded-full"
                                    style={{
                                        height: `${10 + Math.random() * 80}%`,
                                        animation: `waveform ${0.5 + Math.random()}s ease-in-out infinite alternate`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Status Readout */}
                        <div className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network Stream</span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/30 px-1 rounded">LOSSLESS AAC / 320kbps</span>
                            </div>
                            
                            <div className="flex justify-between items-end border-b border-slate-800 pb-3 mb-3">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">GPS Geofence Dist.</span>
                                <span className="text-lg font-black text-white font-mono">{distanceToStage}m</span>
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest block">Phase Alignment</span>
                                    <span className={`text-[8px] font-mono ${syncStatus === 'PHASE_LOCKED' ? 'text-emerald-500' : 'text-fuchsia-400'}`}>
                                        {syncStatus === 'PHASE_LOCKED' ? 'SYNCED TO STAGE' : 'CALCULATING...'}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-pink-400 font-mono">+{calculatedDelay.toFixed(0)}ms</span>
                            </div>
                        </div>

                        {/* Interactive Distance Slider (To simulate walking away from stage) */}
                        <div className="w-full mt-auto mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-4 text-center">
                                Simulate Walking From Stage (Geofence)
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🔈</span>
                                <input 
                                    type="range" 
                                    min="20" 
                                    max="500" 
                                    value={distanceToStage}
                                    onChange={handleDistanceChange}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{distanceToStage}m</span>
                            </div>
                            <div className="flex justify-between mt-2 text-[8px] text-slate-600 font-mono">
                                <span>Front Row (20m)</span>
                                <span>Back of Crowd (500m)</span>
                            </div>
                        </div>

                    </div>
                  )}

              </div>
              
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes waveform {
            0% { height: 10%; opacity: 0.5; }
            100% { height: 100%; opacity: 1; }
        }
      `}} />

    </div>
  );
};

export default SpatialAudioWebRtc;
