/* eslint-disable */
import React, { useState, useEffect } from 'react';

const K8sChaosSimulator = () => {
  const [chaosActive, setChaosActive] = useState(false);
  
  // Metrics
  const [activeConnections, setActiveConnections] = useState(120);
  const [cpuUsage, setCpuUsage] = useState(15);
  const [dbDeadlocks, setDbDeadlocks] = useState(0);
  
  // Pod State
  const initialPods = [
      { id: 'pod-1', status: 'RUNNING', cpu: 12 },
      { id: 'pod-2', status: 'RUNNING', cpu: 15 },
      { id: 'pod-3', status: 'RUNNING', cpu: 18 }
  ];
  
  const [pods, setPods] = useState(initialPods);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Kubernetes Cluster [staging-eu-west] healthy.' },
    { id: 2, time: '14:00:01', type: 'SYS', msg: 'HPA (Horizontal Pod Autoscaler) standing by.' }
  ]);

  useEffect(() => {
      let trafficLoop;
      
      if (chaosActive) {
          trafficLoop = setInterval(() => {
              // Simulate traffic spike hitting Ingress
              setActiveConnections(prev => {
                  const next = prev + Math.floor(Math.random() * 25000) + 15000;
                  return next > 150000 ? 150000 + (Math.random() * 5000) : next;
              });

              // Increase overall CPU Load
              setCpuUsage(prev => Math.min(100, prev + 15));

              // Mutate Pods
              setPods(currentPods => {
                  let newPods = [...currentPods];
                  
                  // Stress existing pods
                  newPods = newPods.map(pod => {
                      if (pod.status === 'CRASH_LOOP') return pod;
                      
                      let newCpu = pod.cpu + (Math.random() * 30) + 10;
                      let newStatus = pod.status;
                      
                      if (newCpu > 95) {
                          newStatus = 'CRASH_LOOP'; // OOMKilled / CPU throttled
                          newCpu = 0;
                          addLog('CRIT', `Pod [${pod.id}] terminated (OOMKilled).`);
                      } else if (newCpu > 75) {
                          newStatus = 'WARNING';
                      }
                      
                      return { ...pod, cpu: newCpu, status: newStatus };
                  });

                  // Trigger HPA Scale Up if cluster CPU is high
                  const activePodCount = newPods.filter(p => p.status !== 'CRASH_LOOP').length;
                  const avgCpu = newPods.reduce((acc, p) => acc + p.cpu, 0) / Math.max(1, activePodCount);
                  
                  if (avgCpu > 60 && newPods.length < 16 && Math.random() > 0.3) {
                      const newId = `pod-${Math.floor(Math.random() * 900) + 100}`;
                      newPods.push({ id: newId, status: 'PENDING', cpu: 0 });
                      addLog('ACTION', `HPA Triggered: Scaling up replica set. Scheduled [${newId}].`);
                  }

                  // Transition PENDING pods to RUNNING
                  newPods = newPods.map(pod => {
                      if (pod.status === 'PENDING' && Math.random() > 0.5) {
                          return { ...pod, status: 'RUNNING', cpu: 20 };
                      }
                      return pod;
                  });

                  return newPods;
              });

              // Simulate Database Deadlocks under extreme load
              if (activeConnections > 100000 && Math.random() > 0.6) {
                  setDbDeadlocks(prev => prev + Math.floor(Math.random() * 5) + 1);
                  if (Math.random() > 0.8) {
                      addLog('WARN', 'DB Connection Pool Exhausted! Deadlock detected on `users` table.');
                  }
              }

          }, 800); // 800ms tick rate
      } else {
          // Cooldown phase
          setActiveConnections(120);
          setCpuUsage(15);
          setDbDeadlocks(0);
          setPods(initialPods);
      }
      
      return () => { if (trafficLoop) clearInterval(trafficLoop); };
  }, [chaosActive, activeConnections]);

  const triggerChaos = () => {
      setChaosActive(true);
      setPods(initialPods);
      setDbDeadlocks(0);
      addLog('CRIT', 'INITIATING CHAOS: Injecting 150,000 simulated bot requests to Ingress Controller...');
  };

  const stopChaos = () => {
      setChaosActive(false);
      addLog('SYS', 'Chaos test aborted. Draining traffic and down-scaling deployment.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 7));
  };

  return (
    <div className="min-h-screen bg-[#050812] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">☸️</span> Kubernetes & DevOps
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Auto-scaling Chaos <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Engineering Simulator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During the first 5 minutes of ticket sales, the backend infrastructure often collapses under the sudden thundering herd of 100,000 users, leading to database deadlocks. Eventra solves this by building a backend Chaos Engineering tool directly into the admin dashboard. Admins can simulate massive traffic spikes against a staging Kubernetes cluster, visualizing pod auto-scaling (HPA) and identifying database query bottlenecks in real-time before the actual ticket drop.
          </p>

          <div className="bg-[#0a0f1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Chaos Controller
               </h3>
               
               <div className="flex space-x-2">
                 {!chaosActive ? (
                     <button 
                       onClick={triggerChaos}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-rose-600 border border-rose-500 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                     >
                       <span className="mr-2">🔥</span> Release Thundering Herd
                     </button>
                 ) : (
                     <button 
                       onClick={stopChaos}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700"
                     >
                       Abort Test
                     </button>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Ingress Traffic */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 chaosActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Ingress RPS
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${chaosActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                     {(activeConnections / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>
               
               {/* Cluster CPU */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cpuUsage > 80 ? 'bg-amber-950/30 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Global CPU Avg
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${cpuUsage > 80 ? 'text-amber-400' : 'text-slate-600'}`}>
                     {cpuUsage.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* DB Deadlocks */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dbDeadlocks > 0 ? 'bg-rose-950/30 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DB Exceptions
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${dbDeadlocks > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                     {dbDeadlocks}
                   </span>
                 </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#02040a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>K8s Control Plane Events</span>
                 {chaosActive && <span className="text-blue-400 font-black animate-pulse">SCALING OPERATION...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold uppercase bg-rose-900/30 px-1' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
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
            
            {/* Kubernetes Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center shadow-md z-10">
                  <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">⎈</div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">K8s Deployment Topology</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">eventra-api-deployment</span>
              </div>

              <div className="flex-1 p-4 bg-slate-950 relative overflow-hidden flex flex-col">
                  
                  {/* Load Balancer / Ingress */}
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 flex flex-col items-center mb-6 relative z-10">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nginx Ingress Controller</span>
                      <div className="flex space-x-1">
                          {chaosActive && Array(10).fill(0).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: `${i * 100}ms` }}></div>
                          ))}
                      </div>
                  </div>

                  {/* Node / Pods Grid */}
                  <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 relative">
                      <span className="absolute -top-3 left-4 bg-slate-950 px-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800 rounded">Worker Node Group (eu-west)</span>
                      
                      <div className="grid grid-cols-4 gap-3 mt-2">
                          {pods.map(pod => (
                              <div key={pod.id} className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 animate-fade-in ${
                                  pod.status === 'PENDING' ? 'bg-slate-800 border-slate-600 border-dashed' :
                                  pod.status === 'CRASH_LOOP' ? 'bg-rose-950/50 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]' :
                                  pod.status === 'WARNING' ? 'bg-amber-950/50 border-amber-500' :
                                  'bg-blue-950/30 border-blue-600'
                              }`}>
                                  {/* CPU Fill visual */}
                                  {pod.status !== 'CRASH_LOOP' && pod.status !== 'PENDING' && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-white/10 transition-all duration-300" style={{ height: `${pod.cpu}%` }}></div>
                                  )}
                                  
                                  <span className="text-xl relative z-10">{
                                      pod.status === 'PENDING' ? '⏳' :
                                      pod.status === 'CRASH_LOOP' ? '💥' :
                                      pod.status === 'WARNING' ? '🔥' : '📦'
                                  }</span>
                                  <span className="text-[7px] font-mono text-slate-400 mt-1 relative z-10">{pod.id}</span>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a0f1c] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Horizontal Pod Autoscaling (HPA):</span>
               Click <span className="text-white font-bold bg-rose-600 border border-rose-500 px-1 rounded">Release Thundering Herd</span>. The simulated Ingress traffic spikes. As existing pod CPU usage hits >75%, they turn <span className="text-amber-500 font-bold">Orange</span>. If they hit 100%, they OOMKill (<span className="text-rose-500 font-bold">Red</span>). The Kubernetes HPA detects this and automatically schedules and spins up new pod replicas to handle the load.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default K8sChaosSimulator;
