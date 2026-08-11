/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AILostAndFound = () => {
  const [kioskActive, setKioskActive] = useState(false);
  const [kioskState, setKioskState] = useState('IDLE'); // IDLE, SCANNING, CATEGORIZING, LOGGED
  
  // Database Metrics
  const [itemsLogged, setItemsLogged] = useState(0);
  const [itemsReturned, setItemsReturned] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Computer Vision Kiosk initialized at Main Gate.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting item placement on scanning bed.' }
  ]);

  // Visualizer State
  const [scannedItem, setScannedItem] = useState(null);
  const [llmSearchQuery, setLlmSearchQuery] = useState('');
  const [llmSearchResults, setLlmSearchResults] = useState([]);
  const [searchState, setSearchState] = useState('IDLE'); // IDLE, SEARCHING, FOUND, NO_MATCH

  const inventoryDB = [
      { id: 'LF-892', type: 'Smartphone', desc: 'iPhone 13 Pro, Black, Cracked top right corner, Casetify clear case.', time: '12:30 PM', matchScore: 0 },
      { id: 'LF-893', type: 'Keys', desc: 'Honda car fob, 3 silver keys, red lanyard with supreme logo.', time: '1:15 PM', matchScore: 0 },
      { id: 'LF-894', type: 'Wallet', desc: 'Brown leather bi-fold, Levi brand, worn edges.', time: '2:45 PM', matchScore: 0 }
  ];

  const triggerScan = () => {
    if (!kioskActive || kioskState !== 'IDLE') return;
    
    setKioskState('SCANNING');
    addLog('ACTION', 'Item placed on bed. Activating LiDAR and RGB optical sensors.');
    
    setTimeout(() => {
        setKioskState('CATEGORIZING');
        addLog('AI', 'Running Convolutional Neural Net (CNN) object recognition...');
        
        setTimeout(() => {
            setKioskState('LOGGED');
            const newItem = {
                id: `LF-${900 + itemsLogged}`,
                type: 'Smartphone',
                desc: 'Samsung Galaxy S22, Blue, clear case with a sticker of a cat, minor screen scratch.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                matchScore: 0
            };
            setScannedItem(newItem);
            setItemsLogged(prev => prev + 1);
            addLog('SUCCESS', `Item Categorized: ${newItem.type}. Metadata written to DB.`);
            
            setTimeout(() => {
                setKioskState('IDLE');
                setScannedItem(null);
            }, 4000);
            
        }, 2000);
    }, 1500);
  };

  const simulateAppSearch = () => {
      if (!kioskActive) return;
      
      setSearchState('SEARCHING');
      const query = "I lost my blue android phone, it has a cat sticker on the back";
      setLlmSearchQuery(query);
      addLog('ACTION', `User App LLM Query: "${query}"`);
      
      setTimeout(() => {
          // Simulate fuzzy matching
          const results = [
              { id: 'LF-900', type: 'Smartphone', desc: 'Samsung Galaxy S22, Blue, clear case with a sticker of a cat, minor screen scratch.', time: 'Just now', matchScore: 98 },
              { id: 'LF-892', type: 'Smartphone', desc: 'iPhone 13 Pro, Black, Cracked top right corner, Casetify clear case.', time: '12:30 PM', matchScore: 12 },
          ];
          setLlmSearchResults(results);
          setSearchState('FOUND');
          addLog('SUCCESS', `LLM Fuzzy Match found! 98% confidence score for LF-900.`);
          
          setTimeout(() => {
              setItemsReturned(prev => prev + 1);
              addLog('SYS', 'Item LF-900 marked as RETURNED TO OWNER.');
              setLlmSearchQuery('');
              setLlmSearchResults([]);
              setSearchState('IDLE');
          }, 5000);

      }, 2500);
  }

  const toggleSystem = () => {
    if (!kioskActive) {
      setKioskActive(true);
      setItemsLogged(342);
      setItemsReturned(128);
      addLog('SYS', 'Lost & Found CV Kiosk Online. Vector DB connected.');
    } else {
      setKioskActive(false);
      setKioskState('IDLE');
      setSearchState('IDLE');
      setLlmSearchQuery('');
      setLlmSearchResults([]);
      setScannedItem(null);
      addLog('WARN', 'Kiosk Offline. Falling back to manual cardboard boxes.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060408] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Driven Lost & Found <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">Object Recognition</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival lost and founds are chaotic bins of hundreds of identical black iPhones and wallets, making it nearly impossible to match items to panicked attendees. Eventra solves this by deploying a Computer Vision kiosk. When staff find an item, the kiosk scans and categorizes its exact make, color, and damage, logging it instantly. Attendees then use a Large Language Model (LLM) in the app to describe what they lost in natural language, which fuzzy-matches against the database to instantly locate their property.
          </p>

          <div className="bg-[#120a10] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🗄️</span> Vector Database
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     kioskActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                   }`}
                 >
                   {kioskActive ? 'Disable CV Kiosk' : 'Initialize Vision Sensors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Items Logged */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 kioskState === 'LOGGED' ? 'bg-pink-950/40 border-pink-500/50 shadow-inner' :
                 kioskActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Total Items Logged
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     kioskActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {itemsLogged}
                   </span>
                 </div>
               </div>

               {/* Items Returned */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 searchState === 'FOUND' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 kioskActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Successfully Returned
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     searchState === 'FOUND' ? 'text-emerald-400' :
                     kioskActive ? 'text-emerald-500' : 'text-slate-600'
                   }`}>
                     {itemsReturned}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#060204] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>CV & LLM Telemetry Log</span>
                 {kioskState === 'SCANNING' && <span className="text-pink-400 animate-pulse">OPTICAL SCAN...</span>}
                 {searchState === 'SEARCHING' && <span className="text-rose-400 animate-pulse">LLM FUZZY MATCHING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' :
                       log.type === 'AI' ? 'text-rose-400 font-bold' : 'text-slate-400'
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
            
            {/* Kiosk / App Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !kioskActive ? 'bg-slate-900' : 'bg-[#10050a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-400">CV STAFF KIOSK</span>
                <span className="text-[8px] font-mono text-slate-400">ATTENDEE APP LLM</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-14 z-20">
                
                {!kioskActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SYSTEM OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative space-y-4">
                      
                      {/* Top: Staff CV Kiosk Scanner */}
                      <div className={`flex-1 rounded-xl border-2 p-3 flex relative overflow-hidden transition-all duration-300 ${
                          kioskState === 'IDLE' ? 'bg-[#060305] border-slate-800' :
                          kioskState === 'LOGGED' ? 'bg-pink-950/20 border-pink-500/50' : 'bg-pink-950/40 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                      }`}>
                          {/* CV Scanner Reticle */}
                          <div className="w-24 h-full border-r border-slate-800 relative flex items-center justify-center mr-3 shrink-0">
                              {kioskState === 'SCANNING' && (
                                  <>
                                      <div className="absolute inset-0 bg-pink-500/20 animate-pulse"></div>
                                      <div className="absolute w-full h-0.5 bg-pink-500 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                      <div className="w-16 h-20 border-2 border-pink-500 border-dashed rounded opacity-50"></div>
                                  </>
                              )}
                              {kioskState === 'CATEGORIZING' && (
                                  <>
                                      <div className="w-16 h-20 border-2 border-pink-500 rounded bg-pink-950/50 flex items-center justify-center relative">
                                          <span className="text-2xl">📱</span>
                                          {/* AI bounding boxes */}
                                          <div className="absolute top-2 left-2 w-4 h-4 border border-rose-400"></div>
                                          <div className="absolute bottom-2 right-2 w-8 h-8 border border-rose-400"></div>
                                      </div>
                                  </>
                              )}
                              {(kioskState === 'IDLE' || kioskState === 'LOGGED') && (
                                  <span className="text-[8px] font-mono text-slate-600 text-center uppercase">Place Item<br/>Here</span>
                              )}
                          </div>
                          
                          {/* CV Output */}
                          <div className="flex-1 flex flex-col justify-center">
                              {scannedItem ? (
                                  <div className="animate-fade-in">
                                      <span className="text-[8px] font-black uppercase text-pink-500 mb-1 block">Item Logged: {scannedItem.id}</span>
                                      <span className="text-[12px] font-bold text-white block leading-tight">{scannedItem.type}</span>
                                      <p className="text-[8px] font-mono text-slate-400 mt-1 line-clamp-3 leading-relaxed">{scannedItem.desc}</p>
                                  </div>
                              ) : kioskState === 'CATEGORIZING' ? (
                                  <div className="flex flex-col space-y-1">
                                      <div className="h-2 bg-pink-950 rounded w-full animate-pulse"></div>
                                      <div className="h-2 bg-pink-950 rounded w-3/4 animate-pulse"></div>
                                      <div className="h-2 bg-pink-950 rounded w-1/2 animate-pulse"></div>
                                  </div>
                              ) : (
                                  <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest text-center mt-6">Awaiting Staff Input</span>
                              )}
                          </div>
                      </div>

                      {/* Bottom: Attendee LLM App */}
                      <div className={`flex-[1.5] rounded-xl border-2 p-3 flex flex-col relative transition-all duration-300 ${
                          searchState === 'IDLE' ? 'bg-[#060305] border-slate-800' :
                          searchState === 'FOUND' ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                      }`}>
                          
                          {/* Chat Box */}
                          <div className="bg-black/50 border border-slate-800 rounded p-2 mb-2 min-h-[40px] flex items-center">
                              {llmSearchQuery ? (
                                  <p className="text-[10px] text-slate-300 font-mono">"{llmSearchQuery}"</p>
                              ) : (
                                  <span className="text-[10px] text-slate-600 font-mono italic">Describe your lost item...</span>
                              )}
                          </div>

                          {/* Results Area */}
                          <div className="flex-1 overflow-hidden relative">
                              {searchState === 'SEARCHING' && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded z-10">
                                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                      <span className="text-[7px] font-black uppercase text-rose-400 tracking-widest">Vectorizing Query...</span>
                                  </div>
                              )}
                              
                              {llmSearchResults.length > 0 ? (
                                  <div className="space-y-2 overflow-y-auto h-full pr-1 animate-fade-in-up">
                                      {llmSearchResults.map((res, i) => (
                                          <div key={i} className={`p-2 border rounded bg-black/60 relative ${
                                              i === 0 ? 'border-emerald-500/50' : 'border-slate-800'
                                          }`}>
                                              <div className="flex justify-between items-start mb-1">
                                                  <span className="text-[9px] font-bold text-white">{res.type}</span>
                                                  <span className={`text-[9px] font-mono font-black ${
                                                      i === 0 ? 'text-emerald-400' : 'text-slate-500'
                                                  }`}>{res.matchScore}% Match</span>
                                              </div>
                                              <p className="text-[8px] text-slate-400 leading-tight">{res.desc}</p>
                                              {i === 0 && (
                                                  <button className="mt-2 w-full bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 rounded py-1 text-[8px] font-black uppercase tracking-widest">
                                                      Claim Item at Main Gate
                                                  </button>
                                              )}
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="h-full flex items-center justify-center opacity-30">
                                      {/* Dummy inventory items to look busy */}
                                      <div className="w-full space-y-2">
                                          <div className="h-8 bg-slate-800 rounded"></div>
                                          <div className="h-8 bg-slate-800 rounded w-4/5"></div>
                                      </div>
                                  </div>
                              )}
                          </div>

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120a10] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User Flow</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={triggerScan}
                   disabled={!kioskActive || kioskState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !kioskActive || kioskState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-pink-950/40 border-pink-600 text-pink-400 hover:bg-pink-900/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                   }`}
                 >
                   Staff: Scan Found Item
                 </button>

                 <button 
                   onClick={simulateAppSearch}
                   disabled={!kioskActive || searchState !== 'IDLE' || itemsLogged === 342} // Wait for scan
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !kioskActive || searchState !== 'IDLE' || itemsLogged === 342 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-rose-500 hover:bg-rose-900/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                   }`}
                 >
                   Attendee: Query LLM
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AILostAndFound;
