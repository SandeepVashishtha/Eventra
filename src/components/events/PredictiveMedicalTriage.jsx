/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveMedicalTriage = () => {
  const [aiActive, setAiActive] = useState(false);
  const [triageStatus, setTriageStatus] = useState('NOMINAL'); // NOMINAL, SURGE_PREDICTED, CRITICAL_CAPACITY
  
  // Multivariate Telemetry
  const [ambientTemp, setAmbientTemp] = useState(82); // Fahrenheit
  const [crowdDensity, setCrowdDensity] = useState(45); // %
  const [artistBpm, setArtistBpm] = useState(110); // BPM
  
  // Predictions
  const [predictedCasualties, setPredictedCasualties] = useState(5); // per 30 min
  const [availableBeds, setAvailableBeds] = useState(40);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Multivariate ML Triage Predictor online.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Ingesting live weather, density, and audio BPM telemetry.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (aiActive && triageStatus === 'NOMINAL') {
      loop = setInterval(() => {
        setAmbientTemp(prev => Math.max(75, Math.min(85, prev + (Math.random() * 2 - 1))));
        setPredictedCasualties(Math.floor(ambientTemp / 15 + crowdDensity / 20));
      }, 1500);
    } else if (triageStatus === 'SURGE_PREDICTED') {
      loop = setInterval(() => {
        // Temperature spikes, density spikes, high BPM
        setAmbientTemp(prev => Math.min(104, prev + 2));
        setCrowdDensity(prev => Math.min(98, prev + 3));
        setArtistBpm(150); // Heavy dubstep/hardstyle
        
        const surgePrediction = Math.floor((ambientTemp / 4) + (crowdDensity / 3) + (artistBpm / 10));
        setPredictedCasualties(surgePrediction);
        
        if (surgePrediction > availableBeds - 10) {
          setTriageStatus('CRITICAL_CAPACITY');
          addLog('CRIT', `MASS CASUALTY SURGE PREDICTED IN 30 MINS. (${surgePrediction} est. patients).`);
          
          setTimeout(() => {
            addLog('ACTION', 'Auto-paging Reserve Medics (Team Alpha).');
            addLog('SYS', 'Reallocating 20 cots from Tent B to Tent A (Main Stage).');
            setAvailableBeds(prev => prev + 20); // Medics respond and add beds
          }, 1500);
        }
      }, 800);
    } else if (triageStatus === 'CRITICAL_CAPACITY') {
      loop = setInterval(() => {
        // Stabilizing at high capacity
        setPredictedCasualties(prev => Math.max(25, prev - 0.5));
      }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [aiActive, triageStatus, ambientTemp, crowdDensity, artistBpm, availableBeds]);

  const triggerHeatwave = () => {
    if (aiActive && triageStatus === 'NOMINAL') {
      setTriageStatus('SURGE_PREDICTED');
      addLog('WARN', 'Severe telemetry shift detected: Heatwave + High Density + High BPM.');
      addLog('AI', 'Calculating probability of dehydration/exhaustion cascade...');
    }
  };

  const clearSurge = () => {
    setTriageStatus('NOMINAL');
    setAmbientTemp(82);
    setCrowdDensity(45);
    setArtistBpm(110);
    setAvailableBeds(40);
    setPredictedCasualties(5);
    addLog('SUCCESS', 'Surge averted. Reserve medics stood down. Normalizing triage allocation.');
  };

  const toggleAI = () => {
    if (!aiActive) {
      setAiActive(true);
      addLog('SYS', 'Predictive Medical Triage AI Armed.');
    } else {
      setAiActive(false);
      setTriageStatus('NOMINAL');
      addLog('WARN', 'AI offline. Medics operating purely on reactive walk-ins.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#06110f] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Medical Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚕️</span> Predictive Healthcare Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Medical Tent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Triage Allocation AI</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Medical tents often get unexpectedly overwhelmed with mass dehydration or substance cases, leaving severe injuries without immediate bed space due to a purely reactive triage system. Eventra solves this by feeding real-time telemetry (ambient temperature, crowd density, artist BPM/genre) into a predictive machine learning model. The dashboard alerts medical staff 30 minutes before a predicted surge in casualties, allowing them to dynamically reallocate beds or call in reserve medics before the first patient even arrives.
          </p>

          <div className="bg-[#0f1715] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🧠</span> ML Triage Engine
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleAI}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     aiActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                   }`}
                 >
                   {aiActive ? 'Disable ML Predictor' : 'Engage Telemetry AI'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Telemetry Inputs */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 triageStatus !== 'NOMINAL' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 aiActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Live Multivariate Inputs
                 </span>
                 <div className="flex flex-col text-[10px] font-mono text-slate-400 space-y-1">
                   <div className="flex justify-between border-b border-slate-700 pb-1">
                     <span>Temp (Heat Index):</span>
                     <span className={triageStatus !== 'NOMINAL' ? 'text-red-400 font-bold' : ''}>{Math.floor(ambientTemp)}°F</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-700 pb-1 pt-1">
                     <span>Crowd Density:</span>
                     <span className={triageStatus !== 'NOMINAL' ? 'text-orange-400 font-bold' : ''}>{Math.floor(crowdDensity)}%</span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Stage BPM (Tempo):</span>
                     <span className={triageStatus !== 'NOMINAL' ? 'text-yellow-400 font-bold' : ''}>{artistBpm}</span>
                   </div>
                 </div>
               </div>

               {/* AI Prediction Output */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 triageStatus === 'CRITICAL_CAPACITY' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(225,29,72,0.3)]' :
                 triageStatus === 'SURGE_PREDICTED' ? 'bg-orange-950/40 border-orange-500/50 shadow-inner' :
                 aiActive ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   T+30 Min Prediction
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     triageStatus === 'CRITICAL_CAPACITY' ? 'text-red-500 animate-pulse' :
                     triageStatus === 'SURGE_PREDICTED' ? 'text-orange-400' :
                     aiActive ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {aiActive ? Math.floor(predictedCasualties) : '--'} <span className="text-[12px] text-slate-500">Pts</span>
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest font-mono">
                     {aiActive ? `Capacity: ${availableBeds} Beds` : 'System Offline'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Logistics & Dispatch Log</span>
                 {triageStatus === 'SURGE_PREDICTED' && <span className="text-orange-400 animate-pulse">Modeling Surge...</span>}
                 {triageStatus === 'CRITICAL_CAPACITY' && <span className="text-red-500 animate-pulse">Allocating Reserves!</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' :
                       log.type === 'AI' ? 'text-pink-400 font-bold' : 'text-slate-400'
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
            
            {/* Triage Allocation Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">BED ALLOCATION MAP</span>
                <span className="text-[8px] font-mono text-slate-400">MAIN MEDICAL TENT (ZONE A)</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col items-center justify-center p-6">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-50 z-0"></div>

                <div className="relative w-full h-full pt-8 z-10 flex flex-col justify-between">
                   
                   {/* Bed Grid */}
                   <div className="grid grid-cols-5 gap-2">
                     {/* Generate up to 60 beds visually */}
                     {Array.from({ length: 50 }).map((_, i) => {
                       // Logic to color beds based on prediction and capacity
                       let statusClass = 'border-slate-700 bg-slate-800'; // Empty/Offline
                       
                       if (aiActive) {
                         if (i < 5) {
                           statusClass = 'border-rose-500 bg-rose-900/60 shadow-[0_0_10px_rgba(225,29,72,0.4)]'; // Current Patients
                         } else if (i < predictedCasualties) {
                           statusClass = 'border-orange-500 border-dashed bg-orange-900/20'; // Predicted Needs
                         } else if (i < availableBeds) {
                           statusClass = 'border-emerald-500/50 bg-emerald-900/20'; // Available
                         }
                       }
                       
                       // Highlight newly added reserve beds
                       if (triageStatus === 'CRITICAL_CAPACITY' && i >= 40 && i < availableBeds) {
                         statusClass = 'border-teal-400 bg-teal-900/50 shadow-[0_0_15px_rgba(45,212,191,0.6)] animate-pulse';
                       }

                       return (
                         <div key={i} className={`h-6 rounded border-2 transition-all duration-500 ${statusClass} flex items-center justify-center`}>
                           {statusClass.includes('border-rose-500') && <span className="text-[6px]">🛏️</span>}
                         </div>
                       );
                     })}
                   </div>

                   {/* Legend */}
                   <div className="flex justify-between mt-4 bg-black/60 p-2 rounded border border-slate-700 backdrop-blur-sm">
                     <div className="flex items-center space-x-1">
                       <div className="w-2 h-2 bg-rose-500 rounded-sm"></div>
                       <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase">Occupied</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <div className="w-2 h-2 bg-transparent border border-orange-500 border-dashed rounded-sm"></div>
                       <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase">Predicted Req.</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <div className="w-2 h-2 bg-emerald-900/50 border border-emerald-500/50 rounded-sm"></div>
                       <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase">Available</span>
                     </div>
                   </div>

                </div>

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerHeatwave}
                disabled={!aiActive || triageStatus !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !aiActive || triageStatus !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Heatwave (104°F)
              </button>
              
              <button 
                onClick={clearSurge}
                disabled={triageStatus === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  triageStatus === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-emerald-950/40 border-emerald-900 text-emerald-500 hover:bg-emerald-900/60'
                }`}
              >
                Normalize Telemetry
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveMedicalTriage;
