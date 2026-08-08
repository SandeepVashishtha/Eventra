import React, { useState } from 'react';

const DynamicCateringAggregator = () => {
  const [kitchenState, setKitchenState] = useState('idle'); // idle, processing, dispatching
  
  const [rooms, setRooms] = useState([
    { id: 'R101', name: 'Room 101 - Leadership', total: 145, dietary: { vegan: 0, celiac: 0, nutAllergy: 0 } },
    { id: 'R102', name: 'Room 102 - Tech Track', total: 310, dietary: { vegan: 0, celiac: 0, nutAllergy: 0 } },
    { id: 'R103', name: 'Room 103 - Marketing', total: 85, dietary: { vegan: 0, celiac: 0, nutAllergy: 0 } }
  ]);

  const [activeDispatch, setActiveDispatch] = useState(null);

  const simulateBadgeScans = () => {
    setKitchenState('processing');
    
    // Simulate real-time data influx as people scan into rooms
    let ticks = 0;
    const interval = setInterval(() => {
      setRooms(prev => {
        const newRooms = [...prev];
        // R101 gets a lot of vegans
        newRooms[0].dietary.vegan += Math.floor(Math.random() * 3);
        newRooms[0].dietary.celiac += Math.floor(Math.random() * 2);
        
        // R102 gets nut allergies
        newRooms[1].dietary.nutAllergy += Math.floor(Math.random() * 2);
        
        // R103 gets a mix
        newRooms[2].dietary.vegan += Math.floor(Math.random() * 2);
        newRooms[2].dietary.celiac += Math.floor(Math.random() * 2);
        
        return newRooms;
      });
      
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        
        setTimeout(() => {
          setKitchenState('dispatching');
          setActiveDispatch({
            room: 'Room 101',
            payload: 'Route 14 Vegan, 8 Celiac meals immediately.'
          });
          
          setTimeout(() => {
            setKitchenState('idle');
          }, 3000);
          
        }, 1000);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans p-6 text-neutral-200">
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Context & Master Aggregator (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 flex items-center w-max">
            <span className="mr-2">🥗</span> Real-Time Logistics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Dynamic Dietary <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Routing Engine</span>.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Stop sending specialized meals to the wrong rooms because attendees changed their schedules. As attendees scan their badges to enter breakout rooms, Eventra instantly aggregates their dietary profiles (pulled from registration) and routes dynamic push notifications to the kitchen staff directing them exactly where to send specialized meals.
          </p>

          <div className="bg-black rounded-3xl p-6 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col h-[400px]">
             
             <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Master Catering Dashboard</h3>
               <button 
                 onClick={simulateBadgeScans}
                 disabled={kitchenState !== 'idle'}
                 className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest transition ${
                   kitchenState !== 'idle' ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                 }`}
               >
                 Simulate Door Scans
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
               {rooms.map(room => (
                 <div key={room.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl relative overflow-hidden">
                   
                   {kitchenState === 'processing' && (
                     <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500 animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                   )}
                   
                   <div className="flex justify-between items-center mb-3">
                     <span className="font-bold text-white text-sm">{room.name}</span>
                     <span className="text-[10px] text-neutral-500 font-mono">Capacity: {room.total}</span>
                   </div>
                   
                   <div className="flex space-x-2">
                     <div className="bg-green-900/30 border border-green-500/30 px-3 py-2 rounded flex-1 flex flex-col items-center">
                       <span className="text-2xl font-black text-green-400 font-mono">{room.dietary.vegan}</span>
                       <span className="text-[8px] text-green-500 uppercase font-bold tracking-widest">Vegan</span>
                     </div>
                     <div className="bg-amber-900/30 border border-amber-500/30 px-3 py-2 rounded flex-1 flex flex-col items-center">
                       <span className="text-2xl font-black text-amber-400 font-mono">{room.dietary.celiac}</span>
                       <span className="text-[8px] text-amber-500 uppercase font-bold tracking-widest">GF/Celiac</span>
                     </div>
                     <div className="bg-rose-900/30 border border-rose-500/30 px-3 py-2 rounded flex-1 flex flex-col items-center">
                       <span className="text-2xl font-black text-rose-400 font-mono">{room.dietary.nutAllergy}</span>
                       <span className="text-[8px] text-rose-500 uppercase font-bold tracking-widest">Nut Allergy</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Side: Kitchen Staff App Simulator (Col span 5) */}
        <div className="lg:col-span-5 flex justify-center">
          
          <div className="w-full max-w-[360px] bg-neutral-800 rounded-[3rem] border-[12px] border-neutral-900 shadow-2xl relative flex flex-col h-[700px] overflow-hidden">
            
            {/* iOS Header */}
            <div className="h-10 flex justify-between items-center px-6 text-white text-xs font-bold bg-neutral-800">
              <span>9:41</span>
              <div className="flex space-x-1 items-center">
                <span>5G 📶</span>
                <span className="ml-2">🔋</span>
              </div>
            </div>

            {/* App Header */}
            <div className="bg-neutral-800 p-4 border-b border-neutral-700 flex justify-between items-center z-10 shadow-sm">
              <h2 className="text-lg font-black text-white">Kitchen Expediter</h2>
              <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-1 rounded">Receiving Orders</span>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 bg-neutral-900 flex flex-col relative p-4">
              
              <div className="space-y-4 flex-1">
                {/* Standard Order */}
                <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 opacity-50">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">11:30 AM • Completed</span>
                  <h4 className="font-bold text-white text-sm mb-2">Standard Box Lunches</h4>
                  <p className="text-xs text-neutral-500 font-mono">Route 300 to Hall A</p>
                </div>

                {/* Dynamic Dispatch Overlay */}
                {kitchenState === 'dispatching' && activeDispatch && (
                  <div className="absolute inset-0 bg-neutral-900/90 backdrop-blur z-20 flex flex-col items-center justify-center p-6 animate-fade-in">
                    
                    <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(225,29,72,0.6)] animate-pulse">
                      <span className="text-4xl text-white">⚠️</span>
                    </div>
                    
                    <span className="text-rose-500 font-black uppercase tracking-widest text-xs mb-2">Urgent Routing Update</span>
                    <h3 className="text-3xl font-black text-white mb-6 text-center leading-tight">Dietary Spike Detected</h3>
                    
                    <div className="bg-neutral-800 border border-rose-500/50 p-5 rounded-2xl w-full">
                      <span className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Destination: {activeDispatch.room}</span>
                      <p className="text-sm font-black text-white leading-relaxed">{activeDispatch.payload}</p>
                      
                      <button className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg">
                        Acknowledge & Dispatch
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-500 font-mono mt-6 text-center">Triggered by RFID door scans 12 seconds ago.</p>
                  </div>
                )}
                
                {kitchenState === 'processing' && (
                  <div className="absolute bottom-6 inset-x-6 bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center justify-center text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Aggregating Live Scans...
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DynamicCateringAggregator;
