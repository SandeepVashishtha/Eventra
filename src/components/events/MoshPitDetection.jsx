/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MoshPitDetection = () => {
  const [cvActive, setCvActive] = useState(false);
  const [crowdState, setCrowdState] = useState('NOMINAL'); // NOMINAL, ACTIVE_PIT, CROWD_CRUSH
  
  // Optical Flow Metrics
  const [avgVelocity, setAvgVelocity] = useState(0.8); // m/s
  const [inwardVectorPressure, setInwardVectorPressure] = useState(12); // N/m2 (Simulated)
  const [unrecoveredBodies, setUnrecoveredBodies] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'High-Angle Optical Flow Cameras online.' },
    { id: 2, time: '21:30:02', type: 'SYS', msg: 'Neural Network ingesting velocity vector fields.' }
  ]);

  // Particle simulation state for the visualizer
  const [particles, setParticles] = useState(
    Array.from({ length: 400 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }))
  );

  useEffect(() => {
    let loop;
    
    if (cvActive) {
      if (crowdState === 'NOMINAL') {
        loop = setInterval(() => {
          setAvgVelocity(Math.max(0.2, Math.min(1.5, 0.8 + (Math.random() - 0.5))));
          setInwardVectorPressure(Math.max(5, Math.min(20, 12 + (Math.random() * 4 - 2))));
          setUnrecoveredBodies(0);
          
          // Ambient swaying movement
          setParticles(prev => prev.map(p => ({
            ...p,
            x: Math.max(0, Math.min(100, p.x + p.vx + (Math.random() * 0.4 - 0.2))),
            y: Math.max(0, Math.min(100, p.y + p.vy + (Math.random() * 0.4 - 0.2)))
          })));
        }, 100);
      } else if (crowdState === 'ACTIVE_PIT') {
        loop = setInterval(() => {
          setAvgVelocity(Math.max(2.5, Math.min(4.5, 3.5 + (Math.random() * 1 - 0.5))));
          setInwardVectorPressure(Math.max(30, Math.min(60, 45 + (Math.random() * 10 - 5))));
          setUnrecoveredBodies(Math.floor(Math.random() * 2)); // Occasional trip, but quick recovery
          
          // Circular mosh pit movement in the center
          setParticles(prev => prev.map(p => {
            const dx = 50 - p.x;
            const dy = 50 - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 30) {
              // Circular vector field
              return {
                ...p,
                x: p.x + (dy / dist) * 2 + (Math.random() - 0.5),
                y: p.y - (dx / dist) * 2 + (Math.random() - 0.5)
              };
            }
            return {
              ...p,
              x: Math.max(0, Math.min(100, p.x + (Math.random() * 0.8 - 0.4))),
              y: Math.max(0, Math.min(100, p.y + (Math.random() * 0.8 - 0.4)))
            };
          }));
        }, 100);
      } else if (crowdState === 'CROWD_CRUSH') {
        loop = setInterval(() => {
          setAvgVelocity(Math.max(0.1, Math.min(0.5, 0.2 + (Math.random() * 0.2 - 0.1)))); // Sudden stop in movement
          setInwardVectorPressure(prev => Math.min(180, prev + 15)); // Exponential pressure spike
          
          if (inwardVectorPressure > 120) {
             setUnrecoveredBodies(prev => Math.min(12, prev + 1));
          }

          // Inward collapse (Crush)
          setParticles(prev => prev.map(p => {
            const dx = 50 - p.x;
            const dy = 50 - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 40) {
              // Inward radial vector field (collapsing)
              return {
                ...p,
                x: p.x + (dx / dist) * 0.5,
                y: p.y + (dy / dist) * 0.5
              };
            }
            return p;
          }));
        }, 100);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [cvActive, crowdState, inwardVectorPressure]);

  const triggerMoshPit = () => {
    if (cvActive && crowdState === 'NOMINAL') {
      setCrowdState('ACTIVE_PIT');
      addLog('WARN', 'Circular optical flow detected. Active Mosh Pit formed (Sector B).');
      addLog('AI', 'Monitoring for bodies failing to resurface...');
    }
  };

  const triggerCrowdCrush = () => {
    if (cvActive && crowdState === 'ACTIVE_PIT') {
      setCrowdState('CROWD_CRUSH');
      addLog('CRIT', 'SUDDEN INWARD COLLAPSE DETECTED. MASS VELOCITY DROPPED.');
      addLog('ACTION', 'CRITICAL CROWD CRUSH: Directing automated spotlights to Sector B coordinates.');
    }
  };

  const resetDetection = () => {
    setCrowdState('NOMINAL');
    setInwardVectorPressure(12);
    setUnrecoveredBodies(0);
    // Redistribute particles
    setParticles(
      Array.from({ length: 400 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      }))
    );
    addLog('SUCCESS', 'Crowd tension dissipated. Resuming ambient monitoring.');
  };

  const toggleCV = () => {
    if (!cvActive) {
      setCvActive(true);
      addLog('SYS', 'Optical Flow Crowd Analytics Armed.');
    } else {
      setCvActive(false);
      resetDetection();
      addLog('WARN', 'CV Analytics offline. Relying on manual human spotting.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: CV Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📷</span> Computer Vision Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated High-Speed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Camera Mosh-Pit Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Security personnel on the ground cannot see into the center of a dense crowd to identify when an energetic mosh pit transitions into a deadly crowd crush. Eventra solves this by processing high-angle, high-speed camera feeds through an optical flow neural network. The system tracks the velocity vectors of the entire crowd mass. If it detects a sudden inward collapse (crush) or bodies failing to resurface from a pit, it instantly overlays a critical alert on the command screen and automatically directs DMX spotlights to the exact coordinates to guide medics.
          </p>

          <div className="bg-[#120a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">👁️</span> Optical Flow Vector Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleCV}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     cvActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {cvActive ? 'Disable CV Cameras' : 'Arm Optical Flow Detection'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Average Velocity */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdState === 'CROWD_CRUSH' ? 'bg-slate-900 border-red-500/50 shadow-inner' :
                 crowdState === 'ACTIVE_PIT' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 cvActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Mass Velocity
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdState === 'CROWD_CRUSH' ? 'text-slate-400' :
                     crowdState === 'ACTIVE_PIT' ? 'text-orange-400' :
                     cvActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {cvActive ? avgVelocity.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m/s</span>
                 </div>
               </div>

               {/* Inward Vector Pressure */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdState === 'CROWD_CRUSH' ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                 cvActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Inward Pressure
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdState === 'CROWD_CRUSH' ? 'text-red-400 animate-pulse' :
                     cvActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {cvActive ? Math.floor(inwardVectorPressure) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">N/m²</span>
                 </div>
               </div>
               
               {/* Unrecovered Bodies */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 unrecoveredBodies > 2 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Fallen / Submerged
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     unrecoveredBodies > 2 ? 'text-red-500 animate-bounce' : 'text-slate-600'
                   }`}>
                     {cvActive ? unrecoveredBodies : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Pax</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Vector Analysis Log</span>
                 {crowdState === 'ACTIVE_PIT' && <span className="text-orange-400 animate-pulse">Monitoring Dynamics</span>}
                 {crowdState === 'CROWD_CRUSH' && <span className="text-red-500 animate-pulse">CRITICAL INCIDENT</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
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
            
            {/* Camera Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">HIGH-ANGLE CROWD CAM</span>
                <span className="text-[8px] font-mono text-slate-400">OPTICAL FLOW OVERLAY</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
                
                {/* Simulated Crowd (Particle System) */}
                {cvActive && (
                  <div className="absolute inset-0 z-10">
                    {particles.map((p, i) => {
                      // Determine particle color based on state and location
                      const dx = 50 - p.x;
                      const dy = 50 - p.y;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      
                      let color = 'bg-slate-600'; // Nominal
                      if (crowdState === 'ACTIVE_PIT' && dist < 35) color = 'bg-orange-500';
                      if (crowdState === 'CROWD_CRUSH' && dist < 45) color = 'bg-red-500';

                      return (
                        <div 
                          key={i}
                          className={`absolute w-1.5 h-1.5 rounded-full ${color} transition-colors duration-300`}
                          style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: Math.max(0.2, 1 - (dist / 100)) }}
                        ></div>
                      );
                    })}
                  </div>
                )}
                
                {/* Optical Flow Bounding Box (AI Overlay) */}
                {cvActive && crowdState !== 'NOMINAL' && (
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 border-2 rounded ${
                    crowdState === 'CROWD_CRUSH' ? 'w-48 h-48 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse bg-red-900/20' : 
                    'w-64 h-64 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] bg-orange-900/10'
                  } flex flex-col justify-end p-2 transition-all duration-500`}>
                     <div className={`w-max px-1 py-0.5 text-[6px] font-black text-black uppercase tracking-widest rounded-sm ${
                       crowdState === 'CROWD_CRUSH' ? 'bg-red-500' : 'bg-orange-500'
                     }`}>
                       {crowdState === 'CROWD_CRUSH' ? 'CRUSH DETECTED (SECTOR B)' : 'MOSH PIT (SECTOR B)'}
                     </div>
                  </div>
                )}

                {/* Automated Spotlight Simulation */}
                {crowdState === 'CROWD_CRUSH' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 blur-xl rounded-full z-30 pointer-events-none animate-pulse"></div>
                )}

                {/* HUD Elements */}
                {cvActive && (
                  <>
                    <div className="absolute top-8 left-2 flex flex-col">
                      <span className="text-[6px] font-mono text-cyan-400">FPS: 120</span>
                      <span className="text-[6px] font-mono text-cyan-400">RES: 4K UHD</span>
                    </div>
                    {/* Vector Lines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==')]"></div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-3 gap-2">
              <button 
                onClick={triggerMoshPit}
                disabled={!cvActive || crowdState !== 'NOMINAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !cvActive || crowdState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Mosh Pit
              </button>
              
              <button 
                onClick={triggerCrowdCrush}
                disabled={!cvActive || crowdState !== 'ACTIVE_PIT'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !cvActive || crowdState !== 'ACTIVE_PIT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Crowd Crush
              </button>
              
              <button 
                onClick={resetDetection}
                disabled={!cvActive || crowdState === 'NOMINAL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !cvActive || crowdState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Crowd
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MoshPitDetection;
