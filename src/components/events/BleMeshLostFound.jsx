/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BleMeshLostFound = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [searchState, setSearchState] = useState('IDLE'); // IDLE, SCANNING, TRIANGULATING, FOUND
  
  // Mesh Metrics
  const [backgroundNodes, setBackgroundNodes] = useState(0); 
  const [itemsRecovered, setItemsRecovered] = useState(1284);
  const [trilaterationAccuracy, setTrilaterationAccuracy] = useState(0); // meters
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '11:00:00', type: 'SYS', msg: 'P2P BLE Mesh Network Online.' },
    { id: 2, time: '11:00:02', type: 'SYS', msg: 'Awaiting Lost Item broadcast requests...' }
  ]);

  // Visualizer State
  const [nodes, setNodes] = useState([]);
  const [lostItem, setLostItem] = useState(null);
  const [radarAngle, setRadarAngle] = useState(0);

  // Initialize static background nodes (Attendee phones)
  useEffect(() => {
      const initNodes = Array.from({ length: 40 }).map((_, i) => ({
          id: i,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          activePing: false
      }));
      setNodes(initNodes);
  }, []);

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      // Simulate background app users fluctuating
      setBackgroundNodes(42105 + Math.floor((Math.random() - 0.5) * 500));
        
      loop = setInterval(() => {
          setRadarAngle(prev => (prev + 5) % 360);

          if (searchState === 'SCANNING') {
              // Random nodes light up as they "scan"
              setNodes(prev => prev.map(n => ({
                  ...n,
                  activePing: Math.random() > 0.8
              })));
          } else if (searchState === 'TRIANGULATING' && lostItem) {
              // Only nodes near the lost item light up
              setNodes(prev => prev.map(n => {
                  const dist = Math.hypot(n.x - lostItem.x, n.y - lostItem.y);
                  return {
                      ...n,
                      activePing: dist < 25 // 25 units is "Bluetooth range"
                  };
              }));
          } else {
              setNodes(prev => prev.map(n => ({ ...n, activePing: false })));
          }

      }, 100); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive, searchState, lostItem]);

  const reportLostItem = () => {
      if (!systemActive || searchState !== 'IDLE') return;
      
      setSearchState('SCANNING');
      addLog('ACTION', 'User reported lost wallet (BLE Tag ID: 0x9F2).');
      addLog('SYS', 'Broadcasting MAC address to 42,000+ background nodes...');
      
      // Place a hidden lost item
      const newItem = {
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          found: false
      };
      
      setTimeout(() => {
          if (!systemActive) return;
          
          setLostItem(newItem);
          setSearchState('TRIANGULATING');
          addLog('SUCCESS', 'MAC Match! 3 nearby phones detected the BLE beacon.');
          addLog('SYS', 'Ingesting RSSI signal strength data for Trilateration.');
          
          setTimeout(() => {
              if (!systemActive) return;
              
              setLostItem({ ...newItem, found: true });
              setSearchState('FOUND');
              setTrilaterationAccuracy(1.2 + Math.random() * 0.8);
              setItemsRecovered(prev => prev + 1);
              
              addLog('SUCCESS', 'Coordinates Triangulated. Pushing exact GPS pin to owner app.');
              
              setTimeout(() => {
                  if (systemActive) {
                      setSearchState('IDLE');
                      setLostItem(null);
                      setTrilaterationAccuracy(0);
                  }
              }, 4000);
              
          }, 3000);
          
      }, 3000);
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'BLE Mesh Network Activated. Phones acting as decentralized scanners.');
    } else {
      setSystemActive(false);
      setSearchState('IDLE');
      setBackgroundNodes(0);
      setLostItem(null);
      setTrilaterationAccuracy(0);
      addLog('WARN', 'Mesh Offline. Attendees reverting to the physical Lost & Found tent.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#02050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> P2P Mesh Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Lost & Found <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Mesh Tracking</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Thousands of phones, wallets, and keys are lost at festivals, and the centralized physical lost & found tent is chaotic and ineffective. Eventra solves this by implementing a decentralized Bluetooth Low Energy (BLE) mesh network via the Eventra app. If an attendee loses an item with a BLE tag (like an AirTag) or another phone, every other attendee's app silently scans for it in the background. When a match is found, the backend triangulates the exact coordinates using the RSSI from multiple nearby phones and updates the owner's map instantly.
          </p>

          <div className="bg-[#050a14] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> BLE Trilateration Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Mesh Network' : 'Initialize Background Scanners'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Background Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active User Nodes
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-blue-400' : 'text-slate-600'
                   }`}>
                     {backgroundNodes.toLocaleString()}
                   </span>
                 </div>
               </div>

               {/* Location Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 searchState === 'FOUND' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 searchState === 'TRIANGULATING' ? 'bg-indigo-950/40 border-indigo-500/50 animate-pulse' :
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   GPS Accuracy Radius
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     searchState === 'FOUND' ? 'text-emerald-400' : 
                     searchState === 'TRIANGULATING' ? 'text-indigo-400' : 'text-slate-600'
                   }`}>
                     {searchState === 'IDLE' || searchState === 'SCANNING' ? '--' : trilaterationAccuracy.toFixed(1)}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">m</span>
                 </div>
               </div>
               
               {/* Items Recovered */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Items Recovered
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {itemsRecovered.toLocaleString()}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#010204] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Decentralized Event Ledger</span>
                 {searchState === 'SCANNING' && <span className="text-blue-400 font-black animate-pulse">BROADCASTING MAC ID...</span>}
                 {searchState === 'TRIANGULATING' && <span className="text-indigo-400 font-black animate-pulse">INGESTING RSSI DATA...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 'text-slate-400'
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
            
            {/* Map Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#050a14]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">FESTIVAL GROUNDS MAP</span>
                <span className="text-[8px] font-mono text-slate-400">P2P COVERAGE</span>
              </div>

              <div className="flex-1 relative overflow-hidden">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">MAP OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20">
                        
                        {/* Radar Sweep Effect */}
                        {(searchState === 'SCANNING' || searchState === 'TRIANGULATING') && (
                            <div 
                                className="absolute top-1/2 left-1/2 w-[150%] aspect-square rounded-full origin-center opacity-30 pointer-events-none"
                                style={{ 
                                    transform: `translate(-50%, -50%) rotate(${radarAngle}deg)`,
                                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(59,130,246,0.1) 95%, rgba(59,130,246,0.8) 100%)'
                                }}
                            ></div>
                        )}

                        {/* Grid lines */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Attendee Phones (Nodes) */}
                        {nodes.map(n => (
                            <div 
                                key={n.id}
                                className={`absolute rounded-full transition-all duration-300 ${
                                    n.activePing ? 'bg-blue-400 scale-150 shadow-[0_0_10px_rgba(96,165,250,1)]' : 'bg-slate-600/50'
                                }`}
                                style={{
                                    left: `${n.x}%`,
                                    top: `${n.y}%`,
                                    width: '4px',
                                    height: '4px',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {/* Ping Ripple */}
                                {n.activePing && (
                                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                )}
                            </div>
                        ))}

                        {/* Triangulation Lines */}
                        {searchState === 'TRIANGULATING' && lostItem && nodes.filter(n => n.activePing).map(n => (
                            <svg key={`line-${n.id}`} className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                <line 
                                    x1={`${n.x}%`} y1={`${n.y}%`} 
                                    x2={`${lostItem.x}%`} y2={`${lostItem.y}%`} 
                                    stroke="#818cf8" strokeWidth="1" strokeDasharray="4" opacity="0.5" 
                                    className="animate-pulse"
                                />
                            </svg>
                        ))}

                        {/* The Lost Item */}
                        {lostItem && (
                            <div 
                                className="absolute z-30 transition-all duration-1000"
                                style={{
                                    left: `${lostItem.x}%`,
                                    top: `${lostItem.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {lostItem.found ? (
                                    <div className="relative flex flex-col items-center animate-bounce">
                                        <div className="text-2xl filter drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">📍</div>
                                        <span className="absolute top-8 bg-emerald-900/80 text-emerald-300 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500 whitespace-nowrap backdrop-blur-sm">WALLET FOUND</span>
                                    </div>
                                ) : searchState === 'TRIANGULATING' ? (
                                    <div className="w-8 h-8 rounded-full border-2 border-indigo-400 bg-indigo-500/20 animate-pulse flex items-center justify-center">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#050a14] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Mesh Actions</span>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={reportLostItem}
                   disabled={!systemActive || searchState !== 'IDLE'}
                   className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition border flex items-center justify-center ${
                     !systemActive || searchState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                   }`}
                 >
                   🔍 Report Lost Item (Broadcast MAC)
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default BleMeshLostFound;
