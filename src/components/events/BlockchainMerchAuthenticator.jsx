/* eslint-disable */
import React, { useState } from 'react';

const BlockchainMerchAuthenticator = () => {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, verifying, verified, fake
  const [merchType, setMerchType] = useState('hoodie'); // hoodie, poster
  
  const [smartContractLog, setSmartContractLog] = useState([
    { id: 1, time: '13:45:10', event: 'Web3 RPC Node Connected (Polygon Mainnet).' }
  ]);

  const [nftMetadata, setNftMetadata] = useState(null);

  const triggerScan = (type) => {
    setMerchType(type);
    setScanState('scanning');
    setNftMetadata(null);
    addLog(`NFC Sensor triggered. Reading NDEF payload from physical garment...`);
    
    setTimeout(() => {
      if (type === 'hoodie') {
        addLog(`Payload Acquired: uid=0x9f8c...3a1b`);
        setScanState('verifying');
        
        setTimeout(() => {
          addLog(`Calling EventraMerch.sol -> verifyAuthenticity(uid)`);
          
          setTimeout(() => {
            addLog(`SUCCESS: Transaction verified on block #49312019.`);
            setNftMetadata({
              name: 'Eventra Fest 2026 Official Hoodie (L)',
              mintDate: 'Aug 01, 2026',
              contract: '0x7a2...9d11',
              batch: '#402-A',
              manufacturer: 'EthicalThreads Inc. (Los Angeles, CA)',
              status: 'VERIFIED AUTHENTIC'
            });
            setScanState('verified');
            
            setTimeout(() => {
              resetSim();
            }, 6000);
          }, 1500);
        }, 1200);
        
      } else {
        // Bootleg Poster
        addLog(`Payload Acquired: UNKNOWN PROTOCOL / MALFORMED NDEF`);
        setScanState('verifying');
        
        setTimeout(() => {
          addLog(`Calling EventraMerch.sol -> verifyAuthenticity(uid)`);
          
          setTimeout(() => {
            addLog(`ERROR: Contract reverted. Token UID does not exist on chain.`);
            setScanState('fake');
            
            setTimeout(() => {
              resetSim();
            }, 5000);
          }, 1500);
        }, 1200);
      }
    }, 1500);
  };

  const resetSim = () => {
    setScanState('idle');
    setNftMetadata(null);
  };

  const addLog = (event) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSmartContractLog(prev => [{ id: Date.now(), time: timeStr, event }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔗</span> Supply Chain / IoT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Blockchain-Backed Merch <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Authenticator</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Bootleggers consistently sell fake, low-quality event merchandise outside venue gates, undercutting organizer revenue and damaging brand reputation. Eventra solves this by embedding inexpensive NFC chips in all official merchandise. These chips are cryptographically linked to a Polygon smart contract. Buyers simply tap their phone to their new hoodie to instantly verify its authenticity and origin on the blockchain, rendering bootleg merch provably fake.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-amber-500 text-lg mr-2">🔍</span> Contract Auditor
               </h3>
               <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-mono border border-amber-200">
                 EventraMerch.sol
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Scan Simulator: Official Merch */}
               <div 
                 onClick={() => scanState === 'idle' ? triggerScan('hoodie') : null}
                 className={`p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                   scanState === 'idle' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-amber-400' : 
                   scanState !== 'idle' && merchType === 'hoodie' ? 'bg-amber-50 border-amber-400 shadow-md scale-105' : 'bg-slate-50 border-slate-200 opacity-50 pointer-events-none'
                 }`}
               >
                 <span className="text-4xl mb-2">🧥</span>
                 <span className="text-xs font-bold text-slate-700">Official Hoodie</span>
                 <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Embedded NFC</span>
               </div>

               {/* Scan Simulator: Bootleg Merch */}
               <div 
                 onClick={() => scanState === 'idle' ? triggerScan('poster') : null}
                 className={`p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                   scanState === 'idle' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-rose-400' : 
                   scanState !== 'idle' && merchType === 'poster' ? 'bg-rose-50 border-rose-400 shadow-md scale-105' : 'bg-slate-50 border-slate-200 opacity-50 pointer-events-none'
                 }`}
               >
                 <span className="text-4xl mb-2">🖼️</span>
                 <span className="text-xs font-bold text-slate-700">Bootleg Poster</span>
                 <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Fake NFC Tag</span>
               </div>

             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">RPC Node Activity</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {smartContractLog.map((log) => (
                   <div key={log.id} className={`flex items-start animate-fade-in-up ${
                     log.event.includes('SUCCESS') ? 'text-emerald-400 font-bold' :
                     log.event.includes('ERROR') ? 'text-rose-400 font-bold' :
                     log.event.includes('Acquired') ? 'text-amber-400' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.event}</span>
                   </div>
                 ))}
                 
                 {scanState === 'verifying' && (
                   <div className="text-amber-400 animate-pulse mt-2 flex items-center">
                     <span className="mr-2">⚙️</span> Querying blockchain state...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee Mobile App (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-30">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 px-6 flex flex-col bg-slate-50 relative overflow-hidden">
               
               {/* Header Info */}
               <div className="text-center mb-8 relative z-10">
                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                   🛡️
                 </div>
                 <h2 className="font-black text-slate-900 text-xl tracking-tight">Merch Authenticator</h2>
                 <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">Verify Event Goods</p>
               </div>

               {/* Central UI Area */}
               <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full">
                 
                 {scanState === 'idle' && (
                   <div className="text-center w-full max-w-[240px]">
                     <div className="w-32 h-32 mx-auto border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center text-4xl mb-6 relative">
                       <span className="absolute inset-0 bg-slate-100 rounded-full scale-50 opacity-50"></span>
                       📱
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg mb-2">Ready to Scan</h3>
                     <p className="text-xs text-slate-500">Hold your phone near the NFC tag embedded in the merchandise tag.</p>
                   </div>
                 )}

                 {scanState === 'scanning' && (
                   <div className="text-center w-full max-w-[240px]">
                     <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 relative">
                       <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                       <div className="absolute inset-2 border-4 border-amber-200 rounded-full border-b-transparent animate-spin animation-delay-150"></div>
                       📡
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg mb-2">Reading Chip...</h3>
                     <p className="text-xs text-slate-500">Extracting cryptographic payload.</p>
                   </div>
                 )}

                 {scanState === 'verifying' && (
                   <div className="text-center w-full max-w-[240px]">
                     <div className="w-32 h-32 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-4xl mb-6 relative shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                       <span className="text-white text-sm font-mono animate-pulse">&lt; Web3 /&gt;</span>
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg mb-2">Verifying Ledger...</h3>
                     <p className="text-xs text-slate-500">Checking provenance on the Polygon blockchain.</p>
                   </div>
                 )}

                 {scanState === 'verified' && nftMetadata && (
                   <div className="w-full bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden animate-fade-in-up">
                     <div className="bg-emerald-500 text-white text-center py-4 flex flex-col items-center">
                       <span className="text-3xl mb-1">✅</span>
                       <h3 className="font-black tracking-widest text-sm uppercase">Authentic</h3>
                     </div>
                     <div className="p-5 space-y-4">
                       <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product</p>
                         <p className="font-bold text-slate-800 text-sm leading-tight">{nftMetadata.name}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mint Date</p>
                           <p className="font-mono text-xs text-slate-700">{nftMetadata.mintDate}</p>
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch ID</p>
                           <p className="font-mono text-xs text-slate-700">{nftMetadata.batch}</p>
                         </div>
                       </div>
                       <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manufacturer</p>
                         <p className="font-mono text-xs text-slate-700">{nftMetadata.manufacturer}</p>
                       </div>
                       <div className="pt-4 border-t border-slate-100">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Smart Contract</p>
                         <p className="font-mono text-[10px] text-emerald-600 bg-emerald-50 py-1 px-2 rounded">{nftMetadata.contract}</p>
                       </div>
                     </div>
                   </div>
                 )}

                 {scanState === 'fake' && (
                   <div className="w-full bg-white rounded-2xl shadow-xl border border-rose-200 overflow-hidden animate-fade-in-up">
                     <div className="bg-rose-600 text-white text-center py-6 flex flex-col items-center">
                       <span className="text-5xl mb-2">❌</span>
                       <h3 className="font-black tracking-widest text-lg uppercase">Counterfeit</h3>
                       <p className="text-xs text-rose-200 mt-1">Bootleg Merchandise Detected</p>
                     </div>
                     <div className="p-5 text-center">
                       <p className="text-sm text-slate-600 mb-4">
                         This item's NFC tag could not be cryptographically verified on the blockchain. Do not purchase.
                       </p>
                       <div className="bg-slate-100 rounded-lg p-3">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Error Code</p>
                         <p className="font-mono text-xs text-rose-600">ERR_UID_NOT_FOUND_ON_CHAIN</p>
                       </div>
                     </div>
                   </div>
                 )}

               </div>

               {/* Abstract background graphics */}
               {scanState === 'verified' && (
                 <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                   <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                 </div>
               )}
               {scanState === 'fake' && (
                 <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlockchainMerchAuthenticator;
