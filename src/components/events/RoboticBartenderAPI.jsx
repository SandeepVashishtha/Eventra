import React, { useState } from 'react';

const RoboticBartenderAPI = () => {
  const [orderState, setOrderState] = useState('menu'); // menu, ordering, queued, mixing, ready
  const [activeDrink, setActiveDrink] = useState(null);
  
  const [queuePos, setQueuePos] = useState(0);
  const [robotStatus, setRobotStatus] = useState('Idle');

  const drinks = [
    { id: 'd1', name: 'Cyberpunk Citrus', mix: ['Vodka 1.5oz', 'Blue Curacao 0.5oz', 'Lemon 1oz'], color: 'from-cyan-400 to-blue-600' },
    { id: 'd2', name: 'Neural Negroni', mix: ['Gin 1oz', 'Campari 1oz', 'Sweet Vermouth 1oz'], color: 'from-rose-500 to-orange-600' },
    { id: 'd3', name: 'Silicon Smash', mix: ['Bourbon 2oz', 'Mint 4 leaves', 'Simple Syrup 0.5oz'], color: 'from-emerald-400 to-teal-600' }
  ];

  const placeOrder = (drink) => {
    setActiveDrink(drink);
    setOrderState('ordering');
    
    // API Handshake Simulation
    setTimeout(() => {
      setOrderState('queued');
      setQueuePos(3); // Start at position 3
      
      // Simulate Queue moving
      let currentPos = 3;
      const qInterval = setInterval(() => {
        currentPos--;
        setQueuePos(currentPos);
        
        if (currentPos === 0) {
          clearInterval(qInterval);
          setOrderState('mixing');
          setRobotStatus('Executing Mixology Protocol');
          
          setTimeout(() => {
            setOrderState('ready');
            setRobotStatus('Awaiting Pickup');
            
            setTimeout(() => {
              setOrderState('menu');
              setActiveDrink(null);
              setRobotStatus('Idle');
            }, 5000); // Reset after 5s of being ready
            
          }, 4000); // 4s to mix
        }
      }, 2000); // 2s per queue spot
      
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Robot Dashboard (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🍸</span> Premium Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Autonomous Robotic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Bartender Hook</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Solve acute labor shortages and eliminate 30-minute lines at VIP networking lounges. Eventra provides a dedicated API that interfaces directly with robotic bartender arms (e.g., Makr Shakr). Attendees order custom drinks via the app, routing precise mixology instructions directly to the robot's hardware queue and receiving a push notification when it's ready.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-purple-500 text-lg mr-2">🦾</span> Hardware Interface
               </h3>
               <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-mono">API: CONNECTED</span>
             </div>

             {/* Robot Arm Visualization */}
             <div className="flex-1 relative flex flex-col items-center justify-center">
               
               <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20">
                 {/* Decorative background circles */}
                 <div className="w-64 h-64 border border-slate-700 rounded-full"></div>
                 <div className="absolute w-48 h-48 border border-slate-600 rounded-full"></div>
                 <div className="absolute w-32 h-32 border border-slate-500 rounded-full"></div>
               </div>

               <div className="relative z-10 flex flex-col items-center">
                 {/* Fake Robot Base */}
                 <div className="w-32 h-8 bg-slate-800 rounded-t-xl border border-slate-700 relative overflow-hidden mb-1">
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-purple-500"></div>
                 </div>
                 {/* Fake Robot Arm */}
                 <div className={`w-8 bg-slate-700 border-x border-t border-slate-600 rounded-t-lg origin-bottom transition-all duration-[2000ms] ease-in-out ${
                   orderState === 'mixing' ? 'h-40 rotate-12' : 'h-32 rotate-0'
                 }`}>
                   {/* Joint */}
                   <div className="w-12 h-12 bg-slate-800 rounded-full absolute -top-6 -left-2 border-4 border-slate-600 flex items-center justify-center">
                     <div className={`w-3 h-3 rounded-full ${orderState === 'mixing' ? 'bg-purple-500 animate-pulse' : 'bg-slate-500'}`}></div>
                   </div>
                   {/* Forearm */}
                   <div className={`absolute -top-32 left-1 w-6 bg-slate-600 rounded-t border-x border-t border-slate-500 origin-bottom transition-all duration-[1000ms] ${
                     orderState === 'mixing' ? 'h-32 -rotate-45' : 'h-24 rotate-0'
                   }`}>
                     {/* Shaker */}
                     <div className="absolute -top-12 -left-3 w-12 h-16 bg-slate-300 rounded-b-xl border border-slate-400 opacity-80 backdrop-blur">
                        {orderState === 'mixing' && activeDrink && (
                          <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t ${activeDrink.color} rounded-b-xl animate-[wave_1s_infinite]`} style={{ height: '60%' }}></div>
                        )}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="mt-8 bg-black/50 border border-slate-800 px-6 py-3 rounded-xl w-full max-w-sm flex justify-between items-center z-10">
                 <div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Current Instruction</span>
                   <span className={`font-mono text-xs ${orderState === 'mixing' ? 'text-purple-400' : 'text-slate-300'}`}>{robotStatus}</span>
                 </div>
                 {orderState === 'mixing' && (
                   <div className="flex space-x-1">
                     <div className="w-1 h-3 bg-purple-500 animate-pulse"></div>
                     <div className="w-1 h-5 bg-purple-500 animate-pulse animation-delay-150"></div>
                     <div className="w-1 h-2 bg-purple-500 animate-pulse animation-delay-300"></div>
                   </div>
                 )}
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Mobile App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-slate-900 text-xs font-bold bg-slate-50 z-20">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">
              
              <div className="p-6 pb-2">
                <h2 className="text-2xl font-black text-slate-900">VIP Lounge Bar</h2>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mt-1">Automated Mixology</p>
              </div>

              {orderState === 'menu' ? (
                // Drink Menu
                <div className="flex-1 p-6 pt-2 overflow-y-auto space-y-4 animate-fade-in">
                  {drinks.map(drink => (
                    <div key={drink.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-900">{drink.name}</h4>
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${drink.color} shadow-sm`}></div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mb-4 bg-slate-50 p-2 rounded">
                        {drink.mix.join(' • ')}
                      </div>
                      <button 
                        onClick={() => placeOrder(drink)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-widest transition"
                      >
                        Order Drink
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // Order Status Overlay
                <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  
                  {orderState === 'ordering' && (
                    <>
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Transmitting Payload</h3>
                      <p className="text-xs text-slate-500 font-mono">Routing recipe to hardware API...</p>
                    </>
                  )}

                  {orderState === 'queued' && (
                    <>
                      <div className="w-24 h-24 bg-purple-100 rounded-full flex flex-col items-center justify-center mb-6 border border-purple-200">
                        <span className="text-3xl font-black text-purple-600">{queuePos}</span>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">In Queue</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Order Confirmed</h3>
                      <p className="text-xs text-slate-500">The robot is currently mixing drinks for other VIPs. We'll notify you when it's your turn.</p>
                    </>
                  )}
                  
                  {orderState === 'mixing' && (
                    <>
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 relative`}>
                        <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-[6px] border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${activeDrink?.color} shadow-inner`}></div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Mixing Now</h3>
                      <p className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded">Executing: {activeDrink?.name}</p>
                    </>
                  )}

                  {orderState === 'ready' && (
                    <>
                      <div className="w-32 h-32 bg-emerald-100 rounded-full flex flex-col items-center justify-center mb-6 border-4 border-emerald-50 shadow-lg animate-bounce">
                        <span className="text-5xl">🍸</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2">Drink Ready!</h3>
                      <p className="text-sm text-slate-500 mb-8">Please proceed to Bay 3 to pick up your {activeDrink?.name}.</p>
                      
                      {/* Fake Push Notification Banner simulating OS level alert */}
                      <div className="absolute top-12 inset-x-4 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 flex items-start text-left animate-fade-in-up">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-black mr-3 flex-shrink-0">E</div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">Eventra • Now</span>
                          <p className="text-xs text-slate-600 mt-1">Your drink is ready for pickup at the robot bar!</p>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { clip-path: polygon(0 40%, 100% 60%, 100% 100%, 0 100%); }
          50% { clip-path: polygon(0 60%, 100% 40%, 100% 100%, 0 100%); }
        }
      `}} />
    </div>
  );
};

export default RoboticBartenderAPI;
