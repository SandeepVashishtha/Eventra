import React, { useState } from 'react';

const GeofencedMarketing = () => {
  const [attendeePosition, setAttendeePosition] = useState({ x: 10, y: 50 }); // percentage based
  const [activeZone, setActiveZone] = useState(null);
  const [notification, setNotification] = useState(null);

  const zones = [
    { id: 'expo', name: 'Main Expo Hall', color: 'border-blue-500 bg-blue-500/20', rect: { top: 10, left: 40, width: 50, height: 40 }, message: 'Welcome to the Expo Hall! 🛍️ Grab 10% off at Booth 4 today only.' },
    { id: 'food', name: 'Food Court Area', color: 'border-orange-500 bg-orange-500/20', rect: { top: 60, left: 10, width: 30, height: 30 }, message: 'Hungry? 🍔 The Gourmet Food Truck has zero wait time right now!' },
    { id: 'vip', name: 'VIP Lounge', color: 'border-purple-500 bg-purple-500/20', rect: { top: 60, left: 60, width: 30, height: 30 }, message: '✨ Welcome to the VIP Lounge. Enjoy complimentary champagne at the bar.' }
  ];

  const handleMoveAttendee = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setAttendeePosition({ x, y });
    checkGeofence(x, y);
  };

  const checkGeofence = (x, y) => {
    let foundZone = null;
    
    for (const zone of zones) {
      if (
        x >= zone.rect.left && 
        x <= zone.rect.left + zone.rect.width && 
        y >= zone.rect.top && 
        y <= zone.rect.top + zone.rect.height
      ) {
        foundZone = zone;
        break;
      }
    }

    if (foundZone && activeZone?.id !== foundZone.id) {
      setActiveZone(foundZone);
      triggerNotification(foundZone.message);
    } else if (!foundZone && activeZone) {
      setActiveZone(null);
    }
  };

  const triggerNotification = (message) => {
    setNotification(message);
    // Auto clear notification after 4s
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6 text-slate-800">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context & Simulator Map */}
        <div className="space-y-6">
          <div className="inline-block bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Location-Based Marketing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Geofenced <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Push Notifications</span>.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">
            Stop spamming attendees with irrelevant alerts. Draw virtual polygons on the venue map to trigger hyper-relevant, location-based push notifications only when a user physically enters the zone.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Draw Geofences</h3>
               <p className="text-xs text-slate-500">Click & Drag to simulate walking</p>
             </div>
             
             {/* Map Area */}
             <div 
               className="relative w-full h-[350px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden cursor-crosshair"
               onMouseMove={(e) => e.buttons === 1 && handleMoveAttendee(e)}
               onMouseDown={(e) => handleMoveAttendee(e)}
             >
               {/* Grid Background */}
               <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
               
               {/* Drawn Zones */}
               {zones.map(zone => (
                 <div 
                   key={zone.id}
                   className={`absolute border-2 transition-colors ${zone.color} ${activeZone?.id === zone.id ? 'opacity-100 border-dashed animate-pulse' : 'opacity-40'}`}
                   style={{
                     top: `${zone.rect.top}%`,
                     left: `${zone.rect.left}%`,
                     width: `${zone.rect.width}%`,
                     height: `${zone.rect.height}%`
                   }}
                 >
                   <span className="absolute -top-3 left-2 bg-white px-1 text-[9px] font-bold uppercase text-slate-500 shadow-sm rounded">
                     {zone.name}
                   </span>
                 </div>
               ))}

               {/* Simulated Attendee */}
               <div 
                 className="absolute w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                 style={{ top: `${attendeePosition.y}%`, left: `${attendeePosition.x}%` }}
               >
                 <div className="absolute inset-0 rounded-full border-2 border-teal-300 animate-ping"></div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Mobile Phone Simulation */}
        <div className="flex justify-center relative">
          
          <div className="w-[340px] h-[700px] bg-slate-900 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Phone Screen Mockup */}
            <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center relative">
               
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
               
               {/* Phone Status Bar */}
               <div className="absolute top-2 left-6 right-6 flex justify-between text-white text-[10px] font-bold z-20">
                 <span>9:41</span>
                 <div className="flex space-x-1">
                   <span>📶</span><span>🔋</span>
                 </div>
               </div>

               <div className="absolute inset-0 flex flex-col pt-16 px-4 z-10">
                 
                 <h2 className="text-3xl font-black text-white tracking-tight mb-2">Eventra App</h2>
                 <p className="text-slate-300 text-sm mb-8">Your digital companion for the summit.</p>
                 
                 {/* Push Notification Popup */}
                 <div className={`transition-all duration-500 transform ${notification ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
                   <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
                     <div className="flex items-center space-x-3 mb-2">
                       <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center text-[10px] text-white font-bold">E</div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1">Eventra • Now</span>
                     </div>
                     <p className="text-slate-900 font-bold text-sm leading-snug">{notification}</p>
                   </div>
                 </div>

                 {/* Empty State when no notification */}
                 {!notification && (
                   <div className="flex-1 flex items-center justify-center opacity-30 flex-col">
                     <span className="text-4xl mb-2">📱</span>
                     <p className="text-white text-xs font-bold text-center">Move the blue dot into a <br/>geofenced zone to trigger an alert.</p>
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

export default GeofencedMarketing;
