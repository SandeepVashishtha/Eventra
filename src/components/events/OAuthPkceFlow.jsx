/* eslint-disable */
import React, { useState } from 'react';

const OAuthPkceFlow = () => {
  const [flowState, setFlowState] = useState('IDLE'); // IDLE, PKCE_GEN, AUTH_UI, TOKEN_EXCHANGE, SUCCESS
  const [codeVerifier, setCodeVerifier] = useState('');
  const [codeChallenge, setCodeChallenge] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '09:00:00', type: 'SYS', msg: 'Eventra IAM Identity Provider ready on port 443.' },
    { id: 2, time: '09:00:02', type: 'SYS', msg: 'Third-party client [MerchApp] registered. Awaiting OAuth 2.0 initiation.' }
  ]);

  const generateRandomString = (length) => {
      return Array.from(crypto.getRandomValues(new Uint8Array(length)))
          .map(b => String.fromCharCode(b % 26 + 97)).join('');
  };

  const startPkceFlow = () => {
      setFlowState('PKCE_GEN');
      const verifier = generateRandomString(43) + 'XYZ890';
      const challenge = 'S256_HASH_OF_' + verifier.substring(0, 8) + '...';
      
      setCodeVerifier(verifier);
      setCodeChallenge(challenge);
      
      addLog('ACTION', '3rd-Party App: Generating cryptographically secure code_verifier and code_challenge.');
      
      setTimeout(() => {
          setFlowState('AUTH_UI');
          addLog('SYS', `Redirecting User to Eventra IAM with code_challenge=[${challenge}]`);
      }, 2000);
  };

  const userAuthorizes = () => {
      const code = 'AUTH_CODE_' + generateRandomString(12).toUpperCase();
      setAuthCode(code);
      setFlowState('TOKEN_EXCHANGE');
      
      addLog('ACTION', `User explicitly granted scopes: [profile:read, payment:write].`);
      addLog('SYS', `Identity Provider redirecting back to 3rd-Party App with auth_code=[${code}]`);
      
      setTimeout(() => {
          addLog('ACTION', `3rd-Party App: Exchanging auth_code + code_verifier for Access Token over secure back-channel.`);
          
          setTimeout(() => {
              setAccessToken('eyJhbGciOiJIUzI1Ni... (Valid JWT)');
              setFlowState('SUCCESS');
              addLog('SUCCESS', `PKCE Verification Passed! IDP issued Access Token. Secure session established.`);
          }, 2000);
      }, 1500);
  };

  const resetSimulation = () => {
      setFlowState('IDLE');
      setCodeVerifier('');
      setCodeChallenge('');
      setAuthCode('');
      setAccessToken('');
      addLog('SYS', 'Session destroyed. Tokens revoked.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070914] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> IAM & Cybersecurity
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            OAuth 2.0 PKCE Flow <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Secure API Authentication</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Third-party merchandise vendors want to integrate their standalone apps with Eventra's user accounts, but sharing raw passwords or static API keys creates massive security vulnerabilities. Eventra solves this by implementing a strict OAuth 2.0 Authorization Code flow with Proof Key for Code Exchange (PKCE) on the backend Identity Access Management (IAM) provider. Attendees securely grant scoped permissions to third-party vendor apps without ever exposing their credentials.
          </p>

          <div className="bg-[#0b0e1c] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Identity Access Management
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSimulation}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-slate-800 text-slate-400 hover:bg-slate-700"
                 >
                   Reset Session
                 </button>
               </div>
             </div>

             <div className="flex-1 flex space-x-6 mb-6">
                 
                 {/* 3rd Party App Simulator */}
                 <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                     <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-2xl mb-3 border border-indigo-500/30">
                         👕
                     </div>
                     <h4 className="text-sm font-black text-white mb-1">Festival Merch Store</h4>
                     <p className="text-[9px] text-slate-500 mb-6">Untrusted 3rd-Party Mobile Client</p>
                     
                     <button
                        onClick={startPkceFlow}
                        disabled={flowState !== 'IDLE'}
                        className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                            flowState !== 'IDLE' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' :
                            'bg-[#000000] hover:bg-slate-900 text-white border border-slate-700 hover:border-slate-500'
                        }`}
                     >
                         <span className="text-indigo-500 mr-2 text-lg">E</span> Login with Eventra
                     </button>
                 </div>

                 {/* Cryptographic Secrets Visualizer */}
                 <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center font-mono text-[9px] text-slate-400 overflow-hidden space-y-3">
                     
                     <div>
                         <span className="text-indigo-400 font-bold uppercase block mb-1">1. PKCE Code Verifier (Client Secret):</span>
                         <div className={`p-2 rounded bg-black border ${codeVerifier ? 'border-indigo-900/50 text-indigo-300' : 'border-slate-800 text-slate-600'}`}>
                             {codeVerifier || 'Awaiting Generation...'}
                         </div>
                     </div>
                     
                     <div>
                         <span className="text-amber-400 font-bold uppercase block mb-1">2. Short-Lived Auth Code (URL Param):</span>
                         <div className={`p-2 rounded bg-black border ${authCode ? 'border-amber-900/50 text-amber-300' : 'border-slate-800 text-slate-600'}`}>
                             {authCode || 'Awaiting Authorization...'}
                         </div>
                     </div>

                     <div>
                         <span className="text-emerald-400 font-bold uppercase block mb-1">3. Scoped Access Token (JWT):</span>
                         <div className={`p-2 rounded bg-black border truncate ${accessToken ? 'border-emerald-900/50 text-emerald-300' : 'border-slate-800 text-slate-600'}`}>
                             {accessToken || 'Awaiting Exchange...'}
                         </div>
                     </div>

                 </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04050a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>OAuth 2.0 Security Audit Log</span>
                 {flowState !== 'IDLE' && flowState !== 'SUCCESS' && <span className="text-indigo-400 font-black animate-pulse">HANDSHAKE IN PROGRESS...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-400 font-bold' :
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Eventra Auth Server UI Simulator */}
            <div className={`w-full bg-[#111827] rounded-[2rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[560px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-center shadow-sm relative">
                  <span className="absolute left-4 text-slate-500 text-xs">Aa</span>
                  <div className="bg-black/50 px-3 py-1 rounded flex items-center text-[9px] font-mono text-emerald-500 border border-slate-800">
                      <span className="mr-1">🔒</span> https://auth.eventra.io
                  </div>
              </div>

              <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
                  
                  {flowState === 'IDLE' || flowState === 'PKCE_GEN' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                          <span className="text-5xl mb-4 grayscale">🛡️</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Eventra Secure IAM<br/>Awaiting Redirect...</span>
                      </div>
                  ) : flowState === 'AUTH_UI' ? (
                      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
                          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-slate-700">
                              E
                          </div>
                          <h2 className="text-xl font-black text-white mb-2">Authorize MerchApp?</h2>
                          <p className="text-xs text-slate-400 mb-6 px-4">
                              "Festival Merch Store" wants to access your Eventra account.
                          </p>
                          
                          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-left mb-8">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Requested Scopes</span>
                              <div className="space-y-3">
                                  <div className="flex items-start">
                                      <span className="text-emerald-500 mr-2 text-sm mt-0.5">✓</span>
                                      <div>
                                          <span className="text-xs font-bold text-slate-300 block">Read Profile Data</span>
                                          <span className="text-[9px] text-slate-500">View your name and email address.</span>
                                      </div>
                                  </div>
                                  <div className="flex items-start">
                                      <span className="text-emerald-500 mr-2 text-sm mt-0.5">✓</span>
                                      <div>
                                          <span className="text-xs font-bold text-slate-300 block">Charge RFID Wallet</span>
                                          <span className="text-[9px] text-slate-500">Deduct funds for merch purchases.</span>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="w-full space-y-3">
                              <button
                                onClick={userAuthorizes}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.4)] transition"
                              >
                                  Authorize Access
                              </button>
                              <button className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition">
                                  Cancel
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                          <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center text-4xl mb-6 border-[4px] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                              ✅
                          </div>
                          <h2 className="text-xl font-black text-white mb-2">Authorization Complete</h2>
                          <p className="text-xs text-slate-400 mb-6 px-4">
                              You can safely close this browser window and return to the Merch App.
                          </p>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0a0f1c] p-4 rounded-xl border border-indigo-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-indigo-400 uppercase block mb-1">PKCE Defense Mechanism:</span>
               Even if a malicious app intercepts the <span className="text-amber-400 font-mono">auth_code</span>, they cannot exchange it for an Access Token without the original <span className="text-indigo-400 font-mono">code_verifier</span> secret, preventing Man-in-the-Middle attacks.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default OAuthPkceFlow;
