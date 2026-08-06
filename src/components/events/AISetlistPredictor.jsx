/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AISetlistPredictor = () => {
  const [listening, setListening] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  
  // Predictions state
  const [predictions, setPredictions] = useState([
    { title: 'Waiting for audio...', prob: 0, odds: '' }
  ]);
  
  // User wager state
  const [wagerPlaced, setWagerPlaced] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
  // Logs
  const [rnnLog, setRnnLog] = useState([
    { time: '20:15', msg: 'RNN initialized. Ingested 142 historical setlists.' }
  ]);

  const startListening = () => {
    setListening(true);
    addLog('Audio fingerprinting active. Listening to FOH mix...');
    
    setTimeout(() => {
      setCurrentSong('Neon Horizon (Extended Mix)');
      addLog('Match Found: "Neon Horizon (Extended Mix)"');
      addLog('Calculating RNN probabilities for track n+1...');
      
      setTimeout(() => {
        setPredictions([
          { title: 'Midnight City', prob: 68, odds: '1:2' },
          { title: 'Strobe (Club Edit)', prob: 22, odds: '4:1' },
          { title: 'Ghosts n Stuff', prob: 8, odds: '12:1' },
          { title: 'Opus', prob: 2, odds: '50:1' }
        ]);
        addLog('Probabilities generated. Awaiting user wagers.');
      }, 1500);
      
    }, 2000);
  };

  const placeWager = (prediction) => {
    setSelectedPrediction(prediction);
    setWagerPlaced(true);
    addLog(`User locked wager on "${prediction.title}".`);
  };

  const resetSim = () => {
    setListening(false);
    setCurrentSong(null);
    setPredictions([{ title: 'Waiting for audio...', prob: 0, odds: '' }]);
    setWagerPlaced(false);
    setSelectedPrediction(null);
    setRnnLog([{ time: '20:15', msg: 'RNN initialized. Ingested 142 historical setlists.' }]);
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setRnnLog(prev => [{ time: timeString, msg }, ...prev].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Machine Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Setlist Predictor</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Super-fans at jam band concerts or DJ sets constantly try to guess what song is coming next. Eventra gamifies this by piping the artist's historical setlists into a recurrent neural network (RNN). During the live show, the app listens to the audio fingerprint of the current song and uses the RNN to calculate real-time probabilities of what the next track will be, allowing attendees to place friendly wagers.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🤖</span> RNN Inference Engine
               </h3>
               
               <button 
                 onClick={resetSim}
                 className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
               >
                 Reset Neural Net
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center relative overflow-hidden">
                 {listening && !currentSong && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500/50 animate-pulse"></div>
                 )}
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Audio Fingerprint (Current)</span>
                 <span className={`text-lg font-black font-sans leading-tight ${currentSong ? 'text-white' : 'text-neutral-600'}`}>
                   {currentSong || 'Listening...'}
                 </span>
               </div>

               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Historical Dataset Size</span>
                 <span className="text-3xl font-black text-orange-400 font-mono">
                   142<span className="text-sm text-neutral-500"> Setlists</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Inference Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-neutral-400 pr-2">
                 {rnnLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.msg.includes('Match Found') ? 'text-emerald-400 font-bold' : 
                     log.msg.includes('locked') ? 'text-rose-400 font-bold' : 'text-neutral-300'
                   }`}>
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
                 
                 {listening && !currentSong && (
                   <div className="text-orange-400 animate-pulse mt-2 flex items-center">
                     <span className="mr-2">♪</span> Sampling microphone...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-neutral-900 rounded-[3rem] border-[12px] border-black shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30 bg-neutral-900">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 px-4 flex flex-col bg-neutral-900">
               
               {/* App Header */}
               <div className="text-center mb-6">
                 <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)] bg-orange-900/50 border border-orange-500/50">
                   🔮
                 </div>
                 <h2 className="font-black text-white text-xl tracking-widest uppercase">Setlist Oracle</h2>
                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Guess the Next Track</p>
               </div>

               {/* Current Playing */}
               <div className="bg-black rounded-2xl p-4 border border-neutral-800 mb-6 relative overflow-hidden">
                 {listening && !currentSong && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[sweep_2s_infinite]"></div>
                 )}
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Now Playing</p>
                 <div className="flex justify-between items-end">
                   <p className={`font-black text-lg ${currentSong ? 'text-white' : 'text-neutral-600'} leading-tight`}>
                     {currentSong || 'Tap to identify...'}
                   </p>
                   {currentSong && <div className="flex space-x-1 h-4 items-end ml-4 shrink-0">
                     <div className="w-1 bg-orange-500 animate-[bounce_0.5s_infinite_alternate]" style={{height: '100%'}}></div>
                     <div className="w-1 bg-orange-500 animate-[bounce_0.7s_infinite_alternate]" style={{height: '60%'}}></div>
                     <div className="w-1 bg-orange-500 animate-[bounce_0.6s_infinite_alternate]" style={{height: '80%'}}></div>
                   </div>}
                 </div>
               </div>

               {/* Predictions Area */}
               <div className="flex-1 flex flex-col">
                 <div className="flex justify-between items-center mb-3">
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">AI Predictions (Track n+1)</p>
                 </div>
                 
                 <div className="space-y-3">
                   {predictions.map((p, i) => (
                     <div 
                       key={i} 
                       onClick={() => currentSong && !wagerPlaced ? placeWager(p) : null}
                       className={`rounded-xl p-4 border relative overflow-hidden flex justify-between items-center transition-all ${
                         !currentSong ? 'bg-neutral-800 border-neutral-700 opacity-50' : 
                         wagerPlaced && selectedPrediction?.title === p.title ? 'bg-rose-900/30 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                         wagerPlaced ? 'bg-neutral-900 border-neutral-800 opacity-30' :
                         'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 cursor-pointer'
                       }`}
                     >
                       {/* Prob Bar */}
                       {p.prob > 0 && (
                         <div className="absolute left-0 inset-y-0 bg-orange-500/10" style={{width: `${p.prob}%`}}></div>
                       )}
                       
                       <div className="relative z-10">
                         <h4 className={`font-bold text-sm ${wagerPlaced && selectedPrediction?.title === p.title ? 'text-rose-400' : 'text-white'}`}>{p.title}</h4>
                         {p.odds && <p className="text-[10px] font-mono text-neutral-400 mt-1">Odds: {p.odds}</p>}
                       </div>
                       
                       {p.prob > 0 && (
                         <div className="relative z-10 text-right">
                           <span className={`font-black font-mono text-lg ${wagerPlaced && selectedPrediction?.title === p.title ? 'text-rose-400' : 'text-orange-400'}`}>{p.prob}%</span>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Action Area */}
               <div className="mt-6">
                 {!listening ? (
                   <button 
                     onClick={startListening}
                     className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(234,86,12,0.3)] uppercase tracking-widest text-sm hover:bg-orange-500 transition"
                   >
                     Listen to Audio
                   </button>
                 ) : wagerPlaced ? (
                   <div className="w-full bg-rose-600 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(244,63,94,0.3)] uppercase tracking-widest text-sm text-center animate-pulse">
                     Wager Locked
                   </div>
                 ) : (
                   <div className="w-full bg-neutral-800 text-neutral-500 font-black py-4 rounded-xl uppercase tracking-widest text-sm text-center border border-neutral-700">
                     {currentSong ? 'Select a track above' : 'Listening...'}
                   </div>
                 )}
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AISetlistPredictor;
