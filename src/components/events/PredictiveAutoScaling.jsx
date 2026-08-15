/* eslint-disable */
import React, { useState, useEffect } from 'react';

const PredictiveAutoScaling = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [sentimentSpike, setSentimentSpike] = useState(false);
  const [trafficSpike, setTrafficSpike] = useState(false);
  const [podCount, setPodCount] = useState(3);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '21:00:00', type: 'SYS', msg: 'K8s Horizontal Pod Autoscaler active. Listening to Twitter Firehose.' }
  ]);

  const triggerViralEvent = () => {
      setIsSimulating(true);
      setSentimentSpike(false);
      setTrafficSpike(false);
      addLog('ACTION', 'Simulating Main Stage: Surprise guest artist walks on stage.');
      
      // Step 1: Twitter Sentiment Spike (0 traffic yet)
      setTimeout(() => {
          setSentimentSpike(true);
          addLog('WARN', 'NLP Sentiment Engine detected 5000% velocity spike in keywords: "OMG", "DRAKE".');
          
          // Step 2: Preemptive Scaling
          setTimeout(() => {
              addLog('SYS', 'Preemptively spinning up 12 new Kubernetes pods BEFORE traffic hits...');
              setPodCount(15);
              
              // Step 3: Actual Traffic hits
              setTimeout(() => {
                  setTrafficSpike(true);
                  addLog('CRIT', 'Viral traffic surge hits API! 50,000 concurrent connections.');
                  
                  setTimeout(() => {
                      setIsSimulating(false);
                      addLog('SUCCESS', 'Cluster stabilized. 0 requests dropped. 100% uptime maintained.');
                  }, 2000);
              }, 2500);
          }, 1500);
      }, 1500);
  };
  
  const resetDemo = () => {
      setIsSimulating(false);
      setSentimentSpike(false);
      setTrafficSpike(false);
      setPodCount(3);
      addLog('SYS', 'Cluster downscaled to baseline (3 pods).');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  // Generate array for pods
  const renderPods = () => {
      const pods = [];
      for (let i = 0; i < 15; i++) {
          const isActive = i < podCount;
          pods.push(
              <div key={i} className={`h-12 border-2 rounded flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-slate-800 bg-slate-900 opacity-30'
              }`}>
                  <span className="text-xl">{isActive ? '🧊' : ''}</span>
              </div>
          );
      }
      return pods;
  };

  return (
    <div className="min-h-screen bg-[#020509] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚙️</span> DevOps & Kubernetes (SRE)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Predictive Server <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Auto-Scaling Engine</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Traditional AWS Auto-Scaling is reactive—it spins up new servers <i>after</i> CPU usage spikes, meaning the app still crashes for the first 5 minutes of a sudden viral traffic surge. Eventra solves this using a Predictive DevOps scaling engine. It continuously ingests the festival's Twitter/X feed. If sentiment analysis detects a sudden spike in viral velocity (e.g., a surprise guest artist appears), the algorithm preemptively spins up Kubernetes pods before attendees even open the app, ensuring 100% uptime.
          </p>

          <div className="bg-[#050912] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Social Sentiment Pipeline
               </h3>
               {trafficSpike && !isSimulating && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 flex flex-col mb-4">
                 
                 {/* Twitter Feed Box */}
                 <div className={`border-2 rounded-xl p-4 flex flex-col relative overflow-hidden transition-all duration-500 mb-4 ${
                     sentimentSpike ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-slate-800 bg-slate-900/50'
                 }`}>
                     <div className="flex justify-between items-center mb-3">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Twitter Firehose / NLP</span>
                         <div className="flex space-x-1">
                             <div className="w-1.5 h-3 bg-blue-500 animate-bounce"></div>
                             <div className="w-1.5 h-5 bg-blue-500 animate-bounce delay-75"></div>
                             <div className="w-1.5 h-2 bg-blue-500 animate-bounce delay-150"></div>
                         </div>
                     </div>
                     
                     <div className="space-y-2 font-mono text-[10px] text-slate-400">
                         <div className="flex items-center opacity-50"><span className="text-blue-400 mr-2">@user1:</span> Great set at Stage C!</div>
                         {sentimentSpike && (
                             <>
                                 <div className="flex items-center animate-fade-in-up font-bold text-rose-400"><span className="mr-2">@fan88:</span> OMG DRAKE JUST WALKED OUT</div>
                                 <div className="flex items-center animate-fade-in-up delay-75 font-bold text-rose-400"><span className="mr-2">@festgoer:</span> DRAKE IS HERE NO WAY</div>
                                 <div className="flex items-center animate-fade-in-up delay-150 font-bold text-rose-400"><span className="mr-2">@musicLvr:</span> MAIN STAGE RIGHT NOW DRAKE</div>
                             </>
                         )}
                     </div>
                 </div>
                 
                 <button 
                     onClick={triggerViralEvent}
                     disabled={isSimulating || trafficSpike}
                     className={`w-full py-3 rounded-xl border font-black text-sm uppercase tracking-widest transition-colors ${
                         trafficSpike ? 'bg-emerald-900/40 text-emerald-500 border-emerald-500/50 cursor-not-allowed' :
                         isSimulating ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 
                         'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                     }`}
                 >
                     {trafficSpike ? 'Viral Traffic Handled Successfully' : isSimulating ? 'Monitoring Sentiment...' : 'Trigger Viral Event (Surprise Guest)'}
                 </button>

             </div>
             
             {/* System Log */}
             <div className="h-28 bg-[#020305] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>Kubernetes Master Node</span>
                 {isSimulating && <span className="text-cyan-400 font-black animate-pulse">SCALING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'WARN' ? 'text-rose-400 font-bold' :
                       log.type === 'CRIT' ? 'text-amber-400 font-bold bg-amber-900/50 px-1 rounded' :
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                       log.type === 'SYS' ? 'text-cyan-300 font-bold' : 'text-slate-400'
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
            
            {/* Visualizer */}
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Cloud Infrastructure</span>
                      <span className="text-xs text-white font-bold">K8s Cluster Topology</span>
                  </div>
              </div>

              <div className="flex-1 bg-slate-950 p-6 flex flex-col relative overflow-hidden">
                  
                  {/* Load Balancer */}
                  <div className={`w-full border-2 rounded-xl p-3 mb-6 relative z-10 transition-colors duration-500 flex justify-between items-center ${
                      trafficSpike ? 'border-amber-500 bg-amber-950/20' : 'border-slate-700 bg-slate-900'
                  }`}>
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ingress Load Balancer</span>
                          <span className="text-xs font-bold text-white font-mono">
                              {trafficSpike ? '50,421 Req/s' : '1,204 Req/s'}
                          </span>
                      </div>
                      <div className="text-2xl">⚖️</div>
                  </div>

                  {/* Connecting Lines */}
                  <div className="absolute top-[80px] left-0 right-0 h-10 flex justify-center space-x-8 opacity-50 z-0">
                      <div className={`w-0.5 h-full ${trafficSpike ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                      <div className={`w-0.5 h-full ${trafficSpike ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                      <div className={`w-0.5 h-full ${trafficSpike ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                  </div>

                  {/* Pod Grid */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1 relative z-10 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Node Pool (us-east-1)</span>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {podCount}/15 Pods
                          </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 flex-1 content-start">
                          {renderPods()}
                      </div>
                  </div>

                  {/* Status Overlay */}
                  {trafficSpike && (
                      <div className="absolute bottom-6 left-6 right-6 z-20">
                          <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fade-in-up">
                              <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-500 flex items-center justify-center text-xl mr-3 shrink-0">🛡️</div>
                                  <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white mb-1">Zero Downtime Maintained</span>
                                      <span className="text-[9px] text-slate-300 leading-snug">Because pods were scaled <span className="font-bold text-emerald-400">before</span> the viral traffic hit, the cluster handled 50k concurrents effortlessly.</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050912] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">Preemptive Scaling:</span>
               Click <span className="text-white font-bold bg-blue-600 px-1 rounded">Trigger Viral Event</span>. When Drake walks on stage, Twitter immediately explodes. However, it takes attendees ~60 seconds to pull out their phones and open the Eventra app. Traditional autoscaling would wait for the app traffic to spike, causing the servers to crash instantly. By tying Kubernetes scaling directly to the NLP Sentiment Engine, the cluster spins up 15 pods <i>during</i> that 60-second window, ensuring the backend is fully provisioned before the massive traffic wave hits.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default PredictiveAutoScaling;
