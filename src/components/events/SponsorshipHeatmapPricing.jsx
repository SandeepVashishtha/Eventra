import React, { useState } from 'react';

const SponsorshipHeatmapPricing = () => {
  const [calculating, setCalculating] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Booth Data
  const [booths, setBooths] = useState([
    { id: '100', type: 'Corner', basePrice: 5000, currentPrice: 5000, trafficScore: 0, status: 'unpriced' },
    { id: '101', type: 'Inline', basePrice: 3500, currentPrice: 3500, trafficScore: 0, status: 'unpriced' },
    { id: '102', type: 'Island', basePrice: 12000, currentPrice: 12000, trafficScore: 0, status: 'unpriced' },
    { id: '103', type: 'Inline', basePrice: 3500, currentPrice: 3500, trafficScore: 0, status: 'unpriced' }
  ]);

  const [metrics, setMetrics] = useState({
    totalBaseRevenue: 24000,
    projectedRevenue: 24000,
    dataPoints: 0
  });

  const runPricingAlgorithm = () => {
    setCalculating(true);
    
    // Simulate loading data points
    let points = 0;
    const pointInterval = setInterval(() => {
      points += 45000;
      setMetrics(prev => ({ ...prev, dataPoints: points }));
    }, 100);

    setTimeout(() => {
      clearInterval(pointInterval);
      setCalculating(false);
      setDataLoaded(true);

      // Apply algorithmic pricing based on mock spatial density
      const updatedBooths = [
        { id: '100', type: 'Corner', basePrice: 5000, currentPrice: 8500, trafficScore: 92, status: 'premium' }, // High traffic corner
        { id: '101', type: 'Inline', basePrice: 3500, currentPrice: 3200, trafficScore: 41, status: 'discounted' }, // Dead zone
        { id: '102', type: 'Island', basePrice: 12000, currentPrice: 18500, trafficScore: 98, status: 'premium' }, // Center Hub
        { id: '103', type: 'Inline', basePrice: 3500, currentPrice: 4800, trafficScore: 76, status: 'premium' } // Near bathrooms/food
      ];

      setBooths(updatedBooths);

      const newTotal = updatedBooths.reduce((sum, b) => sum + b.currentPrice, 0);
      setMetrics({
        totalBaseRevenue: 24000,
        projectedRevenue: newTotal,
        dataPoints: 1245000 // Total simulated WiFi/BLE triangulations
      });

    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Dashboard (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Revenue Optimization
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Spatial Pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">Algorithm Engine</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop pricing exhibitor booths based on "gut feeling". Eventra aggregates historical WiFi triangulation and Bluetooth beacon data to generate empirical foot-traffic heatmaps, allowing you to algorithmically price prime real estate and maximize sponsorship yield.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Algorithm Financial Impact</h3>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold text-slate-500">Flat-Rate Base Revenue</span>
                 <span className="text-xl font-mono text-slate-800">${metrics.totalBaseRevenue.toLocaleString()}</span>
               </div>
               
               <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                 <span className="text-sm font-bold text-fuchsia-600">Algorithmic Projected Revenue</span>
                 <span className={`text-2xl font-black font-mono transition-colors duration-1000 ${dataLoaded ? 'text-fuchsia-600' : 'text-slate-300'}`}>
                   ${metrics.projectedRevenue.toLocaleString()}
                 </span>
               </div>
               
               <div className="flex justify-between items-center pt-2">
                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Yield Increase</span>
                 <span className={`text-lg font-black ${dataLoaded ? 'text-emerald-500' : 'text-slate-300'}`}>
                   {dataLoaded ? `+${(((metrics.projectedRevenue - metrics.totalBaseRevenue) / metrics.totalBaseRevenue) * 100).toFixed(1)}%` : '0.0%'}
                 </span>
               </div>
             </div>

             <button 
               onClick={runPricingAlgorithm}
               disabled={calculating || dataLoaded}
               className={`w-full py-4 rounded-xl font-black text-sm transition flex items-center justify-center space-x-2 ${
                 calculating ? 'bg-fuchsia-100 text-fuchsia-400 cursor-wait' : 
                 dataLoaded ? 'bg-slate-800 text-emerald-400 shadow-lg' : 
                 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-lg'
               }`}
             >
               {calculating ? (
                 <><span className="w-4 h-4 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin mr-2"></span> Processing Spatial Data...</>
               ) : dataLoaded ? (
                 '✓ Pricing Updated Algorithmically'
               ) : (
                 'Generate Spatial Pricing Matrix'
               )}
             </button>
             
             {calculating && (
               <div className="mt-3 text-center">
                 <span className="text-[10px] text-slate-400 font-mono">Aggregating {metrics.dataPoints.toLocaleString()} WiFi/BLE vectors...</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Floorplan Heatmap & Ledger (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 z-10">
            <div>
              <h2 className="text-lg font-black text-white">Expo Hall Floorplan</h2>
              <span className="text-xs text-slate-400 font-mono">Historical Data Overlay Active</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            
            {/* Visual Heatmap Area */}
            <div className="h-64 bg-slate-950 relative flex items-center justify-center p-6 border-b border-slate-800 overflow-hidden">
              
              {/* Fake grid background */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')]"></div>

              {!dataLoaded && !calculating ? (
                <div className="relative z-10 text-center opacity-30">
                  <span className="text-4xl mb-2 block">🗺️</span>
                  <span className="text-white font-bold uppercase tracking-widest text-sm">Awaiting Spatial Data</span>
                </div>
              ) : (
                <div className="relative w-full max-w-md h-full flex gap-4 p-4 z-10">
                  
                  {/* Heatmap Blobs (Rendered when data loaded) */}
                  {dataLoaded && (
                    <>
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-rose-500/40 rounded-full blur-2xl animate-pulse mix-blend-screen pointer-events-none"></div>
                      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-fuchsia-500/40 rounded-full blur-2xl animate-pulse mix-blend-screen pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl mix-blend-screen pointer-events-none"></div>
                    </>
                  )}

                  {/* Physical Booth Representations */}
                  <div className={`flex-1 border-2 flex flex-col justify-between p-2 rounded transition-colors duration-1000 ${dataLoaded ? 'border-rose-500 bg-rose-900/30' : 'border-slate-700 bg-slate-800'}`}>
                    <span className="text-[10px] text-white font-bold">100 (Corner)</span>
                    {dataLoaded && <span className="text-xs font-black text-rose-400 text-right">92%</span>}
                  </div>
                  
                  <div className={`flex-1 border-2 flex flex-col justify-between p-2 rounded transition-colors duration-1000 ${dataLoaded ? 'border-fuchsia-500 bg-fuchsia-900/30' : 'border-slate-700 bg-slate-800'}`}>
                    <span className="text-[10px] text-white font-bold">102 (Island)</span>
                    {dataLoaded && <span className="text-xs font-black text-fuchsia-400 text-right">98%</span>}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <div className={`flex-1 border-2 flex flex-col justify-between p-2 rounded transition-colors duration-1000 ${dataLoaded ? 'border-blue-500 bg-blue-900/30' : 'border-slate-700 bg-slate-800'}`}>
                      <span className="text-[10px] text-white font-bold">101</span>
                      {dataLoaded && <span className="text-xs font-black text-blue-400 text-right">41%</span>}
                    </div>
                    <div className={`flex-1 border-2 flex flex-col justify-between p-2 rounded transition-colors duration-1000 ${dataLoaded ? 'border-orange-500 bg-orange-900/30' : 'border-slate-700 bg-slate-800'}`}>
                      <span className="text-[10px] text-white font-bold">103</span>
                      {dataLoaded && <span className="text-xs font-black text-orange-400 text-right">76%</span>}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Pricing Ledger */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="pb-3 font-bold">Booth ID</th>
                    <th className="pb-3 font-bold">Traffic Score</th>
                    <th className="pb-3 font-bold text-right">Base Rate</th>
                    <th className="pb-3 font-bold text-right">Optimized Rate</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {booths.map(booth => (
                    <tr key={booth.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-4">
                        <span className="font-bold text-white block">{booth.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{booth.type}</span>
                      </td>
                      <td className="py-4">
                        {dataLoaded ? (
                          <div className="flex items-center">
                            <span className={`font-black ${booth.trafficScore > 80 ? 'text-rose-400' : booth.trafficScore > 50 ? 'text-orange-400' : 'text-blue-400'}`}>
                              {booth.trafficScore}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1">/100</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">--</span>
                        )}
                      </td>
                      <td className="py-4 text-right text-slate-400 font-mono">
                        ${booth.basePrice.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        {dataLoaded ? (
                          <div className="flex flex-col items-end">
                            <span className="font-black text-white font-mono">${booth.currentPrice.toLocaleString()}</span>
                            {booth.currentPrice > booth.basePrice ? (
                              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Premium +${(booth.currentPrice - booth.basePrice).toLocaleString()}</span>
                            ) : booth.currentPrice < booth.basePrice ? (
                              <span className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1">Discounted -${(booth.basePrice - booth.currentPrice).toLocaleString()}</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SponsorshipHeatmapPricing;
