/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EdgeAIWeaponDetection = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [conveyorStatus, setConveyorStatus] = useState('STOPPED'); // STOPPED, RUNNING, HALTED
  const [threatDetected, setThreatDetected] = useState(false);
  const [latency, setLatency] = useState(0); // ms
  
  const [securityLog, setSecurityLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Edge Compute Node initialized at Gate A X-Ray Scanner.' },
    { id: 2, time: '11:00:02', type: 'SYS', msg: 'Neural net loaded: Threat-Detection-v4 (Local TensorRT).' }
  ]);

  // Baggage items moving through scanner
  const [bags, setBags] = useState([]);

  useEffect(() => {
    let loop;
    if (scannerActive && conveyorStatus === 'RUNNING') {
      // Simulate sub-10ms inference time
      setLatency(prev => Math.max(4.2, Math.min(8.5, prev + (Math.random() * 2 - 1))));

      loop = setInterval(() => {
        setBags(prev => {
          // Move bags to the right
          let newBags = prev.map(bag => ({ ...bag, x: bag.x + 5 })).filter(bag => bag.x < 120);
          
          // Occasionally spawn a new safe bag
          if (Math.random() > 0.6 && !threatDetected && newBags.length < 3) {
            newBags.push({
              id: Date.now(),
              x: -30,
              hasThreat: false,
              items: ['📱', '🔑', '🥤', '🧢']
            });
          }
          return newBags;
        });
      }, 200);
    }
    return () => clearInterval(loop);
  }, [scannerActive, conveyorStatus, threatDetected]);

  const injectThreat = () => {
    if (scannerActive && conveyorStatus === 'RUNNING' && !threatDetected) {
      addLog('WARN', 'Injecting simulated threat payload into X-Ray stream.');
      
      setBags(prev => [
        ...prev,
        {
          id: Date.now(),
          x: -40,
          hasThreat: true,
          items: ['📱', '🔪', '🔑'] // Knife injected
        }
      ]);
    }
  };

  // Monitor bags for threats entering the scan zone
  useEffect(() => {
    if (conveyorStatus === 'RUNNING') {
      const threatBag = bags.find(b => b.hasThreat && b.x > 30 && b.x < 70);
      if (threatBag && !threatDetected) {
        triggerHalt();
      }
    }
  }, [bags, conveyorStatus, threatDetected]);

  const triggerHalt = () => {
    setThreatDetected(true);
    setConveyorStatus('HALTED');
    
    // Exact inference time measurement
    const exactLatency = (Math.random() * 2 + 5.1).toFixed(2);
    setLatency(parseFloat(exactLatency));
    
    addLog('CRIT', `WEAPON SILHOUETTE DETECTED. Inference time: ${exactLatency}ms.`);
    
    setTimeout(() => {
      addLog('ACTION', 'Hardware interrupt sent to conveyor motor relay. Belt halted.');
      addLog('ACTION', 'Flashing physical red strobes at Gate A to alert armed officers.');
    }, 150);
  };

  const resolveThreat = () => {
    setThreatDetected(false);
    setBags([]); // Clear the belt
    setConveyorStatus('STOPPED');
    addLog('SUCCESS', 'Threat neutralized and confiscated. Belt cleared. System standing by.');
  };

  const toggleConveyor = () => {
    if (conveyorStatus === 'RUNNING') {
      setConveyorStatus('STOPPED');
      addLog('SYS', 'Conveyor belt paused manually.');
    } else if (scannerActive && !threatDetected) {
      setConveyorStatus('RUNNING');
      setLatency(6.5);
      addLog('SYS', 'Conveyor belt engaged. Inference engine scanning live video feed.');
    }
  };

  const toggleScanner = () => {
    if (!scannerActive) {
      setScannerActive(true);
      setLatency(0);
      addLog('SYS', 'X-Ray Edge-AI module powered on.');
    } else {
      setScannerActive(false);
      setConveyorStatus('STOPPED');
      setThreatDetected(false);
      setBags([]);
      setLatency(0);
      addLog('SYS', 'Module powered down.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSecurityLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Threat Detection
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Edge-AI Weapon <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Detection on X-Ray</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Security guards suffer from intense fatigue staring at X-Ray baggage screens for 12 hours, leading to dangerous items slipping through festival gates. Eventra solves this by feeding the live video output of the X-Ray machines directly into a localized Edge AI model. Processing at sub-10ms latency entirely on-premise, if the silhouette of a firearm or knife is detected, the system instantly sends a hardware interrupt to halt the conveyor belt and flashes the screen red before the human operator even registers the image.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">⚙️</span> Local TensorRT Inference
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleScanner}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-700 ${
                     scannerActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                   }`}
                 >
                   {scannerActive ? 'Power Down' : 'Boot Edge Node'}
                 </button>
                 <button 
                   onClick={toggleConveyor}
                   disabled={!scannerActive || threatDetected}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     !scannerActive || threatDetected ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed' :
                     conveyorStatus === 'RUNNING' ? 'bg-orange-900/40 text-orange-500 border border-orange-500/50' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {conveyorStatus === 'RUNNING' ? 'Pause Belt' : 'Start Belt'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Inference Latency */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 threatDetected ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Inference Latency</span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     threatDetected ? 'text-red-500' : scannerActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {scannerActive ? latency.toFixed(2) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">ms</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                     !scannerActive ? 'bg-slate-700' : 
                     threatDetected ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                   }`}></span>
                   {threatDetected ? 'Threat Lock' : scannerActive ? 'Processing Frames' : 'Offline'}
                 </div>
               </div>

               {/* Relay Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 conveyorStatus === 'HALTED' ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Hardware Interlock</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     conveyorStatus === 'HALTED' ? 'text-red-500' :
                     conveyorStatus === 'RUNNING' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {conveyorStatus}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {conveyorStatus === 'HALTED' ? 'Motor Relay Cut' : 
                      conveyorStatus === 'RUNNING' ? 'Motor Engaged' : 'Motor Idle'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Edge-AI Operations Log</span>
                 {threatDetected && <span className="text-red-500 animate-pulse">LOCKDOWN ACTIVE</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {securityLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'CRIT' ? 'text-red-500 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: X-Ray Scanner Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* Screen Mockup */}
            <div className={`w-full rounded-[1.5rem] border-[10px] border-[#111] shadow-2xl relative flex flex-col h-[300px] overflow-hidden font-sans mb-6 transition-all duration-75 ${
              threatDetected ? 'bg-red-900 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-[#0a1128]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/40 border-b border-white/10">
                <span className={`text-[9px] font-black uppercase tracking-widest ${threatDetected ? 'text-white' : 'text-slate-400'}`}>
                  Gate A : X-Ray Feed
                </span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                
                {/* X-Ray Visual Filter */}
                <div className="absolute inset-0 bg-blue-900/30 mix-blend-color z-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20 z-20 mix-blend-screen pointer-events-none"></div>

                {!scannerActive ? (
                  <div className="text-center opacity-30 z-10">
                    <span className="text-4xl block mb-2">🔌</span>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Scanner Offline</p>
                  </div>
                ) : (
                  <>
                    {/* Scanning Line */}
                    {conveyorStatus === 'RUNNING' && (
                      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-30 animate-pulse"></div>
                    )}

                    {/* Threat Detected Overlay */}
                    {threatDetected && (
                      <div className="absolute inset-0 border-[8px] border-red-500 z-40 flex items-center justify-center animate-[pulse_0.5s_ease-in-out_infinite]">
                        <span className="bg-red-600 text-white font-black text-2xl uppercase tracking-widest px-6 py-2 border-4 border-red-400 shadow-2xl transform -rotate-12">
                          THREAT DETECTED
                        </span>
                      </div>
                    )}

                    {/* Bags moving on belt */}
                    <div className="absolute inset-0 z-10">
                      {bags.map(bag => (
                        <div 
                          key={bag.id}
                          className="absolute top-1/2 transform -translate-y-1/2 w-32 h-24 bg-orange-500/20 border-2 border-orange-400/30 rounded-[30px] flex items-center justify-center transition-all duration-200 ease-linear"
                          style={{ left: `${bag.x}%` }}
                        >
                          {/* Inner contents */}
                          <div className="flex flex-wrap justify-center content-center w-full h-full p-2 opacity-60 mix-blend-screen filter grayscale contrast-200 brightness-150">
                            {bag.items.map((item, idx) => (
                              <span key={idx} className="text-3xl filter blur-[1px]">
                                {item}
                              </span>
                            ))}
                          </div>

                          {/* Bounding Box if Threat */}
                          {threatDetected && bag.hasThreat && bag.x > 30 && bag.x < 70 && (
                            <div className="absolute inset-2 border-4 border-red-500 bg-red-500/20 z-50 animate-pulse flex flex-col justify-between">
                               <div className="absolute -top-5 left-[-4px] bg-red-500 text-white text-[8px] font-mono px-1 font-bold whitespace-nowrap">
                                 CONFIDENCE: 98.4%
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={injectThreat}
                disabled={!scannerActive || conveyorStatus !== 'RUNNING' || threatDetected}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !scannerActive || conveyorStatus !== 'RUNNING' || threatDetected ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-rose-950/40 border-rose-900 text-rose-500 hover:bg-rose-900/60'
                }`}
              >
                Inject Contraband
              </button>
              
              <button 
                onClick={resolveThreat}
                disabled={!threatDetected}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !threatDetected ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Confiscate & Clear
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EdgeAIWeaponDetection;
