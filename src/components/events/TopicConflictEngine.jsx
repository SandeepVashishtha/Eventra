import React, { useState } from 'react';

const TopicConflictEngine = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const [conflicts, setConflicts] = useState([
    {
      id: 'CF-101',
      topic: 'Microservices vs Monolith Architecture',
      similarity: 88,
      speakers: [
        { name: 'Dr. Alan Turing', talk: 'The Fall of the Monolith', status: 'approved' },
        { name: 'Sarah Connor', talk: 'Microservices at Scale', status: 'pending' }
      ],
      resolution: null
    },
    {
      id: 'CF-102',
      topic: 'Web3 & Decentralized Finance',
      similarity: 94,
      speakers: [
        { name: 'Vitalik Nakamoto', talk: 'The Future of DeFi', status: 'approved' },
        { name: 'Ada Lovelace', talk: 'Decentralized Finance 2.0', status: 'pending' }
      ],
      resolution: null
    }
  ]);

  const totalAbstracts = 482;
  
  const runAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setAnalyzing(false);
          setAnalysisComplete(true);
        }, 500);
      }
      
      setProgress(currentProgress);
    }, 400);
  };

  const resolveConflict = (id, resolutionType) => {
    setConflicts(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, resolution: resolutionType };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Engine Controls (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> NLP Engine
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Topic Conflict <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">Resolution</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop manually reviewing hundreds of speaker submissions. Our Natural Language Processing engine semantically analyzes abstracts and slide decks to flag overlapping content, suggesting schedule adjustments to guarantee a highly diverse event program.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
             
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Semantic Analysis Engine</h3>
             
             <div className="flex justify-between items-end mb-2">
               <div>
                 <span className="text-3xl font-black text-slate-900">{totalAbstracts}</span>
                 <span className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Abstracts</span>
               </div>
               <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">2026 Summit</span>
             </div>

             <div className="mt-8">
               {analyzing ? (
                 <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                     <span>Processing Tensors...</span>
                     <span>{progress}%</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={runAnalysis}
                   className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                 >
                   <span className="text-lg">▶</span>
                   <span>Run Global Conflict Check</span>
                 </button>
               )}
             </div>

             {analysisComplete && (
               <div className="mt-6 pt-4 border-t border-slate-100 animate-fade-in text-center">
                 <span className="text-emerald-500 text-xl block mb-1">✓</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Analysis Complete</span>
                 <span className="text-sm font-black text-rose-500 mt-1 block">2 Semantic Conflicts Found</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Resolution Dashboard (Col span 8) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-6 md:p-8 border-4 border-slate-800 shadow-2xl flex flex-col h-[650px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white">Programming Committee Dashboard</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">AI Flagged Overlaps requiring human resolution.</p>
            </div>
            {analysisComplete && <span className="bg-rose-900/50 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">Action Required</span>}
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {!analysisComplete ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <span className="text-5xl mb-4 text-slate-500">🔍</span>
                <p className="text-white font-bold text-lg">Awaiting NLP Analysis</p>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">Run the Global Conflict Check to semantically scan all {totalAbstracts} speaker abstracts for overlapping content.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {conflicts.map(conflict => (
                  <div key={conflict.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 animate-fade-in-up relative overflow-hidden">
                    
                    {conflict.resolution && (
                      <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <span className="text-emerald-400 text-4xl mb-2">✓</span>
                        <h4 className="text-white font-black text-lg mb-1">Conflict Resolved</h4>
                        <p className="text-emerald-200 text-xs font-mono uppercase">Action taken: {conflict.resolution}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest block mb-1">Semantic Overlap Cluster</span>
                        <h3 className="text-lg font-black text-white">{conflict.topic}</h3>
                      </div>
                      <div className="text-center bg-rose-900/20 border border-rose-500/30 px-3 py-1.5 rounded-lg">
                        <span className="block text-2xl font-black text-rose-500 leading-none">{conflict.similarity}%</span>
                        <span className="block text-[8px] text-rose-400 uppercase tracking-widest mt-1">Similarity Match</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {conflict.speakers.map((speaker, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-200 text-sm">{speaker.name}</h4>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${speaker.status === 'approved' ? 'bg-emerald-900/50 text-emerald-500' : 'bg-amber-900/50 text-amber-500'}`}>
                              {speaker.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic">"{speaker.talk}"</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">AI Suggested Resolutions</h4>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => resolveConflict(conflict.id, 'Amalgamated into Panel')}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg border border-slate-700 transition"
                        >
                          Merge into Joint Panel
                        </button>
                        <button 
                          onClick={() => resolveConflict(conflict.id, 'Rejected Pending Speaker')}
                          className="flex-1 bg-slate-800 hover:bg-rose-900/50 text-white text-xs font-bold py-2.5 rounded-lg border border-slate-700 hover:border-rose-500/50 transition"
                        >
                          Reject Pending Talk
                        </button>
                        <button 
                          onClick={() => resolveConflict(conflict.id, 'Requested Topic Pivot')}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-lg border border-slate-700 transition"
                        >
                          Request Pivot
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TopicConflictEngine;
