/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PhotogrammetryEngine = () => {
  const [engineState, setEngineState] = useState('idle'); // idle, ingesting, meshing, rendering
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState([]);
  const [photosUploaded, setPhotosUploaded] = useState(14500); // 14.5k crowd photos
  
  const [renderLog, setRenderLog] = useState([
    { id: 1, time: '22:00:00', msg: 'System Idle. Awaiting ingestion trigger for Main Stage.' }
  ]);

  useEffect(() => {
    let loop;
    if (engineState === 'ingesting') {
      loop = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(loop);
            setEngineState('meshing');
            setProgress(0);
            addLog('Feature matching complete. 12.4M points extracted. Initiating Poisson surface reconstruction...');
            return 100;
          }
          return p + 5;
        });
      }, 200);
    } else if (engineState === 'meshing') {
      loop = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(loop);
            setEngineState('rendering');
            addLog('Meshing complete. Generating textures and exporting WebGL bundle...');
            return 100;
          }
          
          // Generate point cloud visualization during meshing
          setPoints(prev => {
            const newPoints = [];
            for(let i=0; i<50; i++) {
              newPoints.push({
                x: 50 + (Math.random() - 0.5) * p * 0.8,
                y: 50 + (Math.random() - 0.5) * p * 0.8,
                z: Math.random() * 100,
                color: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(100 + Math.random()*155)}, 255, ${Math.random()*0.8 + 0.2})`
              });
            }
            return [...prev, ...newPoints].slice(-800);
          });
          
          return p + 2;
        });
      }, 150);
    }
    
    return () => clearInterval(loop);
  }, [engineState]);

  const startEngine = () => {
    setEngineState('ingesting');
    setProgress(0);
    setPoints([]);
    addLog(`Ingesting ${photosUploaded.toLocaleString()} crowd-sourced 2D assets...`);
    addLog('Running SIFT (Scale-Invariant Feature Transform) across 1,024 nodes.');
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setRenderLog(prev => [{ id: Date.now(), time: timeStr, msg }, ...prev].slice(0, 8));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧊</span> 3D Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Crowd-Sourced 3D <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Photogrammetry Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Capturing a fully 3D interactive memory of a massive event requires expensive LiDAR rigs that most organizers cannot afford. Eventra solves this by building a massive cloud photogrammetry engine. Attendees seamlessly upload their standard 2D photos and videos of the main stage. The AI stitches thousands of crowd-sourced angles together, utilizing SIFT and Poisson reconstruction to generate a fully explorable 3D WebGL mesh, allowing users to "re-live" the event in VR.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">⚙️</span> Cluster Rendering Pipeline
               </h3>
               
               <button 
                 onClick={engineState === 'idle' ? startEngine : undefined}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   engineState === 'idle' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-slate-900 text-slate-600 border border-slate-800'
                 }`}
               >
                 {engineState === 'idle' ? 'Start Batch Build' : engineState.toUpperCase()}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 {engineState === 'ingesting' && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500/50 animate-pulse"></div>
                 )}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Assets Ingested (2D)</span>
                 <span className="text-3xl font-black font-mono text-purple-400">
                   {(photosUploaded * (engineState === 'ingesting' ? progress/100 : engineState === 'idle' ? 0 : 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                   <span className="text-sm font-bold text-slate-600 ml-1">Images</span>
                 </span>
               </div>

               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-center relative overflow-hidden">
                 {engineState === 'meshing' && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500/50 animate-pulse"></div>
                 )}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Point Cloud Data</span>
                 <span className="text-3xl font-black font-mono text-indigo-400">
                   {engineState === 'idle' || engineState === 'ingesting' ? '0' : (12.4 * (progress/100)).toFixed(1)}
                   <span className="text-sm font-bold text-slate-600 ml-1">Million</span>
                 </span>
               </div>

             </div>

             {/* Render Progress Bar */}
             {(engineState === 'ingesting' || engineState === 'meshing') && (
               <div className="mb-4">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                   <span>{engineState === 'ingesting' ? 'Feature Extraction (SIFT)' : 'Surface Reconstruction'}</span>
                   <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                   <div className={`h-full transition-all duration-300 ${engineState === 'ingesting' ? 'bg-purple-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
                 </div>
               </div>
             )}

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Computer Vision Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {renderLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.msg.includes('complete') ? 'text-emerald-400 font-bold' : 
                       log.msg.includes('WebGL') ? 'text-purple-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
                 
                 {engineState === 'rendering' && (
                   <div className="text-emerald-400 mt-2 flex items-center animate-pulse">
                     <span className="mr-2">✓</span> Build Successful. Link active.
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: WebGL Visualizer Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Header / Nav */}
            <div className="absolute top-0 inset-x-0 h-16 flex justify-between items-center px-6 z-30 bg-gradient-to-b from-black/80 to-transparent">
              <span className="font-black text-white tracking-widest uppercase text-sm">VR Memory</span>
              <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_10px_rgba(52,211,153,1)]"></span> Live 3D
              </div>
            </div>

            <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
               
               {engineState === 'idle' || engineState === 'ingesting' ? (
                 <div className="text-center p-6 relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 mb-6 relative">
                     <div className="absolute inset-0 border-2 border-slate-700 rounded-xl transform rotate-12"></div>
                     <div className="absolute inset-0 border-2 border-purple-500/50 rounded-xl transform -rotate-6"></div>
                     <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-center text-3xl shadow-xl">📷</div>
                   </div>
                   <h3 className="font-black text-white text-lg mb-2">Awaiting Render</h3>
                   <p className="text-xs text-slate-500">The 3D environment is currently compiling in the cloud. Please wait.</p>
                 </div>
               ) : engineState === 'meshing' ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   {/* Point Cloud Visualization */}
                   {points.map((p, i) => (
                     <div 
                       key={i} 
                       className="absolute rounded-full"
                       style={{
                         left: `${p.x}%`, 
                         top: `${p.y}%`, 
                         width: `${p.z/30 + 1}px`, 
                         height: `${p.z/30 + 1}px`,
                         backgroundColor: p.color,
                         boxShadow: `0 0 ${p.z/10}px ${p.color}`,
                         transform: `scale(${1 + Math.sin(Date.now()/500 + p.x)*0.2})`
                       }}
                     ></div>
                   ))}
                   
                   {/* Scanning Grid */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom animate-[grid_10s_linear_infinite]"></div>
                   
                   <div className="absolute z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded border border-purple-500/30 text-[10px] font-mono text-purple-300">
                     Reconstructing Surface Mesh...
                   </div>
                 </div>
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 animate-fade-in flex flex-col items-center justify-center relative overflow-hidden">
                   
                   {/* Abstract 3D Model Representation */}
                   <div className="w-48 h-48 relative animate-[spin_20s_linear_infinite]">
                     {/* Polygons */}
                     <div className="absolute inset-0 border-l border-t border-white/20 skew-x-12 skew-y-12"></div>
                     <div className="absolute inset-0 border-r border-b border-white/30 -skew-x-12 -skew-y-12"></div>
                     <div className="absolute inset-4 border-2 border-purple-400/50 rounded-lg transform rotate-45"></div>
                     <div className="absolute inset-8 border border-sky-400/50 rounded-full transform -rotate-45"></div>
                     
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                       🎪
                     </div>
                   </div>
                   
                   <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-4 px-6 z-20">
                     <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-white/20 transition">
                       Gyro View
                     </button>
                     <button className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-purple-500 transition shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                       Enter VR
                     </button>
                   </div>
                 </div>
               )}
               
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PhotogrammetryEngine;
