import React, { useState } from 'react';

const HolographicHelpDesk = () => {
  const [kioskState, setKioskState] = useState('standby'); // standby, connecting, active
  const [activeKioskId, setActiveKioskId] = useState(null);
  
  const [kiosks] = useState([
    { id: 'K-01', location: 'North Hall Entrance', status: 'standby' },
    { id: 'K-02', location: 'VIP Lounge Lobby', status: 'standby' },
    { id: 'K-03', location: 'Main Keynote Stage Doors', status: 'standby' }
  ]);

  const simulateAttendeeApproach = (id) => {
    setActiveKioskId(id);
    setKioskState('connecting');
    
    setTimeout(() => {
      setKioskState('active');
    }, 2000);
  };

  const endCall = () => {
    setKioskState('standby');
    setActiveKioskId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Remote Agent Control Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/50 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> WebRTC Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Holographic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Help Desk Concierge</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Information desks are frequently unstaffed, leaving older demographics struggling with generic iPad chatbots. Eventra introduces vertical transparent OLED kiosks scattered around the venue. Utilizing WebRTC, a single remote support agent can "beam in" as a life-sized video projection instantly when an attendee approaches, providing premium face-to-face support.
          </p>

          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Command Center</h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span> STAFF ONLINE
               </span>
             </div>

             <div className="flex-1 grid grid-cols-2 gap-6">
               
               {/* Incoming Feed */}
               <div className="bg-black border border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
                 <div className="p-2 border-b border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   Incoming Attendee Feed
                 </div>
                 <div className="flex-1 relative flex items-center justify-center">
                   {kioskState === 'standby' ? (
                     <span className="text-slate-600 text-xs font-mono">Awaiting Ping...</span>
                   ) : kioskState === 'connecting' ? (
                     <div className="flex flex-col items-center">
                       <div className="w-6 h-6 border-2 border-slate-700 border-t-sky-500 rounded-full animate-spin mb-2"></div>
                       <span className="text-sky-500 text-[10px] font-mono animate-pulse">Establishing WebRTC...</span>
                     </div>
                   ) : (
                     <>
                       {/* Simulated Attendee WebCam */}
                       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                       <div className="absolute top-2 right-2 bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg animate-pulse">
                         LIVE
                       </div>
                     </>
                   )}
                 </div>
               </div>

               {/* Kiosk Fleet Management */}
               <div className="flex flex-col space-y-3">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Venue Kiosk Fleet</span>
                 
                 {kiosks.map(k => (
                   <div key={k.id} className={`p-3 rounded-xl border transition-all ${
                     activeKioskId === k.id ? 'bg-sky-900/20 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-slate-900 border-slate-800'
                   }`}>
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-white font-bold text-xs">{k.id}</span>
                       
                       {activeKioskId === k.id && kioskState === 'active' ? (
                         <span className="text-[9px] bg-sky-500 text-white px-2 py-0.5 rounded font-bold uppercase">Connected</span>
                       ) : (
                         <button 
                           onClick={() => simulateAttendeeApproach(k.id)}
                           disabled={kioskState !== 'standby'}
                           className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded transition ${
                             kioskState !== 'standby' ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-white hover:bg-slate-600'
                           }`}
                         >
                           Simulate Ping
                         </button>
                       )}
                     </div>
                     <span className="text-[10px] text-slate-400 font-mono block">{k.location}</span>
                   </div>
                 ))}

                 {kioskState === 'active' && (
                   <button 
                     onClick={endCall}
                     className="w-full mt-auto bg-rose-600 hover:bg-rose-500 text-white font-black py-2 rounded-lg text-xs uppercase tracking-widest transition"
                   >
                     End Transmission
                   </button>
                 )}
               </div>

             </div>

          </div>
        </div>

        {/* Right Side: Physical OLED Kiosk Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-10">
          
          {/* Floor Stand */}
          <div className="relative">
            
            {/* The Transparent OLED Screen */}
            <div className="w-[300px] h-[600px] bg-slate-900/40 backdrop-blur-sm border-[4px] border-slate-700 rounded-3xl relative flex flex-col items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
              
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>

              {kioskState === 'standby' ? (
                <div className="text-center animate-fade-in flex flex-col items-center p-6">
                  <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center border border-sky-500/50 mb-6 shadow-[0_0_30px_rgba(14,165,233,0.3)] animate-[bounce_3s_infinite]">
                    <span className="text-4xl">👋</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Need Help?</h3>
                  <p className="text-sky-200 text-sm opacity-80">Step closer to speak with a live concierge instantly.</p>
                </div>
              ) : kioskState === 'connecting' ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-slate-500 border-t-sky-400 rounded-full animate-spin mb-4 mx-auto"></div>
                  <span className="text-sky-300 font-mono text-sm tracking-widest uppercase">Beaming Agent...</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black animate-fade-in">
                  {/* Holographic Agent Projection */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-90"></div>
                  
                  {/* Hologram visual effects (scanlines, tint) */}
                  <div className="absolute inset-0 bg-sky-500/20 mix-blend-overlay"></div>
                  <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '100% 4px'
                  }}></div>
                  
                  <div className="absolute bottom-6 inset-x-0 flex justify-center">
                    <span className="bg-black/60 backdrop-blur border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Live Audio / Video
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Base */}
            <div className="w-48 h-8 bg-slate-800 mx-auto rounded-t-lg border-t border-x border-slate-600 mt-2 z-0"></div>
            <div className="w-64 h-4 bg-slate-900 mx-auto rounded-xl z-0 shadow-2xl"></div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default HolographicHelpDesk;
