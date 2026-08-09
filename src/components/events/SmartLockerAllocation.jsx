/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartLockerAllocation = () => {
  const [allocationActive, setAllocationActive] = useState(false);
  const [festivalPhase, setFestivalPhase] = useState('AFTERNOON_LULL'); // INGRESS, AFTERNOON_LULL, EGRESS
  
  // Pod Locations (Coordinates 0-100)
  const [pods, setPods] = useState([
    { id: 'ALPHA', x: 50, y: 50, status: 'STATIONARY', load: 85 },
    { id: 'BRAVO', x: 50, y: 50, status: 'STATIONARY', load: 92 },
    { id: 'CHARLIE', x: 50, y: 50, status: 'STATIONARY', load: 78 },
  ]);
  
  // Predictive Metrics
  const [queueCongestion, setQueueCongestion] = useState(12); // minutes
  const [egressProbability, setEgressProbability] = useState(5); // %
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Mobile AGV Locker Fleet initialized.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Spatial prediction model standing by.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (allocationActive) {
      if (festivalPhase === 'AFTERNOON_LULL') {
        // Pods clustered in center, low congestion
        loop = setInterval(() => {
          setQueueCongestion(Math.max(5, Math.min(15, 12 + (Math.random() * 4 - 2))));
          setEgressProbability(Math.max(2, Math.min(8, 5 + (Math.random() * 2 - 1))));
        }, 1000);
      } else if (festivalPhase === 'INGRESS') {
        // High congestion at main entrance, dispatching pods
        loop = setInterval(() => {
          setQueueCongestion(prev => Math.max(8, prev - 1.5)); // Dropping as pods fan out
          setEgressProbability(2);
          
          setPods(prev => prev.map(pod => {
            if (pod.status !== 'IN_TRANSIT') return pod;
            
            // Move towards entrance (x: 10, y: 20-80)
            const targetX = 15;
            const targetY = pod.id === 'ALPHA' ? 30 : pod.id === 'BRAVO' ? 50 : 70;
            
            const dx = targetX - pod.x;
            const dy = targetY - pod.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 2) {
              if (pod.id === 'CHARLIE') addLog('SUCCESS', 'All pods reached Ingress distribution points.');
              return { ...pod, x: targetX, y: targetY, status: 'DEPLOYED' };
            }
            
            return {
              ...pod,
              x: pod.x + (dx / dist) * 2,
              y: pod.y + (dy / dist) * 2
            };
          }));
        }, 200);
      } else if (festivalPhase === 'EGRESS') {
         // Massive congestion at exit, dispatching pods to exit routes
         loop = setInterval(() => {
          setQueueCongestion(prev => Math.max(12, prev - 2)); // Dropping fast as pods intercept
          setEgressProbability(98);
          
          setPods(prev => prev.map(pod => {
            if (pod.status !== 'IN_TRANSIT') return pod;
            
            // Move towards exits (x: 85, y: 20-80)
            const targetX = 85;
            const targetY = pod.id === 'ALPHA' ? 20 : pod.id === 'BRAVO' ? 50 : 80;
            
            const dx = targetX - pod.x;
            const dy = targetY - pod.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 2) {
              if (pod.id === 'CHARLIE') addLog('SUCCESS', 'All pods reached Egress intercept points. Queue mitigated.');
              return { ...pod, x: targetX, y: targetY, status: 'DEPLOYED' };
            }
            
            return {
              ...pod,
              x: pod.x + (dx / dist) * 2,
              y: pod.y + (dy / dist) * 2
            };
          }));
        }, 200);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [allocationActive, festivalPhase]);

  const triggerIngress = () => {
    if (allocationActive) {
      setFestivalPhase('INGRESS');
      setQueueCongestion(45); // Huge initial spike
      setPods(prev => prev.map(p => ({ ...p, status: 'IN_TRANSIT' })));
      addLog('WARN', 'Mass Ingress detected at Main Gate.');
      addLog('ACTION', 'Dispatching AGV Pods to Entrance perimeter to distribute load.');
    }
  };

  const triggerEgress = () => {
    if (allocationActive) {
      setFestivalPhase('EGRESS');
      setQueueCongestion(65); // Massive end of night spike
      setPods(prev => prev.map(p => ({ ...p, status: 'IN_TRANSIT' })));
      addLog('CRIT', 'Headline set ending. Imminent Egress surge predicted.');
      addLog('ACTION', 'Scrambling AGV Pods to intercept crowd at Exit gates.');
    }
  };

  const resetSimulation = () => {
    setFestivalPhase('AFTERNOON_LULL');
    setQueueCongestion(12);
    setPods([
      { id: 'ALPHA', x: 50, y: 50, status: 'STATIONARY', load: 85 },
      { id: 'BRAVO', x: 50, y: 50, status: 'STATIONARY', load: 92 },
      { id: 'CHARLIE', x: 50, y: 50, status: 'STATIONARY', load: 78 },
    ]);
    addLog('SYS', 'Crowd flow stabilized. Pods returned to central hub.');
  };

  const toggleAllocation = () => {
    if (!allocationActive) {
      setAllocationActive(true);
      addLog('SYS', 'Dynamic Allocation Model Armed. Tracking crowd flow metrics.');
    } else {
      setAllocationActive(false);
      resetSimulation();
      addLog('WARN', 'Spatial dispatch offline. Lockers locked to central hub.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🤖</span> Autonomous Fleet Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Smart-Locker <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Spatial Allocation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees wait hours in line for lockers located at a single central entrance, creating massive congestion at the beginning and end of the day. Eventra solves this by deploying mobile smart-locker pods mounted on heavy-duty AGVs. Our predictive model analyzes crowd ingress/egress patterns and automatically dispatches the locker pods to fan out across high-demand zones. By moving the lockers to intercept the crowd (e.g., right before the festival ends), we completely decentralize the queue and eliminate chokepoints.
          </p>

          <div className="bg-[#121626] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🔀</span> Fleet Dispatch Control
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAllocation}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     allocationActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {allocationActive ? 'Halt AGV Fleet' : 'Arm Predictive Dispatch'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Queue Congestion */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 queueCongestion > 40 ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 queueCongestion > 20 ? 'bg-yellow-950/40 border-yellow-500/50' :
                 allocationActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Est. Queue Wait Time
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     queueCongestion > 40 ? 'text-red-400 animate-pulse' :
                     queueCongestion > 20 ? 'text-yellow-400' :
                     allocationActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {allocationActive ? Math.floor(queueCongestion) : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">mins</span>
                 </div>
               </div>

               {/* Phase Indicator */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 festivalPhase === 'EGRESS' ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 festivalPhase === 'INGRESS' ? 'bg-cyan-950/40 border-cyan-500/50' :
                 allocationActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Predicted Crowd State
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     festivalPhase === 'EGRESS' ? 'text-orange-400' :
                     festivalPhase === 'INGRESS' ? 'text-cyan-400' :
                     allocationActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {allocationActive ? festivalPhase.replace('_', ' ') : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     Egress Prob: {Math.floor(egressProbability)}%
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>AGV Telemetry Log</span>
                 {pods.some(p => p.status === 'IN_TRANSIT') && <span className="text-cyan-400 animate-pulse">Routing Pods...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'CRIT' ? 'text-orange-500 font-bold uppercase' : 
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
            
            {/* Map Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">FESTIVAL GROUNDS</span>
                <span className="text-[8px] font-mono text-slate-400">AGV ROUTING</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col p-4 pt-10">
                
                {/* Background Map Elements */}
                <div className="absolute inset-0 bg-slate-900 z-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzNDE1NSIvPjwvc3ZnPg==')]"></div>
                
                {/* Entrance (Left) */}
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-32 border-r-2 border-dashed ${festivalPhase === 'INGRESS' ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-700 bg-slate-800/30'} flex items-center justify-center`}>
                  <span className="text-[8px] font-black text-slate-500 -rotate-90 tracking-widest">ENTRANCE</span>
                </div>

                {/* Exit (Right) */}
                <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-48 border-l-2 border-dashed ${festivalPhase === 'EGRESS' ? 'border-orange-500 bg-orange-950/30' : 'border-slate-700 bg-slate-800/30'} flex items-center justify-center`}>
                  <span className="text-[8px] font-black text-slate-500 rotate-90 tracking-widest">MAIN EXIT</span>
                </div>

                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-slate-700 rounded-full flex items-center justify-center z-10">
                  <span className="text-[8px] font-black text-slate-600 tracking-widest absolute top-2">HUB</span>
                </div>

                {/* AGV Pods */}
                {allocationActive && pods.map(pod => (
                  <div 
                    key={pod.id}
                    className="absolute w-8 h-8 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
                    style={{ left: `${pod.x}%`, top: `${pod.y}%` }}
                  >
                    <div className={`w-4 h-4 rounded-sm border-2 ${
                      pod.status === 'IN_TRANSIT' ? 'border-cyan-400 bg-cyan-900 animate-pulse shadow-[0_0_10px_#22d3ee]' : 
                      'border-blue-400 bg-blue-600 shadow-[0_0_15px_#2563eb]'
                    }`}></div>
                    <span className="text-[6px] font-black text-white mt-1 bg-black/60 px-1 rounded">{pod.id}</span>
                  </div>
                ))}
                
                {/* Simulated Crowd Heatmap */}
                {allocationActive && festivalPhase === 'INGRESS' && (
                  <div className="absolute left-10 top-1/2 transform -translate-y-1/2 w-24 h-40 bg-cyan-500/20 blur-2xl z-0 rounded-full animate-pulse"></div>
                )}
                {allocationActive && festivalPhase === 'EGRESS' && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2 w-32 h-64 bg-orange-500/20 blur-2xl z-0 rounded-full animate-pulse"></div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-3 gap-2">
              <button 
                onClick={triggerIngress}
                disabled={!allocationActive || festivalPhase === 'INGRESS'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !allocationActive || festivalPhase === 'INGRESS' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Inject Ingress Surge
              </button>
              
              <button 
                onClick={triggerEgress}
                disabled={!allocationActive || festivalPhase === 'EGRESS'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !allocationActive || festivalPhase === 'EGRESS' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Egress Surge
              </button>
              
              <button 
                onClick={resetSimulation}
                disabled={!allocationActive || festivalPhase === 'AFTERNOON_LULL'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !allocationActive || festivalPhase === 'AFTERNOON_LULL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset To Baseline
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartLockerAllocation;
