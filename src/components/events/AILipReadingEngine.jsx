import React, { useState, useEffect } from 'react';

const AILipReadingEngine = () => {
  const [engineActive, setEngineActive] = useState(false);
  const [ambientNoise, setAmbientNoise] = useState(95); // dB
  const [subtitle, setSubtitle] = useState('');
  const [confidence, setConfidence] = useState(0);

  const script = [
    "Welcome to the booth! We're excited to show you our new product.",
    "As you can see, the integration is completely seamless.",
    "It connects directly to your existing cloud infrastructure.",
    "Do you have any specific questions about the API?"
  ];

  const startEngine = () => {
    setEngineActive(true);
    setSubtitle('Initializing Visual Neural Net...');
    setConfidence(0);
    
    setTimeout(() => {
      let index = 0;
      
      const streamSubtitles = () => {
        if (!engineActive) return;
        if (index < script.length) {
          setSubtitle(script[index]);
          setConfidence(Math.floor(Math.random() * 10) + 85); // 85-95%
          index++;
          setTimeout(streamSubtitles, 3500);
        } else {
          setSubtitle('');
          setEngineActive(false);
        }
      };
      
      streamSubtitles();
      
    }, 1500);
  };

  useEffect(() => {
    let interval;
    if (engineActive) {
      interval = setInterval(() => {
        setAmbientNoise(90 + Math.floor(Math.random() * 15)); // fluctuate between 90-105 dB
      }, 500);
    }
    return () => clearInterval(interval);
  }, [engineActive]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans p-6 text-neutral-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Tech Specs (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Accessibility & Visual AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
            Visual Lip-Reading <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Subtitling Engine</span>.
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            Standard speech-to-text algorithms completely fail in loud exhibition halls. Eventra solves this accessibility crisis by deploying a visual-only deep learning model. Attendees point their camera at a speaker; the engine tracks 468 facial landmarks to process mouth movements, rendering real-time AR subtitles while entirely ignoring ambient noise.
          </p>

          <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl relative overflow-hidden">
             
             <h3 className="text-sm font-black text-neutral-900 mb-6 uppercase tracking-widest flex items-center">
               <span className="text-indigo-500 mr-2">⚙️</span> Engine Telemetry
             </h3>

             <div className="grid grid-cols-2 gap-6 relative z-10 mb-6">
               <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Ambient Noise</span>
                   {ambientNoise > 90 && <span className="bg-rose-100 text-rose-600 text-[8px] font-black uppercase px-2 py-0.5 rounded">Excessive</span>}
                 </div>
                 <div className="flex items-end space-x-2">
                   <span className="text-4xl font-black text-neutral-900 font-mono transition-all duration-200">{ambientNoise}</span>
                   <span className="text-sm font-bold text-neutral-400 mb-1">dB</span>
                 </div>
                 <p className="text-[9px] text-neutral-400 mt-2 font-mono">Audio transcription impossible.</p>
               </div>
               
               <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Visual Inference</span>
                 <div className="flex items-end space-x-2">
                   <span className={`text-4xl font-black font-mono transition-colors ${engineActive ? 'text-indigo-600' : 'text-neutral-300'}`}>
                     {engineActive ? '24' : '0'}
                   </span>
                   <span className="text-sm font-bold text-neutral-400 mb-1">fps</span>
                 </div>
                 <p className="text-[9px] text-neutral-400 mt-2 font-mono">Mobile Edge TPU processing.</p>
               </div>
             </div>

             <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-white font-mono text-xs">
               <span className="text-neutral-500 uppercase font-bold tracking-widest text-[10px] block mb-2">TensorFlow Lite Log</span>
               {engineActive ? (
                 <div className="space-y-1">
                   <p className="text-indigo-400">Model: lip_read_mobile_v2.tflite</p>
                   <p className="text-emerald-400">Status: Tracking Face ID_84</p>
                   <p className="text-cyan-400">Confidence Threshold: &gt; 80%</p>
                 </div>
               ) : (
                 <p className="text-neutral-600">Model suspended. Awaiting camera activation.</p>
               )}
             </div>

          </div>
        </div>

        {/* Right Side: Mobile AR Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-neutral-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 drop-shadow-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-neutral-950 flex flex-col relative overflow-hidden">
              
              {!engineActive ? (
                // Standby State
                <div className="flex-1 flex flex-col p-6 items-center justify-center relative z-20">
                  <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6 border border-neutral-700 shadow-lg">
                    <span className="text-4xl text-neutral-500">🗣️</span>
                  </div>
                  <h2 className="text-xl font-black text-white text-center mb-2">Accessibility Subtitles</h2>
                  <p className="text-neutral-400 text-xs text-center mb-8 px-4">Point your camera at a speaker's face to generate subtitles using visual lip-reading AI.</p>
                  
                  <button 
                    onClick={startEngine}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center"
                  >
                    <span className="mr-2">📷</span> Start AR Camera
                  </button>
                </div>
              ) : (
                // AR Active State
                <div className="absolute inset-0 z-10 flex flex-col">
                  
                  {/* Camera Background */}
                  <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter saturate-50"></div>
                  </div>

                  {/* Facial Tracking Mesh UI */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                     <div className="relative w-48 h-64 border-2 border-indigo-500/50 rounded-[3rem] animate-pulse flex flex-col justify-end pb-8 items-center">
                       {/* Mouth tracking box */}
                       <div className="w-20 h-10 border border-cyan-400 bg-cyan-400/10 rounded-xl mb-4 relative">
                         <div className="absolute -right-20 top-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] text-cyan-400 font-mono flex items-center">
                           <span className="w-1 h-1 bg-cyan-400 rounded-full mr-1 animate-ping"></span>
                           Tracking
                         </div>
                       </div>
                     </div>
                  </div>

                  {/* UI Overlays */}
                  <div className="absolute top-12 right-6 z-20">
                     <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
                       <span className="text-[10px] font-bold text-white uppercase tracking-widest">Mic Muted</span>
                       <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                     </div>
                  </div>

                  {/* Subtitle Display Area */}
                  <div className="absolute bottom-10 inset-x-4 z-20 flex flex-col items-center animate-fade-in-up">
                    
                    {subtitle && (
                      <div className="bg-black/80 backdrop-blur-lg border border-white/20 p-4 rounded-2xl w-full text-center shadow-2xl transform transition-all duration-300">
                        <p className="text-white font-bold text-lg leading-snug drop-shadow-md">
                          "{subtitle}"
                        </p>
                        
                        {confidence > 0 && (
                          <div className="mt-3 flex justify-between items-center px-2">
                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">AI Confidence</span>
                            <span className="text-[10px] font-mono text-white">{confidence}%</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AILipReadingEngine;
