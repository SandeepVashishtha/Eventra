/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ChaosEngineeringDR = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [drComplete, setDrComplete] = useState(false);
  
  // Infrastructure State
  const [primaryState, setPrimaryState] = useState('HEALTHY'); // HEALTHY, TERMINATED
  const [replicaState, setReplicaState] = useState('STANDBY'); // STANDBY, PROMOTING, PRIMARY
  const [apiState, setApiState] = useState('200 OK'); // 200 OK, 503 ERROR
  const [routingTarget, setRoutingTarget] = useState('PRIMARY'); // PRIMARY, NONE, REPLICA
  
  const [downtimeSecs, setDowntimeSecs] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '03:00:00', type: 'SYS', msg: 'Cron job [Chaos_Monkey] initialized in staging environment.' }
  ]);

  useEffect(() => {
      let timer;
      if (isRunning && apiState === '503 ERROR') {
          timer = setInterval(() => {
              setDowntimeSecs(prev => prev + 1);
          }, 100); // Fast simulation, 100ms = 1s visually
      }
      return () => clearInterval(timer);
  }, [isRunning, apiState]);

  const injectChaos = () => {
      if (isRunning) return;
      setIsRunning(true);
      setDrComplete(false);
      setDowntimeSecs(0);
      
      // 1. Inject Chaos
      addLog('CRIT', 'INJECTING CHAOS: Executing SIGKILL on primary database instance (us-east-1).');
      setPrimaryState('TERMINATED');
      setApiState('503 ERROR');
      setRoutingTarget('NONE');

      // 2. Detect Failure
      setTimeout(() => {
          addLog('WARN', 'Health checks failed for primary DB. Initiating automated failover...');
          setReplicaState('PROMOTING');
      }, 1500);

      // 3. Promote Replica
      setTimeout(() => {
          addLog('SYS', 'Promoting cross-region read replica (us-west-2) to Primary Master...');
      }, 3000);

      // 4. Update DNS & Restore
      setTimeout(() => {
          setReplicaState('PRIMARY');
          setRoutingTarget('REPLICA');
          setApiState('200 OK');
          addLog('SUCCESS', 'Route53 DNS updated. Traffic routed to new Primary.');
          
          setTimeout(() => {
              setIsRunning(false);
              setDrComplete(true);
              addLog('ACTION', `DR Test Complete. Total automated recovery time: ${(downtimeSecs/10).toFixed(1)}s. Result: PASS.`);
          }, 1000);
      }, 5000);
  };
  
  const resetEnv = () => {
      setPrimaryState('HEALTHY');
      setReplicaState('STANDBY');
      setApiState('200 OK');
      setRoutingTarget('PRIMARY');
      setDrComplete(false);
      setDowntimeSecs(0);
      addLog('SYS', 'Staging environment reset to baseline topology.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d0505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔥</span> DevOps & Chaos Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated DR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-rose-500">Chaos Testing Workflow</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The DevOps team has a Disaster Recovery (DR) plan in a Google Doc, but it is never tested. If the primary database actually crashes during the festival, no one knows if the failover scripts still work. Eventra solves this by building an automated Chaos Engineering workflow. Once a week in staging, the software programmatically terminates the primary database instance, visualizing the automated failover to the replica and generating a Pass/Fail report to guarantee high availability.
          </p>

          <div className="bg-[#1a0a0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Chaos Monkey Controls
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={drComplete ? resetEnv : injectChaos}
                   disabled={isRunning}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isRunning ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     drComplete ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' :
                     'bg-orange-600 text-white border border-orange-500 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                     {isRunning ? 'Executing Failover...' : drComplete ? 'Reset Topology' : 'Inject Chaos (Kill Primary)'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Global Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center items-center transition-colors ${
                   apiState === '503 ERROR' ? 'bg-rose-950/40 border-rose-900' : 'bg-emerald-950/20 border-emerald-900/50'
               }`}>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">API Gateway Status</span>
                   <span className={`text-2xl font-black font-mono ${apiState === '503 ERROR' ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                       {apiState}
                   </span>
               </div>

               {/* Recovery Time */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center items-center">
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Failover Downtime</span>
                   <span className="text-2xl font-black font-mono text-slate-300">
                       {(downtimeSecs/10).toFixed(1)}s
                   </span>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#0a0404] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>SRE Event Logs</span>
                 {isRunning && <span className="text-orange-400 font-black animate-pulse">DR TEST IN PROGRESS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1 rounded-sm' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
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
            
            {/* Topology Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Infrastructure Topology</span>
                      <span className="text-xs text-white font-bold">Staging Environment</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* API Gateway */}
                  <div className={`w-32 py-3 rounded-lg border-2 text-center z-20 mb-8 transition-colors ${
                      apiState === '503 ERROR' ? 'bg-rose-900/50 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-600 text-slate-300'
                  }`}>
                      <span className="text-xl block mb-1">🌐</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">API Gateway</span>
                  </div>

                  {/* Routing Lines */}
                  <div className="absolute top-28 left-1/2 w-full flex justify-between px-16 z-10 pointer-events-none">
                      {/* Left Line (to Primary) */}
                      <svg width="100%" height="100" className="absolute left-0 -translate-x-1/4">
                          <path 
                              d="M 200 0 C 150 50, 100 50, 50 100" 
                              fill="none" 
                              stroke={routingTarget === 'PRIMARY' ? '#10b981' : '#334155'} 
                              strokeWidth="3" 
                              strokeDasharray={routingTarget === 'PRIMARY' ? '5,5' : '0'} 
                              className={routingTarget === 'PRIMARY' ? 'animate-[dash_1s_linear_infinite]' : ''}
                          />
                      </svg>
                      {/* Right Line (to Replica) */}
                      <svg width="100%" height="100" className="absolute right-0 translate-x-1/4">
                          <path 
                              d="M 50 0 C 100 50, 150 50, 200 100" 
                              fill="none" 
                              stroke={routingTarget === 'REPLICA' ? '#10b981' : '#334155'} 
                              strokeWidth="3" 
                              strokeDasharray={routingTarget === 'REPLICA' ? '5,5' : '0'} 
                              className={routingTarget === 'REPLICA' ? 'animate-[dash_1s_linear_infinite]' : ''}
                          />
                      </svg>
                  </div>

                  <div className="w-full flex justify-between mt-12 z-20">
                      
                      {/* Primary DB (us-east-1) */}
                      <div className={`flex flex-col items-center w-32 relative transition-all duration-500`}>
                          <div className={`w-20 h-24 rounded-lg border-4 flex items-center justify-center text-3xl mb-2 relative ${
                              primaryState === 'HEALTHY' ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-rose-950 border-rose-600 grayscale'
                          }`}>
                              🗄️
                              {primaryState === 'TERMINATED' && (
                                  <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🔥</div>
                              )}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">us-east-1</span>
                          <span className={`text-[9px] font-mono font-bold mt-1 px-2 py-0.5 rounded ${
                              primaryState === 'HEALTHY' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'
                          }`}>
                              {primaryState === 'HEALTHY' ? 'PRIMARY' : 'TERMINATED'}
                          </span>
                      </div>

                      {/* Replica DB (us-west-2) */}
                      <div className={`flex flex-col items-center w-32 relative transition-all duration-500`}>
                          <div className={`w-20 h-24 rounded-lg border-4 flex items-center justify-center text-3xl mb-2 relative ${
                              replicaState === 'PRIMARY' ? 'bg-slate-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                              replicaState === 'PROMOTING' ? 'bg-amber-900/50 border-amber-500 animate-pulse' :
                              'bg-slate-800/50 border-slate-600 opacity-50'
                          }`}>
                              🗄️
                              {replicaState === 'PROMOTING' && (
                                  <div className="absolute inset-0 border-4 border-amber-400 rounded-lg animate-ping opacity-20"></div>
                              )}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">us-west-2</span>
                          <span className={`text-[9px] font-mono font-bold mt-1 px-2 py-0.5 rounded ${
                              replicaState === 'PRIMARY' ? 'bg-emerald-900/50 text-emerald-400' : 
                              replicaState === 'PROMOTING' ? 'bg-amber-900/50 text-amber-400' :
                              'bg-slate-800 text-slate-400'
                          }`}>
                              {replicaState === 'PRIMARY' ? 'NEW PRIMARY' : replicaState}
                          </span>
                      </div>

                  </div>

                  {/* DR Report Overlay */}
                  {drComplete && (
                      <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-4 backdrop-blur-md animate-fade-in-up">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">DR Audit Report</span>
                              <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-bold">PASS</span>
                          </div>
                          <p className="text-xs text-emerald-100/70 mb-2">Automated failover successfully routed traffic to the cross-region replica in {(downtimeSecs/10).toFixed(1)} seconds, satisfying the 30-second SLA.</p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#1a0a0a] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Automated Chaos Engineering:</span>
               Click <span className="text-white font-bold bg-orange-600 px-1 rounded">Inject Chaos</span>. The system programmatically kills the primary <span className="font-mono text-slate-300">us-east-1</span> database. Watch the API Gateway start failing (503), proving the outage. The system then automatically detects the failure, promotes the Standby Replica in <span className="font-mono text-slate-300">us-west-2</span> to Primary, and re-routes DNS traffic, restoring the system and generating a compliance audit pass.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}} />
    </div>
  );
};

export default ChaosEngineeringDR;
