import React, { useState, useEffect } from 'react';

const WiFiBandwidthAllocator = () => {
  const [qosActive, setQosActive] = useState(false);
  
  // Simulated Bandwidth Metrics (Mbps)
  const [metrics, setMetrics] = useState({
    totalCapacity: 10000,
    generalUsage: 8500,
    vipUsage: 450,
    generalLimit: 10000,
    vipLimit: 10000,
    generalThrottle: false
  });

  // Exhibitor Demo Status
  const [exhibitorStatus, setExhibitorStatus] = useState('offline'); // offline, buffering, stable
  
  // Router Log
  const [routerLog, setRouterLog] = useState([
    { time: '13:00:00', msg: 'Meraki AP cluster online. Unrestricted routing active.' }
  ]);

  useEffect(() => {
    let trafficInterval;
    
    if (qosActive) {
      // QoS Engaged: Throttle general, prioritize VIP
      setMetrics(prev => ({
        ...prev,
        generalLimit: 2000, // Hard throttle
        generalUsage: 1950, // Usage drops to limit
        generalThrottle: true
      }));
      setExhibitorStatus('stable');
      
      trafficInterval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          generalUsage: 1900 + Math.random() * 80,
          vipUsage: 800 + Math.random() * 200 // VIP shoots up as they get bandwidth
        }));
      }, 1000);
      
    } else {
      // Unrestricted: General attendees hogging bandwidth
      setMetrics(prev => ({
        ...prev,
        generalLimit: 10000,
        generalThrottle: false
      }));
      setExhibitorStatus('buffering');
      
      trafficInterval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          generalUsage: 8500 + Math.random() * 1000, // Clogging the network
          vipUsage: 100 + Math.random() * 50 // VIP starving
        }));
      }, 1000);
    }
    
    return () => clearInterval(trafficInterval);
  }, [qosActive]);

  const toggleQos = () => {
    if (!qosActive) {
      addLog('CRITICAL: QoS Engine engaged. Deep Packet Inspection active.');
      addLog('Applying hard throttle (2Gbps limit) to General Attendee VLAN.');
      addLog('Allocating dedicated high-speed pipelines to VIP Exhibitor MACs.');
      setQosActive(true);
    } else {
      addLog('QoS Engine disabled. Restoring unrestricted routing.');
      setQosActive(false);
    }
  };

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setRouterLog(prev => [{ time: timeString, msg }, ...prev].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: IT Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🌐</span> Network Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Wi-Fi <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Bandwidth Allocator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Exhibitors paying $10,000 for a booth can't run their live software demos because 5,000 general attendees are clogging the venue Wi-Fi watching YouTube. Eventra interfaces directly with the venue's enterprise routers. The QoS engine automatically inspects traffic, heavily throttling video streaming for standard MAC addresses while dynamically allocating ultra-high-speed, dedicated bandwidth pipelines to registered VIP exhibitors.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[460px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🖧</span> Meraki Router Dashboard
               </h3>
               
               <button 
                 onClick={toggleQos}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   qosActive ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                 }`}
               >
                 {qosActive && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>}
                 {qosActive ? 'QoS Engine Active' : 'Engage QoS Throttling'}
               </button>
             </div>

             <div className="space-y-6 mb-6">
               
               {/* General Attendee VLAN */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                 {metrics.generalThrottle && (
                   <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg z-10 animate-pulse">
                     THROTTLED
                   </div>
                 )}
                 <div className="flex justify-between items-end mb-2">
                   <div>
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">VLAN 10: General Attendees</span>
                     <span className="text-xs font-bold text-slate-300">5,420 Active Devices</span>
                   </div>
                   <div className="text-right">
                     <span className={`text-2xl font-black font-mono ${metrics.generalThrottle ? 'text-red-400' : 'text-emerald-400'}`}>
                       {metrics.generalUsage.toFixed(0)} <span className="text-sm font-bold text-slate-500">Mbps</span>
                     </span>
                   </div>
                 </div>
                 {/* Progress Bar */}
                 <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-slate-700">
                   <div 
                     className={`h-full transition-all duration-300 ${metrics.generalThrottle ? 'bg-red-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${(metrics.generalUsage / 10000) * 100}%` }}
                   ></div>
                 </div>
               </div>

               {/* VIP Exhibitor VLAN */}
               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                 {qosActive && (
                   <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none"></div>
                 )}
                 <div className="flex justify-between items-end mb-2">
                   <div>
                     <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest block">VLAN 20: VIP Exhibitors</span>
                     <span className="text-xs font-bold text-slate-300">42 Premium MAC Addresses</span>
                   </div>
                   <div className="text-right">
                     <span className={`text-2xl font-black font-mono transition-colors duration-500 ${qosActive ? 'text-cyan-400' : 'text-orange-400'}`}>
                       {metrics.vipUsage.toFixed(0)} <span className="text-sm font-bold text-slate-500">Mbps</span>
                     </span>
                   </div>
                 </div>
                 {/* Progress Bar */}
                 <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-slate-700">
                   <div 
                     className={`h-full transition-all duration-300 ${qosActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]' : 'bg-orange-500'}`} 
                     style={{ width: `${(metrics.vipUsage / 1500) * 100}%` }} // Scaled visually for VIP
                   ></div>
                 </div>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Deep Packet Inspection Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2 flex flex-col">
                 {routerLog.map((log, i) => (
                   <div key={i} className={`animate-fade-in-up ${
                     log.msg.includes('CRITICAL') ? 'text-cyan-400 font-bold' : 
                     log.msg.includes('throttle') ? 'text-red-400 font-bold' : 
                     log.msg.includes('VIP') ? 'text-emerald-400 font-bold' : 'text-slate-500'
                   }`}>
                     <span className="text-slate-600 mr-2">[{log.time}]</span>
                     {log.msg}
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Exhibitor Booth Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className={`w-full bg-black rounded-2xl border-4 shadow-2xl relative flex flex-col overflow-hidden aspect-video transition-colors duration-500 ${
            exhibitorStatus === 'buffering' ? 'border-orange-900 shadow-[0_0_30px_rgba(234,88,12,0.3)]' : 'border-cyan-900 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          }`}>
            
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                Booth #104: Main Demo
              </span>
              <span className={`text-[10px] text-white font-mono px-2 py-0.5 rounded border backdrop-blur ${
                exhibitorStatus === 'buffering' ? 'bg-orange-600/50 border-orange-500' : 'bg-cyan-600/50 border-cyan-500'
              }`}>
                {exhibitorStatus === 'buffering' ? 'POOR CONNECTION' : 'PRIORITY PIPELINE'}
              </span>
            </div>

            {/* Video Canvas */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center group">
              
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Software Demo" 
                className={`w-full h-full object-cover transition-all duration-700 ${
                  exhibitorStatus === 'buffering' ? 'filter grayscale blur-[2px] opacity-50' : 'filter-none opacity-100'
                }`}
              />
              
              {/* Buffering Overlay */}
              {exhibitorStatus === 'buffering' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                   <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                   <h2 className="text-orange-400 font-black text-xl tracking-widest uppercase mb-1">Network Stalled</h2>
                   <p className="text-white text-xs font-mono">Insufficient Bandwidth. Demo Failed.</p>
                </div>
              )}
              
              {/* Stable UI Overlay */}
              {exhibitorStatus === 'stable' && (
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="bg-black/80 backdrop-blur px-3 py-2 border border-slate-700 rounded-lg flex items-center space-x-2">
                    <span className="text-xs">⬇️</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">4.2 Gbps</span>
                  </div>
                </div>
              )}
              
            </div>

          </div>

          {/* Context Alert */}
          {exhibitorStatus === 'buffering' ? (
             <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-4 flex items-start space-x-3 animate-fade-in text-orange-200">
               <span className="text-xl">⚠️</span>
               <div>
                 <h4 className="text-orange-400 font-bold text-sm">Exhibitor Complaint</h4>
                 <p className="text-xs mt-1">Booth #104 is demanding a refund. Their product launch livestream just crashed because general attendees are saturating the network.</p>
               </div>
             </div>
          ) : (
             <div className="bg-cyan-900/20 border border-cyan-500/50 rounded-xl p-4 flex items-start space-x-3 animate-fade-in text-cyan-200">
               <span className="text-xl">🛡️</span>
               <div>
                 <h4 className="text-cyan-400 font-bold text-sm">Mission-Critical Data Protected</h4>
                 <p className="text-xs mt-1">QoS engaged. General attendee video streaming throttled. Booth #104 product launch restored via dedicated pipeline.</p>
               </div>
             </div>
          )}
          
        </div>

      </div>
    </div>
  );
};

export default WiFiBandwidthAllocator;
