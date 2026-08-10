/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DecentralizedSOSBeacons = () => {
  const [networkActive, setNetworkActive] = useState(false);
  const [sosState, setSosState] = useState('IDLE'); // IDLE, BROADCASTING, RECEIVED, DISPATCHED
  
  // Network Metrics
  const [cellularStatus, setCellularStatus] = useState('OFFLINE'); // SIMULATING DEAD CELL TOWERS
  const [connectedNodes, setConnectedNodes] = useState(0); 
  const [activeIncidents, setActiveIncidents] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '23:15:00', type: 'CRIT', msg: 'CELLULAR OUTAGE: Main towers overloaded. 0 bars.' },
    { id: 2, time: '23:15:02', type: 'SYS', msg: 'Failover to 900MHz LoRaWAN Mesh initiated.' }
  ]);

  // Visualizer State
  const [meshNodes, setMeshNodes] = useState([]);
  const [sosPingData, setSosPingData] = useState(null);

  useEffect(() => {
    let loop;
    
    if (networkActive) {
      loop = setInterval(() => {
          
          if (sosState === 'IDLE') {
              // Idle node blinking
              setMeshNodes(prev => prev.map(node => ({
                  ...node, 
                  active: Math.random() > 0.95
              })));
          }

      }, 500); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [networkActive, sosState]);

  const triggerSOS = (type) => {
    if (!networkActive || sosState !== 'IDLE') return;
    
    setSosState('BROADCASTING');
    
    // Simulate user holding button
    addLog('ACTION', 'User wristband button held for 3 seconds. SOS Activated.');
    
    setTimeout(() => {
        const pingId = Date.now();
        setSosPingData({ id: pingId, type, path: [] });
        addLog('SYS', 'Broadcasting encrypted SOS packet via LoRaWAN mesh (hop 1)...');
        
        // Simulate multi-hop transmission across the mesh
        let currentHop = 1;
        const hopInterval = setInterval(() => {
            currentHop++;
            addLog('NET', `Mesh routing... Packet forwarded to node hop ${currentHop}.`);
            
            if (currentHop >= 4) {
                clearInterval(hopInterval);
                setSosState('RECEIVED');
                setActiveIncidents(prev => prev + 1);
                
                const typeText = type === 'MEDICAL' ? 'Medical Emergency (EpiPen req)' : 'Security Crisis (Harassment)';
                addLog('SUCCESS', `SOS Packet reached Security Tablet Gateway!`);
                addLog('CRIT', `INCIDENT LOGGED: ${typeText} at coords [34.05, -118.24].`);
                
                setTimeout(() => {
                    setSosState('DISPATCHED');
                    addLog('ACTION', 'Rapid Response unit dispatched to exact GPS coordinates.');
                    
                    setTimeout(() => {
                        setSosState('IDLE');
                        setActiveIncidents(prev => Math.max(0, prev - 1));
                        setSosPingData(null);
                        addLog('SYS', 'Incident resolved. Resuming passive mesh monitoring.');
                    }, 5000);
                }, 3000);
            }
        }, 800);
        
    }, 1500);
  };

  const toggleNetwork = () => {
    if (!networkActive) {
      setNetworkActive(true);
      setConnectedNodes(54283);
      
      // Generate static mesh background nodes
      const nodes = Array.from({ length: 40 }, (_, i) => ({
          id: i,
          x: Math.random() * 80 + 10,
          y: Math.random() * 70 + 15,
          active: false
      }));
      setMeshNodes(nodes);
      
      addLog('SYS', 'LoRaWAN 900MHz Mesh Network Online. Wearables connected.');
    } else {
      setNetworkActive(false);
      setConnectedNodes(0);
      setMeshNodes([]);
      setSosState('IDLE');
      setSosPingData(null);
      addLog('WARN', 'Mesh Network Offline. Attendees possess zero communication capability.');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#060303] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Offline Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized LoRaWAN <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">SOS Mesh Beacons</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When cellular networks fail at crowded festivals, attendees experiencing medical emergencies or harassment have absolutely no way to contact security if they are trapped in the middle of a dense crowd. Eventra solves this by integrating a physical "SOS Button" into the smart wristbands. When pressed, it completely bypasses dead cellular towers, utilizing a 900MHz LoRaWAN mesh network to instantly bounce an encrypted emergency packet off surrounding attendees' wristbands until it reaches the nearest security tablet.
          </p>

          <div className="bg-[#120505] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🌐</span> Mesh Network Status
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleNetwork}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     networkActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                   }`}
                 >
                   {networkActive ? 'Disable LoRaWAN' : 'Initialize 900MHz Mesh'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Cell Status */}
               <div className="col-span-1 p-4 rounded-xl border border-red-500/50 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex flex-col justify-center relative overflow-hidden transition-all duration-300">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                   Local Cell Towers
                 </span>
                 <div className="flex items-end">
                   <span className="text-xl font-black font-mono leading-none text-red-500 mt-1">
                     {cellularStatus}
                   </span>
                 </div>
               </div>

               {/* Mesh Nodes */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 networkActive ? 'bg-emerald-950/20 border-emerald-900/50 shadow-inner' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 flex items-center">
                   Wristbands Linked
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     networkActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {connectedNodes.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Incidents */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 activeIncidents > 0 ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active SOS Calls
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none ${
                     activeIncidents > 0 ? 'text-rose-400' : 'text-slate-600'
                   }`}>
                     {activeIncidents}
                   </span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#050101] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Sub-GHz Routing Log</span>
                 {sosState === 'BROADCASTING' && <span className="text-orange-400 animate-pulse">HOPPING PACKETS...</span>}
                 {sosState === 'RECEIVED' && <span className="text-red-500 font-black animate-pulse">SECURITY DISPATCH</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase' :
                       log.type === 'WARN' ? 'text-yellow-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' :
                       log.type === 'NET' ? 'text-orange-400' : 'text-slate-400'
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
            
            {/* Mesh Simulator */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[400px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !networkActive ? 'bg-slate-900' : 
                sosState === 'RECEIVED' || sosState === 'DISPATCHED' ? 'bg-[#140202]' : 'bg-[#030605]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none bg-black/60 border-b border-white/5 flex justify-between backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">P2P MESH TOPOLOGY</span>
                <span className="text-[8px] font-mono text-slate-400">900MHz LoRaWAN</span>
              </div>

              <div className="flex-1 relative overflow-hidden p-6 pt-16">
                
                {!networkActive ? (
                   <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">NETWORK DOWN</span>
                   </div>
                ) : (
                  <div className="w-full h-full relative z-20">
                      
                      {/* Security Base Station (Gateway) */}
                      <div className="absolute top-4 right-4 z-30">
                          <div className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center ${
                              sosState === 'RECEIVED' || sosState === 'DISPATCHED' ? 'bg-red-900/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-slate-800/80 border-slate-600'
                          }`}>
                              <span className="text-lg">🛡️</span>
                          </div>
                          <span className="text-[7px] font-black uppercase text-slate-400 block text-center mt-1">Sec-Gate</span>
                      </div>

                      {/* Attendee Wristband Nodes */}
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-10">
                          {/* Idle Mesh Connections (Faint) */}
                          {meshNodes.map((node, i) => (
                              <line 
                                  key={`l-${i}`} 
                                  x1={`${node.x}%`} y1={`${node.y}%`} 
                                  x2={`${i < meshNodes.length-1 ? meshNodes[i+1].x : node.x}%`} 
                                  y2={`${i < meshNodes.length-1 ? meshNodes[i+1].y : node.y}%`} 
                                  stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1"
                              />
                          ))}
                          
                          {/* Active SOS Path (Hopping lines) */}
                          {sosState !== 'IDLE' && (
                              <>
                                  <line x1="20%" y1="80%" x2="40%" y2="60%" stroke="rgba(244, 63, 94, 0.8)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                                  <line x1="40%" y1="60%" x2="60%" y2="50%" stroke="rgba(244, 63, 94, 0.8)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                                  <line x1="60%" y1="50%" x2="85%" y2="15%" stroke="rgba(244, 63, 94, 0.8)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_1s_linear_infinite]" />
                              </>
                          )}
                      </svg>

                      {/* Node Dots */}
                      {meshNodes.map(node => (
                          <div 
                              key={node.id}
                              className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  node.active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-700'
                              }`}
                              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                          ></div>
                      ))}

                      {/* SOS Trigger Node */}
                      {sosState !== 'IDLE' && (
                          <div className="absolute w-4 h-4 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,1)]"
                               style={{ left: '20%', top: '80%', transform: 'translate(-50%, -50%)' }}
                          >
                              <div className="absolute w-8 h-8 border border-red-500 rounded-full animate-ping"></div>
                          </div>
                      )}

                      {/* Dispatch Unit Visualization */}
                      {sosState === 'DISPATCHED' && (
                          <div className="absolute text-xl animate-[moveDispatch_3s_ease-in-out_forwards]"
                               style={{ left: '85%', top: '15%', transform: 'translate(-50%, -50%)' }}
                          >
                              🚑
                          </div>
                      )}

                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes dash {
                        to { stroke-dashoffset: -8; }
                    }
                    @keyframes moveDispatch {
                        0% { left: 85%; top: 15%; opacity: 1; }
                        100% { left: 20%; top: 80%; opacity: 0; }
                    }
                `}} />

              </div>
            </div>

            {/* Hardware Controls */}
            <div className="w-full bg-[#120505] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate Wristband SOS</span>
               
               <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => triggerSOS('MEDICAL')}
                   disabled={!networkActive || sosState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !networkActive || sosState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-rose-950/40 border-rose-600 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                   }`}
                 >
                   Medical Emergency
                 </button>

                 <button 
                   onClick={() => triggerSOS('SECURITY')}
                   disabled={!networkActive || sosState !== 'IDLE'}
                   className={`py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition border ${
                     !networkActive || sosState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-purple-950/40 border-purple-600 text-purple-400 hover:bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                   }`}
                 >
                   Security Threat
                 </button>
               </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DecentralizedSOSBeacons;
