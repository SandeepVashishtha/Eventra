import React, { useState, useEffect } from 'react';

const LiveStreamSubtitling = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  
  const languages = [
    { code: 'en', name: 'English (Original)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ja', name: '日本語 (Japanese)' }
  ];

  // Simulated live translation stream
  const translationStream = {
    en: [
      "Welcome everyone to the annual keynote.",
      "Today, we are announcing a major architectural shift.",
      "Our new engine will process data 10x faster."
    ],
    es: [
      "Bienvenidos a todos a la presentación anual.",
      "Hoy, anunciamos un cambio arquitectónico importante.",
      "Nuestro nuevo motor procesará datos 10 veces más rápido."
    ],
    fr: [
      "Bienvenue à tous à la présentation annuelle.",
      "Aujourd'hui, nous annonçons un changement architectural majeur.",
      "Notre nouveau moteur traitera les données 10 fois plus vite."
    ],
    zh: [
      "欢迎大家参加年度主题演讲。",
      "今天，我们将宣布一项重大的架构转变。",
      "我们的新引擎处理数据的速度将提高10倍。"
    ],
    hi: [
      "वार्षिक मुख्य भाषण में आप सभी का स्वागत है।",
      "आज, हम एक बड़े वास्तुशिल्प बदलाव की घोषणा कर रहे हैं।",
      "हमारा नया इंजन डेटा को 10 गुना तेजी से प्रोसेस करेगा।"
    ],
    ja: [
      "皆様、年次基調講演へようこそ。",
      "本日、私たちはアーキテクチャの大きな変更を発表します。",
      "新しいエンジンはデータを10倍の速度で処理します。"
    ]
  };

  useEffect(() => {
    if (!captionsEnabled) {
      setCurrentCaption('');
      return;
    }

    let index = 0;
    const streamInterval = setInterval(() => {
      // Safely fallback to English if translation is missing
      const translations = translationStream[selectedLanguage] || translationStream['en'];
      
      setCurrentCaption(translations[index]);
      
      index++;
      if (index >= translations.length) {
        index = 0; // Loop for simulation purposes
      }
    }, 3500); // New caption every 3.5 seconds

    return () => clearInterval(streamInterval);
  }, [selectedLanguage, captionsEnabled]);

  return (
    <div className="p-6 bg-stone-900 min-h-screen flex items-center justify-center font-sans text-white">
      <div className="w-full max-w-5xl">
        
        <div className="mb-6">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight flex items-center">
            <span className="mr-3 text-white">🌐</span> Global Subtitles Engine
          </h2>
          <p className="text-stone-400 font-medium mt-1">Real-time NLP translation via WebSockets for maximum accessibility.</p>
        </div>

        {/* Video Player Mockup */}
        <div className="bg-black border border-stone-800 rounded-2xl shadow-2xl overflow-hidden relative group">
          
          {/* Main Video Stream */}
          <div className="aspect-video bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center relative flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            
            {/* Live Indicator */}
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center tracking-widest">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
              LIVE
            </div>

            {/* Subtitle Overlay */}
            {captionsEnabled && currentCaption && (
              <div className="relative z-10 w-full px-12 pb-20 text-center animate-fade-in">
                <span className="inline-block bg-black/70 backdrop-blur-sm text-yellow-400 text-2xl font-bold px-4 py-2 rounded-lg shadow-2xl border border-white/10 max-w-3xl leading-snug">
                  {currentCaption}
                </span>
              </div>
            )}

            {/* Video Controls / Subtitle Menu */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 pt-12 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-blue-400 transition">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                </button>
                <div className="text-sm font-bold font-mono">24:15 / LIVE</div>
              </div>

              <div className="flex items-center space-x-6 relative">
                
                {/* CC Toggle */}
                <button 
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  className={`border-b-2 font-black transition ${captionsEnabled ? 'text-white border-white' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
                >
                  CC
                </button>

                {/* Language Selector */}
                <div className="relative">
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="appearance-none bg-stone-800/80 backdrop-blur border border-stone-600 text-white text-sm font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-lg"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <button className="text-white hover:text-blue-400 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">WebSocket Latency</p>
              <p className="text-lg font-mono font-black text-emerald-400">~120ms</p>
            </div>
            <div className="text-2xl opacity-50">⚡</div>
          </div>
          <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Active Translations</p>
              <p className="text-lg font-mono font-black text-blue-400">24 Languages</p>
            </div>
            <div className="text-2xl opacity-50">🗣️</div>
          </div>
          <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">NLP Accuracy (Confidence)</p>
              <p className="text-lg font-mono font-black text-yellow-400">98.4%</p>
            </div>
            <div className="text-2xl opacity-50">🎯</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveStreamSubtitling;
