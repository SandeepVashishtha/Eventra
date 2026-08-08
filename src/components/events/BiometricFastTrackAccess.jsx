import React, { useState } from 'react';

const BiometricFastTrackAccess = () => {
  const [authStatus, setAuthStatus] = useState('idle'); // idle, scanning, success, failed
  const [authMethod, setAuthMethod] = useState('face'); // face, fingerprint

  const handleAuthenticate = () => {
    setAuthStatus('scanning');
    
    // Simulate WebAuthn/FIDO2 delay
    setTimeout(() => {
      const isSuccess = Math.random() > 0.15; // 85% success rate simulation
      setAuthStatus(isSuccess ? 'success' : 'failed');
      
      // Auto-reset after a few seconds
      setTimeout(() => {
        setAuthStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center font-sans text-slate-200">
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context & Info */}
        <div className="space-y-6">
          <div className="inline-block bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            VIP Exclusive Feature
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Frictionless Entry via <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">WebAuthn</span>.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Link your VIP ticket to your device's native biometric hardware. Bypass the standard QR scanning lines with sub-second Face ID or Touch ID validation at exclusive access points.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">⚡</span>
              <h4 className="font-bold text-white text-sm">Sub-second Auth</h4>
              <p className="text-xs text-slate-500 mt-1">No need to dig for digital tickets.</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-2xl mb-2 block">🔒</span>
              <h4 className="font-bold text-white text-sm">FIDO2 Secure</h4>
              <p className="text-xs text-slate-500 mt-1">Biometrics never leave your device.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile Device Mockup */}
        <div className="flex justify-center">
          <div className="w-[320px] h-[680px] bg-black rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
            </div>

            <div className="flex-1 bg-slate-50 flex flex-col pt-16 pb-8 px-6 relative">
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-slate-900">VIP Access Link</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Global Tech Summit 2026</p>
              </div>

              {/* VIP Ticket Card Visual */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl mb-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-1 rounded">VIP Pass</span>
                  <span className="text-slate-400 text-xs font-mono">#8472-VIP</span>
                </div>
                <h4 className="text-xl font-black mb-1 relative z-10">Marcus Ty</h4>
                <p className="text-indigo-300 text-xs font-bold relative z-10">Diamond Tier</p>
              </div>

              {/* Authentication UI Area */}
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                
                {authStatus === 'idle' && (
                  <div className="w-full space-y-3 animate-fade-in text-center">
                    <p className="text-sm font-bold text-slate-600 mb-4">Select Authentication Method</p>
                    <button 
                      onClick={() => { setAuthMethod('face'); handleAuthenticate(); }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition flex items-center justify-center"
                    >
                      <span className="mr-2">🙂</span> Link via Face ID
                    </button>
                    <button 
                      onClick={() => { setAuthMethod('fingerprint'); handleAuthenticate(); }}
                      className="w-full bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl shadow-sm transition flex items-center justify-center"
                    >
                      <span className="mr-2">👆</span> Link via Touch ID
                    </button>
                  </div>
                )}

                {authStatus === 'scanning' && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="relative w-20 h-20 mb-4">
                      {authMethod === 'face' ? (
                        <>
                          <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-xl"></div>
                          <div className="absolute inset-0 border-4 border-indigo-500 rounded-xl border-t-transparent border-b-transparent animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-50">🙂</div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center text-5xl text-indigo-500/30">👆</div>
                          <div className="absolute inset-0 flex items-center justify-center text-5xl text-indigo-500 animate-pulse">👆</div>
                        </>
                      )}
                    </div>
                    <p className="font-bold text-indigo-600 text-sm">
                      {authMethod === 'face' ? 'Recognizing Face...' : 'Scanning Fingerprint...'}
                    </p>
                  </div>
                )}

                {authStatus === 'success' && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-green-200">
                      ✓
                    </div>
                    <p className="font-black text-green-700 text-lg">Identity Verified</p>
                    <p className="text-xs text-green-600 font-medium mt-1">Access Granted</p>
                  </div>
                )}

                {authStatus === 'failed' && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-red-200">
                      ✗
                    </div>
                    <p className="font-black text-red-700 text-lg">Verification Failed</p>
                    <p className="text-xs text-red-600 font-medium mt-1">Please try again.</p>
                  </div>
                )}

              </div>
              
              <div className="text-center mt-auto pt-4">
                <p className="text-[10px] text-slate-400 font-medium">Secured by WebAuthn & FIDO2 standards.</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BiometricFastTrackAccess;
