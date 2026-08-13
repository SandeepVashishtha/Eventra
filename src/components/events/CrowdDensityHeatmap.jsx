/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CrowdDensityHeatmap = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [activeConnections, setActiveConnections] = useState(0);
  const [criticalZones, setCriticalZones] = useState(0);
  
  // Heatmap Points { x, y, intensity (0-100), radius }
  const [heatmapPoints, setHeatmapPoints] = useState([
      { id: 'zone-1', x: 20, y: 30, intensity: 20, radius: 40, label: 'Main Entrance' },
      { id: 'zone-2', x: 70, y: 40, intensity: 30, radius: 60, label: 'Food Court' },
      { id: 'zone-3', x: 50, y: 80, intensity: 40, radius: 80, label: 'Main Stage' },
      { id: 'zone-4', x: 85, y: 75, intensity: 15, radius: 35, label: 'VIP Lounge' }
  ]);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '16:00:00', type: 'SYS', msg: 'WLAN Controller API connection established. Awaiting AP logs.' }
  ]);

  useEffect(() => {
      let pollingInterval;
      
      if (isPolling) {
          pollingInterval = setInterval(() => {
              // Simulate incoming MAC address RSSI logs
              setActiveConnections(prev => {
                  const shift = (Math.random() - 0.3) * 5000; 
                  return Math.max(10000, Math.min(85000, prev + shift));
              });

              // Mutate heatmap points based on simulated crowd movement
              let currentCritical = 0;
              setHeatmapPoints(prev => prev.map(pt => {
                  // Random drift for intensity
                  const intensityShift = (Math.random() - 0.4) * 8; 
                  let newIntensity = Math.max(10, Math.min(100, pt.intensity + intensityShift));
                  
                  // Stage usually gets more crowded over time
                  if (pt.id === 'zone-3' && newIntensity < 90 && Math.random() > 0.7) {
                      newIntensity += 5;
                  }
                  
                  if (newIntensity > 85) currentCritical++;
                  
                  // Slight coordinate drift
                  const dx = (Math.random() - 0.5) * 1.5;
                  const dy = (Math.random() - 0.5) * 1.5;
                  
                  return {
                      ...pt,
                      intensity: newIntensity,
                      x: Math.max(10, Math.min(90, pt.x + dx)),
                      y: Math.max(10, Math.min(90, pt.y + dy))
                  };
              }));
              
              setCriticalZones(currentCritical);

              if (currentCritical > 0 && Math.random() > 0.8) {
                  addLog('CRIT', `Crowd Crush Warning! Density exceeded 5 pax/sqm at ${heatmapPoints.find(p => p.intensity > 85)?.label || 'Sector 7'}`);
              } else if (Math.random() > 0.9) {
                  addLog('SYS', 'Ingested 4,502 new MAC address RSSI vectors from AP Group [Alpha].');
              }

          }, 1000);
      } else {
          setActiveConnections(0);
          setCriticalZones(0);
          setHeatmapPoints(prev => prev.map(pt => ({ ...pt, intensity: 10 }))); // Reset to low
      }
      
      return () => { if (pollingInterval) clearInterval(pollingInterval); };
  }, [isPolling, heatmapPoints]);

  const togglePolling = () => {
      setIsPolling(!isPolling);
      if (!isPolling) {
          addLog('ACTION', 'Initiating live Wi-Fi triangulation and ML density mapping.');
      } else {
          addLog('WARN', 'Halted AP log ingestion. Heatmap offline.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper to convert intensity to a heat color (Blue -> Green -> Yellow -> Red)
  const getHeatColor = (intensity) => {
      if (intensity < 30) return `rgba(59, 130, 246, ${intensity / 100})`; // Blue
      if (intensity < 60) return `rgba(34, 197, 94, ${intensity / 100})`;  // Green
      if (intensity < 85) return `rgba(234, 179, 8, ${intensity / 100})`;  // Yellow
      return `rgba(239, 68, 68, ${intensity / 100})`;                      // Red
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Backend Data Pipelines & Algorithms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Crowd Density <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">Wi-Fi Heatmap</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Security teams have zero visibility into crowd bottlenecks until a dangerous crush occurs, relying entirely on visual radio reports from staff on the ground. Eventra solves this by building a backend algorithm that ingests anonymized device connection logs from the existing festival Wi-Fi access points. Using signal strength (RSSI) triangulation, the software mathematically estimates crowd density and renders a real-time glowing heatmap overlay on the interactive security dashboard map.
          </p>

          <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Triangulation Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={togglePolling}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isPolling ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                     'bg-orange-600 text-white border border-orange-500 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                   }`}
                 >
                   {isPolling ? 'Halt Telemetry' : 'Engage Wi-Fi Polling'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Active Connections */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isPolling ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Unique MAC Addresses
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${isPolling ? 'text-blue-400' : 'text-slate-600'}`}>
                     {activeConnections.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Critical Zones */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 criticalZones > 0 ? 'bg-red-950/30 border-red-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Critical Crush Zones
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${criticalZones > 0 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                     {criticalZones}
                   </span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1 uppercase">Detected</span>
                 </div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>WLAN Access Point Logs</span>
                 {isPolling && <span className="text-orange-400 font-black animate-pulse">TRIANGULATING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-red-600 px-1' :
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
            
            {/* SecOps Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-600/20 border border-red-500 rounded flex items-center justify-center text-red-500 text-xs font-black">!</div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">SecOps Command</span>
                  </div>
                  {criticalZones > 0 && (
                      <span className="absolute top-0 right-0 h-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center px-4 animate-pulse">
                          Deploy Crowd Control
                      </span>
                  )}
              </div>

              {/* Map Area */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
                  
                  {/* Grid / Blueprint Base */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                  
                  {/* Map Geometry Outlines */}
                  <div className="absolute top-[30%] left-[20%] w-[100px] h-[50px] border border-slate-700/50 rounded flex items-center justify-center text-[8px] text-slate-600 uppercase font-bold">Entrance</div>
                  <div className="absolute top-[40%] left-[70%] w-[80px] h-[80px] border border-slate-700/50 rounded-full flex items-center justify-center text-[8px] text-slate-600 uppercase font-bold">Food Court</div>
                  <div className="absolute top-[80%] left-[50%] -translate-x-1/2 w-[180px] h-[40px] border border-slate-700/50 bg-slate-900/50 rounded flex items-center justify-center text-[10px] text-slate-500 uppercase font-black">Main Stage</div>
                  
                  {/* Heatmap Overlay */}
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                      {heatmapPoints.map(pt => (
                          <div 
                              key={pt.id}
                              className="absolute transition-all duration-1000 ease-in-out"
                              style={{
                                  left: `${pt.x}%`,
                                  top: `${pt.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: `${pt.radius * 2}px`,
                                  height: `${pt.radius * 2}px`,
                                  background: `radial-gradient(circle, ${getHeatColor(pt.intensity)} 0%, transparent 70%)`,
                                  filter: 'blur(10px)',
                                  opacity: isPolling ? 1 : 0
                              }}
                          ></div>
                      ))}
                  </div>
                  
                  {/* Density Markers */}
                  {isPolling && heatmapPoints.map(pt => (
                      <div 
                          key={`marker-${pt.id}`}
                          className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center pointer-events-none z-10"
                          style={{
                              left: `${pt.x}%`,
                              top: `${pt.y}%`,
                              transform: 'translate(-50%, -50%)'
                          }}
                      >
                          {pt.intensity > 85 && (
                              <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-lg animate-bounce">
                                  CRUSH RISK
                              </div>
                          )}
                          <div className={`mt-1 text-[9px] font-mono font-bold ${pt.intensity > 85 ? 'text-red-400' : 'text-slate-400'}`}>
                              {pt.intensity.toFixed(0)}%
                          </div>
                      </div>
                  ))}

                  {/* Offline Overlay */}
                  {!isPolling && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                              <span className="text-slate-500 text-4xl mb-2 block">📡</span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-700 bg-slate-900 px-4 py-2 rounded">Awaiting Telemetry</span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b101a] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Wi-Fi Telemetry Aggregation:</span>
               Click <span className="text-white font-bold bg-orange-600 border border-orange-500 px-1 rounded">Engage Wi-Fi Polling</span>. The backend ingests MAC address connection logs and triangulates device coordinates. The SecOps dashboard renders a dynamic, glowing heatmap. When density at the Main Stage exceeds safe limits, the system triggers a <span className="text-red-500 font-black">CRUSH RISK</span> alert.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CrowdDensityHeatmap;
