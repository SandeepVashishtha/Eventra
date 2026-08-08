/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenAIAfterMovie = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [renderState, setRenderState] = useState('IDLE'); // IDLE, INGESTING, ANALYZING, RENDERING, COMPLETE
  
  // Render Metrics
  const [clipsProcessed, setClipsProcessed] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Generative AI Video Engine initialized.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Awaiting User Camera Roll Upload.' }
  ]);

  // Video Timeline visualization state
  const [timelineTracks, setTimelineTracks] = useState([]);

  useEffect(() => {
    let loop;
    
    if (renderState === 'INGESTING') {
      let count = 0;
      loop = setInterval(() => {
          count += Math.floor(Math.random() * 5 + 1);
          setClipsProcessed(Math.min(142, count));
          if (count >= 142) {
              clearInterval(loop);
              setRenderState('ANALYZING');
              addLog('SUCCESS', '142 raw user clips securely ingested to Eventra Cloud.');
              addLog('AI', 'Running Computer Vision facial recognition and GPS cross-referencing...');
          }
      }, 50);
    } else if (renderState === 'ANALYZING') {
      // Simulate CV Analysis delay
      loop = setTimeout(() => {
          setRenderState('RENDERING');
          addLog('AI', 'Analysis complete. User attended: Main Stage (Odesza), Stage B (Tale of Us).');
          addLog('ACTION', 'Compiling beat-synced timeline with professional B-Roll injections.');
      }, 2500);
    } else if (renderState === 'RENDERING') {
      let prog = 0;
      loop = setInterval(() => {
          prog += 2;
          setRenderProgress(Math.min(100, prog));
          
          // Animate the timeline building
          if (prog % 20 === 0) {
              setTimelineTracks(prev => [...prev, { id: prog, type: Math.random() > 0.5 ? 'USER' : 'B-ROLL' }]);
          }

          if (prog >= 100) {
              clearInterval(loop);
              setRenderState('COMPLETE');
              addLog('SUCCESS', 'Personalized 60-second After-Movie rendered. Ready for export.');
          }
      }, 100);
    }
    
    return () => { 
        if (loop) {
            typeof loop === 'number' ? clearTimeout(loop) : clearInterval(loop);
        }
    };
  }, [renderState]);

  const triggerUpload = () => {
    if (engineActive && renderState === 'IDLE') {
      setRenderState('INGESTING');
      addLog('ACTION', 'User initiated bulk upload of Camera Roll dump (3.2GB).');
    }
  };

  const resetEngine = () => {
    setRenderState('IDLE');
    setClipsProcessed(0);
    setRenderProgress(0);
    setTimelineTracks([]);
    addLog('SYS', 'Render engine reset. Ready for next user batch.');
  };

  const toggleEngine = () => {
    if (!engineActive) {
      setEngineActive(true);
      addLog('SYS', 'AI Video Editing Pipeline Online. GPU cluster standing by.');
    } else {
      setEngineActive(false);
      resetEngine();
      addLog('WARN', 'AI Pipeline Offline.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Pipeline Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-violet-900/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎬</span> Algorithmic Post-Production
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Personalized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Festival After-Movie Compiler</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The official festival after-movie takes months to edit and only features the front row of the main stage, ignoring the unique, individual experience of the other 99,000 attendees. Eventra solves this by allowing attendees to upload their raw camera roll dumps to the cloud on the drive home. A Generative AI video editing model analyzes their photos, cross-references their GPS history to know exactly which sets they saw, and automatically cuts a highly stylized, beat-synced, color-graded 60-second personalized after-movie featuring their friends mixed with professional B-roll of the stages they were actually at.
          </p>

          <div className="bg-[#110a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🎞️</span> GenAI Cloud Render Farm
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   disabled={renderState !== 'IDLE' && renderState !== 'COMPLETE'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     (renderState !== 'IDLE' && renderState !== 'COMPLETE') ? 'bg-slate-900 text-slate-700 border border-slate-800' :
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Shutdown Pipeline' : 'Initialize GPU Render Farm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Raw Ingestion */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderState === 'INGESTING' ? 'bg-violet-950/40 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Raw User Clips
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     renderState === 'INGESTING' ? 'text-violet-400' : 'text-slate-600'
                   }`}>
                     {clipsProcessed}
                   </span>
                 </div>
               </div>

               {/* Engine State */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderState === 'ANALYZING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-inner' :
                 renderState === 'COMPLETE' ? 'bg-emerald-950/20 border-emerald-900/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   AI Status
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none ${
                     renderState === 'ANALYZING' ? 'text-fuchsia-400 animate-pulse' :
                     renderState === 'COMPLETE' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {renderState}
                   </span>
                 </div>
               </div>
               
               {/* Render Progress */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderState === 'RENDERING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Timeline Export
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     renderState === 'RENDERING' ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {renderProgress}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Editor Log</span>
                 {renderState === 'ANALYZING' && <span className="text-fuchsia-400 animate-pulse">Running Face/GPS Cross-Reference...</span>}
                 {renderState === 'RENDERING' && <span className="text-cyan-400 animate-pulse">Encoding H.265 Timeline...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-violet-400 font-bold' :
                       log.type === 'AI' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* NLE Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-400">NON-LINEAR EDITOR</span>
                <span className="text-[8px] font-mono text-slate-400">AUTOMATED TIMELINE</span>
              </div>

              <div className="flex-1 relative bg-[#040106] overflow-hidden flex flex-col">
                
                {/* Preview Monitor */}
                <div className="h-1/2 w-full border-b border-slate-800 relative bg-black flex items-center justify-center overflow-hidden">
                    {!engineActive ? (
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">OFFLINE</span>
                    ) : renderState === 'IDLE' ? (
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING MEDIA</span>
                    ) : renderState === 'INGESTING' ? (
                       <div className="flex flex-col items-center">
                           <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                           <span className="text-[8px] font-mono text-violet-400 animate-pulse">Uploading Media...</span>
                       </div>
                    ) : renderState === 'ANALYZING' ? (
                       <div className="w-full h-full relative">
                           {/* Simulated computer vision grid over a photo */}
                           <div className="absolute inset-0 bg-slate-800 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwbC00MCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]"></div>
                           <div className="absolute top-1/4 left-1/4 w-12 h-12 border-2 border-fuchsia-500 animate-pulse flex items-end justify-center"><span className="text-[6px] font-bold text-fuchsia-500 bg-black/50 px-1 mb-1">FACE_DETECT</span></div>
                           <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 rounded border border-fuchsia-500/50">
                               <span className="text-[8px] font-mono text-fuchsia-400">EXIF GPS: 34.0522°N (Stage B)</span>
                           </div>
                       </div>
                    ) : (
                       <div className="w-full h-full relative overflow-hidden">
                           {/* Simulated Video Playback during Render/Complete */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-violet-900 to-fuchsia-900 animate-pulse"></div>
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMSIvPjwvc3ZnPg==')] opacity-20 mix-blend-screen"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-4xl shadow-black drop-shadow-xl">✨🎉🎵</span>
                           </div>
                           
                           {/* LUT overlay effect simulation */}
                           <div className="absolute inset-0 bg-cyan-500/10 mix-blend-color"></div>

                           <div className="absolute top-2 left-2 flex space-x-1">
                               <span className="text-[6px] font-black bg-black/80 text-white px-1 rounded">LUT: FESTIVAL_VIBE_04</span>
                               <span className="text-[6px] font-black bg-emerald-500/80 text-black px-1 rounded">BEAT_SYNC: LOCKED</span>
                           </div>
                           
                           {renderState === 'COMPLETE' && (
                               <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                   <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur pl-1 border border-white/40 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                       <span className="text-xl">▶</span>
                                   </div>
                               </div>
                           )}
                       </div>
                    )}
                </div>

                {/* Timeline UI */}
                <div className="flex-1 w-full relative p-2 flex flex-col justify-center space-y-1 overflow-hidden">
                    {/* Timecode ruler */}
                    <div className="w-full h-3 border-b border-slate-800 flex justify-between px-2">
                        {[0, 15, 30, 45, 60].map(s => <span key={s} className="text-[6px] text-slate-600 font-mono">00:00:{s.toString().padStart(2, '0')}</span>)}
                    </div>
                    
                    {/* Video Track (User + B-Roll) */}
                    <div className="w-full h-8 bg-slate-900 rounded flex items-center overflow-hidden border border-slate-800">
                        {timelineTracks.map((t, i) => (
                            <div key={i} className={`h-full border-r border-black flex-1 flex items-center justify-center ${t.type === 'USER' ? 'bg-violet-900' : 'bg-cyan-900'}`}>
                                <span className="text-[5px] font-black text-white/50">{t.type}</span>
                            </div>
                        ))}
                    </div>

                    {/* Audio Track (Beat synced) */}
                    <div className="w-full h-6 bg-slate-900 rounded flex items-center overflow-hidden border border-slate-800 relative">
                        {renderState === 'RENDERING' || renderState === 'COMPLETE' ? (
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <path d="M0 12 L10 4 L20 12 L30 20 L40 12 L50 4 L60 12 L70 20 L80 12 L90 4 L100 12 L110 20 L120 12 L130 4 L140 12 L150 20 L160 12 L170 4 L180 12 L190 20 L200 12 L210 4 L220 12 L230 20 L240 12 L250 4 L260 12 L270 20 L280 12 L290 4 L300 12 L310 20 L320 12 L330 4 L340 12 L350 20 L360 12 L370 4 L380 12 L390 20 L400 12 L410 4 L420 12 L430 20" fill="none" stroke="rgba(14, 165, 233, 0.4)" strokeWidth="1"/>
                            </svg>
                        ) : null}
                    </div>
                    
                    {/* Playhead */}
                    {(renderState === 'RENDERING' || renderState === 'COMPLETE') && (
                        <div className="absolute top-2 bottom-2 w-[1px] bg-red-500 z-10 transition-all duration-75" style={{ left: `${renderState === 'COMPLETE' ? 100 : renderProgress}%` }}>
                            <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-sm"></div>
                        </div>
                    )}
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#110a14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">User App Trigger</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={triggerUpload}
                   disabled={!engineActive || renderState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !engineActive || renderState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-violet-950/40 border-violet-900 text-violet-400 hover:bg-violet-900/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                   }`}
                 >
                   Upload Camera Roll & Generate Video
                 </button>
               </div>
               
               {renderState === 'COMPLETE' && (
                 <button 
                     onClick={resetEngine}
                     className="w-full py-2 mt-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                   >
                     Clear Timeline
                 </button>
               )}
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GenAIAfterMovie;
