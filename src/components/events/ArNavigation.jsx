import React, { useState } from 'react';

const ArNavigation = () => {
  const [arActive, setArActive] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto mt-8 border border-gray-100 overflow-hidden relative">
      <div className="text-center mb-6 z-10 relative">
        <h2 className="text-xl font-bold mb-2">AR Venue Navigation</h2>
        <p className="text-sm text-gray-500">Find your way using augmented reality.</p>
      </div>

      <div className="relative w-full aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden border-4 border-gray-800 shadow-inner">
        {arActive ? (
          <div className="absolute inset-0 bg-blue-50/50 flex flex-col items-center justify-center">
            {/* Simulated AR Camera View */}
            <div className="text-center">
              <div className="text-blue-500 text-6xl mb-4 animate-bounce">⬆️</div>
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold shadow text-blue-800">
                Main Stage - 50 meters
              </div>
            </div>
            
            <button 
              onClick={() => setArActive(false)}
              className="absolute bottom-6 px-6 py-2 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600"
            >
              Exit AR Mode
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📷</span>
            </div>
            <h3 className="font-semibold mb-2">Camera Access Required</h3>
            <p className="text-xs text-gray-500 mb-6">Hold up your phone to see directional arrows overlaid in the real world.</p>
            
            <button 
              onClick={() => setArActive(true)}
              className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Launch AR Navigation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArNavigation;
