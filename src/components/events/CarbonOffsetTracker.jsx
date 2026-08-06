import React, { useState } from 'react';

const CarbonOffsetTracker = () => {
  const [offsetting, setOffsetting] = useState(false);
  const [offsetComplete, setOffsetComplete] = useState(false);

  const footprintData = [
    { category: 'Attendee Travel (Flights/Transit)', co2e: 45.2, percentage: 70, color: 'bg-slate-700' },
    { category: 'Venue Energy (HVAC/Lighting)', co2e: 12.5, percentage: 19, color: 'bg-yellow-500' },
    { category: 'Catering & Food Waste', co2e: 5.1, percentage: 8, color: 'bg-emerald-500' },
    { category: 'Event Materials & Swag', co2e: 1.8, percentage: 3, color: 'bg-blue-500' }
  ];

  const totalCO2 = footprintData.reduce((acc, item) => acc + item.co2e, 0).toFixed(1);
  const offsetCost = (totalCO2 * 15).toFixed(2); // Assuming $15 per ton

  const handleOffset = () => {
    setOffsetting(true);
    setTimeout(() => {
      setOffsetting(false);
      setOffsetComplete(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <span className="mr-3 text-emerald-500">🌱</span> ESG Sustainability Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time carbon footprint calculation & automated offsetting via Patch API.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-sm">
            Eventra Climate-Certified
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Calculation Dashboard */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Total Event Footprint (tCO₂e)</h2>
            
            {/* Visual Breakdown Bar */}
            <div className="w-full h-8 flex rounded-xl overflow-hidden mb-6 shadow-inner bg-slate-100">
              {footprintData.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`h-full ${item.color} transition-all duration-1000 ease-out flex items-center justify-center`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.category}: ${item.percentage}%`}
                ></div>
              ))}
            </div>

            {/* List Breakdown */}
            <div className="space-y-4 flex-1">
              {footprintData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-bold text-slate-700 text-sm">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{item.co2e}</span>
                    <span className="text-xs text-slate-500 ml-1">tCO₂e</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregated Total</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Calculated using verified attendee travel inputs and EPA-standard venue energy modifiers.
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-slate-900">{totalCO2}</span>
                <span className="text-sm font-bold text-slate-500 ml-1">tons</span>
              </div>
            </div>
          </div>

          {/* Action / API Gateway Side */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className={`rounded-3xl p-6 shadow-xl border relative overflow-hidden transition-colors duration-500 ${offsetComplete ? 'bg-emerald-900 border-emerald-800 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <h3 className="font-bold mb-6 z-10 relative">Carbon Offset Gateway</h3>

              <div className="space-y-4 z-10 relative flex-1">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-slate-300 uppercase tracking-widest mb-1">Offset Portfolio</p>
                  <p className="font-bold">Direct Air Capture & Reforestation</p>
                  <a href="#" className="text-[10px] text-emerald-400 hover:underline">View Verified Projects on Patch.io ↗</a>
                </div>

                <div className="flex justify-between items-baseline border-b border-white/20 pb-4">
                  <span className="text-slate-300 text-sm">Market Rate / ton</span>
                  <span className="font-bold">$15.00</span>
                </div>
                
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300 font-bold">Total Cost to Offset</span>
                  <span className="text-3xl font-black">${offsetCost}</span>
                </div>
              </div>

              {!offsetComplete ? (
                <button 
                  onClick={handleOffset}
                  disabled={offsetting}
                  className={`w-full mt-8 py-4 rounded-xl font-black shadow-lg transition flex items-center justify-center z-10 relative ${offsetting ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                >
                  {offsetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing API...
                    </>
                  ) : (
                    'Purchase Offsets Now'
                  )}
                </button>
              ) : (
                <div className="mt-8 bg-white text-emerald-900 p-4 rounded-xl text-center z-10 relative animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <span className="text-2xl block mb-2">🏆</span>
                  <p className="font-black text-lg leading-none mb-1">100% Carbon Neutral</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Certificate Generated</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CarbonOffsetTracker;
