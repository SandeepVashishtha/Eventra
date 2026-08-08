import React, { useState } from 'react';

const BLEContactTracing = () => {
  const [reportState, setReportState] = useState('idle'); // idle, analyzing, broadcasting, complete
  
  const [metrics, setMetrics] = useState({
    activeBadges: 14205,
    proximityEventsLogged: 849201
  });

  const [exposedContacts, setExposedContacts] = useState(0);

  const triggerIllnessReport = () => {
    setReportState('analyzing');
    
    setTimeout(() => {
      // Found 42 high-risk contacts (close proximity > 15 mins)
      setExposedContacts(42);
      
      setTimeout(() => {
        setReportState('broadcasting');
        
        setTimeout(() => {
          setReportState('complete');
          
          setTimeout(() => {
            setReportState('idle');
            setExposedContacts(0);
          }, 6000);
          
        }, 2500);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚕️</span> Health & Safety
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Passive BLE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Contact Tracing</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Ensure epidemiological safety for in-person gatherings. Eventra utilizes Bluetooth Low Energy (BLE) chips inside attendee smart badges to passively log encrypted proximity events. If someone tests positive post-event, the system instantly and anonymously alerts only those who met the high-risk exposure threshold (e.g., &lt; 6 feet for &gt; 15 mins).
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden">
             
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 relative z-10">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Epidemiological Log</h3>
               <span className="bg-teal-50 text-teal-600 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center border border-teal-200">
                 <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 animate-pulse"></span> BLE Mesh Active
               </span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Active Badges Tracking</span>
                 <span className="text-3xl font-black text-slate-900 font-mono">{metrics.activeBadges.toLocaleString()}</span>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Encrypted Interactions</span>
                 <span className="text-3xl font-black text-teal-600 font-mono">{metrics.proximityEventsLogged.toLocaleString()}</span>
               </div>
             </div>

             <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-inner relative z-10">
               
               {reportState === 'idle' ? (
                 <div className="text-center animate-fade-in py-2">
                   <h4 className="text-sm font-bold text-white mb-2">Simulate Post-Event Positive Test</h4>
                   <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">Trigger an illness report for Attendee #8942. The system will decrypt the interaction ledger to find high-risk exposures.</p>
                   <button 
                     onClick={triggerIllnessReport}
                     className="bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-lg transition shadow-[0_0_15px_rgba(13,148,136,0.4)]"
                   >
                     Report Positive Case
                   </button>
                 </div>
               ) : reportState === 'analyzing' ? (
                 <div className="text-center animate-fade-in-up py-4">
                   <div className="w-12 h-12 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                   <h4 className="text-sm font-bold text-teal-400 uppercase tracking-widest">Decrypting Interaction Ledger...</h4>
                   <p className="text-[10px] text-slate-500 font-mono mt-2">Filtering for Distance &lt; 2m AND Duration &gt; 15m</p>
                 </div>
               ) : (
                 <div className="animate-fade-in-up">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="bg-rose-900/50 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block mb-2">
                         Exposure Ring Identified
                       </span>
                       <h4 className="text-xl font-black text-white">{exposedContacts} High-Risk Contacts</h4>
                     </div>
                     <span className="text-4xl">🦠</span>
                   </div>
                   
                   {reportState === 'broadcasting' ? (
                     <div className="bg-slate-800 rounded-lg p-3">
                       <div className="flex justify-between text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2">
                         <span className="animate-pulse">Dispatching Anonymous Alerts...</span>
                       </div>
                       <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-500 w-full animate-[progress_2.5s_ease-in-out]"></div>
                       </div>
                     </div>
                   ) : (
                     <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 text-center">
                       <span className="text-emerald-400 font-bold text-xs">✓ Anonymous SMS/Email Alerts Dispatched Successfully</span>
                     </div>
                   )}
                 </div>
               )}

             </div>
          </div>
        </div>

        {/* Right Side: Proximity Visualization (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-sm bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
            
            <h3 className="absolute top-6 left-6 text-xs font-black text-slate-800 uppercase tracking-widest">Proximity Visualization</h3>

            {/* Central "Infected" Node */}
            <div className={`relative z-20 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-colors duration-1000 ${
              reportState !== 'idle' ? 'bg-rose-100 border-2 border-rose-500' : 'bg-slate-100 border border-slate-300'
            }`}>
              👤
              
              {/* Radar Pings */}
              {reportState === 'idle' && (
                <>
                  <div className="absolute inset-0 rounded-full border border-teal-400 animate-[ping_2s_ease-out_infinite]"></div>
                  <div className="absolute inset-0 rounded-full border border-teal-400 animate-[ping_3s_ease-out_infinite]"></div>
                </>
              )}
            </div>

            {/* Surrounding Nodes */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              
              {/* High Risk Inner Circle (< 6ft) */}
              <div className={`absolute w-48 h-48 rounded-full border-2 border-dashed transition-colors duration-1000 ${
                reportState !== 'idle' ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
              }`}></div>
              
              {/* Low Risk Outer Circle */}
              <div className="absolute w-72 h-72 rounded-full border border-slate-100"></div>

              {/* Node 1: High Risk (Inside 6ft) */}
              <div className="absolute w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs shadow-sm transform -translate-x-12 -translate-y-16">
                👤
                {reportState === 'broadcasting' && (
                  <div className="absolute -top-6 bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow animate-fade-in-up whitespace-nowrap">Alert Sent</div>
                )}
                {reportState === 'complete' && (
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500"></div>
                )}
              </div>

              {/* Node 2: High Risk (Inside 6ft) */}
              <div className="absolute w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs shadow-sm transform translate-x-16 translate-y-8">
                👤
                {reportState === 'broadcasting' && (
                  <div className="absolute -top-6 bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow animate-fade-in-up whitespace-nowrap" style={{ animationDelay: '0.5s' }}>Alert Sent</div>
                )}
                {reportState === 'complete' && (
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500"></div>
                )}
              </div>

              {/* Node 3: Low Risk (Outside 6ft) */}
              <div className="absolute w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs shadow-sm transform -translate-x-28 translate-y-20">
                👤
                {reportState !== 'idle' && (
                  <div className="absolute -bottom-5 text-[8px] font-bold text-slate-400 whitespace-nowrap">Low Risk (Safe)</div>
                )}
              </div>

            </div>

            <div className="absolute bottom-6 inset-x-6 text-center">
              <span className="text-[9px] text-slate-400 font-mono block">BLE MAC IDs are hashed and rotated every 15 minutes to preserve attendee privacy.</span>
            </div>

          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default BLEContactTracing;
