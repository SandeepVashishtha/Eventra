/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricGaitAnalysis = () => {
  const [analysisActive, setAnalysisActive] = useState(false);
  const [cameraFeed, setCameraFeed] = useState('NOMINAL'); // NOMINAL, ANALYZING, CRITICAL_INTOX
  
  // Pose metrics
  const [stumbleCount, setStumbleCount] = useState(0);
  const [balanceVector, setBalanceVector] = useState(95); // 0-100 (100 is perfect balance)
  const [velocityVariability, setVelocityVariability] = useState(5); // 0-100 (low is steady pace)
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Edge-Compute CCTV network online. 45 nodes active.' },
    { id: 2, time: '23:00:02', type: 'SYS', msg: 'PoseNet / MediaPipe models loaded for gait analysis.' }
  ]);

  useEffect(() => {
    let loop;
    if (analysisActive && cameraFeed === 'NOMINAL') {
      loop = setInterval(() => {
        setBalanceVector(prev => Math.min(100, Math.max(85, prev + (Math.random() * 6 - 3))));
        setVelocityVariability(prev => Math.min(20, Math.max(2, prev + (Math.random() * 4 - 2))));
      }, 1000);
    } else if (cameraFeed === 'ANALYZING') {
      loop = setInterval(() => {
        setBalanceVector(prev => Math.max(30, prev - 8));
        setVelocityVariability(prev => Math.min(85, prev + 12));
        
        if (Math.random() > 0.6) setStumbleCount(prev => prev + 1);
        
        setBalanceVector(prevBal => {
          setVelocityVariability(prevVel => {
            if (prevBal < 40 && prevVel > 70) {
              setCameraFeed('CRITICAL_INTOX');
              addLog('CRIT', 'Severe loss of motor control detected. Heavy intoxication profile matched.');
              
              setTimeout(() => {
                addLog('ACTION', 'Auto-dispatching roaming Medical Team to Node 12 (Main Walkway).');
              }, 1500);
            }
            return prevVel;
          });
          return prevBal;
        });
      }, 800);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [analysisActive, cameraFeed]);

  const triggerIntoxicationEvent = () => {
    if (analysisActive && cameraFeed === 'NOMINAL') {
      setCameraFeed('ANALYZING');
      addLog('WARN', 'Anomalous gait detected at Node 12. Tracking subject ID: 8942.');
      setStumbleCount(1);
    }
  };

  const resetCamera = () => {
    setCameraFeed('NOMINAL');
    setStumbleCount(0);
    setBalanceVector(95);
    setVelocityVariability(5);
    addLog('SYS', 'Medical intercept successful. Subject secured. Resuming nominal crowd scanning.');
  };

  const toggleAnalysis = () => {
    if (!analysisActive) {
      setAnalysisActive(true);
      addLog('SYS', 'AI Gait Analysis enabled. Scanning thoroughfares for public health risks.');
    } else {
      setAnalysisActive(false);
      resetCamera();
      addLog('WARN', 'Pose-estimation offline. Relying on manual security patrols.');
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
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚶</span> Neural Pose Estimation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Gait Analysis <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">for Intoxication Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Severely intoxicated attendees pose a massive danger to themselves and others, but security guards cannot monitor 100,000 people in the dark to intercept them before they collapse or cause an incident. Eventra solves this by processing live security camera footage through an edge-compute pose-estimation neural network (like MediaPipe). The AI continuously analyzes the gait (walking pattern), balance vectors, and stumble frequency of attendees. If it detects the specific motor control failure indicative of heavy intoxication, it instantly pings roaming medical staff with the person's location.
          </p>

          <div className="bg-[#120a0e] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">📷</span> Edge-Compute CCTV Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAnalysis}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     analysisActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {analysisActive ? 'Disable PoseNet' : 'Arm Biometric Scanners'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Balance Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cameraFeed === 'CRITICAL_INTOX' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 cameraFeed === 'ANALYZING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 analysisActive ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Balance Vector</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     cameraFeed === 'CRITICAL_INTOX' ? 'text-red-500' :
                     cameraFeed === 'ANALYZING' ? 'text-yellow-400' :
                     analysisActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {analysisActive ? Math.floor(balanceVector) : '---'}
                   </span>
                   <span className="text-xs font-bold text-slate-600 ml-1 pb-1">/100</span>
                 </div>
               </div>

               {/* Velocity Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cameraFeed === 'CRITICAL_INTOX' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 cameraFeed === 'ANALYZING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 analysisActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">Velocity Variance</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     cameraFeed === 'CRITICAL_INTOX' || cameraFeed === 'ANALYZING' ? 'text-red-400' :
                     analysisActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {analysisActive ? `${Math.floor(velocityVariability)}%` : '---'}
                   </span>
                 </div>
               </div>

               {/* Stumble Count */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 stumbleCount > 2 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 analysisActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Stumble Count</span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     stumbleCount > 0 ? 'text-red-500' :
                     analysisActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {analysisActive ? stumbleCount : '-'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#0a0508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Pose Estimation Log</span>
                 {cameraFeed === 'ANALYZING' && <span className="text-yellow-400 animate-pulse">Tracking Subject...</span>}
                 {cameraFeed === 'CRITICAL_INTOX' && <span className="text-red-500 animate-pulse">Intercept Dispatched</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Camera View Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Security Camera Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[320px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-500 animate-pulse">● REC</span>
                <span className="text-[8px] font-mono text-slate-400">NODE 12 (MAIN WALKWAY)</span>
              </div>

              <div className="flex-1 relative bg-[#0f172a] overflow-hidden flex items-center justify-center grayscale contrast-125 brightness-75">
                
                {/* Night vision camera noise overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20 mix-blend-overlay z-20 pointer-events-none"></div>

                {!analysisActive ? (
                  <div className="z-10 text-center opacity-40">
                    <span className="text-4xl block mb-2">📹</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Feed Offline</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                     {/* Simulated Crowd (Background) */}
                     <div className="absolute inset-0 flex items-center justify-around opacity-30 blur-[2px]">
                       <div className="w-8 h-32 bg-white rounded-full"></div>
                       <div className="w-8 h-32 bg-white rounded-full mt-10"></div>
                       <div className="w-8 h-32 bg-white rounded-full -mt-5"></div>
                     </div>

                     {/* Primary Target (Subject 8942) */}
                     <div className={`absolute top-1/2 left-1/2 w-32 h-64 -mt-32 -ml-16 flex items-center justify-center transition-all duration-500 z-10 ${
                       cameraFeed === 'ANALYZING' ? 'transform rotate-12 translate-x-4' : 
                       cameraFeed === 'CRITICAL_INTOX' ? 'transform rotate-45 translate-x-10 translate-y-10' : ''
                     }`}>
                        
                        {/* PoseNet Skeleton Overlay */}
                        <div className="absolute inset-0">
                          {/* Head */}
                          <div className={`absolute top-[10%] left-1/2 transform -translate-x-1/2 w-10 h-12 border-2 rounded-full ${cameraFeed === 'NOMINAL' ? 'border-emerald-400' : 'border-red-500'} bg-black/50`}></div>
                          
                          {/* Spine */}
                          <div className={`absolute top-[28%] left-1/2 transform -translate-x-1/2 w-0.5 h-[30%] ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          
                          {/* Shoulders */}
                          <div className={`absolute top-[28%] left-1/4 w-[50%] h-0.5 ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          
                          {/* Arms */}
                          <div className={`absolute top-[28%] left-1/4 w-0.5 h-[30%] transform rotate-12 ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          <div className={`absolute top-[28%] right-1/4 w-0.5 h-[30%] transform -rotate-12 ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          
                          {/* Hips */}
                          <div className={`absolute top-[58%] left-1/4 w-[50%] h-0.5 ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          
                          {/* Legs */}
                          <div className={`absolute top-[58%] left-1/4 w-0.5 h-[40%] transform ${cameraFeed === 'CRITICAL_INTOX' ? 'rotate-45' : 'rotate-6'} ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          <div className={`absolute top-[58%] right-1/4 w-0.5 h-[40%] transform ${cameraFeed === 'CRITICAL_INTOX' ? 'rotate-12 translate-x-4' : '-rotate-6'} ${cameraFeed === 'NOMINAL' ? 'bg-emerald-400' : 'bg-red-500'}`}></div>
                          
                          {/* Joints (Dots) */}
                          <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="absolute top-[28%] left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="absolute top-[28%] right-1/4 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="absolute top-[58%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                        </div>

                        {/* Bounding Box & Target ID */}
                        <div className={`absolute inset-0 border-2 ${
                          cameraFeed === 'NOMINAL' ? 'border-emerald-500/50' : 
                          cameraFeed === 'CRITICAL_INTOX' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-yellow-500 border-dashed'
                        }`}>
                          <span className={`absolute -top-5 left-0 text-[8px] font-black font-mono px-1 ${
                            cameraFeed === 'NOMINAL' ? 'bg-emerald-500 text-black' : 
                            cameraFeed === 'CRITICAL_INTOX' ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500 text-black'
                          }`}>
                            SUBJ:8942 {cameraFeed === 'CRITICAL_INTOX' && '| MEDICAL DISPATCHED'}
                          </span>
                        </div>
                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerIntoxicationEvent}
                disabled={!analysisActive || cameraFeed !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !analysisActive || cameraFeed !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Inject Intoxicated Subject
              </button>
              
              <button 
                onClick={resetCamera}
                disabled={cameraFeed === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  cameraFeed === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Medic Intercept (Reset)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiometricGaitAnalysis;
