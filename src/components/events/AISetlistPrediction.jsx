/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AISetlistPrediction = () => {
  const [appActive, setAppActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [predictionReady, setPredictionReady] = useState(false);
  
  const [dataLog, setDataLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Spotify OAuth token validated. Listening history synced.' },
    { id: 2, time: '21:30:05', type: 'SYS', msg: 'Awaiting Setlist.fm historical data cross-reference.' }
  ]);

  const initiateAnalysis = () => {
    if (appActive && !predictionReady && !analyzing) {
      setAnalyzing(true);
      addLog('ACTION', 'Initiating probability matrix cross-reference.');
      
      setTimeout(() => {
        addLog('WEB3', 'Fetching ODESZA historical setlist data (last 40 shows).');
        
        setTimeout(() => {
          addLog('SYS', 'Mapping user top tracks against 82% probability threshold.');
          
          setTimeout(() => {
            setAnalyzing(false);
            setPredictionReady(true);
            addLog('SUCCESS', 'Prediction generated. Firing localized push notification.');
          }, 1500);
          
        }, 1200);
      }, 800);
    }
  };

  const toggleApp = () => {
    if (!appActive) {
      setAppActive(true);
      addLog('SYS', 'Eventra App connected to streaming services.');
    } else {
      setAppActive(false);
      setPredictionReady(false);
      setAnalyzing(false);
      addLog('WARN', 'Streaming integration disconnected.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setDataLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Data Aggregation Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Big Data Aggregation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Generated Personalized <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Setlist Predictions</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees often wander between stages trying to figure out if an artist is going to play the specific songs they know, leading to a fragmented experience. Eventra securely connects to the attendee's Spotify API to read their listening history. It cross-references this with the headline artist's historical setlist data from Setlist.fm. The predictive AI then generates personalized push notifications, driving attendees to exactly the right stage at exactly the right time.
          </p>

          <div className="bg-[#111] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🧠</span> Setlist Prediction Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleApp}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     appActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {appActive ? 'Disconnect Spotify' : 'Link Streaming API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* User Listening Data */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 appActive ? 'bg-green-950/20 border-green-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   <span className="text-green-500 mr-1">Spotify</span> Profile
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-lg font-black font-mono leading-tight ${appActive ? 'text-green-400' : 'text-slate-600'}`}>
                     {appActive ? 'User_0x82A' : 'Disconnected'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Top Artist: {appActive ? 'ODESZA (84 plays)' : 'N/A'}
                   </span>
                 </div>
               </div>

               {/* Historical Setlist Data */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 predictionReady ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   <span className="text-blue-500 mr-1">Setlist.fm</span> Historical
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-lg font-black font-mono leading-tight ${predictionReady ? 'text-blue-400' : 'text-slate-600'}`}>
                     {predictionReady ? '40 Shows Analyzed' : 'Waiting...'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Match Probability: {predictionReady ? '92%' : '---'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Data Pipeline Log</span>
                 {analyzing && <span className="text-purple-400 animate-pulse">Running Neural Net...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {dataLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-purple-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-blue-400' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Phone Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Phone Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[12px] border-[#111] shadow-2xl relative flex flex-col h-[500px] overflow-hidden font-sans mb-8 bg-slate-900 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-black rounded-b-2xl"></div>
              </div>

              {/* Lock Screen Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-black z-0">
                <div className="absolute top-16 w-full text-center">
                  <h2 className="text-6xl font-thin text-white/90">21:42</h2>
                  <p className="text-xs font-bold text-white/50 mt-2 uppercase tracking-widest">Friday, August 7</p>
                </div>
              </div>

              {/* Push Notifications Container */}
              <div className="absolute inset-x-0 top-1/2 p-4 z-10 flex flex-col space-y-2">
                
                {predictionReady ? (
                  <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg animate-fade-in-up">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-[10px]">E</div>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Eventra AI</span>
                      </div>
                      <span className="text-[10px] text-white/50">Now</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-white mb-1">Incoming: Your Favorite Track 🎵</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Based on your Spotify listening, <strong className="text-purple-400">ODESZA</strong> is highly likely to play <strong className="text-pink-400">"Line Of Sight"</strong> in the next 15 minutes. Head to the Main Stage now!
                    </p>
                  </div>
                ) : (
                  <div className="text-center opacity-40 pt-10">
                    <span className="text-xs font-bold uppercase tracking-widest">No New Notifications</span>
                  </div>
                )}
                
              </div>

            </div>

            {/* Interaction Controls */}
            <div className="w-full bg-slate-900 p-5 rounded-[2rem] border-4 border-slate-700 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Eventra Prediction AI</span>
              
              <button 
                onClick={initiateAnalysis}
                disabled={!appActive || predictionReady || analyzing}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !appActive || predictionReady || analyzing ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 
                  'bg-purple-900/40 border-purple-700 text-purple-400 hover:bg-purple-900/60'
                }`}
              >
                {analyzing ? 'Analyzing APIs...' : 'Generate Live Prediction'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AISetlistPrediction;
