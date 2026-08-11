import React, { useState, useEffect } from 'react';

const ComputerVisionQueue = () => {
  const [modelRunning, setModelRunning] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [flowRate, setFlowRate] = useState(0); // people processed per minute
  
  const [queues, setQueues] = useState([
    { id: 'Q1', name: 'Main Keynote Entrance', count: 0, waitTime: 0, status: 'idle' },
    { id: 'Q2', name: 'Food Court (Tacos)', count: 0, waitTime: 0, status: 'idle' },
    { id: 'Q3', name: 'Merch Tent', count: 0, waitTime: 0, status: 'idle' }
  ]);

  const toggleModel = () => {
    if (modelRunning) {
      setModelRunning(false);
    } else {
      setModelRunning(true);
      simulateVisionData();
    }
  };

  const simulateVisionData = () => {
    // Initial random counts
    setQueues(prev => [
      { ...prev[0], count: 420, waitTime: 45, status: 'severe' },
      { ...prev[1], count: 85, waitTime: 12, status: 'moderate' },
      { ...prev[2], count: 12, waitTime: 2, status: 'optimal' }
    ]);

    let frames = 0;
    const interval = setInterval(() => {
      setQueues(prev => {
        const newQueues = [...prev];
        
        // Keynote queue slowly empties as doors open
        if (newQueues[0].count > 0) {
          newQueues[0].count -= Math.floor(Math.random() * 5);
          newQueues[0].waitTime = Math.max(1, Math.floor(newQueues[0].count / 10));
          if(newQueues[0].waitTime < 15) newQueues[0].status = 'optimal';
          else if(newQueues[0].waitTime < 30) newQueues[0].status = 'moderate';
        }
        
        // Food queue fluctuates
        newQueues[1].count += Math.floor(Math.random() * 10) - 4;
        newQueues[1].count = Math.max(0, newQueues[1].count);
        newQueues[1].waitTime = Math.floor(newQueues[1].count / 7);
        if(newQueues[1].waitTime > 20) newQueues[1].status = 'severe';
        else if(newQueues[1].waitTime > 10) newQueues[1].status = 'moderate';
        else newQueues[1].status = 'optimal';

        return newQueues;
      });

      frames++;
      if (frames > 100) { // arbitrary stop
        clearInterval(interval);
        setModelRunning(false);
      }
    }, 1000); // update every second
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Computer Vision Feed (Col span 7) */}
        <div className="lg:col-span-7 bg-black rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 z-20 absolute top-0 inset-x-0 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-black text-white flex items-center">
                <span className="text-indigo-500 mr-2">👁️</span> Vision Engine Feed
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Camera: IP_CAM_K1 (Main Keynote)</span>
            </div>
            
            <button 
              onClick={toggleModel}
              className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition ${
                modelRunning ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {modelRunning ? 'Stop Inference' : 'Start YOLOv8 Model'}
            </button>
          </div>

          {/* Video Feed Simulator */}
          <div className="flex-1 relative bg-slate-900 pt-[65px]">
            {/* Fake Crowd Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-60 filter grayscale contrast-125"></div>
            
            {/* CV Overlays */}
            {modelRunning && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Simulated Bounding Boxes */}
                <div className="absolute top-[30%] left-[20%] w-12 h-12 border-2 border-emerald-500 animate-[pulse_1s_ease-in-out_infinite]">
                  <div className="absolute -top-4 left-0 bg-emerald-500 text-black text-[8px] font-black px-1">PERSON 98%</div>
                </div>
                <div className="absolute top-[35%] left-[25%] w-10 h-10 border-2 border-emerald-500">
                  <div className="absolute -top-4 left-0 bg-emerald-500 text-black text-[8px] font-black px-1">PERSON 92%</div>
                </div>
                <div className="absolute top-[40%] left-[30%] w-16 h-16 border-2 border-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]">
                  <div className="absolute -top-4 left-0 bg-emerald-500 text-black text-[8px] font-black px-1">PERSON 95%</div>
                </div>
                <div className="absolute top-[20%] left-[45%] w-8 h-8 border-2 border-emerald-500 opacity-50"></div>
                <div className="absolute top-[25%] left-[50%] w-8 h-8 border-2 border-emerald-500 opacity-60"></div>
                
                {/* HUD Elements */}
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur p-3 rounded-lg border border-slate-700">
                  <span className="block text-[10px] text-emerald-400 font-mono uppercase">Inference Speed: 32ms</span>
                  <span className="block text-[10px] text-emerald-400 font-mono uppercase">Resolution: 1080p -> 640x640</span>
                </div>
                
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KPC9zdmc+')] opacity-50"></div>
              </div>
            )}
            
            {!modelRunning && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span className="text-slate-400 font-mono text-sm border border-slate-700 px-4 py-2 rounded bg-slate-900/80 uppercase tracking-widest">Model Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Dashboard & Mobile App (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl">
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Venue Queue Analytics</h3>
               {modelRunning && (
                 <span className="flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                 </span>
               )}
             </div>
             
             <div className="space-y-3">
               {queues.map(q => (
                 <div key={q.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                   <div>
                     <span className="block text-white font-bold text-sm">{q.name}</span>
                     <span className="block text-[10px] text-slate-500 font-mono">{modelRunning ? `${q.count} people detected` : 'Waiting for scan...'}</span>
                   </div>
                   <div className="text-right">
                     {modelRunning ? (
                       <span className={`px-2 py-1 rounded text-xs font-black flex items-center ${
                         q.status === 'severe' ? 'bg-rose-900/50 text-rose-400 border border-rose-500/30' :
                         q.status === 'moderate' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' :
                         'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'
                       }`}>
                         {q.status === 'severe' && <span className="mr-1">⚠️</span>}
                         {q.waitTime} MIN
                       </span>
                     ) : (
                       <span className="text-slate-600 font-mono text-xs">-- MIN</span>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Mobile App Simulator */}
          <div className="w-full max-w-[320px] mx-auto bg-slate-100 rounded-[2.5rem] border-[8px] border-slate-300 shadow-2xl relative flex flex-col h-[400px] overflow-hidden">
            {/* iOS Header */}
            <div className="h-8 flex justify-between items-center px-6 text-slate-900 text-[10px] font-bold bg-white">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G</span>
                <span className="ml-1">🔋</span>
              </div>
            </div>
            
            <div className="bg-indigo-600 text-white p-4 shadow-md">
              <h4 className="font-black text-lg">Eventra Schedule</h4>
            </div>

            <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
              
              {/* Event Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest block mb-1">10:00 AM • Main Hall</span>
                <h5 className="font-black text-slate-900 mb-2">Opening Keynote</h5>
                
                <div className={`p-3 rounded-xl border ${
                  !modelRunning ? 'bg-slate-50 border-slate-100' :
                  queues[0].status === 'severe' ? 'bg-rose-50 border-rose-200' :
                  queues[0].status === 'moderate' ? 'bg-amber-50 border-amber-200' :
                  'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Estimated Wait:</span>
                    <span className={`text-sm font-black ${
                      !modelRunning ? 'text-slate-400' :
                      queues[0].status === 'severe' ? 'text-rose-600' :
                      queues[0].status === 'moderate' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {modelRunning ? `${queues[0].waitTime} mins` : 'Calculating...'}
                    </span>
                  </div>
                  {modelRunning && queues[0].status === 'severe' && (
                    <p className="text-[10px] text-rose-500 mt-2 font-bold leading-tight">
                      Line is very long. We recommend joining the queue now to secure a seat!
                    </p>
                  )}
                  {modelRunning && queues[0].status === 'optimal' && (
                    <p className="text-[10px] text-emerald-600 mt-2 font-bold leading-tight">
                      Line is moving fast. Head over anytime!
                    </p>
                  )}
                </div>
              </div>
              
              {/* Event Card 2 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 opacity-70">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest block mb-1">12:30 PM • Food Court</span>
                <h5 className="font-black text-slate-900 mb-2">Lunch Break</h5>
                <div className="p-3 rounded-xl border bg-slate-50 border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Taco Stand Wait:</span>
                  <span className="text-sm font-black text-slate-400">{modelRunning ? `${queues[1].waitTime} mins` : '...'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ComputerVisionQueue;
