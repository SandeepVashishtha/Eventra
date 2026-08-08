/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EmergencyEgressLighting = () => {
  const [systemState, setSystemState] = useState('NOMINAL'); // NOMINAL, OVERRIDE_INITIATED, EGRESS_ACTIVE
  
  // Array representing a path of lights
  const [lights, setLights] = useState(Array(20).fill({ r: 147, g: 51, b: 234, a: 0.5 })); // Default purple ambient
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Hardware Abstraction Layer (HAL) loaded.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'DMX, Art-Net, and sACN protocols bridged.' },
    { id: 3, time: '21:00:05', type: 'SYS', msg: 'Emergency Egress Override standing by.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (systemState === 'NOMINAL') {
      // Gentle pulsing purple/blue ambient
      let pulse = 0;
      loop = setInterval(() => {
        const intensity = 0.3 + Math.sin(pulse) * 0.2;
        setLights(Array(20).fill({ r: 147, g: 51, b: 234, a: intensity }));
        pulse += 0.1;
      }, 100);
    } else if (systemState === 'EGRESS_ACTIVE') {
      // Stark white directional chase sequence
      let step = 0;
      loop = setInterval(() => {
        setLights(prev => prev.map((_, i) => {
          // Chase moves from left (0) to right (19), guiding to the exit on the right
          const distance = Math.abs(i - (step % 25 - 5)); 
          if (distance < 2) return { r: 255, g: 255, b: 255, a: 1 }; // Full Bright White
          if (distance < 4) return { r: 255, g: 255, b: 255, a: 0.5 };
          return { r: 15, g: 23, b: 42, a: 0.1 }; // Dark
        }));
        step++;
      }, 50); // Fast strobe/chase
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemState]);

  const triggerEvacuation = () => {
    if (systemState === 'NOMINAL') {
      setSystemState('OVERRIDE_INITIATED');
      addLog('CRIT', 'FIRE DETECTED IN NORTH QUADRANT. INITIATING LIFE-SAFETY PROTOCOLS.');
      
      setTimeout(() => {
        addLog('SYS', 'SEIZING CONTROL OF ALL DMX FIXTURES FROM LIGHTING CONSOLE...');
        
        setTimeout(() => {
          setSystemState('EGRESS_ACTIVE');
          addLog('ACTION', 'ENGAGING 100% INTENSITY STARK WHITE EGRESS RUNWAY ANIMATION.');
          addLog('WEB3', 'Directing all crowd movement toward East Exits.');
        }, 1200);
      }, 1000);
    }
  };

  const resetSystem = () => {
    setSystemState('NOMINAL');
    addLog('SYS', 'Emergency override cancelled. Returning DMX control to Lighting Director.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Override Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max animate-pulse">
            <span className="mr-2">🚨</span> Life-Safety Override
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Emergency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">Egress Synchronization</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In a severe emergency (like a fire or total blackout), attendees panic and run in all directions because they cannot see the exit paths, often leading to deadly stampedes. Small, dim "EXIT" signs are easily obscured by smoke or crowd density. Eventra solves this by integrating the festival's architectural lighting grid with a life-safety hardware abstraction layer. In a crisis, the system instantly seizes control of all DMX stage lights, searchlights, and pathway LEDs, turning them stark white and initiating a synchronized chase sequence that acts as a massive visual runway pointing the crowd directly toward the safest exits.
          </p>

          <div className="bg-[#1a0509] rounded-3xl p-6 border border-red-900/50 shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-red-900/50 pb-4">
               <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🎛️</span> DMX Control Authority
               </h3>
               
               <div className="flex space-x-2">
                 <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center ${
                     systemState === 'EGRESS_ACTIVE' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse' :
                     'bg-slate-800 text-slate-500 border border-slate-700'
                   }`}
                 >
                   {systemState === 'EGRESS_ACTIVE' ? 'SYSTEM SEIZED' : 'STANDBY'}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Protocol Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemState === 'EGRESS_ACTIVE' ? 'bg-red-950/60 border-red-500/80 shadow-inner' :
                 'bg-[#0f172a] border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Protocol Target
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${systemState === 'EGRESS_ACTIVE' ? 'text-white' : 'text-slate-600'}`}>
                     {systemState === 'EGRESS_ACTIVE' ? 'ALL UNIVERSES' : 'BYPASS'}
                   </span>
                   <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${systemState === 'EGRESS_ACTIVE' ? 'text-red-400' : 'text-slate-500'}`}>
                     {systemState === 'EGRESS_ACTIVE' ? 'Force Intensity: 100% White' : 'Control: Front of House'}
                   </span>
                 </div>
               </div>

               {/* Evac Route */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemState === 'EGRESS_ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' : 'bg-[#0f172a] border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Visual Runway Routing
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     systemState === 'EGRESS_ACTIVE' ? 'text-emerald-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {systemState === 'EGRESS_ACTIVE' ? 'EAST EXITS' : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     Animation: {systemState === 'EGRESS_ACTIVE' ? 'Directional Chase' : 'None'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-red-900/50 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-red-900/30 pb-2 flex justify-between">
                 <span>Master Override Log</span>
                 {systemState === 'OVERRIDE_INITIATED' && <span className="text-red-500 animate-pulse">Seizing Control...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-white font-bold' :
                       log.type === 'WEB3' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Lighting Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Festival Grounds Lighting Simulator */}
            <div className={`w-full rounded-[1rem] border-[8px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              systemState === 'EGRESS_ACTIVE' ? 'bg-black' : 'bg-slate-900'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Aerial View: Main Thoroughfare
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
                  Exit →
                </span>
              </div>

              <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center pt-8 p-4">
                
                {/* Simulated Crowd (Dark shapes) */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20 z-0 mix-blend-overlay"></div>

                {/* Pathway Lighting Grid (1x20) */}
                <div className="w-full flex justify-between items-center z-10 px-2 space-x-1">
                  {lights.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-full h-32 rounded-full transition-all duration-[50ms]"
                      style={{ 
                        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                        boxShadow: color.a > 0.5 ? `0 0 20px rgba(${color.r}, ${color.g}, ${color.b}, 0.9)` : 'none',
                        transform: `scaleY(${0.2 + color.a * 0.8})` // Tall bright beams
                      }}
                    ></div>
                  ))}
                </div>

                {/* Safe Exit Marker */}
                <div className="absolute right-0 h-full w-4 bg-emerald-500/20 flex flex-col justify-center items-center z-20 border-l border-emerald-500/50 shadow-[0_0_30px_#10b981]">
                  <span className="text-emerald-400 font-black text-[8px] rotate-90 whitespace-nowrap tracking-widest uppercase">SAFE EXIT</span>
                </div>

                {/* Fire Overlay */}
                {systemState !== 'NOMINAL' && (
                  <div className="absolute top-0 left-0 w-24 h-24 bg-red-600/30 blur-xl animate-pulse z-20 mix-blend-screen shadow-[0_0_50px_#dc2626]"></div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0f172a] p-5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 text-center">Life-Safety Physical Triggers</span>
              
              <button 
                onClick={triggerEvacuation}
                disabled={systemState !== 'NOMINAL'}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[14px] transition shadow-[0_10px_30px_rgba(220,38,38,0.4)] border mb-4 ${
                  systemState !== 'NOMINAL' ? 'bg-red-950 border-red-900 text-red-800 cursor-not-allowed shadow-none' : 
                  'bg-red-600 border-red-500 text-white hover:bg-red-500 hover:scale-105 active:scale-95'
                }`}
              >
                PULL TO EVACUATE
              </button>

              <button 
                onClick={resetSystem}
                disabled={systemState === 'NOMINAL'}
                className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition ${
                  systemState === 'NOMINAL' ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                Secure Override (Admin Only)
              </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EmergencyEgressLighting;
