/* eslint-disable */
import React, { useState, useEffect } from 'react';

const DecentralizedVIPIdentity = () => {
  const [authState, setAuthState] = useState('IDLE'); // IDLE, CHALLENGE, SIGNING, VERIFYING, SUCCESS, FAILED
  const [authMethod, setAuthMethod] = useState('DID'); // 'DID' or 'LEGACY'
  
  const [didPayload, setDidPayload] = useState({
      did: 'did:eventra:0x7a9f...4b2e',
      nonce: '',
      signature: ''
  });
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'VIP Gate 4 Scanner online. Awaiting credential presentation.' }
  ]);

  const initiateHandshake = () => {
      if (authMethod === 'DID') {
          // Web3 Cryptographic Handshake Flow
          setAuthState('CHALLENGE');
          const newNonce = generateNonce();
          setDidPayload(prev => ({ ...prev, nonce: newNonce, signature: '' }));
          addLog('ACTION', `Scanner issued Cryptographic Challenge (Nonce: ${newNonce.substring(0, 12)}...)`);
          
          setTimeout(() => {
              setAuthState('SIGNING');
              addLog('SYS', 'Mobile App Secure Enclave: Signing payload with Private Key (secp256k1).');
              
              setTimeout(() => {
                  setAuthState('VERIFYING');
                  setDidPayload(prev => ({ ...prev, signature: generateSignature() }));
                  addLog('ACTION', 'Scanner received Verifiable Credential (VC). Verifying signature on chain...');
                  
                  setTimeout(() => {
                      setAuthState('SUCCESS');
                      addLog('SUCCESS', 'Zero-Knowledge Proof verified. VIP Access Granted.');
                  }, 1500);
              }, 1200);
          }, 800);
          
      } else {
          // Legacy QR Code Flow (Simulating a duplicate/fake)
          setAuthState('VERIFYING');
          addLog('ACTION', 'Scanning visual QR Code payload...');
          
          setTimeout(() => {
              setAuthState('FAILED');
              addLog('CRIT', 'Double-scan detected! QR Code already redeemed at Gate 2. Access Denied.');
          }, 1000);
      }
  };

  const resetScanner = () => {
      setAuthState('IDLE');
      setDidPayload({ did: 'did:eventra:0x7a9f...4b2e', nonce: '', signature: '' });
      addLog('SYS', 'Scanner reset. Ready for next attendee.');
  };

  const generateNonce = () => {
      return Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
  };
  
  const generateSignature = () => {
      return '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070512] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-900/40 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🔐</span> Web3 & Cryptography
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Decentralized Identity <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500">(DID) VIP Verification</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Counterfeit VIP wristbands are a massive black market. Malicious actors duplicate static QR codes, causing the system to double-scan and denying entry to legitimate high-paying VIPs. Eventra solves this by integrating Web3 Decentralized Identifiers (DIDs). The app issues a cryptographic Verifiable Credential (VC) to the user's secure enclave. At the gate, a cryptographic handshake proves ownership of the VIP credential mathematically without relying on easily duplicated visual QR codes.
          </p>

          <div className="bg-[#0b0817] rounded-3xl p-6 border border-purple-900/30 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-purple-900/30 pb-4">
               <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🎛️</span> IAM Control Plane
               </h3>
               
               <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                 <button 
                   onClick={() => setAuthMethod('LEGACY')}
                   className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded ${authMethod === 'LEGACY' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-400'}`}
                 >
                   Legacy (QR)
                 </button>
                 <button 
                   onClick={() => setAuthMethod('DID')}
                   className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded ${authMethod === 'DID' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'text-slate-500 hover:text-slate-400'}`}
                 >
                   Web3 (DID)
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Terminal Output */}
               <div className={`col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 authState === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/50' : 
                 authState === 'FAILED' ? 'bg-rose-950/20 border-rose-900/50' : 
                 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3 border-b border-slate-800 pb-2">
                   Cryptographic Handshake Status
                 </span>
                 <div className="flex flex-col space-y-2 h-16 justify-center">
                   
                   {authState === 'IDLE' && (
                       <span className="text-slate-600 font-mono text-xs text-center uppercase tracking-widest animate-pulse">Awaiting Device Near-Field Proximity</span>
                   )}
                   
                   {(authState === 'CHALLENGE' || authState === 'SIGNING' || authState === 'VERIFYING') && (
                       <div className="flex items-center space-x-3 justify-center">
                           <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                           <span className="text-purple-400 font-mono text-xs uppercase tracking-widest">
                               {authState === 'CHALLENGE' ? 'Exchanging Nonce...' : authState === 'SIGNING' ? 'Secure Enclave Signing...' : 'Verifying ECDSA Signature...'}
                           </span>
                       </div>
                   )}

                   {authState === 'SUCCESS' && (
                       <div className="text-center bg-emerald-900/30 border border-emerald-500/50 py-2 rounded-lg text-emerald-400 font-black text-sm uppercase tracking-widest flex items-center justify-center">
                           <span className="text-xl mr-2">✓</span> ZERO-KNOWLEDGE PROOF VERIFIED
                       </div>
                   )}
                   
                   {authState === 'FAILED' && (
                       <div className="text-center bg-rose-900/30 border border-rose-500/50 py-2 rounded-lg text-rose-500 font-black text-sm uppercase tracking-widest flex items-center justify-center">
                           <span className="text-xl mr-2">×</span> CREDENTIAL COMPROMISED
                       </div>
                   )}

                 </div>
               </div>
             </div>

             <div className="mb-4">
                 <button
                    onClick={authState === 'IDLE' ? initiateHandshake : resetScanner}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                        authState === 'IDLE' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' :
                        'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                 >
                     {authState === 'IDLE' ? (
                         <><span className="mr-2">📲</span> SCAN VIP WRISTBAND</>
                     ) : (
                         <><span className="mr-2">↻</span> RESET GATE SCANNER</>
                     )}
                 </button>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#04030a] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Backend Auth Pipeline</span>
                 {authState !== 'IDLE' && authState !== 'SUCCESS' && authState !== 'FAILED' && <span className="text-purple-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-rose-500 font-bold' :
                       log.type === 'ACTION' ? 'text-purple-400 font-bold' :
                       log.type === 'SYS' ? 'text-slate-300 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[400px] flex flex-col items-center">
            
            {/* SecOps Dashboard Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[2rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Eventra Scanner OS</span>
                      <span className="text-xs text-white font-bold">VIP Gate 4 (Main Stage)</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${authState === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : authState === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                      {authState === 'SUCCESS' ? '🔓' : '🔒'}
                  </div>
              </div>

              <div className="flex-1 p-6 relative overflow-y-auto bg-slate-950">
                  
                  {/* Web3 / Cryptographic Data Payload Viewer */}
                  {authMethod === 'DID' ? (
                      <div className="space-y-4">
                          
                          {/* Decentralized ID */}
                          <div className={`p-4 rounded-xl border transition-all duration-500 ${authState !== 'IDLE' ? 'bg-purple-950/20 border-purple-900/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest block mb-2">Subject DID (Decentralized Identifier)</span>
                              <code className="text-xs font-mono text-white block break-all bg-slate-950 p-2 rounded border border-slate-800">
                                  {authState !== 'IDLE' ? didPayload.did : '...'}
                              </code>
                          </div>

                          {/* Challenge / Nonce */}
                          <div className={`p-4 rounded-xl border transition-all duration-500 ${(authState === 'CHALLENGE' || authState === 'SIGNING' || authState === 'VERIFYING' || authState === 'SUCCESS') ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block mb-2">Cryptographic Challenge (Nonce)</span>
                              <code className="text-[10px] font-mono text-slate-300 block break-all bg-slate-950 p-2 rounded border border-slate-800">
                                  {didPayload.nonce || '...'}
                              </code>
                          </div>

                          {/* Signature */}
                          <div className={`p-4 rounded-xl border transition-all duration-500 ${(authState === 'VERIFYING' || authState === 'SUCCESS') ? 'bg-pink-950/20 border-pink-900/50 shadow-[0_0_20px_rgba(219,39,119,0.2)]' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                              <span className="text-[9px] text-pink-400 font-bold uppercase tracking-widest block mb-2">Verifiable Credential (VC) Signature</span>
                              
                              {authState === 'VERIFYING' ? (
                                  <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center">
                                      <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping mr-2"></span>
                                      <span className="text-[10px] font-mono text-slate-500">DECRYPTING WITH PUBLIC KEY...</span>
                                  </div>
                              ) : authState === 'SUCCESS' ? (
                                  <code className="text-[8px] font-mono text-emerald-400 block break-all bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                                      {didPayload.signature}
                                  </code>
                              ) : (
                                  <code className="text-[10px] font-mono text-slate-600 block bg-slate-950 p-2 rounded border border-slate-800">...</code>
                              )}
                          </div>

                          {/* Big Status Alert */}
                          {authState === 'SUCCESS' && (
                              <div className="bg-emerald-500 text-white p-4 rounded-xl text-center shadow-lg animate-fade-in-up mt-8 border-2 border-emerald-400">
                                  <h2 className="text-xl font-black uppercase">VALID VIP PASS</h2>
                                  <p className="text-xs text-emerald-100 font-bold mt-1">Mathematical Proof Verified</p>
                              </div>
                          )}
                      </div>
                  ) : (
                      /* Legacy QR Flow Simulator */
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                          
                          <div className={`w-40 h-40 bg-white rounded-xl p-2 flex items-center justify-center transition-all ${authState === 'FAILED' ? 'opacity-30 grayscale' : ''}`}>
                              {/* Simulated QR block pattern */}
                              <div className="w-full h-full bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] bg-[size:10px_10px]"></div>
                          </div>

                          {authState === 'IDLE' && (
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Waiting for QR Code</span>
                          )}

                          {authState === 'FAILED' && (
                              <div className="bg-rose-600 text-white p-4 rounded-xl shadow-lg w-full animate-bounce">
                                  <h2 className="text-lg font-black uppercase">DUPLICATE DETECTED</h2>
                                  <p className="text-[10px] text-rose-200 font-bold mt-2">This static QR code was scanned 14 mins ago at Gate 2. Deny Entry.</p>
                              </div>
                          )}

                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#0b0817] p-4 rounded-xl border border-purple-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-purple-400 uppercase block mb-1">Mathematical Cryptography:</span>
               In <span className="text-slate-300 font-bold bg-slate-800 px-1 rounded">Legacy (QR)</span> mode, static images are easily screenshotted and duplicated by counterfeiters. In <span className="text-white font-bold bg-purple-600 px-1 rounded">Web3 (DID)</span> mode, the scanner issues a random mathematical challenge (Nonce) every time. The phone's secure hardware signs it, ensuring the credential cannot be intercepted, re-used, or counterfeited.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default DecentralizedVIPIdentity;
