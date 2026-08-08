/* eslint-disable */
import React, { useState, useEffect } from 'react';

const FoodSupplyChainLedger = () => {
  const [ledgerActive, setLedgerActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // 'BURGER', 'AVOCADO', null
  
  // Ledger Verification States
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('IDLE'); // IDLE, VERIFYING, VERIFIED
  
  // Network Metrics
  const [activeNodes, setActiveNodes] = useState(0);
  const [carbonOffset, setCarbonOffset] = useState(0); // kg CO2e
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'Food Vendor Network synced to Polygon Mainnet.' },
    { id: 2, time: '11:00:02', type: 'SYS', msg: 'Awaiting attendee POS transaction query.' }
  ]);

  const items = {
      BURGER: {
          name: 'Grass-Fed Wagyu Burger',
          vendor: 'Gourmet Grill Co.',
          price: '$22.00',
          image: '🍔',
          blocks: [
              { label: 'Farm Origin', data: 'Green Valley Ranch, CA', hash: '0x94f2...3a1c', timestamp: '2026-08-01 06:14:00' },
              { label: 'Processing', data: 'NorCal Ethical Meats', hash: '0x77d1...8e4b', timestamp: '2026-08-03 14:30:00' },
              { label: 'Logistics', data: 'EV Cold Chain Transport', hash: '0x22a9...1b77', timestamp: '2026-08-05 09:00:00' },
              { label: 'Vendor Delivery', data: 'Gourmet Grill Co. (Stage B)', hash: '0x88c4...9d01', timestamp: '2026-08-07 10:15:00' }
          ]
      },
      AVOCADO: {
          name: 'Locally Sourced Avo Toast',
          vendor: 'Vegan Vibes',
          price: '$18.00',
          image: '🥑',
          blocks: [
              { label: 'Farm Origin', data: 'Sunny Acres, Mexico (Imported)', hash: '0x55b8...2c99', timestamp: '2026-07-28 08:00:00', flag: true }, // Not actually local
              { label: 'Logistics', data: 'Diesel Freight Shipping', hash: '0x33e1...5f44', timestamp: '2026-08-02 11:20:00', flag: true },
              { label: 'Distributor', data: 'MassProduce Inc.', hash: '0x11d7...8a22', timestamp: '2026-08-05 07:45:00' },
              { label: 'Vendor Delivery', data: 'Vegan Vibes (Main Stage)', hash: '0x99f0...3b55', timestamp: '2026-08-07 09:30:00' }
          ]
      }
  };

  useEffect(() => {
    let loop;
    
    if (ledgerActive) {
      loop = setInterval(() => {
          setActiveNodes(Math.floor(Math.random() * 50) + 12000);
      }, 500);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [ledgerActive]);

  const verifyItem = (itemKey) => {
    if (!ledgerActive || verificationStatus === 'VERIFYING') return;

    setSelectedItem(itemKey);
    setVerificationStatus('VERIFYING');
    setVerificationProgress(0);
    
    addLog('WEB3', `Querying immutable ledger for ${items[itemKey].name}...`);

    let progress = 0;
    const verifyLoop = setInterval(() => {
        progress += 25;
        setVerificationProgress(progress);
        
        if (progress === 50) addLog('SYS', 'Validating cryptographic block hashes...');
        
        if (progress >= 100) {
            clearInterval(verifyLoop);
            setVerificationStatus('VERIFIED');
            
            if (itemKey === 'BURGER') {
                addLog('SUCCESS', 'Supply chain mathematically verified. Sourcing matches claims.');
                setCarbonOffset(14.5); // good offset
            } else {
                addLog('CRIT', 'GREENWASHING DETECTED: Origin contradicts "Locally Sourced" claim.');
                setCarbonOffset(-42.0); // bad footprint
            }
        }
    }, 400);
  };

  const resetLedger = () => {
    setSelectedItem(null);
    setVerificationStatus('IDLE');
    setVerificationProgress(0);
    setCarbonOffset(0);
  };

  const toggleLedger = () => {
    if (!ledgerActive) {
      setLedgerActive(true);
      setActiveNodes(12045);
      addLog('SYS', 'Food Vendor Supply Chain Ledger online. Cryptographic tracking enabled.');
    } else {
      setLedgerActive(false);
      setActiveNodes(0);
      resetLedger();
      addLog('WARN', 'Ledger Offline. Vendor sourcing claims unverified.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060805] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ledger Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌱</span> Cryptographic Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Blockchain-Verified Supply Chain <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">for Festival Food</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees are increasingly demanding locally sourced, ethical food options, but festival food vendors often make false claims (greenwashing) to justify charging $20 for a burger. Eventra solves this by integrating an immutable supply chain ledger into the POS system. When an attendee buys an item, they can view the cryptographically verified Web3 block history proving the exact farm the ingredients came from, the date of transport, and the carbon offset of the logistics chain, ensuring total transparency and honesty.
          </p>

          <div className="bg-[#0c140f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">⛓️</span> Decentralized Verification Hub
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleLedger}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     ledgerActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {ledgerActive ? 'Disconnect Ledger' : 'Connect to Polygon Mainnet'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Network Nodes */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 ledgerActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Active Validator Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     ledgerActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeNodes.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Carbon Offset */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 carbonOffset < 0 ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                 carbonOffset > 0 ? 'bg-teal-950/30 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Chain Carbon Impact
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     carbonOffset < 0 ? 'text-red-400' :
                     carbonOffset > 0 ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {carbonOffset > 0 ? '+' : ''}{carbonOffset.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">kg CO2e</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050a07] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>EVM Execution Log</span>
                 {verificationStatus === 'VERIFYING' && <span className="text-teal-400 animate-pulse">Hashing blocks...</span>}
                 {verificationStatus === 'VERIFIED' && selectedItem === 'BURGER' && <span className="text-emerald-400 animate-pulse">SOURCING VERIFIED</span>}
                 {verificationStatus === 'VERIFIED' && selectedItem === 'AVOCADO' && <span className="text-red-500 animate-pulse">GREENWASHING ALERT</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
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
            
            {/* App UI Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">ATTENDEE APP</span>
                <span className="text-[8px] font-mono text-slate-400">FOOD TRANSPARENCY UI</span>
              </div>

              <div className="flex-1 relative bg-[#040806] overflow-hidden flex flex-col p-4 pt-10">
                
                {!selectedItem ? (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">SCAN VENDOR QR TO<br/>VERIFY SOURCING</span>
                     <div className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center animate-pulse">
                         <span className="text-3xl opacity-50">📱</span>
                     </div>
                   </div>
                ) : (
                  <>
                    {/* Item Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <div className="flex items-center">
                            <span className="text-3xl mr-3">{items[selectedItem].image}</span>
                            <div>
                                <span className="text-[12px] font-black text-white block">{items[selectedItem].name}</span>
                                <span className="text-[9px] text-slate-400">{items[selectedItem].vendor}</span>
                            </div>
                        </div>
                        <span className="text-[14px] font-mono text-emerald-400 font-bold">{items[selectedItem].price}</span>
                    </div>

                    {/* Verification Progress */}
                    {verificationStatus === 'VERIFYING' && (
                        <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
                            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${verificationProgress}%` }}></div>
                        </div>
                    )}

                    {/* Blockchain Timeline */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                        {verificationStatus === 'IDLE' || verificationStatus === 'VERIFYING' ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <span className="text-[10px] font-mono animate-pulse">Retrieving blocks...</span>
                            </div>
                        ) : (
                            <div className="space-y-4 relative">
                                {/* Vertical connecting line */}
                                <div className="absolute left-3 top-2 bottom-6 w-px bg-slate-700 z-0"></div>

                                {items[selectedItem].blocks.map((block, idx) => (
                                    <div key={idx} className="relative z-10 flex items-start pl-8">
                                        {/* Status Dot */}
                                        <div className={`absolute left-[9px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#040806] ${
                                            block.flag ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500'
                                        }`}></div>
                                        
                                        <div className="w-full bg-slate-900/80 border border-slate-800 p-2 rounded flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{block.label}</span>
                                            <span className={`text-[11px] font-medium ${block.flag ? 'text-red-400' : 'text-slate-200'}`}>{block.data}</span>
                                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-800/50">
                                                <span className="text-[7px] font-mono text-teal-500 bg-teal-950/30 px-1 rounded">Tx: {block.hash}</span>
                                                <span className="text-[7px] font-mono text-slate-500">{block.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alert Banner */}
                    {verificationStatus === 'VERIFIED' && selectedItem === 'AVOCADO' && (
                        <div className="mt-2 bg-red-950/80 border border-red-500/50 rounded p-2 flex flex-col items-center text-center animate-pulse">
                            <span className="text-[10px] font-black text-red-500 uppercase">FALSE CLAIM DETECTED</span>
                            <span className="text-[8px] font-mono text-slate-300">Origin block contradicts "Local" signage.</span>
                        </div>
                    )}
                    {verificationStatus === 'VERIFIED' && selectedItem === 'BURGER' && (
                        <div className="mt-2 bg-emerald-950/80 border border-emerald-500/50 rounded p-2 flex flex-col items-center text-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <span className="text-[10px] font-black text-emerald-400 uppercase">VERIFIED ETHICAL SOURCE</span>
                            <span className="text-[8px] font-mono text-slate-300">100% Match with Vendor Claims.</span>
                        </div>
                    )}

                  </>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#0c140f] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User POS Scan</span>
               
               <div className="grid grid-cols-2 gap-2 mb-2">
                 <button 
                   onClick={() => verifyItem('BURGER')}
                   disabled={!ledgerActive || verificationStatus === 'VERIFYING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !ledgerActive || verificationStatus === 'VERIFYING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-emerald-950/40 border-emerald-900 text-emerald-400 hover:bg-emerald-900/60'
                   }`}
                 >
                   Verify: $22 Wagyu Burger
                 </button>
                 
                 <button 
                   onClick={() => verifyItem('AVOCADO')}
                   disabled={!ledgerActive || verificationStatus === 'VERIFYING'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !ledgerActive || verificationStatus === 'VERIFYING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-red-950/40 border-red-900 text-red-400 hover:bg-red-900/60'
                   }`}
                 >
                   Verify: $18 "Local" Avo Toast
                 </button>
               </div>
               
               <button 
                   onClick={resetLedger}
                   disabled={!selectedItem || verificationStatus === 'VERIFYING'}
                   className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[8px] transition border ${
                     !selectedItem || verificationStatus === 'VERIFYING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   Reset App UI
               </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default FoodSupplyChainLedger;
