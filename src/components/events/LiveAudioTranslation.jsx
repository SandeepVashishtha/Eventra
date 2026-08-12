import React, { useState, useEffect } from 'react';

const LiveAudioTranslation = () => {
  const [activeAudioLang, setActiveAudioLang] = useState('English (Original)');
  const [activeCaptionLang, setActiveCaptionLang] = useState('Spanish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('Welcome to the future of AI in edge computing.');
  const [latency, setLatency] = useState(240); // ms

  const languages = [
    { id: 'en', name: 'English (Original)' },
    { id: 'es', name: 'Spanish' },
    { id: 'fr', name: 'French' },
    { id: 'ja', name: 'Japanese' },
    { id: 'de', name: 'German' }
  ];

  const captions = [
    "Welcome to the future of AI in edge computing.",
    "Bienvenidos al futuro de la IA en la computación de borde.", // ES
    "Bienvenue dans l'avenir de l'IA dans l'informatique de périphérie.", // FR
    "エッジコンピューティングにおけるAIの未来へようこそ。", // JA
    "Willkommen in der Zukunft der KI im Edge-Computing." // DE
  ];

  // Simulate latency and changing captions
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate latency slightly to simulate network conditions
      setLatency(prev => Math.max(150, Math.min(400, prev + (Math.random() * 60 - 30))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (type, langName) => {
    setIsProcessing(true);
    if (type === 'audio') setActiveAudioLang(langName);
    if (type === 'caption') setActiveCaptionLang(langName);

    setTimeout(() => {
      // Simulate switching captions based on selection
      let newCaptionIndex = 0; // Default EN
      if (langName === 'Spanish') newCaptionIndex = 1;
      if (langName === 'French') newCaptionIndex = 2;
      if (langName === 'Japanese') newCaptionIndex = 3;
      if (langName === 'German') newCaptionIndex = 4;
      
      if (type === 'caption') {
        setCurrentCaption(captions[newCaptionIndex]);
      }
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl max-w-5xl mx-auto mt-8 border border-gray-800 flex flex-col lg:flex-row gap-6">
      
      {/* Video Player Area */}
      <div className="w-full lg:w-2/3 bg-black rounded-xl border border-gray-800 relative overflow-hidden h-[450px] shadow-inner flex flex-col">
        
        {/* Simulated Video Stream */}
        <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
            LIVE
          </div>

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur border border-gray-600 text-gray-300 text-[10px] font-mono px-3 py-1 rounded shadow-lg">
            WebRTC Sync Latency: <span className={latency > 300 ? 'text-orange-400' : 'text-green-400'}>{Math.round(latency)}ms</span>
          </div>
        </div>

        {/* Captions Overlay */}
        <div className="absolute bottom-16 left-0 w-full px-12 text-center pointer-events-none">
          <div className="inline-block bg-black/70 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-lg shadow-2xl max-w-2xl">
            {isProcessing && activeCaptionLang !== 'None' ? (
              <span className="text-gray-400 italic text-lg font-medium">Translating stream...</span>
            ) : activeCaptionLang !== 'None' ? (
              <p className="text-white text-xl md:text-2xl font-medium tracking-wide drop-shadow-md">
                {currentCaption}
              </p>
            ) : null}
          </div>
        </div>

        {/* Video Controls Mockup */}
        <div className="h-14 bg-gray-950 border-t border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-4 text-gray-400">
            <span className="text-xl hover:text-white cursor-pointer">⏸</span>
            <span className="text-xl hover:text-white cursor-pointer">🔊</span>
            <span className="text-xs font-mono">01:24:15</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <span className="text-xs border border-gray-600 px-2 py-0.5 rounded hover:bg-gray-800 cursor-pointer">HD</span>
            <span className="text-lg hover:text-white cursor-pointer">⚙️</span>
            <span className="text-lg hover:text-white cursor-pointer">⛶</span>
          </div>
        </div>
      </div>

      {/* Translation Settings Panel */}
      <div className="w-full lg:w-1/3 flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Stream Audio & Subtitles</h2>
          <p className="text-sm text-gray-400 mt-1">Powered by AI real-time dubbing and NLP translation.</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-5 flex-1">
          
          {/* Audio Track Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">🎧</span>
              <h3 className="font-bold text-gray-200">Live Audio Track</h3>
            </div>
            <div className="space-y-2">
              {languages.map(lang => (
                <button
                  key={`audio-${lang.id}`}
                  onClick={() => handleLanguageChange('audio', lang.name)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex justify-between items-center ${activeAudioLang === lang.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:bg-gray-700 border border-gray-800'}`}
                >
                  <span>{lang.name} {lang.name !== 'English (Original)' && <span className="text-[10px] ml-2 text-indigo-200 uppercase tracking-widest bg-indigo-800 px-1.5 py-0.5 rounded">AI Dub</span>}</span>
                  {activeAudioLang === lang.name && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Selection */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">💬</span>
              <h3 className="font-bold text-gray-200">Closed Captions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                  onClick={() => handleLanguageChange('caption', 'None')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition text-center ${activeCaptionLang === 'None' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:bg-gray-700 border border-gray-800'}`}
                >
                  Off
              </button>
              {languages.map(lang => (
                <button
                  key={`cap-${lang.id}`}
                  onClick={() => handleLanguageChange('caption', lang.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition text-center truncate ${activeCaptionLang === lang.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 hover:bg-gray-700 border border-gray-800'}`}
                >
                  {lang.name.replace(' (Original)', '')}
                </button>
              ))}
            </div>
          </div>

        </div>
        
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl flex items-start space-x-3">
          <span className="text-indigo-400 text-xl mt-0.5">💡</span>
          <p className="text-xs text-indigo-200 leading-relaxed font-medium">
            AI dubbing preserves the original speaker's vocal tone and emotion. Translation latency is heavily optimized via our WebRTC node network.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveAudioTranslation;
