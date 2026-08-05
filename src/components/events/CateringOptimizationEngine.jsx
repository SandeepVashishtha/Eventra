import React, { useState, useEffect } from 'react';

const CateringOptimizationEngine = () => {
  const [registrations, setRegistrations] = useState(1200);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  const [dietData, setDietData] = useState([
    { type: 'Standard (No Restrictions)', count: 720, percentage: 60, color: 'bg-slate-400' },
    { type: 'Vegetarian', count: 180, percentage: 15, color: 'bg-green-400' },
    { type: 'Vegan', count: 120, percentage: 10, color: 'bg-emerald-500' },
    { type: 'Gluten-Free', count: 96, percentage: 8, color: 'bg-amber-400' },
    { type: 'Halal', count: 48, percentage: 4, color: 'bg-blue-400' },
    { type: 'Other / Severe Allergies', count: 36, percentage: 3, color: 'bg-red-400' }
  ]);

  const handleSimulateSurge = () => {
    setOptimizing(true);
    setOptimized(false);
    
    // Simulate a sudden surge in a specific demographic altering the diet ratios
    setTimeout(() => {
      setRegistrations(1350);
      setDietData([
        { type: 'Standard (No Restrictions)', count: 750, percentage: 55, color: 'bg-slate-400' },
        { type: 'Vegetarian', count: 243, percentage: 18, color: 'bg-green-400' },
        { type: 'Vegan', count: 162, percentage: 12, color: 'bg-emerald-500' },
        { type: 'Gluten-Free', count: 95, percentage: 7, color: 'bg-amber-400' },
        { type: 'Halal', count: 67, percentage: 5, color: 'bg-blue-400' },
        { type: 'Other / Severe Allergies', count: 33, percentage: 3, color: 'bg-red-400' }
      ]);
      setOptimizing(false);
      setOptimized(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-3xl">🍽️</span> Catering Optimization Engine
            </h1>
            <p className="text-slate-500 text-sm mt-1">Predictive dietary modeling to eliminate food waste and reduce operational costs.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Registrations</span>
            <div className="bg-slate-900 text-white font-black text-2xl px-4 py-2 rounded-xl shadow-inner">
              {registrations.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Demographics */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Dietary Aggregation</h2>
              {optimizing && <span className="text-xs font-bold text-blue-500 flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-2"></div> Recalculating...</span>}
            </div>

            {/* Visual Breakdown Bar */}
            <div className="w-full h-10 flex rounded-xl overflow-hidden mb-6 shadow-inner bg-slate-100">
              {dietData.map((diet, idx) => (
                <div 
                  key={idx} 
                  className={`h-full ${diet.color} transition-all duration-1000 ease-out flex items-center justify-center`}
                  style={{ width: `${diet.percentage}%` }}
                >
                  {diet.percentage > 10 && <span className="text-[10px] font-black text-white/90">{diet.percentage}%</span>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dietData.map((diet, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${diet.color}`}></div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 line-clamp-1">{diet.type}</p>
                    <p className="font-black text-slate-900 text-lg">
                      {diet.count} <span className="text-[10px] text-slate-400 font-medium">pax</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start space-x-4">
              <button 
                onClick={handleSimulateSurge}
                disabled={optimizing || optimized}
                className={`py-3 px-6 rounded-xl font-black shadow-md transition ${optimizing ? 'bg-slate-200 text-slate-400' : optimized ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                {optimized ? 'Surge Modeled ✓' : 'Simulate +150 Late Reg Surge'}
              </button>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                <span className="font-bold text-slate-700">Predictive Modeling:</span> Click to simulate a late registration surge. The engine will automatically adjust the vendor purchasing order to prevent shortages.
              </p>
            </div>
          </div>

          {/* Right Column: AI Vendor Order */}
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-white mb-6 z-10 relative">Vendor Order Manifest</h2>
            
            <div className="flex-1 space-y-4 relative z-10">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cost Projection</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-emerald-400">${optimized ? '24,850' : '22,400'}</span>
                  <span className="text-xs text-emerald-600 font-bold">Total</span>
                </div>
                {optimized && (
                  <p className="text-[10px] text-emerald-400 mt-2 bg-emerald-900/30 p-2 rounded border border-emerald-500/30">
                    + $2,450 adjusted for late surge
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">Recommended Buffer</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Standard Over-prep</span>
                  <span className="font-bold text-white">+ 3%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Vegan Over-prep</span>
                  <span className="font-bold text-white">+ 8%</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed pt-2">
                  *Historical data shows non-vegans often consume vegan options if presented well. Buffer increased to prevent shortage.
                </p>
              </div>
            </div>

            <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition z-10 relative">
              Send PO to Caterer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CateringOptimizationEngine;
