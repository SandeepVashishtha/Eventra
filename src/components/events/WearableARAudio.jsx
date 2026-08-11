/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WearableARAudio = () => {
  const [streamActive, setStreamActive] = useState(false);
  const [ancLevel, setAncLevel] = useState(80); // Active Noise Cancellation level
  
  // Stem Volumes
  const [stems, setStems] = useState({
      vocals: 100,
      drums: 100,
      bass: 100,
      synth: 100
  });
  
  // Telemetry Metrics
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [meshLatency, setMeshLatency] = useState(0); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Wi-Fi 7 Multicast Audio Mesh initialized.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'Awaiting FOH stems for AR transmission.' }
  ]);

  // Audio visualization state
  const [levels, setLevels] = useState({ vocals: 0, drums: 0, bass: 0, synth: 0 });

  useEffect(() => {
    let loop;
    
    if (streamActive) {
      loop = setInterval(() => {
          // Hardware simulation
          setMeshLatency(Math.random() * 2 + 0.5); // 0.5-2.5ms over Wi-Fi 7
          
          // Animate levels based on stem volume caps
          setLevels({
              vocals: Math.random() * (stems.vocals / 100) * 80 + 10,
              drums: Math.random() * (stems.drums / 100) * 90 + 5,
              bass: Math.random() * (stems.bass / 100) * 100,
              synth: Math.random() * (stems.synth / 100) * 70 + 20
          });

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [streamActive, stems]);

  const handleStemChange = (stem, value) => {
      setStems(prev => ({ ...prev, [stem]: parseInt(value) }));
      if (streamActive && parseInt(value) === 0) {
          addLog('ACTION', `User muted ${stem.toUpperCase()} stem on AR wearable.`);
      } else if (streamActive && parseInt(value) > 150) {
           addLog('WARN', `User heavily boosted ${stem.toUpperCase()}. Applying DSP limiter.`);
      }
  };

  const handleAncChange = (value) => {
      setAncLevel(parseInt(value));
      if (streamActive && parseInt(value) > 90) {
          addLog('SYS', 'Maximum ANC engaged. Crowd noise completely isolated.');
      }
  };

  const applyPreset = (preset) => {
      if (!streamActive) return;
      if (preset === 'BASS_BOOST') {
          setStems({ vocals: 80, drums: 100, bass: 180, synth: 70 });
          setAncLevel(90);
          addLog('ACTION', 'User applied "Basshead" AR Preset.');
      } else if (preset === 'VOCAL_FOCUS') {
          setStems({ vocals: 150, drums: 60, bass: 50, synth: 80 });
          setAncLevel(100);
          addLog('ACTION', 'User applied "Vocal Focus" AR Preset.');
      } else if (preset === 'SOCIAL') {
          setStems({ vocals: 60, drums: 60, bass: 60, synth: 60 });
          setAncLevel(10); // Hear friends talking
          addLog('ACTION', 'User applied "Social Transparency" AR Preset.');
      }
  };

  const toggleStream = () => {
    if (!streamActive) {
      setStreamActive(true);
      setConnectedPeers(12540);
      setStems({ vocals: 100, drums: 100, bass: 100, synth: 100 });
      addLog('SYS', '12,540 AR smart-earbuds connected. Broadcasting 4-stem multicast.');
    } else {
      setStreamActive(false);
      setConnectedPeers(0);
      setLevels({ vocals: 0, drums: 0, bass: 0, synth: 0 });
      addLog('WARN', 'AR Multicast offline. Attendees hearing standard FOH speakers.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05090b] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> AR Acoustic Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Wearable AR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Audio Mixers</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Every attendee has different audio preferences—some want chest-pounding bass, others want to hear the vocals clearly, and many want to protect their hearing without using muffling foam earplugs. Eventra integrates with the upcoming generation of Augmented Reality Audio wearables (smart earbuds). By broadcasting stem-separated audio data over a Wi-Fi 7 mesh, the Eventra app provides a personalized AR mixing desk, allowing users to individually adjust the mix and cancel out crowd noise in real-time.
          </p>

          <div className="bg-[#0b1216] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">📡</span> Wi-Fi 7 Multicast Mesh
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStream}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     streamActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {streamActive ? 'Kill Multicast' : 'Broadcast Stems to Crowd'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Connected Wearables */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   AR Earbuds Synced
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {connectedPeers.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Mesh Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamActive ? 'bg-emerald-950/20 border-emerald-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Audio Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {meshLatency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Crowd Noise */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamActive && ancLevel > 90 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   ANC Rejection
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     streamActive && ancLevel > 90 ? 'text-cyan-400 animate-pulse' :
                     streamActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     -{ancLevel}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030607] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Personalized DSP Log</span>
                 {streamActive && <span className="text-teal-400 animate-pulse">MULTICASTING 4 STEMS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Eventra App Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[12px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!streamActive ? 'bg-[#0f172a]' : 'bg-[#04090c]'}`}>
              
              <div className="absolute top-0 inset-x-0 h-6 bg-[#1e293b] rounded-b-2xl z-30 w-32 mx-auto flex justify-center items-center">
                  <div className="w-16 h-2 bg-black rounded-full"></div>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-6 pt-12">
                
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black uppercase text-white tracking-widest">AR Personal Mix</span>
                    <div className={`w-3 h-3 rounded-full ${streamActive ? 'bg-teal-500 shadow-[0_0_10px_#14b8a6] animate-pulse' : 'bg-slate-700'}`}></div>
                </div>

                {!streamActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                       <span className="text-4xl mb-4 opacity-50">🎧</span>
                       <span className="text-[12px] font-black text-slate-600 uppercase tracking-widest text-center">AR AUDIO DISCONNECTED<br/>PLEASE WAIT FOR SET TO BEGIN</span>
                   </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-6">
                      
                      {/* Active Noise Cancelling Slider */}
                      <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Crowd Isolation (ANC)</span>
                              <span className="text-[10px] font-mono text-white">{ancLevel}%</span>
                          </div>
                          <input 
                              type="range" 
                              min="0" max="100" 
                              value={ancLevel}
                              onChange={(e) => handleAncChange(e.target.value)}
                              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-full appearance-none outline-none"
                          />
                          <div className="flex justify-between mt-2">
                              <span className="text-[8px] text-slate-500 uppercase">Hear Friends</span>
                              <span className="text-[8px] text-slate-500 uppercase">Pure Music</span>
                          </div>
                      </div>

                      {/* 4-Stem Mixers */}
                      <div className="flex-1 flex space-x-3 justify-between mt-4">
                          
                          {/* Vocals */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-full flex flex-col justify-end p-1 relative overflow-hidden">
                                  <div className="absolute inset-x-1 bottom-1 bg-pink-500 rounded-full transition-all duration-75" style={{ height: `${levels.vocals}%`, opacity: 0.5 }}></div>
                                  <input 
                                      type="range" min="0" max="200" 
                                      value={stems.vocals} onChange={(e) => handleStemChange('vocals', e.target.value)}
                                      className="appearance-none bg-transparent w-[150px] h-full absolute transform -rotate-90 origin-bottom-left -left-2 bottom-0 custom-slider z-10" 
                                      style={{'--thumb-color': '#ec4899'}}
                                  />
                              </div>
                              <span className="text-[9px] font-black uppercase text-pink-400 mt-2">VOCAL</span>
                              <span className="text-[8px] font-mono text-slate-500">{stems.vocals}%</span>
                          </div>

                          {/* Drums */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-full flex flex-col justify-end p-1 relative overflow-hidden">
                                  <div className="absolute inset-x-1 bottom-1 bg-amber-500 rounded-full transition-all duration-75" style={{ height: `${levels.drums}%`, opacity: 0.5 }}></div>
                                  <input 
                                      type="range" min="0" max="200" 
                                      value={stems.drums} onChange={(e) => handleStemChange('drums', e.target.value)}
                                      className="appearance-none bg-transparent w-[150px] h-full absolute transform -rotate-90 origin-bottom-left -left-2 bottom-0 custom-slider z-10"
                                      style={{'--thumb-color': '#f59e0b'}}
                                  />
                              </div>
                              <span className="text-[9px] font-black uppercase text-amber-400 mt-2">DRUMS</span>
                              <span className="text-[8px] font-mono text-slate-500">{stems.drums}%</span>
                          </div>

                          {/* Bass */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-full flex flex-col justify-end p-1 relative overflow-hidden">
                                  <div className="absolute inset-x-1 bottom-1 bg-emerald-500 rounded-full transition-all duration-75" style={{ height: `${levels.bass}%`, opacity: 0.5 }}></div>
                                  <input 
                                      type="range" min="0" max="200" 
                                      value={stems.bass} onChange={(e) => handleStemChange('bass', e.target.value)}
                                      className="appearance-none bg-transparent w-[150px] h-full absolute transform -rotate-90 origin-bottom-left -left-2 bottom-0 custom-slider z-10"
                                      style={{'--thumb-color': '#10b981'}}
                                  />
                              </div>
                              <span className="text-[9px] font-black uppercase text-emerald-400 mt-2">BASS</span>
                              <span className="text-[8px] font-mono text-slate-500">{stems.bass}%</span>
                          </div>

                          {/* Synth/Melody */}
                          <div className="flex-1 flex flex-col items-center">
                              <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-full flex flex-col justify-end p-1 relative overflow-hidden">
                                  <div className="absolute inset-x-1 bottom-1 bg-indigo-500 rounded-full transition-all duration-75" style={{ height: `${levels.synth}%`, opacity: 0.5 }}></div>
                                  <input 
                                      type="range" min="0" max="200" 
                                      value={stems.synth} onChange={(e) => handleStemChange('synth', e.target.value)}
                                      className="appearance-none bg-transparent w-[150px] h-full absolute transform -rotate-90 origin-bottom-left -left-2 bottom-0 custom-slider z-10"
                                      style={{'--thumb-color': '#6366f1'}}
                                  />
                              </div>
                              <span className="text-[9px] font-black uppercase text-indigo-400 mt-2">SYNTH</span>
                              <span className="text-[8px] font-mono text-slate-500">{stems.synth}%</span>
                          </div>

                      </div>

                      {/* Quick Presets */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                          <button onClick={() => applyPreset('BASS_BOOST')} className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 py-2 rounded font-black uppercase text-[8px] active:bg-emerald-900">Basshead</button>
                          <button onClick={() => applyPreset('VOCAL_FOCUS')} className="bg-pink-950/40 border border-pink-900 text-pink-400 py-2 rounded font-black uppercase text-[8px] active:bg-pink-900">Vocal Focus</button>
                          <button onClick={() => applyPreset('SOCIAL')} className="bg-cyan-950/40 border border-cyan-900 text-cyan-400 py-2 rounded font-black uppercase text-[8px] active:bg-cyan-900">Social Mode</button>
                      </div>

                  </div>
                )}
                
              </div>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--thumb-color, #fff);
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            border: 4px solid #1e293b;
        }
      `}} />
      
    </div>
  );
};

export default WearableARAudio;
