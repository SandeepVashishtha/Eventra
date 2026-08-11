/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DecibelComplianceReporter = () => {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [systemState, setSystemState] = useState('NOMINAL'); // NOMINAL, WARNING, COMPRESSION_ACTIVE
  
  // Audio Metrics
  const legalLimit = 85.0; // dB(A) at property line
  const [currentLeq, setCurrentLeq] = useState(76.5); // 15-minute Leq average
  const [instantSPL, setInstantSPL] = useState(78.2); // Instantaneous Sound Pressure Level
  const [gainReduction, setGainReduction] = useState(0); // dB of compression applied
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'IoT perimeter microphones calibrated and online.' },
    { id: 2, time: '22:00:02', type: 'SYS', msg: 'City Ordinance Legal Limit set to 85.0 dB(A) Leq.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (monitoringActive && systemState === 'NOMINAL') {
      loop = setInterval(() => {
        const jitter = Math.random() * 3 - 1.5;
        setInstantSPL(prev => Math.min(82, Math.max(74, prev + jitter)));
        setCurrentLeq(prev => prev + (instantSPL - prev) * 0.05); // Slow moving average
      }, 500);
    } else if (systemState === 'WARNING') {
      loop = setInterval(() => {
        // FOH pushing the volume
        setInstantSPL(prev => Math.min(95, prev + 2));
        setCurrentLeq(prev => prev + (instantSPL - prev) * 0.1); 
        
        if (currentLeq >= legalLimit - 0.5) {
          setSystemState('COMPRESSION_ACTIVE');
          addLog('CRIT', `LEGAL LIMIT BREACH IMMINENT. Current Leq: ${currentLeq.toFixed(1)} dB(A).`);
          
          setTimeout(() => {
            addLog('ACTION', 'ENGAGING DSP MASTER BUSS COMPRESSOR.');
            setGainReduction(-4.5);
            addLog('WEB3', 'Cryptographically signing 15-min compliance log to IPFS.');
          }, 500);
        }
      }, 500);
    } else if (systemState === 'COMPRESSION_ACTIVE') {
       loop = setInterval(() => {
         // DSP is clamping the audio
         setInstantSPL(prev => Math.max(legalLimit - 2, prev - 1));
         setCurrentLeq(prev => Math.max(legalLimit - 1.5, prev - 0.1));
         setGainReduction(prev => Math.min(0, prev + 0.1));
       }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [monitoringActive, systemState, currentLeq, instantSPL]);

  const pushVolume = () => {
    if (monitoringActive && systemState === 'NOMINAL') {
      setSystemState('WARNING');
      addLog('WARN', 'FOH Engineer bypassed local limits. Perimeter SPL spiking rapidly.');
    }
  };

  const resetCompliance = () => {
    setSystemState('NOMINAL');
    setCurrentLeq(76.5);
    setInstantSPL(78.2);
    setGainReduction(0);
    addLog('SYS', 'FOH output normalized. Master compressor disengaged. Compliance maintained.');
  };

  const toggleMonitoring = () => {
    if (!monitoringActive) {
      setMonitoringActive(true);
      addLog('SYS', 'Automated Compliance Reporting active. DSP intercepts armed.');
    } else {
      setMonitoringActive(false);
      resetCompliance();
      addLog('WARN', 'Compliance monitoring offline. Venue vulnerable to city citations.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#000a12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Audio & Compliance Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚖️</span> Acoustic Compliance Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Decibel Cap <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Compliance Reporter</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            City ordinances strictly fine festivals thousands of dollars if they breach a specific decibel limit at the property line, but organizers often only find out when the police arrive with a citation. Eventra deploys IoT decibel meters exactly at the property perimeter to log the continuous 15-minute Leq. If the Front of House (FOH) engineer pushes the volume within a margin of the legal limit, the system automatically ducks the DSP master output compressor and generates an immutable, cryptographically signed compliance report for the city council.
          </p>

          <div className="bg-[#05111c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎙️</span> Perimeter Telemetry & DSP
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMonitoring}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     monitoringActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {monitoringActive ? 'Disable Compliance Engine' : 'Arm IoT Microphones'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Current Leq (15 min average) */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemState === 'COMPRESSION_ACTIVE' ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 systemState === 'WARNING' ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' :
                 monitoringActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   15-Min Leq Average
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemState === 'COMPRESSION_ACTIVE' ? 'text-red-500' :
                     systemState === 'WARNING' ? 'text-yellow-400' :
                     monitoringActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {monitoringActive ? currentLeq.toFixed(1) : '---'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB(A)</span>
                 </div>
               </div>

               {/* Legal Limit Threshold */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 monitoringActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Legal Hard Cap
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     monitoringActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {legalLimit.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB(A)</span>
                 </div>
               </div>

               {/* DSP Gain Reduction */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 gainReduction < 0 ? 'bg-indigo-950/60 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DSP Gain Reduction
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     gainReduction < 0 ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {gainReduction < 0 ? gainReduction.toFixed(1) : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dB</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#01060b] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Compliance & Encryption Log</span>
                 {systemState === 'WARNING' && <span className="text-yellow-400 animate-pulse">Monitoring Spike...</span>}
                 {systemState === 'COMPRESSION_ACTIVE' && <span className="text-indigo-400 animate-pulse">Compressing Audio...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
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
            
            {/* DSP Analyzer Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[280px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">DSP MASTER BUSS</span>
                <span className="text-[8px] font-mono text-slate-400">COMPLIANCE COMPRESSOR</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-end justify-center pt-10 pb-4 px-6">
                
                {/* Y-Axis dB Labels */}
                <div className="absolute left-2 inset-y-0 pt-10 pb-4 flex flex-col justify-between text-[8px] font-mono text-slate-600">
                  <span>95</span>
                  <span className="text-red-400">85 (LGL)</span>
                  <span>75</span>
                  <span>65</span>
                  <span>55</span>
                </div>

                {/* Legal Limit Threshold Line */}
                <div className="absolute top-[35%] left-0 w-full h-0.5 bg-red-500/50 border-t border-red-400 border-dashed z-10 shadow-[0_0_10px_#ef4444]"></div>
                
                {/* Audio Visualizer Bars */}
                <div className="w-full h-full flex items-end justify-between space-x-1 pl-6 z-20">
                  {Array.from({ length: 16 }).map((_, idx) => {
                     // Simulate dynamic audio bars based on instantSPL
                     const heightPercentage = monitoringActive ? ((instantSPL - 55) / 40) * 100 : 5;
                     const randomFactor = monitoringActive ? Math.random() * 20 - 10 : 0;
                     const finalHeight = Math.max(5, Math.min(100, heightPercentage + randomFactor));
                     
                     const isClipping = finalHeight > 75; // Approaching/passing legal limit line
                     
                     return (
                      <div 
                        key={idx} 
                        className={`w-full rounded-t-sm transition-all duration-[50ms] ${
                          isClipping ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                          systemState === 'COMPRESSION_ACTIVE' ? 'bg-indigo-500' : 'bg-blue-500'
                        }`}
                        style={{ height: `${finalHeight}%` }}
                      ></div>
                    );
                  })}
                </div>

                {/* Gain Reduction Meter Overlay (Top Right) */}
                <div className="absolute top-10 right-4 w-6 h-32 bg-black border border-slate-700 rounded-sm flex items-start justify-center overflow-hidden z-30">
                  <div 
                    className="w-full bg-indigo-500 transition-all duration-100 ease-out"
                    style={{ height: `${Math.abs(gainReduction) * 15}%` }} // Scale GR for visibility
                  ></div>
                  <span className="absolute bottom-1 text-[7px] font-bold text-slate-500">GR</span>
                </div>

              </div>
            </div>

            {/* Smart Contract / IPFS Receipt */}
            <div className={`w-full bg-slate-900 border ${systemState === 'COMPRESSION_ACTIVE' ? 'border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'border-slate-800'} rounded-xl p-4 mb-6 transition-all duration-300`}>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Immutable Compliance Log</span>
                 <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${systemState === 'COMPRESSION_ACTIVE' ? 'bg-fuchsia-900/40 text-fuchsia-400' : 'bg-slate-800 text-slate-500'}`}>IPFS HASH</span>
              </div>
              <div className="font-mono text-[9px] text-slate-400 break-all bg-black p-2 rounded border border-slate-800">
                {systemState === 'COMPRESSION_ACTIVE' ? 
                  'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG' : 
                  'Awaiting automated compression event...'}
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={pushVolume}
                disabled={!monitoringActive || systemState !== 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !monitoringActive || systemState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                FOH Pushes Volume Limit
              </button>
              
              <button 
                onClick={resetCompliance}
                disabled={systemState === 'NOMINAL'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  systemState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-blue-950/40 border-blue-900 text-blue-500 hover:bg-blue-900/60'
                }`}
              >
                Normalize Master Buss
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DecibelComplianceReporter;
