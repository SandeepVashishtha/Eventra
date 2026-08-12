import React, { useState } from 'react';

const PredictiveNoShowModel = () => {
  const [totalRegistrants] = useState(12500);
  const [sendingPromo, setSendingPromo] = useState(false);
  const [promoSent, setPromoSent] = useState(false);

  // Simulated ML Classification Cohorts
  const cohorts = [
    { label: 'High Probability (80-100%)', count: 4200, color: 'bg-emerald-500', risk: 'low' },
    { label: 'Moderate Probability (50-79%)', count: 3100, color: 'bg-blue-500', risk: 'medium' },
    { label: 'At Risk (20-49%)', count: 2800, color: 'bg-orange-500', risk: 'high' },
    { label: 'Likely No-Show (0-19%)', count: 2400, color: 'bg-red-500', risk: 'critical' }
  ];

  const predictedAttendance = cohorts[0].count + Math.round(cohorts[1].count * 0.65) + Math.round(cohorts[2].count * 0.35) + Math.round(cohorts[3].count * 0.1);

  const modelFactors = [
    { name: 'Email Open Rate', impact: 'High', value: '42% Avg' },
    { name: 'Registration Proximity', impact: 'High', value: 'Days to Event' },
    { name: 'Past Event Attendance', impact: 'Medium', value: 'Historical DB' },
    { name: 'Profile Completeness', impact: 'Low', value: '88% Avg' }
  ];

  const handleSendTargetedPromo = () => {
    setSendingPromo(true);
    setTimeout(() => {
      setSendingPromo(false);
      setPromoSent(true);
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
              <span className="mr-3">🧠</span> XGBoost Attendance Predictor
            </h2>
            <p className="text-sm text-slate-500 mt-1">Machine learning classification model for event churn and no-show prediction.</p>
          </div>
          <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm font-bold text-xs uppercase tracking-widest">
            Model Status: Trained
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Registrations</p>
                <h3 className="text-5xl font-black text-slate-800">{totalRegistrants.toLocaleString()}</h3>
                <p className="text-sm text-slate-500 mt-2">Raw sign-ups for the virtual event.</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
                  AI Predicted Attendance
                </p>
                <div className="flex items-baseline space-x-3">
                  <h3 className="text-5xl font-black text-white">{predictedAttendance.toLocaleString()}</h3>
                  <span className="text-lg font-bold text-indigo-200">({Math.round((predictedAttendance/totalRegistrants)*100)}%)</span>
                </div>
                <p className="text-sm text-indigo-200 mt-2 font-medium">Estimated active viewers during the keynote.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-6 text-lg">Attendee Risk Cohorts</h3>
              
              <div className="space-y-5">
                {cohorts.map(cohort => {
                  const percentage = (cohort.count / totalRegistrants) * 100;
                  return (
                    <div key={cohort.label}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700">{cohort.label}</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{cohort.count.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${cohort.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Targeted Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Model Factors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Top Predictive Features</h3>
              <div className="space-y-3">
                {modelFactors.map((factor, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{factor.name}</p>
                      <p className="text-xs text-slate-500">{factor.value}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${factor.impact === 'High' ? 'bg-indigo-100 text-indigo-700' : factor.impact === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                      {factor.impact} Weight
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-orange-900 mb-2 flex items-center">
                <span className="mr-2">🎯</span> Intervention Needed
              </h3>
              <p className="text-sm text-orange-800 font-medium leading-relaxed mb-6">
                <strong>{cohorts[2].count.toLocaleString()}</strong> attendees are in the "At Risk" cohort. A targeted VIP networking incentive email is recommended to boost their probability of attending.
              </p>
              
              {promoSent ? (
                <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded-xl text-center font-bold text-sm flex items-center justify-center">
                  <span className="mr-2 text-xl">✅</span> Campaign Dispatched to 2,800 users.
                </div>
              ) : sendingPromo ? (
                <button disabled className="w-full bg-orange-200 text-orange-800 font-bold py-3 rounded-xl flex items-center justify-center transition">
                  <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing Campaign...
                </button>
              ) : (
                <button 
                  onClick={handleSendTargetedPromo}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.3)] transition"
                >
                  Send "At Risk" Incentive Email
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveNoShowModel;
