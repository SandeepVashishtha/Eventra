/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VendorSmartEscrow = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [transactionState, setTransactionState] = useState('IDLE'); // IDLE, SALE_PROCESSING, AUDIT_FLAG
  
  // Escrow Metrics
  const [totalRevenue, setTotalRevenue] = useState(0); 
  const [vendorShare, setVendorShare] = useState(0); // 80%
  const [organizerShare, setOrganizerShare] = useState(0); // 20%
  
  // Reconciliation Metrics
  const [physicalWeight, setPhysicalWeight] = useState(500.0); // kg of inventory
  const [digitalItemsSold, setDigitalItemsSold] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Web3 Escrow Router (ERC-20) Online.' },
    { id: 2, time: '11:00:02', type: 'SYS', msg: 'IoT Weight Telemetry Synced with POS API.' }
  ]);

  // Visualizer State
  const [cashFlow, setCashFlow] = useState([]);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          
          // Expand cash flow particles
          setCashFlow(prev => prev.map(p => ({
              ...p,
              progress: p.progress + 4
          })).filter(p => p.progress < 100));

      }, 50); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const triggerSale = (scenario) => {
    if (!systemActive || transactionState !== 'IDLE') return;
    
    if (scenario === 'LEGIT_SALE') {
        setTransactionState('SALE_PROCESSING');
        addLog('ACTION', 'POS API: $15.00 transaction detected (1x Burger).');
        
        // Update Inventory & Sales
        setPhysicalWeight(prev => Math.max(0, prev - 0.25)); // Burger weighs 0.25kg
        setDigitalItemsSold(prev => prev + 1);
        
        setTimeout(() => {
            if (!systemActive) return;
            
            // Audit check passes (weight matches sale)
            addLog('SUCCESS', 'IoT Reconciled: 0.25kg physical inventory removed. Match confirmed.');
            addLog('SYS', 'Smart Contract triggering instant revenue split (80/20).');
            
            setTotalRevenue(prev => prev + 15);
            setVendorShare(prev => prev + 12); // $12
            setOrganizerShare(prev => prev + 3); // $3
            
            // Trigger visual cash flow
            setCashFlow([{ id: Date.now(), progress: 0 }]);
            
            setTimeout(() => { if(systemActive) setTransactionState('IDLE'); }, 1500);
            
        }, 1000);
        
    } else if (scenario === 'SHRINKAGE') {
        setTransactionState('AUDIT_FLAG');
        
        // Vendor gives away food without ringing it up
        addLog('ACTION', 'IoT Telemetry: 1.25kg physical inventory removed (5x Burgers).');
        setPhysicalWeight(prev => Math.max(0, prev - 1.25));
        
        setTimeout(() => {
            if (!systemActive) return;
            
            // Audit check fails (weight dropped but no sale in POS)
            addLog('CRIT', 'AUDIT FAILED: POS API reports 0 items sold.');
            addLog('WARN', 'Discrepancy detected (Shrinkage). Escrow flagging vendor wallet.');
            
            setTimeout(() => { if(systemActive) setTransactionState('IDLE'); }, 3000);
            
        }, 1000);
    }
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      setTransactionState('IDLE');
      setTotalRevenue(0);
      setVendorShare(0);
      setOrganizerShare(0);
      setPhysicalWeight(500.0);
      setDigitalItemsSold(0);
      addLog('SYS', 'Smart-Contract Escrow Enabled. Revenue split locked at 80/20.');
    } else {
      setSystemActive(false);
      setTransactionState('IDLE');
      setCashFlow([]);
      addLog('WARN', 'Escrow Offline. Reverting to manual end-of-day audits.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#05060a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚖️</span> Trustless Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart-Contract Vendor <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-500">Inventory Escrow</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival food vendors often dispute revenue share percentages with organizers, underreporting sales (shrinkage) to avoid paying fees. Eventra solves this trust issue by implementing weight-based IoT sensors under vendor inventory palettes, linking their Point of Sale (POS) directly to a smart contract. Eventra automatically reconciles the physical weight of inventory consumed against digital sales data. When a transaction occurs, the smart contract instantly and trustlessly routes the exact percentage split to both the organizer and vendor wallets.
          </p>

          <div className="bg-[#0a0c14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Web3 Escrow Ledger
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Smart Contracts' : 'Deploy Escrow Router'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Total Revenue */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 transactionState === 'SALE_PROCESSING' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Gross Vol
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     transactionState === 'SALE_PROCESSING' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {totalRevenue}
                   </span>
                 </div>
               </div>

               {/* Vendor Share */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Vendor (80%)
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {vendorShare}
                   </span>
                 </div>
               </div>
               
               {/* Organizer Share */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Org (20%)
                 </span>
                 <div className="flex items-end">
                   <span className="text-[10px] font-bold text-slate-500 mr-1 pb-1">$</span>
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-cyan-400' : 'text-slate-600'
                   }`}>
                     {organizerShare}
                   </span>
                 </div>
               </div>

               {/* Inventory Weight */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 transactionState === 'AUDIT_FLAG' ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   IoT Stock
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     transactionState === 'AUDIT_FLAG' ? 'text-red-500' : 'text-slate-500'
                   }`}>
                     {physicalWeight.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010203] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Reconciliation Engine</span>
                 {transactionState === 'SALE_PROCESSING' && <span className="text-emerald-400 font-black animate-pulse">RECONCILING IoT vs POS...</span>}
                 {transactionState === 'AUDIT_FLAG' && <span className="text-red-500 font-black animate-pulse">SHRINKAGE DETECTED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Escrow Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#0a0c14]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">ERC-20 ESCROW ROUTER</span>
                <span className="text-[8px] font-mono text-slate-400">IOT AUDITOR</span>
              </div>

              <div className="flex-1 relative flex flex-col overflow-hidden px-6 pt-12 pb-6">
                
                {!systemActive ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">CONTRACT NOT DEPLOYED</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20 flex flex-col justify-between">
                      
                      {/* Top Row: Data Sources */}
                      <div className="flex justify-between w-full h-1/3 border-b border-white/10 pb-4 relative">
                          
                          {/* POS Terminal */}
                          <div className={`w-2/5 flex flex-col items-center justify-center border-2 rounded-xl bg-slate-900 transition-colors ${
                              transactionState === 'SALE_PROCESSING' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-700'
                          }`}>
                              <span className="text-2xl mb-1">💳</span>
                              <span className="text-[8px] font-black uppercase text-slate-400">POS Sales</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{digitalItemsSold} items</span>
                          </div>

                          {/* Data Merging Lines */}
                          <div className="absolute inset-x-0 bottom-0 h-8 flex justify-center translate-y-full -z-10">
                              <svg width="100%" height="100%">
                                  <path d="M 20% 0 Q 50% 100% 50% 100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                                  <path d="M 80% 0 Q 50% 100% 50% 100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                              </svg>
                          </div>

                          {/* IoT Weight Scale */}
                          <div className={`w-2/5 flex flex-col items-center justify-center border-2 rounded-xl bg-slate-900 transition-colors ${
                              transactionState === 'AUDIT_FLAG' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                              transactionState === 'SALE_PROCESSING' ? 'border-blue-500' : 'border-slate-700'
                          }`}>
                              <span className="text-2xl mb-1">⚖️</span>
                              <span className="text-[8px] font-black uppercase text-slate-400">IoT Pallet</span>
                              <span className={`text-xs font-mono font-bold ${transactionState === 'AUDIT_FLAG' ? 'text-red-500' : 'text-blue-400'}`}>
                                {physicalWeight.toFixed(1)}kg
                              </span>
                          </div>

                      </div>

                      {/* Middle: Smart Contract Router */}
                      <div className="h-1/3 flex items-center justify-center relative">
                          <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center bg-black transition-all shadow-xl z-20 ${
                              transactionState === 'AUDIT_FLAG' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' :
                              transactionState === 'SALE_PROCESSING' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'border-slate-700'
                          }`}>
                              <span className="text-xl">⛓️</span>
                              <span className="text-[8px] font-black uppercase text-slate-500">Escrow</span>
                          </div>
                      </div>

                      {/* Bottom Row: Split Wallets */}
                      <div className="flex justify-between w-full h-1/3 border-t border-white/10 pt-4 relative">
                          
                          {/* Split Routing Lines */}
                          <div className="absolute inset-x-0 top-0 h-8 flex justify-center -translate-y-full -z-10">
                              <svg width="100%" height="100%">
                                  <path d="M 50% 0 Q 50% 100% 20% 100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                                  <path d="M 50% 0 Q 50% 100% 80% 100%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                              </svg>

                              {/* Cash flow animation */}
                              {cashFlow.map(c => (
                                  <React.Fragment key={c.id}>
                                      {/* To Vendor */}
                                      <div className="absolute w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"
                                           style={{ left: `${50 - (c.progress * 0.3)}%`, top: `${c.progress}%`, opacity: 1 - (c.progress/100) }}></div>
                                      {/* To Organizer */}
                                      <div className="absolute w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                                           style={{ left: `${50 + (c.progress * 0.3)}%`, top: `${c.progress}%`, opacity: 1 - (c.progress/100) }}></div>
                                  </React.Fragment>
                              ))}
                          </div>

                          {/* Vendor Wallet */}
                          <div className="w-2/5 flex flex-col items-center justify-center border border-indigo-900/50 rounded-xl bg-indigo-950/20">
                              <span className="text-xl mb-1">💼</span>
                              <span className="text-[8px] font-black uppercase text-indigo-400">Vendor Wallet</span>
                              <span className="text-xs font-mono font-bold text-slate-300">80%</span>
                          </div>

                          {/* Organizer Wallet */}
                          <div className="w-2/5 flex flex-col items-center justify-center border border-cyan-900/50 rounded-xl bg-cyan-950/20">
                              <span className="text-xl mb-1">🏦</span>
                              <span className="text-[8px] font-black uppercase text-cyan-400">Org Wallet</span>
                              <span className="text-xs font-mono font-bold text-slate-300">20%</span>
                          </div>

                      </div>

                  </div>
                )}
                
              </div>
            </div>

            {/* Simulation Triggers */}
            <div className="w-full bg-[#0a0c14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Operations</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerSale('LEGIT_SALE')}
                   disabled={!systemActive || transactionState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transactionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-600 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                   }`}
                 >
                   💵 Process Legit Sale
                 </button>

                 <button 
                   onClick={() => triggerSale('SHRINKAGE')}
                   disabled={!systemActive || transactionState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !systemActive || transactionState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-600 text-red-400 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                   }`}
                 >
                   🍔 Steal Inventory<br/>(No POS Entry)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VendorSmartEscrow;
