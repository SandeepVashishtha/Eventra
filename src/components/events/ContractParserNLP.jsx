import React, { useState } from 'react';

const ContractParserNLP = () => {
  const [parsingState, setParsingState] = useState('idle'); // idle, scanning, complete
  const [activeDocument, setActiveDocument] = useState(null);
  
  const [extractedTasks, setExtractedTasks] = useState([]);

  const simulateUpload = () => {
    setActiveDocument({ name: 'Rider_Dr_S_Jenkins_2026.pdf', size: '2.4 MB', pages: 18 });
    setParsingState('scanning');
    
    setTimeout(() => {
      setParsingState('complete');
      
      setExtractedTasks([
        {
          id: 'tsk_001',
          category: 'Catering',
          priority: 'High',
          description: 'Ensure 2 bottles of sparkling water and organic green tea are in Green Room B prior to 10:00 AM.',
          source: 'Page 14, Section 8.2 (Hospitality)',
          status: 'pending'
        },
        {
          id: 'tsk_002',
          category: 'A/V',
          priority: 'Critical',
          description: 'Provide a wireless lapel mic (Countryman preferred). No handhelds allowed during presentation.',
          source: 'Page 7, Section 3.1 (Technical Requirements)',
          status: 'pending'
        },
        {
          id: 'tsk_003',
          category: 'Travel',
          priority: 'Medium',
          description: 'Arrange black car service from LAX. Driver must wait at baggage claim with iPad sign.',
          source: 'Page 3, Section 1.5 (Transit)',
          status: 'pending'
        }
      ]);
    }, 2500);
  };

  const toggleTaskStatus = (id) => {
    setExtractedTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Upload & NLP Engine (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📄</span> NLP & OCR
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Smart Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Parsing Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop missing critical speaker requirements buried on page 14 of a massive PDF. Eventra's NLP engine scans legal riders, extracts actionable items like A/V needs or dietary restrictions, and automatically generates tasks in your operational dashboard.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Document Ingestion</h3>
             
             {parsingState === 'idle' ? (
               <div 
                 onClick={simulateUpload}
                 className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group"
               >
                 <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                   📤
                 </div>
                 <span className="font-bold text-indigo-900 mb-1">Upload Speaker Rider (PDF)</span>
                 <span className="text-xs text-indigo-500 font-mono">Click to simulate upload</span>
               </div>
             ) : (
               <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                 
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 
                 <div className="flex items-center space-x-4 mb-6">
                   <div className="text-4xl">📄</div>
                   <div>
                     <h4 className="font-bold text-sm truncate max-w-[200px]">{activeDocument.name}</h4>
                     <span className="text-[10px] text-slate-400 font-mono">{activeDocument.size} • {activeDocument.pages} Pages</span>
                   </div>
                 </div>

                 {parsingState === 'scanning' ? (
                   <div className="space-y-4 relative z-10">
                     <div className="flex justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                       <span className="animate-pulse">NLP Engine Scanning...</span>
                       <span>Extracting</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-full animate-[progress_2.5s_ease-in-out]"></div>
                     </div>
                     <div className="text-[10px] font-mono text-slate-500 space-y-1">
                       <p>[Entity Recognition] Found: "Green Tea"</p>
                       <p>[Intent Parsing] "Must have" - flagged as MANDATORY</p>
                       <p>[Categorization] Routing to CATERING...</p>
                     </div>
                   </div>
                 ) : (
                   <div className="relative z-10 text-center py-4">
                     <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/50">
                       <span className="text-emerald-400 text-xl">✓</span>
                     </div>
                     <span className="block text-emerald-400 font-black text-sm uppercase tracking-widest mb-1">Parsing Complete</span>
                     <span className="text-xs text-slate-400 font-mono">3 Actionable Tasks Extracted</span>
                   </div>
                 )}
                 
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Operational Dashboard (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 z-10">
            <div>
              <h2 className="text-lg font-black text-white">Operations Task Board</h2>
              <span className="text-xs text-slate-400 font-mono">Auto-generated via NLP Parsing</span>
            </div>
            
            <span className="bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded">
              Jenkins, S. (Keynote)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            
            {parsingState !== 'complete' ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <span className="text-5xl mb-4 text-slate-600">📋</span>
                <p className="text-white font-bold text-sm uppercase tracking-widest">No Extracted Tasks</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">Upload a document to begin parsing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {extractedTasks.map(task => (
                  <div key={task.id} className={`bg-slate-950 border rounded-2xl p-5 transition-all animate-fade-in-up ${task.status === 'completed' ? 'border-emerald-500/50 opacity-50' : 'border-slate-700'}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-600 hover:border-indigo-400 bg-transparent text-transparent'}`}
                        >
                          ✓
                        </button>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          task.category === 'Catering' ? 'bg-orange-900/50 text-orange-400' : 
                          task.category === 'A/V' ? 'bg-blue-900/50 text-blue-400' : 
                          'bg-purple-900/50 text-purple-400'
                        }`}>
                          {task.category}
                        </span>
                      </div>
                      
                      <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center ${
                        task.priority === 'Critical' ? 'text-rose-500' : 
                        task.priority === 'High' ? 'text-amber-500' : 
                        'text-slate-400'
                      }`}>
                        {task.priority === 'Critical' && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5 animate-pulse"></span>}
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className={`text-sm mb-4 leading-relaxed ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.description}
                    </p>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <div className="flex items-center text-xs text-slate-500 font-mono">
                        <span className="mr-2">🔗</span>
                        Extracted from: {task.source}
                      </div>
                      <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-1 rounded">
                        Auto-assigned to {task.category} Team
                      </span>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
            
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default ContractParserNLP;
