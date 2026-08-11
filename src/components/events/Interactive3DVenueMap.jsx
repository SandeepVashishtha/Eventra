import React, { useState, useEffect } from 'react';

const Interactive3DVenueMap = () => {
  const [loading, setLoading] = useState(true);
  const [mapRendered, setMapRendered] = useState(false);

  useEffect(() => {
    // Simulate loading spatial data and 3D engine
    const timer = setTimeout(() => {
      setLoading(false);
      setMapRendered(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🗺️</span> Interactive 3D Venue Map
          </h2>
          <p className="text-sm text-gray-500 mt-1">Real-time crowd density tracking via BLE Beacons</p>
        </div>
        <div className="flex space-x-3 text-sm">
          <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span> Crowded</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span> Moderate</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Clear</div>
        </div>
      </div>

      <div className="relative w-full aspect-[21/9] bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-800 shadow-inner group">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-mono text-sm animate-pulse">Initializing WebGL Engine...</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900 overflow-hidden">
            {/* Simulated 3D isometric map view */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rotate-x-60 -rotate-z-45 transition-transform duration-1000 group-hover:scale-105">
              
              {/* Floor Plan Base */}
              <div className="absolute inset-20 border border-gray-700 bg-gray-800 opacity-50"></div>
              
              {/* Main Hall - Crowded */}
              <div className="absolute top-[20%] left-[20%] w-[40%] h-[30%] bg-gray-700 border-l-4 border-b-4 border-gray-600 shadow-[10px_10px_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-red-500 opacity-40 blur-xl animate-pulse"></div>
                <div className="absolute -top-8 left-4 text-white text-xs font-bold transform rotate-z-45 -rotate-x-60">Hall A (98% Cap)</div>
              </div>

              {/* Startup Alley - Moderate */}
              <div className="absolute top-[60%] left-[20%] w-[30%] h-[20%] bg-gray-700 border-l-4 border-b-4 border-gray-600 shadow-[10px_10px_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-yellow-400 opacity-30 blur-lg"></div>
                <div className="absolute -top-8 left-4 text-white text-xs font-bold transform rotate-z-45 -rotate-x-60">Startup Alley</div>
              </div>

              {/* Networking Lounge - Clear */}
              <div className="absolute top-[20%] right-[20%] w-[20%] h-[60%] bg-gray-700 border-l-4 border-b-4 border-gray-600 shadow-[10px_10px_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-green-500 opacity-20 blur-md"></div>
                <div className="absolute -top-8 left-4 text-white text-xs font-bold transform rotate-z-45 -rotate-x-60">Lounge</div>
              </div>
            </div>

            {/* UI Overlay Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold backdrop-blur">+</button>
              <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold backdrop-blur">-</button>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-gray-700">
              <p className="text-white text-xs font-mono mb-1">Live Data Stream</p>
              <div className="flex items-center text-red-400 text-sm font-bold">
                ⚠️ Bottleneck detected at Hall A North Exit
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <p className="text-gray-500">Attendees can use this map in the mobile app to find the fastest routes.</p>
        <button className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition">
          Deploy Staff to Hall A
        </button>
      </div>
    </div>
  );
};

export default Interactive3DVenueMap;
