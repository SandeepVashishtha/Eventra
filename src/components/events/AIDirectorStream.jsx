import React, { useState, useEffect } from 'react';

const AIDirectorStream = () => {
  const [directorActive, setDirectorActive] = useState(false);
  const [activeCam, setActiveCam] = useState('CAM 1 (Wide)');
  
  // Camera Feeds
  const [cameras] = useState([
    { id: 'CAM 1', name: 'CAM 1 (Wide)', type: 'wide', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'CAM 2', name: 'CAM 2 (Host CU)', type: 'cu', image: 'https://images.unsplash.com/photo-1475721028070-2051614db25e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'CAM 3', name: 'CAM 3 (Guest CU)', type: 'cu', image: 'https://images.unsplash.com/photo-1558021211-6d1403321394?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'CAM 4', name: 'CAM 4 (Panel 2-Shot)', type: 'med', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ]);

  const [aiLog, setAiLog] = useState([
    { time: '10:00:00', action: 'System online. Defaulting to Wide.' }
  ]);

  // Telemetry state
  const [audioLevels, setAudioLevels] = useState({ host: 10, guest: 10, crowd: 10 });
  const [faceTracking, setFaceTracking] = useState({ hostActive: false, guestActive: false });

  useEffect(() => {
    let simInterval;
    
    if (directorActive) {
      let step = 0;
      
      simInterval = setInterval(() => {
        step++;
        
        if (step === 2) {
          // Host starts speaking
          setAudioLevels({ host: 85, guest: 10, crowd: 15 });
          setFaceTracking({ hostActive: true, guestActive: false });
          setActiveCam('CAM 2 (Host CU)');
          addLog('Host voice detected (VAD: 85%). Cutting to CAM 2.');
        } else if (step === 5) {
          // Guest interrupts/speaks
          setAudioLevels({ host: 20, guest: 92, crowd: 15 });
          setFaceTracking({ hostActive: false, guestActive: true });
          setActiveCam('CAM 3 (Guest CU)');
          addLog('Guest voice detected (VAD: 92%). Cutting to CAM 3.');
        } else if (step === 8) {
          // Both speaking / arguing (2-shot)
          setAudioLevels({ host: 80, guest: 85, crowd: 25 });
          setFaceTracking({ hostActive: true, guestActive: true });
          setActiveCam('CAM 4 (Panel 2-Shot)');
          addLog('Multiple voices detected. Cutting to CAM 4 (2-Shot).');
        } else if (step === 11) {
          // Crowd laughs
          setAudioLevels({ host: 40, guest: 40, crowd: 95 });
          setFaceTracking({ hostActive: true, guestActive: true });
          setActiveCam('CAM 1 (Wide)');
          addLog('Crowd laughter detected (95dB). Cutting to CAM 1 (Wide).');
        } else if (step === 14) {
          step = 0; // Loop simulation
        }
        
      }, 2000); // Trigger every 2 seconds
    }
    
    return () => clearInterval(simInterval);
  }, [directorActive]);

  const addLog = (msg) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setAiLog(prev => [{ time: timeString, action: msg }, ...prev].slice(0, 5));
  };

  const getActiveImage = () => {
    const cam = cameras.find(c => c.name === activeCam);
    return cam ? cam.image : cameras[0].image;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🎥</span> Broadcast Automation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Multi-Camera AI <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Live Stream Director</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Hiring a live technical director to manually switch between 5 camera angles for a 3-day conference stream is prohibitively expensive. Eventra's autonomous AI video switcher ingests static camera feeds and utilizes voice-activity detection (VAD) and facial tracking to automatically cut to the wide shot when the crowd laughs, or cut to the close-up of whoever is currently speaking, fully automating the broadcast.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🎛️</span> AI Vision Mixer
               </h3>
               
               <button 
                 onClick={() => {
                   setDirectorActive(!directorActive);
                   if(!directorActive) {
                     setActiveCam('CAM 1 (Wide)');
                     setAudioLevels({ host: 10, guest: 10, crowd: 10 });
                     setFaceTracking({ hostActive: false, guestActive: false });
                     setAiLog([{ time: '10:00:00', action: 'System online. Defaulting to Wide.' }]);
                   }
                 }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   directorActive ? 'bg-orange-900/50 text-orange-400 border border-orange-500/50 hover:bg-orange-900' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                 }`}
               >
                 {directorActive && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 animate-pulse"></span>}
                 {directorActive ? 'Auto-Director Active' : 'Engage AI Director'}
               </button>
             </div>

             {/* Multiviewer Grid */}
             <div className="grid grid-cols-4 gap-2 mb-6">
               {cameras.map((cam) => (
                 <div key={cam.id} className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                   activeCam === cam.name ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105 z-10' : 'border-neutral-800'
                 }`}>
                   <img src={cam.image} alt={cam.name} className={`w-full h-20 object-cover ${activeCam === cam.name ? '' : 'filter grayscale opacity-60'}`} />
                   
                   {/* Tally Light overlay */}
                   {activeCam === cam.name && (
                     <div className="absolute inset-0 border-4 border-red-500 pointer-events-none"></div>
                   )}
                   
                   <div className={`absolute bottom-0 inset-x-0 px-1 py-0.5 text-[8px] font-bold text-center ${
                     activeCam === cam.name ? 'bg-red-600 text-white' : 'bg-black/80 text-neutral-400'
                   }`}>
                     {cam.id} {activeCam === cam.name && ' (PGM)'}
                   </div>
                 </div>
               ))}
             </div>

             <div className="grid grid-cols-2 gap-4 flex-1">
               
               {/* Telemetry Panel */}
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between">
                 <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">VAD Telemetry (Voice Detection)</span>
                 
                 <div className="space-y-3 flex-1">
                   <div>
                     <div className="flex justify-between text-[8px] mb-1 font-bold text-neutral-400">
                       <span>CH1: Host Mic</span>
                       <span>{audioLevels.host}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: \`\${audioLevels.host}%\` }}></div>
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-[8px] mb-1 font-bold text-neutral-400">
                       <span>CH2: Guest Mic</span>
                       <span>{audioLevels.guest}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: \`\${audioLevels.guest}%\` }}></div>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between text-[8px] mb-1 font-bold text-neutral-400">
                       <span>CH3: Crowd Ambience</span>
                       <span>{audioLevels.crowd}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: \`\${audioLevels.crowd}%\` }}></div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Director Log */}
               <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden flex flex-col">
                 <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Director Logic Log</span>
                 <div className="flex-1 overflow-y-auto space-y-2 text-neutral-400 pr-2 flex flex-col">
                   {aiLog.map((log, i) => (
                     <div key={i} className={`animate-fade-in-up ${i === 0 ? 'text-orange-400 font-bold' : 'opacity-70'}`}>
                       <span className="text-neutral-600 mr-2">[{log.time}]</span>
                       {log.action}
                     </div>
                   ))}
                 </div>
               </div>

             </div>

          </div>
        </div>

        {/* Right Side: Program Output Feed Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 pt-10">
          
          <div className="w-full bg-black rounded-2xl border-4 border-neutral-800 shadow-2xl relative flex flex-col overflow-hidden aspect-video">
            
            {/* Header Overlay */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></span> LIVE (PROGRAM)
              </span>
              <span className="text-[10px] text-white font-mono bg-black/50 px-2 py-0.5 rounded border border-neutral-700 backdrop-blur">
                1080p60
              </span>
            </div>

            {/* Main Program Video Canvas */}
            <div className="flex-1 relative bg-black overflow-hidden group">
              <img 
                src={getActiveImage()} 
                alt="Program Feed" 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Fake AI Bounding Boxes (Only visible when tracking face on CU/Med) */}
              {(activeCam !== 'CAM 1 (Wide)' && directorActive) && (
                <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {faceTracking.hostActive && activeCam !== 'CAM 3 (Guest CU)' && (
                     <div className="absolute w-32 h-32 border-2 border-orange-500 bg-orange-500/10 -ml-32 -mt-16">
                       <span className="absolute -top-4 left-0 text-[8px] bg-orange-600 text-white px-1">SPEAKER: HOST (99%)</span>
                     </div>
                   )}
                   {faceTracking.guestActive && activeCam !== 'CAM 2 (Host CU)' && (
                     <div className="absolute w-32 h-32 border-2 border-sky-500 bg-sky-500/10 ml-32 mt-16">
                       <span className="absolute -top-4 left-0 text-[8px] bg-sky-600 text-white px-1">SPEAKER: GUEST (98%)</span>
                     </div>
                   )}
                </div>
              )}
              
              {/* Lower Third Graphic */}
              <div className="absolute bottom-6 left-6 z-30 animate-fade-in-up">
                <div className="bg-white/90 backdrop-blur px-4 py-2 border-l-4 border-orange-500 shadow-lg">
                  <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest">Future of Event Tech</h4>
                  <p className="text-slate-600 text-[10px] font-bold">Main Stage Panel • LIVE</p>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-indigo-900/50 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
               </div>
               <div>
                 <span className="block text-white font-bold text-sm">YouTube Live Integration</span>
                 <span className="block text-[10px] text-emerald-400 font-mono mt-0.5">Stream Health: Excellent</span>
               </div>
             </div>
             <button className="bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-700 transition">Copy RTMP</button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AIDirectorStream;
