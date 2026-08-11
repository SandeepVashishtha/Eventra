/* eslint-disable */
import React, { useState, useEffect } from 'react';

const KineticEnergyDashboard = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Power metrics
  const [totalWattage, setTotalWattage] = useState(14500); // Base idle wattage
  const [gridOffset, setGridOffset] = useState(0); // kWh saved
  
  // Stages Data
  const [stages, setStages] = useState([
    { id: 'main', name: 'Main Stage (EDM)', bpm: 128, wattage: 8500, active: true },
    { id: 'neon', name: 'Neon Tent (House)', bpm: 120, wattage: 4200, active: true },
    { id: 'chill', name: 'Chill Room (Ambient)', bpm: 80, wattage: 1800, active: true }
  ]);

  const [powerLog, setPowerLog] = useState([
    { time: '21:00:00', msg: 'Piezoelectric grid initialized across all dancefloors.' }
  ]);

  useEffect(() => {
    let powerInterval;
    if (simulationActive) {
      powerInterval = setInterval(() => {
        setStages(prevStages => {
          let newTotal = 0;
          const updatedStages = prevStages.map(stage => {
            // Fluctuate wattage based on BPM intensity
            const intensityMultiplier = stage.bpm / 100;
            const variance = Math.random() * 500 - 100; // Random fluctuation
            let newWattage = Math.max(500, stage.wattage + (variance * intensityMultiplier));
            
            // Random bass drops spike power massively
            if (Math.random() > 0.95 && stage.id === 'main') {
              newWattage += 3000;
              addLog('MASSIVE KINETIC SPIKE: Bass drop detected at Main Stage! (+3kW)');
            }
            
            newTotal += newWattage;
            return { ...stage, wattage: newWattage };
          });
          
          setTotalWattage(newTotal);
          
          // Accumulate grid offset (Watt-seconds to kWh)
          setGridOffset(prev => prev + (newTotal / 1000 / 3600)); 
          
          return updatedStages;
        });
      }, 1000);
    }
    return () => clearInterval(powerInterval);
  }, [simulationActive]);

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setPowerLog(prev => [{ time: timeString, msg }, ...prev].slice(0, 5));
  };

  const toggleSim = () => {
    if (!simulationActive) {
      addLog('Activating live telemetry from kinetic floor tiles.');
      setSimulationActive(true);
    } else {
      addLog('Telemetry paused.');
      setSimulationActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-green-900/50 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Sustainable Event Tech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic Energy Harvesting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Dancefloor Dashboard</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Mega-festivals consume massive amounts of grid electricity, leading to huge carbon footprints. Eventra solves this by integrating with piezoelectric kinetic dancefloors. As the crowd dances, the floor's compression generates raw electricity. This dashboard tracks the exact wattage generated in real-time, feeding it directly back into the venue's grid to power the stage lighting, while gamifying the experience for attendees.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[460px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-green-500 text-lg mr-2">🔋</span> Piezoelectric Telemetry
               </h3>
               
               <button 
                 onClick={toggleSim}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   simulationActive ? 'bg-slate-800 text-green-500 border border-green-500/50 hover:bg-slate-700' : 'bg-green-600 hover:bg-green-500 text-slate-900 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                 }`}
               >
                 {simulationActive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>}
                 {simulationActive ? 'Live Sync Active' : 'Start Crowd Sim'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center relative overflow-hidden group">
                 {/* Energy Wave Effect */}
                 <div className="absolute bottom-0 inset-x-0 h-1 bg-green-900 overflow-hidden rounded-b-xl">
                   <div className="w-full h-full bg-green-500 animate-[bounce_1s_infinite_alternate]" style={{transform: `scaleX(${Math.min(1, totalWattage/30000)})`, transformOrigin: 'left'}}></div>
                 </div>
                 
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Live Grid Offset</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black text-green-400 font-mono leading-none">
                     {(totalWattage / 1000).toFixed(2)}
                   </span>
                   <span className="text-sm font-bold text-green-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Total Carbon Offset (Cumulative)</span>
                 <span className="text-3xl font-black text-white font-mono">
                   {gridOffset.toFixed(4)}<span className="text-sm text-slate-500"> kWh</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Hardware Integration Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {powerLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.msg.includes('SPIKE') ? 'text-green-400 font-bold' : 'text-slate-300'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Gamification App View (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20 bg-slate-900 border-b border-slate-800">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="p-6 bg-slate-900 text-center relative overflow-hidden">
               {/* Background glow pulse */}
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-2xl rounded-full animate-pulse pointer-events-none"></div>
               
               <h2 className="text-white font-black text-xl tracking-wide relative z-10">KINETIC CLASH</h2>
               <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1 relative z-10">Dance to Power the Festival</p>
            </div>

            {/* Leaderboard Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black flex flex-col">
              
              <div className="text-center mb-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Stage Leaderboard</span>
              </div>
              
              {/* Sort stages by wattage for leaderboard effect */}
              {[...stages].sort((a,b) => b.wattage - a.wattage).map((stage, index) => (
                <div key={stage.id} className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
                  index === 0 ? 'bg-green-900/20 border-green-500/50 scale-[1.02]' : 'bg-slate-900 border-slate-800'
                }`}>
                  
                  {/* Dynamic background bar reflecting power */}
                  <div className={`absolute left-0 inset-y-0 opacity-20 transition-all duration-500 ${
                    index === 0 ? 'bg-green-500' : 'bg-slate-500'
                  }`} style={{ width: `${(stage.wattage / 15000) * 100}%` }}></div>

                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`text-2xl font-black mr-3 ${index === 0 ? 'text-green-400' : 'text-slate-600'}`}>
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{stage.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Tempo: {stage.bpm} BPM</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`block font-mono font-black text-lg ${index === 0 ? 'text-green-400 animate-pulse' : 'text-slate-300'}`}>
                        {(stage.wattage / 1000).toFixed(1)} <span className="text-[10px]">kW</span>
                      </span>
                    </div>
                  </div>
                  
                </div>
              ))}
              
              {/* User Personal Stats */}
              <div className="mt-8 bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center text-xl">👟</div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Your Contribution</h4>
                    <p className="text-[10px] text-slate-400">Currently at Main Stage</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                  <div>
                    <span className="block text-[10px] text-green-500 font-bold uppercase tracking-widest">Steps Transduced</span>
                    <span className="font-mono font-black text-white text-xl">14,204</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-green-500 font-bold uppercase tracking-widest">Est. Impact</span>
                    <span className="font-mono font-bold text-slate-300 text-sm">Powers 1 LED for 2h</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default KineticEnergyDashboard;
