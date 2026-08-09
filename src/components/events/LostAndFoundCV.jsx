/* eslint-disable */
import React, { useState, useEffect } from 'react';

const LostAndFoundCV = () => {
  const [cvActive, setCvActive] = useState(false);
  const [matchStatus, setMatchStatus] = useState('IDLE'); // IDLE, SCANNING, EXTRACTING, MATCH_FOUND
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '01:00:00', type: 'SYS', msg: 'YOLOv8 Computer Vision model loaded.' },
    { id: 2, time: '01:00:02', type: 'SYS', msg: 'Awaiting attendee image upload for vector similarity search.' }
  ]);

  const [dbItems, setDbItems] = useState([
    { id: 'INV-802', type: 'Wallet', tags: ['Brown Leather', 'Bifold'], match: 0 },
    { id: 'INV-803', type: 'Keys', tags: ['Honda', 'Red Carabiner'], match: 0 },
    { id: 'INV-804', type: 'Phone', tags: ['iPhone 15 Pro', 'Blue Case', 'Cracked Screen'], match: 0 },
    { id: 'INV-805', type: 'Phone', tags: ['Samsung S24', 'Black Case'], match: 0 },
  ]);

  const simulateMatch = () => {
    if (cvActive && matchStatus === 'IDLE') {
      setMatchStatus('SCANNING');
      addLog('ACTION', 'Attendee uploaded reference photo (Target: iPhone, Blue Case).');
      
      setTimeout(() => {
        setMatchStatus('EXTRACTING');
        addLog('SYS', 'Extracting feature embeddings via Convolutional Neural Network.');
        
        setTimeout(() => {
          addLog('SYS', 'Executing Cosine Similarity vector search across inventory.');
          
          setTimeout(() => {
            setMatchStatus('MATCH_FOUND');
            setDbItems(prev => prev.map(item => {
              if (item.id === 'INV-804') return { ...item, match: 98.4 };
              if (item.id === 'INV-805') return { ...item, match: 21.2 };
              return { ...item, match: 4.1 };
            }));
            addLog('SUCCESS', '98.4% Match Found: INV-804 (iPhone 15 Pro, Blue Case).');
          }, 1500);
          
        }, 1200);
      }, 1000);
    }
  };

  const resetSearch = () => {
    setMatchStatus('IDLE');
    setDbItems(prev => prev.map(item => ({ ...item, match: 0 })));
    addLog('SYS', 'Search cleared. Ready for next query.');
  };

  const toggleCV = () => {
    if (!cvActive) {
      setCvActive(true);
      addLog('SYS', 'Image Recognition AI active. Processing live Lost & Found inventory.');
    } else {
      setCvActive(false);
      resetSearch();
      addLog('WARN', 'AI offline. Reverting to manual description searches.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080512] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Computer Vision Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Image Recognition Neural Net
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Crowd-Sourced <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Lost & Found System</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Thousands of phones, keys, and wallets are handed into Lost & Found. Attendees spend hours waiting in line just to verbally describe their item to an overwhelmed staff member. Eventra solves this by running a custom YOLOv8 Computer Vision model. When staff recover an item, they snap a photo of it. The AI auto-tags its features. Attendees can upload a reference photo of their lost item, and the system uses cosine similarity on the image embeddings to instantly match them to recovered inventory, completely eliminating the physical line.
          </p>

          <div className="bg-[#110d1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🔎</span> Vector Similarity Search
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleCV}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     cvActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {cvActive ? 'Disable Model' : 'Load YOLOv8 Model'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Search Status Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 matchStatus === 'SCANNING' || matchStatus === 'EXTRACTING' ? 'bg-violet-950/40 border-violet-500/50 shadow-inner' :
                 matchStatus === 'MATCH_FOUND' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 cvActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Search Pipeline
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     matchStatus === 'MATCH_FOUND' ? 'text-emerald-400' :
                     matchStatus === 'SCANNING' || matchStatus === 'EXTRACTING' ? 'text-violet-400' :
                     cvActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {matchStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {matchStatus === 'IDLE' ? 'Awaiting image vector' : 
                      matchStatus === 'SCANNING' ? 'Running CNN...' : 
                      matchStatus === 'EXTRACTING' ? 'Comparing Embeddings' : 'Cosine Similarity: 98.4%'}
                   </span>
                 </div>
               </div>

               {/* Inventory Database */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col relative overflow-hidden h-[100px] overflow-y-auto custom-scrollbar">
                 <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 sticky top-0 bg-slate-900 z-10 pb-1 border-b border-slate-800">
                   Active Inventory Matches
                 </span>
                 <div className="space-y-1">
                   {dbItems.map(item => (
                     <div key={item.id} className="flex justify-between items-center bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50">
                       <span className="text-[9px] font-mono font-bold text-slate-400">{item.id}</span>
                       <div className="flex-1 px-2 overflow-hidden text-ellipsis whitespace-nowrap text-[8px] text-slate-500">
                         {item.tags.join(', ')}
                       </div>
                       <span className={`text-[9px] font-black font-mono ${item.match > 90 ? 'text-emerald-400' : 'text-slate-600'}`}>
                         {item.match.toFixed(1)}%
                       </span>
                     </div>
                   ))}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#080512] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Vision Model Log</span>
                 {(matchStatus === 'SCANNING' || matchStatus === 'EXTRACTING') && <span className="text-violet-400 animate-pulse">Computing Tensors...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-violet-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Phone & CV Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Phone App Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-2xl relative flex flex-col h-[520px] overflow-hidden font-sans mb-4 bg-slate-900 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-end pb-1 z-40 bg-slate-900/80 backdrop-blur-md">
                <span className="text-[10px] font-bold text-white">01:00</span>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI Lost & Found</span>
              </div>

              <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col pt-12 px-4 pb-4">
                
                <h2 className="text-white font-black text-xl mb-1">Find My Item</h2>
                <p className="text-xs text-slate-400 mb-6 leading-tight">Upload a photo of your lost item (e.g. from your camera roll or a friend's phone) to search our live inventory.</p>
                
                {/* Image Upload Area Mockup */}
                <div className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                  matchStatus === 'IDLE' ? 'border-slate-700 bg-slate-900/50' : 'border-indigo-500 bg-indigo-950/20'
                }`}>
                  
                  {matchStatus === 'IDLE' ? (
                     <div className="text-center opacity-60">
                       <span className="text-4xl mb-2 block">📸</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Tap to Upload</span>
                     </div>
                  ) : (
                    <>
                      {/* Uploaded Reference Image Mock */}
                      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center p-4">
                        <div className="w-24 h-40 bg-blue-600 rounded-xl border-4 border-slate-900 shadow-xl relative transform -rotate-12">
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-black rounded-full"></div>
                          {/* Cracked Screen lines */}
                          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 100">
                            <path d="M 0 20 L 50 40 L 100 30 M 50 40 L 40 100 M 50 40 L 80 80" fill="none" stroke="white" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Scanning Animation */}
                      {(matchStatus === 'SCANNING' || matchStatus === 'EXTRACTING') && (
                        <div className="absolute top-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_#818cf8] animate-scan-line"></div>
                      )}
                      
                      {/* YOLO CV Bounding Box Overlay */}
                      {matchStatus === 'MATCH_FOUND' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-28 h-44 border-2 border-emerald-400 relative">
                            <span className="absolute -top-4 -left-0.5 bg-emerald-400 text-black text-[8px] font-bold font-mono px-1">Phone: 99%</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Results Section */}
                <div className="mt-4 flex-1">
                  {matchStatus === 'SCANNING' || matchStatus === 'EXTRACTING' ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                       <div className="w-6 h-6 border-2 border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Computing Image Vectors...</p>
                    </div>
                  ) : matchStatus === 'MATCH_FOUND' ? (
                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 animate-fade-in-up">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">✅</span>
                        <h4 className="text-sm font-black text-emerald-400">Match Confirmed</h4>
                      </div>
                      <p className="text-xs text-slate-300 mb-3 leading-tight">
                        We have your <strong>iPhone 15 Pro (Blue Case)</strong>. 
                      </p>
                      <button className="w-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg">
                        Claim at Info Booth C
                      </button>
                    </div>
                  ) : null}
                </div>

              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={simulateMatch}
                disabled={!cvActive || matchStatus !== 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !cvActive || matchStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-indigo-900/40 border-indigo-800 text-indigo-400 hover:bg-indigo-900/60'
                }`}
              >
                Upload Reference Photo
              </button>
              
              <button 
                onClick={resetSearch}
                disabled={matchStatus === 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  matchStatus === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Search
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default LostAndFoundCV;
