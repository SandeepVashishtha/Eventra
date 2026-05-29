import React, { useEffect, useState } from 'react';

const OfflinePage = () => {
  const [lastEvents, setLastEvents] = useState([]);

  useEffect(() => {
    // Get cached events from localStorage
    try {
      const cached = localStorage.getItem('cachedEvents');
      if (cached) {
        setLastEvents(JSON.parse(cached));
      }
    } catch {
      setLastEvents([]);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center 
                    justify-center bg-gray-950 text-white px-4">
      <div className="text-center max-w-md w-full">

        {/* Icon */}
        <div className="text-8xl mb-6">📡</div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-3">
          You're Offline
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 mb-8">
          Looks like you lost your internet connection. 
          Please check your network and try again.
        </p>

        {/* Cached Events */}
        {lastEvents.length > 0 && (
          <div className="mb-8 text-left">
            <h2 className="text-lg font-semibold mb-3 text-gray-300">
              📋 Last Visited Events
            </h2>
            <div className="space-y-2">
              {lastEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg px-4 py-3 
                             text-sm text-gray-200"
                >
                  {event.name || event.title || 'Event'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 hover:bg-purple-700 
                     text-white font-semibold py-3 px-8 
                     rounded-lg transition duration-200"
        >
          Try Again
        </button>

      </div>
    </div>
  );
};

export default OfflinePage;