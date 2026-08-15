/* eslint-disable */
import React, { useState, useEffect } from 'react';

const AutomatedPostMortem = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  
  const [sysLog, setSysLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'SRE Dashboard initialized. Outage #8812 (Ticketing API) resolved.' }
  ]);

  const generateReport = () => {
      setIsGenerating(true);
      setResult(null);
      addLog('ACTION', 'Initiating LLM Post-Mortem Synthesis Pipeline...');
      
      setTimeout(() => {
          addLog('SYS', 'Ingesting 4,201 lines of raw Slack chat logs from #incident-ticketing channel.');
          addLog('SYS', 'Ingesting PagerDuty alert timelines and Grafana CPU telemetry metrics.');
          
          setTimeout(() => {
              addLog('WARN', 'LLM contextualizing root cause and extracting action items...');
              
              setTimeout(() => {
                  setIsGenerating(false);
                  setResult('GENERATED');
                  addLog('SUCCESS', 'Post-Mortem document synthesized successfully in 4.2 seconds.');
              }, 2000);
          }, 1500);
      }, 1000);
  };
  
  const resetDemo = () => {
      setIsGenerating(false);
      setResult(null);
      addLog('SYS', 'Demo reset. Ready to generate new report.');
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSysLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#020608] flex items-center justify-center font-sans p-6 text-slate-300">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Control Hub (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🧠</span> AI & Site Reliability Engineering (SRE)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Automated Incident <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-500">Post-Mortem Generator</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            After a major outage (e.g., ticketing API crash), Site Reliability Engineers hate writing the mandatory 10-page retrospective document, often delaying it until critical details are forgotten. Eventra solves this by integrating an LLM pipeline into the admin dashboard. When an incident resolves, the LLM ingests the raw Slack logs, PagerDuty alerts, and Grafana metrics. It automatically synthesizes a professional, structured post-mortem document for the engineering team to review.
          </p>

          <div className="bg-[#050b12] rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <span className="text-blue-500 text-lg mr-2">🎛️</span> Raw Telemetry Ingestion
               </h3>
               {result === 'GENERATED' && (
                   <button onClick={resetDemo} className="text-[9px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset Demo</button>
               )}
             </div>

             <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                 
                 {/* Raw Slack Logs */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col relative overflow-hidden">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">#incident-ticketing (Slack)</span>
                     <div className="space-y-2 text-[8px] font-mono opacity-60">
                         <div><span className="text-rose-400">@pagerduty:</span> INC-8812 Triggered: API 500s</div>
                         <div><span className="text-blue-400">sarah_dev:</span> Anyone looking at this?</div>
                         <div><span className="text-emerald-400">mike_ops:</span> Yeah, DB CPU is at 100%</div>
                         <div><span className="text-blue-400">sarah_dev:</span> Did the Redis cache evict?</div>
                         <div><span className="text-emerald-400">mike_ops:</span> Rolling back deploy v1.4.2</div>
                     </div>
                     {isGenerating && (
                         <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] flex items-center justify-center">
                             <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Ingesting...</span>
                         </div>
                     )}
                 </div>

                 {/* Raw Grafana Metrics */}
                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col relative overflow-hidden">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Grafana Metrics Data</span>
                     <div className="flex-1 flex items-end space-x-1 opacity-60 pb-2">
                         <div className="w-full bg-emerald-500 h-[10%]"></div>
                         <div className="w-full bg-emerald-500 h-[12%]"></div>
                         <div className="w-full bg-rose-500 h-[95%]"></div>
                         <div className="w-full bg-rose-500 h-[100%]"></div>
                         <div className="w-full bg-rose-500 h-[98%]"></div>
                         <div className="w-full bg-emerald-500 h-[15%]"></div>
                     </div>
                     {isGenerating && (
                         <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px] flex items-center justify-center">
                             <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Ingesting...</span>
                         </div>
                     )}
                 </div>

             </div>

             <button 
                 onClick={generateReport}
                 disabled={isGenerating || result === 'GENERATED'}
                 className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-colors mb-4 ${
                     result === 'GENERATED' ? 'bg-emerald-600' :
                     isGenerating ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' :
                     'bg-blue-600 hover:bg-blue-500'
                 }`}
             >
                 {result === 'GENERATED' ? '✅ Synthesis Complete' : isGenerating ? 'Synthesizing with LLM...' : 'Generate Post-Mortem'}
             </button>
             
             {/* System Log */}
             <div className="h-28 bg-[#020406] rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner shrink-0">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2 flex justify-between">
                 <span>LLM Pipeline Logs</span>
                 {isGenerating && <span className="text-blue-400 font-black animate-pulse">PROCESSING...</span>}
               </span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {sysLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'ACTION' ? 'text-blue-400 font-bold' : 
                       log.type === 'WARN' ? 'text-amber-400 font-bold' :
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
            <div className={`w-full bg-[#111827] rounded-[1.5rem] border-[4px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col h-[520px] overflow-hidden font-sans mb-6 transition-all duration-1000 ${
                result === 'GENERATED' ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''
            }`}>
              
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10 relative">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">LLM Output Output</span>
                      <span className="text-xs text-white font-bold">Generated Retrospective</span>
                  </div>
              </div>

              <div className="flex-1 bg-white p-6 flex flex-col relative overflow-y-auto">
                  
                  {!isGenerating && !result && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                          <div className="text-6xl mb-4 grayscale">📄</div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center">
                              Awaiting Telemetry Ingestion
                          </span>
                      </div>
                  )}

                  {isGenerating && (
                      <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <span className="text-[10px] text-blue-500 font-mono uppercase tracking-widest animate-pulse">Generating Markdown...</span>
                          
                          {/* Fake loading lines */}
                          <div className="w-3/4 mt-8 space-y-2 opacity-20">
                              <div className="h-2 bg-blue-500 rounded animate-pulse"></div>
                              <div className="h-2 bg-blue-500 rounded w-5/6 animate-pulse delay-75"></div>
                              <div className="h-2 bg-blue-500 rounded w-4/6 animate-pulse delay-150"></div>
                          </div>
                      </div>
                  )}

                  {result === 'GENERATED' && (
                      <div className="flex-1 flex flex-col animate-fade-in-up text-slate-800 text-xs">
                          
                          <h1 className="text-lg font-black border-b pb-2 mb-4">Incident Retrospective: INC-8812</h1>
                          
                          <h2 className="font-bold text-sm text-blue-600 mb-2">Summary</h2>
                          <p className="mb-4">Between 10:14 and 10:22, the Ticketing API experienced a 100% error rate, resulting in failed checkouts. The root cause was a Redis cache eviction triggered by deploy v1.4.2.</p>
                          
                          <h2 className="font-bold text-sm text-blue-600 mb-2">Timeline (UTC)</h2>
                          <ul className="list-disc pl-4 mb-4 space-y-1">
                              <li><strong>10:14</strong>: PagerDuty triggers INC-8812.</li>
                              <li><strong>10:15</strong>: DB CPU spikes to 100% (Grafana).</li>
                              <li><strong>10:18</strong>: @sarah_dev identifies Redis cache eviction.</li>
                              <li><strong>10:22</strong>: @mike_ops completes rollback to v1.4.1. Recovery.</li>
                          </ul>

                          <h2 className="font-bold text-sm text-blue-600 mb-2">Root Cause</h2>
                          <p className="mb-4">Deploy v1.4.2 contained a malformed regex query that bypassed the Redis caching layer, sending raw, unindexed queries directly to the Postgres primary, immediately exhausting CPU resources.</p>

                          <h2 className="font-bold text-sm text-blue-600 mb-2">Action Items</h2>
                          <ul className="list-none space-y-2">
                              <li className="flex items-start">
                                  <input type="checkbox" className="mt-1 mr-2" />
                                  <span>Add unit tests for regex query caching logic (@sarah_dev)</span>
                              </li>
                              <li className="flex items-start">
                                  <input type="checkbox" className="mt-1 mr-2" />
                                  <span>Implement circuit breaker for DB CPU > 90% (@mike_ops)</span>
                              </li>
                          </ul>

                      </div>
                  )}

              </div>
            </div>

            {/* Hint Box */}
            <div className="w-full bg-[#050b12] p-4 rounded-xl border border-blue-900/30 text-[10px] text-slate-400 text-center">
               <span className="font-bold text-blue-400 uppercase block mb-1">AI Automated SRE:</span>
               Click <span className="text-white font-bold bg-blue-600 px-1 rounded">Generate Post-Mortem</span>. Instead of an exhausted engineer spending 4 hours manually piecing together timestamps from Slack and Grafana, the LLM pipeline ingests the unstructured raw telemetry. It accurately contextualizes the chaos, identifies the root cause, extracts the timeline, and formats a pristine Markdown document in 4.2 seconds, saving immense engineering resources.
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AutomatedPostMortem;
