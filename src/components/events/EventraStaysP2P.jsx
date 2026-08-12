import React, { useState } from 'react';

const EventraStaysP2P = () => {
  const [bookingState, setBookingState] = useState('browsing'); // browsing, requesting, confirmed
  const [activeListing, setActiveListing] = useState(null);

  const listings = [
    {
      id: 'list_001',
      host: 'Sarah J.',
      hostRole: 'Senior Developer, Stripe',
      type: 'Private Room in 3BR House',
      distance: '0.8 miles from Convention Center',
      price: 85,
      verified: true,
      image: 'https://images.unsplash.com/photo-1522771731478-4422204561fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'list_002',
      host: 'Team Vercel (4 of us)',
      hostRole: 'Engineering Team',
      type: 'Couch in Massive Airbnb',
      distance: '1.2 miles from Convention Center',
      price: 45,
      verified: true,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleBook = (listing) => {
    setActiveListing(listing);
    setBookingState('requesting');
    
    setTimeout(() => {
      setBookingState('confirmed');
    }, 2500);
  };

  const resetFlow = () => {
    setBookingState('browsing');
    setActiveListing(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Pitch (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏠</span> Community Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Peer-to-Peer <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Accommodation Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Solve the #1 logistical barrier to entry for massive, city-wide festivals. When hotels sell out and prices skyrocket, Eventra Stays allows verified attendees to list their spare rooms or couches exclusively to other verified ticket holders, facilitating secure, community-driven housing.
          </p>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
             
             <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center">
               <span className="text-orange-500 mr-2">✓</span> Verified Trust Network
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 text-xl">🎫</div>
                 <h4 className="font-bold text-sm text-slate-900 mb-2">Ticket Gated</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Only users who have actively purchased and validated a ticket to the specific event can view or book listings.</p>
               </div>
               
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4 text-xl">💼</div>
                 <h4 className="font-bold text-sm text-slate-900 mb-2">Professional Identity</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Hosts and guests see each other's verified LinkedIn profiles and company roles, enforcing professional accountability.</p>
               </div>

               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 text-xl">💳</div>
                 <h4 className="font-bold text-sm text-slate-900 mb-2">Escrow Payments</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed">Funds are held in escrow via Stripe Connect and only released 24 hours after successful check-in.</p>
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-slate-100 rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Header Title */}
            <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Eventra Stays</h2>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                <span className="text-orange-500 text-sm">👤</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
              
              {bookingState === 'browsing' ? (
                // Browsing Listings
                <div className="flex-1 p-4 overflow-y-auto space-y-4 animate-fade-in">
                  
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start mb-6">
                    <span className="text-blue-500 mr-2">ℹ️</span>
                    <p className="text-[10px] text-blue-700 font-bold mt-0.5">Hotels are 98% sold out. Book a peer-to-peer stay with a fellow attendee.</p>
                  </div>

                  {listings.map(list => (
                    <div key={list.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer hover:shadow-md transition">
                      <div className="h-32 bg-slate-200 relative overflow-hidden">
                        <img src={list.image} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white text-[9px] font-black uppercase px-2 py-1 rounded">
                          {list.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center">
                              Host: {list.host} 
                              {list.verified && <span className="text-emerald-500 ml-1 text-xs" title="Verified Ticket Holder">✓</span>}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{list.hostRole}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-black text-orange-500 text-lg">${list.price}</span>
                            <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-widest">Per Night</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mb-4">📍 {list.distance}</p>
                        
                        <button 
                          onClick={() => handleBook(list)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-widest"
                        >
                          Request to Book
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="h-6"></div>
                </div>
              ) : (
                // Booking Flow Overlay
                <div className="absolute inset-0 bg-white z-20 flex flex-col">
                  
                  {bookingState === 'requesting' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Securing Booking</h3>
                      <p className="text-xs text-slate-500 mb-6">Placing funds in Stripe Escrow...</p>
                      
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Host Verification</span>
                        <div className="flex items-center space-x-2 text-xs text-emerald-600 font-bold mb-1">
                          <span>✓ Active Event Ticket Confirmed</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-emerald-600 font-bold">
                          <span>✓ Background Check Passed</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50 mx-auto mb-6 shadow-lg">
                        <span className="text-emerald-500 text-4xl">✓</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2">Confirmed!</h3>
                      <p className="text-sm text-slate-500 mb-8">You are booked with {activeListing?.host}. They have been notified of your arrival.</p>
                      
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl w-full mb-8 text-left">
                        <h4 className="font-bold text-orange-900 text-sm mb-1">In-App Chat Unlocked</h4>
                        <p className="text-xs text-orange-700">You can now coordinate arrival times directly with your host via Eventra Messages.</p>
                      </div>

                      <button 
                        onClick={resetFlow}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EventraStaysP2P;
