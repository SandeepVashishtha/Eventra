/* eslint-disable */
import React, { useState, useEffect } from 'react';

const P2PMeshRideShare = () => {
  const [meshActive, setMeshActive] = useState(false);
  const [networkState, setNetworkState] = useState('OFFLINE'); // OFFLINE, DISCOVERING, HANDSHAKE, MATCHED
  
  // Mesh Network Metrics
  const [activeNodes, setActiveNodes] = useState(0);
  const [availableDrivers, setAvailableDrivers] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0); // dBm
  
  // Match Data
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [pickupPin, setPickupPin] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '00:05:00', type: 'SYS', msg: 'Cellular network connection lost.' },
    { id: 2, time: '00:05:02', type: 'SYS', msg: 'Falling back to offline BLE/Wi-Fi Direct.' }
  ]);

  // Mesh topology visualizer state
  const [nodes, setNodes] = useState([]);
  
  useEffect(() => {
    // Generate initial nodes
    const initialNodes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: Math.random() > 0.85 ? 'DRIVER' : 'RIDER',
      connected: false
    }));
    setNodes(initialNodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (meshActive) {
      if (networkState === 'DISCOVERING') {
        loop = setInterval(() => {
          setActiveNodes(Math.max(10, Math.min(150, activeNodes + Math.floor(Math.random() * 5))));
          setAvailableDrivers(Math.max(0, Math.min(15, availableDrivers + (Math.random() > 0.7 ? 1 : 0))));
          setSignalStrength(Math.max(-90, Math.min(-40, -80 + (Math.random() * 10))));
          
          // Animate nodes pulsing
          setNodes(prev => prev.map(n => ({
            ...n,
            x: Math.max(0, Math.min(100, n.x + (Math.random() * 0.4 - 0.2))),
            y: Math.max(0, Math.min(100, n.y + (Math.random() * 0.4 - 0.2))),
            connected: Math.random() > 0.7
          })));
        }, 800);
      } else if (networkState === 'HANDSHAKE') {
        let progress = 0;
        loop = setInterval(() => {
          progress += 20;
          
          // Visualize the connection forming to a driver
          setNodes(prev => {
             const newNodes = [...prev];
             // Find closest driver
             let closestDriver = newNodes.find(n => n.type === 'DRIVER');
             if (closestDriver) closestDriver.connected = true;
             return newNodes;
          });

          if (progress >= 100) {
            clearInterval(loop);
            setNetworkState('MATCHED');
            setMatchedDriver({ name: 'David M.', car: 'Black Tesla Model Y', license: '7XYZ892' });
            setPickupPin('LOT C - ROW 4');
            
            addLog('SUCCESS', 'Cryptographic offline handshake complete.');
            addLog('ACTION', 'Digital payment voucher signed. Awaiting uplink sync.');
          }
        }, 400);
      }
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [meshActive, networkState, activeNodes, availableDrivers]);

  const initiateMatch = () => {
    if (meshActive && networkState === 'DISCOVERING' && availableDrivers > 0) {
      setNetworkState('HANDSHAKE');
      addLog('SYS', 'Initiating P2P cryptographic handshake with nearest driver node...');
      addLog('WEB3', 'Generating offline payment voucher signature.');
    }
  };

  const resetNetwork = () => {
    setNetworkState('OFFLINE');
    setActiveNodes(0);
    setAvailableDrivers(0);
    setSignalStrength(0);
    setMatchedDriver(null);
    setPickupPin(null);
    setNodes(prev => prev.map(n => ({ ...n, connected: false })));
  };

  const toggleMesh = () => {
    if (!meshActive) {
      setMeshActive(true);
      setNetworkState('DISCOVERING');
      addLog('SYS', 'BLE/Wi-Fi Direct Mesh Network initialized.');
      addLog('ACTION', 'Scanning for local peer-to-peer driver nodes.');
    } else {
      setMeshActive(false);
      resetNetwork();
      addLog('WARN', 'Mesh network disabled. You are offline and stranded.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Network Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Decentralized Routing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            P2P Mesh Network <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Ride-Sharing Protocol</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Standard rideshare apps fail entirely when 100,000 people attempt to request a ride simultaneously at midnight, crashing local cell towers and stranding attendees. Eventra solves this by implementing a BLE/Wi-Fi Direct mesh network. Attendees walking to the lot can discover and match with pre-vetted drivers via decentralized, offline peer-to-peer handshakes. The app securely negotiates a physical pickup pin and cryptographically signs a digital payment voucher entirely offline, syncing to the blockchain ledger only after they leave the cellular dead zone.
          </p>

          <div className="bg-[#0b1021] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🔗</span> P2P Node Diagnostics
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleMesh}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     meshActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                   }`}
                 >
                   {meshActive ? 'Disconnect Mesh' : 'Engage P2P Mesh'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Peer Nodes */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkState === 'DISCOVERING' ? 'bg-indigo-950/20 border-indigo-900/50' :
                 meshActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Local Peer Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     meshActive ? 'text-white' : 'text-slate-600'
                   }`}>
                     {activeNodes}
                   </span>
                 </div>
               </div>

               {/* Drivers Found */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkState === 'MATCHED' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' :
                 availableDrivers > 0 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-inner' :
                 meshActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Drivers in Range
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     networkState === 'MATCHED' ? 'text-emerald-400' :
                     availableDrivers > 0 ? 'text-cyan-400 animate-pulse' :
                     meshActive ? 'text-slate-400' : 'text-slate-600'
                   }`}>
                     {meshActive ? availableDrivers : '0'}
                   </span>
                 </div>
               </div>
               
               {/* Signal Strength */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 meshActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Mesh Signal RSSI
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     signalStrength > -60 ? 'text-emerald-400' :
                     signalStrength > -80 ? 'text-yellow-400' :
                     meshActive ? 'text-red-400' : 'text-slate-600'
                   }`}>
                     {meshActive ? Math.floor(signalStrength) : '--'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">dBm</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#02040a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Protocol Trace Log</span>
                 {networkState === 'DISCOVERING' && <span className="text-indigo-400 animate-pulse">Broadcasting...</span>}
                 {networkState === 'HANDSHAKE' && <span className="text-cyan-400 animate-pulse">Exchanging Keys...</span>}
                 {networkState === 'MATCHED' && <span className="text-emerald-400 animate-pulse">OFFLINE MATCH SECURED</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 
                       log.type === 'WEB3' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
            
            {/* Mesh Topology Simulator */}
            <div className={`w-full rounded-[1rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[380px] overflow-hidden font-sans mb-6 bg-slate-900 transition-all duration-300`}>
              
              <div className="absolute top-0 inset-x-0 p-2 text-center z-30 pointer-events-none bg-black/80 border-b border-white/10 flex justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">P2P MESH TOPOLOGY</span>
                <span className="text-[8px] font-mono text-slate-400">OFFLINE ROUTING</span>
              </div>

              <div className="flex-1 relative bg-[#020617] overflow-hidden flex flex-col pt-8">
                
                {/* Simulated Mesh Network Visuals */}
                {meshActive && (
                  <div className="absolute inset-0 z-10">
                    
                    {/* User Node (Center) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-30 shadow-[0_0_15px_#ffffff]"></div>
                    {/* Sonar pulses */}
                    {networkState === 'DISCOVERING' && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/50 rounded-full animate-ping z-0 pointer-events-none"></div>
                    )}

                    {/* Rendering the peer nodes */}
                    {nodes.map(node => (
                      <div key={node.id} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                        
                        {/* Node Blip */}
                        <div className={`w-2 h-2 rounded-full absolute transform -translate-x-1/2 -translate-y-1/2 z-20 ${
                           node.type === 'DRIVER' ? (networkState === 'MATCHED' && node.connected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]') : 
                           (node.connected ? 'bg-indigo-400' : 'bg-slate-600')
                        }`}></div>

                        {/* Connection Lines (Approximated for visuals based on center) */}
                        {node.connected && networkState !== 'MATCHED' && (
                          <svg className="absolute w-[200px] h-[200px] pointer-events-none overflow-visible z-10" style={{ transform: `translate(-${node.x}%, -${node.y}%)` }}>
                            <line x1="100" y1="100" x2={`${node.x}%`} y2={`${node.y}%`} stroke="#4f46e5" strokeWidth="1" strokeDasharray="4" className="animate-[dash_1s_linear_infinite]" opacity="0.3" />
                          </svg>
                        )}
                      </div>
                    ))}

                    {/* Handshake/Matched visualization */}
                    {networkState === 'HANDSHAKE' && (
                       <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/50 backdrop-blur-sm">
                         <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                         <span className="absolute text-[8px] font-black text-cyan-400 uppercase tracking-widest">EXCHANGING KEYS</span>
                       </div>
                    )}
                    
                  </div>
                )}

                {/* Match Ticket Overlay */}
                {networkState === 'MATCHED' && matchedDriver && (
                  <div className="absolute inset-x-4 bottom-4 bg-black/90 border-2 border-emerald-500 rounded-xl p-4 z-50 flex flex-col shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fade-in-up">
                     
                     <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">P2P MATCH SECURED</span>
                       <span className="text-[8px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">VOUCHER SIGNED</span>
                     </div>

                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-black text-white">{matchedDriver.car}</span>
                       <span className="text-sm font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">{matchedDriver.license}</span>
                     </div>
                     
                     <span className="text-[10px] text-slate-400 mb-4">Driver: {matchedDriver.name}</span>

                     <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1">OFFLINE PICKUP PIN</span>
                        <span className="text-xl font-black text-emerald-400 text-center">{pickupPin}</span>
                     </div>

                  </div>
                )}

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button 
                onClick={initiateMatch}
                disabled={!meshActive || networkState !== 'DISCOVERING' || availableDrivers === 0}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !meshActive || networkState !== 'DISCOVERING' || availableDrivers === 0 ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-cyan-950/40 border-cyan-900 text-cyan-400 hover:bg-cyan-900/60'
                }`}
              >
                Initiate Cryptographic Handshake
              </button>
              
              <button 
                onClick={resetNetwork}
                disabled={!meshActive || networkState === 'DISCOVERING'}
                className={`py-3 rounded-lg font-black uppercase tracking-widest text-[9px] transition shadow-md border ${
                  !meshActive || networkState === 'DISCOVERING' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                  'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Reset Match
              </button>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default P2PMeshRideShare;
