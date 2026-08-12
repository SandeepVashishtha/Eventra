/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BioPrintedStage = () => {
  const [printActive, setPrintActive] = useState(false);
  const [constructionState, setConstructionState] = useState('IDLE'); // IDLE, PRINTING, CURING, DISSOLVING
  
  // Material Metrics
  const [completionPct, setCompletionPct] = useState(0);
  const [myceliumExtruded, setMyceliumExtruded] = useState(0); // Tons
  const [structuralStress, setStructuralStress] = useState(0); // MPa
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Swarm Robotics CAD Interface Initialized.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting biomaterial extrusion sequence.' }
  ]);

  // Visualizer State
  const [printerPos, setPrinterPos] = useState(0);
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    let loop;
    
    if (printActive) {
      loop = setInterval(() => {
          
          if (constructionState === 'PRINTING') {
              setCompletionPct(prev => {
                  const next = prev + 0.5;
                  if (next >= 100) {
                      setConstructionState('CURING');
                      addLog('SUCCESS', 'Stage geometry complete. Initiating UV mycelium curing.');
                      return 100;
                  }
                  return next;
              });
              
              setMyceliumExtruded(prev => prev + 0.15);
              setPrinterPos(Math.sin(Date.now() / 500) * 40 + 50); // Swing back and forth 10-90%
              
              // Build up visual layers
              setLayers(prev => {
                  if (prev.length < Math.floor(completionPct / 5)) {
                      return [...prev, { id: prev.length, width: 80 - (prev.length * 2) }];
                  }
                  return prev;
              });

          } else if (constructionState === 'CURING') {
              setStructuralStress(prev => Math.max(8.5, prev - 0.2)); // Stress stabilizes as it cures
              
          } else if (constructionState === 'DISSOLVING') {
              setCompletionPct(prev => {
                  const next = prev - 1.5; // Dissolves faster than prints
                  if (next <= 0) {
                      setConstructionState('IDLE');
                      addLog('SUCCESS', 'Bio-structure safely dissolved and composted.');
                      return 0;
                  }
                  return next;
              });
              setMyceliumExtruded(prev => Math.max(0, prev - 0.45));
              
              // Remove layers
              setLayers(prev => prev.slice(0, Math.floor(completionPct / 5)));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [printActive, constructionState, completionPct]);

  const triggerEvent = (type) => {
    if (!printActive) return;
    
    if (type === 'PRINT') {
        if (constructionState !== 'IDLE') return;
        setConstructionState('PRINTING');
        setStructuralStress(25); // High stress while wet
        addLog('ACTION', 'Deploying 3D-Printer drone swarm. Extruding Hemp-Mycelium composite.');
    } else if (type === 'DISSOLVE') {
        if (constructionState !== 'CURING') return;
        setConstructionState('DISSOLVING');
        addLog('WARN', 'Festival concluded. Activating biological enzyme wash.');
        addLog('SYS', 'Dissolving stage structure into nutrient-rich soil.');
    }
  };

  const toggleSystem = () => {
    if (!printActive) {
      setPrintActive(true);
      addLog('SYS', 'Architectural CAD loaded. Mycelium hoppers at 100% capacity.');
    } else {
      setPrintActive(false);
      setConstructionState('IDLE');
      setCompletionPct(0);
      setMyceliumExtruded(0);
      setStructuralStress(0);
      setLayers([]);
      addLog('WARN', 'Swarm robotics offline. CAD interface disconnected.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040804] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🍄</span> Zero-Emission Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biodegradable 3D-Printed <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Stage Structures</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Building massive festival stages requires shipping thousands of tons of steel and plastic scaffolding across the country on diesel trucks, creating an astronomical carbon footprint. Eventra solves this by deploying localized robotic 3D-printing swarms to construct the stage architecture on-site using a structurally sound mycelium and hemp bio-composite. After the festival concludes, an enzyme wash safely dissolves the entire stage, composting it directly into the earth.
          </p>

          <div className="bg-[#08120a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🏗️</span> Bio-Robotics HUD
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     printActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {printActive ? 'Abort Swarm Construction' : 'Load Blueprint CAD'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Completion */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 constructionState === 'PRINTING' ? 'bg-emerald-950/20 border-emerald-900/50 shadow-inner' :
                 constructionState === 'CURING' ? 'bg-teal-950/40 border-teal-500/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Geometry Printed
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     constructionState === 'PRINTING' ? 'text-emerald-400' :
                     constructionState === 'CURING' ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(completionPct)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Material Used */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 myceliumExtruded > 0 ? 'bg-lime-950/20 border-lime-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Biomaterial Extruded
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     myceliumExtruded > 0 ? 'text-lime-400' : 'text-slate-600'
                   }`}>
                     {myceliumExtruded.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Tons</span>
                 </div>
               </div>
               
               {/* Structural Stress */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 structuralStress > 20 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 structuralStress > 0 ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Base Integrity Stress
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     structuralStress > 20 ? 'text-orange-400' :
                     structuralStress > 0 ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {structuralStress.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">MPa</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030604] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Robotics & Material Log</span>
                 {constructionState === 'PRINTING' && <span className="text-emerald-400 animate-pulse">EXTRUDING MATERIAL...</span>}
                 {constructionState === 'DISSOLVING' && <span className="text-lime-400 animate-pulse">ENZYME WASH ACTIVE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-lime-400 font-bold' :
                       log.type === 'ACTION' ? 'text-emerald-400 font-bold' :
                       'text-slate-400'
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
            
            {/* Stage Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!printActive ? 'bg-slate-900' : 'bg-[#060c08]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">CAD PREVIEW</span>
                <span className="text-[8px] font-mono text-slate-400">SWARM TELEMETRY</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-end p-8">
                
                {/* Background CAD Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                {!printActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative mb-32 block">BLUEPRINT NOT LOADED</span>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-end pb-8 z-20">
                      
                      {/* Robotic 3D Printer Gantry / Drone */}
                      {constructionState === 'PRINTING' && (
                          <div 
                              className="absolute z-30 transition-all duration-75"
                              style={{ 
                                  left: `${printerPos}%`, 
                                  bottom: `${32 + (layers.length * 6)}px`,
                                  transform: 'translateX(-50%)'
                              }}
                          >
                              {/* Drone body */}
                              <div className="w-8 h-4 border border-emerald-500 bg-emerald-950/80 rounded shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center justify-center relative">
                                  {/* Extruder nozzle */}
                                  <div className="absolute -bottom-2 w-1 h-2 bg-emerald-400"></div>
                                  {/* Material stream */}
                                  <div className="absolute -bottom-6 w-1 h-4 bg-emerald-400/50 animate-pulse blur-[1px]"></div>
                              </div>
                          </div>
                      )}

                      {/* Dissolving Rain Effect */}
                      {constructionState === 'DISSOLVING' && (
                          <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
                              {[...Array(20)].map((_, i) => (
                                  <div 
                                      key={i} 
                                      className="absolute w-0.5 h-4 bg-lime-500/40 rounded-full animate-[rain_1s_linear_infinite]"
                                      style={{
                                          left: `${Math.random() * 100}%`,
                                          top: `${Math.random() * 100 - 50}%`,
                                          animationDelay: `${Math.random()}s`
                                      }}
                                  ></div>
                              ))}
                          </div>
                      )}

                      {/* The Printed Structure (Organic/Curved Arch) */}
                      <div className="relative flex flex-col-reverse items-center w-full">
                          {layers.map((layer) => (
                              <div 
                                  key={layer.id}
                                  className={`h-1.5 rounded-full transition-all duration-500 my-[0.5px] ${
                                      constructionState === 'CURING' ? 'bg-teal-700/80 shadow-[0_0_10px_rgba(15,118,110,0.3)]' :
                                      constructionState === 'DISSOLVING' ? 'bg-lime-900/60 blur-[1px]' :
                                      'bg-emerald-600/90 shadow-[0_0_5px_rgba(5,150,105,0.8)]'
                                  }`}
                                  style={{ 
                                      width: `${layer.width}%`,
                                      opacity: constructionState === 'DISSOLVING' ? 0.5 : 1
                                  }}
                              ></div>
                          ))}
                      </div>
                      
                      {/* Ground Line */}
                      <div className="w-full h-1 bg-slate-700 mt-1 z-10 relative shadow-[0_5px_15px_rgba(0,0,0,1)]"></div>

                      {/* Overlays */}
                      {constructionState === 'CURING' && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-950/80 border border-teal-500 px-4 py-2 rounded-lg backdrop-blur z-40 flex flex-col items-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                              <span className="text-[12px] font-black uppercase text-teal-400">UV Curing in Progress</span>
                              <span className="text-[8px] font-mono text-teal-200 mt-1">Structure solidifying to 8.5 MPa.</span>
                          </div>
                      )}

                      {constructionState === 'IDLE' && layers.length === 0 && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg backdrop-blur z-40 text-center">
                              <span className="text-[10px] font-black uppercase text-slate-500 block">Site Cleared</span>
                          </div>
                      )}
                      
                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes rain {
                        0% { transform: translateY(0); opacity: 1; }
                        100% { transform: translateY(200px); opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#08120a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Manage Lifecycle</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerEvent('PRINT')}
                   disabled={!printActive || constructionState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !printActive || constructionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                   }`}
                 >
                   Deploy Printer Swarm
                 </button>

                 <button 
                   onClick={() => triggerEvent('DISSOLVE')}
                   disabled={!printActive || constructionState !== 'CURING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !printActive || constructionState !== 'CURING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-lime-950/40 border-lime-600 text-lime-500 hover:bg-lime-900/60 shadow-[0_0_15px_rgba(132,204,22,0.3)]'
                   }`}
                 >
                   Compost Structure (Enzyme Wash)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BioPrintedStage;
