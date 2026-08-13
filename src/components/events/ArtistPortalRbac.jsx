/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ArtistPortalRbac = () => {
  const [currentRole, setCurrentRole] = useState('UNAUTHORIZED'); 
  const [jwtToken, setJwtToken] = useState(null);
  
  // Security Metrics
  const [activeSessions, setActiveSessions] = useState(1204); 
  const [deniedRequests, setDeniedRequests] = useState(0); 
  const [apiLatency, setApiLatency] = useState(42); // ms
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'API Gateway initialized. Strict Multi-tenant isolation active.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Awaiting JWT Bearer authentication.' }
  ]);

  // Visualizer State
  const [activeTab, setActiveTab] = useState('HOSPITALITY');
  const [tabContent, setTabContent] = useState(null);
  const [accessStatus, setAccessStatus] = useState('IDLE'); // IDLE, ALLOWED, DENIED

  const roles = {
      TOUR_MANAGER: {
          name: 'Tour Manager',
          scopes: ['read:hospitality', 'write:hospitality', 'read:guestlist', 'write:guestlist'],
          tenant: 'ARTIST_ODESZA'
      },
      BOOKING_AGENT: {
          name: 'Booking Agent',
          scopes: ['read:financials', 'write:financials', 'read:contracts'],
          tenant: 'ARTIST_ODESZA'
      },
      ARTIST_MANAGER: {
          name: 'Artist Manager (Admin)',
          scopes: ['read:hospitality', 'write:hospitality', 'read:guestlist', 'write:guestlist', 'read:financials', 'write:financials', 'read:contracts'],
          tenant: 'ARTIST_ODESZA'
      }
  };

  useEffect(() => {
    let loop;
    loop = setInterval(() => {
        setActiveSessions(1200 + Math.floor(Math.random() * 50));
        setApiLatency(38 + Math.random() * 12);
    }, 2000); 
    
    return () => clearInterval(loop);
  }, []);

  const loginAs = (roleKey) => {
      setJwtToken('Generating...');
      setCurrentRole('AUTHENTICATING');
      setTabContent(null);
      setAccessStatus('IDLE');
      
      addLog('SYS', `POST /auth/login - Requesting token for ${roleKey}`);
      
      setTimeout(() => {
          const roleData = roles[roleKey];
          const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ role: roleKey, tenant: roleData.tenant, scopes: roleData.scopes }))}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
          
          setJwtToken(token);
          setCurrentRole(roleKey);
          addLog('SUCCESS', `200 OK - Issued JWT with scopes: [${roleData.scopes.join(', ')}]`);
          
          // Auto-fetch default tab based on role to show UI
          if (roleKey === 'BOOKING_AGENT') {
              fetchResource('FINANCIALS', roleKey);
          } else {
              fetchResource('HOSPITALITY', roleKey);
          }

      }, 800);
  };

  const logout = () => {
      setJwtToken(null);
      setCurrentRole('UNAUTHORIZED');
      setTabContent(null);
      setAccessStatus('IDLE');
      addLog('WARN', 'Session terminated. Token revoked.');
  };

  const fetchResource = (resourceTab, overrideRole = currentRole) => {
      if (overrideRole === 'UNAUTHORIZED') return;
      
      setActiveTab(resourceTab);
      setTabContent('LOADING...');
      setAccessStatus('IDLE');
      
      const roleData = roles[overrideRole];
      let requiredScope = '';
      
      if (resourceTab === 'HOSPITALITY') requiredScope = 'read:hospitality';
      if (resourceTab === 'GUESTLIST') requiredScope = 'read:guestlist';
      if (resourceTab === 'FINANCIALS') requiredScope = 'read:financials';

      addLog('ACTION', `GET /api/v1/tenant/${roleData.tenant}/${resourceTab.toLowerCase()}`);
      
      setTimeout(() => {
          if (roleData.scopes.includes(requiredScope)) {
              setAccessStatus('ALLOWED');
              addLog('SUCCESS', `200 OK - Authorization granted via scope: ${requiredScope}`);
              
              if (resourceTab === 'HOSPITALITY') setTabContent('Rider: 2x Casamigos Blanco, 12x Coconut Water, Hummus.');
              if (resourceTab === 'GUESTLIST') setTabContent('Guestlist Data: 12 All Access, 5 GA VIP, 2 Media.');
              if (resourceTab === 'FINANCIALS') setTabContent('Wire Transfer Info: Account Ending in 4992. Status: Escrow.');
          } else {
              setAccessStatus('DENIED');
              setDeniedRequests(prev => prev + 1);
              setTabContent('ERROR: 403 FORBIDDEN. Insufficient Permissions.');
              addLog('CRIT', `403 FORBIDDEN - Token lacks required scope: ${requiredScope}`);
          }
      }, 500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Cybersecurity & Auth
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-tenant RBAC for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">Artist Portals</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Artist managers, booking agents, and tour managers often share a single login to the festival portal, leading to severe security risks regarding sensitive financial payout data. Eventra solves this by implementing a strict Multi-tenant Role-Based Access Control (RBAC) architecture using JSON Web Tokens (JWT). The API Gateway isolates data at the tenant level and enforces granular permission scopes. A Tour Manager can seamlessly update the hospitality rider and guest list, while being strictly blocked with a 403 Forbidden from viewing the booking agent's wire transfers.
          </p>

          <div className="bg-[#080a08] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> API Gateway Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 {currentRole !== 'UNAUTHORIZED' ? (
                     <button 
                       onClick={logout}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center bg-red-900/60 hover:bg-red-800 text-red-400 border border-red-700/50"
                     >
                       Destroy Session Token
                     </button>
                 ) : (
                     <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center bg-slate-800 text-slate-500 border border-slate-700">
                       Unauthenticated
                     </span>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Current Role */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 currentRole === 'AUTHENTICATING' ? 'bg-indigo-950/40 border-indigo-500/50 animate-pulse' : 
                 currentRole !== 'UNAUTHORIZED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active IAM Role
                 </span>
                 <div className="flex items-end">
                   <span className={`text-xl font-black uppercase tracking-widest leading-none transition-colors duration-300 ${
                     currentRole === 'AUTHENTICATING' ? 'text-indigo-400' : 
                     currentRole !== 'UNAUTHORIZED' ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {currentRole === 'UNAUTHORIZED' ? 'NONE' : currentRole.replace('_', ' ')}
                   </span>
                 </div>
               </div>

               {/* Denied Requests */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 deniedRequests > 0 ? 'bg-red-950/40 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   403 Denied
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     deniedRequests > 0 ? 'text-red-500' : 'text-slate-600'
                   }`}>
                     {deniedRequests}
                   </span>
                 </div>
               </div>
               
               {/* API Latency */}
               <div className="col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Gateway Ping
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className="text-2xl font-black font-mono leading-none text-slate-300">
                         {apiLatency.toFixed(0)}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">ms</span>
                     </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020202] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Auth / Request Ledger</span>
                 {jwtToken && jwtToken !== 'Generating...' && <span className="text-emerald-400 font-black">JWT VALIDATED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Login / Portal UI Simulator */}
            <div className="w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[480px] overflow-hidden font-sans mb-6 bg-slate-950">
              
              <div className="pt-4 pb-2 px-6 bg-slate-900 border-b border-slate-800 flex flex-col z-20 absolute inset-x-0 top-0">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black tracking-widest text-white uppercase">Artist Portal</span>
                      <div className={`w-2 h-2 rounded-full ${currentRole !== 'UNAUTHORIZED' && currentRole !== 'AUTHENTICATING' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></div>
                  </div>
                  
                  {/* JWT Token Debug View */}
                  <div className="w-full bg-black rounded border border-slate-800 p-1 flex items-center overflow-hidden h-6">
                      <span className="text-[6px] font-black uppercase text-slate-500 mr-2 shrink-0 border-r border-slate-800 pr-2">Auth Header</span>
                      <span className="text-[6px] font-mono text-emerald-700 truncate">
                          {jwtToken ? `Bearer ${jwtToken}` : 'No Token Present (401)'}
                      </span>
                  </div>
              </div>

              <div className="flex-1 flex flex-col pt-24 px-4 pb-4 relative z-10 overflow-y-auto">
                  
                  {currentRole === 'UNAUTHORIZED' || currentRole === 'AUTHENTICATING' ? (
                     <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
                         
                         <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-xl relative">
                             {currentRole === 'AUTHENTICATING' && (
                                 <div className="absolute inset-0 border-2 rounded-2xl border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                             )}
                             <span className="text-2xl text-slate-500">🔒</span>
                         </div>
                         
                         <h3 className="text-lg font-black text-white mb-6">Select IAM Identity</h3>
                         
                         <div className="w-full space-y-3">
                             <button 
                                 onClick={() => loginAs('TOUR_MANAGER')}
                                 disabled={currentRole === 'AUTHENTICATING'}
                                 className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                             >
                                 Login as Tour Manager
                             </button>
                             <button 
                                 onClick={() => loginAs('BOOKING_AGENT')}
                                 disabled={currentRole === 'AUTHENTICATING'}
                                 className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                             >
                                 Login as Booking Agent
                             </button>
                             <button 
                                 onClick={() => loginAs('ARTIST_MANAGER')}
                                 disabled={currentRole === 'AUTHENTICATING'}
                                 className="w-full py-3 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                             >
                                 Login as Artist Manager
                             </button>
                         </div>
                     </div>
                  ) : (
                    <div className="flex flex-col h-full animate-fade-in-up">
                        
                        {/* Scope Badges */}
                        <div className="mb-4 bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Granted Scopes (Decoded JWT)</span>
                            <div className="flex flex-wrap gap-1">
                                {roles[currentRole].scopes.map(scope => (
                                    <span key={scope} className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded text-[7px] font-mono">
                                        {scope}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Portal Navigation */}
                        <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 mb-4 shrink-0">
                            {['HOSPITALITY', 'GUESTLIST', 'FINANCIALS'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => fetchResource(tab)}
                                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded transition-colors ${
                                        activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className={`flex-1 rounded-xl border relative overflow-hidden flex items-center justify-center p-6 text-center ${
                            accessStatus === 'ALLOWED' ? 'bg-slate-900 border-slate-800' :
                            accessStatus === 'DENIED' ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'
                        }`}>
                            
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <span className="text-6xl font-black rotate-[-30deg]">ODESZA</span>
                            </div>

                            {tabContent === 'LOADING...' ? (
                                <div className="text-xs font-mono text-cyan-400 animate-pulse">FETCHING RESOURCE...</div>
                            ) : accessStatus === 'DENIED' ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center text-red-500 border border-red-800 mb-3 animate-pulse">
                                        <span className="text-xl">⛔</span>
                                    </div>
                                    <span className="text-xs font-black text-red-500 mb-1">403 FORBIDDEN</span>
                                    <span className="text-[10px] text-red-400/70 max-w-[200px] leading-tight">
                                        Your role ({roles[currentRole].name}) lacks the required `read:{activeTab.toLowerCase()}` scope to view this data.
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center relative z-10">
                                    <span className="text-2xl mb-3 text-emerald-400">✔️</span>
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Access Granted</span>
                                    <span className="text-sm text-slate-300 font-mono leading-relaxed bg-black/40 p-3 rounded border border-slate-700">
                                        {tabContent}
                                    </span>
                                </div>
                            )}

                        </div>

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

export default ArtistPortalRbac;
