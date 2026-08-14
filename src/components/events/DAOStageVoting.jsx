/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DAOStageVoting = () => {
  const [voteCast, setVoteCast] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [candidate1Votes, setCandidate1Votes] = useState(14021);
  const [candidate2Votes, setCandidate2Votes] = useState(13988);
  const [selectedCandidate, setSelectedCandidate] = useState(null); // 1 or 2
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'DAO Governance Contract loaded. 50,000 $EVNT tokens distributed to VIP wallets.' }
  ]);

  const castVote = (candidateNum) => {
      if (voteCast || isVoting) return;
      setIsVoting(true);
      setSelectedCandidate(candidateNum);
      
      const artistName = candidateNum === 1 ? 'Skrillex' : 'Fred Again..';
      addLog('ACTION', `User initiated DAO transaction. Voting for ${artistName}.`);
      
      setTimeout(() => {
          addLog('SYS', 'Cryptographically signing payload with VIP wallet private key...');
          
          setTimeout(() => {
              setIsVoting(false);
              setVoteCast(true);
              
              if (candidateNum === 1) {
                  setCandidate1Votes(prev => prev + 1);
              } else {
                  setCandidate2Votes(prev => prev + 1);
              }
              
              addLog('SUCCESS', `Transaction confirmed on ledger. 1 $EVNT token burned.`);
              addLog('WARN', 'One-ticket-one-vote protocol enforced. Duplicate voting disabled for this wallet.');
          }, 2000);
      }, 1000);
  };
  
  const resetDemo = () => {
      setVoteCast(false);
      setSelectedCandidate(null);
      setCandidate1Votes(14021);
      setCandidate2Votes(13988);
      addLog('SYS', 'Demo reset. $EVNT voting token restored to wallet.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const totalVotes = candidate1Votes + candidate2Votes;
  const p1 = ((candidate1Votes / totalVotes) * 100).toFixed(1);
  const p2 = ((candidate2Votes / totalVotes) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#06030a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏛️</span> DAOs & Web3 Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Autonomous <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-amber-500">Stage Voting</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festivals struggle to engage hardcore fans in programming decisions, relying on inaccurate Twitter polls that are easily manipulated by bots to decide which artist should play the encore. Eventra solves this by building a DAO voting portal for VIP ticket holders. Attendees are issued cryptographic voting tokens anchored to their ticket ID. The blockchain ledger ensures one-ticket-one-vote, providing a cryptographically verifiable, completely bot-proof polling mechanism.
          </p>

          <div className="bg-[#0c0512] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> Web3 Voter Terminal
               </h3>
               {voteCast && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col justify-center items-center mb-4">
                 
                 <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md relative overflow-hidden shadow-2xl">
                     
                     <div className="text-center mb-6">
                         <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">VIP Exclusive Governance</span>
                         <h4 className="text-white font-bold text-lg">Who plays the secret encore?</h4>
                     </div>

                     <div className="space-y-4">
                         
                         {/* Candidate 1 */}
                         <button 
                             onClick={() => castVote(1)}
                             disabled={voteCast || isVoting}
                             className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all relative overflow-hidden ${
                                 selectedCandidate === 1 ? 'border-amber-500 bg-amber-950/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                             } ${voteCast && selectedCandidate !== 1 ? 'opacity-50' : ''}`}
                         >
                             {voteCast && <div className="absolute top-0 left-0 h-full bg-amber-900/20 z-0 transition-all duration-1000" style={{ width: `${p1}%` }}></div>}
                             <div className="flex items-center z-10">
                                 <div className="w-10 h-10 rounded-full bg-purple-900 text-white flex items-center justify-center text-xl mr-4">🎧</div>
                                 <span className="font-bold text-white">Skrillex</span>
                             </div>
                             <div className="z-10 text-right">
                                 {voteCast ? (
                                     <span className="font-mono font-black text-amber-400">{p1}%</span>
                                 ) : (
                                     <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded">Vote</span>
                                 )}
                             </div>
                         </button>

                         {/* Candidate 2 */}
                         <button 
                             onClick={() => castVote(2)}
                             disabled={voteCast || isVoting}
                             className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all relative overflow-hidden ${
                                 selectedCandidate === 2 ? 'border-amber-500 bg-amber-950/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                             } ${voteCast && selectedCandidate !== 2 ? 'opacity-50' : ''}`}
                         >
                             {voteCast && <div className="absolute top-0 left-0 h-full bg-amber-900/20 z-0 transition-all duration-1000" style={{ width: `${p2}%` }}></div>}
                             <div className="flex items-center z-10">
                                 <div className="w-10 h-10 rounded-full bg-fuchsia-900 text-white flex items-center justify-center text-xl mr-4">🎹</div>
                                 <span className="font-bold text-white">Fred Again..</span>
                             </div>
                             <div className="z-10 text-right">
                                 {voteCast ? (
                                     <span className="font-mono font-black text-amber-400">{p2}%</span>
                                 ) : (
                                     <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded">Vote</span>
                                 )}
                             </div>
                         </button>

                     </div>

                     {/* Wallet Status */}
                     <div className="mt-6 flex justify-between items-center border-t border-slate-800 pt-4 text-[10px] font-mono">
                         <div className="flex items-center">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                             <span className="text-slate-400">Wallet: 0x82...f9A</span>
                         </div>
                         <div className="flex items-center">
                             <span className="text-slate-500 mr-2">Balance:</span>
                             <span className={`font-black ${voteCast ? 'text-rose-500 line-through' : 'text-amber-400'}`}>1 $EVNT</span>
                         </div>
                     </div>

                 </div>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040208] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ethereum Virtual Machine Logs</span>
                 {isVoting && <span className="text-fuchsia-400 font-black animate-pulse">SIGNING TX...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-fuchsia-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Blockchain Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Distributed Ledger</span>
                      <span className="text-xs text-white font-bold">Smart Contract State</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center">
                  
                  {/* Smart Contract Box */}
                  <div className={`w-full border-2 rounded-xl p-4 flex flex-col mb-6 relative z-10 transition-all duration-1000 ${
                      isVoting ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]' :
                      voteCast ? 'bg-slate-900 border-slate-700' :
                      'bg-slate-900 border-slate-700'
                  }`}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-white">DAO Governance Contract</span>
                          <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">0xDAO...ff</span>
                      </div>
                      
                      <div className="bg-black/50 p-3 rounded font-mono text-[9px] text-slate-400 space-y-1">
                          <div><span className="text-fuchsia-400">function</span> castVote(uint candidateId) {'{'}</div>
                          <div className="pl-4"><span className="text-amber-400">require</span>(balances[msg.sender] >= 1);</div>
                          <div className="pl-4">balances[msg.sender] -= 1;</div>
                          <div className="pl-4">votes[candidateId] += 1;</div>
                          <div>{'}'}</div>
                      </div>
                  </div>

                  {/* Blockchain Blocks Visualizer */}
                  <div className="w-full flex-1 flex flex-col space-y-2 relative">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Ledger Blocks</span>
                      
                      {/* Previous Block */}
                      <div className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[8px] font-mono text-slate-500 flex justify-between items-center opacity-50">
                          <span>Block #14,204,991</span>
                          <span>Hash: 0x9a2b...</span>
                      </div>
                      
                      {/* Connection Line */}
                      <div className="w-0.5 h-4 bg-slate-800 mx-auto"></div>

                      {/* Current Block */}
                      <div className={`w-full border rounded p-2 text-[8px] font-mono transition-all duration-1000 relative overflow-hidden ${
                          voteCast ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                          {isVoting && (
                              <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-10">
                                  <div className="w-4 h-4 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span className="text-fuchsia-400 animate-pulse">MINING TX...</span>
                              </div>
                          )}
                          <div className="flex justify-between items-center mb-1">
                              <span>Block #14,204,992</span>
                              <span>{voteCast ? 'Confirmed' : 'Pending'}</span>
                          </div>
                          {voteCast && (
                              <div className="bg-black/50 p-1 rounded mt-1 text-slate-300">
                                  Tx: 0x82..f9A voted for Cand_{selectedCandidate} (Cost: 1 $EVNT)
                              </div>
                          )}
                      </div>

                      {/* Bot Mitigation Overlay */}
                      {voteCast && (
                          <div className="absolute -bottom-4 left-0 right-0 bg-amber-950/90 border border-amber-500/50 rounded-xl p-3 backdrop-blur-md animate-[bounce_0.5s_ease-out] z-20">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Sybill Attack Prevented</span>
                                  <span className="text-lg">🛡️</span>
                              </div>
                              <p className="text-[9px] text-amber-200/80">User balance is now 0 $EVNT. The cryptographic ledger makes it mathematically impossible for this user (or a bot) to vote a second time.</p>
                          </div>
                      )}
                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0c0512] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Cryptographic Governance:</span>
               Select an artist to <span className="text-white font-bold bg-slate-800 px-1 rounded">Vote</span>. A traditional Google Form or Twitter poll allows a single Python script to submit 10,000 fake votes, ruining the fan experience. By tying a Web3 Smart Contract directly to the ticketing database, each VIP ticket is issued exactly 1 cryptographic $EVNT token. When you vote, you spend your token on the blockchain. The ledger provides absolute, mathematical certainty that one ticket equals one vote.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DAOStageVoting;
