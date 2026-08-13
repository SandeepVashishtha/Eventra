/* eslint-disable */
import React, { useState, useEffect } from 'react';

const GeofencedPushCampaign = () => {
  const [isPolygonDrawn, setIsPolygonDrawn] = useState(false);
  const [message, setMessage] = useState('Last call for exclusive merch! 50% off for the next 15 mins.');
  const [targetAudience, setTargetAudience] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '14:00:00', type: 'SYS', msg: 'Spatial Database (PostGIS) connected. Total global devices: 102,405.' }
  ]);

  const togglePolygon = () => {
      setIsPolygonDrawn(!isPolygonDrawn);
      
      if (!isPolygonDrawn) {
          addLog('ACTION', 'User drew spatial polygon around [Merch Tent] coordinates.');
          addLog('SYS', 'Executing PostGIS Query: SELECT count(device_id) FROM users WHERE ST_Contains(polygon, location)');
          
          // Simulate DB query delay
          setTimeout(() => {
              const count = Math.floor(Math.random() * (4500 - 3500 + 1) + 3500);
              setTargetAudience(count);
              addLog('SUCCESS', `Spatial Query Complete. ${count.toLocaleString()} devices found inside geofence.`);
          }, 800);
      } else {
          setTargetAudience(0);
          addLog('WARN', 'Geofence removed. Target audience reset to 0.');
      }
  };

  const launchCampaign = () => {
      if (!isPolygonDrawn || !message.trim() || targetAudience === 0) return;
      
      setIsSending(true);
      addLog('ACTION', `Initiating targeted push campaign to ${targetAudience.toLocaleString()} devices...`);
      
      setTimeout(() => {
          setIsSending(false);
          setIsPolygonDrawn(false);
          setTargetAudience(0);
          setMessage('');
          addLog('SUCCESS', 'Campaign deployed successfully. Global spam prevented.');
      }, 2500);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#0d050a] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-900/40 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📍</span> Spatial Databases & MarTech
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Geofenced Targeted Push <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500">Campaign Builder</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Sending a global push notification ("Last call for merch!") to 100,000 attendees annoys the 80,000 people who are currently watching a headliner and nowhere near the merch tent, leading to massive opt-out rates. Eventra solves this by building a spatial marketing UI. Marketers can draw a digital polygon around specific map coordinates. The backend queries a spatial database (like PostGIS) and pushes the notification exclusively to devices currently residing within that geofence.
          </p>

          <div className="bg-[#170a13] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🎛️</span> Campaign Config
               </h3>
               
               <div className="flex space-x-2">
                 <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-500">
                     TARGET_AUDIENCE: <span className={targetAudience > 0 ? "text-pink-400 font-bold" : ""}>{targetAudience.toLocaleString()}</span>
                 </div>
               </div>
             </div>

             <div className="flex-1 flex flex-col space-y-4 mb-6">
                 
                 {/* Message Input */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Notification Payload</span>
                     <textarea 
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         disabled={isSending}
                         placeholder="Enter push notification message..."
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors resize-none h-20 placeholder-slate-600 disabled:opacity-50"
                     />
                 </div>

                 {/* Action Button */}
                 <button 
                     onClick={launchCampaign}
                     disabled={!isPolygonDrawn || targetAudience === 0 || !message.trim() || isSending}
                     className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md flex items-center justify-center ${
                         (!isPolygonDrawn || targetAudience === 0 || !message.trim() || isSending) ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' :
                         'bg-pink-600 text-white border border-pink-500 hover:bg-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.4)]'
                     }`}
                 >
                     {isSending ? (
                         <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> DEPLOYING CAMPAIGN...</>
                     ) : (
                         <><span className="mr-2">🚀</span> LAUNCH TARGETED CAMPAIGN</>
                     )}
                 </button>
             </div>
             
             {/* System Log */}
             <div className="h-32 bg-[#090407] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>PostGIS Query Logs</span>
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-pink-400 font-bold' : 
                       log.type === 'SUCCESS' ? 'text-emerald-500 font-bold' :
                       log.type === 'WARN' ? 'text-amber-500 font-bold' :
                       log.type === 'SYS' ? 'text-purple-300 font-bold' : 'text-slate-400'
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
            
            {/* Spatial UI Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-500`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Spatial Marketing UI</span>
                      <span className="text-xs text-white font-bold flex items-center">
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse mr-2"></span> Live Map Geometry
                      </span>
                  </div>
                  <button 
                      onClick={togglePolygon}
                      disabled={isSending}
                      className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                          isPolygonDrawn ? 'bg-rose-900/50 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
                      }`}
                  >
                      {isPolygonDrawn ? 'Clear Polygon' : 'Draw Polygon'}
                  </button>
              </div>

              {/* Map Area */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
                  
                  {/* Grid / Blueprint Base */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                  
                  {/* Festival Features */}
                  <div className="absolute top-[20%] left-[20%] w-[100px] h-[60px] border border-slate-700/50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-600 uppercase bg-slate-900/30">Main Stage</div>
                  
                  <div className="absolute top-[60%] left-[60%] w-[80px] h-[80px] border border-slate-700/50 rounded-full flex items-center justify-center text-[10px] font-black text-slate-600 uppercase bg-slate-900/30 z-10">Food</div>
                  
                  {/* Merch Tent (The target) */}
                  <div className="absolute top-[30%] right-[15%] w-[90px] h-[70px] flex items-center justify-center text-[10px] font-black text-slate-400 uppercase bg-purple-900/20 border border-purple-500/30 rounded z-10">Merch Tent</div>

                  {/* SVG Geofence Polygon Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      {isPolygonDrawn && (
                          <>
                              <polygon 
                                  points="240,110 370,120 380,210 230,220" 
                                  fill="rgba(236, 72, 153, 0.15)" 
                                  stroke="rgba(236, 72, 153, 0.8)" 
                                  strokeWidth="2"
                                  strokeDasharray="4 4"
                                  className="animate-pulse"
                              />
                              {/* Polygon Nodes */}
                              <circle cx="240" cy="110" r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
                              <circle cx="370" cy="120" r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
                              <circle cx="380" cy="210" r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
                              <circle cx="230" cy="220" r="4" fill="white" stroke="#ec4899" strokeWidth="2" />
                          </>
                      )}
                  </svg>
                  
                  {/* Floating Devices (Simulating global audience) */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                      {Array.from({length: 40}).map((_, i) => (
                          <div 
                              key={i} 
                              className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isPolygonDrawn && i % 3 === 0 && i > 25 ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-slate-700'}`}
                              style={{
                                  left: `${Math.random() * 80 + 10}%`,
                                  top: `${Math.random() * 80 + 10}%`
                              }}
                          ></div>
                      ))}
                      
                      {/* Enforce some dots inside the polygon for visual accuracy */}
                      <div className={`absolute top-[35%] right-[20%] w-1.5 h-1.5 rounded-full ${isPolygonDrawn ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-slate-700'}`}></div>
                      <div className={`absolute top-[40%] right-[25%] w-1.5 h-1.5 rounded-full ${isPolygonDrawn ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-slate-700'}`}></div>
                      <div className={`absolute top-[32%] right-[28%] w-1.5 h-1.5 rounded-full ${isPolygonDrawn ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-slate-700'}`}></div>
                      <div className={`absolute top-[42%] right-[18%] w-1.5 h-1.5 rounded-full ${isPolygonDrawn ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-slate-700'}`}></div>
                  </div>

                  {/* Broadcast Animation Overlay */}
                  {isSending && (
                      <div className="absolute inset-0 bg-pink-900/20 backdrop-blur-[1px] z-30 flex items-center justify-center">
                          <div className="w-32 h-32 border-4 border-pink-500 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute text-xl">📡</div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#170a13] p-4 rounded-xl border border-pink-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-pink-400 uppercase block mb-1">ST_Contains Spatial Query:</span>
               Click <span className="text-white font-bold bg-slate-800 px-1 rounded">Draw Polygon</span> to define a geofence around the Merch Tent. The UI simulates a PostGIS backend calculating exactly how many user devices currently reside within those latitude/longitude boundaries. Click <span className="text-white font-bold bg-pink-600 px-1 rounded">Launch Campaign</span> to broadcast the push notification exclusively to that highly-targeted subset of users.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default GeofencedPushCampaign;
