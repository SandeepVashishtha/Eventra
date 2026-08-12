/* eslint-disable */
import React, { useState } from 'react';

const HospitalityRiderAutomation = () => {
  const [pipelineState, setPipelineState] = useState('idle'); // idle, extracting, standardizing, ordering, complete
  
  const [apiLog, setApiLog] = useState([
    { id: 1, time: '10:00:00', type: 'SYS', msg: 'System idle. Awaiting contract PDF ingestion.' }
  ]);

  const [extractedItems, setExtractedItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const rawPdfText = `
RIDER ADDENDUM C: GREEN ROOM HOSPITALITY (MARIAH K.)
The Organizer agrees to provide the following items in the artist's dressing room no later than 2:00 PM on the day of the performance:
- Three (3) Bottles of Fiji Water (Room Temperature)
- One (1) Bowl of M&Ms (Only the Green Ones)
- Two (2) Large Humidifiers
- Assorted Fresh Berries (Organic only, no strawberries)
- 12-pack of Diet Coke (Cold)
Failure to provide these exact items constitutes a breach of contract.
`;

  const runAutomation = () => {
    setPipelineState('extracting');
    setExtractedItems([]);
    setCartTotal(0);
    addLog('NLP', 'Ingesting Contract PDF Addendum C...');
    
    setTimeout(() => {
      addLog('NLP', 'Running entity extraction (Food/Beverage/Hardware)...');
      setPipelineState('standardizing');
      
      const items = [
        { raw: 'Three (3) Bottles of Fiji Water (Room Temp)', sku: 'FIJI-H2O-1L-3PK', qty: 1, price: 8.99, status: 'mapped' },
        { raw: 'One (1) Bowl of M&Ms (Only the Green Ones)', sku: 'MMS-BULK-GRN-1LB', qty: 1, price: 14.50, status: 'mapped' },
        { raw: 'Two (2) Large Humidifiers', sku: 'HD-VICK-HUM-XL', qty: 2, price: 49.99, status: 'mapped' },
        { raw: 'Assorted Fresh Berries (Organic, no straw)', sku: 'WF-ORG-BERRY-MIX', qty: 2, price: 12.00, status: 'mapped' },
        { raw: '12-pack of Diet Coke (Cold)', sku: 'KO-DIET-12PK-CAN', qty: 1, price: 7.99, status: 'mapped' }
      ];

      setTimeout(() => {
        addLog('MAP', 'Standardizing NLP entities to Instacart API SKUs...');
        setExtractedItems(items);
        
        let total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        setCartTotal(total);
        setPipelineState('ordering');

        setTimeout(() => {
          addLog('API', 'Transmitting payload to Instacart B2B API endpoint...');
          
          setTimeout(() => {
            addLog('SUCCESS', `Order #992-B41 placed. Scheduled delivery: Aug 14 @ 12:00 PM.`);
            setPipelineState('complete');
            
            setTimeout(() => {
              resetPipeline();
            }, 6000);
            
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const resetPipeline = () => {
    setPipelineState('idle');
    setExtractedItems([]);
    setCartTotal(0);
  };

  const addLog = (type, msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setApiLog(prev => [{ id: Date.now()+Math.random(), time: timeStr, type, msg }, ...prev].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Ops Command Center (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-pink-100 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📄</span> NLP Procurement Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Automated Talent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Hospitality Fulfillment</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Event organizers waste hundreds of hours manually shopping for the absurd demands hidden deep inside artist hospitality riders. Eventra solves this by ingesting the PDF of the artist's contract. The NLP engine extracts exact food, beverage, and hardware requirements, translates them into standard SKUs, and automatically executes an Instacart/Amazon Fresh API order for delivery directly to the venue.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col h-[460px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                 <span className="text-pink-500 text-lg mr-2">🤖</span> AI Parser Dashboard
               </h3>
               
               <button 
                 onClick={pipelineState === 'idle' ? runAutomation : null}
                 disabled={pipelineState !== 'idle'}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-md flex items-center ${
                   pipelineState !== 'idle' ? 'bg-slate-100 text-slate-400 opacity-70 cursor-not-allowed' :
                   'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)]'
                 }`}
               >
                 {pipelineState !== 'idle' ? 'Pipeline Active...' : 'Ingest Contract PDF'}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
               
               {/* Raw Document Feed */}
               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col h-40">
                 {pipelineState === 'extracting' && (
                   <div className="absolute inset-x-0 top-0 h-full bg-pink-400/10 animate-pulse z-0 border-b-2 border-pink-500"></div>
                 )}
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 relative z-10 border-b border-slate-200 pb-1">Raw PDF: Addendum C</span>
                 <div className="text-[9px] font-mono text-slate-600 relative z-10 whitespace-pre-wrap leading-tight overflow-hidden">
                   {rawPdfText}
                 </div>
               </div>

               {/* Standardization Pipeline */}
               <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col h-40">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 border-b border-slate-200 pb-1 flex justify-between">
                   <span>Mapped Entities</span>
                   <span className="text-pink-500">{extractedItems.length} SKUs</span>
                 </span>
                 
                 <div className="flex-1 overflow-y-auto space-y-1">
                   {extractedItems.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-xs text-slate-400 font-mono italic">
                       {pipelineState === 'idle' ? 'Awaiting ingest...' : 'Extracting nodes...'}
                     </div>
                   ) : (
                     extractedItems.map((item, i) => (
                       <div key={i} className="text-[9px] font-mono animate-fade-in-up border-b border-slate-100 pb-1">
                         <div className="text-slate-800 font-bold truncate">{item.raw}</div>
                         <div className="flex justify-between text-slate-500 mt-0.5">
                           <span>{item.sku} (x{item.qty})</span>
                           <span className="text-emerald-600">${(item.price * item.qty).toFixed(2)}</span>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>

             </div>

             {/* API Log */}
             <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-hidden relative flex flex-col shadow-inner mt-auto">
               <span className="text-slate-500 uppercase font-bold tracking-widest block mb-2 border-b border-slate-800 pb-2">Procurement API Log</span>
               
               <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 pr-2">
                 {apiLog.map((log) => (
                   <div key={log.id} className="flex items-start animate-fade-in-up">
                     <span className="text-slate-600 mr-2 shrink-0">[{log.time}]</span>
                     <span className={
                       log.type === 'SUCCESS' ? 'text-emerald-400 font-bold' : 
                       log.type === 'API' ? 'text-blue-400' :
                       log.type === 'NLP' ? 'text-pink-400' : 'text-slate-400'
                     }>{log.msg}</span>
                   </div>
                 ))}
                 
                 {pipelineState === 'ordering' && (
                   <div className="text-blue-400 mt-1 animate-pulse flex items-center">
                     <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Awaiting 200 OK from vendor...
                   </div>
                 )}
               </div>
             </div>

          </div>
        </div>

        {/* Right Side: Grocery API Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[360px] bg-white rounded-[3rem] border-[12px] border-slate-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* iOS Header */}
            <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-6 text-slate-800 text-xs font-bold z-30 bg-white/80 backdrop-blur-md">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            <div className="flex-1 pt-16 pb-6 px-4 flex flex-col bg-slate-50 relative overflow-hidden">
               
               <div className="text-center mb-6 z-10">
                 <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm border border-orange-200">
                   🛒
                 </div>
                 <h2 className="font-black text-slate-900 text-xl tracking-tight">InstaVendor B2B</h2>
                 <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">Partner Portal</p>
               </div>

               {pipelineState === 'idle' || pipelineState === 'extracting' || pipelineState === 'standardizing' ? (
                 <div className="flex-1 flex flex-col items-center justify-center">
                   <div className={`text-4xl mb-4 transition-all duration-500 ${pipelineState !== 'idle' ? 'animate-bounce' : 'opacity-30 grayscale'}`}>
                     📦
                   </div>
                   <h3 className="font-bold text-slate-400 text-center">Empty Cart</h3>
                   <p className="text-xs text-slate-300 text-center px-6 mt-2">Awaiting payload from Eventra NLP engine.</p>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col animate-fade-in-up">
                   
                   <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex-1 mb-4">
                     <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Auto-Generated Cart</h3>
                     
                     <div className="space-y-4">
                       {extractedItems.map((item, i) => (
                         <div key={i} className="flex justify-between items-center">
                           <div className="flex items-center">
                             <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-sm mr-3">
                               {item.raw.includes('Water') ? '💧' : item.raw.includes('M&M') ? '🍬' : item.raw.includes('Humid') ? '💨' : item.raw.includes('Berr') ? '🍓' : '🥤'}
                             </div>
                             <div>
                               <p className="text-xs font-bold text-slate-800 leading-tight w-[140px] truncate">{item.raw}</p>
                               <p className="text-[9px] text-slate-400 font-mono mt-0.5">Qty: {item.qty} • {item.sku}</p>
                             </div>
                           </div>
                           <p className="text-xs font-black text-slate-900">${(item.price * item.qty).toFixed(2)}</p>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Checkout Footer */}
                   <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-500">Subtotal</span>
                       <span className="font-bold text-sm">${cartTotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-4">
                       <span className="text-xs text-slate-500">Expedited Delivery (VIP)</span>
                       <span className="font-bold text-sm text-slate-800">$15.00</span>
                     </div>
                     <div className="flex justify-between items-center mb-6 pt-3 border-t border-slate-100">
                       <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                       <span className="text-xl font-black text-orange-500">${(cartTotal + 15).toFixed(2)}</span>
                     </div>
                     
                     {pipelineState === 'complete' ? (
                       <button className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-black py-4 rounded-xl shadow-sm uppercase tracking-widest text-sm flex items-center justify-center pointer-events-none">
                         <span className="mr-2">✅</span> Paid via API
                       </button>
                     ) : (
                       <button className="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm relative overflow-hidden pointer-events-none">
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                         Processing...
                       </button>
                     )}
                   </div>

                 </div>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HospitalityRiderAutomation;
