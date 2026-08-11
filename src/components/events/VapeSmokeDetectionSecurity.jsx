/* eslint-disable */
import React, { useState, useEffect } from 'react';

const VapeSmokeDetectionSecurity = () => {
  const [systemActive, setSystemActive] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  
  // Sensor Data
  const [pm25, setPm25] = useState(12); // PM2.5 baseline (ug/m3)
  const [voc, setVoc] = useState(45); // Volatile Organic Compounds baseline (ppb)
  
  const [zones, setZones] = useState([
    { id: 'Z-1', name: 'VIP Lounge North', status: 'Clear', pm25: 12, voc: 45 },
    { id: 'Z-2', name: 'Executive Restroom A', status: 'Clear', pm25: 10, voc: 50 },
    { id: 'Z-3', name: 'Backstage Green Room', status: 'Clear', pm25: 15, voc: 40 }
  ]);

  const [securityLog, setSecurityLog] = useState([
    { id: 1, time: '20:15:00', type: 'SYS', msg: 'IoT Particulate Sensor Grid initialized. All zones nominal.' }
  ]);

  useEffect(() => {
    let loop;
    if (systemActive && !alertActive) {
      loop = setInterval(() => {
        // Random baseline fluctuation
        setPm25(prev => Math.max(10, Math.min(20, prev + (Math.random() * 2 - 1))));
        setVoc(prev => Math.max(40, Math.min(60, prev + (Math.random() * 4 - 2))));
      }, 1000);
    }
    return () => clearInterval(loop);
  }, [systemActive, alertActive]);

  const triggerVapeIncident = () => {
    setSystemActive(true);
    addLog('SYS', 'Monitoring particulate anomaly in Zone 2 (Executive Restroom A)...');
    
    // Anomaly spike
    let tick = 0;
    const spikeLoop = setInterval(() => {
      tick++;
      setPm25(prev => prev + 45); // Huge spike in PM2.5 (Smoke/Vapor)
      setVoc(prev => prev + 150); // Huge spike in VOCs (Flavoring/Propylene Glycol)
      
      setZones(prev => prev.map(z => {
        if (z.id === 'Z-2') {
          return { ...z, pm25: z.pm25 + 45, voc: z.voc + 150, status: 'Elevated' };
        }
        return z;
      }));

      if (tick > 3) {
        clearInterval(spikeLoop);
        triggerAlert();
      }
    }, 800);
  };

  const triggerAlert = () => {
    setAlertActive(true);
    setZones(prev => prev.map(z => {
      if (z.id === 'Z-2') {
        return { ...z, status: 'CRITICAL' };
      }
      return z;
    }));
    
    addLog('ALRM', 'CHEMICAL SIGNATURE MATCH: Sub-Ohm Vape Juice / PG VG blend.');
    
    setTimeout(() => {
      addLog('DISP', 'SILENT ALARM: Dispatching Security Guard 4 to Executive Restroom A.');
    }, 1000);
  };

  const resetSystem = () => {
    setSystemActive(false);
    setAlertActive(false);
    setPm25(12);
    setVoc(45);
    setZones(zones.map(z => ({ ...z, status: 'Clear', pm25: 12, voc: 45 })));
    addLog('SYS', 'Sensors reset. Resuming baseline monitoring.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSecurityLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Security Ops Command (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-orange-900/50 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚨</span> Physical Security / IoT
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Vape/Smoke Detection <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Security Alert</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Attendees secretly vaping or smoking in indoor VIP areas often trigger massive venue fire alarms, causing disastrous event-wide evacuations. Eventra solves this by integrating the security dashboard with hidden IoT particulate sensors. If the sensors detect the specific chemical signature of sub-ohm vape juice (PG/VG) or smoke, it instantly sends a silent push notification to the nearest security guard with the exact zone, neutralizing the threat before the main fire alarm trips.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-orange-500 text-lg mr-2">🌫️</span> Air Quality Security Grid
               </h3>
               
               <div className="flex space-x-2">
                 <button 
                   onClick={resetSystem}
                   className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md border border-neutral-700 hover:bg-neutral-800 text-neutral-400"
                 >
                   Reset Sensors
                 </button>
                 <button 
                   onClick={!alertActive ? triggerVapeIncident : undefined}
                   disabled={alertActive}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                     alertActive ? 'bg-rose-900 text-rose-400 opacity-50 cursor-not-allowed' :
                     'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]'
                   }`}
                 >
                   {alertActive ? 'Security Dispatched' : 'Simulate Vape Incident'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               
               {/* Live Sensor Metrics (Zone 2 focused) */}
               <div className={`col-span-1 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 ${
                 alertActive ? 'bg-rose-900/20 border-rose-500/50' : 'bg-neutral-900 border-neutral-800'
               }`}>
                 {alertActive && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
                 
                 <div className="relative z-10 mb-4">
                   <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">PM2.5 Particulates</span>
                   <div className="flex items-end">
                     <span className={`text-2xl font-black font-mono leading-none ${alertActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                       {Math.floor(pm25)}
                     </span>
                     <span className="text-[10px] font-bold text-neutral-500 ml-1 pb-0.5">µg/m³</span>
                   </div>
                 </div>

                 <div className="relative z-10 border-t border-neutral-800 pt-3">
                   <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Volatile Orgs (VOC)</span>
                   <div className="flex items-end">
                     <span className={`text-2xl font-black font-mono leading-none ${alertActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                       {Math.floor(voc)}
                     </span>
                     <span className="text-[10px] font-bold text-neutral-500 ml-1 pb-0.5">ppb</span>
                   </div>
                 </div>
               </div>

               {/* Zone Status Grid */}
               <div className="col-span-2 space-y-2">
                 {zones.map(z => (
                   <div key={z.id} className={`p-3 rounded-lg border flex justify-between items-center transition-all ${
                     z.status === 'CRITICAL' ? 'bg-rose-950 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                     z.status === 'Elevated' ? 'bg-orange-950 border-orange-500' : 'bg-neutral-900 border-neutral-800'
                   }`}>
                     <div>
                       <span className={`text-xs font-bold ${z.status === 'CRITICAL' ? 'text-rose-300' : 'text-neutral-300'}`}>{z.name}</span>
                       <div className="flex space-x-3 mt-0.5 text-[9px] font-mono text-neutral-500">
                         <span>PM2.5: {Math.floor(z.pm25)}</span>
                         <span>VOC: {Math.floor(z.voc)}</span>
                       </div>
                     </div>
                     <div>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                         z.status === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
                         z.status === 'Elevated' ? 'bg-orange-600 text-white' : 'bg-emerald-900/50 text-emerald-500'
                       }`}>
                         {z.status}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>

             </div>

             {/* Security Log */}
             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2">Security Dispatch Matrix</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {securityLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-neutral-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'DISP' ? 'text-emerald-400 font-bold' : 
                       log.type === 'ALRM' ? 'text-rose-400 font-bold' : 'text-neutral-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Security Guard App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-black rounded-[3rem] border-[12px] border-neutral-900 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-white text-xs font-bold z-30">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-12 pb-6 px-4 flex flex-col relative overflow-hidden">
               
               {/* Background map graphic */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>

               <div className="text-center mb-6 relative z-10">
                 <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner border border-neutral-800">
                   👮
                 </div>
                 <h2 className="font-black text-white text-xl tracking-widest uppercase">Guard Portal</h2>
                 <p className="text-[10px] font-mono text-neutral-500 mt-1">Unit: Charlie-2</p>
               </div>

               {alertActive ? (
                 <div className="bg-rose-600 rounded-3xl p-6 shadow-[0_0_40px_rgba(225,29,72,0.5)] text-white animate-fade-in flex flex-col flex-1 border border-rose-500 relative overflow-hidden z-10">
                   {/* Warning stripes */}
                   <div className="absolute top-0 inset-x-0 h-4 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)]"></div>
                   
                   <div className="flex items-center space-x-3 mb-8 mt-4">
                     <span className="text-5xl animate-pulse">🔥</span>
                     <div>
                       <h3 className="font-black text-2xl leading-tight">SILENT ALARM</h3>
                       <p className="text-[10px] font-bold text-rose-200 uppercase mt-1 tracking-widest">Pre-Fire Alert Triggered</p>
                     </div>
                   </div>
                   
                   <div className="bg-black/30 rounded-2xl p-5 mb-6 backdrop-blur-sm">
                     <p className="text-[10px] text-rose-200 font-bold uppercase tracking-widest mb-1 border-b border-rose-500/30 pb-2">Location / Zone</p>
                     <p className="font-black text-xl mt-2">Executive Restroom A</p>
                     
                     <div className="mt-5 pt-4 border-t border-rose-500/30 grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[9px] text-rose-200 font-bold uppercase tracking-widest mb-1">Threat Type</p>
                         <p className="font-bold text-sm">Sub-Ohm Vape</p>
                       </div>
                       <div>
                         <p className="text-[9px] text-rose-200 font-bold uppercase tracking-widest mb-1">Status</p>
                         <p className="font-bold text-sm text-rose-300 animate-pulse">Action Required</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="mt-auto">
                     <p className="text-xs text-center text-rose-200 mb-3 font-bold">Intercept individual before main fire alarms engage.</p>
                     <button className="w-full bg-white text-rose-600 font-black py-4 rounded-xl shadow-xl uppercase tracking-widest text-sm hover:bg-neutral-100 transition">
                       Acknowledge & Intercept
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="bg-neutral-900 rounded-3xl p-6 shadow-inner text-neutral-300 flex flex-col items-center justify-center flex-1 border border-neutral-800 z-10">
                   <div className="relative">
                     <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                     <span className="text-6xl relative z-10 mb-4 block">🛡️</span>
                   </div>
                   <h3 className="font-bold text-lg text-white mt-4">Patrol Active</h3>
                   <p className="text-center text-xs text-neutral-500 mt-2">All sensor grids nominal. No anomalies detected in assigned sector.</p>
                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VapeSmokeDetectionSecurity;
