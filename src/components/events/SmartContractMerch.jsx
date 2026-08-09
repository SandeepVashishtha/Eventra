/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartContractMerch = () => {
  const [contractActive, setContractActive] = useState(false);
  
  // Market Metrics
  const [currentPrice, setCurrentPrice] = useState(45.00); // USD
  const [itemsMinted, setItemsMinted] = useState(0);
  const [scalpersBlocked, setScalpersBlocked] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Web3 Merch Bonding Curve Contract deployed.' },
    { id: 2, time: '14:00:02', type: 'SYS', msg: 'Awaiting Geofenced minting requests.' }
  ]);

  // Visualizer state
  const [curveData, setCurveData] = useState([]); // Array of { minted, price }
  const [latestTx, setLatestTx] = useState(null); // { status, type, msg }

  useEffect(() => {
      // Initialize the curve
      const initialCurve = [];
      for (let i = 0; i <= 50; i += 5) {
          initialCurve.push({ minted: i, price: 45 + (i * i * 0.05) });
      }
      setCurveData(initialCurve);
  }, []);

  const handleTx = (type) => {
    if (!contractActive) return;
    
    if (type === 'FAN') {
        const newMinted = itemsMinted + 1;
        // Bonding curve formula: BasePrice + (Supply^2 * multiplier)
        const newPrice = 45 + (newMinted * newMinted * 0.05);
        
        setItemsMinted(newMinted);
        setCurrentPrice(newPrice);
        setLatestTx({ status: 'SUCCESS', type: 'FAN', msg: 'GPS Valid. Minted 1x Tour Tee.' });
        
        addLog('SUCCESS', `Geofence verified. Minted item #${newMinted} at $${newPrice.toFixed(2)}.`);
        
        // Update visual curve
        setCurveData(prev => {
            if (newMinted > prev[prev.length - 1].minted) {
                 return [...prev, { minted: newMinted, price: newPrice }];
            }
            return prev;
        });

    } else if (type === 'SCALPER') {
        // Scalper attempts to buy 20 items at once
        const targetMinted = itemsMinted + 20;
        const targetPrice = 45 + (targetMinted * targetMinted * 0.05);
        
        setScalpersBlocked(prev => prev + 1);
        setLatestTx({ status: 'DENIED', type: 'SCALPER', msg: `Bot detected. Bond curve price: $${targetPrice.toFixed(2)}.` });
        
        addLog('CRIT', 'Scalper bot detected attempting bulk mint.');
        addLog('ACTION', `Contract denied transaction. Algorithmic penalty price quoted at $${targetPrice.toFixed(2)}.`);
        
    } else if (type === 'SPOOF') {
        // GPS Spoof attempt
        setLatestTx({ status: 'DENIED', type: 'SPOOF', msg: 'Geofence Oracle rejected transaction.' });
        addLog('WARN', 'Invalid GPS signature. User not physically at Main Stage.');
    }

    setTimeout(() => setLatestTx(null), 3000);
  };

  const toggleContract = () => {
    if (!contractActive) {
      setContractActive(true);
      addLog('SYS', 'Geofence Oracle Online. Smart Contract listening for transactions.');
    } else {
      setContractActive(false);
      setItemsMinted(0);
      setCurrentPrice(45.00);
      const initialCurve = [];
      for (let i = 0; i <= 50; i += 5) {
          initialCurve.push({ minted: i, price: 45 + (i * i * 0.05) });
      }
      setCurveData(initialCurve);
      addLog('WARN', 'Smart Contract paused. Merch drops halted.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // SVG dimensions for graph
  const w = 350;
  const h = 200;
  const padding = 20;
  
  // Graph scales
  const maxMinted = Math.max(50, curveData[curveData.length - 1]?.minted || 50);
  const maxPrice = Math.max(170, curveData[curveData.length - 1]?.price || 170);

  const getX = (m) => padding + (m / maxMinted) * (w - padding * 2);
  const getY = (p) => h - padding - (p / maxPrice) * (h - padding * 2);

  const linePath = curveData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.minted)} ${getY(d.price)}`).join(' ');
  const areaPath = `${linePath} L ${getX(curveData[curveData.length-1].minted)} ${h - padding} L ${padding} ${h - padding} Z`;

  return (
    <div className="min-h-screen bg-[#07090b] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Contract Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Web3 Tokenomics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Geofenced Smart-Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Dynamic Pricing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Exclusive artist merchandise drops cause dangerous crowd stampedes when physical gates open, and scalpers typically buy all the inventory to resell online at a 500% markup. Eventra prevents this by minting exclusive merch as digital twins via Web3 smart contracts. Attendees can only trigger a purchase if their GPS/BLE data proves they are physically standing at the stage. The smart contract utilizes a dynamic pricing bonding curve—rewarding the earliest real fans with retail prices while algorithmically pricing out scalpers.
          </p>

          <div className="bg-[#091018] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">📜</span> Smart Contract Monitor
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleContract}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     contractActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {contractActive ? 'Halt Contract Minting' : 'Deploy Bonding Curve'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Current Price */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 contractActive ? 'bg-blue-950/20 border-blue-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Algorithmic Price
                 </span>
                 <div className="flex items-end">
                   <span className="text-[14px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none ${
                     contractActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {currentPrice.toFixed(2)}
                   </span>
                 </div>
               </div>

               {/* Items Minted */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 itemsMinted > 0 ? 'bg-emerald-950/20 border-emerald-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Verified Mints
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     itemsMinted > 0 ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {itemsMinted}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Units</span>
                 </div>
               </div>
               
               {/* Scalpers Blocked */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 scalpersBlocked > 0 ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Scalpers Priced Out
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     scalpersBlocked > 0 ? 'text-orange-400 animate-pulse' : 'text-slate-600'
                   }`}>
                     {scalpersBlocked}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">Bots</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04070a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Contract Execution Log</span>
                 {latestTx?.status === 'SUCCESS' && <span className="text-emerald-400 animate-pulse">TX CONFIRMED</span>}
                 {latestTx?.status === 'DENIED' && <span className="text-red-500 animate-pulse">TX REVERTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' :
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
            
            {/* Bonding Curve Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 transition-all duration-300 ${!contractActive ? 'bg-slate-900' : 'bg-[#060a12]'}`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between backdrop-blur">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">MARKET DYNAMICS</span>
                <span className="text-[8px] font-mono text-slate-400">QUADRATIC BONDING CURVE</span>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col pt-10 px-2 pb-2">
                
                {!contractActive ? (
                   <div className="flex-1 flex flex-col items-center justify-center z-10">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CONTRACT INACTIVE</span>
                   </div>
                ) : (
                  <div className="flex-1 relative flex flex-col border-l border-b border-slate-700/50 mt-4 ml-4 mb-4">
                      
                      {/* Graph Labels */}
                      <span className="absolute -left-6 top-1/2 -rotate-90 text-[8px] font-black text-slate-500 uppercase tracking-widest transform -translate-y-1/2">PRICE (USD)</span>
                      <span className="absolute -bottom-6 left-1/2 text-[8px] font-black text-slate-500 uppercase tracking-widest transform -translate-x-1/2">SUPPLY MINTED</span>

                      {/* Y-axis values */}
                      <span className="absolute -left-6 top-0 text-[7px] font-mono text-slate-600">${maxPrice.toFixed(0)}</span>
                      <span className="absolute -left-6 bottom-0 text-[7px] font-mono text-slate-600">$45</span>

                      {/* X-axis values */}
                      <span className="absolute -bottom-4 right-0 text-[7px] font-mono text-slate-600">{maxMinted}</span>

                      {/* Grid lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:25%_25%] pointer-events-none"></div>

                      {/* D3-style SVG Curve */}
                      <div className="absolute inset-0 z-10">
                          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                              {/* Area fill */}
                              <path d={areaPath} fill="url(#gradient)" opacity="0.3" />
                              
                              {/* Line */}
                              <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" />

                              {/* Current Position Dot */}
                              <circle 
                                  cx={getX(itemsMinted)} 
                                  cy={getY(currentPrice)} 
                                  r="5" 
                                  fill="#fff" 
                                  stroke="#0284c7" 
                                  strokeWidth="2" 
                                  className="shadow-[0_0_10px_#38bdf8]"
                              />

                              <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                          </svg>
                      </div>

                      {/* Live Transaction HUD Overlay */}
                      {latestTx && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
                              <div className={`border p-3 rounded flex flex-col items-center max-w-[80%] ${
                                  latestTx.status === 'SUCCESS' ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' :
                                  latestTx.status === 'DENIED' ? 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' :
                                  'bg-slate-900 border-slate-700'
                              }`}>
                                  <span className={`text-[12px] font-black uppercase tracking-widest ${
                                      latestTx.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                      TX {latestTx.status}
                                  </span>
                                  <span className="text-[9px] font-mono text-white mt-1 text-center leading-tight">
                                      {latestTx.msg}
                                  </span>
                              </div>
                          </div>
                      )}

                  </div>
                )}
                
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#091018] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Inject Web3 Transactions</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => handleTx('FAN')}
                   disabled={!contractActive || latestTx}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !contractActive || latestTx ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                   }`}
                 >
                   Genuine Fan (Buy 1x @ Stage)
                 </button>
                 
                 <button 
                   onClick={() => handleTx('SPOOF')}
                   disabled={!contractActive || latestTx}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !contractActive || latestTx ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-orange-950/40 border-orange-600 text-orange-400 hover:bg-orange-900/60'
                   }`}
                 >
                   Spoofer (Invalid GPS Oracle)
                 </button>

                 <button 
                   onClick={() => handleTx('SCALPER')}
                   disabled={!contractActive || latestTx}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !contractActive || latestTx ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-500 hover:bg-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                   }`}
                 >
                   Scalper Bot (Attempt Bulk Buy)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartContractMerch;
