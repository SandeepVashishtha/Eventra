/* eslint-disable */
import React, { useState, useEffect } from 'react';

const BLEBeaconHeatmap = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Attendee coordinates for trilateration demo
  const [attendees, setAttendees] = useState(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      targetX: Math.random() * 100,
      targetY: Math.random() * 100,
      speed: Math.random() * 2 + 0.5
    }))
  );

  const [telemetryLog, setTelemetryLog] = useState([
    { id: 1, time: '10:00:00', msg: 'System Idle. Awaiting BLE packet aggregation.' }
  ]);

  // Three BLE Beacon Anchors (Corners of the room)
  const beacons = [
    { id: 'B1', x: 10, y: 10, color: 'text-sky-500' },
    { id: 'B2', x: 90, y: 10, color: 'text-violet-500' },
    { id: 'B3', x: 50, y: 90, color: 'text-fuchsia-500' }
  ];
  
  // ROI Zones (Sponsor Booths)
  const zones = [
    { id: 'Z-AWS', name: 'AWS Booth', x: 20, y: 60, w: 25, h: 25, visitors: 0 },
    { id: 'Z-MSFT', name: 'Microsoft', x: 65, y: 30, w: 20, h: 30, visitors: 0 }
  ];

  useEffect(() => {
    let loop;
    if (simulationActive) {
      loop = setInterval(() => {
        setAttendees(prev => prev.map(a => {
          let nx = a.x;
          let ny = a.y;
          let tx = a.targetX;
          let ty = a.targetY;

          // Move towards target
          const dx = tx - nx;
          const dy = ty - ny;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 2) {
            // Pick new target, bias towards booths
            if (Math.random() > 0.4) {
              const zone = zones[Math.floor(Math.random() * zones.length)];
              tx = zone.x + Math.random() * zone.w;
              ty = zone.y + Math.random() * zone.h;
            } else {
              tx = Math.random() * 100;
              ty = Math.random() * 100;
            }
          } else {
            nx += (dx / dist) * a.speed;
            ny += (dy / dist) * a.speed;
          }

          return { ...a, x: nx, y: ny, targetX: tx, targetY: ty };
        }));

        // Log random trilateration event
        if (Math.random() > 0.8) {
          const rsi1 = -Math.floor(Math.random() * 40 + 40);
          const rsi2 = -Math.floor(Math.random() * 40 + 40);
          const rsi3 = -Math.floor(Math.random() * 40 + 40);
          addLog(`RSSI Vector: [B1:${rsi1}dBm, B2:${rsi2}dBm, B3:${rsi3}dBm] -> Resolved (x:${Math.floor(Math.random()*100)}, y:${Math.floor(Math.random()*100)})`);
        }

      }, 100);
    }
    return () => clearInterval(loop);
  }, [simulationActive]);

  const addLog = (msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(Math.random()*999).toString().padStart(3, '0')}`;
    setTelemetryLog(prev => [{ id: Date.now() + Math.random(), time: timeStr, msg }, ...prev].slice(0, 10));
  };

  const toggleSim = () => {
    if (!simulationActive) {
      addLog('BLE Trilateration Engine Started.');
    } else {
      addLog('Engine Paused.');
    }
    setSimulationActive(!simulationActive);
  };

  // Calculate visitors in zones
  const activeZones = zones.map(z => ({
    ...z,
    visitors: attendees.filter(a => a.x >= z.x && a.x <= z.x + z.w && a.y >= z.y && a.y <= z.y + z.h).length
  }));

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Hardware Engine Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-sky-900/50 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📡</span> IoT Hardware API
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Micro-Location <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">BLE Heatmaps</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            GPS is highly inaccurate indoors, making it impossible for conference organizers to track exactly which sponsor booths are actually getting foot traffic. Eventra integrates with deployed Bluetooth Low Energy (BLE) beacons. The backend utilizes complex trilateration algorithms based on RSSI signal strength to calculate attendee positions down to a 2-foot indoor accuracy.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center">
                 <span className="text-sky-500 text-lg mr-2">🧮</span> Math Coprocessor
               </h3>
               
               <button 
                 onClick={toggleSim}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   simulationActive ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50 hover:bg-rose-900' : 'bg-sky-600 text-white hover:bg-sky-500 shadow-[0_0_15px_rgba(2,132,199,0.5)]'
                 }`}
               >
                 {simulationActive ? 'Halt Math Engine' : 'Start Trilateration'}
               </button>
             </div>

             <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-neutral-500 uppercase font-bold tracking-widest block mb-2 border-b border-neutral-800 pb-2 flex justify-between">
                 <span>Raw Packet Stream</span>
                 <span className={simulationActive ? 'text-emerald-400 animate-pulse' : 'text-neutral-600'}>● REC</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-neutral-400 pr-2">
                 {telemetryLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-sky-700/50 mr-2 shrink-0">[{log.time}]</span>
                     <span className={log.msg.includes('Resolved') ? 'text-sky-300' : 'text-neutral-500'}>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

             <div className="mt-4 flex space-x-2">
               {beacons.map(b => (
                 <div key={b.id} className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-center">
                   <span className={`text-[10px] font-bold ${b.color}`}>{b.id} ONLINE</span>
                 </div>
               ))}
             </div>

          </div>
        </div>

        {/* Right Side: Organizer Heatmap View (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl relative flex flex-col h-[600px] overflow-hidden font-sans">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-black/40">
              <div>
                <h2 className="font-black text-white text-xl">Exhibition Hall A</h2>
                <p className="text-xs text-neutral-500 font-mono mt-1">Sponsor ROI Dashboard (Live)</p>
              </div>
              <div className="flex space-x-4">
                {activeZones.map(z => (
                  <div key={z.id} className="text-right">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{z.name}</p>
                    <p className="font-black font-mono text-xl text-sky-400">{z.visitors} <span className="text-xs text-neutral-600">pax</span></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-neutral-950 relative overflow-hidden">
               
               {/* Grid Background */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

               {/* Sponsor Booths */}
               {zones.map(z => (
                 <div 
                   key={z.id}
                   className="absolute border-2 border-indigo-500/30 bg-indigo-500/10 rounded-lg flex items-center justify-center transition-all duration-300"
                   style={{
                     left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%`,
                     boxShadow: z.visitors > 5 ? '0 0 40px rgba(99,102,241,0.2) inset' : 'none'
                   }}
                 >
                   <span className="text-indigo-400/50 font-black tracking-widest uppercase text-sm rotate-[-45deg]">{z.name}</span>
                 </div>
               ))}

               {/* Beacons */}
               {beacons.map(b => (
                 <div key={b.id} className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center" style={{left: `${b.x}%`, top: `${b.y}%`}}>
                   {simulationActive && <div className={`absolute inset-0 rounded-full border border-current opacity-30 animate-ping ${b.color}`}></div>}
                   <div className={`w-3 h-3 rounded-full bg-current shadow-[0_0_10px_currentColor] ${b.color}`}></div>
                   <span className="absolute top-4 text-[8px] font-bold text-neutral-500">{b.id}</span>
                 </div>
               ))}

               {/* Heatmap Dots (Attendees) */}
               {attendees.map(a => (
                 <div 
                   key={a.id} 
                   className="absolute w-3 h-3 -ml-1.5 -mt-1.5 transition-all duration-100 ease-linear pointer-events-none"
                   style={{left: `${a.x}%`, top: `${a.y}%`}}
                 >
                   {/* Blur radius for heatmap effect */}
                   <div className="absolute inset-0 bg-sky-500 rounded-full blur-[4px] opacity-60"></div>
                   <div className="absolute inset-0 bg-white rounded-full scale-50 opacity-80"></div>
                 </div>
               ))}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BLEBeaconHeatmap;
