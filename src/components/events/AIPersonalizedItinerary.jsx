import React, { useState } from 'react';

const AIPersonalizedItinerary = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  const generateItinerary = () => {
    if (!prompt) return;
    setLoading(true);
    setTimeout(() => {
      setItinerary([
        { time: '09:00 AM', type: 'Keynote', title: 'The Future of WebAssembly', location: 'Hall A' },
        { time: '10:30 AM', type: 'Workshop', title: 'Rust to WASM Compilation', location: 'Room 204' },
        { time: '12:00 PM', type: 'Networking', title: 'Frontend Developer Lunch Meetup', location: 'Networking Lounge C' },
        { time: '01:30 PM', type: 'Sponsor', title: 'Vercel & Cloudflare Booth Tours', location: 'Expo Floor' },
        { time: '03:00 PM', type: 'Panel', title: 'Hiring Trends in React & Edge Compute', location: 'Hall B' }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="mr-2">✨</span> AI Itinerary Generator
        </h2>
        <p className="text-sm text-gray-500 mt-1">Tell us your goals, and we'll plan a conflict-free schedule for you.</p>
      </div>

      {!itinerary ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What are you hoping to get out of this event?</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows="3"
              placeholder="e.g., I'm a junior frontend dev looking to learn about WebAssembly and find a new job."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
          <button 
            onClick={generateItinerary}
            disabled={loading || !prompt}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Generating...</>
            ) : (
              'Generate My Custom Schedule'
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Your Day 1 Schedule</h3>
            <button 
              onClick={() => { setItinerary(null); setPrompt(''); }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Start Over
            </button>
          </div>
          
          <div className="relative border-l-2 border-indigo-200 ml-3 space-y-6 pb-4">
            {itinerary.map((item, index) => (
              <div key={index} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-indigo-600">{item.time}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">📍 {item.location}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition">
            Add to My Calendar
          </button>
        </div>
      )}
    </div>
  );
};

export default AIPersonalizedItinerary;
