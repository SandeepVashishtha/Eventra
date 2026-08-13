/* eslint-disable */
import React, { useState, useEffect } from 'react';

const SSEScheduleUpdates = () => {
  const [sseActive, setSseActive] = useState(false);
  const [activeConnections, setActiveConnections] = useState(0);
  const [dbQueriesSaved, setDbQueriesSaved] = useState(0);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '18:00:00', type: 'SYS', msg: 'SSE multiplexer initialized. Port 8080.' },
    { id: 2, time: '18:00:01', type: 'SYS', msg: 'Awaiting client HTTP connections with text/event-stream.' }
  ]);

  const defaultSchedule = [
    { id: 's1', artist: 'Tame Impala', time: '21:00 - 23:00', stage: 'Main Stage', status: 'ON_TIME', updated: false },
    { id: 's2', artist: 'Flume', time: '19:30 - 21:00', stage: 'Main Stage', status: 'ON_TIME', updated: false },
    { id: 's3', artist: 'Skrillex', time: '23:30 - 01:00', stage: 'Bass Tent', status: 'ON_TIME', updated: false }
  ];

  const [masterSchedule, setMasterSchedule] = useState(defaultSchedule);
  const [clientSchedules, setClientSchedules] = useState([defaultSchedule, defaultSchedule, defaultSchedule]);

  // Simulate establishing SSE connections
  const startSSEConnections = () => {
      setSseActive(true);
      addLog('ACTION', `Accepting incoming SSE handshakes from fleet...`);
      
      let count = 0;
      const connectInterval = setInterval(() => {
          count += 10000;
          setActiveConnections(prev => {
              const next = prev + Math.floor(Math.random() * 15000) + 5000;
              return next > 50000 ? 50000 : next;
          });
          
          if (count > 50000) {
              clearInterval(connectInterval);
              addLog('SUCCESS', `50,000 active HTTP keep-alive connections established. DB Load: 0`);
          }
      }, 800);
  };

  const pushScheduleUpdate = () => {
      if (!sseActive || activeConnections < 50000) {
          addLog('WARN', 'Establish SSE connections before pushing updates.');
          return;
      }
      
      addLog('ACTION', 'Festival Director pushed schedule update: [Tame Impala Delayed - Rain].');
      
      // 1. Update Master DB
      const updatedMaster = masterSchedule.map(s => 
          s.id === 's1' ? { ...s, time: '21:45 - 23:30', status: 'DELAYED', updated: true } : s
      );
      setMasterSchedule(updatedMaster);
      
      // 2. Simulate instantaneous SSE Push to clients without DB polling
      addLog('SYS', 'Pushing text/event-stream payload to 50,000 TCP sockets...');
      
      setTimeout(() => {
          setClientSchedules([updatedMaster, updatedMaster, updatedMaster]);
          setDbQueriesSaved(prev => prev + 50000);
          addLog('SUCCESS', 'Payload delivered to 50,000 devices simultaneously in 42ms. 50,000 DB SELECT queries prevented.');
          
          // Clear highlight after a few seconds
          setTimeout(() => {
              const resetHighlight = updatedMaster.map(s => ({ ...s, updated: false }));
              setMasterSchedule(resetHighlight);
              setClientSchedules([resetHighlight, resetHighlight, resetHighlight]);
          }, 3000);
          
      }, 600);
  };

  const resetSimulation = () => {
      setSseActive(false);
      setActiveConnections(0);
      setDbQueriesSaved(0);
      setMasterSchedule(defaultSchedule);
      setClientSchedules([defaultSchedule, defaultSchedule, defaultSchedule]);
      addLog('SYS', 'Simulation reset. Sockets closed.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020813] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚡</span> High-Concurrency Networking
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Server-Sent Events (SSE) <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500">Real-Time Updates</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            When a headliner is delayed due to weather, 50,000 attendees pull-to-refresh the schedule simultaneously. This HTTP REST polling causes a massive DDoS-like load on the backend database. Eventra solves this using Server-Sent Events (SSE). Attendees open the schedule and establish a persistent, unidirectional HTTP connection. When the festival director makes a change, the backend pushes the update instantly to all clients concurrently with virtually zero database overhead.
          </p>

          <div className="bg-[#050c18] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[420px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-cyan-500 text-lg mr-2">🎛️</span> Festival Director CMS
               </h3>
               
               <div className="flex space-x-2">
                 {!sseActive ? (
                     <button 
                       onClick={startSSEConnections}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-cyan-900/40 border border-cyan-500 text-cyan-400 hover:bg-cyan-800/60"
                     >
                       Open Event Stream
                     </button>
                 ) : (
                     <button 
                       onClick={resetSimulation}
                       className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md bg-slate-800 text-slate-400 hover:bg-slate-700"
                     >
                       Reset
                     </button>
                 )}
               </div>
             </div>

             <div className="grid grid-cols-4 gap-4 mb-6">
               
               {/* Active Connections */}
               <div className="col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   Active SSE Sockets
                 </span>
                 <div className="flex items-end">
                   <span className={`text-3xl font-black font-mono leading-none transition-colors duration-300 ${activeConnections > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                     {activeConnections.toLocaleString()}
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 ml-1 pb-1">clients</span>
                 </div>
               </div>
               
               {/* DB Queries Saved */}
               <div className="col-span-2 p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden transition-all duration-300 bg-slate-900 border-slate-800">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
                   DB Polling Queries Prevented
                 </span>
                 <div className="flex flex-col">
                     <div className="flex items-end">
                       <span className={`text-3xl font-black font-mono leading-none ${dbQueriesSaved > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                         {dbQueriesSaved.toLocaleString()}
                       </span>
                     </div>
                 </div>
               </div>

             </div>
             
             {/* CMS Action */}
             <div className="mb-4">
                 <button
                    onClick={pushScheduleUpdate}
                    disabled={activeConnections < 50000}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                        activeConnections < 50000 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                        'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                    }`}
                 >
                     <span className="mr-2">⚠️</span> Push Emergency Delay (Tame Impala)
                 </button>
             </div>

             {/* System Log */}
             <div className="flex-1 bg-[#020408] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Nginx Multiplexer Log (text/event-stream)</span>
                 {sseActive && <span className="text-cyan-400 font-black animate-pulse">STREAM OPEN</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'SYS' ? 'text-slate-400 font-bold' :
                       log.type === 'ACTION' ? 'text-rose-400 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Visualizers (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[480px] flex flex-col items-center">
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Mobile App Fleet Simulator (50k Clients)</h3>
            
            <div className="grid grid-cols-3 gap-3 w-full mb-6">
                
                {/* Render 3 simulated mobile phones */}
                {[0, 1, 2].map((phoneIndex) => (
                    <div key={phoneIndex} className="bg-slate-200 rounded-[1.5rem] border-[6px] border-slate-300 shadow-xl relative flex flex-col h-[300px] overflow-hidden font-sans">
                        
                        {/* iOS Header */}
                        <div className="h-6 flex justify-between items-center px-4 text-slate-800 text-[8px] font-bold bg-white z-10">
                          <span>9:41</span>
                          <div className="flex space-x-1 items-center">
                            {sseActive ? <span className="text-emerald-500 font-black">SSE ✅</span> : <span>5G</span>}
                          </div>
                        </div>
                        
                        <div className="bg-indigo-600 text-white p-3 shadow-md relative z-10">
                            <h2 className="text-sm font-black tracking-tight leading-none">Main Stage</h2>
                        </div>
                        
                        <div className="flex-1 bg-slate-50 p-2 space-y-2 relative overflow-hidden">
                            {clientSchedules[phoneIndex].map((artist, idx) => (
                                <div key={idx} className={`p-2 rounded-lg border shadow-sm transition-all duration-500 ${
                                    artist.updated ? 'bg-rose-100 border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-[1.02] transform' : 'bg-white border-slate-200'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-xs font-black ${artist.updated ? 'text-rose-700' : 'text-slate-800'}`}>{artist.artist}</h4>
                                        {artist.status === 'DELAYED' && (
                                            <span className="bg-rose-500 text-white text-[7px] px-1 py-0.5 rounded uppercase font-bold animate-pulse">Delay</span>
                                        )}
                                    </div>
                                    <p className={`text-[9px] font-mono mt-1 font-bold ${artist.updated ? 'text-rose-600' : 'text-slate-500'}`}>{artist.time}</p>
                                </div>
                            ))}
                            
                            {/* Visual SSE Connection Line */}
                            {sseActive && (
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-50">
                                    <div className="w-full h-8 bg-white blur-[2px] animate-[slide_2s_infinite]"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050c18] p-4 rounded-xl border border-cyan-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-cyan-400 uppercase block mb-1">Zero-Polling Architecture:</span>
               Notice how pushing the schedule update from the CMS instantly alters the UI on all 3 mobile devices simultaneously, without any loading spinners or pull-to-refresh requests hitting a backend database.
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(300px); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default SSEScheduleUpdates;
