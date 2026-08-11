import React, { useState, useEffect } from 'react';

const CVPerimeterSecurity = () => {
  const [systemState, setSystemState] = useState('monitoring'); // monitoring, breach_detected, dispatching, resolved
  
  // Camera Feeds
  const [cameras, setCameras] = useState([
    { id: 'CAM-01', sector: 'North Fence', status: 'clear' },
    { id: 'CAM-02', sector: 'East Gate', status: 'clear' },
    { id: 'CAM-03', sector: 'South Woods', status: 'clear' },
    { id: 'CAM-04', sector: 'West Perimeter', status: 'clear' }
  ]);
  
  const [breachData, setBreachData] = useState(null);
  
  // Target coordinates for tracking simulation
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let trackingInterval;
    
    if (systemState === 'breach_detected' || systemState === 'dispatching') {
      trackingInterval = setInterval(() => {
        // Simulate target moving across the screen (climbing fence then running)
        setTargetPos(prev => {
          const moveX = prev.x > 80 ? prev.x : prev.x + (Math.random() * 2);
          const moveY = prev.y > 80 ? prev.y : prev.y + (Math.random() * 2);
          return { x: moveX, y: moveY };
        });
      }, 500);
    }
    
    return () => clearInterval(trackingInterval);
  }, [systemState]);

  const simulateBreach = () => {
    setSystemState('breach_detected');
    setTargetPos({ x: 20, y: 70 }); // Start near fence bottom
    
    setCameras(prev => prev.map(cam => 
      cam.id === 'CAM-03' ? { ...cam, status: 'breach' } : cam
    ));
    
    setBreachData({
      camera: 'CAM-03',
      sector: 'South Woods',
      confidence: '98.7%',
      type: 'KINETIC_FENCE_CLIMB',
      time: '23:41:02'
    });
    
    // Auto dispatch after 3 seconds
    setTimeout(() => {
      setSystemState('dispatching');
      
      // Auto resolve after 8 more seconds
      setTimeout(() => {
        resolveBreach();
      }, 8000);
      
    }, 3000);
  };

  const resolveBreach = () => {
    setSystemState('resolved');
    setCameras(prev => prev.map(cam => ({ ...cam, status: 'clear' })));
    setBreachData(null);
    
    setTimeout(() => {
      setSystemState('monitoring');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Master Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-red-900/50 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">👁️</span> Edge AI Security
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Computer Vision <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Perimeter Breach Detection</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            It is impossible for physical guards to monitor every inch of a 5-mile festival fence line in the dark. Eventra integrates directly with perimeter PTZ cameras, utilizing an edge-AI computer vision model trained to detect the kinetic motion of a human climbing a fence. Upon detection, it instantly calculates GPS coordinates and dispatches the nearest security ATV, neutralizing the threat immediately.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-red-500 text-lg mr-2">🛡️</span> Global Security Matrix
               </h3>
               
               <button 
                 onClick={systemState === 'monitoring' ? simulateBreach : undefined}
                 disabled={systemState !== 'monitoring'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   systemState !== 'monitoring' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                 }`}
               >
                 {systemState !== 'monitoring' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
                 {systemState === 'monitoring' ? 'Simulate Fence Jump' : 
                  systemState === 'resolved' ? 'Threat Neutralized' : 'Breach Protocol Active'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4">
               
               <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                 systemState === 'monitoring' || systemState === 'resolved' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30 animate-pulse'
               }`}>
                 <div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Perimeter Integrity</span>
                   <span className={`text-2xl font-black uppercase tracking-widest ${
                     systemState === 'monitoring' || systemState === 'resolved' ? 'text-emerald-400' : 'text-red-500'
                   }`}>
                     {systemState === 'monitoring' ? 'SECURE' : systemState === 'resolved' ? 'RESTORED' : 'COMPROMISED'}
                   </span>
                 </div>
                 <div className="text-3xl">{systemState === 'monitoring' || systemState === 'resolved' ? '🔒' : '⚠️'}</div>
               </div>

               <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Active CV Nodes</span>
                 <span className="text-2xl font-black text-white font-mono">
                   142 <span className="text-sm text-slate-500">PTZ Cameras</span>
                 </span>
               </div>

             </div>

             <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">AI Vision Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1 text-slate-400 pr-2">
                 {systemState === 'monitoring' && (
                   <div className="text-emerald-400/70">
                     <p>&gt; Scanning all sectors... No anomalies detected.</p>
                     <p>&gt; Confidence threshold: 95%.</p>
                   </div>
                 )}
                 {systemState === 'breach_detected' && breachData && (
                   <div className="text-red-400 font-bold space-y-2">
                     <p className="bg-red-900/40 p-1 border border-red-500/50">&gt; CRITICAL ALERT: KINETIC MATCH FOUND</p>
                     <p>&gt; Source: {breachData.camera} ({breachData.sector})</p>
                     <p>&gt; Match Type: {breachData.type}</p>
                     <p>&gt; Confidence: {breachData.confidence}</p>
                     <p>&gt; Calculating threat trajectory...</p>
                   </div>
                 )}
                 {systemState === 'dispatching' && (
                   <div className="text-orange-400 font-bold mt-2">
                     <p>&gt; Trajectory locked.</p>
                     <p>&gt; Auto-dispatching ATV Unit 4 to intercept coordinates.</p>
                     <p>&gt; Sending live feed to mobile patrol units...</p>
                   </div>
                 )}
                 {systemState === 'resolved' && (
                   <div className="text-emerald-400 font-bold mt-2">
                     <p>&gt; ATV Unit 4 reports suspect apprehended.</p>
                     <p>&gt; Perimeter secured. Resuming standard sweeps.</p>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Security Staff App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className={`w-full bg-black rounded-[2rem] border-[8px] shadow-2xl relative flex flex-col h-[600px] overflow-hidden transition-colors duration-500 ${
            systemState === 'monitoring' || systemState === 'resolved' ? 'border-slate-900' : 'border-red-900 shadow-[0_0_50px_rgba(220,38,38,0.3)]'
          }`}>
            
            {/* App Header */}
            <div className={`absolute top-0 inset-x-0 p-4 flex justify-between items-center z-30 transition-colors duration-500 ${
              systemState === 'monitoring' || systemState === 'resolved' ? 'bg-gradient-to-b from-black to-transparent' : 'bg-red-900'
            }`}>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                Patrol Unit 4
              </span>
              {systemState === 'breach_detected' || systemState === 'dispatching' ? (
                <span className="text-[10px] text-white font-mono bg-red-600 px-2 py-0.5 rounded border border-red-400 animate-pulse">
                  INTERCEPT ORDERS
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">
                  Standing By
                </span>
              )}
            </div>

            {/* AI Camera Feed Simulator */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col justify-center">
              
              {systemState === 'monitoring' || systemState === 'resolved' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                  <div className="grid grid-cols-2 gap-1 w-full h-full p-1 opacity-40 grayscale filter blur-[1px]">
                    {cameras.map((cam, i) => (
                      <div key={i} className="bg-[url('https://images.unsplash.com/photo-1555529733-0e67056058bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')] bg-cover bg-center border border-slate-800 relative">
                         <span className="absolute top-1 left-1 text-[8px] bg-black/70 text-white px-1 font-mono">{cam.id}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                     <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">All Sectors Clear</span>
                  </div>
                </div>
              ) : (
                // Breach View (Isolated Camera Feed)
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529733-0e67056058bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale contrast-125">
                  
                  {/* Night vision green tint overlay */}
                  <div className="absolute inset-0 bg-green-900/20 mix-blend-multiply pointer-events-none"></div>
                  
                  {/* Static scanlines */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiAvPgo8L3N2Zz4=')]"></div>

                  {/* UI Overlay */}
                  <div className="absolute top-16 left-4 text-green-400 font-mono text-[10px] space-y-1">
                    <p>REC 🔴</p>
                    <p>CAM-03 (SOUTH WOODS)</p>
                    <p>ZOOM: 14x</p>
                  </div>

                  {/* The Target Box (AI Vision Bounding Box) */}
                  <div 
                    className="absolute border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.8)] flex flex-col justify-end transition-all duration-300 ease-linear"
                    style={{ 
                      width: '40px', height: '80px',
                      left: \`\${targetPos.x}%\`, 
                      top: \`\${targetPos.y}%\`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="absolute -top-4 left-0 text-[8px] bg-red-600 text-white font-mono px-1 whitespace-nowrap">HUMAN (98%)</span>
                    
                    {/* Crosshairs */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                       <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white"></div>
                       <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white"></div>
                       <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white"></div>
                       <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white"></div>
                    </div>
                  </div>
                  
                  {/* Trajectory Prediction Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                    <line 
                      x1={\`\${targetPos.x}%\`} y1={\`\${targetPos.y}%\`} 
                      x2={\`\${targetPos.x + 20}%\`} y2={\`\${targetPos.y + 20}%\`} 
                      stroke="red" strokeWidth="1" strokeDasharray="4 2" 
                    />
                  </svg>
                  
                </div>
              )}

            </div>

            {/* Bottom App Actions */}
            <div className={`p-4 border-t transition-colors duration-500 ${
              systemState === 'monitoring' || systemState === 'resolved' ? 'bg-slate-900 border-slate-800' : 'bg-red-950 border-red-900'
            }`}>
              {systemState === 'monitoring' || systemState === 'resolved' ? (
                <div className="flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-widest py-2">
                  <span>GPS Active</span>
                  <span>Battery 84%</span>
                </div>
              ) : (
                <button 
                  onClick={resolveBreach}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                >
                  Mark Apprehended
                </button>
              )}
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default CVPerimeterSecurity;
