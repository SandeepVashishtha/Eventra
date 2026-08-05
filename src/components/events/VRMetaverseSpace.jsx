import React, { useState } from 'react';

const VRMetaverseSpace = () => {
  const [vrMode, setVrMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(true);

  const handleEnterVR = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVrMode(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-6 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                WebXR / WebGL Active
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Metaverse Networking Lounge</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">Break free from "Zoom fatigue". Navigate 3D event spaces, interact with sponsor booths, and experience proximity-based spatial audio directly in your browser.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
             <button 
               onClick={() => setSpatialAudioEnabled(!spatialAudioEnabled)}
               className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${spatialAudioEnabled ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
             >
               <span>{spatialAudioEnabled ? '🔊 Spatial Audio: ON' : '🔈 Spatial Audio: OFF'}</span>
             </button>
          </div>
        </div>
      </div>

      {/* Main App Area */}
      <div className="max-w-7xl mx-auto w-full flex-1 relative z-10 flex flex-col items-center justify-center">
        
        {!vrMode ? (
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center relative overflow-hidden group">
            
            {/* Grid floor simulation */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                🥽
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Ready to enter?</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">No downloads required. This experience uses WebXR to render immersive 3D directly in your browser. Compatible with desktop, mobile, and VR headsets.</p>

              <button 
                onClick={handleEnterVR}
                disabled={loading}
                className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)] ${loading ? 'bg-slate-800 text-slate-400 cursor-wait' : 'bg-white text-black hover:bg-slate-200'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-3"></span>
                    Loading Assets...
                  </span>
                ) : (
                  'Enter 3D Lounge'
                )}
              </button>
            </div>
          </div>
        ) : (
          
          /* Simulated 3D Viewport */
          <div className="w-full h-full min-h-[600px] bg-black rounded-[3rem] border-4 border-slate-800 overflow-hidden relative shadow-2xl">
            
            {/* 3D Scene Mockup via CSS Gradients & Transforms */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black overflow-hidden">
              {/* Floor */}
              <div className="absolute bottom-0 w-full h-[60%] bg-[linear-gradient(rgba(168,85,247,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.2)_1px,transparent_1px)] bg-[size:60px_60px] [transform:perspective(500px)_rotateX(75deg)] origin-bottom opacity-60"></div>
              
              {/* Simulated Avatars in 3D Space */}
              <div className="absolute top-[45%] left-[30%] flex flex-col items-center transform scale-75 animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded mb-1 font-bold">@SarahTech</span>
                <div className="w-12 h-20 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                {/* Audio wave simulation */}
                <div className="absolute -left-6 top-6 flex space-x-1 opacity-50">
                   <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                   <div className="w-1 h-5 bg-white rounded-full animate-pulse delay-75"></div>
                   <div className="w-1 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                </div>
              </div>

              <div className="absolute top-[50%] left-[60%] flex flex-col items-center transform scale-90">
                <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded mb-1 font-bold border border-emerald-500/50 text-emerald-400">Sponsor</span>
                <div className="w-16 h-24 bg-emerald-500 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.5)]"></div>
              </div>

              <div className="absolute top-[65%] left-[45%] flex flex-col items-center transform scale-110">
                <div className="w-14 h-24 bg-purple-500 rounded-t-full shadow-[0_0_30px_rgba(168,85,247,0.5)]"></div>
              </div>

              {/* Sponsor Booth in background */}
              <div className="absolute top-[35%] left-[75%] w-32 h-32 border border-blue-500/50 bg-blue-900/20 backdrop-blur-sm flex items-center justify-center transform perspective-500 rotate-y-[-15deg] shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                <span className="font-black text-blue-400">MEGA<br/>CORP</span>
              </div>
            </div>

            {/* Overlays (HUD) */}
            <div className="absolute top-6 left-6 flex space-x-4">
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Location</span>
                <span className="text-white font-bold text-sm">Main Networking Lounge</span>
              </div>
              <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">People Here</span>
                <span className="text-emerald-400 font-bold text-sm">142</span>
              </div>
            </div>

            <div className="absolute top-6 right-6">
               <button onClick={() => setVrMode(false)} className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/40 px-4 py-2 rounded-xl font-bold text-sm transition">
                 Exit 3D Mode
               </button>
            </div>

            {/* Simulated Joystick / Controls */}
            <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full border-2 border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/40 shadow-lg"></div>
            </div>
            
            <div className="absolute bottom-12 right-10 flex space-x-4">
              <button className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-2xl flex items-center justify-center hover:bg-white/10 transition">
                🎤
              </button>
              <button className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-2xl flex items-center justify-center hover:bg-white/10 transition">
                👋
              </button>
            </div>

            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VRMetaverseSpace;
