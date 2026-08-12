import React, { useState, useEffect } from 'react';

const QuantumSafeTicketing = () => {
  const [rotationCounter, setRotationCounter] = useState(15);
  const [qrPixels, setQrPixels] = useState([]);
  const [attackActive, setAttackActive] = useState(false);
  const [defenseStatus, setDefenseStatus] = useState('SECURE'); // SECURE, UNDER_ATTACK, MITIGATED
  
  // Security Log
  const [secLog, setSecLog] = useState([
    { time: '10:00:00', type: 'INFO', msg: 'Lattice-based encryption initialized (CRYSTALS-Kyber).' },
    { time: '10:00:01', type: 'INFO', msg: 'Rolling QR token cycle established (15s).' }
  ]);

  // Generate a random visual QR code representation
  const generateQR = () => {
    const pixels = [];
    for (let i = 0; i < 144; i++) { // 12x12 grid
      pixels.push(Math.random() > 0.5);
    }
    setQrPixels(pixels);
  };

  useEffect(() => {
    generateQR();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotationCounter((prev) => {
        if (prev <= 1) {
          generateQR();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const simulateAttack = () => {
    setAttackActive(true);
    setDefenseStatus('UNDER_ATTACK');
    
    addLog('CRITICAL', 'Detected brute-force cloning attempt (RSA vulnerability attack vector).');
    
    setTimeout(() => {
      addLog('WARN', 'Quantum-algorithm heuristics detected in payload.');
    }, 1500);
    
    setTimeout(() => {
      setDefenseStatus('MITIGATED');
      addLog('SUCCESS', 'Attack deflected. Lattice geometry verified. Token integrity maintained.');
    }, 3500);
    
    setTimeout(() => {
      setAttackActive(false);
      setDefenseStatus('SECURE');
    }, 6000);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSecLog(prev => [{ time: timeString, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Military-Grade Security
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Quantum-Safe <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Cryptographic E-Ticketing</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Highly sophisticated scalping rings use advanced computational methods to reverse-engineer and clone standard RSA-encrypted QR tickets for high-value events. Eventra future-proofs your ingress infrastructure by utilizing Post-Quantum Cryptography (PQC)—specifically lattice-based algorithms like CRYSTALS-Kyber. The rotating QR code becomes mathematically impossible to forge, even by next-generation cyber threats.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🔐</span> Security Operations Center (SOC)
               </h3>
               
               <button 
                 onClick={simulateAttack}
                 disabled={attackActive}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center disabled:opacity-50 ${
                   attackActive ? 'bg-red-900/50 text-red-400 border border-red-500/50' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                 }`}
               >
                 {attackActive ? 'ATTACK IN PROGRESS' : 'Simulate Cloning Attack'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               <div className={`p-4 rounded-xl border flex flex-col justify-center transition-colors duration-500 ${
                 defenseStatus === 'SECURE' ? 'bg-emerald-900/20 border-emerald-500/30' :
                 defenseStatus === 'UNDER_ATTACK' ? 'bg-red-900/20 border-red-500/50 animate-pulse' :
                 'bg-cyan-900/20 border-cyan-500/50'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">PQC Encryption Status</span>
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${
                     defenseStatus === 'SECURE' ? 'bg-emerald-500' :
                     defenseStatus === 'UNDER_ATTACK' ? 'bg-red-500' : 'bg-cyan-500'
                   }`}></div>
                   <span className={`text-xl font-black uppercase tracking-widest ${
                     defenseStatus === 'SECURE' ? 'text-emerald-400' :
                     defenseStatus === 'UNDER_ATTACK' ? 'text-red-500' : 'text-cyan-400'
                   }`}>{defenseStatus.replace('_', ' ')}</span>
                 </div>
               </div>

               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiAvPgo8L3N2Zz4=')]"></div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 relative z-10">Lattice-Based Algorithm</span>
                 <span className="text-xl font-black text-white font-mono relative z-10">
                   CRYSTALS-Kyber
                 </span>
                 <span className="text-[9px] text-slate-500 font-mono mt-1 relative z-10">Key Size: 1184 bytes (Kyber-768)</span>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Intrusion Detection Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {secLog.map((log, i) => (
                   <div key={i} className="flex justify-between items-start animate-fade-in-up">
                     <div>
                       <span className={`mr-2 font-bold ${
                         log.type === 'CRITICAL' ? 'text-red-500' :
                         log.type === 'WARN' ? 'text-amber-500' :
                         log.type === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'
                       }`}>[{log.type}]</span>
                       <span className={log.type === 'CRITICAL' ? 'text-red-400' : log.type === 'SUCCESS' ? 'text-emerald-300' : 'text-slate-300'}>{log.msg}</span>
                     </div>
                     <span className="text-slate-600 shrink-0">{log.time}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Attendee App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-white rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl relative flex flex-col h-[600px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-20 bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="p-6 pb-2 text-slate-900 text-center">
              <h2 className="text-2xl font-black">VIP Access Pass</h2>
              <p className="text-slate-500 text-xs font-bold mt-1">MAIN STAGE • ROW A</p>
            </div>

            {/* Dynamic QR Code Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 relative">
              
              <div className={`p-4 bg-white rounded-2xl border-4 shadow-xl transition-colors duration-500 ${
                attackActive ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'border-slate-200'
              }`}>
                {/* Simulated QR Code Canvas */}
                <div className="w-48 h-48 grid grid-cols-12 gap-0 relative">
                  {qrPixels.map((isDark, i) => (
                    <div key={i} className={`w-full h-full ${isDark ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                  ))}
                  
                  {/* PQC Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                     <div className="w-16 h-16 bg-emerald-500 rounded-full mix-blend-multiply filter blur-md"></div>
                  </div>

                  {/* Hacker Scanning Overlay (Only during attack) */}
                  {attackActive && (
                    <div className="absolute inset-0 overflow-hidden rounded">
                      <div className="w-full h-2 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_1s_ease-in-out_infinite_alternate]"></div>
                    </div>
                  )}
                </div>
              </div>

              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(192px); }
                }
              `}} />

              {/* Security Status Indicators */}
              <div className="mt-8 text-center w-full">
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl px-4 py-3 mb-3 shadow-md">
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Token Rotates In</span>
                   </div>
                   <span className={`font-mono font-black text-xl ${rotationCounter <= 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                     00:{rotationCounter.toString().padStart(2, '0')}
                   </span>
                </div>
                
                <div className="flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase tracking-widest space-x-1">
                  <span>🔒 Protected by Post-Quantum Encryption</span>
                </div>
              </div>
              
              {/* Fake Attack Alert Overlay */}
              {attackActive && (
                <div className="absolute inset-x-4 bottom-4 bg-red-900 text-white rounded-xl p-4 shadow-2xl animate-fade-in text-left border border-red-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🛡️</span>
                    <h4 className="font-bold text-sm">Clone Attempt Blocked</h4>
                  </div>
                  <p className="text-xs text-red-200">Eventra's PQC lattice algorithms have successfully deflected a malicious cloning attempt. Your ticket remains secure.</p>
                </div>
              )}

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default QuantumSafeTicketing;
