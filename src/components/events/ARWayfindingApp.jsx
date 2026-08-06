import React, { useState, useEffect } from 'react';

const ARWayfindingApp = () => {
  const [arActive, setArActive] = useState(false);
  const [destination] = useState('Breakout Room 304');
  const [distance, setDistance] = useState(120);

  useEffect(() => {
    let interval;
    if (arActive) {
      interval = setInterval(() => {
        setDistance(prev => {
          if (prev <= 5) {
            clearInterval(interval);
            return 0;
          }
          return prev - 5;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [arActive]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-sm mx-auto mt-8 border border-gray-100 flex flex-col items-center">
      <div className="w-full text-center mb-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">AR Wayfinding</h2>
        <p className="text-sm text-gray-500">Find your way using your camera</p>
      </div>

      {/* Phone Mockup */}
      <div className="w-[300px] h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl relative overflow-hidden">
        
        {!arActive ? (
          <div className="w-full h-full bg-white rounded-[2.25rem] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
              📍
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Next Scheduled Session</h3>
            <p className="text-gray-500 mb-6 font-medium text-sm">Advanced React Patterns<br/>in {destination}</p>
            
            <button 
              onClick={() => setArActive(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
            >
              Start AR Navigation
            </button>
            <p className="text-xs text-gray-400 mt-4">Requires Camera & Location Access</p>
          </div>
        ) : (
          <div className="w-full h-full bg-[url('https://via.placeholder.com/400x800/1a202c/ffffff?text=Live+Camera+Feed')] bg-cover bg-center rounded-[2.25rem] relative overflow-hidden flex flex-col">
            
            {/* Top Info Bar */}
            <div className="bg-black/60 backdrop-blur-md text-white p-4 m-4 rounded-xl text-center border border-gray-700">
              <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1">Navigating to</p>
              <h3 className="font-bold text-lg">{destination}</h3>
            </div>

            {/* Simulated AR Graphics */}
            <div className="flex-1 relative flex flex-col items-center justify-center perspective-[800px]">
              
              {distance > 0 ? (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 space-y-12 animate-pulse">
                    <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-blue-500/80 transform rotate-x-60 scale-75"></div>
                    <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[80px] border-b-blue-500/60 transform rotate-x-60"></div>
                  </div>
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.8)] z-10">
                    {distance}m
                  </div>
                </>
              ) : (
                <div className="bg-green-500/90 backdrop-blur text-white p-6 rounded-2xl text-center animate-bounce shadow-2xl border border-green-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <h3 className="font-black text-2xl">You've Arrived!</h3>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 flex justify-between items-end pb-8">
              <button 
                onClick={() => {
                  setArActive(false);
                  setDistance(120);
                }}
                className="w-12 h-12 bg-black/50 backdrop-blur rounded-full text-white flex items-center justify-center font-bold border border-gray-600 hover:bg-black/70"
              >
                X
              </button>
              <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-gray-600 text-xs font-mono text-gray-300">
                ARKit Active
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ARWayfindingApp;
