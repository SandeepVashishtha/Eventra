import React, { useState, useEffect } from 'react';

const SponsorshipRoiTracker = () => {
  const [analyzing, setAnalyzing] = useState(true);
  const [roiData, setRoiData] = useState(null);

  useEffect(() => {
    // Simulate computer vision analysis loading
    const timer = setTimeout(() => {
      setRoiData({
        sponsorName: "TechCorp Global",
        totalScreenTime: "4h 23m",
        estimatedImpressions: 45200,
        engagementValue: "$12,450",
        topPlacement: "Main Stage Livestream - Bottom Third"
      });
      setAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Sponsorship ROI Tracking</h2>
          <p className="text-sm text-gray-500 mt-1">Computer Vision powered logo detection</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Live Analysis Active
        </div>
      </div>

      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 flex justify-center items-center group">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwaDQwdjQwaC00MHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        {analyzing ? (
          <div className="text-white flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Scanning video feeds for sponsor logos...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Simulated bounding box */}
            <div className="absolute top-1/4 left-1/3 w-32 h-16 border-2 border-green-500 bg-green-500/20 flex items-center justify-center">
              <span className="bg-green-500 text-white text-xs px-1 absolute -top-4 left-0">Logo Detected (98%)</span>
              <span className="text-white font-bold opacity-50">TechCorp</span>
            </div>
          </div>
        )}
      </div>

      {!analyzing && roiData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500 uppercase font-semibold">Sponsor</p>
            <p className="text-lg font-bold">{roiData.sponsorName}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Screen Time</p>
            <p className="text-lg font-bold text-blue-600">{roiData.totalScreenTime}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500 uppercase font-semibold">Estimated Impressions</p>
            <p className="text-lg font-bold text-purple-600">{roiData.estimatedImpressions.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded border border-green-100">
            <p className="text-xs text-green-600 uppercase font-semibold">Calculated Value</p>
            <p className="text-xl font-black text-green-700">{roiData.engagementValue}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorshipRoiTracker;
