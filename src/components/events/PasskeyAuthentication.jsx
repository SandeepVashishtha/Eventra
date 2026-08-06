import React, { useState } from 'react';

const PasskeyAuthentication = () => {
  const [authStage, setAuthStage] = useState('login'); // login, prompt, success, error
  
  const handleLoginClick = () => {
    setAuthStage('prompt');
    
    // Simulate OS-level biometric prompt delay
    setTimeout(() => {
      // 90% success rate simulation
      if (Math.random() > 0.1) {
        setAuthStage('success');
      } else {
        setAuthStage('error');
      }
    }, 2500);
  };

  const reset = () => setAuthStage('login');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            FIDO2 / WebAuthn standard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Passwordless <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Authentication</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Eliminate forgotten passwords and support ticket bottlenecks. Let attendees register and log in instantly using their device's built-in biometrics via secure Passkeys.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start">
              <span className="text-2xl mb-2 text-emerald-500">🛡️</span>
              <h4 className="font-bold text-slate-800 text-sm">Phishing-Resistant</h4>
              <p className="text-xs text-slate-500 mt-1">Cryptographically bound to origin.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start">
              <span className="text-2xl mb-2 text-emerald-500">⚡</span>
              <h4 className="font-bold text-slate-800 text-sm">Frictionless</h4>
              <p className="text-xs text-slate-500 mt-1">Dramatically improves conversion.</p>
            </div>
          </div>
        </div>

        {/* Right Side: OS Prompt Simulation */}
        <div className="flex justify-center relative">
          
          {/* Simulated Browser/Device Frame */}
          <div className="w-[360px] h-[700px] bg-white rounded-[2.5rem] border-[8px] border-slate-200 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Top Bar */}
            <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 justify-between">
              <span className="text-xs font-bold text-slate-400">eventra.com</span>
              <span className="text-xs text-slate-400">🔒</span>
            </div>

            {/* Eventra Login UI */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
              
              <div className="w-12 h-12 bg-emerald-500 rounded-xl mb-6 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white font-black text-2xl">
                E
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm mb-8 text-center">Sign in to access your tickets and event schedule.</p>
              
              <div className="w-full space-y-4">
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue="jonathan@example.com"
                />
                
                <button 
                  onClick={handleLoginClick}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span className="text-lg">👆</span>
                  <span>Sign in with Passkey</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-8 text-center hover:underline cursor-pointer">
                Use a password instead
              </p>

              {/* Simulated OS-Level Passkey Prompt Overlay */}
              {authStage !== 'login' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
                  <div className={`w-full bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-out ${authStage !== 'login' ? 'translate-y-0' : 'translate-y-full'}`}>
                    
                    {authStage === 'prompt' && (
                      <div className="flex flex-col items-center animate-fade-in">
                        <div className="w-12 h-1 bg-slate-200 rounded-full mb-6"></div>
                        <span className="text-4xl mb-4">🔐</span>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Sign in</h3>
                        <p className="text-sm text-slate-500 mb-6">eventra.com</p>
                        
                        <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center space-x-4 mb-8">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">JD</div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">jonathan@example.com</p>
                            <p className="text-xs text-slate-500">Saved Passkey</p>
                          </div>
                        </div>

                        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verify identity...</p>
                      </div>
                    )}

                    {authStage === 'success' && (
                      <div className="flex flex-col items-center animate-fade-in py-8">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-4">
                          ✓
                        </div>
                        <h3 className="font-black text-slate-900 text-xl">Authenticated</h3>
                        <p className="text-sm text-slate-500 mt-2 text-center">Redirecting to your dashboard...</p>
                        <button onClick={reset} className="mt-8 text-xs text-emerald-600 font-bold hover:underline">Reset Demo</button>
                      </div>
                    )}

                    {authStage === 'error' && (
                      <div className="flex flex-col items-center animate-fade-in py-8">
                        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4">
                          ✕
                        </div>
                        <h3 className="font-black text-slate-900 text-xl">Verification Failed</h3>
                        <p className="text-sm text-slate-500 mt-2 text-center">Biometric match failed or was canceled.</p>
                        <button onClick={reset} className="mt-8 w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition">Try Again</button>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PasskeyAuthentication;
