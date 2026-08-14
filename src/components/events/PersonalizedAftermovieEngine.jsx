/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PersonalizedAftermovieEngine = () => {
  const [isRendering, setIsRendering] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);
  const [renderStep, setRenderStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'FFMPEG Serverless Cluster standing by. Ready for encoding jobs.' }
  ]);

  const artists = ['Odesza', 'Skrillex', 'Fred Again..'];

  const triggerRender = () => {
      setIsRendering(true);
      setRenderComplete(false);
      setRenderStep(1);
      addLog('ACTION', `User 'alex_fest26' requested personalized aftermovie for: ${artists.join(', ')}`);
      
      setTimeout(() => {
          setRenderStep(2);
          addLog('SYS', 'Serverless Worker scaling up... Executing FFMPEG concat protocol.');
          
          setTimeout(() => {
              addLog('WARN', 'Splicing pre-rendered 4K artist clips. Applying crossfade transitions.');
              
              setTimeout(() => {
                  setRenderStep(3);
                  addLog('SYS', 'Overlaying dynamic watermark: "@alex_fest26 Eventra 2026"');
                  
                  setTimeout(() => {
                      setRenderStep(4);
                      addLog('WARN', 'H.264 Multipass Encoding in progress... Target: 1080p, 60fps, 5MB.');
                      
                      setTimeout(() => {
                          setIsRendering(false);
                          setRenderComplete(true);
                          addLog('SUCCESS', 'Encoding complete (14.2s). MP4 artifact uploaded to S3. Ready for social share.');
                      }, 2000);
                  }, 1500);
              }, 1500);
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsRendering(false);
      setRenderComplete(false);
      setRenderStep(0);
      addLog('SYS', 'Pipeline reset. Awaiting new render job.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070205] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎬</span> Video Processing & Serverless
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Personalized Aftermovie <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500">Cloud Encoding Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees want a summary video of their festival experience, but traditional video editors can only produce one generic aftermovie that releases 3 months later. Eventra solves this by building an automated FFMPEG processing pipeline. Users select their top attended sets in the app. The backend instantly triggers a serverless worker that splices pre-rendered HD footage of those specific artists, overlays the user's username, and dynamically encodes a personalized 30-second MP4 aftermovie for immediate social sharing.
          </p>

          <div className="bg-[#120309] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🎛️</span> Serverless Job Dispatcher
               </h3>
               {renderComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Selection UI */}
                 <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col mb-6">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">User Selected Artists</span>
                     <div className="flex space-x-2">
                         {artists.map(artist => (
                             <span key={artist} className="bg-fuchsia-900/30 text-fuchsia-300 border border-fuchsia-500/30 px-3 py-1.5 rounded-lg text-xs font-bold">
                                 {artist}
                             </span>
                         ))}
                     </div>
                     <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                         <span className="text-[10px] text-slate-500 font-mono">User: @alex_fest26</span>
                         <span className="text-[10px] text-slate-500 font-mono">Output: 1080x1920 (9:16)</span>
                     </div>
                 </div>

                 <button 
                     onClick={triggerRender}
                     disabled={isRendering || renderComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         renderComplete ? 'bg-emerald-900/40 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         isRendering ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.3)]'
                     }`}
                 >
                     {isRendering ? 'Executing FFMPEG Worker...' : renderComplete ? 'Render Successful' : 'Generate Personalized Aftermovie'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050103] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cloud Encoding Logs</span>
                 {isRendering && <span className="text-fuchsia-400 font-black animate-pulse">RENDERING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">FFMPEG Pipeline</span>
                      <span className="text-xs text-white font-bold">Serverless Video Generator</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-center">
                  
                  {/* Pre-render State */}
                  {renderStep === 0 && (
                      <div className="flex flex-col items-center opacity-50">
                          <span className="text-6xl mb-4 grayscale">🎞️</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Awaiting Render Job</span>
                      </div>
                  )}

                  {/* Rendering Pipeline Animation */}
                  {isRendering && (
                      <div className="w-full flex flex-col items-center">
                          <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                          
                          <div className="w-full max-w-xs space-y-4">
                              <div className={`flex items-center text-xs font-bold ${renderStep >= 2 ? 'text-white' : 'text-slate-700'} transition-colors duration-500`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${renderStep >= 2 ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                                  Splicing MP4 Artist Chunks
                              </div>
                              <div className={`flex items-center text-xs font-bold ${renderStep >= 3 ? 'text-white' : 'text-slate-700'} transition-colors duration-500`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${renderStep >= 3 ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                                  Applying dynamic watermark
                              </div>
                              <div className={`flex items-center text-xs font-bold ${renderStep >= 4 ? 'text-white' : 'text-slate-700'} transition-colors duration-500`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${renderStep >= 4 ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
                                  H.264 Multipass Encoding
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Final Result */}
                  {renderComplete && (
                      <div className="w-full flex flex-col items-center animate-fade-in-up">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 block text-center">Output Generated</span>
                          
                          {/* Mock Mobile Video Player */}
                          <div className="w-36 h-64 bg-slate-800 rounded-xl border-4 border-slate-700 relative overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                              
                              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 via-purple-900 to-black flex flex-col justify-end p-3 pb-8">
                                  {/* Fake Watermark */}
                                  <div className="absolute top-3 left-3 text-[8px] font-black text-white/50 bg-black/50 px-2 py-0.5 rounded">
                                      @alex_fest26
                                  </div>
                                  <div className="absolute top-3 right-3 text-[8px] font-black text-white/50 bg-black/50 px-2 py-0.5 rounded">
                                      Eventra '26
                                  </div>
                                  
                                  {/* Fake UI */}
                                  <div className="text-white font-bold text-[10px] mb-1">My Festival Recap 🚀</div>
                                  <div className="text-fuchsia-300 text-[8px]">#Odesza #Skrillex</div>
                              </div>
                              
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white pl-1 shadow-lg">
                                      ▶
                                  </div>
                              </div>
                          </div>
                          
                          <button className="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs px-6 py-2 rounded-full shadow-lg flex items-center">
                              <span className="mr-2">↗️</span> Share to Instagram
                          </button>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120309] p-4 rounded-xl border border-fuchsia-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-fuchsia-400 uppercase block mb-1">Automated Video Production:</span>
               Click <span className="text-white font-bold bg-fuchsia-600 px-1 rounded">Generate</span>. Instead of hiring video editors to manually compile thousands of recaps, the backend dynamically provisions a serverless worker. Using FFMPEG, it programmatically splices the pre-rendered HD clips of the specific artists the user requested. It burns a dynamic text watermark into the video frames and encodes it directly to H.264, delivering a personalized, shareable MP4 in under 15 seconds.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PersonalizedAftermovieEngine;
