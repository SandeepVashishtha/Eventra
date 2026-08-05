import React, { useState } from 'react';

const AccessibleUIMode = () => {
  const [accessibleMode, setAccessibleMode] = useState(false);
  
  // Dummy event data
  const upcomingSessions = [
    { id: 1, time: '10:00 AM', title: 'Keynote: Future of AI', speaker: 'Dr. Sarah Jenkins' },
    { id: 2, time: '11:30 AM', title: 'Web Accessibility Standards', speaker: 'Marcus Ty' },
    { id: 3, time: '01:00 PM', title: 'Networking Lunch', speaker: 'Lobby A' }
  ];

  return (
    <div className={`p-6 min-h-[600px] transition-colors duration-300 font-sans ${accessibleMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Accessibility Controls Toolbar (Persistent) */}
      <div 
        role="region" 
        aria-label="Accessibility Settings" 
        className={`max-w-4xl mx-auto mb-8 p-4 rounded-xl flex justify-between items-center ${accessibleMode ? 'bg-yellow-400 text-black border-4 border-white' : 'bg-white shadow-md border border-gray-200'}`}
      >
        <div className="flex items-center space-x-3">
          <span aria-hidden="true" className="text-2xl">👁️</span>
          <div>
            <h2 className={`font-black tracking-tight ${accessibleMode ? 'text-black' : 'text-gray-900'}`}>
              WCAG Accessibility Mode
            </h2>
            <p className={`text-sm ${accessibleMode ? 'text-black font-bold' : 'text-gray-500'}`}>
              {accessibleMode ? 'High-contrast, screen-reader optimized DOM active.' : 'Standard UI mode.'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setAccessibleMode(!accessibleMode)}
          aria-pressed={accessibleMode}
          className={`px-6 py-3 font-black rounded-lg shadow-sm border-2 transition focus:outline-none focus:ring-4 ${accessibleMode ? 'bg-black text-yellow-400 border-black focus:ring-white' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-300'}`}
        >
          {accessibleMode ? 'Disable High Contrast' : 'Enable Accessible Mode'}
        </button>
      </div>

      {/* Main Content Area */}
      <main 
        id="main-content" 
        className={`max-w-4xl mx-auto rounded-xl p-8 ${accessibleMode ? 'bg-black border-4 border-yellow-400' : 'bg-white shadow-lg border border-gray-100'}`}
      >
        <header className="mb-8 pb-4 border-b-2" style={{ borderColor: accessibleMode ? '#facc15' : '#e5e7eb' }}>
          <h1 className={`text-4xl font-black ${accessibleMode ? 'text-yellow-400 underline decoration-4 underline-offset-8' : 'text-indigo-900'}`}>
            TechCon 2026 Virtual Dashboard
          </h1>
          {/* SR-only text helper */}
          <span className="sr-only">You are on the main event dashboard page.</span>
        </header>

        <section aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className={`text-2xl font-black mb-6 ${accessibleMode ? 'text-white border-l-8 border-yellow-400 pl-4' : 'text-gray-800'}`}>
            Your Itinerary
          </h2>

          {/* Conditional Rendering: Fancy UI vs Accessible Data Table */}
          {!accessibleMode ? (
            <div className="space-y-4" aria-hidden="true">
              {/* Complex non-accessible visual representation */}
              {upcomingSessions.map(session => (
                <div key={session.id} className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex justify-between items-center overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 group-hover:w-2 transition-all"></div>
                  <div className="pl-4">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">{session.time}</span>
                    <h3 className="text-lg font-bold text-gray-800">{session.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Speaker</p>
                    <p className="font-medium text-gray-900">{session.speaker}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border-4 border-white" aria-label="Event Schedule">
                <thead>
                  <tr className="bg-yellow-400 text-black">
                    <th scope="col" className="p-4 border-4 border-black font-black text-xl">Time</th>
                    <th scope="col" className="p-4 border-4 border-black font-black text-xl">Session Title</th>
                    <th scope="col" className="p-4 border-4 border-black font-black text-xl">Speaker / Location</th>
                    <th scope="col" className="p-4 border-4 border-black font-black text-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-black text-white text-lg font-bold">
                  {upcomingSessions.map(session => (
                    <tr key={session.id}>
                      <td className="p-4 border-4 border-white align-top">{session.time}</td>
                      <td className="p-4 border-4 border-white align-top underline decoration-yellow-400 underline-offset-4">{session.title}</td>
                      <td className="p-4 border-4 border-white align-top">{session.speaker}</td>
                      <td className="p-4 border-4 border-white align-top">
                        <button 
                          aria-label={`Join session: ${session.title}`}
                          className="bg-yellow-400 text-black font-black px-4 py-2 border-2 border-transparent focus:border-white focus:outline-none focus:ring-4 focus:ring-white"
                        >
                          Join Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="interactive-map-heading">
           <h2 id="interactive-map-heading" className={`text-2xl font-black mb-6 ${accessibleMode ? 'text-white border-l-8 border-yellow-400 pl-4' : 'text-gray-800'}`}>
            Venue Map
          </h2>
          
          {!accessibleMode ? (
            <div className="h-64 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center cursor-move" aria-hidden="true">
               {/* Non-accessible visual map simulation */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover opacity-50"></div>
               <button className="relative z-10 bg-white/80 backdrop-blur font-bold px-4 py-2 rounded-lg shadow-lg">Click & Drag to explore 3D Map</button>
            </div>
          ) : (
            <div className="bg-black border-4 border-white p-6">
              <p className="text-xl font-bold text-yellow-400 mb-4">Text-Based Venue Directory (Screen Reader Optimized)</p>
              <ul className="list-disc pl-6 space-y-4 text-white text-lg font-bold">
                <li><a href="#" className="underline decoration-yellow-400 hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black outline-none p-1">Main Entrance (Level 1, North Wing)</a></li>
                <li><a href="#" className="underline decoration-yellow-400 hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black outline-none p-1">Keynote Hall A (Level 1, Center)</a></li>
                <li><a href="#" className="underline decoration-yellow-400 hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black outline-none p-1">Accessible Restrooms (Level 1, West Corridor)</a></li>
                <li><a href="#" className="underline decoration-yellow-400 hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black outline-none p-1">Sponsor Booths 100-150 (Level 2)</a></li>
              </ul>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default AccessibleUIMode;
