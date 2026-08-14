/* eslint-disable */
import React, { useState, useEffect } from 'react';

const EdgeComputedWASM = () => {
  const [wasmEnabled, setWasmEnabled] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [serverLoad, setServerLoad] = useState(12);
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Ticket Queue Active. Awaiting drop.' }
  ]);

  const simulateTraffic = () => {
      setIsSimulating(true);
      setSimulationComplete(false);
      setActiveStep(1);
      addLog('ACTION', 'Simulating 50,000 concurrent ticket buyers hitting the queue...');
      
      setTimeout(() => {
          setActiveStep(2);
          
          if (wasmEnabled) {
              addLog('SYS', 'Client browsers downloaded bot_detect.wasm module (45kb).');
              addLog('SUCCESS', 'Edge Computing: User entropy analyzed locally on 50,000 client devices.');
              setServerLoad(18); // Server barely feels it
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', 'Clients transmitting zero-knowledge proof of human-ness to backend.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsSimulating(false);
                      setSimulationComplete(true);
                      setServerLoad(25);
                      addLog('SUCCESS', 'Backend verified 50k cryptographic signatures instantly. Server stable.');
                  }, 1200);
              }, 1200);
              
          } else {
              addLog('WARN', 'Clients transmitting raw entropy (mouse movements, keystrokes) to backend.');
              setServerLoad(65);
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('CRIT', 'Backend executing Heavy ML Python models for 50k users simultaneously.');
                  setServerLoad(98);
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsSimulating(false);
                      setSimulationComplete(true);
                      setServerLoad(100);
                      addLog('CRIT', 'Cloud Compute resources exhausted. EC2 Instances crashing. Outage.');
                  }, 1500);
              }, 1500);
          }
      }, 1000);
  };

  const toggleWASM = () => {
      const newState = !wasmEnabled;
      setWasmEnabled(newState);
      setSimulationComplete(false);
      setServerLoad(12);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'Edge Computing enabled. WebAssembly module provisioned to frontend.');
      } else {
          addLog('CRIT', 'Edge Computing disabled. Heavy ML computation shifted to backend servers.');
      }
  };
  
  const resetDemo = () => {
      setSimulationComplete(false);
      setServerLoad(12);
      setActiveStep(0);
      addLog('SYS', 'Cluster reset. Server load normalized.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070402] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/40 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Edge Computing & WASM
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Edge-Computed Ticket <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">Scalping Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Running complex Machine Learning bot-detection algorithms on the backend for every page view consumes massive cloud compute resources during high-traffic ticket drops, often causing the servers to crash under their own weight. Eventra solves this by compiling the bot-detection algorithm into WebAssembly (WASM). This shifts the heavy compute load directly to the user's browser (Edge Computing). The local device analyzes its own entropy and only sends a lightweight cryptographic proof of "human-ness" to the backend, drastically reducing server costs.
          </p>

          <div className="bg-[#120703] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> Compute Architecture Rules
               </h3>
               {simulationComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Simulation</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* WASM Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">WebAssembly Edge Computing</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {wasmEnabled ? 'Active: ML Inference runs on Client Device' : 'Inactive: ML Inference runs on Cloud Backend'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleWASM}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             wasmEnabled ? 'bg-orange-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             wasmEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={simulateTraffic}
                     disabled={isSimulating || simulationComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         simulationComplete ? 'bg-slate-800 text-orange-500 border-orange-900 cursor-not-allowed' :
                         isSimulating ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                     }`}
                 >
                     {isSimulating ? 'Simulating Traffic Spike...' : simulationComplete ? 'Simulation Finished' : "Simulate 50k Concurrent Buyers"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#050201] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Architecture Logs</span>
                 {isSimulating && <span className="text-orange-400 font-black animate-pulse">MONITORING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-orange-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold bg-rose-950/30 px-1 rounded' :
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Compute Load Visualizer</span>
                      <span className="text-xs text-white font-bold">Client vs Server Distribution</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Client Browser Tier */}
                  <div className="w-full flex flex-col items-center z-20">
                      
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          wasmEnabled && activeStep >= 2 ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)] bg-orange-950/30' : 'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">💻</span> User Browsers (x50,000)
                              </span>
                          </div>

                          <div className="text-[9px] font-mono flex flex-col space-y-1 mt-2">
                              {wasmEnabled ? (
                                  <>
                                      <span className="text-slate-400 uppercase">Compute State:</span>
                                      <span className={`${activeStep >= 2 ? 'text-orange-400 animate-pulse' : 'text-slate-500'}`}>Running bot_detect.wasm</span>
                                      <span className={`${activeStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>ML Inference: Executed locally via device CPU</span>
                                  </>
                              ) : (
                                  <>
                                      <span className="text-slate-400 uppercase">Compute State:</span>
                                      <span className="text-slate-500">Dumb Terminal</span>
                                      <span className={`${activeStep >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>Streaming raw payload to backend...</span>
                                  </>
                              )}
                          </div>
                      </div>
                      
                      {/* Network Transmit Animation */}
                      <div className="h-20 w-full relative flex justify-center items-center">
                          <div className="absolute w-0.5 h-full bg-slate-700"></div>
                          {activeStep >= 3 && (
                              <div className="absolute w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 z-10 flex items-center justify-center text-[10px] animate-[drop_1s_linear_forwards] font-mono font-bold shadow-lg">
                                  {wasmEnabled ? <span className="text-emerald-400">0xProof</span> : <span className="text-amber-400 text-[6px] leading-tight">{"{raw_data}"}</span>}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Cloud Server Tier */}
                  <div className="w-full flex flex-col items-center z-20 relative">
                      
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-all duration-500 ${
                          serverLoad > 90 ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-950/40' : 'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                  <span className="text-lg mr-2">☁️</span> AWS EC2 Backend
                              </span>
                              
                              {/* Server Load Meter */}
                              <div className="flex items-center">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-500 mr-2">CPU Load</span>
                                  <span className={`text-xs font-mono font-bold ${
                                      serverLoad > 80 ? 'text-rose-500' : serverLoad > 40 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>{serverLoad}%</span>
                              </div>
                          </div>

                          {/* CPU Bar Visual */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
                              <div 
                                  className={`h-full transition-all duration-1000 ${
                                      serverLoad > 80 ? 'bg-rose-500' : serverLoad > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                                  }`} 
                                  style={{ width: `${serverLoad}%` }}
                              ></div>
                          </div>

                          <div className="text-[9px] font-mono flex flex-col space-y-1">
                              {wasmEnabled ? (
                                  <>
                                      <span className="text-slate-400 uppercase">Compute State:</span>
                                      <span className={`${activeStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>Verifying cryptographic proofs... (Lightweight)</span>
                                  </>
                              ) : (
                                  <>
                                      <span className="text-slate-400 uppercase">Compute State:</span>
                                      <span className={`${activeStep >= 3 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>Executing ML Python Models... (x50,000)</span>
                                  </>
                              )}
                          </div>
                      </div>
                      
                      {/* Crash Overlay */}
                      {!wasmEnabled && simulationComplete && (
                          <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-xl border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                              <span className="text-4xl mb-2">💥</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-center">Compute Exhausted<br/>Server Offline</span>
                          </div>
                      )}
                      
                      {/* Success Overlay */}
                      {wasmEnabled && simulationComplete && (
                          <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-sm rounded-xl border-2 border-emerald-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                              <span className="text-4xl mb-2">✅</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-center">Traffic Handled<br/>Server Stable</span>
                          </div>
                      )}

                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#120703] p-4 rounded-xl border border-orange-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-orange-400 uppercase block mb-1">Distributed Edge Compute:</span>
               With WASM disabled, click <span className="text-white font-bold bg-slate-800 px-1 rounded">Simulate Spike</span>. The 'dumb' client browsers send massive amounts of raw entropy data to the cloud. The backend attempts to run heavy ML Python models for 50k users simultaneously, instantly spiking CPU to 100% and crashing the servers.<br/><br/>Now, toggle <span className="text-white font-bold bg-orange-600 px-1 rounded">WebAssembly Edge Computing</span> ON. The compute logic is downloaded to the client. The 50,000 devices process the ML model locally using their own CPUs, sending only a tiny cryptographic proof to the server. The backend CPU load barely registers.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drop {
          0% { top: -10px; opacity: 1; }
          90% { top: 70px; opacity: 1; }
          100% { top: 70px; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default EdgeComputedWASM;
