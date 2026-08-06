/* eslint-disable */
import React, { useState, useEffect } from 'react';

const HapticVestIntegration = () => {
  const [streamActive, setStreamActive] = useState(false);
  const [vestsConnected, setVestsConnected] = useState(42);
  
  // Audio Telemetry
  const [lowFreq, setLowFreq] = useState(0); // 20-80 Hz
  const [midFreq, setMidFreq] = useState(0); // 80-400 Hz
  const [highFreq, setHighFreq] = useState(0); // 400+ Hz
  
  // Vest Actuator States
  const [subPackActive, setSubPackActive] = useState(false); // Lower back/chest (heavy bass)
  const [ribPackActive, setRibPackActive] = useState(false); // Ribs (mids/snares)
  const [shoulderPackActive, setShoulderPackActive] = useState(false); // Shoulders (highs/hi-hats)

  const [systemLog, setSystemLog] = useState([
    { time: '14:20:00', msg: 'FOH Audio Interface online. Awaiting OSC stream.' }
  ]);

  useEffect(() => {
    let audioLoop;
    if (streamActive) {
      audioLoop = setInterval(() => {
        // Simulate a live EDM track's frequency response
        const newLow = Math.random() * 100;
        const newMid = Math.random() * 70;
        const newHigh = Math.random() * 50;
        
        setLowFreq(newLow);
        setMidFreq(newMid);
        setHighFreq(newHigh);
        
        // Map frequencies to vest actuators with thresholds
        setSubPackActive(newLow > 60);
        setRibPackActive(newMid > 40);
        setShoulderPackActive(newHigh > 30);
        
        // Log massive bass drops
        if (newLow > 95) {
          addLog('BASS DROP DETECTED (20-40Hz). Max amplitude sent to Sub-Packs.');
        }
        
      }, 150); // Fast interval for realtime feel
    } else {
      // Reset
      setLowFreq(0);
      setMidFreq(0);
      setHighFreq(0);
      setSubPackActive(false);
      setRibPackActive(false);
      setShoulderPackActive(false);
    }
    
    return () => clearInterval(audioLoop);
  }, [streamActive]);

  const toggleStream = () => {
    if (!streamActive) {
      addLog('Connecting to FOH mixing console...');
      setTimeout(() => {
        addLog(`Transmitting low-latency Bluetooth LE stream to ${vestsConnected} ADA vests.`);
        setStreamActive(true);
      }, 800);
    } else {
      addLog('Stream paused. Actuators disengaged.');
      setStreamActive(false);
    }
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSystemLog(prev => [{ time: timeString, msg }, ...prev].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: FOH Audio Engine (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦻</span> Accessible Audio Tech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Accessibility <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Vest Integration</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Deaf and hard-of-hearing attendees cannot experience the physical sensation of live music at EDM or rock festivals. Eventra solves this by building an API bridge between the Front-of-House (FOH) mixing console and wearable haptic vests. The system processes the audio frequencies in real-time and transmits them wirelessly via Bluetooth LE, allowing deaf attendees to physically feel the precise rhythm and drops of the music.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> DSP Audio Engine
               </h3>
               
               <button 
                 onClick={toggleStream}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   streamActive ? 'bg-purple-900/50 text-purple-400 border border-purple-500/50 hover:bg-purple-900' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                 }`}
               >
                 {streamActive && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 animate-pulse"></span>}
                 {streamActive ? 'Transmitting to Vests' : 'Start FOH Audio Stream'}
               </button>
             </div>

             <div className="space-y-4 mb-6">
               
               {/* Low Freq Analyzer */}
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 relative overflow-hidden group">
                 {/* Visualizer Bar */}
                 <div className="absolute left-0 inset-y-0 opacity-20 bg-purple-500 transition-all duration-75 ease-out" style={{ width: `${lowFreq}%` }}></div>
                 
                 <div className="flex justify-between items-center relative z-10">
                   <div>
                     <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Sub-Bass (20-80 Hz)</span>
                     <span className="text-xs font-mono text-purple-400 font-bold">Target: Sub-Packs</span>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-white font-mono leading-none">
                       {lowFreq.toFixed(0)}<span className="text-sm text-neutral-500"> dB</span>
                     </span>
                   </div>
                 </div>
               </div>

               {/* Mid Freq Analyzer */}
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 relative overflow-hidden group">
                 <div className="absolute left-0 inset-y-0 opacity-20 bg-fuchsia-500 transition-all duration-75 ease-out" style={{ width: `${midFreq}%` }}></div>
                 
                 <div className="flex justify-between items-center relative z-10">
                   <div>
                     <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Mid-Range (80-400 Hz)</span>
                     <span className="text-xs font-mono text-fuchsia-400 font-bold">Target: Rib Actuators</span>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-black text-white font-mono leading-none">
                       {midFreq.toFixed(0)}<span className="text-sm text-neutral-500"> dB</span>
                     </span>
                   </div>
                 </div>
               </div>
               
               {/* High Freq Analyzer */}
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 relative overflow-hidden group">
                 <div className="absolute left-0 inset-y-0 opacity-20 bg-pink-500 transition-all duration-75 ease-out" style={{ width: `${highFreq}%` }}></div>
                 
                 <div className="flex justify-between items-center relative z-10">
                   <div>
                     <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">High Freq (400+ Hz)</span>
                     <span className="text-xs font-mono text-pink-400 font-bold">Target: Shoulder Pads</span>
                   </div>
                   <div className="text-right">
                     <span className="text-2xl font-black text-white font-mono leading-none">
                       {highFreq.toFixed(0)}<span className="text-sm text-neutral-500"> dB</span>
                     </span>
                   </div>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Bluetooth LE Transmission Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-neutral-400 pr-2 flex flex-col">
                 {systemLog.map((log, i) => (
                   <div key={i} className={`flex items-start animate-fade-in-up ${
                     log.msg.includes('BASS DROP') ? 'text-purple-400 font-bold' : 'text-neutral-300'
                   }`}>
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Vest Simulator Graphic (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-sm bg-neutral-900 rounded-[3rem] border-4 border-neutral-800 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans p-8">
            
            <div className="text-center mb-8">
               <span className="bg-purple-900/50 text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-500/30 flex items-center justify-center mx-auto w-max mb-3">
                 <span className={`w-2 h-2 rounded-full mr-2 ${streamActive ? 'bg-purple-400 animate-pulse' : 'bg-neutral-600'}`}></span>
                 {streamActive ? 'Vest Linked' : 'Searching for Signal'}
               </span>
               <h2 className="text-white font-black text-xl tracking-wide">HAPTIC VEST SIMULATOR</h2>
               <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Actuator Response Mapping</p>
            </div>

            {/* Vest Graphic Container */}
            <div className="flex-1 relative flex items-center justify-center border border-dashed border-neutral-700 rounded-3xl bg-neutral-950 p-4">
              
              {/* Silhouette */}
              <svg viewBox="0 0 200 300" className="w-full h-full opacity-20 text-white" fill="currentColor">
                 {/* Simplified torso shape */}
                 <path d="M50 40 Q100 20 150 40 L180 80 L180 120 L160 140 L160 280 L40 280 L40 140 L20 120 L20 80 Z" />
              </svg>

              {/* Actuators Overlay */}
              <div className="absolute inset-0">
                
                {/* Shoulder Actuators (Highs) */}
                <div className={`absolute top-[25%] left-[25%] w-8 h-8 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                  shoulderPackActive ? 'bg-pink-500/80 border-pink-400 scale-125 shadow-[0_0_20px_rgba(236,72,153,0.8)]' : 'bg-neutral-800 border-neutral-600 scale-100'
                }`}></div>
                <div className={`absolute top-[25%] right-[25%] w-8 h-8 rounded-full border-2 transform translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                  shoulderPackActive ? 'bg-pink-500/80 border-pink-400 scale-125 shadow-[0_0_20px_rgba(236,72,153,0.8)]' : 'bg-neutral-800 border-neutral-600 scale-100'
                }`}></div>

                {/* Rib Actuators (Mids) */}
                <div className={`absolute top-[50%] left-[30%] w-6 h-16 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                  ribPackActive ? 'bg-fuchsia-500/80 border-fuchsia-400 scale-110 shadow-[0_0_20px_rgba(217,70,239,0.8)]' : 'bg-neutral-800 border-neutral-600 scale-100'
                }`}></div>
                <div className={`absolute top-[50%] right-[30%] w-6 h-16 rounded-full border-2 transform translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                  ribPackActive ? 'bg-fuchsia-500/80 border-fuchsia-400 scale-110 shadow-[0_0_20px_rgba(217,70,239,0.8)]' : 'bg-neutral-800 border-neutral-600 scale-100'
                }`}></div>

                {/* Chest/Sub Pack (Lows/Bass) */}
                <div className={`absolute top-[65%] left-1/2 w-24 h-24 rounded-full border-4 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ${
                  subPackActive ? 'bg-purple-600/90 border-purple-400 scale-[1.3] shadow-[0_0_40px_rgba(168,85,247,1)]' : 'bg-neutral-800 border-neutral-600 scale-100'
                }`}>
                  {/* Inner ring for massive drops */}
                  {lowFreq > 90 && (
                    <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-50"></div>
                  )}
                </div>

              </div>
              
            </div>

            <div className="mt-8 text-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Latency / Sync</p>
               <p className="font-mono text-purple-400 text-lg font-black">{streamActive ? '4.2ms (Ultra-Low)' : '---'}</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HapticVestIntegration;
