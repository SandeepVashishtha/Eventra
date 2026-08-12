/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EEGCrowdSentiment = () => {
  const [bciActive, setBciActive] = useState(false);
  const [sentimentState, setSentimentState] = useState('ANTICIPATION'); // ANTICIPATION, EUPHORIA, BOREDOM
  
  // Brainwave Metrics
  const [alphaWaves, setAlphaWaves] = useState(40); // Relaxation / Flow
  const [betaWaves, setBetaWaves] = useState(20);  // Alertness / Anxiety
  const [gammaWaves, setGammaWaves] = useState(10); // Extreme Focus / Euphoria
  
  // System Metrics
  const [activeHeadsets, setActiveHeadsets] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Brain-Computer Interface (BCI) Receiver online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting opt-in VIP EEG telemetry stream.' }
  ]);

  // Visualizer states
  const [fractalPoints, setFractalPoints] = useState([]);

  useEffect(() => {
    let loop;
    
    if (bciActive) {
      if (sentimentState === 'ANTICIPATION') {
        loop = setInterval(() => {
          setAlphaWaves(Math.max(30, Math.min(60, 45 + (Math.random() * 10 - 5))));
          setBetaWaves(Math.max(30, Math.min(60, 40 + (Math.random() * 10 - 5))));
          setGammaWaves(Math.max(5, Math.min(20, 15 + (Math.random() * 5 - 2.5))));
          setActiveHeadsets(Math.max(480, Math.min(500, activeHeadsets + Math.floor(Math.random() * 5 - 2))));
          generateFractal('ANTICIPATION');
        }, 100);
      } else if (sentimentState === 'EUPHORIA') {
        loop = setInterval(() => {
          setAlphaWaves(Math.max(10, Math.min(30, 20 + (Math.random() * 10 - 5))));
          setBetaWaves(Math.max(60, Math.min(90, 75 + (Math.random() * 15 - 7.5))));
          setGammaWaves(Math.max(70, Math.min(100, 85 + (Math.random() * 10 - 5))));
          generateFractal('EUPHORIA');
        }, 50); // Faster updates for euphoria
      } else if (sentimentState === 'BOREDOM') {
        loop = setInterval(() => {
          setAlphaWaves(Math.max(70, Math.min(100, 85 + (Math.random() * 10 - 5))));
          setBetaWaves(Math.max(10, Math.min(30, 20 + (Math.random() * 5 - 2.5))));
          setGammaWaves(Math.max(0, Math.min(10, 5 + (Math.random() * 2 - 1))));
          generateFractal('BOREDOM');
        }, 200); // Slower updates
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [bciActive, sentimentState, activeHeadsets]);

  const generateFractal = (state) => {
      const points = [];
      const numPoints = state === 'EUPHORIA' ? 100 : state === 'ANTICIPATION' ? 60 : 30;
      
      for(let i=0; i<numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          
          let radiusOffset = 0;
          if (state === 'EUPHORIA') radiusOffset = Math.random() * 40 - 20;
          if (state === 'ANTICIPATION') radiusOffset = Math.sin(Date.now() / 200 + i) * 10;
          if (state === 'BOREDOM') radiusOffset = Math.cos(Date.now() / 1000 + i) * 5;

          const radius = 35 + radiusOffset;
          
          points.push({
              x: 50 + Math.cos(angle) * radius,
              y: 50 + Math.sin(angle) * radius,
              size: state === 'EUPHORIA' ? Math.random() * 3 + 1 : 2
          });
      }
      setFractalPoints(points);
  };

  const injectDrop = () => {
    if (bciActive) {
      setSentimentState('EUPHORIA');
      addLog('ACTION', 'Sub-Bass Drop detected. Triggering intense neurological response.');
      addLog('AI', 'Crowd state shifted to EUPHORIA. Syncing LED fractal hyper-geometry.');
    }
  };

  const injectLull = () => {
    if (bciActive) {
      setSentimentState('BOREDOM');
      addLog('WARN', 'Track energy dropped significantly. Alpha waves dominating.');
      addLog('AI', 'Crowd state shifted to BOREDOM. Dimming visuals, suggesting BPM increase to DJ.');
    }
  };

  const resetBCI = () => {
    setSentimentState('ANTICIPATION');
    setAlphaWaves(40);
    setBetaWaves(20);
    setGammaWaves(10);
    addLog('SYS', 'Neurological baseline reset. Awaiting next track transition.');
  };

  const toggleBCI = () => {
    if (!bciActive) {
      setBciActive(true);
      setActiveHeadsets(492);
      addLog('SYS', 'VIP EEG Telemetry stream engaged.');
      addLog('ACTION', 'Mapping neurological metrics to Stage LED DMX endpoints.');
    } else {
      setBciActive(false);
      setActiveHeadsets(0);
      setFractalPoints([]);
      addLog('WARN', 'BCI stream offline. Reverting to pre-rendered video loops.');
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
        
        {/* Left Side: Neural Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Brain-Computer Interface
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            EEG-Based Crowd <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Sentiment Visualizer</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            DJs rely purely on visual cues like jumping or cheering to gauge if their track selection is working, entirely missing subtle shifts in the crowd's deep psychological engagement. Eventra solves this by providing opt-in EEG biosensor headbands to a VIP sample group. The system streams their neurological brainwave data (alpha/beta/gamma waves) to a central machine learning model. This dashboard visualizes the crowd's true subconscious state in real-time, projecting synchronized, reactive fractal visuals onto the massive LED screens based directly on the audience's collective euphoria or boredom.
          </p>

          <div className="bg-[#08101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">⚡</span> Neurological Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleBCI}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     bciActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {bciActive ? 'Disconnect Headsets' : 'Engage BCI Data Stream'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Alpha Waves */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentState === 'BOREDOM' ? 'bg-slate-800 border-slate-500/50 shadow-inner' :
                 bciActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Alpha (Relaxation)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     sentimentState === 'BOREDOM' ? 'text-slate-300 animate-pulse' :
                     bciActive ? 'text-slate-500' : 'text-slate-600'
                   }`}>
                     {bciActive ? Math.floor(alphaWaves) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

               {/* Beta Waves */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentState === 'ANTICIPATION' ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 bciActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Beta (Alertness)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     sentimentState === 'ANTICIPATION' ? 'text-blue-400' :
                     bciActive ? 'text-blue-500' : 'text-slate-600'
                   }`}>
                     {bciActive ? Math.floor(betaWaves) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>
               
               {/* Gamma Waves */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentState === 'EUPHORIA' ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.4)]' :
                 bciActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Gamma (Euphoria)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     sentimentState === 'EUPHORIA' ? 'text-cyan-400 animate-pulse' :
                     bciActive ? 'text-cyan-600' : 'text-slate-600'
                   }`}>
                     {bciActive ? Math.floor(gammaWaves) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Hz</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#03060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Machine Learning Log</span>
                 <span className="text-cyan-400">{activeHeadsets} VIP Streams Active</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-500 font-bold' : 
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">LED WALL POV</span>
                <span className="text-[8px] font-mono text-slate-400">NEURAL VJ ENGINE</span>
              </div>

              <div className="flex-1 relative bg-[#010204] overflow-hidden flex flex-col items-center justify-center p-4">
                
                {!bciActive ? (
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING BCI INPUT</span>
                ) : (
                  <>
                    {/* Render Neural Fractal */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <svg className="w-[80%] h-[80%] overflow-visible">
                         {/* Connecting lines */}
                         <polygon 
                           points={fractalPoints.map(p => `${p.x} ${p.y}`).join(', ')} 
                           fill="none" 
                           stroke={
                             sentimentState === 'EUPHORIA' ? '#22d3ee' : 
                             sentimentState === 'ANTICIPATION' ? '#3b82f6' : '#64748b'
                           } 
                           strokeWidth={sentimentState === 'EUPHORIA' ? '2' : '1'}
                           className="transition-all duration-200"
                         />
                         
                         {/* Core Nodes */}
                         {fractalPoints.map((p, i) => (
                           <circle 
                             key={i} 
                             cx={p.x} 
                             cy={p.y} 
                             r={p.size} 
                             fill={
                               sentimentState === 'EUPHORIA' ? '#fff' : 
                               sentimentState === 'ANTICIPATION' ? '#60a5fa' : '#94a3b8'
                             }
                             className={`transition-all duration-200 ${sentimentState === 'EUPHORIA' ? 'animate-pulse' : ''}`}
                           />
                         ))}
                      </svg>
                    </div>

                    {/* Euphoria Post-Processing */}
                    {sentimentState === 'EUPHORIA' && (
                       <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen pointer-events-none z-20 animate-pulse backdrop-blur-[1px]"></div>
                    )}
                    
                    {/* HUD Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                       <span className={`text-[12px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-lg transition-all duration-300 ${
                          sentimentState === 'EUPHORIA' ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300' :
                          sentimentState === 'ANTICIPATION' ? 'bg-blue-900/60 border-blue-500 text-blue-400' :
                          'bg-slate-800/80 border-slate-600 text-slate-400'
                       }`}>
                          {sentimentState}
                       </span>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={injectDrop}
                disabled={!bciActive || sentimentState === 'EUPHORIA'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !bciActive || sentimentState === 'EUPHORIA' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Inject Beat Drop (Euphoria)
              </button>
              
              <button 
                onClick={injectLull}
                disabled={!bciActive || sentimentState === 'BOREDOM'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !bciActive || sentimentState === 'BOREDOM' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Inject Energy Lull (Boredom)
              </button>
            </div>
            
            <button 
                onClick={resetBCI}
                disabled={!bciActive || sentimentState === 'ANTICIPATION'}
                className={`w-full py-2 mt-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !bciActive || sentimentState === 'ANTICIPATION' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-blue-950/40 border-blue-900 text-blue-400 hover:bg-blue-900/60'
                }`}
              >
                Reset to Baseline (Anticipation)
              </button>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EEGCrowdSentiment;
