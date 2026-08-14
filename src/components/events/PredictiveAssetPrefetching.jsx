/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveAssetPrefetching = () => {
  const [isPrefetchEnabled, setIsPrefetchEnabled] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '15:00:00', type: 'SYS', msg: 'Frontend initialized. Simulating slow 3G cellular connection.' }
  ]);

  const executeCheckout = () => {
      setIsCheckingOut(true);
      setCheckoutComplete(false);
      setActiveStep(1);
      setTotalTime(0);
      
      addLog('ACTION', 'User clicked "Confirm Purchase" button.');
      
      if (isPrefetchEnabled) {
          addLog('SYS', '[ML Engine] User Journey Prediction: "My Tickets" Page (Probability: 99%)');
          addLog('WARN', '[Service Worker] Background PRE-FETCH initiated for QR Code DOM & Assets...');
          
          setTimeout(() => {
              setActiveStep(2);
              addLog('SYS', '[API] Processing Stripe Checkout (2.0s)...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SYS', '[Service Worker] Asset pre-fetch complete. Cached in browser memory.');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('SUCCESS', '[API] Checkout successful. Redirecting to "My Tickets"...');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsCheckingOut(false);
                          setCheckoutComplete(true);
                          setTotalTime(2.0); // Only the API time
                          addLog('SUCCESS', 'Page rendered instantly (0ms) from Service Worker cache.');
                      }, 200);
                  }, 800);
              }, 1000);
          }, 200);
          
      } else {
          // Legacy Waterfall
          setTimeout(() => {
              setActiveStep(2);
              addLog('SYS', '[API] Processing Stripe Checkout (2.0s)...');
              
              setTimeout(() => {
                  setActiveStep(3);
                  addLog('SUCCESS', '[API] Checkout successful. Redirecting to "My Tickets"...');
                  
                  setTimeout(() => {
                      setActiveStep(4);
                      addLog('WARN', '[Browser] Requesting QR Code DOM & Assets over slow 3G...');
                      
                      setTimeout(() => {
                          setActiveStep(5);
                          setIsCheckingOut(false);
                          setCheckoutComplete(true);
                          setTotalTime(5.0); // API + Asset Load
                          addLog('CRIT', 'Page finally rendered after 3.0s white screen delay.');
                      }, 3000); // 3 seconds loading assets
                  }, 200);
              }, 2000); // 2 seconds API
          }, 200);
      }
  };

  const togglePrefetch = () => {
      const newState = !isPrefetchEnabled;
      setIsPrefetchEnabled(newState);
      setCheckoutComplete(false);
      setActiveStep(0);
      setTotalTime(0);
      if (newState) {
          addLog('SUCCESS', 'ML Predictive Pre-fetching Engine enabled. Listening to user interactions.');
      } else {
          addLog('CRIT', 'Pre-fetching disabled. App relies on synchronous waterfall loading.');
      }
  };

  const resetDemo = () => {
      setIsCheckingOut(false);
      setCheckoutComplete(false);
      setActiveStep(0);
      setTotalTime(0);
      addLog('SYS', 'App state reset to Checkout screen.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070306] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> Frontend Performance & UX
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Pre-fetching <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-500 to-purple-500">ML User Journey Models</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a user finishes purchasing a ticket on a slow 3G cellular network, the app currently takes 3 seconds to load the "My Tickets" page because it has to fetch the DOM and QR code images from scratch after the checkout finishes. Eventra solves this via an intelligent ML pre-fetching engine. A lightweight model on the frontend tracks the user's journey. If they click "Confirm Purchase", the model predicts with 99% probability that they will visit "My Tickets" next. It initiates a background Service Worker fetch for those assets *while* the backend is processing the payment, resulting in a magical 0ms page transition.
          </p>

          <div className="bg-[#12050b] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> Network Optimization
               </h3>
               {checkoutComplete && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Flow</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4 relative z-10">
                 
                 {/* Prefetch Toggle */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                         <span className="text-xs font-bold text-white mb-1">Service Worker Architecture</span>
                         <span className="text-[10px] text-slate-400 font-mono">
                             {isPrefetchEnabled ? 'Active: ML Background Asset Pre-fetching' : 'Inactive: Strict Waterfall Data Fetching'}
                         </span>
                     </div>
                     
                     <button 
                         onClick={togglePrefetch}
                         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                             isPrefetchEnabled ? 'bg-pink-500' : 'bg-slate-700'
                         }`}
                     >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                             isPrefetchEnabled ? 'translate-x-8' : 'translate-x-1'
                         }`}/>
                     </button>
                 </div>

                 <button 
                     onClick={executeCheckout}
                     disabled={isCheckingOut || checkoutComplete}
                     className={`w-full py-4 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors shadow-lg ${
                         checkoutComplete ? 'bg-slate-800 text-pink-500 border-pink-900 cursor-not-allowed' :
                         isCheckingOut ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-pink-600 hover:bg-pink-500 text-white border-pink-500 shadow-[0_0_20px_rgba(244,114,182,0.3)]'
                     }`}
                 >
                     {isCheckingOut ? 'Processing Transaction...' : checkoutComplete ? 'Checkout Completed' : "Confirm VIP Ticket Purchase"}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#040203] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0 z-10">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Browser Network Log</span>
                 {isCheckingOut && <span className="text-pink-400 font-black animate-pulse">FETCHING...</span>}
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
                       log.type === 'SYS' ? 'text-pink-300 font-bold' : 'text-slate-400'
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">UX & Loading Timeline</span>
                      <span className="text-xs text-white font-bold">App Viewport Simulation</span>
                  </div>
                  {checkoutComplete && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                          totalTime <= 2.0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-rose-950 text-rose-400 border border-rose-500/50'
                      }`}>
                          TTI: {totalTime.toFixed(1)}s
                      </span>
                  )}
              </div>

              {/* Viewport Area */}
              <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
                  
                  {activeStep === 0 || activeStep === 1 ? (
                      // Checkout View
                      <div className="p-6 flex flex-col h-full animate-fade-in-up">
                          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 shadow-lg mt-10">
                              <span className="text-sm font-bold text-white block mb-1">VIP Weekend Pass</span>
                              <span className="text-xs text-slate-400 block mb-4">$399.00 USD</span>
                              <div className="h-px bg-slate-800 mb-4"></div>
                              <div className="w-full h-10 bg-slate-800 rounded animate-pulse mb-3"></div>
                              <div className="w-full h-10 bg-slate-800 rounded animate-pulse"></div>
                          </div>
                      </div>
                  ) : activeStep >= 2 && activeStep < 4 && !isPrefetchEnabled ? (
                      // Legacy API Processing View
                      <div className="p-6 flex flex-col h-full items-center justify-center animate-fade-in-up">
                          <div className="w-12 h-12 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                          <span className="text-white font-bold text-sm">Processing Payment...</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-2 text-center">API Call: 2.0s</span>
                      </div>
                  ) : activeStep >= 2 && activeStep < 4 && isPrefetchEnabled ? (
                      // ML Prefetching View (Split Screen)
                      <div className="flex flex-col h-full">
                          <div className="flex-1 flex flex-col items-center justify-center border-b border-slate-800">
                              <div className="w-12 h-12 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                              <span className="text-white font-bold text-sm">Processing Payment...</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-2 text-center">Main Thread (Blocked)</span>
                          </div>
                          
                          <div className="flex-1 bg-pink-950/20 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                              <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest absolute top-2 left-2">Background Thread</span>
                              <span className="text-4xl mb-3 z-10 animate-bounce">📦</span>
                              <span className="text-white font-bold text-xs text-center z-10">ML Model Predicted Next Page</span>
                              <span className="text-[9px] text-pink-300 font-mono mt-1 text-center z-10">Fetching QR assets to Service Worker Cache...</span>
                              
                              <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800">
                                  <div className={`h-full bg-pink-500 transition-all ease-linear ${activeStep === 3 ? 'w-full duration-500' : 'w-[10%] duration-[1000ms]'}`}></div>
                              </div>
                          </div>
                      </div>
                  ) : activeStep === 4 && !isPrefetchEnabled ? (
                      // Legacy Waterfall White Screen
                      <div className="p-6 flex flex-col h-full items-center justify-center animate-fade-in-up bg-white">
                          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
                          <span className="text-[10px] text-slate-400 font-mono mt-4">Waiting 3.0s for slow 3G...</span>
                      </div>
                  ) : (
                      // Final Rendered Page (My Tickets)
                      <div className="p-6 flex flex-col h-full animate-fade-in-up bg-slate-950 items-center justify-center">
                          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">Entry Pass</span>
                              <span className="text-lg font-black text-black mb-4">VIP Weekend</span>
                              
                              <div className="w-48 h-48 bg-black p-2 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }}></div>
                                  <div className="w-[80%] h-[80%] bg-white absolute"></div>
                              </div>
                              
                              <span className="text-[10px] text-slate-500 font-mono">TKT-8942-XXXX</span>
                          </div>
                      </div>
                  )}

                  {/* Overlays */}
                  {checkoutComplete && !isPrefetchEnabled && (
                      <div className="absolute inset-x-4 bottom-4 bg-rose-950/90 backdrop-blur-sm rounded-xl border border-rose-500 flex items-center p-3 text-white z-30 animate-fade-in-up shadow-2xl">
                          <span className="text-2xl mr-3">🐌</span>
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">Poor UX: Waterfall Delay</span>
                              <span className="text-[9px] text-rose-200 mt-0.5">User stared at a white screen for 3 seconds while assets loaded sequentially.</span>
                          </div>
                      </div>
                  )}
                  
                  {checkoutComplete && isPrefetchEnabled && (
                      <div className="absolute inset-x-4 bottom-4 bg-emerald-950/90 backdrop-blur-sm rounded-xl border border-emerald-500 flex items-center p-3 text-white z-30 animate-fade-in-up shadow-2xl">
                          <span className="text-2xl mr-3">⚡</span>
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">Instant Render (0ms)</span>
                              <span className="text-[9px] text-emerald-200 mt-0.5">Assets were already cached in background during payment processing.</span>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#12050b] p-4 rounded-xl border border-pink-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-pink-400 uppercase block mb-1">Service Worker Prefetching:</span>
               With Prefetch OFF, click Confirm. The API takes 2s to process the payment. Then the browser routes to the Tickets page and requests the QR code assets over slow 3G (taking another 3s). Total Time to Interactive = 5.0s, with a jarring white screen.<br/><br/>Toggle <span className="text-pink-400 font-bold bg-slate-800 px-1 rounded">Service Worker</span> ON. When you click Confirm, the frontend ML model predicts you will need the Tickets page. While the 2s payment API is blocking the main thread, the Service Worker quietly fetches the heavy QR code assets in the background. When the API finishes, the page transitions in 0ms directly from cache. Total Time = 2.0s.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveAssetPrefetching;
