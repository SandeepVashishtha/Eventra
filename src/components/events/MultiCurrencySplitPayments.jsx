import React, { useState, useEffect } from 'react';

const MultiCurrencySplitPayments = () => {
  const [currency, setCurrency] = useState('USD');
  const [processing, setProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  
  // Base ticket price is $299 USD
  const basePriceUSD = 299.00;
  
  const exchangeRates = {
    USD: { rate: 1, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
    JPY: { rate: 151.45, symbol: '¥', name: 'Japanese Yen' },
    AUD: { rate: 1.53, symbol: 'A$', name: 'Australian Dollar' }
  };

  const currentRate = exchangeRates[currency];
  const ticketPrice = basePriceUSD * currentRate.rate;
  
  // Platform fee is fixed at 4%
  const platformFeePercent = 0.04;
  const platformFee = ticketPrice * platformFeePercent;
  const organizerPayout = ticketPrice - platformFee;

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setTransactionComplete(true);
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-[600px] flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Buyer Checkout UI (Simulated) */}
        <div className="md:col-span-3 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
          <div className="bg-indigo-900 text-white p-6 border-b border-indigo-800">
            <h2 className="text-2xl font-black mb-1">Global Summit 2026</h2>
            <p className="text-indigo-200 text-sm">General Admission Ticket</p>
          </div>
          
          {!transactionComplete ? (
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-slate-500">Select Billing Currency</span>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-100 border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.keys(exchangeRates).map(code => (
                    <option key={code} value={code}>{code} - {exchangeRates[code].name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8 flex-1">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-slate-600 font-medium">Ticket Price</span>
                  <span className="text-3xl font-black text-slate-900">
                    {currentRate.symbol}{ticketPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                
                {currency !== 'USD' && (
                  <div className="flex items-center text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-slate-100">
                    <span className="mr-2">💱</span> Real-time FX Rate: 1 USD = {currentRate.rate.toFixed(3)} {currency}
                  </div>
                )}
              </div>

              {processing ? (
                <button disabled className="w-full bg-indigo-200 text-indigo-700 font-black py-4 rounded-xl flex justify-center items-center">
                  <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></span>
                  Processing Secure Payment...
                </button>
              ) : (
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition"
                >
                  Pay {currentRate.symbol}{ticketPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
                ✓
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-500 mb-6">Your ticket has been emailed to you.</p>
              <button 
                onClick={() => setTransactionComplete(false)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                Simulate Another Transaction
              </button>
            </div>
          )}
        </div>

        {/* Organizer / Platform Backend Routing View */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-slate-800 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10 pointer-events-none -mr-10 -mt-10"></div>
            
            <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-4">
              <span className="text-xl">⚙️</span>
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Automated Split Routing</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-medium">
              Eventra uses Stripe Connect to instantly split the transaction at checkout. No manual monthly wire transfers required.
            </p>

            <div className="space-y-4 relative">
              
              {/* Connector line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-700 z-0"></div>

              {/* Incoming Funds */}
              <div className="relative z-10 flex items-start">
                <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-lg shadow-lg z-10 mr-4">
                  💳
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Incoming Transaction</p>
                  <p className="font-mono font-black text-white">
                    {currentRate.symbol}{ticketPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Eventra Platform Fee */}
              <div className="relative z-10 flex items-start pl-8 transition-all duration-500" style={{ opacity: processing ? 0.3 : 1 }}>
                <div className="w-8 h-8 bg-indigo-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-xs shadow-lg z-10 mr-3">
                  E
                </div>
                <div className="bg-indigo-900/40 p-2 rounded-lg border border-indigo-500/30 flex-1">
                  <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">Eventra Platform Fee (4%)</p>
                  <p className="font-mono font-bold text-indigo-100 text-sm">
                    {currentRate.symbol}{platformFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Organizer Payout */}
              <div className="relative z-10 flex items-start transition-all duration-500" style={{ opacity: processing ? 0.3 : 1 }}>
                <div className="w-12 h-12 bg-emerald-900 border-2 border-emerald-500 rounded-full flex items-center justify-center text-lg shadow-lg z-10 mr-4">
                  🏦
                </div>
                <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-500/40 flex-1">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Direct Organizer Payout</p>
                  <p className="font-mono font-black text-emerald-300 text-lg">
                    {currentRate.symbol}{organizerPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <p className="text-[9px] text-emerald-500 mt-1">Routed instantly to connected bank</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MultiCurrencySplitPayments;
