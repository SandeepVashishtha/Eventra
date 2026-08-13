/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutomatedDSARPortal = () => {
  const [requestType, setRequestType] = useState('EXPORT'); // EXPORT or DELETE
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const [dbStatus, setDbStatus] = useState({
      ticketing: 'idle', // idle, active, done
      rfid: 'idle',
      marketing: 'idle'
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'GDPR/CCPA Compliance Engine online. Awaiting DSAR submissions.' }
  ]);

  const submitDSAR = () => {
      if (isProcessing) return;
      setIsProcessing(true);
      setIsComplete(false);
      setProgress(0);
      setDbStatus({ ticketing: 'idle', rfid: 'idle', marketing: 'idle' });
      
      const reqId = `REQ-${Math.floor(Math.random()*90000) + 10000}`;
      addLog('ACTION', `DSAR ${requestType} request submitted for user_id: 88492. (Tracker: ${reqId})`);
      
      // Simulate Orchestration
      setTimeout(() => {
          setDbStatus(prev => ({...prev, ticketing: 'active'}));
          addLog('SYS', `Querying Ticketing Microservice (Postgres)...`);
          setProgress(20);
      }, 1000);

      setTimeout(() => {
          setDbStatus(prev => ({...prev, ticketing: 'done', rfid: 'active'}));
          addLog('SYS', `Querying RFID Ledger (MongoDB)...`);
          setProgress(50);
      }, 2500);

      setTimeout(() => {
          setDbStatus(prev => ({...prev, rfid: 'done', marketing: 'active'}));
          addLog('SYS', `Querying Marketing CRM (Snowflake)...`);
          setProgress(80);
      }, 4000);

      setTimeout(() => {
          setDbStatus(prev => ({...prev, marketing: 'done'}));
          setProgress(100);
          setIsProcessing(false);
          setIsComplete(true);
          
          if (requestType === 'EXPORT') {
              addLog('SUCCESS', 'Data compiled. Generating 256-bit AES encrypted ZIP archive.');
              addLog('SUCCESS', 'Secure download link emailed to data subject. SLA met.');
          } else {
              addLog('CRIT', 'Right to be Forgotten executed. Hard-deleting PII across all clusters.');
              addLog('SUCCESS', 'Deletion certified. Audit log appended to WORM storage.');
          }
      }, 5500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  const getStatusStyle = (status) => {
      if (status === 'idle') return 'border-slate-800 bg-slate-900/50 text-slate-500';
      if (status === 'active') return 'border-blue-500 bg-blue-900/20 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      if (status === 'done') return 'border-emerald-500 bg-emerald-900/20 text-emerald-400';
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚖️</span> Data Privacy Law & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated GDPR/CCPA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-500">DSAR Orchestrator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When European or Californian attendees legally request a copy of all their personal data (or request deletion), database admins typically have to manually hunt down their records across 5 different microservices, risking severe legal fines if they miss a deadline. Eventra solves this by building an automated Data Subject Access Request (DSAR) portal. The backend orchestrator automatically queries the ticketing, RFID, and marketing databases, compiles a secure ZIP file of their JSON data, and emails them a secure download link instantly.
          </p>

          <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Attendee Request UI
               </h3>
               
               <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                 <button 
                     onClick={() => setRequestType('EXPORT')}
                     disabled={isProcessing}
                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                       requestType === 'EXPORT' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' :
                       'text-slate-500 hover:text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                     }`}
                 >
                     Request Data Copy
                 </button>
                 <button 
                     onClick={() => setRequestType('DELETE')}
                     disabled={isProcessing}
                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                       requestType === 'DELETE' ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' :
                       'text-slate-500 hover:text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                     }`}
                 >
                     Delete My Data
                 </button>
               </div>
             </div>

             <div className="flex-1 flex flex-col justify-center items-center mb-6 relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                 
                 <div className="text-center mb-6">
                     <span className="text-4xl mb-2 block">👤</span>
                     <span className="text-white font-bold text-lg">Alex Mercer</span>
                     <span className="text-slate-500 text-xs block font-mono">ID: usr_88492</span>
                 </div>
                 
                 <button 
                     onClick={submitDSAR}
                     disabled={isProcessing}
                     className={`w-full max-w-xs py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                         isProcessing ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                         requestType === 'EXPORT' ? 'bg-cyan-600 text-white border border-cyan-500 hover:bg-cyan-500' :
                         'bg-rose-600 text-white border border-rose-500 hover:bg-rose-500'
                     }`}
                 >
                     {isProcessing ? (
                         <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Submitting to Legal...</>
                     ) : (
                         `Submit ${requestType} Request`
                     )}
                 </button>

                 <div className="absolute top-2 right-2 flex space-x-1">
                     <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-900 text-emerald-400 px-1 rounded border border-emerald-500/50">GDPR Compliant</span>
                     <span className="text-[8px] font-black uppercase tracking-widest bg-blue-900 text-blue-400 px-1 rounded border border-blue-500/50">CCPA Compliant</span>
                 </div>
             </div>
             
             {/* System Log */}
             <div className="h-32 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Audit Trail</span>
                 {isProcessing && <span className="text-blue-400 font-black animate-pulse">ORCHESTRATING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
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
            
            {/* Orchestration Dashboard */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Legal Compliance Dashboard</span>
                      <span className="text-xs text-white font-bold">DSAR Orchestrator Pipeline</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Progress Header */}
                  <div className="mb-8">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                          <span>Execution Progress</span>
                          <span className={progress === 100 ? 'text-emerald-400' : 'text-cyan-400'}>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                              className={`h-full transition-all duration-300 ${requestType === 'DELETE' ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                              style={{ width: `${progress}%` }}
                          ></div>
                      </div>
                  </div>

                  {/* Microservices Matrix */}
                  <div className="flex-1 flex flex-col space-y-4">
                      
                      <div className={`p-4 rounded-xl border flex items-center transition-all duration-500 ${getStatusStyle(dbStatus.ticketing)}`}>
                          <div className="w-10 h-10 rounded-lg bg-slate-950/50 border border-inherit flex items-center justify-center text-xl mr-4 shrink-0">🎫</div>
                          <div className="flex flex-col flex-1">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Ticketing Microservice</span>
                              <span className="text-[9px] opacity-70 font-mono">SELECT * FROM users WHERE id='88492'</span>
                          </div>
                          {dbStatus.ticketing === 'done' && <span className="text-emerald-400 ml-2">✓</span>}
                      </div>
                      
                      <div className={`p-4 rounded-xl border flex items-center transition-all duration-500 ${getStatusStyle(dbStatus.rfid)}`}>
                          <div className="w-10 h-10 rounded-lg bg-slate-950/50 border border-inherit flex items-center justify-center text-xl mr-4 shrink-0">⌚</div>
                          <div className="flex flex-col flex-1">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1">RFID Ledger</span>
                              <span className="text-[9px] opacity-70 font-mono">db.transactions.find({userId: '88492'})</span>
                          </div>
                          {dbStatus.rfid === 'done' && <span className="text-emerald-400 ml-2">✓</span>}
                      </div>

                      <div className={`p-4 rounded-xl border flex items-center transition-all duration-500 ${getStatusStyle(dbStatus.marketing)}`}>
                          <div className="w-10 h-10 rounded-lg bg-slate-950/50 border border-inherit flex items-center justify-center text-xl mr-4 shrink-0">📱</div>
                          <div className="flex flex-col flex-1">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Marketing CRM</span>
                              <span className="text-[9px] opacity-70 font-mono">Querying Snowflake Data Warehouse...</span>
                          </div>
                          {dbStatus.marketing === 'done' && <span className="text-emerald-400 ml-2">✓</span>}
                      </div>

                  </div>

                  {/* Final Output */}
                  {isComplete && (
                      <div className={`mt-6 p-4 rounded-xl border animate-fade-in-up text-center ${
                          requestType === 'EXPORT' ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-rose-900/20 border-rose-500/50'
                      }`}>
                          {requestType === 'EXPORT' ? (
                              <>
                                  <div className="text-2xl mb-2">📦</div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Data Compiled Successfully</div>
                                  <div className="text-xs text-cyan-100/70">Encrypted ZIP sent to alex.mercer@email.com via secure link.</div>
                              </>
                          ) : (
                              <>
                                  <div className="text-2xl mb-2">🗑️</div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Right to be Forgotten Executed</div>
                                  <div className="text-xs text-rose-100/70">PII permanently purged from all databases to comply with GDPR Article 17.</div>
                              </>
                          )}
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b101a] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Backend Orchestration:</span>
               Select <span className="text-white font-bold bg-slate-800 px-1 rounded">Request Data Copy</span> and click submit. Instead of a database admin manually hunting down rows, the Orchestrator algorithm programmatically queries the individual databases in sequence. It collects the fragmented JSON data and automatically packages it into a secure, compliant ZIP file, meeting the 30-day legal deadline in roughly 5 seconds.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutomatedDSARPortal;
