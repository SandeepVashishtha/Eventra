/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MeshLivestreaming = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [activeNodes, setActiveNodes] = useState(0); 
  const [syncLatency, setSyncLatency] = useState(0); 
  
  // Simulated camera angles
  const [streams, setStreams] = useState([
    { id: 'STAGE_FRONT', label: 'Front Row', hue: 280, active: true },
    { id: 'VIP_DECK', label: 'VIP Deck', hue: 190, active: false },
    { id: 'MOSH_PIT', label: 'Mosh Pit', hue: 350, active: false },
    { id: 'SOUND_BOOTH', label: 'Sound Booth', hue: 120, active: false },
    { id: 'STAGE_RIGHT', label: 'Stage Right', hue: 45, active: false },
    { id: 'BACK_CROWD', label: 'Back Crowd', hue: 220, active: false },
  ]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'WebRTC Mesh Network Initialized.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Audio Fingerprinting AI standing by.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setActiveNodes(prev => {
              const variance = Math.floor((Math.random() - 0.5) * 50);
              return Math.max(1200, Math.min(5000, prev + variance));
          });

          setSyncLatency(45 + Math.random() * 15); // ms

          // Slowly change hues to simulate lightshow
          setStreams(prev => prev.map(s => ({
              ...s,
              hue: (s.hue + 1) % 360
          })));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveNodes(3421);
      addLog('SYS', 'Ingesting 3,421 simultaneous P2P WebRTC streams.');
      addLog('ACTION', 'AI synchronizing streams via acoustic fingerprinting...');
    } else {
      setSystemActive(false);
      setActiveNodes(0);
      setSyncLatency(0);
      addLog('WARN', 'Mesh Network disconnected. Reverting to static official boom camera.');
    }
  };

  const switchStream = (id) => {
      if (!systemActive) return;
      
      setStreams(prev => prev.map(s => ({
          ...s,
          active: s.id === id
      })));
      
      const newStream = streams.find(s => s.id === id);
      addLog('ACTION', `User switched POV to Node: ${newStream.label}`);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const activeStream = streams.find(s => s.active);

  return (
    <div className="min-h-screen bg-[#060205] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> WebRTC Mesh Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Crowd-Sourced Multi-Angle <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500">Livestreaming</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Official festival livestreams only offer limited angles curated by a director, completely missing the visceral, chaotic experience of being deep in the crowd. Eventra solves this by implementing a WebRTC-based mesh network where attendees can opt-in to stream their phone camera feeds. The backend ingests thousands of simultaneous streams, using AI audio fingerprinting to perfectly sync them to the millisecond. Remote viewers can dynamically switch between thousands of localized crowd perspectives in real-time.
          </p>

          <div className="bg-[#0f050b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🎛️</span> Broadcast Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Terminate Mesh' : 'Initialize WebRTC Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Active Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   P2P Phone Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {activeNodes.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Sync Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   A/V Sync Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     {syncLatency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Audio Sync Engine */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-pink-950/20 border-pink-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fingerprint Sync
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? 'LOCKED' : 'IDLE'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050102] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Edge Processing Ledger</span>
                 {systemActive && <span className="text-rose-400 font-black animate-pulse">INGESTING DISTRIBUTED VIDEO</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' : 'text-slate-400'
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
            
            {/* Immersive Video Player */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              {!systemActive ? (
                 <div className="absolute inset-0 flex items-center justify-center z-10 h-[400px]">
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">OFFICIAL FEED ONLY</span>
                 </div>
              ) : (
                <div className="w-full relative z-20 flex flex-col">
                    
                    {/* Main Stage View */}
                    <div 
                        className="w-full h-64 relative flex items-center justify-center overflow-hidden transition-all duration-300"
                        style={{ backgroundColor: `hsl(${activeStream.hue}, 80%, 15%)` }}
                    >
                        {/* Fake Stage Visuals */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end opacity-60">
                            {/* Lasers */}
                            <div className="absolute bottom-10 w-1 h-[200px] bg-white blur-[2px] origin-bottom -rotate-45" style={{ boxShadow: `0 0 20px hsl(${activeStream.hue}, 100%, 50%)` }}></div>
                            <div className="absolute bottom-10 w-1 h-[200px] bg-white blur-[2px] origin-bottom rotate-45" style={{ boxShadow: `0 0 20px hsl(${activeStream.hue}, 100%, 50%)` }}></div>
                            
                            {/* DJ Booth */}
                            <div className="w-24 h-12 bg-black border-t-2 shadow-[0_-10px_30px_rgba(255,255,255,0.3)] z-10 flex items-center justify-center" style={{ borderColor: `hsl(${activeStream.hue}, 100%, 50%)` }}>
                                <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                            </div>

                            {/* Shaky Cam effect if Mosh Pit */}
                            {activeStream.id === 'MOSH_PIT' && (
                                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] animate-[ping_0.5s_infinite]"></div>
                            )}
                        </div>

                        {/* LIVE UI Overlay */}
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                            <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse">LIVE</div>
                            <span className="text-[8px] font-mono font-bold text-white shadow-md bg-black/50 px-1 rounded">{activeStream.label}</span>
                        </div>
                        
                        <div className="absolute top-4 right-4 flex items-center">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping mr-1"></div>
                            <span className="text-[8px] font-mono text-rose-300 bg-black/50 px-1 rounded">{activeNodes.toLocaleString()} Viewers</span>
                        </div>
                    </div>

                    {/* Crowd Sourced Mesh Selector Grid */}
                    <div className="w-full h-32 bg-[#050102] p-2 flex flex-col border-t border-white/10">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Nearby P2P Angles (Audio Synced)</span>
                        
                        <div className="flex space-x-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                            {streams.map(stream => (
                                <button
                                    key={stream.id}
                                    onClick={() => switchStream(stream.id)}
                                    className={`shrink-0 w-24 h-16 rounded-md border-2 relative overflow-hidden transition-all ${
                                        stream.active ? 'border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'border-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    {/* Mini thumbnail background */}
                                    <div 
                                        className="absolute inset-0 opacity-40 transition-colors duration-300"
                                        style={{ backgroundColor: `hsl(${stream.hue}, 80%, 20%)` }}
                                    ></div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center p-1 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="text-[8px] font-bold text-white text-center">{stream.label}</span>
                                    </div>
                                    
                                    {stream.active && <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
              )}
              
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MeshLivestreaming;
