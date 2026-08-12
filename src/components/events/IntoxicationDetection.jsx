/* eslint-disable */
import React, { useState, useEffect } from 'react';

const IntoxicationDetection = () => {
  const [camerasActive, setCamerasActive] = useState(false);
  const [scanState, setScanState] = useState('IDLE'); // IDLE, SCANNING, SOBER, INTOXICATED, CRITICAL
  
  // Biometric Metrics
  const [scansProcessed, setScansProcessed] = useState(0);
  const [cutoffsIssued, setCutoffsIssued] = useState(0);
  const [privacyScore, setPrivacyScore] = useState(100);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Edge-compute CV nodes online at VIP POS.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Awaiting patron approach for biometric analysis.' }
  ]);

  // Biometric Visualizer State
  const [pupilDilation, setPupilDilation] = useState(0);
  const [microSway, setMicroSway] = useState(0);
  const [facialFlush, setFacialFlush] = useState(0);
  
  const [patronData, setPatronData] = useState(null);

  const triggerScan = (type) => {
    if (!camerasActive || scanState === 'SCANNING') return;
    
    setScanState('SCANNING');
    addLog('ACTION', 'Patron detected at POS. Initiating biometric inference.');
    
    // Simulate scan delay
    setTimeout(() => {
        setScanState(type);
        setScansProcessed(p => p + 1);
        
        if (type === 'SOBER') {
            setPupilDilation(15);
            setMicroSway(5);
            setFacialFlush(10);
            setPatronData({ risk: 'LOW', recommendation: 'SERVE' });
            addLog('SUCCESS', 'Biometrics nominal. Patron is fit to be served.');
        } else if (type === 'INTOXICATED') {
            setPupilDilation(65);
            setMicroSway(45);
            setFacialFlush(60);
            setPatronData({ risk: 'MODERATE', recommendation: 'WARNING_WATER' });
            addLog('WARN', 'Elevated intoxication vectors detected. Recommend offering water.');
        } else if (type === 'CRITICAL') {
            setPupilDilation(95);
            setMicroSway(90);
            setFacialFlush(85);
            setPatronData({ risk: 'SEVERE', recommendation: 'CUTOFF' });
            setCutoffsIssued(c => c + 1);
            addLog('CRIT', 'SEVERE INTOXICATION. Algorithmic cutoff triggered.');
            addLog('SYS', 'POS locked for alcohol sales to this patron. Liability mitigated.');
        }

        setTimeout(() => {
            setScanState('IDLE');
            setPatronData(null);
            setPupilDilation(0);
            setMicroSway(0);
            setFacialFlush(0);
        }, 5000);
    }, 1500);
  };

  const toggleCameras = () => {
    if (!camerasActive) {
      setCamerasActive(true);
      addLog('SYS', 'POS Vision processing active. No PII is being stored (Privacy Preserving).');
    } else {
      setCamerasActive(false);
      setScanState('IDLE');
      setPatronData(null);
      addLog('WARN', 'CV Nodes offline. Bartenders relying on subjective assessment.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070a0d] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Biometric Liability Protection
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Edge-Compute CV <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Intoxication Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Bartenders are legally liable if they overserve intoxicated patrons, but in a loud, dark, high-volume environment, it is extremely difficult for them to accurately assess a patron's sobriety level. Eventra solves this by installing edge-compute cameras at the POS terminals of all VIP bars. The system runs a localized, privacy-preserving biometric analysis, assessing pupillary dilation, micro-sway, and facial flushing. If the AI detects severe intoxication, it subtly flags the POS screen, giving the bartender data-backed justification to cut the patron off.
          </p>

          <div className="bg-[#0b1016] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">📷</span> CV Edge Nodes
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleCameras}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     camerasActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                   }`}
                 >
                   {camerasActive ? 'Disable Vision Nodes' : 'Initialize Bar CV Sensors'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Scans Processed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 camerasActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Inferences Run
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     camerasActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {scansProcessed}
                   </span>
                 </div>
               </div>

               {/* Cutoffs */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cutoffsIssued > 0 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Legal Cutoffs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     cutoffsIssued > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {cutoffsIssued}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Patrons</span>
                 </div>
               </div>
               
               {/* Privacy Score */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 camerasActive ? 'bg-cyan-950/20 border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Data Privacy
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     camerasActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {privacyScore}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#06080b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Biometric Inference Log</span>
                 {scanState === 'SCANNING' && <span className="text-teal-400 animate-pulse">ANALYZING VECTORS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' :
                       log.type === 'SYS' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Bartender POS Simulator */}
            <div className={`w-full rounded-[1rem] border-[10px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!camerasActive ? 'bg-slate-900' : 'bg-[#0b1016]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">BARTENDER POS UI</span>
                <span className="text-[8px] font-mono text-slate-400">CV OVERLAY</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10">
                
                {/* CV Camera Feed Representation (Blurred/Wireframe for Privacy) */}
                <div className="h-40 border-b border-slate-800 bg-[#06080b] relative overflow-hidden flex items-center justify-center p-4">
                    
                    {!camerasActive ? (
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FEED OFFLINE</span>
                    ) : scanState === 'IDLE' ? (
                       <div className="w-full h-full flex items-center justify-center border border-slate-800 border-dashed rounded">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AWAITING PATRON</span>
                       </div>
                    ) : scanState === 'SCANNING' ? (
                        <div className="w-full h-full flex items-center justify-center relative">
                            {/* Scanning Head Wireframe */}
                            <div className="w-16 h-20 border-2 border-teal-500/50 rounded-full border-dashed animate-pulse absolute"></div>
                            <div className="w-full h-1 bg-teal-500/50 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_10px_#14b8a6]"></div>
                            <span className="text-[10px] font-mono text-teal-400 z-10 bg-black/50 px-2 rounded">PROCESSING MESH...</span>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-between px-6 relative">
                             {/* Abstracted Face */}
                             <div className="w-16 h-20 border-2 border-slate-600 rounded-full relative">
                                 {/* Eyes (Pupil dilation) */}
                                 <div className="absolute top-6 left-3 w-2 h-2 rounded-full border border-teal-400 flex items-center justify-center">
                                     <div className="bg-teal-400 rounded-full transition-all" style={{width: `${pupilDilation}%`, height: `${pupilDilation}%`}}></div>
                                 </div>
                                 <div className="absolute top-6 right-3 w-2 h-2 rounded-full border border-teal-400 flex items-center justify-center">
                                      <div className="bg-teal-400 rounded-full transition-all" style={{width: `${pupilDilation}%`, height: `${pupilDilation}%`}}></div>
                                 </div>
                                 {/* Cheeks (Flush) */}
                                 <div className="absolute top-12 left-2 w-3 h-3 rounded-full bg-red-500 transition-opacity blur-[2px]" style={{opacity: facialFlush/100}}></div>
                                 <div className="absolute top-12 right-2 w-3 h-3 rounded-full bg-red-500 transition-opacity blur-[2px]" style={{opacity: facialFlush/100}}></div>
                             </div>

                             {/* Biometric Readouts */}
                             <div className="flex flex-col space-y-2 text-right">
                                 <div>
                                     <span className="text-[6px] font-mono text-slate-500 block">PUPILLARY DILATION</span>
                                     <span className={`text-[10px] font-black ${pupilDilation > 80 ? 'text-red-400' : 'text-teal-400'}`}>{pupilDilation}%</span>
                                 </div>
                                 <div>
                                     <span className="text-[6px] font-mono text-slate-500 block">MICRO-SWAY (10s)</span>
                                     <span className={`text-[10px] font-black ${microSway > 80 ? 'text-red-400' : 'text-teal-400'}`}>{microSway}mm</span>
                                 </div>
                                 <div>
                                     <span className="text-[6px] font-mono text-slate-500 block">VASCULAR FLUSH</span>
                                     <span className={`text-[10px] font-black ${facialFlush > 80 ? 'text-red-400' : 'text-teal-400'}`}>{facialFlush}%</span>
                                 </div>
                             </div>
                        </div>
                    )}

                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes scan {
                            0% { top: 0%; }
                            50% { top: 100%; }
                            100% { top: 0%; }
                        }
                    `}} />
                </div>

                {/* POS Interface */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 opacity-50">
                        <div className="bg-slate-800 p-2 rounded text-center"><span className="text-[8px] font-black uppercase text-slate-400">Tito's Vodka</span></div>
                        <div className="bg-slate-800 p-2 rounded text-center"><span className="text-[8px] font-black uppercase text-slate-400">Patron Silver</span></div>
                        <div className="bg-slate-800 p-2 rounded text-center"><span className="text-[8px] font-black uppercase text-slate-400">Heineken</span></div>
                        <div className="bg-slate-800 p-2 rounded text-center"><span className="text-[8px] font-black uppercase text-slate-400">Red Bull</span></div>
                    </div>

                    {/* AI Assessment Overlay */}
                    <div className="h-20 w-full rounded border flex items-center justify-center p-2 relative overflow-hidden transition-colors duration-300">
                        {!patronData ? (
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AWAITING PATRON SCAN</span>
                        ) : (
                            <div className={`w-full h-full rounded flex items-center justify-between px-4 ${
                                patronData.risk === 'LOW' ? 'bg-emerald-950/80 border border-emerald-500' :
                                patronData.risk === 'MODERATE' ? 'bg-orange-950/80 border border-orange-500' :
                                'bg-red-950/80 border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
                            }`}>
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-slate-400">AI ASSESSMENT</span>
                                    <span className={`text-[14px] font-black uppercase ${
                                        patronData.risk === 'LOW' ? 'text-emerald-400' :
                                        patronData.risk === 'MODERATE' ? 'text-orange-400' :
                                        'text-red-500'
                                    }`}>{patronData.recommendation}</span>
                                </div>
                                
                                {patronData.risk === 'SEVERE' && (
                                    <div className="bg-red-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase">
                                        POS LOCKED
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b1016] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Patron Approach</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerScan('SOBER')}
                   disabled={!camerasActive || scanState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !camerasActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                   }`}
                 >
                   Sober Patron
                 </button>
                 
                 <button 
                   onClick={() => triggerScan('INTOXICATED')}
                   disabled={!camerasActive || scanState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !camerasActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Intoxicated (Borderline)
                 </button>

                 <button 
                   onClick={() => triggerScan('CRITICAL')}
                   disabled={!camerasActive || scanState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !camerasActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   Severely Intoxicated (Cutoff)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default IntoxicationDetection;
