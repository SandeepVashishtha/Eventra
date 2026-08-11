/* eslint-disable */
import React, { useState, useEffect } from 'react';

const KineticEnergyAnalytics = () => {
  const [harvestingActive, setHarvestingActive] = useState(false);
  const [crowdState, setCrowdState] = useState('AMBIENT'); // AMBIENT, JUMPING, MOSH_PIT
  
  // Energy Metrics
  const [currentWattage, setCurrentWattage] = useState(1.2); // kW
  const [totalEnergyHarvested, setTotalEnergyHarvested] = useState(45.6); // kWh
  const [dieselOffset, setDieselOffset] = useState(3.5); // Gallons saved
  
  // Grid Data for Heatmap
  const [gridData, setGridData] = useState(Array(64).fill(0));
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'Piezoelectric Harvesting Grid (Stage 1) online.' },
    { id: 2, time: '20:15:02', type: 'SYS', msg: 'Routing generated DC power to Stage LED Inverters.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (harvestingActive) {
      loop = setInterval(() => {
        let baseWatts, maxImpact;
        
        if (crowdState === 'AMBIENT') {
          baseWatts = 1.2 + Math.random() * 0.5;
          maxImpact = 20;
        } else if (crowdState === 'JUMPING') {
          baseWatts = 8.5 + Math.random() * 2.5;
          maxImpact = 60;
        } else if (crowdState === 'MOSH_PIT') {
          baseWatts = 15.8 + Math.random() * 4.2;
          maxImpact = 100;
        }
        
        setCurrentWattage(baseWatts);
        setTotalEnergyHarvested(prev => prev + (baseWatts / 3600)); // Simulating kWh accumulation
        setDieselOffset(prev => prev + (baseWatts / 3600) * 0.076); // Approx conversion

        // Generate Heatmap Data
        const newGrid = Array(64).fill(0).map((_, i) => {
          // Create clusters of energy
          if (crowdState === 'MOSH_PIT' && i > 25 && i < 38) return Math.random() * 100; // Center pit
          if (crowdState === 'JUMPING' && i % 8 > 2 && i % 8 < 6) return Math.random() * 60 + 20; // Front rows
          return Math.random() * maxImpact;
        });
        setGridData(newGrid);

      }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [harvestingActive, crowdState]);

  const simulateJump = () => {
    if (harvestingActive && crowdState === 'AMBIENT') {
      setCrowdState('JUMPING');
      addLog('ACTION', 'Crowd synchronized jumping detected (128 BPM).');
      addLog('SYS', 'Kinetic wattage spike: Rerouting excess load to battery banks.');
    }
  };

  const simulatePit = () => {
    if (harvestingActive) {
      setCrowdState('MOSH_PIT');
      addLog('WARN', 'High-impact kinetic anomaly detected (Center Zone).');
      addLog('AI', 'Footfall analytics indicate active Mosh Pit. Generating Hype Metric.');
    }
  };

  const resetCrowd = () => {
    setCrowdState('AMBIENT');
    addLog('SYS', 'Crowd dynamics normalized. Ambient kinetic harvesting resumed.');
  };

  const toggleHarvesting = () => {
    if (!harvestingActive) {
      setHarvestingActive(true);
      addLog('SYS', 'Kinetic Energy Harvesting Grid Armed.');
    } else {
      setHarvestingActive(false);
      setCrowdState('AMBIENT');
      setCurrentWattage(0);
      setGridData(Array(64).fill(0));
      addLog('WARN', 'Harvesting offline. Stage relying 100% on diesel grid.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Helper for heatmap colors
  const getImpactColor = (val) => {
    if (val < 15) return 'bg-slate-900 border-slate-800';
    if (val < 40) return 'bg-emerald-900 border-emerald-700 shadow-[0_0_5px_rgba(16,185,129,0.3)]';
    if (val < 70) return 'bg-yellow-600 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    return 'bg-red-500 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.8)]';
  };

  return (
    <div className="min-h-screen bg-[#05110a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Energy Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Sustainable Energy Grid
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Kinetic Energy Harvesting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-500">Floor Analytics</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals consume massive amounts of diesel generator power, and organizers historically lack granular data on exactly where the crowd is jumping the hardest. Eventra integrates with piezoelectric kinetic floor panels to harvest energy directly from the dancing crowd. The system calculates the real-time wattage generated and routes the power to offset the consumption of the massive LED stage screens. Simultaneously, it uses the precise impact data to map high-energy footfall zones, providing a physical "hype metric" and actionable crowd dynamics data.
          </p>

          <div className="bg-[#0b1a13] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🔋</span> Kinetic Power Distribution
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleHarvesting}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     harvestingActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {harvestingActive ? 'Disconnect Grid' : 'Engage Piezo Array'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Live Wattage */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 crowdState === 'MOSH_PIT' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
                 crowdState === 'JUMPING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 harvestingActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Harvest Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     crowdState === 'MOSH_PIT' ? 'text-red-400' :
                     crowdState === 'JUMPING' ? 'text-yellow-400' :
                     harvestingActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {harvestingActive ? currentWattage.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kW</span>
                 </div>
               </div>

               {/* Total Energy */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 harvestingActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Event Total
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     harvestingActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {totalEnergyHarvested.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kWh</span>
                 </div>
               </div>

               {/* Diesel Offset */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 harvestingActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Diesel Offset
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     harvestingActive ? 'text-lime-400' : 'text-slate-600'
                   }`}>
                     {dieselOffset.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Gal</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020704] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Grid Telemetry Log</span>
                 {crowdState === 'MOSH_PIT' && <span className="text-red-500 animate-pulse">Power Surge!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-500 font-bold' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 
                       log.type === 'AI' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Floor Heatmap Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">FOOTFALL ANALYTICS</span>
                <span className="text-[8px] font-mono text-slate-400">IMPACT HEATMAP</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-end pb-4 pt-10 px-4">
                
                {/* Stage Reference */}
                <div className="w-48 h-6 bg-slate-800 border-t-2 border-emerald-500 rounded-t-lg flex items-center justify-center mb-4 z-20 shadow-[0_-5px_15px_rgba(16,185,129,0.2)]">
                  <span className="text-[8px] font-black text-slate-400 tracking-widest">MAIN STAGE</span>
                </div>

                {/* 8x8 Grid representing Floor Panels */}
                <div className="grid grid-cols-8 gap-1 w-full max-w-[320px] transform perspective-[800px] rotateX-[25deg] z-10">
                  {gridData.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`aspect-square rounded-[2px] transition-all duration-100 border ${getImpactColor(val)}`}
                      style={{
                        transform: val > 60 ? 'translateY(-2px)' : 'none',
                      }}
                    ></div>
                  ))}
                </div>

                {/* Status Overlay */}
                <div className="absolute top-12 right-4 z-20 flex flex-col items-end">
                   {crowdState === 'MOSH_PIT' && (
                     <div className="flex flex-col items-end animate-fade-in-up">
                       <span className="text-[8px] font-black tracking-widest text-red-100 bg-red-600 px-2 py-1 rounded shadow-[0_0_15px_#dc2626]">
                         MOSH PIT DETECTED
                       </span>
                       <span className="text-[7px] font-mono text-red-400 mt-1">DANGER ZONE ISOLATED</span>
                     </div>
                   )}
                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-3 gap-2">
              <button 
                onClick={simulateJump}
                disabled={!harvestingActive || crowdState !== 'AMBIENT'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !harvestingActive || crowdState !== 'AMBIENT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-yellow-950/40 border-yellow-900 text-yellow-500 hover:bg-yellow-900/60'
                }`}
              >
                Sync Jump (128BPM)
              </button>
              
              <button 
                onClick={simulatePit}
                disabled={!harvestingActive}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !harvestingActive ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Mosh Pit
              </button>
              
              <button 
                onClick={resetCrowd}
                disabled={!harvestingActive || crowdState === 'AMBIENT'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition shadow-md border ${
                  !harvestingActive || crowdState === 'AMBIENT' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Dynamics
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default KineticEnergyAnalytics;
