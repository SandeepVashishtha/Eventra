/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BiometricWristband = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [bandState, setBandState] = useState('LOCKED'); // LOCKED, NOMINAL, STRETCHED, REMOVED
  
  // Hardware Metrics
  const [capacitance, setCapacitance] = useState(0); // pF (picofarads)
  const [pulseRate, setPulseRate] = useState(0); // BPM
  const [skinTemp, setSkinTemp] = useState(0); // Celsius
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '15:00:00', type: 'SYS', msg: 'Smart-Fabric Biometric Auth Node Online.' },
    { id: 2, time: '15:00:02', type: 'SYS', msg: 'Awaiting VIP wristband pairing sequence.' }
  ]);

  // Baseline Signature
  const baseline = {
      capacitance: 450,
      pulse: 75,
      temp: 33.5
  };

  // Visualizer State
  const [waveform, setWaveform] = useState(Array(30).fill(0));
  const [isBricked, setIsBricked] = useState(false);

  useEffect(() => {
    let loop;
    
    if (systemActive && !isBricked) {
      loop = setInterval(() => {
          
          let targetCap = baseline.capacitance;
          let targetPulse = baseline.pulse;
          let targetTemp = baseline.temp;
          
          if (bandState === 'LOCKED') {
              targetCap = 0;
              targetPulse = 0;
              targetTemp = 0;
          } else if (bandState === 'NOMINAL') {
              targetCap = baseline.capacitance + (Math.random() * 10 - 5);
              targetPulse = baseline.pulse + (Math.sin(Date.now() / 1000) * 5);
              targetTemp = baseline.temp + (Math.random() * 0.2 - 0.1);
          } else if (bandState === 'STRETCHED') {
              targetCap = baseline.capacitance - 150; // Loss of contact
              targetPulse = baseline.pulse + 15; // Elevated HR
              targetTemp = baseline.temp - 2; // Air gap cooling
          } else if (bandState === 'REMOVED') {
              targetCap = 12; // Base fabric capacitance
              targetPulse = 0;
              targetTemp = 22; // Ambient room temp
          }

          setCapacitance(prev => prev + (targetCap - prev) * 0.2);
          setPulseRate(prev => prev + (targetPulse - prev) * 0.1);
          setSkinTemp(prev => prev + (targetTemp - prev) * 0.1);

          // EKG Waveform Simulation
          if (bandState !== 'LOCKED' && bandState !== 'REMOVED') {
              setWaveform(prev => {
                  const isBeat = (Date.now() % Math.floor(60000/targetPulse)) < 150;
                  const val = isBeat ? 100 : Math.random() * 10;
                  return [...prev.slice(1), val];
              });
          } else {
              setWaveform(Array(30).fill(0));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, bandState, isBricked]);

  const triggerEvent = (type) => {
    if (!systemActive || isBricked) return;
    
    setBandState(type);
    
    if (type === 'NOMINAL') {
        addLog('ACTION', 'Wristband secured. Logging biometric baseline signature.');
        addLog('SUCCESS', 'Pulse waveform and skin capacitance locked. RFID active.');
    } else if (type === 'STRETCHED') {
        addLog('WARN', 'Capacitive contact loss detected. Probable transfer attempt.');
    } else if (type === 'REMOVED') {
        addLog('CRIT', 'ZERO PULSE DETECTED. Biometric signature broken.');
        addLog('ACTION', 'Cryptographically bricking RFID chip. VIP Access revoked permanently.');
        setIsBricked(true);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setBandState('LOCKED');
      setIsBricked(false);
      addLog('SYS', 'Capacitive sensing grid online. Ready to pair.');
    } else {
      setSystemActive(false);
      setBandState('LOCKED');
      setCapacitance(0);
      setPulseRate(0);
      setSkinTemp(0);
      setWaveform(Array(30).fill(0));
      addLog('WARN', 'Biometric node offline. Wristbands reverting to dumb-RFID.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#090503] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🪡</span> Smart-Fabric Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            RFID VIP Wristbands <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">with Biometric Lock</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees frequently sell their $2,000 VIP wristbands to strangers halfway through the weekend by slipping them off, bypassing security and overcrowding the VIP areas. Eventra fixes this by replacing standard cloth wristbands with smart-fabric bands interwoven with capacitive biometric sensors. When the wristband is first put on, the system logs the user's specific pulse waveform and skin capacitance. If the wristband is stretched, removed, or transferred to another person, the biometric signature breaks, permanently bricking the RFID chip.
          </p>

          <div className="bg-[#120804] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🧬</span> Biometric Auth Node
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Disable Biometrics' : 'Initialize Smart-Fabric Node'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Capacitance */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isBricked ? 'bg-red-950/40 border-red-500/50 shadow-inner' :
                 bandState === 'STRETCHED' ? 'bg-yellow-950/40 border-yellow-500/50' :
                 bandState === 'NOMINAL' ? 'bg-orange-950/20 border-orange-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Skin Capacitance
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     isBricked ? 'text-red-400' :
                     bandState === 'STRETCHED' ? 'text-yellow-400 animate-pulse' :
                     bandState === 'NOMINAL' ? 'text-white' : 'text-slate-600'
                   }`}>
                     {Math.floor(capacitance)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">pF</span>
                 </div>
               </div>

               {/* Pulse */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isBricked ? 'bg-red-950/40 border-red-500/50' :
                 bandState === 'NOMINAL' ? 'bg-amber-950/20 border-amber-900/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Heart Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     isBricked ? 'text-red-400' :
                     bandState === 'NOMINAL' ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {Math.floor(pulseRate)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">BPM</span>
                 </div>
               </div>
               
               {/* Temp */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 isBricked ? 'bg-red-950/40 border-red-500/50' :
                 bandState === 'NOMINAL' ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Surface Temp
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     isBricked ? 'text-red-400' :
                     bandState === 'NOMINAL' ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {skinTemp.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">°C</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Cryptography Log</span>
                 {isBricked && <span className="text-red-500 animate-pulse">CHIP DESTROYED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' :
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
            
            {/* Wristband Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!systemActive ? 'bg-slate-900' : 'bg-[#0a0502]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">HARDWARE STATUS</span>
                <span className="text-[8px] font-mono text-slate-400">SMART-FABRIC RFID</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Background EKG */}
                <div className="absolute inset-x-0 top-1/4 h-24 border-y border-orange-900/30 flex items-center px-4 z-0 opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <polyline 
                            points={waveform.map((val, i) => `${i * 10},${100 - val}`).join(' ')}
                            fill="none" stroke="#f97316" strokeWidth="2" 
                        />
                    </svg>
                </div>

                {!systemActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative">SENSOR ARRAY OFFLINE</span>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                      
                      {/* The Wristband */}
                      <div className={`relative w-48 h-16 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
                          isBricked ? 'bg-slate-800 border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]' :
                          bandState === 'STRETCHED' ? 'bg-[#1a0f05] border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' :
                          bandState === 'NOMINAL' ? 'bg-[#1a0f05] border-2 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]' :
                          'bg-slate-800 border-2 border-slate-700'
                      }`}>
                          
                          {/* Fabric Texture Overlay */}
                          <div className="absolute inset-0 opacity-20 rounded-xl pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxwYXRoIGQ9Ik0wIDBMNCA0TTAgNEw0IDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]"></div>
                          
                          {/* Copper Sensory Threads */}
                          <div className="absolute inset-y-2 left-4 w-2 border-x border-orange-500/30"></div>
                          <div className="absolute inset-y-2 right-4 w-2 border-x border-orange-500/30"></div>

                          {/* Central RFID / Biometric Chip */}
                          <div className={`w-12 h-10 rounded border flex items-center justify-center relative ${
                              isBricked ? 'bg-black border-red-900' : 'bg-black border-slate-700'
                          }`}>
                              {isBricked ? (
                                  <span className="text-xl">💥</span>
                              ) : bandState === 'NOMINAL' ? (
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                              ) : bandState === 'STRETCHED' ? (
                                  <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
                              ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                              )}
                              
                              {/* Glowing auth lines */}
                              {bandState === 'NOMINAL' && !isBricked && (
                                  <>
                                      <div className="absolute top-1/2 -left-16 w-16 h-px bg-gradient-to-r from-transparent to-orange-500"></div>
                                      <div className="absolute top-1/2 -right-16 w-16 h-px bg-gradient-to-l from-transparent to-orange-500"></div>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Status Text HUD */}
                      <div className="mt-8 flex flex-col items-center">
                          {isBricked ? (
                              <>
                                  <span className="text-[14px] font-black uppercase tracking-widest text-red-500 animate-pulse">CHIP BRICKED</span>
                                  <span className="text-[9px] font-mono text-red-400 mt-1">Access Permanently Revoked.</span>
                              </>
                          ) : bandState === 'STRETCHED' ? (
                              <>
                                  <span className="text-[14px] font-black uppercase tracking-widest text-yellow-500">CAPACITANCE DROP</span>
                                  <span className="text-[9px] font-mono text-yellow-400 mt-1">Warning: Do not remove wristband.</span>
                              </>
                          ) : bandState === 'NOMINAL' ? (
                              <>
                                  <span className="text-[14px] font-black uppercase tracking-widest text-emerald-400">BIOMETRICS SECURED</span>
                                  <span className="text-[9px] font-mono text-emerald-600 mt-1">RFID Access Granted.</span>
                              </>
                          ) : (
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6">AWAITING WRISTBAND</span>
                          )}
                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120804] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Tampering Attempts</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => triggerEvent('NOMINAL')}
                   disabled={!systemActive || isBricked || bandState === 'NOMINAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || isBricked || bandState === 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                   }`}
                 >
                   Secure Wristband (Lock Baseline)
                 </button>
                 
                 <button 
                   onClick={() => triggerEvent('STRETCHED')}
                   disabled={!systemActive || isBricked || bandState !== 'NOMINAL'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || isBricked || bandState !== 'NOMINAL' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-yellow-950/40 border-yellow-600 text-yellow-500 hover:bg-yellow-900/60'
                   }`}
                 >
                   Stretch Band (Attempt to slip off)
                 </button>

                 <button 
                   onClick={() => triggerEvent('REMOVED')}
                   disabled={!systemActive || isBricked || bandState !== 'STRETCHED'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !systemActive || isBricked || bandState !== 'STRETCHED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   Remove Band (Transfer to Stranger)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BiometricWristband;
