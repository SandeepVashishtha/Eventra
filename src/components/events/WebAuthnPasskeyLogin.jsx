/* eslint-disable */
import React, { useState, useEffect } from 'react';

const WebAuthnPasskeyLogin = () => {
  const [loginState, setLoginState] = useState('IDLE'); // IDLE, PROMPTING, AUTHENTICATED
  const [showPii, setShowPii] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '08:00:00', type: 'SYS', msg: 'Zero-Trust IAM architecture initialized. Passwords deprecated.' }
  ]);

  const initiateWebAuthn = () => {
      setLoginState('PROMPTING');
      addLog('ACTION', 'navigator.credentials.get() called.');
      addLog('SYS', 'Requesting cryptographic challenge signature from hardware authenticator...');
      
      // Simulate user interacting with FaceID/TouchID prompt
      setTimeout(() => {
          setLoginState('AUTHENTICATED');
          setShowPii(true);
          addLog('SUCCESS', 'FIDO2 Assertion verified. Cryptographic handshake complete.');
          addLog('SYS', 'Session token issued. Rendering Admin PII Dashboard.');
      }, 3000);
  };

  const logout = () => {
      setLoginState('IDLE');
      setShowPii(false);
      addLog('WARN', 'Session terminated. Access revoked.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-teal-900/40 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛡️</span> Cybersecurity & WebAuthn
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Phishing-Resistant <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500">Passkey Authentication</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Festival staff frequently fall for phishing emails, surrendering their passwords to hackers who then steal the Personally Identifiable Information (PII) of 100,000 attendees. Eventra solves this by completely deprecating passwords. By implementing the WebAuthn standard on the login portal, admins authenticate using biometric Passkeys (FaceID / TouchID) anchored mathematically to their physical device hardware, rendering credential phishing impossible.
          </p>

          <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-teal-500 text-lg mr-2">🎛️</span> IAM Access State
               </h3>
               
               <div className="flex space-x-2">
                 <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                     loginState === 'IDLE' ? 'bg-slate-900 border-slate-700 text-slate-500' :
                     loginState === 'PROMPTING' ? 'bg-amber-900/50 border-amber-500 text-amber-400 animate-pulse' :
                     'bg-emerald-900/50 border-emerald-500 text-emerald-400'
                 }`}>
                     {loginState === 'IDLE' ? 'UNAUTHENTICATED' : loginState === 'PROMPTING' ? 'AWAITING BIOMETRICS' : 'AUTHENTICATED_SECURE'}
                 </div>
               </div>
             </div>

             <div className="flex-1 flex flex-col justify-center mb-6 relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4 border-b border-slate-800 pb-2">
                   navigator.credentials Output
                 </span>
                 
                 {loginState === 'IDLE' ? (
                     <div className="flex-1 flex items-center justify-center text-slate-600 text-xs font-mono">
                         Awaiting interaction...
                     </div>
                 ) : loginState === 'PROMPTING' ? (
                     <div className="flex-1 flex items-center justify-center">
                         <span className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                     </div>
                 ) : (
                     <pre className="text-[9px] font-mono text-teal-400 overflow-y-auto animate-fade-in-up">
{`{
  "id": "A4C9-F10B-883A...",
  "rawId": "ArrayBuffer(64)",
  "type": "public-key",
  "authenticatorAttachment": "platform",
  "response": {
    "authenticatorData": "ArrayBuffer(37)",
    "clientDataJSON": "ArrayBuffer(121)",
    "signature": "ArrayBuffer(72)",
    "userHandle": "ArrayBuffer(16)"
  }
}`}
                     </pre>
                 )}
                 
                 <div className="absolute top-2 right-2 text-3xl opacity-10">🔑</div>
             </div>
             
             {/* System Log */}
             <div className="h-32 bg-[#04060a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Auth Pipeline Logs</span>
                 {loginState === 'PROMPTING' && <span className="text-teal-400 font-black animate-pulse">VERIFYING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-teal-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-rose-600 px-1' :
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'SYS' ? 'text-blue-300 font-bold' : 'text-slate-400'
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
            
            {/* Login Portal Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Eventra Staff Portal</span>
                      <span className="text-xs text-white font-bold">Admin Dashboard v2.0</span>
                  </div>
                  {loginState === 'AUTHENTICATED' && (
                      <button onClick={logout} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700">LOGOUT</button>
                  )}
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
                  
                  {loginState === 'IDLE' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in-up">
                          <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                              🛡️
                          </div>
                          <h2 className="text-2xl font-black text-white mb-2 text-center">Admin Access</h2>
                          <p className="text-slate-400 text-xs text-center mb-8">
                              Passwords have been disabled for security purposes. Please authenticate using your device hardware.
                          </p>
                          <button 
                              onClick={initiateWebAuthn}
                              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition shadow-[0_0_20px_rgba(13,148,136,0.3)] flex items-center justify-center"
                          >
                              <span className="text-lg mr-2">🗝️</span> Sign In with Passkey
                          </button>
                      </div>
                  )}

                  {loginState === 'PROMPTING' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20"></div>
                          
                          {/* Simulated Native OS Prompt */}
                          <div className="bg-[#1c1c1e] w-full border border-[#38383a] rounded-3xl p-6 z-30 shadow-2xl flex flex-col items-center animate-fade-in-down">
                              <span className="text-white font-bold text-lg mb-1">Sign In</span>
                              <span className="text-slate-400 text-xs mb-6 text-center">Do you want to sign in to eventra-admin.local with your saved Passkey?</span>
                              
                              <div className="relative w-16 h-16 mb-6">
                                  {/* FaceID Scanner Simulation */}
                                  <div className="absolute inset-0 border-4 border-teal-500 rounded-xl opacity-20"></div>
                                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal-500 rounded-tl-xl"></div>
                                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal-500 rounded-tr-xl"></div>
                                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal-500 rounded-bl-xl"></div>
                                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal-500 rounded-br-xl"></div>
                                  
                                  {/* Scanning bar */}
                                  <div className="absolute left-0 w-full h-1 bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                  
                                  <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-80">😀</div>
                              </div>

                              <span className="text-teal-500 text-xs font-bold uppercase tracking-widest">Verifying FaceID...</span>
                          </div>
                      </div>
                  )}

                  {loginState === 'AUTHENTICATED' && (
                      <div className="flex-1 flex flex-col p-6 animate-fade-in-up">
                          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl mb-6 flex items-center">
                              <span className="text-2xl mr-3">✅</span>
                              <div className="flex flex-col">
                                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Authentication Success</span>
                                  <span className="text-xs text-slate-300">Welcome back, Super Admin.</span>
                              </div>
                          </div>
                          
                          {showPii && (
                              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                                  <span className="bg-slate-950 p-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800 flex justify-between items-center">
                                      <span>Protected Attendee PII</span>
                                      <span className="text-teal-500">ENCRYPTED</span>
                                  </span>
                                  <div className="p-4 space-y-3">
                                      {[1,2,3].map(i => (
                                          <div key={i} className="flex flex-col border-b border-slate-800/50 pb-2">
                                              <span className="text-xs text-white font-bold blur-[2px] hover:blur-none transition-all">John Doe {i}</span>
                                              <span className="text-[10px] text-slate-500 font-mono blur-[2px] hover:blur-none transition-all">SSN: ***-**-**** | DOB: 199X-XX-XX</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
                  
              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b101a] p-4 rounded-xl border border-teal-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-teal-400 uppercase block mb-1">WebAuthn Standard:</span>
               Click <span className="text-white font-bold bg-teal-600 px-1 rounded">Sign In with Passkey</span>. Notice there is no password field for a hacker to phish. The UI simulates calling the browser's native <span className="font-mono text-slate-300 bg-slate-800 px-1 rounded">navigator.credentials</span> API. The user confirms via hardware biometrics (FaceID), generating a secure cryptographic signature. Only after successful hardware verification is the sensitive Attendee PII dashboard unlocked.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default WebAuthnPasskeyLogin;
