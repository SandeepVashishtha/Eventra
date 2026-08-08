/* eslint-disable */
import React, { useState, useEffect } from 'react';

const CarbonOffsetTokenizer = () => {
  const [contractActive, setContractActive] = useState(false);
  const [offsetState, setOffsetState] = useState('BALANCED'); // BALANCED, DEFICIT, PURCHASING
  
  // Emissions Data
  const [totalEmissions, setTotalEmissions] = useState(145.2); // Tons CO2e
  const [tokensBurned, setTokensBurned] = useState(145.2); // Tons CO2e offset
  const [netCarbon, setNetCarbon] = useState(0.0);
  
  // Real-time rates
  const [dieselBurnRate, setDieselBurnRate] = useState(45.5); // Gal/hr
  const [rideshareEmissions, setRideshareEmissions] = useState(12.2); // kg/min
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Web3 Carbon Oracle online.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Listening to Generator IoT and Uber/Lyft API hooks.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (contractActive) {
      if (offsetState === 'BALANCED') {
        loop = setInterval(() => {
          // Normal background accumulation
          const emissionsSpike = (Math.random() * 0.1);
          setTotalEmissions(prev => prev + emissionsSpike);
          
          setNetCarbon(prev => {
            const net = prev + emissionsSpike;
            if (net > 0.5) {
              setOffsetState('DEFICIT');
              addLog('WARN', `Carbon deficit detected (${net.toFixed(2)}t). Preparing block transaction.`);
            }
            return net;
          });
          
          setDieselBurnRate(Math.max(40, Math.min(50, 45 + (Math.random() * 4 - 2))));
          setRideshareEmissions(Math.max(10, Math.min(15, 12 + (Math.random() * 2 - 1))));
        }, 1000);
      } else if (offsetState === 'DEFICIT') {
        // Wait briefly before purchasing to batch transactions
        loop = setTimeout(() => {
          setOffsetState('PURCHASING');
          addLog('WEB3', 'Executing Smart Contract: Purchasing Verified Carbon Credits (VCC).');
        }, 1500);
      } else if (offsetState === 'PURCHASING') {
        // Simulating blockchain transaction time
        loop = setTimeout(() => {
          setTokensBurned(prev => prev + netCarbon);
          setNetCarbon(0);
          setOffsetState('BALANCED');
          addLog('SUCCESS', 'VCC Tokens successfully burned on-chain. Festival returned to Net-Zero.');
        }, 2000);
      }
    }
    
    return () => { if (loop) clearTimeout(loop); clearInterval(loop); };
  }, [contractActive, offsetState, netCarbon]);

  const triggerPyroSpike = () => {
    if (contractActive && offsetState === 'BALANCED') {
      const spike = 2.5; // Tons CO2
      setTotalEmissions(prev => prev + spike);
      setNetCarbon(prev => prev + spike);
      setOffsetState('DEFICIT');
      addLog('ACTION', 'Massive CO2 spike detected: Main Stage Pyrotechnics & Laser burst.');
    }
  };

  const triggerEgressSpike = () => {
    if (contractActive && offsetState === 'BALANCED') {
      const spike = 4.8; // Tons CO2
      setTotalEmissions(prev => prev + spike);
      setNetCarbon(prev => prev + spike);
      setOffsetState('DEFICIT');
      setRideshareEmissions(85.5); // Massive spike
      addLog('ACTION', 'API Hook Trigger: 15,000 Uber/Lyft requests initiated (Egress).');
    }
  };

  const toggleContract = () => {
    if (!contractActive) {
      setContractActive(true);
      addLog('SYS', 'Smart Contract Armed. Real-time offsetting active.');
    } else {
      setContractActive(false);
      setOffsetState('BALANCED');
      addLog('CRIT', 'Oracle offline. Emissions accumulating without offset.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060806] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Web3 Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> Web3 Environmental Oracle
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real-Time Carbon Footprint <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Offset Tokenizer</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Massive festivals face intense scrutiny for their environmental impact, but calculating and offsetting emissions is traditionally a slow, manual process done months after the fact. Eventra solves this by integrating IoT fuel sensors on all diesel generators and API hooks into attendee rideshare data. A Web3 smart contract continuously calculates the live carbon tonnage emitted. As the festival proceeds, the contract automatically purchases and burns verified carbon offset tokens on the blockchain, guaranteeing the event remains strictly Net-Zero in real-time.
          </p>

          <div className="bg-[#0c120e] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">⚖️</span> Net-Zero Ledger
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleContract}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     contractActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {contractActive ? 'Pause Auto-Offset' : 'Initialize Smart Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Total Emissions */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 contractActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Gross Emissions
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     contractActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {totalEmissions.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">t</span>
                 </div>
               </div>
               
               {/* Tokens Burned */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 offsetState === 'PURCHASING' ? 'bg-teal-950/40 border-teal-500/50 shadow-inner' :
                 contractActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   VCC Tokens Burned
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     offsetState === 'PURCHASING' ? 'text-teal-400 animate-pulse' :
                     contractActive ? 'text-teal-500' : 'text-slate-600'
                   }`}>
                     {tokensBurned.toFixed(2)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">t</span>
                 </div>
               </div>

               {/* Net Carbon */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 offsetState === 'DEFICIT' || offsetState === 'PURCHASING' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 contractActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Net Carbon State
                 </span>
                 <div className="flex flex-col">
                   <div className="flex items-end">
                     <span className={`text-3xl font-black font-mono leading-none ${
                       offsetState === 'DEFICIT' || offsetState === 'PURCHASING' ? 'text-red-400' :
                       contractActive ? 'text-emerald-400' : 'text-slate-600'
                     }`}>
                       {netCarbon.toFixed(2)}
                     </span>
                     <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">t</span>
                   </div>
                   <span className={`text-[10px] font-bold mt-2 uppercase tracking-widest font-mono ${
                     offsetState === 'DEFICIT' ? 'text-red-500' : 
                     offsetState === 'PURCHASING' ? 'text-teal-400 animate-pulse' : 'text-emerald-500'
                   }`}>
                     {offsetState.replace('_', ' ')}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020503] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Oracle Transaction Log</span>
                 {offsetState === 'PURCHASING' && <span className="text-teal-400 animate-pulse">Minting Transaction...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' : 
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-teal-400 font-bold' : 'text-slate-400'
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
            
            {/* Ledger Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">SMART CONTRACT VISUALIZER</span>
                <span className="text-[8px] font-mono text-slate-400">BLOCKCHAIN SYNC</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col pt-8">
                
                {/* Scales of Justice / Balance Visual */}
                <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-48 flex justify-between items-start z-20">
                   
                   {/* Left Scale: Emissions */}
                   <div className="flex flex-col items-center transition-transform duration-500" style={{ transform: `translateY(${netCarbon > 0 ? 10 : 0}px)` }}>
                     <div className="w-16 h-16 rounded-full border-2 border-red-500/50 bg-red-950/30 flex items-center justify-center relative">
                        <span className="text-2xl opacity-50">🏭</span>
                        {/* Smoke particle effect */}
                        {contractActive && (
                          <div className="absolute -top-4 w-4 h-4 bg-red-500/20 rounded-full blur-md animate-[ping_2s_infinite]"></div>
                        )}
                     </div>
                     <span className="text-[8px] font-black text-red-400 mt-2 tracking-widest uppercase">CO2 Emitted</span>
                   </div>

                   {/* Right Scale: Offsets */}
                   <div className="flex flex-col items-center transition-transform duration-500" style={{ transform: `translateY(${netCarbon > 0 ? -10 : 0}px)` }}>
                     <div className={`w-16 h-16 rounded-full border-2 border-emerald-500/50 bg-emerald-950/30 flex items-center justify-center relative ${offsetState === 'PURCHASING' ? 'shadow-[0_0_20px_#10b981]' : ''}`}>
                        <span className="text-2xl opacity-50">🌳</span>
                        {/* Sparkle particle effect */}
                        {offsetState === 'PURCHASING' && (
                          <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-50"></div>
                        )}
                     </div>
                     <span className="text-[8px] font-black text-emerald-400 mt-2 tracking-widest uppercase">Tokens Burned</span>
                   </div>

                </div>
                
                {/* Balance Beam */}
                <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 w-32 h-[2px] bg-slate-600 z-10 transition-transform duration-500" style={{ transform: `translate(-50%, -50%) rotate(${netCarbon > 0 ? -5 : 0}deg)` }}></div>
                
                {/* Center Fulcrum */}
                <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-16 bg-slate-500 z-0"></div>

                {/* IoT Live Feeds */}
                <div className="absolute bottom-4 inset-x-4 grid grid-cols-2 gap-2">
                   <div className="bg-black/60 border border-slate-800 rounded p-2 flex flex-col">
                     <span className="text-[7px] text-slate-500 font-black tracking-widest uppercase mb-1">IoT Gen Array</span>
                     <span className="text-[14px] font-mono text-orange-400">{contractActive ? dieselBurnRate.toFixed(1) : '0.0'} <span className="text-[8px] text-slate-600">Gal/hr</span></span>
                   </div>
                   <div className="bg-black/60 border border-slate-800 rounded p-2 flex flex-col">
                     <span className="text-[7px] text-slate-500 font-black tracking-widest uppercase mb-1">Rideshare API</span>
                     <span className="text-[14px] font-mono text-orange-400">{contractActive ? rideshareEmissions.toFixed(1) : '0.0'} <span className="text-[8px] text-slate-600">kg/m</span></span>
                   </div>
                </div>

                {/* Blockchain Overlay when purchasing */}
                {offsetState === 'PURCHASING' && (
                  <div className="absolute inset-0 bg-teal-900/20 z-30 pointer-events-none flex items-center justify-center backdrop-blur-sm">
                     <div className="bg-black/80 border border-teal-500 px-4 py-2 rounded flex flex-col items-center shadow-[0_0_30px_#14b8a6]">
                       <span className="text-[10px] text-teal-400 font-mono animate-pulse">0x8f...3a9 executing</span>
                       <span className="text-[8px] font-black text-white mt-1 uppercase tracking-widest">Burning VCC Tokens...</span>
                     </div>
                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerPyroSpike}
                disabled={!contractActive || offsetState !== 'BALANCED'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !contractActive || offsetState !== 'BALANCED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-orange-950/40 border-orange-900 text-orange-500 hover:bg-orange-900/60'
                }`}
              >
                Inject Pyro Spike
              </button>
              
              <button 
                onClick={triggerEgressSpike}
                disabled={!contractActive || offsetState !== 'BALANCED'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !contractActive || offsetState !== 'BALANCED' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-red-950/40 border-red-900 text-red-500 hover:bg-red-900/60'
                }`}
              >
                Inject Uber/Lyft Surge
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default CarbonOffsetTokenizer;
