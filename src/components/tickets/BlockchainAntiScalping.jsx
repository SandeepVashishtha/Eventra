import React, { useState } from 'react';

const BlockchainAntiScalping = () => {
  const [resaleActive, setResaleActive] = useState(false);
  const [resalePrice, setResalePrice] = useState(150);
  const [transactionStatus, setTransactionStatus] = useState('idle'); // idle, signing, success, error

  const originalPrice = 150;
  const maxPriceCap = Math.round(originalPrice * 1.10); // 110% cap
  const organizerRoyalty = Math.round(resalePrice * 0.05); // 5% royalty

  const ticketData = {
    eventName: "TechCon 2026",
    seat: "Section A, Row 14, Seat 22",
    tokenId: "0x8f2a...4b91",
    network: "Polygon",
    owner: "David M."
  };

  const handleResale = () => {
    if (resalePrice > maxPriceCap) {
      setTransactionStatus('error');
      return;
    }
    
    setTransactionStatus('signing');
    setTimeout(() => {
      setTransactionStatus('success');
    }, 2500);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Digital Ticket Wallet</h2>
          <p className="text-sm text-gray-500 mt-1">Blockchain-verified authenticity & anti-scalping protections.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-black text-xs">MATIC</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network</p>
            <p className="text-sm font-bold text-gray-800">Polygon POS</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Ticket Display */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden h-[400px] flex flex-col justify-between">
            {/* Holographic overlay simulation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/30">
                  Verified NFT Ticket
                </span>
                <h3 className="text-3xl font-black mt-4">{ticketData.eventName}</h3>
                <p className="text-indigo-200 font-medium">{ticketData.seat}</p>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg p-1">
                {/* Simulated QR Code */}
                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x8f2a...4b91')] bg-cover"></div>
              </div>
            </div>

            <div className="relative z-10 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 mt-auto">
              <div className="flex justify-between text-xs mb-2 text-gray-300">
                <span>Original Buyer: <strong className="text-white">{ticketData.owner}</strong></span>
                <span>Face Value: <strong className="text-white">${originalPrice}</strong></span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider">Token ID: {ticketData.tokenId}</span>
                <a href="#" className="text-xs text-purple-300 hover:text-purple-200 font-bold flex items-center">
                  View on PolygonScan <span className="ml-1">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Resale Controls */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          {!resaleActive ? (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🔄
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Can't make the event?</h3>
              <p className="text-sm text-gray-500 mb-6">Securely transfer or resell your ticket on the official marketplace. Smart contract rules protect fans from scalping.</p>
              <button 
                onClick={() => setResaleActive(true)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition"
              >
                List Ticket for Resale
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">List for Resale</h3>
                <button onClick={() => {setResaleActive(false); setTransactionStatus('idle');}} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Set Resale Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input 
                      type="number" 
                      value={resalePrice}
                      onChange={(e) => setResalePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-bold text-lg focus:border-purple-500 outline-none"
                    />
                  </div>
                  {resalePrice > maxPriceCap && (
                    <p className="text-xs text-red-500 font-bold mt-2">
                      ⚠️ Smart Contract Error: Price exceeds the maximum allowed cap of ${maxPriceCap} (110% of face value).
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Buyer Pays:</span>
                    <span className="font-bold text-gray-900">${resalePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Smart Contract Royalty (5%):</span>
                    <span className="font-bold text-red-500">-${organizerRoyalty}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-bold">You Receive:</span>
                    <span className="font-black text-green-600">${resalePrice - organizerRoyalty}</span>
                  </div>
                </div>

                <div className="pt-4">
                  {transactionStatus === 'idle' || transactionStatus === 'error' ? (
                    <button 
                      onClick={handleResale}
                      disabled={resalePrice > maxPriceCap}
                      className={`w-full py-3 font-bold rounded-lg transition shadow-md ${resalePrice > maxPriceCap ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                      Sign Transaction & List
                    </button>
                  ) : transactionStatus === 'signing' ? (
                    <button disabled className="w-full py-3 bg-purple-100 text-purple-700 font-bold rounded-lg flex justify-center items-center">
                      <span className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                      Confirming on Polygon...
                    </button>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                      <span className="text-2xl mb-2 block">✅</span>
                      <h4 className="font-bold text-green-800">Ticket Listed</h4>
                      <p className="text-xs text-green-700 mt-1">Your NFT ticket is now available on the official marketplace.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainAntiScalping;
