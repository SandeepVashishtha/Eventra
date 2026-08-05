import React, { useState } from 'react';

const MultiCameraSelector = () => {
  const [activeCam, setActiveCam] = useState('cam1');
  const [isSwitching, setIsSwitching] = useState(false);

  const cameras = [
    { id: 'cam1', name: 'Main Stage', icon: '🎥', color: 'bg-blue-600', activeBg: 'border-blue-500' },
    { id: 'cam2', name: 'Speaker Close-Up', icon: '👤', color: 'bg-purple-600', activeBg: 'border-purple-500' },
    { id: 'cam3', name: 'Audience View', icon: '🙌', color: 'bg-emerald-600', activeBg: 'border-emerald-500' },
    { id: 'cam4', name: 'Slide Deck HD', icon: '📊', color: 'bg-orange-600', activeBg: 'border-orange-500' }
  ];

  const handleSwitchCam = (id) => {
    if (id === activeCam) return;
    setIsSwitching(true);
    setActiveCam(id);
    
    // Simulate zero-buffering WebRTC switch (very fast)
    setTimeout(() => {
      setIsSwitching(false);
    }, 400);
  };

  const activeCamData = cameras.find(c => c.id === activeCam);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans p-6 text-slate-200">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse">
            Live WebRTC
          </span>
          <h1 className="text-3xl font-black text-white">Multi-Cam Studio</h1>
        </div>
        <p className="text-slate-400 text-sm">You are the director. Toggle between live camera feeds instantly with zero buffering.</p>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Player Area */}
        <div className="lg:col-span-3 bg-black rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
          
          {/* Active Camera Simulation */}
          <div className="flex-1 relative bg-slate-900 flex items-center justify-center transition-all duration-300">
            
            {/* Grid background for technical feel */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {isSwitching ? (
               <div className="z-10 flex flex-col items-center">
                 <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin mb-4"></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Switching Node...</p>
               </div>
            ) : (
              <div className="z-10 text-center animate-fade-in scale-110">
                <span className={`text-6xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]`}>{activeCamData.icon}</span>
                <h2 className="text-2xl font-black text-white mt-4 drop-shadow-lg">{activeCamData.name}</h2>
                <div className="mt-2 flex items-center justify-center space-x-2">
                   <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                   <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Live 1080p 60fps</span>
                </div>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs font-mono font-bold text-white flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Ping: 14ms
            </div>
          </div>
          
          {/* Player Controls (Mockup) */}
          <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4 text-white">
              <button className="hover:text-blue-400 transition">▶</button>
              <button className="hover:text-blue-400 transition">🔊</button>
              <span className="text-xs font-bold font-mono text-slate-400">01:42:05 / LIVE</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="text-xs font-bold border border-slate-700 px-2 py-1 rounded">CC</span>
              <span className="text-xs font-bold">⚙️</span>
              <span className="text-xs font-bold">🔲</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Camera Selection Grid */}
        <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-4 border border-slate-800 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-white px-2 pt-2 uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-3">Available Angles</h3>
          
          <div className="flex-1 flex flex-col space-y-3">
            {cameras.map((cam) => (
              <button 
                key={cam.id}
                onClick={() => handleSwitchCam(cam.id)}
                className={`relative overflow-hidden rounded-2xl h-28 flex flex-col justify-end p-4 text-left transition-all duration-200 border-2 ${activeCam === cam.id ? `border-${cam.activeBg.split('-')[1]}-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]` : 'border-transparent hover:border-slate-700'}`}
              >
                {/* Simulated preview feed background */}
                <div className={`absolute inset-0 opacity-20 ${cam.color}`}></div>
                
                {activeCam === cam.id && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg animate-pulse">
                    Live
                  </div>
                )}
                
                <div className="relative z-10 flex justify-between items-end w-full">
                  <div>
                    <span className="text-2xl block mb-1">{cam.icon}</span>
                    <span className="font-bold text-sm text-white drop-shadow-md">{cam.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mt-auto">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Director's Note</p>
             <p className="text-xs text-slate-300 italic">"Switch to Slides when the speaker refers to the Q3 financial charts."</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MultiCameraSelector;
