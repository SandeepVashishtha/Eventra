import React, { useState, useEffect } from 'react';

const DynamicPricing = () => {
  const [currentPrice, setCurrentPrice] = useState(150);
  const [demandFactor, setDemandFactor] = useState(1.0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time dynamic pricing based on "demand"
      const fluctuation = Math.random() * 0.1 - 0.03; // Slight upward bias
      const newFactor = Math.max(1.0, Math.min(2.5, demandFactor + fluctuation));
      setDemandFactor(newFactor);
      setCurrentPrice(Math.round(150 * newFactor));
    }, 3000);
    return () => clearInterval(interval);
  }, [demandFactor]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-2">Dynamic Ticket Pricing</h2>
      <p className="text-gray-500 mb-6 text-sm">Automated price adjustments based on real-time market demand.</p>

      <div className="bg-gray-50 p-6 rounded-lg border flex flex-col items-center">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Current Ticket Price</div>
        <div className="text-5xl font-black text-gray-900 mb-2">${currentPrice}</div>
        
        <div className="flex items-center space-x-2 text-sm mt-4">
          <span className="font-medium text-gray-600">Base Price: $150</span>
          <span className="text-gray-300">|</span>
          <span className={`font-medium ${demandFactor > 1.2 ? 'text-red-500' : 'text-green-500'}`}>
            Demand Multiplier: {demandFactor.toFixed(2)}x
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Algorithm Factors:</h3>
        <div className="flex justify-between items-center text-sm">
          <span>Remaining Capacity:</span>
          <span className="font-mono bg-red-100 text-red-700 px-2 rounded">Low (12%)</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Days Until Event:</span>
          <span className="font-mono bg-yellow-100 text-yellow-700 px-2 rounded">14 Days</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Current Traffic/Conversion:</span>
          <span className="font-mono bg-green-100 text-green-700 px-2 rounded">High (4.2%)</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricing;
