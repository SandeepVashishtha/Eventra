import React, { useState, useEffect } from 'react';

const DynamicMerchPricing = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [items, setItems] = useState([
    { id: 'ts-blk-l', name: 'TechSummit Hoodie (L)', type: 'Apparel', inventory: 15, velocity: 'High', basePrice: 65.00, currentPrice: 65.00, status: 'stable' },
    { id: 'mug-wt', name: 'Ceramic Logo Mug', type: 'Accessories', inventory: 250, velocity: 'Low', basePrice: 20.00, currentPrice: 20.00, status: 'stable' },
    { id: 'ts-wht-m', name: 'Vintage Tee (M)', type: 'Apparel', inventory: 8, velocity: 'Surge', basePrice: 35.00, currentPrice: 42.50, status: 'surge' }
  ]);

  const [metrics, setMetrics] = useState({
    yieldLift: 0,
    surgeEvents: 0
  });

  // Run the pricing algorithm simulation
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setItems(prevItems => prevItems.map(item => {
        let newInv = item.inventory;
        let newPrice = item.currentPrice;
        let newStatus = item.status;
        let newVelocity = item.velocity;

        // Simulate sales
        if (Math.random() > 0.6 && newInv > 0) {
          if (item.velocity === 'Surge' || item.velocity === 'High') {
             newInv = Math.max(0, newInv - Math.floor(Math.random() * 3 + 1));
          } else {
             newInv = Math.max(0, newInv - 1);
          }
        }

        // Pricing Algorithm Logic
        if (newInv === 0) {
          newStatus = 'sold_out';
          newVelocity = 'None';
        } else if (newInv < 10 && item.velocity === 'High') {
          // Trigger surge
          newVelocity = 'Surge';
          newStatus = 'surge';
          newPrice = Math.min(item.basePrice * 1.5, newPrice * 1.15).toFixed(2);
        } else if (item.velocity === 'Low' && newInv > 200) {
          // Trigger clearance discount
          newStatus = 'clearance';
          newPrice = Math.max(item.basePrice * 0.5, newPrice * 0.90).toFixed(2);
        }

        return { ...item, inventory: newInv, currentPrice: parseFloat(newPrice), status: newStatus, velocity: newVelocity };
      }));

      // Update metrics
      setMetrics(prev => ({
        yieldLift: prev.yieldLift + (Math.random() * 15),
        surgeEvents: prev.surgeEvents + (Math.random() > 0.8 ? 1 : 0)
      }));

    }, 2500);

    return () => clearInterval(interval);
  }, [simulationActive]);

  const toggleSimulation = () => {
    if (simulationActive) {
      setSimulationActive(false);
    } else {
      setSimulationActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Dashboard (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">📈</span> Yield Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Dynamic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Merch Pricing</span>.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-md">
            Maximize vendor profitability. Our algorithmic inventory engine automatically surges prices on highly-demanded items running out of stock, while intelligently discounting stagnant inventory to ensure nothing is shipped back to the warehouse.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Algorithm Status</h3>
               <button 
                 onClick={toggleSimulation}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-sm ${simulationActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
               >
                 {simulationActive ? (
                   <><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span> Pause Engine</>
                 ) : (
                   '▶ Run Live Simulation'
                 )}
               </button>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Yield Lift</p>
                 <p className="text-2xl font-black text-emerald-600">+${metrics.yieldLift.toFixed(2)}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Active Surges</p>
                 <p className="text-2xl font-black text-amber-500">{items.filter(i => i.status === 'surge').length}</p>
               </div>
             </div>

             {/* Algorithm Logic Rules */}
             <div className="mt-6 pt-6 border-t border-slate-100">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Pricing Rules</h4>
               <ul className="space-y-2 text-xs text-slate-600">
                 <li className="flex items-start"><span className="text-amber-500 mr-2 font-bold">IF</span> Velocity == High AND Stock &lt; 10 <span className="mx-2 text-slate-400">→</span> <span className="font-bold text-slate-800">Increase Price 15%</span></li>
                 <li className="flex items-start"><span className="text-blue-500 mr-2 font-bold">IF</span> Velocity == Low AND Stock &gt; 200 <span className="mx-2 text-slate-400">→</span> <span className="font-bold text-slate-800">Decrease Price 10%</span></li>
               </ul>
             </div>
          </div>
        </div>

        {/* Right Side: Digital Storefront & POS (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 md:p-8 border-4 border-slate-800 shadow-2xl flex flex-col h-full min-h-[600px]">
          
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white">Digital Storefront (POS)</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Prices syncing with central inventory DB in real-time.</p>
            </div>
            {simulationActive && <span className="bg-emerald-900/50 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/30 animate-pulse">Live Sync</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 flex-1 overflow-y-auto pr-2">
             
             {items.map(item => (
               <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between transition-all duration-300">
                 
                 <div className="flex items-center space-x-4 mb-4 md:mb-0">
                   <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl border border-slate-700">
                     {item.type === 'Apparel' ? '👕' : '☕'}
                   </div>
                   <div>
                     <h4 className={`font-bold ${item.status === 'sold_out' ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{item.name}</h4>
                     <div className="flex items-center space-x-2 mt-1">
                       <span className="text-[10px] text-slate-500 font-mono">SKU: {item.id.toUpperCase()}</span>
                       <span className={`text-[9px] font-black uppercase px-1.5 rounded ${
                         item.velocity === 'Surge' ? 'bg-amber-900/50 text-amber-500' :
                         item.velocity === 'High' ? 'bg-emerald-900/50 text-emerald-500' :
                         item.velocity === 'Low' ? 'bg-blue-900/50 text-blue-500' : 'bg-slate-800 text-slate-500'
                       }`}>
                         Vol: {item.velocity}
                       </span>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between md:w-1/2 md:justify-end space-x-6">
                   
                   {/* Inventory Indicator */}
                   <div className="text-center">
                     <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Stock</span>
                     <span className={`text-xl font-black ${
                       item.inventory === 0 ? 'text-rose-600' :
                       item.inventory < 10 ? 'text-amber-500 animate-pulse' : 'text-slate-300'
                     }`}>
                       {item.inventory}
                     </span>
                   </div>

                   {/* Price Indicator */}
                   <div className="text-right w-24">
                     <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Current Price</span>
                     
                     <div className="flex flex-col items-end">
                       {item.currentPrice !== item.basePrice && item.status !== 'sold_out' && (
                         <span className="text-[10px] text-slate-600 line-through">${item.basePrice.toFixed(2)}</span>
                       )}
                       <span className={`text-2xl font-black transition-colors duration-500 ${
                         item.status === 'surge' ? 'text-amber-400' :
                         item.status === 'clearance' ? 'text-blue-400' :
                         item.status === 'sold_out' ? 'text-slate-700' : 'text-emerald-400'
                       }`}>
                         ${item.currentPrice.toFixed(2)}
                       </span>
                     </div>
                   </div>

                 </div>
               </div>
             ))}

          </div>

        </div>

      </div>
    </div>
  );
};

export default DynamicMerchPricing;
