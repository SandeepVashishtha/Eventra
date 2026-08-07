/* eslint-disable */
import React, { useState, useEffect } from 'react';

const ARVirtualMerch = () => {
  const [arActive, setArActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const inventory = [
    { id: 0, name: '2026 Tour Hoodie', price: 85, color: '#0f172a', type: 'hoodie' },
    { id: 1, name: 'Neon Desert Tee', price: 45, color: '#f97316', type: 'shirt' },
    { id: 2, name: 'Vintage Acid Wash', price: 55, color: '#64748b', type: 'shirt' }
  ];

  const currentMerch = inventory[selectedItem];

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      setPurchaseComplete(true);
      
      // Reset after showing success
      setTimeout(() => {
        setPurchaseComplete(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* Left Side: Context & Description (Col span 6) */}
        <div className="lg:col-span-6 space-y-6 pt-10">
          <div className="inline-block bg-pink-100 text-pink-600 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🛍️</span> AR E-Commerce
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            AR Virtual Merchandise <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Try-On & Fulfillment</span>.
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Merch lines at festivals regularly take 2+ hours, causing attendees to miss their favorite artists, and popular physical stock runs out quickly. Eventra integrates ARKit/ARCore directly into the festival app to bypass this entirely. Attendees can point their front-facing camera at themselves to virtually "try on" 3D models of festival hoodies and shirts mapped accurately to their body via spatial computing. They purchase via Apple Pay instantly, and the physical item is drop-shipped directly to their home address. No lines, no carrying bags around all day.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
               App Settings
             </h3>
             <button 
               onClick={() => setArActive(!arActive)}
               className={`py-3 px-6 rounded-xl font-black uppercase tracking-widest text-xs transition shadow-md border ${
                 arActive ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-black'
               }`}
             >
               {arActive ? 'Close AR Camera' : 'Open AR Camera'}
             </button>
          </div>
        </div>

        {/* Right Side: Eventra Attendee App Simulator (Col span 6) */}
        <div className="lg:col-span-6 flex justify-center pt-8 lg:pt-0">
          
          <div className="w-full max-w-[380px] bg-black rounded-[3rem] border-[12px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col h-[700px] overflow-hidden font-sans">
            
            {/* Dynamic Island / Notch Mockup */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
              <div className="w-24 h-7 bg-black rounded-b-3xl"></div>
            </div>

            <div className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden text-white">
               
               {!arActive ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                   <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg transform rotate-12">
                     👕
                   </div>
                   <div>
                     <h2 className="text-2xl font-black mb-2">Eventra Merch</h2>
                     <p className="text-xs text-slate-400">Skip the 2-hour lines. Try on and buy official tour merchandise directly from your phone.</p>
                   </div>
                   <button 
                     onClick={() => setArActive(true)}
                     className="w-full bg-white text-black font-black uppercase tracking-widest text-xs py-4 rounded-full shadow-lg"
                   >
                     Launch AR Try-On
                   </button>
                 </div>
               ) : (
                 <>
                   {/* AR Camera Viewport */}
                   <div className="absolute inset-0 bg-slate-800 overflow-hidden">
                     {/* Simulated Camera Feed Background (Blurred silhouette) */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] opacity-20 z-0 mix-blend-screen pointer-events-none"></div>
                     <div className="absolute bottom-[-10%] left-1/2 transform -translate-x-1/2 w-64 h-96 bg-slate-600 rounded-t-[100px] blur-xl opacity-50"></div>
                     
                     {/* AR Body Tracking Overlay */}
                     <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pt-20 pointer-events-none">
                       {/* Face tracking rect */}
                       <div className="w-20 h-24 border border-white/30 rounded-full mb-2 flex items-center justify-center relative">
                         <div className="absolute -right-16 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono border border-white/20">FACE_TRACK</div>
                       </div>
                       
                       {/* 3D Clothing Overlay */}
                       <div 
                         className="w-56 h-64 rounded-2xl relative transition-all duration-500 flex items-center justify-center shadow-[inset_0_-20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                         style={{ backgroundColor: currentMerch.color }}
                       >
                         {/* Graphic on shirt */}
                         {currentMerch.id === 0 && <div className="text-white/80 font-black text-2xl uppercase tracking-widest opacity-80">TOUR '26</div>}
                         {currentMerch.id === 1 && <div className="text-white font-black text-4xl opacity-90 drop-shadow-lg">⚡</div>}
                         {currentMerch.id === 2 && <div className="w-16 h-16 rounded-full border-4 border-white/40 flex items-center justify-center opacity-60"><span className="text-xl">🌵</span></div>}
                         
                         <div className="absolute -left-20 top-10 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono border border-white/20">POSE_EST</div>
                         
                         {/* AR Mapping Mesh (Visual effect) */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] rounded-2xl pointer-events-none"></div>
                       </div>
                     </div>
                   </div>

                   {/* Top UI Bar */}
                   <div className="absolute top-10 inset-x-0 px-4 flex justify-between z-30">
                     <button onClick={() => setArActive(false)} className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">✕</button>
                     <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-bold uppercase tracking-widest">AR Core Active</span>
                     </div>
                   </div>

                   {/* Bottom UI / E-Commerce Drawer */}
                   <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xl border-t border-white/10 rounded-t-[2rem] pt-2 pb-8 px-6 z-30 transition-transform transform translate-y-0">
                     
                     {/* Drag handle */}
                     <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>

                     {purchaseComplete ? (
                       <div className="text-center py-6 animate-fade-in-up">
                         <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                           <span className="text-2xl text-white">✓</span>
                         </div>
                         <h3 className="text-lg font-black text-white mb-1">Purchase Confirmed</h3>
                         <p className="text-xs text-slate-400">Your item will be drop-shipped to your home address within 3-5 days. Enjoy the rest of the festival!</p>
                       </div>
                     ) : (
                       <>
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h3 className="text-lg font-black text-white leading-tight">{currentMerch.name}</h3>
                             <p className="text-sm font-bold text-pink-400">${currentMerch.price}.00</p>
                           </div>
                           <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono text-white/70">
                             Size: L
                           </div>
                         </div>

                         {/* Item Carousel */}
                         <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                           {inventory.map((item, idx) => (
                             <button 
                               key={item.id}
                               onClick={() => setSelectedItem(idx)}
                               className={`w-16 h-16 rounded-xl flex-shrink-0 border-2 transition ${
                                 selectedItem === idx ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'border-transparent opacity-50'
                               }`}
                               style={{ backgroundColor: item.color }}
                             ></button>
                           ))}
                         </div>

                         {/* Apple Pay Button */}
                         <button 
                           onClick={handlePurchase}
                           disabled={purchasing}
                           className={`w-full py-4 rounded-full font-black text-black flex items-center justify-center transition ${
                             purchasing ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
                           }`}
                         >
                           {purchasing ? (
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-black rounded-full animate-spin"></div>
                           ) : (
                             <>
                               <span className="text-lg mr-1"></span> Pay
                             </>
                           )}
                         </button>
                         <p className="text-center text-[9px] text-slate-500 mt-3 font-bold uppercase tracking-widest">Drop-Ships to: 123 Main St, Austin TX</p>
                       </>
                     )}

                   </div>
                 </>
               )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ARVirtualMerch;
