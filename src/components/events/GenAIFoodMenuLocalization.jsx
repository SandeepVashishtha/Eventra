/* eslint-disable */
import React, { useState } from 'react';

const GenAIFoodMenuLocalization = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [vendorType, setVendorType] = useState('TACO_TRUCK'); // TACO_TRUCK, BURGER_STAND, PIZZA_CART

  const [geoData, setGeoData] = useState([
    { region: 'Los Angeles, CA', pct: 42 },
    { region: 'Portland, OR', pct: 28 },
    { region: 'Austin, TX', pct: 15 },
    { region: 'Other', pct: 15 }
  ]);

  const [aiSuggestions, setAiSuggestions] = useState([]);

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalysisComplete(false);
    setAiSuggestions([]);

    setTimeout(() => {
      let suggestions = [];
      if (vendorType === 'TACO_TRUCK') {
        suggestions = [
          { item: 'Birria Tacos', action: 'INCREASE', pct: 35, reason: 'High index of LA attendees; extreme trend in Birria searches.' },
          { item: 'Vegan Jackfruit Tacos', action: 'INCREASE', pct: 40, reason: '28% of demographic from Portland; vegan index +400% vs national average.' },
          { item: 'Standard Ground Beef', action: 'DECREASE', pct: 60, reason: 'Low appeal to current demographic matrix.' }
        ];
      } else if (vendorType === 'BURGER_STAND') {
        suggestions = [
          { item: 'Gluten-Free Buns', action: 'INCREASE', pct: 50, reason: 'High dietary restriction index detected in PNW ticket buyers.' },
          { item: 'Texas BBQ Burger', action: 'INCREASE', pct: 20, reason: '15% Austin demographic; strong historical sales correlation.' },
          { item: 'Heavy Dairy Milkshakes', action: 'DECREASE', pct: 45, reason: 'High temperature forecast (95°F) reduces heavy dairy consumption.' }
        ];
      } else {
        suggestions = [
          { item: 'Cauliflower Crust', action: 'INCREASE', pct: 30, reason: 'Aligns with LA/Portland health-conscious demographics.' },
          { item: 'By-The-Slice Pepperoni', action: 'INCREASE', pct: 15, reason: 'High volume, fast-moving item. Good for short set breaks.' },
          { item: 'Deep Dish Whole Pizza', action: 'DECREASE', pct: 80, reason: 'Zero Chicago demographic presence; too slow to cook for festival pace.' }
        ];
      }

      setAiSuggestions(suggestions);
      setAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const reset = () => {
    setAnalyzing(false);
    setAnalysisComplete(false);
    setAiSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Controls (Col span 5) */}
        <div className="lg:col-span-5 space-y-6 pt-10">
          <div className="inline-block bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Supply Chain Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Generative AI <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Menu Localization</span>.
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Food vendors blindly buy inventory for festivals without knowing the demographic makeup of the crowd, leading to massive food waste or stockouts. Eventra solves this by analyzing the anonymized geographic origins of ticket buyers. A Generative AI cross-references this big data with local culinary trends and weather forecasts, outputting a highly optimized inventory breakdown for specific vendors to maximize profit and eliminate waste.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
               Vendor Configuration
             </h3>

             <div className="space-y-4 mb-6">
               <label className="block text-sm font-bold text-slate-700">Select Vendor Type:</label>
               <div className="grid grid-cols-3 gap-2">
                 <button 
                   onClick={() => { setVendorType('TACO_TRUCK'); reset(); }}
                   className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition border ${
                     vendorType === 'TACO_TRUCK' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                   }`}
                 >
                   🌮 Taco Truck
                 </button>
                 <button 
                   onClick={() => { setVendorType('BURGER_STAND'); reset(); }}
                   className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition border ${
                     vendorType === 'BURGER_STAND' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                   }`}
                 >
                   🍔 Burger Stand
                 </button>
                 <button 
                   onClick={() => { setVendorType('PIZZA_CART'); reset(); }}
                   className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition border ${
                     vendorType === 'PIZZA_CART' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                   }`}
                 >
                   🍕 Pizza Cart
                 </button>
               </div>
             </div>

             <button 
               onClick={runAnalysis}
               disabled={analyzing || analysisComplete}
               className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md flex items-center justify-center ${
                 analyzing ? 'bg-slate-100 text-slate-400 cursor-wait' :
                 analysisComplete ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed' :
                 'bg-slate-900 hover:bg-black text-white'
               }`}
             >
               {analyzing ? (
                 <><div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2"></div> Cross-Referencing LLM...</>
               ) : analysisComplete ? (
                 '✅ Analysis Complete'
               ) : (
                 'Generate Inventory Strategy'
               )}
             </button>
          </div>
        </div>

        {/* Right Side: Vendor App Dashboard (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-2xl relative flex flex-col min-h-[600px] overflow-hidden font-sans">
            
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1 block">Eventra Vendor Portal</span>
                <h2 className="text-2xl font-black leading-none">
                  {vendorType === 'TACO_TRUCK' ? "El Jefe's Tacos" : vendorType === 'BURGER_STAND' ? "Smash Bros Burgers" : "Slice of Heaven"}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Target Event</span>
                <span className="text-sm font-bold">Neon Desert Festival 2026</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Column 1: Demographic Data Input */}
               <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                   Ticket Buyer Demographics
                 </h3>
                 
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                   {geoData.map((geo, i) => (
                     <div key={i}>
                       <div className="flex justify-between items-end mb-1">
                         <span className="text-[10px] font-bold text-slate-600 uppercase">{geo.region}</span>
                         <span className="text-xs font-mono font-bold text-slate-900">{geo.pct}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${geo.pct}%` }}></div>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
                   <span className="text-xl mr-3">🌤️</span>
                   <div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-blue-800 block mb-1">Weather Forecast API</span>
                     <p className="text-xs text-blue-900 font-medium">95°F High. Extreme Heat Warning. Hydration items recommended.</p>
                   </div>
                 </div>
               </div>

               {/* Column 2: AI Output */}
               <div className="space-y-4 relative">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center">
                   <span className="text-orange-500 mr-2">✨</span> AI Inventory Directives
                 </h3>

                 {!analysisComplete && !analyzing && (
                   <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                     <span className="text-3xl mb-2">🧠</span>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Awaiting AI Generation</p>
                   </div>
                 )}

                 {analyzing && (
                   <div className="space-y-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-pulse flex flex-col space-y-2">
                         <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                         <div className="h-2 bg-slate-50 rounded w-3/4 mt-2"></div>
                         <div className="h-2 bg-slate-50 rounded w-full"></div>
                       </div>
                     ))}
                   </div>
                 )}

                 {analysisComplete && (
                   <div className="space-y-3 animate-fade-in-up">
                     {aiSuggestions.map((sug, i) => (
                       <div key={i} className={`p-4 rounded-xl border flex flex-col ${
                         sug.action === 'INCREASE' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                       }`}>
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-black text-slate-900 leading-tight">{sug.item}</span>
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                             sug.action === 'INCREASE' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                           }`}>
                             {sug.action === 'INCREASE' ? '+' : '-'}{sug.pct}%
                           </span>
                         </div>
                         <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                           <strong className="text-slate-800 font-bold uppercase tracking-widest text-[8px] block mb-1">Reasoning:</strong>
                           {sug.reason}
                         </p>
                       </div>
                     ))}
                     
                     <button className="w-full mt-4 bg-orange-100 text-orange-700 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl border border-orange-200 hover:bg-orange-200 transition">
                       Export PO to Supplier
                     </button>
                   </div>
                 )}
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenAIFoodMenuLocalization;
