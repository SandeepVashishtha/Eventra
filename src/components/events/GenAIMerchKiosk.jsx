/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenAIMerchKiosk = () => {
  const [kioskActive, setKioskActive] = useState(false);
  const [kioskState, setKioskState] = useState('IDLE'); // IDLE, GENERATING, PRINTING, DONE
  
  // Design Prompts
  const [promptInput, setPromptInput] = useState('');
  const [artistStyle, setArtistStyle] = useState('CYBERPUNK_BASS'); // CYBERPUNK_BASS, ETHEREAL_HOUSE, NEON_TECHNO
  
  // DTG Hardware Stats
  const [blankInventory, setBlankInventory] = useState(1500); // T-Shirts
  const [inkLevels, setInkLevels] = useState({ C: 98, M: 95, Y: 92, K: 99 });
  
  // Visual Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:20:00', type: 'SYS', msg: 'GenAI Merch Kiosk online.' },
    { id: 2, time: '14:20:02', type: 'SYS', msg: 'Stable Diffusion API connection established.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (kioskActive) {
      if (kioskState === 'GENERATING') {
        loop = setInterval(() => {
          setGenerationProgress(prev => {
            const next = prev + 5;
            if (next >= 100) {
              setKioskState('PRINTING');
              setGeneratedImage(`prompt_${Math.floor(Math.random()*1000)}`);
              addLog('AI', 'High-res 4K image generated successfully (Seed: 409211).');
              addLog('ACTION', 'Sending graphic to automated DTG hardware pipeline.');
              return 100;
            }
            return next;
          });
        }, 150); // Generates in ~3 seconds
      } else if (kioskState === 'PRINTING') {
        // Printing takes a bit longer
        let printStep = 0;
        loop = setInterval(() => {
          printStep++;
          
          if (printStep % 10 === 0) {
             // Consume Ink
             setInkLevels(prev => ({
                C: Math.max(0, prev.C - 1),
                M: Math.max(0, prev.M - 1),
                Y: Math.max(0, prev.Y - 1),
                K: Math.max(0, prev.K - 2)
             }));
          }

          if (printStep > 40) {
            clearInterval(loop);
            setKioskState('DONE');
            setBlankInventory(prev => prev - 1);
            addLog('SUCCESS', 'DTG Printing complete. Dispensing 1-of-1 personalized merchandise.');
          }
        }, 100);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [kioskActive, kioskState]);

  const submitPrompt = (preset) => {
    if (kioskActive && kioskState === 'IDLE') {
      setPromptInput(preset);
      setGenerationProgress(0);
      setGeneratedImage(null);
      setKioskState('GENERATING');
      addLog('SYS', `Processing Prompt: "${preset}" with style ${artistStyle}`);
    }
  };

  const resetKiosk = () => {
    setKioskState('IDLE');
    setPromptInput('');
    setGenerationProgress(0);
    setGeneratedImage(null);
    addLog('SYS', 'Kiosk reset for next attendee.');
  };

  const toggleKiosk = () => {
    if (!kioskActive) {
      setKioskActive(true);
      addLog('SYS', 'GenAI Hardware Pipeline Armed.');
    } else {
      setKioskActive(false);
      resetKiosk();
      addLog('WARN', 'Kiosk offline. Zero inventory waste mode disabled.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Kiosk Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎨</span> Dynamic Souvenir Pipeline
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Interactive <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Artist Merch Design Kiosks</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Pre-printed festival merchandise often creates massive logistical nightmares: popular sizes sell out instantly, while organizers are left with thousands of unsold shirts in unpopular designs. Eventra solves this by deploying blank-apparel printing kiosks equipped with a Generative AI interface. Attendees input unique prompts combining the headline artist's visual aesthetic with their own ideas. The AI instantly generates a 1-of-1, high-resolution graphic which is automatically Direct-to-Garment (DTG) printed onto a blank shirt right in front of them, eliminating inventory waste completely.
          </p>

          <div className="bg-[#120a11] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🖨️</span> DTG Hardware & AI Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleKiosk}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     kioskActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)]'
                   }`}
                 >
                   {kioskActive ? 'Power Down Kiosk' : 'Initialize Kiosk Pipeline'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Blank Inventory */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 blankInventory < 100 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 kioskActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Blank Apparel Inventory
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     blankInventory < 100 ? 'text-red-400 animate-pulse' :
                     kioskActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {kioskActive ? blankInventory : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units (M/L/XL)</span>
                 </div>
               </div>

               {/* Ink Levels */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 kioskState === 'PRINTING' ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 kioskActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   CMYK Ink Levels
                 </span>
                 <div className="flex space-x-2 mt-1">
                    <div className="flex flex-col items-center"><div className="w-4 h-8 bg-slate-900 border border-slate-700 flex items-end"><div className="w-full bg-cyan-500" style={{ height: `${inkLevels.C}%` }}></div></div><span className="text-[8px] mt-1 text-slate-500 font-bold">C</span></div>
                    <div className="flex flex-col items-center"><div className="w-4 h-8 bg-slate-900 border border-slate-700 flex items-end"><div className="w-full bg-pink-500" style={{ height: `${inkLevels.M}%` }}></div></div><span className="text-[8px] mt-1 text-slate-500 font-bold">M</span></div>
                    <div className="flex flex-col items-center"><div className="w-4 h-8 bg-slate-900 border border-slate-700 flex items-end"><div className="w-full bg-yellow-400" style={{ height: `${inkLevels.Y}%` }}></div></div><span className="text-[8px] mt-1 text-slate-500 font-bold">Y</span></div>
                    <div className="flex flex-col items-center"><div className="w-4 h-8 bg-slate-900 border border-slate-700 flex items-end"><div className="w-full bg-slate-400" style={{ height: `${inkLevels.K}%` }}></div></div><span className="text-[8px] mt-1 text-slate-500 font-bold">K</span></div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#090508] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Generation & Print Log</span>
                 {kioskState === 'GENERATING' && <span className="text-purple-400 animate-pulse">Running Stable Diffusion...</span>}
                 {kioskState === 'PRINTING' && <span className="text-pink-400 animate-pulse">DTG Hardware Active...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-500 font-bold' : 
                       log.type === 'AI' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* Attendee Interface Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">TOUCHSCREEN POV</span>
                <span className="text-[8px] font-mono text-slate-400">GEN-AI INTERFACE</span>
              </div>

              <div className="flex-1 relative bg-[#020308] overflow-hidden flex flex-col p-4 pt-10">
                
                {!kioskActive ? (
                   <div className="flex-1 flex items-center justify-center">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">KIOSK OFFLINE</span>
                   </div>
                ) : (
                  <>
                    {/* Prompt Box */}
                    <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mb-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Your Custom Prompt:</span>
                      <span className="text-sm font-bold text-white">{promptInput || 'Waiting for input...'}</span>
                      <div className="mt-2 flex space-x-2">
                        <span className="text-[8px] font-black uppercase bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">Artist Style: {artistStyle.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Generation / Print Visuals */}
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                       
                       {/* The Shirt Preview */}
                       <div className="relative w-48 h-48 bg-slate-800 rounded-[30px] border border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                          
                          {/* T-Shirt Outline Simulation */}
                          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzAgMjAgQzQwIDEwLCA2MCAxMCwgNzAgMjAgTDkwIDMwIEw4MCA1MCBMNzAgNDAgTDcwIDkwIEwzMCA5MCBMMzAgNDAgTDIwIDUwIEwxMCAzMCBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-center bg-no-repeat bg-[length:120px]"></div>
                          
                          {kioskState === 'IDLE' && (
                             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">INSERT PROMPT</span>
                          )}

                          {kioskState === 'GENERATING' && (
                             <div className="relative z-10 w-32 h-32 flex items-center justify-center flex-col">
                               <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                               <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Rendering AI Image...</span>
                               <span className="text-[12px] font-mono text-white mt-1">{generationProgress}%</span>
                             </div>
                          )}

                          {(kioskState === 'PRINTING' || kioskState === 'DONE') && (
                             <div className="relative z-10 w-24 h-32 border-2 border-dashed border-slate-500 flex items-center justify-center overflow-hidden bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                
                                {/* Abstract AI Graphic Visual */}
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 opacity-80 mix-blend-screen"
                                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                                <div className="absolute inset-2 bg-gradient-to-tr from-yellow-400 to-pink-500 opacity-60 mix-blend-overlay rotate-45 rounded-full"></div>
                                
                                {/* Print Head Animation */}
                                {kioskState === 'PRINTING' && (
                                   <div className="absolute inset-x-0 h-2 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-[scan_1s_ease-in-out_infinite_alternate]"></div>
                                )}
                             </div>
                          )}
                          <style>{`
                            @keyframes scan {
                               from { top: 0; }
                               to { top: 100%; }
                            }
                          `}</style>
                       </div>
                       
                       {kioskState === 'PRINTING' && (
                          <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest mt-4 animate-pulse">Hardware DTG Printing in Progress...</span>
                       )}
                       {kioskState === 'DONE' && (
                          <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest mt-4 bg-emerald-950/50 px-4 py-1 rounded border border-emerald-900">COLLECT MERCHANDISE ↓</span>
                       )}

                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120a11] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Attendee Prompts</span>
               
               <div className="grid grid-cols-1 gap-2 mb-2">
                 <button 
                   onClick={() => submitPrompt('A giant mechanical wolf howling at a neon moon')}
                   disabled={!kioskActive || kioskState !== 'IDLE'}
                   className={`py-2 px-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                     !kioskActive || kioskState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-900 text-purple-400 hover:bg-purple-900/60'
                   }`}
                 >
                   "Mechanical wolf howling at neon moon"
                 </button>
                 
                 <button 
                   onClick={() => submitPrompt('Abstract fractal geometric patterns collapsing')}
                   disabled={!kioskActive || kioskState !== 'IDLE'}
                   className={`py-2 px-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                     !kioskActive || kioskState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-900 text-pink-400 hover:bg-pink-900/60'
                   }`}
                 >
                   "Abstract fractal geometric patterns"
                 </button>
               </div>
               
               <button 
                   onClick={resetKiosk}
                   disabled={!kioskActive || kioskState === 'IDLE'}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border mt-2 ${
                     !kioskActive || kioskState === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Clear & Next User
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GenAIMerchKiosk;
