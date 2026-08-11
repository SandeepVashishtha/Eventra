import React, { useState } from 'react';

const Interactive3DSeating = () => {
  const [viewMode, setViewMode] = useState('birdseye'); // birdseye, stage_view
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, locking, success

  const seats = [
    { id: 'V1', section: 'VIP Front Row', price: 450, status: 'available', quality: 'Excellent' },
    { id: 'V2', section: 'VIP Front Row', price: 450, status: 'locked', quality: 'Excellent' },
    { id: 'M1', section: 'Middle Tier', price: 200, status: 'available', quality: 'Good' },
    { id: 'B1', section: 'Balcony', price: 85, status: 'available', quality: 'Fair' }
  ];

  const handleSeatSelect = (seat) => {
    if (seat.status === 'available') {
      setSelectedSeat(seat);
      setViewMode('stage_view');
      setBookingStatus('idle');
    }
  };

  const lockSeat = () => {
    setBookingStatus('locking');
    setTimeout(() => {
      setBookingStatus('success');
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl max-w-5xl mx-auto mt-8 border border-gray-800 text-white flex flex-col lg:flex-row gap-6">
      
      {/* 3D Visualizer Area */}
      <div className="w-full lg:w-2/3 bg-black rounded-xl border border-gray-800 relative overflow-hidden h-[500px] shadow-inner">
        
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 z-20 flex space-x-2">
          <button 
            onClick={() => setViewMode('birdseye')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border backdrop-blur-md transition ${viewMode === 'birdseye' ? 'bg-blue-600/80 border-blue-500 text-white' : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'}`}
          >
            Bird's Eye Map
          </button>
          <button 
            onClick={() => {
              if(selectedSeat) setViewMode('stage_view');
            }}
            disabled={!selectedSeat}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border backdrop-blur-md transition ${viewMode === 'stage_view' ? 'bg-blue-600/80 border-blue-500 text-white' : 'bg-gray-800/50 border-gray-600 text-gray-500 cursor-not-allowed'}`}
          >
            Preview Sightline
          </button>
        </div>

        <div className="absolute top-4 right-4 z-20 flex items-center bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700 backdrop-blur-md">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Live WebGL</span>
        </div>

        {/* WebGL Canvas Mockup */}
        {viewMode === 'birdseye' ? (
          <div className="w-full h-full flex flex-col items-center justify-center perspective-[1000px]">
            {/* Stage */}
            <div className="w-64 h-16 bg-gradient-to-t from-blue-900 to-indigo-600 rounded-t-3xl mb-12 shadow-[0_-10px_30px_rgba(79,70,229,0.5)] flex items-center justify-center border-t-2 border-indigo-400 transform -rotate-x-30">
              <span className="font-black text-indigo-200 tracking-widest uppercase">Main Stage</span>
            </div>

            {/* Seating Grid */}
            <div className="grid grid-cols-4 gap-4 transform rotate-x-45 scale-125">
              {seats.map((seat, i) => (
                <button 
                  key={i}
                  onClick={() => handleSeatSelect(seat)}
                  disabled={seat.status === 'locked'}
                  className={`w-12 h-12 rounded-t-lg border-2 shadow-lg transition-transform hover:-translate-y-2 ${seat.status === 'locked' ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50' : selectedSeat?.id === seat.id ? 'bg-blue-500 border-blue-300 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-indigo-900 border-indigo-700 hover:bg-indigo-700'}`}
                >
                  <span className="text-[10px] font-bold text-white/50">{seat.id}</span>
                </button>
              ))}
              {/* Dummy seats to fill out the grid */}
              {[...Array(12)].map((_, i) => (
                <div key={`d${i}`} className="w-12 h-12 bg-indigo-900/40 rounded-t-lg border-2 border-indigo-900/30 opacity-50"></div>
              ))}
            </div>
            
            <p className="absolute bottom-6 text-xs text-gray-500 font-medium">Click and drag to orbit (Simulated)</p>
          </div>
        ) : (
          <div className="w-full h-full bg-[url('https://via.placeholder.com/800x600/1e1b4b/4f46e5?text=Simulated+Stage+View')] bg-cover bg-center flex items-end justify-center pb-8">
            <div className="bg-black/60 backdrop-blur p-4 rounded-xl border border-gray-700 text-center shadow-2xl">
              <h3 className="font-bold text-white">Simulated View from {selectedSeat?.id}</h3>
              <p className="text-sm text-gray-300">Section: {selectedSeat?.section}</p>
            </div>
          </div>
        )}
      </div>

      {/* Checkout & Info Panel */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex-1">
          <h2 className="text-xl font-black text-white border-b border-gray-700 pb-3 mb-4">Ticket Details</h2>
          
          {!selectedSeat ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-gray-500">
              <span className="text-4xl mb-2">🖱️</span>
              <p className="font-medium text-sm">Select a seat from the 3D map to view pricing and sightlines.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Selected Seat</p>
                  <h3 className="text-2xl font-black">{selectedSeat.section}</h3>
                  <p className="text-gray-400 font-mono text-sm">Seat ID: {selectedSeat.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">${selectedSeat.price}</span>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sightline Quality</span>
                  <span className="font-bold text-green-400">{selectedSeat.quality}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Acoustics Rating</span>
                  <span className="font-bold text-white">9.2 / 10</span>
                </div>
              </div>

              {bookingStatus === 'idle' ? (
                <button 
                  onClick={lockSeat}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
                >
                  Lock Seat & Checkout
                </button>
              ) : bookingStatus === 'locking' ? (
                <div className="w-full mt-4 py-3 bg-gray-700 text-white font-bold rounded-xl flex justify-center items-center">
                  <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Locking via WebSocket...
                </div>
              ) : (
                <div className="w-full mt-4 py-3 bg-green-600/20 border border-green-500/50 text-green-400 font-bold rounded-xl flex justify-center items-center text-sm">
                  <span className="mr-2">🔒</span> Seat Locked! Redirecting to payment...
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-500 text-xl">⚡</span>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              High demand! To prevent double-booking, seats are locked on a first-come, first-serve basis for <strong className="text-white">10 minutes</strong> once you begin checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interactive3DSeating;
