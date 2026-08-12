import React, { useState } from 'react';

const DigitalSignageFleet = () => {
  const [pushingUpdate, setPushingUpdate] = useState(false);
  const [fleetStatus, setFleetStatus] = useState('synced'); // synced, pushing, out_of_sync
  
  const [displays, setDisplays] = useState([
    { id: 'DISP-A1', location: 'Main Lobby Entrance', status: 'online', ip: '10.0.1.42', currentLayout: 'Welcome_Banner_v2' },
    { id: 'DISP-B3', location: 'Hallway B (Outside Room 102)', status: 'online', ip: '10.0.1.45', currentLayout: 'Agenda_Morning' },
    { id: 'DISP-C1', location: 'Keynote Hall Stage Right', status: 'online', ip: '10.0.1.99', currentLayout: 'Sponsor_Loop' },
    { id: 'DISP-D4', location: 'VIP Lounge', status: 'offline', ip: '10.0.2.14', currentLayout: 'Unknown' }
  ]);

  const [activeEmergencyOverride, setActiveEmergencyOverride] = useState(false);

  const pushGlobalUpdate = () => {
    setPushingUpdate(true);
    setFleetStatus('pushing');
    
    setTimeout(() => {
      setDisplays(prev => prev.map(disp => 
        disp.status === 'online' ? { ...disp, currentLayout: 'Agenda_Afternoon_UPDATED' } : disp
      ));
      setPushingUpdate(false);
      setFleetStatus('synced');
    }, 2000);
  };

  const triggerEmergencyOverride = () => {
    if (activeEmergencyOverride) {
      setActiveEmergencyOverride(false);
      setFleetStatus('out_of_sync'); // Requires a push to fix
    } else {
      setActiveEmergencyOverride(true);
      setDisplays(prev => prev.map(disp => 
        disp.status === 'online' ? { ...disp, currentLayout: 'EMERGENCY_EVAC_OVERRIDE' } : disp
      ));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Fleet Controller (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📺</span> Hardware IoT
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Digital Signage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Fleet Control</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop running around the convention center with USB thumb drives. Eventra acts as a centralized CMS, allowing you to push dynamic HTML5 layouts via WebSockets to hundreds of smart TVs and Raspberry Pis globally in milliseconds.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Network Control</h3>
               <span className={`text-[9px] font-black uppercase px-2 py-1 rounded flex items-center ${
                 fleetStatus === 'synced' ? 'bg-emerald-900/50 text-emerald-400' : 
                 fleetStatus === 'pushing' ? 'bg-orange-900/50 text-orange-400 animate-pulse' : 
                 'bg-rose-900/50 text-rose-400'
               }`}>
                 <span className={`w-1.5 h-1.5 rounded-full mr-2 ${fleetStatus === 'synced' ? 'bg-emerald-400' : fleetStatus === 'pushing' ? 'bg-orange-400' : 'bg-rose-400'}`}></span>
                 {fleetStatus === 'synced' ? 'All Endpoints Synced' : fleetStatus === 'pushing' ? 'WebSocket Push Active' : 'Fleet Out of Sync'}
               </span>
             </div>
             
             <div className="space-y-4 relative z-10">
               
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Global Agenda Update</span>
                 <p className="text-xs text-slate-300 mb-4">Room 102 session moved to Room 405. Push agenda correction to all hallway displays.</p>
                 <button 
                   onClick={pushGlobalUpdate}
                   disabled={pushingUpdate || activeEmergencyOverride}
                   className={`w-full py-3 rounded-lg text-sm font-bold transition flex items-center justify-center ${pushingUpdate ? 'bg-orange-600 text-white cursor-wait' : activeEmergencyOverride ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-white hover:bg-slate-200 text-slate-900'}`}
                 >
                   {pushingUpdate ? (
                     <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Pushing to Fleet...</>
                   ) : 'Push HTML5 Update to Fleet'}
                 </button>
               </div>

               <div className={`p-4 rounded-xl border transition-all ${activeEmergencyOverride ? 'bg-rose-950/50 border-rose-500/50' : 'bg-slate-950 border-slate-800'}`}>
                 <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${activeEmergencyOverride ? 'text-rose-400' : 'text-slate-500'}`}>Emergency Broadcast System</span>
                 <button 
                   onClick={triggerEmergencyOverride}
                   className={`w-full py-3 rounded-lg text-xs font-bold transition border ${activeEmergencyOverride ? 'bg-rose-600 text-white border-rose-500' : 'bg-transparent text-rose-500 border-rose-500/30 hover:bg-rose-900/30'}`}
                 >
                   {activeEmergencyOverride ? 'Deactivate Emergency Override' : '⚠️ Trigger Evacuation Override'}
                 </button>
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Fleet Status Dashboard (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Endpoint Status Monitor</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">4 Devices provisioned on local network.</p>
            </div>
            <div className="flex space-x-2">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">3 Online</span>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded">1 Offline</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
            
            {displays.map(disp => (
              <div key={disp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-all hover:border-slate-300">
                
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${disp.status === 'online' ? 'bg-slate-200' : 'bg-rose-100 opacity-50'}`}>
                    📺
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-black text-sm ${disp.status === 'online' ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{disp.location}</h4>
                      <span className={`w-2 h-2 rounded-full ${disp.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </div>
                    <div className="flex space-x-3 text-[10px] font-mono text-slate-500">
                      <span>ID: {disp.id}</span>
                      <span>IP: {disp.ip}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Render Output</span>
                  
                  {disp.status === 'offline' ? (
                    <span className="inline-block bg-slate-200 text-slate-500 text-xs font-mono px-3 py-1 rounded border border-slate-300">
                      CONNECTION_LOST
                    </span>
                  ) : activeEmergencyOverride ? (
                    <span className="inline-block bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded border border-rose-200 animate-pulse">
                      {disp.currentLayout}
                    </span>
                  ) : (
                    <span className={`inline-block text-xs font-mono px-3 py-1 rounded border transition-colors duration-500 ${pushingUpdate ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {disp.currentLayout}.html
                    </span>
                  )}
                </div>
                
              </div>
            ))}

          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500">WebSocket Server: ws://eventra.local:8080</span>
            <button className="text-xs font-bold text-orange-600 hover:text-orange-700">Ping All Endpoints</button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DigitalSignageFleet;
