/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DynamicCSSThemingEngine = () => {
  const [isEngineEnabled, setIsEngineEnabled] = useState(false);
  const [timeHour, setTimeHour] = useState(12); // 0 to 23
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'App initialized. Defaulting to standard light theme.' }
  ]);

  // Determine if it is night time (Sunset at 19:00 / 7:00 PM)
  const isNight = timeHour >= 19 || timeHour < 6;
  const timeString = `${timeHour.toString().padStart(2, '0')}:00`;
  const displayTime = timeHour > 12 ? `${timeHour - 12}:00 PM` : timeHour === 12 ? `12:00 PM` : timeHour === 0 ? `12:00 AM` : `${timeHour}:00 AM`;

  useEffect(() => {
      addLog('ACTION', `Device clock updated: ${timeString} (${displayTime})`);
      
      if (isEngineEnabled) {
          if (isNight) {
              addLog('SYS', 'Solar Calc: Sunset threshold crossed. Transitioning CSS variables to OLED Dark Mode.');
          } else {
              addLog('SYS', 'Solar Calc: Sunrise threshold crossed. Transitioning CSS variables to High-Contrast Light Mode.');
          }
      } else {
          if (isNight) {
              addLog('CRIT', 'Nighttime detected, but engine disabled. Retaining blinding white UI.');
          }
      }
  }, [timeHour, isEngineEnabled]);

  const toggleEngine = () => {
      const newState = !isEngineEnabled;
      setIsEngineEnabled(newState);
      if (newState) {
          addLog('SUCCESS', 'Dynamic Solar Theming Engine enabled. Hooked to Geolocation and Device Clock.');
      } else {
          addLog('CRIT', 'Theming Engine disabled. OS-level preferences ignored.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Determine active theme based on engine state and time
  const activeTheme = (isEngineEnabled && isNight) ? 'dark' : 'light';
  
  // Dynamic Theme Colors
  const theme = {
      bg: activeTheme === 'dark' ? '#000000' : '#ffffff',
      surface: activeTheme === 'dark' ? '#111111' : '#f8f9fa',
      border: activeTheme === 'dark' ? '#333333' : '#e5e7eb',
      textPrimary: activeTheme === 'dark' ? '#ffffff' : '#111827',
      textSecondary: activeTheme === 'dark' ? '#a1a1aa' : '#6b7280',
      accent: activeTheme === 'dark' ? '#f43f5e' : '#e11d48' // Rose
  };

  return (
    <div className="min-h-screen bg-[#070404] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎨</span> Frontend Architecture & UX
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic CSS Variable <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500">Solar Theming Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the sun sets at the festival, users open the app in the pitch black to check the schedule. They are instantly blinded by a bright white UI, ruining their night vision during the intricate laser light shows. Eventra solves this by building a dynamic CSS Variable theming engine. The frontend uses the Geolocation API and a solar calculation algorithm to determine the exact minute of sunset at the specific festival grounds. When the sun drops below the horizon, the app seamlessly transitions its CSS custom properties from a high-contrast "Day Mode" to a deep OLED "Night Mode" in real-time, completely independent of the user's OS settings.
          </p>

          <div className="bg-[#120606] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> UI Theme Configuration
               </h3>
               <span className="text-[9px] uppercase tracking-widest text-slate-500">Local Sunset: 19:00 (7:00 PM)</span>
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Engine Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-8">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Solar Calculation Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isEngineEnabled ? 'Active: Dynamic CSS Variable Injection' : 'Inactive: Static UI Theme Constraint'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleEngine}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isEngineEnabled ? 'bg-orange-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isEngineEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 {/* Time Slider */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col mb-6 relative">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simulated Time of Day</span>
                         <span className="text-xl font-black text-white font-mono">{displayTime}</span>
                     </div>
                     
                     <input 
                         type="range" 
                         min="0" 
                         max="23" 
                         value={timeHour} 
                         onChange={(e) => setTimeHour(parseInt(e.target.value))}
                         className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                     />
                     
                     <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 uppercase">
                         <span>Midnight</span>
                         <span>Sunrise</span>
                         <span>Noon</span>
                         <span className="text-orange-400">Sunset</span>
                         <span>Midnight</span>
                     </div>
                     
                     {/* Sunset Marker */}
                     <div className="absolute bottom-5 left-[79%] w-0.5 h-3 bg-orange-500"></div>
                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>CSSOM Injection Logs</span>
                 <span className="text-orange-400 font-black animate-pulse">MONITORING...</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-orange-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">CSS Architecture</span>
                      <span className="text-xs text-white font-bold">Live UI Viewport</span>
                  </div>
                  
                  {/* Sky Indicator */}
                  <div className="flex items-center text-xl">
                      {isNight ? '🌙' : '☀️'}
                  </div>
              </div>

              {/* Dynamic App UI */}
              <div 
                  className="flex-1 p-6 flex flex-col transition-colors duration-1000 ease-in-out relative overflow-hidden"
                  style={{ backgroundColor: theme.bg }}
              >
                  {/* Environmental Background (Sun/Moon glow outside the app) */}
                  {!isNight && (
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-1000"></div>
                  )}
                  
                  <div className="flex justify-between items-center mb-6 z-10 transition-colors duration-1000" style={{ color: theme.textPrimary }}>
                      <span className="font-black text-xl">Eventra App</span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-1000" style={{ backgroundColor: theme.surface }}>
                          👤
                      </div>
                  </div>
                  
                  <div className="rounded-2xl p-5 mb-4 shadow-lg z-10 transition-colors duration-1000 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block transition-colors duration-1000" style={{ color: theme.accent }}>Next Up</span>
                      <span className="text-2xl font-black mb-1 block transition-colors duration-1000" style={{ color: theme.textPrimary }}>Illenium</span>
                      <span className="text-sm font-medium transition-colors duration-1000" style={{ color: theme.textSecondary }}>Main Stage • {displayTime}</span>
                      
                      <div className="mt-4 flex gap-2">
                          <div className="h-2 rounded-full w-2/3 transition-colors duration-1000" style={{ backgroundColor: theme.accent }}></div>
                          <div className="h-2 rounded-full w-1/3 transition-colors duration-1000" style={{ backgroundColor: theme.border }}></div>
                      </div>
                  </div>
                  
                  <div className="flex gap-4 mb-6 z-10">
                      <div className="flex-1 rounded-xl p-4 border transition-colors duration-1000 flex flex-col items-center justify-center text-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                          <span className="text-2xl mb-2 transition-transform hover:scale-110">🗺️</span>
                          <span className="text-xs font-bold transition-colors duration-1000" style={{ color: theme.textPrimary }}>Map</span>
                      </div>
                      <div className="flex-1 rounded-xl p-4 border transition-colors duration-1000 flex flex-col items-center justify-center text-center" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                          <span className="text-2xl mb-2 transition-transform hover:scale-110">🎫</span>
                          <span className="text-xs font-bold transition-colors duration-1000" style={{ color: theme.textPrimary }}>Tickets</span>
                      </div>
                  </div>
                  
                  <div className="rounded-xl p-4 border transition-colors duration-1000 z-10" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-slate-500 mr-3 overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500"></div>
                          </div>
                          <div className="flex flex-col flex-1">
                              <span className="text-sm font-bold transition-colors duration-1000" style={{ color: theme.textPrimary }}>Live Set Audio</span>
                              <span className="text-[10px] transition-colors duration-1000" style={{ color: theme.textSecondary }}>Streaming now</span>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-1000" style={{ backgroundColor: theme.accent }}>
                              ▶
                          </div>
                      </div>
                  </div>
                  
                  {/* Blinding Light Warning Overlay */}
                  {isNight && !isEngineEnabled && (
                      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center animate-fade-in-up">
                          <div className="w-full h-full absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                          <div className="relative bg-rose-950/90 text-rose-300 border-2 border-rose-500 p-4 rounded-xl text-center shadow-[0_0_50px_rgba(255,255,255,1)]">
                              <span className="text-4xl mb-2 block">👁️</span>
                              <span className="font-black uppercase tracking-widest text-xs block mb-1">Night Vision Destroyed</span>
                              <span className="text-[9px]">Blinding white UI in pitch black</span>
                          </div>
                      </div>
                  )}
                  
                  {/* OLED Success Overlay */}
                  {isNight && isEngineEnabled && (
                      <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none flex justify-center animate-fade-in-up">
                          <div className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-full text-center shadow-lg">
                              <span className="font-black uppercase tracking-widest text-[9px] flex items-center justify-center">
                                  <span className="mr-2">🌙</span> OLED Dark Mode Active
                              </span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120606] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">CSS Theming Engine:</span>
               With the engine OFF, move the slider to 9:00 PM (Nighttime). The app remains blindingly white. When users open this in a pitch-black festival crowd to check a set time, it physically hurts their eyes and ruins their night vision.<br/><br/>Toggle <span className="text-orange-400 font-bold bg-slate-800 px-1 rounded">Solar Engine</span> ON. The app checks the Geolocation API for the local sunset time (7:00 PM). As you drag the slider past sunset, the frontend seamlessly maps the CSS custom properties (`--bg`, `--surface`, `--text`) to a deep OLED dark mode, protecting the user's eyes automatically.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DynamicCSSThemingEngine;
