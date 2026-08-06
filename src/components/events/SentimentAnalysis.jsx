import React, { useState, useEffect } from 'react';

const SentimentAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Sentiment Analysis</h2>
          <p className="text-gray-500">Real-time NLP processing of event hashtags (#Eventra2026)</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Live Scraping Active
        </div>
      </div>

      {analyzing ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Processing Twitter & LinkedIn streams...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm font-semibold text-gray-500 mb-1">Overall Sentiment</p>
              <div className="text-3xl font-black text-green-600">78% Positive</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm font-semibold text-gray-500 mb-1">Analyzed Posts</p>
              <div className="text-3xl font-black text-gray-800">14,295</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm font-semibold text-gray-500 mb-1">Trending Keyword</p>
              <div className="text-3xl font-black text-blue-600">#AIKeynote</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Emotion Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Joy / Excitement</span><span>65%</span></div>
                  <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Curiosity / Neutral</span><span>23%</span></div>
                  <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-gray-500 h-2 rounded-full" style={{ width: '23%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Frustration / Anger</span><span>12%</span></div>
                  <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div></div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Top AI-Extracted Insights</h3>
              <ul className="space-y-3">
                <li className="flex items-start bg-green-50 p-3 rounded">
                  <span className="text-green-500 mr-2">↑</span>
                  <span className="text-sm text-green-900">Highly positive reception to the decentralized ticketing panel.</span>
                </li>
                <li className="flex items-start bg-red-50 p-3 rounded">
                  <span className="text-red-500 mr-2">↓</span>
                  <span className="text-sm text-red-900">Complaints spiking about WiFi connectivity in Hall B.</span>
                </li>
                <li className="flex items-start bg-blue-50 p-3 rounded">
                  <span className="text-blue-500 mr-2">→</span>
                  <span className="text-sm text-blue-900">Attendees requesting slides from Dr. Smith's presentation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;
