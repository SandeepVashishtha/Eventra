import React, { useState } from 'react';

const VendorContractNegotiator = () => {
  const [analysisState, setAnalysisState] = useState('upload'); // upload, scanning, results
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [scanProgress, setScanProgress] = useState(0);

  const startAnalysis = () => {
    setAnalysisState('scanning');
    setSelectedFile('AV_Equipment_Rental_Agreement_Final.pdf');
    
    // Simulate NLP scanning process
    let progress = 0;
    const scanInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(scanInterval);
        setTimeout(() => setAnalysisState('results'), 500);
      }
      setScanProgress(progress);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-slate-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Master Console (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">⚖️</span> Legal NLP Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Vendor Contract <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Negotiation Bot</span>.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Stop paying entertainment lawyers $500/hour to read boilerplate AV rentals. Eventra's specialized NLP engine is trained on thousands of event industry legal contracts. Upload a vendor PDF, and the bot instantly highlights non-standard clauses, flags hidden service charges, and suggests red-line edits to protect your budget and liability.
          </p>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal Analysis Terminal</h3>
             </div>

             {analysisState === 'upload' && (
               <div className="flex-1 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-800/50 transition cursor-pointer group" onClick={startAnalysis}>
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition border border-slate-700">📄</div>
                 <span className="text-white font-bold mb-1">Upload Vendor Contract</span>
                 <span className="text-xs text-slate-500 font-mono">Drag & Drop PDF or DOCX</span>
               </div>
             )}

             {analysisState === 'scanning' && (
               <div className="flex-1 flex flex-col items-center justify-center relative">
                 <div className="w-48 h-48 relative flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                     <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                     <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-emerald-500 transition-all duration-300 ease-out" strokeDasharray="553" strokeDashoffset={553 - (553 * scanProgress) / 100} />
                   </svg>
                   <div className="text-center">
                     <span className="text-3xl font-black text-white font-mono">{scanProgress}%</span>
                     <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">NLP Parsing</span>
                   </div>
                 </div>
                 <div className="mt-8 font-mono text-[10px] text-slate-500 w-full text-center">
                   <p>&gt; Ingesting {selectedFile}</p>
                   <p>&gt; Cross-referencing against standard industry boilerplates...</p>
                   <p>&gt; Identifying liability indemnification clauses...</p>
                 </div>
               </div>
             )}

             {analysisState === 'results' && (
               <div className="flex-1 flex flex-col">
                 <div className="flex items-center space-x-3 mb-6 bg-emerald-900/20 p-3 rounded-xl border border-emerald-500/30">
                   <span className="text-2xl">✅</span>
                   <div>
                     <span className="text-white font-bold text-sm block">Analysis Complete</span>
                     <span className="text-[10px] text-emerald-400 font-mono">3 Critical Flags • 1 Suggested Redline</span>
                   </div>
                   <button 
                     onClick={() => setAnalysisState('upload')}
                     className="ml-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition"
                   >
                     Reset
                   </button>
                 </div>

                 <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                   {/* Flag 1 */}
                   <div className="bg-rose-900/20 border border-rose-500/30 p-3 rounded-xl">
                     <div className="flex justify-between items-start mb-1">
                       <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Predatory Fee Detected</span>
                       <span className="text-[10px] font-mono text-slate-500">Section 4.b</span>
                     </div>
                     <p className="text-white text-xs font-bold leading-snug">"Mandatory 22% discretionary service charge on all late load-outs."</p>
                     <p className="text-slate-400 text-[10px] mt-2 border-t border-rose-500/20 pt-2 font-mono">Action: Negotiate down to standard 15% or define 'late' explicitly.</p>
                   </div>
                   {/* Flag 2 */}
                   <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-xl">
                     <div className="flex justify-between items-start mb-1">
                       <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Liability Risk</span>
                       <span className="text-[10px] font-mono text-slate-500">Section 9.1</span>
                     </div>
                     <p className="text-white text-xs font-bold leading-snug">Client assumes all risk for acts of God causing equipment damage.</p>
                   </div>
                 </div>
               </div>
             )}

          </div>
        </div>

        {/* Right Side: Document Redline Simulator (Col span 6) */}
        <div className="lg:col-span-6 flex justify-center">
          
          <div className="w-full bg-white rounded-lg shadow-2xl relative flex flex-col h-[700px] overflow-hidden border border-slate-300 text-slate-800 transform rotate-1 hover:rotate-0 transition duration-500">
            
            {/* Fake PDF Toolbar */}
            <div className="bg-slate-100 border-b border-slate-300 p-3 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 font-mono">AV_Equipment_Rental_Agreement_Final.pdf</span>
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 p-8 overflow-y-auto font-serif text-sm leading-relaxed space-y-6 relative">
              
              {analysisState === 'scanning' && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Scanning Laser Line */}
                  <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] absolute opacity-70 animate-[scan_2s_linear_infinite]"></div>
                  <div className="absolute inset-0 bg-emerald-500/5 filter blur-md"></div>
                </div>
              )}

              <h2 className="text-center font-black text-xl mb-8 uppercase tracking-widest border-b-2 border-black pb-4">Master Rental Agreement</h2>
              
              <div className="space-y-4">
                <h3 className="font-bold">1. EQUIPMENT RENTAL</h3>
                <p className="text-justify text-slate-600">The Provider agrees to rent the audio, visual, and lighting equipment listed in Exhibit A ("Equipment") to the Client for the Event defined herein. The Provider guarantees that all Equipment shall be in good working order upon delivery.</p>
              </div>

              <div className="space-y-4 relative">
                <h3 className="font-bold">4. FEES AND PAYMENT</h3>
                <p className="text-justify text-slate-600">
                  Client agrees to pay the base rental fee of $45,000.00. 
                  
                  {/* Redline Highlight */}
                  <span className={`transition-all duration-1000 px-1 relative ${analysisState === 'results' ? 'bg-rose-200 text-rose-900 font-bold' : ''}`}>
                    Additionally, Client is subject to a mandatory 22% discretionary service charge on all late load-outs.
                    
                    {analysisState === 'results' && (
                      <span className="absolute -top-6 -right-2 bg-rose-600 text-white text-[8px] font-sans font-bold px-2 py-0.5 rounded shadow-lg animate-fade-in-up whitespace-nowrap">
                        NLP FLAG: PREDATORY
                      </span>
                    )}
                  </span>
                  
                  All invoices must be paid Net-30.
                </p>
              </div>

              <div className="space-y-4 relative">
                <h3 className="font-bold">9. INDEMNIFICATION</h3>
                <p className="text-justify text-slate-600">
                  {/* Redline Highlight */}
                  <span className={`transition-all duration-1000 px-1 relative ${analysisState === 'results' ? 'bg-amber-200 text-amber-900 font-bold' : ''}`}>
                    Client assumes all risk for acts of God causing equipment damage,
                    {analysisState === 'results' && (
                      <span className="absolute -top-6 -right-2 bg-amber-600 text-white text-[8px] font-sans font-bold px-2 py-0.5 rounded shadow-lg animate-fade-in-up whitespace-nowrap">
                        NLP FLAG: LIABILITY
                      </span>
                    )}
                  </span>
                  and agrees to hold Provider harmless against any claims, losses, or damages arising from the use of the Equipment by the Client's attendees.
                </p>
                
                {analysisState === 'results' && (
                  <div className="mt-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 font-sans animate-fade-in text-xs">
                    <span className="font-bold text-emerald-800 block mb-1">Bot Suggested Redline Edit:</span>
                    <p className="text-emerald-700 italic">"Provider shall maintain force majeure insurance covering acts of God; Client liability is strictly limited to gross negligence."</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default VendorContractNegotiator;
