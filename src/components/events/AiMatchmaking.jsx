import React, { useState, useEffect } from 'react';

const AiMatchmaking = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching AI matchmaking data
    setTimeout(() => {
      setMatches([
        { id: 1, name: 'Alice Smith', role: 'Frontend Developer', matchScore: 98 },
        { id: 2, name: 'Bob Jones', role: 'UX Designer', matchScore: 95 },
        { id: 3, name: 'Charlie Brown', role: 'Product Manager', matchScore: 89 },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">AI-Powered Attendee Matchmaking</h2>
      <p className="text-gray-600 mb-6">Connect with attendees who share your professional interests.</p>
      
      {loading ? (
        <div className="text-center text-gray-500">Analyzing profiles...</div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <div key={match.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50">
              <div>
                <h3 className="font-semibold">{match.name}</h3>
                <p className="text-sm text-gray-500">{match.role}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-medium">{match.matchScore}% Match</span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiMatchmaking;
