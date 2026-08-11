import React, { useState, useEffect } from 'react';

const DigitalWaitingRoom = () => {
  const [queuePosition, setQueuePosition] = useState(14582);
  const [estimatedWait, setEstimatedWait] = useState(12); // minutes
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('waiting'); // waiting, entering, checkout

  // Simulate queue progression
  useEffect(() => {
    if (status !== 'waiting') return;

    const interval = setInterval(() => {
      setQueuePosition(prev => {
        const drop = Math.floor(Math.random() * 500) + 100; // Drop 100-600 spots at a time
        const newPos = Math.max(0, prev - drop);
        
        // Update estimated time based on remaining position
        setEstimatedWait(Math.ceil(newPos / 1200)); 
        
        // Update progress bar
        setProgress(Math.min(100, ((14582 - newPos) / 14582) * 100));

        if (newPos === 0) {
          setStatus('entering');
          setTimeout(() => {
            setStatus('checkout');
          }, 3000); // 3 seconds "entering" transition
        }
        
        return newPos;
      });
    }, 2000); // Update every 2 seconds for visual effect

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen font-sans text-slate-200 flex items-center justify-center relative overflow-hidden">
      
      {/* Background abstract server topology lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 C150,200 350,0 500,100 S850,0 1000,100" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          <path d="M0,300 C200,400 400,100 600,300 S900,100 1200,300" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.3" />
          <path d="M0,600 C300,500 500,800 800,600 S1100,500 1400,600" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.3" />
        </svg>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        
        {/* Header Logo */}
        <div className="text-center mb-12">
           <h1 className="text-3xl font-black text-white tracking-widest uppercase flex justify-center items-center">
             <span className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center text-xl shadow-[0_0_15px_#2563eb]">E</span>
             Eventra <span className="text-slate-500 ml-2 font-normal">TIX</span>
           </h1>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Edge Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            {/* Event Info */}
            <div className="flex-1 text-center md:text-left">
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">High Demand Event</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Global Tech <br/>Summit 2026</h2>
              <p className="text-slate-400">San Francisco, CA • Moscone Center</p>
              
              <div className="mt-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are currently in the secure digital waiting room. This process prevents server overload and ensures fair access to tickets via our serverless edge network.
                </p>
              </div>
            </div>

            {/* Queue UI */}
            <div className="flex-1 w-full bg-slate-950 p-6 rounded-2xl border border-slate-800 relative shadow-inner">
              
              {status === 'waiting' && (
                <div className="animate-fade-in text-center">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">You are in line.</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Queue Position</p>
                      <p className="text-2xl font-black text-blue-400">{queuePosition.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Est. Wait</p>
                      <p className="text-2xl font-black text-slate-300">{estimatedWait} <span className="text-sm font-normal">min</span></p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span> Connected to AWS us-west-2 edge
                  </p>
                </div>
              )}

              {status === 'entering' && (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
                    🔓
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">It's your turn!</h3>
                  <p className="text-slate-400 text-sm">Transferring you to secure checkout...</p>
                </div>
              )}

              {status === 'checkout' && (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">Connection Secured</h3>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition">
                    Proceed to Select Tickets
                  </button>
                  <p className="text-xs text-slate-500 mt-4">You have 10:00 minutes to complete your purchase.</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalWaitingRoom;
