/* eslint-disable */
import React, { useState, useEffect } from 'react';

const LiDARCrowdCrushPrevention = () => {
  const [sensorActive, setSensorActive] = useState(false);
  const [density, setDensity] = useState(2.1); // people per sq meter
  const [status, setStatus] = useState('NOMINAL'); // NOMINAL, WARNING, CRITICAL, LOCKDOWN
  const [musicActive, setMusicActive] = useState(true);
  
  const [systemLog, setSystemLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Truss-mounted LiDAR array booted. Initiating 3D point-cloud scan.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Depth mapping active. Bypassing optical strobe interference.' }
  ]);

  // Point cloud data simulation for visualization
  const [pointCloud, setPointCloud] = useState([]);

  useEffect(() => {
    // Generate initial point cloud (safe density)
    generateCloud(2.1);
  }, []);

  useEffect(() => {
    let loop;
    if (sensorActive && status !== 'LOCKDOWN') {
      loop = setInterval(() => {
        // Natural fluctuations
        setDensity(prev => {
          const next = prev + (Math.random() * 0.4 - 0.2);
          const bounded = Math.max(0.5, Math.min(8.0, next));
          
          if (bounded >= 6.0 && status !== 'CRITICAL') {
            triggerLockdown(bounded);
          } else if (bounded >= 4.5 && bounded < 6.0 && status !== 'WARNING') {
            setStatus('WARNING');
            addLog('WARN', `Density rising: ${bounded.toFixed(1)} pax/m². Monitoring closely.`);
          } else if (bounded < 4.5 && status !== 'NOMINAL') {
            setStatus('NOMINAL');
          }
          
          return bounded;
        });
      }, 800);
    }
    return () => clearInterval(loop);
  }, [sensorActive, status]);

  // Sync point cloud visual to density changes
  useEffect(() => {
    if (sensorActive && status !== 'LOCKDOWN') {
      generateCloud(density);
    }
  }, [density, sensorActive, status]);

  const generateCloud = (currentDensity) => {
    const points = [];
    const numPoints = Math.floor(currentDensity * 80); // Visual scalar
    for (let i = 0; i < numPoints; i++) {
      points.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        // Z determines color/depth in the simulation
        z: Math.random() * 100, 
      });
    }
    setPointCloud(points);
  };

  const triggerSurge = () => {
    if (sensorActive && status !== 'LOCKDOWN') {
      addLog('WARN', 'MASS SURGE DETECTED in Zone 1 (Front Center).');
      setDensity(6.8); // Fatal threshold
      generateCloud(6.8);
      
      setTimeout(() => {
        triggerLockdown(6.8);
      }, 500);
    }
  };

  const triggerLockdown = (surgeDensity) => {
    setStatus('LOCKDOWN');
    setMusicActive(false);
    addLog('CRIT', `FATAL DENSITY REACHED (${surgeDensity.toFixed(1)} pax/m²). Hardware interrupt triggered.`);
    addLog('ACTION', 'PA System seized. Cutting main audio feed.');
    
    setTimeout(() => {
      addLog('SYS', 'Executing automated emergency crowd control announcement.');
    }, 1000);
  };

  const resolveEmergency = () => {
    setStatus('NOMINAL');
    setDensity(2.5);
    generateCloud(2.5);
    setMusicActive(true);
    addLog('SUCCESS', 'Crowd dispersed. Density returned to safe levels. Re-engaging PA feed.');
  };

  const toggleSensor = () => {
    if (!sensorActive) {
      setSensorActive(true);
      addLog('SYS', 'LiDAR scanning engaged. Continuous density calculation active.');
    } else {
      setSensorActive(false);
      setStatus('NOMINAL');
      setDensity(0);
      setPointCloud([]);
      addLog('SYS', 'LiDAR offline. Relying on optical cameras.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSystemLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Spatial Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Crowd Crush <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Prevention via LiDAR</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Severe crowd crushes happen rapidly when too many people push toward the stage, and standard 2D security cameras cannot accurately judge depth or density in the dark, especially when blinded by stage strobes. Eventra mounts LiDAR sensors on the stage trussing. By reading live 3D point-cloud data, the system calculates exact human density per square meter regardless of lighting conditions. If density exceeds the fatal threshold (6+ people/m²), it automatically cuts the music and triggers emergency crowd-control PA announcements to save lives.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Autonomous Interlock Panel
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSensor}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     sensorActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-cyan-600 hover:bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                   }`}
                 >
                   {sensorActive ? 'Disable LiDAR' : 'Engage LiDAR Array'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Density Metric */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 status === 'LOCKDOWN' ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 
                 status === 'WARNING' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' : 
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex justify-between">
                   <span>Zone 1 Density</span>
                   <span className="text-red-500 font-mono">Limit: 6.0</span>
                 </span>
                 
                 <div className="flex items-end">
                   <span className={`text-4xl font-black font-mono leading-none ${
                     status === 'LOCKDOWN' ? 'text-red-500' : 
                     status === 'WARNING' ? 'text-orange-400' : 'text-cyan-400'
                   }`}>
                     {sensorActive ? density.toFixed(1) : '---'}
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">pax/m²</span>
                 </div>
                 
                 <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-300 ${
                       status === 'LOCKDOWN' ? 'bg-red-500' : 
                       status === 'WARNING' ? 'bg-orange-500' : 'bg-cyan-500'
                     }`} 
                     style={{ width: `${Math.min(100, (density / 8) * 100)}%` }}
                   ></div>
                 </div>
               </div>

               {/* PA System Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 !musicActive ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Stage PA Status</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     !musicActive ? 'text-red-500' : 'text-emerald-400'
                   }`}>
                     {musicActive ? 'LIVE' : 'OVERRIDDEN'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {musicActive ? 'Artist Audio Routing' : 'Emergency Announcements Only'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Autonomous Safety Log</span>
                 {status === 'LOCKDOWN' && <span className="text-red-500 animate-pulse">EMERGENCY LOCKDOWN</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {systemLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: LiDAR Visualization Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* 3D Point Cloud Viewport */}
            <div className={`w-full rounded-[1.5rem] border-[8px] border-[#111] shadow-2xl relative flex flex-col h-[350px] overflow-hidden font-sans mb-6 transition-all duration-300 ${
              status === 'LOCKDOWN' ? 'shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'shadow-[0_0_50px_rgba(6,182,212,0.1)]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-30 pointer-events-none bg-black/60 backdrop-blur-sm border-b border-white/10 flex justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'LOCKDOWN' ? 'text-red-400' : 'text-cyan-400'}`}>
                  Zone 1: Point Cloud
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Res: 2cm
                </span>
              </div>

              <div className="flex-1 relative flex flex-col items-center justify-center bg-[#02050a] overflow-hidden perspective-[1000px]">
                
                {sensorActive ? (
                  <div className="relative w-full h-full transform-style-3d rotate-x-[60deg] rotate-z-[-20deg] scale-125 transition-transform duration-[2s]">
                    
                    {/* Grid Floor */}
                    <div className="absolute inset-0 border border-cyan-900/30 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                    {/* Fatal Threshold Zone Marker */}
                    {status === 'LOCKDOWN' && (
                      <div className="absolute inset-1/4 border-2 border-red-500 bg-red-500/20 animate-pulse flex items-center justify-center">
                        <span className="text-red-500 font-bold text-xs transform -rotate-z-[-20deg] -rotate-x-[60deg]">CRITICAL MASS</span>
                      </div>
                    )}

                    {/* Render Point Cloud */}
                    {pointCloud.map(pt => (
                      <div 
                        key={pt.id}
                        className="absolute w-1 h-1 rounded-full shadow-[0_0_4px_currentColor] transition-all duration-500"
                        style={{
                          left: `${pt.x}%`,
                          top: `${pt.y}%`,
                          transform: `translateZ(${pt.z / 2}px)`,
                          backgroundColor: status === 'LOCKDOWN' ? '#ef4444' : 
                                           status === 'WARNING' ? '#f97316' : 
                                           `rgb(6, 182, 212, ${pt.z / 100})`, // Deeper points are dimmer
                          color: status === 'LOCKDOWN' ? '#ef4444' : '#06b6d4'
                        }}
                      ></div>
                    ))}
                    
                    {/* LiDAR Scanning Laser Effect */}
                    <div className="absolute top-0 bottom-0 w-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-30 mix-blend-screen animate-[ping-pong_2s_ease-in-out_infinite]" style={{ left: '50%' }}></div>

                  </div>
                ) : (
                  <div className="text-center opacity-30 z-10">
                    <span className="text-4xl block mb-2">📡</span>
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Sensor Array Offline</p>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerSurge}
                disabled={!sensorActive || status === 'LOCKDOWN'}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !sensorActive || status === 'LOCKDOWN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Simulate Crowd Surge
              </button>
              
              <button 
                onClick={resolveEmergency}
                disabled={status !== 'LOCKDOWN'}
                className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  status !== 'LOCKDOWN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Resolve & Clear PA
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default LiDARCrowdCrushPrevention;
