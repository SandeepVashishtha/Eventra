import React, { useState, useEffect } from 'react';

const DynamicTicketPricingEngine = () => {
  const [basePrice, setBasePrice] = useState(100);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [capacityRemaining, setCapacityRemaining] = useState(85);
  const [daysToEvent, setDaysToEvent] = useState(30);

  useEffect(() => {
    // Simulated rules engine for dynamic pricing
    const interval = setInterval(() => {
      setDaysToEvent(prev => Math.max(0, prev - 1));
      setCapacityRemaining(prev => Math.max(0, prev - Math.floor(Math.random() * 5)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let multiplier = 1.0;

    // Rule 1: Scarcity (Capacity remaining)
    if (capacityRemaining < 20) multiplier += 0.5;
    else if (capacityRemaining < 50) multiplier += 0.2;

    // Rule 2: Proximity to event
    if (daysToEvent < 7) multiplier += 0.3;
    else if (daysToEvent < 14) multiplier += 0.1;

    // UI Boundaries prevent price gouging
    const maxMultiplier = 2.0; 
    const finalMultiplier = Math.min(multiplier, maxMultiplier);
    
    setCurrentPrice(Math.round(basePrice * finalMultiplier));
  }, [capacityRemaining, daysToEvent, basePrice]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-xl mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dynamic Pricing Engine</h2>
          <p className="text-sm text-gray-500">Automated price adjustments based on rules.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center shadow-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          Engine Active
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Live Ticket Price</p>
        <div className="flex items-center justify-center">
          <span className="text-6xl font-black text-gray-900">${currentPrice}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Base: ${basePrice} <span className="mx-2">•</span> Max Cap: ${basePrice * 2}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Active Pricing Rules</h3>
        
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🎟️</span>
            <div>
              <p className="font-medium text-gray-800 text-sm">Remaining Capacity</p>
              <p className="text-xs text-gray-500">Adjusts based on scarcity</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${capacityRemaining < 20 ? 'text-red-500' : capacityRemaining < 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {capacityRemaining}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-gray-800 text-sm">Proximity to Event</p>
              <p className="text-xs text-gray-500">Price scales as date approaches</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${daysToEvent < 7 ? 'text-red-500' : 'text-blue-500'}`}>
              {daysToEvent} Days
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 border-2 border-gray-300 text-gray-600 text-sm font-bold rounded hover:bg-gray-50 transition">
          Configure Price Boundaries
        </button>
      </div>
    </div>
  );
};

export default DynamicTicketPricingEngine;
