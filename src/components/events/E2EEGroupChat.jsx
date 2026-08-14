/* eslint-disable */
import React, { useState, useEffect } from 'react';

const E2EEGroupChat = () => {
  const [e2eeEnabled, setE2eeEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Chat Socket connected. Awaiting user transmission.' }
  ]);

  const sendMessage = () => {
      setIsSending(true);
      setMessageSent(false);
      addLog('ACTION', "Alice: Initiating coordinate transmission to Bob's device...");
      
      setTimeout(() => {
          if (e2eeEnabled) {
              addLog('SYS', 'Alice Device: Generating AES-GCM ciphertext using ECDH shared secret.');
              setTimeout(() => {
                  addLog('SUCCESS', 'Server DB: Storing blind ciphertext payload. Data mathematically unreadable.');
                  setTimeout(() => {
                      addLog('SYS', 'Bob Device: Decrypting payload using local private key. Render successful.');
                      setIsSending(false);
                      setMessageSent(true);
                  }, 1200);
              }, 1200);
          } else {
              addLog('WARN', 'Alice Device: Transmitting raw JSON over standard HTTPS.');
              setTimeout(() => {
                  addLog('CRIT', 'Server DB: Storing geolocation coordinates in plaintext. High liability risk.');
                  setTimeout(() => {
                      addLog('WARN', 'Bob Device: Received unencrypted plaintext. Render successful.');
                      setIsSending(false);
                      setMessageSent(true);
                  }, 1200);
              }, 1200);
          }
      }, 1000);
  };

  const toggleE2EE = () => {
      const newState = !e2eeEnabled;
      setE2eeEnabled(newState);
      setMessageSent(false);
      if (newState) {
          addLog('SUCCESS', 'Web Crypto API initialized. Signal-protocol Key Exchange complete.');
      } else {
          addLog('CRIT', 'E2EE Disabled. Downgrading to standard plaintext transmission.');
      }
  };
  
  const resetDemo = () => {
      setMessageSent(false);
      addLog('SYS', 'Simulation reset. Ready for next message.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020606] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Cryptography & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            End-to-End Encrypted <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500">Key Exchange (E2EE)</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees use the app's group chat to coordinate meetups, but transmitting precise geolocation coordinates in plaintext across a centralized server violates modern privacy expectations. Storing plaintext chat logs in PostgreSQL creates a massive liability if the database is ever breached. Eventra solves this by implementing a Signal-protocol style E2EE system using the Web Crypto API. The frontend generates Elliptic Curve (ECDH) key pairs, ensuring the server acts only as a blind relay for ciphertexts.
          </p>

          <div className="bg-[#051111] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> Web Crypto API Controls
               </h3>
               {messageSent && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Simulation</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* E2EE Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Signal Protocol (E2EE)</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {e2eeEnabled ? 'Active: Elliptic Curve Diffie-Hellman (ECDH)' : 'Inactive: Legacy Plaintext Sockets'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={toggleE2EE}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             e2eeEnabled ? 'bg-teal-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             e2eeEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={sendMessage}
                     disabled={isSending || messageSent}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         messageSent ? 'bg-slate-800 text-teal-500 border-teal-900 cursor-not-allowed' :
                         isSending ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                     }`}
                 >
                     {isSending ? 'Transmitting Data...' : messageSent ? 'Transmission Complete' : "Send GPS Coordinates to 'Bob'"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020505] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Socket Intercept Logs</span>
                 {isSending && <span className="text-teal-400 font-black animate-pulse">MONITORING...</span>}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Database & Network Simulator</span>
                      <span className="text-xs text-white font-bold">Blind Relay Architecture</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Alice (Sender) */}
                  <div className="w-full flex flex-col items-center z-20">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-lg mb-2">👩</div>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-700">Alice's App (Sender)</span>
                      
                      {e2eeEnabled && (
                          <div className="mt-2 text-[8px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 border border-emerald-900 rounded">
                              Local ECDH Keypair active
                          </div>
                      )}
                  </div>

                  {/* Server (Middleman) */}
                  <div className="w-full flex flex-col items-center z-20 my-4 relative">
                      
                      {/* Incoming Network Line */}
                      <div className="absolute -top-12 bottom-full w-0.5 bg-slate-700"></div>
                      
                      <div className={`bg-slate-900 border rounded-xl p-4 w-full shadow-lg transition-colors duration-500 ${
                          messageSent || isSending ? (e2eeEnabled ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]') : 'border-slate-700'
                      }`}>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eventra Server (PostgreSQL)</span>
                              <span className="text-xl">🗄️</span>
                          </div>

                          <div className="bg-black/50 rounded p-3 min-h-[60px] font-mono text-[9px] flex flex-col justify-center">
                              {!isSending && !messageSent && (
                                  <span className="text-slate-600 text-center uppercase">Awaiting payload</span>
                              )}
                              {(isSending || messageSent) && !e2eeEnabled && (
                                  <div className="text-amber-400 break-all animate-fade-in-up">
                                      <span className="text-rose-500 font-bold block mb-1">// PLAINTEXT STORED IN DB</span>
                                      {`{"type": "location", "lat": 34.0522, "lng": -118.2437}`}
                                  </div>
                              )}
                              {(isSending || messageSent) && e2eeEnabled && (
                                  <div className="text-emerald-400 break-all animate-fade-in-up">
                                      <span className="text-emerald-500 font-bold block mb-1">// CIPHERTEXT STORED IN DB</span>
                                      U2FsdGVkX19B3yA/hZ...x3Qd8v9a2C=
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      {/* Outgoing Network Line */}
                      <div className="absolute top-full -bottom-12 w-0.5 bg-slate-700"></div>
                  </div>

                  {/* Bob (Receiver) */}
                  <div className="w-full flex flex-col items-center z-20">
                      {e2eeEnabled && (
                          <div className="mb-2 text-[8px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 border border-emerald-900 rounded">
                              Decrypting w/ Private Key...
                          </div>
                      )}
                      
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-lg mb-2">🧑</div>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-700">Bob's App (Receiver)</span>
                  </div>

                  {/* Packet Animation Overlay */}
                  {isSending && (
                      <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white] z-30 animate-[drop_2.4s_linear_forwards]">
                          {e2eeEnabled ? (
                              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[2px]"></div>
                          ) : (
                              <div className="absolute inset-0 bg-rose-500 rounded-full blur-[2px]"></div>
                          )}
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#051111] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">Zero-Knowledge Architecture:</span>
               With E2EE disabled, click <span className="text-white font-bold bg-slate-800 px-1 rounded">Send Coordinates</span>. The Eventra server stores the exact GPS location in plaintext (`{"lat": 34.05...}`). This represents a massive privacy violation and data leak risk.<br/><br/>Now, toggle <span className="text-white font-bold bg-teal-600 px-1 rounded">Signal Protocol (E2EE)</span> ON. The Web Crypto API encrypts the message locally on Alice's device. The Eventra Server only ever sees, and stores, a mathematically unreadable `Ciphertext`. Only Bob's device possesses the cryptographic key required to decrypt it, ensuring true privacy.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drop {
          0% { top: 80px; opacity: 1; }
          40% { top: 200px; opacity: 0; }
          60% { top: 200px; opacity: 0; }
          100% { top: 400px; opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default E2EEGroupChat;
