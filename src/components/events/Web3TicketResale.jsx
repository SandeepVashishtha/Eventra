/* eslint-disable */
import React, { useState, useEffect } from 'react';

const Web3TicketResale = () => {
  const [networkActive, setNetworkActive] = useState(false);
  const [txState, setTxState] = useState('IDLE'); // IDLE, SIMULATING, EXECUTED, REVERTED
  
  // Contract Metrics
  const [ticketsResold, setTicketsResold] = useState(0);
  const [scalpingAttemptsBlocked, setScalpingAttemptsBlocked] = useState(0);
  const [avgResalePrice, setAvgResalePrice] = useState(305.00); // Base $299
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Polygon Layer-2 RPC Node Connected.' },
    { id: 2, time: '10:00:02', type: 'SYS', msg: 'Awaiting P2P marketplace transactions.' }
  ]);

  // Visualizer State
  const [listingPrice, setListingPrice] = useState(0);
  const [gasFee, setGasFee] = useState(0);

  const TICKET_FACE_VALUE = 299.00;
  const MAX_PRICE_CAP_MULTIPLIER = 1.10; // 110%
  const MAX_ALLOWED_PRICE = TICKET_FACE_VALUE * MAX_PRICE_CAP_MULTIPLIER;

  useEffect(() => {
    let loop;
    
    if (networkActive) {
      loop = setInterval(() => {
          
          if (txState === 'IDLE') {
              setGasFee(Math.random() * 0.05 + 0.01); // Polygon L2 cheap gas
          }

      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [networkActive, txState]);

  const triggerTransaction = (type) => {
    if (!networkActive || txState !== 'IDLE') return;
    
    setTxState('SIMULATING');
    
    let simulatedPrice = 0;
    if (type === 'SCALPER') {
        simulatedPrice = 850.00; // Scalper markup
        setListingPrice(simulatedPrice);
        addLog('WARN', `Listing detected: $${simulatedPrice}. Simulating transaction execution...`);
        
        setTimeout(() => {
            setTxState('REVERTED');
            setScalpingAttemptsBlocked(prev => prev + 1);
            addLog('CRIT', `TRANSACTION REVERTED: Price exceeds 110% face value cap ($${MAX_ALLOWED_PRICE.toFixed(2)}).`);
            addLog('ACTION', 'Listing automatically deleted from P2P marketplace.');
            
            setTimeout(() => {
                setTxState('IDLE');
                setListingPrice(0);
            }, 4000);
            
        }, 2000);
    } else if (type === 'LEGIT') {
        simulatedPrice = 315.00; // Fair markup to cover fees
        setListingPrice(simulatedPrice);
        addLog('ACTION', `Listing detected: $${simulatedPrice}. Simulating transaction execution...`);
        
        setTimeout(() => {
            setTxState('EXECUTED');
            setTicketsResold(prev => prev + 1);
            
            // Running avg
            setAvgResalePrice(prev => ((prev * ticketsResold) + simulatedPrice) / (ticketsResold + 1));
            
            addLog('SUCCESS', `TRANSACTION EXECUTED: Price is within 110% ceiling limit.`);
            addLog('SYS', 'NFT Ownership transferred. Royalties distributed to organizers.');
            
            setTimeout(() => {
                setTxState('IDLE');
                setListingPrice(0);
            }, 4000);
            
        }, 2000);
    }
  };

  const toggleNetwork = () => {
    if (!networkActive) {
      setNetworkActive(true);
      setTicketsResold(1420);
      setScalpingAttemptsBlocked(384);
      addLog('SYS', 'Dynamic NFT Smart Contract linked to Eventra Marketplace UI.');
    } else {
      setNetworkActive(false);
      setTxState('IDLE');
      setListingPrice(0);
      addLog('WARN', 'Web3 RPC offline. Secondary market paused.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⛓️</span> Web3 Smart Contracts
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            NFT Ticket Resale <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Price Ceiling Caps</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Even with digital ticketing, users sell their login credentials or transfer tickets on third-party sites like StubHub for massive, predatory markups. Eventra solves this by minting all festival tickets as dynamic NFTs with embedded smart contracts. If an attendee attempts to resell their ticket through the Eventra P2P marketplace, the contract mathematically prevents the transaction from executing if the listing price exceeds 110% of the original face value, entirely eliminating scalping.
          </p>

          <div className="bg-[#0a0e16] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">📊</span> Contract Analytics
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     networkActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {networkActive ? 'Disconnect RPC Node' : 'Initialize NFT Contract'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Resold */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 txState === 'EXECUTED' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner' :
                 networkActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Valid P2P Resales
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     networkActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {ticketsResold.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Blocked */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 txState === 'REVERTED' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                 networkActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Scalper Blocks
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     txState === 'REVERTED' ? 'text-red-400' :
                     networkActive ? 'text-red-500' : 'text-slate-600'
                   }`}>
                     {scalpingAttemptsBlocked}
                   </span>
                 </div>
               </div>
               
               {/* Avg Price */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkActive ? 'bg-blue-950/20 border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Avg Resale Price
                 </span>
                 <div className="flex items-end">
                   <span className="text-[14px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none ${
                     networkActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {avgResalePrice.toFixed(2)}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>EVM Transaction Log</span>
                 {txState === 'SIMULATING' && <span className="text-indigo-400 animate-pulse">SIMULATING TX...</span>}
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
                       'text-slate-400'
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
            
            {/* Wallet / Marketplace Simulator */}
            <div className={`w-full rounded-[2rem] border-[8px] border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-all duration-500 ${
                !networkActive ? 'bg-slate-900' : 'bg-[#0b0e14]'
            }`}>
              
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-xl z-40"></div>

              <div className="flex-1 relative overflow-hidden flex flex-col p-4 pt-10 z-20">
                
                {!networkActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">RPC OFFLINE</span>
                   </div>
                ) : (
                  <div className="w-full h-full flex flex-col relative">
                      
                      <div className="flex justify-between items-center mb-6 px-2">
                          <span className="text-xl font-black text-white">Marketplace</span>
                          <div className="px-2 py-1 rounded text-[8px] font-mono uppercase bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></span>
                              Polygon L2
                          </div>
                      </div>

                      {/* Ticket Card Mockup */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 mb-4 shadow-lg relative overflow-hidden">
                          {/* Holographic foil effect */}
                          <div className="absolute inset-0 bg-[linear-gradient(125deg,transparent_20%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.1)_60%,transparent_80%)] opacity-30 pointer-events-none"></div>
                          
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">3-Day GA Pass</span>
                                  <h3 className="text-lg font-bold text-white leading-tight mt-1">Eventra Festival 2026</h3>
                              </div>
                              <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
                                  {/* Dummy QR code */}
                                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAwIi8+PC9zdmc+')]"></div>
                              </div>
                          </div>

                          <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                              <div>
                                  <span className="text-[8px] font-mono text-slate-500">FACE VALUE</span>
                                  <span className="block text-sm font-black text-slate-300">${TICKET_FACE_VALUE.toFixed(2)}</span>
                              </div>
                              <div className="text-right">
                                  <span className="text-[8px] font-mono text-slate-500">MAX RESALE CAP (110%)</span>
                                  <span className="block text-sm font-black text-indigo-400">${MAX_ALLOWED_PRICE.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>

                      {/* Transaction Status Area */}
                      <div className="flex-1 flex flex-col justify-end">
                          
                          {txState === 'IDLE' ? (
                              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ready to list ticket.</span>
                              </div>
                          ) : (
                              <div className={`rounded-lg p-4 border animate-fade-in-up relative overflow-hidden ${
                                  txState === 'SIMULATING' ? 'bg-indigo-950/40 border-indigo-500/50' :
                                  txState === 'REVERTED' ? 'bg-red-950/40 border-red-500/50' : 'bg-emerald-950/40 border-emerald-500/50'
                              }`}>
                                  
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-[8px] font-black uppercase text-slate-400">Listing Price:</span>
                                      <span className="text-lg font-black text-white">${listingPrice.toFixed(2)}</span>
                                  </div>

                                  {txState === 'SIMULATING' && (
                                      <div className="flex flex-col items-center py-2">
                                          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                          <span className="text-[7px] font-mono text-indigo-400 uppercase tracking-widest">Validating Contract Rules...</span>
                                      </div>
                                  )}

                                  {txState === 'REVERTED' && (
                                      <div className="flex flex-col items-center text-center">
                                          <span className="text-2xl mb-1">❌</span>
                                          <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">TX REVERTED</span>
                                          <span className="text-[8px] font-mono text-red-400 mt-1 leading-tight">Price exceeds 110% cap.<br/>Scalping is prohibited.</span>
                                      </div>
                                  )}

                                  {txState === 'EXECUTED' && (
                                      <div className="flex flex-col items-center text-center">
                                          <span className="text-2xl mb-1">✅</span>
                                          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">TX EXECUTED</span>
                                          <span className="text-[8px] font-mono text-emerald-500 mt-1 leading-tight">Listing active on marketplace.<br/>Fair price verified.</span>
                                      </div>
                                  )}
                                  
                                  {/* Progress bar background for executing state */}
                                  {txState === 'SIMULATING' && (
                                      <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 animate-[fillWidth_2s_ease-in-out]"></div>
                                  )}

                              </div>
                          )}

                      </div>

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes fillWidth {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0a0e16] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Resale Attempt</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerTransaction('LEGIT')}
                   disabled={!networkActive || txState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !networkActive || txState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-indigo-950/40 border-indigo-600 text-indigo-400 hover:bg-indigo-900/60 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                   }`}
                 >
                   List Fair Price ($315)
                 </button>

                 <button 
                   onClick={() => triggerTransaction('SCALPER')}
                   disabled={!networkActive || txState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !networkActive || txState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                   }`}
                 >
                   List Scalper Price ($850)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Web3TicketResale;
