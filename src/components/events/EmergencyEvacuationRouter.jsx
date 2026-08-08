import React, { useState } from 'react';

const EmergencyEvacuationRouter = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [hazardLocation, setHazardLocation] = useState(null); // 'north', 'south'
  const [broadcasting, setBroadcasting] = useState(false);

  const handleTriggerEmergency = (location) => {
    setHazardLocation(location);
    setEmergencyActive(true);
    setBroadcasting(true);

    setTimeout(() => {
      setBroadcasting(false);
    }, 2000);
  };

  const handleReset = () => {
    setEmergencyActive(false);
    setHazardLocation(null);
    setBroadcasting(false);
  };

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-1000 flex items-center justify-center ${emergencyActive ? 'bg-red-950' : 'bg-slate-900'}`}>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Controls (Col span 5) */}
        <div className="lg:col-span-5 space-y-6 text-slate-200">
          <div className={`inline-block border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${emergencyActive ? 'bg-red-900/80 text-red-300 border-red-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            Venue Safety Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic <br/><span className={emergencyActive ? 'text-red-500' : 'text-slate-400'}>Evacuation Routing</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Standard exit signs lead crowds directly into danger if the hazard is blocking the exit. Our dynamic system calculates safe routes away from the hazard and instantly takes over all venue digital signage and attendee phones.
          </p>
          
          <div className={`p-6 rounded-2xl border transition-all ${emergencyActive ? 'bg-red-900/30 border-red-800' : 'bg-slate-800 border-slate-700'}`}>
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Command Center</h3>
             
             {!emergencyActive ? (
               <div className="space-y-3">
                 <p className="text-xs text-slate-400 font-bold">Simulate Hazard Trigger:</p>
                 <button 
                   onClick={() => handleTriggerEmergency('north')}
                   className="w-full bg-slate-700 hover:bg-red-900 hover:text-red-200 text-white font-bold py-3 rounded-xl transition border border-transparent hover:border-red-700 flex justify-between px-4"
                 >
                   <span>Fire detected at North Exit</span>
                   <span>⚠️</span>
                 </button>
                 <button 
                   onClick={() => handleTriggerEmergency('south')}
                   className="w-full bg-slate-700 hover:bg-red-900 hover:text-red-200 text-white font-bold py-3 rounded-xl transition border border-transparent hover:border-red-700 flex justify-between px-4"
                 >
                   <span>Security Threat at South Lobby</span>
                   <span>🚨</span>
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="flex items-center space-x-3 text-red-500 animate-pulse">
                   <span className="text-2xl">📡</span>
                   <p className="font-bold">Broadcast Active across 142 Screens</p>
                 </div>
                 <button 
                   onClick={handleReset}
                   className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition border border-slate-600"
                 >
                   Clear Emergency Status
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Digital Signage Simulation (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className={`w-full max-w-[600px] h-[350px] rounded-sm flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 ${emergencyActive ? 'border-8 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.4)]' : 'border-[16px] border-slate-950'}`}>
            
            {/* Screen Bezel Branding */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-widest text-slate-700 z-50 opacity-50">
              SAMSUNG
            </div>

            {!emergencyActive ? (
              // Normal Signage View
              <div className="flex-1 bg-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <h2 className="text-4xl font-black text-white mb-2 z-10 tracking-tight">Eventra Summit '26</h2>
                <p className="text-blue-200 font-bold text-lg z-10">Main Expo Hall • Level 1</p>
                <div className="absolute bottom-6 flex space-x-4">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                    <span className="text-white font-bold">Keynote at 10:00 AM ↗</span>
                  </div>
                </div>
              </div>
            ) : (
              // Emergency Takeover View
              <div className="flex-1 bg-red-600 flex flex-col relative overflow-hidden">
                
                {/* Flashing Strobe Effect */}
                <div className="absolute inset-0 bg-white opacity-0 animate-[strobe_1s_infinite]"></div>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes strobe {
                    0%, 50% { opacity: 0; }
                    25% { opacity: 0.3; }
                  }
                  @keyframes slide {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50px); }
                  }
                `}} />

                {broadcasting ? (
                  <div className="flex-1 flex flex-col items-center justify-center z-10 bg-red-700">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">Calculating Safe Route</h3>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col z-10 animate-fade-in">
                    
                    {/* Hazard Warning Banner */}
                    <div className="bg-black text-white text-center py-2 overflow-hidden flex whitespace-nowrap">
                       <div className="animate-[slide_2s_linear_infinite] flex space-x-8 text-xl font-black tracking-widest text-red-500">
                         <span>⚠️ EMERGENCY EVACUATION ⚠️</span>
                         <span>EMERGENCY EVACUATION ⚠️</span>
                         <span>EMERGENCY EVACUATION ⚠️</span>
                       </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-12">
                      
                      {hazardLocation === 'north' ? (
                        // Fire at North (Route South/Right)
                        <div className="w-full flex justify-between items-center">
                          <div className="flex flex-col text-white max-w-[60%]">
                            <span className="text-5xl font-black mb-2 leading-none uppercase">Hazard Ahead</span>
                            <span className="text-xl font-bold bg-black text-white self-start px-3 py-1">Do NOT proceed straight.</span>
                            <span className="text-3xl font-black mt-4">Follow arrows to South Exit ➔</span>
                          </div>
                          <div className="text-[120px] text-white animate-bounce-horizontal">
                            ➔
                          </div>
                        </div>
                      ) : (
                        // Threat at South (Route North/Left)
                        <div className="w-full flex justify-between items-center">
                          <div className="text-[120px] text-white animate-bounce-horizontal-reverse">
                            ←
                          </div>
                          <div className="flex flex-col text-white text-right max-w-[60%]">
                            <span className="text-5xl font-black mb-2 leading-none uppercase">Hazard in Lobby</span>
                            <span className="text-xl font-bold bg-black text-white self-end px-3 py-1">Avoid South Atrium.</span>
                            <span className="text-3xl font-black mt-4">← Turn around to North Exit</span>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s ease-in-out infinite;
        }
        @keyframes bounce-horizontal-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        .animate-bounce-horizontal-reverse {
          animation: bounce-horizontal-reverse 1s ease-in-out infinite;
        }
      `}} />

    </div>
  );
};

export default EmergencyEvacuationRouter;
