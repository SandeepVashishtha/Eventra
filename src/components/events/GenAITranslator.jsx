/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GenAITranslator = () => {
  const [nlpActive, setNlpActive] = useState(false);
  const [micState, setMicState] = useState('MUTED'); // MUTED, LISTENING, TRANSLATING
  
  // Pipeline Metrics
  const [transcriptionLatency, setTranscriptionLatency] = useState(0); // ms
  const [translationLatency, setTranslationLatency] = useState(0); // ms
  const [targetLang, setTargetLang] = useState('Spanish');
  
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '17:00:00', type: 'SYS', msg: 'Generative AI NLP Pipeline online.' },
    { id: 2, time: '17:00:02', type: 'SYS', msg: 'Intercepting FOH Vocal Mic Channel 1.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (nlpActive && micState === 'LISTENING') {
      loop = setInterval(() => {
        setTranscriptionLatency(Math.max(80, Math.min(120, 100 + (Math.random() * 20 - 10))));
        setTranslationLatency(Math.max(150, Math.min(250, 200 + (Math.random() * 40 - 20))));
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [nlpActive, micState]);

  const simulateSpeech = () => {
    if (nlpActive && micState === 'MUTED') {
      setMicState('LISTENING');
      addLog('ACTION', 'MC speaking. Whisper transcription initiated...');
      
      const englishPhrase = "What's up California! Are you guys ready for the drop?!";
      const translations = {
        'Spanish': "¡¿Qué pasa California! ¿Están listos para el drop?!",
        'Japanese': "カリフォルニア、調子はどうだ！ドロップの準備はできてるか？！",
        'French': "Quoi de neuf la Californie ! Êtes-vous prêts pour le drop ?!"
      };
      
      // Typing effect for transcript
      let charIndex = 0;
      setCurrentTranscript('');
      setCurrentTranslation('');
      
      const typeLoop = setInterval(() => {
        charIndex += 1;
        setCurrentTranscript(englishPhrase.substring(0, charIndex));
        
        if (charIndex === englishPhrase.length) {
          clearInterval(typeLoop);
          setMicState('TRANSLATING');
          addLog('AI', 'Contextual translation model complete. Rendering AR subtitles.');
          
          setTimeout(() => {
            setCurrentTranslation(translations[targetLang]);
            setMicState('MUTED');
          }, 400); // Simulated inference delay
        }
      }, 40); // 40ms per char
    }
  };

  const clearSpeech = () => {
    setCurrentTranscript('');
    setCurrentTranslation('');
    setMicState('MUTED');
  };

  const toggleNLP = () => {
    if (!nlpActive) {
      setNlpActive(true);
      addLog('SYS', 'NLP Translator Armed. Whisper + GPT models loaded to Edge.');
    } else {
      setNlpActive(false);
      clearSpeech();
      setTranscriptionLatency(0);
      setTranslationLatency(0);
      addLog('WARN', 'Translation offline. International attendees unassisted.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050611] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: NLP Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗣️</span> Real-Time NLP Pipeline
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Generative AI Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Hologram Translator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            At international festivals, a large portion of the crowd cannot understand the MC or artist speaking between songs, creating a massive disconnect in audience engagement. Eventra solves this by routing the live vocal microphone feed through a low-latency Generative AI NLP pipeline (utilizing edge-deployed models like Whisper and GPT). The system instantly transcribes, translates, and renders stylized, context-aware subtitles. These localized subtitles are projected onto the IMAG screens or directly into attendees' AR glasses in their native language in real-time.
          </p>

          <div className="bg-[#0b0c1a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🤖</span> Edge Inference Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNLP}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     nlpActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {nlpActive ? 'Disable Translator' : 'Initialize NLP Models'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Transcription Latency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 micState === 'LISTENING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 nlpActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Whisper Transcription
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     micState === 'LISTENING' ? 'text-cyan-400 animate-pulse' :
                     nlpActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {nlpActive ? Math.floor(transcriptionLatency) : '--'} <span className="text-[12px] text-slate-500">ms</span>
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest font-mono">
                     {micState === 'LISTENING' ? 'Processing Mic Audio...' : 'Awaiting Vocal Input'}
                   </span>
                 </div>
               </div>

               {/* Translation Latency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 micState === 'TRANSLATING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                 nlpActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   GPT Contextual Gen
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     micState === 'TRANSLATING' ? 'text-indigo-400' :
                     nlpActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {nlpActive ? Math.floor(translationLatency) : 0}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020207] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>NLP Engine Log</span>
                 {micState === 'LISTENING' && <span className="text-cyan-400 animate-pulse">Transcribing...</span>}
                 {micState === 'TRANSLATING' && <span className="text-indigo-400 animate-pulse">Translating...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* AR Screen Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">IMAG / AR GLASSES POV</span>
                <span className="text-[8px] font-mono text-slate-400">LIVE RENDER</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
                
                {/* Background Stage Image Simulation (Blurry) */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent z-0"></div>
                
                <div className="absolute z-10 w-full h-full flex flex-col justify-end pb-12 px-6">
                   
                   {/* English Transcript (Small/Subtle) */}
                   <div className="mb-2 min-h-[16px]">
                     {currentTranscript && (
                       <span className="text-[12px] font-mono text-slate-400 bg-black/50 px-2 py-1 rounded">
                         "{currentTranscript}"
                       </span>
                     )}
                   </div>

                   {/* Translated Subtitle (Large/Stylized) */}
                   <div className="min-h-[48px] flex items-end">
                     {currentTranslation && (
                       <span className="text-2xl font-black text-white leading-tight drop-shadow-[0_4px_15px_rgba(59,130,246,0.8)] animate-fade-in-up">
                         {currentTranslation}
                       </span>
                     )}
                   </div>

                </div>

                {/* Status Overlay */}
                <div className="absolute top-12 left-4 z-20 flex flex-col space-y-1">
                   <div className="flex items-center space-x-2 bg-black/80 px-2 py-1 rounded border border-slate-800">
                     <span className={`w-2 h-2 rounded-full ${micState !== 'MUTED' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]' : 'bg-slate-600'}`}></span>
                     <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">Mic Live</span>
                   </div>
                   
                   <div className="flex items-center space-x-2 bg-black/80 px-2 py-1 rounded border border-slate-800">
                     <span className="text-[8px] font-black tracking-widest text-blue-400 uppercase">Target: {targetLang}</span>
                   </div>
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0c1a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Language & Dispatch</span>
               
               <div className="flex justify-center space-x-2 mb-4">
                 {['Spanish', 'Japanese', 'French'].map(lang => (
                   <button
                     key={lang}
                     onClick={() => { setTargetLang(lang); clearSpeech(); }}
                     className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition ${
                       targetLang === lang ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                     }`}
                   >
                     {lang}
                   </button>
                 ))}
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={simulateSpeech}
                   disabled={!nlpActive || micState !== 'MUTED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !nlpActive || micState !== 'MUTED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                   }`}
                 >
                   Inject MC Speech
                 </button>
                 
                 <button 
                   onClick={clearSpeech}
                   disabled={!currentTranscript && !currentTranslation}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !currentTranscript && !currentTranslation ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Clear Screen
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GenAITranslator;
