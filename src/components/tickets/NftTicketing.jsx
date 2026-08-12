import React, { useState } from 'react';

const NftTicketing = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = () => {
    setWalletConnected(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Multi-chain NFT Ticketing
      </h2>
      <p className="text-gray-600 mb-6">
        Mint your event tickets as digital assets to prevent fraud and manage secondary sales on the blockchain.
      </p>

      {!walletConnected ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg border-gray-300">
          <p className="mb-4 text-gray-500">Connect your Web3 wallet to manage NFT tickets</p>
          <button 
            onClick={connectWallet}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center justify-between">
            <span>Wallet Connected: 0x71C...97b1</span>
            <span className="text-sm px-2 py-1 bg-green-200 rounded text-green-800">Ethereum Mainnet</span>
          </div>
          
          <div className="border rounded-lg p-5 mt-4">
            <h3 className="font-semibold text-lg mb-2">Mint New Ticket Collection</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Collection Name</label>
                <input type="text" className="w-full border rounded p-2" placeholder="e.g. Global Tech Summit 2026 VIP" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Secondary Royalty (%)</label>
                <input type="number" className="w-full border rounded p-2" placeholder="5" />
              </div>
              <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-md shadow hover:opacity-90">
                Deploy Smart Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NftTicketing;
