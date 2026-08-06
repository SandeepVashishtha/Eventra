import React, { useState, useEffect } from 'react';

const InteractiveARWayfinding = () => {
  const [arActive, setArActive] = useState(false);
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(0); 

  const popularDestinations = [
    { id: 'main_stage', name: 'Main Keynote Stage' },
    { id: 'expo_hall_b', name: 'Expo Hall B (Startups)' },
    { id: 'food_court', name: 'Food Court & Lounge' },
    { id: 'restrooms', name: 'Nearest Restrooms' }
  ];

  const startNavigation = (destName) => {
    setDestination(destName);
    setDistance(185); // meters
    setArActive(true);
  };

  const endNavigation = () => {
    setArActive(false);
    setDestination('');
    setDistance(0);
  };

  // Simulate walking progress
  useEffect(() => {
    let interval;
    if (arActive && distance > 0) {
      interval = setInterval(() => {
        setDistance(prev => {
          const newDist = prev - (Math.random() * 3 + 1);
          return newDist <= 0 ? 0 : newDist;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [arActive, distance]);

  return (
    <div className="p-6 bg-zinc-100 min-h-[700px] flex items-center justify-center font-sans">
      
      {/* Mobile Device Mockup */}
      <div className="w-[375px] h-[812px] bg-black rounded-[3rem] shadow-2xl relative border-[12px] border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-40 h-6 bg-zinc-800 rounded-b-3xl"></div>
        </div>

        {!arActive ? (
          <div className="flex-1 bg-white pt-16 flex flex-col">
            <div className="px-6 mb-8">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight">Where to?</h2>
              <p className="text-zinc-500 font-medium mt-1">Select a destination to start AR navigation.</p>
            </div>

            <div className="px-6 mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search booths, stages..." 
                  className="w-full bg-zinc-100 border-none rounded-2xl py-4 pl-12 pr-4 text-zinc-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 px-6 overflow-y-auto">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Quick Destinations</h3>
              <div className="space-y-3">
                {popularDestinations.map(dest => (
                  <button 
                    key={dest.id}
                    onClick={() => startNavigation(dest.name)}
                    className="w-full bg-white border border-zinc-200 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition active:scale-95 text-left"
                  >
                    <span className="font-bold text-zinc-800">{dest.name}</span>
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bottom Nav Bar */}
            <div className="h-20 border-t border-zinc-200 bg-white flex justify-around items-center px-6 pb-2">
              <div className="text-blue-600 flex flex-col items-center">
                <span className="text-2xl mb-1">📍</span>
                <span className="text-[10px] font-bold">Map</span>
              </div>
              <div className="text-zinc-400 flex flex-col items-center">
                <span className="text-2xl mb-1">📅</span>
                <span className="text-[10px] font-bold">Schedule</span>
              </div>
              <div className="text-zinc-400 flex flex-col items-center">
                <span className="text-2xl mb-1">👤</span>
                <span className="text-[10px] font-bold">Profile</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative bg-zinc-900">
            {/* Camera Feed Simulation */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-70"></div>
            
            {/* AR Overlay Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center">
              
              {distance > 0 ? (
                <>
                  {/* Floating Destination Bubble */}
                  <div className="absolute top-1/4 bg-black/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 text-center shadow-2xl animate-bounce">
                    <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-1">Navigating to</p>
                    <h3 className="text-white font-black text-xl">{destination}</h3>
                    <div className="flex items-baseline justify-center mt-2 space-x-1">
                      <span className="text-4xl font-black text-white">{Math.round(distance)}</span>
                      <span className="text-blue-200 font-bold">meters</span>
                    </div>
                  </div>

                  {/* 3D AR Arrow Simulation */}
                  <div className="mt-32 w-full flex justify-center perspective-[800px]">
                    <div className="w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500/80 border-r-[60px] border-r-transparent transform rotate-x-45 drop-shadow-[0_0_25px_rgba(59,130,246,0.9)] animate-pulse"></div>
                  </div>
                </>
              ) : (
                <div className="bg-green-500/90 backdrop-blur-md px-8 py-10 rounded-[3rem] border-4 border-white text-center shadow-[0_0_50px_rgba(34,197,94,0.6)] animate-fade-in mx-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-white font-black text-3xl mb-2">You Arrived!</h3>
                  <p className="text-green-100 font-bold">{destination}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 z-20 px-6">
              <button 
                onClick={endNavigation}
                className="w-full bg-red-600/90 backdrop-blur-md text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition"
              >
                End AR Navigation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveARWayfinding;
