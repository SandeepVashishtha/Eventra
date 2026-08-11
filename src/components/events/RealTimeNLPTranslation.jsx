/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RealTimeNLPTranslation = () => {
  const [nlpActive, setNlpActive] = useState(false);
  const [sourceLang, setSourceLang] = useState('ES'); // ES or KO
  const [micActive, setMicActive] = useState(false);
  
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [transcriptionPhase, setTranscriptionPhase] = useState(0);

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Vocal Mic 1 routed to NLP Engine. Awaiting signal.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'IMAG Video feed Genlock synced. Subtitle overlay active.' }
  ]);

  const scriptES = [
    { text: "¡Hola Coachella! ¿Cómo están esta noche?", trans: "Hello Coachella! How are you doing tonight?" },
    { text: "Es un honor increíble estar aquí con todos ustedes.", trans: "It's an incredible honor to be here with all of you." },
    { text: "¡Vamos a hacer de esta noche algo inolvidable!", trans: "Let's make this night unforgettable!" }
  ];

  const scriptKO = [
    { text: "코첼라 여러분, 안녕하세요! 만나서 반갑습니다.", trans: "Hello Coachella! So nice to meet you." },
    { text: "저희 음악을 이렇게 큰 무대에서 들려드릴 수 있어서 영광입니다.", trans: "It's an honor to share our music on such a big stage." },
    { text: "마지막까지 함께 뛰어놀아 볼까요?", trans: "Shall we jump and play together until the end?" }
  ];

  useEffect(() => {
    let loop;
    if (micActive && nlpActive) {
      const activeScript = sourceLang === 'ES' ? scriptES : scriptKO;
      
      if (transcriptionPhase < activeScript.length) {
        // Wait a bit, then show translation
        loop = setTimeout(() => {
          const currentPhrase = activeScript[transcriptionPhase];
          addLog('AUDIO', `[IN] ${sourceLang}: "${currentPhrase.text}"`);
          
          setTimeout(() => {
            setCurrentSubtitle(currentPhrase.trans);
            addLog('NLP', `[OUT] EN: "${currentPhrase.trans}"`);
            
            setTimeout(() => {
              setTranscriptionPhase(prev => prev + 1);
            }, 3000);
            
          }, 800); // 800ms translation latency
          
        }, 1500);
      } else {
        // Finished script
        setTimeout(() => {
          setCurrentSubtitle('');
          setMicActive(false);
          setTranscriptionPhase(0);
          addLog('SYS', 'Artist stopped speaking. Cleared IMAG subtitles.');
        }, 3000);
      }
    } else if (!micActive) {
      setCurrentSubtitle('');
      setTranscriptionPhase(0);
    }
    
    return () => { if (loop) clearTimeout(loop); };
  }, [micActive, nlpActive, transcriptionPhase, sourceLang]);

  const toggleNLP = () => {
    if (!nlpActive) {
      setNlpActive(true);
      addLog('SYS', 'OpenAI Whisper NLP engine engaged. Real-time translation online.');
    } else {
      setNlpActive(false);
      setMicActive(false);
      setCurrentSubtitle('');
      addLog('WARN', 'NLP engine disconnected. Subtitle overlay removed.');
    }
  };

  const simulateSpeech = (lang) => {
    if (nlpActive && !micActive) {
      setSourceLang(lang);
      setMicActive(true);
      setTranscriptionPhase(0);
      addLog('ACTION', `Artist speaking in ${lang === 'ES' ? 'Spanish' : 'Korean'}...`);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Translation Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗣️</span> Natural Language Processing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time NLP Translation <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">for International Artists</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When international K-Pop or Latin artists speak to the crowd between songs in their native language, large portions of the festival audience do not understand the emotional context. Eventra solves this by routing the artist's vocal microphone directly into a real-time NLP translation engine (e.g., OpenAI Whisper). As the artist speaks, the AI instantly translates the speech and projects massive, perfectly synced English subtitles onto the stage's IMAG LED screens, breaking the language barrier without ruining the concert's pacing with a human translator.
          </p>

          <div className="bg-[#0f0a05] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎙️</span> NLP Audio Routing
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNLP}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     nlpActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                   {nlpActive ? 'Disable Engine' : 'Engage Translation Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Engine Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 micActive ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Latency Metrics
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${micActive ? 'text-orange-400' : 'text-slate-600'}`}>
                     {micActive ? '800ms' : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Model: Whisper-v3 (Sub-second)
                   </span>
                 </div>
               </div>

               {/* Video Overlay Status */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">IMAG Render Engine</span>
                 <div className="flex flex-col">
                   <span className={`text-xl font-black font-mono leading-tight ${nlpActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                     {nlpActive ? 'SYNCED' : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     Output: Lower-Thirds OSD
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>NLP Processing Log</span>
                 {micActive && <span className="text-orange-400 animate-pulse">Transcribing...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'AUDIO' ? 'text-cyan-400 font-bold' : 
                       log.type === 'NLP' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: IMAG Screen Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Massive Stage Screen Mockup */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#111] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[300px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              nlpActive ? 'shadow-[0_0_80px_rgba(234,88,12,0.2)] border-slate-800' : ''
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Main Stage Center IMAG
                </span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-end bg-black overflow-hidden pb-8">
                
                {/* Simulated Artist Camera Feed (Abstract) */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-black z-0 pointer-events-none"></div>
                
                {micActive && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"></div>
                )}

                {/* Subtitle Rendering Overlay */}
                <div className="relative z-10 w-full px-6 text-center h-20 flex items-center justify-center">
                  {currentSubtitle && (
                    <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)] bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm animate-fade-in-up">
                      {currentSubtitle}
                    </h2>
                  )}
                </div>

                {!nlpActive && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center opacity-30">
                    <span className="text-4xl block mb-2">📺</span>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">IMAG Standby</p>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vocal Mic Simulation</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => simulateSpeech('ES')}
                  disabled={!nlpActive || micActive}
                  className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                    !nlpActive || micActive ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 
                    'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                  }`}
                >
                  <span className="text-lg block mb-1">🇪🇸</span>
                  Speak Spanish
                </button>
                
                <button 
                  onClick={() => simulateSpeech('KO')}
                  disabled={!nlpActive || micActive}
                  className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                    !nlpActive || micActive ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 
                    'bg-cyan-950/40 border-cyan-900 text-cyan-500 hover:bg-cyan-900/60'
                  }`}
                >
                  <span className="text-lg block mb-1">🇰🇷</span>
                  Speak Korean
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default RealTimeNLPTranslation;
