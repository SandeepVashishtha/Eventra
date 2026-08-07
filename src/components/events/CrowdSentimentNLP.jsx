/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdSentimentNLP = () => {
  const [nlpActive, setNlpActive] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(50); // 0 (Booing) to 100 (Cheering)
  const [decibels, setDecibels] = useState(75);
  
  const [keywords, setKeywords] = useState([]);
  
  const [history, setHistory] = useState(Array(30).fill(50));

  const [aiLog, setAiLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Stage crowd-mics routed to Eventra Audio-Processing Engine.' },
    { id: 2, time: '22:00:05', type: 'SYS', msg: 'NLP Sentiment model loaded. Awaiting audio ingestion.' }
  ]);

  useEffect(() => {
    let loop;
    if (nlpActive) {
      loop = setInterval(() => {
        
        // Randomly drift sentiment unless we are artificially boosting/dropping it
        setSentimentScore(prev => {
          // If we hit a high cheer logic
          let next = prev + (Math.random() * 8 - 4);
          
          // Tendency to revert to mean if we are just drifting
          if (next > 70) next -= 1.5;
          if (next < 30) next += 1.5;
          
          return Math.max(0, Math.min(100, next));
        });

        setDecibels(prev => Math.max(65, Math.min(120, prev + (Math.random() * 6 - 3))));

      }, 1000);
    }
    return () => clearInterval(loop);
  }, [nlpActive]);

  useEffect(() => {
    if (nlpActive) {
      setHistory(prev => {
        const newHist = [...prev.slice(1), sentimentScore];
        return newHist;
      });

      // NLP Keyword Extraction Simulation
      if (Math.random() > 0.8) {
        let newWord = '';
        let type = '';
        if (sentimentScore > 80) {
          const goodWords = ['"ENCORE!"', '"WE LOVE YOU!"', '"PLAY IT!"', '"YEAHHHH!"'];
          newWord = goodWords[Math.floor(Math.random() * goodWords.length)];
          type = 'CHEER';
        } else if (sentimentScore < 30) {
          const badWords = ['"BOOO!"', '"NEXT!"', '"TURN IT UP!"', '"WE CAN\'T HEAR!"'];
          newWord = badWords[Math.floor(Math.random() * badWords.length)];
          type = 'BOO';
        } else {
          const neutralWords = ['[Singing along]', '[Indistinct chatter]', '"WOO!"'];
          newWord = neutralWords[Math.floor(Math.random() * neutralWords.length)];
          type = 'NEUTRAL';
        }
        
        setKeywords(prev => {
          const updated = [{ word: newWord, type, id: Date.now() }, ...prev].slice(0, 5);
          return updated;
        });

        if (type !== 'NEUTRAL') {
          addLog('NLP', `Isolated vocal pattern: ${newWord} [Confidence: ${(Math.random() * 10 + 85).toFixed(1)}%]`);
        }
      }
    }
  }, [sentimentScore, nlpActive]);

  const simulateCheer = () => {
    if (nlpActive) {
      setSentimentScore(95);
      setDecibels(115);
      addLog('AUDIO', 'Massive high-frequency roar detected. Sentiment spiking positive.');
    }
  };

  const simulateBoo = () => {
    if (nlpActive) {
      setSentimentScore(15);
      setDecibels(105);
      addLog('WARN', 'Low-frequency rumbling & negative NLP vocalizations detected.');
    }
  };

  const toggleEngine = () => {
    if (!nlpActive) {
      setNlpActive(true);
      setSentimentScore(50);
      setDecibels(75);
      setKeywords([]);
      setHistory(Array(30).fill(50));
      addLog('SYS', 'Engaging live crowd ingestion. Analyzing frequency & NLP semantics...');
    } else {
      setNlpActive(false);
      addLog('SYS', 'Audio-processing engine paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setAiLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper to draw the graph line
  const generateGraphPath = () => {
    const width = 100;
    const height = 100;
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / 100) * height; // Invert Y
      return `${x},${y}`;
    }).join(' L ');
    
    return `M ${points}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-lime-900/40 text-lime-400 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎙️</span> Natural Language Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time Crowd NLP <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500">Sentiment Analysis</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Performers and organizers usually have zero quantitative data on how a crowd is reacting to a specific song or keynote speaker, relying entirely on subjective feeling from the stage. Eventra fixes this by routing the stage crowd-mics directly into an AI audio-processing engine. It analyzes the frequency, volume, and uses NLP to pick out recurring shouted words, generating a live, mathematical "Crowd Sentiment Score" directly on the VJ's dashboard.
          </p>

          <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-lime-500 text-lg mr-2">🧠</span> AI Sentiment Telemetry
               </h3>
               
               <button 
                 onClick={toggleEngine}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   nlpActive ? 'bg-neutral-800 text-neutral-500 border border-neutral-700' :
                   'bg-lime-600 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(101,163,13,0.4)]'
                 }`}
               >
                 {nlpActive ? 'Pause Ingestion' : 'Initialize NLP Mics'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Global Sentiment Score */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 sentimentScore >= 75 ? 'bg-lime-950/30 border-lime-500/50 shadow-inner' :
                 sentimentScore <= 25 ? 'bg-red-950/30 border-red-500/50 shadow-inner' : 'bg-neutral-950 border-neutral-800'
               }`}>
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Crowd Sentiment Index</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none transition-colors duration-300 ${
                     sentimentScore >= 75 ? 'text-lime-500' :
                     sentimentScore <= 25 ? 'text-red-500' : 'text-neutral-300'
                   }`}>
                     {sentimentScore.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-neutral-600 ml-2 pb-1">/ 100</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                   <div 
                     className="h-full bg-red-500 transition-all duration-300"
                     style={{ width: `${Math.max(0, 30 - sentimentScore) * 3}%`, opacity: sentimentScore < 50 ? 1 : 0 }}
                   ></div>
                   <div 
                     className="h-full bg-lime-500 transition-all duration-300 absolute left-1/2"
                     style={{ width: `${Math.max(0, sentimentScore - 50) * 2}%`, opacity: sentimentScore > 50 ? 1 : 0 }}
                   ></div>
                   <div className="absolute left-1/2 w-0.5 h-full bg-neutral-600 -ml-[1px]"></div>
                 </div>
               </div>

               {/* Crowd Volume (Decibels) */}
               <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Crowd Roar Volume</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-cyan-500 leading-none">
                     {decibels.toFixed(1)}
                   </span>
                   <span className="text-sm font-bold text-neutral-600 ml-2 pb-1">dB</span>
                 </div>
                 
                 <div className="absolute top-3 right-3 flex space-x-1">
                    {/* Simulated EQ Bars */}
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1.5 bg-cyan-900 rounded-sm overflow-hidden flex flex-col justify-end h-6">
                        <div className="w-full bg-cyan-400 transition-all duration-100" style={{ height: nlpActive ? `${Math.random() * (decibels/120)*100}%` : '5%' }}></div>
                      </div>
                    ))}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">AI Processing Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {aiLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'NLP' ? 'text-lime-400 font-bold' : 
                       log.type === 'AUDIO' ? 'text-cyan-400 font-bold' :
                       log.type === 'WARN' ? 'text-red-400' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: VJ Dashboard Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Stage VJ Monitor
              </span>
              <span className="text-[10px] font-mono text-lime-400 flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${nlpActive ? 'bg-lime-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                MIC_ARRAY_LIVE
              </span>
            </div>

            <div className="flex-1 relative flex flex-col p-6 pt-16">
               
               {/* Live Graph */}
               <div className="w-full h-40 bg-neutral-900 border border-neutral-800 rounded-xl p-3 relative flex flex-col mb-6 shadow-inner">
                 <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest absolute top-3 left-3 z-20">Sentiment Timeline</span>
                 
                 {/* Graph Area */}
                 <div className="flex-1 mt-4 relative border-l border-b border-neutral-700/50">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#262626" strokeWidth="0.5" strokeDasharray="2 2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#404040" strokeWidth="0.5" strokeDasharray="4 2" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#262626" strokeWidth="0.5" strokeDasharray="2 2" />
                      
                      {/* Data Line */}
                      {nlpActive && (
                        <path 
                          d={generateGraphPath()} 
                          fill="none" 
                          stroke="url(#sentimentGradient)" 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                      
                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#84cc16" />   {/* Lime for high/top */}
                          <stop offset="50%" stopColor="#737373" />  {/* Neutral middle */}
                          <stop offset="100%" stopColor="#ef4444" /> {/* Red for low/bottom */}
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Current point indicator */}
                    {nlpActive && (
                      <div 
                        className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{ 
                          left: '100%', 
                          top: `${100 - sentimentScore}%`,
                          backgroundColor: sentimentScore >= 75 ? '#84cc16' : sentimentScore <= 25 ? '#ef4444' : '#a3a3a3'
                        }}
                      ></div>
                    )}
                 </div>
               </div>

               {/* NLP Extracted Keywords */}
               <div className="flex-1 bg-black border border-neutral-800 rounded-xl p-4 shadow-inner flex flex-col relative overflow-hidden">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-3 border-b border-neutral-800 pb-2">Extracted Semantics (NLP)</span>
                 
                 <div className="flex-1 space-y-2">
                   {keywords.map((kw, i) => (
                     <div key={kw.id} className="flex justify-between items-center animate-fade-in-up" style={{ opacity: 1 - (i * 0.2) }}>
                       <span className="text-xs font-mono font-bold text-white tracking-wide">{kw.word}</span>
                       <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                         kw.type === 'CHEER' ? 'bg-lime-900/50 text-lime-400 border border-lime-500/50' :
                         kw.type === 'BOO' ? 'bg-red-900/50 text-red-400 border border-red-500/50' :
                         'bg-neutral-800 text-neutral-400 border border-neutral-700'
                       }`}>
                         {kw.type}
                       </span>
                     </div>
                   ))}
                   {keywords.length === 0 && (
                     <span className="text-[10px] text-neutral-600 font-mono italic">Awaiting speech data...</span>
                   )}
                 </div>
               </div>

               {/* Manual Override Controls for Simulation */}
               <div className="mt-4 grid grid-cols-2 gap-2">
                 <button 
                   onClick={simulateBoo}
                   disabled={!nlpActive}
                   className={`p-3 rounded-lg text-xs font-black uppercase tracking-widest transition border ${
                     !nlpActive ? 'bg-neutral-900 border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed' :
                     'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                   }`}
                 >
                   Inject Boo
                 </button>
                 <button 
                   onClick={simulateCheer}
                   disabled={!nlpActive}
                   className={`p-3 rounded-lg text-xs font-black uppercase tracking-widest transition border ${
                     !nlpActive ? 'bg-neutral-900 border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed' :
                     'bg-lime-950/40 border-lime-900 text-lime-500 hover:bg-lime-900/60'
                   }`}
                 >
                   Inject Cheer
                 </button>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrowdSentimentNLP;
