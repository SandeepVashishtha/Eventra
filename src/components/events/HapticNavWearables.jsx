import React, { useState, useEffect } from 'react';

const HapticNavWearables = () => {
  const [navState, setNavState] = useState('idle'); // idle, calculating, navigating, arrived
  const [distance, setDistance] = useState(0);
  
  // Haptic state for left/right wrists
  const [hapticLeft, setHapticLeft] = useState(false);
  const [hapticRight, setHapticRight] = useState(false);
  
  const [currentInstruction, setCurrentInstruction] = useState('Awaiting Destination');

  const startNavigation = () => {
    setNavState('calculating');
    
    setTimeout(() => {
      setNavState('navigating');
      setDistance(120); // meters
      setCurrentInstruction('Proceed Straight');
      
      // Navigation Simulation Sequence
      let currentDist = 120;
      
      const navSequence = [
        { dist: 100, instr: 'Obstacle Detected: Veering Right', left: false, right: true },
        { dist: 80, instr: 'Path Clear: Proceed Straight', left: false, right: false },
        { dist: 60, instr: 'Turn Left in 5 meters', left: true, right: false },
        { dist: 55, instr: 'Turn Left Now', left: true, right: false, pulse: true },
        { dist: 50, instr: 'Proceed Straight', left: false, right: false },
        { dist: 20, instr: 'Approaching Destination', left: true, right: true },
        { dist: 0, instr: 'You have arrived at Booth 402', left: true, right: true, pulse: true }
      ];
      
      const walkInterval = setInterval(() => {
        currentDist -= 5;
        setDistance(Math.max(0, currentDist));
        
        // Find matching instruction
        const step = navSequence.find(s => s.dist === currentDist);
        if (step) {
          setCurrentInstruction(step.instr);
          
          if (step.pulse) {
            // Pulse pattern
            let pulses = 0;
            const pulseInt = setInterval(() => {
              setHapticLeft(step.left ? (pulses % 2 === 0) : false);
              setHapticRight(step.right ? (pulses % 2 === 0) : false);
              pulses++;
              if (pulses > 5) {
                clearInterval(pulseInt);
                setHapticLeft(false);
                setHapticRight(false);
              }
            }, 200);
          } else {
            // Steady vibration
            setHapticLeft(step.left);
            setHapticRight(step.right);
            
            // Auto off after 2s for steady vibes
            setTimeout(() => {
              setHapticLeft(false);
              setHapticRight(false);
            }, 2000);
          }
        }
        
        if (currentDist <= 0) {
          clearInterval(walkInterval);
          setNavState('arrived');
          setTimeout(() => setNavState('idle'), 5000);
        }
        
      }, 1000);
      
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Master Engine (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦮</span> Hardware Accessibility
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Haptic Feedback <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Navigation Wearables</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Visually impaired attendees struggle to navigate crowded exhibition halls safely, and audio cues are useless in noisy environments. Eventra integrates directly with Bluetooth haptic navigation wristbands. The app calculates indoor routing paths and sends physical left/right vibration pulses to the attendee's wrists, guiding them safely through the crowd without needing to look at a screen.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessibility Telemetry Engine</h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span> BLE PAIRED
               </span>
             </div>

             <div className="grid grid-cols-2 gap-6 flex-1">
               
               <div className="bg-black border border-slate-800 rounded-2xl p-4 flex flex-col">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Live Haptic Payload</span>
                 
                 <div className="flex-1 flex items-center justify-center space-x-6">
                   {/* Left Wrist UI */}
                   <div className="flex flex-col items-center">
                     <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-75 ${
                       hapticLeft ? 'border-teal-400 bg-teal-900/40 shadow-[0_0_25px_rgba(45,212,191,0.5)] scale-110' : 'border-slate-700 bg-slate-800 scale-100'
                     }`}>
                       <span className="text-xl">L</span>
                     </div>
                     <span className={`text-[10px] font-bold mt-3 uppercase tracking-widest ${hapticLeft ? 'text-teal-400' : 'text-slate-600'}`}>
                       Left Motor
                     </span>
                   </div>
                   
                   {/* Right Wrist UI */}
                   <div className="flex flex-col items-center">
                     <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-75 ${
                       hapticRight ? 'border-emerald-400 bg-emerald-900/40 shadow-[0_0_25px_rgba(52,211,153,0.5)] scale-110' : 'border-slate-700 bg-slate-800 scale-100'
                     }`}>
                       <span className="text-xl">R</span>
                     </div>
                     <span className={`text-[10px] font-bold mt-3 uppercase tracking-widest ${hapticRight ? 'text-emerald-400' : 'text-slate-600'}`}>
                       Right Motor
                     </span>
                   </div>
                 </div>
               </div>

               <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-[10px] flex flex-col overflow-hidden">
                 <span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-widest block mb-2 border-b border-slate-800 pb-2">Bluetooth LE Log</span>
                 
                 <div className="flex-1 overflow-y-auto space-y-1 mt-2 text-slate-400">
                   {navState === 'idle' && (
                     <p>Awaiting destination input...</p>
                   )}
                   {navState === 'calculating' && (
                     <div className="text-sky-400">
                       <p>&gt; Target: Booth 402</p>
                       <p>&gt; Calculating indoor mesh route...</p>
                       <p>&gt; Establishing BLE connection to wristbands...</p>
                     </div>
                   )}
                   {navState === 'navigating' && (
                     <div className="text-teal-400 font-bold space-y-2">
                       <p>&gt; Route Locked. Navigation Active.</p>
                       <p className="bg-slate-900 p-2 border border-slate-800 rounded mt-2">
                         Distance: {distance}m
                         <br/>Cmd: {currentInstruction}
                       </p>
                     </div>
                   )}
                   {navState === 'arrived' && (
                     <div className="text-emerald-400 font-bold">
                       <p>&gt; DESTINATION REACHED.</p>
                       <p>&gt; Terminating BLE session.</p>
                     </div>
                   )}
                 </div>
               </div>

             </div>

          </div>
        </div>

        {/* Right Side: Mobile Voice App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden text-white">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-900 to-black p-6">
              
              <div className="flex-1 flex flex-col items-center justify-center">
                
                {navState === 'idle' ? (
                  <div className="text-center w-full animate-fade-in">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-slate-700 shadow-lg">
                      <span className="text-4xl">🎙️</span>
                    </div>
                    <h2 className="text-2xl font-black mb-2">Voice Command</h2>
                    <p className="text-slate-400 text-sm mb-12">"Take me to Booth 402"</p>
                    
                    <button 
                      onClick={startNavigation}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-xl text-lg uppercase tracking-widest transition shadow-[0_0_20px_rgba(13,148,136,0.4)]"
                    >
                      Start Guidance
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center animate-fade-in pt-8">
                    
                    <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-10 transition-all duration-300 ${
                      navState === 'arrived' ? 'bg-emerald-500/20 border-8 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' :
                      (hapticLeft || hapticRight) ? 'bg-teal-500/20 border-8 border-teal-400 shadow-[0_0_50px_rgba(45,212,191,0.5)] scale-110' :
                      'bg-slate-800 border-8 border-slate-700'
                    }`}>
                      <span className="text-6xl">
                        {navState === 'arrived' ? '📍' : 
                         hapticLeft ? '⬅️' : 
                         hapticRight ? '➡️' : '⬆️'}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black text-center mb-2 leading-tight px-4">{currentInstruction}</h3>
                    
                    {navState === 'navigating' && (
                      <span className="text-teal-400 font-mono text-xl font-bold bg-teal-900/30 px-4 py-2 rounded-full border border-teal-500/30 mt-4">
                        {distance}m
                      </span>
                    )}
                    
                  </div>
                )}
                
              </div>
              
              {/* Bottom Nav Bar indicating accessibility mode */}
              <div className="bg-slate-900 py-4 px-6 rounded-2xl flex justify-between items-center border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accessibility Mode</span>
                <span className="text-teal-400 text-sm">On</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HapticNavWearables;
