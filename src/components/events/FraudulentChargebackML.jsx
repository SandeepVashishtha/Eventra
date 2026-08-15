/* eslint-disable */
import React, { useState, useEffect } from 'react';

const FraudulentChargebackML = () => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [evidenceReady, setEvidenceReady] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'FinTech Fraud Module listening for Stripe webhooks.' }
  ]);

  const compileEvidence = () => {
      setIsCompiling(true);
      setEvidenceReady(false);
      addLog('ACTION', 'Malicious Chargeback Detected: $499.00 (Reason: "Service Not Rendered")');
      
      setTimeout(() => {
          addLog('SYS', 'Cross-referencing ticketing DB with RFID gate telemetry...');
          
          setTimeout(() => {
              addLog('WARN', 'RFID match found! User scanned in at Gate B on Friday at 16:24.');
              
              setTimeout(() => {
                  setIsCompiling(false);
                  setEvidenceReady(true);
                  addLog('SUCCESS', 'Evidence packet generated. Disputing chargeback via Stripe API.');
              }, 1500);
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsCompiling(false);
      setEvidenceReady(false);
      addLog('SYS', 'Fraud module reset. Awaiting next webhook.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070202] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-rose-900/40 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💳</span> FinTech & Fraud Prevention
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Fraudulent Chargeback <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-amber-500">ML Classification Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Malicious actors buy VIP tickets, attend the festival, and then file a fraudulent chargeback with their credit card company claiming "service not rendered," costing the festival millions. Eventra solves this using a FinTech fraud detection model. When a chargeback hits the Stripe API, the algorithm instantly cross-references the ticketing database with physical RFID gate scans and app telemetry. It automatically compiles a cryptographic evidence packet to dispute and win the chargeback without manual human intervention.
          </p>

          <div className="bg-[#120303] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-rose-500 text-lg mr-2">🎛️</span> Stripe Webhook Receiver
               </h3>
               {evidenceReady && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4">
                 
                 {/* Stripe Chargeback Alert */}
                 <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 flex flex-col mb-4">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Incoming Dispute Alert</span>
                         <span className="text-[9px] font-mono bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded">ch_1N2yF9</span>
                     </div>
                     <div className="flex items-center justify-between border-b border-rose-900/30 pb-2 mb-2">
                         <div className="flex flex-col">
                             <span className="text-xs font-bold text-white">VIP 3-Day Pass</span>
                             <span className="text-[10px] text-slate-400">User: john.doe@example.com</span>
                         </div>
                         <span className="text-xl font-black text-rose-500 font-mono">-$499.00</span>
                     </div>
                     <div className="text-[9px] text-slate-400 font-mono">
                         Customer Reason: <span className="text-rose-400 font-bold">"Service Not Rendered (Did Not Attend)"</span>
                     </div>
                 </div>
                 
                 <button 
                     onClick={compileEvidence}
                     disabled={isCompiling || evidenceReady}
                     className={`w-full py-3 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg mb-4 ${
                         evidenceReady ? 'bg-emerald-900/40 text-emerald-500 border-emerald-500/50 cursor-not-allowed' :
                         isCompiling ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                     }`}
                 >
                     {evidenceReady ? 'Dispute Won Successfully' : isCompiling ? 'Compiling Cryptographic Evidence...' : 'Compile Dispute Evidence Packet'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>FinTech Resolution Logs</span>
                 {isCompiling && <span className="text-rose-400 font-black animate-pulse">ANALYZING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-1000 ${
                evidenceReady ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''
            }`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Automated Dispute API</span>
                      <span className="text-xs text-white font-bold">Evidence Packet Payload</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {!isCompiling && !evidenceReady && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                          <div className="text-6xl mb-4 grayscale">📂</div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center">
                              Awaiting Chargeback Dispute
                          </span>
                      </div>
                  )}

                  {isCompiling && (
                      <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <span className="text-[10px] text-rose-500 font-mono uppercase tracking-widest animate-pulse">Cross-Referencing Telemetry...</span>
                      </div>
                  )}

                  {evidenceReady && (
                      <div className="flex-1 flex flex-col animate-fade-in-up">
                          
                          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 mb-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-2">Cryptographic Proof of Attendance</span>
                              
                              <div className="space-y-3">
                                  {/* RFID Scan */}
                                  <div className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center">
                                      <div className="flex items-center">
                                          <span className="text-lg mr-2">⌚</span>
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-bold text-white">RFID Wristband Scan</span>
                                              <span className="text-[8px] font-mono text-slate-400">Gate B Turnstile</span>
                                          </div>
                                      </div>
                                      <span className="text-[9px] font-mono text-emerald-400">Oct 12, 16:24:05</span>
                                  </div>

                                  {/* IP Address */}
                                  <div className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center">
                                      <div className="flex items-center">
                                          <span className="text-lg mr-2">📱</span>
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-bold text-white">Mobile App IP Geolocation</span>
                                              <span className="text-[8px] font-mono text-slate-400">Connected to Festival WiFi</span>
                                          </div>
                                      </div>
                                      <span className="text-[9px] font-mono text-emerald-400">Oct 12, 17:05:12</span>
                                  </div>

                                  {/* Barcode Purchase */}
                                  <div className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center">
                                      <div className="flex items-center">
                                          <span className="text-lg mr-2">🍺</span>
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-bold text-white">In-App F&B Purchase</span>
                                              <span className="text-[8px] font-mono text-slate-400">Beer Tent 4 (Last 4: 1234)</span>
                                          </div>
                                      </div>
                                      <span className="text-[9px] font-mono text-emerald-400">Oct 12, 19:30:44</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-auto">
                              <div className="w-full bg-emerald-600 text-white font-bold rounded-xl p-3 text-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                  <div className="text-lg mb-1">✅</div>
                                  <div className="text-xs uppercase tracking-widest">Dispute Won</div>
                                  <div className="text-[9px] font-mono text-emerald-200 mt-1">Funds ($499.00) recovered from Stripe.</div>
                              </div>
                          </div>

                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120303] p-4 rounded-xl border border-rose-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-rose-400 uppercase block mb-1">Automated Dispute Resolution:</span>
               Click <span className="text-white font-bold bg-rose-600 px-1 rounded">Compile Evidence</span>. Instead of the accounting team spending hours manually digging through separate databases to fight a single chargeback, the algorithm intercepts the Stripe webhook. It automatically queries the physical RFID turnstile logs and mobile WiFi telemetry, mathematically proving the user attended the event. It packages this data and submits it to the bank's API, instantly winning the dispute and recovering the revenue.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default FraudulentChargebackML;
