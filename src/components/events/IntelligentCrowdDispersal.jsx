/* eslint-disable */
import React, { useState, useEffect } from 'react';

const IntelligentCrowdDispersal = () => {
  const [algoActive, setAlgoActive] = useState(false);
  const [dispersalStatus, setDispersalStatus] = useState('IDLE'); // IDLE, ANALYZING, BAITING, DISPERSING
  
  // Gate density metrics (0 to 100)
  const [gateA, setGateA] = useState(10); // Main Gate
  const [gateB, setGateB] = useState(5);
  const [gateC, setGateC] = useState(2);
  const [gateD, setGateD] = useState(1);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:00:00', type: 'SYS', msg: 'Crowd Dispersal Algorithm initialized.' },
    { id: 2, time: '23:00:05', type: 'SYS', msg: 'Awaiting Egress trigger condition (11:55 PM).' }
  ]);

  useEffect(() => {
    let loop;
    if (dispersalStatus === 'IDLE' && algoActive) {
      // Simulate slow build up at main gate
      loop = setInterval(() => {
        setGateA(prev => Math.min(95, prev + Math.random() * 5));
      }, 1000);
    } else if (dispersalStatus === 'BAITING') {
      // Gate A stops growing, B C D start growing rapidly due to gamified drops
      loop = setInterval(() => {
        setGateA(prev => Math.max(30, prev - Math.random() * 8));
        setGateB(prev => Math.min(45, prev + Math.random() * 10));
        setGateC(prev => Math.min(40, prev + Math.random() * 8));
        setGateD(prev => Math.min(35, prev + Math.random() * 6));
        
        // Once Gate A is sufficiently lowered, consider it dispersed
        setGateA(prev => {
          if (prev <= 35) {
            setDispersalStatus('DISPERSING');
            clearInterval(loop);
            addLog('SUCCESS', 'Egress curve smoothed. Critical crush mass averted.');
          }
          return prev;
        });
      }, 800);
    } else if (dispersalStatus === 'DISPERSING') {
      // Natural slow drain of all gates
      loop = setInterval(() => {
        setGateA(prev => Math.max(0, prev - Math.random() * 2));
        setGateB(prev => Math.max(0, prev - Math.random() * 2));
        setGateC(prev => Math.max(0, prev - Math.random() * 2));
        setGateD(prev => Math.max(0, prev - Math.random() * 2));
      }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [dispersalStatus, algoActive]);

  const triggerAlgorithm = () => {
    if (algoActive && dispersalStatus === 'IDLE') {
      setDispersalStatus('ANALYZING');
      addLog('WARN', 'Egress threshold breached at Main Gate. Danger: Crush Imminent.');
      
      setTimeout(() => {
        addLog('ACTION', 'Executing AI Behavioral Dispersal. Targeting 30,000 users.');
        
        setTimeout(() => {
          setDispersalStatus('BAITING');
          addLog('WEB3', 'Pushing "Secret VIP Afterparty" notification to users near Gate C.');
          addLog('WEB3', 'Pushing "Exclusive Digital Merch Drop" to users near Gate D.');
        }, 1500);
      }, 1500);
    }
  };

  const resetSim = () => {
    setDispersalStatus('IDLE');
    setGateA(10);
    setGateB(5);
    setGateC(2);
    setGateD(1);
    addLog('SYS', 'Simulation reset. Monitoring nominal egress loads.');
  };

  const toggleAlgo = () => {
    if (!algoActive) {
      setAlgoActive(true);
      addLog('SYS', 'Algorithmic Behavioral Manipulation engine online.');
    } else {
      setAlgoActive(false);
      resetSim();
      addLog('WARN', 'Engine offline. Egress routing reverting to manual megaphone control.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const getGateColor = (val) => {
    if (val > 80) return 'bg-red-500';
    if (val > 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Dispersal Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧩</span> Algorithmic Behavioral Routing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Intelligent Crowd Dispersal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">via Gamified Drops</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When the festival ends at midnight, 100,000 people rush the main exit simultaneously, creating a dangerous crush and a 3-hour traffic jam. Yelling through megaphones doesn't work. Eventra implements an AI dispersal algorithm. As the concert ends, Eventra analyzes crowd density and deliberately triggers "Secret Afterparty" notifications or exclusive digital merch drops at specific geographic locations (e.g., Gate C, Gate D), targeting subsets of users. This naturally baits the crowd away from the main exit, safely smoothing out the egress curve over an hour using behavioral psychology.
          </p>

          <div className="bg-[#111] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🧭</span> Egress Control AI
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAlgo}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     algoActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(202,138,4,0.4)]'
                   }`}
                 >
                   {algoActive ? 'Disable AI Routing' : 'Arm Dispersal Algorithm'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-3 mb-6">
               
               {/* Gate Metrics */}
               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gate A (Main)</span>
                 <div className="text-2xl font-black font-mono text-white mb-2">{Math.floor(gateA)}%</div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${getGateColor(gateA)}`} style={{ width: `${gateA}%` }}></div>
                 </div>
               </div>

               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gate B (VIP)</span>
                 <div className="text-2xl font-black font-mono text-white mb-2">{Math.floor(gateB)}%</div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${getGateColor(gateB)}`} style={{ width: `${gateB}%` }}></div>
                 </div>
               </div>

               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gate C (East)</span>
                 <div className="text-2xl font-black font-mono text-white mb-2">{Math.floor(gateC)}%</div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${getGateColor(gateC)}`} style={{ width: `${gateC}%` }}></div>
                 </div>
               </div>

               <div className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gate D (West)</span>
                 <div className="text-2xl font-black font-mono text-white mb-2">{Math.floor(gateD)}%</div>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${getGateColor(gateD)}`} style={{ width: `${gateD}%` }}></div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Dispersal Log</span>
                 {dispersalStatus === 'BAITING' && <span className="text-yellow-400 animate-pulse">Routing via App...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' :
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Map & Phone Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* Festival Map Heatmap Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#111] shadow-2xl relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Site Map (Heatmap)
                </span>
              </div>

              <div className="flex-1 relative bg-[#0f172a] overflow-hidden p-6">
                 {/* Map Graphic representation */}
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-10 mix-blend-screen pointer-events-none"></div>

                 {/* Main Gate A */}
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                   <div className={`w-20 h-20 rounded-full blur-xl absolute transition-all duration-1000 ${getGateColor(gateA)} opacity-60`} style={{ transform: `scale(${gateA / 50})` }}></div>
                   <span className="text-white font-black text-xs z-10 relative">GATE A</span>
                 </div>

                 {/* Gate B */}
                 <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col items-center">
                   <div className={`w-16 h-16 rounded-full blur-xl absolute transition-all duration-1000 ${getGateColor(gateB)} opacity-60`} style={{ transform: `scale(${gateB / 30})` }}></div>
                   <span className="text-white font-black text-xs z-10 relative">GATE B</span>
                 </div>

                 {/* Gate C (Drop Zone) */}
                 <div className="absolute top-8 right-8 flex flex-col items-center">
                   {dispersalStatus === 'BAITING' && <div className="absolute w-24 h-24 border-2 border-purple-500 rounded-full animate-ping opacity-50 z-0"></div>}
                   <div className={`w-16 h-16 rounded-full blur-xl absolute transition-all duration-1000 ${getGateColor(gateC)} opacity-60`} style={{ transform: `scale(${gateC / 30})` }}></div>
                   <span className="text-purple-400 font-black text-xs z-10 relative bg-black/50 px-2 py-1 rounded">🎉 GATE C</span>
                 </div>

                 {/* Gate D (Drop Zone) */}
                 <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col items-center">
                   {dispersalStatus === 'BAITING' && <div className="absolute w-24 h-24 border-2 border-pink-500 rounded-full animate-ping opacity-50 z-0"></div>}
                   <div className={`w-16 h-16 rounded-full blur-xl absolute transition-all duration-1000 ${getGateColor(gateD)} opacity-60`} style={{ transform: `scale(${gateD / 30})` }}></div>
                   <span className="text-pink-400 font-black text-xs z-10 relative bg-black/50 px-2 py-1 rounded">🎁 GATE D</span>
                 </div>

              </div>
            </div>

            {/* Attendee Phone Simulator */}
            <div className="w-full bg-slate-900 p-5 rounded-[2rem] border-4 border-slate-700 text-center relative overflow-hidden h-[180px]">
              
              <div className="absolute top-2 inset-x-0 h-4 flex justify-center z-50">
                <div className="w-16 h-4 bg-black rounded-b-xl"></div>
              </div>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4 mt-2">Attendee Phone (Dispersal Target)</span>
              
              {dispersalStatus === 'BAITING' ? (
                <div className="bg-black/80 rounded-xl p-3 border border-purple-500/30 text-left animate-fade-in-up shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">🤫</span>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Secret Set Unlocked</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-tight">
                    You've been selected! Fred Again.. is playing a secret afterparty at <strong>Gate C</strong>. First 1,000 people only. Head there now!
                  </p>
                </div>
              ) : (
                <div className="text-center opacity-30 mt-6">
                  <span className="text-xs font-bold uppercase tracking-widest">No Alerts</span>
                </div>
              )}
            </div>

            {/* Admin Controls */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={triggerAlgorithm}
                disabled={!algoActive || dispersalStatus !== 'IDLE' || gateA < 80}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !algoActive || dispersalStatus !== 'IDLE' || gateA < 80 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Execute Dispersal
              </button>
              
              <button 
                onClick={resetSim}
                disabled={dispersalStatus === 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  dispersalStatus === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Sim
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default IntelligentCrowdDispersal;
