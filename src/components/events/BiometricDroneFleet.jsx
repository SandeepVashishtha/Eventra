import React, { useState } from 'react';

const BiometricDroneFleet = () => {
  const [fleetActive, setFleetActive] = useState(false);
  const [droneData, setDroneData] = useState([
    { id: 'DRN-Alpha', status: 'standby', altitude: 0, battery: 100, target: 'N/A' },
    { id: 'DRN-Bravo', status: 'standby', altitude: 0, battery: 100, target: 'N/A' },
    { id: 'DRN-Charlie', status: 'standby', altitude: 0, battery: 100, target: 'N/A' }
  ]);
  
  const [alerts, setAlerts] = useState([]);
  const [simState, setSimState] = useState('idle'); // idle, scanning, alert_found, dispatched

  const deployFleet = () => {
    setFleetActive(true);
    setSimState('scanning');
    
    // Animate drones taking off
    setDroneData(prev => prev.map(d => ({...d, status: 'patrol', altitude: 450, target: 'Sector 4 (Main Stage)'})));
    
    setTimeout(() => {
      // Simulate finding an emergency
      setSimState('alert_found');
      const newAlert = {
        id: `EMG-${Math.floor(Math.random() * 1000)}`,
        type: 'Crowd Crush Warning',
        severity: 'CRITICAL',
        lat: '34.0522° N',
        lon: '118.2437° W',
        detectedBy: 'DRN-Alpha',
        time: new Date().toLocaleTimeString()
      };
      
      setAlerts([newAlert]);
      
      setDroneData(prev => prev.map(d => 
        d.id === 'DRN-Alpha' ? {...d, status: 'tracking_alert', altitude: 150} : d
      ));
      
      setTimeout(() => {
        setSimState('dispatched');
        
        // Auto-dispatch medical
        setAlerts(prev => prev.map(a => 
          a.id === newAlert.id ? {...a, status: 'Medical Team Dispatched (ETA 90s)'} : a
        ));
        
      }, 3000);
      
    }, 4000);
  };

  const recallFleet = () => {
    setFleetActive(false);
    setSimState('idle');
    setAlerts([]);
    setDroneData(prev => prev.map(d => ({...d, status: 'standby', altitude: 0, target: 'N/A'})));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Fleet Command Console (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-sky-900/50 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🚁</span> Autonomous Hardware
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Biometric Drone <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Fleet Telemetry</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Dramatically improve life-safety at mega-events. Eventra's telemetry API interfaces with autonomous drone fleets. Live aerial video feeds are processed using edge-based computer vision to detect dangerous crowd crush dynamics or fallen attendees in dense mosh pits, instantly dispatching GPS coordinates to medical teams.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fleet Operations Command</h3>
               
               {fleetActive ? (
                 <button onClick={recallFleet} className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900">
                   Recall Fleet
                 </button>
               ) : (
                 <button onClick={deployFleet} className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]">
                   Deploy Drones
                 </button>
               )}
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
               {droneData.map(drone => (
                 <div key={drone.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                   {drone.status === 'patrol' && <div className="absolute top-0 left-0 w-full h-0.5 bg-sky-500 animate-pulse"></div>}
                   {drone.status === 'tracking_alert' && <div className="absolute top-0 left-0 w-full h-0.5 bg-rose-500 animate-pulse"></div>}
                   
                   <span className="font-bold text-white text-sm block mb-1">{drone.id}</span>
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                       drone.status === 'standby' ? 'bg-slate-800 text-slate-400' :
                       drone.status === 'patrol' ? 'bg-sky-900/50 text-sky-400' : 'bg-rose-900/50 text-rose-400'
                     }`}>
                       {drone.status}
                     </span>
                     <span className="text-[10px] font-mono text-emerald-500">{drone.battery}% 🔋</span>
                   </div>
                   <div className="text-[10px] text-slate-500 font-mono">
                     Alt: {drone.altitude}ft<br/>
                     Loc: {drone.target}
                   </div>
                 </div>
               ))}
             </div>

             <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 overflow-y-auto">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">AI Incident Log</h4>
               
               {alerts.length === 0 ? (
                 <div className="text-center text-slate-600 font-mono text-xs mt-4">
                   No critical incidents detected.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {alerts.map(alert => (
                     <div key={alert.id} className="bg-rose-950/30 border border-rose-900 rounded p-3 animate-fade-in-up">
                       <div className="flex justify-between items-start mb-1">
                         <span className="text-rose-500 font-black text-xs uppercase flex items-center">
                           <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 animate-ping"></span>
                           {alert.type}
                         </span>
                         <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
                       </div>
                       <p className="text-[10px] text-slate-300 font-mono mb-2">
                         Detected by: {alert.detectedBy} @ {alert.lat}, {alert.lon}
                       </p>
                       {alert.status && (
                         <div className="bg-emerald-900/30 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded inline-block uppercase">
                           ✓ {alert.status}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>

          </div>
        </div>

        {/* Right Side: Drone Vision UI Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full bg-black rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden aspect-[4/5] flex flex-col">
            
            {/* Camera Header */}
            <div className="bg-slate-900 p-3 border-b border-slate-800 flex justify-between items-center z-20">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${fleetActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                DRN-Alpha Feed
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Edge Compute Node 4</span>
            </div>

            {/* Video Canvas */}
            <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
              
              {!fleetActive ? (
                <div className="text-center text-slate-600 font-mono text-sm uppercase tracking-widest border border-slate-800 px-4 py-2 rounded">
                  Signal Offline
                </div>
              ) : (
                <div className="absolute inset-0">
                  {/* Fake Aerial Crowd Image */}
                  <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center filter grayscale transition-all duration-1000 ${
                    simState === 'alert_found' || simState === 'dispatched' ? 'scale-150 origin-bottom-right brightness-75' : 'scale-100'
                  }`}></div>
                  
                  {/* CV Overlay Graphics */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    
                    {/* Reticle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    </div>

                    {/* Scanning Line */}
                    {simState === 'scanning' && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-sky-500/50 shadow-[0_0_15px_#0ea5e9] animate-[scan_2s_linear_infinite]"></div>
                    )}

                    {/* Anomaly Detection */}
                    {(simState === 'alert_found' || simState === 'dispatched') && (
                      <div className="absolute bottom-1/4 right-1/4 animate-fade-in">
                        <div className="w-24 h-24 border-2 border-rose-500 bg-rose-500/20 rounded-full animate-pulse relative flex items-center justify-center">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded whitespace-nowrap shadow-lg">
                            DENSITY ANOMALY
                          </div>
                          
                          {simState === 'dispatched' && (
                            <div className="absolute -bottom-8 bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-lg animate-fade-in-up flex items-center whitespace-nowrap">
                              <span className="mr-1">🚑</span> Medic En Route
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* HUD Data */}
                    <div className="absolute bottom-4 left-4 font-mono text-[8px] text-sky-400 leading-tight">
                      <p>ALT: 450.02 ft</p>
                      <p>SPD: 12.4 kts</p>
                      <p>YAW: 14.2°</p>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 font-mono text-[8px] text-emerald-400 text-right leading-tight">
                      <p>OBJ DETECT: ACTIVE</p>
                      <p>THERMAL: OPTIMAL</p>
                      <p>LATENCY: 12ms</p>
                    </div>
                  </div>
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMHYyMEgyMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] pointer-events-none mix-blend-overlay opacity-50"></div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(500px); }
        }
      `}} />
    </div>
  );
};

export default BiometricDroneFleet;
