/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WasmAudioProcessing = () => {
  const [isWasmEnabled, setIsWasmEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(1);
  const [fps, setFps] = useState(60);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'Audio engine initialized. Awaiting live stream connection.' }
  ]);

  const executeAudio = () => {
      setIsPlaying(!isPlaying);
      
      if (!isPlaying) {
          setActiveStep(1);
          addLog('ACTION', 'User toggled Live Stream Playback.');
          
          if (isWasmEnabled) {
              addLog('SYS', 'Loading Rust binary (audio_dsp.wasm)...');
              
              setTimeout(() => {
                  setActiveStep(2);
                  addLog('SYS', 'Instantiating AudioWorkletNode with WASM memory buffer...');
                  
                  setTimeout(() => {
                      setActiveStep(3);
                      addLog('SUCCESS', 'Audio processing offloaded to native-speed WebAssembly thread.');
                      setCpuLoad(4); // Very low CPU
                      setFps(60); // Perfect 60 FPS
                      
                  }, 800);
              }, 600);
              
          } else {
              // Legacy JS
              addLog('WARN', 'Loading standard JavaScript audio processing loop...');
              
              setTimeout(() => {
                  setActiveStep(2);
                  addLog('WARN', 'Executing heavy Math.sin() and Array.map() transforms on Main Thread.');
                  
                  setTimeout(() => {
                      setActiveStep(3);
                      addLog('CRIT', 'Main Thread blocked! Audio buffer underrun detected.');
                      setCpuLoad(98); // High CPU
                      setFps(12); // Stuttering UI
                      
                      // Simulate stuttering log
                      const stutterInterval = setInterval(() => {
                          setCpuLoad(prev => prev > 90 ? 99 : 98);
                          setFps(prev => prev > 15 ? 12 : 16);
                      }, 400);
                      
                      setTimeout(() => clearInterval(stutterInterval), 5000);
                  }, 800);
              }, 600);
          }
      } else {
          setActiveStep(0);
          setCpuLoad(1);
          setFps(60);
          addLog('SYS', 'Audio stream paused.');
      }
  };

  const toggleWasm = () => {
      const newState = !isWasmEnabled;
      setIsWasmEnabled(newState);
      setIsPlaying(false);
      setActiveStep(0);
      setCpuLoad(1);
      setFps(60);
      
      if (newState) {
          addLog('SUCCESS', 'WebAssembly Engine enabled. Bypassing JS V8 garbage collection.');
      } else {
          addLog('CRIT', 'WASM disabled. Falling back to extremely slow JS Main Thread processing.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070208] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎵</span> Frontend Performance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            WASM-Accelerated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500">Audio Processing Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When users stream virtual festivals, many want to apply localized EQ filters (like Bass Boost) because their laptop speakers distort. Doing complex mathematical audio filtering (FFT) in standard JavaScript is extremely inefficient; it blocks the browser's Main Thread, causing the UI to freeze, scroll to stutter, and the audio to glitch. Eventra solves this by compiling a high-performance Rust C++ audio library into WebAssembly (WASM). The stream runs through an isolated AudioWorklet that calls the native-speed WASM module, executing heavy DSP algorithms without ever touching the UI thread.
          </p>

          <div className="bg-[#110515] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> DSP Execution Layer
               </h3>
               {isPlaying && (
                   <span className="text-[9px] uppercase tracking-widest text-emerald-500 animate-pulse font-bold">● LIVE STREAM ACTIVE</span>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* WASM Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Compute Architecture</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isWasmEnabled ? 'Active: Rust -> WebAssembly (AudioWorklet)' : 'Inactive: Pure JavaScript (Main Thread)'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleWasm}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isWasmEnabled ? 'bg-fuchsia-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isWasmEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeAudio}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         isPlaying && !isWasmEnabled ? 'bg-red-900/40 text-red-500 border-red-900' :
                         isPlaying && isWasmEnabled ? 'bg-fuchsia-900/40 text-fuchsia-400 border-fuchsia-900' :
                         'bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
                     }`}
                 >
                     {isPlaying ? '■ Stop Audio Processing' : "▶ Process Live Audio Stream"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040105] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Browser Engine Debugger</span>
                 {isPlaying && <span className="text-fuchsia-400 font-black animate-pulse">EXECUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-fuchsia-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Thread Profiler</span>
                      <span className="text-xs text-white font-bold">JavaScript V8 vs WebAssembly</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Top: Browser UI (Main Thread Representation) */}
                  <div className={`border-2 rounded-xl p-4 mb-4 transition-all duration-300 ${
                      !isWasmEnabled && isPlaying && activeStep >= 3 ? 'border-red-500 bg-red-950/20 translate-x-[2px] translate-y-[-2px]' : 'border-slate-800 bg-slate-900'
                  }`}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white flex items-center">
                              <span className="mr-2 text-xl">🌐</span> Main UI Thread (JS)
                          </span>
                          <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              fps < 30 ? 'bg-red-950 text-red-500' : 'bg-emerald-950 text-emerald-400'
                          }`}>
                              {fps} FPS
                          </div>
                      </div>
                      
                      {/* UI Stutter Simulation */}
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r from-blue-500 to-fuchsia-500 ${
                              !isWasmEnabled && isPlaying && activeStep >= 3 ? 'w-[40%] animate-pulse' : 'w-[80%]'
                          }`}></div>
                      </div>
                      {!isWasmEnabled && isPlaying && activeStep >= 3 && (
                          <div className="text-[8px] text-red-400 font-mono mt-2 animate-pulse uppercase font-bold text-center">UI Stuttering! Thread Blocked.</div>
                      )}
                      
                      {/* Performance Bar (CPU) */}
                      <div className="mt-4 bg-black p-2 rounded flex items-center font-mono text-[9px]">
                          <span className="text-slate-500 w-16">CPU Load:</span>
                          <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded">
                              <div className={`h-full rounded ${
                                  cpuLoad > 80 ? 'bg-red-500 w-[98%]' : 'bg-emerald-500 w-[4%]'
                              }`}></div>
                          </div>
                          <span className={cpuLoad > 80 ? 'text-red-500' : 'text-emerald-500'}>{cpuLoad}%</span>
                      </div>
                  </div>

                  {/* Middle: Audio Stream Graphic */}
                  <div className="flex-1 flex items-center justify-center relative my-2 min-h-[100px]">
                      
                      {isPlaying && activeStep >= 2 ? (
                          <div className="w-full flex justify-between items-end h-16 px-4">
                              {/* Audio Spectrum Bars */}
                              {[...Array(16)].map((_, i) => (
                                  <div 
                                      key={i} 
                                      className={`w-2 rounded-t-sm transition-all ${
                                          isWasmEnabled ? 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]' : 'bg-red-500'
                                      }`}
                                      style={{ 
                                          height: !isWasmEnabled && activeStep >= 3 ? `${Math.random() * 20 + 10}%` : `${Math.random() * 80 + 20}%`,
                                          animation: isWasmEnabled ? `bounce ${0.5 + Math.random()}s infinite alternate` : 'none',
                                          opacity: !isWasmEnabled && activeStep >= 3 ? 0.3 : 1
                                      }}
                                  ></div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-[10px] text-slate-600 font-mono italic">Audio Stream Offline</div>
                      )}
                      
                      {!isWasmEnabled && isPlaying && activeStep >= 3 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-red-950/80 border border-red-500 text-red-400 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest backdrop-blur-sm shadow-xl">
                                  Buffer Underrun (Audio Glitch)
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Bottom: Background Worker Thread */}
                  <div className={`border-2 rounded-xl p-4 mt-4 transition-all duration-500 ${
                      isWasmEnabled && isPlaying && activeStep >= 3 ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-slate-900'
                  }`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white mb-2 flex items-center justify-between">
                          <span className="flex items-center"><span className="mr-2 text-xl">⚙️</span> AudioWorklet (WebAssembly)</span>
                          {isWasmEnabled && isPlaying && activeStep >= 3 && (
                              <span className="bg-emerald-900 text-emerald-400 px-1 rounded text-[7px] animate-pulse">PROCESSING C++</span>
                          )}
                      </span>
                      
                      <div className="bg-black/50 p-2 rounded border border-slate-800 font-mono text-[8px] text-slate-500 h-16 flex flex-col justify-center">
                          {isWasmEnabled && isPlaying && activeStep >= 3 ? (
                              <>
                                  <div className="text-emerald-400">0x00A1: call $compute_fft</div>
                                  <div className="text-emerald-400">0x00A5: f32.store (Bass Boost)</div>
                                  <div className="text-emerald-400">Execution time: 0.2ms</div>
                              </>
                          ) : (
                              <div className="text-center italic">Thread Idle.</div>
                          )}
                      </div>
                  </div>

                  {/* Custom Keyframes embedded for animation */}
                  <style>{`
                      @keyframes bounce {
                          0% { transform: scaleY(0.5); }
                          100% { transform: scaleY(1.2); }
                      }
                  `}</style>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#110515] p-4 rounded-xl border border-fuchsia-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-fuchsia-400 uppercase block mb-1">WebAssembly Acceleration:</span>
               With WASM OFF, click Process Audio. The app attempts to run intense audio equalization logic directly in standard JavaScript. Because JS is single-threaded, this blocks the Main UI thread. The CPU spikes to 99%, the frame rate drops to 12 FPS, the UI stutters, and the audio glitches (Buffer Underrun).<br/><br/>Toggle <span className="text-fuchsia-400 font-bold bg-slate-800 px-1 rounded">Compute Architecture</span> ON. Eventra now uses an isolated `AudioWorklet` running native-speed WebAssembly (compiled from Rust). The heavy DSP math is processed instantly in the background thread. The Main UI thread remains completely unblocked, running at a buttery-smooth 60 FPS while flawless audio plays.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WasmAudioProcessing;
