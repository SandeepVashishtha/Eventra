/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdCrushAI = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [crowdState, setCrowdState] = useState('SAFE'); // SAFE, SURGE, CRUSH_PREDICTED
  
  // AI/LiDAR Metrics
  const [spatialDensity, setSpatialDensity] = useState(2.1); // people per sq meter
  const [vectorVelocity, setVectorVelocity] = useState(0.4); // m/s movement speed
  const [crushProbability, setCrushProbability] = useState(2); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:15:00', type: 'SYS', msg: 'LiDAR & Computer Vision Array Online.' },
    { id: 2, time: '22:15:02', type: 'SYS', msg: 'Fluid dynamics model initialized. Monitoring crowd vectors.' }
  ]);

  // Visualizer State
  const [particles, setParticles] = useState([]);
  const [interventionsDeployed, setInterventionsDeployed] = useState(false);

  // Initialize Particles
  useEffect(() => {
      const initialParticles = Array.from({length: 150}).map((_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: '#10b981' // Safe green
      }));
      setParticles(initialParticles);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          if (crowdState === 'SAFE') {
              setSpatialDensity(prev => Math.max(1.5, prev - 0.1));
              setVectorVelocity(0.4 + Math.random() * 0.2);
              setCrushProbability(Math.max(1, crushProbability - 1));
              setInterventionsDeployed(false);
              
              // Particles drift randomly
              setParticles(prev => prev.map(p => ({
                  ...p,
                  x: Math.max(0, Math.min(100, p.x + p.vx)),
                  y: Math.max(0, Math.min(100, p.y + p.vy)),
                  vx: (Math.random() - 0.5) * 0.5,
                  vy: (Math.random() - 0.5) * 0.5,
                  color: '#10b981'
              })));
              
          } else if (crowdState === 'SURGE') {
              setSpatialDensity(prev => Math.min(4.8, prev + 0.2));
              setVectorVelocity(1.8 + Math.random() * 0.5); // Fast, unified movement
              setCrushProbability(prev => Math.min(65, prev + 5));
              
              // Particles rush towards the center (stage)
              setParticles(prev => prev.map(p => {
                  const dx = 50 - p.x;
                  const dy = 20 - p.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  return {
                      ...p,
                      x: p.x + (dx/dist) * 1.5 + (Math.random()-0.5),
                      y: p.y + (dy/dist) * 1.5 + (Math.random()-0.5),
                      color: '#f59e0b' // Warning orange
                  };
              }));
              
          } else if (crowdState === 'CRUSH_PREDICTED') {
              setSpatialDensity(prev => Math.min(7.5, prev + 0.4)); // Extremely dense
              setVectorVelocity(0.1 + Math.random() * 0.1); // Stuck, cannot move
              setCrushProbability(prev => Math.min(99, prev + 8));
              
              if (!interventionsDeployed && crushProbability > 85) {
                  setInterventionsDeployed(true);
                  addLog('CRIT', 'AUTOMATED INTERVENTION: Throttling DJ BPM and triggering PA safety announcements.');
              }
              
              // Particles clumped tightly, barely moving, red
              setParticles(prev => prev.map(p => {
                  const dx = 50 - p.x;
                  const dy = 20 - p.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  return {
                      ...p,
                      x: dist > 15 ? p.x + (dx/dist) * 2 : p.x + (Math.random()-0.5)*0.5,
                      y: dist > 15 ? p.y + (dy/dist) * 2 : p.y + (Math.random()-0.5)*0.5,
                      color: '#ef4444' // Danger red
                  };
              }));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, crowdState, crushProbability, interventionsDeployed]);

  const triggerEvent = (type) => {
    if (!systemActive) return;
    
    setCrowdState(type);
    
    if (type === 'SURGE') {
        addLog('WARN', 'AI DETECTED: Sudden fluid dynamic surge toward Stage Left choke point.');
        addLog('ACTION', 'Calculating vector velocity. Preparing predictive model.');
    } else if (type === 'CRUSH_PREDICTED') {
        addLog('CRIT', 'PREDICTION: Crowd crush imminent in T-Minus 4m:30s.');
        addLog('ACTION', 'Spatial density exceeding 6 people/sqm. Vector velocity halted.');
    } else if (type === 'SAFE') {
        addLog('SUCCESS', 'Crowd density returned to nominal limits. Interventions standing down.');
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setCrowdState('SAFE');
      addLog('SYS', 'Predictive AI Engaged. LiDAR analyzing 1.2M points per second.');
    } else {
      setSystemActive(false);
      setCrowdState('SAFE');
      setInterventionsDeployed(false);
      setSpatialDensity(0);
      setVectorVelocity(0);
      setCrushProbability(0);
      addLog('WARN', 'Predictive AI Offline. Relying on manual human observation.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> LiDAR Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Predictive Crowd <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500">Crush Prevention</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Tragic crowd crushes occur when sudden surges in density happen faster than human security teams can identify and respond to them. Eventra solves this by deploying a predictive AI system utilizing LiDAR and overhead computer vision. Eventra analyzes fluid dynamic patterns in the crowd, calculating vector velocity and spatial density in real-time. If the AI predicts a dangerous crowd crush condition forming 5 minutes before it happens, it automatically triggers localized PA announcements, throttles the music BPM, and dispatches security to specific choke points.
          </p>

          <div className="bg-[#020a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Fluid Dynamics Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disengage AI' : 'Initialize Predictive Model'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Spatial Density */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 spatialDensity > 6 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 spatialDensity > 4 ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Spatial Density
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     spatialDensity > 6 ? 'text-red-400' : 
                     spatialDensity > 4 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {spatialDensity.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ppl/m²</span>
                 </div>
               </div>

               {/* Vector Velocity */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 vectorVelocity > 1.5 ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Vector Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     vectorVelocity > 1.5 ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {vectorVelocity.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m/s</span>
                 </div>
               </div>
               
               {/* Crush Probability */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crushProbability > 80 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                 crushProbability > 50 ? 'bg-orange-950/40 border-orange-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Crush Probability
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crushProbability > 80 ? 'text-red-500' :
                     crushProbability > 50 ? 'text-orange-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(crushProbability)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010303] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Machine Learning Ledger</span>
                 {interventionsDeployed && <span className="text-red-500 font-black animate-pulse">AUTO-INTERVENTIONS ACTIVE</span>}
                 {!interventionsDeployed && crowdState === 'CRUSH_PREDICTED' && <span className="text-red-400 font-black animate-pulse">CRITICAL DENSITY DETECTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* LiDAR Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#000]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">LiDAR POINT CLOUD</span>
                <span className="text-[8px] font-mono text-slate-400">TOP-DOWN ORTHOGRAPHIC</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                
                {!systemActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS UNPOWERED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Grid Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                      {/* Main Stage (Choke point) */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-900/80 border-b-2 border-slate-700 rounded-b-xl flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Main Stage</span>
                          
                          {/* PA Intervention Flasher */}
                          {interventionsDeployed && (
                              <div className="absolute inset-0 bg-red-500/20 rounded-b-xl animate-pulse flex items-center justify-center">
                                  <span className="text-[6px] font-black text-red-500 absolute bottom-1">PA: PLEASE STEP BACK</span>
                              </div>
                          )}
                      </div>

                      {/* AI Bounding Box / Danger Zone */}
                      <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 border-2 rounded transition-colors duration-500 ${
                          crowdState === 'CRUSH_PREDICTED' ? 'border-red-500/50 bg-red-900/10' :
                          crowdState === 'SURGE' ? 'border-orange-500/30' : 'border-teal-500/10'
                      }`}>
                          <span className={`absolute -top-4 left-0 text-[6px] font-black tracking-widest uppercase ${
                              crowdState === 'CRUSH_PREDICTED' ? 'text-red-500' : 'text-teal-500/50'
                          }`}>ZONE ALPHA</span>
                      </div>

                      {/* Particle Swarm (Crowd) */}
                      <div className="absolute inset-0 z-30">
                          {particles.map(p => (
                              <div 
                                  key={p.id}
                                  className="absolute w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] transition-colors duration-300"
                                  style={{ 
                                      left: `${p.x}%`, 
                                      top: `${p.y}%`,
                                      backgroundColor: p.color,
                                      color: p.color,
                                      transform: 'translate(-50%, -50%)'
                                  }}
                              ></div>
                          ))}
                      </div>
                      
                      {/* Vector Arrows Simulation (Visible during surge) */}
                      {crowdState === 'SURGE' && (
                          <div className="absolute inset-0 z-40 pointer-events-none opacity-50 flex items-center justify-center">
                              <svg width="100%" height="100%">
                                  <defs>
                                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                                      </marker>
                                  </defs>
                                  <path d="M 20% 80% L 40% 40%" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="animate-pulse" />
                                  <path d="M 80% 80% L 60% 40%" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="animate-pulse" />
                                  <path d="M 50% 90% L 50% 50%" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrow)" className="animate-pulse" />
                              </svg>
                          </div>
                      )}

                  </div>
                )}

              </div>
            </div>

            {/* AI Simulation Controls */}
            <div className="w-full bg-[#020a0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject LiDAR Test Data</span>
               
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => triggerEvent('SAFE')}
                   disabled={!systemActive || crowdState === 'SAFE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdState === 'SAFE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-teal-950/40 border-teal-600 text-teal-400 hover:bg-teal-900/60 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                   }`}
                 >
                   Safe<br/>(Nominal)
                 </button>

                 <button 
                   onClick={() => triggerEvent('SURGE')}
                   disabled={!systemActive || crowdState === 'SURGE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdState === 'SURGE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                   }`}
                 >
                   Surge<br/>(High Velocity)
                 </button>

                 <button 
                   onClick={() => triggerEvent('CRUSH_PREDICTED')}
                   disabled={!systemActive || crowdState === 'CRUSH_PREDICTED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || crowdState === 'CRUSH_PREDICTED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                   }`}
                 >
                   Crush<br/>(Dense/Stuck)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrowdCrushAI;
