import React, { useState, useEffect } from 'react';

const VenueDigitalTwin = () => {
  const [mode, setMode] = useState('build'); // build, flow, sightline
  const [boidsActive, setBoidsActive] = useState(false);
  const [boids, setBoids] = useState([]);
  const [sightlineBlocked, setSightlineBlocked] = useState(false);
  
  // Simulated Placed Objects
  const [objects, setObjects] = useState([
    { id: 1, type: 'stage', x: 50, z: 20, width: 40, depth: 15, rot: 0 },
    { id: 2, type: 'booth', x: 30, z: 60, width: 10, depth: 10, rot: 45 },
    { id: 3, type: 'booth', x: 70, z: 60, width: 10, depth: 10, rot: -45 },
    { id: 4, type: 'pillar', x: 50, z: 50, width: 5, depth: 5, rot: 0 } // The problematic pillar
  ]);

  const [cameraPos, setCameraPos] = useState({ x: 50, y: 15, z: 90 });

  // Simulate Boids (Crowd Flow)
  useEffect(() => {
    let animFrame;
    if (boidsActive && mode === 'flow') {
      const updateBoids = () => {
        setBoids(prev => prev.map(boid => {
          // Extremely simplified boid logic moving towards stage, avoiding pillar
          let dx = 50 - boid.x;
          let dz = 20 - boid.z;
          const distToStage = Math.sqrt(dx*dx + dz*dz);
          
          let moveX = (dx / distToStage) * boid.speed;
          let moveZ = (dz / distToStage) * boid.speed;
          
          // Avoid pillar at 50,50
          const distToPillar = Math.sqrt(Math.pow(50 - boid.x, 2) + Math.pow(50 - boid.z, 2));
          if (distToPillar < 15) {
            moveX += (boid.x > 50 ? 2 : -2);
            moveZ += (boid.z > 50 ? 1 : -1);
          }

          let newX = boid.x + moveX;
          let newZ = boid.z + moveZ;

          // Reset if they reach stage
          if (newZ < 25) {
            newX = 10 + Math.random() * 80;
            newZ = 95;
          }

          return { ...boid, x: newX, z: newZ };
        }));
        animFrame = requestAnimationFrame(updateBoids);
      };
      animFrame = requestAnimationFrame(updateBoids);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [boidsActive, mode]);

  const initBoids = () => {
    const newBoids = [];
    for(let i=0; i<150; i++) {
      newBoids.push({
        id: i,
        x: 10 + Math.random() * 80,
        z: 70 + Math.random() * 25,
        speed: 0.2 + Math.random() * 0.3
      });
    }
    setBoids(newBoids);
    setBoidsActive(true);
  };

  const testSightline = () => {
    setMode('sightline');
    // Move camera to a bad VIP seat behind the pillar
    setCameraPos({ x: 50, y: 5, z: 65 });
    
    setTimeout(() => {
      setSightlineBlocked(true);
    }, 1000);
  };

  const fixLayout = () => {
    // Move the pillar/booth to fix sightline
    setObjects(prev => prev.map(obj => 
      obj.type === 'pillar' ? { ...obj, x: 20 } : obj
    ));
    setSightlineBlocked(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Tools (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="inline-block bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧊</span> WebGL Graphics
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            Immersive 3D Venue <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Digital Twin</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Planning booth layouts on flat 2D PDFs leads to disastrous spatial issues on load-in day. Eventra's WebGL-powered 3D Digital Twin allows organizers to walk through the venue in a browser. Run virtual crowd flow simulations (using boids algorithms) and check precise sightlines before anyone ever touches a hammer.
          </p>

          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Simulation Modes</h3>
             
             <button 
               onClick={() => { setMode('build'); setBoidsActive(false); setCameraPos({ x: 50, y: 80, z: 50 }); }}
               className={`w-full text-left px-4 py-3 rounded-xl border flex items-center transition ${
                 mode === 'build' ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
               }`}
             >
               <span className="text-xl mr-3">🏗️</span>
               <div>
                 <span className="font-bold block text-sm">Top-Down Build Mode</span>
                 <span className="text-[10px]">Drag & drop CAD assets</span>
               </div>
             </button>

             <button 
               onClick={() => { setMode('flow'); setCameraPos({ x: 50, y: 40, z: 80 }); initBoids(); }}
               className={`w-full text-left px-4 py-3 rounded-xl border flex items-center transition ${
                 mode === 'flow' ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
               }`}
             >
               <span className="text-xl mr-3">🌊</span>
               <div>
                 <span className="font-bold block text-sm">Crowd Flow (Boids)</span>
                 <span className="text-[10px]">Simulate ingress/egress physics</span>
               </div>
             </button>

             <button 
               onClick={testSightline}
               className={`w-full text-left px-4 py-3 rounded-xl border flex items-center transition ${
                 mode === 'sightline' ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
               }`}
             >
               <span className="text-xl mr-3">👁️</span>
               <div>
                 <span className="font-bold block text-sm">Sightline Validator</span>
                 <span className="text-[10px]">Check view from any seat</span>
               </div>
             </button>
             
             {sightlineBlocked && mode === 'sightline' && (
               <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-xl p-4 animate-fade-in text-center">
                 <span className="text-red-400 font-bold text-xs uppercase block mb-2">⚠️ Sightline Blocked</span>
                 <p className="text-[10px] text-slate-300 mb-3">VIP Section B view of Main Stage is obscured by structural pillar.</p>
                 <button onClick={fixLayout} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded">
                   Auto-Fix Layout
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: WebGL Simulator (Col span 8) */}
        <div className="lg:col-span-8">
          
          <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative flex flex-col h-[650px] overflow-hidden">
            
            {/* Viewport Header */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-30 pointer-events-none">
              <span className="bg-black/50 backdrop-blur border border-slate-700 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> 
                {mode === 'build' ? 'ORTHOGRAPHIC CAD VIEW' : mode === 'flow' ? 'PERSPECTIVE SIMULATION' : 'FIRST-PERSON CAMERA'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                FPS: 60 | POLY: 142k
              </span>
            </div>

            {/* Pseudo-3D Canvas */}
            <div className="flex-1 relative bg-slate-800 overflow-hidden perspective-1000">
              
              {/* The 3D World Container */}
              <div 
                className="absolute inset-0 transition-transform duration-1000 ease-in-out transform-style-3d"
                style={{
                  transform: `
                    translateZ(${mode === 'build' ? '-500px' : mode === 'sightline' ? '200px' : '-200px'})
                    rotateX(${mode === 'build' ? '60deg' : mode === 'sightline' ? '5deg' : '45deg'})
                    rotateY(${mode === 'sightline' ? '0deg' : '0deg'})
                    translateY(${mode === 'build' ? '20%' : mode === 'sightline' ? '40%' : '10%'})
                  `
                }}
              >
                {/* Ground Grid */}
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] bg-slate-900 border-2 border-fuchsia-900/30"
                     style={{
                       backgroundImage: 'linear-gradient(rgba(217, 70, 239, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 70, 239, 0.2) 1px, transparent 1px)',
                       backgroundSize: '40px 40px'
                     }}>
                  
                  {/* Objects */}
                  {objects.map(obj => (
                    <div 
                      key={obj.id} 
                      className={`absolute shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform-style-3d transition-all duration-700 flex items-center justify-center text-[10px] font-bold text-white/50 ${
                        obj.type === 'stage' ? 'bg-fuchsia-600/80 border-t-2 border-fuchsia-400' :
                        obj.type === 'pillar' ? 'bg-slate-400 border-t-2 border-slate-300' :
                        'bg-cyan-600/80 border-t-2 border-cyan-400'
                      }`}
                      style={{
                        left: `${obj.x}%`, 
                        top: `${obj.z}%`,
                        width: `${obj.width}%`,
                        height: `${obj.depth}%`,
                        transform: `translate(-50%, -50%) rotateZ(${obj.rot}deg) translateZ(${obj.type==='pillar' ? '60px' : obj.type==='stage' ? '20px' : '30px'})`,
                      }}
                    >
                      {obj.type.toUpperCase()}
                      
                      {/* Fake 3D Extrusion (Walls) */}
                      <div className="absolute inset-0 transform -translate-z-full opacity-50 bg-black"></div>
                    </div>
                  ))}

                  {/* Boids (Crowd) */}
                  {boidsActive && boids.map(boid => (
                    <div 
                      key={boid.id}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                      style={{
                        left: `${boid.x}%`,
                        top: `${boid.z}%`,
                        transform: 'translate(-50%, -50%) translateZ(2px)'
                      }}
                    ></div>
                  ))}

                  {/* Sightline Laser */}
                  {mode === 'sightline' && (
                    <div className="absolute w-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] transform origin-top"
                         style={{
                           left: '50%', top: '65%', height: '45%',
                           transform: 'rotateZ(180deg) translateZ(10px)',
                           opacity: sightlineBlocked ? 1 : 0
                         }}>
                    </div>
                  )}

                </div>
              </div>

              {/* First-Person Overlay effect for Sightline mode */}
              {mode === 'sightline' && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center items-center">
                   {/* Fake pillar blocking view */}
                   {sightlineBlocked && (
                     <div className="w-1/3 h-[120%] bg-gradient-to-r from-slate-800 to-slate-900 border-r border-slate-700 absolute shadow-2xl animate-fade-in z-30"></div>
                   )}
                   
                   {/* Crosshair */}
                   <div className="w-4 h-4 border-2 border-white/50 rounded-full flex items-center justify-center absolute z-40 mix-blend-difference">
                     <div className="w-1 h-1 bg-white rounded-full"></div>
                   </div>
                </div>
              )}

            </div>

            {/* Bottom Toolbar */}
            <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center px-6 justify-between z-30">
              <div className="flex space-x-4">
                <button className="text-slate-400 hover:text-white text-xs font-bold transition flex items-center">
                  <span className="mr-2">➕</span> Add Asset
                </button>
                <button className="text-slate-400 hover:text-white text-xs font-bold transition flex items-center">
                  <span className="mr-2">💾</span> Save Layout
                </button>
              </div>
              <div className="flex space-x-2">
                 <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500">X</span>
                 <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500">Y</span>
                 <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500">Z</span>
              </div>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default VenueDigitalTwin;
