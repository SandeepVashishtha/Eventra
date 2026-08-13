/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AiAftermovieGenerator = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // NLE Engine Metrics
  const [activeJobs, setActiveJobs] = useState(0); 
  const [gpuUtilization, setGpuUtilization] = useState(12); // %
  const [clipsProcessed, setClipsProcessed] = useState(15420);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Post-Event processing cluster initialized.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting user bulk-uploads from iOS/Android clients.' }
  ]);

  // Visualizer State
  const [jobStatus, setJobStatus] = useState('IDLE'); // IDLE, UPLOADING, ANALYZING, BEAT_SYNC, RENDERING, DONE
  const [progress, setProgress] = useState(0);
  
  // Timeline visualization data
  const [timelineClips, setTimelineClips] = useState([]);
  const [audioWaveform, setAudioWaveform] = useState([]);
  const [playheadPos, setPlayheadPos] = useState(0); // 0 to 100%

  // Generate static audio waveform
  useEffect(() => {
      const wave = Array.from({ length: 60 }).map(() => Math.random() * 80 + 20);
      // Create some clear beat spikes
      for(let i = 0; i < 60; i += 8) wave[i] = 100;
      setAudioWaveform(wave);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive && jobStatus === 'IDLE') {
      loop = setInterval(() => {
          setActiveJobs(1250 + Math.floor(Math.random() * 50));
          setGpuUtilization(75 + Math.random() * 15);
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, jobStatus]);

  const startRenderJob = () => {
      if (!systemActive || jobStatus !== 'IDLE') return;
      
      setJobStatus('UPLOADING');
      setProgress(0);
      setTimelineClips([]);
      setPlayheadPos(0);
      
      addLog('ACTION', 'User initiated bulk upload: 42 raw video clips (4.2GB).');
      
      // Upload simulation
      let upProgress = 0;
      const upInterval = setInterval(() => {
          upProgress += 10;
          setProgress(upProgress);
          if (upProgress >= 100) {
              clearInterval(upInterval);
              analyzeClips();
          }
      }, 200);
  };

  const analyzeClips = () => {
      setJobStatus('ANALYZING');
      setProgress(0);
      addLog('SYS', 'AI Vision extracting GPS/Timestamp metadata. Stabilizing footage.');
      
      let anProgress = 0;
      const anInterval = setInterval(() => {
          anProgress += 5;
          setProgress(anProgress);
          
          // Populate unaligned clips randomly on the timeline
          if (anProgress % 20 === 0) {
              setTimelineClips(prev => [...prev, {
                  id: anProgress,
                  start: Math.random() * 80,
                  width: 5 + Math.random() * 15,
                  aligned: false
              }]);
          }

          if (anProgress >= 100) {
              clearInterval(anInterval);
              beatSyncClips();
          }
      }, 300);
  };

  const beatSyncClips = () => {
      setJobStatus('BEAT_SYNC');
      setProgress(0);
      addLog('ACTION', 'Fetching official ODESZA FOH Audio Master.');
      addLog('SYS', 'Auto-cutting user clips exactly to audio transients (128 BPM).');
      
      let syncProgress = 0;
      const syncInterval = setInterval(() => {
          syncProgress += 10;
          setProgress(syncProgress);
          
          // Align clips to the beat grid (every 8th slot in the waveform)
          if (syncProgress === 50) {
              const aligned = [];
              let currentStart = 0;
              for(let i=0; i<6; i++) {
                  aligned.push({
                      id: `sync-${i}`,
                      start: currentStart,
                      width: 13.33, // 8 / 60 * 100 approx
                      aligned: true,
                      color: `hsl(${Math.random() * 360}, 70%, 60%)`
                  });
                  currentStart += 13.33;
              }
              setTimelineClips(aligned);
          }

          if (syncProgress >= 100) {
              clearInterval(syncInterval);
              renderFinalVideo();
          }
      }, 400);
  };

  const renderFinalVideo = () => {
      setJobStatus('RENDERING');
      setProgress(0);
      addLog('SYS', 'Applying cinematic color grade (LUT: Cyberpunk-Neon).');
      addLog('SYS', 'Encoding H.265 Master output to Edge CDN.');
      
      setGpuUtilization(99.9);
      
      let renProgress = 0;
      const renInterval = setInterval(() => {
          renProgress += 2;
          setProgress(renProgress);
          setPlayheadPos(renProgress); // Move playhead along timeline

          if (renProgress >= 100) {
              clearInterval(renInterval);
              setJobStatus('DONE');
              setGpuUtilization(15);
              setClipsProcessed(prev => prev + 42);
              addLog('SUCCESS', 'Render Complete: "My Eventra Aftermovie 2026". Push notification sent.');
              
              setTimeout(() => {
                  setJobStatus('IDLE');
                  setProgress(0);
                  setPlayheadPos(0);
              }, 4000);
          }
      }, 100);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setGpuUtilization(15);
      addLog('SYS', 'GPU Render Cluster Online. Ready for processing.');
    } else {
      setSystemActive(false);
      setActiveJobs(0);
      setGpuUtilization(0);
      setJobStatus('IDLE');
      setTimelineClips([]);
      setPlayheadPos(0);
      addLog('WARN', 'GPU Cluster Offline. Rendering paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050308] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎬</span> Automated NLE Scripting
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Generated Personalized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500">Post-Event Aftermovies</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees record hundreds of disjointed, shaky videos on their phones that sit in their camera rolls forever because video editing is too complex. Eventra solves this by allowing attendees to bulk-upload their raw footage post-event. The backend AI analyzes the GPS data, cross-references it with the official DJ setlists, stabilizes the footage, and automatically edits the cuts perfectly to the beat transients of the live audio track played at that exact moment, delivering a professional-grade personalized aftermovie.
          </p>

          <div className="bg-[#0a0510] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> GPU Cluster Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Shutdown Render Nodes' : 'Initialize GPU Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Render Jobs */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active User Jobs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {activeJobs.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* GPU Utilization */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gpuUtilization > 95 ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Cloud GPU Load
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     gpuUtilization > 95 ? 'text-rose-400' : 'text-slate-300'
                   }`}>
                     {systemActive ? gpuUtilization.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Current Process */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 jobStatus !== 'IDLE' && jobStatus !== 'DONE' ? 'bg-indigo-950/40 border-indigo-500/50' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Task Status
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-lg font-black uppercase tracking-widest leading-none mb-2 ${
                     jobStatus !== 'IDLE' && jobStatus !== 'DONE' ? 'text-indigo-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {jobStatus === 'IDLE' ? 'AWAITING UPLOAD' : jobStatus.replace('_', ' ')}
                   </span>
                   {/* Mini progress bar */}
                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                           className={`h-full transition-all duration-300 ${
                               jobStatus === 'RENDERING' ? 'bg-rose-500' : 'bg-indigo-500'
                           }`} 
                           style={{ width: `${progress}%` }}
                       ></div>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Automated Editor Ledger</span>
                 {jobStatus === 'DONE' && <span className="text-emerald-400 font-black animate-pulse">OUTPUT DELIVERED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* NLE UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#101015]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">NON-LINEAR EDITOR</span>
                <span className="text-[8px] font-mono text-slate-400">PROJECT: AUTO_AM_042</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">TIMELINE OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col">
                        
                        {/* Video Preview Monitor */}
                        <div className="w-full h-36 bg-black flex items-center justify-center relative overflow-hidden mb-4 border-b border-slate-800">
                            {jobStatus === 'IDLE' ? (
                                <span className="text-[8px] text-slate-600 font-mono">NO MEDIA LOADED</span>
                            ) : jobStatus === 'UPLOADING' ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl mb-2 text-indigo-500 animate-bounce">⬆️</span>
                                    <span className="text-[10px] font-bold text-indigo-400">Receiving Files... {progress}%</span>
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                                    {/* Simulated video playback */}
                                    <div className="text-white text-opacity-50 text-6xl mix-blend-overlay animate-pulse">
                                        {jobStatus === 'ANALYZING' ? '👁️' : jobStatus === 'BEAT_SYNC' ? '✂️' : '🎬'}
                                    </div>
                                    
                                    {/* Color Grading overlay simulation */}
                                    {jobStatus === 'RENDERING' && (
                                        <div className="absolute inset-0 bg-pink-500 mix-blend-overlay opacity-30"></div>
                                    )}
                                    
                                    <div className="absolute bottom-2 right-2 bg-black/60 px-1 rounded text-[8px] font-mono text-white">
                                        TC: 01:00:{Math.floor(playheadPos / 10).toString().padStart(2, '0')}:{playheadPos % 10}0
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* NLE Timeline */}
                        <div className="flex-1 bg-[#1a1a24] relative overflow-hidden px-2 border-t border-slate-700">
                            
                            {/* Time ruler */}
                            <div className="w-full h-4 border-b border-slate-700 flex justify-between items-end pb-0.5 opacity-50 px-2">
                                {[0, 5, 10, 15, 20].map(s => (
                                    <span key={s} className="text-[6px] font-mono text-slate-400">00:{s.toString().padStart(2, '0')}</span>
                                ))}
                            </div>

                            {/* Playhead */}
                            {jobStatus !== 'IDLE' && jobStatus !== 'UPLOADING' && (
                                <div className="absolute top-0 bottom-0 w-px bg-red-500 z-50 transition-all duration-75" style={{ left: `calc(1rem + ${playheadPos * 0.8}%)` }}>
                                    <div className="w-2 h-2 bg-red-500 -ml-1 -mt-1 transform rotate-45"></div>
                                </div>
                            )}

                            {/* Video Track */}
                            <div className="w-full h-10 bg-slate-900/50 border-b border-slate-800 mt-2 relative overflow-hidden flex items-center">
                                <span className="absolute left-1 text-[6px] text-slate-500 font-bold z-40 bg-slate-900/80 px-1">V1</span>
                                
                                {timelineClips.map((clip, i) => (
                                    <div 
                                        key={clip.id} 
                                        className={`absolute h-8 rounded-sm border transition-all duration-500 ${
                                            clip.aligned ? 'border-indigo-400 opacity-90' : 'bg-slate-700 border-slate-500 opacity-50'
                                        }`}
                                        style={{ 
                                            left: `${clip.start}%`, 
                                            width: `${clip.width}%`,
                                            backgroundColor: clip.aligned ? clip.color : undefined
                                        }}
                                    >
                                        {clip.aligned && <span className="text-[5px] font-mono text-white/70 absolute top-0.5 left-1">C00{i}.MP4</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Audio Master Track */}
                            <div className="w-full h-12 bg-slate-900/50 border-b border-slate-800 mt-1 relative flex items-center">
                                <span className="absolute left-1 text-[6px] text-slate-500 font-bold z-40 bg-slate-900/80 px-1">A1 (MASTER)</span>
                                
                                <div className="absolute inset-y-0 left-4 right-4 flex items-center px-1">
                                    <div className="w-full h-8 bg-[#18231c] rounded border border-emerald-900/50 flex items-center justify-between px-0.5">
                                        {audioWaveform.map((amp, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-0.5 rounded-full ${amp > 90 ? 'bg-emerald-400' : 'bg-emerald-700/50'}`}
                                                style={{ height: `${amp}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Beat Grid Markers overlay */}
                                {jobStatus === 'BEAT_SYNC' || jobStatus === 'RENDERING' || jobStatus === 'DONE' ? (
                                    <div className="absolute inset-y-0 left-4 right-4 flex justify-between px-1 pointer-events-none">
                                        {[0,1,2,3,4,5,6,7].map(i => (
                                            <div key={i} className="w-px h-full bg-emerald-400/30"></div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0a0510] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User Request</span>
               
               <button 
                   onClick={startRenderJob}
                   disabled={!systemActive || jobStatus !== 'IDLE'}
                   className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || jobStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                   }`}
                 >
                   🎬 Generate My Aftermovie
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AiAftermovieGenerator;
