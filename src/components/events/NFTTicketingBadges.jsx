import React, { useState } from 'react';

const NFTTicketingBadges = () => {
  const [activeTab, setActiveTab] = useState('ticket');
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('idle');

  const ticketData = {
    eventName: "Web3 Summit 2026",
    ticketType: "VIP Access",
    contractAddress: "0x8f2a...39b4",
    tokenId: "8472",
    network: "Polygon POS",
    purchasePrice: "$450 USDC",
    royalty: "10%"
  };

  const simulateTransfer = () => {
    setIsMinting(true);
    setMintStatus('transferring');
    setTimeout(() => {
      setMintStatus('verifying');
      setTimeout(() => {
        setMintStatus('success');
        setIsMinting(false);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[650px] flex items-center justify-center font-sans text-slate-200">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight flex items-center">
              <span className="mr-3 text-white">🎫</span> NFT Smart Tickets
            </h2>
            <p className="text-sm text-slate-400 mt-1">Cryptographically secure, anti-scalp digital memorabilia.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button 
              onClick={() => setActiveTab('ticket')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'ticket' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              My Ticket
            </button>
            <button 
              onClick={() => setActiveTab('resale')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'resale' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              Resale Marketplace
            </button>
          </div>
        </div>

        {activeTab === 'ticket' && (
          <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
            {/* Visual NFT Card */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-sm group perspective-[1000px]">
                {/* Holographic effect layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50"></div>
                
                <div className="relative bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl overflow-hidden transform transition-transform duration-500 hover:rotate-y-6 hover:rotate-x-6">
                  <div className="h-48 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f4ec651?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-purple-900/50 text-purple-300 text-[10px] font-black uppercase px-2 py-1 rounded border border-purple-500/50">Verified Ticket</span>
                        <h3 className="text-2xl font-black text-white mt-2">{ticketData.eventName}</h3>
                      </div>
                      <div className="bg-white p-1 rounded-lg shadow-inner">
                        {/* Mock QR Code */}
                        <div className="w-12 h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover"></div>
                      </div>
                    </div>
                    
                    <p className="text-xl font-bold text-pink-400 mb-6">{ticketData.ticketType}</p>
                    
                    <div className="bg-slate-900 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500 uppercase font-bold tracking-widest">Network</p>
                        <p className="font-mono text-purple-300">{ticketData.network}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-bold tracking-widest">Token ID</p>
                        <p className="font-mono text-purple-300">#{ticketData.tokenId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Details & Actions */}
            <div className="w-full md:w-1/2 space-y-6 flex flex-col justify-center">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <h4 className="font-bold text-white mb-4">Smart Contract Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Contract Address</span>
                    <span className="font-mono text-blue-400 cursor-pointer hover:underline">{ticketData.contractAddress}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Purchase Price</span>
                    <span className="font-bold text-white">{ticketData.purchasePrice}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400">Secondary Royalty</span>
                    <span className="font-bold text-white">{ticketData.royalty} (Enforced via SC)</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-start space-x-3">
                <span className="text-blue-400 text-xl mt-0.5">🛡️</span>
                <div>
                  <h4 className="font-bold text-blue-300 text-sm">Anti-Scalping Enabled</h4>
                  <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                    This ticket's smart contract restricts secondary marketplace listing prices to a maximum of 110% of the original face value. The dynamic QR code rotates every 30 seconds to prevent screenshot fraud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resale' && (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 text-center animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2">Secure P2P Transfer</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Transfer your ticket to another wallet or list it on the regulated secondary market.
            </p>
            
            <div className="bg-slate-900 max-w-sm mx-auto p-6 rounded-2xl border border-slate-700 text-left relative overflow-hidden">
              
              {isMinting && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur flex flex-col items-center justify-center z-20 text-center p-6">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-white mb-1">
                    {mintStatus === 'transferring' ? 'Initiating SC Transfer...' : 'Verifying on Blockchain...'}
                  </p>
                  <p className="text-xs text-purple-400 font-mono">Awaiting confirmations on Polygon POS</p>
                </div>
              )}

              {mintStatus === 'success' && !isMinting ? (
                 <div className="absolute inset-0 bg-green-900/90 backdrop-blur flex flex-col items-center justify-center z-20 text-center p-6">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                   ✓
                 </div>
                 <h4 className="font-black text-white text-xl mb-1">Transfer Complete</h4>
                 <p className="text-xs text-green-300 font-mono break-all px-4">TxHash: 0x9a8b...f4c2</p>
                 <button onClick={() => setMintStatus('idle')} className="mt-6 text-sm font-bold text-white underline">Done</button>
               </div>
              ) : (
                <>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="0x..." 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mb-6"
                  />
                  
                  <div className="flex items-center justify-between mb-6 text-sm font-medium">
                    <span className="text-slate-400">Gas Fee (Estimated)</span>
                    <span className="text-white">~0.01 MATIC</span>
                  </div>

                  <button 
                    onClick={simulateTransfer}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition"
                  >
                    Transfer NFT Ticket
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTTicketingBadges;
