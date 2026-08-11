import React, { useState } from 'react';

const CrisisGeofenceBroadcast = () => {
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [phonesAlerted, setPhonesAlerted] = useState(0);
  const [activePolygon, setActivePolygon] = useState(false);
  
  const targetAudience = 8450; // Devices inside geofence

  const drawGeofence = () => {
    setActivePolygon(true);
  };

  const triggerEmergencyBroadcast = () => {
    if (!activePolygon) return;
    
    setBroadcasting(true);
    setBroadcastProgress(0);
    setPhonesAlerted(0);
    
    let progress = 0;
    let alerts = 0;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 2;
      alerts += Math.floor(Math.random() * 800) + 200;
      
      if (progress >= 100) {
        progress = 100;
        alerts = targetAudience;
        clearInterval(interval);
      }
      
      setBroadcastProgress(progress);
      setPhonesAlerted(Math.min(alerts, targetAudience));
    }, 200);
  };

  const resetSystem = () => {
    setBroadcasting(false);
    setBroadcastProgress(0);
    setPhonesAlerted(0);
    setActivePolygon(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-rose-900 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-rose-900/50 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full animate-pulse">
                Critical Life-Safety Protocol
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Geofenced Emergency Broadcast</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Standard push notifications are easily ignored or sent to off-site attendees. In an active threat or severe weather crisis, organizers can draw a polygon over the venue map to instantly trigger an un-mutable, blaring siren override specifically to devices physically inside the danger zone.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Map Command Center (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 z-20 absolute top-0 inset-x-0 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Tactical Map View</h3>
              
              {!activePolygon ? (
                <button 
                  onClick={drawGeofence}
                  className="bg-white hover:bg-slate-200 text-black text-xs font-bold px-4 py-2 rounded shadow transition"
                >
                  Draw Evacuation Polygon
                </button>
              ) : (
                <span className="bg-rose-900/50 text-rose-400 text-[10px] font-black uppercase px-3 py-1.5 rounded border border-rose-500/50">
                  Main Stage Danger Zone Locked
                </span>
              )}
            </div>

            {/* Simulated Satellite Map */}
            <div className="flex-1 relative bg-black pt-[73px]">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter grayscale contrast-125 opacity-40"></div>
                
                {/* Fake crowd heatmaps */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-500/30 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-rose-500/40 rounded-full blur-3xl"></div>
              </div>

              {/* Drawn Geofence Polygon */}
              {activePolygon && (
                <div className="absolute inset-0 z-10 flex items-center justify-center animate-fade-in pointer-events-none">
                  {/* SVG Polygon overlaying the "Main Stage" */}
                  <svg width="100%" height="100%" className="absolute inset-0" style={{ mixBlendMode: 'screen' }}>
                    <polygon 
                      points="200,100 600,150 700,450 300,500 150,300" 
                      fill={broadcasting ? "rgba(225, 29, 72, 0.4)" : "rgba(244, 63, 94, 0.2)"} 
                      stroke="#f43f5e" 
                      strokeWidth="4" 
                      strokeDasharray={broadcasting ? "" : "10,10"}
                      className={broadcasting ? "animate-[pulse_0.5s_ease-in-out_infinite]" : ""}
                    />
                  </svg>
                  
                  <div className="absolute top-[40%] left-[45%] text-center">
                    <span className="text-4xl block mb-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">⚠️</span>
                    <span className="bg-rose-600 text-white font-black uppercase text-xs tracking-widest px-2 py-1 rounded shadow-lg">Target: {targetAudience} Devices</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Console */}
            <div className="p-6 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-20">
              
              {!broadcasting && broadcastProgress === 0 ? (
                <button 
                  onClick={triggerEmergencyBroadcast}
                  disabled={!activePolygon}
                  className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-widest transition shadow-2xl ${
                    !activePolygon ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                  }`}
                >
                  Trigger Siren Broadcast
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-rose-500">
                    <span className={broadcastProgress < 100 ? "animate-pulse" : ""}>
                      {broadcastProgress < 100 ? 'Transmitting Siren Override...' : 'Transmission Complete'}
                    </span>
                    <span>{broadcastProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 transition-all duration-200" style={{ width: `${broadcastProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400 font-mono">Payload: SIREN_OVERRIDE_VOL_MAX</span>
                    <span className="text-white font-bold">{phonesAlerted.toLocaleString()} / {targetAudience.toLocaleString()} Phones Alerted</span>
                  </div>
                  
                  {broadcastProgress === 100 && (
                    <button 
                      onClick={resetSystem}
                      className="w-full mt-4 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-bold transition"
                    >
                      Stand Down & Reset
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Right Side: Mobile Device Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          
          {/* Simulated Siren Lights on the surrounding wall */}
          {broadcasting && (
            <div className="absolute inset-0 bg-red-600/10 mix-blend-screen animate-[pulse_0.5s_ease-in-out_infinite] z-0 pointer-events-none rounded-3xl blur-3xl"></div>
          )}

          <div className={`w-full max-w-[360px] rounded-[3rem] border-[12px] shadow-2xl relative flex flex-col h-[700px] overflow-hidden transition-all duration-300 z-10 ${
            broadcasting ? 'border-red-900 bg-red-950 scale-[1.02]' : 'border-slate-800 bg-black'
          }`}>
            
            {/* iOS Header */}
            <div className={`h-10 flex justify-between items-center px-6 text-xs font-bold ${broadcasting ? 'text-red-200 bg-red-950' : 'text-white bg-black'}`}>
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 relative">
              
              {!broadcasting ? (
                // Normal App State
                <div className="absolute inset-0 p-6 flex flex-col">
                  <div className="h-48 bg-slate-900 rounded-2xl mb-4 border border-slate-800"></div>
                  <div className="h-12 bg-slate-900 rounded-xl mb-4 border border-slate-800 w-3/4"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-16 bg-slate-900 rounded-xl border border-slate-800"></div>
                    <div className="h-16 bg-slate-900 rounded-xl border border-slate-800"></div>
                  </div>
                  
                  {/* Fake push notification */}
                  <div className="absolute top-6 left-6 right-6 bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Eventra App</span>
                      <span className="text-[10px] text-slate-500">2m ago</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug">Don't miss the merchandise tent sale! 15% off.</p>
                  </div>
                </div>
              ) : (
                // Emergency Override State
                <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-8 text-center animate-[pulse_1s_ease-in-out_infinite] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
                  
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
                    <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-50"></div>
                    <span className="text-red-600 text-5xl">⚠️</span>
                  </div>
                  
                  <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4 leading-tight">
                    Emergency<br/>Evacuation
                  </h2>
                  
                  <div className="bg-black/50 p-6 rounded-2xl border border-white/20 backdrop-blur-sm mb-8 w-full">
                    <p className="text-white font-bold text-lg mb-2">SEVERE WEATHER APPROACHING</p>
                    <p className="text-red-200 text-sm">Please evacuate the Main Stage area immediately and proceed to indoor shelters.</p>
                  </div>
                  
                  <span className="text-[10px] text-white/70 font-mono uppercase tracking-widest">
                    Volume Overridden to MAX
                  </span>
                  
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CrisisGeofenceBroadcast;
