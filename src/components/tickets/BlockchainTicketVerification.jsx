import React, { useState } from 'react';

const BlockchainTicketVerification = () => {
  const [purchaseStep, setPurchaseStep] = useState(1); // 1: Select, 2: Pay, 3: Minting, 4: Success
  const [ticketData, setTicketData] = useState(null);

  const handlePurchase = () => {
    setPurchaseStep(2);
  };

  const processPayment = () => {
    setPurchaseStep(3);
    // Simulate fiat to crypto conversion and NFT minting
    setTimeout(() => {
      setTicketData({
        tokenId: "8942",
        contractAddress: "0xpolygon94b...1a2c",
        transactionHash: "0x88f2...90ca",
        owner: "Sarah J."
      });
      setPurchaseStep(4);
    }, 2500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-xl mx-auto mt-8 border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
          Blockchain-Backed VIP Ticket
        </h2>
        <p className="text-sm text-gray-500 mt-1">Cryptographically secure. Zero crypto knowledge required.</p>
      </div>

      {purchaseStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              NFT SECURED
            </div>
            <h3 className="text-xl font-bold text-gray-800">Global Tech Summit 2026 - VIP Pass</h3>
            <p className="text-purple-700 font-bold text-2xl mt-2">$299.00</p>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>✓ Guaranteed authenticity via Polygon network</li>
              <li>✓ Scannable dynamic QR code</li>
              <li>✓ Tradable on secondary markets (10% royalty enforced)</li>
            </ul>
          </div>
          <button 
            onClick={handlePurchase}
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg shadow-md hover:bg-gray-800 transition"
          >
            Checkout with Credit Card
          </button>
        </div>
      )}

      {purchaseStep === 2 && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2">💳</span> Payment Details</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Cardholder Name" className="w-full p-2 border rounded" defaultValue="Sarah Jenkins" />
            <input type="text" placeholder="Card Number" className="w-full p-2 border rounded" defaultValue="**** **** **** 4242" />
            <div className="flex space-x-3">
              <input type="text" placeholder="MM/YY" className="w-1/2 p-2 border rounded" defaultValue="12/28" />
              <input type="text" placeholder="CVC" className="w-1/2 p-2 border rounded" defaultValue="123" />
            </div>
          </div>
          <button 
            onClick={processPayment}
            className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Pay $299.00
          </button>
        </div>
      )}

      {purchaseStep === 3 && (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="font-bold text-gray-800 text-lg">Processing Payment...</h3>
          <p className="text-gray-500 text-sm mt-2">Minting your secure NFT ticket on the blockchain.</p>
        </div>
      )}

      {purchaseStep === 4 && ticketData && (
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Ticket Secured!</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">Your NFT ticket is ready in your account.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left text-sm space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Token ID:</span>
              <span className="font-bold text-purple-700">#{ticketData.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Network:</span>
              <span>Polygon (PoS)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contract:</span>
              <span className="text-blue-500 truncate ml-4 hover:underline cursor-pointer">{ticketData.contractAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tx Hash:</span>
              <span className="text-blue-500 truncate ml-4 hover:underline cursor-pointer">{ticketData.transactionHash}</span>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
            View My QR Pass
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockchainTicketVerification;
