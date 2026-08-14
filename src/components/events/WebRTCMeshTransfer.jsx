/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebRTCMeshTransfer = () => {
  const [isWebRtcEnabled, setIsWebRtcEnabled] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null); // null, 'FAILED', 'SUCCESS'
  const [activeStep, setActiveStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'Cell towers congested. Eventra API unreachable. App running in OFFLINE mode.' }
  ]);

  const executeTransfer = () => {
      setIsTransferring(true);
      setTransferStatus(null);
      setActiveStep(1);
      
      addLog('ACTION', 'User attempted to transfer Ticket #T-8924 to Friend (Nearby).');
      
      setTimeout(() => {
          setActiveStep(2);
          addLog('SYS', 'Attempting POST request to https://api.eventra.com/transfer...');
          
          setTimeout(() => {
              addLog('CRIT', 'Network Error: Connection Timeout. Cell towers are down.');
              setActiveStep(3);
              
              if (isWebRtcEnabled) {
                  addLog('WARN', 'Falling back to WebRTC P2P Mesh Network...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SYS', 'Establishing ad-hoc Wi-Fi/Bluetooth connection...');
                      addLog('SYS', 'Generating WebRTC SDP Offer... Peer responded with SDP Answer.');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          addLog('SYS', 'WebRTC RTCDataChannel opened (Direct Device-to-Device).');
                          addLog('SYS', 'Cryptographically signing ticket payload with local private key...');
                          
                          setTimeout(() => {
                              setActiveStep(6);
                              setIsTransferring(false);
                              setTransferStatus('SUCCESS');
                              addLog('SUCCESS', 'Ticket transferred successfully via P2P Mesh without internet.');
                          }, 1200);
                      }, 1000);
                  }, 1200);
              } else {
                  // Legacy Failure
                  setTimeout(() => {
                      setActiveStep(4);
                      setIsTransferring(false);
                      setTransferStatus('FAILED');
                      addLog('CRIT', 'Transfer failed. Friend is stranded outside the venue without a ticket.');
                  }, 800);
              }
          }, 1500);
      }, 800);
  };

  const toggleWebRtc = () => {
      const newState = !isWebRtcEnabled;
      setIsWebRtcEnabled(newState);
      setTransferStatus(null);
      setActiveStep(0);
      if (newState) {
          addLog('SUCCESS', 'WebRTC Mesh Networking module initialized for Offline Fallback.');
      } else {
          addLog('CRIT', 'WebRTC disabled. App strictly requires internet for ticket transfers.');
      }
  };

  const resetDemo = () => {
      setIsTransferring(false);
      setTransferStatus(null);
      setActiveStep(0);
      addLog('SYS', 'Demo reset. Waiting for user action.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020508] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> Offline-First Architecture
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            WebRTC Peer-to-Peer <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Mesh Networking Protocol</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            During major festivals, cell towers frequently collapse under the immense load of 100,000 attendees. Users who bought extra tickets for their friends suddenly cannot transfer them because the central API is unreachable, leaving friends stranded outside the gates. Eventra solves this by implementing an Offline-First WebRTC Peer-to-Peer (P2P) mesh networking protocol. If the app detects it is offline, it uses WebRTC over local Bluetooth or ad-hoc Wi-Fi to establish a direct device-to-device data channel. The ticket payload is cryptographically signed and transferred instantly without ever hitting a central server.
          </p>

          <div className="bg-[#040810] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Network Layer Configuration
               </h3>
               {transferStatus !== null && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Environment</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Current Network State Indicator */}
                 <div className="bg-rose-950/20 border border-rose-900 rounded-xl p-4 flex justify-between items-center mb-4">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Cell Tower Status</span>
                         <span className="text-[10px] text-rose-400 font-mono font-bold animate-pulse">
                             OFFLINE - NO SIGNAL DETECTED
                         </span>
                     </div>
                     <div className="text-3xl">📵</div>
                 </div>

                 {/* WebRTC Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">P2P Fallback Engine</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isWebRtcEnabled ? 'Active: WebRTC RTCDataChannel' : 'Inactive: Strict HTTP API Dependency'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleWebRtc}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isWebRtcEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isWebRtcEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeTransfer}
                     disabled={isTransferring || transferStatus !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         transferStatus === 'FAILED' ? 'bg-rose-900/40 text-rose-500 border-rose-900 cursor-not-allowed' :
                         transferStatus === 'SUCCESS' ? 'bg-cyan-900/40 text-cyan-500 border-cyan-900 cursor-not-allowed' :
                         isTransferring ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-cyan-600 hover:bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                     }`}
                 >
                     {isTransferring ? 'Initiating Transfer...' : transferStatus !== null ? 'Transfer Complete' : "Send Ticket to Friend"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020306] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Device Network Logs</span>
                 {isTransferring && <span className="text-cyan-400 font-black animate-pulse">CONNECTING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Network Topology Visualizer</span>
                      <span className="text-xs text-white font-bold">Transfer Pathway</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden items-center justify-center">
                  
                  {/* Central API Cloud Node */}
                  <div className={`w-32 h-16 border-2 border-dashed flex flex-col items-center justify-center rounded-xl absolute top-6 transition-colors duration-500 ${
                      activeStep >= 2 ? 'border-rose-500 bg-rose-950/20' : 'border-slate-700 bg-slate-900'
                  }`}>
                      <span className="text-2xl mb-1">☁️</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${activeStep >= 2 ? 'text-rose-400' : 'text-slate-500'}`}>
                          {activeStep >= 2 ? 'UNREACHABLE' : 'Eventra Cloud API'}
                      </span>
                  </div>
                  
                  {/* API Connection Lines */}
                  <div className="absolute top-24 bottom-32 left-1/2 -translate-x-[60px] w-0.5 border-l-2 border-dashed border-slate-700"></div>
                  <div className="absolute top-24 bottom-32 left-1/2 translate-x-[60px] w-0.5 border-l-2 border-dashed border-slate-700"></div>

                  {activeStep >= 2 && activeStep < 4 && (
                      <div className="absolute top-[40%] left-1/2 -translate-x-[60px] w-4 h-4 bg-rose-500 rounded-full animate-ping z-20 -ml-[7px]"></div>
                  )}

                  {/* Device Nodes */}
                  <div className="w-full flex justify-between items-center absolute bottom-12 px-6">
                      
                      {/* Device A (Sender) */}
                      <div className="w-20 h-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center p-2 relative z-10 shadow-lg">
                          <div className="w-8 h-1 bg-slate-800 rounded-full mb-2"></div>
                          <div className={`w-full flex-1 rounded bg-black flex flex-col items-center justify-center p-1 border transition-colors ${
                              activeStep >= 6 ? 'border-cyan-500/50' : 'border-slate-800'
                          }`}>
                              <span className="text-xl">🎫</span>
                              <span className="text-[8px] text-slate-500 font-mono mt-1">SENDER</span>
                          </div>
                      </div>

                      {/* Device B (Receiver) */}
                      <div className="w-20 h-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center p-2 relative z-10 shadow-lg">
                          <div className="w-8 h-1 bg-slate-800 rounded-full mb-2"></div>
                          <div className={`w-full flex-1 rounded bg-black flex flex-col items-center justify-center p-1 border transition-colors ${
                              activeStep >= 6 ? 'border-cyan-500/50 bg-cyan-950/30' : 'border-slate-800'
                          }`}>
                              <span className={`text-xl transition-opacity duration-1000 ${activeStep >= 6 ? 'opacity-100' : 'opacity-20 grayscale'}`}>🎫</span>
                              <span className="text-[8px] text-slate-500 font-mono mt-1">FRIEND</span>
                          </div>
                      </div>

                  </div>

                  {/* WebRTC P2P Link (Horizontal) */}
                  {activeStep >= 4 && (
                      <div className="absolute bottom-28 left-[100px] right-[100px] h-0.5 z-0 flex items-center justify-center">
                          <div className={`w-full h-full border-b-2 transition-colors duration-1000 ${
                              activeStep >= 5 ? 'border-cyan-500 border-solid shadow-[0_0_15px_rgba(6,182,212,1)]' : 'border-slate-600 border-dashed'
                          }`}></div>
                          
                          {activeStep >= 4 && activeStep < 5 && (
                              <div className="absolute bg-slate-800 px-2 rounded-full text-[8px] font-bold text-slate-400 border border-slate-600 animate-pulse">
                                  SDP NEGOTIATION
                              </div>
                          )}
                          
                          {activeStep >= 5 && activeStep < 6 && (
                              <div className="absolute bg-cyan-950 px-2 py-0.5 rounded text-[8px] font-bold text-cyan-400 border border-cyan-500 shadow-lg">
                                  RTCDataChannel
                              </div>
                          )}

                          {/* Data Packet Animation */}
                          {activeStep >= 5 && activeStep < 6 && (
                              <div className="absolute left-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] animate-ping duration-[1000ms]"></div>
                          )}
                      </div>
                  )}

                  {/* Overlays */}
                  {transferStatus === 'FAILED' && (
                      <div className="absolute inset-0 bg-rose-900/90 backdrop-blur-sm rounded-[1.5rem] border-2 border-rose-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">📵</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">Network Timeout<br/><span className="text-[10px] font-normal text-rose-200 mt-1 block">Friend stranded without ticket.</span></span>
                      </div>
                  )}

                  {transferStatus === 'SUCCESS' && (
                      <div className="absolute inset-0 bg-cyan-900/90 backdrop-blur-sm rounded-[1.5rem] border-2 border-cyan-500 flex flex-col items-center justify-center text-white z-30 animate-fade-in-up">
                          <span className="text-5xl mb-3">🤝</span>
                          <span className="text-sm font-black uppercase tracking-widest text-center">P2P Transfer Complete<br/><span className="text-[10px] font-normal text-cyan-200 mt-1 block">Ticket synced via local Mesh Network.</span></span>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#040810] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Offline Ticket Transfers:</span>
               With WebRTC OFF, click "Send Ticket". The app attempts to hit the Cloud API, but because the cell towers are down, the request times out and the transfer fails entirely.<br/><br/>Toggle <span className="text-cyan-400 font-bold bg-slate-800 px-1 rounded">P2P Fallback Engine</span> ON. The app detects the network failure and immediately pivots to WebRTC. It negotiates a direct connection with the nearby friend's phone over local ad-hoc Wi-Fi/Bluetooth, creates an RTCDataChannel, and seamlessly syncs the cryptographically signed ticket without ever needing the internet.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default WebRTCMeshTransfer;
