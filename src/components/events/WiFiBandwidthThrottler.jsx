import React, { useState } from 'react';

const WiFiBandwidthThrottler = () => {
  const [connecting, setConnecting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // Network State
  const [networkLoad, setNetworkLoad] = useState(85); // percentage
  const [activeConnections, setActiveConnections] = useState(4205);

  const simulateLogin = (tier) => {
    setConnecting(true);
    
    setTimeout(() => {
      let config = {};
      if (tier === 'VIP') {
        config = { tier: 'VIP Ticket', limit: '50 Mbps', policy: 'PRIORITY_QOS', ip: '10.0.4.192' };
      } else if (tier === 'Exhibitor') {
        config = { tier: 'Exhibitor Badge', limit: '25 Mbps', policy: 'BUSINESS_QOS', ip: '10.0.8.44' };
      } else {
        config = { tier: 'General Admission', limit: '5 Mbps', policy: 'THROTTLED_GUEST', ip: '10.0.12.105' };
      }
      
      setActiveSession(config);
      setConnecting(false);
      setActiveConnections(prev => prev + 1);
    }, 1500);
  };

  const disconnect = () => {
    setActiveSession(null);
    setActiveConnections(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & RADIUS Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Infrastructure Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Dynamic Bandwidth <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Throttling via RADIUS</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Prevent General Admission attendees from crashing the network by streaming Netflix. Eventra integrates directly with Cisco/Aruba enterprise gear via RADIUS. When an attendee logs in, the system checks their ticket tier and dynamically applies Quality of Service (QoS) throttling to guarantee critical business bandwidth for VIPs and Exhibitors.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[350px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Controller Console</h3>
               <span className="bg-emerald-900/50 text-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center border border-emerald-500/30">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Cisco ISE Linked
               </span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Connections</span>
                 <span className="text-2xl font-black text-white">{activeConnections.toLocaleString()}</span>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Core Network Load</span>
                 <div className="flex items-center space-x-3 mt-1">
                   <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-[85%]"></div>
                   </div>
                   <span className="text-lg font-black text-amber-500">{networkLoad}%</span>
                 </div>
               </div>
             </div>

             <div className="flex-1 bg-black p-4 rounded-xl border border-slate-800 font-mono text-[10px] overflow-y-auto">
               <span className="text-slate-500 block mb-2 uppercase font-sans font-bold tracking-widest border-b border-slate-800 pb-1">RADIUS Auth Log</span>
               
               <div className="space-y-1 opacity-80">
                 <div className="text-slate-600">Access-Request: MAC=F8:E9:03...</div>
                 
                 {connecting && (
                   <div className="text-sky-400 animate-pulse mt-2">
                     <div>[Eventra API] Validating Ticket Tier...</div>
                   </div>
                 )}

                 {activeSession && !connecting && (
                   <div className="animate-fade-in-up mt-2">
                     <div className="text-emerald-400">Access-Accept: Auth Success</div>
                     <div className="text-blue-400">Apply Policy: {activeSession.policy}</div>
                     <div className="text-blue-400">Bandwidth-Limit: {activeSession.limit}</div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Captive Portal Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-200 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="bg-white p-4 border-b border-slate-100 flex justify-center items-center z-10 shadow-sm">
              <span className="text-xs font-bold text-slate-900">Log In to "Eventra_Secure_WiFi"</span>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 relative">
              
              {!activeSession ? (
                <div className="w-full max-w-sm animate-fade-in">
                  <div className="w-20 h-20 bg-sky-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-sky-200">
                    <span className="text-4xl">📡</span>
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 text-center mb-2">Connect to Venue WiFi</h2>
                  <p className="text-slate-500 text-xs text-center mb-8">Authenticate with your Eventra registration to receive your dynamic bandwidth allocation.</p>

                  {connecting ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Authenticating via RADIUS...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button 
                        onClick={() => simulateLogin('VIP')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition flex justify-between items-center px-4"
                      >
                        <span>Login as VIP</span>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded">50 Mbps</span>
                      </button>
                      <button 
                        onClick={() => simulateLogin('Exhibitor')}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-xl transition flex justify-between items-center px-4"
                      >
                        <span>Login as Exhibitor</span>
                        <span className="text-xs bg-sky-700 px-2 py-1 rounded">25 Mbps</span>
                      </button>
                      <button 
                        onClick={() => simulateLogin('GA')}
                        className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl border border-slate-200 transition flex justify-between items-center px-4 shadow-sm"
                      >
                        <span>Login as General</span>
                        <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded">5 Mbps</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-sm animate-fade-in-up">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-500/20 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <span className="text-emerald-500 text-5xl">✓</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Connected</h2>
                  <p className="text-emerald-600 font-bold text-sm text-center uppercase tracking-widest mb-8 text-[10px]">Secure Network Access Granted</p>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detected Tier</span>
                      <span className="font-black text-slate-900 text-sm">{activeSession.tier}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allocated Bandwidth</span>
                      <span className="font-black text-sky-600 text-sm bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{activeSession.limit}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IP Address</span>
                      <span className="font-mono text-slate-700 text-xs">{activeSession.ip}</span>
                    </div>
                  </div>

                  <button 
                    onClick={disconnect}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition"
                  >
                    Disconnect
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default WiFiBandwidthThrottler;
