/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NeuralAudioWatermarking = () => {
  const [watermarkActive, setWatermarkActive] = useState(false);
  const [piracyDetected, setPiracyDetected] = useState(false);
  
  // DSP & Signature Metrics
  const [cryptoSignature, setCryptoSignature] = useState('0x000000');
  const [watermarkDepth, setWatermarkDepth] = useState(-85); // dB (Inaudible)
  
  // Web Scraper Stats
  const [scrapedVideos, setScrapedVideos] = useState(0);
  const [dmcaIssued, setDmcaIssued] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:30:00', type: 'SYS', msg: 'Neural DSP Steganography Engine online.' },
    { id: 2, time: '23:30:02', type: 'SYS', msg: 'Intercepting Master Audio Out for live embedding.' }
  ]);

  // Audio Waveform Visualizer
  const [waveform, setWaveform] = useState(Array.from({ length: 50 }).map(() => 50));
  
  useEffect(() => {
    let loop;
    
    if (watermarkActive) {
      // Rotate crypto signature based on time/stage
      setCryptoSignature(`0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0')}-STG1`);
      
      loop = setInterval(() => {
        // Animate Waveform
        setWaveform(prev => {
           const next = [...prev.slice(1), 50 + (Math.random() * 40 - 20)];
           return next;
        });

        // Web Scraper Simulation (Background)
        if (Math.random() > 0.8) {
           setScrapedVideos(prev => prev + Math.floor(Math.random() * 5));
        }

      }, 100);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [watermarkActive]);

  const triggerLeak = () => {
    if (watermarkActive && !piracyDetected) {
      setPiracyDetected(true);
      addLog('WARN', 'CRITICAL: High-confidence signature match detected on external platform (YouTube).');
      addLog('ACTION', `Decoded Metadata: Set ID: ${cryptoSignature} | Time: ${new Date().toLocaleTimeString()}`);
      
      // Simulate DMCA process
      setTimeout(() => {
          addLog('WEB3', 'Automated DMCA Takedown Notice executed via API.');
          setDmcaIssued(prev => prev + 1);
          
          setTimeout(() => {
             setPiracyDetected(false);
             addLog('SUCCESS', 'Infringing content successfully removed. Monitoring resumed.');
          }, 3000);
      }, 2000);
    }
  };

  const toggleDSP = () => {
    if (!watermarkActive) {
      setWatermarkActive(true);
      addLog('SYS', 'Neural Watermarking Enabled. Inaudible cryptographic signature embedded.');
    } else {
      setWatermarkActive(false);
      setWaveform(Array.from({ length: 50 }).map(() => 50));
      setCryptoSignature('0x000000');
      addLog('CRIT', 'DSP Offline. Master Audio is unprotected and vulnerable to piracy.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: DSP Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Neural Audio Steganography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Neural Audio Watermarking <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">& Piracy Prevention</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Artists frequently debut unreleased, highly anticipated tracks during their sets, which are immediately recorded on phones, leaked online, and illegally monetized by bootleggers. Eventra solves this by integrating a real-time neural DSP watermark into the master audio out of the festival PA. The system embeds a subliminal, completely inaudible cryptographic signature deep into the live music. If a bootleg recording is uploaded to YouTube or SoundCloud, our web scrapers instantly decode the signature, identify the exact stage and timestamp of the leak, and issue an automated DMCA takedown.
          </p>

          <div className="bg-[#0b1021] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🔐</span> Master Audio Encryption Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleDSP}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     watermarkActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {watermarkActive ? 'Disable DSP Watermark' : 'Arm Neural Watermark'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Live Crypto Signature */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 watermarkActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Signature
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black font-mono leading-none ${
                     watermarkActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {cryptoSignature}
                   </span>
                 </div>
               </div>

               {/* Watermark Depth */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 watermarkActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Embedding Depth
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     watermarkActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {watermarkActive ? watermarkDepth : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>
               
               {/* Automated Takedowns */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 piracyDetected ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 dmcaIssued > 0 ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DMCA Takedowns
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     piracyDetected ? 'text-red-500 animate-bounce' :
                     dmcaIssued > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {dmcaIssued}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Resolved</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04060c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Copyright Enforcement Log</span>
                 {piracyDetected && <span className="text-red-500 animate-pulse">PIRACY DETECTED</span>}
                 {!piracyDetected && watermarkActive && <span className="text-blue-400 animate-pulse">Scraping Web...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* DSP Visualizer */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">AUDIO STEGANOGRAPHY</span>
                <span className="text-[8px] font-mono text-slate-400">FFT ANALYSIS</span>
              </div>

              <div className="flex-1 relative bg-[#02040a] overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMSIvPjwvc3ZnPg==')]"></div>

                {/* Primary Audio Waveform */}
                <div className="relative w-full h-32 flex items-center justify-between px-2 z-10">
                   {waveform.map((val, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 rounded-full transition-all duration-100 ${watermarkActive ? 'bg-slate-400' : 'bg-slate-700'}`}
                        style={{ height: `${watermarkActive ? val : 2}%` }}
                      ></div>
                   ))}
                   
                   {/* Cryptographic Overlay (The Watermark) */}
                   {watermarkActive && (
                     <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                        {waveform.map((val, idx) => (
                          <div 
                            key={`w-${idx}`} 
                            className={`w-1 rounded-full transition-all duration-100 ${piracyDetected ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}
                            style={{ 
                                height: `${val * 0.3}%`, // Subliminal depth
                                transform: 'translateY(15px)',
                                opacity: 0.8
                            }}
                          ></div>
                       ))}
                     </div>
                   )}
                </div>

                {/* Decoding Overlay */}
                {piracyDetected && (
                   <div className="absolute inset-0 bg-red-950/40 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <div className="border border-red-500 bg-black/80 p-4 rounded-xl flex flex-col items-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <span className="text-4xl animate-pulse mb-2">🚨</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">UNAUTHORIZED LEAK DETECTED</span>
                        <span className="text-[8px] font-mono text-slate-300">Platform: YouTube Shorts</span>
                        <span className="text-[8px] font-mono text-cyan-400 mt-2 bg-cyan-950/30 px-2 py-1 rounded">Decoded Sig: {cryptoSignature}</span>
                      </div>
                   </div>
                )}

                {/* HUD Elements */}
                <div className="absolute bottom-4 left-4 flex flex-col z-10">
                  <span className="text-[6px] font-mono text-slate-500">Scraping Threads: 128</span>
                  <span className="text-[6px] font-mono text-slate-500">Scanned Media: {scrapedVideos}</span>
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-1 gap-3">
              <button 
                onClick={triggerLeak}
                disabled={!watermarkActive || piracyDetected}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !watermarkActive || piracyDetected ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Bootleg Leak (Trigger DMCA)
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NeuralAudioWatermarking;
