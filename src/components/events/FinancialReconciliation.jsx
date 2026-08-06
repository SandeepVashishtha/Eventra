import React, { useState } from 'react';

const FinancialReconciliation = () => {
  const [reconciling, setReconciling] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const stats = {
    gross: 450250.00,
    refunds: 12500.00,
    taxes: 38245.50,
    vendorPayouts: 85400.00,
    platformFees: 9005.00,
  };

  const netRevenue = stats.gross - stats.refunds - stats.taxes - stats.vendorPayouts - stats.platformFees;

  const handleRunReconciliation = () => {
    setReconciling(true);
    setReportReady(false);
    setProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setReconciling(false);
          setReportReady(true);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-sans text-slate-800 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Context */}
        <div className="space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Automated Accounting
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Financial <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Reconciliation Engine</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Stop spending weeks wrestling with spreadsheets. Aggregate transactions, calculate multi-tier revenue splits, and apply regional tax logic automatically.
          </p>
          
          <div className="pt-4 border-t border-slate-200">
             <button 
                onClick={handleRunReconciliation}
                disabled={reconciling || reportReady}
                className={`w-full py-4 rounded-xl font-black shadow-lg transition flex justify-center items-center ${reconciling ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : reportReady ? 'bg-emerald-500 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
             >
               {reconciling ? (
                 <><span className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-3"></span> Aggregating Ledgers...</>
               ) : reportReady ? (
                 '✓ Reconciliation Complete'
               ) : (
                 'Run End-of-Event Reconciliation'
               )}
             </button>
             
             {reconciling && (
               <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Dashboard UI */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col justify-between h-[600px]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Post-Event Ledger</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Status: {reportReady ? <span className="text-emerald-500">Reconciled</span> : <span className="text-amber-500">Pending Run</span>}</p>
            </div>
            {reportReady && (
              <button className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold px-3 py-2 rounded-lg transition border border-slate-200">
                Export to QuickBooks
              </button>
            )}
          </div>

          {!reportReady && !reconciling ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <span className="text-6xl mb-4">🧾</span>
              <p className="font-bold text-slate-500">Awaiting Reconciliation Run</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">Click the button to aggregate all ticket sales, sponsor payments, and vendor splits.</p>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col space-y-6 ${reconciling ? 'opacity-30 blur-sm pointer-events-none' : 'animate-fade-in'}`}>
              
              {/* Financial Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                
                <div className="flex justify-between items-end border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gross Revenue</p>
                    <p className="text-2xl font-black text-slate-900">${stats.gross.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-2 py-1 rounded">12,450 Txns</span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 font-medium">
                  <div className="flex justify-between text-red-400">
                    <span>Refunds Processed</span>
                    <span>-${stats.refunds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Tax Withholdings (CA 8.5%)</span>
                    <span>-${stats.taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendor Revenue Splits (Food/Merch)</span>
                    <span>-${stats.vendorPayouts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fees (2%)</span>
                    <span>-${stats.platformFees.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Net Payout */}
              <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Final Organizer Net Payout</p>
                <h3 className="text-4xl font-black text-white">${netRevenue.toLocaleString()}</h3>
                
                {reportReady && (
                  <div className="mt-6 pt-4 border-t border-indigo-800 flex justify-between items-center text-xs font-bold">
                    <span className="text-indigo-200 flex items-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                      Cleared for ACH Transfer
                    </span>
                    <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      Initiate Payout
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default FinancialReconciliation;
