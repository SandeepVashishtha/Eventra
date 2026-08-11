/* eslint-disable */
import React, { useState } from 'react';

const QuantumLotterySystem = () => {
  const [lotteryState, setLotteryState] = useState('idle'); // idle, connecting, fluctuating, drawn
  
  const [qLog, setQLog] = useState([
    { id: 1, time: '21:30:00', type: 'SYS', msg: 'Lottery Engine Initialized. 45,210 eligible ticket holders in pool.' }
  ]);

  const [quantumData, setQuantumData] = useState([]);
  const [winner, setWinner] = useState(null);

  const drawLottery = () => {
    setLotteryState('connecting');
    setWinner(null);
    setQuantumData([]);
    addLog('NET', 'Establishing secure tunnel to ANU Quantum Random Number Generator API...');
    
    setTimeout(() => {
      addLog('NET', 'Connection successful. Requesting quantum vacuum fluctuation entropy block.');
      setLotteryState('fluctuating');
      
      // Simulate reading quantum fluctuations
      let ticks = 0;
      const qLoop = setInterval(() => {
        ticks++;
        setQuantumData(prev => {
          const newHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
          return [...prev, newHex].slice(-24); // Keep last 24 hex pairs
        });

        if (ticks > 25) {
          clearInterval(qLoop);
          
          // Generate final true random number
          const finalRaw = Math.floor(Math.random() * 45210); // Simulated True RNG mapping
          addLog('Q-SYS', 'Vacuum fluctuation block received. Translating raw hex to integer mapping.');
          
          setTimeout(() => {
            setWinner({
              ticket: `TKT-${finalRaw.toString().padStart(5, '0')}`,
              name: 'Alex J.',
              seat: 'Sec 104, Row G',
              prize: 'VIP Backstage Meet & Greet'
            });
            addLog('SUCCESS', `Mathematically True Random Winner Drawn: TKT-${finalRaw.toString().padStart(5, '0')}`);
            setLotteryState('drawn');
            
            setTimeout(() => {
              resetSim();
            }, 7000);
          }, 1500);
        }
      }, 100);
      
    }, 1200);
  };

  const resetSim = () => {
    setLotteryState('idle');
    setWinner(null);
    setQuantumData([]);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setQLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚛️</span> Advanced Cryptography / Physics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Quantum Random Number <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Generator Lottery</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When organizers run digital lotteries for highly coveted backstage passes, attendees constantly claim the system is rigged or biased by standard pseudo-random number algorithms (like Math.random). Eventra integrates its lottery backend with a Quantum Random Number Generator (QRNG) API. This generates perfectly unbiased, mathematically true random numbers by measuring subatomic quantum vacuum fluctuations—cryptographically proving to the crowd that the upgrade lottery was 100% fair.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎲</span> QRNG Mainframe
               </h3>
               
               <button 
                 onClick={lotteryState === 'idle' ? drawLottery : null}
                 disabled={lotteryState !== 'idle'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   lotteryState !== 'idle' ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' :
                   'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                 }`}
               >
                 {lotteryState !== 'idle' ? 'Calculating Entropy...' : 'Initiate Quantum Draw'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Raw Hex Data Stream */}
               <div className="col-span-1 p-4 rounded-xl border border-slate-800 bg-slate-900 relative overflow-hidden h-32 flex flex-col">
                 {lotteryState === 'fluctuating' && (
                   <div className="absolute inset-0 bg-cyan-500/5 animate-pulse z-0 pointer-events-none"></div>
                 )}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 relative z-10 border-b border-slate-800 pb-1 flex justify-between">
                   <span>Vacuum Fluctuations</span>
                   {lotteryState === 'fluctuating' && <span className="text-cyan-400 animate-pulse">REC</span>}
                 </span>
                 <div className="flex-1 flex flex-wrap gap-1 content-start relative z-10 pt-1">
                   {lotteryState === 'idle' && (
                     <span className="text-xs text-slate-600 font-mono italic">Awaiting API payload...</span>
                   )}
                   {quantumData.map((hex, i) => (
                     <span key={i} className="text-[10px] font-mono text-cyan-500 bg-black px-1 rounded animate-fade-in">{hex}</span>
                   ))}
                 </div>
               </div>

               {/* Cryptographic Result */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 h-32 ${
                 lotteryState === 'drawn' ? 'bg-emerald-900/20 border-emerald-500/40 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Cryptographic Verification</span>
                 <div className="flex flex-col">
                   {lotteryState === 'drawn' ? (
                     <>
                       <span className="text-xl font-black font-mono text-white leading-tight">
                         {winner?.ticket}
                       </span>
                       <span className="text-[9px] font-bold text-emerald-400 mt-1 uppercase tracking-widest bg-emerald-900/50 inline-block w-max px-2 py-0.5 rounded">
                         True Randomness Guaranteed
                       </span>
                     </>
                   ) : (
                     <span className="text-2xl font-black font-mono text-slate-700 leading-tight">
                       PENDING
                     </span>
                   )}
                 </div>
               </div>

             </div>

             {/* API / System Log */}
             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Quantum Subsystem Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {qLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'Q-SYS' ? 'text-cyan-400 font-bold' :
                       log.type === 'NET' ? 'text-blue-300' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Jumbo-Tron Visualizer Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-lg border-8 border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-4 text-center z-30 pointer-events-none">
              <span className="bg-white/10 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                Main Stage Jumbotron
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-950 overflow-hidden">
               
               {/* Abstract Quantum Background */}
               <div className="absolute inset-0 z-0">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
                 {lotteryState === 'fluctuating' && (
                   <div className="absolute inset-0">
                     {/* Simulating subatomic particles popping in and out */}
                     {[...Array(30)].map((_, i) => (
                       <div 
                         key={i} 
                         className="absolute bg-cyan-400 rounded-full animate-ping opacity-0"
                         style={{
                           left: `${Math.random()*100}%`,
                           top: `${Math.random()*100}%`,
                           width: `${Math.random()*6 + 2}px`,
                           height: `${Math.random()*6 + 2}px`,
                           animationDuration: `${Math.random()*0.5 + 0.2}s`,
                           animationDelay: `${Math.random()}s`
                         }}
                       ></div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Center UI Content */}
               <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
                 
                 {lotteryState === 'idle' ? (
                   <div className="text-center animate-pulse">
                     <span className="text-5xl mb-4 block">🎁</span>
                     <h2 className="font-black text-white text-3xl uppercase tracking-widest leading-tight">VIP Upgrade<br/>Lottery</h2>
                     <p className="text-xs text-cyan-500 font-bold uppercase tracking-widest mt-4">Powered by Quantum Entropy</p>
                   </div>
                 ) : lotteryState === 'connecting' ? (
                   <div className="text-center">
                     <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                     <h2 className="font-black text-white text-xl uppercase tracking-widest">Connecting to<br/>Quantum Core</h2>
                   </div>
                 ) : lotteryState === 'fluctuating' ? (
                   <div className="text-center w-full">
                     <h2 className="font-black text-white text-xl uppercase tracking-widest mb-6">Measuring Vacuum<br/>Fluctuations</h2>
                     
                     {/* Digital Scramble Effect */}
                     <div className="bg-black/80 border border-cyan-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                       <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-2">Generating True Randomness</p>
                       <div className="text-5xl font-black font-mono text-white opacity-90 blur-[1px]">
                         TKT-{Math.floor(Math.random() * 99999).toString().padStart(5, '0')}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center w-full animate-fade-in-up">
                     
                     <div className="absolute top-10 inset-x-0 flex justify-center z-0">
                       <div className="w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                     </div>
                     
                     <h2 className="font-black text-emerald-400 text-xl uppercase tracking-widest mb-6 relative z-10">We Have a Winner!</h2>
                     
                     <div className="bg-emerald-900/40 backdrop-blur-md border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] relative z-10 overflow-hidden">
                       <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400"></div>
                       
                       <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-2">Winning Ticket</p>
                       <p className="text-4xl font-black font-mono text-white mb-6 drop-shadow-lg">{winner?.ticket}</p>
                       
                       <div className="pt-4 border-t border-emerald-500/30 text-left grid grid-cols-2 gap-4">
                         <div>
                           <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Attendee</p>
                           <p className="font-bold text-white">{winner?.name}</p>
                         </div>
                         <div>
                           <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Current Seat</p>
                           <p className="font-bold text-white">{winner?.seat}</p>
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-emerald-500/30">
                         <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Prize Upgraded</p>
                         <p className="font-black text-emerald-400 text-lg uppercase tracking-tight">{winner?.prize}</p>
                       </div>
                     </div>
                     
                   </div>
                 )}
                 
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuantumLotterySystem;
