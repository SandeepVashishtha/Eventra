/* eslint-disable */
import React, { useState, useEffect } from 'react';

const KinematicPoseEstimation = () => {
  const [cvActive, setCvActive] = useState(false);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const [cvLog, setCvLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Stage CCTV feeds routed to Edge Compute Node.' },
    { id: 2, time: '21:30:05', type: 'SYS', msg: 'YOLOv8 Pose Estimation model loaded. Scanning 240fps.' }
  ]);

  // Skeleton generation for the visualizer
  const [skeletons, setSkeletons] = useState([]);

  useEffect(() => {
    // Generate base skeletons
    const skels = [];
    for (let i = 0; i < 8; i++) {
      skels.push({
        id: i,
        x: 20 + (i * 10) + Math.random() * 5,
        y: 40 + Math.random() * 20,
        state: 'upright', // upright, horizontal, flagged
        animDelay: Math.random() * 2
      });
    }
    setSkeletons(skels);
  }, []);

  useEffect(() => {
    let loop;
    if (cvActive) {
      loop = setInterval(() => {
        // Randomly bounce the skeletons to simulate moshing
        setSkeletons(prev => prev.map(s => {
          if (s.state === 'horizontal' || s.state === 'flagged') return s;
          
          return {
            ...s,
            y: Math.max(30, Math.min(70, s.y + (Math.random() * 10 - 5))),
            x: Math.max(10, Math.min(90, s.x + (Math.random() * 6 - 3)))
          };
        }));
      }, 200);
    }
    return () => clearInterval(loop);
  }, [cvActive]);

  useEffect(() => {
    let tLoop;
    if (incidentDetected && timer < 50) {
      tLoop = setInterval(() => {
        setTimer(prev => {
          const next = prev + 1;
          if (next >= 50) {
            // Trigger alert!
            triggerAlert();
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(tLoop);
  }, [incidentDetected, timer]);

  const simulateFall = () => {
    if (cvActive && !incidentDetected) {
      setIncidentDetected(true);
      setTimer(0);
      
      // Make skeleton #3 fall horizontal
      setSkeletons(prev => prev.map(s => s.id === 3 ? { ...s, state: 'horizontal', y: 80 } : s));
      
      addLog('WARN', 'Kinematic anomaly: Skeleton #3 transitioned to horizontal vector.');
      addLog('SYS', 'Initiating 5.0s recovery countdown protocol.');
    }
  };

  const triggerAlert = () => {
    setSkeletons(prev => prev.map(s => s.id === 3 ? { ...s, state: 'flagged' } : s));
    addLog('CRIT', 'RECOVERY TIMEOUT EXCEEDED. SUBJECT UNCONSCIOUS.');
    setTimeout(() => {
      addLog('ACTION', 'Highlighting coordinate sector [X:42, Y:80] for Medical Extraction Team.');
    }, 500);
  };

  const resetSystem = () => {
    setIncidentDetected(false);
    setTimer(0);
    setSkeletons(prev => prev.map(s => ({ ...s, state: 'upright', y: 40 + Math.random() * 20 })));
    addLog('SYS', 'Medical extraction complete. Returning to baseline telemetry.');
  };

  const toggleEngine = () => {
    if (!cvActive) {
      setCvActive(true);
      addLog('SYS', 'Mosh pit density rising. Engaging skeletal tracking heuristics.');
    } else {
      setCvActive(false);
      resetSystem();
      addLog('SYS', 'Computer Vision processing paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setCvLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Computer Vision AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinematic Pose Estimation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Mosh Pit Safety</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Mosh pits are a core part of heavy metal and punk shows, but human security guards severely struggle to differentiate between aggressive dancing and someone who has been knocked unconscious on the floor in a dark, chaotic pit of thousands of people. Eventra routes stage CCTV into a kinematic pose-estimation AI. It maps the skeletal frames of attendees. If a skeleton goes horizontal and does not rise within 5.0 seconds, it instantly flags the exact coordinate with a red bounding box, dispatching security directly to the injured attendee.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🦴</span> Skeletal Tracking Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={incidentDetected && timer >= 50 ? resetSystem : toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     incidentDetected && timer >= 50 ? 'bg-slate-800 hover:bg-slate-700 text-white' :
                     cvActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(202,138,4,0.4)]'
                   }`}
                 >
                   {incidentDetected && timer >= 50 ? 'Resolve Incident' : cvActive ? 'Pause Processing' : 'Initialize CV Feed'}
                 </button>
                 <button 
                   onClick={simulateFall}
                   disabled={!cvActive || incidentDetected}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !cvActive || incidentDetected ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed' :
                     'bg-red-900/50 hover:bg-red-900 text-red-500 border border-red-500/50'
                   }`}
                 >
                   Simulate Pit Collapse
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Model Latency */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Inference Latency</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-white leading-none">
                     {cvActive ? (Math.random() * 4 + 18).toFixed(1) : '0.0'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">ms</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cvActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                   Processing 240 FPS
                 </div>
               </div>

               {/* Recovery Timer */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 timer >= 50 ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 
                 incidentDetected ? 'bg-yellow-950/30 border-yellow-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Recovery Window</span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className={`text-4xl font-black font-mono leading-none ${
                       timer >= 50 ? 'text-red-500' : incidentDetected ? 'text-yellow-500' : 'text-slate-600'
                     }`}>
                       {(timer / 10).toFixed(1)}
                     </span>
                     <span className="text-sm font-bold text-slate-500 ml-2 pb-1">/ 5.0s</span>
                   </div>
                   
                   <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${timer >= 50 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                       style={{ width: `${(timer / 50) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Kinematic Vectors Log</span>
                 {cvActive && !incidentDetected && <span className="text-emerald-400 animate-pulse">Monitoring...</span>}
                 {timer >= 50 && <span className="text-red-500 animate-pulse">MEDICAL DISPATCHED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {cvLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-red-500 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: CV Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-xl border-8 border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-slate-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Stage CCTV
              </span>
              <span className="text-[10px] font-mono text-yellow-400 flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cvActive ? 'bg-yellow-500 animate-pulse' : 'bg-slate-600'}`}></span>
                YOLOv8_POSE
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-[#050505] overflow-hidden pt-12">
               
               {/* Noise/Grain overlay to simulate CCTV */}
               <div className="absolute inset-0 opacity-10 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] z-10 pointer-events-none"></div>

               {/* Simulated Crowd (dark circles) */}
               <div className="absolute inset-0 z-0 opacity-30">
                 {[...Array(50)].map((_, i) => (
                   <div 
                     key={i} 
                     className="absolute w-8 h-8 rounded-full bg-slate-800"
                     style={{ 
                       left: `${Math.random() * 100}%`, 
                       top: `${Math.random() * 100}%`,
                       transform: `scale(${Math.random() * 0.5 + 0.5})`
                     }}
                   ></div>
                 ))}
               </div>

               {/* Skeletal Renders */}
               <div className="absolute inset-0 z-20">
                 {skeletons.map(skel => (
                   <div 
                     key={skel.id}
                     className="absolute transition-all duration-200"
                     style={{ 
                       left: `${skel.x}%`, 
                       top: `${skel.y}%`,
                       transform: skel.state === 'horizontal' || skel.state === 'flagged' ? 'rotate(90deg)' : 'rotate(0deg)'
                     }}
                   >
                     {/* Bounding Box (Only shows if flagged) */}
                     {skel.state === 'flagged' && (
                       <div className="absolute -inset-6 border-4 border-red-500 bg-red-500/20 animate-pulse flex flex-col justify-between -rotate-90">
                         <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] font-mono px-1 font-bold">
                           ID: {skel.id} | STS: CRITICAL
                         </div>
                       </div>
                     )}

                     {/* The Skeleton Drawing */}
                     <div className={`relative ${!cvActive ? 'opacity-0' : 'opacity-100'}`}>
                       {/* Head */}
                       <div className={`w-4 h-4 rounded-full border-2 absolute -top-4 -left-2 ${skel.state === 'flagged' ? 'border-red-400' : 'border-yellow-400'}`}></div>
                       {/* Spine */}
                       <div className={`w-0.5 h-10 absolute left-0 ${skel.state === 'flagged' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                       {/* Arms */}
                       <div className={`w-12 h-0.5 absolute left-[-24px] top-2 transform ${skel.state === 'upright' ? 'rotate-[-20deg]' : 'rotate-0'} ${skel.state === 'flagged' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                       {/* Legs */}
                       <div className={`w-6 h-0.5 absolute left-[-6px] top-10 transform rotate-45 origin-left ${skel.state === 'flagged' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                       <div className={`w-6 h-0.5 absolute left-[0px] top-10 transform rotate-[-45deg] origin-left ${skel.state === 'flagged' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                       
                       {/* Joints */}
                       <div className={`w-1 h-1 rounded-full absolute -left-[0.5px] top-[0px] ${skel.state === 'flagged' ? 'bg-white' : 'bg-blue-400'}`}></div>
                       <div className={`w-1 h-1 rounded-full absolute -left-[0.5px] top-[40px] ${skel.state === 'flagged' ? 'bg-white' : 'bg-blue-400'}`}></div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Emergency Alert Overlay */}
               {timer >= 50 && (
                 <div className="absolute inset-x-0 top-12 bg-red-600 border-y-4 border-red-800 p-2 text-center z-40 flex items-center justify-center animate-pulse">
                   <span className="text-2xl mr-2">🚨</span>
                   <div>
                     <p className="text-white font-black uppercase tracking-widest text-sm leading-none">MEDICAL EMERGENCY</p>
                     <p className="text-red-200 font-mono text-[9px] uppercase mt-1">Sector 4 - Coordinates X:42, Y:80</p>
                   </div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default KinematicPoseEstimation;
