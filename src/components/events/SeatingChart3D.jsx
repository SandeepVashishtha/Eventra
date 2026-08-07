import React, { useState } from 'react';

const SeatingChart3D = () => {
  const [selectedSeat, setSelectedSeat] = useState('VIP-12');
  const [viewMode, setViewMode] = useState('pov'); // 'pov' or 'map'

  const seats = [
    { id: 'VIP-12', section: 'Front Row Center', price: '$450', rating: 98, status: 'available', coords: { x: 50, y: 80 }, hasObstruction: false },
    { id: 'BAL-4', section: 'Balcony Left', price: '$120', rating: 75, status: 'available', coords: { x: 15, y: 20 }, hasObstruction: false },
    { id: 'FLR-88', section: 'Floor Right', price: '$200', rating: 40, status: 'warning', coords: { x: 85, y: 50 }, hasObstruction: true, obstructionReason: 'Behind structural pillar' }
  ];

  const currentSeat = seats.find(s => s.id === selectedSeat);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Seat Info (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-purple-900/50 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Ticketing & Sales
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            3D Ray-Traced <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sightlines</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Stop relying on flat 2D maps. Our Three.js integration automatically renders the exact Point-Of-View from any seat in the house, proving the value of premium tickets and preventing refund requests for obstructed views.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Seat</h3>
               <span className="text-2xl font-black text-white">{currentSeat.id}</span>
             </div>

             <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-slate-400">Section</span>
                 <span className="text-sm font-bold text-white">{currentSeat.section}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-slate-400">Price</span>
                 <span className="text-lg font-black text-purple-400">{currentSeat.price}</span>
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-xs text-slate-400">View Rating</span>
                   <span className="text-xs font-bold text-slate-300">{currentSeat.rating}/100</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${currentSeat.rating > 80 ? 'bg-emerald-500' : currentSeat.rating > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                     style={{ width: `${currentSeat.rating}%` }}
                   ></div>
                 </div>
               </div>
             </div>

             {currentSeat.hasObstruction && (
               <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start space-x-3">
                 <span className="text-red-500">⚠️</span>
                 <div>
                   <h4 className="text-xs font-bold text-red-400">Obstructed View</h4>
                   <p className="text-[10px] text-red-200/70 mt-0.5">{currentSeat.obstructionReason}</p>
                 </div>
               </div>
             )}

             <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(147,51,234,0.4)]">
               Add to Cart — {currentSeat.price}
             </button>
          </div>
        </div>

        {/* Right Side: 3D Simulator (Col span 8) */}
        <div className="lg:col-span-8 bg-black rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[600px]">
          
          {/* Top Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex bg-slate-900/80 backdrop-blur-md p-1 rounded-full border border-slate-700">
            <button 
              onClick={() => setViewMode('pov')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition ${viewMode === 'pov' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Exact POV
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition ${viewMode === 'map' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Overhead Map
            </button>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <span className="bg-black/60 backdrop-blur-md border border-slate-700 text-white text-[10px] font-mono px-2 py-1 rounded">WebGL Active</span>
          </div>

          {/* Interactive Viewport */}
          <div className="flex-1 relative flex items-center justify-center">
             
             {viewMode === 'pov' ? (
               // Simulated 3D View Render
               <div className="w-full h-full relative group cursor-move">
                 
                 {/* The rendered "stage" image based on seat */}
                 <div className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                   currentSeat.id === 'VIP-12' ? 'bg-[url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")]' :
                   currentSeat.id === 'BAL-4' ? 'bg-[url("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")] blur-[1px]' :
                   'bg-slate-900' // Floor Right obstructed
                 }`}></div>

                 {/* Simulated Obstruction Render (for FLR-88) */}
                 {currentSeat.hasObstruction && (
                   <>
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40"></div>
                     {/* The Pillar */}
                     <div className="absolute top-0 bottom-0 left-1/3 w-1/3 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 shadow-2xl z-10">
                       <div className="absolute inset-0 bg-black/40"></div>
                     </div>
                   </>
                 )}

                 {/* HUD Overlay */}
                 <div className="absolute inset-0 bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
                 
                 {/* Raycast Target indicator */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition pointer-events-none">
                   <div className="w-32 h-32 border border-white/50 rounded-full flex items-center justify-center">
                     <div className="w-2 h-2 bg-white rounded-full"></div>
                   </div>
                 </div>

               </div>
             ) : (
               // Overhead Map View
               <div className="w-full h-full bg-slate-900 p-12 relative flex flex-col items-center justify-end border-[16px] border-slate-950">
                 
                 {/* Stage */}
                 <div className="absolute top-12 w-1/2 h-24 bg-gradient-to-b from-blue-900 to-slate-900 rounded-b-3xl border border-blue-500/30 flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                   <span className="text-blue-500/50 font-black tracking-widest uppercase">Stage</span>
                 </div>

                 {/* The Pillar (Obstruction) */}
                 <div className="absolute top-1/2 left-2/3 w-12 h-12 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center shadow-2xl">
                   <span className="text-[8px] text-slate-700">Pillar</span>
                 </div>

                 {/* Seat Selectors */}
                 {seats.map(seat => (
                   <button 
                     key={seat.id}
                     onClick={() => setSelectedSeat(seat.id)}
                     className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all flex items-center justify-center shadow-lg hover:scale-125 ${
                       selectedSeat === seat.id 
                         ? 'bg-purple-600 border-white z-20 shadow-[0_0_20px_rgba(147,51,234,0.6)]' 
                         : seat.status === 'warning'
                           ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/50 z-10'
                           : 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/50 z-10'
                     }`}
                     style={{ left: `${seat.coords.x}%`, bottom: `${seat.coords.y}%` }}
                   >
                     {selectedSeat === seat.id && <div className="absolute inset-0 border border-purple-400 rounded-full animate-ping"></div>}
                     <span className="text-[8px] text-white font-bold">{seat.id.split('-')[1]}</span>
                   </button>
                 ))}

                 {/* Sightline Ray Trace Simulation (from active seat to stage) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                   <line 
                     x1={`${currentSeat.coords.x}%`} 
                     y1={`${100 - currentSeat.coords.y}%`} 
                     x2="50%" 
                     y2="15%" 
                     stroke={currentSeat.hasObstruction ? "rgba(239,68,68,0.5)" : "rgba(147,51,234,0.3)"} 
                     strokeWidth="2" 
                     strokeDasharray="4 4" 
                   />
                 </svg>

               </div>
             )}

          </div>

          <div className="bg-slate-950 p-4 border-t border-slate-800 text-center flex justify-between items-center px-8">
            <span className="text-[10px] text-slate-500 font-mono">Render: Three.js WebGL Engine</span>
            <span className="text-[10px] text-slate-500 font-mono">60 FPS</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SeatingChart3D;
