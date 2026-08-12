import React, { useState } from 'react';

const MultiTenantAgencyDashboard = () => {
  const [activeClient, setActiveClient] = useState('mega');
  const [deploying, setDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);

  const clients = [
    { 
      id: 'mega', 
      name: 'MegaCorp Summit', 
      domain: 'events.megacorp.com', 
      status: 'Live',
      theme: 'bg-blue-600',
      logo: 'M',
      stats: { users: '12.4k', mrr: '$45k' }
    },
    { 
      id: 'nexus', 
      name: 'Nexus Tech Week', 
      domain: 'tickets.nexus.io', 
      status: 'Live',
      theme: 'bg-purple-600',
      logo: 'NX',
      stats: { users: '8.2k', mrr: '$28k' }
    },
    { 
      id: 'vertex', 
      name: 'Vertex Festival', 
      domain: 'vip.vertexfest.co', 
      status: 'Draft',
      theme: 'bg-orange-500',
      logo: 'V',
      stats: { users: '0', mrr: '$0' }
    }
  ];

  const handleDeploy = () => {
    setDeploying(true);
    setDeploymentSuccess(false);
    setTimeout(() => {
      setDeploying(false);
      setDeploymentSuccess(true);
      setTimeout(() => setDeploymentSuccess(false), 3000);
    }, 2000);
  };

  const active = clients.find(c => c.id === activeClient);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Client List (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Enterprise Architecture
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            White-Label <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900">Multi-Tenancy</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Unlock the lucrative B2B agency market. Spin up completely isolated, strict multi-tenant event environments on custom domains with unique branding, all managed from a single central database and codebase.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agency Portfolio</h3>
              <button className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">+ New Client</button>
            </div>
            
            <div className="space-y-2">
              {clients.map((client) => (
                <button 
                  key={client.id}
                  onClick={() => setActiveClient(client.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${activeClient === client.id ? 'bg-slate-900 border-slate-900 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${client.theme}`}>
                      {client.logo}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${activeClient === client.id ? 'text-white' : 'text-slate-800'}`}>{client.name}</h4>
                      <p className={`text-[10px] font-mono mt-0.5 ${activeClient === client.id ? 'text-slate-400' : 'text-slate-500'}`}>{client.domain}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${client.status === 'Live' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {client.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Deployment & White-Label Config (Col span 8) */}
        <div className="lg:col-span-8 grid grid-rows-[auto_1fr] gap-6 h-full min-h-[600px]">
          
          {/* Top Panel: Environment Config */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <div className="flex items-center space-x-3">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-inner ${active.theme}`}>
                   {active.logo}
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-slate-900">{active.name} Environment</h2>
                   <p className="text-xs text-slate-500 font-mono mt-1">Tenant ID: evt_tn_{active.id}93x</p>
                 </div>
               </div>
               
               <button 
                 onClick={handleDeploy}
                 disabled={deploying || deploymentSuccess}
                 className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center shadow-sm ${deploying ? 'bg-slate-200 text-slate-500 cursor-wait' : deploymentSuccess ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
               >
                 {deploying ? (
                   <><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></span> Syncing DB...</>
                 ) : deploymentSuccess ? (
                   '✓ Environment Live'
                 ) : (
                   'Deploy to Edge'
                 )}
               </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Custom Domain Mapping</p>
                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center">
                   <span className="font-mono text-xs text-slate-700">{active.domain}</span>
                   <span className="text-emerald-500 text-xs font-bold">CNAME Verified</span>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Data Isolation</p>
                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center space-x-2">
                   <span className="text-slate-400">🔒</span>
                   <span className="text-xs font-bold text-slate-700">Row-Level Security Active</span>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Tenant Analytics</p>
                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-700">{active.stats.users} Users</span>
                   <span className="text-xs font-bold text-blue-600">{active.stats.mrr} MRR</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Bottom Panel: White-Label Live Preview */}
          <div className="bg-slate-900 rounded-3xl p-2 border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
             
             {/* Browser Chrome */}
             <div className="h-10 bg-slate-800 rounded-t-2xl flex items-center px-4 space-x-2">
               <div className="flex space-x-1.5 mr-4">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               </div>
               <div className="flex-1 bg-slate-900 rounded-md h-6 flex items-center justify-center font-mono text-[10px] text-slate-400">
                 https://{active.domain}
               </div>
             </div>

             {/* Live Preview Area */}
             <div className="flex-1 bg-white relative overflow-hidden flex flex-col animate-fade-in">
               
               {/* Client Header */}
               <div className={`${active.theme} p-6 text-white flex justify-between items-center transition-colors duration-500`}>
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                     {active.logo}
                   </div>
                   <span className="font-black text-xl tracking-tight">{active.name}</span>
                 </div>
                 <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                   Get Tickets
                 </button>
               </div>

               {/* Client Content */}
               <div className="p-8 flex-1 bg-slate-50">
                 <div className="max-w-md">
                   <h1 className="text-3xl font-black text-slate-900 mb-4">Welcome to the premier event for {active.name.split(' ')[0]} professionals.</h1>
                   <p className="text-slate-500 mb-6 leading-relaxed">This is a completely white-labeled portal. There is zero Eventra branding visible to the end-user. The database is strictly isolated from other tenants via Row-Level Security.</p>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="h-24 bg-slate-200 rounded-xl"></div>
                     <div className="h-24 bg-slate-200 rounded-xl"></div>
                   </div>
                 </div>
               </div>

               {/* Eventra Powered By (Hidden) */}
               <div className="absolute bottom-2 right-4 flex items-center space-x-1 opacity-20">
                 <span className="text-[8px] font-bold uppercase text-slate-500">Powered by</span>
                 <span className="text-[10px] font-black text-slate-800">Eventra Engine</span>
               </div>

             </div>

             {deploying && (
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-full animate-spin mb-4"></div>
                 <p className="text-white font-bold font-mono text-sm">Propagating DNS & Compiling Theme...</p>
               </div>
             )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default MultiTenantAgencyDashboard;
