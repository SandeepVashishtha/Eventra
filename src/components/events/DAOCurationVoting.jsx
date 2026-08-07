/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DAOCurationVoting = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [governanceTokens, setGovernanceTokens] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingActive, setVotingActive] = useState(true);

  // Voting options for the "Community Stage" Friday Headliner
  const [artists, setArtists] = useState([
    { id: 1, name: 'The Midnight', genre: 'Synthwave', votes: 14250, selected: false, img: 'TM' },
    { id: 2, name: 'Tchami', genre: 'House', votes: 12100, selected: false, img: 'TC' },
    { id: 3, name: 'Knocked Loose', genre: 'Hardcore', votes: 8900, selected: false, img: 'KL' },
    { id: 4, name: 'Denzel Curry', genre: 'Hip-Hop', votes: 11400, selected: false, img: 'DC' }
  ]);

  const [chainLog, setChainLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'DAO Smart Contract initialized on Base L2.' },
    { id: 2, time: '09:00:05', type: 'SYS', msg: 'Governance Token ($EVN) airdropped to verified ticket holders.' }
  ]);

  useEffect(() => {
    let loop;
    if (votingActive) {
      loop = setInterval(() => {
        // Simulate live incoming votes from the community
        setArtists(prev => prev.map(artist => {
          if (Math.random() > 0.6) {
            return { ...artist, votes: artist.votes + Math.floor(Math.random() * 5 + 1) };
          }
          return artist;
        }));
      }, 2000);
    }
    return () => clearInterval(loop);
  }, [votingActive]);

  const connectWallet = () => {
    if (!walletConnected) {
      addLog('WALLET', 'Connecting to MetaMask / WalletConnect...');
      setTimeout(() => {
        setWalletConnected(true);
        setWalletAddress('0x71C...3aF2');
        setGovernanceTokens(100); // User gets 100 tokens to vote with
        addLog('SUCCESS', 'Wallet connected. Ticket NFT verified. Balance: 100 $EVN.');
      }, 800);
    }
  };

  const castVote = (artistId) => {
    if (walletConnected && !hasVoted && governanceTokens > 0) {
      setHasVoted(true);
      
      // Update UI optimistically
      setArtists(prev => prev.map(a => 
        a.id === artistId ? { ...a, votes: a.votes + governanceTokens, selected: true } : a
      ));
      
      const targetArtist = artists.find(a => a.id === artistId);
      
      addLog('TX', `Initiating Smart Contract interaction: Vote for ${targetArtist.name}.`);
      setGovernanceTokens(0);
      
      setTimeout(() => {
        addLog('SUCCESS', `Transaction confirmed on Base L2. 100 $EVN staked on ${targetArtist.name}.`);
      }, 1500);
    }
  };

  const closeVoting = () => {
    setVotingActive(false);
    
    // Find winner
    const sorted = [...artists].sort((a, b) => b.votes - a.votes);
    const winner = sorted[0];
    
    addLog('SYS', 'Voting period concluded. Tallying smart contract state...');
    setTimeout(() => {
      addLog('SUCCESS', `DAO Consensus Reached: ${winner.name} officially booked for the Community Stage!`);
    }, 1000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setChainLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const totalVotes = artists.reduce((sum, a) => sum + a.votes, 0);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Explanation (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏛️</span> Web3 Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            DAO-Driven Stage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Curation & Voting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival organizers often guess what smaller artists the crowd wants to see, leading to empty side stages and disconnected fans. Running Twitter polls doesn't work because they are easily botted by fake accounts. Eventra solves this via a Decentralized Autonomous Organization (DAO). Attendees receive $EVN governance tokens securely tied to their ticket NFT. This allows real attendees to vote on a smart contract to curate the exact lineup for the "Community Stage," cryptographically ensuring zero bot manipulation and guaranteeing massive crowd engagement.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">⛓️</span> Smart Contract Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={closeVoting}
                   disabled={!votingActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-sm border border-slate-700 ${
                     !votingActive ? 'opacity-50 cursor-not-allowed bg-slate-900 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                   }`}
                 >
                   Execute Deadline
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Contract State */}
               <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Total Tokens Staked</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-white leading-none">
                     {(totalVotes / 1000).toFixed(1)}k
                   </span>
                   <span className="text-sm font-bold text-slate-600 ml-2 pb-1">$EVN</span>
                 </div>
                 
                 <div className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${votingActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                   {votingActive ? 'Voting Open (Base L2)' : 'Consensus Reached'}
                 </div>
               </div>

               {/* Active Leader */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 !votingActive ? 'bg-blue-950/40 border-blue-500/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">
                   {votingActive ? 'Current Leader' : 'Official Booking Winner'}
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black leading-tight truncate ${
                     !votingActive ? 'text-blue-400' : 'text-slate-300'
                   }`}>
                     {[...artists].sort((a, b) => b.votes - a.votes)[0].name}
                   </span>
                   <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                     Majority Consensus
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Blockchain Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {chainLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'TX' ? 'text-blue-300' :
                       log.type === 'WALLET' ? 'text-purple-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[2.5rem] border-8 border-slate-800 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700 backdrop-blur-md">
                Eventra Attendee App
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-50 pt-16 p-5">
               
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 leading-tight">DAO Voting</h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Community Stage - Fri</p>
                 </div>
                 
                 {/* Wallet Connection */}
                 {walletConnected ? (
                   <div className="bg-emerald-50 border border-emerald-200 px-2 py-1.5 rounded-lg flex flex-col items-end">
                     <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Wallet Linked</span>
                     <span className="text-[10px] font-mono text-emerald-800">{walletAddress}</span>
                   </div>
                 ) : (
                   <button 
                     onClick={connectWallet}
                     className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition shadow-sm"
                   >
                     Connect Wallet
                   </button>
                 )}
               </div>

               {/* Token Balance */}
               <div className={`mb-6 rounded-xl p-4 border transition-all ${
                 walletConnected ? 'bg-gradient-to-br from-blue-600 to-indigo-800 border-indigo-500 text-white shadow-lg' : 'bg-slate-100 border-slate-200 text-slate-400'
               }`}>
                 <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-80">Voting Power Available</p>
                 <div className="flex items-end">
                   <span className="text-3xl font-black font-mono leading-none">{walletConnected ? governanceTokens : 0}</span>
                   <span className="text-sm font-bold ml-1 pb-0.5">$EVN</span>
                 </div>
               </div>

               {/* Voting Options */}
               <div className="flex-1 flex flex-col space-y-3 relative overflow-hidden pb-4">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">Select Friday Headliner</p>
                 
                 <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-1">
                   {artists.sort((a,b) => b.votes - a.votes).map((artist, index) => {
                     const isWinner = !votingActive && index === 0;
                     const winPercent = ((artist.votes / totalVotes) * 100).toFixed(1);
                     
                     return (
                       <div 
                         key={artist.id} 
                         className={`relative rounded-xl border p-3 flex flex-col transition-all overflow-hidden ${
                           artist.selected ? 'bg-blue-50 border-blue-300' :
                           isWinner ? 'bg-emerald-50 border-emerald-300 shadow-md' :
                           'bg-white border-slate-200 hover:border-blue-200'
                         }`}
                       >
                         {/* Progress bar background */}
                         <div 
                           className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-500 ${
                             isWinner ? 'bg-emerald-500' : 'bg-blue-500'
                           }`}
                           style={{ width: `${winPercent}%` }}
                         ></div>

                         <div className="relative z-10 flex justify-between items-center w-full">
                           <div className="flex items-center">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white mr-3 ${
                               isWinner ? 'bg-emerald-500' : artist.selected ? 'bg-blue-500' : 'bg-slate-800'
                             }`}>
                               {artist.img}
                             </div>
                             <div>
                               <p className="text-sm font-black text-slate-900 leading-tight">{artist.name}</p>
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{artist.genre}</p>
                             </div>
                           </div>
                           
                           {votingActive ? (
                             <button
                               onClick={() => castVote(artist.id)}
                               disabled={!walletConnected || hasVoted}
                               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                 artist.selected ? 'bg-blue-600 text-white' :
                                 hasVoted || !walletConnected ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                                 'bg-white border border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                               }`}
                             >
                               {artist.selected ? 'Voted' : 'Vote'}
                             </button>
                           ) : (
                             <div className="text-right">
                               <p className={`text-[10px] font-black uppercase tracking-widest ${isWinner ? 'text-emerald-600' : 'text-slate-400'}`}>
                                 {winPercent}%
                               </p>
                             </div>
                           )}
                         </div>
                         
                         {/* Live Vote Count */}
                         <div className="relative z-10 mt-2 flex justify-between items-end border-t border-slate-100/50 pt-2">
                           <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Live Staked</span>
                           <span className="text-xs font-mono font-black text-slate-700">{artist.votes.toLocaleString()} EVN</span>
                         </div>
                       </div>
                     );
                   })}
                 </div>

               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DAOCurationVoting;
