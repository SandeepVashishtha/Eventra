import React, { useState, useEffect } from 'react';

const ThermalImagingScanner = () => {
  const [systemState, setSystemState] = useState('standby'); // standby, scanning
  const [totalScanned, setTotalScanned] = useState(14502);
  const [feverDetected, setFeverDetected] = useState(0);
  
  // Simulated people stream
  const [people, setPeople] = useState([]);
  
  const [medicalAlert, setMedicalAlert] = useState(null);

  useEffect(() => {
    let interval;
    if (systemState === 'scanning') {
      interval = setInterval(() => {
        // Generate a new batch of 2-4 people entering the frame
        const newBatch = Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map(() => {
          // 2% chance of fever
          const isFever = Math.random() < 0.02;
          const temp = isFever ? (100.4 + Math.random() * 2) : (97.5 + Math.random() * 1.5);
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random() * 70 + 15, // 15% to 85% width
            y: Math.random() * 40 + 20, // 20% to 60% height
            temp: temp,
            isFever: isFever,
            age: 0 // Age counter for fading out
          };
        });
        
        setPeople(prev => {
          const updated = [...prev, ...newBatch].map(p => ({...p, age: p.age + 1}));
          // Remove old data points
          return updated.filter(p => p.age < 4);
        });
        
        setTotalScanned(prev => prev + newBatch.length);
        
        const feverCases = newBatch.filter(p => p.isFever);
        if (feverCases.length > 0) {
          setFeverDetected(prev => prev + feverCases.length);
          
          // Trigger push notification for the first fever case in the batch
          setMedicalAlert({
            gate: 'Main Entrance A',
            temp: feverCases[0].temp.toFixed(1)
          });
          
          setTimeout(() => setMedicalAlert(null), 4000);
        }
        
      }, 800); // Process every 800ms
    } else {
      setPeople([]);
    }
    
    return () => clearInterval(interval);
  }, [systemState]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Medical Operations Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌡️</span> Hardware Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Thermal Imaging <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Crowd Screening</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Handheld temperature guns cause 3-hour bottlenecks at the front door. Eventra hooks directly into enterprise thermal imaging cameras (e.g., FLIR) mounted at the gates. The engine uses computer vision to track multiple faces simultaneously, passively calculating body temperatures in real-time without slowing down the crowd, quietly flagging high fevers to medical staff.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Ops Dashboard</h3>
               
               <button 
                 onClick={() => setSystemState(systemState === 'scanning' ? 'standby' : 'scanning')}
                 className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center ${
                   systemState === 'scanning' ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                 }`}
               >
                 {systemState === 'scanning' && <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 animate-pulse"></span>}
                 {systemState === 'scanning' ? 'Pause Screening' : 'Engage FLIR Network'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-black p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                 <div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Throughput (Scanned)</span>
                   <span className="text-2xl font-black text-white font-mono">{totalScanned.toLocaleString()}</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                   👥
                 </div>
               </div>
               
               <div className={`p-4 rounded-xl border transition-colors duration-500 flex justify-between items-center ${
                 feverDetected > 0 ? 'bg-rose-900/20 border-rose-500/30' : 'bg-black border-slate-800'
               }`}>
                 <div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Elevated Temps Detected</span>
                   <span className={`text-2xl font-black font-mono ${feverDetected > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                     {feverDetected}
                   </span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                   🚨
                 </div>
               </div>
             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative">
               <span className="text-slate-500 uppercase font-bold tracking-widest text-[10px] block mb-2 border-b border-slate-800 pb-2">Thermal Array Log</span>
               
               <div className="space-y-1">
                 {systemState === 'standby' ? (
                   <span className="text-slate-600">Cameras offline. Awaiting activation command.</span>
                 ) : (
                   <div className="space-y-1">
                     <p className="text-emerald-400">&gt; FLIR Array [Gates A-D] Online.</p>
                     <p className="text-emerald-400">&gt; Computer Vision Face-Tracking Enabled.</p>
                     
                     {/* Stream of fake logs */}
                     <div className="mt-2 text-slate-400 opacity-80 h-24 overflow-hidden relative flex flex-col justify-end">
                       {people.map(p => (
                         <p key={p.id} className={`transition-opacity ${p.isFever ? 'text-rose-400 font-bold' : ''}`}>
                           &gt; Target [{p.id}] processed. Core Temp: {p.temp.toFixed(1)}°F. 
                           {p.isFever ? ' [ALERT]' : ' [PASS]'}
                         </p>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: FLIR Camera Simulation & Mobile App (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="w-full bg-black rounded-[2rem] border-[8px] border-slate-900 shadow-2xl relative flex flex-col aspect-video overflow-hidden">
            
            {/* Camera HUD */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between items-center z-30 pointer-events-none border-b border-white/10">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center bg-black/50 px-2 py-1 rounded">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${systemState === 'scanning' ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`}></span>
                Main Entrance A - Cam 1
              </span>
              <span className="text-[10px] text-orange-400 font-mono bg-black/50 px-2 py-1 rounded">
                IR-THERMAL
              </span>
            </div>

            {/* Video Canvas */}
            <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
              
              {systemState === 'standby' ? (
                <div className="text-slate-700 flex flex-col items-center">
                  <span className="text-5xl mb-4 opacity-50">📷</span>
                  <span className="text-xs font-black uppercase tracking-widest">Feed Offline</span>
                </div>
              ) : (
                <div className="absolute inset-0">
                  {/* Simulate thermal crowd background */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale opacity-40 mix-blend-screen"></div>
                  
                  {/* Fake Thermal Gradient Overlay */}
                  <div className="absolute inset-0 opacity-30" style={{
                    background: 'linear-gradient(45deg, rgba(0,0,255,0.5) 0%, rgba(0,255,0,0.5) 50%, rgba(255,0,0,0.5) 100%)',
                    mixBlendMode: 'color'
                  }}></div>

                  {/* Render Face Tracking Bounding Boxes */}
                  {people.map(p => (
                    <div 
                      key={p.id}
                      className={`absolute border-2 transition-all duration-300 pointer-events-none flex flex-col items-center justify-center ${
                        p.isFever ? 'border-rose-500 w-16 h-16 shadow-[0_0_15px_rgba(225,29,72,0.8)] z-20' : 'border-emerald-500/50 w-12 h-12 z-10'
                      }`}
                      style={{ 
                        left: \`\${p.x}%\`, 
                        top: \`\${p.y}%\`,
                        transform: 'translate(-50%, -50%)',
                        opacity: p.age > 2 ? 0 : 1 // fade out
                      }}
                    >
                      {/* Crosshairs */}
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 border-t border-l transform -translate-x-1/2 -translate-y-1/2"></div>
                      
                      {/* Temp Tag */}
                      <span className={`absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-black font-mono whitespace-nowrap px-1 rounded ${
                        p.isFever ? 'bg-rose-500 text-white animate-pulse' : 'bg-black/70 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.temp.toFixed(1)}°F
                      </span>
                    </div>
                  ))}
                  
                  {/* UI Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '33.33% 33.33%'
                  }}></div>
                </div>
              )}
            </div>
            
            {/* Color Scale Legend */}
            <div className="h-4 bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 to-red-600 relative z-20">
               <span className="absolute left-1 top-4 text-[8px] font-bold text-white">96.0°F</span>
               <span className="absolute right-1 top-4 text-[8px] font-bold text-white">104.0°F</span>
            </div>

          </div>
          
        </div>

        {/* Floating OS-Level Medical Alert (Simulating staff mobile app) */}
        {medicalAlert && (
          <div className="absolute bottom-8 right-8 z-50 w-full max-w-sm animate-fade-in-up">
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-rose-500/50 flex items-start space-x-3">
              <div className="bg-rose-500/20 p-2 rounded-lg text-rose-500 text-xl border border-rose-500/30">
                🚨
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">Medical Dispatched</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                </div>
                <p className="text-slate-300 text-xs mb-2">
                  High temperature detected (<span className="text-rose-400 font-bold">{medicalAlert.temp}°F</span>).
                </p>
                <div className="bg-black/50 rounded p-2 text-[10px] text-slate-300 font-mono border border-slate-700">
                  LOC: {medicalAlert.gate} • Cam 1 <br/>
                  Action: Staff quietly intercepting for secondary screening.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ThermalImagingScanner;
