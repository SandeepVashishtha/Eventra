/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ThermalSentimentAnalysis = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [crowdMood, setCrowdMood] = useState('IDLE'); // IDLE, HYPED, BORED, AGITATED
  
  // Computer Vision Metrics
  const [thermalAggregate, setThermalAggregate] = useState(36.5); // Celsius
  const [microMovementIdx, setMicroMovementIdx] = useState(1.2); // Arbitrary kinematic index
  const [sentimentScore, setSentimentScore] = useState(50); // 0 (Terrible) to 100 (Euphoric)
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Stage 1 Thermal Imaging Array Online.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting ML kinematic processing.' }
  ]);

  // Visualizer State (Heatmap pixels)
  const [heatMap, setHeatMap] = useState(Array(100).fill(0));

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (crowdMood === 'IDLE') {
              setThermalAggregate(prev => prev + (Math.random() * 0.2 - 0.1));
              setMicroMovementIdx(prev => Math.max(0.5, prev + (Math.random() * 0.4 - 0.2)));
              setSentimentScore(prev => prev + (Math.random() * 2 - 1));
              
              setHeatMap(Array.from({ length: 100 }, () => Math.random() * 30 + 30));
              
          } else if (crowdMood === 'HYPED') {
              setThermalAggregate(prev => Math.min(39.5, prev + 0.1));
              setMicroMovementIdx(prev => Math.min(8.5, prev + 0.2));
              setSentimentScore(prev => Math.min(95, prev + 1));
              
              setHeatMap(Array.from({ length: 100 }, () => Math.random() * 40 + 60)); // Hotter
              
          } else if (crowdMood === 'BORED') {
              setThermalAggregate(prev => Math.max(35.5, prev - 0.1));
              setMicroMovementIdx(prev => Math.max(0.1, prev - 0.2));
              setSentimentScore(prev => Math.max(15, prev - 1));
              
              setHeatMap(Array.from({ length: 100 }, () => Math.random() * 20 + 10)); // Colder
              
          } else if (crowdMood === 'AGITATED') {
              // High temp, erratic movement, bad sentiment
              setThermalAggregate(prev => Math.min(40.5, prev + 0.2));
              setMicroMovementIdx(prev => 9.0 + (Math.random() * 2));
              setSentimentScore(prev => Math.max(5, prev - 2));
              
              setHeatMap(Array.from({ length: 100 }, () => {
                  const val = Math.random() * 100;
                  return val > 80 ? 100 : val; // Erratic spikes
              }));
          }

      }, 150); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, crowdMood]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    setCrowdMood(type);
    
    if (type === 'HYPED') {
        addLog('SUCCESS', 'Kinematic jump: High synchronous vertical movement detected.');
        addLog('AI', 'Thermal output rising. Sentiment classified as EUPHORIC.');
    } else if (type === 'BORED') {
        addLog('WARN', 'Kinematic drop: Crowd is entirely stationary. Thermal pooling detected.');
        addLog('AI', 'Sentiment classified as BORED. DJ is losing the crowd.');
    } else if (type === 'AGITATED') {
        addLog('CRIT', 'WARNING: Erratic, non-synchronous lateral micro-movements detected.');
        addLog('AI', 'High thermal spikes localized. Potential mosh pit or crowd crush forming.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setThermalAggregate(37.0);
      setMicroMovementIdx(1.5);
      setSentimentScore(50);
      setCrowdMood('IDLE');
      addLog('SYS', 'Thermal CV & Crowd Psychology ML Model Initialized.');
    } else {
      setSystemActive(false);
      setCrowdMood('IDLE');
      setHeatMap(Array(100).fill(0));
      addLog('WARN', 'Thermal array offline. Returning to subjective human monitoring.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Convert 0-100 to thermal color (Blue -> Purple -> Red -> Yellow -> White)
  const getThermalColor = (val) => {
      if (val < 20) return '#0000ff'; // Blue
      if (val < 40) return '#8a2be2'; // Purple
      if (val < 60) return '#ff0000'; // Red
      if (val < 85) return '#ff8c00'; // Orange/Yellow
      return '#ffffff'; // White hot
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔥</span> Thermal Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Crowd <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500">Sentiment Analysis</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival organizers have no real-time metrics on whether a crowd is actually enjoying a set, bored, or becoming dangerously agitated until after the event is over. Eventra solves this by deploying thermal and infrared cameras across the festival footprint. The system utilizes Machine Learning to analyze the aggregate thermal signatures, micro-movements, and spatial density of the crowd. The dashboard generates a live "Sentiment Heatmap," allowing organizers to see precisely how the crowd is feeling in real-time.
          </p>

          <div className="bg-[#0f0a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🧠</span> Aggregate Psychology AI
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Camera Array' : 'Initialize Thermal Vision'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Sentiment Score */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentScore > 80 ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                 sentimentScore < 30 ? 'bg-blue-950/30 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Sentiment Score
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     sentimentScore > 80 ? 'text-emerald-400' :
                     sentimentScore < 30 ? 'text-blue-400' : 'text-slate-400'
                   }`}>
                     {Math.floor(sentimentScore)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/100</span>
                 </div>
               </div>

               {/* Micro-Movements */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 microMovementIdx > 8.0 && crowdMood === 'AGITATED' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                 systemActive ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Kinematic Index
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     microMovementIdx > 8.0 && crowdMood === 'AGITATED' ? 'text-red-500' :
                     systemActive ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {microMovementIdx.toFixed(1)}
                   </span>
                 </div>
               </div>
               
               {/* Thermal Aggregate */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Avg Body Heat
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {thermalAggregate.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°C</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ML Analysis Log</span>
                 {crowdMood === 'HYPED' && <span className="text-emerald-400 animate-pulse">CROWD EUPHORIC</span>}
                 {crowdMood === 'AGITATED' && <span className="text-red-500 font-black animate-pulse">WARNING: AGITATION</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-blue-400 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
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
            
            {/* Thermal Camera Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-500 ${
                !systemActive ? 'bg-slate-900' : 'bg-black'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">THERMAL CVR-01</span>
                <span className="text-[8px] font-mono text-slate-400">FLIR ACTIVE</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CAMERA OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-30 pointer-events-none"></div>

                      {/* FLIR Heatmap Grid */}
                      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0 z-10 filter blur-[8px] opacity-90 transition-all duration-300">
                          {heatMap.map((val, i) => (
                              <div 
                                  key={i} 
                                  style={{ backgroundColor: getThermalColor(val) }}
                                  className="w-full h-full transition-colors duration-300"
                              ></div>
                          ))}
                      </div>

                      {/* Computer Vision Overlays */}
                      <div className="absolute inset-0 z-30 pointer-events-none">
                          {/* Crosshair */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                          </div>
                          
                          {/* AI Detection Boxes (only when agitated/bored) */}
                          {crowdMood === 'AGITATED' && (
                              <div className="absolute top-1/4 left-1/3 w-24 h-24 border-2 border-red-500 animate-pulse bg-red-500/20 flex items-start p-1">
                                  <span className="text-[6px] font-mono font-black text-red-500 bg-black/80 px-1">ANOMALY</span>
                              </div>
                          )}

                          {crowdMood === 'BORED' && (
                              <div className="absolute bottom-1/4 right-1/4 w-32 h-16 border border-blue-500/50 bg-blue-500/10 flex items-start p-1">
                                  <span className="text-[6px] font-mono text-blue-400 bg-black/80 px-1">LOW ACTIVITY</span>
                              </div>
                          )}
                      </div>

                      {/* HUD Elements */}
                      <div className="absolute bottom-4 left-4 z-40 bg-black/60 px-2 py-1 rounded border border-slate-800">
                          <span className="text-[6px] font-mono text-slate-400 block uppercase">TEMP RANGE</span>
                          <div className="w-24 h-2 rounded mt-1 bg-gradient-to-r from-blue-600 via-red-500 to-white"></div>
                          <div className="flex justify-between w-24 mt-1">
                              <span className="text-[6px] text-slate-500">20°C</span>
                              <span className="text-[6px] text-slate-500">42°C</span>
                          </div>
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* AI Sim Controls */}
            <div className="w-full bg-[#0f0a05] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Crowd Psychology</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerEvent('HYPED')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     crowdMood === 'HYPED' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   🙌 Hyped<br/>(Dancing)
                 </button>

                 <button 
                   onClick={() => triggerEvent('BORED')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     crowdMood === 'BORED' ? 'bg-blue-950/60 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   🥱 Bored<br/>(Still)
                 </button>

                 <button 
                   onClick={() => triggerEvent('AGITATED')}
                   disabled={!systemActive}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     crowdMood === 'AGITATED' ? 'bg-red-950/60 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                     'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   ⚠️ Agitated<br/>(Mosh/Crush)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ThermalSentimentAnalysis;
