/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SetlistPredictor = () => {
  const [modelActive, setModelActive] = useState(false);
  const [predictionState, setPredictionState] = useState('IDLE'); // IDLE, ANALYZING, PREDICTING, TRANSITION
  
  // AI Metrics
  const [epochsTrained, setEpochsTrained] = useState(0);
  const [historicalAccuracy, setHistoricalAccuracy] = useState(0); // %
  const [cdjBpm, setCdjBpm] = useState(128.0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'ML Predictive Engine initialized on FOH network.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'Awaiting ProDJ Link telemetry feed.' }
  ]);

  // Current Track Data
  const currentTrack = {
      title: "Laserbeam",
      artist: "Ray Volpe",
      key: "Fm (4A)",
      timeRemaining: 184 // seconds
  };

  // Prediction Data
  const [predictions, setPredictions] = useState([]);
  const [transitioningTo, setTransitioningTo] = useState(null);

  useEffect(() => {
    let loop;
    
    if (modelActive) {
      loop = setInterval(() => {
          
          if (predictionState === 'ANALYZING') {
              // Simulating CDJ tempo fluctuations
              setCdjBpm(prev => prev + (Math.random() * 0.4 - 0.2));
              
              // Generating probabilities
              setPredictions([
                  { track: 'Rumble', artist: 'Skrillex, Fred again..', prob: 78.5 + (Math.random()*2-1), key: 'Fm (4A)' },
                  { track: 'Gassed Up', artist: 'Zeds Dead, Subtronics', prob: 14.2 + (Math.random()*1-0.5), key: 'Cm (5A)' },
                  { track: 'Dominate', artist: 'Space Laces', prob: 5.1 + (Math.random()*0.5), key: 'Fm (4A)' },
                  { track: 'Bangarang', artist: 'Skrillex', prob: 2.2 + (Math.random()*0.2), key: 'Em (9A)' } // Classic throw-in
              ].sort((a,b) => b.prob - a.prob));
              
          } else if (predictionState === 'TRANSITION') {
              // Faders moving, probability locking in
              setPredictions(prev => {
                  let p = [...prev];
                  p[0].prob = Math.min(99.9, p[0].prob + (Math.random() * 5));
                  p[1].prob = Math.max(0.1, p[1].prob - (Math.random() * 2));
                  p[2].prob = Math.max(0.0, p[2].prob - 0.5);
                  p[3].prob = 0;
                  return p;
              });
          }

      }, 200); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [modelActive, predictionState]);

  const simulateTransition = () => {
    if (!modelActive || predictionState !== 'ANALYZING') return;
    
    setPredictionState('TRANSITION');
    addLog('ACTION', 'Pioneer CDJ Deck 2 fader activity detected. Track cued.');
    addLog('SYS', 'Harmonic key match confirmed (4A). BPM synced.');
    
    setTimeout(() => {
        setPredictionState('IDLE');
        setTransitioningTo(predictions[0]);
        setHistoricalAccuracy(prev => Math.min(99, prev + 1.2));
        addLog('SUCCESS', `Transition complete. Model accurately predicted: ${predictions[0].title}.`);
        
        setTimeout(() => {
            setTransitioningTo(null);
            setPredictionState('ANALYZING');
            addLog('AI', 'Monitoring new track structure for next transition window.');
        }, 4000);
        
    }, 2500); 
  };

  const toggleModel = () => {
    if (!modelActive) {
      setModelActive(true);
      setEpochsTrained(500);
      setHistoricalAccuracy(92.4);
      setCdjBpm(150.0);
      setPredictionState('ANALYZING');
      addLog('SYS', 'ProDJ Link connected. Scraping live telemetry data.');
      addLog('AI', 'ML Model loaded: Trained on past 500 festival sets.');
    } else {
      setModelActive(false);
      setEpochsTrained(0);
      setHistoricalAccuracy(0);
      setPredictionState('IDLE');
      setPredictions([]);
      setTransitioningTo(null);
      addLog('WARN', 'Telemetry offline. Falling back to guessing by ear.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎵</span> Algorithmic Forecasting
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Generated Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Setlist Prediction</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Die-hard fans want to optimize their bathroom breaks to ensure they don't miss their favorite tracks, and music nerds constantly argue about what song a DJ will transition into next. Eventra solves this by creating a predictive AI model trained on the DJ's past 500 performances. By scraping live tempo and harmonic key data from the Pioneer CDJ mixer network, the app provides a live "Prediction HUD" that displays a constantly updating probability matrix of which track is coming next, gamifying the listening experience.
          </p>

          <div className="bg-[#100a16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🧠</span> ML Inference Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleModel}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     modelActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {modelActive ? 'Disconnect ProDJ Link' : 'Initialize Predictive Model'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Training Sets */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 modelActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Performances Trained
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     modelActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {epochsTrained}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Sets</span>
                 </div>
               </div>

               {/* Live BPM */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 modelActive ? 'bg-pink-950/20 border-pink-900/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Deck BPM
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     modelActive ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {cdjBpm.toFixed(1)}
                   </span>
                 </div>
               </div>
               
               {/* Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 historicalAccuracy > 90 ? 'bg-emerald-950/30 border-emerald-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Predictive Accuracy
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     historicalAccuracy > 90 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {historicalAccuracy.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#06040a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Telemetry Log</span>
                 {predictionState === 'TRANSITION' && <span className="text-pink-400 animate-pulse">MIX DETECTED...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' :
                       log.type === 'AI' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* User App Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!modelActive ? 'bg-slate-900' : 'bg-[#0a0710]'}`}>
              
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-xl z-40"></div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
                
                {!modelActive ? (
                   <div className="flex-1 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">AWAITING DJ CONNECTION</span>
                   </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                      
                      {/* Current Track Header */}
                      <div className="px-6 py-4 border-b border-purple-900/30 bg-purple-950/10">
                          <span className="text-[8px] font-black uppercase text-purple-400 tracking-widest flex justify-between items-center mb-1">
                              <span>Now Playing</span>
                              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1"></span>LIVE</span>
                          </span>
                          <h2 className="text-xl font-black text-white leading-tight truncate">{currentTrack.title}</h2>
                          <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                          
                          <div className="flex space-x-2 mt-3">
                              <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[8px] font-mono">
                                  BPM: {cdjBpm.toFixed(1)}
                              </span>
                              <span className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[8px] font-mono">
                                  KEY: {currentTrack.key}
                              </span>
                          </div>
                      </div>

                      {/* Prediction Matrix */}
                      <div className="flex-1 p-4 flex flex-col">
                          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-3">AI Transition Probability</span>
                          
                          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                              
                              {transitioningTo ? (
                                  // Success State
                                  <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                                      <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4">
                                          <span className="text-2xl">✨</span>
                                      </div>
                                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">Transition Predicted!</span>
                                      <h3 className="text-lg font-black text-white text-center">{transitioningTo.title}</h3>
                                      <p className="text-xs text-slate-400 text-center">{transitioningTo.artist}</p>
                                  </div>
                              ) : (
                                  // Live Probabilities
                                  predictions.map((p, index) => (
                                      <div key={index} className={`bg-slate-900/50 border border-slate-800 rounded-lg p-3 relative overflow-hidden transition-all duration-300 ${
                                          index === 0 && predictionState === 'TRANSITION' ? 'border-pink-500 bg-pink-950/30' : ''
                                      }`}>
                                          
                                          {/* Probability Fill Bar */}
                                          <div className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-100 ${
                                              index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-500'
                                          }`} style={{width: `${p.prob}%`}}></div>

                                          <div className="relative z-10 flex justify-between items-center">
                                              <div className="flex flex-col w-[70%]">
                                                  <span className="text-sm font-bold text-white truncate">{p.track}</span>
                                                  <span className="text-[9px] text-slate-400 truncate">{p.artist}</span>
                                              </div>
                                              
                                              <div className="flex flex-col items-end">
                                                  <span className={`text-lg font-black font-mono transition-colors ${
                                                      index === 0 ? 'text-pink-400' : 'text-slate-500'
                                                  }`}>
                                                      {p.prob.toFixed(1)}%
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              )}

                          </div>
                      </div>

                      {/* Bottom Alert bar */}
                      <div className="h-10 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center backdrop-blur">
                          {predictionState === 'TRANSITION' ? (
                              <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest animate-pulse">MIXING IN PROGRESS...</span>
                          ) : transitioningTo ? (
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+120 XP GAINED</span>
                          ) : (
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ANALYZING PHRASING...</span>
                          )}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#100a16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate DJ Activity</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={simulateTransition}
                   disabled={!modelActive || predictionState !== 'ANALYZING'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !modelActive || predictionState !== 'ANALYZING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse'
                   }`}
                 >
                   Simulate DJ Transitioning Tracks
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SetlistPredictor;
