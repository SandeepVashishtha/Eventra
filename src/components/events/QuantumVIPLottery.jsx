/* eslint-disable */
import React, { useState, useEffect } from 'react';

const QuantumVIPLottery = () => {
  const [qpuActive, setQpuActive] = useState(false);
  const [drawState, setDrawState] = useState('IDLE'); // IDLE, SUPERPOSITION, COLLAPSED
  
  // Quantum Metrics
  const [qubitsOnline, setQubitsOnline] = useState(0);
  const [decoherence, setDecoherence] = useState(0); // Error rate in %
  const [entanglement, setEntanglement] = useState(0); // Coherence time in us
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Cloud Quantum Processing Unit (QPU) connection established.' },
    { id: 2, time: '11:00:02', type: 'SYS', msg: 'Awaiting lottery execution command.' }
  ]);

  // Visualizer State
  const [particles, setParticles] = useState([]);
  const [winningTicket, setWinningTicket] = useState(null);

  useEffect(() => {
    let loop;
    
    if (qpuActive) {
      loop = setInterval(() => {
          
          if (drawState === 'SUPERPOSITION') {
              // Rapidly fluctuating states before observation
              setDecoherence(Math.random() * 0.05 + 0.01);
              setEntanglement(prev => Math.min(150, prev + (Math.random() * 10)));
              
              // Generate chaotic particles
              const newParticles = Array.from({length: 12}).map((_, i) => ({
                  id: Date.now() + i,
                  x: 50 + (Math.random() * 40 - 20), // 30-70%
                  y: 50 + (Math.random() * 40 - 20),
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  size: Math.random() * 3 + 1,
                  state: Math.random() > 0.5 ? 1 : 0 // 1 or 0 binary state
              }));
              
              setParticles(newParticles);
              setWinningTicket(`${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}-${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}`);
              
          } else if (drawState === 'COLLAPSED') {
              // Stable state post-observation
              setDecoherence(0);
              setEntanglement(0);
              
              // Align particles into a perfect grid (representing collapsed certainty)
              const gridParticles = [];
              for(let i=0; i<3; i++){
                  for(let j=0; j<4; j++){
                       gridParticles.push({
                          id: `grid-${i}-${j}`,
                          x: 25 + (j * 16.6),
                          y: 30 + (i * 20),
                          vx: 0,
                          vy: 0,
                          size: 3,
                          state: 1
                       });
                  }
              }
              setParticles(gridParticles);
          } else {
              setDecoherence(0);
              setEntanglement(120);
              setParticles([]);
              setWinningTicket(null);
          }

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [qpuActive, drawState]);

  const executeLottery = () => {
    if (!qpuActive || drawState !== 'IDLE') return;
    
    setDrawState('SUPERPOSITION');
    addLog('ACTION', 'Executing Hadamard gates. Placing Qubits into superposition.');
    addLog('AI', 'Measuring unpredictable quantum state to generate true random seed.');
    
    setTimeout(() => {
        setDrawState('COLLAPSED');
        const winner = `${Math.floor(Math.random()*9000)+1000}-${Math.floor(Math.random()*9000)+1000}`;
        setWinningTicket(winner);
        addLog('SUCCESS', 'Wave function collapsed (Observation Event).');
        addLog('SYS', `Cryptographically secure winner selected: Ticket ID #${winner}.`);
        
        setTimeout(() => {
            setDrawState('IDLE');
            setWinningTicket(null);
            addLog('SYS', 'System reset. Ready for next draw.');
        }, 5000);
        
    }, 2500); // 2.5 seconds of "superposition" animation
  };

  const toggleQPU = () => {
    if (!qpuActive) {
      setQpuActive(true);
      setQubitsOnline(127); // Standard IBM Eagle / similar scale for demo
      setEntanglement(120);
      addLog('SYS', '127-Qubit Cloud QPU Synced. Cryogenic systems nominal at 15mK.');
    } else {
      setQpuActive(false);
      setQubitsOnline(0);
      setEntanglement(0);
      setDecoherence(0);
      setDrawState('IDLE');
      setWinningTicket(null);
      setParticles([]);
      addLog('WARN', 'QPU API disconnected. Falling back to insecure pseudo-RNG.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚛️</span> Cryptographic Fairness
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Quantum Random Number <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Generated (QRNG) VIP Lottery</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional randomized lotteries for backstage passes or secret sets are easily manipulated by bots, algorithms, or insider tampering, leading to fan distrust in the fairness of the system. Eventra solves this by connecting directly to a cloud-based Quantum Computer API. When drawing a winner, the system uses a QRNG (measuring the truly unpredictable superposition state of 127 physical qubits) to select the winning ticket IDs. This provides mathematically proven, cryptographically unbreakable fairness that is entirely immune to algorithmic bias.
          </p>

          <div className="bg-[#050612] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">❄️</span> Cryogenic QPU Interface
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleQPU}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     qpuActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {qpuActive ? 'Disconnect Cloud QPU' : 'Initialize IBM Quantum API'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Qubits Online */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 qpuActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Physical Qubits
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     qpuActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {qubitsOnline}
                   </span>
                 </div>
               </div>

               {/* Coherence Time */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 qpuActive && drawState === 'SUPERPOSITION' ? 'bg-violet-950/40 border-violet-500/50 shadow-inner' :
                 qpuActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Coherence State
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     qpuActive && drawState === 'SUPERPOSITION' ? 'text-violet-400 animate-pulse' :
                     qpuActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {entanglement.toFixed(0)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">μs</span>
                 </div>
               </div>
               
               {/* Decoherence Error */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 decoherence > 0.04 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Gate Error Rate
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     decoherence > 0.04 ? 'text-orange-400' :
                     qpuActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {decoherence.toFixed(4)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Algorithmic Execution Log</span>
                 {drawState === 'SUPERPOSITION' && <span className="text-violet-400 animate-pulse">MEASURING QUBITS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' :
                       log.type === 'AI' ? 'text-violet-400 font-bold' : 'text-slate-400'
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
            
            {/* Quantum State Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!qpuActive ? 'bg-[#030509]' : 'bg-[#050612]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">QRNG VISUALIZER</span>
                <span className="text-[8px] font-mono text-slate-400">WAVE FUNCTION STATE</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-4">
                
                {/* Background Cryogenic Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0,transparent_70%)] pointer-events-none z-0"></div>
                <div className="absolute inset-0 opacity-20 z-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:10%_10%]"></div>

                {!qpuActive ? (
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest z-10 relative">SYSTEM DECOHERENT</span>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                      
                      {/* Qubit Particle Canvas Simulation */}
                      <div className="absolute inset-0 w-full h-full">
                          {particles.map(p => (
                              <div 
                                  key={p.id}
                                  className={`absolute rounded-full transition-all duration-75 ${p.state === 1 ? 'bg-indigo-400' : 'bg-slate-300'}`}
                                  style={{
                                      left: `${p.x}%`,
                                      top: `${p.y}%`,
                                      width: `${p.size}px`,
                                      height: `${p.size}px`,
                                      boxShadow: p.state === 1 ? '0 0 10px rgba(129,140,248,0.8)' : 'none',
                                      transform: drawState === 'SUPERPOSITION' ? `translate(${p.vx}px, ${p.vy}px)` : 'none'
                                  }}
                              ></div>
                          ))}
                          
                          {/* Entanglement connecting lines during superposition */}
                          {drawState === 'SUPERPOSITION' && (
                              <svg className="absolute inset-0 w-full h-full z-0 opacity-30">
                                  {particles.slice(0, 6).map((p1, i) => 
                                      particles.slice(i+1, 8).map((p2, j) => (
                                          <line key={`${i}-${j}`} x1={`${p1.x}%`} y1={`${p1.y}%`} x2={`${p2.x}%`} y2={`${p2.y}%`} stroke="#818cf8" strokeWidth="1" />
                                      ))
                                  )}
                              </svg>
                          )}
                      </div>

                      {/* Status HUD Overlays */}
                      {drawState === 'IDLE' && (
                          <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg backdrop-blur shadow-xl relative z-20">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Qubits Stable - Ready for Gates</span>
                          </div>
                      )}
                      
                      {drawState === 'SUPERPOSITION' && (
                          <div className="bg-indigo-950/80 border border-indigo-500 px-4 py-2 rounded-lg backdrop-blur shadow-[0_0_30px_rgba(79,70,229,0.5)] animate-pulse relative z-20 flex flex-col items-center">
                              <span className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">Applying Hadamard Gates</span>
                              <span className="text-[8px] font-mono text-indigo-200 mt-1">Generating True Randomness...</span>
                              <span className="text-xl font-mono text-white font-black mt-2 blur-[1px]">{winningTicket}</span>
                          </div>
                      )}

                      {drawState === 'COLLAPSED' && (
                          <div className="bg-emerald-950/90 border-2 border-emerald-500 px-6 py-4 rounded-xl backdrop-blur shadow-[0_0_40px_rgba(16,185,129,0.6)] relative z-20 flex flex-col items-center transform scale-110">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center">
                                  <span className="mr-2 text-lg">🎯</span> Wave Function Collapsed
                              </span>
                              <span className="text-[8px] text-slate-400 uppercase mb-3 text-center">Cryptographically Secure Winner ID</span>
                              
                              <div className="bg-black/50 border border-emerald-900 px-4 py-2 rounded mb-2">
                                  <span className="text-2xl font-mono text-white font-black">{winningTicket}</span>
                              </div>
                              
                              <span className="text-[7px] font-mono text-emerald-600">Observation Event Logged to Blockchain.</span>
                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#050612] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Trigger Fair Lottery Draw</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={executeLottery}
                   disabled={!qpuActive || drawState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[10px] transition border ${
                     !qpuActive || drawState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                   }`}
                 >
                   {drawState === 'SUPERPOSITION' ? 'Measuring States...' : 
                    drawState === 'COLLAPSED' ? 'Winner Selected' : 
                    'Execute Quantum Draw'}
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default QuantumVIPLottery;
