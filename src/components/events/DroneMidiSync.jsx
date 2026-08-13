/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneMidiSync = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // MIDI Metrics
  const [bpm, setBpm] = useState(128);
  const [filterCutoff, setFilterCutoff] = useState(50); // 0-100%
  const [formation, setFormation] = useState('SPHERE'); 
  
  // Swarm Metrics
  const [activeDrones, setActiveDrones] = useState(0); 
  const [midiLatency, setMidiLatency] = useState(0); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'Swarm Robotics Server Online.' },
    { id: 2, time: '23:30:02', type: 'SYS', msg: 'Awaiting Pioneer CDJ MIDI handshake...' }
  ]);

  // Visualizer State (Drones)
  const [drones, setDrones] = useState([]);
  
  // Generate initial drone positions
  useEffect(() => {
      const initDrones = Array.from({ length: 40 }).map((_, i) => ({
          id: i,
          x: 50,
          y: 50,
          color: '#3b82f6' // Blue
      }));
      setDrones(initDrones);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          setMidiLatency(2 + Math.random() * 3); // Ultra low latency for MIDI

          // Calculate drone positions based on formation and filter cutoff
          const radius = 20 + (filterCutoff / 2); // Filter expands/contracts formation
          const speed = (bpm / 60) * 0.05; // BPM controls rotation speed
          const time = Date.now() * speed;
          
          let color = '#3b82f6'; // Default Blue
          if (filterCutoff > 80) color = '#ef4444'; // Red for high pass
          else if (filterCutoff < 20) color = '#8b5cf6'; // Purple for low pass

          setDrones(prev => prev.map((d, i) => {
              let nx = 50;
              let ny = 50;
              
              if (formation === 'SPHERE') {
                  const angle = (i / prev.length) * Math.PI * 2 + time;
                  nx = 50 + Math.cos(angle) * radius;
                  ny = 50 + Math.sin(angle) * (radius * 0.5); // Ellipse to fake 3D
              } else if (formation === 'WAVE') {
                  const spacing = 80 / prev.length;
                  nx = 10 + (i * spacing);
                  ny = 50 + Math.sin((i * 0.5) + (time * 5)) * (radius * 0.5);
              } else if (formation === 'BURST') {
                  // Explode outwards
                  const angle = (i / prev.length) * Math.PI * 2;
                  const pulse = Math.sin(time * 10) * 10;
                  nx = 50 + Math.cos(angle) * (radius + pulse);
                  ny = 50 + Math.sin(angle) * (radius + pulse);
              }

              return { ...d, x: nx, y: ny, color };
          }));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, bpm, filterCutoff, formation]);

  const triggerMidiEvent = (type) => {
      if (!systemActive) return;
      
      if (type === 'BPM_UP') {
          setBpm(174); // Drum and Bass
          setFormation('WAVE');
          addLog('ACTION', 'MIDI CC: BPM Shift -> 174. Swarm executing WAVE formation.');
      } else if (type === 'FILTER_PEAK') {
          setFilterCutoff(95);
          setFormation('SPHERE');
          addLog('WARN', 'MIDI CC: High-Pass Filter Peak. Expanding swarm radius (Red).');
      } else if (type === 'BASS_DROP') {
          setFilterCutoff(50);
          setBpm(128); // House
          setFormation('BURST');
          addLog('CRIT', 'MIDI NOTE: BASS DROP! Executing BURST pattern strobe.');
          
          setTimeout(() => {
              if (systemActive) setFormation('SPHERE');
          }, 2000);
      }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setActiveDrones(850);
      setBpm(128);
      setFilterCutoff(50);
      setFormation('SPHERE');
      addLog('SYS', 'MIDI Handshake established. 850 UAVs synced to DJ Pioneer mixer.');
    } else {
      setSystemActive(false);
      setActiveDrones(0);
      setMidiLatency(0);
      addLog('WARN', 'MIDI Link Severed. Drones returning to static timecode pattern.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#08020a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛸</span> Swarm Robotics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Live DJ MIDI to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500">Drone Swarm Sync</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional drone light shows are pre-programmed and static, meaning they cannot react dynamically to a live DJ who is improvising or changing their setlist on the fly. Eventra solves this by creating a direct, ultra-low latency bridge between the DJ's Pioneer CDJ/MIDI output and the drone swarm control server. As the DJ manipulates tracks, filters, and BPM, the backend interprets these MIDI signals in real-time and translates them into swarm flight maneuvers, color shifts, and formations, making the sky a direct visual extension of the live music.
          </p>

          <div className="bg-[#100512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Pioneer MIDI Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Sever DJ Link' : 'Sync CDJ to Swarm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* BPM */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-pink-950/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Master BPM
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-pink-400' : 'text-slate-600'
                   }`}>
                     {bpm}
                   </span>
                 </div>
               </div>

               {/* Filter Cutoff */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 filterCutoff > 80 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 filterCutoff < 30 ? 'bg-indigo-950/40 border-indigo-500/50' :
                 systemActive ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Filter Sweep
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     filterCutoff > 80 ? 'text-red-400' : 
                     filterCutoff < 30 ? 'text-indigo-400' : 'text-fuchsia-400'
                   }`}>
                     {filterCutoff}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Formation */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 formation === 'BURST' ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse' :
                 systemActive ? 'bg-purple-950/40 border-purple-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Swarm Shape
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none ${
                     formation === 'BURST' ? 'text-orange-400' : 
                     systemActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {systemActive ? formation : 'STATIC'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>MIDI Command Interceptor</span>
                 {systemActive && <span className="text-emerald-400 font-black animate-pulse">LATENCY: {midiLatency.toFixed(1)}ms</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-orange-500 font-bold uppercase bg-orange-900/30 px-1' :
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 'text-slate-400'
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
            
            {/* Sky Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#04010a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">SKY TELEMETRY CAM</span>
                <span className="text-[8px] font-mono text-slate-400">{activeDrones} UAVs</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SWARM DOCKED</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Night Sky / Clouds */}
                        <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/10 to-transparent"></div>

                        {/* Stage Lights beaming up */}
                        <div className="absolute bottom-0 w-full flex justify-between opacity-30">
                            <div className="w-1 h-32 bg-white blur-sm rotate-[20deg] origin-bottom" style={{ boxShadow: '0 0 20px #e879f9' }}></div>
                            <div className="w-1 h-32 bg-white blur-sm -rotate-[20deg] origin-bottom" style={{ boxShadow: '0 0 20px #e879f9' }}></div>
                        </div>

                        {/* Drone Pixels */}
                        {drones.map(d => (
                            <div 
                                key={d.id}
                                className="absolute rounded-full transition-all duration-75"
                                style={{
                                    left: `${d.x}%`,
                                    top: `${d.y}%`,
                                    width: formation === 'BURST' ? '6px' : '4px',
                                    height: formation === 'BURST' ? '6px' : '4px',
                                    backgroundColor: d.color,
                                    boxShadow: `0 0 ${formation === 'BURST' ? '20px' : '8px'} ${d.color}`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            ></div>
                        ))}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#100512] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate DJ MIDI Interactions</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => triggerMidiEvent('FILTER_PEAK')}
                   disabled={!systemActive}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   🎛️ High-Pass Filter Sweep
                 </button>

                 <button 
                   onClick={() => triggerMidiEvent('BPM_UP')}
                   disabled={!systemActive}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                   }`}
                 >
                   ⏩ Shift to 174 BPM
                 </button>
               </div>
               
               <button 
                 onClick={() => triggerMidiEvent('BASS_DROP')}
                 disabled={!systemActive}
                 className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                   !systemActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                   'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse'
                 }`}
               >
                 💥 TRIGGER BASS DROP
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DroneMidiSync;
