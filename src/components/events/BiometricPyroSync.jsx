import React, { useState, useEffect } from 'react';

const BiometricPyroSync = () => {
  const [syncActive, setSyncActive] = useState(false);
  const [averageBpm, setAverageBpm] = useState(85);
  const [excitementThreshold, setExcitementThreshold] = useState(135);
  const [pyroStatus, setPyroStatus] = useState('armed'); // armed, firing, cooling
  
  // Historical data for heart rate graph
  const [history, setHistory] = useState(Array.from({length: 40}, () => 85));

  useEffect(() => {
    let telemetryInterval;
    
    if (syncActive) {
      telemetryInterval = setInterval(() => {
        setAverageBpm(prev => {
          // Simulate dynamic crowd energy
          const change = (Math.random() * 8) - 3; // Bias slightly upwards to build hype
          let newBpm = prev + change;
          if (newBpm > 155) newBpm = 155;
          if (newBpm < 70) newBpm = 70;
          
          setHistory(h => {
            const newHistory = [...h.slice(1), newBpm];
            return newHistory;
          });

          // Check against threshold to trigger pyro
          if (newBpm >= excitementThreshold && pyroStatus === 'armed') {
            triggerPyro();
          }
          
          return newBpm;
        });
      }, 500); // Fast updates for real-time feel
    }
    
    return () => clearInterval(telemetryInterval);
  }, [syncActive, excitementThreshold, pyroStatus]);

  const triggerPyro = () => {
    setPyroStatus('firing');
    
    // Simulate drop in heart rate after the drop/pyro shock
    setTimeout(() => {
      setAverageBpm(110);
      setHistory(h => {
        const newHistory = [...h.slice(1), 110];
        return newHistory;
      });
      setPyroStatus('cooling');
      
      // Cooldown before next possible trigger
      setTimeout(() => {
        setPyroStatus('armed');
      }, 5000);
      
    }, 2000); // 2 seconds of fire
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: VJ Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">❤️‍🔥</span> Biometric Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Emotion Sync for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-rose-600">Stage Pyrotechnics</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Stage visuals and pyrotechnics are traditionally manually triggered, failing to adapt dynamically to the crowd's actual energy. Eventra utilizes aggregate heart-rate data from attendee smartwatches (via Apple HealthKit/Google Fit). When the backend detects the crowd's excitement hitting a statistical peak in real-time, it automatically fires DMX/OSC triggers to launch the pyrotechnics, creating a biometrically-driven concert experience.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 Biometric Trigger Console
               </h3>
               
               <button 
                 onClick={() => {
                   setSyncActive(!syncActive);
                   if(!syncActive) {
                     setAverageBpm(85);
                     setPyroStatus('armed');
                     setHistory(Array.from({length: 40}, () => 85));
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   syncActive ? 'bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-900' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                 }`}
               >
                 {syncActive && <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mr-2 animate-pulse"></span>}
                 {syncActive ? 'Telemetry Sync Active' : 'Arm Biometric Sync'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                 <div>
                   <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Aggregate Crowd BPM</span>
                   <span className={`text-4xl font-black font-mono transition-colors duration-300 ${averageBpm > 120 ? 'text-rose-500' : 'text-fuchsia-400'}`}>
                     {Math.floor(averageBpm)}
                   </span>
                 </div>
                 <div className="text-4xl animate-pulse">❤️</div>
               </div>
               
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">DMX Pyrotechnics Status</span>
                 <div className={`px-3 py-2 rounded text-xs font-black uppercase tracking-widest text-center border ${
                   pyroStatus === 'firing' ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse' :
                   pyroStatus === 'cooling' ? 'bg-sky-900 text-sky-400 border-sky-500' :
                   'bg-emerald-900/50 text-emerald-400 border-emerald-500'
                 }`}>
                   {pyroStatus === 'firing' ? 'FIRING (DMX CH:1-4)' : pyroStatus === 'cooling' ? 'COOLDOWN MODE' : 'ARMED & READY'}
                 </div>
               </div>
             </div>

             {/* Live Heart Rate Graph */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 relative overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Live Telemetry Plot</span>
                 <span className="text-[10px] text-neutral-500 font-mono">Target Threshold: {excitementThreshold} BPM</span>
               </div>
               
               <div className="flex-1 relative flex items-end">
                 
                 {/* Threshold Line */}
                 <div className="absolute inset-x-0 border-t border-dashed border-rose-500/50 z-10" style={{ bottom: \`\${((excitementThreshold - 60) / (160 - 60)) * 100}%\` }}>
                   <span className="absolute right-0 -top-4 text-[8px] text-rose-500 font-mono pr-1">Trigger</span>
                 </div>

                 {/* Render Bars */}
                 <div className="w-full h-full flex items-end space-x-1 z-20">
                   {history.map((bpm, i) => {
                     const heightPercent = Math.max(5, ((bpm - 60) / (160 - 60)) * 100);
                     return (
                       <div 
                         key={i} 
                         className={`flex-1 rounded-t-sm transition-all duration-300 ${bpm >= excitementThreshold ? 'bg-rose-500' : bpm > 110 ? 'bg-fuchsia-400' : 'bg-neutral-600'}`}
                         style={{ height: \`\${heightPercent}%\` }}
                       ></div>
                     )
                   })}
                 </div>

                 {/* Grid lines */}
                 <div className="absolute inset-0 pointer-events-none opacity-20 border-b border-neutral-700" style={{
                   backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                   backgroundSize: '100% 25%'
                 }}></div>
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Stage Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8">
          
          <div className="w-full max-w-[360px] bg-black rounded-[2rem] border-[12px] border-neutral-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* Header */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black to-transparent p-4 flex justify-between items-center z-30 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Main Stage Feed</span>
              <span className="text-[10px] text-fuchsia-400 font-mono border border-fuchsia-500/50 bg-black/50 px-2 py-0.5 rounded">
                DMX LISTENING
              </span>
            </div>

            {/* Stage Canvas */}
            <div className="flex-1 relative flex flex-col justify-end overflow-hidden">
              
              {/* Background crowd image */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-bottom filter contrast-125 brightness-50"></div>
              
              {/* Fake Laser Lights panning around */}
              <div className="absolute bottom-1/4 left-1/4 w-1 h-[200%] bg-sky-500/30 transform origin-bottom -rotate-45 mix-blend-screen filter blur-md animate-[spin_4s_linear_infinite_alternate]"></div>
              <div className="absolute bottom-1/4 right-1/4 w-1 h-[200%] bg-fuchsia-500/30 transform origin-bottom rotate-45 mix-blend-screen filter blur-md animate-[spin_5s_linear_infinite_alternate-reverse]"></div>

              {/* The Pyrotechnics Simulator */}
              {pyroStatus === 'firing' && (
                <div className="absolute inset-0 z-20 flex items-end justify-between px-8 pb-32 pointer-events-none">
                  
                  {/* Fire Column 1 */}
                  <div className="relative flex justify-center">
                    <div className="w-8 h-64 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent filter blur-md animate-bounce opacity-90 rounded-t-full"></div>
                    <div className="absolute bottom-0 w-4 h-48 bg-white filter blur-sm opacity-80 rounded-t-full"></div>
                  </div>
                  
                  {/* Fire Column 2 */}
                  <div className="relative flex justify-center">
                    <div className="w-10 h-80 bg-gradient-to-t from-yellow-400 via-rose-500 to-transparent filter blur-md animate-bounce opacity-90 rounded-t-full" style={{animationDelay: '0.1s'}}></div>
                    <div className="absolute bottom-0 w-6 h-64 bg-white filter blur-sm opacity-80 rounded-t-full"></div>
                  </div>
                  
                  {/* Fire Column 3 */}
                  <div className="relative flex justify-center">
                    <div className="w-8 h-64 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent filter blur-md animate-bounce opacity-90 rounded-t-full" style={{animationDelay: '0.2s'}}></div>
                    <div className="absolute bottom-0 w-4 h-48 bg-white filter blur-sm opacity-80 rounded-t-full"></div>
                  </div>
                  
                  {/* Flash Bang screen overlay */}
                  <div className="absolute inset-0 bg-white mix-blend-overlay animate-pulse opacity-70"></div>
                </div>
              )}

              {/* The DJ Booth (Foreground) */}
              <div className="relative z-30 w-full h-32 bg-black border-t-4 border-neutral-800 flex flex-col items-center justify-center">
                <div className="w-3/4 h-12 bg-neutral-900 border border-neutral-700 rounded-t-lg flex items-center justify-center space-x-2 px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
                  {/* DJ Equipment LEDs */}
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <div className="w-12 h-1 bg-sky-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                </div>
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mt-2">Stage Front</span>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] pointer-events-none z-40"></div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default BiometricPyroSync;
