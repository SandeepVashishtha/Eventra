/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebGpuCrowdSimulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMode, setSimMode] = useState('NORMAL'); // NORMAL, EMERGENCY_EVAC
  
  // GPU Metrics
  const [particlesSimulated, setParticlesSimulated] = useState(0); 
  const [gpuComputeMs, setGpuComputeMs] = useState(0); 
  const [bottleneckWarnings, setBottleneckWarnings] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Requesting WebGPU Adapter...' },
    { id: 2, time: '14:00:02', type: 'SUCCESS', msg: 'Device acquired. Compiling WGSL compute shaders.' }
  ]);

  // Visualizer State
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let loop;
    
    if (isSimulating) {
      // Simulate rendering frames
      loop = setInterval(() => {
          setFrame(prev => prev + 1);
          setGpuComputeMs(1.2 + (Math.random() * 0.8)); // Insanely fast compute time
          
          if (simMode === 'EMERGENCY_EVAC') {
              if (Math.random() > 0.85) {
                  setBottleneckWarnings(prev => prev + 1);
              }
          }
      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [isSimulating, simMode]);

  const toggleSimulation = () => {
      setIsSimulating(!isSimulating);
      if (!isSimulating) {
          setParticlesSimulated(100000);
          addLog('ACTION', `Dispatching Compute Pipeline (x: 1000, y: 100, z: 1)...`);
          addLog('SYS', 'Running Navier-Stokes fluid approximation on crowd particles.');
      } else {
          addLog('WARN', 'Simulation paused. WebGPU context idle.');
          setGpuComputeMs(0);
          setFrame(0);
      }
  };

  const triggerEvac = () => {
      if (!isSimulating) return;
      setSimMode('EMERGENCY_EVAC');
      setBottleneckWarnings(0);
      addLog('CRIT', 'SIMULATING MASS EVACUATION: All particles directed to nearest exits.');
      
      setTimeout(() => {
          addLog('WARN', 'High pressure bottleneck detected at North Gate exit.');
      }, 2000);
  };
  
  const resetSim = () => {
      setSimMode('NORMAL');
      setBottleneckWarnings(0);
      addLog('SYS', 'Simulation reset to normal crowd flow dynamics.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020610] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> High Performance Compute
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            WebGPU Accelerated Fluid <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500">Dynamics Crowd Simulator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Planning evacuation routes and stage capacities currently relies on static math, which cannot accurately predict chaotic fluid crowd behaviors like surges, bottlenecks, and panic compression. Eventra solves this by building a browser-based frontend crowd simulation engine utilizing the new WebGPU API for massive parallel processing. Event organizers can place stages and exits on a 2D map UI. The compute shaders run fluid dynamics algorithms simulating 100,000 independent "particles" (attendees) in real-time, instantly rendering heatmaps of dangerous pressure points.
          </p>

          <div className="bg-[#060c18] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> WebGPU Compute Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSimulation}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isSimulating ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {isSimulating ? 'Pause WGSL Shaders' : 'Run Compute Pipeline'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Particles */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSimulating ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Particles
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     isSimulating ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {(particlesSimulated / 1000).toFixed(0)}k
                   </span>
                 </div>
               </div>

               {/* GPU Compute Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isSimulating ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   GPU Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isSimulating ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {gpuComputeMs.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Bottlenecks */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bottleneckWarnings > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Crush Alerts
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         bottleneckWarnings > 0 ? 'text-red-500' : 'text-slate-600'
                       }`}>
                         {bottleneckWarnings}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010307] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebGPU Context Ledger</span>
                 {isSimulating && <span className="text-cyan-400 font-black animate-pulse">RENDER LOOP ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Simulation Canvas UI */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                isSimulating ? 'bg-[#000]' : 'bg-slate-900'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">FLUID DYNAMICS ENGINE</span>
                <span className={`text-[8px] font-mono ${isSimulating ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isSimulating ? `FRAME ${frame}` : 'OFFLINE'}
                </span>
              </div>

              <div className="flex-1 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDIwaDF2LTFIMHptMC0yaDF2LTFIMHptMC0yaDF2LTFIMHptMC0yaDF2LTFIMHoiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMjAgMGgtMXYxaDF6bS0yIDBoLTF2MWgxbS0yIDBoLTF2MWgxbS0yIDBoLTF2MWgxeiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==')] bg-repeat">
                  
                  {!isSimulating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in-up bg-black/60 backdrop-blur-sm z-30">
                          <span className="text-4xl opacity-50 mb-4 grayscale">🌊</span>
                          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Compute Idle</h3>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-8">Dispatch compute shaders to simulate massive particle physics.</p>
                      </div>
                  ) : (
                      <div className="absolute inset-0 z-20">
                          
                          {/* Map Geometry / Obstacles */}
                          <div className="absolute top-[20%] left-[20%] w-[60%] h-[15%] border-2 border-indigo-900/80 bg-indigo-950/40 rounded flex items-center justify-center">
                              <span className="text-[8px] font-black text-indigo-400 tracking-widest">MAIN STAGE</span>
                          </div>
                          
                          <div className="absolute top-[60%] left-0 w-[40%] h-[5%] border-2 border-slate-700 bg-slate-800/40"></div>
                          <div className="absolute top-[60%] right-0 w-[40%] h-[5%] border-2 border-slate-700 bg-slate-800/40"></div>
                          <span className="absolute top-[56%] left-1/2 -translate-x-1/2 text-[8px] font-bold text-red-500 tracking-widest bg-black/60 px-1 rounded">BOTTLENECK (EXIT GATE)</span>

                          {/* CSS simulated particles via box-shadow hack for performance visualization */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                              
                              {/* Crowd Bulk */}
                              <div className={`absolute top-[35%] left-[20%] w-[60%] h-[20%] bg-blue-500/30 blur-md transition-all duration-1000 ${simMode === 'EMERGENCY_EVAC' ? 'top-[45%]' : ''}`}></div>
                              
                              {/* Normal Flow */}
                              {simMode === 'NORMAL' && (
                                  <div className="absolute top-[35%] left-[20%] w-[60%] h-[25%] flex justify-between opacity-60 mix-blend-screen">
                                      <div className="w-[30%] h-full bg-cyan-400 blur-xl animate-[pulse_2s_ease-in-out_infinite_alternate]"></div>
                                      <div className="w-[30%] h-full bg-cyan-400 blur-xl animate-[pulse_3s_ease-in-out_infinite_alternate]"></div>
                                  </div>
                              )}

                              {/* Emergency Evac / Bottleneck Flow */}
                              {simMode === 'EMERGENCY_EVAC' && (
                                  <>
                                      {/* Flowing towards exit */}
                                      <div className="absolute top-[40%] left-[45%] w-[10%] h-[20%] bg-blue-500 blur-lg opacity-80 mix-blend-screen"></div>
                                      
                                      {/* The Crunch at the bottleneck */}
                                      <div className="absolute top-[55%] left-[40%] w-[20%] h-[15%] flex items-center justify-center z-30">
                                          <div className="absolute inset-0 bg-red-600 blur-xl opacity-90 mix-blend-screen animate-[pulse_0.5s_ease-in-out_infinite_alternate]"></div>
                                          <div className="w-8 h-8 rounded-full bg-white opacity-80 blur-md shadow-[0_0_50px_#ef4444] animate-ping"></div>
                                      </div>
                                      
                                      {/* People squeezing through */}
                                      <div className="absolute top-[65%] left-[45%] w-[10%] h-[30%] bg-emerald-500/50 blur-lg mix-blend-screen"></div>
                                  </>
                              )}

                              {/* Static noise overlay to simulate individual particles */}
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1MDAnIGhlaWdodD0nNTAwJz48ZmlsdGVyIGlkPSduJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC44Jy8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsdGVyPSd1cmwoI24pJyBvcGFjaXR5PScwLjE1Jy8+PC9zdmc+')] mix-blend-overlay opacity-50"></div>
                          </div>
                      </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#060c18] p-4 rounded-xl border border-slate-800 flex space-x-2">
               
               <button 
                   onClick={triggerEvac}
                   disabled={!isSimulating || simMode === 'EMERGENCY_EVAC'}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !isSimulating || simMode === 'EMERGENCY_EVAC' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   Simulate Evacuation
               </button>
               
               <button 
                   onClick={resetSim}
                   disabled={!isSimulating || simMode === 'NORMAL'}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !isSimulating || simMode === 'NORMAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                   }`}
                 >
                   Reset Flow
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebGpuCrowdSimulation;
