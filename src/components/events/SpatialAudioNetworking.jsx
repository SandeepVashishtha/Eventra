import React, { useState, useEffect } from 'react';

const SpatialAudioNetworking = () => {
  const [myPosition, setMyPosition] = useState({ x: 50, y: 50 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Other attendees in the virtual lounge
  const attendees = [
    { id: 1, name: 'Sarah', role: 'Investor', x: 20, y: 30, color: 'bg-emerald-500' },
    { id: 2, name: 'Mike', role: 'Founder', x: 25, y: 35, color: 'bg-blue-500' },
    { id: 3, name: 'Elena', role: 'Designer', x: 80, y: 70, color: 'bg-purple-500' },
    { id: 4, name: 'David', role: 'Engineer', x: 75, y: 75, color: 'bg-orange-500' },
    { id: 5, name: 'Alex', role: 'Marketing', x: 50, y: 15, color: 'bg-pink-500' }
  ];

  // Calculate distance and map to volume (0.0 to 1.0)
  const getVolume = (x1, y1, x2, y2) => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const maxDistance = 35; // Maximum distance to hear someone
    if (distance > maxDistance) return 0;
    return Math.max(0, 1 - (distance / maxDistance));
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMove = () => {
    setMyPosition(mousePos);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context & Volume Readout (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-teal-900/50 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            WebRTC & Web Audio API
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            Spatial Audio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Proximity Chat</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ditch the chaotic, grid-view breakout rooms. In our 2D virtual lounge, audio volume is strictly tied to physical proximity. Walk up to a group to hear them clearly, walk away and they naturally fade out.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Audio Mix</h3>
             
             <div className="space-y-4">
               {attendees.map(a => {
                 const volume = getVolume(myPosition.x, myPosition.y, a.x, a.y);
                 const isActive = volume > 0;
                 return (
                   <div key={a.id} className={`flex items-center space-x-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                     <div className={`w-8 h-8 rounded-full ${a.color} flex items-center justify-center text-white text-xs font-bold shadow-inner`}>
                       {a.name[0]}
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-end mb-1">
                         <span className="text-sm font-bold text-white">{a.name}</span>
                         <span className="text-[10px] font-mono text-teal-400">{Math.round(volume * 100)}%</span>
                       </div>
                       <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-300 ${a.color}`} 
                           style={{ width: `${volume * 100}%` }}
                         ></div>
                       </div>
                     </div>
                     
                     {/* Audio Wave Simulator */}
                     <div className="flex items-end space-x-0.5 h-4 w-6">
                       {isActive ? (
                         <>
                           <div className={`w-1 rounded-t ${a.color} animate-[bounce_1s_infinite_100ms]`} style={{ height: `${volume * 100}%` }}></div>
                           <div className={`w-1 rounded-t ${a.color} animate-[bounce_1s_infinite_200ms]`} style={{ height: `${volume * 80}%` }}></div>
                           <div className={`w-1 rounded-t ${a.color} animate-[bounce_1s_infinite_300ms]`} style={{ height: `${volume * 100}%` }}></div>
                         </>
                       ) : (
                         <div className="w-6 h-0.5 bg-slate-800"></div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
             
             <p className="text-[10px] text-slate-500 mt-6 text-center">Click anywhere on the map to walk.</p>
          </div>
        </div>

        {/* Right Side: 2D Spatial Canvas (Col span 8) */}
        <div className="lg:col-span-8 flex justify-center h-full">
          
          <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
             
             {/* Header */}
             <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-20 relative">
               <h2 className="font-bold text-white">Main Networking Lounge</h2>
               <div className="flex items-center space-x-2">
                 <span className="text-xs text-slate-400">Microphone:</span>
                 <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/30">Active</span>
               </div>
             </div>

             {/* Interactive Canvas Area */}
             <div 
               className="flex-1 relative cursor-crosshair overflow-hidden"
               onMouseMove={handleMouseMove}
               onClick={handleMove}
             >
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {/* Static Attendees */}
                {attendees.map(a => (
                  <div 
                    key={a.id} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
                    style={{ top: `${a.y}%`, left: `${a.x}%` }}
                  >
                    <div className={`w-10 h-10 rounded-full ${a.color} border-2 border-slate-900 flex items-center justify-center text-white font-bold shadow-lg relative`}>
                      {a.name[0]}
                      
                      {/* Talking Indicator (always on for demo) */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[6px]">🗣</span>
                      </div>
                    </div>
                    <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition">
                      <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md">{a.name}</span>
                      <span className="block text-[8px] text-slate-400 uppercase mt-0.5">{a.role}</span>
                    </div>
                  </div>
                ))}

                {/* The "You" Avatar */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30 transition-all duration-700 ease-out"
                  style={{ top: `${myPosition.y}%`, left: `${myPosition.x}%` }}
                >
                  {/* Proximity Radius Indicator (The exact radius where you hear people) */}
                  <div className="absolute w-[280px] h-[280px] rounded-full border border-teal-500/20 bg-teal-500/5 -z-10 animate-[spin_10s_linear_infinite] border-dashed"></div>
                  
                  <div className="w-12 h-12 rounded-full bg-teal-500 border-4 border-slate-900 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(20,184,166,0.4)] relative">
                    You
                  </div>
                  <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md mt-2">Connecting...</span>
                </div>

                {/* Mouse Hover Indicator (Where you will walk) */}
                <div 
                  className="absolute w-4 h-4 rounded-full border-2 border-teal-500/50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 z-20"
                  style={{ top: `${mousePos.y}%`, left: `${mousePos.x}%` }}
                >
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping"></div>
                </div>

             </div>

             {/* Footer Overlay */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 flex space-x-6 z-40">
               <button className="text-slate-400 hover:text-white transition flex flex-col items-center">
                 <span className="text-lg">🎤</span>
                 <span className="text-[8px] uppercase font-bold mt-1">Mute</span>
               </button>
               <button className="text-slate-400 hover:text-white transition flex flex-col items-center">
                 <span className="text-lg">📷</span>
                 <span className="text-[8px] uppercase font-bold mt-1">Camera</span>
               </button>
               <button className="text-slate-400 hover:text-white transition flex flex-col items-center">
                 <span className="text-lg">👋</span>
                 <span className="text-[8px] uppercase font-bold mt-1">Wave</span>
               </button>
             </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SpatialAudioNetworking;
