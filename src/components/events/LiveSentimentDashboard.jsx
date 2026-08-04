import React, { useState, useEffect } from 'react';

const LiveSentimentDashboard = () => {
  const [sentimentScore, setSentimentScore] = useState(82);
  const [trend, setTrend] = useState('stable'); // up, down, stable
  const [activeAlert, setActiveAlert] = useState(false);

  const [chatFeed, setChatFeed] = useState([
    { id: 1, user: 'User492', text: 'This part is super confusing tbh.', sentiment: -0.8 },
    { id: 2, user: 'SarahJ', text: 'Can we get an example of that?', sentiment: -0.2 },
    { id: 3, user: 'DevMike', text: 'Love this new architecture! 🔥', sentiment: 0.9 },
    { id: 4, user: 'ElenaR', text: 'Wait, what did he just say?', sentiment: -0.6 }
  ]);

  useEffect(() => {
    // Simulate real-time NLP analysis updates
    const interval = setInterval(() => {
      setSentimentScore(prev => {
        const fluctuation = Math.floor(Math.random() * 11) - 6; // -6 to +4
        const newScore = Math.min(100, Math.max(0, prev + fluctuation));
        
        if (newScore < prev) setTrend('down');
        else if (newScore > prev) setTrend('up');
        else setTrend('stable');

        // Trigger alert if score drops below 60
        if (newScore < 60) setActiveAlert(true);
        else setActiveAlert(false);

        return newScore;
      });
      
      // Simulate incoming chat
      if (Math.random() > 0.5) {
        setChatFeed(prev => {
          const newChat = [...prev];
          newChat.pop();
          newChat.unshift({
            id: Date.now(),
            user: `Attendee${Math.floor(Math.random() * 999)}`,
            text: 'I think we need to move to Q&A...',
            sentiment: -0.5
          });
          return newChat;
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl max-w-5xl mx-auto mt-8 border border-gray-800 text-white flex flex-col md:flex-row gap-6">
      
      {/* Analytics Panel */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            Live Sentiment Analysis
          </h2>
          <p className="text-sm text-gray-400 mt-1">Real-time NLP monitoring of session chat and reactions.</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
          {activeAlert && (
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
          )}
          <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-4">Overall Session Sentiment</h3>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                <circle 
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="351.8" 
                  strokeDashoffset={351.8 - (351.8 * sentimentScore) / 100}
                  className={`transition-all duration-1000 ease-out ${sentimentScore > 75 ? 'text-green-400' : sentimentScore > 50 ? 'text-yellow-400' : 'text-red-500'}`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{sentimentScore}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm w-16">Status:</span>
                <span className={`font-bold ${sentimentScore > 75 ? 'text-green-400' : sentimentScore > 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                  {sentimentScore > 75 ? 'Highly Engaged' : sentimentScore > 50 ? 'Losing Focus' : 'Disengaged'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm w-16">Trend:</span>
                <span className={`font-bold flex items-center ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                  {trend === 'up' ? '↗ Improving' : trend === 'down' ? '↘ Dropping' : '→ Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {activeAlert && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <h4 className="font-bold text-red-400">Audience Disengagement Alert</h4>
            </div>
            <p className="text-sm text-red-200 font-medium">Sentiment has dropped significantly over the last 3 minutes. Confusion detected regarding technical jargon.</p>
            <div className="mt-4 flex space-x-3">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded transition">
                Trigger Q&A Mode
              </button>
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 rounded transition border border-gray-600">
                Dismiss Alert
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live NLP Chat Feed */}
      <div className="w-full md:w-1/2 bg-black/50 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        <div className="bg-gray-800/80 p-3 flex justify-between items-center border-b border-gray-700">
          <h3 className="font-bold text-sm text-gray-300">Live NLP Chat Analysis</h3>
          <span className="flex items-center text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Processing
          </span>
        </div>
        
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {chatFeed.map((chat) => (
            <div key={chat.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 relative overflow-hidden group">
              <div className={`absolute left-0 top-0 w-1 h-full ${chat.sentiment > 0.5 ? 'bg-green-500' : chat.sentiment < -0.3 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
              <div className="flex justify-between items-start pl-2">
                <span className="text-xs font-bold text-gray-400">{chat.user}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${chat.sentiment > 0.5 ? 'bg-green-900/40 text-green-400' : chat.sentiment < -0.3 ? 'bg-red-900/40 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                  {chat.sentiment.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-200 mt-1 pl-2">{chat.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LiveSentimentDashboard;
