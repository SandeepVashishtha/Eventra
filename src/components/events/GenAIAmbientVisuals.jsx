/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenAIAmbientVisuals = () => {
  const [engineActive, setEngineActive] = useState(false);
  
  // Audio State
  const [bass, setBass] = useState(0.2);
  const [mid, setMid] = useState(0.4);
  const [treble, setTreble] = useState(0.6);
  
  // AI Metrics
  const [fps, setFps] = useState(0); 
  const [latency, setLatency] = useState(0); // ms
  const [activeModel, setActiveModel] = useState('StableDiffusion-XL-Turbo'); 
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'WebAudio API contexts initialized.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting line-in audio feed to begin generative synthesis.' }
  ]);

  // Environment State
  const [currentPrompt, setCurrentPrompt] = useState('Cyberpunk neon liquid fractals, highly detailed, 8k, unreal engine 5');
  const [visualSeed, setVisualSeed] = useState(1);

  useEffect(() => {
    let loop;
    
    if (engineActive) {
      // Simulate live audio frequency data
      loop = setInterval(() => {
          const newBass = Math.random();
          const newMid = Math.random();
          const newTreble = Math.random();
          
          setBass(newBass);
          setMid(newMid);
          setTreble(newTreble);
          
          setFps(55 + Math.random() * 5);
          setLatency(20 + Math.random() * 15);
          
          // Change prompt on major bass drop
          if (newBass > 0.9) {
              const prompts = [
                  'Cyberpunk neon liquid fractals, highly detailed',
                  'Cosmic galactic nebula exploding in deep space',
                  'Geometric sacred patterns rotating, synthwave sunset',
                  'Bioluminescent deep sea creatures glowing underwater'
              ];
              setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
              setVisualSeed(prev => prev + 1);
              addLog('ACTION', 'BASS DROP DETECTED (0.9+). Injecting new latent noise prompt.');
          }
          
      }, 300); // 300ms polling for visual simulation
    } else {
      setFps(0);
      setLatency(0);
      setBass(0.1);
      setMid(0.1);
      setTreble(0.1);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [engineActive]);

  const toggleEngine = () => {
      setEngineActive(!engineActive);
      if (!engineActive) {
          addLog('SUCCESS', 'WebAudio API actively capturing line-in. Generative pipeline online.');
      } else {
          addLog('WARN', 'Engine paused. Falling back to static VJ loop.');
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
            <span className="mr-2">🧠</span> WebAudio & Generative AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Visuals <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500">Synced to Live DJ Audio</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Smaller stages cannot afford dedicated VJs (Visual Jockeys) to mix live video content, resulting in static, boring logos looping behind the DJ for hours. Eventra solves this by building a web-based Generative AI visualizer UI. The browser uses the WebAudio API to split the live audio feed into stems. It feeds these audio frequencies as continuous parameters into an integrated Stable Diffusion API, rendering dynamic, hallucinated 60fps visuals on the screen that react perfectly in sync with the music.
          </p>

          <div className="bg-[#110517] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Gen-AI Rendering Pipeline
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleEngine}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     engineActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {engineActive ? 'Halt Real-Time Rendering' : 'Start Generative Pipeline'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Current Prompt */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-fuchsia-950/20 border-fuchsia-500/30' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Text-To-Image Prompt
                 </span>
                 <div className="flex items-end h-10">
                   <span className={`text-[10px] font-mono leading-tight transition-colors duration-300 ${
                     engineActive ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     "{currentPrompt}"
                   </span>
                 </div>
               </div>

               {/* FPS */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 engineActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Render Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     engineActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {fps.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">fps</span>
                 </div>
               </div>
               
               {/* Latency */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   API Latency
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {latency.toFixed(0)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#09020d] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Stable Diffusion SDXL Turbo Log</span>
                 {engineActive && <span className="text-purple-400 font-black animate-pulse">GENERATING FRAMES...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-500 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* Real-time LED Wall Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[320px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                engineActive ? 'bg-[#0f0c05] border-purple-900/50 shadow-[0_0_30px_rgba(147,51,234,0.3)]' : 'bg-slate-900 border-[#1e293b]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">STAGE LED WALL (VISUALIZER)</span>
                <span className={`text-[8px] font-mono ${engineActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    SDXL {visualSeed}
                </span>
              </div>

              {/* Generative AI Visual Canvas */}
              <div className="flex-1 relative w-full h-full bg-black overflow-hidden flex items-center justify-center pt-8">
                  
                  {engineActive ? (
                      <div className="relative w-full h-full">
                          {/* Simulated Generative Visual */}
                          <div 
                              className="absolute inset-0 transition-all duration-[300ms] ease-out mix-blend-screen"
                              style={{
                                  background: `radial-gradient(circle at ${50 + (mid * 20 - 10)}% ${50 + (treble * 20 - 10)}%, rgba(${Math.floor(bass * 255)}, 0, ${Math.floor(treble * 255)}, 0.8), transparent ${bass * 80 + 20}%)`,
                                  transform: `scale(${1 + bass * 0.5}) rotate(${treble * 45}deg)`,
                                  filter: `hue-rotate(${visualSeed * 90}deg) blur(${1 - treble}px)`
                              }}
                          ></div>
                          <div 
                              className="absolute inset-0 transition-all duration-[300ms] ease-out mix-blend-color-dodge"
                              style={{
                                  background: `conic-gradient(from ${mid * 360}deg, transparent, rgba(0, 255, 255, ${treble}), transparent)`,
                                  transform: `scale(${1 + mid * 0.3})`
                              }}
                          ></div>
                          <div 
                              className="absolute inset-0 transition-all duration-[100ms] ease-out"
                              style={{
                                  boxShadow: `inset 0 0 ${bass * 100}px rgba(255,0,255, ${bass})`
                              }}
                          ></div>
                      </div>
                  ) : (
                      <div className="text-center opacity-30">
                          <span className="text-4xl block mb-2">👾</span>
                          <span className="text-[10px] font-mono tracking-widest uppercase">Visualizer Offline</span>
                      </div>
                  )}

              </div>
            </div>

            {/* Audio Stem Analyzer UI */}
            <div className="w-full bg-[#0d0214] p-4 rounded-xl border border-slate-800 text-[10px] text-slate-400">
               <span className="font-bold text-purple-400 uppercase tracking-widest block mb-4 border-b border-slate-800 pb-2">WebAudio Frequency Stems (Params)</span>
               
               <div className="space-y-4">
                   <div className="flex items-center">
                       <span className="w-16 font-mono text-slate-500">BASS</span>
                       <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 left-0 h-full bg-pink-500 transition-all duration-100 ease-out" style={{ width: `${bass * 100}%` }}></div>
                       </div>
                   </div>
                   <div className="flex items-center">
                       <span className="w-16 font-mono text-slate-500">MID</span>
                       <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-100 ease-out" style={{ width: `${mid * 100}%` }}></div>
                       </div>
                   </div>
                   <div className="flex items-center">
                       <span className="w-16 font-mono text-slate-500">TREBLE</span>
                       <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-100 ease-out" style={{ width: `${treble * 100}%` }}></div>
                       </div>
                   </div>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GenAIAmbientVisuals;
