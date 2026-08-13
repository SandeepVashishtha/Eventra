/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SmartBinVision = () => {
  const [systemActive, setSystemActive] = useState(false);
  
  // CV Metrics
  const [activeBins, setActiveBins] = useState(0); 
  const [sortingAccuracy, setSortingAccuracy] = useState(98.4); // %
  const [itemsProcessed, setItemsProcessed] = useState(14502);
  const [wasteDiverted, setWasteDiverted] = useState(2450); // lbs diverted from landfill
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '13:00:00', type: 'SYS', msg: 'Edge AI Waste Sorting Models Deployed to 450 Bins.' },
    { id: 2, time: '13:00:02', type: 'SYS', msg: 'Servo motor actuators calibrated and online.' }
  ]);

  // Visualizer State
  const [scanState, setScanState] = useState('IDLE'); // IDLE, SCANNING, SORTING
  const [currentItem, setCurrentItem] = useState(null);
  const [classification, setClassification] = useState(null); // RECYCLE, COMPOST, LANDFILL
  const [flapAngle, setFlapAngle] = useState(0); // -45 (Recycle), 0 (Landfill), 45 (Compost)

  useEffect(() => {
    let loop;
    
    if (systemActive) {
      loop = setInterval(() => {
          setActiveBins(445 + Math.floor(Math.random() * 5));
      }, 1000); 
    }
    
    return () => { if (loop) clearInterval(loop); };
  }, [systemActive]);

  const dropItem = (type) => {
      if (!systemActive || scanState !== 'IDLE') return;
      
      let itemObj = {};
      
      if (type === 'CAN') {
          itemObj = { name: 'Aluminum Can', icon: '🥫', target: 'RECYCLE', angle: -45 };
          addLog('ACTION', 'User dropped object into hopper funnel.');
      } else if (type === 'FOOD') {
          itemObj = { name: 'Half-Eaten Hotdog', icon: '🌭', target: 'COMPOST', angle: 45 };
          addLog('ACTION', 'User dropped object into hopper funnel.');
      } else if (type === 'PLASTIC') {
          itemObj = { name: 'Mixed Plastic Wrapper', icon: '🍬', target: 'LANDFILL', angle: 0 };
          addLog('ACTION', 'User dropped object into hopper funnel.');
      }

      setCurrentItem(itemObj);
      setScanState('SCANNING');
      
      // Simulate CV Processing
      setTimeout(() => {
          if (!systemActive) return;
          
          setClassification(itemObj.target);
          addLog('SYS', `Edge CV Match: ${itemObj.name} (99.2% Conf). Target: ${itemObj.target}`);
          
          setTimeout(() => {
              if (!systemActive) return;
              
              setScanState('SORTING');
              setFlapAngle(itemObj.angle);
              addLog('SYS', `Actuating diverter servo to ${itemObj.angle}° (${itemObj.target} bin).`);
              
              setTimeout(() => {
                  if (!systemActive) return;
                  
                  setItemsProcessed(prev => prev + 1);
                  if (itemObj.target !== 'LANDFILL') {
                      setWasteDiverted(prev => prev + 0.5); // Add lbs
                  }
                  
                  addLog('SUCCESS', 'Item successfully sorted. Hopper clear.');
                  
                  setTimeout(() => {
                      setScanState('IDLE');
                      setCurrentItem(null);
                      setClassification(null);
                      setFlapAngle(0);
                  }, 1000);
                  
              }, 1200); // Sorting delay
              
          }, 800); // Actuator prep delay

      }, 1000); // Scanning delay
  };

  const toggleSystem = () => {
    if (!systemActive) {
      setSystemActive(true);
      addLog('SYS', 'Smart-Bin Network Online. Activating CV cameras.');
    } else {
      setSystemActive(false);
      setActiveBins(0);
      setScanState('IDLE');
      setCurrentItem(null);
      setClassification(null);
      setFlapAngle(0);
      addLog('WARN', 'Smart-Bins Offline. Flaps defaulting to manual sorting (High error rate).');
    }
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3,'0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#040705] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">♻️</span> Automated Sustainability
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Smart-Bin Waste Sorting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">via Edge AI Vision</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Attendees rarely separate their recycling, compost, and landfill waste correctly, especially at night or while intoxicated. This forces the festival to pay massive contamination fines or simply send everything to a landfill. Eventra solves this by deploying "Smart Bins" equipped with internal cameras and motorized diverter flaps. The user drops their trash into a single top funnel. An edge AI model instantly identifies the object (e.g., an aluminum can vs. a half-eaten hotdog) and actuates a servo to drop the item into the correct internal bin with 98% accuracy.
          </p>

          <div className="bg-[#080d0a] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-emerald-500 text-lg mr-2">🎛️</span> Waste Telemetry
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={toggleSystem}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     systemActive ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                     'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                   }`}
                 >
                   {systemActive ? 'Halt Robotics' : 'Initialize CV Cameras'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Bins */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-teal-950/20 border-teal-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Smart Bins Online
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${
                     systemActive ? 'text-teal-400' : 'text-slate-600'
                   }`}>
                     {activeBins}
                   </span>
                 </div>
               </div>

               {/* Sorting Accuracy */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 scanState === 'SCANNING' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   CV Accuracy
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     scanState === 'SCANNING' ? 'text-emerald-400' : 'text-slate-300'
                   }`}>
                     {systemActive ? sortingAccuracy : '0.0'}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">%</span>
                 </div>
               </div>
               
               {/* Items Processed */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Items Sorted
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-slate-300' : 'text-slate-600'
                   }`}>
                     {itemsProcessed.toLocaleString()}
                   </span>
                 </div>
               </div>
               
               {/* Waste Diverted */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 systemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
               }`}>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Landfill Diverted
                 </span>
                 <div className="flex items-end">
                   <span className={`text-2xl font-black font-mono leading-none ${
                     systemActive ? 'text-emerald-400' : 'text-slate-600'
                   }`}>
                     {wasteDiverted.toLocaleString()}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">lbs</span>
                 </div>
               </div>

             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020403] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>CV Robotics Ledger</span>
                 {scanState === 'SCANNING' && <span className="text-emerald-400 font-black animate-pulse">CLASSIFYING OBJECT...</span>}
                 {scanState === 'SORTING' && <span className="text-teal-400 font-black animate-pulse">ACTUATING SERVO...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'CRIT' ? 'text-red-500 font-bold uppercase bg-red-900/30 px-1' :
                       log.type === 'WARN' ? 'text-orange-400 font-bold' :
                       log.type === 'ACTION' ? 'text-cyan-400 font-bold' : 'text-slate-400'
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
            
            {/* Smart Bin Visualizer */}
            <div className={`w-full rounded-[1.5rem] border-[4px] border-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[450px] overflow-hidden font-sans mb-6 transition-colors duration-1000 ${
                !systemActive ? 'bg-slate-900' : 'bg-[#080d0a]'
            }`}>
              
              <div className="absolute top-0 inset-x-0 p-3 text-center z-40 pointer-events-none flex justify-between bg-black/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">SMART BIN SCHEMATIC</span>
                <span className="text-[8px] font-mono text-slate-400">BIN ID: #042</span>
              </div>

              <div className="flex-1 relative flex flex-col items-center pt-16 pb-4">
                  
                  {!systemActive ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">SENSORS OFFLINE</span>
                     </div>
                  ) : (
                    <div className="w-full h-full relative z-20 flex flex-col items-center">
                        
                        {/* User Input Hopper */}
                        <div className="w-32 h-16 border-l-4 border-r-4 border-slate-600 border-b-0 rounded-t-xl relative overflow-hidden bg-slate-900/50 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 absolute top-2">Drop Waste Here</span>
                            
                            {/* Object falling in Hopper */}
                            <div className={`text-4xl absolute transition-all duration-700 ${
                                scanState === 'IDLE' ? 'top-[-50px] opacity-0' : 
                                scanState === 'SCANNING' ? 'top-6 opacity-100' : 'top-32 opacity-0'
                            }`}>
                                {currentItem?.icon}
                            </div>
                            
                            {/* CV Scanning Laser */}
                            {scanState === 'SCANNING' && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan"></div>
                            )}
                        </div>

                        {/* CV Analysis Overlay */}
                        <div className={`w-40 bg-black/80 backdrop-blur-sm border border-emerald-500/50 rounded-lg p-2 absolute top-20 right-4 transition-all duration-300 z-30 ${
                            scanState === 'SCANNING' || scanState === 'SORTING' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-emerald-400 uppercase">CV Model Edge</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            {scanState === 'SCANNING' ? (
                                <div className="text-[8px] font-mono text-slate-400 animate-pulse">Analyzing pixel matrix...</div>
                            ) : (
                                <div>
                                    <div className="text-[10px] font-bold text-white leading-tight">{currentItem?.name}</div>
                                    <div className="text-[8px] font-mono text-emerald-300">Conf: 99.2%</div>
                                    <div className={`text-[10px] font-black uppercase mt-1 px-1 rounded inline-block ${
                                        classification === 'RECYCLE' ? 'bg-blue-900/50 text-blue-400 border border-blue-500' :
                                        classification === 'COMPOST' ? 'bg-green-900/50 text-green-400 border border-green-500' :
                                        'bg-slate-800 text-slate-300 border border-slate-500'
                                    }`}>
                                        Target: {classification}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Motorized Diverter Flap */}
                        <div className="w-32 h-16 border-l-4 border-r-4 border-slate-600 relative overflow-visible bg-slate-900/50">
                            {/* Servo Motor Center */}
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-700 rounded-full border-2 border-slate-500 z-10 flex items-center justify-center">
                                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                            </div>
                            {/* The Flap */}
                            <div 
                                className="absolute top-8 left-1/2 w-1 h-14 bg-slate-400 rounded-full origin-top transition-transform duration-500 ease-in-out shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                style={{ transform: `translateX(-50%) rotate(${flapAngle}deg)` }}
                            ></div>
                        </div>

                        {/* Three internal bins */}
                        <div className="w-64 h-48 flex justify-between mt-0 pt-2 px-2 border-t-2 border-dashed border-slate-700 relative">
                            
                            {/* Recycle */}
                            <div className={`w-16 h-full border-2 border-t-0 rounded-b-xl flex flex-col items-center pt-2 transition-colors ${
                                scanState === 'SORTING' && classification === 'RECYCLE' ? 'bg-blue-900/40 border-blue-400 shadow-[inset_0_-20px_30px_rgba(59,130,246,0.3)]' : 'border-blue-900 bg-blue-950/20'
                            }`}>
                                <span className="text-xl opacity-80">♻️</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-1">Recycle</span>
                            </div>

                            {/* Landfill */}
                            <div className={`w-16 h-full border-2 border-t-0 rounded-b-xl flex flex-col items-center pt-2 transition-colors ${
                                scanState === 'SORTING' && classification === 'LANDFILL' ? 'bg-slate-800 border-slate-400 shadow-[inset_0_-20px_30px_rgba(148,163,184,0.3)]' : 'border-slate-800 bg-slate-900/50'
                            }`}>
                                <span className="text-xl opacity-80">🗑️</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Landfill</span>
                            </div>

                            {/* Compost */}
                            <div className={`w-16 h-full border-2 border-t-0 rounded-b-xl flex flex-col items-center pt-2 transition-colors ${
                                scanState === 'SORTING' && classification === 'COMPOST' ? 'bg-green-900/40 border-green-400 shadow-[inset_0_-20px_30px_rgba(34,197,94,0.3)]' : 'border-green-900 bg-green-950/20'
                            }`}>
                                <span className="text-xl opacity-80">🌱</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-green-500 mt-1">Compost</span>
                            </div>

                        </div>

                    </div>
                  )}
                
              </div>
            </div>

            {/* Triggers */}
            <div className="w-full bg-[#080d0a] p-4 rounded-xl border border-slate-800">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 text-center">Simulate User Actions</span>
               
               <div className="grid grid-cols-3 gap-2 mb-2">
                 <button 
                   onClick={() => dropItem('CAN')}
                   disabled={!systemActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-blue-950/40 border-blue-600 text-blue-400 hover:bg-blue-900/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                   }`}
                 >
                   🥫 Drop Can
                 </button>
                 
                 <button 
                   onClick={() => dropItem('FOOD')}
                   disabled={!systemActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-green-950/40 border-green-600 text-green-400 hover:bg-green-900/60 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                   }`}
                 >
                   🌭 Drop Food
                 </button>

                 <button 
                   onClick={() => dropItem('PLASTIC')}
                   disabled={!systemActive || scanState !== 'IDLE'}
                   className={`py-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition border flex items-center justify-center ${
                     !systemActive || scanState !== 'IDLE' ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed' : 
                     'bg-slate-800 border-slate-500 text-slate-300 hover:bg-slate-700 shadow-[0_0_10px_rgba(148,163,184,0.2)]'
                   }`}
                 >
                   🍬 Drop Plastic
                 </button>
               </div>

            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default SmartBinVision;
