import React, { useState } from 'react';

const TicketResaleMarketplace = () => {
  const [listingState, setListingState] = useState('viewing'); // viewing, listing, confirmed
  const [resalePrice, setResalePrice] = useState(250);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const originalPrice = 299;
  const organizerRoyaltyPct = 10;
  const platformFeePct = 2;
  
  const organizerRoyalty = (resalePrice * (organizerRoyaltyPct / 100)).toFixed(2);
  const platformFee = (resalePrice * (platformFeePct / 100)).toFixed(2);
  const sellerPayout = (resalePrice - organizerRoyalty - platformFee).toFixed(2);

  const handleListTicket = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setListingState('confirmed');
    }, 1500);
  };

  const marketplaceListings = [
    { id: 1, type: 'VIP Pass', price: 450, original: 599, seller: 'Alex M.' },
    { id: 2, type: 'General Admission', price: 250, original: 299, seller: 'You (Pending)' },
    { id: 3, type: 'General Admission', price: 275, original: 299, seller: 'Sarah T.' },
    { id: 4, type: 'General Admission', price: 290, original: 299, seller: 'David K.' }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center text-white">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase px-2 py-1 rounded border border-blue-500/30">Secure Smart Contracts</span>
              <h1 className="text-3xl font-black text-white">Ticket Resale Marketplace</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">A secure, scam-free secondary market. Original buyers can resell securely, and organizers capture royalty revenue on every transfer.</p>
          </div>
          
          <div className="mt-6 md:mt-0 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organizer Royalties Earned</span>
            <span className="text-2xl font-black text-emerald-400">$12,450.00</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Sell Ticket Flow */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full">
              
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center border-b border-slate-100 pb-4">
                <span className="text-blue-500 mr-2">🏷️</span> Sell Your Ticket
              </h2>

              {listingState === 'viewing' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full blur-xl -mr-4 -mt-4"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Ticket</p>
                    <p className="font-black text-slate-900 text-lg">General Admission</p>
                    <p className="text-sm text-slate-500">Order #EV-99824</p>
                  </div>

                  <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      <span>Set Resale Price</span>
                      <span className="text-blue-600 font-black">${resalePrice}</span>
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="400" 
                      value={resalePrice}
                      onChange={(e) => setResalePrice(e.target.value)}
                      className="w-full accent-blue-600" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Min: $100</span>
                      <span>Max Cap: $400</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Listing Price</span>
                      <span className="font-bold">${resalePrice}.00</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Organizer Royalty (10%)</span>
                      <span>-${organizerRoyalty}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs border-b border-slate-200 pb-2">
                      <span>Platform Fee (2%)</span>
                      <span>-${platformFee}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold pt-1 text-base">
                      <span>Your Payout</span>
                      <span>${sellerPayout}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setListingState('listing')}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-lg transition"
                  >
                    Review Listing
                  </button>
                </div>
              )}

              {listingState === 'listing' && (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 mb-6 text-sm leading-relaxed">
                    By listing this ticket, it will be temporarily locked in your account. Once purchased, the digital ticket is automatically transferred to the buyer, and funds are routed to your linked bank account.
                  </div>
                  
                  <button 
                    onClick={handleListTicket}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-black shadow-lg transition mt-auto flex justify-center items-center ${isProcessing ? 'bg-slate-200 text-slate-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {isProcessing ? (
                      <><span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2"></span> Submitting...</>
                    ) : (
                      'Confirm & List Ticket'
                    )}
                  </button>
                  <button 
                    onClick={() => setListingState('viewing')}
                    disabled={isProcessing}
                    className="w-full py-3 mt-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {listingState === 'confirmed' && (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                    ✓
                  </div>
                  <h3 className="font-black text-slate-900 text-xl mb-2">Ticket Listed!</h3>
                  <p className="text-sm text-slate-500 mb-8">Your ticket is now live on the marketplace. You will be notified when it sells.</p>
                  
                  <button 
                    onClick={() => setListingState('viewing')}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Manage Listing
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Marketplace Board */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h2 className="text-lg font-bold text-slate-900">Active Listings</h2>
               <div className="flex space-x-2">
                 <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1 outline-none">
                   <option>All Ticket Types</option>
                   <option>VIP Pass</option>
                   <option>General Admission</option>
                 </select>
               </div>
            </div>

            <div className="flex-1 overflow-auto pr-2 space-y-4">
              
              {marketplaceListings.map((listing) => (
                <div key={listing.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-colors ${listing.seller.includes('You') && listingState === 'confirmed' ? 'bg-blue-50 border-blue-200 shadow-sm animate-pulse-once' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${listing.type.includes('VIP') ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-600'}`}>
                      🎟️
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">{listing.type}</h3>
                      <p className="text-xs font-medium text-slate-500">Seller: {listing.seller}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-through">Orig: ${listing.original}</p>
                      <p className="font-black text-slate-900 text-xl">${listing.price}</p>
                    </div>
                    
                    <button 
                      disabled={listing.seller.includes('You')}
                      className={`px-6 py-2 rounded-xl font-bold shadow-sm transition ${listing.seller.includes('You') ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                    >
                      {listing.seller.includes('You') ? 'Your Listing' : 'Buy Now'}
                    </button>
                  </div>

                </div>
              ))}
              
              {/* If user hasn't confirmed listing, don't show it in the UI list if they just cancelled it, but for mockup simplicity we just render the array as is. If we wanted to hide it we'd filter based on state. */}

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center">
                <span className="text-emerald-500 mr-1">🛡️</span> Verified by Eventra Secure Transfer
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketResaleMarketplace;
