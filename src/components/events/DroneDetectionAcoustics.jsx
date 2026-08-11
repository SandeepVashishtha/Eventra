/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DroneDetectionAcoustics = () => {
  const [fftActive, setFftActive] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  
  const [frequencies, setFrequencies] = useState(Array(20).fill(10));
  const [droneDb, setDroneDb] = useState(0);

  const [pilotLocation, setPilotLocation] = useState(null);

  const [audioLog, setAudioLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'PA Microphone Arrays initialized. FFT sweeping for ultra-high frequencies.' }
  ]);

  useEffect(() => {
    let loop;
    if (fftActive) {
      loop = setInterval(() => {
        // Generate generic crowd/music frequency noise (mostly low/mids)
        if (!anomalyDetected) {
          setFrequencies(Array(20).fill(0).map((_, i) => {
            if (i < 5) return 60 + Math.random() * 40; // Bass
            if (i < 12) return 30 + Math.random() * 30; // Mids
            return 10 + Math.random() * 15; // Highs
          }));
        } else {
          // Drone signature (massive spike in very specific high-frequencies)
          setFrequencies(Array(20).fill(0).map((_, i) => {
            if (i === 17 || i === 18) return 90 + Math.random() * 10; // The 6kHz-8kHz drone whine
            if (i < 5) return 60 + Math.random() * 40; // Bass still pumping
            return 15 + Math.random() * 15;
          }));
          
          setDroneDb(prev => Math.min(100, prev + 5));
        }
      }, 100);
    }
    return () => clearInterval(loop);
  }, [fftActive, anomalyDetected]);

  const triggerDrone = () => {
    if (!fftActive) {
      setFftActive(true);
      addLog('FFT', 'Scanning PA mic array input streams...');
    } else if (!anomalyDetected) {
      setAnomalyDetected(true);
      addLog('WARN', 'HIGH-FREQUENCY ANOMALY DETECTED (7.2 kHz). Propeller signature matched.');
      
      setTimeout(() => {
        addLog('MATCH', 'Acoustic fingerprint matched to: DJI Mavic 3 Pro.');
        
        setTimeout(() => {
          addLog('GEO', 'Triangulating pilot location via mic delay-timing...');
          
          setTimeout(() => {
            setPilotLocation({ sector: 'SECTOR 4', lot: 'Parking Lot C', lat: '34.0522 N', lng: '118.2437 W' });
            addLog('ACTION', 'Pilot triangulated. Dispatching security team to Parking Lot C.');
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  const resetSystem = () => {
    setFftActive(false);
    setAnomalyDetected(false);
    setPilotLocation(null);
    setDroneDb(0);
    setFrequencies(Array(20).fill(10));
    addLog('SYS', 'System reset. Awaiting FFT scan.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setAudioLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-yellow-900/50 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Acoustic Engineering
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Acoustic Fingerprinting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Drone Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Unauthorized consumer drones flying over crowds at night pose a massive safety risk (lacerations from falling) and violate artist broadcasting rights. Visually scanning the sky is impossible in the dark. Eventra utilizes the venue's existing PA microphone arrays to listen for the specific high-frequency acoustic signature of drone propellers using real-time Fast Fourier Transform (FFT) analysis. It then triangulates the signal to pinpoint the pilot's location.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-yellow-500 text-lg mr-2">🎛️</span> FFT Audio Spectrum Analyzer
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSystem}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md border border-slate-700 hover:bg-slate-800 text-slate-400"
                 >
                   Reset
                 </button>
                 <button 
                   onClick={!anomalyDetected ? triggerDrone : undefined}
                   disabled={anomalyDetected && !!pilotLocation}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     anomalyDetected && !!pilotLocation ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' :
                     'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                   }`}
                 >
                   {!fftActive ? 'Engage Mic Arrays' : !anomalyDetected ? 'Simulate Drone Intrusion' : 'Triangulating...'}
                 </button>
               </div>
             </div>

             {/* Live FFT Visualizer */}
             <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6 relative overflow-hidden h-32 flex items-end justify-between px-2">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
               
               {anomalyDetected && (
                 <div className="absolute top-2 right-2 bg-red-900/50 text-red-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-red-500 animate-pulse">
                   7.2kHz Spike Detected
                 </div>
               )}

               {frequencies.map((val, i) => (
                 <div 
                   key={i}
                   className={`w-4 rounded-t-sm transition-all duration-75 relative z-10 ${
                     i >= 17 && anomalyDetected ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-cyan-500'
                   }`}
                   style={{ height: `${val}%` }}
                 ></div>
               ))}
               
               {/* Axis labels */}
               <div className="absolute bottom-0 inset-x-0 h-4 bg-black/50 backdrop-blur-sm flex justify-between px-2 items-center text-[8px] text-slate-500 font-mono">
                 <span>20Hz (Sub)</span>
                 <span>1kHz</span>
                 <span>10kHz (Air)</span>
               </div>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Acoustic Processing Log</span>
                 {fftActive && !anomalyDetected && <span className="text-cyan-400 animate-pulse">Listening...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {audioLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'MATCH' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'GEO' ? 'text-cyan-400' :
                       log.type === 'ACTION' ? 'text-yellow-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Drone Radar Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-lg border-8 border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-black/80 border-b border-slate-800">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                Triangulation Radar
              </span>
              <span className="text-[10px] font-mono text-cyan-500">
                MIC_ARRAY_4
              </span>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
               
               {/* Radar Rings Background */}
               <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                 <div className="w-80 h-80 border border-slate-800 rounded-full"></div>
                 <div className="absolute w-60 h-60 border border-slate-800 rounded-full"></div>
                 <div className="absolute w-40 h-40 border border-slate-800 rounded-full"></div>
                 <div className="absolute w-20 h-20 border border-slate-800 rounded-full"></div>
                 
                 {/* Sweeping line */}
                 {fftActive && (
                   <div className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-cyan-500 origin-left animate-spin" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}></div>
                 )}
               </div>
               
               <div className="absolute z-10 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                 <span className="absolute -bottom-4 text-[8px] font-bold text-white uppercase tracking-widest">Stage</span>
               </div>

               {/* Drone Blip */}
               {anomalyDetected && (
                 <div className="absolute z-20 flex flex-col items-center top-[25%] right-[25%] animate-fade-in">
                   <div className="relative">
                     <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
                     <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] relative z-10"></div>
                   </div>
                   <span className="text-[8px] font-black text-red-400 bg-black/80 px-1 mt-1 rounded uppercase tracking-widest border border-red-900">
                     Target
                   </span>
                 </div>
               )}
               
               {/* Triangulation vectors */}
               {pilotLocation && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-fade-in">
                   {/* Line from stage to drone */}
                   <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="rgba(239,68,68,0.5)" strokeWidth="1" strokeDasharray="2 2" />
                   {/* Line from drone to pilot (Lot C is top left) */}
                   <line x1="75%" y1="25%" x2="20%" y2="15%" stroke="rgba(234,179,8,0.8)" strokeWidth="2" strokeDasharray="4 4" />
                   
                   {/* Pilot Location Blip */}
                   <circle cx="20%" cy="15%" r="4" fill="#eab308" />
                 </svg>
               )}

               {/* Result Overlay */}
               {pilotLocation && (
                 <div className="absolute bottom-6 inset-x-4 bg-black/90 border border-yellow-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-fade-in-up z-30">
                   <div className="flex items-center mb-3">
                     <span className="text-2xl mr-3">👤</span>
                     <div>
                       <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-none mb-1">Pilot Triangulated</p>
                       <p className="text-sm font-black text-white">{pilotLocation.lot}</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
                     <div>
                       <p className="text-[8px] text-slate-500 font-bold uppercase">Coordinates</p>
                       <p className="text-[10px] font-mono text-cyan-400">{pilotLocation.lat}, {pilotLocation.lng}</p>
                     </div>
                     <div>
                       <p className="text-[8px] text-slate-500 font-bold uppercase">Drone Model</p>
                       <p className="text-[10px] font-bold text-white">DJI Mavic 3 Pro</p>
                     </div>
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

export default DroneDetectionAcoustics;
