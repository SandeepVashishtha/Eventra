/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NlpSentimentAnalyzer = () => {
  const [streamActive, setStreamActive] = useState(false);
  
  // NLP Metrics
  const [tweetsProcessed, setTweetsProcessed] = useState(0); 
  const [globalSentiment, setGlobalSentiment] = useState(82); // % Positive
  const [alertsFired, setAlertsFired] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Apache Kafka topic: eventra_social_stream initialized.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'HuggingFace Transformer model (RoBERTa) loaded.' }
  ]);

  // Visualizer State
  const [liveTweets, setLiveTweets] = useState([]);
  const [crisisMode, setCrisisMode] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  const normalTweets = [
      { text: "This festival is absolutely insane! The lighting on the main stage is incredible.", sentiment: 'POSITIVE', score: 0.94 },
      { text: "Just grabbed some food. Lines are a bit long but the tacos are worth it.", sentiment: 'NEUTRAL', score: 0.52 },
      { text: "Where is the merch tent located again?", sentiment: 'NEUTRAL', score: 0.48 },
      { text: "Can't wait to see Odesza tonight!", sentiment: 'POSITIVE', score: 0.88 },
      { text: "It's so hot out here, remember to drink water everyone.", sentiment: 'NEUTRAL', score: 0.61 },
      { text: "The bass is vibrating my soul. 10/10 experience.", sentiment: 'POSITIVE', score: 0.91 }
  ];

  const crisisTweets = [
      { text: "Wtf the sound just completely cut out at Stage B...", sentiment: 'NEGATIVE', score: 0.12 },
      { text: "Audio issues at Stage B! We can't hear anything in the back.", sentiment: 'NEGATIVE', score: 0.08 },
      { text: "Fix the speakers at Stage B! The DJ is playing but it's silent.", sentiment: 'NEGATIVE', score: 0.05 },
      { text: "I waited an hour for this set and the audio is broken. So mad. #StageB", sentiment: 'NEGATIVE', score: 0.02 },
      { text: "Terrible production at Stage B right now. Fix the sound!", sentiment: 'NEGATIVE', score: 0.15 }
  ];

  useEffect(() => {
    let loop;
    
    if (streamActive) {
      loop = setInterval(() => {
          
          setTweetsProcessed(prev => prev + Math.floor(Math.random() * 8 + 2));
          
          // Generate a new tweet
          let newTweet;
          if (crisisMode && Math.random() > 0.4) {
              newTweet = crisisTweets[Math.floor(Math.random() * crisisTweets.length)];
              setGlobalSentiment(prev => Math.max(30, prev - (Math.random() * 5)));
          } else {
              newTweet = normalTweets[Math.floor(Math.random() * normalTweets.length)];
              if (!crisisMode) {
                  setGlobalSentiment(prev => Math.min(88, prev + (Math.random() * 1)));
              }
          }
          
          const tweetWithMeta = {
              ...newTweet,
              id: Date.now() + Math.random(),
              handle: `@user_${Math.floor(Math.random() * 9999)}`,
              time: 'Just now'
          };

          setLiveTweets(prev => [tweetWithMeta, ...prev].slice(0, 5));

          // Crisis Detection Logic
          if (crisisMode && !activeAlert && Math.random() > 0.8) {
              setActiveAlert({
                  type: 'AUDIO_FAILURE',
                  location: 'Stage B',
                  confidence: '94.2%',
                  keywords: ['sound', 'audio', 'broken', 'silent']
              });
              setAlertsFired(prev => prev + 1);
              addLog('CRIT', 'NLP CLUSTER ANOMALY: Mass negative sentiment detected regarding "Sound" at "Stage B".');
              addLog('ACTION', 'Automated dispatch sent to Audio Engineering team.');
          }

      }, 1200); // Process tweets every 1.2s
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [streamActive, crisisMode, activeAlert]);

  const toggleStream = () => {
      setStreamActive(!streamActive);
      if (!streamActive) {
          addLog('SYS', 'Kafka consumer connected. Ingesting Twitter/X Firehose.');
      } else {
          addLog('WARN', 'Stream processing halted.');
          setCrisisMode(false);
          setActiveAlert(null);
      }
  };

  const triggerCrisis = () => {
      if (!streamActive) return;
      setCrisisMode(true);
      addLog('WARN', 'Injecting negative sentiment anomaly into stream...');
  };
  
  const resolveCrisis = () => {
      setCrisisMode(false);
      setActiveAlert(null);
      addLog('SUCCESS', 'Stage B audio issues resolved. Sentiment recovering.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Natural Language Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time NLP Sentiment <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-500 to-indigo-500">Analysis on Social Streams</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival organizers often react too slowly to emerging localized issues (like audio cutting out at a specific stage) because they rely on slow physical staff reports. Eventra solves this by streaming the Twitter/X API and localized social media feeds through a real-time NLP sentiment analysis pipeline powered by HuggingFace Transformers. If the machine learning model detects a sudden, clustered spike in negative sentiment correlated with specific keywords ("sound", "water") and geolocations, it instantly triggers high-priority alerts on the command center dashboard.
          </p>

          <div className="bg-[#0b1120] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> NLP Pipeline Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStream}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     streamActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {streamActive ? 'Stop Ingestion' : 'Start Kafka Stream'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Global Sentiment */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 globalSentiment < 50 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                 streamActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Global Event Sentiment
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     globalSentiment < 50 ? 'text-red-400' : 
                     streamActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {globalSentiment.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">% Positive</span>
                 </div>
               </div>

               {/* Tweets Processed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 streamActive ? 'bg-sky-950/20 border-sky-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Ingested
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     streamActive ? 'text-sky-400' : 'text-slate-600'
                   }`}>
                     {tweetsProcessed > 999 ? `${(tweetsProcessed/1000).toFixed(1)}k` : tweetsProcessed}
                   </span>
                 </div>
               </div>
               
               {/* Alerts Fired */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 alertsFired > 0 ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Anomalies
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-2xl font-black font-mono leading-none ${
                         alertsFired > 0 ? 'text-amber-400' : 'text-slate-600'
                       }`}>
                         {alertsFired}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050810] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Analysis Ledger</span>
                 {streamActive && <span className="text-sky-400 font-black animate-pulse">RoBERTa RUNNING</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1 uppercase' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Social Media Firehose Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !streamActive ? 'bg-slate-900' : 'bg-[#000511]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">SOCIAL FIREHOSE</span>
                <span className={`text-[8px] font-mono ${streamActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {streamActive ? 'ANALYZING...' : 'DISCONNECTED'}
                </span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12 pb-4 px-4 overflow-hidden">
                  
                  {activeAlert && (
                      <div className="w-full bg-red-950/80 border border-red-500 rounded-lg p-3 mb-4 shrink-0 animate-fade-in-up shadow-[0_0_20px_rgba(239,68,68,0.3)] z-30">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center">
                                  <span className="text-sm mr-1">🚨</span> AI Cluster Anomaly
                              </span>
                              <span className="text-[8px] font-mono bg-red-900 text-white px-1 rounded">CONF: {activeAlert.confidence}</span>
                          </div>
                          <div className="text-xs text-white font-bold mb-2">
                              Issue detected at: <span className="text-red-300 uppercase underline">{activeAlert.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                              <span className="text-[8px] text-slate-400 uppercase tracking-widest mr-1 mt-0.5">Extracted Tokens:</span>
                              {activeAlert.keywords.map(kw => (
                                  <span key={kw} className="bg-red-900/50 border border-red-800 text-red-200 px-1 py-0.5 rounded text-[8px] font-mono">{kw}</span>
                              ))}
                          </div>
                      </div>
                  )}

                  {!streamActive ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up">
                         <span className="text-4xl opacity-50 mb-4">🐦</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Kafka Stream</span>
                     </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-end space-y-3 relative z-20">
                        {/* Gradient Mask for fading out top tweets */}
                        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#000511] to-transparent z-30 pointer-events-none"></div>

                        {liveTweets.map((tweet) => (
                            <div key={tweet.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col animate-fade-in-up shadow-sm">
                                
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-sky-400">{tweet.handle} <span className="text-slate-500 font-normal ml-1">{tweet.time}</span></span>
                                    
                                    {/* Sentiment Pill */}
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                        tweet.sentiment === 'POSITIVE' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' :
                                        tweet.sentiment === 'NEGATIVE' ? 'bg-red-900/30 border-red-800 text-red-400' :
                                        'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}>
                                        {tweet.sentiment} ({(tweet.score * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                
                                <p className="text-sm text-slate-200">{tweet.text}</p>
                            </div>
                        ))}
                    </div>
                  )}

              </div>
              
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0b1120] p-4 rounded-xl border border-slate-800 flex space-x-2">
               
               <button 
                   onClick={triggerCrisis}
                   disabled={!streamActive || crisisMode}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !streamActive || crisisMode ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-600 text-amber-500 hover:bg-amber-900/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                   }`}
                 >
                   Inject Crisis
               </button>

               <button 
                   onClick={resolveCrisis}
                   disabled={!streamActive || !crisisMode}
                   className={`flex-1 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !streamActive || !crisisMode ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60'
                   }`}
                 >
                   Resolve Issue
               </button>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NlpSentimentAnalyzer;
