/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PersonalizedSetlistRecaps = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [processState, setProcessState] = useState('IDLE'); // IDLE, CORRELATING, GENERATING, DONE
  
  // Cross-referencing Metrics
  const [gpsBreadcrumbs, setGpsBreadcrumbs] = useState(0); 
  const [tracksIdentified, setTracksIdentified] = useState(0); 
  const [confidenceScore, setConfidenceScore] = useState(0); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Post-Festival Spatial Audio Engine Online.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'Awaiting User #892 GPS trace upload.' }
  ]);

  // Visualizer State
  const [progressLine, setProgressLine] = useState(0);
  const [recapData, setRecapData] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (processState === 'IDLE') {
              // Pulse the idle map
          } else if (processState === 'CORRELATING') {
              setGpsBreadcrumbs(prev => Math.min(1420, prev + 85));
              setConfidenceScore(prev => Math.min(96, prev + 5));
          } else if (processState === 'GENERATING') {
              setTracksIdentified(prev => Math.min(42, prev + 2));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, processState]);

  const triggerAnalysis = () => {
    if (!systemActive || processState !== 'IDLE') return;
    
    setProcessState('CORRELATING');
    addLog('ACTION', 'Initiating GPS Breadcrumb vs Pioneer CDJ timestamp correlation.');
    addLog('SYS', 'Analyzing geospatial bounding boxes for Stage A, Stage B, and Food Vendors...');
    
    // Simulate GPS drawing on map
    let progress = 0;
    const pathInterval = setInterval(() => {
        progress += 5;
        setProgressLine(progress);
        
        if (progress >= 100) {
            clearInterval(pathInterval);
            
            setProcessState('GENERATING');
            addLog('AI', 'Spatial correlation complete. Confidence Score: 96.4%.');
            addLog('SYS', 'Querying Spotify API for track metadata...');
            
            setTimeout(() => {
                setProcessState('DONE');
                addLog('SUCCESS', 'Personalized Setlist Recap Generated: 42 Tracks.');
                
                // Populate fake recap
                setRecapData([
                    { id: 1, time: '21:15 PM', location: 'Stage A (Front Row)', song: 'Strobe - Deadmau5', type: 'HEAVY BASS' },
                    { id: 2, time: '22:30 PM', location: 'Food Court (Walking)', song: 'Innerbloom - RÜFÜS DU SOL', type: 'AMBIENT HEARD' },
                    { id: 3, time: '23:45 PM', location: 'Stage B (VIP)', song: 'Losing It - FISHER', type: 'PEAK TIME' }
                ]);
                
            }, 1500);
        }
    }, 100);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setProcessState('IDLE');
      setGpsBreadcrumbs(0);
      setTracksIdentified(0);
      setConfidenceScore(0);
      setProgressLine(0);
      setRecapData([]);
      addLog('SYS', 'Spatial-Audio ML Engine connected to ProDJ Link DB.');
    } else {
      setSystemActive(false);
      setProcessState('IDLE');
      setGpsBreadcrumbs(0);
      setTracksIdentified(0);
      setConfidenceScore(0);
      setProgressLine(0);
      setRecapData([]);
      addLog('WARN', 'Engine Offline. Manual track ID required.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070908] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-green-900/40 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Spatial Data Cross-referencing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Generated Personalized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Setlist Recaps</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            After a festival, attendees frantically search Reddit and YouTube trying to identify a specific unknown song they heard while walking between stages. Eventra solves this by utilizing the user's mobile GPS breadcrumb trail and the live Pioneer CDJ telemetry. After the festival, Eventra's AI algorithm generates a personalized, chronological "Setlist Recap," telling the user exactly which songs they physically heard while standing at Stage A versus walking past the food vendors, complete with direct Spotify export links.
          </p>

          <div className="bg-[#0b120f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-green-500 text-lg mr-2">📍</span> User Trace Analysis: #892
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Reset Engine' : 'Connect to Spotify API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* GPS Points */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 processState === 'CORRELATING' ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   GPS Trace Points
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     processState === 'CORRELATING' ? 'text-blue-400' :
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {Math.floor(gpsBreadcrumbs)}
                   </span>
                 </div>
               </div>

               {/* Confidence */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 processState === 'DONE' ? 'bg-emerald-950/30 border-emerald-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Geo-Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     processState === 'DONE' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(confidenceScore)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Tracks Identified */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 processState === 'GENERATING' || processState === 'DONE' ? 'bg-green-950/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Tracks Matched
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     processState === 'GENERATING' || processState === 'DONE' ? 'text-green-400' : 'text-slate-600'
                   }`}>
                     {tracksIdentified}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010402] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>ML Correlation Log</span>
                 {processState === 'CORRELATING' && <span className="text-blue-400 animate-pulse">ANALYZING GPS PATH...</span>}
                 {processState === 'GENERATING' && <span className="text-green-400 animate-pulse">QUERYING SPOTIFY API...</span>}
                 {processState === 'DONE' && <span className="text-emerald-400 font-black">RECAP GENERATED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-green-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' :
                       log.type === 'AI' ? 'text-emerald-400 font-bold' : 'text-slate-400'
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
            
            {/* Geo-Spatial Visualizer / App UI Mockup */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0b0c10]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-green-400">EVENTRA MOBILE APP</span>
                <span className="text-[8px] font-mono text-slate-400">POST-FESTIVAL</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-12">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">DATA UNAVAILABLE</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col">
                      
                      {/* Map Correlation View (Only visible during processing) */}
                      {processState !== 'DONE' && (
                          <div className="absolute inset-0 flex flex-col z-30 bg-[#0b0c10] p-4">
                              <span className="text-[10px] text-slate-500 font-bold tracking-widest mb-2">SPATIAL CROSS-REFERENCE</span>
                              
                              <div className="flex-1 border border-slate-700 rounded-lg relative overflow-hidden bg-slate-900">
                                  {/* Fake Map Grid */}
                                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                  
                                  {/* Geofences */}
                                  <div className="absolute top-4 left-4 w-16 h-16 border border-blue-500/50 bg-blue-500/10 rounded flex items-center justify-center">
                                      <span className="text-[6px] font-bold text-blue-400">STAGE A</span>
                                  </div>
                                  <div className="absolute bottom-4 right-4 w-20 h-16 border border-purple-500/50 bg-purple-500/10 rounded flex items-center justify-center">
                                      <span className="text-[6px] font-bold text-purple-400">STAGE B</span>
                                  </div>
                                  <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-orange-500/50 bg-orange-500/10 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                                      <span className="text-[6px] font-bold text-orange-400">FOOD</span>
                                  </div>

                                  {/* GPS Path Drawing */}
                                  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                                      <defs>
                                          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" stopColor="#3b82f6" />
                                              <stop offset="50%" stopColor="#f97316" />
                                              <stop offset="100%" stopColor="#a855f7" />
                                          </linearGradient>
                                      </defs>
                                      
                                      {/* Background faint path */}
                                      <path d="M 15% 15% Q 30% 80% 50% 50% T 85% 85%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                                      
                                      {/* Animated trace line */}
                                      {processState !== 'IDLE' && (
                                          <path 
                                              d="M 15% 15% Q 30% 80% 50% 50% T 85% 85%" 
                                              stroke="url(#pathGradient)" 
                                              strokeWidth="3" 
                                              fill="none"
                                              strokeDasharray="400"
                                              strokeDashoffset={400 - (400 * (progressLine / 100))}
                                              className="transition-all duration-75"
                                          />
                                      )}
                                  </svg>

                                  {/* Pulse rings at current trace location */}
                                  {processState === 'CORRELATING' && (
                                      <div 
                                          className="absolute w-4 h-4 bg-white/80 rounded-full shadow-[0_0_10px_white] z-10"
                                          style={{
                                              // Very crude path approximation for the dot
                                              left: `${15 + (progressLine * 0.7)}%`,
                                              top: `${15 + (progressLine * 0.7)}%`,
                                              transform: 'translate(-50%, -50%)'
                                          }}
                                      >
                                          <div className="absolute inset-0 border-2 border-white rounded-full animate-ping"></div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* Final Generated Recap UI */}
                      {processState === 'DONE' && (
                          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e22] to-[#080808] z-40 p-4 flex flex-col animate-fade-in-up">
                              
                              <div className="text-center mb-4">
                                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">
                                      <span className="text-3xl text-black">🎵</span>
                                  </div>
                                  <h2 className="text-lg font-black text-white">Your Setlist Recap</h2>
                                  <p className="text-[10px] text-slate-400">Based on your GPS location & Stage Telemetry</p>
                              </div>

                              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                  {recapData.map((item, idx) => (
                                      <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center animate-fade-in-up" style={{animationDelay: `${idx * 150}ms`}}>
                                          <div className="w-10 h-10 bg-black/50 rounded flex-shrink-0 flex items-center justify-center text-xs mr-3 border border-white/5">
                                              💿
                                          </div>
                                          <div className="flex-1 overflow-hidden">
                                              <h4 className="text-[12px] font-bold text-white truncate">{item.song}</h4>
                                              <div className="flex justify-between items-center mt-0.5">
                                                  <span className="text-[9px] text-green-400 font-mono block truncate">{item.location}</span>
                                                  <span className="text-[8px] text-slate-500 ml-2 whitespace-nowrap">{item.time}</span>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              <button className="w-full mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-xs py-3 rounded-full uppercase tracking-widest transition shadow-[0_4px_14px_0_rgba(29,185,84,0.39)]">
                                  Export to Spotify
                              </button>
                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* AI Control Button */}
            <div className="w-full bg-[#0b120f] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Post-Festival Processing</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={triggerAnalysis}
                   disabled={!systemActive || processState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || processState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-green-950/40 border-green-600 text-green-400 hover:bg-green-900/60 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                   }`}
                 >
                   Generate Personalized Setlist via GPS
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PersonalizedSetlistRecaps;
