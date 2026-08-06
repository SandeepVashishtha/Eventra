/* eslint-disable */
import React, { useState } from 'react';

const ZeroKnowledgeAgeVerification = () => {
  const [verificationState, setVerificationState] = useState('idle'); // idle, generating, verifying, verified
  const [zkProofLog, setZkProofLog] = useState([
    { id: 1, time: '21:00:15', type: 'SYS', msg: 'zk-SNARK Engine Initialized on client device.' }
  ]);
  const [cryptographicProof, setCryptographicProof] = useState(null);

  const startVerificationProcess = () => {
    setVerificationState('generating');
    addLog('GEN', 'Reading encrypted Government ID payload from Secure Enclave...');
    
    setTimeout(() => {
      addLog('GEN', 'Executing zk-SNARK prover circuit (Over21_Verifier.circom).');
      
      setTimeout(() => {
        const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        setCryptographicProof(mockHash);
        addLog('GEN', 'Proof generated successfully. 0 bytes of PII exposed.');
        addLog('NET', 'Transmitting cryptographic proof to Vendor POS via NFC.');
        setVerificationState('verifying');
        
        setTimeout(() => {
          addLog('VER', 'Vendor verified zk-SNARK proof. Age requirement met.');
          setVerificationState('verified');
          
          setTimeout(() => {
            resetDemo();
          }, 4000);
          
        }, 2000);
      }, 1800);
    }, 1500);
  };

  const resetDemo = () => {
    setVerificationState('idle');
    setCryptographicProof(null);
    setZkProofLog([{ id: Date.now(), time: getTime(), type: 'SYS', msg: 'zk-SNARK Engine Reset.' }]);
  };

  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const addLog = (type, msg) => {
    setZkProofLog(prev => [...prev, { id: Date.now(), time: getTime(), type, msg }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Engineering Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Cryptography / Web3
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Knowledge Proof <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Age Verification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Scanning physical IDs at festival bars is slow, prone to fake IDs, and forces attendees to hand over highly sensitive personal data (exact address, birthdate, full name) to strangers. Eventra implements military-grade zk-SNARKs for concessions. The app securely reads the verified ID payload on the phone and generates a mathematical proof that strictly states "User is Over 21: TRUE"—exposing zero PII (Personally Identifiable Information).
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🛡️</span> zk-SNARK Prover Circuit
               </h3>
               <span className="bg-slate-900 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-mono border border-slate-800">
                 Groth16 Verifier
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Data Exposure Monitor */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-all duration-300 ${
                 verificationState === 'verified' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">PII Data Exposed</span>
                 <div className="flex items-end">
                   <span className="text-4xl font-black font-mono text-white leading-none">0</span>
                   <span className="text-sm font-bold text-slate-500 ml-2 pb-1">Bytes</span>
                 </div>
                 <div className="mt-2 text-[10px] font-mono text-emerald-600/70">
                   Name: HIDDEN | DOB: HIDDEN
                 </div>
               </div>

               {/* Mathematical Proof Hash */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 verificationState === 'generating' ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 {verificationState === 'generating' && (
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/50 animate-pulse"></div>
                 )}
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Generated ZK-Proof Hash</span>
                 <div className={`text-[9px] font-mono break-all leading-tight ${cryptographicProof ? 'text-emerald-400' : 'text-slate-600'}`}>
                   {cryptographicProof || 'Awaiting prover circuit execution...'}
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Cryptography Event Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {zkProofLog.map((log) => (
                   <div key={log.id} className={`flex items-start animate-fade-in-up ${
                     log.type === 'VER' ? 'text-emerald-400 font-bold' :
                     log.type === 'GEN' ? 'text-teal-400' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-slate-900 rounded-[3rem] border-[12px] border-black shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 px-4 flex flex-col bg-slate-900">
               
               {/* App Header */}
               <div className="text-center mb-8">
                 <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-900/50 border border-emerald-500/50">
                   🍺
                 </div>
                 <h2 className="font-black text-white text-xl tracking-widest uppercase">Bar Fast-Lane</h2>
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Zero-Knowledge Check</p>
               </div>

               {/* Virtual ID Card */}
               <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6 relative overflow-hidden shadow-lg">
                 
                 {/* Holographic overlay */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5 mix-blend-overlay"></div>
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital ID Payload</p>
                     <p className="font-black text-white text-lg leading-tight mt-1">Encrypted on Device</p>
                   </div>
                   <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30">
                     <span className="text-sm">🔒</span>
                   </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name & DOB</p>
                     <div className="h-6 w-3/4 bg-slate-700/50 rounded flex items-center px-2">
                       <span className="text-[10px] font-mono text-slate-500">********************</span>
                     </div>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Residential Address</p>
                     <div className="h-6 w-full bg-slate-700/50 rounded flex items-center px-2">
                       <span className="text-[10px] font-mono text-slate-500">**********************************</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Action Area */}
               <div className="mt-auto relative">
                 
                 {verificationState === 'idle' && (
                   <button 
                     onClick={startVerificationProcess}
                     className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] uppercase tracking-widest text-sm hover:bg-emerald-500 transition relative overflow-hidden group"
                   >
                     <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div>
                     Verify Age & Pay
                   </button>
                 )}

                 {verificationState === 'generating' && (
                   <div className="w-full bg-slate-800 border border-emerald-500/30 text-emerald-400 font-black py-4 rounded-xl uppercase tracking-widest text-sm text-center flex items-center justify-center space-x-3">
                     <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                     <span>Generating ZK Proof...</span>
                   </div>
                 )}

                 {verificationState === 'verifying' && (
                   <div className="w-full bg-teal-900 border border-teal-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm text-center animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                     Tap POS Terminal
                   </div>
                 )}

                 {verificationState === 'verified' && (
                   <div className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm text-center shadow-[0_10px_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 animate-fade-in-up">
                     <span className="text-xl">✅</span>
                     <span>Verified Over 21</span>
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

export default ZeroKnowledgeAgeVerification;
