/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveVIPDrinkPrep = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [approachState, setApproachState] = useState('IDLE'); // IDLE, DETECTED, PREPPING, SERVED
  
  // VIP Client Data
  const [activeClient, setActiveClient] = useState(null);
  const [distanceToBar, setDistanceToBar] = useState(0); // meters
  
  // Bartender Smartwatch State
  const [watchAlert, setWatchAlert] = useState('NO PENDING ORDERS');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:45:00', type: 'SYS', msg: 'VIP Lounge Biometric Cameras online.' },
    { id: 2, time: '22:45:02', type: 'SYS', msg: 'Awaiting opt-in facial/gait signatures.' }
  ]);

  const vipDatabase = {
    'Mr. Sterling': {
      name: 'Arthur Sterling',
      tier: 'Diamond ($50k Table)',
      drink: 'Smoked Old Fashioned',
      prepTimeSec: 45,
      gaitConfidence: 98.5
    },
    'Ms. Vance': {
      name: 'Elena Vance',
      tier: 'Platinum ($25k Table)',
      drink: 'Aperol Spritz (Extra Orange)',
      prepTimeSec: 20,
      gaitConfidence: 96.2
    }
  };

  useEffect(() => {
    let loop;
    
    if (systemActive && approachState === 'DETECTED' && activeClient) {
      loop = setInterval(() => {
        setDistanceToBar(prev => {
          const next = prev - 1.5; // Walking speed
          if (next <= 0) {
            setApproachState('SERVED');
            addLog('SUCCESS', `Client ${activeClient.name} arrived at bar. Zero-wait time achieved.`);
            setWatchAlert('DRINK HANDOFF COMPLETE');
            
            setTimeout(() => {
              resetSystem();
            }, 4000);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, approachState, activeClient]);

  const injectVIPApproach = (clientKey) => {
    if (systemActive && approachState === 'IDLE') {
      const client = vipDatabase[clientKey];
      setActiveClient(client);
      
      // Calculate distance based on their specific drink prep time (so it finishes exactly when they arrive)
      // Assuming avg walk speed of 1.5 m/s
      const optimalDistance = client.prepTimeSec * 1.5; 
      setDistanceToBar(optimalDistance);
      setApproachState('DETECTED');
      
      addLog('CV', `Opt-In Biometric Match: ${client.name} (Confidence: ${client.gaitConfidence}%)`);
      addLog('ACTION', `Pushing '${client.drink}' prep ticket to Bartender Smartwatch.`);
      setWatchAlert(`MIX NOW: ${client.drink} - ETA ${client.prepTimeSec}s`);
    }
  };

  const resetSystem = () => {
    setApproachState('IDLE');
    setActiveClient(null);
    setDistanceToBar(0);
    setWatchAlert('NO PENDING ORDERS');
    addLog('SYS', 'System reset. Monitoring VIP entrance tunnel.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Micro-Location Hospitality Automation Armed.');
    } else {
      setSystemActive(false);
      resetSystem();
      addLog('WARN', 'Biometrics offline. Standard hospitality flow engaged.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Hospitality Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🍸</span> Micro-Location Hospitality
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive VIP Drink Prep <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">via Gait Recognition</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ultra-VIP clients paying $50,000 for a table still endure the friction of waiting for a bartender to notice them and mix their complex signature cocktail upon arrival. Eventra eliminates this by installing opt-in biometric cameras at the VIP lounge entrance. When a registered VIP enters the tunnel, the system recognizes their gait or face and instantly calculates their walking ETA. It pushes a synchronized alert to the bartender's smartwatch, ensuring the drink is perfectly mixed and handed to the client the exact second they step up to the bar.
          </p>

          <div className="bg-[#120e0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">👁️</span> Biometric VIP Gateway
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Biometrics' : 'Arm VIP Recognition'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Client Profile */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 approachState === 'SERVED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                 approachState === 'DETECTED' ? 'bg-amber-950/40 border-amber-500/50 shadow-inner' :
                 systemActive ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Approaching VIP
                 </span>
                 <div className="flex flex-col text-[10px] font-mono text-slate-400 space-y-1 mt-1">
                   <div className="flex justify-between border-b border-slate-700 pb-1">
                     <span>Name:</span>
                     <span className={approachState !== 'IDLE' ? 'text-amber-400 font-bold' : ''}>
                       {activeClient ? activeClient.name : 'NONE'}
                     </span>
                   </div>
                   <div className="flex justify-between border-b border-slate-700 pb-1 pt-1">
                     <span>Tier:</span>
                     <span className={approachState !== 'IDLE' ? 'text-white' : ''}>
                       {activeClient ? activeClient.tier : '--'}
                     </span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Pref:</span>
                     <span className={approachState !== 'IDLE' ? 'text-cyan-400 font-bold' : ''}>
                       {activeClient ? activeClient.drink : '--'}
                     </span>
                   </div>
                 </div>
               </div>

               {/* Distance ETA */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 approachState === 'SERVED' ? 'bg-slate-800 border-slate-700' :
                 approachState === 'DETECTED' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Distance to Bar
                 </span>
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     approachState === 'DETECTED' ? 'text-cyan-400 animate-pulse' :
                     approachState === 'SERVED' ? 'text-slate-600' : 'text-slate-600'
                   }`}>
                     {systemActive ? Math.floor(distanceToBar) : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">meters</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050402] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Hospitality Log</span>
                 {approachState === 'DETECTED' && <span className="text-amber-400 animate-pulse">Syncing Drink Prep...</span>}
                 {approachState === 'SERVED' && <span className="text-emerald-500 animate-pulse">ZERO WAIT TIME</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CV' ? 'text-amber-400 font-bold' : 'text-slate-400'
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
            
            {/* Bartender Smartwatch Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">STAFF SMARTWATCH POV</span>
                <span className="text-[8px] font-mono text-slate-400">BARTENDER COMMS</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Watch Strap UI */}
                <div className="absolute top-0 w-32 h-16 bg-slate-800 rounded-b-[40px] border-b-2 border-slate-600 shadow-inner"></div>
                <div className="absolute bottom-0 w-32 h-16 bg-slate-800 rounded-t-[40px] border-t-2 border-slate-600 shadow-inner"></div>

                {/* The Smartwatch Face */}
                <div className={`relative w-48 h-48 rounded-[30px] border-8 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 z-10 ${
                  approachState === 'SERVED' ? 'border-slate-600 bg-emerald-950/20' :
                  approachState === 'DETECTED' ? 'border-cyan-500 bg-black shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 
                  'border-slate-700 bg-black'
                }`}>
                   
                   {/* Glare */}
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent z-20 pointer-events-none rounded-[22px]"></div>

                   {!systemActive ? (
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OFFLINE</span>
                   ) : approachState === 'IDLE' ? (
                     <div className="flex flex-col items-center text-center px-4">
                       <span className="text-3xl mb-2 grayscale opacity-30">🍸</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AWAITING VIP</span>
                     </div>
                   ) : approachState === 'DETECTED' ? (
                     <div className="flex flex-col items-center text-center px-2 animate-fade-in-up w-full h-full bg-cyan-950/30">
                       <div className="w-full bg-cyan-600 py-1 flex justify-center items-center mb-2">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">⚡ PRIORITY ORDER</span>
                       </div>
                       
                       <span className="text-[14px] font-black text-amber-400 truncate w-full px-2">{activeClient?.name}</span>
                       <span className="text-[8px] font-mono text-slate-400 mb-2">{activeClient?.tier}</span>
                       
                       <div className="bg-black/60 border border-cyan-900 rounded p-2 w-11/12">
                         <span className="text-[11px] font-black text-white leading-tight block">{activeClient?.drink}</span>
                       </div>

                       <div className="mt-auto mb-3 flex items-center space-x-2">
                         <div className="w-4 h-4 border-2 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                         <span className="text-[12px] font-mono text-cyan-400">ETA: {Math.floor(distanceToBar / 1.5)}s</span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center text-center px-4 animate-fade-in-up">
                       <span className="text-4xl text-emerald-400 mb-2">✓</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">HANDOFF COMPLETE</span>
                     </div>
                   )}

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120e0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject VIP Camera Signatures</span>
               
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <button 
                   onClick={() => injectVIPApproach('Mr. Sterling')}
                   disabled={!systemActive || approachState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !systemActive || approachState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-amber-950/40 border-amber-900 text-amber-400 hover:bg-amber-900/60'
                   }`}
                 >
                   Inject Mr. Sterling (45s)
                 </button>
                 
                 <button 
                   onClick={() => injectVIPApproach('Ms. Vance')}
                   disabled={!systemActive || approachState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                     !systemActive || approachState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-900 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Inject Ms. Vance (20s)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveVIPDrinkPrep;
