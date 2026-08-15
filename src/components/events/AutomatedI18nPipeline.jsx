/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutomatedI18nPipeline = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [prCreated, setPrCreated] = useState(false);
  const [activeLang, setActiveLang] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'CI/CD Localization Pipeline listening for GitHub webhooks.' }
  ]);

  const languages = ['es_ES', 'fr_FR', 'ja_JP', 'de_DE', 'zh_CN'];
  const translations = {
      es_ES: '"Comprar Boletos"',
      fr_FR: '"Acheter des Billets"',
      ja_JP: '"チケットを購入する"',
      de_DE: '"Tickets Kaufen"',
      zh_CN: '"购买门票"'
  };

  const triggerPipeline = () => {
      setIsTranslating(true);
      setPrCreated(false);
      setActiveLang(null);
      addLog('ACTION', 'Developer pushed new string to main: {"cta_buy_tickets": "Buy VIP Tickets"}');
      
      setTimeout(() => {
          addLog('SYS', 'Triggering LLM Translation Agent via GitHub Actions...');
          
          let langIndex = 0;
          const translateInterval = setInterval(() => {
              if (langIndex < languages.length) {
                  const lang = languages[langIndex];
                  setActiveLang(lang);
                  addLog('SYS', `LLM generated ${lang} translation: ${translations[lang]}`);
                  langIndex++;
              } else {
                  clearInterval(translateInterval);
                  setActiveLang(null);
                  
                  setTimeout(() => {
                      addLog('WARN', 'Formatting outputs into i18n JSON structures.');
                      
                      setTimeout(() => {
                          setIsTranslating(false);
                          setPrCreated(true);
                          addLog('SUCCESS', 'Automated Pull Request #1442 opened for developer review. Zero manual overhead.');
                      }, 1500);
                  }, 1000);
              }
          }, 800);
          
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsTranslating(false);
      setPrCreated(false);
      setActiveLang(null);
      addLog('SYS', 'Pipeline reset. Awaiting next commit.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌍</span> DevOps & AI Localization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated CI/CD <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-500 to-emerald-500">i18n Translation Pipeline</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Releasing the festival app in 40 different languages requires developers to manually copy-paste JSON files back and forth to expensive human translators, causing massive release delays. Eventra solves this by building an automated Continuous Integration (CI) pipeline. When a developer pushes a new english string, an LLM API is programmatically invoked to translate it into 40 languages, format it into the correct i18n JSON structures, and automatically open a Pull Request for review.
          </p>

          <div className="bg-[#070b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> CI/CD Runner Controls
               </h3>
               {prCreated && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4">
                 
                 {/* Code Input Box */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col relative overflow-hidden mb-4">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Developer Commit</span>
                         <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">en.json</span>
                     </div>
                     <div className="bg-black/60 rounded p-3 font-mono text-[10px] text-slate-300 relative z-10">
                         <div>{'{'}</div>
                         <div className="pl-4">"cta_buy_tickets": <span className="text-teal-400">"Buy VIP Tickets"</span></div>
                         <div>{'}'}</div>
                     </div>
                 </div>
                 
                 <button 
                     onClick={triggerPipeline}
                     disabled={isTranslating || prCreated}
                     className={`w-full py-3 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors ${
                         prCreated ? 'bg-emerald-900/40 text-emerald-500 border-emerald-500/50 cursor-not-allowed' :
                         isTranslating ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                     }`}
                 >
                     {prCreated ? 'Pipeline Finished' : isTranslating ? 'Running GitHub Actions...' : 'Push Commit to CI/CD'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020305] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Actions Runner Logs</span>
                 {isTranslating && <span className="text-indigo-400 font-black animate-pulse">EXECUTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-teal-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">LLM Translation Agent</span>
                      <span className="text-xs text-white font-bold">i18n Output Generator</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* File Generation Visualizer */}
                  <div className="w-full grid grid-cols-2 gap-3 mb-6 relative z-10">
                      
                      {languages.map((lang, idx) => {
                          const isActive = activeLang === lang;
                          const isComplete = prCreated || languages.indexOf(activeLang) > idx;
                          
                          return (
                              <div key={lang} className={`border rounded-lg p-3 transition-all duration-300 ${
                                  isActive ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105' :
                                  isComplete ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-30'
                              }`}>
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="text-[10px] font-bold text-white">{lang}.json</span>
                                      {isComplete && <span className="text-[8px] text-emerald-400">Done</span>}
                                  </div>
                                  <div className="bg-black/50 rounded p-1.5 font-mono text-[7px] text-slate-300 h-10 overflow-hidden">
                                      {isActive && (
                                          <div className="text-indigo-400 animate-pulse">Translating via LLM...</div>
                                      )}
                                      {isComplete && (
                                          <div>
                                              <div>{'{'}</div>
                                              <div className="pl-2">"cta_buy_tickets":</div>
                                              <div className="pl-2 text-teal-400 truncate">{translations[lang]}</div>
                                              <div>{'}'}</div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                      
                      {/* Plus 35 more block */}
                      <div className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center transition-all duration-300 ${
                          prCreated ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-30'
                      }`}>
                          <span className="text-2xl text-slate-500 mb-1">+35</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">More Locales</span>
                      </div>

                  </div>

                  {/* PR Overlay Result */}
                  <div className={`absolute bottom-6 left-6 right-6 transition-all duration-1000 ${
                      prCreated ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}>
                      <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 shadow-2xl relative overflow-hidden">
                          {/* GitHub PR styling */}
                          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                          
                          <div className="pl-3 flex flex-col">
                              <div className="flex items-center mb-1">
                                  <span className="text-emerald-500 mr-2">🔀</span>
                                  <span className="text-white font-bold text-sm">LLM i18n Translation Sync</span>
                                  <span className="text-slate-500 font-mono text-xs ml-2">#1442</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mb-3">eventra-bot opened this pull request just now</span>
                              
                              <div className="bg-slate-950 border border-slate-800 rounded p-2 text-[9px] font-mono text-slate-300">
                                  <span className="text-emerald-400">+ 40 files changed</span>
                                  <br/>
                                  Automated translation of <span className="text-teal-400">`cta_buy_tickets`</span> into 40 targeted locales. Ready for merge.
                              </div>
                              
                              <button className="mt-3 w-full bg-emerald-600 text-white font-bold text-[10px] py-1.5 rounded">
                                  Squash and Merge
                              </button>
                          </div>
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#070b12] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">Zero-Touch Localization:</span>
               Click <span className="text-white font-bold bg-indigo-600 px-1 rounded">Push Commit</span>. Instead of spending thousands of dollars on agencies and waiting two weeks for a simple string change, the CI/CD pipeline intercepts the developer's commit. A GitHub Action programmatically queries an LLM to translate the string into 40 distinct languages. It automatically writes the formatted JSON files back to the repository and opens a Pull Request, reducing the localization lifecycle from weeks to seconds.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutomatedI18nPipeline;
