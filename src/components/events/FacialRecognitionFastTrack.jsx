import React, { useState } from 'react';

const FacialRecognitionFastTrack = () => {
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [identifiedUser, setIdentifiedUser] = useState(null);

  const simulateScan = () => {
    setScanStatus('scanning');
    
    setTimeout(() => {
      // Simulate successful facial match against opt-in database
      if (Math.random() > 0.1) {
        setIdentifiedUser({
          name: 'Sarah Jenkins',
          company: 'CloudScale Inc.',
          tier: 'VIP Speaker',
          id: 'ATT-4892'
        });
        setScanStatus('success');
        
        // Auto-reset after printing
        setTimeout(() => {
          setScanStatus('idle');
          setIdentifiedUser(null);
        }, 5000);
      } else {
        setScanStatus('error');
        setTimeout(() => setScanStatus('idle'), 3000);
      }
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-100 min-h-[600px] flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kiosk Display */}
        <div className="bg-black rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-800 flex flex-col relative h-[550px]">
          
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl flex justify-center items-end pb-1 z-50">
            <div className="w-16 h-1 rounded-full bg-gray-800"></div>
          </div>

          <div className="flex-1 relative">
            {/* Simulated Camera Feed */}
            <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center transition-opacity duration-500 ${scanStatus === 'idle' ? 'opacity-50 blur-sm' : 'opacity-100'}`}></div>
            <div className="absolute inset-0 bg-black/30"></div>

            {scanStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 cursor-pointer" onClick={simulateScan}>
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-blue-400 flex items-center justify-center mb-6 animate-pulse">
                  <span className="text-4xl">👱‍♀️</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Fast-Track Entry</h2>
                <p className="text-blue-100 font-medium">Please look at the camera to check in automatically.</p>
                <p className="text-xs text-blue-300 mt-8 font-bold">(Click screen to simulate attendee approach)</p>
              </div>
            )}

            {scanStatus === 'scanning' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Facial Mesh UI Overlay */}
                <div className="relative w-64 h-64 border-2 border-blue-500 rounded-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] animate-scan"></div>
                  
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                </div>
                
                <div className="mt-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/50 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-ping mr-3"></span>
                  <span className="text-blue-100 font-mono text-sm font-bold uppercase tracking-widest">Running Local AI Model</span>
                </div>
              </div>
            )}

            {scanStatus === 'success' && identifiedUser && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-md p-6 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                  ✓
                </div>
                <h2 className="text-3xl font-black text-white mb-1">Welcome back,</h2>
                <h3 className="text-4xl font-black text-green-300 mb-6">{identifiedUser.name.split(' ')[0]}!</h3>
                
                <div className="bg-black/40 border border-green-500/50 rounded-xl p-4 w-full max-w-xs text-left">
                  <p className="text-green-200 text-xs font-bold uppercase tracking-wider mb-1">Printing Badge</p>
                  <p className="text-white font-bold">{identifiedUser.name}</p>
                  <p className="text-gray-400 text-sm mb-3">{identifiedUser.company}</p>
                  <span className="bg-yellow-500 text-yellow-950 text-xs font-black uppercase px-2 py-1 rounded">
                    {identifiedUser.tier}
                  </span>
                </div>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md p-6 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mb-4">
                  ✕
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Profile Not Found</h2>
                <p className="text-red-200 font-medium">Please proceed to the standard QR-code lanes or see a registration agent.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Compliance Panel */}
        <div className="flex flex-col justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center">
                <span className="mr-2">🚀</span> VIP Fast-Track
              </h2>
              <p className="text-gray-500 mt-1">Frictionless, zero-touch entry using edge AI.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="font-bold text-blue-900">Sub-second Recognition</h4>
                  <p className="text-xs text-blue-700 mt-1 font-medium">The computer vision model runs locally on the edge device, matching faces against the opt-in database in &lt;300ms without network latency.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="font-bold text-green-900">GDPR / CCPA Compliant</h4>
                  <p className="text-xs text-green-700 mt-1 font-medium">Biometric vectors are encrypted, strictly isolated from external networks, and automatically destroyed 24 hours after the event concludes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xl">📝</span>
                <div>
                  <h4 className="font-bold text-gray-900">Strict Opt-In Policy</h4>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Attendees must explicitly upload a selfie and sign a digital waiver during registration to be included in the Fast-Track database.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacialRecognitionFastTrack;
