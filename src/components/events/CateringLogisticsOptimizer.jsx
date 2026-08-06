import React, { useState } from 'react';

const CateringLogisticsOptimizer = () => {
  const [totalRegistrations] = useState(2500);
  const [historicalDropOff] = useState(0.12); // 12% no-show rate
  const [vendorSubmitted, setVendorSubmitted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // The actual number of meals we predict we need
  const expectedAttendance = Math.round(totalRegistrations * (1 - historicalDropOff));

  const dietaryData = [
    { type: 'Standard (No Restrictions)', percentage: 65, color: 'bg-blue-500' },
    { type: 'Vegetarian', percentage: 15, color: 'bg-green-500' },
    { type: 'Vegan', percentage: 8, color: 'bg-emerald-600' },
    { type: 'Gluten-Free', percentage: 7, color: 'bg-yellow-500' },
    { type: 'Halal', percentage: 3, color: 'bg-indigo-500' },
    { type: 'Complex (Multiple Restrictions)', percentage: 2, color: 'bg-rose-500' }
  ];

  const generatePurchaseOrder = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setVendorSubmitted(true);
    }, 2000);
  };

  return (
    <div className="p-6 bg-orange-50 rounded-2xl shadow-xl max-w-5xl mx-auto mt-8 border border-orange-100 font-sans text-gray-800 flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Analytics & Predictor */}
      <div className="w-full lg:w-2/3 space-y-6">
        <div>
          <h2 className="text-3xl font-black text-orange-950 tracking-tight">Catering Logistics Optimizer</h2>
          <p className="text-sm text-orange-700 mt-1">Smart dietary aggregation and automated vendor ordering.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Registrations</p>
            <div className="flex items-end space-x-2">
              <h3 className="text-4xl font-black text-gray-900">{totalRegistrations}</h3>
              <span className="text-sm font-bold text-gray-400 mb-1">Pax</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-rose-500 p-5 rounded-xl shadow-md text-white">
            <p className="text-xs text-orange-100 font-bold uppercase tracking-wider mb-2 flex items-center">
              <span className="mr-1">🤖</span> AI Predicted Attendance
            </p>
            <div className="flex items-end space-x-2">
              <h3 className="text-4xl font-black">{expectedAttendance}</h3>
              <span className="text-sm font-bold text-orange-200 mb-1">Pax Required</span>
            </div>
            <p className="text-xs text-orange-100 mt-2 font-medium">Factoring in a 12% historical drop-off rate to minimize food waste.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">🥗</span> Aggregate Dietary Breakdown
          </h3>
          
          <div className="w-full h-8 flex rounded-full overflow-hidden mb-6 shadow-inner">
            {dietaryData.map(diet => (
              <div 
                key={diet.type} 
                className={`${diet.color} h-full`} 
                style={{ width: `${diet.percentage}%` }}
                title={`${diet.type}: ${diet.percentage}%`}
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {dietaryData.map(diet => {
              const mealCount = Math.round(expectedAttendance * (diet.percentage / 100));
              return (
                <div key={diet.type} className="flex items-start space-x-2 p-2 rounded hover:bg-orange-50 transition">
                  <div className={`w-3 h-3 rounded-full mt-1 ${diet.color}`}></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">{diet.type}</p>
                    <p className="text-lg font-black text-gray-900">{mealCount} <span className="text-xs font-bold text-gray-400">meals</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
          <span className="text-rose-500 text-xl mt-0.5">⚠️</span>
          <div>
            <h4 className="text-sm font-bold text-rose-800">Complex Restrictions Detected</h4>
            <p className="text-xs text-rose-700 leading-relaxed font-medium mt-1">
              44 attendees have multiple overlapping restrictions (e.g., Gluten-Free AND Vegan). The algorithm has automatically bucketed these into a "Complex" tier for specialized vendor handling.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Vendor Purchase Order */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="bg-white border border-orange-200 rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="bg-orange-100 p-4 border-b border-orange-200">
            <h3 className="font-bold text-orange-900">Vendor Purchase Order</h3>
            <p className="text-xs text-orange-700 font-medium">Gourmet Catering Co.</p>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-center">
            {vendorSubmitted ? (
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                  <span className="text-4xl">✅</span>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">Order Dispatched!</h4>
                <p className="text-sm text-gray-500 font-medium mb-6">
                  The automated purchase order has been sent to Gourmet Catering Co. via the vendor portal.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order Summary</p>
                  <p className="text-sm font-bold text-gray-800">Total Meals: {expectedAttendance}</p>
                  <p className="text-sm font-bold text-gray-800">Est. Cost: ${(expectedAttendance * 25).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                    <span className="text-4xl text-orange-500">📋</span>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Ready to Order</h4>
                  <p className="text-sm text-gray-500 font-medium">
                    The algorithm has finalized the optimal meal quantities based on your live registration data.
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Buffer Margin</span>
                    <span className="font-bold text-green-600">+5% added</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Est. Waste Reduction</span>
                    <span className="font-bold text-blue-600">~250 meals</span>
                  </div>
                </div>

                {isCalculating ? (
                  <button disabled className="w-full bg-orange-200 text-orange-800 font-bold py-3 rounded-xl flex items-center justify-center transition">
                    <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                    Generating P.O...
                  </button>
                ) : (
                  <button 
                    onClick={generatePurchaseOrder}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)] transition"
                  >
                    Generate & Send Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringLogisticsOptimizer;
