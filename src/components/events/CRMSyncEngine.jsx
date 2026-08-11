import React, { useState } from 'react';

const CRMSyncEngine = () => {
  const [activeProvider, setActiveProvider] = useState('hubspot');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, scanning, syncing, success
  const [leadLog, setLeadLog] = useState([
    { id: 'LD-492', name: 'Emily Chen', company: 'Acme Corp', role: 'CTO', time: '10 mins ago', status: 'synced' },
    { id: 'LD-491', name: 'Marcus Johnson', company: 'TechFlow', role: 'VP Sales', time: '1 hr ago', status: 'synced' }
  ]);

  const providers = [
    { id: 'salesforce', name: 'Salesforce', icon: '☁️', color: 'bg-blue-500', connected: false },
    { id: 'hubspot', name: 'HubSpot', icon: '⚙️', color: 'bg-orange-500', connected: true },
    { id: 'marketo', name: 'Marketo', icon: '📊', color: 'bg-purple-600', connected: false }
  ];

  const simulateBadgeScan = () => {
    setSyncStatus('scanning');
    
    setTimeout(() => {
      setSyncStatus('syncing');
      
      setTimeout(() => {
        setSyncStatus('success');
        
        const newLead = {
          id: `LD-${Math.floor(Math.random() * 900) + 100}`,
          name: 'Sarah Williams',
          company: 'Global Enterprises',
          role: 'Director of Marketing',
          time: 'Just now',
          status: 'synced'
        };
        
        setLeadLog(prev => [newLead, ...prev]);
        
        setTimeout(() => {
          setSyncStatus('idle');
        }, 3000);
      }, 1500);
    }, 1000);
  };

  const active = providers.find(p => p.id === activeProvider);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Integrations (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔌</span> B2B Premium Add-on
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">CRM Sync</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop losing hot leads to messy CSV exports. Allow your top sponsors to connect their Salesforce or HubSpot accounts via OAuth. Every badge scan is instantly enriched and pushed to their CRM in real-time.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sponsor Integrations</h3>
             
             <div className="space-y-3 mb-6">
               {providers.map(provider => (
                 <button 
                   key={provider.id}
                   onClick={() => setActiveProvider(provider.id)}
                   className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${activeProvider === provider.id ? 'bg-slate-50 border-blue-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                 >
                   <div className="flex items-center space-x-3">
                     <div className={`w-8 h-8 rounded-lg ${provider.color} flex items-center justify-center text-white shadow-inner`}>
                       {provider.icon}
                     </div>
                     <span className={`font-bold text-sm ${activeProvider === provider.id ? 'text-slate-900' : 'text-slate-600'}`}>{provider.name}</span>
                   </div>
                   
                   {provider.connected ? (
                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">Connected</span>
                   ) : (
                     <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded uppercase hover:bg-slate-50">Connect</span>
                   )}
                 </button>
               ))}
             </div>

             <div className="p-4 bg-slate-900 rounded-xl">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data Mapping Rules</h4>
               <ul className="text-xs font-mono text-emerald-400 space-y-1">
                 <li>Eventra.FirstName → Contact.FirstName</li>
                 <li>Eventra.Company → Account.Name</li>
                 <li>Eventra.Tag → Campaign.Source="Eventra_26"</li>
               </ul>
             </div>
          </div>
        </div>

        {/* Right Side: Lead Sync Simulator (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${active.color}`}></span>
                {active.name} Sync Engine
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-1">Status: {active.connected ? 'OAuth Token Valid' : 'Not Authenticated'}</p>
            </div>
            
            <button 
              onClick={simulateBadgeScan}
              disabled={syncStatus !== 'idle' || !active.connected}
              className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center shadow-sm ${!active.connected ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : syncStatus !== 'idle' ? 'bg-blue-100 text-blue-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {syncStatus !== 'idle' ? 'Processing...' : 'Simulate Badge Scan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
             
             {/* Virtual Scanner App */}
             <div className="bg-slate-950 rounded-2xl p-4 flex flex-col relative overflow-hidden border-4 border-slate-900 shadow-inner">
               <div className="text-center mb-4">
                 <h3 className="text-white font-bold text-sm">Lead Capture App</h3>
                 <span className="text-[9px] text-slate-500 uppercase font-mono">Booth #402</span>
               </div>
               
               <div className="flex-1 border-2 border-slate-800 border-dashed rounded-xl flex items-center justify-center relative">
                 
                 {syncStatus === 'idle' && (
                   <span className="text-slate-600 text-xs font-bold uppercase">Ready to Scan</span>
                 )}

                 {syncStatus === 'scanning' && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-full h-1 bg-green-500 absolute top-0 animate-[scan_1s_ease-in-out_infinite] shadow-[0_0_15px_#22c55e]"></div>
                     <span className="text-green-500 text-3xl font-black">QR</span>
                   </div>
                 )}

                 {syncStatus === 'syncing' && (
                   <div className="text-center">
                     <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                     <span className="text-[10px] text-blue-400 font-bold uppercase">Pushing to API...</span>
                   </div>
                 )}

                 {syncStatus === 'success' && (
                   <div className="text-center animate-fade-in-up">
                     <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/50">
                       <span className="text-emerald-500 text-xl">✓</span>
                     </div>
                     <span className="text-[10px] text-emerald-400 font-bold uppercase">Lead Secured</span>
                   </div>
                 )}
               </div>
             </div>

             {/* CRM Log */}
             <div className="flex flex-col">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                 API Push Log
               </h3>
               
               <div className="space-y-3 overflow-y-auto pr-1">
                 {leadLog.map((lead, idx) => (
                   <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl animate-fade-in-up">
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-sm font-black text-slate-800">{lead.name}</span>
                       <span className="text-[9px] text-emerald-600 font-bold uppercase flex items-center">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                         {lead.status}
                       </span>
                     </div>
                     <div className="text-xs text-slate-500 mb-2">
                       {lead.role} at <span className="font-bold text-slate-700">{lead.company}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                       <span className="text-[10px] font-mono text-slate-400">ID: {lead.id}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{lead.time}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CRMSyncEngine;
