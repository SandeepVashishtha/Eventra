import React, { useState, useEffect } from 'react';

const NoiseComplianceMonitor = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Acoustic Telemetry State
  const [decibels, setDecibels] = useState(82); // dBA at property line
  const [legalLimit, setLegalLimit] = useState(95); // dBA curfrew limit
  const [subBassLevel, setSubBassLevel] = useState(60); // % of mix
  const [compressionActive, setCompressionActive] = useState(false);
  const [time, setTime] = useState('21:58:00'); // Approaching 10 PM curfew
  
  const [secLog, setSecLog] = useState([
    { time: '21:00:00', type: 'INFO', msg: 'Acoustic monitoring initialized at perimeter fences.' }
  ]);

  useEffect(() => {
    let telemetryInterval;
    
    if (simulationActive) {
      let seconds = 58 * 60; // 21:58
      
      telemetryInterval = setInterval(() => {
        seconds += 15; // Fast forward time by 15s every tick
        
        const hrs = 21 + Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        setTime(\`\${hrs.toString().padStart(2, '0')}:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`);
        
        setDecibels(prev => {
          let newDb = prev + (Math.random() * 3 - 1);
          
          // Crowd/DJ gets hyped near 10 PM
          if (hrs === 21 && mins >= 59) {
             newDb += 2;
             setSubBassLevel(prevB => Math.min(100, prevB + 5));
          }
          
          // 10 PM Curfew hits - limit drops to 85 dBA
          if (hrs === 22 && mins === 0 && secs === 0) {
            setLegalLimit(85);
            addLog('WARN', '22:00 CURFEW ACTIVE. Legal noise limit reduced to 85 dBA.');
          }
          
          // Breach detected
          if (newDb >= (hrs >= 22 ? 85 : 95) && !compressionActive) {
             triggerCompression();
          }
          
          // Apply compression physically if active
          if (compressionActive) {
            newDb -= (Math.random() * 2 + 1); // Slowly bring it down
            if (newDb <= (hrs >= 22 ? 82 : 92)) {
               newDb = (hrs >= 22 ? 82 : 92); // Hold it safely below limit
            }
          }

          return newDb;
        });

      }, 1000); // 1 tick per second
    }
    
    return () => clearInterval(telemetryInterval);
  }, [simulationActive, compressionActive]);

  const triggerCompression = () => {
    setCompressionActive(true);
    addLog('CRITICAL', 'Ordinance breach imminent. Auto-compressing FOH sub-bass via OSC webhook.');
    
    // Simulate bass cut
    setTimeout(() => {
      setSubBassLevel(25); 
      addLog('SUCCESS', 'Sub-bass reduced by 12dB. Overall mix preserved. Legal compliance restored.');
    }, 1500);
  };

  const addLog = (type, msg) => {
    setSecLog(prev => [{ time: new Date().toLocaleTimeString('en-US', { hour12: false }), type, msg }, ...prev].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎚️</span> Acoustic Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Noise Ordinance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Compliance Monitor</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Outdoor festivals constantly get fined tens of thousands of dollars because bass frequencies violate local noise ordinances after 10 PM. Eventra deploys IoT decibel sensors at the venue's legal property line. If the volume nears the legal limit, the system sends an automated OSC webhook directly to the Front-of-House (FOH) mixing console to dynamically compress the sub-bass frequencies without killing the overall mix, saving the organizer from massive fines.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[450px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">📡</span> Perimeter Telemetry
               </h3>
               
               <button 
                 onClick={() => {
                   setSimulationActive(!simulationActive);
                   if(!simulationActive) {
                     setDecibels(82);
                     setLegalLimit(95);
                     setSubBassLevel(60);
                     setCompressionActive(false);
                     setTime('21:58:00');
                     setSecLog([{ time: '21:00:00', type: 'INFO', msg: 'Acoustic monitoring initialized at perimeter fences.' }]);
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   simulationActive ? 'bg-slate-800 text-slate-500' : 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(202,138,4,0.4)]'
                 }`}
               >
                 {simulationActive && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>}
                 {simulationActive ? 'Monitoring Perimeter...' : 'Start 10 PM Curfew Sim'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 decibels >= legalLimit ? 'bg-red-900/20 border-red-500/50 animate-pulse' :
                 decibels >= legalLimit - 5 ? 'bg-yellow-900/20 border-yellow-500/50' :
                 'bg-emerald-900/20 border-emerald-500/30'
               }`}>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Perimeter SPL (A-Weighted)</span>
                   <span className="text-[10px] text-slate-400 font-mono">Limit: {legalLimit} dBA</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${
                     decibels >= legalLimit ? 'bg-red-500' :
                     decibels >= legalLimit - 5 ? 'bg-yellow-500' :
                     'bg-emerald-500'
                   }`}></div>
                   <span className={`text-4xl font-black font-mono tracking-widest ${
                     decibels >= legalLimit ? 'text-red-500' :
                     decibels >= legalLimit - 5 ? 'text-yellow-400' :
                     'text-emerald-400'
                   }`}>{decibels.toFixed(1)}</span>
                   <span className="text-sm font-bold text-slate-500">dBA</span>
                 </div>
               </div>

               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Local System Time</span>
                 <span className={`text-3xl font-black font-mono ${time.startsWith('22') ? 'text-rose-400' : 'text-white'}`}>
                   {time}
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Compliance Action Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {secLog.map((log, i) => (
                   <div key={i} className={`flex justify-between items-start animate-fade-in-up ${
                     log.type === 'CRITICAL' ? 'text-red-400 font-bold' :
                     log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                     log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                   }`}>
                     <div>
                       <span className={`mr-2 ${
                         log.type === 'CRITICAL' ? 'text-red-500' :
                         log.type === 'WARN' ? 'text-yellow-500' :
                         log.type === 'SUCCESS' ? 'text-emerald-500' : 'text-slate-500'
                       }`}>[{log.type}]</span>
                       <span>{log.msg}</span>
                     </div>
                     <span className="text-slate-600 shrink-0">{log.time}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Front of House (FOH) Mixer Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-[2rem] border-[10px] border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden">
            
            {/* Console Header */}
            <div className="p-4 bg-slate-950 flex justify-between items-center border-b-4 border-slate-900 z-10 shadow-lg">
              <div>
                <h2 className="text-white font-black uppercase tracking-widest text-sm">FOH Digital Console</h2>
                <span className="text-[10px] font-mono text-slate-500">OSC / Webhook Listening...</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            </div>

            {/* Mixer UI */}
            <div className="flex-1 bg-slate-900 p-6 flex justify-around">
               
               {/* Fader 1: Main Mix (Unaffected) */}
               <div className="flex flex-col items-center h-full">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 h-8 text-center">Master<br/>Bus</span>
                 
                 <div className="relative h-64 w-8 bg-black border border-slate-700 rounded-md shadow-inner flex justify-center">
                   {/* Track */}
                   <div className="absolute inset-y-2 w-1 bg-slate-800 rounded"></div>
                   
                   {/* Fader Cap */}
                   <div className="absolute w-12 h-6 bg-slate-700 border-b-4 border-slate-900 rounded shadow-lg flex items-center justify-center cursor-not-allowed" style={{ bottom: '70%' }}>
                     <div className="w-8 h-1 bg-white/20"></div>
                   </div>
                 </div>
                 
                 <div className="w-6 h-6 mt-4 rounded border border-slate-700 bg-slate-800"></div>
               </div>

               {/* Fader 2: Vocal Mix (Unaffected) */}
               <div className="flex flex-col items-center h-full">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 h-8 text-center">Lead<br/>Vocal</span>
                 
                 <div className="relative h-64 w-8 bg-black border border-slate-700 rounded-md shadow-inner flex justify-center">
                   <div className="absolute inset-y-2 w-1 bg-slate-800 rounded"></div>
                   <div className="absolute w-12 h-6 bg-slate-700 border-b-4 border-slate-900 rounded shadow-lg flex items-center justify-center cursor-not-allowed" style={{ bottom: '75%' }}>
                     <div className="w-8 h-1 bg-white/20"></div>
                   </div>
                 </div>
                 <div className="w-6 h-6 mt-4 rounded border border-slate-700 bg-slate-800"></div>
               </div>

               {/* Fader 3: Subwoofers (Dynamically Compressed by OSC) */}
               <div className="flex flex-col items-center h-full relative">
                 <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-4 h-8 text-center">Sub<br/>Group</span>
                 
                 {/* Auto-Compression Overlay Alert */}
                 {compressionActive && (
                   <div className="absolute -top-6 whitespace-nowrap bg-red-600 text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg animate-bounce z-20">
                     OSC OVERRIDE
                   </div>
                 )}

                 <div className="relative h-64 w-8 bg-black border border-slate-700 rounded-md shadow-inner flex justify-center">
                   <div className="absolute inset-y-2 w-1 bg-slate-800 rounded"></div>
                   
                   {/* Dynamic Fader Cap */}
                   <div 
                     className={`absolute w-12 h-6 rounded shadow-lg flex items-center justify-center transition-all duration-1000 ease-out z-10 ${
                       compressionActive ? 'bg-red-600 border-b-4 border-red-800 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-yellow-600 border-b-4 border-yellow-800'
                     }`} 
                     style={{ bottom: \`\${subBassLevel}%\` }}
                   >
                     <div className="w-8 h-1 bg-white/50"></div>
                   </div>
                 </div>
                 
                 <div className="w-6 h-6 mt-4 rounded border border-slate-700 bg-yellow-900 flex items-center justify-center">
                   <div className={`w-3 h-3 rounded-full ${compressionActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 </div>
               </div>

            </div>
            
            {/* Warning Banner */}
            <div className={`p-4 transition-colors duration-500 ${compressionActive ? 'bg-red-900' : 'bg-slate-950'}`}>
              <p className="text-[10px] font-mono text-center text-white opacity-50">
                FOH Automated Mitigation Systems {compressionActive ? 'ENGAGED' : 'ARMED'}
              </p>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default NoiseComplianceMonitor;
