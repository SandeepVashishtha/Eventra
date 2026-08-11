/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EcoTokenRewards = () => {
  const [stationActive, setStationActive] = useState(false);
  const [binStatus, setBinStatus] = useState('IDLE'); // IDLE, SCANNING_USER, SCANNING_ITEM, VALIDATING, MINTING, SUCCESS
  
  // User Wallet State
  const [walletBalance, setWalletBalance] = useState(45);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Smart Recycling Bin 07 (Main Bar) connected.' },
    { id: 2, time: '18:00:01', type: 'SYS', msg: 'Computer Vision classification model loaded.' }
  ]);

  const simulateRecycleEvent = () => {
    if (stationActive && binStatus === 'IDLE') {
      setBinStatus('SCANNING_USER');
      addLog('ACTION', 'User presented NFC wristband. Auth: 0x7B9...A2F4');
      
      setTimeout(() => {
        setBinStatus('SCANNING_ITEM');
        addLog('SYS', 'Chute opened. Item detected. Capturing object frames...');
        
        setTimeout(() => {
          setBinStatus('VALIDATING');
          addLog('AI', 'CV Classification: 98.7% Aluminum Can (Eventra IPA).');
          
          setTimeout(() => {
            setBinStatus('MINTING');
            addLog('WEB3', 'Valid recyclable confirmed. Executing Smart Contract mint...');
            
            setTimeout(() => {
              setBinStatus('SUCCESS');
              setWalletBalance(prev => prev + 5);
              addLog('SUCCESS', '+5 $ECO Tokens minted to wallet 0x7B9...A2F4.');
              
              setTimeout(() => {
                setBinStatus('IDLE');
              }, 2500);
              
            }, 1500);
          }, 1200);
        }, 1200);
      }, 1000);
    }
  };

  const toggleStation = () => {
    if (!stationActive) {
      setStationActive(true);
      setBinStatus('IDLE');
      addLog('SYS', 'Smart Bin online. Ready for Gamified Circular Economy processing.');
    } else {
      setStationActive(false);
      setBinStatus('IDLE');
      addLog('WARN', 'Smart Bin offline. Reverting to standard un-incentivized trash can.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#07130a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: System Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-green-900/40 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Gamified Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Waste Circular <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Economy Token Rewards</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Despite having recycling bins, attendees leave thousands of plastic cups and cans on the ground because there is no immediate incentive to clean up. Eventra changes behavior by equipping recycling bins with NFC readers and Computer Vision. Attendees scan their wristband and drop a cup in the bin. The CV verifies it is a valid recyclable item, and a blockchain smart contract instantly mints "Eco-Tokens" to the user's wallet. These tokens can be spent immediately at the bar for discounts, gamifying environmentalism.
          </p>

          <div className="bg-[#0b1c11] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-green-500 text-lg mr-2">🌱</span> Smart Bin Processor
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleStation}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     stationActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                   }`}
                 >
                   {stationActive ? 'Power Down Bin' : 'Activate Smart Bin'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* CV Validation Engine */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 binStatus === 'SCANNING_ITEM' || binStatus === 'VALIDATING' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 stationActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">CV Validation Engine</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     binStatus === 'SCANNING_ITEM' || binStatus === 'VALIDATING' ? 'text-cyan-400' :
                     stationActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {binStatus === 'SCANNING_ITEM' ? 'Scanning...' : 
                      binStatus === 'VALIDATING' ? 'Aluminum Can' : 
                      stationActive ? 'Ready' : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {binStatus === 'VALIDATING' ? 'Confidence: 98.7%' : 
                      stationActive ? 'Awaiting Chute Drop' : '---'}
                   </span>
                 </div>
               </div>

               {/* Smart Contract Minting */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 binStatus === 'MINTING' ? 'bg-fuchsia-950/40 border-fuchsia-500/50 shadow-inner' :
                 binStatus === 'SUCCESS' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 stationActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Web3 Smart Contract</span>
                 <div className="flex flex-col">
                   <span className={`text-2xl font-black font-mono leading-tight ${
                     binStatus === 'MINTING' ? 'text-fuchsia-400' : 
                     binStatus === 'SUCCESS' ? 'text-emerald-400' : 
                     stationActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {binStatus === 'MINTING' ? 'Minting +5...' : 
                      binStatus === 'SUCCESS' ? 'TX CONFIRMED' : 
                      stationActive ? 'Standby' : 'OFFLINE'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-mono">
                     {binStatus === 'MINTING' ? 'Calling ERC-20 transfer()' : 
                      stationActive ? 'Token: $ECO' : '---'}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050a07] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Bin Telemetry & Chain Log</span>
                 {(binStatus === 'SCANNING_ITEM' || binStatus === 'VALIDATING') && <span className="text-cyan-400 animate-pulse">Running YOLO Inference...</span>}
                 {binStatus === 'MINTING' && <span className="text-fuchsia-400 animate-pulse">Signing Transaction...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'AI' ? 'text-cyan-400 font-bold' :
                       log.type === 'WEB3' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'ACTION' ? 'text-green-400 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Eventra App Simulator & Bin Interaction (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[340px] flex flex-col items-center">
            
            {/* Phone Wallet Simulator */}
            <div className={`w-full rounded-[2.5rem] border-[10px] border-[#18181b] shadow-2xl relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              {/* Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-20 h-6 bg-[#18181b] rounded-b-2xl"></div>
              </div>

              {/* Status Bar */}
              <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-end pb-1 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <span className="text-[10px] font-bold text-white">18:00</span>
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Eventra Wallet</span>
              </div>

              <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col items-center justify-start pt-16 px-6">
                
                <div className="text-center mb-8">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Eco-Token Balance</span>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-5xl font-black text-white font-mono tracking-tighter">
                      {walletBalance}
                    </span>
                    <span className="text-2xl font-black text-green-500">
                      $ECO
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                   {/* NFC Scanning Animation */}
                   {binStatus === 'SCANNING_USER' && (
                     <div className="absolute inset-0 bg-blue-500/20 z-10 animate-pulse"></div>
                   )}
                   {binStatus === 'SUCCESS' && (
                     <div className="absolute inset-0 bg-emerald-500/20 z-10 animate-fade-in"></div>
                   )}
                   
                   <span className="text-4xl block mb-2 relative z-20">
                     {binStatus === 'SUCCESS' ? '🤑' : binStatus === 'SCANNING_USER' ? '📱' : '♻️'}
                   </span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 relative z-20">
                     {binStatus === 'SUCCESS' ? '+5 Tokens Added!' : 
                      binStatus === 'SCANNING_USER' ? 'Wristband Authorized' : 
                      'Scan Wristband at Bin'}
                   </span>
                </div>

                {/* Redeem Offer */}
                <div className="w-full bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-green-500/30 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-white block">Free Beverage</span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Bar Discount</span>
                  </div>
                  <div className="bg-emerald-600 px-3 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest">
                    -50 $ECO
                  </div>
                </div>

              </div>
            </div>

            {/* Interaction Buttons (Physical Action Simulator) */}
            <div className="w-full">
              <button 
                onClick={simulateRecycleEvent}
                disabled={!stationActive || binStatus !== 'IDLE'}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition shadow-md border ${
                  !stationActive || binStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 
                  'bg-green-600 border-green-500 text-white hover:bg-green-500 shadow-[0_10px_30px_rgba(22,163,74,0.3)]'
                }`}
              >
                {binStatus === 'IDLE' ? '1. Tap Wristband & 2. Drop Can' : 
                 binStatus === 'SCANNING_USER' ? 'Authorizing User...' :
                 binStatus === 'SCANNING_ITEM' || binStatus === 'VALIDATING' ? 'AI Validating Item...' :
                 binStatus === 'MINTING' ? 'Minting Blockchain Reward...' : 'Success!'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default EcoTokenRewards;
