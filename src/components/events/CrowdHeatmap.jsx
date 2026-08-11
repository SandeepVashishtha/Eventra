import React from 'react';

const CrowdHeatmap = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Real-time Crowd Density Heatmap</h2>
      <p className="text-gray-600 mb-6">Monitor venue crowd flow to prevent bottlenecks and ensure safety.</p>
      
      <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border">
        {/* Placeholder for the heatmap graphic */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-red-500 opacity-50 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-400 opacity-50 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-green-500 opacity-50 rounded-full blur-lg"></div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-white/80 px-4 py-2 rounded-md font-semibold text-gray-800 shadow-sm">
            Venue Map View (Live)
          </span>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-red-50 p-3 rounded-md">
          <div className="text-red-600 font-bold text-lg">Zone A</div>
          <div className="text-sm text-red-500">Overcrowded (95%)</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-md">
          <div className="text-yellow-600 font-bold text-lg">Zone B</div>
          <div className="text-sm text-yellow-500">Moderate (60%)</div>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <div className="text-green-600 font-bold text-lg">Zone C</div>
          <div className="text-sm text-green-500">Clear (20%)</div>
        </div>
      </div>
    </div>
  );
};

export default CrowdHeatmap;
