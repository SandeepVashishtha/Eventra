import React, { useState } from 'react';

const SpatialAudioChat = () => {
  const [inRoom, setInRoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMapClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Interactive Spatial Audio Chat</h2>
          <p className="text-gray-500 text-sm">Move your avatar closer to others to hear them.</p>
        </div>
        <button 
          onClick={() => setInRoom(!inRoom)}
          className={`px-4 py-2 rounded font-medium ${inRoom ? 'bg-red-100 text-red-600' : 'bg-green-600 text-white'}`}
        >
          {inRoom ? 'Leave Room' : 'Join Room'}
        </button>
      </div>

      {inRoom ? (
        <div className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden" onClick={handleMapClick}>
          <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono">Click anywhere to move</div>
          
          {/* Other Attendees */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-400 rounded-full border-2 border-white shadow-md"></div>
            <span className="text-xs mt-1 bg-white/80 px-1 rounded">Alex</span>
            {/* Audio range indicator */}
            <div className="absolute w-32 h-32 bg-blue-400/10 rounded-full -z-10 animate-pulse"></div>
          </div>

          <div className="absolute top-2/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 bg-purple-400 rounded-full border-2 border-white shadow-md"></div>
            <span className="text-xs mt-1 bg-white/80 px-1 rounded">Sarah</span>
          </div>

          {/* User Avatar */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ease-out"
            style={{ top: `${position.y}%`, left: `${position.x}%` }}
          >
            <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-white shadow-lg ring-4 ring-green-200"></div>
            <span className="text-xs mt-1 font-bold bg-white px-2 py-0.5 rounded shadow">You</span>
            <div className="absolute w-32 h-32 bg-green-500/20 rounded-full -z-10"></div>
          </div>
        </div>
      ) : (
        <div className="w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
          <span className="text-4xl mb-4">🎧</span>
          <p className="text-gray-500">Join the room to start networking</p>
        </div>
      )}
    </div>
  );
};

export default SpatialAudioChat;
