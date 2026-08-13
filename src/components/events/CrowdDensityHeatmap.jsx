/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

const CrowdDensityHeatmap = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // Edge AI Metrics
  const [activeCameras, setActiveCameras] = useState(0); 
  const [cvProcessingTime, setCvProcessingTime] = useState(0); // ms per frame
  const [totalHeadsCounted, setTotalHeadsCounted] = useState(0);
  const [bottleneckAlerts, setBottleneckAlerts] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:00:00', type: 'SYS', msg: 'YOLOv8 Edge Models deployed to 124 IP Cameras.' },
    { id: 2, time: '20:00:02', type: 'SYS', msg: 'Awaiting WebSocket telemetry stream...' }
  ]);

  // Visualizer State
  const [activeZone, setActiveZone] = useState('NOMINAL'); // NOMINAL, DENSE, CRITICAL
  const [bboxes, setBboxes] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveCameras(124);
          setCvProcessingTime(18 + Math.random() * 4); // ~18ms inference time
          
          let baseHeads = 420;
          if (activeZone === 'DENSE') baseHeads = 950;
          if (activeZone === 'CRITICAL') baseHeads = 1800;
          
          const currentCount = baseHeads + Math.floor(Math.random() * 50);
          setTotalHeadsCounted(currentCount);

          // Generate simulated YOLOv8 bounding boxes
          const numBoxes = Math.min(80, Math.floor(currentCount / 10)); // Cap visual boxes for performance
          const newBboxes = Array.from({ length: numBoxes }).map((_, i) => ({
              id: i,
              x: 5 + Math.random() * 90,
              y: 20 + Math.random() * 75,
              w: 3 + Math.random() * 3,
              h: 5 + Math.random() * 4,
              conf: (0.85 + Math.random() * 0.14).toFixed(2)
          }));
          setBboxes(newBboxes);
          
          // Bottleneck Logic
          if (activeZone === 'CRITICAL' && Math.random() > 0.8) {
              setBottleneckAlerts(prev => prev + 1);
              addLog('CRIT', 'SEVERE BOTTLENECK DETECTED: Stage 2 Entrance (Density > 4 pax/sqm).');
              addLog('ACTION', 'Auto-dispatching crowd control teams to sector B4.');
          }

      }, 500); // 2fps simulation update for UI
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, activeZone]);

  const setDensityState = (state) => {
      if (!systemActive) return;
      setActiveZone(state);
      
      if (state === 'NOMINAL') addLog('SUCCESS', 'Crowd flow normalized. No bottlenecks detected.');
      else if (state === 'DENSE') addLog('WARN', 'High density detected at main thoroughfare. Monitoring.');
      else if (state === 'CRITICAL') addLog('CRIT', 'Dangerous density spike. Potential crowd crush risk.');
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Command Center Heatmap Online. Ingesting YOLOv8 telemetry.');
    } else {
      setSystemActive(false);
      setActiveCameras(0);
      setCvProcessingTime(0);
      setTotalHeadsCounted(0);
      setBboxes([]);
      setActiveZone('NOMINAL');
      addLog('WARN', 'Edge AI Heatmap Offline. Reverting to manual crowd observation.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Edge AI Computer Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-time Crowd Density <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Heatmaps via CCTV</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Dangerous crowd bottlenecks form unexpectedly at narrow pathways or stage entrances, leading to potential crowd crush incidents before security is even aware. Eventra solves this by processing existing IP security camera feeds directly on edge devices using a lightweight object detection model (YOLOv8) to count heads in real-time. This anonymized telemetry data is streamed via WebSockets to a React-based interactive heatmap UI in the central command center, allowing security to proactively dispatch teams to thin out dense areas.
          </p>

          <div className="bg-[#060a12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> YOLOv8 Edge Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Telemetry Stream' : 'Initialize Edge Models'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Head Count */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeZone === 'CRITICAL' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                 activeZone === 'DENSE' ? 'bg-orange-950/40 border-orange-500/50' :
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Heads Counted
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     activeZone === 'CRITICAL' ? 'text-red-400 animate-pulse' : 
                     activeZone === 'DENSE' ? 'text-orange-400' : 'text-cyan-400'
                   }`}>
                     {totalHeadsCounted.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Active Cameras */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active CCTVs
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {activeCameras}
                   </span>
                 </div>
               </div>
               
               {/* Inference Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   CV Inference
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {systemActive ? cvProcessingTime.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                 </div>
               </div>
               
               {/* Bottleneck Alerts */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 bottleneckAlerts > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Crush Alerts
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     bottleneckAlerts > 0 ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {bottleneckAlerts}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WebSocket Stream Ledger</span>
                 {systemActive && <span className="text-cyan-400 font-black animate-pulse">STREAMING 124x JSON PAYLOADS</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
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
            
            {/* Visualizer Container */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#060a12]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/80 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">COMMAND CENTER</span>
                <span className="text-[8px] font-mono text-slate-400">CAM_NODE_042</span>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden pt-12">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">FEED OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col">
                        
                        {/* Upper Half: YOLOv8 Camera Feed Overlay */}
                        <div className="h-1/2 relative bg-slate-950 border-b border-slate-800 overflow-hidden">
                            {/* Fake Crowd Background (Gradients/Shapes) */}
                            <div className="absolute inset-0 bg-slate-900">
                                {/* Horizon / Stage */}
                                <div className="absolute top-10 inset-x-0 h-10 bg-indigo-900/30 blur-xl"></div>
                                {/* Crowd Mass (Darker at bottom) */}
                                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
                            </div>

                            {/* YOLO Bounding Boxes */}
                            {bboxes.map(box => {
                                let colorClass = 'border-cyan-400 bg-cyan-400/10';
                                let textClass = 'text-cyan-400';
                                
                                if (activeZone === 'DENSE') {
                                    colorClass = 'border-orange-400 bg-orange-400/10';
                                    textClass = 'text-orange-400';
                                } else if (activeZone === 'CRITICAL') {
                                    colorClass = 'border-red-500 bg-red-500/20';
                                    textClass = 'text-red-500';
                                }

                                return (
                                    <div 
                                        key={box.id}
                                        className={`absolute border-[1px] transition-all duration-75 ${colorClass}`}
                                        style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
                                    >
                                        {/* Class label & confidence (only show for a few to avoid clutter) */}
                                        {box.id % 5 === 0 && (
                                            <div className={`absolute -top-3 -left-px bg-black px-0.5 text-[4px] font-mono border-t border-l border-r ${colorClass} ${textClass}`}>
                                                head {box.conf}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            <div className="absolute bottom-1 right-2 text-[6px] font-mono text-cyan-400 bg-black/60 px-1">
                                YOLOv8n_tensorrt | {cvProcessingTime.toFixed(1)}ms
                            </div>
                        </div>

                        {/* Lower Half: Festival Global Heatmap */}
                        <div className="h-1/2 relative bg-[#0a0f1a]">
                            <div className="absolute top-2 left-2 text-[6px] font-black uppercase tracking-widest text-slate-500 z-30">
                                GLOBAL DENSITY HEATMAP
                            </div>
                            
                            {/* Grid Map */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                            
                            {/* Stages */}
                            <div className="absolute top-4 left-4 w-12 h-8 border border-slate-600 bg-slate-800 rounded-sm flex items-center justify-center text-[5px] text-slate-500 font-black">STAGE 1</div>
                            <div className="absolute bottom-4 right-4 w-12 h-8 border border-slate-600 bg-slate-800 rounded-sm flex items-center justify-center text-[5px] text-slate-500 font-black">STAGE 2</div>

                            {/* Heatmap Blobs based on state */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 mix-blend-screen pointer-events-none blur-xl`}
                                 style={{
                                     width: activeZone === 'CRITICAL' ? '200px' : activeZone === 'DENSE' ? '140px' : '80px',
                                     height: activeZone === 'CRITICAL' ? '120px' : activeZone === 'DENSE' ? '80px' : '50px',
                                     background: activeZone === 'CRITICAL' 
                                         ? 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(249,115,22,0.6) 40%, rgba(34,211,238,0.2) 80%, transparent 100%)' 
                                         : activeZone === 'DENSE'
                                         ? 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(234,179,8,0.4) 50%, rgba(34,211,238,0.2) 80%, transparent 100%)'
                                         : 'radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 100%)'
                                 }}
                            ></div>
                            
                            {/* Warning overlay on heatmap */}
                            {activeZone === 'CRITICAL' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 border-2 border-red-500 rounded-full animate-ping opacity-50 pointer-events-none"></div>
                            )}

                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#060a12] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Crowd Flow</span>
               
               <div className="grid grid-cols-3 gap-2 mb-2">
                 <button 
                   onClick={() => setDensityState('NOMINAL')}
                   disabled={!systemActive || activeZone === 'NOMINAL'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || activeZone === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-600 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                   }`}
                 >
                   🚶 Normal
                 </button>
                 
                 <button 
                   onClick={() => setDensityState('DENSE')}
                   disabled={!systemActive || activeZone === 'DENSE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || activeZone === 'DENSE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                   }`}
                 >
                   🏃 Dense
                 </button>

                 <button 
                   onClick={() => setDensityState('CRITICAL')}
                   disabled={!systemActive || activeZone === 'CRITICAL'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || activeZone === 'CRITICAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   ⚠️ CRUSH RISK
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrowdDensityHeatmap;
