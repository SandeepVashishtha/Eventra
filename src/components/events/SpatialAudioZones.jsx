import React, { useState, useEffect } from 'react';

const SpatialAudioZones = () => {
  const [headTracking, setHeadTracking] = useState(false);
  
  // Simulated User Position & Rotation
  const [userPos, setUserPos] = useState({ x: 50, y: 50 }); // Center of room
  const [headRotation, setHeadRotation] = useState(0); // Degrees (0 is North)
  
  const [audioNodes, setAudioNodes] = useState([
    { id: 'stageA', name: 'Stage A (Tech)', x: 20, y: 20, volume: 0, pan: 0 },
    { id: 'stageB', name: 'Stage B (Design)', x: 80, y: 20, volume: 0, pan: 0 },
    { id: 'podcast', name: 'Podcast Booth', x: 50, y: 80, volume: 0, pan: 0 }
  ]);

  useEffect(() => {
    let interval;
    if (headTracking) {
      interval = setInterval(() => {
        // Simulate wandering around the hall
        setUserPos(prev => ({
          x: Math.max(10, Math.min(90, prev.x + (Math.random() * 4 - 2))),
          y: Math.max(10, Math.min(90, prev.y + (Math.random() * 4 - 2)))
        }));
        
        // Simulate head turning
        setHeadRotation(prev => (prev + (Math.random() * 20 - 10)) % 360);
        
      }, 500);
    }
    return () => clearInterval(interval);
  }, [headTracking]);

  // Calculate Spatial Audio Math
  useEffect(() => {
    if (!headTracking) {
      setAudioNodes(nodes => nodes.map(n => ({...n, volume: 0, pan: 0})));
      return;
    }

    setAudioNodes(nodes => nodes.map(node => {
      // 1. Calculate distance (Volume attenuation)
      const dx = node.x - userPos.x;
      const dy = node.y - userPos.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Inverse square law simulation for volume (max distance ~100)
      let volume = Math.max(0, 100 - (distance * 1.5));
      if (volume < 5) volume = 0; // Cutoff
      
      // 2. Calculate Angle (3D Panning)
      // Angle between user and node
      let angleToNode = (Math.atan2(dy, dx) * 180 / Math.PI) + 90; // +90 to align Y-up
      if (angleToNode < 0) angleToNode += 360;
      
      // Relative angle based on where user's head is looking
      let relativeAngle = (angleToNode - headRotation) % 360;
      if (relativeAngle < 0) relativeAngle += 360;
      
      // Map to pan (-1 to 1)
      // 0 = front, 90 = right (+1), 180 = back, 270 = left (-1)
      let pan = 0;
      if (relativeAngle <= 180) {
        pan = relativeAngle / 90;
        if (pan > 1) pan = 2 - pan; // Map back down from 90 to 180
      } else {
        pan = -((360 - relativeAngle) / 90);
        if (pan < -1) pan = -2 - pan; // Map back up from 270 to 180
      }
      
      return { ...node, volume, pan };
    }));
  }, [userPos, headRotation, headTracking]);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Engine Control (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎧</span> Spatial Computing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Spatially Aware 3D <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Audio Environments</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Standard silent disco headsets lack spatial awareness, disconnecting attendees from the physical environment. Eventra implements a Web Audio API engine utilizing head-tracking data from modern earbuds (like AirPods Pro). As attendees walk the floor, the audio dynamically shifts in 3D space, anchoring the speaker's voice to the physical location of the stage.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Web Audio API Telemetry</h3>
               
               <button 
                 onClick={() => setHeadTracking(!headTracking)}
                 className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center ${
                   headTracking ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                 }`}
               >
                 {headTracking && <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 animate-pulse"></span>}
                 {headTracking ? 'Disable Head-Tracking' : 'Initialize Spatial Audio'}
               </button>
             </div>

             <div className="flex-1 bg-neutral-900 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] flex flex-col space-y-4">
               
               {/* Global User Data */}
               <div className="flex space-x-6 border-b border-neutral-800 pb-4">
                 <div>
                   <span className="text-neutral-500 block mb-1">USER_POS_X</span>
                   <span className="text-white text-lg">{userPos.x.toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-neutral-500 block mb-1">USER_POS_Y</span>
                   <span className="text-white text-lg">{userPos.y.toFixed(2)}</span>
                 </div>
                 <div>
                   <span className="text-neutral-500 block mb-1">YAW (HEAD_ROT)</span>
                   <span className="text-indigo-400 text-lg">{headRotation.toFixed(1)}°</span>
                 </div>
               </div>

               {/* Node Calculations */}
               <div className="space-y-3">
                 <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2">Audio Node Attenuation Matrix</span>
                 {audioNodes.map(node => (
                   <div key={node.id} className="bg-black p-3 rounded border border-neutral-800 flex justify-between items-center">
                     <div>
                       <span className="text-white font-bold text-xs block">{node.name}</span>
                       <span className="text-neutral-500">[{node.x}, {node.y}]</span>
                     </div>
                     
                     <div className="text-right flex space-x-6">
                       <div>
                         <span className="text-neutral-500 block mb-1">Gain (Vol)</span>
                         <span className={`text-sm ${node.volume > 50 ? 'text-emerald-400' : node.volume > 0 ? 'text-amber-400' : 'text-neutral-600'}`}>
                           {node.volume.toFixed(0)}%
                         </span>
                       </div>
                       <div className="w-16">
                         <span className="text-neutral-500 block mb-1">HRTF Pan</span>
                         <span className="text-sky-400 text-sm">
                           {node.pan > 0 ? `R ${node.pan.toFixed(2)}` : node.pan < 0 ? `L ${Math.abs(node.pan).toFixed(2)}` : 'CTR'}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

             </div>
          </div>
        </div>

        {/* Right Side: Map & 3D Visualization (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="w-full bg-black rounded-[2rem] border-[8px] border-neutral-900 shadow-2xl relative overflow-hidden flex flex-col aspect-square">
            
            {/* Map Header */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-4 flex justify-between items-center z-30 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${headTracking ? 'bg-indigo-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                Exhibition Hall Mapping
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">AirPods Pro Connected</span>
            </div>

            {/* 2D Floorplan Canvas */}
            <div className="flex-1 relative bg-neutral-950">
              
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '10% 10%'
              }}></div>

              {/* Render Audio Nodes (Stages) */}
              {audioNodes.map(node => (
                <div 
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: \`\${node.x}%\`, top: \`\${node.y}%\` }}
                >
                  {/* Sound Wave Visualization based on volume */}
                  {headTracking && node.volume > 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/50 animate-ping"
                         style={{ 
                           width: \`\${node.volume * 2}px\`, 
                           height: \`\${node.volume * 2}px\`,
                           animationDuration: \`\${2000 - (node.volume * 10)}ms\`
                         }}>
                    </div>
                  )}
                  <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[8px] font-black shadow-[0_0_15px_rgba(79,70,229,0.6)] relative z-10">
                    🔊
                  </div>
                  <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[8px] text-indigo-300 font-mono whitespace-nowrap bg-black/80 px-1 rounded">
                    {node.name}
                  </span>
                </div>
              ))}

              {/* Render User Head */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500"
                style={{ left: \`\${userPos.x}%\`, top: \`\${userPos.y}%\` }}
              >
                <div 
                  className="relative w-8 h-8 transition-transform duration-500 ease-in-out"
                  style={{ transform: \`rotate(\${headRotation}deg)\` }}
                >
                  {/* Head graphic */}
                  <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                  {/* "Nose" or viewing direction indicator */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-emerald-400"></div>
                  
                  {/* Field of View Cone */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full w-24 h-24 origin-bottom opacity-20 pointer-events-none"
                       style={{ background: 'conic-gradient(from 315deg at 50% 100%, transparent 0deg, rgba(16,185,129,1) 45deg, rgba(16,185,129,1) 90deg, transparent 90deg)' }}>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Spatial Stereo Visualization UI */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
             <div className="text-center mb-4">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Left Ear / Right Ear Pan</span>
             </div>
             <div className="flex justify-between items-end h-16">
               
               {/* Left Ear Visualizer */}
               <div className="w-1/3 flex items-end justify-start space-x-1 h-full">
                  {[...Array(8)].map((_, i) => {
                    // Aggregate volume hitting the left ear
                    const leftVolume = audioNodes.reduce((acc, node) => node.pan < 0 ? acc + (node.volume * Math.abs(node.pan)) : acc, 0);
                    const barHeight = headTracking ? Math.min(100, leftVolume + (Math.random() * 10)) : 10;
                    return (
                      <div key={i} className="w-3 bg-indigo-500 rounded-t transition-all duration-100" style={{ height: \`\${barHeight}%\` }}></div>
                    );
                  })}
               </div>
               
               <div className="text-2xl opacity-50">🎧</div>
               
               {/* Right Ear Visualizer */}
               <div className="w-1/3 flex items-end justify-end space-x-1 h-full">
                  {[...Array(8)].map((_, i) => {
                    // Aggregate volume hitting the right ear
                    const rightVolume = audioNodes.reduce((acc, node) => node.pan > 0 ? acc + (node.volume * node.pan) : acc, 0);
                    const barHeight = headTracking ? Math.min(100, rightVolume + (Math.random() * 10)) : 10;
                    return (
                      <div key={i} className="w-3 bg-sky-500 rounded-t transition-all duration-100" style={{ height: \`\${barHeight}%\` }}></div>
                    );
                  })}
               </div>

             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SpatialAudioZones;
