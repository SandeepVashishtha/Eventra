/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DAOGovernanceProtocol = () => {
  const [daoActive, setDaoActive] = useState(false);
  const [proposalState, setProposalState] = useState('VOTING'); // VOTING, TALLYING, EXECUTED
  
  // Voting Metrics
  const [totalTokens, setTotalTokens] = useState(150000);
  const [votesCast, setVotesCast] = useState(120450);
  
  const [proposals, setProposals] = useState([
    { id: 'PROP-01', title: 'Move "Illenium" to Main Stage (Sunset Slot)', yes: 85000, no: 12000, status: 'ACTIVE' },
    { id: 'PROP-02', title: 'Book Local Talent "DJ Null" for Opener', yes: 45000, no: 55000, status: 'ACTIVE' },
    { id: 'PROP-03', title: 'Allocate 10% of Budget to Techno Tent', yes: 95000, no: 5000, status: 'ACTIVE' }
  ]);

  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Web3 DAO Governance Contract initialized.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'Awaiting decentralized voter consensus.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (daoActive) {
      if (proposalState === 'VOTING') {
        loop = setInterval(() => {
          // Simulate live voting
          setProposals(prev => prev.map(p => {
             if (Math.random() > 0.6) {
                 const newYes = p.yes + Math.floor(Math.random() * 100);
                 const newNo = p.no + Math.floor(Math.random() * 50);
                 return { ...p, yes: newYes, no: newNo };
             }
             return p;
          }));
          
          setVotesCast(prev => prev + Math.floor(Math.random() * 150));
        }, 800);
      } else if (proposalState === 'TALLYING') {
        let step = 0;
        loop = setInterval(() => {
          step++;
          if (step > 15) {
             clearInterval(loop);
             setProposalState('EXECUTED');
             
             // Mark winners
             setProposals(prev => prev.map(p => ({
                 ...p,
                 status: p.yes > p.no ? 'PASSED' : 'REJECTED'
             })));

             addLog('SUCCESS', 'Smart Contract Execution Complete: Lineup Schedule mathematically finalized.');
             addLog('WEB3', 'Funds auto-allocated to passed booking proposals via Escrow.');
          }
        }, 200);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [daoActive, proposalState]);

  const executeContract = () => {
    if (daoActive && proposalState === 'VOTING') {
      setProposalState('TALLYING');
      addLog('ACTION', 'Voting period closed. Initiating cryptographic tally...');
      addLog('WEB3', 'Verifying token signatures against Merkle Root.');
    }
  };

  const resetDAO = () => {
    setProposalState('VOTING');
    setVotesCast(120450);
    setProposals([
      { id: 'PROP-01', title: 'Move "Illenium" to Main Stage (Sunset Slot)', yes: 85000, no: 12000, status: 'ACTIVE' },
      { id: 'PROP-02', title: 'Book Local Talent "DJ Null" for Opener', yes: 45000, no: 55000, status: 'ACTIVE' },
      { id: 'PROP-03', title: 'Allocate 10% of Budget to Techno Tent', yes: 95000, no: 5000, status: 'ACTIVE' }
    ]);
    addLog('SYS', 'Proposals reset for next governance epoch.');
  };

  const toggleDAO = () => {
    if (!daoActive) {
      setDaoActive(true);
      addLog('SYS', 'Decentralized Oracle Armed. Community Governance online.');
    } else {
      setDaoActive(false);
      resetDAO();
      addLog('WARN', 'DAO Offline. Reverting to centralized dictatorial scheduling.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040608] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🏛️</span> Web3 Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            DAO-Based Festival Lineup <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Governance Protocol</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival organizers traditionally dictate the lineup and set times behind closed doors, often causing massive backlash when fan-favorite underground artists are placed on small stages or left out entirely. Eventra democratizes curation by transitioning to a Decentralized Autonomous Organization (DAO) model. Fans holding NFT loyalty passes receive voting tokens. Through a secure smart contract interface, the community proposes and votes on which artists to book, stage placements, and set times. Once voting closes, the blockchain mathematically executes the highest-voted proposals, completely removing centralized bias.
          </p>

          <div className="bg-[#0b1016] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">⚖️</span> DAO Voting Dashboard
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleDAO}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     daoActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                   }`}
                 >
                   {daoActive ? 'Suspend Governance' : 'Initialize DAO Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Total Supply */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 daoActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Governance Tokens Supply
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     daoActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {totalTokens.toLocaleString()}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">$EVNT</span>
                 </div>
               </div>

               {/* Votes Cast */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 proposalState === 'TALLYING' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 daoActive ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Total Votes Cast
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     proposalState === 'TALLYING' ? 'text-indigo-400 animate-pulse' :
                     daoActive ? 'text-purple-400' : 'text-slate-600'
                   }`}>
                     {daoActive ? votesCast.toLocaleString() : '0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Votes</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020305] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ethereum Virtual Machine Log</span>
                 {proposalState === 'TALLYING' && <span className="text-cyan-400 animate-pulse">Hashing Block...</span>}
                 {proposalState === 'EXECUTED' && <span className="text-emerald-400 animate-pulse">SMART CONTRACT EXECUTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-purple-400 font-bold' : 'text-slate-400'
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
            
            {/* DAO Proposal Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">ACTIVE SMART CONTRACTS</span>
                <span className="text-[8px] font-mono text-slate-400">PROPOSAL QUEUE</span>
              </div>

              <div className="flex-1 relative bg-[#020406] overflow-hidden flex flex-col p-4 pt-12 space-y-4">
                
                {!daoActive ? (
                   <div className="flex-1 flex items-center justify-center">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">CONTRACT OFFLINE</span>
                   </div>
                ) : (
                  <>
                    {/* Render Proposals */}
                    {proposals.map(prop => {
                       const total = prop.yes + prop.no;
                       const yesPct = total === 0 ? 50 : (prop.yes / total) * 100;
                       
                       let statusVisual = null;
                       if (prop.status === 'PASSED') statusVisual = <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded border-2 border-[#020406] shadow-lg animate-bounce">PASSED</span>;
                       if (prop.status === 'REJECTED') statusVisual = <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded border-2 border-[#020406] shadow-lg">REJECTED</span>;

                       return (
                         <div key={prop.id} className={`w-full bg-slate-900 border ${prop.status === 'PASSED' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : prop.status === 'REJECTED' ? 'border-red-900 opacity-50' : 'border-slate-700'} rounded-lg p-3 relative transition-all duration-500`}>
                            {statusVisual}
                            <span className="text-[8px] font-mono text-purple-400 block mb-1">{prop.id}</span>
                            <span className="text-[11px] font-bold text-white block mb-3 leading-tight">{prop.title}</span>
                            
                            {/* Voting Bar */}
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                               <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${yesPct}%` }}></div>
                               <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${100 - yesPct}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between mt-1 text-[8px] font-mono">
                               <span className="text-emerald-400">YES: {prop.yes.toLocaleString()}</span>
                               <span className="text-red-400">NO: {prop.no.toLocaleString()}</span>
                            </div>
                         </div>
                       )
                    })}
                  </>
                )}

                {/* Tallying Overlay */}
                {proposalState === 'TALLYING' && (
                   <div className="absolute inset-0 bg-indigo-950/60 z-40 flex flex-col items-center justify-center backdrop-blur-[3px]">
                      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">VERIFYING SIGNATURES</span>
                      <span className="text-[8px] font-mono text-slate-300 bg-black px-2 py-1 rounded">Executing Smart Contract...</span>
                   </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={executeContract}
                disabled={!daoActive || proposalState !== 'VOTING'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !daoActive || proposalState !== 'VOTING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Execute Voting Tally
              </button>
              
              <button 
                onClick={resetDAO}
                disabled={!daoActive || proposalState === 'VOTING'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !daoActive || proposalState === 'VOTING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Start Next Epoch
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DAOGovernanceProtocol;
