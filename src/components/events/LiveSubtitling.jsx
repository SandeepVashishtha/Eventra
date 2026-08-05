import React, { useState } from 'react';

const LiveSubtitling = () => {
  const [language, setLanguage] = useState('English');
  const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);

  const languages = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'German'];

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-xl max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold">Automated Multi-lingual Real-time Subtitling</h2>
        <div className="flex items-center space-x-3">
          <label className="text-sm">Subtitles:</label>
          <button 
            onClick={() => setIsSubtitlesOn(!isSubtitlesOn)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${isSubtitlesOn ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            {isSubtitlesOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 flex flex-col justify-end">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <span className="text-2xl">[ Live Stream Player ]</span>
        </div>
        
        {isSubtitlesOn && (
          <div className="absolute bottom-12 w-full text-center z-10 px-8">
            <span className="bg-black/80 text-white px-4 py-2 rounded text-lg font-medium inline-block max-w-2xl">
              {language === 'Spanish' ? "Bienvenidos al panel principal sobre el futuro de la tecnología." :
               language === 'French' ? "Bienvenue au panel principal sur l'avenir de la technologie." :
               language === 'Mandarin' ? "欢迎来到关于技术未来的主面板。" :
               "Welcome to the main panel on the future of technology."}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 w-full h-12 bg-gray-800/90 flex items-center px-4 justify-between z-20">
          <div className="flex space-x-2">
            <button className="text-white hover:text-gray-300">▶</button>
            <div className="w-48 h-1 bg-gray-600 self-center rounded"><div className="w-1/3 h-full bg-red-500 rounded"></div></div>
          </div>
          
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded border border-gray-600 px-2 py-1 outline-none"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LiveSubtitling;
