/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiosensorCrowdSynchrony = () => {
  const [telemetryActive, setTelemetryActive] = useState(false);
  const [musicState, setMusicState] = useState('BUILDUP'); // BUILDUP, DROP, AMBIENT
  
  // Biosensor & Music Metrics
  const [activeWearables, setActiveWearables] = useState(0);
  const [musicBPM, setMusicBPM] = useState(128);
  const [avgCrowdHR, setAvgCrowdHR] = useState(90);
  const [synchronyIndex, setSynchronyIndex] = useState(0); // 0-100%
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Wearable Biosensor Aggregation Engine online.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'Awaiting HealthKit/Garmin API handshake.' }
  ]);

  // HR Waveform data for visualization
  const [hrHistory, setHrHistory] = useState(Array(50).fill(90));
  const [bpmHistory, setBpmHistory] = useState(Array(50).fill(128));

  useEffect(() => {
    let loop;
    
    if (telemetryActive) {
      loop = setInterval(() => {
          
          if (musicState === 'BUILDUP') {
              setMusicBPM(prev => Math.min(138, prev + 0.1));
              setAvgCrowdHR(prev => Math.min(145, prev + (Math.random() * 0.8 + 0.2)));
              setSynchronyIndex(prev => Math.min(99.4, prev + (Math.random() * 2)));
          } else if (musicState === 'DROP') {
              setMusicBPM(128);
              setAvgCrowdHR(prev => {
                  const target = 128;
                  const diff = target - prev;
                  return prev + (diff * 0.1) + (Math.random() * 4 - 2);
              });
              // High synchrony when dropping
              setSynchronyIndex(prev => Math.min(99.9, prev + (Math.random() * 1)));
          } else if (musicState === 'AMBIENT') {
              setMusicBPM(0);
              setAvgCrowdHR(prev => Math.max(90, prev - (Math.random() * 1.5 + 0.5)));
              setSynchronyIndex(prev => Math.max(15.0, prev - (Math.random() * 3)));
          }
          
          setHrHistory(prev => {
              const next = [...prev, avgCrowdHR];
              if (next.length > 50) next.shift();
              return next;
          });
          
          setBpmHistory(prev => {
              const next = [...prev, musicBPM];
              if (next.length > 50) next.shift();
              return next;
          });

      }, 100);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [telemetryActive, musicState, avgCrowdHR, musicBPM]);

  const triggerDrop = () => {
    if (telemetryActive) {
      setMusicState('DROP');
      setMusicBPM(128);
      addLog('ACTION', 'Sub-bass Drop executed by DJ.');
      addLog('AI', 'Physiological entrainment detected. Massive HR synchronization spike.');
    }
  };
  
  const triggerBuildup = () => {
    if (telemetryActive) {
      setMusicState('BUILDUP');
      addLog('ACTION', 'Tension Buildup executed by DJ.');
      addLog('AI', 'Crowd anticipation rising. Heart rates accelerating in unison.');
    }
  };

  const triggerAmbient = () => {
    if (telemetryActive) {
      setMusicState('AMBIENT');
      addLog('WARN', 'Music transition: Ambient breakdown.');
      addLog('SYS', 'Synchrony Index plummeting as physiological arousal decreases.');
    }
  };

  const toggleTelemetry = () => {
    if (!telemetryActive) {
      setTelemetryActive(true);
      setActiveWearables(14258);
      setMusicState('BUILDUP');
      setMusicBPM(128);
      setAvgCrowdHR(110);
      setSynchronyIndex(60);
      addLog('WEB3', 'HealthKit API connected. Aggregating 14,258 opt-in wearable streams.');
    } else {
      setTelemetryActive(false);
      setActiveWearables(0);
      setSynchronyIndex(0);
      setMusicBPM(128);
      setAvgCrowdHR(90);
      setHrHistory(Array(50).fill(90));
      setBpmHistory(Array(50).fill(128));
      addLog('WARN', 'Biosensor telemetry disconnected.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Telemetry Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❤️</span> Physiological Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Wearable Biosensor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">Crowd Synchrony Metric</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            It is historically impossible to quantify the elusive "vibe" or connection between the artist and the crowd beyond subjective observation. Eventra changes this by integrating securely with attendees' opt-in smartwatches (HealthKit/Garmin API) to track anonymized live heart rates. The platform calculates the "Synchrony Index"—a real-time statistical measure of how many thousands of attendees have their heart rates physiologically entrained to the exact BPM of the music, providing artists with a mathematical, indisputable metric of their hypnotic control over the crowd.
          </p>

          <div className="bg-[#120a11] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">📊</span> Big Data Aggregation Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleTelemetry}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     telemetryActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {telemetryActive ? 'Disconnect Biosensors' : 'Ingest Wearable APIs'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Connected Wearables */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 telemetryActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Watch APIs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     telemetryActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeWearables.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Crowd HR */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 avgCrowdHR > 135 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 telemetryActive ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Avg Crowd HR
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     avgCrowdHR > 135 ? 'text-red-400 animate-pulse' :
                     telemetryActive ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(avgCrowdHR)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BPM</span>
                 </div>
               </div>
               
               {/* Synchrony Index */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 synchronyIndex > 95 ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Synchrony Index
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     synchronyIndex > 95 ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {synchronyIndex.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Physiological Telemetry Log</span>
                 {musicState === 'DROP' && <span className="text-indigo-400 animate-pulse">DETECTING ENTRAINMENT...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-500 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">DJ BOOTH MONITOR</span>
                <span className="text-[8px] font-mono text-slate-400">PHYSIOLOGICAL ENTRAINMENT</span>
              </div>

              <div className="flex-1 relative bg-[#040103] overflow-hidden flex flex-col justify-end p-4">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvc3ZnPg==')]"></div>

                {!telemetryActive ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING WEARABLE DATA</span>
                   </div>
                ) : (
                  <>
                    <div className="absolute top-12 left-4 z-20">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Master Audio Clock</span>
                       <span className="text-3xl font-black font-mono text-white leading-none">{Math.floor(musicBPM)} <span className="text-[10px] text-slate-500">BPM</span></span>
                    </div>

                    <div className="absolute top-12 right-4 z-20 text-right">
                       <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">Crowd Median HR</span>
                       <span className="text-3xl font-black font-mono text-rose-400 leading-none flex justify-end items-center">
                           <span className="text-xl animate-pulse mr-1">❤️</span> {Math.floor(avgCrowdHR)}
                       </span>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="w-full h-48 relative z-10 flex items-end justify-between border-b border-l border-slate-800 pb-2 pl-2">
                        {/* Audio BPM Line (Target) */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                            <polyline
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.2)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                points={bpmHistory.map((bpm, i) => `${(i / 49) * 100}%,${100 - ((bpm - 60) / 100) * 100}%`).join(' ')}
                            />
                        </svg>

                        {/* Crowd HR Line (Actual) */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" preserveAspectRatio="none">
                            <polyline
                                fill="none"
                                stroke={synchronyIndex > 95 ? "#6366f1" : "#e11d48"} // Turns indigo when highly synced
                                strokeWidth="3"
                                className="transition-colors duration-300"
                                points={hrHistory.map((hr, i) => `${(i / 49) * 100}%,${100 - ((hr - 60) / 100) * 100}%`).join(' ')}
                            />
                        </svg>
                        
                        {/* Synchrony Indicator Overlays */}
                        {synchronyIndex > 95 && (
                           <div className="absolute inset-0 bg-indigo-500/10 z-0 animate-pulse mix-blend-screen pointer-events-none"></div>
                        )}
                        {musicState === 'DROP' && (
                           <div className="absolute inset-0 bg-white/5 z-0 animate-bounce mix-blend-screen pointer-events-none"></div>
                        )}
                    </div>

                    {/* HUD Alerts */}
                    {synchronyIndex > 95 && (
                       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center z-30 pointer-events-none w-full">
                           <div className="bg-indigo-950/90 border border-indigo-500/50 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_rgba(99,102,241,0.6)] backdrop-blur-sm scale-110 animate-pulse">
                              <span className="text-[12px] font-black uppercase tracking-widest text-indigo-400">HYPNOTIC ENTRAINMENT</span>
                              <span className="text-[9px] font-mono text-white">Crowd physiology synced to Master Clock.</span>
                           </div>
                       </div>
                    )}
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120a11] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate DJ Set Dynamics</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={triggerAmbient}
                   disabled={!telemetryActive || musicState === 'AMBIENT'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !telemetryActive || musicState === 'AMBIENT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                   }`}
                 >
                   Ambient (Break)
                 </button>
                 
                 <button 
                   onClick={triggerBuildup}
                   disabled={!telemetryActive || musicState === 'BUILDUP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !telemetryActive || musicState === 'BUILDUP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Tension (Build)
                 </button>

                 <button 
                   onClick={triggerDrop}
                   disabled={!telemetryActive || musicState === 'DROP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !telemetryActive || musicState === 'DROP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-900 text-rose-500 hover:bg-rose-900/60 shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   Bass Drop
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiosensorCrowdSynchrony;
