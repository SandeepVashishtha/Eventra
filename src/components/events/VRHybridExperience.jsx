import React, { useState } from 'react';

const VRHybridExperience = () => {
  const [vrMode, setVrMode] = useState(false);

  return (
    <div className="p-6 bg-black text-white rounded-lg shadow-2xl max-w-4xl mx-auto mt-8 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            VR Immersive Hybrid Stream
          </h2>
          <p className="text-gray-400 text-sm">360-degree stereoscopic feed for Meta Quest / Apple Vision Pro</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setVrMode(false)}
            className={`px-4 py-2 rounded text-sm font-medium ${!vrMode ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Standard 2D
          </button>
          <button 
            onClick={() => setVrMode(true)}
            className={`px-4 py-2 rounded text-sm font-medium flex items-center ${vrMode ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <span className="mr-2">🥽</span> Enter VR Mode
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800">
        {!vrMode ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[url('https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=Standard+1080p+Stream')] bg-cover">
            <div className="absolute bottom-4 left-4 text-xs font-mono bg-black/50 px-2 py-1 rounded">LIVE | 1080p 60fps</div>
          </div>
        ) : (
          <div className="absolute inset-0 flex">
            {/* Left Eye */}
            <div className="w-1/2 h-full bg-[url('https://via.placeholder.com/640x720/0d0d1a/ffffff?text=Left+Eye+Render')] bg-cover border-r border-gray-900 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-50">
                <div className="w-1 h-10 bg-white/30 mb-2"></div>
                <div className="w-10 h-1 bg-white/30"></div>
              </div>
            </div>
            {/* Right Eye */}
            <div className="w-1/2 h-full bg-[url('https://via.placeholder.com/640x720/0d0d1a/ffffff?text=Right+Eye+Render')] bg-cover relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-50">
                <div className="w-1 h-10 bg-white/30 mb-2"></div>
                <div className="w-10 h-1 bg-white/30"></div>
              </div>
            </div>
            
            {/* VR Overlay UI */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur px-6 py-3 rounded-2xl flex items-center space-x-6 border border-gray-700 shadow-2xl">
              <div className="flex flex-col items-center text-gray-300 hover:text-white cursor-pointer">
                <span className="text-xl">🎙️</span>
                <span className="text-[10px] mt-1">Spatial Audio</span>
              </div>
              <div className="flex flex-col items-center text-cyan-400 cursor-pointer">
                <span className="text-xl">👋</span>
                <span className="text-[10px] mt-1">Wave to Avatar</span>
              </div>
              <div className="flex flex-col items-center text-gray-300 hover:text-white cursor-pointer">
                <span className="text-xl">📍</span>
                <span className="text-[10px] mt-1">Change Seat</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VRHybridExperience;
