/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MissingChildVisionSystem = () => {
  const [systemStatus, setSystemStatus] = useState('IDLE'); // IDLE, SEARCHING, FOUND, SHREDDED
  
  // Vision Metrics
  const [activeCameras, setActiveCameras] = useState(84); 
  const [framesProcessed, setFramesProcessed] = useState(0); 
  const [confidenceScore, setConfidenceScore] = useState(0); // %
  const [dataShredded, setDataShredded] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Facial Recognition Edge nodes online. Awaiting query.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Privacy compliance module enforcing zero-retention policy.' }
  ]);

  // Visualizer State
  const [scanLocation, setScanLocation] = useState('Scanning...');

  useEffect(() => {
    let loop;
    
    if (systemStatus === 'SEARCHING') {
      loop = setInterval(() => {
          setFramesProcessed(prev => prev + Math.floor(Math.random() * 120 + 300));
          
          const locations = ['Gate A', 'Ferris Wheel', 'Food Court', 'Main Stage Exit', 'Medical Tent', 'Restrooms B'];
          setScanLocation(locations[Math.floor(Math.random() * locations.length)]);
      }, 250); // Fast update for visual scanning effect
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemStatus]);

  const initiateSearch = () => {
      if (systemStatus === 'SEARCHING') return;
      
      setSystemStatus('SEARCHING');
      setFramesProcessed(0);
      setConfidenceScore(0);
      setDataShredded(false);
      
      addLog('CRIT', 'CODE ADAM INITIATED. Reference photo ingested.');
      addLog('ACTION', 'Extracting biometric embeddings. Broadcasting to 84 edge cameras.');
      
      setTimeout(() => {
          setSystemStatus('FOUND');
          setConfidenceScore(98.4);
          setScanLocation('GATE A - EXIT');
          addLog('SUCCESS', 'MATCH FOUND AT GATE A EXIT (Confidence: 98.4%).');
          addLog('ACTION', 'Dispatching security team Alpha to location immediately.');
          
          // Auto-shred after 3 seconds of finding
          setTimeout(() => {
              setSystemStatus('SHREDDED');
              setDataShredded(true);
              setConfidenceScore(0);
              addLog('SYS', 'Privacy Protocol: Cryptographically shredding reference photo and all embeddings.');
              addLog('SUCCESS', 'Data purge complete. Zero retention verified.');
          }, 4000);

      }, 4500); // 4.5 seconds of scanning before found
  };

  const resetSystem = () => {
      setSystemStatus('IDLE');
      setFramesProcessed(0);
      setConfidenceScore(0);
      setDataShredded(false);
      setScanLocation('Awaiting Query');
      addLog('SYS', 'System reset. Ready for new ingestion.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Missing Child Identification <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">via Edge AI</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a child goes missing in a crowd of 100,000, radioing a vague description ("boy, blue shirt, 6 years old") to security is terrifyingly ineffective. Eventra solves this by deploying a localized, edge-based facial recognition model. Security uploads a recent photo provided by the parent. The AI instantly extracts biometric embeddings and scans the high-resolution feeds of all security exit gates simultaneously to locate the child in real-time. To ensure strict compliance with privacy laws, all photos and embeddings are cryptographically shredded the precise moment the child is secured.
          </p>

          <div className="bg-[#0a0805] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🎛️</span> Vision Edge Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSystem}
                   disabled={systemStatus === 'SEARCHING'}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemStatus === 'SEARCHING' ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                   }`}
                 >
                   Reset Node Array
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* System Status */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemStatus === 'SEARCHING' ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse' : 
                 systemStatus === 'FOUND' ? 'bg-emerald-950/40 border-emerald-500/50' : 
                 systemStatus === 'SHREDDED' ? 'bg-blue-950/40 border-blue-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Engine State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     systemStatus === 'SEARCHING' ? 'text-amber-400' : 
                     systemStatus === 'FOUND' ? 'text-emerald-400' : 
                     systemStatus === 'SHREDDED' ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {systemStatus}
                   </span>
                 </div>
               </div>

               {/* Frames Processed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemStatus === 'SEARCHING' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Frames Scanned
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     framesProcessed > 0 ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {framesProcessed > 1000 ? `${(framesProcessed/1000).toFixed(1)}k` : framesProcessed}
                   </span>
                 </div>
               </div>
               
               {/* Data Privacy Status */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dataShredded ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Data Purge
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-xl font-black uppercase tracking-widest leading-none ${
                         dataShredded ? 'text-emerald-400' : 'text-slate-600'
                       }`}>
                         {dataShredded ? 'VERIFIED' : 'PENDING'}
                       </span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Security Operations Ledger</span>
                 {systemStatus === 'SEARCHING' && <span className="text-amber-400 font-black animate-pulse">EMBEDDINGS ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1 uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-amber-400 font-bold' : 'text-slate-400'
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
            
            {/* Camera Interface Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                systemStatus === 'SEARCHING' ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-950'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">CV NODE: {activeCameras} ACTIVE</span>
                <span className={`text-[8px] font-mono ${systemStatus === 'SEARCHING' ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>REC // LIVE</span>
              </div>

              <div className="flex-1 relative flex flex-col pt-12">
                  
                  {systemStatus === 'IDLE' ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                         <div className="w-20 h-24 bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center mb-6">
                             <span className="text-4xl opacity-50">🖼️</span>
                         </div>
                         <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Awaiting Photo</h3>
                         <p className="text-xs text-slate-400 mb-8 leading-relaxed">Upload a reference image of the missing individual to generate biometric embeddings and scan live feeds.</p>
                     </div>
                  ) : systemStatus === 'SEARCHING' ? (
                    <div className="w-full h-full relative z-20 flex justify-center items-center overflow-hidden">
                        
                        {/* Fake Camera Feed Background (Grid) */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                        
                        {/* Scanning Location Overlay */}
                        <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 rounded border border-amber-500/30">
                            <span className="text-[8px] font-mono text-amber-500">LOC: {scanLocation}</span>
                        </div>

                        {/* Animated Bounding Boxes */}
                        <div className="relative w-full h-full">
                            {[...Array(6)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="absolute border border-slate-500/50 rounded flex flex-col"
                                    style={{
                                        width: `${20 + Math.random() * 40}px`,
                                        height: `${30 + Math.random() * 50}px`,
                                        left: `${10 + Math.random() * 70}%`,
                                        top: `${20 + Math.random() * 60}%`,
                                        animation: `pulse ${1 + Math.random()}s infinite alternate`
                                    }}
                                >
                                    <span className="text-[4px] font-mono text-slate-500 -mt-2">UNKNOWN</span>
                                </div>
                            ))}
                            
                            {/* Scanning Laser Line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-amber-500/50 shadow-[0_0_10px_#f59e0b] top-1/2 animate-scan"></div>
                        </div>

                    </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex justify-center items-center bg-[#000]">
                        
                        {dataShredded ? (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <span className="text-6xl mb-4">🗄️</span>
                                <span className="text-xl font-black text-blue-500 uppercase tracking-widest mb-2">Data Shredded</span>
                                <span className="text-[10px] text-slate-400 font-mono text-center px-8">Biometric signatures and reference photos have been permanently deleted from edge nodes.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {/* Matched Bounding Box */}
                                <div className="w-32 h-40 border-4 border-emerald-500 relative mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <div className="absolute -top-4 left-0 bg-emerald-500 text-black text-[8px] font-black uppercase px-1">MATCH {confidenceScore}%</div>
                                    <div className="absolute inset-0 bg-emerald-500/10"></div>
                                    {/* Crosshairs */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-emerald-500/50 rounded-full flex items-center justify-center">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-white uppercase tracking-widest bg-red-600 px-4 py-1 rounded">Subject Located</span>
                                <span className="text-xs font-mono text-slate-400 mt-2">Loc: {scanLocation}</span>
                            </div>
                        )}
                        
                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#0a0805] p-4 rounded-xl border border-slate-800">
               <button 
                   onClick={initiateSearch}
                   disabled={systemStatus !== 'IDLE'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     systemStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/60 border-red-600 text-red-500 hover:bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   🚨 Declare Code Adam (Upload Photo)
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MissingChildVisionSystem;
