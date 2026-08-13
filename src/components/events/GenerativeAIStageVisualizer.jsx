/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenerativeAIStageVisualizer = () => {
  const [renderActive, setRenderActive] = useState(false);
  const [bpm, setBpm] = useState(128); // Standard house BPM
  const [vibePrompt, setVibePrompt] = useState('Cyberpunk neon city dissolving into a jungle');
  
  // Simulation states
  const [transientSpike, setTransientSpike] = useState(false);
  const [visualState, setVisualState] = useState('city'); // 'city' or 'jungle'
  const [renderFrame, setRenderFrame] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'Stable Video Diffusion API connected to Resolume Arena.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting DJ audio input for transient analysis.' }
  ]);

  useEffect(() => {
    let audioLoop;
    if (renderActive) {
      // Simulate audio transients (kicks/snares) based on BPM
      const msPerBeat = 60000 / bpm;
      
      audioLoop = setInterval(() => {
        // Trigger a spike on the beat
        setTransientSpike(true);
        
        // Also advance the generative AI "seed" or "frame"
        setRenderFrame(prev => prev + 1);
        
        // Randomly morph between the prompt subjects every few beats
        if (Math.random() > 0.8) {
          setVisualState(prev => prev === 'city' ? 'jungle' : 'city');
          addLog('AI', `Morphing latent space: Transitioning to [${visualState === 'city' ? 'jungle' : 'city'}]`);
        }

        setTimeout(() => {
          setTransientSpike(false);
        }, 150); // Spike lasts 150ms
        
      }, msPerBeat);
    }
    
    return () => { if (audioLoop) clearInterval(audioLoop); };
  }, [renderActive, bpm, visualState]);

  const handlePromptChange = (e) => {
    setVibePrompt(e.target.value);
  };

  const toggleRenderer = () => {
    if (!renderActive) {
      setRenderActive(true);
      addLog('ACTION', `Artist Prompt Locked: "${vibePrompt}"`);
      addLog('SYS', 'Engaging real-time generative video rendering pipeline. 4K Output active.');
    } else {
      setRenderActive(false);
      setRenderFrame(0);
      addLog('WARN', 'Generative API disconnected. Falling back to static logo.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Generative AI Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎨</span> Real-time Stable Video Diffusion
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Stage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">Visualizer API</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Smaller artists on side stages cannot afford expensive VJs (Video Jockeys) to create custom 3D visuals, resulting in boring static logos on massive LED screens. Eventra solves this by integrating its media server directly with a real-time Generative AI video model. The artist simply inputs a textual vibe prompt before their set. The AI listens to the live audio BPM and generates perfectly synced, continuously evolving 4K visuals on the fly, entirely replacing the need for pre-rendered video files.
          </p>

          <div className="bg-[#050f0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🎛️</span> AI Render Engine Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleRenderer}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     renderActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]'
                   }`}
                 >
                   {renderActive ? 'Kill AI Render' : 'Ignite Diffusion API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Audio Transient Analysis */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-100 ${
                 transientSpike ? 'bg-fuchsia-900/60 border-fuchsia-500/80 shadow-[0_0_30px_rgba(217,70,239,0.3)] scale-[1.02]' : 
                 renderActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Audio Transient Analysis
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors ${renderActive ? 'text-white' : 'text-slate-600'}`}>
                     {renderActive ? bpm : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">BPM</span>
                 </div>
                 <div className="mt-3 w-full h-8 flex items-end space-x-1 opacity-80">
                    {/* Simulated EQ Bars */}
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className={`flex-1 rounded-t-sm transition-all duration-75 ${transientSpike ? 'bg-fuchsia-400' : 'bg-slate-700'}`} style={{ height: renderActive ? (transientSpike ? `${50 + Math.random()*50}%` : `${10 + Math.random()*20}%`) : '5%' }}></div>
                    ))}
                 </div>
               </div>

               {/* Video Output Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 renderActive ? 'bg-lime-950/20 border-lime-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">GPU Tensor Pipeline</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${renderActive ? 'text-lime-400' : 'text-slate-600'}`}>
                     {renderActive ? '4K @ 60fps' : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     Frame: {renderActive ? renderFrame.toString().padStart(5, '0') : '00000'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Diffusion Model Log</span>
                 {renderActive && <span className="text-lime-400 animate-pulse">Rendering...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-lime-400 font-bold' : 
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: LED Screen Simulator & Prompt Input (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Massive LED Screen Mockup */}
            <div className={`w-full rounded-[1rem] border-[6px] border-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Side Stage IMAG (LED Wall)
                </span>
              </div>

              <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
                
                {!renderActive ? (
                  <div className="text-center opacity-40">
                    <div className="w-20 h-20 border-4 border-slate-600 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">🎵</div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Static Artist Logo</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 transition-all duration-[300ms]" style={{
                     filter: transientSpike ? 'brightness(1.5) contrast(1.2)' : 'brightness(1) contrast(1)',
                     transform: transientSpike ? 'scale(1.05)' : 'scale(1)'
                  }}>
                    {/* Generative AI Visual Simulation */}
                    {visualState === 'city' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-black relative">
                         {/* Abstract Neon Buildings */}
                         <div className="absolute bottom-0 left-[10%] w-12 h-40 bg-pink-600/20 border border-pink-500/50 blur-sm shadow-[0_0_30px_#ec4899]"></div>
                         <div className="absolute bottom-0 left-[40%] w-20 h-56 bg-cyan-600/20 border border-cyan-500/50 blur-sm shadow-[0_0_30px_#06b6d4]"></div>
                         <div className="absolute bottom-0 right-[20%] w-16 h-48 bg-purple-600/20 border border-purple-500/50 blur-sm shadow-[0_0_30px_#a855f7]"></div>
                         
                         {/* Flying Neon Cars / Tracers */}
                         <div className="absolute top-1/2 left-0 w-32 h-1 bg-white blur-[2px] opacity-80 animate-pulse" style={{ transform: `translateX(${renderFrame % 100 * 5}px)` }}></div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-green-900 via-emerald-900 to-black relative">
                         {/* Abstract Jungle Flora */}
                         <div className="absolute -bottom-10 left-[20%] w-32 h-48 bg-lime-600/20 border border-lime-500/50 rounded-t-full blur-md shadow-[0_0_40px_#84cc16] animate-pulse"></div>
                         <div className="absolute top-[20%] right-[10%] w-24 h-60 bg-emerald-600/20 border border-emerald-500/50 rounded-l-full blur-md shadow-[0_0_40px_#10b981]" style={{ transform: 'rotate(-45deg)' }}></div>
                         
                         {/* Spores / Particles */}
                         <div className="absolute top-[40%] left-[30%] w-4 h-4 bg-yellow-400 rounded-full blur-[2px] opacity-80 shadow-[0_0_15px_#facc15] animate-ping"></div>
                         <div className="absolute top-[60%] left-[70%] w-6 h-6 bg-lime-400 rounded-full blur-[2px] opacity-60 shadow-[0_0_15px_#a3e635] animate-ping" style={{ animationDelay: '200ms' }}></div>
                      </div>
                    )}
                    
                    {/* Prompt Overlay (Diagnostic) */}
                    <div className="absolute bottom-2 left-2 right-2 text-center z-10">
                      <span className="bg-black/80 text-white/50 text-[6px] font-mono uppercase px-2 py-0.5 rounded border border-white/10">
                        Prompt: {vibePrompt}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Artist Input Controls */}
            <div className="w-full bg-slate-900 p-5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 text-center">Artist Pre-Show Vibe Configurator</span>
              
              <div className="mb-4">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Generative Video Prompt</label>
                <textarea 
                  value={vibePrompt}
                  onChange={handlePromptChange}
                  disabled={renderActive}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-lime-400 font-mono outline-none focus:border-lime-500 transition disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Set Audio BPM</label>
                  <input 
                    type="range" 
                    min="80" 
                    max="175" 
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full accent-lime-500"
                  />
                </div>
                <div className="w-12 text-center bg-slate-950 border border-slate-700 rounded py-1">
                  <span className="text-xs font-black text-white">{bpm}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GenerativeAIStageVisualizer;
