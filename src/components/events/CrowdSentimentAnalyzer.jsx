/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdSentimentAnalyzer = () => {
  const [analysisActive, setAnalysisActive] = useState(false);
  const [crowdState, setCrowdState] = useState('STANDBY'); // STANDBY, BORED, EUPHORIC
  
  // Sentiment Metrics (Percentages)
  const [joy, setJoy] = useState(45);
  const [boredom, setBoredom] = useState(30);
  const [surprise, setSurprise] = useState(25);
  
  // Derived Metric
  const [hypeIndex, setHypeIndex] = useState(6.2); // 0.0 to 10.0
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Stage 1 Crowd Camera feeds ingested.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'CNN Facial Emotion Recognition model loaded.' },
    { id: 3, time: '20:00:05', type: 'SYS', msg: 'Privacy constraints active. No PII stored. Processing macro-data only.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (analysisActive && crowdState === 'STANDBY') {
      loop = setInterval(() => {
        const j = Math.max(30, Math.min(60, joy + (Math.random() * 4 - 2)));
        const b = Math.max(20, Math.min(50, boredom + (Math.random() * 4 - 2)));
        const s = 100 - (j + b); // Keep it totaling 100%
        
        setJoy(j);
        setBoredom(b);
        setSurprise(s);
        setHypeIndex(j / 10 + s / 20); // Rough calculation for UI
      }, 1000);
    } else if (crowdState === 'BORED') {
      loop = setInterval(() => {
        const j = Math.max(10, joy - 2);
        const b = Math.min(80, boredom + 3);
        const s = 100 - (j + b);
        
        setJoy(j);
        setBoredom(b);
        setSurprise(Math.max(0, s));
        setHypeIndex(Math.max(1.0, hypeIndex - 0.2));
        
        if (boredom > 70) {
          addLog('WARN', 'Hype Index critical drop. Crowd disengaged.');
          clearInterval(loop);
        }
      }, 500);
    } else if (crowdState === 'EUPHORIC') {
      loop = setInterval(() => {
        const j = Math.min(90, joy + 3);
        const s = Math.min(40, surprise + 1);
        const b = Math.max(0, 100 - (j + s));
        
        setJoy(j);
        setBoredom(b);
        setSurprise(s);
        setHypeIndex(Math.min(9.9, hypeIndex + 0.3));
        
        if (joy > 85) {
          addLog('SUCCESS', 'Peak euphoria detected (Bass Drop). Logging timestamp for analytics.');
          clearInterval(loop);
        }
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [analysisActive, crowdState, joy, boredom, surprise, hypeIndex]);

  const simulateBassDrop = () => {
    if (analysisActive) {
      setCrowdState('EUPHORIC');
      addLog('ACTION', 'Major song transition (Bass Drop). Analyzing facial responses...');
    }
  };

  const simulateLull = () => {
    if (analysisActive) {
      setCrowdState('BORED');
      addLog('ACTION', 'Extended acoustic interlude. Analyzing facial responses...');
    }
  };

  const resetAnalysis = () => {
    setCrowdState('STANDBY');
    setJoy(45);
    setBoredom(30);
    setSurprise(25);
    setHypeIndex(6.2);
    addLog('SYS', 'Resetting neural net baseline. Resuming standard macro-sentiment tracking.');
  };

  const toggleAnalysis = () => {
    if (!analysisActive) {
      setAnalysisActive(true);
      addLog('SYS', 'Crowd Sentiment Analysis online. Real-time Hype Index computing.');
    } else {
      setAnalysisActive(false);
      resetAnalysis();
      addLog('WARN', 'Sentiment analysis offline. Relying on subjective post-show guesses.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Analytics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> CNN Neural Sentiment Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Crowd Sentiment <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Analysis via Facial Expressions</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Historically, organizers gauge the success of a stage based purely on ticket sales or bar revenue, lacking qualitative data on whether the crowd is actually enjoying the music or just standing there bored. Eventra solves this by feeding live crowd camera footage into a privacy-preserving facial emotion recognition neural network (CNN). The AI aggregates macro-sentiment (Joy, Boredom, Surprise) across thousands of faces without storing personal data, providing organizers with a live "Hype Index" graph to see exactly which songs generated the most euphoric reactions.
          </p>

          <div className="bg-[#0f091a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">📊</span> Macro-Sentiment Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAnalysis}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     analysisActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {analysisActive ? 'Disable Neural Net' : 'Initialize Analysis'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Hype Index */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdState === 'EUPHORIC' ? 'bg-pink-950/40 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.2)]' :
                 crowdState === 'BORED' ? 'bg-slate-900 border-slate-700 opacity-60' :
                 analysisActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Hype Index
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     crowdState === 'EUPHORIC' ? 'text-pink-400 animate-pulse' :
                     crowdState === 'BORED' ? 'text-slate-600' :
                     analysisActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {analysisActive ? hypeIndex.toFixed(1) : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/ 10.0</span>
                 </div>
               </div>

               {/* Emotion Breakdown */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 analysisActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Emotion Distribution
                 </span>
                 
                 <div className="w-full h-4 bg-slate-900 rounded overflow-hidden flex mb-1">
                   <div className="bg-pink-500 transition-all duration-300" style={{ width: `${analysisActive ? joy : 0}%` }}></div>
                   <div className="bg-cyan-500 transition-all duration-300" style={{ width: `${analysisActive ? surprise : 0}%` }}></div>
                   <div className="bg-slate-600 transition-all duration-300" style={{ width: `${analysisActive ? boredom : 0}%` }}></div>
                 </div>
                 
                 <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-400">
                   <span className="text-pink-400">Joy {analysisActive ? Math.floor(joy) : 0}%</span>
                   <span className="text-cyan-400">Surp {analysisActive ? Math.floor(surprise) : 0}%</span>
                   <span className="text-slate-500">Bored {analysisActive ? Math.floor(boredom) : 0}%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Inference & Analytics Log</span>
                 {crowdState === 'EUPHORIC' && <span className="text-pink-400 animate-pulse">Euphoria Detected!</span>}
                 {crowdState === 'BORED' && <span className="text-slate-500">Disengagement Detected</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-pink-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Computer Vision Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* CV Camera Simulator */}
            <div className={`w-full rounded-[1rem] border-[8px] border-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">CAMERA 4 (STAGE FRONT)</span>
                <span className="text-[8px] font-mono text-purple-400">PRIVACY: NO PII STORED</span>
              </div>

              <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-4">
                
                {/* Simulated Crowd Image / Silhouettes */}
                <div className="absolute inset-0 bg-[#1a1a2e] opacity-50 z-0">
                   <div className="absolute bottom-[-10px] left-[10%] w-24 h-32 bg-black rounded-t-full"></div>
                   <div className="absolute bottom-[-20px] left-[40%] w-32 h-40 bg-black rounded-t-full"></div>
                   <div className="absolute bottom-[-5px] right-[15%] w-20 h-28 bg-black rounded-t-full"></div>
                </div>

                {!analysisActive ? (
                  <div className="z-10 text-center opacity-40">
                     <span className="text-4xl block mb-2">👁️</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inference Offline</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full z-10 flex items-center justify-center">
                     
                     {/* Bounding Box 1 */}
                     <div className="absolute bottom-[20px] left-[15%] w-16 h-16 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className={`absolute -top-4 left-0 text-[7px] font-mono px-1 font-black ${
                          crowdState === 'EUPHORIC' ? 'bg-pink-500 text-white' : 
                          crowdState === 'BORED' ? 'bg-slate-600 text-white' : 'bg-purple-900 text-purple-300'
                        }`}>
                          {crowdState === 'EUPHORIC' ? 'JOY: 94%' : crowdState === 'BORED' ? 'BRD: 82%' : 'JOY: 51%'}
                        </span>
                     </div>

                     {/* Bounding Box 2 (Center) */}
                     <div className="absolute bottom-[30px] left-[45%] w-20 h-20 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className={`absolute -top-4 left-0 text-[7px] font-mono px-1 font-black ${
                          crowdState === 'EUPHORIC' ? 'bg-pink-500 text-white' : 
                          crowdState === 'BORED' ? 'bg-slate-600 text-white' : 'bg-cyan-900 text-cyan-300'
                        }`}>
                          {crowdState === 'EUPHORIC' ? 'JOY: 98%' : crowdState === 'BORED' ? 'BRD: 75%' : 'SRP: 60%'}
                        </span>
                     </div>

                     {/* Bounding Box 3 */}
                     <div className="absolute bottom-[15px] right-[20%] w-14 h-14 border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className={`absolute -top-4 left-0 text-[7px] font-mono px-1 font-black ${
                          crowdState === 'EUPHORIC' ? 'bg-pink-500 text-white' : 
                          crowdState === 'BORED' ? 'bg-slate-600 text-white' : 'bg-purple-900 text-purple-300'
                        }`}>
                          {crowdState === 'EUPHORIC' ? 'JOY: 89%' : crowdState === 'BORED' ? 'BRD: 88%' : 'JOY: 45%'}
                        </span>
                     </div>

                     {/* Grid / HUD Overlay */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0zOS0xdmgtMzhWMzl6IiBmaWxsPSIjYThiOGQ4IiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Stage Events</span>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                   onClick={simulateBassDrop}
                   disabled={!analysisActive || crowdState !== 'STANDBY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !analysisActive || crowdState !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-900 text-pink-500 hover:bg-pink-900/60'
                   }`}
                 >
                   Inject Bass Drop (Joy)
                 </button>
                 
                 <button 
                   onClick={simulateLull}
                   disabled={!analysisActive || crowdState !== 'STANDBY'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !analysisActive || crowdState !== 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Inject Acoustic Lull (Boredom)
                 </button>
               </div>

               <button 
                 onClick={resetAnalysis}
                 disabled={crowdState === 'STANDBY'}
                 className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                   crowdState === 'STANDBY' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                 }`}
               >
                 Reset Baseline
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrowdSentimentAnalyzer;
