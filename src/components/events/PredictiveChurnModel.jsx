import React, { useState } from 'react';

const PredictiveChurnModel = () => {
  const [modelRunning, setModelRunning] = useState(false);
  const [campaignLaunched, setCampaignLaunched] = useState(false);

  const [attendees, setAttendees] = useState([
    { id: 'usr_849', name: 'David Kim', company: 'NexusTech', churnRisk: 92, riskLevel: 'High', factors: ['Low App Usage (12m total)', '0 Connections Made', 'Left 1 Day Early'], status: 'pending' },
    { id: 'usr_102', name: 'Sarah Connor', company: 'CyberDyne', churnRisk: 85, riskLevel: 'High', factors: ['NPS Score: 3/10', 'Did not attend Keynote', 'No Sponsor Scans'], status: 'pending' },
    { id: 'usr_993', name: 'Marcus Vance', company: 'Global IO', churnRisk: 45, riskLevel: 'Medium', factors: ['Average Session Time', 'No VIP Upgrades'], status: 'pending' },
    { id: 'usr_422', name: 'Elena Rostova', company: 'DataSys', churnRisk: 12, riskLevel: 'Low', factors: ['Highly Active (14h App Usage)', '34 Connections Made', 'NPS Score: 9/10'], status: 'pending' }
  ]);

  const [metrics, setMetrics] = useState({
    totalAnalyzed: 0,
    highRiskCount: 0,
    revenueAtRisk: 0,
    recoveredRevenue: 0
  });

  const handleRunModel = () => {
    setModelRunning(true);
    
    setTimeout(() => {
      setModelRunning(false);
      setMetrics({
        totalAnalyzed: 14502,
        highRiskCount: 3420,
        revenueAtRisk: 1282500, // 3420 * $375 ticket
        recoveredRevenue: 0
      });
    }, 2000);
  };

  const handleLaunchCampaign = () => {
    setCampaignLaunched(true);
    
    // Simulate updating statuses
    setAttendees(prev => prev.map(a => 
      a.riskLevel === 'High' ? { ...a, status: 'discount_sent' } : a
    ));

    // Simulate recovery over time
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        recoveredRevenue: 345000 // Fake recovery metric
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 p-6 overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-purple-900/50 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                Revenue Engine
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">Predictive Churn Model</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Transform Eventra into a direct revenue-generating engine. Our ML model analyzes historical engagement from last year's event to accurately predict which attendees are likely to churn, allowing you to instantly trigger targeted win-back discount campaigns.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Analytics & Action (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Churn Risk Analysis</h3>
              <button 
                onClick={handleRunModel}
                disabled={metrics.totalAnalyzed > 0 || modelRunning}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center shadow-md ${metrics.totalAnalyzed > 0 ? 'bg-slate-800 text-emerald-500 cursor-not-allowed' : modelRunning ? 'bg-purple-900/50 text-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/50'}`}
              >
                {modelRunning ? (
                  <><span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2"></span> Analyzing Data...</>
                ) : metrics.totalAnalyzed > 0 ? (
                  '✓ Analysis Complete'
                ) : (
                  'Run ML Model (2025 Data)'
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Total Profiles Analyzed</span>
                <span className="text-2xl font-black text-slate-300">
                  {metrics.totalAnalyzed > 0 ? metrics.totalAnalyzed.toLocaleString() : '- -'}
                </span>
              </div>
              <div className="bg-rose-950/30 p-4 rounded-2xl border border-rose-900/50 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 rounded-full -mr-4 -mt-4"></div>
                <span className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest block mb-1">High Risk Profiles</span>
                <span className={`text-2xl font-black ${metrics.highRiskCount > 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                  {metrics.highRiskCount > 0 ? metrics.highRiskCount.toLocaleString() : '- -'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-auto relative overflow-hidden">
               
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Financial Impact</h4>
               
               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm text-slate-400">Total Revenue At Risk</span>
                 <span className="text-xl font-black text-white">${metrics.revenueAtRisk.toLocaleString()}</span>
               </div>
               <div className="w-full h-2 bg-slate-900 rounded-full mb-4 overflow-hidden flex">
                 <div className="h-full bg-slate-700 w-full"></div>
               </div>

               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm text-emerald-500/70">Projected Recovery (Win-Back)</span>
                 <span className={`text-xl font-black transition-colors duration-1000 ${metrics.recoveredRevenue > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>
                   ${metrics.recoveredRevenue.toLocaleString()}
                 </span>
               </div>
               <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                 <div 
                   className="h-full bg-emerald-500 transition-all duration-[2000ms] ease-out"
                   style={{ width: metrics.revenueAtRisk > 0 ? `${(metrics.recoveredRevenue / metrics.revenueAtRisk) * 100}%` : '0%' }}
                 ></div>
               </div>
            </div>

            <button 
              onClick={handleLaunchCampaign}
              disabled={metrics.highRiskCount === 0 || campaignLaunched}
              className={`w-full py-4 mt-6 rounded-xl font-black text-sm transition shadow-lg flex items-center justify-center space-x-2 ${
                metrics.highRiskCount === 0 
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                  : campaignLaunched 
                    ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white'
              }`}
            >
              {campaignLaunched ? '✓ Win-Back Campaign Deployed' : 'Trigger 20% Discount Campaign to High Risk'}
            </button>

          </div>
        </div>

        {/* Right Side: High Risk Lead Table (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-800 bg-slate-900 z-10 flex justify-between items-center">
            <h2 className="text-lg font-black text-white">Attendee Churn Database</h2>
            <div className="flex space-x-2">
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded">Sorted by Risk</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
            
            {metrics.totalAnalyzed === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <span className="text-4xl mb-4">🧠</span>
                <p className="text-white font-bold">Awaiting Model Execution...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendees.map(attendee => (
                  <div key={attendee.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition animate-fade-in-up">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-black text-white">{attendee.name}</h4>
                        <p className="text-xs text-slate-400">{attendee.company} <span className="mx-2 text-slate-700">|</span> ID: {attendee.id}</p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest mb-1 ${
                          attendee.riskLevel === 'High' ? 'bg-rose-900/50 text-rose-500 border border-rose-500/30' :
                          attendee.riskLevel === 'Medium' ? 'bg-amber-900/50 text-amber-500 border border-amber-500/30' :
                          'bg-blue-900/50 text-blue-500 border border-blue-500/30'
                        }`}>
                          {attendee.riskLevel} Risk
                        </span>
                        <span className="text-2xl font-black text-slate-300">{attendee.churnRisk}%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Key Risk Factors</h5>
                      <div className="flex flex-wrap gap-2">
                        {attendee.factors.map((factor, idx) => (
                          <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500">Suggested Action: <span className="text-white">20% Discount Code</span></span>
                       
                       {attendee.status === 'discount_sent' ? (
                         <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span> Offer Emailed
                         </span>
                       ) : (
                         <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center">
                           <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mr-2"></span> Pending
                         </span>
                       )}
                    </div>

                  </div>
                ))}
              </div>
            )}
            
          </div>

          {/* Model Processing Overlay */}
          {modelRunning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]"></div>
              <p className="text-purple-400 font-bold font-mono text-sm uppercase tracking-widest animate-pulse">Running Random Forest Classifier...</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PredictiveChurnModel;
