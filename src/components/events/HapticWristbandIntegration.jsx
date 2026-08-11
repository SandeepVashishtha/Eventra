/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticWristbandIntegration = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [bassLevel, setBassLevel] = useState(0); // 0 to 100
  const [isDrop, setIsDrop] = useState(false);
  
  const [iotLog, setIotLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'BLE Broadcaster Node initialized. 1,450 wristbands synced to Channel 1 (Green).' }
  ]);

  useEffect(() => {
    let loop;
    if (systemActive) {
      loop = setInterval(() => {
        // Simulating the EDM build-up and drop
        setBassLevel(prev => {
          let next;
          if (isDrop) {
            // During a drop, bass pulses heavily between 70 and 100
            next = 70 + Math.random() * 30;
          } else {
            // Build up phase, steadily climbing
            next = prev + Math.random() * 5;
            if (next > 95) {
              // Trigger the drop automatically if it builds up too high
              triggerDrop();
            }
          }
          return Math.min(100, Math.max(0, next));
        });
      }, 200); // 200ms tick for fast audio simulation
    }
    return () => clearInterval(loop);
  }, [systemActive, isDrop]);

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setBassLevel(20);
      setIsDrop(false);
      addLog('AUDIO', 'Ingesting DJ master out. Applying Low-Pass Filter (20Hz-120Hz)...');
    } else {
      setSystemActive(false);
      setBassLevel(0);
      setIsDrop(false);
      addLog('SYS', 'Audio ingestion paused. Transmitting idle command to wristbands.');
    }
  };

  const triggerDrop = () => {
    if (systemActive && !isDrop) {
      setIsDrop(true);
      addLog('BASS', 'BASS DROP DETECTED. Maximizing PWM haptic voltage on all BLE bands.');
      
      // Auto-end the drop after 4 seconds
      setTimeout(() => {
        setIsDrop(false);
        setBassLevel(30); // Reset back to baseline beat
        addLog('AUDIO', 'Drop resolved. Returning to baseline rhythmic pulses.');
      }, 4000);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setIotLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: FOH Audio / IoT Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎶</span> IoT Wearables & DSP
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic-Feedback <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">Silent Disco Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Silent discos are a brilliant solution for strict neighborhood noise ordinances, but attendees lose the visceral, physical feeling of bass vibrating through their chests. Eventra solves this by deploying a Bluetooth Low Energy (BLE) integration to haptic-feedback wristbands worn by attendees. The app actively analyzes the low-frequency EQ of the DJ's live audio stream and triggers synchronized vibrational pulses on the hardware, perfectly restoring the physical impact of the drop.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Low-Frequency DSP Analyzer
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Pause DSP Engine' : 'Engage Audio Ingestion'}
                 </button>
                 
                 <button 
                   onClick={systemActive && !isDrop ? triggerDrop : undefined}
                   disabled={!systemActive || isDrop}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !systemActive || isDrop ? 'bg-slate-900 text-slate-600 opacity-50 cursor-not-allowed border border-slate-800' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   Force Bass Drop
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Audio EQ Visualizer (Low end only) */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center h-28">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3 relative z-10">Sub-Bass Frequencies (20-120Hz)</span>
                 
                 <div className="flex items-end h-full space-x-1 relative z-10 px-2">
                   {[...Array(12)].map((_, i) => (
                     <div 
                       key={i}
                       className="flex-1 bg-fuchsia-500 rounded-t-sm transition-all duration-100"
                       style={{ 
                         height: systemActive ? `${Math.max(5, bassLevel * (Math.random() * 0.5 + 0.5))}%` : '5%',
                         opacity: isDrop ? 1 : 0.6
                       }}
                     ></div>
                   ))}
                 </div>
                 
                 {isDrop && (
                   <div className="absolute inset-0 bg-fuchsia-500/20 animate-pulse z-0"></div>
                 )}
               </div>

               {/* BLE Telemetry */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-150 h-28 ${
                 isDrop ? 'bg-purple-900/30 border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.2)_inset]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">BLE Transmit Voltage (PWM)</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-150 ${
                     isDrop ? 'text-purple-400' : 'text-slate-300'
                   }`}>
                     {bassLevel.toFixed(0)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">% MAX</span>
                 </div>
                 
                 <div className="absolute top-3 right-3 flex items-center space-x-1">
                   <span className={`w-2 h-2 rounded-full ${systemActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase">Sync</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Haptic Bridge Matrix Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {iotLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'BASS' ? 'text-purple-400 font-bold' : 
                       log.type === 'AUDIO' ? 'text-fuchsia-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: IoT Wristband Hardware Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-3xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                Attendee Wristband Simulator
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
               
               {/* Abstract club lighting background */}
               <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen">
                 <div className={`absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] transition-all duration-75 ${systemActive ? 'animate-pulse' : 'opacity-10'}`}></div>
                 <div className={`absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600 rounded-full blur-[100px] transition-all duration-100 ${isDrop ? 'opacity-100 scale-150' : 'opacity-20'}`}></div>
               </div>

               {/* Physical Wristband Render */}
               <div className="relative z-10 flex flex-col items-center">
                 
                 {/* The Strap Top */}
                 <div className="w-24 h-16 bg-neutral-900 rounded-t-lg border-x-2 border-t-2 border-neutral-800 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]"></div>
                 
                 {/* The Core Module */}
                 <div className="w-32 h-20 bg-black rounded-xl border-4 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden">
                   
                   {/* RGB LED Diffuser on wristband */}
                   <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md z-10 flex items-center justify-center p-2">
                     <div className={`w-full h-full rounded-sm transition-all duration-75 ${
                       isDrop ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,1)]' : 
                       systemActive ? 'bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-neutral-800'
                     }`}></div>
                   </div>
                   
                   {/* Mechanical Vibration Effect */}
                   <div 
                     className="absolute inset-0 z-20 pointer-events-none transition-all duration-75"
                     style={systemActive ? {
                       transform: `translate(${Math.random() * (bassLevel/10) - (bassLevel/20)}px, ${Math.random() * (bassLevel/10) - (bassLevel/20)}px)`
                     } : {}}
                   >
                     {/* Simulating vibration blur on the module edges */}
                     {isDrop && <div className="absolute inset-0 border-[6px] border-white/20 rounded-xl blur-[2px]"></div>}
                   </div>
                 </div>
                 
                 {/* The Strap Bottom */}
                 <div className="w-24 h-24 bg-neutral-900 rounded-b-lg border-x-2 border-b-2 border-neutral-800 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]"></div>
               </div>

               {/* Haptic Motor Readout Overlay */}
               <div className="absolute bottom-10 inset-x-8 bg-black/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md z-30">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Linear Resonant Actuator</p>
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <span className="text-xl">📳</span>
                     <div>
                       <p className="text-[9px] text-slate-400 font-mono">Force Feedback</p>
                       <p className={`text-sm font-black transition-colors duration-150 ${isDrop ? 'text-white' : 'text-slate-300'}`}>
                         {systemActive ? (bassLevel * 0.05).toFixed(2) : '0.00'} Gs
                       </p>
                     </div>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-[9px] text-slate-400 font-mono">Status</p>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block ${
                       isDrop ? 'bg-purple-900 text-purple-400 animate-pulse' :
                       systemActive && bassLevel > 30 ? 'bg-fuchsia-900/50 text-fuchsia-400' : 'bg-slate-800 text-slate-500'
                     }`}>
                       {isDrop ? 'MAX LOAD' : systemActive ? 'PULSING' : 'IDLE'}
                     </span>
                   </div>
                 </div>
                 
                 {/* Vibration Sine Wave Vis */}
                 <div className="mt-3 h-4 bg-slate-900 rounded overflow-hidden flex items-center justify-center opacity-60">
                   {systemActive && (
                     <div 
                       className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMTBRNSAxNSAxMCAxMFQyMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTkxZTYzIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] bg-repeat-x"
                       style={{ 
                         backgroundSize: `${isDrop ? 20 : 40}px 100%`,
                         animation: `slideLeft ${isDrop ? 0.2 : 0.8}s linear infinite`,
                         opacity: bassLevel / 100
                       }}
                     ></div>
                   )}
                 </div>
                 
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes slideLeft {
                     from { background-position: 0 0; }
                     to { background-position: -40px 0; }
                   }
                 `}} />
                 
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HapticWristbandIntegration;
