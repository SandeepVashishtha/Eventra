/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebGLAudioVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Simulated WebAudio Frequency Data (0.0 to 1.0)
  const [uLowFreq, setULowFreq] = useState(0.2);
  const [uMidFreq, setUMidFreq] = useState(0.1);
  const [uHighFreq, setUHighFreq] = useState(0.1);
  const [uTime, setUTime] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'WebGL Context (WebGL2RenderingContext) initialized.' },
    { id: 2, time: '14:00:01', type: 'SYS', msg: 'Compiled Fragment Shader (GLSL) successfully.' }
  ]);

  useEffect(() => {
      let animationFrame;
      let startTime = Date.now();

      const renderLoop = () => {
          if (isPlaying) {
              setUTime((Date.now() - startTime) / 1000);
              
              // Simulate real-time audio FFT analysis
              const low = Math.sin(Date.now() / 300) * 0.4 + 0.6 + (Math.random() * 0.1);
              const mid = Math.cos(Date.now() / 450) * 0.3 + 0.5 + (Math.random() * 0.2);
              const high = Math.sin(Date.now() / 150) * 0.2 + 0.3 + (Math.random() * 0.4);
              
              setULowFreq(Math.max(0.1, Math.min(1.0, low)));
              setUMidFreq(Math.max(0.1, Math.min(1.0, mid)));
              setUHighFreq(Math.max(0.1, Math.min(1.0, high)));
              
              if (Math.random() > 0.95) {
                  addLog('SYS', `u_time: ${((Date.now() - startTime) / 1000).toFixed(2)}s | Uniforms updated.`);
              }
          } else {
              setULowFreq(0.1);
              setUMidFreq(0.1);
              setUHighFreq(0.1);
          }
          animationFrame = requestAnimationFrame(renderLoop);
      };

      animationFrame = requestAnimationFrame(renderLoop);
      return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const togglePlayback = () => {
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
          addLog('ACTION', 'Live stream engaged. Pumping WebAudio FFT data into GLSL uniforms.');
      } else {
          addLog('WARN', 'Stream paused. Uniforms resting.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07020d] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎨</span> WebGL & GLSL Shaders
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Interactive Audio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">Visualizer Component</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The "Now Playing" UI in the app is just a static album cover, which feels boring and lifeless during a high-energy electronic music festival. Eventra solves this by creating a custom React component that uses WebGL and custom GLSL fragment shaders to render a stunning, 60fps interactive audio visualizer. The shader dynamically reacts to the WebAudio API's frequency data from the live stream, generating morphing liquid gradients and particles directly in the browser DOM.
          </p>

          <div className="bg-[#110514] rounded-3xl p-6 border border-purple-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-purple-900/30 pb-4">
               <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> WebAudio & GPU Pipeline
               </h3>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* GLSL Uniforms */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isPlaying ? 'bg-fuchsia-950/20 border-fuchsia-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">
                   u_lowFreq (Bass)
                 </span>
                 <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                     <div className="bg-fuchsia-500 h-full transition-all duration-75" style={{ width: `${uLowFreq * 100}%` }}></div>
                 </div>
                 <span className="text-xs font-mono text-fuchsia-400 mt-2 block font-bold">{uLowFreq.toFixed(3)}</span>
               </div>
               
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isPlaying ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">
                   u_midFreq (Mids)
                 </span>
                 <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                     <div className="bg-purple-500 h-full transition-all duration-75" style={{ width: `${uMidFreq * 100}%` }}></div>
                 </div>
                 <span className="text-xs font-mono text-purple-400 mt-2 block font-bold">{uMidFreq.toFixed(3)}</span>
               </div>
               
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isPlaying ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">
                   u_highFreq (Treble)
                 </span>
                 <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                     <div className="bg-cyan-500 h-full transition-all duration-75" style={{ width: `${uHighFreq * 100}%` }}></div>
                 </div>
                 <span className="text-xs font-mono text-cyan-400 mt-2 block font-bold">{uHighFreq.toFixed(3)}</span>
               </div>

             </div>
             
             {/* GLSL Code Snippet */}
             <div className="mb-4 bg-[#0a030c] border border-slate-800 rounded-xl p-3">
                 <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-2">fragment_shader.glsl</span>
                 <pre className="text-[9px] font-mono text-slate-400 leading-tight">
<span className="text-pink-400">uniform</span> float u_time;<br/>
<span className="text-pink-400">uniform</span> float u_lowFreq;<br/>
<span className="text-pink-400">void</span> <span className="text-blue-400">main</span>() {'{'}<br/>
{'  '}vec2 uv = gl_FragCoord.xy / u_resolution.xy;<br/>
{'  '}vec3 color = vec3(0.0);<br/>
{'  '}color += <span className="text-blue-400">sin</span>(uv.x * <span className="text-purple-400">10.0</span> + u_time) * u_lowFreq;<br/>
{'  '}gl_FragColor = vec4(color, <span className="text-purple-400">1.0</span>);<br/>
{'}'}
                 </pre>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050106] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>GPU Render Loop Log</span>
                 {isPlaying && <span className="text-purple-400 font-black animate-pulse">60 FPS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-500 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
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
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Mobile App Simulator */}
            <div className={`w-full bg-[#09090b] rounded-[2.5rem] border-[12px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[650px] overflow-hidden font-sans mb-6`}>
              
              {/* Status Bar */}
              <div className="h-6 flex justify-between items-center px-6 text-white text-[10px] font-bold z-20 absolute top-0 w-full pt-4">
                  <span>9:41</span>
                  <div className="flex space-x-1 items-center">
                      <span>5G</span>
                  </div>
              </div>

              <div className="flex-1 flex flex-col relative">
                  
                  {/* WebGL Canvas Simulator (Background) */}
                  <div className="absolute inset-0 bg-black overflow-hidden pointer-events-none z-0">
                      
                      {isPlaying ? (
                          <div className="relative w-full h-full">
                              {/* Layer 1: Base color pulse */}
                              <div 
                                  className="absolute inset-0 transition-all duration-[50ms]"
                                  style={{
                                      background: `radial-gradient(circle at 50% 30%, rgba(${uLowFreq * 180}, 0, ${uHighFreq * 255}, 0.8), #09090b 70%)`
                                  }}
                              ></div>
                              
                              {/* Layer 2: Morphing Blobs (Mid/High) */}
                              <div 
                                  className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] transition-all duration-[75ms] mix-blend-screen opacity-70 blur-2xl"
                                  style={{
                                      background: `conic-gradient(from ${uTime * 50}deg, transparent, rgba(236, 72, 153, ${uMidFreq}), transparent)`,
                                      transform: `scale(${1 + uLowFreq * 0.5}) rotate(${uTime * 10}deg)`
                                  }}
                              ></div>

                              {/* Layer 3: High frequency "sparkles/fractals" */}
                              <div 
                                  className="absolute inset-0 transition-all duration-[20ms] mix-blend-color-dodge opacity-50"
                                  style={{
                                      background: `repeating-radial-gradient(circle at ${50 + Math.sin(uTime)*10}% ${50 + Math.cos(uTime)*10}%, transparent 0, rgba(6, 182, 212, ${uHighFreq}) ${10 + uLowFreq * 20}px, transparent ${20 + uMidFreq * 30}px)`
                                  }}
                              ></div>
                              
                              {/* Layer 4: CRT Scanline overlay for that digital feel */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-overlay pointer-events-none"></div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black"></div>
                      )}
                  </div>

                  {/* UI Overlay */}
                  <div className="flex-1 flex flex-col justify-end p-6 z-10 relative bg-gradient-to-t from-black via-black/60 to-transparent">
                      
                      <div className="w-full flex justify-between items-start mb-6">
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Live Stream</span>
                          <span className="text-xl">⋮</span>
                      </div>

                      <h2 className="text-3xl font-black text-white mb-1 shadow-black drop-shadow-md">Neon Desert 2026</h2>
                      <p className="text-sm font-bold text-fuchsia-400 mb-8 shadow-black drop-shadow-md">DJ Snake • Main Stage</p>
                      
                      {/* Playback Controls */}
                      <div className="flex items-center justify-between mb-8">
                          <button className="text-white/60 hover:text-white text-2xl transition">⏮</button>
                          
                          <button 
                            onClick={togglePlayback}
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all shadow-xl backdrop-blur-md ${
                                isPlaying ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                            }`}
                          >
                              {isPlaying ? '⏸' : '▶'}
                          </button>
                          
                          <button className="text-white/60 hover:text-white text-2xl transition">⏭</button>
                      </div>

                  </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#110514] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">GPU Accelerated Rendering:</span>
               Click the <span className="text-white font-bold bg-white/10 border border-white/20 px-2 py-0.5 rounded">Play Button</span>. The WebGL `<span className="text-pink-400 font-mono">fragment_shader.glsl</span>` generates the visualizer directly on the GPU at 60fps using math (sines, cosines, gradients), utilizing zero video bandwidth.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebGLAudioVisualizer;
