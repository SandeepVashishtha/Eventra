import React, { useState, useEffect } from 'react';

const HVACPredictiveOptimizer = () => {
  const [simulationRunning, setSimulationRunning] = useState(false);
  
  // Real-time metrics
  const [metrics, setMetrics] = useState({
    crowdCount: 450,
    scanVelocity: 12, // scans per minute
    temperature: 71.2, // Fahrenheit
    targetTemp: 71.0,
    hvacStatus: 'idle', // idle, pre_cooling, active_cooling
    predictedTempSpike: 71.5
  });

  const maxCapacity = 5000;

  const runKeynoteSimulation = () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    
    let currentCrowd = 450;
    let currentTemp = 71.2;
    let velocity = 12;

    const interval = setInterval(() => {
      // Massive influx of people (doors opened for keynote)
      velocity = Math.floor(Math.random() * 50) + 200; // 200-250 scans per min
      currentCrowd += Math.floor(velocity / 12); // add people per tick
      
      // Predict temperature based on velocity
      const predictedSpike = currentTemp + (velocity * 0.015);
      
      let newHvacStatus = 'idle';
      let target = 71.0;

      // Smart API Logic: If velocity is huge, PRE-COOL before temp actually rises
      if (velocity > 100) {
        newHvacStatus = 'pre_cooling';
        target = 68.0; // Drop target temp to combat incoming body heat
      }

      // Actual physical temperature slowly reacts
      if (newHvacStatus === 'pre_cooling') {
        currentTemp -= 0.05; // HVAC working
      } else {
        currentTemp += (currentCrowd * 0.0001); // Body heat naturally warms room
      }

      setMetrics({
        crowdCount: Math.min(currentCrowd, maxCapacity),
        scanVelocity: velocity,
        temperature: parseFloat(currentTemp.toFixed(1)),
        targetTemp: target,
        hvacStatus: newHvacStatus,
        predictedTempSpike: parseFloat(predictedSpike.toFixed(1))
      });

      if (currentCrowd >= 3500) {
        clearInterval(interval);
        setTimeout(() => {
          setSimulationRunning(false);
          // Stabilize
          setMetrics(prev => ({
            ...prev,
            scanVelocity: 5,
            hvacStatus: 'active_cooling',
            targetTemp: 70.0
          }));
        }, 2000);
      }
    }, 800);
  };

  const resetSimulation = () => {
    setSimulationRunning(false);
    setMetrics({
      crowdCount: 450,
      scanVelocity: 12,
      temperature: 71.2,
      targetTemp: 71.0,
      hvacStatus: 'idle',
      predictedTempSpike: 71.5
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-sky-900/50 text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Smart Building API
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Predictive HVAC Optimization</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Don't wait for attendees to complain on Twitter that the keynote hall is a sauna. By analyzing real-time badge scan velocity at the doors, Eventra predicts the rapid influx of body heat and proactively triggers the venue's smart HVAC system to pre-cool the room before the temperature actually spikes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Telemetry & Controls (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Main Hall Telemetry</h3>
              <span className="bg-emerald-900/50 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded border border-emerald-500/30 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span> Connected to Siemens BMS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Current Crowd</span>
                <span className="text-2xl font-black text-white">
                  {metrics.crowdCount.toLocaleString()} <span className="text-sm text-slate-600 font-normal">/ {maxCapacity}</span>
                </span>
              </div>
              <div className={`p-4 rounded-2xl border text-center transition-colors ${metrics.scanVelocity > 100 ? 'bg-rose-950/30 border-rose-900/50' : 'bg-slate-950 border-slate-800'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${metrics.scanVelocity > 100 ? 'text-rose-500' : 'text-slate-500'}`}>Ingress Velocity</span>
                <span className={`text-2xl font-black ${metrics.scanVelocity > 100 ? 'text-rose-500' : 'text-white'}`}>
                  {metrics.scanVelocity} <span className="text-sm font-normal opacity-50">scans/min</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6 relative overflow-hidden">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Thermodynamic Prediction</h4>
               
               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm text-slate-400">Current Ambient Temp</span>
                 <span className="text-xl font-black text-white">{metrics.temperature}°F</span>
               </div>
               
               <div className="flex justify-between items-end mt-4">
                 <span className={`text-sm font-bold ${metrics.predictedTempSpike > 73 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>Predicted Spike (Next 15m)</span>
                 <span className={`text-xl font-black ${metrics.predictedTempSpike > 73 ? 'text-rose-500' : 'text-amber-500'}`}>{metrics.predictedTempSpike}°F</span>
               </div>
            </div>

            <div className="mt-auto flex space-x-3">
              <button 
                onClick={runKeynoteSimulation}
                disabled={simulationRunning || metrics.crowdCount > 1000}
                className={`flex-1 py-4 rounded-xl font-black text-sm transition shadow-lg ${simulationRunning || metrics.crowdCount > 1000 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}
              >
                {simulationRunning ? 'Simulating Ingress...' : 'Simulate Keynote Doors Opening'}
              </button>
              {(simulationRunning || metrics.crowdCount > 1000) && (
                <button 
                  onClick={resetSimulation}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
                >
                  Reset
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: HVAC System Status (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-800 bg-slate-950/50 z-10 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-white">Zone 1: Keynote Hall HVAC</h2>
              <span className="text-xs text-slate-400 font-mono">BMS Override Authorized</span>
            </div>
            
            <div className={`px-4 py-2 rounded-lg border flex items-center ${
              metrics.hvacStatus === 'pre_cooling' ? 'bg-sky-900/30 border-sky-500/50 text-sky-400' : 
              metrics.hvacStatus === 'active_cooling' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400' : 
              'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {metrics.hvacStatus === 'pre_cooling' && <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 animate-ping"></span>}
              <span className="text-xs font-black uppercase tracking-widest">
                {metrics.hvacStatus === 'pre_cooling' ? 'PRE-COOLING ENGAGED' : 
                 metrics.hvacStatus === 'active_cooling' ? 'ACTIVE COOLING' : 'STANDBY IDLE'}
              </span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-8">
            
            {/* Visualizer for Room Air */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              {metrics.hvacStatus !== 'idle' && (
                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  <div className="w-full h-8 bg-sky-500/20 blur-xl animate-[pulse_2s_ease-in-out_infinite]"></div>
                  <div className="w-full h-8 bg-sky-500/20 blur-xl animate-[pulse_2.5s_ease-in-out_infinite]"></div>
                  <div className="w-full h-8 bg-sky-500/20 blur-xl animate-[pulse_3s_ease-in-out_infinite]"></div>
                </div>
              )}
              {/* Heat simulation when doors open but before cooling takes effect */}
              {metrics.scanVelocity > 100 && metrics.hvacStatus === 'idle' && (
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent animate-pulse"></div>
              )}
            </div>

            {/* Central Dial */}
            <div className="relative z-10 w-80 h-80 bg-slate-950 rounded-full border-[16px] border-slate-900 shadow-2xl flex flex-col items-center justify-center">
              
              {/* Dial Ring (Blue when cooling) */}
              <div className={`absolute inset-[-16px] rounded-full border-[16px] transition-colors duration-1000 ${
                metrics.hvacStatus === 'pre_cooling' ? 'border-sky-500 border-b-transparent animate-spin-slow' : 
                metrics.hvacStatus === 'active_cooling' ? 'border-blue-500 opacity-50' : 
                'border-transparent'
              }`}></div>

              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Target Temp Setpoint</span>
              <div className="flex items-start">
                <span className={`text-7xl font-black transition-colors duration-1000 ${
                  metrics.hvacStatus === 'pre_cooling' ? 'text-sky-400' : 'text-white'
                }`}>
                  {metrics.targetTemp.toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-slate-600 mt-2">°F</span>
              </div>

              {metrics.hvacStatus === 'pre_cooling' && (
                <div className="absolute bottom-10 text-center animate-fade-in-up">
                  <span className="text-[10px] text-sky-400 font-mono bg-sky-900/30 px-2 py-1 rounded">
                    OVERRIDE TRIGGERED BY SCAN VELOCITY
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HVACPredictiveOptimizer;
