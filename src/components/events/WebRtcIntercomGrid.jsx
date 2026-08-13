/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebRtcIntercomGrid = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // WebRTC Metrics
  const [activePeers, setActivePeers] = useState(0); 
  const [avgLatency, setAvgLatency] = useState(0); // ms
  const [activeChannels, setActiveChannels] = useState(0);
  const [dataTransferred, setDataTransferred] = useState(14.2); // GB
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'WebSocket signaling server initialized.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Awaiting WebRTC peer STUN/TURN connections.' }
  ]);

  // Visualizer State
  const [currentChannel, setCurrentChannel] = useState('MAIN_STAGE');
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState(Array(24).fill(10));
  const [channelPeers, setChannelPeers] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActivePeers(450 + Math.floor(Math.random() * 20));
          setActiveChannels(24);
          setAvgLatency(12 + Math.random() * 8); // Ultra-low latency ~12-20ms
          
          if (isPTTActive) {
              setDataTransferred(prev => prev + 0.01);
              // Animate waveform
              setAudioWaveform(Array.from({ length: 24 }).map(() => 10 + Math.random() * 80));
          } else {
              setAudioWaveform(Array(24).fill(10));
          }

      }, 150); // Fast update for waveform
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isPTTActive]);

  // Populate fake peers when changing channels
  useEffect(() => {
      if (!systemActive) return;
      
      const peerNames = ['Prod_Dave', 'Sec_Chief', 'Med_Sarah', 'Light_Op', 'Rig_Tony', 'FOH_Mixer'];
      const numPeers = Math.floor(Math.random() * 4) + 2;
      const shuffled = peerNames.sort(() => 0.5 - Math.random());
      setChannelPeers(shuffled.slice(0, numPeers));
      
      addLog('SYS', `Joined WebRTC Mesh Room: ${currentChannel}. Peer count: ${numPeers}.`);
  }, [currentChannel, systemActive]);

  const togglePTT = (active) => {
      if (!systemActive) return;
      setIsPTTActive(active);
      if (active) {
          addLog('ACTION', 'Local peer unmuted (Push-To-Talk active). Transmitting audio stream.');
      } else {
          addLog('ACTION', 'Local peer muted. Stopped audio tracks.');
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setCurrentChannel('MAIN_STAGE');
      addLog('SYS', 'Connecting to local Wi-Fi Mesh network.');
      addLog('SUCCESS', 'ICE Candidate gathered. WebRTC connection established.');
    } else {
      setSystemActive(false);
      setActivePeers(0);
      setActiveChannels(0);
      setAvgLatency(0);
      setChannelPeers([]);
      setIsPTTActive(false);
      addLog('WARN', 'WebRTC connection terminated. Radio fallback engaged.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02070a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎙️</span> WebRTC Communications
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Ultra-Low Latency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Backstage Intercom</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional UHF radio walkie-talkies have massive dead zones around large metal stage structures and are severely limited by a small number of available channels for hundreds of staff members. Eventra solves this by implementing a WebRTC-based mesh intercom system directly into the staff app. Utilizing WebSockets for initial signaling, the app creates dynamic, unlimited multi-channel audio rooms. Staff can seamlessly switch between channels over the festival's localized Wi-Fi mesh with ultra-low latency and crystal-clear digital audio.
          </p>

          <div className="bg-[#050f14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Signaling Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Terminate STUN Server' : 'Establish WebRTC Mesh'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Avg Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive && avgLatency < 20 ? 'bg-emerald-950/40 border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   P2P Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {avgLatency.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Active Peers */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Peers
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activePeers}
                   </span>
                 </div>
               </div>
               
               {/* Active Channels */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Audio Rooms
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeChannels}
                   </span>
                 </div>
               </div>
               
               {/* Data Transferred */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isPTTActive ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Bandwidth
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isPTTActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {dataTransferred.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">GB</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebSocket Signaling Log</span>
                 {isPTTActive && <span className="text-emerald-400 font-black animate-pulse">TX: AUDIO_STREAM_ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Staff App Radio UI Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[550px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#1e293b]'
            }`}>
              
              <div className="flex-1 relative flex flex-col bg-slate-950 m-2 rounded-[1.8rem] overflow-hidden border border-slate-800">
                  
                  {/* Status Bar */}
                  <div className="h-6 bg-black flex justify-between items-center px-4">
                      <span className="text-[10px] font-black text-slate-500">EVENTRA STAFF</span>
                      <span className="text-[10px] font-black text-emerald-500">{systemActive ? 'WIFI-MESH' : 'NO SERVICE'}</span>
                  </div>

                  {!systemActive ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                         <span className="text-4xl mb-4 opacity-50">📵</span>
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Connect to Network</span>
                     </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                        
                        {/* Channel Selector Header */}
                        <div className="p-4 bg-slate-900 border-b border-slate-800">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Room (Ch. {activeChannels})</span>
                            
                            <select 
                                value={currentChannel}
                                onChange={(e) => setCurrentChannel(e.target.value)}
                                className="w-full bg-slate-950 border border-emerald-500/30 text-emerald-400 font-black uppercase text-xl p-2 rounded-lg outline-none cursor-pointer focus:border-emerald-500 transition-colors"
                            >
                                <option value="MAIN_STAGE">1. Main Stage</option>
                                <option value="SECURITY">2. Security Ops</option>
                                <option value="MEDICAL">3. Medical Dispatch</option>
                                <option value="SITE_OPS">4. Site Operations</option>
                            </select>
                        </div>

                        {/* Audio Visualizer */}
                        <div className="h-32 bg-[#050f14] flex items-center justify-center p-4 border-b border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(0deg, #10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                            
                            <div className="flex items-end justify-center h-full w-full space-x-1 z-10">
                                {audioWaveform.map((height, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-2 rounded-t-sm transition-all duration-75 ${
                                            isPTTActive ? 'bg-emerald-400' : 'bg-slate-700'
                                        }`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                ))}
                            </div>
                            
                            {isPTTActive && (
                                <div className="absolute top-2 right-2 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1"></span>
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">TRANSMITTING</span>
                                </div>
                            )}
                        </div>

                        {/* Connected Peers List */}
                        <div className="flex-1 p-4 bg-slate-900 overflow-y-auto">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Peers in Room ({channelPeers.length + 1})</span>
                            
                            {/* Local User */}
                            <div className="flex items-center mb-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 mr-3 ${isPTTActive ? 'border-emerald-500 bg-emerald-900/50' : 'border-slate-600 bg-slate-700'}`}>
                                    You
                                </div>
                                <span className={`text-xs font-bold ${isPTTActive ? 'text-emerald-400' : 'text-slate-300'}`}>Local User</span>
                                {isPTTActive && <span className="ml-auto text-emerald-500 text-[10px]">🎙️</span>}
                            </div>

                            {/* Remote Peers */}
                            {channelPeers.map((peer, i) => (
                                <div key={i} className="flex items-center mb-2 p-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700 mr-3 text-slate-400">
                                        {peer.substring(0, 1)}
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{peer}</span>
                                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500/50"></span>
                                </div>
                            ))}
                        </div>

                        {/* Push To Talk Button */}
                        <div className="p-6 bg-slate-950 flex justify-center border-t border-slate-800">
                            <button
                                onMouseDown={() => togglePTT(true)}
                                onMouseUp={() => togglePTT(false)}
                                onMouseLeave={() => togglePTT(false)}
                                onTouchStart={() => togglePTT(true)}
                                onTouchEnd={() => togglePTT(false)}
                                className={`w-32 h-32 rounded-full font-black uppercase tracking-widest text-lg transition-all duration-150 flex flex-col items-center justify-center border-4 shadow-2xl outline-none select-none ${
                                    isPTTActive 
                                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-95' 
                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                <span className="text-3xl mb-1">🎙️</span>
                                {isPTTActive ? 'TALK' : 'HOLD'}
                            </button>
                        </div>

                    </div>
                  )}
                
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebRtcIntercomGrid;
