import React, { useState, useEffect } from 'react';

const LiveClosedCaptioning = () => {
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ar', name: 'العربية' },
  ];

  const captions = {
    'English': 'Welcome everyone to the opening keynote on decentralized architectures.',
    'Español': 'Bienvenidos a todos a la presentación de apertura sobre arquitecturas descentralizadas.',
    '中文': '欢迎大家参加关于去中心化架构的开幕主题演讲。',
    'हिन्दी': 'विकेन्द्रीकृत आर्किटेक्चर पर उद्घाटन मुख्य भाषण में सभी का स्वागत है।',
    'العربية': 'مرحباً بالجميع في الكلمة الافتتاحية حول البنى اللامركزية.'
  };

  useEffect(() => {
    // Simulate WebSocket connection for low-latency delivery
    const wsTimer = setTimeout(() => setConnectionStatus('connected'), 1200);
    
    // Simulate incoming streaming captions
    const captionTimer = setInterval(() => {
      setCurrentCaption(captions[activeLanguage]);
    }, 2000);

    return () => {
      clearTimeout(wsTimer);
      clearInterval(captionTimer);
    };
  }, [activeLanguage]);

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-2xl max-w-4xl mx-auto mt-8 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">🗣️</span> Multi-lingual AI Closed Captioning
          </h2>
          <p className="text-sm text-gray-400 mt-1">Low-latency WebSockets Speech-to-Text</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              {connectionStatus === 'connected' ? 'WebSocket Live' : 'Connecting...'}
            </span>
          </div>
          <button 
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${captionsEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {captionsEnabled ? 'CC On' : 'CC Off'}
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 shadow-inner flex flex-col justify-end">
        {/* Simulated Video Feed */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🎤</span>
            <span className="text-gray-500 font-mono">LIVE STAGE FEED</span>
          </div>
        </div>
        
        {/* Caption Overlay */}
        {captionsEnabled && connectionStatus === 'connected' && (
          <div className="absolute bottom-16 w-full px-12 z-10 text-center animate-fade-in">
            <span className="bg-black/75 backdrop-blur-sm text-yellow-400 px-6 py-3 rounded-lg text-xl font-medium inline-block shadow-lg border border-gray-700/50 max-w-3xl leading-relaxed">
              {currentCaption || '...'}
            </span>
          </div>
        )}

        {/* Video Controls Bar */}
        <div className="absolute bottom-0 w-full h-14 bg-gradient-to-t from-gray-900 to-transparent flex items-center px-6 justify-between z-20">
          <div className="flex space-x-4 items-center w-full">
            <button className="text-white hover:text-indigo-400 transition">▶</button>
            <button className="text-white hover:text-indigo-400 transition">🔊</button>
            <div className="flex-grow h-1 bg-gray-700 rounded-full cursor-pointer relative mx-4">
              <div className="absolute top-0 left-0 h-full bg-red-600 w-full rounded-full flex justify-end">
                <div className="w-3 h-3 bg-white rounded-full -mt-1 shadow cursor-pointer"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-800/80 px-2 py-1 rounded border border-gray-700">
            <span className="text-xs text-gray-400 font-bold uppercase">Lang:</span>
            <select 
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.name} className="bg-gray-800">{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Powered by OpenAI Whisper API & WebSockets. Latency: ~300ms.
      </p>
    </div>
  );
};

export default LiveClosedCaptioning;
