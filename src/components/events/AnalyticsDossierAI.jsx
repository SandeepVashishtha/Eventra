import React, { useState, useEffect } from 'react';

const AnalyticsDossierAI = () => {
  const [pipelineState, setPipelineState] = useState('idle'); // idle, ingesting, generating, complete
  const [progress, setProgress] = useState(0);
  
  // Pipeline Logs
  const [logs, setLogs] = useState([
    { id: 1, text: 'System standing by for telemetry ingestion.' }
  ]);

  // Dossier Pages (Simulated)
  const [activePage, setActivePage] = useState(1);
  const totalPages = 3; // Demo length

  const generateDossier = () => {
    setPipelineState('ingesting');
    setLogs([]);
    setProgress(0);
    setActivePage(1);
    
    // Simulate Data Ingestion
    setTimeout(() => {
      addLog('Ingesting 42,000 ticket scan records...');
      setProgress(15);
      
      setTimeout(() => {
        addLog('Ingesting 14,200 NFC booth taps...');
        setProgress(30);
        
        setTimeout(() => {
          addLog('Ingesting 8,500 session attendance telemetry points...');
          setProgress(45);
          
          setPipelineState('generating');
          
          // Simulate LLM Generation
          setTimeout(() => {
            addLog('Initializing Large Language Model (Context Window: 128k)...');
            setProgress(60);
            
            setTimeout(() => {
              addLog('LLM drafting narrative executive summaries...');
              setProgress(75);
              
              setTimeout(() => {
                addLog('Formatting PDF dossier and applying sponsor branding...');
                setProgress(90);
                
                setTimeout(() => {
                  setPipelineState('complete');
                  setProgress(100);
                  addLog('Executive Dossier compilation complete. Ready for distribution.');
                }, 1500);
                
              }, 2000);
            }, 2500);
          }, 1500);
          
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const addLog = (text) => {
    setLogs(prev => [...prev, { id: Date.now(), text }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Business Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            AI-Generated <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-600">Analytics Dossier</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Sponsors ignore standard, boring PDF analytics reports filled with raw charts, making it incredibly hard to prove ROI. Eventra pipes all event telemetry into a Large Language Model. The LLM acts as an executive analyst, automatically drafting a narrative-driven intelligence dossier that contextualizes raw data into compelling business insights for your sponsors.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-violet-500 text-lg mr-2">🤖</span> LLM Pipeline Engine
               </h3>
               
               <button 
                 onClick={generateDossier}
                 disabled={pipelineState === 'ingesting' || pipelineState === 'generating'}
                 className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition shadow-sm flex items-center disabled:opacity-50 ${
                   pipelineState === 'complete' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-violet-600 hover:bg-violet-500 text-white'
                 }`}
               >
                 {pipelineState === 'complete' ? 'Regenerate Dossier' : 
                  (pipelineState === 'ingesting' || pipelineState === 'generating') ? 'Processing...' : 'Run LLM Analysis'}
               </button>
             </div>

             <div className="mb-6">
               <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                 <span>{pipelineState.replace('_', ' ')}</span>
                 <span>{progress}%</span>
               </div>
               <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                 <div 
                   className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                   style={{ width: \`\${progress}%\` }}
                 ></div>
               </div>
             </div>

             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Generation Terminal</span>
               
               <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 pr-2">
                 {logs.map((log) => (
                   <div key={log.id} className="animate-fade-in-up">
                     <span className="text-violet-500 font-bold mr-2">&gt;</span>
                     <span className={log.text.includes('complete') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{log.text}</span>
                   </div>
                 ))}
                 
                 {(pipelineState === 'ingesting' || pipelineState === 'generating') && (
                   <div className="flex items-center space-x-2 animate-pulse mt-2">
                     <span className="text-fuchsia-500 font-bold">&gt;</span>
                     <div className="w-2 h-4 bg-fuchsia-500"></div>
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Generated Dossier Viewer (Col span 6) */}
        <div className="lg:col-span-6 flex flex-col pt-10 lg:pt-0">
          
          <div className="w-full bg-slate-200 rounded-lg p-2 shadow-2xl relative flex flex-col h-[700px] border border-slate-300">
            
            {/* PDF Viewer Header */}
            <div className="h-12 bg-slate-100 rounded-t border-b border-slate-300 flex justify-between items-center px-4">
              <div className="flex space-x-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono">Q3_AcmeCorp_Executive_Dossier.pdf</span>
              <div className="flex space-x-2 items-center">
                 <button 
                   onClick={() => setActivePage(Math.max(1, activePage - 1))}
                   disabled={pipelineState !== 'complete' || activePage === 1}
                   className="p-1 text-slate-500 disabled:opacity-30"
                 >⬆️</button>
                 <span className="text-xs font-mono">{activePage} / {totalPages}</span>
                 <button 
                   onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}
                   disabled={pipelineState !== 'complete' || activePage === totalPages}
                   className="p-1 text-slate-500 disabled:opacity-30"
                 >⬇️</button>
              </div>
            </div>

            {/* Document Content Area */}
            <div className="flex-1 bg-white overflow-y-auto relative p-8 shadow-inner">
              
              {pipelineState !== 'complete' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur z-10 text-slate-400">
                   <div className="text-6xl mb-4 opacity-20">📄</div>
                   <p className="font-bold text-sm uppercase tracking-widest">Document Pending Generation</p>
                </div>
              ) : (
                <div className="animate-fade-in text-slate-800 font-serif max-w-lg mx-auto">
                  
                  {activePage === 1 && (
                    <div className="space-y-6">
                      <div className="border-b-2 border-violet-900 pb-4 mb-8">
                        <h1 className="text-3xl font-black text-violet-950 uppercase tracking-wider">Strategic Impact Report</h1>
                        <p className="text-sm font-sans text-slate-500 font-bold uppercase tracking-widest mt-2">Prepared Exclusively For: Acme Corp</p>
                      </div>
                      
                      <p className="text-sm leading-loose">
                        <span className="text-violet-900 font-bold text-xl float-left mr-2 leading-none">T</span>his dossier provides a comprehensive intelligence brief regarding Acme Corp's sponsorship ROI at the Global Tech Summit 2026. Rather than presenting raw engagement numbers, Eventra's AI has synthesized 14,200 individual telemetry points to construct a narrative of your brand's specific market penetration.
                      </p>
                      
                      <h3 className="font-bold text-lg font-sans text-violet-900 mt-6">Executive Summary</h3>
                      <p className="text-sm leading-loose">
                        Your headline sponsorship of the "Future of Cloud" track yielded an unprecedented 42% interaction rate among attending CTOs. However, the data reveals a critical insight: attendees engaged with your interactive booth 3x longer than they spent listening to the keynote address, suggesting your product's tactile experience is your strongest sales driver.
                      </p>
                    </div>
                  )}

                  {activePage === 2 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-lg font-sans text-violet-900 border-b border-slate-200 pb-2">Audience Synergy & Intent</h3>
                      
                      <div className="bg-slate-50 p-4 rounded border border-slate-200 my-4 font-sans text-xs flex justify-between items-center">
                        <div>
                          <span className="block font-bold text-slate-900 text-sm">Decision Maker Dwell Time</span>
                          <span className="text-slate-500">Average time spent in Acme Corp zone</span>
                        </div>
                        <span className="text-2xl font-black text-violet-700">14m 20s</span>
                      </div>
                      
                      <p className="text-sm leading-loose">
                        Our natural language processing models analyzed the anonymized Q&A transcripts from your sponsored sessions. The dominant sentiment among Enterprise architects was "curiosity regarding integration timelines," whereas Start-up founders expressed "concern over pricing tiers."
                      </p>
                      <p className="text-sm leading-loose mt-4">
                        <strong className="text-violet-900">Actionable Insight:</strong> For next year's summit, we recommend splitting your exhibition presence into two distinct funnels—a technical deep-dive lounge for Enterprise architects, and a transparent pricing kiosk for Start-ups.
                      </p>
                    </div>
                  )}

                  {activePage === 3 && (
                    <div className="space-y-6">
                       <h3 className="font-bold text-lg font-sans text-violet-900 border-b border-slate-200 pb-2">ROI Projections</h3>
                      
                       <p className="text-sm leading-loose">
                        Based on the 842 qualified NFC badge taps recorded at your booth, cross-referenced with historical conversion metrics from similar B2B SaaS cohorts, the AI model projects the following sales pipeline generation:
                      </p>

                      <table className="w-full mt-4 font-sans text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-violet-900 text-white">
                            <th className="p-3">Cohort</th>
                            <th className="p-3">Qualified Leads</th>
                            <th className="p-3">Est. Pipeline Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-200 bg-white">
                            <td className="p-3 font-bold">Enterprise</td>
                            <td className="p-3 text-slate-600">142</td>
                            <td className="p-3 text-emerald-600 font-bold">$1.2M</td>
                          </tr>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td className="p-3 font-bold">Mid-Market</td>
                            <td className="p-3 text-slate-600">305</td>
                            <td className="p-3 text-emerald-600 font-bold">$850K</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-3 font-bold">Start-up</td>
                            <td className="p-3 text-slate-600">395</td>
                            <td className="p-3 text-emerald-600 font-bold">$400K</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <p className="text-sm leading-loose mt-4 font-bold text-center text-violet-900">
                        Total Projected Pipeline: $2.45M
                      </p>
                    </div>
                  )}

                </div>
              )}
              
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDossierAI;
