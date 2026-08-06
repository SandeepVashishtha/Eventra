import React, { useState } from 'react';

const VIPRideShareIntegration = () => {
  const [activeTab, setActiveTab] = useState('organizer'); // organizer, vip
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, requesting, matched, arriving
  const [mapScale, setMapScale] = useState(1);
  
  // Organizer Dashboard Data
  const [activeRides, setActiveRides] = useState([
    { id: 'R-7721', vip: 'Dr. Sarah Jenkins', status: 'In Transit', ETA: '12 mins', route: 'SFO → Moscone Center', service: 'Uber Black', cost: 84.50 },
    { id: 'R-8834', vip: 'Marcus Vance', status: 'Arriving', ETA: '2 mins', route: 'Marriott → Moscone Center', service: 'UberX VIP', cost: 14.20 },
    { id: 'R-2291', vip: 'Elena Rostova', status: 'Searching', ETA: '--', route: 'SJC → W Hotel', service: 'Lyft Lux', cost: 112.00 }
  ]);

  const simulateBooking = () => {
    setBookingStatus('requesting');
    
    setTimeout(() => {
      setBookingStatus('matched');
      setMapScale(1.1);
      
      setTimeout(() => {
        setBookingStatus('arriving');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-black text-white border border-slate-700 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                API Integration
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">VIP Ride-Share Engine</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl">
              Eliminate the logistical nightmare of manual black-car booking. By integrating directly with Uber for Business and Lyft APIs, organizers issue digital transit vouchers that VIPs can redeem instantly from their Eventra app, billed directly to the master corporate account.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('organizer')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'organizer' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Organizer Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('vip')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'vip' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              VIP App View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-1 gap-8">
        
        {activeTab === 'organizer' ? (
          /* Organizer Dashboard View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row h-full min-h-[600px] animate-fade-in">
            
            {/* Left: Master Account Billing */}
            <div className="lg:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Master Billing Account</h3>
                
                <div className="mb-8">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Total VIP Transit Spend</span>
                  <span className="text-5xl font-black text-white">$4,285<span className="text-xl text-slate-500">.50</span></span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">Uber for Business</span>
                      <span className="text-emerald-400 font-mono text-sm">Active</span>
                    </div>
                    <span className="text-xs text-slate-400">142 Rides Completed</span>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">Lyft Business</span>
                      <span className="text-emerald-400 font-mono text-sm">Active</span>
                    </div>
                    <span className="text-xs text-slate-400">38 Rides Completed</span>
                  </div>
                </div>
              </div>

              <div className="z-10 mt-8">
                <button className="w-full bg-white hover:bg-slate-100 text-slate-900 text-sm font-black py-4 rounded-xl transition shadow-lg">
                  + Issue New VIP Voucher
                </button>
              </div>
            </div>

            {/* Right: Live Transit Tracking */}
            <div className="lg:w-2/3 p-8 bg-slate-50 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Live VIP Transit Tracking
              </h3>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {activeRides.map(ride => (
                  <div key={ride.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{ride.vip}</h4>
                        <span className="text-xs text-slate-500 font-mono block mt-0.5">Voucher: {ride.id}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                          ride.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                          ride.status === 'Arriving' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 border-t border-slate-100 pt-4">
                      <div className="w-1/2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Route</span>
                        <span className="text-sm font-bold text-slate-700">{ride.route}</span>
                      </div>
                      <div className="w-1/4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Service</span>
                        <span className="text-sm font-bold text-slate-900 flex items-center">
                          {ride.service.includes('Uber') ? '⬛' : '🩷'} {ride.service}
                        </span>
                      </div>
                      <div className="w-1/4 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ETA</span>
                        <span className={`text-xl font-black ${ride.ETA !== '--' ? 'text-slate-900' : 'text-slate-300'}`}>{ride.ETA}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* VIP App View Simulator */
          <div className="flex justify-center h-full min-h-[600px] animate-fade-in">
            <div className="w-full max-w-[380px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[750px] overflow-hidden">
              
              {/* Map Background */}
              <div 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-transform duration-[3000ms] ease-out opacity-60"
                style={{ transform: `scale(${mapScale})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-950/90"></div>

              {/* Status Bar */}
              <div className="h-12 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
                <span>9:41</span>
                <div className="flex space-x-1 items-center">
                  <span>5G 📶</span>
                  <span className="ml-2">🔋</span>
                </div>
              </div>

              {/* Map Overlays */}
              {bookingStatus === 'matched' || bookingStatus === 'arriving' ? (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-2 shadow-lg flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    2 MINS AWAY
                  </div>
                  <div className="text-4xl filter drop-shadow-md animate-bounce">🚘</div>
                </div>
              ) : null}

              {/* Bottom Sheet UI */}
              <div className="mt-auto bg-white rounded-t-3xl z-20 flex flex-col transition-all duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>
                
                <div className="p-6">
                  
                  {bookingStatus === 'idle' ? (
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-900">Request VIP Ride</h2>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded">Corporate Paid</span>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-sm font-bold text-slate-900">SFO International Airport</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300 ml-1 mb-2"></div>
                        <div className="flex items-center space-x-3">
                          <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                          <span className="text-sm font-bold text-slate-900">Moscone Convention Center</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="block text-sm font-black">Uber Black SUV</span>
                          <span className="block text-xs text-slate-500">Premium transit for up to 6 VIPs</span>
                        </div>
                        <span className="text-lg font-black text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded">$0.00</span>
                      </div>

                      <button 
                        onClick={simulateBooking}
                        className="w-full bg-black hover:bg-slate-800 text-white font-black py-4 rounded-xl transition text-lg"
                      >
                        Confirm Uber Black
                      </button>
                    </div>
                  ) : bookingStatus === 'requesting' ? (
                    <div className="py-10 flex flex-col items-center justify-center animate-fade-in">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-6"></div>
                      <h2 className="text-lg font-black text-slate-900 mb-1">Connecting to Uber API...</h2>
                      <p className="text-xs text-slate-500">Applying corporate billing voucher.</p>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 mb-1">
                            {bookingStatus === 'arriving' ? 'Driver is Arriving' : 'Driver Assigned'}
                          </h2>
                          <p className="text-sm text-emerald-600 font-bold flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            {bookingStatus === 'arriving' ? 'Approaching Terminal 2' : 'En route (2 mins)'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-300 rounded-full bg-[url('https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')] bg-cover"></div>
                          <div>
                            <span className="block font-black text-slate-900">Michael (4.98 ⭐)</span>
                            <span className="block text-xs text-slate-500">Black Chevy Suburban</span>
                          </div>
                        </div>
                        <div className="text-center bg-black text-white px-3 py-1.5 rounded-lg border border-slate-700">
                          <span className="block text-xs font-bold text-slate-400">PLATE</span>
                          <span className="block font-black font-mono">7XWR392</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button className="flex-1 bg-slate-100 text-slate-900 font-bold py-3 rounded-xl">Contact</button>
                        <button className="flex-1 bg-slate-100 text-red-600 font-bold py-3 rounded-xl">Cancel</button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VIPRideShareIntegration;
