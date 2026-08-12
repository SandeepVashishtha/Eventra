/* eslint-disable */
import React, { useState, useEffect } from 'react';

const MultiModalVIPDispatch = () => {
  const [dispatchActive, setDispatchActive] = useState(false);
  const [routeStatus, setRouteStatus] = useState('IDLE'); // IDLE, TRACKING_JET, HELI_EN_ROUTE, GOLF_CART_SYNC
  
  // Logistics Telemetry
  const [jetETA, setJetETA] = useState('--');
  const [heliStatus, setHeliStatus] = useState('Grounded (LAX)');
  const [cartStatus, setCartStatus] = useState('Standby (Festival HQ)');
  const [overallWaitTime, setOverallWaitTime] = useState(0); // Minutes of VIP waiting
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Multi-Modal Logistics Router online.' },
    { id: 2, time: '08:00:02', type: 'SYS', msg: 'Connected to FAA API and internal ground-fleet GPS trackers.' }
  ]);

  useEffect(() => {
    let loop;
    
    if (dispatchActive && routeStatus === 'TRACKING_JET') {
      let etaMin = 15;
      loop = setInterval(() => {
        etaMin -= 1;
        setJetETA(`T-Minus ${etaMin}m`);
        
        if (etaMin === 8) {
          setRouteStatus('HELI_EN_ROUTE');
          setHeliStatus('Airborne (Inbound LAX)');
          addLog('ACTION', 'Jet passing 10k ft. Auto-dispatching Helicopter N344H to LAX tarmac.');
        }
      }, 1000);
    } else if (routeStatus === 'HELI_EN_ROUTE') {
      let etaMin = 8;
      loop = setInterval(() => {
        etaMin -= 1;
        setJetETA(`T-Minus ${etaMin}m`);
        
        if (etaMin === 3) {
          setRouteStatus('GOLF_CART_SYNC');
          setHeliStatus('Landed (LAX Tarmac) -> Boarding');
          setCartStatus('Dispatched -> Festival Helipad');
          addLog('SYS', 'Helicopter boarding successful. VIP en route to Festival airspace.');
          addLog('ACTION', 'Synchronizing Golf Cart 04 to intercept Helipad precisely at touchdown.');
        }
      }, 1000);
    } else if (routeStatus === 'GOLF_CART_SYNC') {
       let etaMin = 3;
       loop = setInterval(() => {
         etaMin -= 1;
         setJetETA(`T-Minus ${etaMin}m`);
         
         if (etaMin <= 0) {
           clearInterval(loop);
           setJetETA('ARRIVED');
           setHeliStatus('Landed (Festival Helipad)');
           setCartStatus('Intercepted -> Transporting to VIP Lounge');
           addLog('SUCCESS', 'Zero-Wait-Time Transit Achieved. VIP safely in Lounge.');
           addLog('WEB3', 'Automated escrow payment released to transport vendors.');
         }
       }, 1000);
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [dispatchActive, routeStatus]);

  const triggerVIPArrival = () => {
    if (dispatchActive && routeStatus === 'IDLE') {
      setRouteStatus('TRACKING_JET');
      setJetETA('T-Minus 15m');
      addLog('WARN', 'FAA Ping: VIP Private Jet (Tail: N552X) entered approach vector.');
      addLog('AI', 'Calculating optimal multi-modal intercept routing...');
    }
  };

  const resetRouting = () => {
    setRouteStatus('IDLE');
    setJetETA('--');
    setHeliStatus('Grounded (LAX)');
    setCartStatus('Standby (Festival HQ)');
    setOverallWaitTime(0);
    addLog('SYS', 'Routing reset. Awaiting next VIP itinerary.');
  };

  const toggleDispatch = () => {
    if (!dispatchActive) {
      setDispatchActive(true);
      addLog('SYS', 'Logistics Router armed. Tracking global VIP aviation assets.');
    } else {
      setDispatchActive(false);
      resetRouting();
      addLog('WARN', 'Router offline. Transport coordinators must rely on manual radio dispatch.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Logistics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🗺️</span> VIP Transit Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Modal VIP Transport <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Dispatch Algorithm</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Coordinating disparate luxury transport options for ultra-VIPs—such as private jets, helicopters, yachts, and black cars—usually requires dozens of frantic phone calls, leading to missed connections and angry clients. Eventra solves this by building a centralized, multi-modal routing algorithm. The system tracks the FAA GPS of the VIP's private jet, automatically dispatches a helicopter to the tarmac exactly as they land, and synchronizes a golf cart at the festival helipad to ensure a seamless, zero-wait-time transit experience from the airspace directly to the VIP lounge.
          </p>

          <div className="bg-[#0b101c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">⏱️</span> Transit Synchronization
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleDispatch}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     dispatchActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {dispatchActive ? 'Disable Auto-Dispatch' : 'Engage Routing Engine'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* VIP Jet Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 routeStatus !== 'IDLE' && jetETA !== 'ARRIVED' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 jetETA === 'ARRIVED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' :
                 dispatchActive ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Primary Asset (N552X Jet)
                 </span>
                 <div className="flex flex-col">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     jetETA === 'ARRIVED' ? 'text-emerald-400' :
                     routeStatus !== 'IDLE' ? 'text-cyan-400 animate-pulse' :
                     dispatchActive ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {dispatchActive ? jetETA : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest font-mono">
                     {jetETA === 'ARRIVED' ? 'Transit Complete' : routeStatus !== 'IDLE' ? 'Inbound FAA Vector' : 'Awaiting Departure'}
                   </span>
                 </div>
               </div>

               {/* Synchronized Fleet Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 dispatchActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Secondary Fleet Sync
                 </span>
                 <div className="flex flex-col text-[10px] font-mono text-slate-400 space-y-1">
                   <div className="flex justify-between border-b border-slate-700 pb-1">
                     <span>Heli N344H:</span>
                     <span className={routeStatus === 'HELI_EN_ROUTE' || routeStatus === 'GOLF_CART_SYNC' ? 'text-indigo-400 font-bold' : ''}>
                       {heliStatus}
                     </span>
                   </div>
                   <div className="flex justify-between pt-1">
                     <span>Cart 04:</span>
                     <span className={routeStatus === 'GOLF_CART_SYNC' || jetETA === 'ARRIVED' ? 'text-cyan-400 font-bold' : ''}>
                       {cartStatus}
                     </span>
                   </div>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010307] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Dispatch Routing Log</span>
                 {routeStatus === 'TRACKING_JET' && <span className="text-cyan-400 animate-pulse">Calculating Intercepts...</span>}
                 {jetETA === 'ARRIVED' && <span className="text-emerald-500 animate-pulse">Itinerary Complete</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-fuchsia-400 font-bold' :
                       log.type === 'AI' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Transit Map Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[340px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/60 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">MULTI-MODAL MAP</span>
                <span className="text-[8px] font-mono text-slate-400">VIP ZERO-WAIT PROTOCOL</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex items-center justify-center p-6">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBoMjBWMHptMTktMXZoLTE4VjE5eiIgZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-50 z-0"></div>

                <div className="relative w-full h-full">
                  
                  {/* Waypoints */}
                  {/* LAX (Top Left) */}
                  <div className="absolute top-[10%] left-[10%] flex flex-col items-center z-20">
                     <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.5)]"></div>
                     <span className="text-[7px] font-black tracking-widest text-slate-400 mt-1">LAX TARMAC</span>
                  </div>

                  {/* Festival Helipad (Bottom Right) */}
                  <div className="absolute bottom-[20%] right-[30%] flex flex-col items-center z-20">
                     <div className="w-6 h-6 rounded bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
                       <span className="text-[8px] text-slate-500 font-black">H</span>
                     </div>
                     <span className="text-[7px] font-black tracking-widest text-slate-400 mt-1">FESTIVAL PAD</span>
                  </div>

                  {/* VIP Lounge (Bottom Left) */}
                  <div className="absolute bottom-[10%] left-[20%] flex flex-col items-center z-20">
                     <div className="w-8 h-4 rounded bg-slate-800 border-2 border-slate-500"></div>
                     <span className="text-[7px] font-black tracking-widest text-slate-400 mt-1">VIP LOUNGE</span>
                  </div>


                  {/* Routing Paths */}
                  <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    
                    {/* Jet Path to LAX */}
                    <path d="M -50 0 L 40 40" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                    {routeStatus === 'TRACKING_JET' && (
                      <path d="M -50 0 L 40 40" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" className="animate-dash" />
                    )}

                    {/* Heli Path (LAX to Festival) */}
                    <path d="M 45 45 Q 150 20, 220 230" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                    {(routeStatus === 'HELI_EN_ROUTE' || routeStatus === 'GOLF_CART_SYNC') && (
                      <path d="M 45 45 Q 150 20, 220 230" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" className="animate-dash" />
                    )}

                    {/* Cart Path (Helipad to Lounge) */}
                    <path d="M 215 240 L 90 270" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                    {routeStatus === 'GOLF_CART_SYNC' && (
                      <path d="M 215 240 L 90 270" fill="none" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 4" className="animate-dash" />
                    )}
                  </svg>

                  {/* Active Markers */}
                  {routeStatus === 'TRACKING_JET' && (
                    <div className="absolute top-[5%] left-[5%] text-cyan-400 text-[16px] z-30 animate-pulse">✈️</div>
                  )}

                  {routeStatus === 'HELI_EN_ROUTE' && (
                    <div className="absolute top-[30%] left-[40%] text-indigo-400 text-[16px] z-30 animate-bounce">🚁</div>
                  )}

                  {routeStatus === 'GOLF_CART_SYNC' && (
                    <div className="absolute bottom-[18%] right-[45%] text-teal-400 text-[16px] z-30 animate-pulse">🛺</div>
                  )}

                  {jetETA === 'ARRIVED' && (
                    <div className="absolute bottom-[5%] left-[18%] z-30 text-emerald-400 text-xl font-black drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse">✓</div>
                  )}

                  {/* Dynamic Sync Ring */}
                  {routeStatus === 'GOLF_CART_SYNC' && (
                    <div className="absolute bottom-[18%] right-[28%] w-10 h-10 border-2 border-indigo-400 rounded-full animate-ping z-10 opacity-50"></div>
                  )}

                </div>

              </div>
              
              {/* Wait Time Metric Overlay */}
              <div className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded border border-slate-700 flex flex-col z-30">
                <span className="text-[7px] font-black text-slate-500 uppercase">Wait Time</span>
                <span className={`text-[12px] font-mono font-black ${jetETA === 'ARRIVED' ? 'text-emerald-400' : 'text-slate-300'}`}>0m 00s</span>
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={triggerVIPArrival}
                disabled={!dispatchActive || routeStatus !== 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !dispatchActive || routeStatus !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-500 hover:bg-cyan-900/60'
                }`}
              >
                Inject VIP Jet Ping
              </button>
              
              <button 
                onClick={resetRouting}
                disabled={routeStatus === 'IDLE'}
                className={`py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  routeStatus === 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Logistics Engine
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default MultiModalVIPDispatch;
