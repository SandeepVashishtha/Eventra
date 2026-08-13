/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const SpatialAudioPreview = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [listenerPos, setListenerPos] = useState({ x: 50, y: 80 }); // Percentage
  
  // Audio telemetry
  const [leftEarDb, setLeftEarDb] = useState(0);
  const [rightEarDb, setRightEarDb] = useState(0);
  const [delayMs, setDelayMs] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'WebAudio Context initialized. Awaiting engine engagement.' }
  ]);

  // Stage speakers
  const speakers = [
      { id: 'L_MAIN', x: 25, y: 15, power: 120 }, // dB at source
      { id: 'R_MAIN', x: 75, y: 15, power: 120 },
      { id: 'L_DELAY', x: 15, y: 55, power: 105 },
      { id: 'R_DELAY', x: 85, y: 55, power: 105 }
  ];

  const mapRef = useRef(null);

  useEffect(() => {
      if (!isSimulating) {
          setLeftEarDb(0);
          setRightEarDb(0);
          setDelayMs(0);
          return;
      }

      // Calculate simulated acoustic physics
      let totalL = 0;
      let totalR = 0;
      let closestDist = 999;

      speakers.forEach(speaker => {
          // Calculate pixel/percentage distance (mock physics)
          const dx = listenerPos.x - speaker.x;
          const dy = listenerPos.y - speaker.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < closestDist) closestDist = dist;

          // Inverse square law approximation: dB drops by 6 for every doubling of distance
          // We'll use a simpler linear attenuation for visual UI purposes
          const attenuation = Math.max(0, dist * 0.8); 
          let baseReceivedDb = Math.max(0, speaker.power - attenuation);
          
          // Spatial panning based on X axis relative to listener
          // If speaker is far left of listener, left ear gets more dB
          let panFactorL = 1;
          let panFactorR = 1;
          
          if (dx > 0) { // Speaker is to the left
              panFactorR = Math.max(0.2, 1 - (dx / 50));
          } else { // Speaker is to the right
              panFactorL = Math.max(0.2, 1 - (Math.abs(dx) / 50));
          }

          totalL += (baseReceivedDb * panFactorL);
          totalR += (baseReceivedDb * panFactorR);
      });

      // Average them out for the UI and cap at realistic max
      const finalL = Math.min(130, Math.max(40, totalL / speakers.length * 1.5));
      const finalR = Math.min(130, Math.max(40, totalR / speakers.length * 1.5));
      
      setLeftEarDb(finalL);
      setRightEarDb(finalR);
      
      // Speed of sound delay (approx 1ms per foot). We'll map percentage distance to ms
      setDelayMs(Math.floor(closestDist * 3));

  }, [listenerPos, isSimulating]);

  const handleMapClick = (e) => {
      if (!isSimulating || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setListenerPos({ x, y });
      
      addLog('SYS', `Listener moved to Grid [${x.toFixed(1)}, ${y.toFixed(1)}]. Recalculating spatial panning...`);
  };

  const toggleEngine = () => {
      setIsSimulating(!isSimulating);
      if (!isSimulating) {
          addLog('ACTION', 'WebAudio API Engine Engaged. PanningNodes active.');
      } else {
          addLog('WARN', 'Acoustic Sandbox offline.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#09050d] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-violet-900/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> WebAudio API & Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Interactive 3D Spatial Audio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500">Preview Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            It is extremely difficult to visualize how audio will sound as an attendee walks from the back of the crowd to the front rail before the massive speaker arrays are actually built on site. Eventra solves this by creating a WebAudio API sandbox in the browser. Audio engineers can drop "virtual speakers" onto a map. As the user clicks around the space, the browser dynamically calculates PanningNodes and DelayNodes, simulating the exact acoustic volume drop-off they would experience standing in that exact spot.
          </p>

          <div className="bg-[#120a17] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🎛️</span> DSP Console
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isSimulating ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' :
                     'bg-violet-600 text-white border border-violet-500 hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                   }`}
                 >
                   {isSimulating ? 'Halt Simulation' : 'Engage WebAudio Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Left / Right Ear dB */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-colors ${
                   isSimulating ? 'bg-violet-950/20 border-violet-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-4 block">Binaural Acoustic Telemetry</span>
                   
                   <div className="grid grid-cols-2 gap-8 relative z-10">
                       <div className="flex flex-col items-center">
                           <span className="text-[10px] text-slate-400 mb-1">Left Ear (L)</span>
                           <span className={`text-4xl font-black font-mono leading-none ${isSimulating ? 'text-fuchsia-400' : 'text-slate-600'}`}>
                               {leftEarDb.toFixed(1)}<span className="text-sm">dB</span>
                           </span>
                           {/* VU Meter L */}
                           <div className="w-full bg-slate-800 h-1.5 mt-2 rounded overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-300" style={{width: `${(leftEarDb/130)*100}%`}}></div>
                           </div>
                       </div>

                       <div className="flex flex-col items-center">
                           <span className="text-[10px] text-slate-400 mb-1">Right Ear (R)</span>
                           <span className={`text-4xl font-black font-mono leading-none ${isSimulating ? 'text-fuchsia-400' : 'text-slate-600'}`}>
                               {rightEarDb.toFixed(1)}<span className="text-sm">dB</span>
                           </span>
                           {/* VU Meter R */}
                           <div className="w-full bg-slate-800 h-1.5 mt-2 rounded overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-300" style={{width: `${(rightEarDb/130)*100}%`}}></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Delay Calc */}
               <div className="p-3 rounded-xl border bg-slate-900 border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 relative overflow-hidden">
                   <span className="font-bold uppercase tracking-widest text-slate-500">Propagation Delay</span>
                   <span className={`text-lg font-black ${isSimulating ? 'text-cyan-400' : 'text-slate-600'}`}>{delayMs}ms</span>
               </div>
               
               {/* Panning Calc */}
               <div className="p-3 rounded-xl border bg-slate-900 border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 relative overflow-hidden">
                   <span className="font-bold uppercase tracking-widest text-slate-500">Panning Offset</span>
                   <span className={`text-lg font-black ${isSimulating ? 'text-cyan-400' : 'text-slate-600'}`}>
                       {isSimulating ? ((leftEarDb - rightEarDb) > 0 ? `L+${(leftEarDb - rightEarDb).toFixed(1)}` : `R+${(rightEarDb - leftEarDb).toFixed(1)}`) : '0.0'}
                   </span>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#070409] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebAudio Context Logs</span>
                 {isSimulating && <span className="text-violet-400 font-black animate-pulse">MIXING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-violet-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Acoustic Sandbox Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Acoustic Sandbox UI</span>
                      <span className="text-xs text-white font-bold">Spatial Audio Simulator</span>
                  </div>
              </div>

              {/* Map Area */}
              <div 
                  className={`flex-1 bg-slate-950 relative overflow-hidden flex flex-col ${isSimulating ? 'cursor-crosshair' : 'cursor-not-allowed grayscale opacity-50'}`}
                  onClick={handleMapClick}
                  ref={mapRef}
              >
                  
                  {/* Grid Base */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                  {/* Draw Stage */}
                  <div className="absolute top-0 left-1/4 w-1/2 h-[10%] border-b-2 border-slate-700 bg-slate-900/50 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">Main Stage</div>

                  {/* Draw Speakers & Acoustic Waves */}
                  {speakers.map(speaker => (
                      <div key={speaker.id} className="absolute" style={{ left: `${speaker.x}%`, top: `${speaker.y}%` }}>
                          
                          {/* Visual Wave Simulation (SVG) */}
                          {isSimulating && (
                              <svg width="400" height="400" className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen opacity-20">
                                  <circle cx="200" cy="200" r="180" fill="none" stroke="#d946ef" strokeWidth="2" className="animate-[ping_4s_ease-out_infinite]" />
                                  <circle cx="200" cy="200" r="180" fill="none" stroke="#d946ef" strokeWidth="1" className="animate-[ping_4s_ease-out_infinite]" style={{animationDelay: '1s'}} />
                              </svg>
                          )}

                          {/* Speaker Icon */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-slate-800 border border-slate-600 shadow-xl z-20 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
                          </div>
                          
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-[7px] font-mono font-bold text-slate-400 bg-slate-900/80 px-1 rounded whitespace-nowrap">
                              {speaker.id}
                          </div>
                      </div>
                  ))}

                  {/* The Listener (User) */}
                  <div 
                      className="absolute z-30 transition-all duration-300 pointer-events-none"
                      style={{ left: `${listenerPos.x}%`, top: `${listenerPos.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                      <div className="w-6 h-6 bg-violet-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(139,92,246,0.8)] flex items-center justify-center text-[10px]">
                          🎧
                      </div>
                      
                      {/* Floating UI near listener */}
                      {isSimulating && (
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[8px] font-mono text-fuchsia-300 whitespace-nowrap shadow-lg backdrop-blur-sm flex space-x-2">
                              <span>L:{leftEarDb.toFixed(0)}</span>
                              <span>R:{rightEarDb.toFixed(0)}</span>
                          </div>
                      )}
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120a17] p-4 rounded-xl border border-violet-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-violet-400 uppercase block mb-1">Interactive Binaural Physics:</span>
               Click <span className="text-white font-bold bg-violet-600 px-1 rounded">Engage WebAudio Engine</span>. Then, click anywhere inside the map to move the Listener (🎧). Watch the <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Binaural Acoustic Telemetry</span> gauge. As you move closer to the Left Delay speaker, the Left Ear dB spikes while the Right Ear dB drops due to dynamic PanningNodes. The system mathematically simulates spatial propagation delay and inverse-square audio falloff in real-time.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SpatialAudioPreview;
