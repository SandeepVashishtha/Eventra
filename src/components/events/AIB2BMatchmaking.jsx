import React, { useState } from 'react';

const AIB2BMatchmaking = () => {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'VP of Engineering',
      company: 'CloudScale Inc.',
      matchScore: 94,
      sharedInterests: ['Distributed Systems', 'Engineering Leadership', 'Go'],
      bio: 'Scaling engineering teams from 50 to 500. Looking to connect with other tech leaders navigating hyper-growth.',
      availability: ['10:15 AM', '02:30 PM', '04:00 PM']
    },
    {
      id: 2,
      name: 'Marcus Ty',
      role: 'Senior DevOps Architect',
      company: 'TechNova',
      matchScore: 88,
      sharedInterests: ['Kubernetes', 'CI/CD Pipelines'],
      bio: 'Passionate about automation and reducing deployment friction. Always down to chat about K8s edge cases.',
      availability: ['11:00 AM', '01:15 PM']
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'CTO',
      company: 'DataStream',
      matchScore: 82,
      sharedInterests: ['Engineering Leadership', 'Data Engineering'],
      bio: 'Building real-time data pipelines. Interested in meeting folks solving complex streaming challenges.',
      availability: ['09:30 AM', '03:45 PM']
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchStatus, setMatchStatus] = useState(null); // 'connecting', 'scheduled'
  const [selectedSlot, setSelectedSlot] = useState(null);

  const currentProfile = profiles[currentIndex];

  const handleAction = (action) => {
    if (action === 'pass') {
      nextProfile();
    } else if (action === 'connect') {
      setMatchStatus('connecting');
    }
  };

  const nextProfile = () => {
    setMatchStatus(null);
    setSelectedSlot(null);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(-1); // No more profiles
    }
  };

  const scheduleMeeting = (slot) => {
    setSelectedSlot(slot);
    setTimeout(() => {
      setMatchStatus('scheduled');
      setTimeout(() => {
        nextProfile();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8 border border-indigo-100 flex flex-col items-center">
      
      <div className="w-full text-center mb-8">
        <h2 className="text-3xl font-black text-indigo-900 tracking-tight">AI Smart Match</h2>
        <p className="text-sm text-indigo-700 mt-1">Discover highly relevant connections based on your profile vectors.</p>
      </div>

      {currentIndex === -1 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg border border-indigo-100 text-center w-full max-w-md">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">You're caught up!</h3>
          <p className="text-gray-500">We're crunching more data to find your next best connections. Check back later.</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative">
          
          {/* Match Score Badge */}
          <div className="absolute top-4 right-4 z-10 bg-indigo-600 text-white px-3 py-1 rounded-full font-black text-sm shadow-lg flex items-center border-2 border-white">
            <span>{currentProfile.matchScore}% Match</span>
          </div>

          {/* Profile Header Image Placeholder */}
          <div className="h-48 bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/20 rounded-full border-4 border-white backdrop-blur-sm flex items-center justify-center text-4xl shadow-xl">
              👤
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 pt-4">
            <h3 className="text-2xl font-black text-gray-900">{currentProfile.name}</h3>
            <p className="text-indigo-600 font-bold text-sm mb-4">{currentProfile.role} at {currentProfile.company}</p>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
              "{currentProfile.bio}"
            </p>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shared Interests</h4>
              <div className="flex flex-wrap gap-2">
                {currentProfile.sharedInterests.map(interest => (
                  <span key={interest} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Area */}
            {matchStatus === null ? (
              <div className="flex justify-center space-x-6 mt-8 border-t border-gray-100 pt-6">
                <button 
                  onClick={() => handleAction('pass')}
                  className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <button 
                  onClick={() => handleAction('connect')}
                  className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🤝
                </button>
              </div>
            ) : matchStatus === 'connecting' ? (
              <div className="mt-4 border-t border-gray-100 pt-6 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-800 mb-3 text-center">Schedule a 15-min Coffee Chat</h4>
                <p className="text-xs text-gray-500 text-center mb-4">Auto-synced with both of your event schedules to prevent conflicts.</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentProfile.availability.map(slot => (
                    <button 
                      key={slot}
                      onClick={() => scheduleMeeting(slot)}
                      disabled={selectedSlot !== null}
                      className={`py-2 px-3 rounded-lg text-sm font-bold border transition ${selectedSlot === slot ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : selectedSlot !== null ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                    >
                      {selectedSlot === slot ? 'Confirming...' : slot}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                  ✅
                </div>
                <h4 className="font-bold text-gray-900">Meeting Scheduled!</h4>
                <p className="text-sm text-gray-500">Added to your itinerary for {selectedSlot}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIB2BMatchmaking;
