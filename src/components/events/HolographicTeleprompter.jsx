/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const HolographicTeleprompter = () => {
  const [nlpActive, setNlpActive] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [wordsSpoken, setWordsSpoken] = useState(0);
  const [cadence, setCadence] = useState(0); // Words per minute
  
  const textRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [avLog, setAvLog] = useState([
    { id: 1, time: '09:00:00', msg: 'Pepper\'s Ghost Rig: ALIGNED. Beam Splitter: 45 DEGREES.' }
  ]);

  const script = `Thank you all for being here today.
As we look toward the future of global innovation,
we must recognize that technology alone is not enough.
It is the human connection, the shared vision,
that truly drives us forward.
Last year, we faced unprecedented challenges.
But together, we proved that resilience is embedded in our DNA.
Our new platform is not just a tool;
it is a bridge between cultures.
It is a testament to what we can achieve
when we break down the barriers of language and distance.
So, I ask you today:
Are you ready to build tomorrow with us?
Because the future is not something we wait for.
The future is something we create.
Thank you.`;

  const scriptWords = script.split(/\\s+/);

  useEffect(() => {
    let loop;
    if (nlpActive) {
      loop = setInterval(() => {
        
        // Simulate speaker reading words (NLP tracking)
        setWordsSpoken(prev => {
          const next = prev + 1;
          if (next >= scriptWords.length) {
            clearInterval(loop);
            setNlpActive(false);
            setScrollSpeed(0);
            addLog('End of script reached. NLP Engine entering standby.');
            return prev;
          }
          
          // Calculate Cadence (WPM) dynamically based on random variations in speaking speed
          const instantaneousWpm = 110 + (Math.random() * 40 - 15);
          setCadence(Math.floor(instantaneousWpm));
          
          // Adjust scroll speed proportionally to cadence
          const newSpeed = instantaneousWpm * 0.05;
          setScrollSpeed(newSpeed);
          
          // Update visual scroll position
          setScrollPosition(pos => pos + newSpeed);

          return next;
        });

      }, 500); // Trigger a word read roughly every half second
    }
    return () => clearInterval(loop);
  }, [nlpActive]);

  const toggleNlp = () => {
    if (!nlpActive && wordsSpoken < scriptWords.length) {
      setNlpActive(true);
      addLog('NLP Audio Processor Engaged: Tracking vocal cadence...');
    } else {
      setNlpActive(false);
      setScrollSpeed(0);
      addLog('NLP Tracking Paused.');
    }
  };

  const resetRig = () => {
    setNlpActive(false);
    setScrollSpeed(0);
    setWordsSpoken(0);
    setScrollPosition(0);
    setCadence(0);
    addLog('Teleprompter reset to line 1.');
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAvLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: AV Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎙️</span> AV Theatrical Rigging / NLP
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Holographic NLP <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Teleprompter</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            International speakers struggle to engage with the audience when constantly looking down at translated notes on a podium. Eventra integrates with Pepper's Ghost holographic foil rigged on the stage. The system projects a massive, invisible-to-the-audience holographic teleprompter directly in the speaker's eyeline. Advanced NLP audio-processing tracks their live vocal cadence and automatically paces the scroll speed perfectly.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> FOH Presentation Control
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetRig}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md border border-slate-700 hover:bg-slate-800 text-slate-400"
                 >
                   Rewind
                 </button>
                 <button 
                   onClick={toggleNlp}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     nlpActive ? 'bg-teal-900/50 text-teal-400 border border-teal-500/50' :
                     wordsSpoken >= scriptWords.length ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]'
                   }`}
                 >
                   {nlpActive ? 'Listening to Speaker...' : 'Engage NLP Tracking'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 {nlpActive && <div className="absolute inset-x-0 bottom-0 h-1 bg-teal-500/50 animate-pulse"></div>}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Live Vocal Cadence</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-teal-400 leading-none">
                     {cadence}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">WPM</span>
                 </div>
               </div>

               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Holo-Scroll Speed</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-emerald-400 leading-none">
                     {scrollSpeed.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">px/sec</span>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Natural Language Processor Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {avLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={log.msg.includes('Engaged') || log.msg.includes('ALIGNED') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{log.msg}</span>
                   </div>
                 ))}
                 {nlpActive && (
                   <div className="text-teal-400 mt-1 animate-pulse">
                     Tracking phonetic markers...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Pepper's Ghost Hologram Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-950 rounded-3xl border-[4px] border-slate-800 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-800 backdrop-blur-md">
                Speaker's Eyeline View
              </span>
            </div>

            {/* Theatrical Stage Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0">
              {/* Audience lights (out of focus) */}
              <div className="absolute bottom-10 left-10 w-2 h-2 bg-yellow-500/30 rounded-full blur-md"></div>
              <div className="absolute bottom-24 right-20 w-3 h-3 bg-blue-500/20 rounded-full blur-lg"></div>
              <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-red-500/20 rounded-full blur-sm"></div>
              
              {/* Stage Floor */}
              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent border-t border-slate-800/30"></div>
            </div>

            {/* Holographic Projection Area (Pepper's Ghost) */}
            <div className="absolute inset-x-4 top-20 bottom-24 flex items-center justify-center z-10 overflow-hidden">
              
              {/* Hologram Glass / Beam Splitter artifact */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent transform -skew-x-6 rounded-lg pointer-events-none border-l border-white/[0.03]"></div>
              
              {/* Teleprompter Text Container */}
              <div className="absolute w-full h-[80%] flex flex-col items-center [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
                
                {/* Scrolling Text */}
                <div 
                  className="w-full text-center transition-all duration-[500ms] ease-linear absolute top-[50%]"
                  style={{ transform: `translateY(-${scrollPosition}px)` }}
                >
                  {scriptWords.map((word, index) => {
                    const isSpoken = index < wordsSpoken;
                    const isCurrent = index === wordsSpoken;
                    
                    return (
                      <span 
                        key={index} 
                        className={`
                          inline-block mx-1 my-1 text-2xl font-black drop-shadow-[0_0_15px_rgba(20,184,166,0.8)]
                          transition-colors duration-300
                          ${isSpoken ? 'text-teal-700/40 blur-[1px]' : isCurrent ? 'text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : 'text-teal-400'}
                        `}
                      >
                        {word}
                      </span>
                    )
                  })}
                </div>
                
                {/* Reading Line Guide */}
                <div className="absolute top-[50%] inset-x-0 h-10 border-y border-teal-500/30 bg-teal-500/10 pointer-events-none flex items-center justify-between px-2">
                  <span className="text-teal-500/50 text-xs">▶</span>
                  <span className="text-teal-500/50 text-xs">◀</span>
                </div>

              </div>

            </div>
            
            {/* Floor Monitor / Projector Source (Bottom) */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-black z-20 flex justify-center items-end pb-2 border-t border-slate-900">
              {/* Projector lens glow */}
              <div className={`w-32 h-2 rounded-full ${nlpActive ? 'bg-teal-500 shadow-[0_-20px_50px_rgba(20,184,166,0.3)] animate-pulse' : 'bg-slate-800'}`}></div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default HolographicTeleprompter;
