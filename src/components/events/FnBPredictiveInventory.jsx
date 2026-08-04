import React, { useState } from 'react';

const FnBPredictiveInventory = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [forecastReady, setForecastReady] = useState(false);

  const handlePredict = () => {
    setAnalyzing(true);
    setForecastReady(false);
    setTimeout(() => {
      setAnalyzing(false);
      setForecastReady(true);
    }, 2000);
  };

  const inventoryData = [
    { category: 'Hot Beverages (Coffee/Tea)', currentPrep: 800, predictedDemand: 1200, unit: 'cups', trend: 'up', reason: 'Cold front expected (55°F)' },
    { category: 'Cold Beverages (Soda/Water)', currentPrep: 1500, predictedDemand: 900, unit: 'bottles', trend: 'down', reason: 'Low temps + Indoor venue' },
    { category: 'Grab-and-Go Meals (Sandwiches)', currentPrep: 1000, predictedDemand: 1350, unit: 'units', trend: 'up', reason: 'High session density at 12 PM' },
    { category: 'Hot Meals (Plated)', currentPrep: 500, predictedDemand: 400, unit: 'plates', trend: 'down', reason: 'Demographic shift (younger demo prefers quick meals)' }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-orange-500">📊</span> F&B Demand Predictor
            </h1>
            <p className="text-slate-500 font-medium mt-1">AI inventory forecasting to eliminate food waste and maximize vendor ROI.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-200 transition">
              Vendor Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Data Inputs */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="text-blue-400 mr-2">⚙️</span> Forecast Inputs
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weather Forecast</p>
                  <p className="font-black text-lg text-blue-300">55°F • Rainy</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Sales (Live)</p>
                  <p className="font-black text-lg text-emerald-400">3,450 / 4,000</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Schedule Density</p>
                  <p className="font-black text-lg text-orange-400">Peak at 12:30 PM</p>
                </div>
              </div>

              <button 
                onClick={handlePredict}
                disabled={analyzing}
                className={`w-full py-4 rounded-xl font-black shadow-lg transition flex items-center justify-center ${analyzing ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20'}`}
              >
                {analyzing ? (
                  <>
                    <span className="animate-spin text-xl mr-2">⚙️</span> Processing...
                  </>
                ) : (
                  'Run F&B AI Forecast'
                )}
              </button>
            </div>

          </div>

          {/* Right Column: AI Output */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Inventory Recommendations</h2>
              {forecastReady && (
                <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-1 rounded border border-green-200">
                  Live Data Synced
                </span>
              )}
            </div>

            {!forecastReady && !analyzing ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                 <span className="text-6xl mb-4 opacity-50">🤖</span>
                 <p className="font-bold text-sm">Run the forecast to generate inventory recommendations.</p>
               </div>
            ) : analyzing ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                 <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-slate-500 font-bold animate-pulse">Aggregating historical data & demographics...</p>
               </div>
            ) : (
               <div className="flex-1 space-y-4 animate-fade-in">
                 {inventoryData.map((item, idx) => {
                   const gap = item.predictedDemand - item.currentPrep;
                   const isShortage = gap > 0;

                   return (
                     <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center">
                       <div className="mb-4 md:mb-0">
                         <h3 className="font-black text-slate-800 text-lg">{item.category}</h3>
                         <p className="text-xs font-bold text-slate-500 flex items-center mt-1">
                           <span className="mr-1">💡</span> AI Note: {item.reason}
                         </p>
                       </div>
                       
                       <div className="flex items-center space-x-6 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                         <div className="text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Prep</p>
                           <p className="font-bold text-slate-600">{item.currentPrep}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Predicted</p>
                           <p className="font-black text-indigo-600 text-xl">{item.predictedDemand}</p>
                         </div>
                         
                         <div className={`px-4 py-2 rounded-lg font-bold text-sm flex flex-col items-center justify-center ${isShortage ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                           <span className="text-[10px] uppercase tracking-wider mb-0.5">{isShortage ? 'Increase Prep' : 'Reduce Waste'}</span>
                           <span>{isShortage ? '+' : ''}{gap} {item.unit}</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}

                 <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                   <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg">
                     Export Purchase Order
                   </button>
                 </div>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FnBPredictiveInventory;
