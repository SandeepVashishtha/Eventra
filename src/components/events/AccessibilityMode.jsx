import React, { useState } from 'react';

const AccessibilityMode = () => {
  const [a11yMode, setA11yMode] = useState(false);

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-300 flex items-center justify-center ${a11yMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Context & Toggle */}
        <div className="space-y-6">
          <div className={`inline-block border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${a11yMode ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
            Inclusive Design
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-black leading-tight ${a11yMode ? 'text-white' : 'text-slate-900'}`}>
            WCAG 2.1 AAA <br/>
            <span className={a11yMode ? 'text-yellow-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'}>
              Accessibility Mode
            </span>.
          </h1>
          
          <p className={`text-lg leading-relaxed ${a11yMode ? 'text-white' : 'text-slate-500'}`}>
            Stop excluding visually impaired attendees. With one click, radically restructure the DOM for flawless screen-reader parsing and enforce AAA-compliant high-contrast colors.
          </p>
          
          <div className={`p-6 rounded-2xl border ${a11yMode ? 'bg-black border-yellow-400 border-4' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className="flex items-center justify-between">
               <div>
                 <h3 className={`text-lg font-bold ${a11yMode ? 'text-yellow-400' : 'text-slate-900'}`}>
                   Enable Accessibility Mode
                 </h3>
                 <p className={`text-sm mt-1 ${a11yMode ? 'text-white' : 'text-slate-500'}`}>
                   High contrast & enhanced screen reader support
                 </p>
               </div>
               
               {/* Toggle Switch */}
               <button 
                 onClick={() => setA11yMode(!a11yMode)}
                 className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 focus:outline-none focus:ring-4 focus:ring-offset-2 ${a11yMode ? 'bg-yellow-400 focus:ring-yellow-400 focus:ring-offset-black' : 'bg-slate-300 focus:ring-blue-500 focus:ring-offset-white'}`}
                 aria-pressed={a11yMode}
                 aria-label="Toggle Accessibility Mode"
               >
                 <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${a11yMode ? 'translate-x-8' : 'translate-x-0'}`}></div>
               </button>
             </div>
          </div>
        </div>

        {/* Right Side: Demo App UI */}
        <div className="flex justify-center">
          
          <div className={`w-full max-w-[500px] rounded-3xl overflow-hidden transition-all duration-300 ${
            a11yMode 
              ? 'bg-black border-[6px] border-yellow-400 shadow-[0_0_0_10px_black]' 
              : 'bg-white border border-slate-200 shadow-2xl'
          }`}>
            
            {/* App Header */}
            <header className={`p-6 border-b ${a11yMode ? 'border-yellow-400' : 'border-slate-100 bg-slate-50'}`}>
              <h2 className={`text-2xl font-black ${a11yMode ? 'text-yellow-400' : 'text-slate-800'}`}>
                Session Details
              </h2>
            </header>

            {/* App Content */}
            <main className="p-6 space-y-6">
              
              {/* Image with alt text simulation */}
              <div className="relative group">
                <div className={`w-full h-48 rounded-xl overflow-hidden flex items-center justify-center ${a11yMode ? 'bg-white' : 'bg-slate-200'}`}>
                   {!a11yMode ? (
                     <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Audience at conference" className="w-full h-full object-cover" />
                   ) : (
                     <div className="p-6 text-center border-4 border-black m-2">
                       <span className="text-black font-black uppercase text-xl">Image</span>
                       <p className="text-black font-bold mt-2">Alt Text: A large audience sitting in a darkened auditorium watching a speaker on a brightly lit stage.</p>
                     </div>
                   )}
                </div>
                
                {/* Screen Reader Focus Ring Simulator */}
                {a11yMode && (
                  <div className="absolute inset-0 border-[6px] border-dashed border-yellow-400 pointer-events-none rounded-xl"></div>
                )}
              </div>

              <div>
                <h3 className={`text-xl font-bold mb-2 ${a11yMode ? 'text-white underline decoration-yellow-400 decoration-4 underline-offset-4' : 'text-slate-800'}`}>
                  The Future of Web Accessibility
                </h3>
                <p className={`text-base leading-relaxed ${a11yMode ? 'text-white text-lg font-bold' : 'text-slate-600'}`}>
                  Join us for a deep dive into WCAG guidelines, ARIA attributes, and how to build inclusive digital experiences for all users regardless of their abilities.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  className={`w-full py-4 rounded-xl font-black transition text-lg ${
                    a11yMode 
                      ? 'bg-yellow-400 text-black border-4 border-white hover:bg-white hover:text-black hover:border-yellow-400 focus:outline-none focus:ring-[6px] focus:ring-white focus:ring-offset-4 focus:ring-offset-black' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  }`}
                  aria-label="Register for this session"
                >
                  Register Now
                </button>
              </div>
              
              {a11yMode && (
                <div className="mt-4 p-4 border-4 border-white border-dashed text-center">
                  <p className="text-yellow-400 font-mono font-bold text-sm">ARIA-Live Region: "Button focused. Register Now. To press, use Space or Enter."</p>
                </div>
              )}

            </main>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AccessibilityMode;
