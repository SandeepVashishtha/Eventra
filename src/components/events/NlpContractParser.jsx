/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NlpContractParser = () => {
  const [parserStatus, setParserStatus] = useState('IDLE'); // IDLE, SCANNING, EXTRACTING, COMPLETE
  
  // NLP Metrics
  const [contractsProcessed, setContractsProcessed] = useState(142); 
  const [hoursSaved, setHoursSaved] = useState(485); 
  const [nlpAccuracy, setNlpAccuracy] = useState(98.4); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Document AI OCR Engine initialized.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'LLM context window ready for 50-page PDF ingestion.' }
  ]);

  // Visualizer State
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [activeContract, setActiveContract] = useState(null);

  const mockTasks = [
      { id: 1, dept: 'HOSPITALITY', assignee: 'Sarah Jenkins', task: 'Source 4x strictly Vegan hot meals for dressing room.', deadline: '14:00 Day of Show', priority: 'HIGH' },
      { id: 2, dept: 'TECH', assignee: 'Audio Team', task: 'Provide 4x Pioneer CDJ-3000s linked via ethernet.', deadline: '09:00 Load-in', priority: 'CRITICAL' },
      { id: 3, dept: 'SECURITY', assignee: 'Gate Squad', task: 'Allocate 6 backstage VIP wristbands for artist entourage.', deadline: '12:00 Day of Show', priority: 'MEDIUM' },
      { id: 4, dept: 'TRANSPORT', assignee: 'Fleet Dispatch', task: 'Arrange black SUV pickup from airport at 08:30 AM.', deadline: '08:00 Day of Show', priority: 'HIGH' }
  ];

  const simulateUpload = () => {
      if (parserStatus !== 'IDLE') return;
      
      setParserStatus('SCANNING');
      setActiveContract('Neon_Syndicate_Rider_2026.pdf');
      addLog('ACTION', 'Uploaded 42-page PDF: Neon_Syndicate_Rider_2026.pdf');
      
      setTimeout(() => {
          setParserStatus('EXTRACTING');
          addLog('SYS', 'Running Optical Character Recognition (OCR)...');
          
          setTimeout(() => {
              addLog('SYS', 'Piping raw text to LLM for SLA & Clause Extraction...');
              
              setTimeout(() => {
                  setParserStatus('COMPLETE');
                  setExtractedTasks(mockTasks);
                  setContractsProcessed(prev => prev + 1);
                  setHoursSaved(prev => prev + 3.5);
                  addLog('SUCCESS', 'NLP pipeline completed. 4 actionable SLAs extracted and converted to Kanban tickets.');
              }, 2500);

          }, 1500);
      }, 1500);
  };

  const resetParser = () => {
      setParserStatus('IDLE');
      setExtractedTasks([]);
      setActiveContract(null);
      addLog('ACTION', 'Kanban board cleared. Ready for next contract upload.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const getPriorityColor = (priority) => {
      switch(priority) {
          case 'CRITICAL': return 'bg-red-900/50 text-red-400 border-red-800';
          case 'HIGH': return 'bg-orange-900/50 text-orange-400 border-orange-800';
          case 'MEDIUM': return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
          default: return 'bg-slate-800 text-slate-400 border-slate-700';
      }
  };

  return (
    <div className="min-h-screen bg-[#050a0f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📄</span> Document AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated NLP Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Parsing & Enforcement</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Artist hospitality riders and technical contracts are often 40-page PDFs. Production managers are forced to read them manually and inevitably miss obscure clauses, resulting in breach of contract, missing equipment, and angry artists. Eventra solves this by integrating a backend Natural Language Processing (NLP) pipeline. The AI ingests the uploaded PDF, extracts actionable Service Level Agreements (SLAs), and automatically converts them into an actionable Kanban board UI, assigning tasks to the correct staff member with rigid deadlines.
          </p>

          <div className="bg-[#0b121a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> NLP Pipeline Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetParser}
                   disabled={parserStatus === 'IDLE' || parserStatus === 'SCANNING' || parserStatus === 'EXTRACTING'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     parserStatus === 'IDLE' || parserStatus === 'SCANNING' || parserStatus === 'EXTRACTING' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   Clear Kanban Board
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Engine State */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 parserStatus === 'SCANNING' || parserStatus === 'EXTRACTING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse' : 
                 parserStatus === 'COMPLETE' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   LLM Status
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     parserStatus === 'SCANNING' || parserStatus === 'EXTRACTING' ? 'text-cyan-400' : 
                     parserStatus === 'COMPLETE' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {parserStatus}
                   </span>
                 </div>
               </div>

               {/* Contracts Processed */}
               <div className="col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Contracts
                 </span>
                 <div className="flex items-end">
                   <span className="text-2xl font-black font-mono leading-none text-slate-300">
                     {contractsProcessed}
                   </span>
                 </div>
               </div>
               
               {/* Hours Saved */}
               <div className="col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-emerald-950/20 border-emerald-900/50">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Hours Saved
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-emerald-400">
                         {hoursSaved.toFixed(0)}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#03060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Vector Database Ledger</span>
                 {parserStatus === 'EXTRACTING' && <span className="text-cyan-400 font-black animate-pulse">GENERATING EMBEDDINGS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-500 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Dashboard UI Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 transition-all duration-500 bg-[#0a1217]`}>
              
              <div className="pt-4 pb-4 px-6 border-b border-slate-800 flex justify-between items-center z-40 bg-slate-900/80 backdrop-blur-md">
                  <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow-md">Admin Workspace</span>
                  <div className="flex gap-2">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border bg-emerald-900/30 text-emerald-400 border-emerald-800">
                          NLP AUTO-TASKER
                      </span>
                  </div>
              </div>

              <div className="flex-1 relative overflow-y-auto p-4 flex flex-col">
                  
                  {/* Upload Area */}
                  {parserStatus === 'IDLE' && (
                      <div 
                          onClick={simulateUpload}
                          className="w-full flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group bg-slate-900/30"
                      >
                          <div className="w-16 h-16 bg-slate-800 group-hover:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 transition-colors">
                              <span className="text-2xl text-slate-400 group-hover:text-emerald-400">📄</span>
                          </div>
                          <span className="text-sm font-black text-white uppercase tracking-widest mb-2">Upload Artist Rider</span>
                          <span className="text-[10px] text-slate-500 max-w-[200px]">Drag & drop PDF contract to automatically extract SLAs via Document AI.</span>
                      </div>
                  )}

                  {/* Processing State */}
                  {(parserStatus === 'SCANNING' || parserStatus === 'EXTRACTING') && (
                      <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in-up">
                          <div className="w-16 h-16 relative mb-6">
                              <div className="absolute inset-0 border-4 border-slate-800 rounded"></div>
                              <div className="absolute top-0 inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_1.5s_ease-in-out_infinite_alternate]"></div>
                              <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-50">📄</span>
                          </div>
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 animate-pulse">
                              {parserStatus === 'SCANNING' ? 'Parsing PDF Text Nodes...' : 'LLM Extracting Clauses...'}
                          </span>
                          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full animate-[progress_3s_ease-in-out_forwards]"></div>
                          </div>
                          
                          <div className="mt-8 bg-slate-900 border border-slate-800 p-3 rounded-lg w-full max-w-[280px]">
                              <span className="text-[8px] text-slate-500 font-mono mb-1 block">LIVE RAW EXTRACTION:</span>
                              <div className="text-[8px] font-mono text-cyan-500 opacity-70 h-16 overflow-hidden">
                                  {`...section 4.2: The promoter agrees to provide four (4) Pioneer CDJ-3000 multi-players, linked via ethernet, and one (1) DJM-900NXS2 mixer. Failure to provide exact specifications will result in... \n\n...section 5.1: Backstage dressing room must include four (4) hot vegan meals served at...`}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Kanban Output */}
                  {parserStatus === 'COMPLETE' && (
                      <div className="w-full h-full flex flex-col animate-fade-in-up">
                          <div className="flex justify-between items-end mb-4">
                              <div>
                                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Source Contract</span>
                                  <span className="text-xs font-black text-white">{activeContract}</span>
                              </div>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">4 Tickets Generated</span>
                          </div>

                          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 overflow-y-auto">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">To-Do Queue (Auto-Assigned)</span>
                              
                              {extractedTasks.map(task => (
                                  <div key={task.id} className="bg-[#050a0f] border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-colors">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-900/20 px-1 rounded border border-emerald-800/50">
                                              {task.dept}
                                          </span>
                                          <span className={`text-[8px] font-black uppercase tracking-widest px-1 rounded border ${getPriorityColor(task.priority)}`}>
                                              {task.priority}
                                          </span>
                                      </div>
                                      <p className="text-xs text-white mb-3">{task.task}</p>
                                      <div className="flex justify-between items-center text-[10px]">
                                          <div className="flex items-center text-slate-400">
                                              <span className="mr-1">👤</span> {task.assignee}
                                          </div>
                                          <div className="flex items-center text-slate-500 font-mono">
                                              <span className="mr-1">⏱️</span> {task.deadline}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
              
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
        }
      `}} />

    </div>
  );
};

export default NlpContractParser;
