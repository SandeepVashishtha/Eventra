/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SilentDiscoOptimizer = () => {
  const [telemetryActive, setTelemetryActive] = useState(false);
  
  // Channel State (Red, Blue, Green)
  const [channels, setChannels] = useState([
    { id: 'RED', name: 'DJ Crimson (House)', color: 'bg-red-500', listeners: 33, trend: 'stable' },
    { id: 'BLUE', name: 'DJ Cobalt (Dubstep)', color: 'bg-blue-500', listeners: 34, trend: 'stable' },
    { id: 'GREEN', name: 'DJ Emerald (Disco)', color: 'bg-green-500', listeners: 33, trend: 'stable' }
  ]);
  
  const [dominantChannel, setDominantChannel] = useState('NONE');
  const [aiSuggestion, setAiSuggestion] = useState('Awaiting demographic shift...');
  
  // Headset Grid (100 headsets for visual simulation)
  const [headsets, setHeadsets] = useState(Array(100).fill('bg-slate-700'));
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Silent Disco RF Telemetry Hub online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'Ingesting live channel-switching data from 5,000 headsets.' }
  ]);

  // Normal random fluctuation
  useEffect(() => {
    let loop;
    if (telemetryActive && dominantChannel === 'NONE') {
      loop = setInterval(() => {
        // Randomly shift 1-2% of listeners between channels
        let newListeners = [...channels.map(c => c.listeners)];
        const fromIdx = Math.floor(Math.random() * 3);
        const toIdx = (fromIdx + (Math.random() > 0.5 ? 1 : 2)) % 3;
        
        if (newListeners[fromIdx] > 10) {
          const shift = Math.floor(Math.random() * 3);
          newListeners[fromIdx] -= shift;
          newListeners[toIdx] += shift;
        }

        // Normalize to 100%
        const total = newListeners.reduce((a, b) => a + b, 0);
        newListeners = newListeners.map(val => Math.round((val / total) * 100));
        
        // Ensure exact 100 sum
        const diff = 100 - newListeners.reduce((a, b) => a + b, 0);
        newListeners[0] += diff;

        setChannels(prev => prev.map((c, i) => ({
          ...c,
          listeners: newListeners[i],
          trend: newListeners[i] > prev[i].listeners ? 'up' : newListeners[i] < prev[i].listeners ? 'down' : 'stable'
        })));
        
        updateHeadsetGrid(newListeners);
      }, 1000);
    }
    return () => { if (loop) clearInterval(loop); };
  }, [telemetryActive, dominantChannel, channels]);

  const updateHeadsetGrid = (percentages) => {
    let grid = [];
    percentages.forEach((pct, idx) => {
      const color = idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-blue-500' : 'bg-green-500';
      grid = [...grid, ...Array(pct).fill(color)];
    });
    // Shuffle the grid visually
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    setHeadsets(grid);
  };

  const triggerBlueTakeover = () => {
    if (telemetryActive) {
      setDominantChannel('BLUE');
      
      let step = 0;
      const takeoverLoop = setInterval(() => {
        step++;
        setChannels(prev => {
          let r = Math.max(5, prev[0].listeners - 2);
          let g = Math.max(5, prev[2].listeners - 2);
          let b = 100 - (r + g);
          
          updateHeadsetGrid([r, b, g]);
          
          return [
            { ...prev[0], listeners: r, trend: 'down' },
            { ...prev[1], listeners: b, trend: 'up' },
            { ...prev[2], listeners: g, trend: 'down' }
          ];
        });

        if (step > 15) {
          clearInterval(takeoverLoop);
          setAiSuggestion('ALERT TO RED/GREEN DJs: Drop BPM to 140. Blue (Dubstep) is dominating.');
          addLog('AI', 'Mass channel migration detected -> Blue Channel (DJ Cobalt).');
          addLog('ACTION', 'Auto-syncing ambient DMX lighting to Blue Channel BPM.');
        }
      }, 200);
    }
  };

  const triggerRedTakeover = () => {
    if (telemetryActive) {
      setDominantChannel('RED');
      
      let step = 0;
      const takeoverLoop = setInterval(() => {
        step++;
        setChannels(prev => {
          let b = Math.max(5, prev[1].listeners - 2);
          let g = Math.max(5, prev[2].listeners - 2);
          let r = 100 - (b + g);
          
          updateHeadsetGrid([r, b, g]);
          
          return [
            { ...prev[0], listeners: r, trend: 'up' },
            { ...prev[1], listeners: b, trend: 'down' },
            { ...prev[2], listeners: g, trend: 'down' }
          ];
        });

        if (step > 15) {
          clearInterval(takeoverLoop);
          setAiSuggestion('ALERT TO BLUE/GREEN DJs: Transition to vocal anthems. Red (House) is dominating.');
          addLog('AI', 'Mass channel migration detected -> Red Channel (DJ Crimson).');
          addLog('ACTION', 'Auto-syncing ambient DMX lighting to Red Channel BPM.');
        }
      }, 200);
    }
  };

  const resetTelemetry = () => {
    setDominantChannel('NONE');
    setAiSuggestion('Awaiting demographic shift...');
    setChannels([
      { id: 'RED', name: 'DJ Crimson (House)', color: 'bg-red-500', listeners: 33, trend: 'stable' },
      { id: 'BLUE', name: 'DJ Cobalt (Dubstep)', color: 'bg-blue-500', listeners: 34, trend: 'stable' },
      { id: 'GREEN', name: 'DJ Emerald (Disco)', color: 'bg-green-500', listeners: 33, trend: 'stable' }
    ]);
    updateHeadsetGrid([33, 34, 33]);
    addLog('SYS', 'Telemetry reset to baseline distribution.');
  };

  const toggleTelemetry = () => {
    if (!telemetryActive) {
      setTelemetryActive(true);
      addLog('SYS', 'RF Telemetry Receiver Armed. Tracking user engagement.');
    } else {
      setTelemetryActive(false);
      resetTelemetry();
      setHeadsets(Array(100).fill('bg-slate-700'));
      addLog('WARN', 'Telemetry offline. Relying on visual headcount.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Analytics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Audience Engagement Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Driven Silent Disco <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Channel Optimizer</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            In a silent disco, three DJs compete simultaneously. Historically, organizers have no concrete analytics on which DJ is winning, and DJs can't tell if the crowd is actually listening to their channel or just dancing to someone else's beat. Eventra solves this by ingesting live RF telemetry from the wireless headsets. The dashboard tracks exactly which channel every attendee is listening to, visualizing churn rates. When the AI detects a massive migration to a single channel, it automatically suggests track adjustments to the losing DJs and syncs the tent's master lighting rig to the dominant DJ's tempo.
          </p>

          <div className="bg-[#0f0a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">📊</span> Live RF Channel Distribution
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleTelemetry}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     telemetryActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {telemetryActive ? 'Disconnect RF Receiver' : 'Engage Telemetry Feed'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Channel Stats */}
               {channels.map(channel => (
                 <div key={channel.id} className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                   dominantChannel === channel.id ? `${channel.color.replace('bg-', 'bg-').replace('500', '950/40')} ${channel.color.replace('bg-', 'border-').replace('500', '500/50')} shadow-inner` :
                   telemetryActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800 opacity-50'
                 }`}>
                   <div className="flex items-center space-x-2 mb-2">
                     <div className={`w-3 h-3 rounded-full ${telemetryActive ? channel.color : 'bg-slate-700'} ${dominantChannel === channel.id ? 'animate-pulse shadow-[0_0_10px_currentColor]' : ''}`}></div>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{channel.name}</span>
                   </div>
                   
                   <div className="flex items-end">
                     <span className={`text-3xl font-black font-mono leading-none ${telemetryActive ? 'text-white' : 'text-slate-600'}`}>
                       {telemetryActive ? channel.listeners : '--'}
                     </span>
                     <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                     
                     {/* Trend Indicator */}
                     {telemetryActive && (
                       <span className={`ml-auto text-[14px] ${
                         channel.trend === 'up' ? 'text-green-500' : 
                         channel.trend === 'down' ? 'text-red-500' : 'text-slate-500'
                       }`}>
                         {channel.trend === 'up' ? '↑' : channel.trend === 'down' ? '↓' : '-'}
                       </span>
                     )}
                   </div>
                 </div>
               ))}

             </div>
             
             {/* AI Suggestion Banner */}
             <div className={`w-full p-3 rounded-lg border flex items-center justify-between mb-4 transition-all duration-300 ${
                dominantChannel !== 'NONE' ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                'bg-slate-900 border-slate-800 text-slate-500'
             }`}>
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center">
                  <span className="mr-2 text-[14px]">🤖</span> AI ADVISORY:
                </span>
                <span className="text-[10px] font-mono">{telemetryActive ? aiSuggestion : 'SYSTEM OFFLINE'}</span>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#040206] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>RF Telemetry & Action Log</span>
                 {dominantChannel !== 'NONE' && <span className="text-indigo-400 animate-pulse">Syncing Master Lighting</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' : 
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
            
            {/* Silent Disco Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">TENT OVERHEAD POV</span>
                <span className="text-[8px] font-mono text-slate-400">HEADSET DISTRIBUTION</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-6 pt-12">
                
                {/* Simulated Ambient Lighting syncing to dominant channel */}
                <div className={`absolute inset-0 z-0 opacity-20 transition-colors duration-1000 ${
                  dominantChannel === 'RED' ? 'bg-red-500' :
                  dominantChannel === 'BLUE' ? 'bg-blue-500' :
                  dominantChannel === 'GREEN' ? 'bg-green-500' : 'bg-transparent'
                }`}></div>

                {/* DJ Booths (Top) */}
                <div className="flex justify-between w-full max-w-[280px] mb-8 z-10">
                   <div className="flex flex-col items-center">
                     <div className={`w-12 h-6 border-b-4 ${dominantChannel === 'RED' ? 'border-red-500 shadow-[0_10px_20px_rgba(239,68,68,0.3)]' : 'border-slate-700'}`}></div>
                     <span className="text-[8px] font-black text-slate-500 mt-2">CH 1 (RED)</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className={`w-12 h-6 border-b-4 ${dominantChannel === 'BLUE' ? 'border-blue-500 shadow-[0_10px_20px_rgba(59,130,246,0.3)]' : 'border-slate-700'}`}></div>
                     <span className="text-[8px] font-black text-slate-500 mt-2">CH 2 (BLUE)</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className={`w-12 h-6 border-b-4 ${dominantChannel === 'GREEN' ? 'border-green-500 shadow-[0_10px_20px_rgba(34,197,94,0.3)]' : 'border-slate-700'}`}></div>
                     <span className="text-[8px] font-black text-slate-500 mt-2">CH 3 (GRN)</span>
                   </div>
                </div>

                {/* Headset Dot Grid (Simulating 100 people) */}
                <div className="grid grid-cols-10 gap-2 w-full max-w-[240px] z-10">
                   {headsets.map((color, idx) => (
                     <div 
                       key={idx} 
                       className={`w-3 h-3 rounded-full transition-colors duration-500 ${color} ${telemetryActive && color !== 'bg-slate-700' ? `shadow-[0_0_8px_currentColor]` : ''}`}
                       style={{
                         // Subtle bobbing animation based on channel to simulate dancing
                         animation: telemetryActive && color !== 'bg-slate-700' ? `bob ${
                           color.includes('red') ? '0.5s' : 
                           color.includes('blue') ? '0.4s' : '0.6s'
                         } infinite alternate ease-in-out` : 'none',
                         animationDelay: `${Math.random()}s`
                       }}
                     ></div>
                   ))}
                   <style>{`
                     @keyframes bob {
                       from { transform: translateY(0px) scale(1); }
                       to { transform: translateY(-3px) scale(1.1); }
                     }
                   `}</style>
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-3 gap-2">
              <button 
                onClick={triggerRedTakeover}
                disabled={!telemetryActive || dominantChannel === 'RED'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !telemetryActive || dominantChannel === 'RED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Red Takeover
              </button>
              
              <button 
                onClick={triggerBlueTakeover}
                disabled={!telemetryActive || dominantChannel === 'BLUE'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !telemetryActive || dominantChannel === 'BLUE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-blue-950/40 border-blue-900 text-blue-500 hover:bg-blue-900/60'
                }`}
              >
                Inject Blue Takeover
              </button>
              
              <button 
                onClick={resetTelemetry}
                disabled={!telemetryActive || dominantChannel === 'NONE'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !telemetryActive || dominantChannel === 'NONE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Demographics
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SilentDiscoOptimizer;
