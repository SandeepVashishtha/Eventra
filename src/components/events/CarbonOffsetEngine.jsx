import React, { useState, useEffect } from 'react';

const CarbonOffsetEngine = () => {
  const [calculating, setCalculating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [netZeroAchieved, setNetZeroAchieved] = useState(false);
  
  const [emissions, setEmissions] = useState({
    flights: 4250, // tonnes CO2
    venue: 840,
    catering: 120,
    groundTransit: 310
  });

  const totalEmissions = Object.values(emissions).reduce((a, b) => a + b, 0);
  const offsetCostPerTonne = 24.50; // USD
  const totalCost = totalEmissions * offsetCostPerTonne;

  const simulateLiveData = () => {
    setCalculating(true);
    setNetZeroAchieved(false);
    
    let ticks = 0;
    const interval = setInterval(() => {
      setEmissions(prev => ({
        flights: prev.flights + Math.floor(Math.random() * 50),
        venue: prev.venue + Math.floor(Math.random() * 5),
        catering: prev.catering + Math.floor(Math.random() * 2),
        groundTransit: prev.groundTransit + Math.floor(Math.random() * 8)
      }));
      
      ticks++;
      if (ticks > 20) {
        clearInterval(interval);
        setCalculating(false);
      }
    }, 150);
  };

  const purchaseOffsets = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      setNetZeroAchieved(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                ESG / Sustainability
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Real-Time Carbon Offset Engine</h1>
            </div>
            <p className="text-neutral-400 text-sm max-w-3xl">
              Achieve verifiable Net Zero status to secure ESG-conscious Fortune 500 sponsorships. Eventra aggregates live attendee flight data, venue power consumption, and catering waste to calculate your exact carbon footprint in real-time, instantly purchasing verified carbon credits via the Patch API.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Event Status</span>
            <div className={`px-4 py-2 rounded-lg border font-black uppercase tracking-widest text-sm flex items-center shadow-lg ${
              netZeroAchieved ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-rose-900/40 border-rose-500/50 text-rose-400'
            }`}>
              {netZeroAchieved && <span className="mr-2">✓</span>}
              {netZeroAchieved ? 'NET ZERO ACHIEVED' : 'CARBON POSITIVE'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Emissions Telemetry (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-xl flex-1 flex flex-col relative overflow-hidden">
            
            {calculating && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-[scan_1s_linear_infinite] shadow-[0_0_10px_#10b981]"></div>}

            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Live Emissions Telemetry</h3>
              <button 
                onClick={simulateLiveData}
                disabled={calculating || netZeroAchieved}
                className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1.5 rounded transition"
              >
                Simulate Data Ingress
              </button>
            </div>

            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Total Carbon Footprint</span>
                <span className={`text-5xl font-black font-mono transition-colors ${netZeroAchieved ? 'text-emerald-500' : 'text-white'}`}>
                  {totalEmissions.toLocaleString()}
                </span>
                <span className="text-neutral-500 ml-2">tCO₂e</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Flights */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center"><span className="mr-2">✈️</span> Attendee Flights</span>
                  <span className="text-xs font-mono text-neutral-400">{emissions.flights.toLocaleString()} tCO₂e</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(emissions.flights / totalEmissions) * 100}%` }}></div>
                </div>
                <span className="text-[9px] text-neutral-500 mt-2 block">Aggregated from registration API (Origin Airports)</span>
              </div>
              
              {/* Venue */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center"><span className="mr-2">🏢</span> Venue Power (HVAC/AV)</span>
                  <span className="text-xs font-mono text-neutral-400">{emissions.venue.toLocaleString()} tCO₂e</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(emissions.venue / totalEmissions) * 100}%` }}></div>
                </div>
                <span className="text-[9px] text-neutral-500 mt-2 block">Pulled from Smart Building API</span>
              </div>

              {/* Transit */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-white flex items-center"><span className="mr-2">🚕</span> Ground Transit</span>
                  <span className="text-xs font-mono text-neutral-400">{emissions.groundTransit.toLocaleString()} tCO₂e</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${(emissions.groundTransit / totalEmissions) * 100}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Offset API & Checkout (Col span 7) */}
        <div className="lg:col-span-7 bg-black rounded-3xl border border-neutral-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-6 border-b border-neutral-800 bg-neutral-900 z-10 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-white">Carbon Offset API</h2>
              <span className="text-xs text-emerald-500 font-mono">Connected to Patch.io verified ledger</span>
            </div>
            <div className="w-8 h-8 rounded bg-emerald-900/30 flex items-center justify-center border border-emerald-500/50">
              <span className="text-emerald-500">🌱</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-8 justify-center">
            
            {netZeroAchieved ? (
              <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-8 text-center animate-fade-in-up relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                    <span className="text-white text-4xl">✓</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">Event is Officially Net Zero</h3>
                  <p className="text-emerald-400 mb-6">You have successfully offset {totalEmissions.toLocaleString()} tonnes of CO₂e.</p>
                  
                  <div className="bg-black/50 p-4 rounded-xl inline-block text-left">
                    <span className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Verified Registry Block Hash</span>
                    <span className="block text-xs font-mono text-emerald-500">0x7a9f...3b12 (Verra Registry)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto w-full">
                
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
                  <h4 className="text-sm font-bold text-white mb-4">Select Offset Project Portfolio</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border-2 border-emerald-500 bg-emerald-900/10 rounded-xl cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="portfolio" className="mr-3" defaultChecked />
                        <div>
                          <span className="block font-bold text-white text-sm">Direct Air Capture & Forestry</span>
                          <span className="block text-[10px] text-neutral-400">Verified by Gold Standard & Verra</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">${offsetCostPerTonne.toFixed(2)} / t</span>
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-neutral-700 hover:border-neutral-500 rounded-xl cursor-pointer opacity-50">
                      <div className="flex items-center">
                        <input type="radio" name="portfolio" className="mr-3" disabled />
                        <div>
                          <span className="block font-bold text-white text-sm">Ocean Alkalinity Enhancement</span>
                          <span className="block text-[10px] text-neutral-400">Experimental / Future</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">${(45.00).toFixed(2)} / t</span>
                    </label>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Required Offset Volume</span>
                    <span className="font-mono text-white">{totalEmissions.toLocaleString()} tCO₂e</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-800">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Rate per Tonne</span>
                    <span className="font-mono text-white">${offsetCostPerTonne.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-sm font-black text-white uppercase">Total API Invoice</span>
                    <span className="text-3xl font-black font-mono text-white">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  <button 
                    onClick={purchaseOffsets}
                    disabled={purchasing}
                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition flex items-center justify-center ${
                      purchasing ? 'bg-emerald-800 text-emerald-300 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    {purchasing ? (
                      <><span className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin mr-2"></span> Executing Smart Contract...</>
                    ) : (
                      'Purchase Credits & Achieve Net Zero'
                    )}
                  </button>
                  <p className="text-[9px] text-neutral-500 text-center mt-3 uppercase tracking-widest">Billed to Eventra Master Account via Stripe</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(650px); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default CarbonOffsetEngine;
