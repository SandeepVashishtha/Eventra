/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VirtualQueueAlgorithm = () => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estWaitMins, setEstWaitMins] = useState(0);
  const [posVelocity, setPosVelocity] = useState(15); // Checkouts per minute
  const [totalInQueue, setTotalInQueue] = useState(452);
  
  const [notificationSent, setNotificationSent] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'Virtual Queueing Engine Online. Little\'s Law algorithm active.' }
  ]);

  // Simulate POS Velocity fluctuations and queue movement
  useEffect(() => {
      let interval;
      
      interval = setInterval(() => {
          // Fluctuate POS checkout speed
          setPosVelocity(prev => {
              const shift = Math.random() > 0.5 ? 1 : -1;
              return Math.max(8, Math.min(25, prev + shift));
          });
          
          // People joining the queue globally
          if (Math.random() > 0.3) {
              setTotalInQueue(prev => prev + Math.floor(Math.random() * 5));
          }

          // Queue movement (people checking out)
          const checkoutsThisTick = Math.max(1, Math.floor(posVelocity / 6)); // simulate every 10s tick
          setTotalInQueue(prev => Math.max(0, prev - checkoutsThisTick));
          
          if (isInQueue && queuePosition > 0) {
              setQueuePosition(prev => {
                  const newPos = Math.max(0, prev - checkoutsThisTick);
                  
                  // Recalculate wait time based on Little's Law: Wait = Position / Velocity
                  const newWait = Math.ceil(newPos / posVelocity);
                  setEstWaitMins(newWait);
                  
                  if (newWait <= 10 && !notificationSent && newPos > 0) {
                      setNotificationSent(true);
                      addLog('CRIT', `Queue position [${newPos}]. Est wait <10m. Triggering Push Notification to user device.`);
                  }
                  
                  if (newPos === 0) {
                      addLog('SUCCESS', 'User reached front of queue. Transaction window open.');
                  }
                  
                  return newPos;
              });
          }

      }, 1000); // Fast simulation
      
      return () => clearInterval(interval);
  }, [isInQueue, queuePosition, posVelocity, notificationSent]);

  const toggleQueue = () => {
      if (!isInQueue) {
          setIsInQueue(true);
          setQueuePosition(totalInQueue);
          setEstWaitMins(Math.ceil(totalInQueue / posVelocity));
          setNotificationSent(false);
          addLog('ACTION', `User joined queue at position ${totalInQueue}. Wait algorithm initialized.`);
      } else {
          setIsInQueue(false);
          setQueuePosition(0);
          setEstWaitMins(0);
          addLog('WARN', 'User abandoned the virtual queue.');
      }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⏱️</span> Algorithms & State Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Virtual Queueing with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-teal-400">Dynamic Wait Estimation</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees waste hours standing in massive physical lines for exclusive merch drops, causing dangerous crowd congestion. Eventra solves this by building a Virtual Queue UI. Attendees tap to join from anywhere in the festival. A backend algorithm uses Queueing Theory (Little's Law) to constantly recalculate their estimated wait time based on the live checkout velocity at the POS registers. The app automatically pushes a notification when it is their 10-minute window to walk up.
          </p>

          <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-indigo-500 text-lg mr-2">🎛️</span> Backend Queue Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-500">
                     GLOBAL_QUEUE: <span className="text-white font-bold">{totalInQueue}</span>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Velocity Metric */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center">
                   <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3 block border-b border-slate-800 pb-2 flex justify-between">
                       <span>Live POS Checkout Velocity</span>
                       <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                   </span>
                   <div className="flex items-end">
                       <span className="text-4xl font-black font-mono leading-none text-indigo-400 transition-all duration-300">
                           {posVelocity}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 ml-2 pb-1 uppercase">Txns / Min</span>
                   </div>
               </div>

               {/* Algorithm Visual */}
               <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-center text-[9px] font-mono text-slate-400 relative overflow-hidden">
                   <span className="text-slate-500 font-bold uppercase tracking-widest mb-2 block border-b border-slate-800 pb-2">
                       Queueing Algorithm
                   </span>
                   <div className="space-y-1 z-10">
                       <div><span className="text-pink-400">let</span> WaitTime =</div>
                       <div className="ml-4">QueuePosition / POSVelocity</div>
                       {isInQueue && (
                           <div className="mt-2 text-indigo-300 bg-indigo-900/30 p-1 border border-indigo-500/20 rounded">
                               = {queuePosition} / {posVelocity} ≈ {estWaitMins}m
                           </div>
                       )}
                   </div>
                   <div className="absolute -right-4 -bottom-4 text-6xl opacity-5">🧮</div>
               </div>

             </div>
             
             {/* System Log */}
             <div className="flex-1 bg-[#05080d] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Queue Orchestrator Logs</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-indigo-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-white font-bold bg-pink-600 px-1 rounded-sm' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
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
          
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile App Visualizer */}
            <div className={`w-full bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans mb-6`}>
              
              {/* iPhone Notch Simulator */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-slate-800 rounded-b-xl z-20"></div>
              
              {/* Simulated Push Notification */}
              {notificationSent && queuePosition > 0 && (
                  <div className="absolute top-8 left-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl z-30 animate-fade-in-down flex items-start">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs mr-3 shrink-0">🎫</div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-white mb-0.5">Your turn is approaching!</span>
                          <span className="text-[10px] text-slate-300 leading-tight">Your estimated wait is under 10 minutes. Please head to the VIP Merch Tent now.</span>
                      </div>
                  </div>
              )}

              {/* App Content */}
              <div className="flex-1 bg-black flex flex-col relative overflow-hidden pt-12 pb-6 px-6">
                  
                  <div className="text-center mb-8">
                      <h2 className="text-white font-black text-xl tracking-tight">VIP Merch Drop</h2>
                      <p className="text-slate-400 text-xs">Official Eventra Store</p>
                  </div>

                  {!isInQueue ? (
                      <div className="flex-1 flex flex-col justify-center items-center">
                          <div className="w-40 h-40 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900/50 mb-8 relative">
                              <div className="text-5xl">🛍️</div>
                              <div className="absolute bottom-4 bg-indigo-600 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-indigo-400">Exclusive</div>
                          </div>
                          
                          <p className="text-slate-300 text-sm text-center mb-8 px-4">
                              Skip the 3-hour physical line. Join the virtual queue and enjoy the festival while you wait.
                          </p>
                          
                          <button 
                              onClick={toggleQueue}
                              className="w-full bg-white text-black font-black text-sm uppercase tracking-widest py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
                          >
                              Join Virtual Queue
                          </button>
                      </div>
                  ) : queuePosition === 0 ? (
                      <div className="flex-1 flex flex-col justify-center items-center animate-fade-in-up">
                          <div className="w-32 h-32 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-5xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                              ✅
                          </div>
                          <h2 className="text-2xl font-black text-white mb-2 text-center">It's Your Turn!</h2>
                          <p className="text-slate-400 text-xs text-center mb-8">Show this screen to the staff at Register 4.</p>
                          
                          <div className="w-full h-32 bg-white rounded-xl mb-6 flex flex-col items-center justify-center">
                              {/* Fake QR code */}
                              <div className="w-20 h-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0zIDNoOHY4SDNWM20yIDJ2NGg0VjVIMW0xMCAwaDh2OEgxM1YzbTIgMnY0aDRWNUgxNW0tMTIgOGg4djhIM3YtOG0yIDJ2NGg0djRINFYxNW0xMC0ydjJoMnYyaC0ydjJoMnYyaDR2LTJoLTJ2LTJoMnYtMmgtNHYtMmgtdm0yIDJ2Mmgydi0yaC0yeiIvPjwvc3ZnPg==')] bg-contain bg-center bg-no-repeat opacity-80"></div>
                          </div>

                          <button 
                              onClick={toggleQueue}
                              className="w-full bg-slate-800 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-full"
                          >
                              Close Session
                          </button>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col justify-center items-center animate-fade-in-up">
                          
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full p-6 text-center mb-6 relative overflow-hidden">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 z-10 relative">Est. Wait Time</span>
                              <div className="flex items-baseline justify-center mb-4 z-10 relative">
                                  <span className={`text-6xl font-black tracking-tighter mr-2 transition-colors duration-500 ${estWaitMins <= 10 ? 'text-indigo-400' : 'text-white'}`}>
                                      {estWaitMins}
                                  </span>
                                  <span className="text-slate-400 font-bold">min</span>
                              </div>
                              
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2 z-10 relative">
                                  <div 
                                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                                      style={{ width: `${Math.max(5, 100 - (estWaitMins * 2))}%` }}
                                  ></div>
                              </div>
                              
                              {/* Background glow when close */}
                              {estWaitMins <= 10 && (
                                  <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                              )}
                          </div>

                          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full p-6 text-center mb-8 flex justify-between items-center">
                              <div className="flex flex-col text-left">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Your Place In Line</span>
                                  <span className="text-2xl font-black text-white font-mono">#{queuePosition}</span>
                              </div>
                              <div className="text-3xl opacity-50">🚶‍♂️</div>
                          </div>
                          
                          <button 
                              onClick={toggleQueue}
                              className="w-full border border-slate-700 text-slate-400 font-bold text-xs uppercase tracking-widest py-3 rounded-full hover:bg-slate-900"
                          >
                              Leave Queue
                          </button>
                      </div>
                  )}
                  
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default VirtualQueueAlgorithm;
