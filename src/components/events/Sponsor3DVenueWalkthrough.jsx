import React, { useState } from 'react';

const Sponsor3DVenueWalkthrough = () => {
  const [activeBooth, setActiveBooth] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // 3d or heatmap

  const booths = [
    { id: 'a1', tier: 'Diamond', price: '$25,000', size: '20x20', traffic: 'High (Est. 12k passes/day)', status: 'Available' },
    { id: 'b4', tier: 'Gold', price: '$10,000', size: '10x20', traffic: 'Medium (Est. 5k passes/day)', status: 'Reserved' },
    { id: 'c2', tier: 'Silver', price: '$4,500', size: '10x10', traffic: 'Medium (Est. 3k passes/day)', status: 'Available' }
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200 flex flex-col md:flex-row gap-6">
      
      {/* 3D Viewer Area */}
      <div className="w-full md:w-2/3 h-[600px] md:h-auto bg-black rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2 bg-slate-800/80 backdrop-blur rounded-lg p-1 border border-slate-600">
          <button 
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded font-bold text-sm transition ${viewMode === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            3D Fly-Through
          </button>
          <button 
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded font-bold text-sm transition ${viewMode === 'heatmap' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Foot Traffic Heatmap
          </button>
        </div>

        {/* 3D Canvas Simulation */}
        <div className="flex-1 relative cursor-crosshair">
          {viewMode === '3d' ? (
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
               <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
               {/* 3D Booth Overlays */}
               <div 
                 onClick={() => setActiveBooth(booths[0])}
                 className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-4 border-emerald-400 bg-emerald-400/20 hover:bg-emerald-400/40 transition flex items-center justify-center backdrop-blur-sm"
                 style={{ perspective: '800px', transform: 'rotateX(60deg) rotateZ(-45deg)' }}
               >
                 <span className="text-white font-black text-2xl transform rotateX(-60deg) rotateZ(45deg)">Diamond A1</span>
               </div>
             </div>
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center grayscale">
              <div className="absolute inset-0 bg-black/60"></div>
              {/* Heatmap Overlays */}
              <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-500 rounded-full blur-[80px] opacity-70 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-orange-500 rounded-full blur-[60px] opacity-60"></div>
              <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-[40px] opacity-50"></div>
              
              <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur px-4 py-3 rounded-lg border border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Simulated Traffic Density</p>
                <div className="w-48 h-3 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600 rounded-full"></div>
                <div className="flex justify-between text-[10px] text-slate-300 mt-1 font-bold">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation UI Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex space-x-6 text-2xl">
            <button className="hover:text-blue-400 transition transform hover:-translate-y-1">⬆️</button>
            <div className="flex space-x-6">
              <button className="hover:text-blue-400 transition transform hover:-translate-x-1">⬅️</button>
              <button className="hover:text-blue-400 transition transform hover:translate-x-1">➡️</button>
            </div>
            <button className="hover:text-blue-400 transition transform hover:translate-y-1">⬇️</button>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full md:w-1/3 flex flex-col space-y-6">
        <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 flex-1">
          <div className="border-b border-slate-700 pb-4 mb-6">
            <h2 className="text-2xl font-black text-white flex items-center">
              <span className="mr-2">🏗️</span> Expo Blueprint 3D
            </h2>
            <p className="text-slate-400 text-sm mt-1">Select a booth on the map to view details.</p>
          </div>

          {!activeBooth ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
              <div className="text-5xl mb-4">📍</div>
              <p className="font-bold">No Booth Selected</p>
              <p className="text-sm">Click an overlay on the 3D map.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${activeBooth.status === 'Available' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'}`}>
                    {activeBooth.status}
                  </span>
                  <h3 className="text-3xl font-black text-white mt-3">Booth {activeBooth.id.toUpperCase()}</h3>
                  <p className="text-blue-400 font-bold">{activeBooth.tier} Tier</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500 uppercase">Pricing</p>
                  <p className="text-2xl font-black text-white">{activeBooth.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dimensions</p>
                  <p className="font-mono text-white text-lg">{activeBooth.size}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Visibility</p>
                  <p className="font-mono text-white text-lg">Main Aisle</p>
                </div>
                <div className="col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Projected Foot Traffic</p>
                  <p className="font-mono text-white text-sm">{activeBooth.traffic}</p>
                </div>
              </div>

              <button 
                disabled={activeBooth.status !== 'Available'}
                className={`w-full py-4 rounded-xl font-black shadow-lg transition text-lg ${activeBooth.status === 'Available' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                {activeBooth.status === 'Available' ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Sponsor3DVenueWalkthrough;
