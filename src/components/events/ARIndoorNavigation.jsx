import React, { useState, useEffect } from 'react';

const ARIndoorNavigation = () => {
  const [arActive, setArActive] = useState(false);
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(145); // meters
  const [calibrationPhase, setCalibrationPhase] = useState(false);

  const destinations = [
    { id: 'hall_a', name: 'Main Keynote Stage (Hall A)' },
    { id: 'booth_402', name: 'Microsoft Booth #402' },
    { id: 'lounge_vip', name: 'VIP Networking Lounge' },
    { id: 'exit_north', name: 'North Exit / Restrooms' }
  ];

  const startNavigation = (dest) => {
    setDestination(dest);
    setCalibrationPhase(true);
    setArActive(true);
    
    // Simulate AR calibration
    setTimeout(() => {
      setCalibrationPhase(false);
    }, 2500);
  };

  const stopNavigation = () => {
    setArActive(false);
    setDestination('');
  };

  // Simulate walking closer to destination
  useEffect(() => {
    let interval;
    if (arActive && !calibrationPhase) {
      interval = setInterval(() => {
        setDistance(prev => {
          if (prev <= 2) return 0; // Arrived
          return prev - (Math.random() * 2 + 1); // Decrease by 1-3 meters
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [arActive, calibrationPhase]);

  return (
    <div className="p-6 bg-zinc-900 rounded-3xl shadow-2xl max-w-sm mx-auto mt-8 border-4 border-zinc-800 h-[750px] relative overflow-hidden font-sans flex flex-col">
      
      {/* Phone Notch/Status Bar Simulation */}
      <div className="absolute top-0 left-0 w-full h-7 bg-transparent z-50 flex justify-between items-center px-6">
        <span className="text-[10px] text-white font-bold">9:41</span>
        <div className="w-24 h-5 bg-black rounded-b-xl"></div>
        <div className="flex space-x-1 items-center">
          <span className="w-3 h-3 text-white text-[8px]">📶</span>
          <span className="w-3 h-3 text-white text-[8px]">🔋</span>
        </div>
      </div>

      {!arActive ? (
        <div className="flex-1 bg-zinc-50 flex flex-col pt-12 pb-6 px-4 rounded-2xl h-full relative z-10">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              🗺️
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">AR Wayfinding</h2>
            <p className="text-sm text-zinc-500 mt-2">Find your way through the expo floor using augmented reality.</p>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mb-3">Where to?</h3>
            <div className="relative mb-6">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search booths, stages, facilities..." 
                className="w-full pl-9 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <h3 className="font-bold text-zinc-800 text-sm uppercase tracking-wider mb-3">Popular Destinations</h3>
            <div className="space-y-3">
              {destinations.map(dest => (
                <button 
                  key={dest.id}
                  onClick={() => startNavigation(dest.name)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-zinc-100 hover:border-blue-300 hover:shadow-md rounded-xl transition text-left"
                >
                  <span className="font-bold text-zinc-700 text-sm">{dest.name}</span>
                  <span className="text-blue-500">↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-black rounded-2xl h-full relative z-10 overflow-hidden">
          {/* Simulated Camera Feed */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-80"></div>
          
          {calibrationPhase ? (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-white font-black text-xl mb-2">Scanning Environment</h3>
              <p className="text-blue-200 text-sm">Please slowly move your camera left and right to calibrate WebXR.</p>
            </div>
          ) : distance <= 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-5xl mb-4 shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-bounce">
                📍
              </div>
              <h3 className="text-white font-black text-3xl drop-shadow-lg">You've Arrived!</h3>
              <p className="text-green-300 font-bold drop-shadow-md mb-8">{destination}</p>
              <button 
                onClick={stopNavigation}
                className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-lg"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* AR Directional Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-full flex justify-center perspective-[1000px] mb-20 animate-pulse">
                  <div className="w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-blue-500/80 border-r-[40px] border-r-transparent transform rotate-x-60 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                </div>
                
                {/* Floating Waypoint */}
                <div className="absolute top-1/3 w-3/4 max-w-[250px] bg-black/60 backdrop-blur border border-white/20 p-4 rounded-2xl text-center transform scale-90">
                  <span className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1 block">Navigating To</span>
                  <h4 className="text-white font-bold mb-2">{destination}</h4>
                  <div className="text-4xl font-black text-white font-mono">{Math.round(distance)}<span className="text-lg text-gray-400">m</span></div>
                </div>
              </div>

              {/* Bottom AR UI Controls */}
              <div className="absolute bottom-6 left-6 right-6">
                <button 
                  onClick={stopNavigation}
                  className="w-full py-4 bg-red-600/90 backdrop-blur text-white font-bold rounded-2xl shadow-lg border border-red-500"
                >
                  End Navigation
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ARIndoorNavigation;
