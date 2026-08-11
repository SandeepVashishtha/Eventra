/* eslint-disable */
import React, { useState, useEffect } from 'react';

const NeuralStageDirector = () => {
  const [agentActive, setAgentActive] = useState(false);
  const [songState, setSongState] = useState('IDLE'); // IDLE, BUILDUP, DROP, BREAKDOWN
  
  // AI Metrics
  const [confidence, setConfidence] = useState(0);
  const [cuesExecuted, setCuesExecuted] = useState(0);
  const [dmxChannels, setDmxChannels] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'Neural-Symbolic AI Co-Pilot Initialized.' },
    { id: 2, time: '21:00:02', type: 'SYS', msg: 'Awaiting live audio waveform feed from FOH.' }
  ]);

  // Lighting State Simulation
  const [lasers, setLasers] = useState(false);
  const [strobes, setStrobes] = useState(false);
  const [ledColor, setLedColor] = useState('bg-slate-900');
  const [pulseSpeed, setPulseSpeed] = useState('animate-none');

  useEffect(() => {
    let loop;
    
    if (agentActive) {
      loop = setInterval(() => {
          
          if (songState === 'BUILDUP') {
              setConfidence(prev => Math.min(99, prev + (Math.random() * 2)));
              setLasers(false);
              setStrobes(Math.random() > 0.5);
              setLedColor('bg-fuchsia-600');
              setPulseSpeed('animate-pulse');
              setDmxChannels(412);
          } else if (songState === 'DROP') {
              setConfidence(prev => Math.max(90, prev + (Math.random() * 1 - 0.5)));
              setLasers(true);
              setStrobes(true);
              setLedColor('bg-cyan-500');
              setPulseSpeed('animate-ping');
              setDmxChannels(1024); // Max channels
          } else if (songState === 'BREAKDOWN') {
              setConfidence(prev => Math.max(80, prev - (Math.random() * 2)));
              setLasers(Math.random() > 0.8);
              setStrobes(false);
              setLedColor('bg-indigo-900');
              setPulseSpeed('animate-none');
              setDmxChannels(128);
          } else {
              setConfidence(0);
              setLasers(false);
              setStrobes(false);
              setLedColor('bg-slate-900');
              setPulseSpeed('animate-none');
              setDmxChannels(0);
          }

      }, 200); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [agentActive, songState]);

  const simulateSongPhase = (phase, logMsg) => {
    if (!agentActive) return;
    setSongState(phase);
    addLog('ACTION', logMsg);
    
    if (phase === 'BUILDUP') {
        addLog('AI', 'Neural prediction: Drop approaching in T-minus 14 seconds.');
        addLog('SYS', 'Queuing DMX Strobe chase sequence. Pre-rendering fuchsia LED loops.');
        setCuesExecuted(prev => prev + 12);
    } else if (phase === 'DROP') {
        addLog('CRIT', 'STRUCTURAL DROP DETECTED. Executing all high-intensity cues.');
        addLog('SYS', 'Firing 1,024 DMX channels: Lasers Active. Strobes Maximum.');
        setCuesExecuted(prev => prev + 45);
    } else if (phase === 'BREAKDOWN') {
        addLog('AI', 'Energy dispersing. Entering breakdown phase.');
        addLog('SYS', 'Transitioning to ambient indigo sweeps. Lasers to standby.');
        setCuesExecuted(prev => prev + 4);
    }
  };

  const toggleAgent = () => {
    if (!agentActive) {
      setAgentActive(true);
      setConfidence(85);
      addLog('SYS', 'AI Co-Pilot engaged. Listening to live Pioneer CDJ mixer network.');
    } else {
      setAgentActive(false);
      setConfidence(0);
      setSongState('IDLE');
      setLasers(false);
      setStrobes(false);
      setLedColor('bg-slate-900');
      setPulseSpeed('animate-none');
      setDmxChannels(0);
      addLog('WARN', 'AI Co-Pilot offline. Returning full manual control to human VJ.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Agent Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> Algorithmic Production
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Neural-Symbolic AI <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-500">Stage Director</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Lighting directors (VJs) suffer extreme fatigue manually triggering lasers, strobes, and video loops to the beat for 12 hours straight, often leading to missed cues during complex song transitions. Eventra fixes this by implementing a Neural-Symbolic AI agent that acts as a co-pilot for the VJ. The AI analyzes the live audio waveform to predict drops and structural changes seconds before they happen, dynamically generating and executing complex DMX lighting chases that mathematically match the emotional intensity of the track.
          </p>

          <div className="bg-[#0b0c16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-fuchsia-500 text-lg mr-2">🤖</span> AI VJ Co-Pilot Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAgent}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     agentActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]'
                   }`}
                 >
                   {agentActive ? 'Disable Co-Pilot (Manual)' : 'Engage Neural Director'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Predictive Confidence */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 agentActive && confidence > 95 ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-inner' :
                 agentActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Prediction Confidence
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     agentActive && confidence > 95 ? 'text-fuchsia-400 animate-pulse' :
                     agentActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {confidence.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

               {/* Active DMX Channels */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 agentActive && dmxChannels > 800 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Active DMX Channels
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     agentActive && dmxChannels > 800 ? 'text-cyan-400 animate-pulse' :
                     agentActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {dmxChannels}
                   </span>
                 </div>
               </div>
               
               {/* Cues Executed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 cuesExecuted > 0 ? 'bg-emerald-950/20 border-emerald-900/50' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Automated Cues Fired
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     cuesExecuted > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {cuesExecuted.toLocaleString()}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#030408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Neural-Symbolic Execution Log</span>
                 {songState === 'DROP' && <span className="text-cyan-400 animate-pulse">MAXIMUM INTENSITY...</span>}
                 {songState === 'BUILDUP' && <span className="text-fuchsia-400 animate-pulse">PRE-COMPUTING CUES...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-cyan-400 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Stage Lighting Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 bg-[#020306]`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-400">STAGE PREVIEW</span>
                <span className="text-[8px] font-mono text-slate-400">DMX UNIVERSE 1-4</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-end pb-8">
                
                {!agentActive ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">STAGE DARK. AI OFFLINE.</span>
                   </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                      
                      {/* Lasers (If Active) */}
                      {lasers && (
                          <div className="absolute bottom-12 w-full h-full flex justify-between items-end px-10 z-20 pointer-events-none">
                              {/* Left Lasers */}
                              <div className="w-1 h-64 bg-cyan-400 transform -rotate-45 origin-bottom blur-[1px] shadow-[0_0_15px_#22d3ee]"></div>
                              <div className="w-1 h-64 bg-cyan-400 transform -rotate-30 origin-bottom blur-[1px] shadow-[0_0_15px_#22d3ee]"></div>
                              
                              {/* Right Lasers */}
                              <div className="w-1 h-64 bg-cyan-400 transform rotate-30 origin-bottom blur-[1px] shadow-[0_0_15px_#22d3ee]"></div>
                              <div className="w-1 h-64 bg-cyan-400 transform rotate-45 origin-bottom blur-[1px] shadow-[0_0_15px_#22d3ee]"></div>
                          </div>
                      )}

                      {/* Strobes (If Active) */}
                      {strobes && (
                          <div className="absolute top-10 w-full flex justify-around px-8 z-20">
                              {[...Array(6)].map((_, i) => (
                                  <div key={i} className="w-4 h-4 bg-white rounded-full animate-pulse blur-sm shadow-[0_0_30px_#ffffff]" style={{ animationDuration: '0.1s', animationDelay: `${i*0.05}s` }}></div>
                              ))}
                          </div>
                      )}

                      {/* Main LED Screen */}
                      <div className={`w-48 h-32 border border-slate-700 rounded-sm relative z-10 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-300 ${ledColor}`}>
                          {/* Inner pulsing element */}
                          <div className={`w-24 h-24 bg-white/20 blur-md rounded-full ${pulseSpeed}`}></div>
                          
                          {/* AI HUD Overlay on screen */}
                          <div className="absolute top-1 left-1 text-[6px] font-mono text-white/50">AI CO-PILOT ACTIVE</div>
                      </div>

                      {/* DJ Booth */}
                      <div className="w-24 h-6 bg-slate-800 border-t border-slate-600 mt-2 z-30 relative">
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full shadow-[0_0_5px_#000]"></div>
                      </div>

                      {/* Global ambient light fill */}
                      <div className={`absolute inset-0 z-0 transition-colors duration-300 opacity-20 ${ledColor}`}></div>
                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0b0c16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Song Structure</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => simulateSongPhase('BREAKDOWN', 'Track breakdown detected. Energy dropping.')}
                   disabled={!agentActive || songState === 'BREAKDOWN'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !agentActive || songState === 'BREAKDOWN' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-900 text-indigo-400 hover:bg-indigo-900/60'
                   }`}
                 >
                   Breakdown (Low Energy)
                 </button>
                 
                 <button 
                   onClick={() => simulateSongPhase('BUILDUP', 'Track buildup detected. Tension rising.')}
                   disabled={!agentActive || songState === 'BUILDUP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !agentActive || songState === 'BUILDUP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-400 hover:bg-fuchsia-900/60 shadow-[0_0_15px_rgba(192,38,211,0.2)]'
                   }`}
                 >
                   Buildup (Rising Tension)
                 </button>

                 <button 
                   onClick={() => simulateSongPhase('DROP', 'Heavy drop detected. Maximum output.')}
                   disabled={!agentActive || songState === 'DROP'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !agentActive || songState === 'DROP' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-cyan-950/40 border-cyan-500 text-cyan-400 hover:bg-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
                   }`}
                 >
                   Bass Drop (Max Intensity)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default NeuralStageDirector;
