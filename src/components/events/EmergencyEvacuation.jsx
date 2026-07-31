import React, { useState } from 'react';

const EmergencyEvacuation = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto mt-8 border border-gray-100 overflow-hidden relative">
      <div className="text-center mb-6 z-10 relative">
        <h2 className="text-xl font-bold mb-2">Emergency Override System</h2>
        <p className="text-sm text-gray-500">Admin Dashboard: Evacuation Trigger</p>
      </div>

      <div className="bg-gray-100 p-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 mb-6">
        {!emergencyActive ? (
          <>
            <span className="text-5xl mb-4">🚨</span>
            <button 
              onClick={() => setEmergencyActive(true)}
              className="w-full py-4 bg-red-600 text-white font-black text-lg uppercase tracking-wider rounded-lg shadow-[0_4px_0_rgb(153,27,27)] hover:bg-red-500 hover:shadow-[0_2px_0_rgb(153,27,27)] hover:translate-y-[2px] transition-all"
            >
              Trigger Evacuation Protocol
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">This will push location-based routing to all attendee mobile apps instantly.</p>
          </>
        ) : (
          <div className="text-center w-full">
            <h3 className="font-bold text-red-600 animate-pulse text-xl mb-2">PROTOCOL ACTIVE</h3>
            <p className="text-sm text-gray-700 mb-4">7,245 Push notifications delivered.</p>
            <button 
              onClick={() => setEmergencyActive(false)}
              className="w-full py-2 bg-gray-800 text-white font-medium rounded hover:bg-gray-900"
            >
              Stand Down / All Clear
            </button>
          </div>
        )}
      </div>

      {/* Simulated Mobile Device View */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-center font-semibold text-gray-400 mb-4 text-sm">Simulated Attendee View</h3>
        <div className="w-[280px] h-[500px] border-8 border-gray-900 rounded-3xl mx-auto overflow-hidden relative bg-gray-900">
          {!emergencyActive ? (
            <div className="absolute inset-0 bg-white p-4 flex flex-col pt-12">
              <div className="h-8 w-24 bg-gray-200 rounded mb-6"></div>
              <div className="h-32 w-full bg-gray-100 rounded-lg mb-4"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-red-600 flex flex-col p-6 items-center justify-center animate-pulse">
              <span className="text-5xl mb-4">⚠️</span>
              <h4 className="text-white font-black text-2xl text-center mb-2">EVACUATE NOW</h4>
              <p className="text-red-100 text-center text-sm mb-6">Proceed calmly to the nearest exit.</p>
              
              <div className="bg-white rounded-lg p-4 w-full shadow-xl">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 text-center">Your Safest Route</p>
                <div className="text-center mb-2">
                  <span className="text-4xl">⬆️</span>
                </div>
                <h5 className="font-black text-center text-lg">North Exit - Gate C</h5>
                <p className="text-center text-sm text-gray-500 mt-1">Distance: 45 meters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyEvacuation;
