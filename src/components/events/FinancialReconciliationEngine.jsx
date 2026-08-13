/* eslint-disable */
import React, { useState, useEffect } from 'react';

const FinancialReconciliationEngine = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [auditComplete, setAuditComplete] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Data Pipeline ready. Awaiting CSV ingestion.' }
  ]);

  const anomalies = [
      { id: 'TXN-8842', source: 'RFID', error: 'Missing Bank Settlement', amount: 150.00 },
      { id: 'TXN-9102', source: 'POS', error: 'Duplicate Ledger Entry', amount: 45.50 },
      { id: 'TXN-0034', source: 'TICKET', error: 'Refund Mismatch', amount: -25.00 }
  ];

  const runAudit = () => {
      if (isReconciling) return;
      setIsReconciling(true);
      setAuditComplete(false);
      setProgress(0);
      
      addLog('ACTION', 'Ingesting 4.2 Million rows from Stripe, RFID, and POS data lakes...');

      let currentProgress = 0;
      const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 15) + 5;
          
          if (currentProgress >= 100) {
              clearInterval(interval);
              setProgress(100);
              setIsReconciling(false);
              setAuditComplete(true);
              addLog('SUCCESS', 'Deterministic Matching complete. O(N) algorithm finished in 4.2s.');
              addLog('CRIT', '3 Anomalies flagged for manual accountant review.');
          } else {
              setProgress(currentProgress);
              if (currentProgress === 35) addLog('SYS', 'Running Deterministic Hashing against RFID Ledger...');
              if (currentProgress === 75) addLog('SYS', 'Cross-referencing POS payouts with Ticket gateway...');
          }
      }, 500);
  };

  const resetPipeline = () => {
      setProgress(0);
      setAuditComplete(false);
      addLog('WARN', 'Auditor reset. Cleared memory buffers.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050c08] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧾</span> FinTech & Algorithmic Auditing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Post-Event <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Reconciliation Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Reconciling cash, RFID wristband top-ups, ticket refunds, and vendor payouts usually takes a team of accountants 45 days of pouring over mismatched Excel exports. Eventra solves this by building an automated data pipeline. The backend ingests millions of rows from disparate providers, runs a deterministic matching algorithm in seconds, and automatically flags ledger anomalies in a clean React auditing dashboard.
          </p>

          <div className="bg-[#0a140f] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Pipeline Controls
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={auditComplete ? resetPipeline : runAudit}
                   disabled={isReconciling}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     isReconciling ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                     auditComplete ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' :
                     'bg-emerald-600 text-slate-900 border border-emerald-500 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                     {isReconciling ? 'Auditing...' : auditComplete ? 'Reset Data Lakes' : 'Run Algorithmic Audit'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Data Sources */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center items-center transition-colors ${
                   progress > 10 ? 'bg-emerald-950/20 border-emerald-900' : 'bg-slate-900 border-slate-800'
               }`}>
                   <span className="text-2xl mb-2">🎫</span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ticketing API</span>
                   {progress > 10 && <span className="text-[8px] text-emerald-500 mt-1">1.2M Rows Ingested</span>}
               </div>

               <div className={`p-4 rounded-xl border flex flex-col justify-center items-center transition-colors ${
                   progress > 40 ? 'bg-emerald-950/20 border-emerald-900' : 'bg-slate-900 border-slate-800'
               }`}>
                   <span className="text-2xl mb-2">⌚</span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">RFID Gateway</span>
                   {progress > 40 && <span className="text-[8px] text-emerald-500 mt-1">2.4M Rows Ingested</span>}
               </div>

               <div className={`p-4 rounded-xl border flex flex-col justify-center items-center transition-colors ${
                   progress > 70 ? 'bg-emerald-950/20 border-emerald-900' : 'bg-slate-900 border-slate-800'
               }`}>
                   <span className="text-2xl mb-2">🍔</span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">POS Terminals</span>
                   {progress > 70 && <span className="text-[8px] text-emerald-500 mt-1">0.6M Rows Ingested</span>}
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#040906] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Ingestion & Matching Logs</span>
                 {isReconciling && <span className="text-emerald-400 font-black animate-pulse">EXECUTING ALGORITHM...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1 rounded-sm' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-teal-400 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* Auditing Dashboard */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">CFO Audit Dashboard</span>
                      <span className="text-xs text-white font-bold">Ledger Reconciliation</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                          <span>Deterministic Match Progress</span>
                          <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-300'}>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                          ></div>
                      </div>
                  </div>

                  {!auditComplete ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                          <div className="text-6xl mb-4 grayscale">📊</div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                              {isReconciling ? 'Running Cross-Reference Matrices...' : 'Awaiting Audit Execution'}
                          </span>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col animate-fade-in-up">
                          
                          {/* Summary Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-center">
                                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">Perfect Matches</span>
                                  <span className="text-3xl font-black font-mono text-emerald-400">99.9%</span>
                                  <span className="text-[8px] text-slate-400 block mt-1">4,199,997 Rows</span>
                              </div>
                              <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl text-center">
                                  <span className="text-[9px] text-rose-500 font-bold uppercase tracking-widest block mb-1">Flagged Anomalies</span>
                                  <span className="text-3xl font-black font-mono text-rose-400">3</span>
                                  <span className="text-[8px] text-slate-400 block mt-1">Requires Review</span>
                              </div>
                          </div>

                          {/* Anomaly Ledger */}
                          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                              <span className="bg-slate-900 p-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800 flex justify-between items-center">
                                  <span>Unreconciled Exceptions</span>
                                  <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[8px]">ACTION REQ</span>
                              </span>
                              
                              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                  {anomalies.map((anom, i) => (
                                      <div key={i} className="bg-[#111827] border border-rose-900/50 p-3 rounded-lg flex flex-col">
                                          <div className="flex justify-between items-center mb-1">
                                              <span className="text-xs font-mono text-rose-400 font-bold">{anom.id}</span>
                                              <span className="text-xs font-mono font-black text-slate-300">
                                                  ${anom.amount > 0 ? anom.amount.toFixed(2) : `(${Math.abs(anom.amount).toFixed(2)})`}
                                              </span>
                                          </div>
                                          <div className="flex justify-between items-end">
                                              <span className="text-[9px] text-slate-400 uppercase">{anom.error}</span>
                                              <span className="text-[8px] font-bold bg-slate-800 text-slate-300 px-1 rounded uppercase">{anom.source}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a140f] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Algorithmic Auditing:</span>
               Click <span className="text-slate-900 font-bold bg-emerald-600 px-1 rounded">Run Algorithmic Audit</span>. The backend ingests over 4 million rows from disparate CSV exports (Ticketing, RFID, POS). Instead of crashing Excel with VLOOKUPs, a highly-optimized deterministic matching algorithm processes the data in seconds. The UI instantly filters out the 99.9% of perfect matches, explicitly flagging the 3 orphaned transactions for the accounting team to investigate.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default FinancialReconciliationEngine;
