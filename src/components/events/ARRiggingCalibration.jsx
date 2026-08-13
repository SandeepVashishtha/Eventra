/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARRiggingCalibration = () => {
  const [arActive, setArActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [calibrationState, setCalibrationState] = useState('idle'); // idle, scanning, analyzing, calibrated, error
  
  const [anchorPoints, setAnchorPoints] = useState([
    { id: 'A1', type: 'Truss Motor L', targetX: 12.5, targetY: 40.0, currentX: 0, currentY: 0, status: 'pending' },
    { id: 'A2', type: 'Truss Motor R', targetX: 87.5, targetY: 40.0, currentX: 0, currentY: 0, status: 'pending' },
    { id: 'C1', type: 'Center Line Array', targetX: 50.0, targetY: 45.0, currentX: 0, currentY: 0, status: 'pending' }
  ]);

  const [arLog, setArLog] = useState([
    { id: 1, time: '06:00:00', type: 'SYS', msg: 'Stage Blueprint [MainStage_V4.dwg] loaded into spatial memory.' }
  ]);

  useEffect(() => {
    let loop;
    if (arActive && calibrationState === 'scanning') {
      loop = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(loop);
            setCalibrationState('analyzing');
            analyzePoints();
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(loop);
  }, [arActive, calibrationState]);

  const analyzePoints = () => {
    addLog('AR', 'LiDAR mesh generated. Cross-referencing anchor coordinates...');
    
    setTimeout(() => {
      // Simulate reading physical points (with some slight errors)
      setAnchorPoints(prev => prev.map((pt, index) => {
        // Intentionally make C1 fail calibration first time for dramatic effect
        const errorX = index === 2 && Math.random() > 0.5 ? 2.4 : (Math.random() * 0.2 - 0.1);
        const errorY = index === 2 && Math.random() > 0.5 ? -1.8 : (Math.random() * 0.2 - 0.1);
        
        const physicalX = pt.targetX + errorX;
        const physicalY = pt.targetY + errorY;
        
        const isAligned = Math.abs(physicalX - pt.targetX) < 0.5 && Math.abs(physicalY - pt.targetY) < 0.5;
        
        return {
          ...pt,
          currentX: physicalX,
          currentY: physicalY,
          status: isAligned ? 'aligned' : 'misaligned'
        };
      }));

      setTimeout(() => {
        setAnchorPoints(currentPoints => {
          const hasError = currentPoints.some(p => p.status === 'misaligned');
          if (hasError) {
            setCalibrationState('error');
            addLog('ERR', 'Structural deviation detected! Adjust rigging points immediately.');
          } else {
            setCalibrationState('calibrated');
            addLog('SUCCESS', 'All anchors aligned within 5mm tolerance. Rigging approved for lift.');
          }
          return currentPoints;
        });
      }, 1000);

    }, 1500);
  };

  const startScan = () => {
    setArActive(true);
    setCalibrationState('scanning');
    setScanProgress(0);
    setAnchorPoints(prev => prev.map(p => ({ ...p, status: 'pending', currentX: 0, currentY: 0 })));
    addLog('LIDAR', 'Engaging spatial depth sensors. Mapping physical geometry...');
  };

  const resetScanner = () => {
    setArActive(false);
    setCalibrationState('idle');
    setScanProgress(0);
    setAnchorPoints(prev => prev.map(p => ({ ...p, status: 'pending', currentX: 0, currentY: 0 })));
    addLog('SYS', 'Scanner reset. Ready for new calibration sweep.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setArLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: iPad Pro Rigging App Simulator (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full max-w-[800px] bg-black rounded-[2rem] border-[16px] border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.7)] relative flex flex-col h-[550px] overflow-hidden font-sans landscape">
            
            {/* iPad Camera / Sensor Array Notch */}
            <div className="absolute left-0 inset-y-0 w-6 flex items-center justify-center z-40 bg-neutral-800 rounded-r-xl opacity-0"></div>

            {/* Simulated Camera Feed Background */}
            <div className="absolute inset-0 z-0 bg-neutral-800 overflow-hidden">
               {/* Grid overlay for "AR" feel */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] perspective-1000 transform rotateX-45 scale-150 origin-bottom"></div>
               
               {/* Fake physical stage elements */}
               <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[80%] h-4 border-t-4 border-neutral-600"></div>
               <div className="absolute bottom-20 left-[20%] w-2 h-[60%] bg-neutral-700"></div>
               <div className="absolute bottom-20 right-[20%] w-2 h-[60%] bg-neutral-700"></div>
               
               {/* LiDAR Scanning Effect */}
               {calibrationState === 'scanning' && (
                 <div 
                   className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] z-10 opacity-70"
                   style={{ top: `${scanProgress}%` }}
                 ></div>
               )}

               {/* Digital CAD Overlay & Anchor Points */}
               {(calibrationState === 'analyzing' || calibrationState === 'calibrated' || calibrationState === 'error') && (
                 <div className="absolute inset-0 z-20">
                    {/* Ghost CAD truss line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path 
                        d="M 20% 40% L 50% 45% L 80% 40%" 
                        fill="none" 
                        stroke="rgba(34,211,238,0.3)" 
                        strokeWidth="4" 
                        strokeDasharray="10 5" 
                      />
                    </svg>

                    {anchorPoints.map(pt => (
                      <div key={pt.id}>
                        {/* Target Blueprint Position */}
                        <div 
                          className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-500 rounded-full flex items-center justify-center opacity-50"
                          style={{ left: `${pt.targetX}%`, top: `${pt.targetY}%` }}
                        >
                          <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                        </div>
                        
                        {/* Physical LiDAR Detected Position */}
                        <div 
                          className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all duration-1000 ${
                            pt.status === 'aligned' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse' :
                            pt.status === 'misaligned' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce' : 'bg-yellow-500'
                          }`}
                          style={{ left: `${pt.currentX}%`, top: `${pt.currentY}%` }}
                        >
                          <span className="text-[8px] font-black text-black absolute -top-5 bg-white/80 px-1 rounded backdrop-blur">
                            {pt.id}
                          </span>
                        </div>
                        
                        {/* Connecting line if misaligned */}
                        {pt.status === 'misaligned' && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line 
                              x1={`${pt.targetX}%`} y1={`${pt.targetY}%`} 
                              x2={`${pt.currentX}%`} y2={`${pt.currentY}%`} 
                              stroke="red" strokeWidth="2" strokeDasharray="4 2"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Top HUD */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center px-6 z-30">
              <div className="flex items-center space-x-3">
                <span className="bg-cyan-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">AR Mode</span>
                <span className="text-white font-bold text-sm tracking-widest">Stage 1: Main</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-cyan-300 font-mono block">Depth Precision: ±2mm</span>
                <span className="text-[10px] text-cyan-300 font-mono block">Spatial Anchors: {anchorPoints.length}</span>
              </div>
            </div>

            {/* Bottom Controls UI */}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-4 z-30 flex justify-between items-center">
              
              <div className="flex-1 pr-4">
                {calibrationState === 'error' ? (
                  <div className="bg-red-900/40 border border-red-500 p-2 rounded flex items-center animate-fade-in text-white">
                     <span className="text-xl mr-3">⚠️</span>
                     <div>
                       <p className="text-xs font-black uppercase tracking-widest">Structural Deviation</p>
                       <p className="text-[10px] font-mono text-red-200">Anchor C1 is outside 5mm tolerance limit.</p>
                     </div>
                  </div>
                ) : calibrationState === 'calibrated' ? (
                   <div className="bg-emerald-900/40 border border-emerald-500 p-2 rounded flex items-center animate-fade-in text-white">
                     <span className="text-xl mr-3">✅</span>
                     <div>
                       <p className="text-xs font-black uppercase tracking-widest">Rigging Verified</p>
                       <p className="text-[10px] font-mono text-emerald-200">Blueprint matches physical space perfectly.</p>
                     </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 border border-neutral-700 p-2 rounded text-neutral-400">
                    <p className="text-[10px] font-mono">Status: {calibrationState.toUpperCase()}</p>
                    <p className="text-[10px] font-mono mt-1">Awaiting LiDAR mesh generation...</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={resetScanner}
                  className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition bg-neutral-800 text-white hover:bg-neutral-700"
                >
                  Reset
                </button>
                <button 
                  onClick={calibrationState === 'idle' || calibrationState === 'error' || calibrationState === 'calibrated' ? startScan : undefined}
                  disabled={calibrationState === 'scanning' || calibrationState === 'analyzing'}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition shadow-lg ${
                    calibrationState === 'scanning' || calibrationState === 'analyzing' ? 'bg-cyan-900 text-cyan-500 opacity-50 cursor-not-allowed' :
                    'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                  }`}
                >
                  {calibrationState === 'scanning' ? `Scanning ${scanProgress}%` : 
                   calibrationState === 'analyzing' ? 'Analyzing...' : 'Initiate Scan'}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Operations Dashboard (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📐</span> AR Rigging Calibration
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Spatial Computing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Structural Safety</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Rigging complex lighting and truss systems on massive festival stages takes days of manual measurement. Human error during this phase can cause catastrophic structural failures. Eventra integrates ARKit/ARCore into the crew app. Riggers hold up their iPad to the stage, overlaying the exact CAD blueprint. LiDAR depth-mapping instantly verifies that physical anchor points match the digital plan down to the millimeter before lifting.
          </p>

          <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[280px]">
             
             <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-4 border-b border-neutral-800 pb-2 flex justify-between text-xs">
               <span>Target Coordinate Matrix</span>
               <span className="text-cyan-500">± 5.0mm Tol</span>
             </span>
             
             <div className="space-y-2 mb-4">
               {anchorPoints.map(pt => (
                 <div key={pt.id} className="flex justify-between items-center p-2 bg-black rounded border border-neutral-800">
                   <div className="flex items-center">
                     <span className={`w-2 h-2 rounded-full mr-3 ${
                       pt.status === 'aligned' ? 'bg-emerald-500' :
                       pt.status === 'misaligned' ? 'bg-red-500' : 'bg-neutral-600'
                     }`}></span>
                     <div>
                       <span className="text-xs font-bold text-white block">{pt.id} - {pt.type}</span>
                       <span className="text-[9px] text-neutral-500 font-mono">TGT: {pt.targetX.toFixed(2)}, {pt.targetY.toFixed(2)}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className={`text-xs font-mono font-bold block ${pt.status === 'misaligned' ? 'text-red-400' : 'text-neutral-300'}`}>
                       CUR: {pt.currentX ? pt.currentX.toFixed(2) : '--.--'}, {pt.currentY ? pt.currentY.toFixed(2) : '--.--'}
                     </span>
                     <span className="text-[9px] text-neutral-500 uppercase font-bold">
                       {pt.status}
                     </span>
                   </div>
                 </div>
               ))}
             </div>

             {/* API / System Log */}
             <div className="flex-1 bg-black rounded-lg border border-neutral-800 p-3 font-mono text-[9px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <div className="flex-1 overflow-y-auto space-y-1 text-neutral-400 pr-2">
                 {arLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ERR' ? 'text-red-400 font-bold' :
                       log.type === 'LIDAR' ? 'text-cyan-400' :
                       log.type === 'AR' ? 'text-blue-300' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ARRiggingCalibration;
