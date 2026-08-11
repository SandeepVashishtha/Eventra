import React, { useState, useEffect } from 'react';

const InteractiveARNavigation = () => {
  const [navigating, setNavigating] = useState(false);
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(124); // meters

  // Simulate walking/distance reduction
  useEffect(() => {
    let interval;
    if (navigating && distance > 0) {
      interval = setInterval(() => {
        setDistance(prev => Math.max(0, prev - Math.floor(Math.random() * 3 + 1)));
      }, 1000);
    } else if (distance === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [navigating, distance]);

  const startNavigation = (dest) => {
    setDestination(dest);
    setDistance(Math.floor(Math.random() * 100) + 50); // random distance between 50-150m
    setNavigating(true);
  };

  const stopNavigation = () => {
    setNavigating(false);
    setDestination('');
  };

  const poiList = [
    { name: 'Main Keynote Stage', icon: '🎤', category: 'Stages' },
    { name: 'Google Cloud Booth (B42)', icon: '☁️', category: 'Sponsors' },
    { name: 'Restrooms (North Wing)', icon: '🚻', category: 'Amenities' },
    { name: 'Networking Lounge', icon: '☕', category: 'Amenities' }
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Spatial Computing Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Augmented Reality <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Indoor Navigation</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Stop wandering massive expo halls. Use your device's camera to overlay live directional arrows on the venue floor, guiding you exactly to your next meeting, session, or sponsor booth.
          </p>
          
          {!navigating ? (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mt-8">
              <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Select Destination</h3>
              <div className="space-y-2">
                {poiList.map((poi, idx) => (
                  <button 
                    key={idx}
                    onClick={() => startNavigation(poi.name)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{poi.icon}</span>
                      <span className="font-bold text-sm text-slate-200">{poi.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{poi.category}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-cyan-900/30 rounded-2xl border border-cyan-500/30 p-6 mt-8 animate-fade-in">
              <h3 className="font-bold text-cyan-400 mb-1 text-sm uppercase tracking-widest">Currently Navigating To:</h3>
              <p className="text-2xl font-black text-white mb-6">{destination}</p>
              
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distance</p>
                  <p className="text-3xl font-black text-white">{distance} <span className="text-sm font-medium text-slate-400">meters</span></p>
                </div>
                {distance === 0 && (
                  <span className="bg-green-500/20 text-green-400 font-bold px-3 py-1 rounded border border-green-500/30 text-sm">
                    Arrived
                  </span>
                )}
              </div>

              <button 
                onClick={stopNavigation}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition shadow-sm"
              >
                End Navigation
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Mobile Viewport Simulation */}
        <div className="flex justify-center">
          <div className="w-[340px] h-[720px] bg-black rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            {/* Simulated Camera View / AR View */}
            <div className="flex-1 relative bg-slate-900">
              {/* Fake camera background: abstract shapes representing an expo hall */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-10 w-32 h-64 bg-slate-600 rounded"></div>
                <div className="absolute top-1/3 right-10 w-24 h-48 bg-slate-500 rounded"></div>
                <div className="absolute bottom-0 w-full h-1/3 bg-slate-800 border-t-2 border-slate-700" style={{ transform: 'perspective(500px) rotateX(45deg)' }}></div>
              </div>

              {!navigating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/60 backdrop-blur-sm">
                  <span className="text-4xl mb-4 text-cyan-400">AR</span>
                  <h3 className="text-white font-black text-xl mb-2">Camera Ready</h3>
                  <p className="text-sm text-slate-400">Select a destination on the left to begin AR wayfinding.</p>
                </div>
              ) : distance > 0 ? (
                <>
                  {/* AR Overlay Elements */}
                  
                  {/* Floating Destination Pin */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
                    <div className="bg-cyan-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-cyan-400 mb-1">
                      {destination}
                    </div>
                    <div className="w-4 h-4 bg-cyan-600 transform rotate-45 border-r border-b border-cyan-400"></div>
                  </div>

                  {/* AR Path / Arrow on the floor */}
                  <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] border-b-cyan-400/80 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" style={{ transform: 'perspective(200px) rotateX(60deg)' }}></div>
                    <div className="w-16 h-48 bg-gradient-to-t from-cyan-500/0 to-cyan-500/30 mx-auto -mt-4 filter blur-sm" style={{ transform: 'perspective(200px) rotateX(60deg)' }}></div>
                  </div>

                  {/* HUD */}
                  <div className="absolute bottom-8 left-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-slate-700 flex justify-between items-center shadow-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Straight Ahead</span>
                      <span className="text-white font-black text-xl">{distance}m</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-500">
                      ↑
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-emerald-900/80 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl mb-4 border-4 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
                    ✓
                  </div>
                  <h3 className="text-white font-black text-2xl mb-2">You Have Arrived!</h3>
                  <p className="text-emerald-200 font-bold">{destination}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InteractiveARNavigation;
