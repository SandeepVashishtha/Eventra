/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WasmAudioMixer = () => {
  const [engine, setEngine] = useState('JS'); // 'JS' or 'WASM'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Audio Mixer State
  const [gain, setGain] = useState(70);
  const [lowEQ, setLowEQ] = useState(50);
  const [midEQ, setMidEQ] = useState(60);
  const [highEQ, setHighEQ] = useState(40);
  const [compression, setCompression] = useState(30);

  // Performance Metrics
  const [latency, setLatency] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Browser AudioContext initialized.' },
    { id: 2, time: '10:00:01', type: 'SYS', msg: 'Awaiting DSP engine selection for Front-Of-House mixing.' }
  ]);

  // Spectrum Analyzer Visualization State
  const [spectrum, setSpectrum] = useState(Array(16).fill(0));

  useEffect(() => {
    let loop;
    if (isProcessing) {
        let frameCount = 0;
        
        // Polling interval changes based on engine to simulate lag
        const tickRate = engine === 'JS' ? 120 : 16; // JS stutters (120ms tick), WASM is smooth (16ms tick - 60fps)
        
        loop = setInterval(() => {
            frameCount++;
            
            // Randomize spectrum based on EQ inputs to simulate live audio processing
            const newSpectrum = Array(16).fill(0).map((_, i) => {
                let base = Math.random() * 40;
                if (i < 5) base += (lowEQ / 100) * 50;
                else if (i < 11) base += (midEQ / 100) * 50;
                else base += (highEQ / 100) * 50;
                
                return Math.min(100, base * (gain / 50));
            });
            setSpectrum(newSpectrum);

            if (engine === 'JS') {
                // Simulate JavaScript struggling with DSP math
                setLatency(65 + Math.random() * 40);
                setCpuLoad(85 + Math.random() * 15);
                if (frameCount % 4 === 0) setDroppedFrames(prev => prev + Math.floor(Math.random() * 3) + 1);
            } else {
                // Simulate C++ Wasm flying through DSP math
                setLatency(1.2 + Math.random() * 0.5);
                setCpuLoad(12 + Math.random() * 5);
            }
        }, tickRate);
    } else {
        setSpectrum(Array(16).fill(0));
        setLatency(0);
        setCpuLoad(0);
    }
    return () => { if (loop) clearInterval(loop); };
  }, [isProcessing, engine, gain, lowEQ, midEQ, highEQ]);

  const toggleEngine = (mode) => {
      setEngine(mode);
      setIsProcessing(false);
      setDroppedFrames(0);
      
      if (mode === 'WASM') {
          addLog('ACTION', 'Downloading 4.2MB C++ DSP Engine...');
          setTimeout(() => {
              addLog('SUCCESS', 'Wasm binary compiled and instantiated in 142ms. WebAudio Worklet registered.');
          }, 600);
      } else {
          addLog('WARN', 'Falling back to single-threaded V8 JavaScript DSP processing.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#110c08] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚙️</span> C++ & WebAssembly (Wasm)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Offline Audio Mixing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">Powered by WebAssembly</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Audio engineers need to adjust complex EQ and compression settings via a web interface dashboard, but single-threaded Javascript is entirely too slow to process high-fidelity DSP math in the browser without massive latency and audio artifacting. Eventra solves this by rewriting the core Digital Signal Processing (DSP) algorithms in C++ and compiling them to WebAssembly (Wasm). The React dashboard loads this binary Wasm module, allowing audio engineers to process multi-track audio and adjust complex mixes natively in the browser at near-C speeds without needing a desktop app.
          </p>

          <div className="bg-[#1f150f] rounded-3xl p-6 border border-orange-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-orange-900/30 pb-4">
               <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> DSP Engine Selection
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={() => toggleEngine('JS')}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engine === 'JS' ? 'bg-slate-800 text-slate-300 border border-slate-600' :
                     'bg-[#110c08] border border-slate-800 text-slate-500 hover:bg-slate-800'
                   }`}
                 >
                   Legacy JS AudioNode
                 </button>
                 <button 
                   onClick={() => toggleEngine('WASM')}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engine === 'WASM' ? 'bg-orange-900/40 text-orange-400 border border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                     'bg-[#110c08] border border-slate-800 text-slate-500 hover:bg-slate-800'
                   }`}
                 >
                   C++ Wasm AudioWorklet
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* DSP Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isProcessing ? (engine === 'JS' ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/20 border-emerald-900/50') : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Audio Buffer Latency
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     isProcessing ? (engine === 'JS' ? 'text-red-400' : 'text-emerald-400') : 'text-slate-600'
                   }`}>
                     {latency.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* CPU Load */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isProcessing ? (engine === 'JS' ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800') : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Main Thread CPU
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         isProcessing ? (engine === 'JS' ? 'text-red-400' : 'text-amber-400') : 'text-slate-600'
                       }`}>
                         {cpuLoad.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                     </div>
                 </div>
               </div>

               {/* Dropped Frames */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 droppedFrames > 0 ? 'bg-red-950/30 border-red-900/60' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Audio Dropout Count
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${droppedFrames > 0 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                         {droppedFrames}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pops</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#0a0705] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>AudioWorklet Runtime Log</span>
                 {isProcessing && <span className="text-orange-400 font-black animate-pulse">PROCESSING AUDIO BUFFERS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-400 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' : 'text-slate-400'
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
            
            {/* Front-Of-House (FOH) Mixer Simulator */}
            <div className={`w-full bg-[#18181b] rounded-2xl border-4 ${engine === 'WASM' ? 'border-[#3f3f46]' : 'border-[#27272a]'} shadow-2xl relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-[#09090b] border-b border-[#27272a] p-3 flex justify-between items-center z-10">
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">FOH Master Console</span>
                  </div>
                  <button
                    onClick={() => {
                        setIsProcessing(!isProcessing);
                        if (!isProcessing) addLog('SYS', `Engaging master bus using ${engine} processor.`);
                        else addLog('SYS', `Master bus disengaged.`);
                    }}
                    className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition ${
                        isProcessing ? 'bg-red-900/40 text-red-500 border border-red-900/50 hover:bg-red-900/60' : 'bg-emerald-900/40 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/60'
                    }`}
                  >
                      {isProcessing ? 'Bypass' : 'Engage Processing'}
                  </button>
              </div>

              <div className="flex-1 flex flex-col p-4 bg-[#18181b]">
                  
                  {/* Spectrum Analyzer Screen */}
                  <div className="w-full h-32 bg-black rounded-lg border-2 border-[#27272a] mb-6 relative overflow-hidden flex items-end justify-between px-2 pt-2 pb-0">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                      
                      {/* Spectrum Bars */}
                      {spectrum.map((val, idx) => (
                          <div 
                              key={idx} 
                              className={`w-4 rounded-t-sm transition-all ${engine === 'JS' ? 'duration-150' : 'duration-[20ms] ease-linear'}`} 
                              style={{ 
                                  height: `${val}%`,
                                  background: `linear-gradient(to top, #10b981 0%, #eab308 60%, #ef4444 100%)`,
                                  opacity: isProcessing ? 0.9 : 0.2
                              }}
                          ></div>
                      ))}

                      {/* Warning Overlay for JS mode dropped frames */}
                      {isProcessing && engine === 'JS' && Math.random() > 0.8 && (
                          <div className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none mix-blend-color"></div>
                      )}
                  </div>

                  {/* EQ & Compression Controls */}
                  <div className="grid grid-cols-4 gap-4 flex-1">
                      
                      {/* Low EQ */}
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-zinc-500 mb-2">LOW</span>
                          <input 
                              type="range" min="0" max="100" value={lowEQ} onChange={(e) => setLowEQ(parseInt(e.target.value))}
                              className="w-2 h-32 appearance-none bg-zinc-800 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-sm cursor-ns-resize"
                              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                          />
                          <span className="text-[10px] font-mono text-zinc-400 mt-2">{lowEQ}</span>
                      </div>
                      
                      {/* Mid EQ */}
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-zinc-500 mb-2">MID</span>
                          <input 
                              type="range" min="0" max="100" value={midEQ} onChange={(e) => setMidEQ(parseInt(e.target.value))}
                              className="w-2 h-32 appearance-none bg-zinc-800 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-sm cursor-ns-resize"
                              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                          />
                          <span className="text-[10px] font-mono text-zinc-400 mt-2">{midEQ}</span>
                      </div>

                      {/* High EQ */}
                      <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-zinc-500 mb-2">HIGH</span>
                          <input 
                              type="range" min="0" max="100" value={highEQ} onChange={(e) => setHighEQ(parseInt(e.target.value))}
                              className="w-2 h-32 appearance-none bg-zinc-800 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-sm cursor-ns-resize"
                              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                          />
                          <span className="text-[10px] font-mono text-zinc-400 mt-2">{highEQ}</span>
                      </div>

                      {/* Master Gain Slider */}
                      <div className="flex flex-col items-center bg-zinc-900 rounded-lg py-2 border border-zinc-800">
                          <span className="text-[9px] font-bold text-red-500 mb-2">MASTER</span>
                          <input 
                              type="range" min="0" max="100" value={gain} onChange={(e) => setGain(parseInt(e.target.value))}
                              className="w-3 h-32 appearance-none bg-black rounded-full outline-none border border-zinc-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-sm cursor-ns-resize"
                              style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                          />
                          <span className="text-[10px] font-mono text-white mt-2 font-bold">{gain}</span>
                      </div>

                  </div>
                
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#1f150f] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">C++ Execution Native in Browser:</span>
               Try running the <span className="text-red-400 font-mono">Legacy JS AudioNode</span> and watch the spectrum analyzer stutter (120ms latency) while CPU spikes. Then switch to <span className="text-emerald-400 font-mono">C++ Wasm</span> and watch it run a buttery smooth 60fps spectrum analysis with ~1ms latency.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WasmAudioMixer;
