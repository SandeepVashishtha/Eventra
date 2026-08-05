import React, { useState } from 'react';

const PredictiveCateringModel = () => {
  const [runningModel, setRunningModel] = useState(false);
  const [predictionReady, setPredictionReady] = useState(false);
  
  const [metrics, setMetrics] = useState({
    rsvps: 2500,
    naiveEstimate: 2000, // 80%
    aiPrediction: 0,
    wasteSaved: 0,
    costSaved: 0
  });

  const handleRunPrediction = () => {
    setRunningModel(true);
    setPredictionReady(false);
    
    setTimeout(() => {
      setRunningModel(false);
      setPredictionReady(true);
      setMetrics({
        rsvps: 2500,
        naiveEstimate: 2000,
        aiPrediction: 1642, // Adjusted by AI
        wasteSaved: 358, // plates
        costSaved: 12530 // dollars
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Sustainability & Cost
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Predictive <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Catering Attrition</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Stop guessing your food orders based on raw RSVPs. Our machine learning model analyzes historical drop-offs, weather data, and real-time check-in velocity to predict exactly how many meals you actually need.
          </p>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Active Data Factors</h3>
             
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-lg">🌧️</span>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Inclement Weather Detected</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Reduces walk-ins by 12%</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <span className="w-8 h-8 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-lg">⏱️</span>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Back-to-Back Sessions</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Lowers lunch traffic by 5%</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">📊</span>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Historical Drop-off (Year 3)</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Base attrition rate at 22%</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Prediction Dashboard (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Day 1 Catering Order</h2>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Gala Dinner Forecast</p>
            </div>
            
            <button 
              onClick={handleRunPrediction}
              disabled={runningModel || predictionReady}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center shadow-sm ${runningModel ? 'bg-slate-200 text-slate-500 cursor-wait' : predictionReady ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {runningModel ? (
                <><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></span> Analyzing...</>
              ) : predictionReady ? (
                '✓ Forecast Locked'
              ) : (
                'Run ML Forecast'
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
            
            {/* The Comparison */}
            <div className="grid grid-cols-2 gap-6 relative">
              
              {/* VS Divider */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                <div className="bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase rounded-full w-8 h-8 flex items-center justify-center shadow-sm">VS</div>
              </div>

              {/* Naive Estimate */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Standard Formula</h4>
                <p className="text-[10px] text-slate-400 mb-4">(80% of RSVPs)</p>
                <span className="text-4xl font-black text-slate-800 block mb-2">{metrics.naiveEstimate}</span>
                <span className="text-sm font-bold text-slate-500">Plates Ordered</span>
              </div>

              {/* AI Prediction */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">AI Prediction</h4>
                <p className="text-[10px] text-slate-500 mb-4">(Data-Driven Model)</p>
                
                {runningModel ? (
                  <div className="h-12 flex items-center justify-center mb-2">
                    <span className="text-2xl animate-pulse text-emerald-500">...</span>
                  </div>
                ) : predictionReady ? (
                  <span className="text-4xl font-black text-white block mb-2 animate-fade-in-up">{metrics.aiPrediction}</span>
                ) : (
                  <span className="text-4xl font-black text-slate-700 block mb-2">- -</span>
                )}
                
                <span className="text-sm font-bold text-slate-400">Plates Needed</span>
              </div>
            </div>

            {/* Impact Results */}
            {predictionReady && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-fade-in-up shadow-sm">
                 <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-6 text-center border-b border-emerald-200/50 pb-2">Business Impact</h3>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div className="text-center">
                     <span className="block text-3xl mb-2">📉</span>
                     <span className="text-3xl font-black text-emerald-600 block mb-1">-{metrics.wasteSaved}</span>
                     <span className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest">Plates of Food Waste Prevented</span>
                   </div>
                   <div className="text-center border-l border-emerald-200/50">
                     <span className="block text-3xl mb-2">💰</span>
                     <span className="text-3xl font-black text-emerald-600 block mb-1">${metrics.costSaved.toLocaleString()}</span>
                     <span className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest">Hard Cost Savings (@ $35/plate)</span>
                   </div>
                 </div>

                 <div className="mt-8 text-center">
                   <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition">
                     Update Vendor Purchase Order
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

export default PredictiveCateringModel;
