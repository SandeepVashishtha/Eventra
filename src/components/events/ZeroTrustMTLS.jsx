/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ZeroTrustMTLS = () => {
  const [connectionState, setConnectionState] = useState(null); // null, CONNECTING, ACCEPTED, REJECTED
  const [mTLSEnabled, setMTLSEnabled] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'API Gateway initialized. Listening on port 443.' }
  ]);

  const initiateConnection = () => {
      setConnectionState('CONNECTING');
      setHandshakeStep(1); // SYN
      addLog('ACTION', `Client initiating TCP connection to api.eventra.com/admin...`);
      
      setTimeout(() => {
          setHandshakeStep(2); // TLS Hello
          addLog('SYS', 'Client Hello. Initiating TLS Handshake.');
          
          setTimeout(() => {
              setHandshakeStep(3); // Cert Exchange
              
              if (mTLSEnabled) {
                  addLog('WARN', 'mTLS Policy Enforced: Server requesting client cryptographic certificate.');
                  
                  setTimeout(() => {
                      setHandshakeStep(4); // Verify
                      addLog('SYS', 'Client presented short-lived, device-bound x509 certificate.');
                      
                      setTimeout(() => {
                          setConnectionState('ACCEPTED');
                          addLog('SUCCESS', 'Zero-Trust Verification passed. Mutual TLS tunnel established.');
                      }, 1500);
                  }, 1500);
                  
              } else {
                  addLog('CRIT', 'Legacy Mode: Server accepted connection without client certificate verification.');
                  
                  setTimeout(() => {
                      setConnectionState('ACCEPTED');
                      addLog('WARN', 'Connection established based on Password/2FA only. Highly vulnerable to phishing/MITM attacks.');
                  }, 1500);
              }
          }, 1500);
      }, 1000);
  };

  const toggleMTLS = () => {
      const newState = !mTLSEnabled;
      setMTLSEnabled(newState);
      setConnectionState(null);
      setHandshakeStep(0);
      if (newState) {
          addLog('SUCCESS', 'Zero-Trust Architecture activated. mTLS enforcement enabled on API Gateway.');
      } else {
          addLog('CRIT', 'Zero-Trust deactivated. API Gateway downgraded to legacy TLS 1.2.');
      }
  };
  
  const resetDemo = () => {
      setConnectionState(null);
      setHandshakeStep(0);
      addLog('SYS', 'TCP socket closed. Ready for new connection attempt.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020504] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Cybersecurity & Zero-Trust
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Zero-Trust Network <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">mTLS Architecture</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival staff access the sensitive ticketing admin portal from unsecured public Wi-Fi networks, making the system highly vulnerable to man-in-the-middle (MITM) attacks and credential theft. Eventra solves this by implementing a strict Zero-Trust network architecture. It requires mutual TLS (mTLS) authentication for all admin API routes. The frontend must present a short-lived, device-bound cryptographic certificate before the backend even accepts the TCP connection, completely nullifying stolen passwords.
          </p>

          <div className="bg-[#05100a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> API Gateway Configuration
               </h3>
               {connectionState === 'ACCEPTED' && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Disconnect Socket</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* mTLS Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Mutual TLS (mTLS) Enforcement</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {mTLSEnabled ? 'Active: Device Cryptographic Binding Required' : 'Inactive: Legacy Password/2FA Auth Enabled'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleMTLS}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             mTLSEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             mTLSEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={initiateConnection}
                     disabled={connectionState !== null}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         connectionState === 'ACCEPTED' ? 'bg-slate-800 text-emerald-500 border-emerald-900 cursor-not-allowed' :
                         connectionState === 'CONNECTING' ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                     }`}
                 >
                     {connectionState === 'CONNECTING' ? 'Negotiating Handshake...' : connectionState === 'ACCEPTED' ? 'Connection Established' : 'Initiate Admin API Connection'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020504] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>TCP/TLS Socket Logs</span>
                 {connectionState === 'CONNECTING' && <span className="text-emerald-400 font-black animate-pulse">HANDSHAKE...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Network Handshake Simulator</span>
                      <span className="text-xs text-white font-bold">Client / Server Negotiation</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  <div className="flex justify-between items-center px-4 mb-8">
                      <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-2xl z-10 relative">💻</div>
                          <span className="text-[10px] font-bold text-white mt-2">Admin Device</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-2xl z-10 relative">🗄️</div>
                          <span className="text-[10px] font-bold text-white mt-2">API Gateway</span>
                      </div>
                  </div>

                  {/* Connection Timeline */}
                  <div className="flex-1 relative flex flex-col px-10 border-l border-r border-slate-800/50 mx-10">
                      
                      {/* Step 1: TCP SYN */}
                      <div className={`w-full h-8 flex items-center transition-opacity duration-500 ${handshakeStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-full h-0.5 bg-slate-600 relative">
                              <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-slate-600 border-b-[6px] border-b-transparent"></div>
                          </div>
                          <span className="absolute left-1/2 -translate-x-1/2 -mt-4 bg-slate-950 px-2 text-[8px] font-mono text-slate-400">SYN (TCP)</span>
                      </div>

                      {/* Step 2: Client Hello */}
                      <div className={`w-full h-8 flex items-center transition-opacity duration-500 ${handshakeStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-full h-0.5 bg-cyan-600 relative">
                              <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-cyan-600 border-b-[6px] border-b-transparent"></div>
                          </div>
                          <span className="absolute left-1/2 -translate-x-1/2 -mt-4 bg-slate-950 px-2 text-[8px] font-mono text-cyan-400">Client Hello (TLS)</span>
                      </div>

                      {/* Step 3: Server Hello & Cert Request */}
                      <div className={`w-full h-8 flex items-center transition-opacity duration-500 ${handshakeStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                          <div className={`w-full h-0.5 relative ${mTLSEnabled ? 'bg-amber-500' : 'bg-slate-600'}`}>
                              <div className={`absolute left-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-b-[6px] border-b-transparent ${mTLSEnabled ? 'border-r-amber-500' : 'border-r-slate-600'}`}></div>
                          </div>
                          <span className={`absolute left-1/2 -translate-x-1/2 -mt-4 bg-slate-950 px-2 text-[8px] font-mono ${mTLSEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                              {mTLSEnabled ? 'Server Hello + CertificateRequest' : 'Server Hello'}
                          </span>
                      </div>

                      {/* Step 4: Client Cert Response */}
                      <div className={`w-full h-8 flex items-center transition-opacity duration-500 ${handshakeStep >= 4 && mTLSEnabled ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-full h-0.5 bg-emerald-500 relative">
                              <div className="absolute right-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-emerald-500 border-b-[6px] border-b-transparent"></div>
                          </div>
                          <span className="absolute left-1/2 -translate-x-1/2 -mt-4 bg-slate-950 px-2 text-[8px] font-mono text-emerald-400">Certificate + CertificateVerify</span>
                      </div>

                      {/* Final Result Overlay */}
                      {connectionState === 'ACCEPTED' && (
                          <div className="absolute -bottom-4 -left-10 -right-10 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl animate-fade-in-up">
                              {mTLSEnabled ? (
                                  <div className="flex items-start">
                                      <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500 flex items-center justify-center text-xl mr-3 shrink-0">🔒</div>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-white mb-1">Zero-Trust Secured</span>
                                          <span className="text-[9px] text-slate-300 leading-snug">Connection established. The device's <span className="font-bold text-emerald-400">x509 Cryptographic Certificate</span> was verified. Even if a hacker steals the password, they cannot connect.</span>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex items-start">
                                      <div className="w-10 h-10 rounded-full bg-rose-900/30 border border-rose-500 flex items-center justify-center text-xl mr-3 shrink-0">⚠️</div>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-white mb-1">Legacy TCP Connection</span>
                                          <span className="text-[9px] text-slate-300 leading-snug">Connection established via standard TLS. The portal is <span className="font-bold text-rose-400">highly vulnerable</span> to stolen passwords and Phishing/MITM attacks.</span>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}

                  </div>

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#05100a] p-4 rounded-xl border border-emerald-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-emerald-400 uppercase block mb-1">Zero-Trust mTLS Security:</span>
               With the toggle off, click <span className="text-white font-bold bg-slate-800 px-1 rounded">Initiate Connection</span>. The server allows the TCP connection to open based purely on a password, leaving the system vulnerable to phishing.<br/><br/>Now, toggle <span className="text-white font-bold bg-emerald-600 px-1 rounded">mTLS</span> ON and try again. The API Gateway drops the connection at the TCP/TLS layer <i>unless</i> the client presents a valid, hardware-bound cryptographic certificate, creating a true Zero-Trust perimeter.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ZeroTrustMTLS;
