import React, { useState } from 'react';

const GlobalPaymentGateway = () => {
  const [checkoutState, setCheckoutState] = useState('initial'); // initial, processing, failed, crypto_processing, success
  const [currency, setCurrency] = useState('USD');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const basePriceUSD = 499.00;
  
  const fxRates = {
    USD: { rate: 1, symbol: '$' },
    EUR: { rate: 0.92, symbol: '€' },
    GBP: { rate: 0.79, symbol: '£' },
    JPY: { rate: 148.50, symbol: '¥' }
  };

  const currentPrice = (basePriceUSD * fxRates[currency].rate).toFixed(currency === 'JPY' ? 0 : 2);
  const currentSymbol = fxRates[currency].symbol;

  const simulateCheckoutFailure = () => {
    setCheckoutState('processing');
    
    setTimeout(() => {
      setCheckoutState('failed');
    }, 2500);
  };

  const simulateCryptoFallback = () => {
    setCheckoutState('crypto_processing');
    
    setTimeout(() => {
      setCheckoutState('success');
    }, 3500);
  };

  const resetCheckout = () => {
    setCheckoutState('initial');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">💳</span> Global Commerce
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">
            Multi-Currency <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Checkout & Crypto</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Stop losing 15% of international ticket sales to overzealous banking fraud algorithms. Our dynamic payment router displays localized pricing (EUR, JPY, GBP) and instantly offers a seamless "Pay with Crypto" fallback (USDC/ETH) the exact second a traditional credit card is declined.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dynamic Routing Engine</h3>
             
             <div className="space-y-4 relative z-10">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">🌍</span>
                   <div>
                     <span className="block font-bold text-slate-800 text-sm">Stripe Fiat API</span>
                     <span className="block text-[10px] text-slate-500 uppercase">Primary Route</span>
                   </div>
                 </div>
                 <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${checkoutState === 'failed' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {checkoutState === 'failed' ? 'Declined' : 'Active'}
                 </span>
               </div>
               
               <div className="flex justify-center text-slate-300">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
               </div>

               <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${checkoutState === 'failed' || checkoutState === 'crypto_processing' || checkoutState === 'success' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">⚡</span>
                   <div>
                     <span className="block font-bold text-indigo-900 text-sm">Coinbase Commerce API</span>
                     <span className="block text-[10px] text-indigo-500 uppercase">Fallback Route</span>
                   </div>
                 </div>
                 <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${checkoutState === 'crypto_processing' ? 'bg-indigo-200 text-indigo-700 animate-pulse' : checkoutState === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                   {checkoutState === 'crypto_processing' ? 'Processing' : checkoutState === 'success' ? 'Settled' : 'Standby'}
                 </span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Virtual Checkout (Col span 7) */}
        <div className="lg:col-span-7 flex justify-center">
          
          <div className="w-full max-w-[420px] bg-white rounded-[2rem] border border-slate-200 shadow-2xl relative flex flex-col min-h-[600px] overflow-hidden">
            
            {/* Checkout Header */}
            <div className="bg-slate-900 p-6 text-white pb-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black">Global Summit '26</h2>
                  <span className="text-xs text-slate-400">All-Access Pass (1x)</span>
                </div>
                
                {/* Currency Selector (Disabled if not initial state) */}
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={checkoutState !== 'initial'}
                  className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                  <option value="JPY">🇯🇵 JPY</option>
                </select>
              </div>

              <div className="text-center">
                <span className="text-4xl font-black">{currentSymbol}{currentPrice}</span>
                <span className="block text-[10px] text-slate-400 font-mono mt-1 uppercase">Local Pricing Applied</span>
              </div>
            </div>

            {/* Checkout Body */}
            <div className="flex-1 p-6 -mt-4 bg-white rounded-t-3xl relative">
              
              {checkoutState === 'initial' || checkoutState === 'processing' ? (
                // 1. Initial Credit Card Form
                <div className="animate-fade-in">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Details</h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Card Number</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        readOnly 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 bg-slate-50 outline-none"
                      />
                      <span className="absolute right-4 top-8 text-xl">💳</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Expiry</label>
                        <input type="text" value="12/28" readOnly className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 bg-slate-50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">CVC</label>
                        <input type="password" value="•••" readOnly className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 bg-slate-50" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={simulateCheckoutFailure}
                    disabled={checkoutState === 'processing'}
                    className={`w-full mt-8 py-4 rounded-xl font-black text-sm transition shadow-lg flex items-center justify-center ${checkoutState === 'processing' ? 'bg-slate-800 text-slate-400' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                  >
                    {checkoutState === 'processing' ? (
                      <><span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin mr-2"></span> Processing Payment...</>
                    ) : (
                      `Pay ${currentSymbol}{currentPrice}`
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-3 font-mono">Secured by Stripe</p>
                </div>
              ) : checkoutState === 'failed' ? (
                // 2. Failure & Crypto Fallback Offer
                <div className="animate-fade-in h-full flex flex-col justify-center">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center mb-6">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl mx-auto mb-3">⚠️</div>
                    <h3 className="text-lg font-black text-rose-700 mb-1">Transaction Declined</h3>
                    <p className="text-xs text-rose-600">Your bank blocked this international transaction (Code: 2049).</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">Fallback Option</div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 mt-2">Don't lose your ticket!</h3>
                    <p className="text-xs text-slate-500 mb-6">Bypass banking restrictions and complete your purchase instantly using cryptocurrency.</p>
                    
                    <button 
                      onClick={simulateCryptoFallback}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition shadow-lg flex items-center justify-center"
                    >
                      <span className="mr-2">⚡</span> Pay with USDC / ETH
                    </button>
                  </div>
                  
                  <button onClick={resetCheckout} className="mt-4 text-[10px] text-slate-400 font-bold uppercase underline text-center w-full">Try another credit card</button>
                </div>
              ) : checkoutState === 'crypto_processing' ? (
                // 3. Crypto Processing State
                <div className="animate-fade-in h-full flex flex-col justify-center items-center py-10">
                  <div className="w-24 h-24 mb-8 relative">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Awaiting Network Block</h3>
                  <p className="text-xs text-slate-500 text-center px-6">Listening for USDC deposit on the Ethereum network. Do not close this window.</p>
                  
                  <div className="mt-8 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Expected Amount</span>
                    <span className="text-sm font-bold text-slate-800">499.00 USDC</span>
                  </div>
                </div>
              ) : (
                // 4. Success State
                <div className="animate-fade-in h-full flex flex-col justify-center items-center py-10">
                  <div className="w-24 h-24 mb-6 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <span className="text-4xl text-emerald-500 font-black">✓</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Payment Confirmed!</h3>
                  <p className="text-sm text-slate-500 text-center mb-8">Your VIP pass has been secured via USDC settlement.</p>
                  
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transaction Hash</span>
                      <span className="text-[10px] text-indigo-600 font-mono font-bold">0x4a9...f82e</span>
                    </div>
                    <button onClick={resetCheckout} className="w-full text-center text-xs font-bold text-slate-900 mt-2">← Back to Event Site</button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GlobalPaymentGateway;
