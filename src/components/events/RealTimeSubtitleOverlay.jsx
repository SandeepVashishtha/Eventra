import React, { useState, useEffect } from 'react';

const RealTimeSubtitleOverlay = () => {
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  // Simulated streaming transcript in English
  const transcript = [
    "Welcome everyone to the Future of AI conference.",
    "Today, we are going to discuss neural networks.",
    "The advancements in the past year have been staggering.",
    "We are seeing exponential growth in model capabilities.",
    "Let's take a look at the data on the next slide."
  ];

  // Simulated translations based on the selected language
  const translations = {
    'Spanish': [
      "Bienvenidos a la conferencia sobre el Futuro de la IA.",
      "Hoy vamos a discutir las redes neuronales.",
      "Los avances en el último año han sido asombrosos.",
      "Estamos viendo un crecimiento exponencial en las capacidades de los modelos.",
      "Echemos un vistazo a los datos en la siguiente diapositiva."
    ],
    'French': [
      "Bienvenue à la conférence sur l'Avenir de l'IA.",
      "Aujourd'hui, nous allons discuter des réseaux de neurones.",
      "Les avancées de l'année écoulée ont été stupéfiantes.",
      "Nous constatons une croissance exponentielle des capacités des modèles.",
      "Jetons un coup d'œil aux données sur la diapositive suivante."
    ],
    'Japanese': [
      "AIの未来会議へようこそ。",
      "今日はニューラルネットワークについて話し合います。",
      "過去1年間の進歩は驚異的です。",
      "モデル能力の指数関数的な成長が見られます。",
      "次のスライドのデータを見てみましょう。"
    ]
  };

  const languages = ['Spanish', 'French', 'Japanese'];

  // Simulate real-time streaming of subtitles
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (subtitlesEnabled) {
        setCurrentSubtitle(translations[targetLanguage][index]);
        index = (index + 1) % transcript.length;
      } else {
        setCurrentSubtitle('');
      }
    }, 3500); // Change subtitle every 3.5 seconds

    return () => clearInterval(interval);
  }, [targetLanguage, subtitlesEnabled]);

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-200 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center">
            <span className="mr-3 text-blue-500">🗣️</span> Live Translation Pipeline
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time NLP speech-to-text overlay for global accessibility.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-sm">
          <div className="flex items-center space-x-2 px-2">
            <span className="text-sm font-bold text-slate-400">CC</span>
            <button 
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${subtitlesEnabled ? 'bg-blue-600' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subtitlesEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="h-6 border-l border-slate-600"></div>
          <select 
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={!subtitlesEnabled}
            className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer disabled:opacity-50"
          >
            {languages.map(lang => (
              <option key={lang} value={lang} className="bg-slate-800">{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Player Mockup */}
      <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800 group">
        
        {/* Simulated Video Content */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <div className="w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <p className="absolute text-slate-500 font-bold uppercase tracking-widest text-xl">[ Live Keynote Stream ]</p>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded shadow-md flex items-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
          Live
        </div>

        {/* Subtitle Overlay Area */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center px-12 transition-opacity duration-300">
          {subtitlesEnabled && currentSubtitle && (
            <div className="bg-black/80 backdrop-blur-sm border border-slate-700/50 px-8 py-4 rounded-2xl max-w-3xl text-center transform translate-y-0 animate-fade-in shadow-2xl">
              <p className="text-white text-2xl md:text-3xl font-bold font-sans drop-shadow-md leading-relaxed tracking-wide">
                {currentSubtitle}
              </p>
            </div>
          )}
        </div>

        {/* Player Controls (Decorative) */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end px-6 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-full flex items-center space-x-4">
            <span className="text-white">⏸️</span>
            <div className="flex-1 h-1 bg-slate-600 rounded-full relative">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-white text-xs font-bold">45:12 / Live</span>
            <span className="text-white">⚙️</span>
            <span className="text-white">🔲</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RealTimeSubtitleOverlay;
