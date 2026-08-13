/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const NLPSentimentAnalysis = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [globalSentiment, setGlobalSentiment] = useState(78); // 0-100, >50 is positive
  const [analyzedTweets, setAnalyzedTweets] = useState([]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '12:00:00', type: 'SYS', msg: 'NLP Pipeline Initialized. Awaiting Firehose connection.' }
  ]);
  
  const feedRef = useRef(null);

  const mockTweets = [
      { text: "The main stage visuals are absolutely insane! Best night ever. 🔥 #Eventra", sentiment: 'POS', score: 0.92, entities: ['main stage', 'visuals'] },
      { text: "Been waiting in line for the bathrooms for 45 mins. This is ridiculous.", sentiment: 'NEG', score: 0.12, entities: ['bathrooms', 'line'] },
      { text: "Sound mixing at Stage B is completely off, can't hear the vocals at all.", sentiment: 'NEG', score: 0.25, entities: ['Sound mixing', 'Stage B'] },
      { text: "Just grabbed some food, heading to the lockers now.", sentiment: 'NEU', score: 0.55, entities: ['food', 'lockers'] },
      { text: "Security team was super helpful when my friend lost her phone! Thank you!!", sentiment: 'POS', score: 0.88, entities: ['Security team', 'phone'] },
      { text: "Crowd is way too dense near the front, they need to cap this.", sentiment: 'NEG', score: 0.30, entities: ['Crowd', 'front'] },
      { text: "Water stations are completely empty at the east gate. People are dehydrating.", sentiment: 'CRIT', score: 0.05, entities: ['Water stations', 'east gate'] },
      { text: "Incredible set by the headliner. Crying rn 😭", sentiment: 'POS', score: 0.95, entities: ['headliner'] }
  ];

  useEffect(() => {
      let interval;
      if (isStreaming) {
          interval = setInterval(() => {
              const newTweet = mockTweets[Math.floor(Math.random() * mockTweets.length)];
              const id = Date.now();
              
              setAnalyzedTweets(prev => [{...newTweet, id}, ...prev].slice(0, 10)); // Keep last 10
              
              // Adjust global sentiment
              setGlobalSentiment(prev => {
                  const shift = (newTweet.score * 100 - prev) * 0.1; // Smooth movement
                  return Math.max(0, Math.min(100, prev + shift));
              });
              
              // Log criticals
              if (newTweet.sentiment === 'CRIT' || newTweet.sentiment === 'NEG') {
                  addLog('WARN', `Entity Extracted: [${newTweet.entities.join(', ')}] -> Sentiment: NEGATIVE. Flagging for PR.`);
              } else {
                  addLog('SYS', `Analyzed 1 doc. Entities: [${newTweet.entities[0]}]. Sentiment: ${newTweet.sentiment}`);
              }
              
          }, 2000);
      }
      return () => clearInterval(interval);
  }, [isStreaming]);

  const toggleStream = () => {
      setIsStreaming(!isStreaming);
      if (!isStreaming) {
          addLog('ACTION', 'Connected to Social Firehose API. Ingesting #Eventra stream...');
      } else {
          addLog('SYS', 'Firehose connection terminated.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper for gauge SVG
  const getGaugeColor = (val) => {
      if (val < 40) return '#ef4444'; // Red
      if (val < 60) return '#eab308'; // Yellow
      return '#22c55e'; // Green
  };

  return (
    <div className="min-h-screen bg-[#080d12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> NLP & Big Data Pipelines
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time NLP Sentiment <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-500">Analysis Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            PR teams cannot read 5,000 tweets a minute to determine if attendees are complaining about overflowing toilets or praising the stage design, severely delaying crisis response. Eventra solves this by integrating a Natural Language Processing (NLP) pipeline. The backend consumes the festival's official hashtag stream in real-time, executing sentiment analysis and entity extraction to automatically flag PR crises before they trend.
          </p>

          <div className="bg-[#0b121a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> Data Ingestion Controls
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStream}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isStreaming ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' :
                     'bg-yellow-600 text-slate-900 border border-yellow-500 hover:bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {isStreaming ? 'Disconnect Firehose' : 'Connect Social Firehose'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* NLP Config */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center">
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3 block border-b border-slate-800 pb-2">Active ML Models</span>
                   <div className="space-y-2">
                       <div className="flex items-center justify-between">
                           <span className="text-xs text-slate-300 font-mono">BERT-Sentiment-v2</span>
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       </div>
                       <div className="flex items-center justify-between">
                           <span className="text-xs text-slate-300 font-mono">SpaCy-Entity-Extract</span>
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       </div>
                   </div>
               </div>

               {/* Stream Stats */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center">
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3 block border-b border-slate-800 pb-2">Ingestion Rate</span>
                   <div className="flex items-end">
                       <span className={`text-4xl font-black font-mono leading-none ${isStreaming ? 'text-yellow-400' : 'text-slate-600'}`}>
                           {isStreaming ? '142' : '0'}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-2 pb-1 uppercase">Docs/Sec</span>
                   </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#05080c] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>NLP Pipeline Logs</span>
                 {isStreaming && <span className="text-yellow-400 font-black animate-pulse">ANALYZING TEXT...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 
                       log.type === 'WARN' ? 'text-white font-bold bg-rose-600 px-1 rounded-sm' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* PR Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">PR & Sentiment Hub</span>
                      <span className="text-xs text-white font-bold">#Eventra Global Feed</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-4 flex flex-col relative overflow-hidden">
                  
                  {/* Global Sentiment Gauge */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center mb-4">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Global Sentiment Index</span>
                      
                      <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                          {/* Gradient background for gauge */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-20"></div>
                          
                          {/* The actual fill based on score */}
                          <div 
                              className="h-full transition-all duration-700 ease-out"
                              style={{ width: `${globalSentiment}%`, backgroundColor: getGaugeColor(globalSentiment) }}
                          ></div>
                          
                          {/* Marker line */}
                          <div 
                              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all duration-700"
                              style={{ left: `calc(${globalSentiment}% - 2px)` }}
                          ></div>
                      </div>
                      
                      <div className="flex justify-between w-full text-[8px] text-slate-500 font-bold uppercase mt-1">
                          <span>Crisis</span>
                          <span>Neutral</span>
                          <span>Euphoric</span>
                      </div>
                  </div>

                  {/* Live Analyzed Stream */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 block border-b border-slate-800 pb-1 flex justify-between">
                          <span>Live NLP Stream</span>
                          {isStreaming && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                      </span>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1" ref={feedRef}>
                          
                          {!isStreaming && analyzedTweets.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                                  <span className="text-3xl mb-2">📡</span>
                                  <span className="text-xs font-mono">Stream Offline.<br/>Connect Firehose to begin analysis.</span>
                              </div>
                          )}

                          {analyzedTweets.map((tweet) => (
                              <div key={tweet.id} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 animate-fade-in-down shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      {/* Sentiment Tag */}
                                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                          tweet.sentiment === 'POS' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' :
                                          tweet.sentiment === 'NEU' ? 'bg-slate-800 text-slate-400 border border-slate-600' :
                                          tweet.sentiment === 'NEG' ? 'bg-amber-900/50 text-amber-500 border border-amber-500/30' :
                                          'bg-rose-900/80 text-white border border-rose-500 animate-pulse'
                                      }`}>
                                          {tweet.sentiment} ({(tweet.score * 100).toFixed(0)}%)
                                      </span>
                                      
                                      <span className="text-[8px] text-slate-600 font-mono">Just now</span>
                                  </div>
                                  
                                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">"{tweet.text}"</p>
                                  
                                  {/* Extracted Entities */}
                                  <div className="flex flex-wrap gap-1">
                                      {tweet.entities.map((entity, i) => (
                                          <span key={i} className="text-[8px] font-mono text-cyan-400 bg-cyan-900/20 px-1 rounded border border-cyan-900">
                                              #{entity.replace(/\s+/g, '')}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b121a] p-4 rounded-xl border border-yellow-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-yellow-400 uppercase block mb-1">Big Data Streaming:</span>
               Click <span className="text-slate-900 font-bold bg-yellow-600 px-1 rounded">Connect Social Firehose</span>. The NLP pipeline instantly begins ingesting mock tweets. It runs sentiment analysis (scoring text from 0 to 1) and executes Named Entity Recognition (NER) to tag keywords (like "bathrooms"). If a negative tweet is detected about a critical entity (e.g., "Water stations are empty"), the backend immediately flags the PR team, preventing a major incident.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NLPSentimentAnalysis;
