import React, { useState } from 'react';

const DynamicBandwidthEngine = () => {
  const [userLocation, setUserLocation] = useState('remote'); // 'remote' or 'venue'

  // Simulated metrics
  const venueIPBlock = '192.168.1.x';
  const remoteIP = '203.0.113.42';
  
  const bandwidthStats = {
    remote: {
      resolution: '1080p60',
      bitrate: '6.5 Mbps',
      color: 'bg-emerald-500',
      icon: 'HD',
      status: 'Optimal Stream'
    },
    venue: {
      resolution: '480p30',
      bitrate: '800 kbps',
      color: 'bg-amber-500',
      icon: 'SD',
      status: 'Bandwidth Preserved'
    }
  };

  const activeStats = bandwidthStats[userLocation];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200 p-6 overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 opacity-20 ${userLocation === 'remote' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

      {/* Header */}
      <div className="max-w-6xl mx-auto w-full mb-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-900/50 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Infrastructure / Streaming
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Dynamic Bandwidth Allocator</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Prevent venue WiFi collapse during hybrid events. Automatically detect if a user is on-site via IP blocks and aggressively downscale their video feed to preserve critical network bandwidth.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Controls & Tech Stats (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Simulate Connection</h3>
            
            <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
              <button 
                onClick={() => setUserLocation('remote')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${userLocation === 'remote' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🏠 Remote Attendee
              </button>
              <button 
                onClick={() => setUserLocation('venue')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${userLocation === 'venue' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🏟️ On-Site Attendee
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Client IP Address</span>
                <span className="font-mono text-sm text-blue-400">{userLocation === 'remote' ? remoteIP : venueIPBlock}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Target Resolution</span>
                <span className={`font-mono font-bold text-sm ${activeStats.color.replace('bg-', 'text-')}`}>
                  {activeStats.resolution}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Network Load</span>
                <span className="font-mono text-sm text-white">{activeStats.bitrate}</span>
              </div>
            </div>
            
            {userLocation === 'venue' && (
              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl flex items-start space-x-3 animate-fade-in">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  <strong>Venue IP Detected.</strong> Streaming aggressively downscaled to prevent local WiFi saturation. Audio quality remains intact.
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl flex-1 flex flex-col justify-center text-center">
            <h3 className="text-4xl font-black text-white mb-2">92%</h3>
            <p className="text-sm text-slate-400 font-bold">Estimated Venue Bandwidth Saved</p>
            <div className="mt-4 w-full bg-slate-900 h-2 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: '92%' }}></div>
            </div>
          </div>
          
        </div>

        {/* Right Side: Player Simulation (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full bg-black rounded-3xl border-[8px] border-slate-800 overflow-hidden shadow-2xl relative flex flex-col h-[500px]">
            
            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 p-4 flex justify-between items-start pointer-events-none">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded animate-pulse shadow-lg">
                LIVE
              </span>
              <div className={`px-2 py-1 rounded text-[10px] font-black shadow-lg flex items-center space-x-1 transition-colors ${activeStats.color} text-white`}>
                <span>{activeStats.icon}</span>
                <span>{activeStats.resolution}</span>
              </div>
            </div>

            {/* Video Canvas Simulation */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
               
               {/* High-res background image */}
               <div 
                 className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center transition-all duration-1000 ${userLocation === 'venue' ? 'blur-[8px] contrast-125 saturate-50' : 'blur-none'}`}
               ></div>
               
               {/* 480p Simulation Overlays */}
               {userLocation === 'venue' && (
                 <>
                   {/* Pixelation overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.1)_2px,transparent_2px)] bg-[size:8px_8px] z-10 mix-blend-overlay"></div>
                   {/* Banding/compression artifact simulation */}
                   <div className="absolute inset-0 bg-black/20 z-10 backdrop-contrast-150"></div>
                 </>
               )}

               <div className="relative z-20 text-center bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl">
                 <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Main Stage Keynote</h2>
                 <p className="text-slate-300 font-bold mb-4">{activeStats.status}</p>
                 <div className="flex justify-center">
                   <div className="flex items-end space-x-1 h-8">
                     <div className="w-1.5 bg-emerald-400 rounded-t animate-[bounce_1s_infinite_100ms]"></div>
                     <div className="w-1.5 bg-emerald-400 rounded-t animate-[bounce_1s_infinite_200ms]"></div>
                     <div className="w-1.5 bg-emerald-400 rounded-t animate-[bounce_1s_infinite_300ms]"></div>
                     <div className="w-1.5 bg-emerald-400 rounded-t animate-[bounce_1s_infinite_400ms]"></div>
                     <div className="w-1.5 bg-emerald-400 rounded-t animate-[bounce_1s_infinite_500ms]"></div>
                   </div>
                 </div>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 font-bold">Audio Sync: 100%</p>
               </div>
            </div>
            
            {/* Player Controls (Mockup) */}
            <div className="h-16 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between z-20 relative">
              <div className="flex items-center space-x-4 text-slate-300">
                 <span>⏸</span>
                 <span>🔊</span>
                 <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-blue-500"></div>
                 </div>
              </div>
              <div className="flex items-center space-x-4 text-slate-400 font-bold text-xs">
                 <span className="font-mono">Bitrate: {activeStats.bitrate}</span>
                 <span>⚙️</span>
                 <span>🔲</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DynamicBandwidthEngine;
