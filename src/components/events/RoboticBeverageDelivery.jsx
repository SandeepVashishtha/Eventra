/* eslint-disable */
import React, { useState, useEffect } from 'react';

const RoboticBeverageDelivery = () => {
  const [deliveryState, setDeliveryState] = useState('idle'); // idle, ordered, navigating, delivered
  const [robotPos, setRobotPos] = useState({ x: 10, y: 80 }); // Bar coordinates
  const [targetPos, setTargetPos] = useState({ x: 80, y: 20 }); // VIP Table coordinates
  const [obstacleDetected, setObstacleDetected] = useState(false);
  
  const [roboticLog, setRoboticLog] = useState([
    { id: 1, time: '22:00:00', type: 'SYS', msg: 'Quadruped Unit BD-07 docked at Main Bar. Battery: 94%.' }
  ]);

  useEffect(() => {
    let loop;
    if (deliveryState === 'navigating') {
      loop = setInterval(() => {
        setRobotPos(prev => {
          // Calculate vector to target
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 2) {
            clearInterval(loop);
            setDeliveryState('delivered');
            addLog('SUCCESS', 'Unit BD-07 reached VIP Table 4. Payload unlocked.');
            return targetPos;
          }

          // Random obstacle logic (crowd moving)
          if (Math.random() > 0.85 && dist > 15) {
            setObstacleDetected(true);
            addLog('WARN', 'Dynamic crowd obstacle detected. LiDAR recalculating path...');
            setTimeout(() => setObstacleDetected(false), 800);
            return prev; // Stop moving briefly
          }

          // Move towards target
          const speed = 2.5;
          return {
            x: prev.x + (dx / dist) * speed,
            y: prev.y + (dy / dist) * speed
          };
        });
      }, 150);
    }
    return () => clearInterval(loop);
  }, [deliveryState, targetPos]);

  const triggerOrder = () => {
    if (deliveryState === 'idle' || deliveryState === 'delivered') {
      setRobotPos({ x: 10, y: 80 }); // Reset to bar
      setDeliveryState('ordered');
      addLog('POS', 'Order #8841 received from VIP App: 1x Dom Pérignon, 4x Glasses.');
      
      setTimeout(() => {
        setDeliveryState('navigating');
        addLog('BOT', 'Payload secured. Engaging LiDAR autonav to VIP Table 4.');
      }, 1500);
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*99).toString().padStart(2,'0')}`;
    setRoboticLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: POS / Robotics Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🦾</span> Autonomous Robotics API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Quadruped Beverage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Delivery System</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            VIP attendees pay thousands of dollars for table service, but still have to wait 30 minutes for a human server to physically fight their way through a densely packed crowd. Eventra solves this by integrating the POS software directly with Boston Dynamics quadruped robot APIs. When a VIP orders a drink, a robotic dog instantly secures the payload and navigates autonomously from the bar to the specific table using real-time LiDAR crowd avoidance.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🐕</span> Fleet Management Console
               </h3>
               
               <button 
                 onClick={triggerOrder}
                 disabled={deliveryState === 'ordered' || deliveryState === 'navigating'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   deliveryState === 'ordered' || deliveryState === 'navigating' ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed' :
                   'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                 }`}
               >
                 {deliveryState === 'ordered' ? 'Preparing Payload...' : deliveryState === 'navigating' ? 'Unit In Transit...' : 'Simulate VIP POS Order'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Robot Telemetry */}
               <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 relative overflow-hidden flex flex-col justify-center">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Unit BD-07 Telemetry</span>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-white">Status:</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                     deliveryState === 'navigating' ? 'bg-orange-900/50 text-orange-400 border border-orange-500/50 animate-pulse' : 
                     deliveryState === 'delivered' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                   }`}>
                     {deliveryState.toUpperCase()}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-white">Battery:</span>
                   <div className="flex items-center">
                     <div className="w-16 h-2 bg-neutral-800 rounded mr-2 overflow-hidden">
                       <div className="w-[94%] h-full bg-emerald-500"></div>
                     </div>
                     <span className="text-xs font-mono text-emerald-500">94%</span>
                   </div>
                 </div>
               </div>

               {/* LiDAR Status */}
               <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 obstacleDetected ? 'bg-red-950/40 border-red-500/50 shadow-inner' : 'bg-neutral-900 border-neutral-800'
               }`}>
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">LiDAR Navigation</span>
                 <div className="flex flex-col">
                   {obstacleDetected ? (
                     <>
                       <span className="text-xl font-black font-mono text-red-500 leading-tight animate-bounce">
                         OBSTACLE
                       </span>
                       <span className="text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                         Recalculating Path...
                       </span>
                     </>
                   ) : deliveryState === 'navigating' ? (
                     <>
                       <span className="text-xl font-black font-mono text-emerald-400 leading-tight">
                         CLEAR
                       </span>
                       <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-widest animate-pulse">
                         Tracking Waypoints
                       </span>
                     </>
                   ) : (
                     <span className="text-xl font-black font-mono text-neutral-600 leading-tight">
                       STANDBY
                     </span>
                   )}
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Robotics API Feed</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {roboticLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'WARN' ? 'text-red-400 font-bold' :
                       log.type === 'POS' ? 'text-blue-400' :
                       log.type === 'BOT' ? 'text-orange-400' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: LiDAR Mapping Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-[2rem] border-8 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Context Header */}
            <div className="absolute top-0 inset-x-0 p-3 flex justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
              <span className="bg-black text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                LiDAR Mapping
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                BD-07 VISUALIZER
              </span>
            </div>

            <div className="flex-1 relative flex flex-col bg-[#051014] overflow-hidden p-6">
               
               {/* Synthetic 3D Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:15px_15px] perspective-500 transform rotateX-60 origin-bottom scale-150"></div>

               {/* Map Area */}
               <div className="relative w-full h-full border border-cyan-900/30 bg-cyan-900/10 rounded-lg overflow-hidden backdrop-blur-sm z-10">
                 
                 {/* Main Bar (Start) */}
                 <div className="absolute bottom-4 left-4 w-12 h-6 bg-blue-900/50 border border-blue-500/50 rounded flex items-center justify-center">
                   <span className="text-[8px] text-blue-300 font-black uppercase">BAR</span>
                 </div>

                 {/* VIP Tables (Targets) */}
                 <div className="absolute top-8 right-8 w-16 h-10 border border-yellow-500/50 bg-yellow-900/20 rounded flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                   <span className="text-[8px] text-yellow-500 font-black uppercase">VIP TBL 4</span>
                 </div>
                 
                 {/* Decorative Crowd / Obstacles */}
                 {[...Array(12)].map((_, i) => (
                   <div 
                     key={i} 
                     className="absolute w-2 h-2 bg-rose-500/40 rounded-full blur-[1px]"
                     style={{
                       left: `${20 + Math.random() * 50}%`,
                       top: `${30 + Math.random() * 40}%`
                     }}
                   ></div>
                 ))}

                 {/* The Robotic Dog Marker */}
                 <div 
                   className="absolute w-4 h-4 -ml-2 -mt-2 z-20 transition-all duration-150 ease-linear"
                   style={{ left: `${robotPos.x}%`, top: `${robotPos.y}%` }}
                 >
                   <div className="w-full h-full bg-orange-500 rounded-sm shadow-[0_0_10px_rgba(249,115,22,1)] flex items-center justify-center">
                     {/* Scanner beam */}
                     {deliveryState === 'navigating' && (
                       <div className={`absolute -inset-12 border border-cyan-400/30 rounded-full animate-ping ${obstacleDetected ? 'border-red-500/50 bg-red-500/20' : 'bg-cyan-500/10'}`}></div>
                     )}
                   </div>
                 </div>
                 
                 {/* Projected Path Line */}
                 {deliveryState === 'navigating' && !obstacleDetected && (
                   <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40">
                     <line 
                       x1={`${robotPos.x}%`} y1={`${robotPos.y}%`} 
                       x2={`${targetPos.x}%`} y2={`${targetPos.y}%`} 
                       stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2"
                     />
                   </svg>
                 )}
                 
                 {/* Obstacle Indicator */}
                 {obstacleDetected && (
                   <div className="absolute bg-red-500/20 border border-red-500/50 rounded-full animate-pulse z-20"
                     style={{
                       left: `${robotPos.x + 5}%`,
                       top: `${robotPos.y - 15}%`,
                       width: '30px', height: '30px'
                     }}
                   ></div>
                 )}

               </div>

               {/* Bottom UI Overlay */}
               {deliveryState === 'ordered' && (
                 <div className="absolute inset-0 bg-black/80 z-30 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                   <div className="text-center p-6 border-2 border-orange-500/50 rounded-xl bg-orange-950/80 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                     <span className="text-4xl mb-2 block">🍾</span>
                     <h3 className="text-orange-400 font-black uppercase tracking-widest text-lg">Payload Locked</h3>
                     <p className="text-[10px] text-orange-200 mt-2 font-mono">Loading Autonav Route...</p>
                   </div>
                 </div>
               )}
               
               {deliveryState === 'delivered' && (
                 <div className="absolute inset-0 bg-emerald-950/80 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in border-4 border-emerald-500/50 rounded-lg">
                   <span className="text-5xl mb-4">🥂</span>
                   <h3 className="text-emerald-400 font-black uppercase tracking-widest text-2xl">Arrived</h3>
                   <p className="text-[10px] text-emerald-200 mt-2 font-mono bg-emerald-900/50 px-3 py-1 rounded">VIP Table 4 - Payload Released</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoboticBeverageDelivery;
