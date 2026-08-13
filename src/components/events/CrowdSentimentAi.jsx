/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdSentimentAi = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Emotion Metrics
  const [sentimentIndex, setSentimentIndex] = useState(82); // 0-100
  const [activeFaces, setActiveFaces] = useState(0); 
  const [edgeLatency, setEdgeLatency] = useState(0); // ms
  
  const [emotions, setEmotions] = useState({ joy: 75, boredom: 15, frustration: 10 });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Edge CV Models Deployed to Camera Array.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting high-res crowd feed...' }
  ]);

  // Visualizer State
  const [faces, setFaces] = useState([]);
  const [crowdState, setCrowdState] = useState('ENGAGED'); // ENGAGED, BORED, FRUSTRATED

  // Initialize static face positions
  useEffect(() => {
      const initFaces = Array.from({ length: 24 }).map((_, i) => ({
          id: i,
          x: 5 + Math.random() * 90,
          y: 20 + Math.random() * 70,
          size: 8 + (Math.random() * 12), // Closer faces are bigger
          emotion: 'JOY', // Default
          confidence: 90
      }));
      setFaces(initFaces);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setEdgeLatency(12 + Math.random() * 4); // Edge compute latency
          setActiveFaces(4125 + Math.floor(Math.random() * 150));

          // Simulate crowd emotion shifts
          let targetJoy = 75;
          let targetBoredom = 15;
          let targetFrustration = 10;
          let newIndex = 82;

          if (crowdState === 'BORED') {
              targetJoy = 30; targetBoredom = 60; targetFrustration = 10; newIndex = 45;
          } else if (crowdState === 'FRUSTRATED') {
              targetJoy = 15; targetBoredom = 25; targetFrustration = 60; newIndex = 25;
          }

          setEmotions(prev => ({
              joy: prev.joy + (targetJoy - prev.joy) * 0.1,
              boredom: prev.boredom + (targetBoredom - prev.boredom) * 0.1,
              frustration: prev.frustration + (targetFrustration - prev.frustration) * 0.1
          }));
          
          setSentimentIndex(prev => prev + (newIndex - prev) * 0.1);

          // Update visual faces
          setFaces(prev => prev.map(f => {
              const rand = Math.random() * 100;
              let currentEmotion = 'JOY';
              
              if (rand < emotions.frustration) currentEmotion = 'FRUSTRATION';
              else if (rand < emotions.frustration + emotions.boredom) currentEmotion = 'BOREDOM';
              
              return {
                  ...f,
                  emotion: currentEmotion,
                  confidence: 75 + Math.random() * 24,
                  // Slight bobbing
                  y: f.y + (Math.random() - 0.5) * (crowdState === 'ENGAGED' ? 2 : 0.5)
              };
          }));

      }, 250); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, crowdState, emotions]);

  const triggerEvent = (event) => {
      if (!systemActive) return;
      
      if (event === 'SLOW_SONG') {
          setCrowdState('BORED');
          addLog('WARN', 'CV Analysis: Micro-expressions indicate widespread loss of engagement.');
          addLog('ACTION', 'Suggesting FOH Director increase tempo or deploy pyrotechnics.');
      } else if (event === 'SOUND_FAIL') {
          setCrowdState('FRUSTRATED');
          addLog('CRIT', 'CV Analysis: Massive spike in negative micro-expressions detected.');
          addLog('SYS', 'Alerting stage manager to critical audio routing issue.');
      } else {
          setCrowdState('ENGAGED');
          addLog('SUCCESS', 'CV Analysis: High joy/euphoria index. Crowd is fully engaged.');
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Facial Recognition Engine Active. Anonymizing PII at the edge.');
    } else {
      setSystemActive(false);
      setActiveFaces(0);
      setEdgeLatency(0);
      setSentimentIndex(82);
      setEmotions({ joy: 75, boredom: 15, frustration: 10 });
      setCrowdState('ENGAGED');
      addLog('WARN', 'Emotion AI Offline. Reverting to manual crowd observation.');
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
            <span className="mr-2">🧠</span> Edge Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI Crowd <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">Sentiment Analysis</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Production organizers rarely know if an experimental stage design or a new artist is actually resonating with the crowd until they read post-event Twitter complaints. Eventra solves this by processing high-resolution crowd camera feeds through an edge-deployed computer vision model trained to detect facial micro-expressions. It aggregates this data (anonymously) into a real-time "Crowd Sentiment Index" dashboard, allowing the Front of House (FOH) team to adjust lighting, volume, or artist set times on the fly if the energy drops.
          </p>

          <div className="bg-[#0c0812] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> CV Emotion Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Vision Models' : 'Initialize Edge Cameras'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Sentiment Index */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentIndex < 40 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' :
                 sentimentIndex < 60 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Sentiment Index
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     sentimentIndex < 40 ? 'text-red-400' : 
                     sentimentIndex < 60 ? 'text-orange-400' : 'text-emerald-400'
                   }`}>
                     {sentimentIndex.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">/100</span>
                 </div>
               </div>

               {/* Active Faces */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Faces Tracked (Local)
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {activeFaces.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Joy vs Frustration Bar */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Emotion Matrix
                 </span>
                 <div className="w-full flex h-4 rounded-full overflow-hidden mt-2 border border-slate-700">
                     <div style={{ width: `${emotions.joy}%` }} className="bg-emerald-500 transition-all duration-500"></div>
                     <div style={{ width: `${emotions.boredom}%` }} className="bg-slate-500 transition-all duration-500"></div>
                     <div style={{ width: `${emotions.frustration}%` }} className="bg-red-500 transition-all duration-500"></div>
                 </div>
                 <div className="flex justify-between w-full mt-1 text-[8px] font-bold uppercase text-slate-500">
                     <span className="text-emerald-500">Joy</span>
                     <span className="text-slate-500">Bored</span>
                     <span className="text-red-500">Frust</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030205] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Emotion CV Ledger</span>
                 {systemActive && <span className="text-purple-400 font-black animate-pulse">EDGE LATENCY: {edgeLatency.toFixed(1)}ms</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* Camera Feed Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">STAGE CAM 01 (EDGE CV)</span>
                <span className="text-[8px] font-mono text-slate-400">BOUNDING BOXES</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FEED OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Fake Crowd Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-0"></div>
                        <div className="absolute bottom-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwb2x5Z29uIHBvaW50cz0iMCwxMDAgMTAsODAgMjAsOTAgMzAsNzAgNDAsOTAgNTAsNjAgNjAsODAgNzAsNTAgODAsODAgOTAsNjAgMTAwLDcwIDEwMCwxMDAiIGZpbGw9IiMzYjA3NjQiLz48L3N2Zz4=')] bg-cover opacity-30 z-0"></div>

                        {/* Bounding Boxes for Faces */}
                        {faces.map(f => {
                            let color = '#10b981'; // Green / Joy
                            if (f.emotion === 'BOREDOM') color = '#64748b'; // Gray
                            else if (f.emotion === 'FRUSTRATION') color = '#ef4444'; // Red

                            return (
                                <div 
                                    key={f.id}
                                    className="absolute border-2 transition-all duration-300 flex flex-col justify-end"
                                    style={{
                                        left: `${f.x}%`,
                                        top: `${f.y}%`,
                                        width: `${f.size}%`,
                                        height: `${f.size * 1.5}%`,
                                        borderColor: color,
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(1px)' // Anonymize face underneath
                                    }}
                                >
                                    {/* Confidence / Emotion Tag */}
                                    <div className="absolute -top-4 left-0 right-0 flex justify-between bg-black/80 px-1">
                                        <span className="text-[6px] font-mono font-bold" style={{ color }}>{f.emotion}</span>
                                        <span className="text-[6px] font-mono text-slate-300">{f.confidence.toFixed(0)}%</span>
                                    </div>
                                    
                                    {/* Corner Accents */}
                                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: color }}></div>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: color }}></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: color }}></div>
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: color }}></div>
                                </div>
                            )
                        })}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0c0812] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Event Milestones</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerEvent('BASS_DROP')}
                   disabled={!systemActive || crowdState === 'ENGAGED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdState === 'ENGAGED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   🎉 Massive Drop (Joy)
                 </button>

                 <button 
                   onClick={() => triggerEvent('SLOW_SONG')}
                   disabled={!systemActive || crowdState === 'BORED'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdState === 'BORED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   🥱 Low Energy Set
                 </button>
               </div>
               
               <button 
                 onClick={() => triggerEvent('SOUND_FAIL')}
                 disabled={!systemActive || crowdState === 'FRUSTRATED'}
                 className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                   !systemActive || crowdState === 'FRUSTRATED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                 }`}
               >
                 🔇 Speaker Failure (Frustration)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrowdSentimentAi;
