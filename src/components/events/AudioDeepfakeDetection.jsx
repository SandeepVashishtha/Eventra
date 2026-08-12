/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AudioDeepfakeDetection = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState('IDLE'); // IDLE, LIVE_VOCALS, AI_GENERATED, PRE_RECORDED
  
  // Forensics Metrics
  const [authenticityScore, setAuthenticityScore] = useState(100); // %
  const [artifactConfidence, setArtifactConfidence] = useState(0); // %
  const [harmonicVariance, setHarmonicVariance] = useState(0); // Spectral variance
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Audio Forensics ML Engine Initialized.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'Tapping into Main Stage FOH mixing console.' }
  ]);

  // Visualizer State
  const [waveform, setWaveform] = useState(Array(60).fill(0));
  const [spectrogram, setSpectrogram] = useState(Array(15).fill({ active: false, intensity: 0 }));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (analysisTarget === 'IDLE') {
              setAuthenticityScore(100);
              setArtifactConfidence(0);
              setHarmonicVariance(0);
              setWaveform(prev => [...prev.slice(1), 5 + Math.random() * 5]);
              setSpectrogram(Array(15).fill({ active: false, intensity: 0 }));
              
          } else if (analysisTarget === 'LIVE_VOCALS') {
              // High variance, natural inconsistencies, high authenticity
              setAuthenticityScore(prev => Math.min(99, prev + (Math.random() > 0.5 ? 1 : -1)));
              setArtifactConfidence(Math.max(0, artifactConfidence - 2));
              setHarmonicVariance(45 + Math.random() * 20); // Natural vocal breath/pitch fluctuation
              
              setWaveform(prev => [...prev.slice(1), 30 + Math.random() * 60]);
              
              // Random natural spectral firing
              setSpectrogram(prev => prev.map(() => ({
                  active: Math.random() > 0.7,
                  intensity: Math.random() * 0.5
              })));
              
          } else if (analysisTarget === 'AI_GENERATED') {
              // Synthetic artifacts detected, low authenticity
              setAuthenticityScore(prev => Math.max(12, prev - 5));
              setArtifactConfidence(prev => Math.min(96, prev + 4));
              setHarmonicVariance(2.1 + Math.random() * 0.5); // Unnaturally perfect pitch/variance
              
              // Spiky, unnatural waveform
              setWaveform(prev => {
                  const val = Math.random() > 0.8 ? 90 : 20 + Math.random() * 10;
                  return [...prev.slice(1), val];
              });
              
              // Rigid, highly correlated spectral firing (AI Artifacts)
              setSpectrogram(prev => prev.map((_, i) => ({
                  active: i % 3 === 0, // Unnatural repeating pattern
                  intensity: 0.9 + Math.random() * 0.1
              })));
              
          } else if (analysisTarget === 'PRE_RECORDED') {
              // Perfect timing, exactly matches Spotify rip
              setAuthenticityScore(prev => Math.max(5, prev - 10));
              setArtifactConfidence(prev => Math.min(99, prev + 10));
              setHarmonicVariance(0.01); // Zero variance, exact digital copy
              
              // Blocky, compressed waveform (Brickwall limiting)
              setWaveform(prev => [...prev.slice(1), 85 + Math.random() * 5]);
              
              setSpectrogram(prev => prev.map(() => ({
                  active: true,
                  intensity: 1.0
              })));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, analysisTarget, artifactConfidence]);

  const triggerAnalysis = (type) => {
    if (!systemActive) return;
    
    setAnalysisTarget(type);
    
    if (type === 'LIVE_VOCALS') {
        addLog('ACTION', 'Analyzing isolated vocal stem. Checking transient naturality.');
        addLog('SUCCESS', 'Breath artifacts and micro-pitch imperfections detected. Vocal is 100% LIVE.');
    } else if (type === 'AI_GENERATED') {
        addLog('WARN', 'WARNING: Unnatural harmonic phasing detected in acapella.');
        addLog('CRIT', 'AI Artifacts found. Vocal generated via Neural Network (e.g., Suno/Udio).');
    } else if (type === 'PRE_RECORDED') {
        addLog('WARN', 'Analyzing master bus output. Comparing to commercial DSP database.');
        addLog('CRIT', '100% Phase correlation with Spotify master file. DJ is playing a PRE-RECORDED SET.');
    } else if (type === 'IDLE') {
        addLog('SYS', 'Forensics engine standing by.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setAnalysisTarget('IDLE');
      setAuthenticityScore(100);
      setArtifactConfidence(0);
      setHarmonicVariance(0);
      addLog('SYS', 'Machine Learning Audio Forensics Armed. Listening to FOH mix.');
    } else {
      setSystemActive(false);
      setAnalysisTarget('IDLE');
      setWaveform(Array(60).fill(0));
      setSpectrogram(Array(15).fill({ active: false, intensity: 0 }));
      addLog('WARN', 'Analyzer offline. Performance transparency cannot be verified.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔎</span> Audio Forensics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Audio Deepfake <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            With the rapid rise of AI audio generation, fans are increasingly concerned that artists are playing pre-recorded sets or lip-syncing to AI-generated vocals. Eventra solves this by integrating a real-time machine learning audio analyzer directly into the main stage output feed. Eventra's AI scans harmonic frequencies and waveform transients to determine if the audio is genuinely mixed live, or if the stems contain AI-generated deepfake artifacts. The results are broadcast to the Eventra app, providing an "Authenticity Score" for ultimate performance transparency.
          </p>

          <div className="bg-[#050a10] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> ML Authenticity Metrics
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Diagnostics' : 'Initialize Scanner'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Authenticity Score */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 analysisTarget === 'AI_GENERATED' || analysisTarget === 'PRE_RECORDED' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 analysisTarget === 'LIVE_VOCALS' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Authenticity Score
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     analysisTarget === 'IDLE' ? 'text-slate-600' :
                     authenticityScore > 80 ? 'text-emerald-400' : 'text-red-500'
                   }`}>
                     {Math.floor(authenticityScore)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* AI Artifacts */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 artifactConfidence > 50 ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Artifact Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     artifactConfidence > 80 ? 'text-red-400' : 
                     artifactConfidence > 50 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(artifactConfidence)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Harmonic Variance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 analysisTarget === 'AI_GENERATED' || analysisTarget === 'PRE_RECORDED' ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Spectral Variance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     analysisTarget === 'LIVE_VOCALS' ? 'text-emerald-400' :
                     analysisTarget === 'IDLE' || !systemActive ? 'text-slate-600' : 'text-blue-400'
                   }`}>
                     {harmonicVariance.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010204] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Forensics Engine Ledger</span>
                 {analysisTarget === 'LIVE_VOCALS' && <span className="text-emerald-400 font-black animate-pulse">VERIFIED LIVE AUDIO</span>}
                 {analysisTarget === 'AI_GENERATED' && <span className="text-red-500 font-black animate-pulse">SYNTHETIC ARTIFACTS DETECTED</span>}
                 {analysisTarget === 'PRE_RECORDED' && <span className="text-orange-400 font-black animate-pulse">COPYRIGHT MATCH (PRE-RECORDED)</span>}
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
            
            {/* Analyzer Display */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">ML SPECTROGRAM ANALYSIS</span>
                <span className="text-[8px] font-mono text-slate-400">FOH MASTER BUS</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4 px-4 overflow-hidden justify-between">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">ANALYZER OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between">
                      
                      {/* Spectrogram View (Upper half) */}
                      <div className="h-32 bg-[#02050a] border border-cyan-900/50 rounded-lg p-2 relative overflow-hidden flex flex-col justify-between">
                          <span className="absolute top-1 left-2 text-[6px] text-cyan-500 font-mono">PHASE CORRELATION</span>
                          
                          <div className="flex-1 flex items-end justify-between px-1 mt-4 space-x-1">
                              {spectrogram.map((bar, i) => (
                                  <div 
                                      key={i} 
                                      className={`flex-1 rounded-t-sm transition-all duration-75 ${
                                          bar.active && (analysisTarget === 'AI_GENERATED' || analysisTarget === 'PRE_RECORDED') ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                                          bar.active && analysisTarget === 'LIVE_VOCALS' ? 'bg-emerald-400' : 'bg-slate-800'
                                      }`}
                                      style={{ height: `${bar.active ? bar.intensity * 100 : 10}%` }}
                                  ></div>
                              ))}
                          </div>

                          {/* Grid lines overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

                          {/* Warning Overlay */}
                          {analysisTarget === 'AI_GENERATED' && (
                              <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse pointer-events-none"></div>
                          )}
                          {analysisTarget === 'PRE_RECORDED' && (
                              <div className="absolute inset-0 border-2 border-orange-500 rounded-lg animate-pulse pointer-events-none"></div>
                          )}
                      </div>

                      {/* Waveform View (Lower half) */}
                      <div className="h-40 bg-[#02050a] border border-cyan-900/50 rounded-lg relative overflow-hidden flex items-center px-1">
                          <span className="absolute top-1 left-2 text-[6px] text-cyan-500 font-mono">TRANSIENT WAVEFORM</span>
                          
                          <div className="w-full flex items-center justify-start space-x-[2px] h-32 relative z-10">
                              {waveform.map((val, i) => (
                                  <div 
                                      key={i} 
                                      className={`w-1 rounded-full transition-all duration-75 ${
                                          analysisTarget === 'PRE_RECORDED' ? 'bg-orange-500' :
                                          analysisTarget === 'AI_GENERATED' && val > 80 ? 'bg-red-500' :
                                          analysisTarget === 'LIVE_VOCALS' ? 'bg-emerald-500' : 'bg-cyan-600'
                                      }`}
                                      style={{ height: `${val}%` }}
                                  ></div>
                              ))}
                          </div>
                          
                          {/* Center line */}
                          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-900/50 z-0"></div>

                          {/* Artifact Markers */}
                          {analysisTarget === 'AI_GENERATED' && (
                              <div className="absolute top-2 right-2 flex items-center space-x-1 animate-pulse">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-[8px] font-black text-red-500 uppercase">Artifact Detected</span>
                              </div>
                          )}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Diagnostics Controls */}
            <div className="w-full bg-[#050a10] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Test Audio Stem</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerAnalysis('LIVE_VOCALS')}
                   disabled={!systemActive || analysisTarget === 'LIVE_VOCALS'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || analysisTarget === 'LIVE_VOCALS' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   🎤 Live Vocal<br/>(100% Authentic)
                 </button>

                 <button 
                   onClick={() => triggerAnalysis('AI_GENERATED')}
                   disabled={!systemActive || analysisTarget === 'AI_GENERATED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || analysisTarget === 'AI_GENERATED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   🤖 AI Generated<br/>(Deepfake Vocals)
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerAnalysis('PRE_RECORDED')}
                   disabled={!systemActive || analysisTarget === 'PRE_RECORDED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || analysisTarget === 'PRE_RECORDED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   📀 Pre-Recorded<br/>(Spotify Match)
                 </button>
                 
                 <button 
                   onClick={() => triggerAnalysis('IDLE')}
                   disabled={!systemActive || analysisTarget === 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || analysisTarget === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Stop Source
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AudioDeepfakeDetection;
