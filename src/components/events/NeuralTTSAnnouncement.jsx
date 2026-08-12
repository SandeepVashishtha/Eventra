import React, { useState } from 'react';

const NeuralTTSAnnouncement = () => {
  const [message, setMessage] = useState('Severe weather approaching. Please evacuate the main festival grounds immediately and seek shelter in the indoor exhibition halls.');
  const [systemState, setSystemState] = useState('idle'); // idle, translating, synthesizing, broadcasting, complete
  
  const [activeLanguage, setActiveLanguage] = useState(null);
  
  const languages = [
    { code: 'EN', name: 'English', targetAudience: '64%', status: 'pending' },
    { code: 'ES', name: 'Spanish', targetAudience: '18%', status: 'pending' },
    { code: 'FR', name: 'French', targetAudience: '9%', status: 'pending' },
    { code: 'DE', name: 'German', targetAudience: '5%', status: 'pending' },
    { code: 'JA', name: 'Japanese', targetAudience: '2%', status: 'pending' }
  ];
  
  const [broadcastingQueue, setBroadcastingQueue] = useState(languages);

  const initiateBroadcast = () => {
    if (!message) return;
    
    setSystemState('translating');
    
    // Simulate Translation & Synthesis API delay
    setTimeout(() => {
      setSystemState('synthesizing');
      
      setTimeout(() => {
        setSystemState('broadcasting');
        playQueue(0);
      }, 1500);
      
    }, 1500);
  };
  
  const playQueue = (index) => {
    if (index >= broadcastingQueue.length) {
      setSystemState('complete');
      setActiveLanguage(null);
      
      setTimeout(() => {
        setSystemState('idle');
        setBroadcastingQueue(languages);
      }, 3000);
      return;
    }
    
    setActiveLanguage(broadcastingQueue[index].code);
    setBroadcastingQueue(prev => prev.map((l, i) => 
      i === index ? {...l, status: 'playing'} : l
    ));
    
    // Simulate playing audio for 3 seconds per language
    setTimeout(() => {
      setBroadcastingQueue(prev => prev.map((l, i) => 
        i === index ? {...l, status: 'complete'} : l
      ));
      playQueue(index + 1);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Operations Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Life-Safety Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Neural-TTS <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Multilingual Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Ensure international attendees aren't left in grave danger during evacuations. Eventra hooks directly into the venue's PA system. Organizers type an emergency message in English; the generative AI instantly translates and synthesizes hyper-realistic audio announcements in the top languages spoken by the registered attendees.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col">
             
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                 <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span> Emergency Broadcast Terminal
               </h3>
               <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-mono">PA-SYS-LINK: ACTIVE</span>
             </div>

             <div className="mb-6 relative">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Message Payload (English Base)</label>
               <textarea 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 disabled={systemState !== 'idle'}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-lg font-bold resize-none h-32 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
               ></textarea>
               
               {systemState === 'idle' && (
                 <button 
                   onClick={initiateBroadcast}
                   className="absolute bottom-4 right-4 bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-2 rounded-lg text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.4)] transition"
                 >
                   Trigger Override
                 </button>
               )}
             </div>

             {/* Generation Pipeline Log */}
             <div className="bg-slate-900 rounded-xl p-4 min-h-[120px] font-mono text-xs overflow-hidden relative">
               
               {systemState === 'idle' && (
                 <div className="text-slate-600 flex items-center justify-center h-full">
                   Awaiting manual override command...
                 </div>
               )}
               
               {systemState === 'translating' && (
                 <div className="text-sky-400 animate-pulse">
                   <p>&gt; Ingesting english base payload...</p>
                   <p>&gt; Establishing secure connection to LLM Translation API...</p>
                   <p>&gt; Generating contextual translations for [ES, FR, DE, JA]...</p>
                 </div>
               )}
               
               {systemState === 'synthesizing' && (
                 <div className="text-amber-400">
                   <p>&gt; Translations validated by secondary AI agent.</p>
                   <p>&gt; Routing to Neural-TTS Engine...</p>
                   <p className="animate-pulse">&gt; Synthesizing hyper-realistic audio waveforms...</p>
                 </div>
               )}
               
               {(systemState === 'broadcasting' || systemState === 'complete') && (
                 <div className="text-emerald-400">
                   <p>&gt; Audio payloads synthesized successfully.</p>
                   <p>&gt; Bypassing venue PA system lock...</p>
                   {systemState === 'broadcasting' ? (
                     <p className="text-rose-400 animate-pulse font-black mt-2">&gt; BROADCASTING SEQUENCE INITIATED.</p>
                   ) : (
                     <p className="font-bold mt-2">&gt; SEQUENCE COMPLETE. NORMAL OPS RESTORED.</p>
                   )}
                 </div>
               )}

             </div>
          </div>
        </div>

        {/* Right Side: PA System Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          
          <div className="w-full bg-slate-900 rounded-[3rem] border-[12px] border-slate-950 shadow-2xl relative flex flex-col h-[600px] overflow-hidden">
            
            {/* Speaker Grille Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #475569 2px, transparent 2px)',
              backgroundSize: '12px 12px'
            }}></div>

            <div className="relative z-10 flex-1 flex flex-col p-6">
              
              <div className="text-center mb-8">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  systemState === 'broadcasting' ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {systemState === 'broadcasting' ? 'LIVE AUDIO OUT' : 'PA SYSTEM STANDBY'}
                </span>
              </div>

              {/* Audio Visualizer */}
              <div className="h-32 flex items-center justify-center space-x-2 mb-8">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 rounded-full transition-all duration-150 ${systemState === 'broadcasting' ? 'bg-rose-500' : 'bg-slate-800 h-2'}`}
                    style={{ 
                      height: systemState === 'broadcasting' ? \`\${Math.max(10, Math.random() * 100)}%\` : '8px',
                      boxShadow: systemState === 'broadcasting' ? '0 0 15px rgba(225,29,72,0.5)' : 'none'
                    }}
                  ></div>
                ))}
              </div>

              {/* Language Queue */}
              <div className="flex-1 bg-black/50 rounded-2xl border border-slate-800 p-4 overflow-y-auto space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Target Demographic Queue</h4>
                
                {broadcastingQueue.map((lang, index) => (
                  <div key={lang.code} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    lang.status === 'playing' ? 'bg-rose-900/30 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.2)]' :
                    lang.status === 'complete' ? 'bg-emerald-900/20 border-emerald-500/30 opacity-50' :
                    'bg-slate-800/50 border-slate-700/50'
                  }`}>
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-[10px] font-black text-white mr-3 border border-slate-700">
                        {lang.code}
                      </span>
                      <div>
                        <span className="text-white font-bold text-sm block leading-none mb-1">{lang.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Target: {lang.targetAudience}</span>
                      </div>
                    </div>
                    
                    <div>
                      {lang.status === 'playing' && (
                        <div className="flex space-x-1 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animation-delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animation-delay-300"></span>
                        </div>
                      )}
                      {lang.status === 'complete' && <span className="text-emerald-500 font-bold">✓</span>}
                      {lang.status === 'pending' && <span className="text-slate-600 text-[10px] uppercase font-bold">Pending</span>}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NeuralTTSAnnouncement;
