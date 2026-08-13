/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DaoLineupVoting = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  
  // Web3 Metrics
  const [totalVotesCast, setTotalVotesCast] = useState(142050); 
  const [activeVoters, setActiveVoters] = useState(8402); 
  const [smartContractGas, setSmartContractGas] = useState(12.5); // Gwei
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Ethereum Provider (MetaMask) not detected. Awaiting connection.' },
    { id: 2, time: '18:00:02', type: 'SYS', msg: 'Polling EventraDAO Governance Contract (0x8F2a...3C91)' }
  ]);

  // Visualizer State
  const [artists, setArtists] = useState([
      { id: 1, name: 'Neon Syndicate', genre: 'Synthwave', votes: 45200, percentage: 32 },
      { id: 2, name: 'DJ Quantum', genre: 'Techno', votes: 38100, percentage: 27 },
      { id: 3, name: 'The Void Project', genre: 'Bass', votes: 32500, percentage: 23 },
      { id: 4, name: 'Echo Chamber', genre: 'House', votes: 26250, percentage: 18 }
  ]);

  useEffect(() => {
    let loop;
    
    if (walletConnected) {
      loop = setInterval(() => {
          setSmartContractGas(10 + (Math.random() * 5)); // Fluctuating gas fees
          
          // Randomly simulate other users voting
          if (Math.random() > 0.7) {
              const newVotes = Math.floor(Math.random() * 100);
              setTotalVotesCast(prev => prev + newVotes);
              setActiveVoters(prev => prev + Math.floor(Math.random() * 3));
          }
      }, 2000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [walletConnected]);

  const connectWallet = () => {
      addLog('ACTION', 'Initiating Web3 Wallet connection via WalletConnect...');
      setTimeout(() => {
          setWalletConnected(true);
          setWalletAddress('0x71C...9B2A');
          setTokenBalance(500); // 500 $EVNT tokens
          addLog('SUCCESS', 'Wallet 0x71C...9B2A connected. Fetched ERC-20 balance: 500 $EVNT');
      }, 800);
  };

  const castVote = (artistId, artistName) => {
      if (!walletConnected || tokenBalance < 50 || isVoting) return;
      
      setIsVoting(true);
      addLog('ACTION', `Drafting smart contract transaction to vote for ${artistName}...`);
      
      setTimeout(() => {
          addLog('SYS', 'Signing transaction... waiting for block confirmation (PoS).');
          
          setTimeout(() => {
              setTokenBalance(prev => prev - 50);
              setTotalVotesCast(prev => prev + 50);
              
              // Update local state
              setArtists(prev => {
                  const updated = prev.map(a => {
                      if (a.id === artistId) return { ...a, votes: a.votes + 50 };
                      return a;
                  });
                  // Recalculate percentages
                  const total = updated.reduce((acc, a) => acc + a.votes, 0);
                  return updated.map(a => ({ ...a, percentage: Math.round((a.votes / total) * 100) })).sort((a, b) => b.votes - a.votes);
              });
              
              addLog('SUCCESS', `Tx Confirmed! Staked 50 $EVNT for ${artistName}.`);
              setIsVoting(false);
          }, 1500);
          
      }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0a0512] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 & Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-yellow-500">Organization (DAO) Voting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival organizers spend millions booking artists based on guesswork, often resulting in stages that are empty while others are dangerously overcrowded due to misjudged hype. Eventra solves this by creating a Web3 DAO module. Attendees who purchase early-bird tickets are minted ERC-20 governance tokens ($EVNT). They can connect their Web3 wallets to the React frontend and stake tokens on smart contracts to vote on which mid-tier artists should be elevated to headliners. This decentralized software system provides perfect predictive data on crowd distribution.
          </p>

          <div className="bg-[#120820] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Web3 Network Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={connectWallet}
                   disabled={walletConnected}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     walletConnected ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                   }`}
                 >
                   {walletConnected ? 'Wallet Connected' : 'Connect MetaMask'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Total Votes */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 walletConnected ? 'bg-fuchsia-950/20 border-fuchsia-500/30' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Total $EVNT Staked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     walletConnected ? 'text-fuchsia-400' : 'text-slate-600'
                   }`}>
                     {(totalVotesCast / 1000).toFixed(1)}k
                   </span>
                 </div>
               </div>

               {/* Active Voters */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 walletConnected ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DAO Voters
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     walletConnected ? 'text-amber-400' : 'text-slate-600'
                   }`}>
                     {activeVoters}
                   </span>
                 </div>
               </div>
               
               {/* Gas Fees */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Network Gas
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {smartContractGas.toFixed(0)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Gwei</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#05020a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>EVM Transaction Ledger</span>
                 {isVoting && <span className="text-fuchsia-400 font-black animate-pulse">SIGNING TX...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-yellow-500 font-bold' :
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] flex flex-col items-center">
            
            {/* dApp UI Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6 transition-all duration-500 bg-[#0d0716]`}>
              
              <div className="pt-12 pb-4 px-6 border-b border-purple-900/50 flex justify-between items-center z-40 bg-purple-950/20 backdrop-blur-md">
                  <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow-md">Eventra DAO</span>
                  <div className="flex gap-2">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border flex items-center ${walletConnected ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {walletConnected ? '🟢 CONNECTED' : '🔴 OFFLINE'}
                      </span>
                  </div>
              </div>

              <div className="flex-1 relative overflow-y-auto p-4">
                  
                  {/* User Wallet Info */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 border border-purple-500/30 rounded-xl p-4 mb-6 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest block mb-1">Your Wallet</span>
                              <span className="text-sm font-mono text-white bg-black/40 px-2 py-0.5 rounded">
                                  {walletConnected ? walletAddress : 'Not Connected'}
                              </span>
                          </div>
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400/50">
                              <span className="text-sm">🦊</span>
                          </div>
                      </div>
                      <div className="flex justify-between items-end">
                          <div>
                              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest block mb-1">Voting Power</span>
                              <span className="text-2xl font-black text-white font-mono">
                                  {tokenBalance} <span className="text-xs text-purple-400">$EVNT</span>
                              </span>
                          </div>
                      </div>
                  </div>

                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Elevate to Headliner</h3>

                  {/* Artists Voting List */}
                  <div className="space-y-4">
                      {artists.map((artist, index) => (
                          <div key={artist.id} className="bg-black/40 border border-slate-800 rounded-lg p-3 relative overflow-hidden group">
                              
                              {/* Background progress bar */}
                              <div 
                                  className="absolute top-0 bottom-0 left-0 bg-purple-900/20 transition-all duration-1000 z-0" 
                                  style={{ width: `${artist.percentage}%` }}
                              ></div>
                              
                              <div className="relative z-10 flex justify-between items-center mb-2">
                                  <div>
                                      <span className="text-sm font-black text-white block">
                                          <span className="text-purple-400 mr-2">#{index + 1}</span>{artist.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{artist.genre}</span>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-lg font-black text-white font-mono block leading-none">{artist.percentage}%</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{(artist.votes / 1000).toFixed(1)}k votes</span>
                                  </div>
                              </div>

                              <button 
                                  onClick={() => castVote(artist.id, artist.name)}
                                  disabled={!walletConnected || tokenBalance < 50 || isVoting}
                                  className={`w-full py-2 rounded text-[10px] font-black uppercase tracking-widest mt-2 transition relative z-10 ${
                                      !walletConnected || tokenBalance < 50 || isVoting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                                      'bg-purple-600 hover:bg-purple-500 text-white'
                                  }`}
                              >
                                  {isVoting ? 'Signing...' : 'Stake 50 $EVNT'}
                              </button>
                          </div>
                      ))}
                  </div>

              </div>
              
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DaoLineupVoting;
