import React, { useState } from 'react';

const AdvancedAccessibilityMode = () => {
  const [a11yMode, setA11yMode] = useState(false);

  // Toggle handlers
  const toggleA11y = () => setA11yMode(!a11yMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${a11yMode ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'} p-6 font-sans`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Universal Accessibility Toggle Header */}
        <div className={`mb-8 p-4 rounded-xl flex justify-between items-center ${a11yMode ? 'bg-yellow-300 text-black border-4 border-yellow-300' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center space-x-4">
            <span className="text-3xl" aria-hidden="true">👁️</span>
            <div>
              <h2 className={`font-black text-xl ${a11yMode ? 'font-mono tracking-widest' : ''}`}>
                Accessibility Settings
              </h2>
              {!a11yMode && <p className="text-sm text-slate-500">Enable high contrast, dyslexia fonts, and ARIA labels.</p>}
            </div>
          </div>
          
          <button 
            onClick={toggleA11y}
            aria-pressed={a11yMode}
            aria-label="Toggle Advanced Accessibility Mode"
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-4 ${a11yMode ? 'bg-black focus:ring-white' : 'bg-slate-300 focus:ring-blue-500'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${a11yMode ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Demo App Content Area to show effect */}
        <div className="space-y-8">
          
          {/* Section: Typography & Contrast Demo */}
          <section>
            <h3 className={`text-2xl mb-4 ${a11yMode ? 'font-mono font-black border-b-4 border-yellow-300 pb-2 uppercase tracking-widest' : 'font-bold'}`}>
              Event Overview
            </h3>
            <div className={`p-6 rounded-2xl ${a11yMode ? 'bg-black border-4 border-yellow-300' : 'bg-white shadow-sm border border-slate-200'}`}>
              <p className={`text-lg leading-relaxed ${a11yMode ? 'font-mono tracking-wider space-y-4' : ''}`}>
                Welcome to the Global Tech Summit. This year we are focusing on inclusive design, artificial intelligence, and sustainable infrastructure. Please review the schedule below to plan your day.
              </p>
              
              {/* Simulated Animation (stops in a11y mode) */}
              <div className="mt-6 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full ${a11yMode ? 'bg-yellow-300' : 'bg-blue-500 animate-bounce'}`}></div>
                <span className={a11yMode ? 'font-mono font-bold' : 'text-slate-500'}>
                  {a11yMode ? 'ANIMATIONS PAUSED' : 'Dynamic visuals active'}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Complex Schedule Grid with ARIA simulation */}
          <section>
            <h3 className={`text-2xl mb-4 ${a11yMode ? 'font-mono font-black border-b-4 border-yellow-300 pb-2 uppercase tracking-widest' : 'font-bold'}`}>
              Schedule Grid
            </h3>
            
            {a11yMode && (
              <div className="mb-4 bg-yellow-300 text-black p-3 font-mono font-bold border-4 border-yellow-300" aria-live="polite">
                [Screen Reader Context: Table containing 3 rows and 3 columns showing event times, rooms, and topics.]
              </div>
            )}

            <div className={`overflow-x-auto rounded-xl ${a11yMode ? 'border-4 border-yellow-300' : 'border border-slate-200 shadow-sm'}`}>
              <table className={`w-full text-left ${a11yMode ? 'font-mono' : ''}`} role="grid" aria-label="Event Schedule">
                <thead className={a11yMode ? 'bg-yellow-300 text-black font-black uppercase text-xl' : 'bg-slate-100 text-slate-600'}>
                  <tr>
                    <th className="p-4 border-b-2" scope="col">Time</th>
                    <th className="p-4 border-b-2" scope="col">Room</th>
                    <th className="p-4 border-b-2" scope="col">Session Topic</th>
                  </tr>
                </thead>
                <tbody className={a11yMode ? 'bg-black text-yellow-300 text-lg font-bold' : 'bg-white text-slate-800'}>
                  <tr className={a11yMode ? 'border-b-4 border-yellow-300' : 'border-b border-slate-100 hover:bg-slate-50'}>
                    <td className="p-4" role="gridcell">10:00 AM</td>
                    <td className="p-4" role="gridcell">Main Stage</td>
                    <td className="p-4" role="gridcell">Keynote: Future of Web</td>
                  </tr>
                  <tr className={a11yMode ? 'border-b-4 border-yellow-300' : 'border-b border-slate-100 hover:bg-slate-50'}>
                    <td className="p-4" role="gridcell">11:30 AM</td>
                    <td className="p-4" role="gridcell">Expo Hall B</td>
                    <td className="p-4" role="gridcell">Accessibility Standards Workshop</td>
                  </tr>
                  <tr className={a11yMode ? '' : 'hover:bg-slate-50'}>
                    <td className="p-4" role="gridcell">1:00 PM</td>
                    <td className="p-4" role="gridcell">Dining Area</td>
                    <td className="p-4" role="gridcell">Networking Lunch</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex space-x-4 pt-4">
            <button 
              className={`px-8 py-4 rounded-xl font-black transition-all focus:outline-none focus:ring-4 ${a11yMode ? 'bg-yellow-300 text-black border-4 border-yellow-300 hover:bg-black hover:text-yellow-300 focus:ring-yellow-500 font-mono text-xl tracking-widest' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:ring-blue-500'}`}
              aria-label="Register for event"
            >
              Register Now
            </button>
            
            <button 
              className={`px-8 py-4 rounded-xl font-black transition-all focus:outline-none focus:ring-4 ${a11yMode ? 'bg-black text-yellow-300 border-4 border-yellow-300 hover:bg-yellow-300 hover:text-black focus:ring-yellow-500 font-mono text-xl tracking-widest' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-slate-400'}`}
              aria-label="View frequently asked questions"
            >
              View FAQ
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdvancedAccessibilityMode;
