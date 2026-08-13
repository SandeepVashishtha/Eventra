/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARSubtitles = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [targetLang, setTargetLang] = useState('ES'); // ES, FR, JP
  
  // LLM Metrics
  const [inferenceLatency, setInferenceLatency] = useState(0); // ms
  const [translationAccuracy, setTranslationAccuracy] = useState(0); // %
  const [activeStreams, setActiveStreams] = useState(0); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Low-Latency LLM Translation Engine Online.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Direct FOH Mic Feed tapped. Awaiting vocals.' }
  ]);

  // Visualizer State
  const [subtitles, setSubtitles] = useState([]);
  const [isSinging, setIsSinging] = useState(false);

  // Hardcoded lyrics sequence for demo
  const lyricsSequence = [
    { eng: "Are you ready Eventra?!", es: "¡¿Están listos Eventra?!", fr: "Êtes-vous prêts Eventra?!", jp: "準備はいいかイベントラ?!" },
    { eng: "Let me see you jump!", es: "¡Quiero verlos saltar!", fr: "Laissez-moi vous voir sauter!", jp: "ジャンプして見せてくれ!" },
    { eng: "I've been waiting for this moment...", es: "He estado esperando este momento...", fr: "J'attendais ce moment...", jp: "この瞬間を待っていたんだ..." },
    { eng: "All my life, yeah!", es: "¡Toda mi vida, sí!", fr: "Toute ma vie, ouais!", jp: "私の全人生をかけて、イェー!" }
  ];

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (isSinging) {
              setInferenceLatency(180 + Math.random() * 40); // Under 500ms
              setTranslationAccuracy(97 + Math.random() * 2);
              setActiveStreams(14520 + Math.floor(Math.random() * 50));
          } else {
              setInferenceLatency(0);
              setTranslationAccuracy(0);
          }

          // Cleanup old subtitles
          setSubtitles(prev => prev.filter(sub => sub.opacity > 0).map(sub => ({
              ...sub,
              opacity: sub.opacity - 0.05,
              y: sub.y - 2
          })));

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, isSinging]);

  const triggerLyrics = () => {
    if (!systemActive || isSinging) return;
    
    setIsSinging(true);
    addLog('SYS', 'Live Vocals detected. Activating Whisper ASR + LLM Translate.');
    
    // Play through the sequence
    lyricsSequence.forEach((lyric, index) => {
        setTimeout(() => {
            if (!systemActive) return;
            
            // Add native log
            addLog('ACTION', `FOH Mic: "${lyric.eng}"`);
            
            // Push subtitle to AR display
            setSubtitles(prev => [...prev, {
                id: Date.now(),
                text: lyric[targetLang.toLowerCase()], // ES, FR, JP
                opacity: 1,
                y: 50
            }]);
            
            if (index === lyricsSequence.length - 1) {
                setTimeout(() => {
                    if (systemActive) {
                        setIsSinging(false);
                        addLog('SYS', 'Vocals paused. LLM Engine idling.');
                    }
                }, 2000);
            }
            
        }, index * 2500); // 2.5s pacing
    });
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveStreams(14520);
      setSubtitles([]);
      addLog('SYS', 'AR Subtitle Overlay active on Mobile/Smart-Glasses devices.');
    } else {
      setSystemActive(false);
      setIsSinging(false);
      setActiveStreams(0);
      setSubtitles([]);
      addLog('WARN', 'AR Translation Engine Offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040206] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗣️</span> Real-Time AI Translation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multilingual AR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">Live Subtitles</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            International attendees often cannot understand the lyrics or crowd work of a performer speaking in a different language, leading to a massive emotional disconnect. Eventra solves this by feeding the performer's live front-of-house (FOH) microphone directly into a low-latency Large Language Model (LLM) translation engine. Eventra instantly translates the speech and projects it as synchronized AR subtitles onto the smart-glasses or mobile phone screens of international attendees in their native language, with less than a 250ms delay, perfectly matching the cadence of the live performance.
          </p>

          <div className="bg-[#0b0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Edge LLM Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt LLM Engine' : 'Boot Translation Model'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Translation Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSinging ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Inference Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     isSinging ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(inferenceLatency)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

               {/* Translation Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSinging ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   LLM Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     isSinging ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {translationAccuracy.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Active Streams */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active AR Users
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {activeStreams.toLocaleString()}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Audio Processing Ledger</span>
                 {isSinging && <span className="text-cyan-400 font-black animate-pulse">TRANSLATING IN REAL-TIME</span>}
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
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* AR POV Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0512]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">SMART-GLASSES POV</span>
                <span className="text-[8px] font-mono text-slate-400">AR HUD v2.4</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AR PROJECTION OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-end pb-12 bg-gradient-to-t from-fuchsia-900/20 to-transparent">
                      
                      {/* Simulated Stage & Singer in background */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 z-0">
                          {/* Stage Lights */}
                          <div className={`absolute top-1/2 w-full h-1 bg-fuchsia-500 blur-xl transition-all duration-300 ${isSinging ? 'scale-y-[10] opacity-80' : 'opacity-20'}`}></div>
                          
                          {/* Singer Silhouette */}
                          <div className="absolute bottom-20 w-12 h-24 bg-black rounded-t-full border-t border-fuchsia-500 shadow-[0_-10px_30px_rgba(217,70,239,0.5)]"></div>
                          
                          {/* Mic Waves */}
                          {isSinging && (
                              <div className="absolute bottom-36 w-32 h-32 border border-cyan-500 rounded-full animate-ping opacity-50"></div>
                          )}
                      </div>

                      {/* AR UI Elements (Corners) */}
                      <div className="absolute top-12 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50"></div>
                      <div className="absolute top-12 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50"></div>
                      
                      <div className="absolute top-12 left-6 text-[8px] font-mono text-cyan-400/80">REC •</div>
                      <div className="absolute top-12 right-6 text-[8px] font-mono text-cyan-400/80 flex items-center">
                          LANG: <span className="ml-1 px-1 bg-cyan-900/50 text-white rounded">{targetLang}</span>
                      </div>

                      {/* Floating AR Subtitles */}
                      <div className="relative z-30 w-full flex flex-col items-center justify-end h-48 pointer-events-none">
                          {subtitles.map(sub => (
                              <div 
                                  key={sub.id}
                                  className="absolute w-full px-6 flex justify-center transition-all duration-300"
                                  style={{ top: `${sub.y}%`, opacity: sub.opacity }}
                              >
                                  <span 
                                      className="text-xl md:text-2xl font-black text-white text-center leading-tight tracking-wide"
                                      style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(6,182,212,0.8)' }}
                                  >
                                      {sub.text}
                                  </span>
                              </div>
                          ))}
                      </div>

                  </div>
                )}

              </div>
            </div>

            {/* Translation Triggers */}
            <div className="w-full bg-[#0b0512] p-4 rounded-xl border border-slate-800">
               <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Language</span>
                   <div className="flex space-x-1">
                       {['ES', 'FR', 'JP'].map(lang => (
                           <button 
                               key={lang}
                               onClick={() => setTargetLang(lang)}
                               disabled={!systemActive}
                               className={`px-2 py-1 rounded text-[8px] font-black transition ${
                                   !systemActive ? 'bg-slate-900 text-slate-700' :
                                   targetLang === lang ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                               }`}
                           >
                               {lang}
                           </button>
                       ))}
                   </div>
               </div>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerLyrics}
                   disabled={!systemActive || isSinging}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || isSinging ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(217,70,239,0.4)] animate-pulse'
                   }`}
                 >
                   🎤 Simulate Live Vocals (English)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ARSubtitles;
