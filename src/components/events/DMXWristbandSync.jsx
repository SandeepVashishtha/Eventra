/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DMXWristbandSync = () => {
  const [dmxActive, setDmxActive] = useState(false);
  const [currentMacro, setCurrentMacro] = useState('IDLE'); // IDLE, SWEEP, PULSE, CHASE
  
  // Matrix representing the crowd (10x10 grid of wristbands)
  const [wristbands, setWristbands] = useState(Array(100).fill({ r: 255, g: 255, b: 255, a: 0.1 }));
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Art-Net/sACN to Bluetooth bridge online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Listening for GrandMA3 UDP packets on Universe 1.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (!dmxActive) {
      setWristbands(Array(100).fill({ r: 255, g: 255, b: 255, a: 0.1 }));
      return;
    }

    if (currentMacro === 'SWEEP') {
      let step = 0;
      loop = setInterval(() => {
        setWristbands(prev => prev.map((_, i) => {
          // Calculate distance from left (0 to 9)
          const x = i % 10;
          // Create a wave moving left to right
          const distance = Math.abs(x - (step % 15 - 2));
          if (distance < 2) return { r: 147, g: 51, b: 234, a: 1 }; // Purple
          if (distance < 4) return { r: 147, g: 51, b: 234, a: 0.3 };
          return { r: 15, g: 23, b: 42, a: 0.2 }; // Dark
        }));
        step++;
      }, 100);
    } 
    else if (currentMacro === 'PULSE') {
      let intensity = 0;
      let growing = true;
      loop = setInterval(() => {
        if (growing) {
          intensity += 0.1;
          if (intensity >= 1) growing = false;
        } else {
          intensity -= 0.1;
          if (intensity <= 0.1) growing = true;
        }
        
        setWristbands(Array(100).fill({ r: 16, g: 185, b: 129, a: intensity })); // Emerald
      }, 50);
    }
    else if (currentMacro === 'CHASE') {
      let step = 0;
      loop = setInterval(() => {
        setWristbands(prev => prev.map((_, i) => {
          // Circular chase from center
          const x = (i % 10) - 4.5;
          const y = Math.floor(i / 10) - 4.5;
          const dist = Math.sqrt(x*x + y*y);
          const radius = (step % 12);
          
          if (Math.abs(dist - radius) < 1.5) return { r: 239, g: 68, b: 68, a: 1 }; // Red
          return { r: 15, g: 23, b: 42, a: 0.2 }; // Dark
        }));
        step += 0.5;
      }, 100);
    }
    else if (currentMacro === 'IDLE') {
      // Random twinkle
      loop = setInterval(() => {
        setWristbands(prev => prev.map(() => {
          if (Math.random() > 0.95) return { r: 255, g: 255, b: 255, a: 0.8 };
          return { r: 255, g: 255, b: 255, a: 0.1 };
        }));
      }, 200);
    }

    return () => { if (loop) clearInterval(loop); };
  }, [dmxActive, currentMacro]);

  const triggerMacro = (macro, name) => {
    if (dmxActive) {
      setCurrentMacro(macro);
      addLog('ACTION', `GrandMA3 Exec Button pressed: [${name}]`);
      addLog('SYS', `Translating sACN Universe 1 data to 100,000 BLE packets...`);
    }
  };

  const toggleBridge = () => {
    if (!dmxActive) {
      setDmxActive(true);
      setCurrentMacro('IDLE');
      addLog('SYS', 'DMX to Bluetooth bridge connected. 100,000 pixels active.');
    } else {
      setDmxActive(false);
      setCurrentMacro('IDLE');
      addLog('WARN', 'Art-Net connection dropped. Wristbands reverted to local control.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Lighting Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💡</span> Professional Lighting Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic Wristband <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">DMX Synchronization Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            LED wristbands handed out to the crowd are often pre-programmed with basic colors and operate entirely independently from the main stage's high-end lighting rig, which breaks the immersion. Eventra solves this by building an Art-Net/sACN to Bluetooth bridge module. This allows the primary Lighting Director's console (e.g., GrandMA3) to treat all 100,000 attendee wristbands as individual DMX pixels. The LD can run complex video sweeps, chases, and strobes seamlessly from the stage screens all the way through the crowd in real-time.
          </p>

          <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> sACN/Art-Net Protocol Bridge
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleBridge}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     dmxActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)]'
                   }`}
                 >
                   {dmxActive ? 'Disconnect Console' : 'Engage DMX Bridge'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Protocol Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dmxActive ? 'bg-pink-950/20 border-pink-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Input: sACN UDP Stream
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${dmxActive ? 'text-pink-400' : 'text-slate-600'}`}>
                     {dmxActive ? 'Universe 1 - 50' : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Framerate: {dmxActive ? '44 FPS' : '0 FPS'}
                   </span>
                 </div>
               </div>

               {/* Output Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 currentMacro !== 'IDLE' && dmxActive ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Output: Bluetooth LE Mesh
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     currentMacro !== 'IDLE' && dmxActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {dmxActive ? '100,000 Pixels' : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Active Macro: {currentMacro}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Bridge Translation Log</span>
                 {dmxActive && currentMacro !== 'IDLE' && <span className="text-pink-400 animate-pulse">Transmitting BLE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' :
                       log.type === 'WARN' ? 'text-red-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Lighting Console & Crowd Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Crowd Pixel Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[320px] overflow-hidden font-sans mb-6 bg-[#020617] transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Aerial Crowd Simulator (100,000 Pixels)
                </span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center p-6 pt-10">
                
                {/* Stage Reference */}
                <div className="w-full h-8 bg-gradient-to-t from-slate-900 to-black border-t-2 border-slate-700 mb-4 flex items-center justify-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Main Stage</span>
                </div>

                {/* Wristband Pixel Grid (10x10) */}
                <div className="grid grid-cols-10 grid-rows-10 gap-1.5 w-full aspect-square max-w-[240px]">
                  {wristbands.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="w-full h-full rounded-full transition-all duration-[50ms]"
                      style={{ 
                        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
                        boxShadow: color.a > 0.5 ? `0 0 10px rgba(${color.r}, ${color.g}, ${color.b}, 0.8)` : 'none'
                      }}
                    ></div>
                  ))}
                </div>

              </div>
            </div>

            {/* Simulated GrandMA3 Executor Buttons */}
            <div className="w-full bg-[#0f172a] p-5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 text-center">GrandMA3 Executor Matrix</span>
              
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => triggerMacro('SWEEP', 'Purple L-R Sweep')}
                  disabled={!dmxActive}
                  className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border-b-4 ${
                    !dmxActive ? 'bg-slate-900 border-slate-950 text-slate-700 cursor-not-allowed' : 
                    currentMacro === 'SWEEP' ? 'bg-purple-600 border-purple-800 text-white translate-y-1 border-b-0' :
                    'bg-slate-800 border-slate-950 text-purple-400 hover:bg-slate-700'
                  }`}
                >
                  <span className="block text-sm mb-1">🌊</span>
                  Purple Sweep
                </button>

                <button 
                  onClick={() => triggerMacro('PULSE', 'Emerald Bass Pulse')}
                  disabled={!dmxActive}
                  className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border-b-4 ${
                    !dmxActive ? 'bg-slate-900 border-slate-950 text-slate-700 cursor-not-allowed' : 
                    currentMacro === 'PULSE' ? 'bg-emerald-600 border-emerald-800 text-white translate-y-1 border-b-0' :
                    'bg-slate-800 border-slate-950 text-emerald-400 hover:bg-slate-700'
                  }`}
                >
                  <span className="block text-sm mb-1">🔊</span>
                  Emerald Pulse
                </button>

                <button 
                  onClick={() => triggerMacro('CHASE', 'Red Center Chase')}
                  disabled={!dmxActive}
                  className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition border-b-4 ${
                    !dmxActive ? 'bg-slate-900 border-slate-950 text-slate-700 cursor-not-allowed' : 
                    currentMacro === 'CHASE' ? 'bg-red-600 border-red-800 text-white translate-y-1 border-b-0' :
                    'bg-slate-800 border-slate-950 text-red-400 hover:bg-slate-700'
                  }`}
                >
                  <span className="block text-sm mb-1">🎯</span>
                  Red Chase
                </button>
              </div>

              <div className="mt-3">
                 <button 
                  onClick={() => triggerMacro('IDLE', 'Clear Output (Twinkle)')}
                  disabled={!dmxActive || currentMacro === 'IDLE'}
                  className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition ${
                    !dmxActive || currentMacro === 'IDLE' ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 
                    'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Clear All / Twinkle
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DMXWristbandSync;
