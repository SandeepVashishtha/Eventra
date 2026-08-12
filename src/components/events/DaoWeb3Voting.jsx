import React, { useState } from 'react';

const DaoWeb3Voting = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [voteStatus, setVoteStatus] = useState('idle'); // idle, signing, success
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Voting data
  const [results, setResults] = useState({
    for: 1450000,
    against: 850000,
    abstain: 120000
  });

  const userVotingPower = 42500; // Simulated token holding

  const handleConnect = () => {
    setWalletConnected(true);
  };

  const handleVote = (option) => {
    setSelectedOption(option);
    setVoteStatus('signing');

    // Simulate MetaMask signature delay
    setTimeout(() => {
      setVoteStatus('success');
      
      // Update results
      setResults(prev => ({
        ...prev,
        [option]: prev[option] + userVotingPower
      }));

    }, 2500);
  };

  const totalVotes = results.for + results.against + results.abstain;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Context (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/50 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚖️</span> Web3 Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            On-Chain <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">DAO Voting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Standard web polls are invalid for Decentralized Autonomous Organizations. Allow attendees to connect their Web3 wallets and sign gasless transactions (via Snapshot) to cast verifiable, token-weighted votes live during your keynote.
          </p>

          {/* Live Results Dashboard */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Governance Results</h3>
               <span className="bg-emerald-900/30 text-emerald-500 text-xs font-mono px-2 py-1 rounded border border-emerald-500/30 flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Network: Ethereum
               </span>
             </div>

             <div className="space-y-4">
               {/* FOR */}
               <div>
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-sm font-bold text-slate-300">FOR (Approve EIP-1559)</span>
                   <span className="text-sm font-mono text-emerald-400">{(results.for / 1000000).toFixed(2)}M Tokens</span>
                 </div>
                 <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(results.for / totalVotes) * 100}%` }}></div>
                 </div>
               </div>

               {/* AGAINST */}
               <div>
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-sm font-bold text-slate-300">AGAINST (Reject EIP-1559)</span>
                   <span className="text-sm font-mono text-rose-400">{(results.against / 1000000).toFixed(2)}M Tokens</span>
                 </div>
                 <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                   <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(results.against / totalVotes) * 100}%` }}></div>
                 </div>
               </div>

               {/* ABSTAIN */}
               <div>
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-sm font-bold text-slate-300">ABSTAIN</span>
                   <span className="text-sm font-mono text-slate-500">{(results.abstain / 1000000).toFixed(2)}M Tokens</span>
                 </div>
                 <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                   <div className="h-full bg-slate-600 transition-all duration-1000" style={{ width: `${(results.abstain / totalVotes) * 100}%` }}></div>
                 </div>
               </div>
             </div>

             <div className="mt-6 flex justify-between items-center text-xs text-slate-500 font-mono">
               <span>Total Quorum: {(totalVotes / 1000000).toFixed(2)}M UNI</span>
               <span>Block: 17482910</span>
             </div>
          </div>
        </div>

        {/* Right Side: Voting Interface (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* Top Bar */}
            <div className="h-12 bg-slate-950 flex justify-between items-center px-6">
              <span className="text-white font-bold text-sm">DAO Summit '26</span>
              {!walletConnected ? (
                <button 
                  onClick={handleConnect}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md transition flex items-center space-x-1"
                >
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span> Connect
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-mono text-slate-300">0x7F...3B9</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col p-6 relative bg-gradient-to-b from-slate-900 to-slate-950">
              
              {/* Proposal Header */}
              <div className="mb-6 border-b border-slate-800 pb-6">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-2">Proposal #42</span>
                <h2 className="text-xl font-black text-white mb-2">Deploy Treasury Funds to Layer 2 LP</h2>
                <p className="text-xs text-slate-400 leading-relaxed">Allocate 5% of the DAO treasury to provide liquidity on Arbitrum to reduce user transaction fees.</p>
              </div>

              {/* Voting Power (Only visible if connected) */}
              {walletConnected && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-200">Your Voting Power</span>
                  <span className="text-lg font-black text-blue-400 font-mono">{userVotingPower.toLocaleString()} UNI</span>
                </div>
              )}

              {/* Voting Actions */}
              <div className="space-y-3 flex-1">
                {voteStatus === 'idle' ? (
                  <>
                    <button 
                      onClick={() => handleVote('for')}
                      disabled={!walletConnected}
                      className={`w-full py-4 rounded-xl font-black text-sm transition border ${walletConnected ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/50' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'}`}
                    >
                      Vote FOR
                    </button>
                    <button 
                      onClick={() => handleVote('against')}
                      disabled={!walletConnected}
                      className={`w-full py-4 rounded-xl font-black text-sm transition border ${walletConnected ? 'bg-rose-900/30 text-rose-400 border-rose-500/50 hover:bg-rose-900/50' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'}`}
                    >
                      Vote AGAINST
                    </button>
                    <button 
                      onClick={() => handleVote('abstain')}
                      disabled={!walletConnected}
                      className={`w-full py-4 rounded-xl font-black text-sm transition border ${walletConnected ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'}`}
                    >
                      ABSTAIN
                    </button>
                  </>
                ) : voteStatus === 'signing' ? (
                  // Signing State (MetaMask Simulation)
                  <div className="absolute inset-x-6 top-1/3 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center animate-fade-in-up">
                    <div className="w-12 h-12 mb-4 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h4 className="text-white font-bold mb-1 text-center">Signature Request</h4>
                    <p className="text-[10px] text-slate-400 text-center font-mono">Please sign the gasless message in your wallet to cast your vote.</p>
                  </div>
                ) : (
                  // Success State
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <span className="text-emerald-500 text-4xl">✓</span>
                    </div>
                    <h4 className="text-white font-black text-xl mb-2">Vote Cast Successfully</h4>
                    <p className="text-xs text-slate-400 text-center mb-6">Your token-weighted vote for <span className="font-bold text-white uppercase">{selectedOption}</span> has been securely recorded on Snapshot.</p>
                    
                    <button 
                      onClick={() => { setVoteStatus('idle'); setSelectedOption(null); }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition"
                    >
                      ← Back to Proposals
                    </button>
                  </div>
                )}
              </div>
              
              {!walletConnected && (
                <div className="mt-auto text-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Connect Wallet to Vote</span>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DaoWeb3Voting;
